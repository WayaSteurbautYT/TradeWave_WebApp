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

# ============= RATING SYSTEM =============

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