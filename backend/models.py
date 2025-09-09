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

# Milestone Payment System
class MilestoneStatus(str, Enum):
    pending = "pending"
    approved = "approved"
    paid = "paid"
    disputed = "disputed"

class Milestone(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    amount: int  # in credits
    due_date: Optional[datetime] = None
    status: MilestoneStatus = MilestoneStatus.pending
    delivered_files: List[str] = []
    approval_notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class EnhancedOrder(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_id: str
    creator_id: str
    service_id: str
    package_type: str  # basic, standard, premium
    total_amount: int  # in credits
    requirements: str
    status: OrderStatus = OrderStatus.pending
    milestones: List[Milestone] = []
    has_milestones: bool = False
    delivery_date: Optional[datetime] = None
    delivered_files: List[str] = []
    messages: List[str] = []
    revisions_used: int = 0
    auto_accept_days: int = 3  # Auto-accept delivery after X days
    escrow_amount: int = 0  # Amount held in escrow
    refund_requested: bool = False
    refund_reason: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class OrderMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    order_id: str
    sender_id: str
    message: str
    files: List[str] = []
    is_system_message: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Token Economy & Withdrawal System
class TokenTransaction(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    transaction_type: str  # purchase, withdrawal, earning, spending, refund
    amount: int  # in credits/tokens
    usd_amount: Optional[float] = None  # For purchases/withdrawals
    description: str
    stripe_payment_intent_id: Optional[str] = None
    status: str = "completed"  # pending, completed, failed
    created_at: datetime = Field(default_factory=datetime.utcnow)

class WithdrawalRequest(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    amount_credits: int
    amount_usd: float
    payment_method: str  # stripe, paypal, bank_transfer
    payment_details: Dict[str, str] = {}  # account details
    status: str = "pending"  # pending, approved, processed, rejected
    admin_notes: Optional[str] = None
    processed_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Advanced Search & Matching
class CreatorSearchFilter(BaseModel):
    skills: Optional[List[str]] = None
    categories: Optional[List[str]] = None
    min_rating: Optional[float] = None
    max_price: Optional[int] = None
    delivery_time: Optional[int] = None  # max days
    languages: Optional[List[str]] = None
    location: Optional[str] = None
    level: Optional[str] = None  # beginner, intermediate, expert
    verified_only: bool = False

# Rights Trading System
class RightsListing(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    content_id: str
    seller_id: str
    rights_offered: List[ContentRights]
    price: int  # in credits
    terms_and_conditions: str
    buyer_id: Optional[str] = None
    status: str = "active"  # active, sold, cancelled
    created_at: datetime = Field(default_factory=datetime.utcnow)
    sold_at: Optional[datetime] = None

# Progress Tracking System
class ProjectProgress(BaseModel):
    order_id: str
    progress_percentage: int = 0
    current_milestone: Optional[str] = None
    estimated_completion: Optional[datetime] = None
    updates: List[Dict[str, Any]] = []  # Progress updates
    files_delivered: List[str] = []
    last_updated: datetime = Field(default_factory=datetime.utcnow)

# Team & Collaboration System
class Team(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: Optional[str] = None
    owner_id: str
    members: List[str] = []  # User IDs
    shared_credits: int = 0
    projects: List[str] = []  # Order IDs
    created_at: datetime = Field(default_factory=datetime.utcnow)

# ============= SMART BIDDING SYSTEM =============

class ProjectType(str, Enum):
    fixed_price = "fixed_price"
    bidding = "bidding"
    negotiable = "negotiable"

class BidStatus(str, Enum):
    active = "active"
    accepted = "accepted"
    rejected = "rejected"
    withdrawn = "withdrawn"
    expired = "expired"

class ProjectStatus(str, Enum):
    open = "open"
    in_progress = "in_progress" 
    completed = "completed"
    cancelled = "cancelled"
    disputed = "disputed"

class BiddingProject(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_id: str
    title: str
    description: str
    category: str
    required_skills: List[str] = []
    budget_min: Optional[int] = None  # Minimum budget in credits
    budget_max: Optional[int] = None  # Maximum budget in credits
    deadline: datetime
    project_type: ProjectType = ProjectType.bidding
    status: ProjectStatus = ProjectStatus.open
    requirements: Dict[str, Any] = {}  # Detailed requirements
    attachments: List[str] = []
    tags: List[str] = []
    featured: bool = False
    auto_accept_lowest: bool = False  # Auto-accept lowest qualifying bid
    bid_deadline: datetime
    min_creator_level: int = 1
    min_rating: float = 0.0
    max_bids: int = 50
    current_bid_count: int = 0
    winning_bid_id: Optional[str] = None
    selected_creator_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class Bid(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    project_id: str
    creator_id: str
    amount: int  # Bid amount in credits
    delivery_time: int  # Days to complete
    proposal: str  # Creator's proposal/pitch
    milestones: List[Dict[str, Any]] = []  # Optional milestone breakdown
    status: BidStatus = BidStatus.active
    is_auto_bid: bool = False
    extras: List[Dict[str, Any]] = []  # Additional services offered
    questions: List[str] = []  # Questions for the client
    portfolio_items: List[str] = []  # Relevant portfolio pieces
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: Optional[datetime] = None

class BidAnalytics(BaseModel):
    project_id: str
    average_bid: float
    lowest_bid: int
    highest_bid: int
    total_bids: int
    estimated_completion_time: float  # Average delivery time
    success_prediction: float  # AI prediction of project success
    recommended_budget: Dict[str, int]  # min, max, optimal
    trending_skills: List[str]
    similar_projects_avg_price: int

# Auto-Bidding System
class AutoBidSettings(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    creator_id: str
    enabled: bool = True
    categories: List[str] = []  # Categories to auto-bid on
    min_budget: int = 50  # Minimum project budget
    max_budget: int = 5000  # Maximum project budget
    bid_strategy: str = "competitive"  # competitive, premium, budget
    markup_percentage: float = 10.0  # % above estimated cost
    max_concurrent_projects: int = 5
    auto_proposal_template: str = ""
    keywords_to_include: List[str] = []
    keywords_to_exclude: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# ============= SKILL TREE SYSTEM =============

class SkillCategory(str, Enum):
    gaming = "gaming"
    design = "design"
    development = "development"
    content = "content"
    animation = "animation"
    audio = "audio"
    marketing = "marketing"

class SkillNode(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    category: SkillCategory
    level: int = 1
    max_level: int = 50
    xp_required: int = 100
    prerequisites: List[str] = []  # Other skill IDs required
    unlock_cost: int = 0  # Credits to unlock
    benefits: Dict[str, Any] = {}  # Bonuses unlocked
    icon: str = "⚡"
    rarity: str = "common"  # common, rare, epic, legendary

class UserSkillProgress(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    skill_id: str
    current_level: int = 0
    current_xp: int = 0
    unlocked_at: Optional[datetime] = None
    mastered_at: Optional[datetime] = None
    total_xp_earned: int = 0
    
class SkillTree(BaseModel):
    user_id: str
    skills: List[UserSkillProgress] = []
    total_skill_points: int = 0
    mastered_skills_count: int = 0
    current_title: str = "Novice Creator"
    available_skill_points: int = 0

# ============= CREATOR GUILDS SYSTEM =============

class GuildRole(str, Enum):
    leader = "leader"
    officer = "officer"
    member = "member"
    recruit = "recruit"

class Guild(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    logo_url: Optional[str] = None
    leader_id: str
    specializations: List[str] = []  # Main skill areas
    member_count: int = 1
    max_members: int = 50
    level: int = 1
    xp: int = 0
    reputation: float = 0.0
    total_earnings: int = 0
    completed_projects: int = 0
    guild_credits: int = 0  # Shared guild treasury
    is_recruiting: bool = True
    requirements: Dict[str, Any] = {}  # Join requirements
    benefits: Dict[str, Any] = {}  # Member benefits
    created_at: datetime = Field(default_factory=datetime.utcnow)

class GuildMembership(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    guild_id: str
    user_id: str
    role: GuildRole = GuildRole.recruit
    contribution_points: int = 0
    joined_at: datetime = Field(default_factory=datetime.utcnow)
    promoted_at: Optional[datetime] = None

class GuildProject(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    guild_id: str
    project_id: str  # Reference to BiddingProject
    assigned_members: List[str] = []  # User IDs
    revenue_share: Dict[str, float] = {}  # Member ID -> percentage
    status: str = "active"
    created_at: datetime = Field(default_factory=datetime.utcnow)

# ============= ADVANCED SECURITY SYSTEM =============

class SecurityLevel(str, Enum):
    basic = "basic"
    verified = "verified"
    premium = "premium"
    enterprise = "enterprise"

class EscrowTransaction(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    order_id: str
    project_id: Optional[str] = None
    payer_id: str
    payee_id: str
    amount: int  # Amount in escrow
    escrow_fee: int  # Platform fee for escrow service
    status: str = "held"  # held, released, disputed, refunded
    milestone_id: Optional[str] = None
    release_conditions: Dict[str, Any] = {}
    dispute_reason: Optional[str] = None
    resolution_notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    released_at: Optional[datetime] = None

class FraudAlert(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    alert_type: str  # suspicious_activity, fake_reviews, payment_fraud
    severity: str = "medium"  # low, medium, high, critical
    description: str
    evidence: Dict[str, Any] = {}
    status: str = "open"  # open, investigating, resolved, false_positive
    investigated_by: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    resolved_at: Optional[datetime] = None

class UserVerification(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    verification_type: str  # identity, skills, phone, email, business
    status: str = "pending"  # pending, approved, rejected, expired
    documents: List[str] = []
    verification_data: Dict[str, Any] = {}
    verified_by: Optional[str] = None
    expires_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    verified_at: Optional[datetime] = None

# ============= AI OFFER SYSTEM =============

class AIOfferType(str, Enum):
    instant_match = "instant_match"
    custom_proposal = "custom_proposal"
    bulk_discount = "bulk_discount"
    rush_delivery = "rush_delivery"

class AIGeneratedOffer(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    creator_id: str
    client_id: str
    project_brief: str
    offer_type: AIOfferType
    suggested_price: int
    estimated_delivery: int  # days
    confidence_score: float  # AI confidence in the match
    reasoning: str  # Why AI suggested this offer
    custom_proposal: str  # AI-generated proposal
    success_probability: float  # Predicted success rate
    expires_in_hours: int = 24
    status: str = "pending"  # pending, accepted, rejected, expired
    created_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: datetime

class SmartMatchingCriteria(BaseModel):
    client_preferences: Dict[str, Any] = {}
    creator_capabilities: Dict[str, Any] = {}
    project_complexity: str = "medium"
    budget_flexibility: float = 0.2  # 20% flexibility
    timeline_flexibility: float = 0.1  # 10% flexibility
    quality_priority: float = 0.8  # 80% weight on quality
    price_priority: float = 0.6  # 60% weight on price
    speed_priority: float = 0.4  # 40% weight on speed

# Platform Analytics & Live Data Tracking
class PlatformAnalytics(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    date: datetime = Field(default_factory=datetime.utcnow)
    total_users: int = 0
    active_users_today: int = 0
    total_orders: int = 0
    orders_today: int = 0
    total_revenue: float = 0.0  # in USD
    revenue_today: float = 0.0
    total_downloads: int = 0
    downloads_today: int = 0
    total_services: int = 0
    active_creators: int = 0
    platform_fees_collected: float = 0.0

class UserActivity(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    activity_type: str  # login, order_created, content_downloaded, etc.
    details: Dict[str, Any] = {}
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None

# Gamification System
class Achievement(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    icon: str
    criteria: Dict[str, Any]  # Requirements to unlock
    reward_credits: int = 0
    category: str  # sales, quality, engagement, etc.

class UserAchievement(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    achievement_id: str
    unlocked_at: datetime = Field(default_factory=datetime.utcnow)
    notified: bool = False

class UserLevel(BaseModel):
    level: int = 1
    xp: int = 0
    xp_to_next: int = 100
    title: str = "Beginner Creator"
    badges: List[str] = []
    tier: str = "Bronze"  # Bronze, Silver, Gold, Platinum, Diamond

# Enhanced User Stats
class UserStats(BaseModel):
    total_orders_completed: int = 0
    total_revenue_earned: float = 0.0
    total_content_downloads: int = 0
    average_rating: float = 0.0
    response_time_hours: float = 24.0
    completion_rate: float = 100.0
    repeat_client_rate: float = 0.0
    streak_days: int = 0
    last_active: datetime = Field(default_factory=datetime.utcnow)

# Live Chat System
class ChatMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    conversation_id: str
    sender_id: str
    recipient_id: str
    message: str
    message_type: str = "text"  # text, image, file, system
    attachments: List[str] = []
    read: bool = False
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class Conversation(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    participants: List[str]  # User IDs
    order_id: Optional[str] = None
    status: str = "active"  # active, archived, blocked
    last_message_at: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Featured Listings System
class FeaturedListing(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    service_id: str
    creator_id: str
    featured_type: str  # homepage, category, search_top
    duration_days: int
    cost_credits: int
    start_date: datetime = Field(default_factory=datetime.utcnow)
    end_date: datetime
    status: str = "active"  # active, expired, cancelled

# Platform Configuration
class PlatformConfig(BaseModel):
    platform_fee_percentage: float = 5.0  # 5% platform fee
    featured_listing_costs: Dict[str, int] = {
        "homepage": 100,  # credits
        "category": 50,
        "search_top": 25
    }
    creator_tier_benefits: Dict[str, Dict[str, Any]] = {
        "Bronze": {"max_services": 5, "featured_discount": 0},
        "Silver": {"max_services": 15, "featured_discount": 10},
        "Gold": {"max_services": 50, "featured_discount": 20},
        "Platinum": {"max_services": -1, "featured_discount": 30},
        "Diamond": {"max_services": -1, "featured_discount": 50}
    }

# Review System Enhancement
class ReviewResponse(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    review_id: str
    responder_id: str  # Creator responding to review
    response: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Email Notification System
class EmailNotification(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    email: str
    subject: str
    template: str
    variables: Dict[str, Any] = {}
    status: str = "pending"  # pending, sent, failed
    sent_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)