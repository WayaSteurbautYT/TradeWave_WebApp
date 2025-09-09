from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
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
from passlib.context import CryptContext
from jose import JWTError, jwt

# Import our modules
from database import connect_to_mongo, close_mongo_connection, get_database
from models import *
from auth import get_current_user, get_current_active_user, create_access_token, require_role, get_password_hash

# Load environment variables
from dotenv import load_dotenv
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Configure Sentry
sentry_sdk.init(
    dsn=os.environ.get('SENTRY_DSN'),
    integrations=[FastApiIntegration()],
    traces_sample_rate=1.0,
)

# Configure Stripe
stripe.api_key = os.environ.get('STRIPE_SECRET_KEY')

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

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
    title="WayaCreate API",
    description="Gaming, Design & Tech Content Creation Platform API by Waya Steurbaut",
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
    """Register a new user with WayaCreate community"""
    db = get_database()
    
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user profile
    user_profile = UserProfile(**user_data.dict())
    
    # Auto-generate username from display name to avoid null conflicts
    username_base = user_profile.display_name.lower().replace(" ", "_").replace("-", "_")
    username_base = "".join(c for c in username_base if c.isalnum() or c == "_")
    user_profile.username = f"{username_base}_{user_profile.id[:8]}"
    
    # Give welcome tokens (1000 for new users)
    user_profile.token_balance = 1000
    
    # Save to database
    await db.users.insert_one(user_profile.dict())
    
    # Create access token
    access_token = create_access_token(data={"sub": user_profile.id})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_profile.dict(),
        "welcome_message": "Welcome to WayaCreate! You've received 1000 tokens to get started! 🎮"
    }

@api_router.post("/auth/login", response_model=dict)
async def login_user(email: str = Form(...), password: str = Form(...)):
    """Login to WayaCreate"""
    db = get_database()
    
    # This is a mock implementation for testing
    # In production, you'd verify password hash
    user = await db.users.find_one({"email": email})
    if not user:
        # Create a demo user for testing
        demo_user = UserProfile(
            email=email,
            display_name="Gaming Creator",
            role=UserRole.creator,
            token_balance=5000,
            bio="Gaming and tech content creator on WayaCreate! 🎮",
            skills=["Gaming", "Blender", "Video Editing", "Minecraft", "Fortnite"]
        )
        # Auto-generate username
        username_base = demo_user.display_name.lower().replace(" ", "_")
        demo_user.username = f"{username_base}_{demo_user.id[:8]}"
        
        await db.users.insert_one(demo_user.dict())
        user = demo_user.dict()
    
    # Create access token
    access_token = create_access_token(data={"sub": user["id"]})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user,
        "message": "Welcome back to WayaCreate! 🚀"
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
    """Get available WayaCreate token packages"""
    packages = [
        TokenPackage(name="Gaming Starter", tokens=500, price_usd=4.99, bonus_tokens=50, 
                    description="Perfect for trying out content and tutorials"),
        TokenPackage(name="Creator Pack", tokens=1500, price_usd=12.99, bonus_tokens=200, is_popular=True,
                    description="Most popular! Great for active creators and learners"),
        TokenPackage(name="Pro Gamer", tokens=3000, price_usd=24.99, bonus_tokens=500,
                    description="For serious content creators and tutorial makers"),
        TokenPackage(name="Studio Bundle", tokens=7500, price_usd=59.99, bonus_tokens=1500,
                    description="Perfect for teams and collaborative projects"),
        TokenPackage(name="Master Creator", tokens=15000, price_usd=99.99, bonus_tokens=3500,
                    description="Ultimate package for content studios and agencies"),
    ]
    return packages

@api_router.post("/tokens/purchase")
async def purchase_tokens(
    package_name: str,
    current_user: UserProfile = Depends(get_current_active_user)
):
    """Purchase tokens using Stripe"""
    packages = await get_token_packages()
    package = next((p for p in packages if p.name == package_name), None)
    
    if not package:
        raise HTTPException(status_code=404, detail="Package not found")
    
    try:
        # Create Stripe payment intent
        intent = stripe.PaymentIntent.create(
            amount=int(package.price_usd * 100),  # Convert to cents
            currency='usd',
            metadata={
                'user_id': current_user.id,
                'package_name': package_name,
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
                description=f"Token purchase - {intent.metadata['package_name']}"
            )
            
            await db.transactions.insert_one(transaction.dict())
            
            return {
                "success": True,
                "tokens_added": tokens_to_add,
                "new_balance": current_user.token_balance + tokens_to_add,
                "message": f"🎉 {tokens_to_add} tokens added to your account!"
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
    sort_by: str = "created_at",
    free_only: bool = False
):
    """Get gaming and tech content with filters"""
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
    if free_only:
        query["price"] = 0
    
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
    
    # Add some sample gaming content if database is empty
    if not content_list and page == 1:
        sample_content = [
            {
                "id": "minecraft-build-1",
                "creator_id": "waya-creator",
                "title": "Epic Minecraft Castle Build Tutorial",
                "description": "Learn to build amazing medieval castles in Minecraft with step-by-step guide and project files!",
                "content_type": "video",
                "price": 0,  # Free to watch
                "download_price": 150,  # Tokens to download project files
                "tags": ["minecraft", "building", "tutorial", "medieval"],
                "category": "Gaming",
                "status": "published",
                "views_count": 15420,
                "likes_count": 890,
                "rating": 4.8,
                "review_count": 234,
                "thumbnail_url": "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=400",
                "created_at": datetime.utcnow()
            },
            {
                "id": "blender-tutorial-1", 
                "creator_id": "waya-creator",
                "title": "Blender 3D Character Modeling Masterclass",
                "description": "Complete guide to creating game-ready characters in Blender with all project files included!",
                "content_type": "course",
                "price": 0,  # Free to watch
                "download_price": 300,  # Tokens for project files
                "tags": ["blender", "3d-modeling", "character-design", "game-dev"],
                "category": "Design",
                "status": "published", 
                "views_count": 8930,
                "likes_count": 567,
                "rating": 4.9,
                "review_count": 123,
                "thumbnail_url": "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400",
                "created_at": datetime.utcnow()
            }
        ]
        return [Content(**content) for content in sample_content]
    
    return [Content(**content) for content in content_list]

@api_router.post("/content", response_model=Content)
async def create_content(
    title: str = Form(...),
    description: str = Form(...),
    content_type: str = Form(...),
    category: str = Form(...),
    price: int = Form(0),
    download_price: int = Form(0),
    tags: str = Form(""),
    tutorial_required: bool = Form(True),
    file_upload: Optional[UploadFile] = File(None),
    current_user: UserProfile = Depends(require_role(["creator", "business", "admin"]))
):
    """Create new gaming/tech content (requires tutorial)"""
    db = get_database()
    
    tag_list = [tag.strip() for tag in tags.split(",") if tag.strip()]
    
    content = Content(
        creator_id=current_user.id,
        title=title,
        description=description,
        content_type=ContentType(content_type),
        category=category,
        price=price,
        tags=tag_list,
        tutorial_required=tutorial_required,
        rights=[ContentRights.view]  # Default rights
    )
    
    # Add download rights if download price is set
    if download_price > 0:
        content.rights.append(ContentRights.download)
        content.download_price = download_price
    
    await db.content.insert_one(content.dict())
    
    return content

# ============= SERVICE MARKETPLACE ROUTES =============

@api_router.get("/services", response_model=List[Service])
async def get_services(
    page: int = 1,
    limit: int = 20,
    category: Optional[str] = None,
    tags: Optional[str] = None,
    sort_by: str = "created_at"
):
    """Get gaming and tech services"""
    db = get_database()
    
    # Build query
    query = {"status": ServiceStatus.active}
    if category:
        query["category"] = category
    if tags:
        tag_list = tags.split(",")
        query["tags"] = {"$in": tag_list}
    
    skip = (page - 1) * limit
    cursor = db.services.find(query).sort([("created_at", -1)]).skip(skip).limit(limit)
    services_list = await cursor.to_list(length=limit)
    
    # Add sample services if database is empty
    if not services_list and page == 1:
        sample_services = [
            {
                "id": "minecraft-build-service",
                "creator_id": "waya-creator",
                "title": "Custom Minecraft Builds & Tutorials",
                "description": "I'll create amazing custom Minecraft builds and provide complete tutorials showing how I made them!",
                "category": "Gaming",
                "tags": ["minecraft", "building", "tutorial", "custom"],
                "packages": {
                    "basic": {
                        "name": "Simple Build + Tutorial",
                        "description": "Basic structure with step-by-step tutorial video",
                        "price": 299,
                        "delivery_time": 3,
                        "revisions": 1,
                        "features": ["Custom build", "Tutorial video", "Project files"]
                    },
                    "standard": {
                        "name": "Complex Build + Tutorial",  
                        "description": "Advanced build with detailed tutorial and bonus tips",
                        "price": 599,
                        "delivery_time": 5,
                        "revisions": 2,
                        "features": ["Complex custom build", "Detailed tutorial", "Project files", "Bonus tips video"]
                    },
                    "premium": {
                        "name": "Epic Build Series + Tutorials",
                        "description": "Multiple connected builds with complete tutorial series",
                        "price": 1299,
                        "delivery_time": 10,
                        "revisions": 3,
                        "features": ["Multiple builds", "Tutorial series", "All project files", "1-on-1 session"]
                    }
                },
                "status": "active",
                "rating": 4.9,
                "review_count": 156,
                "orders_completed": 234,
                "created_at": datetime.utcnow()
            }
        ]
        return [Service(**service) for service in sample_services]
    
    return [Service(**service) for service in services_list]

# ============= AI FEATURES ROUTES =============

@api_router.post("/ai/generate", response_model=AIRequest)
async def create_ai_request(
    ai_request: AIRequestCreate,
    current_user: UserProfile = Depends(get_current_active_user)
):
    """Create AI generation request for gaming/tech content"""
    db = get_database()
    
    # AI costs for gaming/tech content
    ai_costs = {
        "gaming_thumbnail": 75,
        "blender_script": 150,
        "video_editing_script": 100,
        "minecraft_structure": 200,
        "tutorial_outline": 50,
        "content_description": 25
    }
    
    cost = ai_costs.get(ai_request.request_type, 75)
    
    # Check if user has enough tokens
    if current_user.token_balance < cost:
        raise HTTPException(status_code=400, detail=f"Insufficient tokens. Need {cost} tokens for this AI request.")
    
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
    
    return ai_req

# ============= COMMUNITY ROUTES =============

@api_router.get("/community/posts", response_model=List[CommunityPost])
async def get_community_posts(
    page: int = 1,
    limit: int = 20,
    tags: Optional[str] = None
):
    """Get gaming and tech community posts"""
    db = get_database()
    
    query = {}
    if tags:
        tag_list = tags.split(",")
        query["tags"] = {"$in": tag_list}
    
    skip = (page - 1) * limit
    cursor = db.community_posts.find(query).sort([("created_at", -1)]).skip(skip).limit(limit)
    posts = await cursor.to_list(length=limit)
    
    # Add sample posts if database is empty
    if not posts and page == 1:
        sample_posts = [
            {
                "id": "gaming-post-1",
                "author_id": "waya-creator",
                "title": "New Minecraft Build Tutorial Coming Soon! 🏰",
                "content": "Working on an epic medieval castle tutorial with complete project files! What kind of builds would you like to see next? Drop your suggestions below! 🎮",
                "post_type": "text",
                "tags": ["minecraft", "building", "tutorial", "community"],
                "likes_count": 234,
                "comments_count": 45,
                "shares_count": 12,
                "created_at": datetime.utcnow()
            },
            {
                "id": "blender-tips-1",
                "author_id": "waya-creator", 
                "title": "Free Blender Shortcuts Cheat Sheet! 📋",
                "content": "Just created a comprehensive Blender shortcuts cheat sheet for all you 3D artists! Perfect for beginners and pros alike. Available for free download! 🎨",
                "post_type": "text",
                "tags": ["blender", "3d-modeling", "tips", "free"],
                "likes_count": 567,
                "comments_count": 89,
                "shares_count": 34,
                "created_at": datetime.utcnow()
            }
        ]
        return [CommunityPost(**post) for post in sample_posts]
    
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
    return {
        "message": "WayaCreate API v1.0 - Gaming, Design & Tech Content Platform 🎮",
        "creator": "Waya Steurbaut",
        "youtube": "https://www.youtube.com/@wayasteurbaut",
        "description": "Where YOUR gaming and tech ideas come to life!"
    }

@api_router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow(),
        "version": "1.0.0",
        "platform": "WayaCreate",
        "creator": "Waya Steurbaut"
    }

# Include router in app
app.include_router(api_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)