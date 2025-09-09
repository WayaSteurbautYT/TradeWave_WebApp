from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from typing import Optional
import os
from dotenv import load_dotenv

load_dotenv()

class Database:
    client: Optional[AsyncIOMotorClient] = None
    database: Optional[AsyncIOMotorDatabase] = None

db = Database()

async def connect_to_mongo():
    """Create database connection"""
    mongo_url = os.environ.get('MONGO_URL')
    if not mongo_url:
        raise ValueError("MONGO_URL environment variable is required")
    
    db_name = os.environ.get('DB_NAME', 'wayacreate')
    
    try:
        db.client = AsyncIOMotorClient(mongo_url, serverSelectionTimeoutMS=5000)
        db.database = db.client[db_name]
        
        # Test the connection
        await db.client.admin.command('ping')
        
        # Create indexes for better performance
        await create_indexes()
        
        print(f"✅ Connected to MongoDB: {db_name}")
    except Exception as e:
        print(f"❌ Failed to connect to MongoDB: {e}")
        raise

async def close_mongo_connection():
    """Close database connection"""
    if db.client:
        db.client.close()
        print("Disconnected from MongoDB")

async def create_indexes():
    """Create database indexes for better performance"""
    if db.database is None:
        return
    
    # User indexes
    await db.database.users.create_index("email", unique=True)
    # Remove unique constraint on username since it's optional
    # await db.database.users.create_index("username", unique=True, sparse=True)
    await db.database.users.create_index([("role", 1), ("is_active", 1)])
    
    # Content indexes
    await db.database.content.create_index([("creator_id", 1), ("status", 1)])
    await db.database.content.create_index([("category", 1), ("status", 1)])
    await db.database.content.create_index([("tags", 1), ("status", 1)])
    await db.database.content.create_index([("created_at", -1), ("status", 1)])
    await db.database.content.create_index([("rating", -1), ("status", 1)])
    
    # Service indexes
    await db.database.services.create_index([("creator_id", 1), ("status", 1)])
    await db.database.services.create_index([("category", 1), ("status", 1)])
    await db.database.services.create_index([("tags", 1), ("status", 1)])
    await db.database.services.create_index([("rating", -1), ("status", 1)])
    
    # Transaction indexes
    await db.database.transactions.create_index([("from_user_id", 1), ("transaction_type", 1)])
    await db.database.transactions.create_index([("to_user_id", 1), ("transaction_type", 1)])
    await db.database.transactions.create_index([("created_at", -1), ("status", 1)])
    
    # Order indexes
    await db.database.orders.create_index([("client_id", 1), ("status", 1)])
    await db.database.orders.create_index([("creator_id", 1), ("status", 1)])
    await db.database.orders.create_index([("created_at", -1), ("status", 1)])
    
    # Message indexes
    await db.database.messages.create_index([("conversation_id", 1), ("created_at", -1)])
    await db.database.messages.create_index([("sender_id", 1), ("created_at", -1)])
    await db.database.messages.create_index([("recipient_id", 1), ("read_at", 1)])
    
    # Community post indexes
    await db.database.community_posts.create_index([("author_id", 1), ("created_at", -1)])
    await db.database.community_posts.create_index([("tags", 1), ("created_at", -1)])
    await db.database.community_posts.create_index([("likes_count", -1), ("created_at", -1)])
    
    print("Database indexes created successfully")

def get_database() -> AsyncIOMotorDatabase:
    """Get database instance"""
    return db.database