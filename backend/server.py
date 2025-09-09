from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, UploadFile, File, Form, Cookie, Response, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.trustedhost import TrustedHostMiddleware
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

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configure integrations
sentry_dsn = os.environ.get('SENTRY_DSN')
if sentry_dsn:
    sentry_sdk.init(
        dsn=sentry_dsn,
        integrations=[FastApiIntegration()],
        traces_sample_rate=0.1,  # Lower sample rate for production
    )
    logger.info("✅ Sentry configured")

# Stripe configuration
stripe_key = os.environ.get('STRIPE_SECRET_KEY')
if stripe_key:
    stripe.api_key = stripe_key
    logger.info("✅ Stripe configured")
else:
    logger.warning("⚠️ Stripe not configured - payment features disabled")

# Google AI configuration
google_api_key = os.environ.get('GOOGLE_API_KEY')
if google_api_key:
    genai.configure(api_key=google_api_key)
    logger.info("✅ Google AI configured")
else:
    logger.warning("⚠️ Google AI not configured - AI features disabled")

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

# Health check endpoint (without /api prefix for load balancers)
@app.get("/health")
async def health_check():
    """Health check endpoint for production monitoring"""
    try:
        # Test database connection
        db = get_database()
        await db.command('ping')
        
        return {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "services": {
                "database": "connected",
                "api": "running"
            }
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(status_code=503, detail="Service unhealthy")

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "WayaCreate API",
        "version": "1.0.0",
        "status": "running"
    }

# Environment validation
required_env_vars = ['MONGO_URL']
missing_vars = [var for var in required_env_vars if not os.environ.get(var)]
if missing_vars:
    logger.error(f"❌ Missing required environment variables: {missing_vars}")
    raise RuntimeError(f"Missing required environment variables: {missing_vars}")

# CORS configuration
cors_origins = os.environ.get('CORS_ORIGINS', 'http://localhost:3000').split(',')
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)
logger.info(f"✅ CORS configured for origins: {cors_origins}")

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

# ============= LIVE ANALYTICS & DATA TRACKING =============

@api_router.get("/analytics/live")
async def get_live_analytics():
    """Get real-time platform analytics"""
    db = get_database()
    
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    
    # Get live stats
    total_users = await db.users.count_documents({})
    active_users_today = await db.user_activity.distinct("user_id", {
        "timestamp": {"$gte": today},
        "activity_type": {"$in": ["login", "order_created", "content_downloaded"]}
    })
    
    total_orders = await db.orders.count_documents({})
    orders_today = await db.orders.count_documents({"created_at": {"$gte": today}})
    
    total_services = await db.services.count_documents({"status": ServiceStatus.active})
    active_creators = await db.users.count_documents({"role": {"$in": [UserRole.creator, UserRole.business]}})
    
    # Calculate revenue
    completed_orders = await db.orders.find({"status": OrderStatus.completed}).to_list(length=None)
    total_revenue = sum(order.get("total_amount", 0) * 0.10 for order in completed_orders)  # Convert credits to USD
    
    orders_today_completed = await db.orders.find({
        "status": OrderStatus.completed,
        "updated_at": {"$gte": today}
    }).to_list(length=None)
    revenue_today = sum(order.get("total_amount", 0) * 0.10 for order in orders_today_completed)
    
    # Download stats
    total_downloads = await db.user_activity.count_documents({"activity_type": "content_downloaded"})
    downloads_today = await db.user_activity.count_documents({
        "activity_type": "content_downloaded",
        "timestamp": {"$gte": today}
    })
    
    analytics = PlatformAnalytics(
        total_users=total_users,
        active_users_today=len(active_users_today),
        total_orders=total_orders,
        orders_today=orders_today,
        total_revenue=total_revenue,
        revenue_today=revenue_today,
        total_downloads=total_downloads,
        downloads_today=downloads_today,
        total_services=total_services,
        active_creators=active_creators,
        platform_fees_collected=total_revenue * 0.05  # 5% platform fee
    )
    
    # Store daily analytics
    await db.platform_analytics.insert_one(analytics.dict())
    
    return analytics

@api_router.post("/analytics/track")
async def track_user_activity(
    activity_type: str,
    details: Dict[str, Any] = {},
    current_user: UserProfile = Depends(get_current_user_session)
):
    """Track user activity for analytics"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    db = get_database()
    
    activity = UserActivity(
        user_id=current_user.id,
        activity_type=activity_type,
        details=details
    )
    
    await db.user_activity.insert_one(activity.dict())
    
    return {"success": True}

# ============= PLATFORM FEE SYSTEM =============

@api_router.get("/platform/config")
async def get_platform_config():
    """Get platform configuration"""
    return PlatformConfig()

@api_router.put("/orders/{order_id}/complete-with-fee")
async def complete_order_with_platform_fee(
    order_id: str,
    current_user: UserProfile = Depends(get_current_user_session)
):
    """Complete order and apply platform fee"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    db = get_database()
    order = await db.orders.find_one({"id": order_id})
    
    if not order or order["client_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    if order["status"] != OrderStatus.delivered:
        raise HTTPException(status_code=400, detail="Order must be delivered first")
    
    # Calculate platform fee (5%)
    platform_fee = int(order["total_amount"] * 0.05)
    creator_payment = order["total_amount"] - platform_fee
    
    # Release payment to creator (minus platform fee)
    await db.users.update_one(
        {"id": order["creator_id"]},
        {"$inc": {"subscription.credits_remaining": creator_payment, "total_earned": creator_payment}}
    )
    
    # Update client spending
    await db.users.update_one(
        {"id": order["client_id"]},
        {"$inc": {"total_spent": order["total_amount"]}}
    )
    
    # Record platform fee
    platform_transaction = TokenTransaction(
        user_id="platform",
        transaction_type="platform_fee",
        amount=platform_fee,
        description=f"Platform fee for order #{order_id[:8]}"
    )
    await db.token_transactions.insert_one(platform_transaction.dict())
    
    # Mark order as completed
    await db.orders.update_one(
        {"id": order_id},
        {"$set": {"status": OrderStatus.completed, "updated_at": datetime.utcnow()}}
    )
    
    # Track activity
    await track_user_activity("order_completed", {"order_id": order_id, "amount": order["total_amount"]}, current_user)
    
    return {
        "success": True,
        "creator_payment": creator_payment,
        "platform_fee": platform_fee,
        "message": f"Order completed. Creator received {creator_payment} credits (after 5% platform fee)"
    }

# ============= FEATURED LISTINGS SYSTEM =============

@api_router.post("/services/{service_id}/feature")
async def feature_service(
    service_id: str,
    featured_type: str,
    duration_days: int,
    current_user: UserProfile = Depends(get_current_user_session)
):
    """Feature a service for increased visibility"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    db = get_database()
    
    # Check if user owns the service
    service = await db.services.find_one({"id": service_id, "creator_id": current_user.id})
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    config = PlatformConfig()
    cost_per_day = config.featured_listing_costs.get(featured_type, 25)
    total_cost = cost_per_day * duration_days
    
    # Check if user has enough credits
    if current_user.subscription.credits_remaining < total_cost:
        raise HTTPException(status_code=400, detail=f"Insufficient credits. Need {total_cost} credits.")
    
    # Create featured listing
    end_date = datetime.utcnow() + timedelta(days=duration_days)
    
    featured_listing = FeaturedListing(
        service_id=service_id,
        creator_id=current_user.id,
        featured_type=featured_type,
        duration_days=duration_days,
        cost_credits=total_cost,
        end_date=end_date
    )
    
    await db.featured_listings.insert_one(featured_listing.dict())
    
    # Deduct credits
    await db.users.update_one(
        {"id": current_user.id},
        {"$inc": {"subscription.credits_remaining": -total_cost}}
    )
    
    # Create transaction record
    transaction = TokenTransaction(
        user_id=current_user.id,
        transaction_type="featured_listing",
        amount=total_cost,
        description=f"Featured listing ({featured_type}) for {duration_days} days"
    )
    await db.token_transactions.insert_one(transaction.dict())
    
    return {
        "success": True,
        "featured_listing": featured_listing.dict(),
        "message": f"Service featured on {featured_type} for {duration_days} days"
    }

@api_router.get("/services/featured")
async def get_featured_services():
    """Get currently featured services"""
    db = get_database()
    
    current_time = datetime.utcnow()
    
    featured_listings = await db.featured_listings.find({
        "status": "active",
        "end_date": {"$gte": current_time}
    }).to_list(length=None)
    
    # Get service details for featured items
    featured_services = []
    for listing in featured_listings:
        service = await db.services.find_one({"id": listing["service_id"]})
        if service:
            featured_services.append({
                "service": Service(**service),
                "featured_type": listing["featured_type"],
                "end_date": listing["end_date"]
            })
    
    return featured_services

# ============= GAMIFICATION SYSTEM =============

@api_router.get("/achievements")
async def get_achievements():
    """Get all available achievements"""
    achievements = [
        Achievement(
            name="First Sale",
            description="Complete your first order as a creator",
            icon="🎉",
            criteria={"orders_completed": 1},
            reward_credits=50,
            category="sales"
        ),
        Achievement(
            name="Rising Star",
            description="Earn 5-star rating on 10 orders",
            icon="⭐",
            criteria={"five_star_orders": 10},
            reward_credits=100,
            category="quality"
        ),
        Achievement(
            name="Speed Demon",
            description="Complete 5 orders in 24 hours",
            icon="⚡",
            criteria={"fast_completions": 5},
            reward_credits=150,
            category="speed"
        ),
        Achievement(
            name="Community Favorite",
            description="Get 100 total reviews",
            icon="💖",
            criteria={"total_reviews": 100},
            reward_credits=200,
            category="engagement"
        ),
        Achievement(
            name="Master Creator",
            description="Earn $1000 in total revenue",
            icon="👑",
            criteria={"total_revenue": 10000},  # 10000 credits = $1000
            reward_credits=500,
            category="revenue"
        )
    ]
    
    return achievements

@api_router.get("/users/{user_id}/achievements")
async def get_user_achievements(
    user_id: str,
    current_user: UserProfile = Depends(get_current_user_session)
):
    """Get user's unlocked achievements"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    if user_id != current_user.id and current_user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    db = get_database()
    
    user_achievements = await db.user_achievements.find({"user_id": user_id}).to_list(length=None)
    achievements = await get_achievements()
    
    unlocked_achievements = []
    for ua in user_achievements:
        achievement = next((a for a in achievements if a.id == ua["achievement_id"]), None)
        if achievement:
            unlocked_achievements.append({
                "achievement": achievement,
                "unlocked_at": ua["unlocked_at"]
            })
    
    return unlocked_achievements

@api_router.post("/users/check-achievements")
async def check_and_unlock_achievements(
    current_user: UserProfile = Depends(get_current_user_session)
):
    """Check and unlock new achievements for user"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    db = get_database()
    
    # Get user stats
    user_orders = await db.orders.find({"creator_id": current_user.id, "status": OrderStatus.completed}).to_list(length=None)
    user_ratings = await db.ratings.find({"reviewee_id": current_user.id}).to_list(length=None)
    
    orders_completed = len(user_orders)
    five_star_orders = len([r for r in user_ratings if r.get("rating") == 5])
    total_reviews = len(user_ratings)
    total_revenue = sum(order.get("total_amount", 0) for order in user_orders)
    
    # Check achievements
    achievements = await get_achievements()
    unlocked_achievements = []
    
    for achievement in achievements:
        # Check if already unlocked
        existing = await db.user_achievements.find_one({
            "user_id": current_user.id,
            "achievement_id": achievement.id
        })
        
        if existing:
            continue
        
        # Check criteria
        criteria_met = False
        if achievement.category == "sales" and orders_completed >= achievement.criteria.get("orders_completed", 0):
            criteria_met = True
        elif achievement.category == "quality" and five_star_orders >= achievement.criteria.get("five_star_orders", 0):
            criteria_met = True
        elif achievement.category == "engagement" and total_reviews >= achievement.criteria.get("total_reviews", 0):
            criteria_met = True
        elif achievement.category == "revenue" and total_revenue >= achievement.criteria.get("total_revenue", 0):
            criteria_met = True
        
        if criteria_met:
            # Unlock achievement
            user_achievement = UserAchievement(
                user_id=current_user.id,
                achievement_id=achievement.id
            )
            await db.user_achievements.insert_one(user_achievement.dict())
            
            # Award credits
            await db.users.update_one(
                {"id": current_user.id},
                {"$inc": {"subscription.credits_remaining": achievement.reward_credits}}
            )
            
            unlocked_achievements.append(achievement)
    
    return {
        "unlocked_achievements": unlocked_achievements,
        "message": f"Unlocked {len(unlocked_achievements)} new achievements!"
    }

# ============= LIVE CHAT SYSTEM =============

@api_router.get("/conversations")
async def get_user_conversations(
    current_user: UserProfile = Depends(get_current_user_session)
):
    """Get user's conversations"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    db = get_database()
    
    conversations = await db.conversations.find({
        "participants": current_user.id,
        "status": "active"
    }).sort([("last_message_at", -1)]).to_list(length=50)
    
    return conversations

@api_router.post("/conversations")
async def create_conversation(
    recipient_id: str,
    order_id: Optional[str] = None,
    current_user: UserProfile = Depends(get_current_user_session)
):
    """Create new conversation"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    db = get_database()
    
    # Check if conversation already exists
    existing = await db.conversations.find_one({
        "participants": {"$all": [current_user.id, recipient_id]},
        "order_id": order_id
    })
    
    if existing:
        return Conversation(**existing)
    
    conversation = Conversation(
        participants=[current_user.id, recipient_id],
        order_id=order_id
    )
    
    await db.conversations.insert_one(conversation.dict())
    return conversation

@api_router.post("/conversations/{conversation_id}/messages")
async def send_message(
    conversation_id: str,
    message: str,
    current_user: UserProfile = Depends(get_current_user_session)
):
    """Send message in conversation"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    db = get_database()
    
    # Verify user is part of conversation
    conversation = await db.conversations.find_one({
        "id": conversation_id,
        "participants": current_user.id
    })
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    # Get recipient
    recipient_id = next(p for p in conversation["participants"] if p != current_user.id)
    
    chat_message = ChatMessage(
        conversation_id=conversation_id,
        sender_id=current_user.id,
        recipient_id=recipient_id,
        message=message
    )
    
    await db.chat_messages.insert_one(chat_message.dict())
    
    # Update conversation last message time
    await db.conversations.update_one(
        {"id": conversation_id},
        {"$set": {"last_message_at": datetime.utcnow()}}
    )
    
    return chat_message

@api_router.get("/conversations/{conversation_id}/messages")
async def get_conversation_messages(
    conversation_id: str,
    current_user: UserProfile = Depends(get_current_user_session)
):
    """Get messages in conversation"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    db = get_database()
    
    # Verify user is part of conversation
    conversation = await db.conversations.find_one({
        "id": conversation_id,
        "participants": current_user.id
    })
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    messages = await db.chat_messages.find({
        "conversation_id": conversation_id
    }).sort([("timestamp", 1)]).to_list(length=100)
    
    return [ChatMessage(**msg) for msg in messages]

# ============= EMAIL NOTIFICATION SYSTEM =============

@api_router.post("/notifications/email")
async def send_email_notification(
    user_id: str,
    template: str,
    variables: Dict[str, Any] = {},
    current_user: UserProfile = Depends(get_current_user_session)
):
    """Send email notification"""
    if not current_user or current_user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    db = get_database()
    
    # Get user email
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Email templates
    templates = {
        "order_created": {
            "subject": "New Order Received - #{order_id}",
            "body": "You have received a new order for {service_title}. Amount: {amount} credits."
        },
        "order_completed": {
            "subject": "Order Completed - #{order_id}",
            "body": "Congratulations! Your order has been completed. {amount} credits have been released to the creator."
        },
        "milestone_approved": {
            "subject": "Milestone Approved - #{order_id}",
            "body": "Your milestone '{milestone_title}' has been approved. {amount} credits have been released."
        },
        "achievement_unlocked": {
            "subject": "Achievement Unlocked! 🏆",
            "body": "Congratulations! You've unlocked the '{achievement_name}' achievement and earned {reward_credits} credits!"
        },
        "payment_received": {
            "subject": "Payment Received",
            "body": "You've received {amount} credits from {client_name} for order #{order_id}."
        },
        "withdrawal_processed": {
            "subject": "Withdrawal Processed",
            "body": "Your withdrawal of ${amount} has been processed and will arrive in 3-5 business days."
        }
    }
    
    template_data = templates.get(template)
    if not template_data:
        raise HTTPException(status_code=400, detail="Invalid template")
    
    # Format template with variables
    subject = template_data["subject"].format(**variables)
    body = template_data["body"].format(**variables)
    
    # Create notification record
    notification = EmailNotification(
        user_id=user_id,
        email=user["email"],
        subject=subject,
        template=template,
        variables=variables
    )
    
    await db.email_notifications.insert_one(notification.dict())
    
    # In production, integrate with email service (SendGrid, etc.)
    print(f"📧 Email notification sent to {user['email']}: {subject}")
    
    return {"success": True, "message": "Email notification queued"}

@api_router.get("/notifications/email/{user_id}")
async def get_user_email_notifications(
    user_id: str,
    current_user: UserProfile = Depends(get_current_user_session)
):
    """Get user's email notifications"""
    if not current_user or (current_user.id != user_id and current_user.role != UserRole.admin):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    db = get_database()
    
    notifications = await db.email_notifications.find({
        "user_id": user_id
    }).sort([("created_at", -1)]).limit(50).to_list(length=50)
    
    return [EmailNotification(**notif) for notif in notifications]

# ============= ENHANCED REVIEW SYSTEM =============

@api_router.post("/reviews/{review_id}/response")
async def respond_to_review(
    review_id: str,
    response_text: str,
    current_user: UserProfile = Depends(get_current_user_session)
):
    """Respond to a review"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    db = get_database()
    
    # Get the original review
    review = await db.ratings.find_one({"id": review_id})
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    # Check if user is the reviewee (can respond to reviews about them)
    if review["reviewee_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Can only respond to reviews about you")
    
    # Create response
    response = ReviewResponse(
        review_id=review_id,
        responder_id=current_user.id,
        response=response_text
    )
    
    await db.review_responses.insert_one(response.dict())
    
    return {"success": True, "response": response.dict()}

@api_router.get("/reviews/{review_id}/responses")
async def get_review_responses(review_id: str):
    """Get responses to a review"""
    db = get_database()
    
    responses = await db.review_responses.find({
        "review_id": review_id
    }).sort([("created_at", 1)]).to_list(length=None)
    
    return [ReviewResponse(**resp) for resp in responses]

# ============= PLATFORM REVENUE SHARING =============

@api_router.get("/platform/revenue")
async def get_platform_revenue(
    current_user: UserProfile = Depends(get_current_user_session)
):
    """Get platform revenue statistics (admin only)"""
    if not current_user or current_user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    db = get_database()
    
    # Get platform fee transactions
    platform_transactions = await db.token_transactions.find({
        "transaction_type": "platform_fee"
    }).to_list(length=None)
    
    total_platform_fees = sum(t.get("amount", 0) for t in platform_transactions)
    
    # Get revenue by category
    completed_orders = await db.orders.find({"status": OrderStatus.completed}).to_list(length=None)
    
    revenue_by_category = {}
    for order in completed_orders:
        service = await db.services.find_one({"id": order["service_id"]})
        if service:
            category = service.get("category", "other")
            revenue_by_category[category] = revenue_by_category.get(category, 0) + order.get("total_amount", 0)
    
    return {
        "total_platform_fees_credits": total_platform_fees,
        "total_platform_fees_usd": total_platform_fees * 0.10,
        "revenue_by_category": revenue_by_category,
        "total_orders": len(completed_orders),
        "average_order_value": sum(o.get("total_amount", 0) for o in completed_orders) / len(completed_orders) if completed_orders else 0
    }

# ============= SOCIAL PROOF SYSTEM =============

@api_router.get("/social-proof/stats")
async def get_social_proof_stats():
    """Get social proof statistics for homepage"""
    db = get_database()
    
    total_users = await db.users.count_documents({})
    total_creators = await db.users.count_documents({"role": {"$in": [UserRole.creator, UserRole.business]}})
    total_orders = await db.orders.count_documents({"status": OrderStatus.completed})
    total_reviews = await db.ratings.count_documents({})
    
    # Calculate average rating
    ratings = await db.ratings.find({}).to_list(length=None)
    avg_rating = sum(r.get("rating", 0) for r in ratings) / len(ratings) if ratings else 0
    
    # Get top creators
    top_creators = await db.users.find({
        "role": {"$in": [UserRole.creator, UserRole.business]},
        "total_earned": {"$gt": 0}
    }).sort([("total_earned", -1)]).limit(5).to_list(length=5)
    
    return {
        "total_users": total_users,
        "total_creators": total_creators,
        "total_orders": total_orders,
        "total_reviews": total_reviews,
        "average_rating": round(avg_rating, 1),
        "top_creators": [UserProfile(**creator) for creator in top_creators],
        "success_stories": [
            {
                "user": "Alex M.",
                "achievement": "Earned $2,500 in first month",
                "category": "Design"
            },
            {
                "user": "Sarah K.",
                "achievement": "500+ completed orders",
                "category": "Gaming"
            },
            {
                "user": "Mike R.",
                "achievement": "100% 5-star rating",
                "category": "Development"
            }
        ]
    }

# ============= SMART BIDDING SYSTEM =============

@api_router.post("/projects/bidding", response_model=BiddingProject)
async def create_bidding_project(
    project_data: dict,
    current_user: UserProfile = Depends(get_current_user_session)
):
    """Create a new bidding project"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    db = get_database()
    
    # Validate budget
    budget_min = project_data.get("budget_min", 50)
    budget_max = project_data.get("budget_max", 5000)
    
    if budget_min > budget_max:
        raise HTTPException(status_code=400, detail="Minimum budget cannot be higher than maximum budget")
    
    # Create project
    project = BiddingProject(
        client_id=current_user.id,
        title=project_data["title"],
        description=project_data["description"],
        category=project_data.get("category", "general"),
        required_skills=project_data.get("required_skills", []),
        budget_min=budget_min,
        budget_max=budget_max,
        deadline=datetime.fromisoformat(project_data["deadline"]),
        bid_deadline=datetime.fromisoformat(project_data.get("bid_deadline", project_data["deadline"])),
        requirements=project_data.get("requirements", {}),
        tags=project_data.get("tags", []),
        min_creator_level=project_data.get("min_creator_level", 1),
        min_rating=project_data.get("min_rating", 0.0)
    )
    
    await db.bidding_projects.insert_one(project.dict())
    
    # Track activity
    activity = UserActivity(
        user_id=current_user.id,
        activity_type="project_created",
        details={"project_id": project.id, "project_type": "bidding"}
    )
    await db.user_activity.insert_one(activity.dict())
    
    return project

@api_router.get("/projects/bidding", response_model=List[BiddingProject])
async def get_bidding_projects(
    category: Optional[str] = None,
    min_budget: Optional[int] = None,
    max_budget: Optional[int] = None,
    skills: Optional[str] = None,
    status: str = "open",
    page: int = 1,
    limit: int = 20
):
    """Get bidding projects with filtering"""
    db = get_database()
    
    query = {"status": status}
    
    if category:
        query["category"] = category
    if min_budget:
        query["budget_min"] = {"$gte": min_budget}
    if max_budget:
        query["budget_max"] = {"$lte": max_budget}
    if skills:
        skill_list = skills.split(",")
        query["required_skills"] = {"$in": skill_list}
    
    skip = (page - 1) * limit
    cursor = db.bidding_projects.find(query).sort([("created_at", -1)]).skip(skip).limit(limit)
    projects = await cursor.to_list(length=limit)
    
    return [BiddingProject(**project) for project in projects]

@api_router.post("/projects/{project_id}/bids", response_model=Bid)
async def submit_bid(
    project_id: str,
    bid_data: dict,
    current_user: UserProfile = Depends(get_current_user_session)
):
    """Submit a bid on a project"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    if current_user.role == UserRole.viewer:
        raise HTTPException(status_code=403, detail="Only creators can submit bids")
    
    db = get_database()
    
    # Get project
    project = await db.bidding_projects.find_one({"id": project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if project["status"] != ProjectStatus.open:
        raise HTTPException(status_code=400, detail="Project is not open for bidding")
    
    if project["client_id"] == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot bid on your own project")
    
    # Check if user already has a bid
    existing_bid = await db.bids.find_one({"project_id": project_id, "creator_id": current_user.id})
    if existing_bid:
        raise HTTPException(status_code=400, detail="You already have a bid on this project")
    
    # Validate bid amount
    bid_amount = bid_data["amount"]
    if project.get("budget_min") and bid_amount < project["budget_min"]:
        raise HTTPException(status_code=400, detail="Bid amount is below minimum budget")
    if project.get("budget_max") and bid_amount > project["budget_max"]:
        raise HTTPException(status_code=400, detail="Bid amount exceeds maximum budget")
    
    # Create bid
    bid = Bid(
        project_id=project_id,
        creator_id=current_user.id,
        amount=bid_amount,
        delivery_time=bid_data["delivery_time"],
        proposal=bid_data["proposal"],
        milestones=bid_data.get("milestones", []),
        extras=bid_data.get("extras", []),
        questions=bid_data.get("questions", []),
        portfolio_items=bid_data.get("portfolio_items", [])
    )
    
    await db.bids.insert_one(bid.dict())
    
    # Update project bid count
    await db.bidding_projects.update_one(
        {"id": project_id},
        {"$inc": {"current_bid_count": 1}}
    )
    
    # Track activity
    activity = UserActivity(
        user_id=current_user.id,
        activity_type="bid_submitted",
        details={"project_id": project_id, "bid_amount": bid_amount}
    )
    await db.user_activity.insert_one(activity.dict())
    
    return bid

@api_router.get("/projects/{project_id}/bids", response_model=List[Bid])
async def get_project_bids(
    project_id: str,
    current_user: UserProfile = Depends(get_current_user_session)
):
    """Get bids for a project (only project owner can see all bids)"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    db = get_database()
    
    # Get project to check ownership
    project = await db.bidding_projects.find_one({"id": project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Only project owner can see all bids
    if project["client_id"] != current_user.id:
        # Creators can only see their own bid
        bids = await db.bids.find({"project_id": project_id, "creator_id": current_user.id}).to_list(length=None)
    else:
        # Project owner sees all bids
        bids = await db.bids.find({"project_id": project_id}).sort([("amount", 1)]).to_list(length=None)
    
    return [Bid(**bid) for bid in bids]

@api_router.post("/projects/{project_id}/bids/{bid_id}/accept")
async def accept_bid(
    project_id: str,
    bid_id: str,
    current_user: UserProfile = Depends(get_current_user_session)
):
    """Accept a bid and create an order"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    db = get_database()
    
    # Get project
    project = await db.bidding_projects.find_one({"id": project_id})
    if not project or project["client_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Get bid
    bid = await db.bids.find_one({"id": bid_id, "project_id": project_id})
    if not bid:
        raise HTTPException(status_code=404, detail="Bid not found")
    
    # Check credits
    if current_user.subscription.credits_remaining < bid["amount"]:
        raise HTTPException(status_code=400, detail="Insufficient credits")
    
    # Update bid status
    await db.bids.update_one({"id": bid_id}, {"$set": {"status": BidStatus.accepted}})
    
    # Reject other bids
    await db.bids.update_many(
        {"project_id": project_id, "id": {"$ne": bid_id}},
        {"$set": {"status": BidStatus.rejected}}
    )
    
    # Update project
    await db.bidding_projects.update_one(
        {"id": project_id},
        {"$set": {
            "status": ProjectStatus.in_progress,
            "winning_bid_id": bid_id,
            "selected_creator_id": bid["creator_id"]
        }}
    )
    
    # Create order
    order = EnhancedOrder(
        client_id=current_user.id,
        creator_id=bid["creator_id"],
        service_id=project_id,  # Use project as service reference
        package_type="custom",
        total_amount=bid["amount"],
        requirements=bid["proposal"],
        milestones=[],  # Convert bid milestones if needed
        delivery_date=datetime.utcnow() + timedelta(days=bid["delivery_time"]),
        escrow_amount=bid["amount"]
    )
    
    await db.orders.insert_one(order.dict())
    
    # Create escrow transaction
    escrow = EscrowTransaction(
        order_id=order.id,
        project_id=project_id,
        payer_id=current_user.id,
        payee_id=bid["creator_id"],
        amount=bid["amount"],
        escrow_fee=int(bid["amount"] * 0.05)  # 5% escrow fee
    )
    await db.escrow_transactions.insert_one(escrow.dict())
    
    # Deduct credits from client
    await db.users.update_one(
        {"id": current_user.id},
        {"$inc": {"subscription.credits_remaining": -bid["amount"]}}
    )
    
    return {
        "success": True,
        "order_id": order.id,
        "message": f"Bid accepted! Order created with {bid['delivery_time']} days delivery."
    }

@api_router.get("/projects/{project_id}/analytics")
async def get_bid_analytics(project_id: str):
    """Get bidding analytics for a project"""
    db = get_database()
    
    # Get all bids for the project
    bids = await db.bids.find({"project_id": project_id, "status": BidStatus.active}).to_list(length=None)
    
    if not bids:
        return BidAnalytics(
            project_id=project_id,
            average_bid=0,
            lowest_bid=0,
            highest_bid=0,
            total_bids=0,
            estimated_completion_time=0,
            success_prediction=0.5,
            recommended_budget={"min": 0, "max": 0, "optimal": 0},
            trending_skills=[],
            similar_projects_avg_price=0
        )
    
    amounts = [bid["amount"] for bid in bids]
    delivery_times = [bid["delivery_time"] for bid in bids]
    
    analytics = BidAnalytics(
        project_id=project_id,
        average_bid=sum(amounts) / len(amounts),
        lowest_bid=min(amounts),
        highest_bid=max(amounts),
        total_bids=len(bids),
        estimated_completion_time=sum(delivery_times) / len(delivery_times),
        success_prediction=0.8 if len(bids) >= 3 else 0.6,  # More bids = higher success probability
        recommended_budget={
            "min": min(amounts),
            "max": max(amounts),
            "optimal": int(sum(amounts) / len(amounts))
        },
        trending_skills=["gaming", "blender", "minecraft"],  # Could be calculated from recent bids
        similar_projects_avg_price=int(sum(amounts) / len(amounts))
    )
    
    return analytics

# ============= AUTO-BIDDING SYSTEM =============

@api_router.post("/creators/auto-bid-settings", response_model=AutoBidSettings)
async def create_auto_bid_settings(
    settings_data: dict,
    current_user: UserProfile = Depends(get_current_user_session)
):
    """Configure auto-bidding settings"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    if current_user.role == UserRole.viewer:
        raise HTTPException(status_code=403, detail="Only creators can use auto-bidding")
    
    db = get_database()
    
    # Check if settings already exist
    existing = await db.auto_bid_settings.find_one({"creator_id": current_user.id})
    if existing:
        raise HTTPException(status_code=400, detail="Auto-bid settings already exist. Use PUT to update.")
    
    settings = AutoBidSettings(
        creator_id=current_user.id,
        **settings_data
    )
    
    await db.auto_bid_settings.insert_one(settings.dict())
    return settings

@api_router.get("/creators/auto-bid-settings", response_model=AutoBidSettings)
async def get_auto_bid_settings(
    current_user: UserProfile = Depends(get_current_user_session)
):
    """Get creator's auto-bidding settings"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    db = get_database()
    
    settings = await db.auto_bid_settings.find_one({"creator_id": current_user.id})
    if not settings:
        raise HTTPException(status_code=404, detail="Auto-bid settings not found")
    
    return AutoBidSettings(**settings)

@api_router.post("/ai/generate-offer")
async def generate_ai_offer(
    project_brief: str,
    target_creator_id: Optional[str] = None,
    current_user: UserProfile = Depends(get_current_user_session)
):
    """Generate AI-powered custom offer"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Check if user has credits for AI features
    if current_user.subscription.credits_remaining < 5:
        raise HTTPException(status_code=400, detail="Insufficient credits for AI features (5 credits required)")
    
    db = get_database()
    
    try:
        # Use Gemini to generate custom offer
        model = genai.GenerativeModel('gemini-2.0-flash-exp')
        
        ai_prompt = f"""
        Create a detailed project offer for this brief: "{project_brief}"
        
        Analyze the requirements and provide:
        1. Suggested price range (in credits, where 1 credit = $0.10)
        2. Estimated delivery time (in days)
        3. Custom proposal text (professional and engaging)
        4. Success probability (0.0 to 1.0)
        5. Recommended milestones breakdown
        
        Consider:
        - Project complexity
        - Market rates for similar work
        - Time requirements
        - Skills needed
        
        Return JSON format with: suggested_price, delivery_days, proposal, success_probability, milestones
        """
        
        response = model.generate_content(ai_prompt)
        
        # Parse AI response
        import json
        try:
            ai_analysis = json.loads(response.text)
            
            # Create AI-generated offer
            offer = AIGeneratedOffer(
                creator_id=target_creator_id or "ai_system",
                client_id=current_user.id,
                project_brief=project_brief,
                offer_type=AIOfferType.custom_proposal,
                suggested_price=ai_analysis.get("suggested_price", 250),
                estimated_delivery=ai_analysis.get("delivery_days", 7),
                confidence_score=0.85,
                reasoning="AI analysis based on project complexity and market rates",
                custom_proposal=ai_analysis.get("proposal", "Custom AI-generated proposal"),
                success_probability=ai_analysis.get("success_probability", 0.8),
                expires_at=datetime.utcnow() + timedelta(hours=24)
            )
            
            await db.ai_offers.insert_one(offer.dict())
            
            # Deduct credits for AI service
            await db.users.update_one(
                {"id": current_user.id},
                {"$inc": {"subscription.credits_remaining": -5}}
            )
            
            return {
                "success": True,
                "offer": offer.dict(),
                "ai_analysis": ai_analysis
            }
            
        except json.JSONDecodeError:
            # Fallback response
            return {
                "success": True,
                "offer": {
                    "suggested_price": 250,
                    "delivery_days": 7,
                    "proposal": "AI-powered custom proposal based on your project requirements.",
                    "success_probability": 0.75
                }
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")

# Include all routes
app.include_router(api_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)