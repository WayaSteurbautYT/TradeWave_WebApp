from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, UploadFile, File, Form, Cookie, Response
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
import google.generativeai as genai
from googleapiclient.discovery import build
import secrets

# Import our modules
from database import connect_to_mongo, close_mongo_connection, get_database
from models import *
from auth import get_current_user, get_current_active_user, create_access_token, require_role, get_password_hash

# Load environment variables
from dotenv import load_dotenv
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Configure integrations
sentry_sdk.init(
    dsn=os.environ.get('SENTRY_DSN'),
    integrations=[FastApiIntegration()],
    traces_sample_rate=1.0,
)

stripe.api_key = os.environ.get('STRIPE_SECRET_KEY')
genai.configure(api_key=os.environ.get('GOOGLE_API_KEY'))

# YouTube API
youtube = build('youtube', 'v3', developerKey=os.environ.get('GOOGLE_API_KEY'))

# App lifecycle
@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_to_mongo()
    yield
    await close_mongo_connection()

# Create FastAPI app
app = FastAPI(
    title="WayaCreate API",
    description="Complete Gaming, Design & Tech Content Platform by Waya Steurbaut",
    version="2.0.0",
    lifespan=lifespan
)

api_router = APIRouter(prefix="/api")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ============= SUBSCRIPTION-BASED AUTHENTICATION =============

async def get_current_user_session(
    session_token: Optional[str] = Cookie(None, alias="session_token"),
    authorization: Optional[str] = None
):
    """Get current user from session token (cookie or header)"""
    token = session_token or (authorization.replace("Bearer ", "") if authorization else None)
    
    if not token:
        return None
    
    db = get_database()
    
    # Check session validity
    session = await db.sessions.find_one({
        "session_token": token,
        "expires_at": {"$gt": datetime.utcnow()}
    })
    
    if not session:
        return None
    
    # Get user
    user = await db.users.find_one({"id": session["user_id"]})
    if not user:
        return None
    
    return UserProfile(**user)

@api_router.post("/auth/emergentagent-login")
async def emergentagent_login(session_id: str, response: Response):
    """Handle Emergent Agent OAuth login"""
    try:
        # Call Emergent auth API
        async with httpx.AsyncClient() as client:
            auth_response = await client.post(
                "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                headers={"X-Session-ID": session_id}
            )
            
            if auth_response.status_code != 200:
                raise HTTPException(status_code=400, detail="Invalid session")
            
            user_data = auth_response.json()
        
        db = get_database()
        
        # Check if user exists
        existing_user = await db.users.find_one({"email": user_data["email"]})
        
        if existing_user:
            user_profile = UserProfile(**existing_user)
        else:
            # Create new user with 0 credits (subscription-based)
            user_profile = UserProfile(
                email=user_data["email"],
                display_name=user_data["name"],
                avatar_url=user_data.get("picture"),
                google_id=user_data["id"],
                role=UserRole.viewer,
                subscription=UserSubscription(
                    plan=SubscriptionPlan.free,
                    monthly_credits=10,  # Free tier gets 10 credits
                    credits_remaining=10
                )
            )
            
            # Auto-generate username
            username_base = user_profile.display_name.lower().replace(" ", "_")
            user_profile.username = f"{username_base}_{user_profile.id[:8]}"
            
            await db.users.insert_one(user_profile.dict())
        
        # Create session
        session_token = secrets.token_urlsafe(32)
        session = UserSession(
            user_id=user_profile.id,
            session_token=session_token,
            expires_at=datetime.utcnow() + timedelta(days=7)
        )
        
        await db.sessions.insert_one(session.dict())
        
        # Set secure cookie
        response.set_cookie(
            key="session_token",
            value=session_token,
            max_age=7 * 24 * 60 * 60,  # 7 days
            httponly=True,
            secure=True,
            samesite="none",
            path="/"
        )
        
        return {
            "success": True,
            "user": user_profile.dict(),
            "message": f"Welcome to WayaCreate! You have {user_profile.subscription.credits_remaining} credits to get started! 🎮"
        }
        
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(status_code=500, detail="Login failed")

@api_router.post("/auth/logout")
async def logout(response: Response, current_user: UserProfile = Depends(get_current_user_session)):
    """Logout user"""
    if current_user:
        db = get_database()
        await db.sessions.delete_many({"user_id": current_user.id})
    
    response.delete_cookie("session_token", path="/")
    return {"success": True, "message": "Logged out successfully"}

@api_router.get("/auth/me", response_model=UserProfile)
async def get_current_user_profile(current_user: UserProfile = Depends(get_current_user_session)):
    """Get current user profile"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return current_user

# ============= SUBSCRIPTION SYSTEM =============

@api_router.get("/subscriptions/plans")
async def get_subscription_plans():
    """Get available subscription plans"""
    plans = [
        SubscriptionPlanDetails(
            id="free",
            name="Free Creator",
            price_monthly=0.0,
            monthly_credits=10,
            features=["Watch all content", "Basic community access", "10 monthly credits"],
            max_uploads=2,
            ai_requests_included=5,
            priority_support=False
        ),
        SubscriptionPlanDetails(
            id="creator",
            name="Creator Pro",
            price_monthly=9.99,
            monthly_credits=100,
            features=["Upload unlimited content", "AI content generation", "Priority support", "Advanced analytics"],
            max_uploads=-1,  # unlimited
            ai_requests_included=50,
            priority_support=True
        ),
        SubscriptionPlanDetails(
            id="pro",
            name="Pro Studio",
            price_monthly=24.99,
            monthly_credits=300,
            features=["Everything in Creator", "Team collaboration", "Custom branding", "API access"],
            max_uploads=-1,
            ai_requests_included=150,
            priority_support=True
        ),
        SubscriptionPlanDetails(
            id="business",
            name="Business Enterprise",
            price_monthly=99.99,
            monthly_credits=1000,
            features=["Everything in Pro", "White-label solution", "Dedicated support", "Custom integrations"],
            max_uploads=-1,
            ai_requests_included=500,
            priority_support=True
        )
    ]
    return plans

@api_router.post("/subscriptions/subscribe")
async def create_subscription(
    plan_id: str,
    current_user: UserProfile = Depends(get_current_user_session)
):
    """Create subscription using Stripe"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    plans = await get_subscription_plans()
    plan = next((p for p in plans if p.id == plan_id), None)
    
    if not plan or plan.price_monthly == 0:
        raise HTTPException(status_code=400, detail="Invalid plan")
    
    try:
        # Create Stripe subscription
        subscription = stripe.Subscription.create(
            customer=current_user.email,  # In production, create proper customer
            items=[{
                'price_data': {
                    'currency': 'usd',
                    'product': {
                        'name': f'WayaCreate {plan.name}'
                    },
                    'unit_amount': int(plan.price_monthly * 100),
                    'recurring': {'interval': 'month'}
                }
            }],
            metadata={
                'user_id': current_user.id,
                'plan_id': plan_id
            }
        )
        
        return {
            "subscription_id": subscription.id,
            "client_secret": subscription.latest_invoice.payment_intent.client_secret if subscription.latest_invoice else None,
            "plan": plan.dict()
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ============= AI GENERATION WITH GEMINI 2.0 FLASH =============

@api_router.post("/ai/generate", response_model=AIRequest)
async def generate_ai_content(
    ai_request: AIRequestCreate,
    current_user: UserProfile = Depends(get_current_user_session)
):
    """Generate content using Gemini 2.0 Flash"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Check credits
    credits_cost = {
        AIRequestType.text_generation: 2,
        AIRequestType.code_generation: 3,
        AIRequestType.image_generation: 5,
        AIRequestType.content_enhancement: 2,
        AIRequestType.tutorial_generation: 4
    }
    
    cost = credits_cost.get(ai_request.request_type, 2)
    
    if current_user.subscription.credits_remaining < cost:
        raise HTTPException(status_code=400, detail=f"Insufficient credits. Need {cost} credits.")
    
    db = get_database()
    
    try:
        # Use Gemini 2.0 Flash
        model = genai.GenerativeModel('gemini-2.0-flash-exp')
        
        # Enhance prompt based on type
        enhanced_prompt = ai_request.prompt
        if ai_request.request_type == AIRequestType.tutorial_generation:
            enhanced_prompt = f"Create a detailed step-by-step tutorial for: {ai_request.prompt}. Include beginner-friendly explanations, tips, and best practices."
        elif ai_request.request_type == AIRequestType.code_generation:
            enhanced_prompt = f"Generate clean, well-commented code for: {ai_request.prompt}. Include explanations for key concepts."
        
        response = model.generate_content(enhanced_prompt)
        
        # Create AI request record
        ai_req = AIRequest(
            **ai_request.dict(),
            user_id=current_user.id,
            cost_credits=cost,
            result_text=response.text,
            status="completed"
        )
        
        await db.ai_requests.insert_one(ai_req.dict())
        
        # Deduct credits
        await db.users.update_one(
            {"id": current_user.id},
            {"$inc": {"subscription.credits_remaining": -cost, "subscription.credits_used": cost}}
        )
        
        return ai_req
        
    except Exception as e:
        logger.error(f"AI generation error: {e}")
        raise HTTPException(status_code=500, detail="AI generation failed")

# ============= YOUTUBE CONTENT IMPORT =============

@api_router.post("/import/youtube")
async def import_youtube_content(
    import_request: YouTubeImportRequest,
    current_user: UserProfile = Depends(get_current_user_session)
):
    """Import content from YouTube channel"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    try:
        # Extract channel ID from URL
        channel_id = import_request.channel_url.split('/')[-1]
        if '@' in channel_id:
            channel_id = channel_id.replace('@', '')
        
        # Get channel videos
        search_response = youtube.search().list(
            part='id,snippet',
            channelId=channel_id,
            maxResults=min(import_request.max_items, 50),
            order='date'
        ).execute()
        
        imported_content = []
        db = get_database()
        
        for item in search_response['items']:
            if item['id']['kind'] == 'youtube#video':
                video_id = item['id']['videoId']
                snippet = item['snippet']
                
                # Determine content type
                content_type = ContentType.video
                if 'shorts' in snippet['title'].lower() or snippet.get('duration', 0) <= 60:
                    content_type = ContentType.short
                
                # Create content record
                content = Content(
                    creator_id=current_user.id,
                    title=snippet['title'],
                    description=snippet['description'],
                    content_type=content_type,
                    thumbnail_url=snippet['thumbnails']['medium']['url'],
                    tags=snippet.get('tags', []),
                    category="Gaming",  # Default for WayaCreate
                    status=ContentStatus.draft,  # Imported as draft
                    imported_from=ImportedContent(
                        original_platform="youtube",
                        original_id=video_id,
                        original_url=f"https://www.youtube.com/watch?v={video_id}"
                    ),
                    tutorial_included=False  # User needs to add tutorial
                )
                
                await db.content.insert_one(content.dict())
                imported_content.append(content)
        
        return {
            "success": True,
            "imported_count": len(imported_content),
            "content": [c.dict() for c in imported_content[:5]]  # Return first 5
        }
        
    except Exception as e:
        logger.error(f"YouTube import error: {e}")
        raise HTTPException(status_code=500, detail="Import failed")

# ============= AI-POWERED CREATOR SEARCH & MATCHING =============

@api_router.post("/search/creators")
async def search_creators_ai(
    search_filters: CreatorSearchFilter,
    query: Optional[str] = None,
    current_user: Optional[UserProfile] = Depends(get_current_user_session)
):
    """AI-powered creator search and matching"""
    db = get_database()
    
    # Build MongoDB query
    mongo_query = {"role": {"$in": [UserRole.creator, UserRole.business]}, "is_active": True}
    
    if search_filters.skills:
        mongo_query["skills"] = {"$in": search_filters.skills}
    
    if search_filters.categories:
        # Find creators who have services in these categories
        services_with_categories = await db.services.find(
            {"category": {"$in": search_filters.categories}, "status": ServiceStatus.active}
        ).to_list(length=None)
        creator_ids = list(set(s["creator_id"] for s in services_with_categories))
        mongo_query["id"] = {"$in": creator_ids}
    
    if search_filters.min_rating:
        mongo_query["rating"] = {"$gte": search_filters.min_rating}
    
    if search_filters.languages:
        mongo_query["languages"] = {"$in": search_filters.languages}
    
    if search_filters.location:
        mongo_query["location"] = {"$regex": search_filters.location, "$options": "i"}
    
    if search_filters.verified_only:
        mongo_query["is_verified"] = True
    
    # Enhanced text search with AI if query provided
    if query:
        # Use AI to understand intent and match
        try:
            if current_user and current_user.subscription.credits_remaining >= 1:
                model = genai.GenerativeModel('gemini-2.0-flash-exp')
                
                ai_prompt = f"""
                Analyze this search query for finding creators: "{query}"
                
                Extract relevant information for matching:
                1. Skills needed (programming, design, video editing, etc.)
                2. Project type (website, game, animation, etc.) 
                3. Experience level needed (beginner, intermediate, expert)
                4. Industry/category (gaming, tech, education, etc.)
                
                Return a JSON object with: skills, categories, level, keywords
                """
                
                response = model.generate_content(ai_prompt)
                
                # Parse AI response and enhance search
                import json
                try:
                    ai_analysis = json.loads(response.text)
                    
                    if ai_analysis.get("skills"):
                        mongo_query["skills"] = {"$in": ai_analysis["skills"]}
                    
                    if ai_analysis.get("keywords"):
                        text_search = {
                            "$or": [
                                {"display_name": {"$regex": "|".join(ai_analysis["keywords"]), "$options": "i"}},
                                {"bio": {"$regex": "|".join(ai_analysis["keywords"]), "$options": "i"}},
                                {"skills": {"$in": ai_analysis["keywords"]}}
                            ]
                        }
                        mongo_query.update(text_search)
                        
                    # Deduct 1 credit for AI search
                    await db.users.update_one(
                        {"id": current_user.id},
                        {"$inc": {"subscription.credits_remaining": -1}}
                    )
                        
                except json.JSONDecodeError:
                    # Fallback to basic text search
                    mongo_query["$or"] = [
                        {"display_name": {"$regex": query, "$options": "i"}},
                        {"bio": {"$regex": query, "$options": "i"}},
                        {"skills": {"$in": [query]}}
                    ]
        except:
            # Fallback to basic search
            mongo_query["$or"] = [
                {"display_name": {"$regex": query, "$options": "i"}},
                {"bio": {"$regex": query, "$options": "i"}},
                {"skills": {"$in": [query]}}
            ]
    
    # Get matching creators
    cursor = db.users.find(mongo_query).sort([("rating", -1), ("review_count", -1)]).limit(20)
    creators = await cursor.to_list(length=20)
    
    # Enhance results with service information
    enhanced_creators = []
    for creator in creators:
        creator_services = await db.services.find({
            "creator_id": creator["id"], 
            "status": ServiceStatus.active
        }).to_list(length=5)
        
        creator_profile = UserProfile(**creator)
        
        # Calculate match score based on filters
        match_score = 100
        if search_filters.skills:
            skill_match = len(set(search_filters.skills) & set(creator.get("skills", [])))
            match_score = (skill_match / len(search_filters.skills)) * 100
        
        enhanced_creators.append({
            "creator": creator_profile.dict(),
            "services": [Service(**s) for s in creator_services],
            "match_score": int(match_score),
            "response_time": "2-4 hours",  # Could be calculated from historical data
            "completion_rate": 98  # Could be calculated from order history
        })
    
    return {
        "creators": enhanced_creators,
        "total_found": len(enhanced_creators),
        "ai_enhanced": bool(query and current_user)
    }

# ============= ENHANCED RATING SYSTEM =============

@api_router.post("/ratings", response_model=Rating)
async def create_rating(
    rating_data: dict,
    current_user: UserProfile = Depends(get_current_user_session)
):
    """Create a rating/review"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    db = get_database()
    
    rating = Rating(
        reviewer_id=current_user.id,
        reviewee_id=rating_data["reviewee_id"],
        content_id=rating_data.get("content_id"),
        service_id=rating_data.get("service_id"),
        order_id=rating_data.get("order_id"),
        rating_type=RatingType(rating_data["rating_type"]),
        rating=rating_data["rating"],
        comment=rating_data.get("comment")
    )
    
    await db.ratings.insert_one(rating.dict())
    
    # Update target's rating average
    target_collection = "users"
    target_id = rating_data["reviewee_id"]
    
    if rating_data["rating_type"] == "content":
        target_collection = "content"
        target_id = rating_data["content_id"]
    elif rating_data["rating_type"] == "service":
        target_collection = "services"
        target_id = rating_data["service_id"]
    
    # Calculate new average rating
    ratings = await db.ratings.find({
        f"{rating_data['rating_type']}_id": target_id
    }).to_list(length=None)
    
    if ratings:
        avg_rating = sum(r["rating"] for r in ratings) / len(ratings)
        await db[target_collection].update_one(
            {"id": target_id},
            {"$set": {"rating": avg_rating, "review_count": len(ratings)}}
        )
    
    return rating

# ============= SERVICES & MARKETPLACE SYSTEM =============

@api_router.get("/services", response_model=List[Service])
async def get_services(
    page: int = 1,
    limit: int = 20,
    category: Optional[str] = None,
    tags: Optional[str] = None,
    min_price: Optional[int] = None,
    max_price: Optional[int] = None,
    search: Optional[str] = None,
    sort_by: str = "rating"
):
    """Get all services with filtering"""
    db = get_database()
    
    query = {"status": ServiceStatus.active}
    if category:
        query["category"] = category
    if min_price is not None or max_price is not None:
        price_query = {}
        if min_price is not None:
            price_query["$gte"] = min_price
        if max_price is not None:
            price_query["$lte"] = max_price
        query["packages.basic.price"] = price_query
    if tags:
        tag_list = tags.split(",")
        query["tags"] = {"$in": tag_list}
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
            {"tags": {"$in": [search]}}
        ]
    
    sort_options = {
        "rating": [("rating", -1)],
        "price_low": [("packages.basic.price", 1)],
        "price_high": [("packages.basic.price", -1)],
        "newest": [("created_at", -1)],
        "popular": [("orders_completed", -1)]
    }
    sort = sort_options.get(sort_by, [("rating", -1)])
    
    skip = (page - 1) * limit
    cursor = db.services.find(query).sort(sort).skip(skip).limit(limit)
    services_list = await cursor.to_list(length=limit)
    
    return [Service(**service) for service in services_list]

@api_router.post("/services", response_model=Service)
async def create_service(
    service_data: ServiceCreate,
    current_user: UserProfile = Depends(get_current_user_session)
):
    """Create new service"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    if current_user.role == UserRole.viewer:
        raise HTTPException(status_code=403, detail="Only creators can create services")
    
    db = get_database()
    
    service = Service(
        **service_data.dict(),
        creator_id=current_user.id
    )
    
    await db.services.insert_one(service.dict())
    return service

@api_router.get("/services/{service_id}", response_model=Service)
async def get_service(service_id: str):
    """Get specific service details"""
    db = get_database()
    service = await db.services.find_one({"id": service_id})
    
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    return Service(**service)

# ============= ENHANCED ORDER SYSTEM WITH MILESTONES =============

@api_router.post("/orders", response_model=EnhancedOrder)
async def create_order(
    order_data: OrderCreate,
    milestones: Optional[List[Milestone]] = None,
    current_user: UserProfile = Depends(get_current_user_session)
):
    """Create new order with optional milestone payments"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    db = get_database()
    
    # Get service details
    service = await db.services.find_one({"id": order_data.service_id})
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    package = service["packages"].get(order_data.package_type)
    if not package:
        raise HTTPException(status_code=400, detail="Invalid package type")
    
    total_amount = package["price"]
    
    # Check if user has enough credits
    if current_user.subscription.credits_remaining < total_amount:
        raise HTTPException(status_code=400, detail="Insufficient credits")
    
    order = EnhancedOrder(
        client_id=current_user.id,
        creator_id=service["creator_id"],
        service_id=order_data.service_id,
        package_type=order_data.package_type,
        total_amount=total_amount,
        requirements=order_data.requirements,
        milestones=milestones or [],
        has_milestones=bool(milestones),
        escrow_amount=total_amount
    )
    
    await db.orders.insert_one(order.dict())
    
    # Hold credits in escrow
    await db.users.update_one(
        {"id": current_user.id},
        {"$inc": {"subscription.credits_remaining": -total_amount}}
    )
    
    # Create transaction record
    transaction = TokenTransaction(
        user_id=current_user.id,
        transaction_type="escrow",
        amount=total_amount,
        description=f"Order #{order.id[:8]} - {service['title']}"
    )
    await db.token_transactions.insert_one(transaction.dict())
    
    return order

@api_router.get("/orders", response_model=List[EnhancedOrder])
async def get_user_orders(
    current_user: UserProfile = Depends(get_current_user_session)
):
    """Get user's orders (as client or creator)"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    db = get_database()
    
    query = {
        "$or": [
            {"client_id": current_user.id},
            {"creator_id": current_user.id}
        ]
    }
    
    cursor = db.orders.find(query).sort([("created_at", -1)])
    orders_list = await cursor.to_list(length=None)
    
    return [EnhancedOrder(**order) for order in orders_list]

@api_router.put("/orders/{order_id}/status")
async def update_order_status(
    order_id: str,
    new_status: OrderStatus,
    current_user: UserProfile = Depends(get_current_user_session)
):
    """Update order status"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    db = get_database()
    
    order = await db.orders.find_one({"id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Check permissions
    if order["creator_id"] != current_user.id and order["client_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Handle completion and payment release
    if new_status == OrderStatus.completed and order["status"] == OrderStatus.delivered:
        # Release payment to creator
        await db.users.update_one(
            {"id": order["creator_id"]},
            {"$inc": {"subscription.credits_remaining": order["escrow_amount"], "total_earned": order["escrow_amount"]}}
        )
        
        # Update client spending
        await db.users.update_one(
            {"id": order["client_id"]},
            {"$inc": {"total_spent": order["escrow_amount"]}}
        )
        
        # Create earning transaction
        transaction = TokenTransaction(
            user_id=order["creator_id"],
            transaction_type="earning",
            amount=order["escrow_amount"],
            description=f"Payment for order #{order_id[:8]}"
        )
        await db.token_transactions.insert_one(transaction.dict())
    
    await db.orders.update_one(
        {"id": order_id},
        {"$set": {"status": new_status, "updated_at": datetime.utcnow()}}
    )
    
    return {"success": True, "message": f"Order status updated to {new_status}"}

@api_router.post("/orders/{order_id}/milestones/{milestone_id}/approve")
async def approve_milestone(
    order_id: str,
    milestone_id: str,
    current_user: UserProfile = Depends(get_current_user_session)
):
    """Approve milestone and release payment"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    db = get_database()
    
    order = await db.orders.find_one({"id": order_id})
    if not order or order["client_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Find and update milestone
    milestones = order.get("milestones", [])
    milestone_found = False
    
    for milestone in milestones:
        if milestone["id"] == milestone_id:
            milestone["status"] = MilestoneStatus.approved
            milestone["updated_at"] = datetime.utcnow()
            milestone_found = True
            
            # Release milestone payment
            await db.users.update_one(
                {"id": order["creator_id"]},
                {"$inc": {"subscription.credits_remaining": milestone["amount"]}}
            )
            break
    
    if not milestone_found:
        raise HTTPException(status_code=404, detail="Milestone not found")
    
    await db.orders.update_one(
        {"id": order_id},
        {"$set": {"milestones": milestones, "updated_at": datetime.utcnow()}}
    )
    
    return {"success": True, "message": "Milestone approved and payment released"}

# ============= TOKEN PURCHASE & WITHDRAWAL SYSTEM =============

@api_router.post("/tokens/purchase")
async def purchase_tokens(
    package_id: str,
    current_user: UserProfile = Depends(get_current_user_session)
):
    """Purchase token packages with Stripe"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    token_packages = {
        "starter": {"credits": 100, "price": 9.99, "bonus": 0},
        "pro": {"credits": 500, "price": 39.99, "bonus": 50},
        "business": {"credits": 1000, "price": 69.99, "bonus": 150},
        "enterprise": {"credits": 2500, "price": 149.99, "bonus": 500}
    }
    
    package = token_packages.get(package_id)
    if not package:
        raise HTTPException(status_code=400, detail="Invalid package")
    
    try:
        # Create Stripe payment intent
        intent = stripe.PaymentIntent.create(
            amount=int(package["price"] * 100),  # Convert to cents
            currency='usd',
            metadata={
                'user_id': current_user.id,
                'package_id': package_id,
                'credits': package["credits"] + package["bonus"]
            }
        )
        
        return {
            "client_secret": intent.client_secret,
            "package": package
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.post("/tokens/confirm-purchase")
async def confirm_token_purchase(
    payment_intent_id: str,
    current_user: UserProfile = Depends(get_current_user_session)
):
    """Confirm token purchase and add credits"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    try:
        # Verify payment with Stripe
        intent = stripe.PaymentIntent.retrieve(payment_intent_id)
        
        if intent.status != 'succeeded':
            raise HTTPException(status_code=400, detail="Payment not completed")
        
        credits_to_add = int(intent.metadata.get('credits', 0))
        package_id = intent.metadata.get('package_id')
        
        db = get_database()
        
        # Add credits to user
        await db.users.update_one(
            {"id": current_user.id},
            {"$inc": {"subscription.credits_remaining": credits_to_add}}
        )
        
        # Create transaction record
        transaction = TokenTransaction(
            user_id=current_user.id,
            transaction_type="purchase",
            amount=credits_to_add,
            usd_amount=intent.amount / 100,
            description=f"Token purchase - {package_id} package",
            stripe_payment_intent_id=payment_intent_id
        )
        await db.token_transactions.insert_one(transaction.dict())
        
        return {
            "success": True,
            "credits_added": credits_to_add,
            "message": f"Successfully added {credits_to_add} credits to your account!"
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.post("/tokens/withdraw")
async def request_withdrawal(
    withdrawal_data: WithdrawalRequest,
    current_user: UserProfile = Depends(get_current_user_session)
):
    """Request token withdrawal to real money"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Check minimum withdrawal (equivalent to $10)
    min_credits = 100
    if withdrawal_data.amount_credits < min_credits:
        raise HTTPException(status_code=400, detail=f"Minimum withdrawal is {min_credits} credits")
    
    # Check if user has enough credits
    if current_user.subscription.credits_remaining < withdrawal_data.amount_credits:
        raise HTTPException(status_code=400, detail="Insufficient credits")
    
    # Calculate USD amount (1 credit = $0.10)
    usd_amount = withdrawal_data.amount_credits * 0.10
    
    withdrawal = WithdrawalRequest(
        user_id=current_user.id,
        amount_credits=withdrawal_data.amount_credits,
        amount_usd=usd_amount,
        payment_method=withdrawal_data.payment_method,
        payment_details=withdrawal_data.payment_details
    )
    
    db = get_database()
    await db.withdrawal_requests.insert_one(withdrawal.dict())
    
    # Hold credits during withdrawal processing
    await db.users.update_one(
        {"id": current_user.id},
        {"$inc": {"subscription.credits_remaining": -withdrawal_data.amount_credits}}
    )
    
    return {
        "success": True,
        "withdrawal_id": withdrawal.id,
        "amount_usd": usd_amount,
        "message": "Withdrawal request submitted. Processing takes 3-5 business days."
    }

@api_router.get("/tokens/transactions")
async def get_token_transactions(
    current_user: UserProfile = Depends(get_current_user_session)
):
    """Get user's token transaction history"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    db = get_database()
    
    cursor = db.token_transactions.find({"user_id": current_user.id}).sort([("created_at", -1)])
    transactions = await cursor.to_list(length=50)  # Last 50 transactions
    
    return [TokenTransaction(**t) for t in transactions]

# ============= COMPLETE CONTENT SYSTEM =============

@api_router.get("/content", response_model=List[Content])
async def get_content(
    page: int = 1,
    limit: int = 20,
    category: Optional[str] = None,
    tags: Optional[str] = None,
    content_type: Optional[str] = None,
    sort_by: str = "created_at",
    search: Optional[str] = None
):
    """Get all content with advanced filtering"""
    db = get_database()
    
    query = {"status": ContentStatus.published}
    if category:
        query["category"] = category
    if content_type:
        query["content_type"] = content_type
    if tags:
        tag_list = tags.split(",")
        query["tags"] = {"$in": tag_list}
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
            {"tags": {"$in": [search]}}
        ]
    
    sort_options = {
        "created_at": [("created_at", -1)],
        "popular": [("views_count", -1), ("likes_count", -1)],
        "rating": [("rating", -1)],
        "trending": [("likes_count", -1), ("created_at", -1)]
    }
    sort = sort_options.get(sort_by, [("created_at", -1)])
    
    skip = (page - 1) * limit
    cursor = db.content.find(query).sort(sort).skip(skip).limit(limit)
    content_list = await cursor.to_list(length=limit)
    
    return [Content(**content) for content in content_list]

@api_router.post("/content", response_model=Content)
async def create_content(
    content_data: ContentCreate,
    current_user: UserProfile = Depends(get_current_user_session)
):
    """Create new content with tutorial requirement"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    if current_user.role == UserRole.viewer:
        raise HTTPException(status_code=403, detail="Only creators can upload content")
    
    # Check if tutorial is included
    if not content_data.tutorial_url and not content_data.project_files:
        raise HTTPException(status_code=400, detail="Tutorial or project files required for all content on WayaCreate")
    
    db = get_database()
    
    content = Content(
        **content_data.dict(),
        creator_id=current_user.id,
        tutorial_included=True
    )
    
    await db.content.insert_one(content.dict())
    
    # Award XP to user
    await db.users.update_one(
        {"id": current_user.id},
        {"$inc": {"level.xp": 50}}  # 50 XP for content creation
    )
    
    return content

@api_router.get("/")
async def root():
    return {
        "message": "WayaCreate API v2.0 - Complete Gaming, Design & Tech Platform 🎮",
        "creator": "Waya Steurbaut",
        "youtube": "https://www.youtube.com/@wayasteurbaut",
        "features": [
            "Google OAuth Login",
            "YouTube Content Import",
            "Gemini 2.0 Flash AI Generation",
            "Subscription-based Credits",
            "Complete Rating System",
            "Tutorial Requirements",
            "Advanced Search & Filtering"
        ]
    }

@api_router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow(),
        "version": "2.0.0",
        "platform": "WayaCreate Complete",
        "creator": "Waya Steurbaut"
    }

# Include all routes
app.include_router(api_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)