from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import os
import logging
from pathlib import Path
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
import httpx
import stripe
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration

# Import our modules
from database import connect_to_mongo, close_mongo_connection, get_database
from models import *
from auth import get_current_user, get_current_active_user, create_access_token, require_role

# Load environment variables
from dotenv import load_dotenv
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Configure Sentry
sentry_sdk.init(
    dsn=os.environ.get('SENTRY_DSN'),
    integrations=[FastApiIntegration(auto_enabling_integrations=False)],
    traces_sample_rate=1.0,
)

# Configure Stripe
stripe.api_key = os.environ.get('STRIPE_SECRET_KEY')

# App lifecycle
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_to_mongo()
    yield
    # Shutdown
    await close_mongo_connection()

# Create FastAPI app
app = FastAPI(
    title="TradeWave API",
    description="Content Creation & Trading Platform API",
    version="1.0.0",
    lifespan=lifespan
)

# Create API router
api_router = APIRouter(prefix="/api")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ============= AUTHENTICATION ROUTES =============

@api_router.post("/auth/register", response_model=dict)
async def register_user(user_data: UserCreate):
    """Register a new user"""
    db = get_database()
    
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user profile
    user_profile = UserProfile(**user_data.dict())
    
    # Give welcome tokens
    user_profile.token_balance = 1000  # Welcome bonus
    
    # Save to database
    await db.users.insert_one(user_profile.dict())
    
    # Create access token
    access_token = create_access_token(data={"sub": user_profile.id})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_profile.dict()
    }

@api_router.get("/auth/me", response_model=UserProfile)
async def get_current_user_profile(current_user: UserProfile = Depends(get_current_active_user)):
    """Get current user profile"""
    return current_user

@api_router.put("/auth/me", response_model=UserProfile)
async def update_user_profile(
    user_update: UserUpdate,
    current_user: UserProfile = Depends(get_current_active_user)
):
    """Update current user profile"""
    db = get_database()
    
    update_data = user_update.dict(exclude_unset=True)
    update_data["updated_at"] = datetime.utcnow()
    
    await db.users.update_one(
        {"id": current_user.id},
        {"$set": update_data}
    )
    
    # Return updated user
    updated_user = await db.users.find_one({"id": current_user.id})
    return UserProfile(**updated_user)

# ============= TOKEN ECONOMY ROUTES =============

@api_router.get("/tokens/packages", response_model=List[TokenPackage])
async def get_token_packages():
    """Get available token packages"""
    packages = [
        TokenPackage(name="Starter", tokens=100, price_usd=9.99, bonus_tokens=10),
        TokenPackage(name="Popular", tokens=500, price_usd=39.99, bonus_tokens=75, is_popular=True),
        TokenPackage(name="Pro", tokens=1000, price_usd=69.99, bonus_tokens=200),
        TokenPackage(name="Business", tokens=2500, price_usd=149.99, bonus_tokens=600),
        TokenPackage(name="Enterprise", tokens=5000, price_usd=269.99, bonus_tokens=1500),
    ]
    return packages

@api_router.post("/tokens/purchase")
async def purchase_tokens(
    package_id: str,
    current_user: UserProfile = Depends(get_current_active_user)
):
    """Purchase tokens using Stripe"""
    packages = await get_token_packages()
    package = next((p for p in packages if p.id == package_id), None)
    
    if not package:
        raise HTTPException(status_code=404, detail="Package not found")
    
    try:
        # Create Stripe payment intent
        intent = stripe.PaymentIntent.create(
            amount=int(package.price_usd * 100),  # Convert to cents
            currency='usd',
            metadata={
                'user_id': current_user.id,
                'package_id': package_id,
                'tokens': package.tokens + package.bonus_tokens
            }
        )
        
        return {
            "client_secret": intent.client_secret,
            "package": package.dict()
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.post("/tokens/confirm-payment")
async def confirm_token_payment(
    payment_intent_id: str,
    current_user: UserProfile = Depends(get_current_active_user)
):
    """Confirm token purchase and add tokens to user balance"""
    db = get_database()
    
    try:
        # Retrieve payment intent from Stripe
        intent = stripe.PaymentIntent.retrieve(payment_intent_id)
        
        if intent.status == 'succeeded':
            # Add tokens to user balance
            tokens_to_add = int(intent.metadata['tokens'])
            
            await db.users.update_one(
                {"id": current_user.id},
                {"$inc": {"token_balance": tokens_to_add}}
            )
            
            # Create transaction record
            transaction = Transaction(
                to_user_id=current_user.id,
                amount=tokens_to_add,
                transaction_type=TransactionType.token_purchase,
                status=TransactionStatus.completed,
                stripe_payment_intent_id=payment_intent_id,
                description=f"Token purchase - {intent.metadata['package_id']}"
            )
            
            await db.transactions.insert_one(transaction.dict())
            
            return {
                "success": True,
                "tokens_added": tokens_to_add,
                "new_balance": current_user.token_balance + tokens_to_add
            }
        else:
            raise HTTPException(status_code=400, detail="Payment not successful")
            
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ============= CONTENT ROUTES =============

@api_router.get("/content", response_model=List[Content])
async def get_content(
    page: int = 1,
    limit: int = 20,
    category: Optional[str] = None,
    tags: Optional[str] = None,
    content_type: Optional[str] = None,
    sort_by: str = "created_at"
):
    """Get content with filters and pagination"""
    db = get_database()
    
    # Build query
    query = {"status": ContentStatus.published}
    if category:
        query["category"] = category
    if content_type:
        query["content_type"] = content_type
    if tags:
        tag_list = tags.split(",")
        query["tags"] = {"$in": tag_list}
    
    # Sort options
    sort_options = {
        "created_at": [("created_at", -1)],
        "popular": [("views_count", -1), ("likes_count", -1)],
        "rating": [("rating", -1)],
        "price": [("price", 1)]
    }
    sort = sort_options.get(sort_by, [("created_at", -1)])
    
    # Execute query
    skip = (page - 1) * limit
    cursor = db.content.find(query).sort(sort).skip(skip).limit(limit)
    content_list = await cursor.to_list(length=limit)
    
    return [Content(**content) for content in content_list]

@api_router.post("/content", response_model=Content)
async def create_content(
    content_data: ContentCreate,
    current_user: UserProfile = Depends(require_role(["creator", "business", "admin"]))
):
    """Create new content"""
    db = get_database()
    
    content = Content(**content_data.dict(), creator_id=current_user.id)
    await db.content.insert_one(content.dict())
    
    return content

@api_router.get("/content/{content_id}", response_model=Content)
async def get_content_detail(content_id: str):
    """Get content detail"""
    db = get_database()
    
    content = await db.content.find_one({"id": content_id, "status": ContentStatus.published})
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    
    # Increment view count
    await db.content.update_one(
        {"id": content_id},
        {"$inc": {"views_count": 1}}
    )
    
    return Content(**content)

@api_router.post("/content/{content_id}/purchase")
async def purchase_content(
    content_id: str,
    current_user: UserProfile = Depends(get_current_active_user)
):
    """Purchase content with tokens"""
    db = get_database()
    
    # Get content
    content = await db.content.find_one({"id": content_id, "status": ContentStatus.published})
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    
    content_obj = Content(**content)
    
    # Check if user has enough tokens
    if current_user.token_balance < content_obj.price:
        raise HTTPException(status_code=400, detail="Insufficient tokens")
    
    # Check if user already owns this content
    existing_purchase = await db.transactions.find_one({
        "from_user_id": current_user.id,
        "content_id": content_id,
        "transaction_type": TransactionType.content_purchase,
        "status": TransactionStatus.completed
    })
    
    if existing_purchase:
        raise HTTPException(status_code=400, detail="Content already purchased")
    
    # Calculate revenue sharing
    platform_fee = int(content_obj.price * float(os.environ.get('PLATFORM_FEE_PERCENTAGE', 15)) / 100)
    creator_share = int(content_obj.price * float(os.environ.get('CREATOR_SHARE_PERCENTAGE', 70)) / 100)
    buyer_cashback = int(content_obj.price * float(os.environ.get('BUYER_CASHBACK_PERCENTAGE', 5)) / 100)
    
    # Process transactions
    async with await db.client.start_session() as session:
        async with session.start_transaction():
            # Deduct tokens from buyer
            await db.users.update_one(
                {"id": current_user.id},
                {"$inc": {
                    "token_balance": -content_obj.price + buyer_cashback,
                    "total_spent": content_obj.price
                }},
                session=session
            )
            
            # Add tokens to creator
            await db.users.update_one(
                {"id": content_obj.creator_id},
                {"$inc": {
                    "token_balance": creator_share,
                    "total_earned": creator_share
                }},
                session=session
            )
            
            # Create transaction records
            transactions = [
                Transaction(
                    from_user_id=current_user.id,
                    content_id=content_id,
                    amount=content_obj.price,
                    transaction_type=TransactionType.content_purchase,
                    status=TransactionStatus.completed,
                    description=f"Purchase: {content_obj.title}"
                ),
                Transaction(
                    to_user_id=content_obj.creator_id,
                    content_id=content_id,
                    amount=creator_share,
                    transaction_type=TransactionType.creator_earning,
                    status=TransactionStatus.completed,
                    description=f"Creator earning: {content_obj.title}"
                ),
                Transaction(
                    to_user_id=current_user.id,
                    content_id=content_id,
                    amount=buyer_cashback,
                    transaction_type=TransactionType.buyer_cashback,
                    status=TransactionStatus.completed,
                    description=f"Cashback: {content_obj.title}"
                ),
                Transaction(
                    content_id=content_id,
                    amount=platform_fee,
                    transaction_type=TransactionType.platform_fee,
                    status=TransactionStatus.completed,
                    description=f"Platform fee: {content_obj.title}"
                )
            ]
            
            for transaction in transactions:
                await db.transactions.insert_one(transaction.dict(), session=session)
    
    return {
        "success": True,
        "content": content_obj.dict(),
        "tokens_spent": content_obj.price,
        "cashback_received": buyer_cashback
    }

# ============= SERVICE MARKETPLACE ROUTES =============

@api_router.get("/services", response_model=List[Service])
async def get_services(
    page: int = 1,
    limit: int = 20,
    category: Optional[str] = None,
    tags: Optional[str] = None,
    min_price: Optional[int] = None,
    max_price: Optional[int] = None,
    sort_by: str = "created_at"
):
    """Get services with filters"""
    db = get_database()
    
    # Build query
    query = {"status": ServiceStatus.active}
    if category:
        query["category"] = category
    if tags:
        tag_list = tags.split(",")
        query["tags"] = {"$in": tag_list}
    
    # Price filtering (check basic package price)
    if min_price is not None or max_price is not None:
        price_query = {}
        if min_price is not None:
            price_query["$gte"] = min_price
        if max_price is not None:
            price_query["$lte"] = max_price
        query["packages.basic.price"] = price_query
    
    # Sort options
    sort_options = {
        "created_at": [("created_at", -1)],
        "popular": [("orders_completed", -1), ("rating", -1)],
        "rating": [("rating", -1)],
        "price": [("packages.basic.price", 1)]
    }
    sort = sort_options.get(sort_by, [("created_at", -1)])
    
    # Execute query
    skip = (page - 1) * limit
    cursor = db.services.find(query).sort(sort).skip(skip).limit(limit)
    services_list = await cursor.to_list(length=limit)
    
    return [Service(**service) for service in services_list]

@api_router.post("/services", response_model=Service)
async def create_service(
    service_data: ServiceCreate,
    current_user: UserProfile = Depends(require_role(["creator", "business", "admin"]))
):
    """Create new service"""
    db = get_database()
    
    service = Service(**service_data.dict(), creator_id=current_user.id)
    await db.services.insert_one(service.dict())
    
    return service

@api_router.get("/services/{service_id}", response_model=Service)
async def get_service_detail(service_id: str):
    """Get service detail"""
    db = get_database()
    
    service = await db.services.find_one({"id": service_id, "status": ServiceStatus.active})
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    return Service(**service)

@api_router.post("/orders", response_model=Order)
async def create_order(
    order_data: OrderCreate,
    current_user: UserProfile = Depends(get_current_active_user)
):
    """Create new order"""
    db = get_database()
    
    # Get service
    service = await db.services.find_one({"id": order_data.service_id, "status": ServiceStatus.active})
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    service_obj = Service(**service)
    
    # Get package details
    package = service_obj.packages.get(order_data.package_type)
    if not package:
        raise HTTPException(status_code=400, detail="Invalid package type")
    
    # Check if user has enough tokens
    if current_user.token_balance < package.price:
        raise HTTPException(status_code=400, detail="Insufficient tokens")
    
    # Calculate delivery date
    delivery_date = datetime.utcnow() + timedelta(days=package.delivery_time)
    
    # Create order
    order = Order(
        **order_data.dict(),
        client_id=current_user.id,
        creator_id=service_obj.creator_id,
        amount=package.price,
        delivery_date=delivery_date
    )
    
    await db.orders.insert_one(order.dict())
    
    return order

# ============= AI FEATURES ROUTES =============

@api_router.post("/ai/generate", response_model=AIRequest)
async def create_ai_request(
    ai_request: AIRequestCreate,
    current_user: UserProfile = Depends(get_current_active_user)
):
    """Create AI generation request"""
    db = get_database()
    
    # AI costs (in tokens)
    ai_costs = {
        "content_generation": 50,
        "image_enhancement": 30,
        "video_editing": 100,
        "text_summary": 20,
        "translation": 25
    }
    
    cost = ai_costs.get(ai_request.request_type, 50)
    
    # Check if user has enough tokens
    if current_user.token_balance < cost:
        raise HTTPException(status_code=400, detail="Insufficient tokens for AI request")
    
    # Create AI request
    ai_req = AIRequest(
        **ai_request.dict(),
        user_id=current_user.id,
        cost_tokens=cost
    )
    
    await db.ai_requests.insert_one(ai_req.dict())
    
    # Deduct tokens
    await db.users.update_one(
        {"id": current_user.id},
        {"$inc": {"token_balance": -cost}}
    )
    
    # Here you would integrate with Emergent LLM API
    # For now, we'll just return the request
    
    return ai_req

# ============= COMMUNITY ROUTES =============

@api_router.get("/community/posts", response_model=List[CommunityPost])
async def get_community_posts(
    page: int = 1,
    limit: int = 20,
    tags: Optional[str] = None
):
    """Get community posts"""
    db = get_database()
    
    query = {}
    if tags:
        tag_list = tags.split(",")
        query["tags"] = {"$in": tag_list}
    
    skip = (page - 1) * limit
    cursor = db.community_posts.find(query).sort([("created_at", -1)]).skip(skip).limit(limit)
    posts = await cursor.to_list(length=limit)
    
    return [CommunityPost(**post) for post in posts]

@api_router.post("/community/posts", response_model=CommunityPost)
async def create_community_post(
    post_data: PostCreate,
    current_user: UserProfile = Depends(get_current_active_user)
):
    """Create community post"""
    db = get_database()
    
    post = CommunityPost(**post_data.dict(), author_id=current_user.id)
    await db.community_posts.insert_one(post.dict())
    
    return post

# ============= LEGACY ROUTES (for compatibility) =============

@api_router.get("/")
async def root():
    return {"message": "TradeWave API v1.0"}

@api_router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow(),
        "version": "1.0.0"
    }

# Include router in app
app.include_router(api_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)