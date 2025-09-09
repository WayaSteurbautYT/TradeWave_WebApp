from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum
import uuid

# User Models
class UserRole(str, Enum):
    viewer = "viewer"
    creator = "creator"
    business = "business"
    admin = "admin"

class SubscriptionPlan(str, Enum):
    free = "free"
    creator = "creator"
    pro = "pro"
    business = "business"

class SocialMediaAccount(BaseModel):
    platform: str
    username: str
    url: str
    followers: Optional[int] = 0
    verified: bool = False
    access_token: Optional[str] = None  # For API access

class UserSubscription(BaseModel):
    plan: SubscriptionPlan = SubscriptionPlan.free
    monthly_credits: int = 0
    credits_used: int = 0
    credits_remaining: int = 0
    renewal_date: Optional[datetime] = None
    stripe_subscription_id: Optional[str] = None

class UserLevel(BaseModel):
    level: int = 1
    xp: int = 0
    xp_to_next: int = 100
    title: str = "Beginner Creator"
    badges: List[str] = []

class UserProfile(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    username: Optional[str] = None
    display_name: str
    avatar_url: Optional[str] = None
    cover_image_url: Optional[str] = None
    bio: Optional[str] = None
    role: UserRole = UserRole.viewer
    is_verified: bool = False
    subscription: UserSubscription = Field(default_factory=UserSubscription)
    level: UserLevel = Field(default_factory=UserLevel)
    social_accounts: List[SocialMediaAccount] = []
    skills: List[str] = []
    languages: List[str] = []
    location: Optional[str] = None
    website: Optional[str] = None
    rating: float = 0.0
    review_count: int = 0
    total_earned: int = 0
    total_spent: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True
    # Google/Social Auth
    google_id: Optional[str] = None
    session_token: Optional[str] = None

class UserCreate(BaseModel):
    email: str
    display_name: str
    role: UserRole = UserRole.viewer
    avatar_url: Optional[str] = None
    google_id: Optional[str] = None

class UserUpdate(BaseModel):
    display_name: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    cover_image_url: Optional[str] = None
    skills: Optional[List[str]] = None
    languages: Optional[List[str]] = None
    location: Optional[str] = None
    website: Optional[str] = None

# Content Models
class ContentType(str, Enum):
    video = "video"
    short = "short"
    livestream = "livestream"
    image = "image"
    audio = "audio"
    document = "document"
    course = "course"
    model_3d = "3d_model"
    template = "template"
    code = "code"

class ContentRights(str, Enum):
    view = "view"
    download = "download"
    modify = "modify"
    commercial = "commercial"
    resell = "resell"

class ContentStatus(str, Enum):
    draft = "draft"
    published = "published"
    archived = "archived"
    deleted = "deleted"

class ImportedContent(BaseModel):
    original_platform: str
    original_id: str
    original_url: str
    imported_at: datetime = Field(default_factory=datetime.utcnow)

class Content(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    creator_id: str
    title: str
    description: Optional[str] = None
    content_type: ContentType
    file_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    preview_url: Optional[str] = None
    price: int = 0  # in credits/tokens
    download_price: int = 0  # credits for project files
    tags: List[str] = []
    category: str
    rights: List[ContentRights] = []
    status: ContentStatus = ContentStatus.draft
    views_count: int = 0
    likes_count: int = 0
    download_count: int = 0
    duration: Optional[int] = None  # in seconds
    file_size: Optional[int] = None  # in bytes
    rating: float = 0.0
    review_count: int = 0
    tutorial_included: bool = True  # Required for WayaCreate
    tutorial_url: Optional[str] = None
    project_files: List[str] = []  # URLs to downloadable files
    imported_from: Optional[ImportedContent] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ContentCreate(BaseModel):
    title: str
    description: Optional[str] = None
    content_type: ContentType
    file_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    price: int = 0
    download_price: int = 0
    tags: List[str] = []
    category: str
    rights: List[ContentRights] = []
    tutorial_url: Optional[str] = None
    project_files: List[str] = []

# Service Models
class ServicePackage(BaseModel):
    name: str
    description: str
    price: int  # in credits
    delivery_time: int  # in days
    revisions: int
    features: List[str] = []

class ServiceStatus(str, Enum):
    active = "active"
    paused = "paused"
    archived = "archived"

class Service(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    creator_id: str
    title: str
    description: str
    category: str
    subcategory: Optional[str] = None
    tags: List[str] = []
    packages: Dict[str, ServicePackage]  # basic, standard, premium
    gallery_images: List[str] = []
    status: ServiceStatus = ServiceStatus.active
    rating: float = 0.0
    review_count: int = 0
    orders_completed: int = 0
    tutorial_included: bool = True  # Required for WayaCreate
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ServiceCreate(BaseModel):
    title: str
    description: str
    category: str
    subcategory: Optional[str] = None
    tags: List[str] = []
    packages: Dict[str, ServicePackage]
    gallery_images: List[str] = []

# Order Models
class OrderStatus(str, Enum):
    pending = "pending"
    accepted = "accepted"
    in_progress = "in_progress"
    delivered = "delivered"
    revision_requested = "revision_requested"
    completed = "completed"
    cancelled = "cancelled"
    disputed = "disputed"

class Order(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_id: str
    creator_id: str
    service_id: str
    package_type: str  # basic, standard, premium
    amount: int  # in credits
    requirements: str
    status: OrderStatus = OrderStatus.pending
    delivery_date: Optional[datetime] = None
    delivered_files: List[str] = []
    messages: List[str] = []
    revisions_used: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class OrderCreate(BaseModel):
    service_id: str
    package_type: str
    requirements: str

# Rating System
class RatingType(str, Enum):
    content = "content"
    service = "service"
    user = "user"

class Rating(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    reviewer_id: str
    reviewee_id: str
    content_id: Optional[str] = None
    service_id: Optional[str] = None
    order_id: Optional[str] = None
    rating_type: RatingType
    rating: int = Field(ge=1, le=5)
    comment: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

# AI Generation Models
class AIRequestType(str, Enum):
    text_generation = "text_generation"
    code_generation = "code_generation"
    image_generation = "image_generation"
    content_enhancement = "content_enhancement"
    tutorial_generation = "tutorial_generation"

class AIRequest(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    request_type: AIRequestType
    prompt: str
    parameters: Dict[str, Any] = {}
    result_url: Optional[str] = None
    result_text: Optional[str] = None
    cost_credits: int = 0
    status: str = "pending"
    created_at: datetime = Field(default_factory=datetime.utcnow)

class AIRequestCreate(BaseModel):
    request_type: AIRequestType
    prompt: str
    parameters: Dict[str, Any] = {}

# Session Management
class UserSession(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    session_token: str
    expires_at: datetime
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Subscription Plans
class SubscriptionPlanDetails(BaseModel):
    id: str
    name: str
    price_monthly: float
    monthly_credits: int
    features: List[str]
    max_uploads: int
    ai_requests_included: int
    priority_support: bool = False

# YouTube Import Models
class YouTubeImportRequest(BaseModel):
    channel_url: str
    import_types: List[str] = ["videos", "shorts", "playlists"]
    max_items: int = 50