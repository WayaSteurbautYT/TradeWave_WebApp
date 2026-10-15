export type UserRole = "viewer" | "creator" | "business" | "admin"
export type SubscriptionPlan = "free" | "creator" | "pro" | "business"

export interface UserSubscription {
  plan: SubscriptionPlan
  monthly_credits: number
  credits_used: number
  credits_remaining: number
  renewal_date?: string
}

export interface UserLevel {
  level: number
  xp: number
  xp_to_next: number
  title: string
  badges: string[]
  tier: "Bronze" | "Silver" | "Gold" | "Platinum" | "Diamond"
}

export interface SocialMediaAccount {
  platform: string
  username: string
  url: string
  followers?: number
  verified?: boolean
}

export interface UserProfile {
  id: string
  email: string
  username?: string
  display_name: string
  avatar_url?: string
  cover_image_url?: string
  bio?: string
  role: UserRole
  is_verified: boolean
  subscription: UserSubscription
  level: UserLevel
  social_accounts: SocialMediaAccount[]
  skills: string[]
  languages: string[]
  location?: string
  website?: string
  rating: number
  review_count: number
  total_earned: number
  total_spent: number
  token_balance: number
  created_at: string
}

export type ContentType = "video" | "short" | "livestream" | "image" | "audio" | "document" | "course" | "3d_model" | "template" | "code"
export type ContentRights = "view" | "download" | "modify" | "commercial" | "resell"

export interface ContentItem {
  id: string
  creator_id: string
  creator_name: string
  creator_avatar?: string
  title: string
  description: string
  content_type: ContentType
  category: string
  price: number
  download_price: number
  rating: number
  review_count: number
  views_count: number
  likes_count: number
  download_count: number
  tags: string[]
  rights: ContentRights[]
  tutorial_included: boolean
  tutorial_url?: string
  file_url?: string
  thumbnail_url?: string
  duration?: number
  created_at: string
}

export interface ServicePackage {
  name: string
  description: string
  price: number
  delivery_time: number
  revisions: number
  features: string[]
}

export interface Service {
  id: string
  creator_id: string
  creator_name: string
  creator_avatar?: string
  creator_rating: number
  creator_reviews: number
  title: string
  description: string
  category: string
  subcategory?: string
  tags: string[]
  packages: {
    basic: ServicePackage
    standard: ServicePackage
    premium: ServicePackage
  }
  gallery_images: string[]
  status: "active" | "paused" | "archived"
  rating: number
  review_count: number
  orders_completed: number
  tutorial_included: boolean
  created_at: string
}

export type OrderStatus = "pending" | "accepted" | "in_progress" | "delivered" | "revision_requested" | "completed" | "cancelled"

export interface Milestone {
  id: string
  title: string
  description: string
  amount: number
  status: "pending" | "approved" | "paid" | "disputed"
  delivered_files?: string[]
}

export interface Order {
  id: string
  client_id: string
  client_name: string
  creator_id: string
  creator_name: string
  service_id: string
  service_title: string
  package_type: "basic" | "standard" | "premium"
  amount: number
  status: OrderStatus
  requirements: string
  milestones: Milestone[]
  created_at: string
  delivery_date: string
  delivered_files: string[]
}

export interface Bid {
  id: string
  project_id: string
  creator_id: string
  creator_name: string
  creator_avatar?: string
  creator_rating: number
  creator_level: number
  amount: number
  delivery_time: number
  proposal: string
  status: "active" | "accepted" | "rejected" | "withdrawn"
  created_at: string
}

export interface BiddingProject {
  id: string
  client_id: string
  client_name: string
  title: string
  description: string
  category: string
  required_skills: string[]
  budget_min: number
  budget_max: number
  deadline: string
  status: "open" | "in_progress" | "completed" | "cancelled"
  bids: Bid[]
  winning_bid_id?: string
  created_at: string
}

export interface GuildMember {
  user_id: string
  display_name: string
  avatar_url?: string
  role: "leader" | "officer" | "member" | "recruit"
  contribution_points: number
  joined_at: string
}

export interface Guild {
  id: string
  name: string
  description: string
  logo_url: string
  leader_id: string
  specializations: string[]
  member_count: number
  max_members: number
  level: number
  xp: number
  reputation: number
  total_earnings: number
  guild_credits: number
  is_recruiting: boolean
  members: GuildMember[]
  created_at: string
}

export interface TokenPackage {
  id: string
  name: string
  credits: number
  bonus_credits: number
  price_usd: number
  popular?: boolean
}

export interface TokenTransaction {
  id: string
  user_id: string
  transaction_type: "purchase" | "withdrawal" | "earning" | "spending" | "escrow" | "refund"
  amount: number
  usd_amount?: number
  description: string
  status: "completed" | "pending" | "failed"
  created_at: string
}

export interface WithdrawalRequest {
  id: string
  user_id: string
  amount_credits: number
  amount_usd: number
  payment_method: string
  account_email: string
  status: "pending" | "approved" | "processed"
  created_at: string
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  reward_credits: number
  category: string
  unlocked: boolean
  progress: number
  max_progress: number
}

export interface SkillNode {
  id: string
  name: string
  description: string
  category: "gaming" | "design" | "development" | "content" | "audio"
  level: number
  max_level: number
  xp_required: number
  current_xp: number
  unlocked: boolean
  icon: string
}

export interface ChatMessage {
  id: string
  conversation_id: string
  sender_id: string
  sender_name: string
  recipient_id: string
  message: string
  timestamp: string
  read: boolean
}

export interface Conversation {
  id: string
  participants: {
    id: string
    display_name: string
    avatar_url?: string
  }[]
  last_message: string
  last_message_at: string
  unread_count: number
}

export interface SuperChatTip {
  id: string
  user_id: string
  user_name: string
  amount: number
  message: string
  timestamp: string
}

export interface LiveStreamSession {
  id: string
  title: string
  description: string
  category: string
  creator_id: string
  creator_name: string
  creator_avatar?: string
  is_live: boolean
  viewers: number
  started_at: string
  stream_key: string
  rtmp_url: string
  webrtc_url: string
  tips: SuperChatTip[]
}

