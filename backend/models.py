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

class SocialMediaAccount(BaseModel):
    platform: str
    username: str
    url: str
    followers: Optional[int] = 0
    verified: bool = False

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
    token_balance: int = 0
    total_earned: int = 0
    total_spent: int = 0
    social_accounts: List[SocialMediaAccount] = []
    skills: List[str] = []
    languages: List[str] = []
    location: Optional[str] = None
    website: Optional[str] = None
    rating: float = 0.0
    review_count: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True

class UserCreate(BaseModel):
    email: str
    display_name: str
    role: UserRole = UserRole.viewer
    avatar_url: Optional[str] = None

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
    image = "image"
    audio = "audio"
    document = "document"
    course = "course"
    model_3d = "3d_model"
    template = "template"

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

class Content(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    creator_id: str
    title: str
    description: Optional[str] = None
    content_type: ContentType
    file_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    preview_url: Optional[str] = None
    price: int = 0  # in tokens
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
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ContentCreate(BaseModel):
    title: str
    description: Optional[str] = None
    content_type: ContentType
    file_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    price: int = 0
    tags: List[str] = []
    category: str
    rights: List[ContentRights] = []

# Service Models
class ServicePackage(BaseModel):
    name: str
    description: str
    price: int  # in tokens
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
    amount: int  # in tokens
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

# Transaction Models
class TransactionType(str, Enum):
    token_purchase = "token_purchase"
    content_purchase = "content_purchase"
    service_payment = "service_payment"
    creator_earning = "creator_earning"
    platform_fee = "platform_fee"
    buyer_cashback = "buyer_cashback"
    withdrawal = "withdrawal"
    refund = "refund"

class TransactionStatus(str, Enum):
    pending = "pending"
    completed = "completed"
    failed = "failed"
    cancelled = "cancelled"
    refunded = "refunded"

class Transaction(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    from_user_id: Optional[str] = None
    to_user_id: Optional[str] = None
    content_id: Optional[str] = None
    service_id: Optional[str] = None
    order_id: Optional[str] = None
    amount: int
    transaction_type: TransactionType
    status: TransactionStatus = TransactionStatus.pending
    stripe_payment_intent_id: Optional[str] = None
    description: Optional[str] = None
    metadata: Dict[str, Any] = {}
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# Token Package Models
class TokenPackage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    tokens: int
    price_usd: float
    bonus_tokens: int = 0
    is_popular: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Message Models
class MessageType(str, Enum):
    text = "text"
    image = "image"
    file = "file"
    offer = "offer"
    system = "system"

class Message(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    conversation_id: str
    sender_id: str
    recipient_id: str
    content: str
    message_type: MessageType = MessageType.text
    attachments: List[str] = []
    read_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Review Models
class Review(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    reviewer_id: str
    reviewee_id: str
    content_id: Optional[str] = None
    service_id: Optional[str] = None
    order_id: Optional[str] = None
    rating: int = Field(ge=1, le=5)
    comment: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

# AI Feature Models
class AIRequest(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    request_type: str  # content_generation, image_enhancement, etc.
    prompt: str
    parameters: Dict[str, Any] = {}
    result_url: Optional[str] = None
    cost_tokens: int = 0
    status: str = "pending"
    created_at: datetime = Field(default_factory=datetime.utcnow)

class AIRequestCreate(BaseModel):
    request_type: str
    prompt: str
    parameters: Dict[str, Any] = {}

# Community Models
class PostType(str, Enum):
    text = "text"
    image = "image"
    video = "video"
    link = "link"
    poll = "poll"

class CommunityPost(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    author_id: str
    title: Optional[str] = None
    content: str
    post_type: PostType = PostType.text
    media_urls: List[str] = []
    tags: List[str] = []
    likes_count: int = 0
    comments_count: int = 0
    shares_count: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class PostCreate(BaseModel):
    title: Optional[str] = None
    content: str
    post_type: PostType = PostType.text
    media_urls: List[str] = []
    tags: List[str] = []