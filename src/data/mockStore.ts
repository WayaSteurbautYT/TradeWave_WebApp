import { 
  UserProfile, 
  Service, 
  ContentItem, 
  BiddingProject, 
  Guild, 
  Order, 
  TokenTransaction, 
  TokenPackage, 
  Achievement, 
  SkillNode, 
  Conversation, 
  ChatMessage,
  LiveStreamSession,
  SuperChatTip
} from '../types'

const STORAGE_KEYS = {
  USER: 'wayacreate_user',
  USERS_LIST: 'wayacreate_users_list',
  SERVICES: 'wayacreate_services',
  CONTENT: 'wayacreate_content',
  PROJECTS: 'wayacreate_bidding_projects',
  GUILDS: 'wayacreate_guilds',
  ORDERS: 'wayacreate_orders',
  TRANSACTIONS: 'wayacreate_transactions',
  ACHIEVEMENTS: 'wayacreate_achievements',
  SKILLS: 'wayacreate_skills',
  CONVERSATIONS: 'wayacreate_conversations',
  MESSAGES: 'wayacreate_messages',
}

// Default current user
export const defaultUser: UserProfile = {
  id: 'usr_waya_001',
  email: 'creator@wayacreate.com',
  username: 'wayasteurbaut',
  display_name: 'Waya Steurbaut',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  cover_image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
  bio: 'Lead YouTube Creator, Game Developer & 3D Designer. Creating high quality game assets, tutorials, and shaders for everyone.',
  role: 'creator',
  is_verified: true,
  subscription: {
    plan: 'pro',
    monthly_credits: 2500,
    credits_used: 420,
    credits_remaining: 2080,
    renewal_date: '2026-11-01',
  },
  level: {
    level: 18,
    xp: 4850,
    xp_to_next: 6000,
    title: 'Master Game Architect',
    badges: ['Top Creator', 'Tutorial Master', 'Guild Leader', 'Verified Pro'],
    tier: 'Gold',
  },
  social_accounts: [
    { platform: 'YouTube', username: 'WayaCreate', url: 'https://youtube.com', followers: 125000, verified: true },
    { platform: 'Twitter', username: '@wayacreate', url: 'https://twitter.com', followers: 42000, verified: true },
    { platform: 'GitHub', username: 'WayaSteurbautYT', url: 'https://github.com', followers: 18500, verified: true },
  ],
  skills: ['Unreal Engine 5', 'Blender 3D', 'Unity C#', 'Shader Graph', 'Level Design', 'Sound Effects'],
  languages: ['English', 'Dutch', 'French'],
  location: 'Ghent, Belgium',
  website: 'https://wayacreate.com',
  rating: 4.96,
  review_count: 248,
  total_earned: 14850,
  total_spent: 3200,
  token_balance: 2080,
  created_at: '2024-01-15T00:00:00.000Z',
}

// Initial Services
const initialServices: Service[] = [
  {
    id: 'srv_1',
    creator_id: 'usr_waya_001',
    creator_name: 'Waya Steurbaut',
    creator_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    creator_rating: 4.98,
    creator_reviews: 184,
    title: 'Custom AAA Game Asset Modeling & PBR Texturing with Tutorial',
    description: 'I will design, sculpt, and optimize low-poly or high-poly game assets in Blender with full PBR textures (4K). Each delivery includes a step-by-step breakdown video tutorial showing how it was built!',
    category: 'gaming',
    subcategory: '3D Modeling',
    tags: ['Blender', 'Unreal Engine', '3D Asset', 'PBR Textures', 'GameDev'],
    packages: {
      basic: {
        name: 'Single Prop',
        description: '1 Game-ready prop (under 5k polys), 2K PBR textures, source .blend file + 15 min workflow breakdown video.',
        price: 250,
        delivery_time: 2,
        revisions: 2,
        features: ['3D Model (FBX/OBJ)', 'PBR Texture maps', 'Commercial Rights', 'Full Tutorial Video'],
      },
      standard: {
        name: 'Hero Prop / Weapon',
        description: 'Complex hero asset or weapon (under 20k polys), 4K textures, LODs, collision mesh + 30 min tutorial video.',
        price: 550,
        delivery_time: 4,
        revisions: 4,
        features: ['Hero Asset with LODs', '4K Textures', 'Unity/Unreal Ready', 'Source Files', 'Detailed Video Guide'],
      },
      premium: {
        name: 'Full Modular Kit',
        description: '5-piece modular environmental set with master materials, collisions, and a complete 1-hour workshop video.',
        price: 1200,
        delivery_time: 7,
        revisions: 6,
        features: ['5 Modular Assets', '4K Textures & Master Material', 'Level Scene Demo', 'Full Masterclass Video'],
      },
    },
    gallery_images: [
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80',
    ],
    status: 'active',
    rating: 4.98,
    review_count: 184,
    orders_completed: 192,
    tutorial_included: true,
    created_at: '2025-01-10T00:00:00.000Z',
  },
  {
    id: 'srv_2',
    creator_id: 'usr_sarah_002',
    creator_name: 'Sarah Chen',
    creator_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    creator_rating: 4.95,
    creator_reviews: 132,
    title: 'Cyberpunk & Sci-Fi UI/UX Design System for Web & Mobile Games',
    description: 'Transform your game or web application with high-impact futuristic interface designs. Includes Figma design system, exported icons, animations specs, and complete tutorial for your developers.',
    category: 'design',
    subcategory: 'UI/UX Design',
    tags: ['Figma', 'UI/UX', 'Sci-Fi', 'Gaming UI', 'Design System'],
    packages: {
      basic: {
        name: 'HUD Essentials',
        description: 'Game HUD, health bars, radar, and buttons in Figma + Figma layout tutorial.',
        price: 320,
        delivery_time: 3,
        revisions: 3,
        features: ['HUD Components', 'SVG Export', 'Design Tokens', 'Figma Tutorial'],
      },
      standard: {
        name: 'Complete Game UI',
        description: 'Up to 5 screens (Inventory, Menu, Settings, HUD, Dialogue) with interactive prototypes.',
        price: 750,
        delivery_time: 5,
        revisions: 5,
        features: ['5 Screens', 'Component Library', 'Interactive Prototype', 'Full Design Spec Video'],
      },
      premium: {
        name: 'Full Studio Design Suite',
        description: '12+ screens, responsive breakpoints, sound effects mapping, and implementation walkthrough.',
        price: 1600,
        delivery_time: 10,
        revisions: 8,
        features: ['12+ Screens', 'Animation Guidelines', 'React/Tailwind Code Snippets', 'Live Implementation Session'],
      },
    },
    gallery_images: [
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
    ],
    status: 'active',
    rating: 4.95,
    review_count: 132,
    orders_completed: 140,
    tutorial_included: true,
    created_at: '2025-02-01T00:00:00.000Z',
  },
  {
    id: 'srv_3',
    creator_id: 'usr_marcus_003',
    creator_name: 'Marcus Vance',
    creator_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    creator_rating: 4.92,
    creator_reviews: 89,
    title: 'Custom Multiplayer Gameplay Mechanics & Netcode (C# Unity / UE5)',
    description: 'Expert game engineering for smooth rollback/client prediction netcode, inventory systems, or combat mechanics. Full source code and architectural walkthrough recording included.',
    category: 'development',
    subcategory: 'Game Programming',
    tags: ['Unity', 'Unreal', 'C#', 'Multiplayer', 'Netcode'],
    packages: {
      basic: {
        name: 'Core Mechanic',
        description: '1 isolated gameplay system (e.g. wall run, dash, inventory) with clean modular code.',
        price: 450,
        delivery_time: 4,
        revisions: 2,
        features: ['Documented Source Code', 'Sample Scene', 'Bug Fix Warranty', '15 min Code Tour'],
      },
      standard: {
        name: 'Combat & Damage System',
        description: 'Combo system with hitboxes, animation synchronization, state machines, and sound triggers.',
        price: 950,
        delivery_time: 7,
        revisions: 4,
        features: ['Hitbox Detection', 'State Machine', 'Full Customization Options', 'Code Architecture Video'],
      },
      premium: {
        name: 'Multiplayer Lobby & Sync',
        description: 'Room matchmaking, player synchronization, authoritative server architecture.',
        price: 2200,
        delivery_time: 14,
        revisions: 6,
        features: ['Netcode Setup', 'Player Replication', 'Matchmaking Loop', '45 min Masterclass Video'],
      },
    },
    gallery_images: [
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80',
    ],
    status: 'active',
    rating: 4.92,
    review_count: 89,
    orders_completed: 94,
    tutorial_included: true,
    created_at: '2025-02-15T00:00:00.000Z',
  },
  {
    id: 'srv_4',
    creator_id: 'usr_elena_004',
    creator_name: 'Elena Rostova',
    creator_avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    creator_rating: 4.97,
    creator_reviews: 210,
    title: 'Cinematic Game Trailer Editing, Sound Design & Motion Graphics',
    description: 'High-energy game reveal trailers, Steam store trailers, and YouTube shorts. Professional sound FX layers, dynamic transitions, 3D title animations, and tutorial on pacing.',
    category: 'content',
    subcategory: 'Video Editing',
    tags: ['Trailer', 'DaVinci Resolve', 'After Effects', 'Sound Design', 'Steam'],
    packages: {
      basic: {
        name: '30s Teaser Trailer',
        description: 'Fast-paced teaser for TikTok/Shorts and Twitter with sound mixing and subtitle presets.',
        price: 280,
        delivery_time: 2,
        revisions: 3,
        features: ['1080p Export', 'Sound Effects', 'Color Grading', 'Editing Process Video'],
      },
      standard: {
        name: '60s Official Gameplay Trailer',
        description: 'Steam-ready trailer with sync cuts, 3D text titles, custom music editing, and sound design.',
        price: 650,
        delivery_time: 4,
        revisions: 4,
        features: ['4K Render', 'Cinematic Sound Mix', 'Title Cards', 'Pacing Breakdown Video'],
      },
      premium: {
        name: 'Launch Campaign Bundle',
        description: 'Main 90s trailer + 3 vertical shorts cuts + Steam capsule animated GIFs.',
        price: 1350,
        delivery_time: 8,
        revisions: 6,
        features: ['Full Trailer Suite', 'Vertical Cutdowns', 'Social Assets', 'Complete Video Guide'],
      },
    },
    gallery_images: [
      'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&auto=format&fit=crop&q=80',
    ],
    status: 'active',
    rating: 4.97,
    review_count: 210,
    orders_completed: 215,
    tutorial_included: true,
    created_at: '2025-01-20T00:00:00.000Z',
  },
]

// Initial Content Items (Marketplace digital products)
const initialContent: ContentItem[] = [
  {
    id: 'cnt_1',
    creator_id: 'usr_waya_001',
    creator_name: 'Waya Steurbaut',
    creator_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    title: 'Stylized Cyberpunk Neon Alley Asset Pack (50+ Models & Shaders)',
    description: 'Complete stylized cyberpunk environment kit with neon signs, modular buildings, cables, holographic billboards, and rain shaders for Unreal Engine 5 & Blender. Includes project files and full 45m tutorial.',
    content_type: '3d_model',
    category: 'gaming',
    price: 150,
    download_price: 150,
    rating: 4.96,
    review_count: 124,
    views_count: 3420,
    likes_count: 890,
    download_count: 420,
    tags: ['Cyberpunk', 'Blender', 'Unreal Engine 5', 'Shaders', 'Modular'],
    rights: ['view', 'download', 'modify', 'commercial'],
    tutorial_included: true,
    tutorial_url: 'https://youtube.com',
    duration: 2700,
    created_at: '2025-01-12T00:00:00.000Z',
  },
  {
    id: 'cnt_2',
    creator_id: 'usr_sarah_002',
    creator_name: 'Sarah Chen',
    creator_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    title: 'NeonPulse UI Design System & Component Library (Figma + React Code)',
    description: 'Modern glassmorphic and neon cyber theme with over 200 UI components, interactive states, dark/light variations, and ready-to-use React Tailwind code.',
    content_type: 'code',
    category: 'design',
    price: 120,
    download_price: 120,
    rating: 4.91,
    review_count: 88,
    views_count: 2150,
    likes_count: 610,
    download_count: 310,
    tags: ['Figma', 'React', 'Tailwind CSS', 'UI Kit', 'Components'],
    rights: ['view', 'download', 'modify', 'commercial'],
    tutorial_included: true,
    tutorial_url: 'https://youtube.com',
    duration: 1800,
    created_at: '2025-02-04T00:00:00.000Z',
  },
  {
    id: 'cnt_3',
    creator_id: 'usr_marcus_003',
    creator_name: 'Marcus Vance',
    creator_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    title: 'Advanced Roguelike Dungeon Generator & AI Behaviour Trees for Unity',
    description: 'Procedural room generation, pathfinding mesh generation, dynamic enemy spawning with behavior tree AI. Highly modular and commented C# codebase.',
    content_type: 'template',
    category: 'development',
    price: 190,
    download_price: 190,
    rating: 4.94,
    review_count: 67,
    views_count: 1840,
    likes_count: 530,
    download_count: 245,
    tags: ['Unity', 'C#', 'Procedural', 'Roguelike', 'AI'],
    rights: ['view', 'download', 'modify', 'commercial'],
    tutorial_included: true,
    tutorial_url: 'https://youtube.com',
    duration: 3200,
    created_at: '2025-02-18T00:00:00.000Z',
  },
  {
    id: 'cnt_4',
    creator_id: 'usr_elena_004',
    creator_name: 'Elena Rostova',
    creator_avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    title: 'Future Bass & Synthwave Audio Pack for Game Developers (40 Tracks + SFX)',
    description: 'Royalty-free high octane electronic tracks, loopable combat music, menu themes, ambient exploration cues, and 120 custom UI/gameplay sound effects.',
    content_type: 'audio',
    category: 'audio',
    price: 90,
    download_price: 90,
    rating: 4.88,
    review_count: 95,
    views_count: 2980,
    likes_count: 740,
    download_count: 520,
    tags: ['Audio', 'Synthwave', 'Music', 'Sound FX', 'Game Music'],
    rights: ['view', 'download', 'commercial'],
    tutorial_included: true,
    tutorial_url: 'https://youtube.com',
    duration: 1200,
    created_at: '2025-01-25T00:00:00.000Z',
  },
]

// Initial Bidding Projects
const initialBiddingProjects: BiddingProject[] = [
  {
    id: 'bid_prj_1',
    client_id: 'usr_client_001',
    client_name: 'Apex Interactive Studios',
    title: 'Custom Low-Poly Sci-Fi Vehicle Pack (10 Unique Hovercrafts) with Rigging',
    description: 'We are seeking an experienced 3D artist to model, UV, texture, and rig 10 distinct futuristic hovercraft vehicles for our upcoming Steam indie game. Needs to be optimized for mobile & PC.',
    category: 'gaming',
    required_skills: ['Blender', 'Rigging', 'PBR Texturing', 'Low-Poly', 'FBX'],
    budget_min: 800,
    budget_max: 1800,
    deadline: '2026-11-20',
    status: 'open',
    bids: [
      {
        id: 'bid_101',
        project_id: 'bid_prj_1',
        creator_id: 'usr_waya_001',
        creator_name: 'Waya Steurbaut',
        creator_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        creator_rating: 4.98,
        creator_level: 18,
        amount: 1250,
        delivery_time: 10,
        proposal: 'Hey Apex Studios! I have built over 150 vehicle models for Unreal Engine and Unity. I will deliver 10 clean, modular hovercrafts with 2K PBR materials, custom thruster glow shaders, bone rigging for flaps/thrusters, and a full video tutorial on integration.',
        status: 'active',
        created_at: '2025-03-01T10:00:00.000Z',
      },
      {
        id: 'bid_102',
        project_id: 'bid_prj_1',
        creator_id: 'usr_sarah_002',
        creator_name: 'Sarah Chen',
        creator_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        creator_rating: 4.95,
        creator_level: 14,
        amount: 1400,
        delivery_time: 12,
        proposal: 'Specializing in hard-surface sci-fi aesthetics. I can provide 10 concept silhouettes first, then full 3D models with customizable color masks so players can recolor vehicles in-game.',
        status: 'active',
        created_at: '2025-03-01T14:30:00.000Z',
      },
    ],
    created_at: '2025-03-01T08:00:00.000Z',
  },
  {
    id: 'bid_prj_2',
    client_id: 'usr_client_002',
    client_name: 'MetaNova Games',
    title: 'Procedural Inventory & Crafting System in Unity C#',
    description: 'Looking for a programmer to implement a grid-based inventory with weight, item stacking, crafting recipes, and serialization for save/load state. Must include tutorial video for our junior programmers.',
    category: 'development',
    required_skills: ['Unity', 'C#', 'UI Toolkit', 'ScriptableObjects', 'Architecture'],
    budget_min: 500,
    budget_max: 1200,
    deadline: '2026-11-15',
    status: 'open',
    bids: [
      {
        id: 'bid_201',
        project_id: 'bid_prj_2',
        creator_id: 'usr_marcus_003',
        creator_name: 'Marcus Vance',
        creator_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        creator_rating: 4.92,
        creator_level: 16,
        amount: 780,
        delivery_time: 6,
        proposal: 'I built multiple inventory systems using modern ScriptableObjects architecture with full undo/redo and JSON save support. Ready to start immediately with video walkthrough.',
        status: 'active',
        created_at: '2025-03-02T09:15:00.000Z',
      },
    ],
    created_at: '2025-03-02T07:00:00.000Z',
  },
]

// Initial Guilds
const initialGuilds: Guild[] = [
  {
    id: 'gld_1',
    name: 'Alpha Creators Guild',
    description: 'The elite guild founded by Waya Steurbaut for top-tier 3D modelers, game developers, and YouTube educators pooling talent on commercial projects.',
    logo_url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=150&auto=format&fit=crop&q=80',
    leader_id: 'usr_waya_001',
    specializations: ['3D Modeling', 'Unreal Engine 5', 'YouTube Tutorials', 'Game Architecture'],
    member_count: 24,
    max_members: 50,
    level: 12,
    xp: 34200,
    reputation: 4.97,
    total_earnings: 89400,
    guild_credits: 6450,
    is_recruiting: true,
    members: [
      {
        user_id: 'usr_waya_001',
        display_name: 'Waya Steurbaut',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        role: 'leader',
        contribution_points: 12800,
        joined_at: '2024-01-15T00:00:00.000Z',
      },
      {
        user_id: 'usr_sarah_002',
        display_name: 'Sarah Chen',
        avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        role: 'officer',
        contribution_points: 7400,
        joined_at: '2024-02-01T00:00:00.000Z',
      },
      {
        user_id: 'usr_marcus_003',
        display_name: 'Marcus Vance',
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        role: 'officer',
        contribution_points: 6200,
        joined_at: '2024-02-10T00:00:00.000Z',
      },
    ],
    created_at: '2024-01-15T00:00:00.000Z',
  },
  {
    id: 'gld_2',
    name: 'Pixel & Shader Syndicate',
    description: 'Devoted to cutting-edge HLSL, GLSL, Unity Shader Graph, and Unreal Niagara VFX. We take on AAA visual effects and shader contracts.',
    logo_url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=150&auto=format&fit=crop&q=80',
    leader_id: 'usr_sarah_002',
    specializations: ['Shaders', 'Niagara VFX', 'Technical Art', 'Optimization'],
    member_count: 18,
    max_members: 30,
    level: 9,
    xp: 22100,
    reputation: 4.93,
    total_earnings: 52300,
    guild_credits: 3890,
    is_recruiting: true,
    members: [],
    created_at: '2024-03-01T00:00:00.000Z',
  },
  {
    id: 'gld_3',
    name: 'Indie Game Audio Collective',
    description: 'Composers, sound designers, foley artists, and audio programmers crafting unforgettable soundscapes for indie titles worldwide.',
    logo_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150&auto=format&fit=crop&q=80',
    leader_id: 'usr_elena_004',
    specializations: ['Audio Composition', 'FMOD', 'Wwise', 'Voice Acting'],
    member_count: 15,
    max_members: 25,
    level: 7,
    xp: 18400,
    reputation: 4.91,
    total_earnings: 41200,
    guild_credits: 2750,
    is_recruiting: true,
    members: [],
    created_at: '2024-04-10T00:00:00.000Z',
  },
]

// Token Packages
export const tokenPackages: TokenPackage[] = [
  { id: 'pkg_free', name: 'Free Community Explorer', credits: 50, bonus_credits: 0, price_usd: 0 },
  { id: 'pkg_starter', name: 'Starter Spark', credits: 250, bonus_credits: 0, price_usd: 9.99 },
  { id: 'pkg_creator', name: 'Creator Bundle', credits: 750, bonus_credits: 100, price_usd: 24.99, popular: true },
  { id: 'pkg_pro', name: 'Studio Pro', credits: 2000, bonus_credits: 400, price_usd: 59.99 },
  { id: 'pkg_enterprise', name: 'Guild Master', credits: 5000, bonus_credits: 1500, price_usd: 129.99 },
]

// Initial Transactions
const initialTransactions: TokenTransaction[] = [
  {
    id: 'tx_1',
    user_id: 'usr_waya_001',
    transaction_type: 'earning',
    amount: 550,
    description: 'Order completed: Custom AAA Game Asset Modeling',
    status: 'completed',
    created_at: '2025-03-01T15:20:00.000Z',
  },
  {
    id: 'tx_2',
    user_id: 'usr_waya_001',
    transaction_type: 'earning',
    amount: 150,
    description: 'Digital Item Sold: Stylized Cyberpunk Neon Alley Pack',
    status: 'completed',
    created_at: '2025-03-02T11:45:00.000Z',
  },
  {
    id: 'tx_3',
    user_id: 'usr_waya_001',
    transaction_type: 'withdrawal',
    amount: 500,
    usd_amount: 50.0,
    description: 'Withdrawal to Stripe payout account',
    status: 'completed',
    created_at: '2025-02-28T09:00:00.000Z',
  },
  {
    id: 'tx_4',
    user_id: 'usr_waya_001',
    transaction_type: 'purchase',
    amount: 1000,
    usd_amount: 34.99,
    description: 'Purchased Creator Bundle token package',
    status: 'completed',
    created_at: '2025-02-20T18:10:00.000Z',
  },
]

// Initial Achievements
const initialAchievements: Achievement[] = [
  { id: 'ach_1', name: 'First Creation', description: 'Publish your first service or digital asset to WayaCreate', icon: '🚀', reward_credits: 50, category: 'creation', unlocked: true, progress: 1, max_progress: 1 },
  { id: 'ach_2', name: 'Tutorial Master', description: 'Include complete instructional video guides in 5 listings', icon: '🎓', reward_credits: 150, category: 'tutorials', unlocked: true, progress: 5, max_progress: 5 },
  { id: 'ach_3', name: 'Guild Pioneer', description: 'Found or reach Officer rank in a Creator Guild', icon: '🛡️', reward_credits: 200, category: 'community', unlocked: true, progress: 1, max_progress: 1 },
  { id: 'ach_4', name: 'Five Star Legend', description: 'Maintain a 4.9+ rating over at least 50 client reviews', icon: '⭐', reward_credits: 300, category: 'reputation', unlocked: true, progress: 50, max_progress: 50 },
  { id: 'ach_5', name: 'High Roller Trader', description: 'Transact over 10,000 credits in the WayaCreate marketplace', icon: '💰', reward_credits: 500, category: 'economy', unlocked: true, progress: 14850, max_progress: 10000 },
  { id: 'ach_6', name: 'AI Alchemist', description: 'Generate 20 assets or code scripts with AI Studio', icon: '⚡', reward_credits: 100, category: 'ai', unlocked: false, progress: 12, max_progress: 20 },
]

// Initial Skill Tree
const initialSkills: SkillNode[] = [
  { id: 'skl_1', name: '3D Sculpting & Topology', description: 'Mastery in low-poly and high-poly edge loops and retopology.', category: 'gaming', level: 5, max_level: 5, xp_required: 1000, current_xp: 1000, unlocked: true, icon: '🗿' },
  { id: 'skl_2', name: 'PBR Shading & Texturing', description: 'Physically based rendering, roughness, metallic, and normal maps.', category: 'gaming', level: 4, max_level: 5, xp_required: 1200, current_xp: 950, unlocked: true, icon: '🎨' },
  { id: 'skl_3', name: 'Rigging & Animation', description: 'Inverse kinematics, skeletal rigs, and state machine blending.', category: 'gaming', level: 3, max_level: 5, xp_required: 1500, current_xp: 600, unlocked: true, icon: '🦴' },
  { id: 'skl_4', name: 'Game Engine Integration', description: 'Deploying modular packages directly into UE5 & Unity with collisions.', category: 'development', level: 5, max_level: 5, xp_required: 2000, current_xp: 2000, unlocked: true, icon: '🕹️' },
  { id: 'skl_5', name: 'Educational Storytelling', description: 'Creating engaging YouTube format tutorials with clear explanations.', category: 'content', level: 4, max_level: 5, xp_required: 1000, current_xp: 820, unlocked: true, icon: '📹' },
]

// Initial Orders
const initialOrders: Order[] = [
  {
    id: 'ord_101',
    client_id: 'usr_client_001',
    client_name: 'Apex Interactive Studios',
    creator_id: 'usr_waya_001',
    creator_name: 'Waya Steurbaut',
    service_id: 'srv_1',
    service_title: 'Custom AAA Game Asset Modeling & PBR Texturing',
    package_type: 'standard',
    amount: 550,
    status: 'in_progress',
    requirements: 'Sci-fi energy sniper rifle with glowing energy core and cooling vents. 4K textures, under 18k triangles. Deliver with setup video.',
    milestones: [
      { id: 'm1', title: 'High-Poly Concept & Blockout', description: 'Initial proportions and silhouette signoff', amount: 200, status: 'approved' },
      { id: 'm2', title: 'Low-Poly, UVs & PBR Texturing', description: 'Final meshes and substance texture maps', amount: 200, status: 'pending' },
      { id: 'm3', title: 'Rigging & Walkthrough Video', description: 'Bones for reload animation + tutorial', amount: 150, status: 'pending' },
    ],
    created_at: '2025-03-01T14:00:00.000Z',
    delivery_date: '2026-11-10',
    delivered_files: ['https://example.com/blockout_v1.fbx'],
  },
  {
    id: 'ord_102',
    client_id: 'usr_waya_001',
    client_name: 'Waya Steurbaut',
    creator_id: 'usr_sarah_002',
    creator_name: 'Sarah Chen',
    service_id: 'srv_2',
    service_title: 'Cyberpunk & Sci-Fi UI/UX Design System',
    package_type: 'basic',
    amount: 320,
    status: 'completed',
    requirements: 'Neon HUD health bar and inventory widget for upcoming YouTube tutorial game project.',
    milestones: [
      { id: 'm4', title: 'Figma Components & Tokens', description: 'Design assets', amount: 320, status: 'paid' },
    ],
    created_at: '2025-02-25T11:00:00.000Z',
    delivery_date: '2025-02-28',
    delivered_files: ['https://figma.com/file/hud_components_v2'],
  },
]

// Initial Conversations
const initialConversations: Conversation[] = [
  {
    id: 'conv_1',
    participants: [
      { id: 'usr_waya_001', display_name: 'Waya Steurbaut' },
      { id: 'usr_client_001', display_name: 'Apex Interactive', avatar_url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80' }
    ],
    last_message: 'Milestone 1 looks fantastic! Proceed with the substance texturing pass.',
    last_message_at: '10 mins ago',
    unread_count: 1,
  },
  {
    id: 'conv_2',
    participants: [
      { id: 'usr_waya_001', display_name: 'Waya Steurbaut' },
      { id: 'usr_sarah_002', display_name: 'Sarah Chen', avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80' }
    ],
    last_message: 'Thanks for collaborating on the Alpha Guild shader toolkit!',
    last_message_at: '2 hours ago',
    unread_count: 0,
  },
]

// Mock Store Helper Functions
function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (e) {
    console.error(`Error reading ${key} from localStorage:`, e)
    return defaultValue
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    window.dispatchEvent(new Event('wayacreate_storage_change'))
  } catch (e) {
    console.error(`Error saving ${key} to localStorage:`, e)
  }
}

export const MockStore = {
  // User
  getUser(): UserProfile {
    return getFromStorage<UserProfile>(STORAGE_KEYS.USER, defaultUser)
  },
  saveUser(user: UserProfile): void {
    saveToStorage(STORAGE_KEYS.USER, user)
  },
  updateUser(updates: Partial<UserProfile>): UserProfile {
    const current = this.getUser()
    const updated = { ...current, ...updates }
    this.saveUser(updated)
    return updated
  },

  // Services
  getServices(): Service[] {
    return getFromStorage<Service[]>(STORAGE_KEYS.SERVICES, initialServices)
  },
  saveServices(services: Service[]): void {
    saveToStorage(STORAGE_KEYS.SERVICES, services)
  },
  addService(service: Omit<Service, 'id' | 'created_at'>): Service {
    const current = this.getServices()
    const newService: Service = {
      ...service,
      id: `srv_${Date.now()}`,
      created_at: new Date().toISOString(),
    }
    this.saveServices([newService, ...current])
    return newService
  },

  // Content
  getContent(): ContentItem[] {
    return getFromStorage<ContentItem[]>(STORAGE_KEYS.CONTENT, initialContent)
  },
  saveContent(content: ContentItem[]): void {
    saveToStorage(STORAGE_KEYS.CONTENT, content)
  },
  addContent(item: Omit<ContentItem, 'id' | 'created_at'>): ContentItem {
    const current = this.getContent()
    const newItem: ContentItem = {
      ...item,
      id: `cnt_${Date.now()}`,
      created_at: new Date().toISOString(),
    }
    this.saveContent([newItem, ...current])
    return newItem
  },

  // Bidding Projects
  getProjects(): BiddingProject[] {
    return getFromStorage<BiddingProject[]>(STORAGE_KEYS.PROJECTS, initialBiddingProjects)
  },
  saveProjects(projects: BiddingProject[]): void {
    saveToStorage(STORAGE_KEYS.PROJECTS, projects)
  },
  addProject(project: Omit<BiddingProject, 'id' | 'created_at' | 'bids'>): BiddingProject {
    const current = this.getProjects()
    const newProject: BiddingProject = {
      ...project,
      id: `bid_prj_${Date.now()}`,
      bids: [],
      created_at: new Date().toISOString(),
    }
    this.saveProjects([newProject, ...current])
    return newProject
  },
  addBidToProject(projectId: string, bid: { amount: number; delivery_time: number; proposal: string }): boolean {
    const projects = this.getProjects()
    const user = this.getUser()
    const prj = projects.find(p => p.id === projectId)
    if (!prj) return false

    const newBid = {
      id: `bid_${Date.now()}`,
      project_id: projectId,
      creator_id: user.id,
      creator_name: user.display_name,
      creator_avatar: user.avatar_url,
      creator_rating: user.rating,
      creator_level: user.level.level,
      amount: bid.amount,
      delivery_time: bid.delivery_time,
      proposal: bid.proposal,
      status: 'active' as const,
      created_at: new Date().toISOString(),
    }
    prj.bids.unshift(newBid)
    this.saveProjects(projects)
    return true
  },

  // Guilds
  getGuilds(): Guild[] {
    return getFromStorage<Guild[]>(STORAGE_KEYS.GUILDS, initialGuilds)
  },
  saveGuilds(guilds: Guild[]): void {
    saveToStorage(STORAGE_KEYS.GUILDS, guilds)
  },
  joinGuild(guildId: string): boolean {
    const guilds = this.getGuilds()
    const user = this.getUser()
    const guild = guilds.find(g => g.id === guildId)
    if (!guild) return false

    if (guild.members.some(m => m.user_id === user.id)) return true // already member
    guild.members.push({
      user_id: user.id,
      display_name: user.display_name,
      avatar_url: user.avatar_url,
      role: 'member',
      contribution_points: 100,
      joined_at: new Date().toISOString(),
    })
    guild.member_count += 1
    this.saveGuilds(guilds)
    return true
  },

  // Orders
  getOrders(): Order[] {
    return getFromStorage<Order[]>(STORAGE_KEYS.ORDERS, initialOrders)
  },
  saveOrders(orders: Order[]): void {
    saveToStorage(STORAGE_KEYS.ORDERS, orders)
  },
  createOrder(service: Service, packageType: 'basic' | 'standard' | 'premium', requirements: string): Order {
    const pkg = service.packages[packageType]
    const user = this.getUser()
    const newOrder: Order = {
      id: `ord_${Date.now()}`,
      client_id: user.id,
      client_name: user.display_name,
      creator_id: service.creator_id,
      creator_name: service.creator_name,
      service_id: service.id,
      service_title: service.title,
      package_type: packageType,
      amount: pkg.price,
      status: 'pending',
      requirements,
      milestones: [
        {
          id: `m_${Date.now()}`,
          title: `${pkg.name} Delivery`,
          description: pkg.description,
          amount: pkg.price,
          status: 'pending',
        }
      ],
      created_at: new Date().toISOString(),
      delivery_date: new Date(Date.now() + pkg.delivery_time * 86400000).toISOString().split('T')[0],
      delivered_files: [],
    }

    const orders = this.getOrders()
    this.saveOrders([newOrder, ...orders])

    // deduct credits
    this.deductCredits(pkg.price, `Escrow for order: ${service.title}`)
    return newOrder
  },

  // Tokens & Credits
  getTransactions(): TokenTransaction[] {
    return getFromStorage<TokenTransaction[]>(STORAGE_KEYS.TRANSACTIONS, initialTransactions)
  },
  saveTransactions(txs: TokenTransaction[]): void {
    saveToStorage(STORAGE_KEYS.TRANSACTIONS, txs)
  },
  addCredits(amount: number, description: string, usdAmount?: number): void {
    const user = this.getUser()
    user.token_balance += amount
    user.subscription.credits_remaining += amount
    user.total_earned += amount
    this.saveUser(user)

    const txs = this.getTransactions()
    txs.unshift({
      id: `tx_${Date.now()}`,
      user_id: user.id,
      transaction_type: 'purchase',
      amount,
      usd_amount: usdAmount,
      description,
      status: 'completed',
      created_at: new Date().toISOString(),
    })
    this.saveTransactions(txs)
  },
  deductCredits(amount: number, description: string): boolean {
    const user = this.getUser()
    if (user.token_balance < amount) return false

    user.token_balance -= amount
    user.subscription.credits_remaining -= amount
    user.total_spent += amount
    this.saveUser(user)

    const txs = this.getTransactions()
    txs.unshift({
      id: `tx_${Date.now()}`,
      user_id: user.id,
      transaction_type: 'spending',
      amount,
      description,
      status: 'completed',
      created_at: new Date().toISOString(),
    })
    this.saveTransactions(txs)
    return true
  },
  requestWithdrawal(credits: number, usdAmount: number, method: string, email: string): boolean {
    const user = this.getUser()
    if (user.token_balance < credits) return false

    user.token_balance -= credits
    this.saveUser(user)

    const txs = this.getTransactions()
    txs.unshift({
      id: `tx_${Date.now()}`,
      user_id: user.id,
      transaction_type: 'withdrawal',
      amount: credits,
      usd_amount: usdAmount,
      description: `Withdrawal via ${method} (${email})`,
      status: 'pending',
      created_at: new Date().toISOString(),
    })
    this.saveTransactions(txs)
    return true
  },

  // Achievements & Skills
  getAchievements(): Achievement[] {
    return getFromStorage<Achievement[]>(STORAGE_KEYS.ACHIEVEMENTS, initialAchievements)
  },
  getSkills(): SkillNode[] {
    return getFromStorage<SkillNode[]>(STORAGE_KEYS.SKILLS, initialSkills)
  },
  levelUpSkill(skillId: string): boolean {
    const skills = this.getSkills()
    const user = this.getUser()
    const skl = skills.find(s => s.id === skillId)
    if (!skl || skl.level >= skl.max_level) return false

    skl.level += 1
    skl.current_xp = 0
    skl.xp_required = Math.round(skl.xp_required * 1.5)
    saveToStorage(STORAGE_KEYS.SKILLS, skills)

    user.level.xp += 150
    if (user.level.xp >= user.level.xp_to_next) {
      user.level.level += 1
      user.level.xp_to_next = Math.round(user.level.xp_to_next * 1.4)
    }
    this.saveUser(user)
    return true
  },

  // Conversations
  getConversations(): Conversation[] {
    return getFromStorage<Conversation[]>(STORAGE_KEYS.CONVERSATIONS, initialConversations)
  },
  sendMessage(convId: string, message: string): void {
    const convs = this.getConversations()
    const conv = convs.find(c => c.id === convId)
    if (conv) {
      conv.last_message = message
      conv.last_message_at = 'Just now'
      saveToStorage(STORAGE_KEYS.CONVERSATIONS, convs)
    }
  },

  // AI Studio Mock Generator
  generateAI(prompt: string, type: 'text' | 'code' | 'image' | 'tutorial'): { title: string; content: string; language?: string } {
    if (type === 'code') {
      return {
        title: `Generated Code for "${prompt.slice(0, 30)}..."`,
        language: 'csharp',
        content: `// WayaCreate AI Generated Module for: ${prompt}
using UnityEngine;
using System.Collections;
using System.Collections.Generic;

[RequireComponent(typeof(Rigidbody))]
public class ProceduralMotionController : MonoBehaviour 
{
    [Header("Movement Settings")]
    [SerializeField] private float moveSpeed = 12.5f;
    [SerializeField] private float acceleration = 25.0f;
    [SerializeField] private float turnSmoothing = 0.15f;
    
    private Rigidbody rb;
    private Vector3 currentVelocity;
    
    void Awake() 
    {
        rb = GetComponent<Rigidbody>();
        rb.freezeRotation = true;
    }

    public void Move(Vector2 inputDirection) 
    {
        Vector3 targetDirection = new Vector3(inputDirection.x, 0, inputDirection.y).normalized;
        Vector3 targetVelocity = targetDirection * moveSpeed;
        
        rb.linearVelocity = Vector3.SmoothDamp(rb.linearVelocity, targetVelocity, ref currentVelocity, 1f / acceleration);
        
        if (targetDirection.sqrMagnitude > 0.001f) 
        {
            float targetAngle = Mathf.Atan2(targetDirection.x, targetDirection.z) * Mathf.Rad2Deg;
            transform.rotation = Quaternion.Slerp(transform.rotation, Quaternion.Euler(0, targetAngle, 0), turnSmoothing);
        }
    }
}`,
      }
    } else if (type === 'tutorial') {
      return {
        title: `Step-by-Step Tutorial: ${prompt}`,
        content: `# Comprehensive WayaCreate Guide: ${prompt}
**Presented by Waya Steurbaut**

### 1. Architectural Overview & Asset Setup
Before jumping into the implementation, organize your project hierarchy:
- \`Assets/Models/Prototypes\`
- \`Assets/Shaders/PBR\`
- \`Assets/Scripts/Controllers\`

### 2. Core Implementation Strategy
1. **Asset Optimization**: Ensure UV unwrapping avoids overlapping seams on curved surfaces.
2. **Material Setup**: Configure Metallic = 0.8, Roughness map mapped to the Green channel for minimal memory footprint.
3. **Gameplay Hooks**: Bind input events with zero allocation delegates.

### 3. Monetization & Packaging Tips
When exporting to the WayaCreate marketplace:
- Always include an interactive demo scene.
- Package with both FBX and universal glTF versions.
- Provide a 10-minute companion video explaining how customers can modify parameters in 2 clicks.`,
      }
    } else if (type === 'image') {
      return {
        title: `AI Visual Prompt Spec: ${prompt}`,
        content: `Prompt optimized for high-detail 3D rendering:
"AAA stylized 3D model, ${prompt}, cinematic rim lighting, 8k Unreal Engine 5 render, vibrant neon accents, clean silhouette, artstation trending."`,
      }
    } else {
      return {
        title: `Creative Brief: ${prompt}`,
        content: `### Creative Strategy & Roadmap for: ${prompt}

- **Core Hook**: Fast-paced, high visual fidelity with modular design.
- **Audience**: Game developers, indie studios, 3D artists looking for drop-in ready assets.
- **Estimated Production Time**: 3-5 days.
- **Recommended Marketplace Price**: 350-550 Credits.`,
      }
    }
  },

  // Live Streaming & Own Streaming API
  getLiveStream(): LiveStreamSession {
    const defaultStream: LiveStreamSession = {
      id: 'stream_waya_live',
      title: 'Live Workshop: Building Sci-Fi Game Props & Retopology in Blender',
      description: 'Live interactive 3D modeling session with Waya Steurbaut. Asking community questions and testing shaders in Unreal Engine 5.',
      category: 'Gaming & 3D Modeling',
      creator_id: 'usr_waya_001',
      creator_name: 'Waya Steurbaut',
      creator_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      is_live: true,
      viewers: 1420,
      started_at: new Date(Date.now() - 45 * 60000).toISOString(),
      stream_key: 'live_waya_sk_94827103847291',
      rtmp_url: 'rtmp://live.wayacreate.com/live',
      webrtc_url: 'wss://webrtc.wayacreate.com/stream/usr_waya_001',
      tips: [
        { id: 'tip_1', user_id: 'usr_sarah_002', user_name: 'Sarah Chen', amount: 100, message: 'Super excited for the trim sheet section! Keep it up Waya!', timestamp: '12:05' },
        { id: 'tip_2', user_id: 'usr_client_001', user_name: 'Apex Studios', amount: 250, message: 'Loving the clean topology walkthrough!', timestamp: '12:12' }
      ]
    }
    return getFromStorage<LiveStreamSession>('wayacreate_livestream', defaultStream)
  },

  sendSuperChatTip(amount: number, message: string): boolean {
    const user = this.getUser()
    if (user.token_balance < amount) return false

    this.deductCredits(amount, `Super Chat tip on Live Stream: "${message}"`)
    const stream = this.getLiveStream()
    const newTip: SuperChatTip = {
      id: `tip_${Date.now()}`,
      user_id: user.id,
      user_name: user.display_name,
      amount,
      message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    stream.tips.unshift(newTip)
    saveToStorage('wayacreate_livestream', stream)
    return true
  },

  toggleGoLive(title: string, category: string): LiveStreamSession {
    const stream = this.getLiveStream()
    const user = this.getUser()
    stream.is_live = !stream.is_live
    stream.title = title || stream.title
    stream.category = category || stream.category
    stream.creator_name = user.display_name
    stream.started_at = new Date().toISOString()
    stream.viewers = stream.is_live ? Math.floor(Math.random() * 50) + 12 : 0
    saveToStorage('wayacreate_livestream', stream)
    return stream
  },

  generateNewStreamKey(): string {
    const stream = this.getLiveStream()
    const newKey = `live_${Math.random().toString(36).substring(2, 9)}_${Date.now().toString().slice(-6)}`
    stream.stream_key = newKey
    saveToStorage('wayacreate_livestream', stream)
    return newKey
  },

  // AI Content Assistant
  generateContentMetadata(input: string) {
    const cleaned = input.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ")
    return {
      title: `Stylized ${cleaned.charAt(0).toUpperCase() + cleaned.slice(1)} Game Asset Pack`,
      description: `Production-ready game asset optimized for Unreal Engine 5, Unity, and Blender. Features clean quad-dominant topology, 4K PBR texture maps (Albedo, Normal, Roughness, Metallic, Ambient Occlusion), and full collision hulls. Includes complete 25-minute breakdown companion tutorial!`,
      tags: ["Blender", "GameReady", "PBR Textures", "Modular", "Unreal Engine 5", "Indie Dev"],
      price: 180,
      tutorialOutline: `1. Asset Blueprint & Poly Budget Overview\n2. Efficient UV Unwrapping without Stretching\n3. Baking Normal & Curvature Maps\n4. Material Setup in Engine & Collision Tests`
    }
  },

  // YouTube Content Importer
  importFromYouTube(url: string) {
    let videoId = "demo"
    if (url.includes("v=")) {
      videoId = url.split("v=")[1].split("&")[0]
    } else if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1].split("?")[0]
    }
    return {
      title: "Mastering Procedural Shaders & Trim Sheets in Blender",
      description: `Imported from YouTube channel WayaCreate: High quality visual guide breaking down procedural texturing and trim sheet optimization for indie game environments.`,
      tags: ["YouTube Import", "Blender", "Tutorial", "Shaders", "Game Art"],
      thumbnailUrl: `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80`,
      duration: 1850,
      videoId
    }
  },

  // YouTube Channel Data & Video Feed
  getYouTubeChannel() {
    const defaultData = {
      handle: "@WayaSteurbaut",
      title: "Waya Steurbaut - Game Art & 3D Tech",
      description: "Official channel for game environment art, Unreal Engine 5 nanite workflows, Blender procedural shaders, and indie game dev tutorials.",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      bannerUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
      subscriberCount: 128400,
      totalViews: 4890200,
      videoCount: 142,
      isConnected: true,
      lastSyncedAt: new Date().toISOString(),
      videos: [
        {
          id: "yt_1",
          videoId: "dQw4w9WgXcQ",
          title: "Complete Blender 4 to Unreal Engine 5 Environment Masterclass",
          description: "Learn how to build photorealistic cyberpunk street scenes with Nanite, Lumen, and modular trim sheets.",
          views: 342000,
          duration: "42:15",
          publishedAt: "2 days ago",
          thumbnailUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80",
          tags: ["Blender", "UE5", "Environment Art", "Nanite"],
          importedAsTutorial: true
        },
        {
          id: "yt_2",
          videoId: "bTqVqk7FSmY",
          title: "Stylized Rain & Wet Surface PBR Shaders in 15 Minutes",
          description: "Step-by-step shader graph breakdown in Unity & Unreal for realistic ripple and puddle distortions.",
          views: 189500,
          duration: "18:40",
          publishedAt: "1 week ago",
          thumbnailUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
          tags: ["Shaders", "Unreal Engine", "VFX", "PBR"],
          importedAsTutorial: true
        },
        {
          id: "yt_3",
          videoId: "kJQP7kiw5Fk",
          title: "10 Game Optimization Mistakes Killing Your Frame Rate",
          description: "Profiling draw calls, texture atlas packing, LOD transitions, and GPU memory budgets.",
          views: 521000,
          duration: "28:10",
          publishedAt: "2 weeks ago",
          thumbnailUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&auto=format&fit=crop&q=80",
          tags: ["Optimization", "Gamedev", "Performance", "Profiling"],
          importedAsTutorial: false
        },
        {
          id: "yt_4",
          videoId: "3JZ_D3ELwOQ",
          title: "Building a Modular Sci-Fi Corridor in Blender from Scratch",
          description: "Hard-surface modeling secrets, bevel modifier tricks, and weighted normals workflow.",
          views: 245000,
          duration: "35:50",
          publishedAt: "3 weeks ago",
          thumbnailUrl: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80",
          tags: ["Blender", "Hard Surface", "3D Modeling", "Sci-Fi"],
          importedAsTutorial: false
        }
      ]
    }
    return getFromStorage('wayacreate_youtube_channel', defaultData)
  },

  syncYouTubeChannel(handle: string) {
    const current = this.getYouTubeChannel()
    const cleanHandle = handle.startsWith("@") ? handle : `@${handle}`
    current.handle = cleanHandle
    current.isConnected = true
    current.lastSyncedAt = new Date().toISOString()
    saveToStorage('wayacreate_youtube_channel', current)
    this.trackGoalAction("link_social")
    return current
  },

  importYouTubeVideoToCourse(videoId: string) {
    const channel = this.getYouTubeChannel()
    const vid = channel.videos.find((v: { id: string; videoId: string }) => v.id === videoId || v.videoId === videoId)
    if (vid) {
      vid.importedAsTutorial = true
      saveToStorage('wayacreate_youtube_channel', channel)

      // Add to courses/tutorials
      const courses = this.getCourses()
      const newCourse = {
        id: `c_yt_${Date.now()}`,
        title: vid.title,
        instructor: channel.title.split("-")[0].trim() || "Waya Steurbaut",
        duration: vid.duration,
        modules: 1,
        students: 120,
        rating: 4.96,
        price: 0, // Free tutorial from YouTube!
        description: vid.description,
        topics: vid.tags,
        youtube_video_id: vid.videoId,
        thumbnail_url: vid.thumbnailUrl
      }
      courses.unshift(newCourse)
      saveToStorage('wayacreate_courses', courses)
      this.trackGoalAction("publish_tutorial")
      return newCourse
    }
    return null
  },

  // Social Connections (Discord, GitHub, Google, YouTube)
  getSocialConnections() {
    const defaults = [
      {
        platform: "youtube",
        name: "YouTube",
        username: "@WayaSteurbaut",
        connected: true,
        stats: "128K subscribers • 142 videos",
        verified: true
      },
      {
        platform: "discord",
        name: "Discord",
        username: "waya_creative#0001",
        connected: true,
        stats: "WayaCreate Official Guild (4,520 members)",
        verified: true
      },
      {
        platform: "github",
        name: "GitHub",
        username: "waya-creations",
        connected: true,
        stats: "38 Repositories • 1.2K Stars",
        verified: true
      },
      {
        platform: "google",
        name: "Google Workspace",
        username: "steurbautwaya703@gmail.com",
        connected: true,
        stats: "Google Cloud & Drive Escrow Storage Linked",
        verified: true
      }
    ]
    return getFromStorage('wayacreate_social_connections', defaults)
  },

  toggleSocialConnection(platform: string, newUsername?: string) {
    const socials = this.getSocialConnections()
    const target = socials.find((s: { platform: string }) => s.platform === platform)
    if (target) {
      target.connected = !target.connected
      if (newUsername) target.username = newUsername
      saveToStorage('wayacreate_social_connections', socials)
      if (target.connected) {
        this.trackGoalAction("link_social")
      }
    }
    return socials
  },

  // Daily Free Token Faucet
  getFaucetStatus() {
    const saved = getFromStorage<{ lastClaim: string | null; streak: number }>('wayacreate_faucet_state', {
      lastClaim: null,
      streak: 1
    })

    const now = Date.now()
    let canClaim = true
    let remainingSeconds = 0

    if (saved.lastClaim) {
      const last = new Date(saved.lastClaim).getTime()
      const diffHours = (now - last) / (1000 * 60 * 60)
      if (diffHours < 24) {
        canClaim = false
        remainingSeconds = Math.max(0, Math.floor(24 * 3600 - (now - last) / 1000))
      } else if (diffHours > 48) {
        // Streak broken
        saved.streak = 1
      }
    }

    return {
      canClaim,
      remainingSeconds,
      streak: saved.streak,
      faucetAmount: 10 + (saved.streak > 1 ? Math.min(saved.streak * 2, 20) : 0),
      lastClaim: saved.lastClaim
    }
  },

  claimDailyFaucet(): { success: boolean; creditsAdded: number; streak: number } {
    const status = this.getFaucetStatus()
    if (!status.canClaim) {
      return { success: false, creditsAdded: 0, streak: status.streak }
    }

    const creditsToAdd = status.faucetAmount
    const newStreak = status.streak + 1

    saveToStorage('wayacreate_faucet_state', {
      lastClaim: new Date().toISOString(),
      streak: newStreak
    })

    this.addCredits(
      creditsToAdd,
      `🎁 Daily Community Faucet (+${creditsToAdd} Free Tokens - Streak Day ${status.streak})`
    )

    this.trackGoalAction("claim_faucet")
    return { success: true, creditsAdded: creditsToAdd, streak: newStreak }
  },

  // Stripe & Microtransactions Configuration
  getStripeConfig() {
    const defaultConfig = {
      isLiveMode: false,
      publishableKey: "pk_test_51Mz0exampleKEY99WayaCreateAlphaDemo",
      secretKeyMasked: "sk_test_••••••••••••••••••••••••••••Waya",
      webhookSecretMasked: "whsec_••••••••••••••••••••••••••••Demo",
      isConfigured: true,
      platformFeePercent: 5.0,
      microTipsEnabled: true,
      oneClickCheckout: true,
      webhookLogs: [
        {
          id: "evt_101",
          type: "checkout.session.completed",
          amount: 24.99,
          currency: "usd",
          customer: "steurbautwaya703@gmail.com",
          status: "processed",
          time: "10 mins ago"
        },
        {
          id: "evt_102",
          type: "payment_intent.succeeded",
          amount: 2.00,
          currency: "usd",
          customer: "community_viewer@waya.dev",
          status: "processed",
          time: "25 mins ago"
        }
      ]
    }
    return getFromStorage('wayacreate_stripe_config', defaultConfig)
  },

  saveStripeConfig(config: Record<string, unknown>) {
    saveToStorage('wayacreate_stripe_config', config)
    return config
  },

  simulateStripeWebhook(type: string, amountUsd: number, description: string) {
    const config = this.getStripeConfig()
    const newLog = {
      id: `evt_${Date.now()}`,
      type,
      amount: amountUsd,
      currency: "usd",
      customer: "simulated_user@wayacreate.com",
      status: "processed",
      time: "Just now"
    }
    config.webhookLogs.unshift(newLog)
    saveToStorage('wayacreate_stripe_config', config)

    // Automatically credit user if it's token purchase or tip
    const credits = Math.round(amountUsd * 10)
    this.addCredits(credits, `Stripe Webhook: ${description}`, amountUsd)
    return newLog
  },

  // AI Asset Security & Optimizer
  scanAssetSecurity(assetName: string) {
    const hash = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")
    const isModel = assetName.endsWith(".blend") || assetName.endsWith(".fbx") || assetName.endsWith(".obj") || assetName.endsWith(".gltf")
    
    return {
      assetName,
      hashSha256: hash,
      score: 96,
      grade: "A+",
      checks: [
        { name: "Executable / Script Malware Audit", passed: true, details: "Zero suspicious shell or macro scripts found in archive." },
        { name: "3D Mesh Geometry & Topology Check", passed: true, details: "Clean manifold meshes, no flipped normals or non-planar polygons." },
        { name: "AI Duplicate & Stolen Mesh Detector", passed: true, details: "Original vertex distribution confirmed. 99.4% unique signature." },
        { name: "Commercial License Verification", passed: true, details: "Royalty-free commercial usage tags embedded into digital package." },
        { name: "Texture VRAM Budget Optimization", passed: true, details: "Mipmaps present, textures are power-of-two (POT 2048x2048 and 4096x4096)." }
      ],
      optimizationsAvailable: [
        "WebP LOD compression (saves 42% download size without quality loss)",
        "Automated collision hull generation (Convex Hull)",
        "Escrow instant buyer protection badge"
      ],
      scannedAt: new Date().toISOString()
    }
  },

  // Gamified Goals & Creator Quests
  getGoals() {
    const defaultGoals = [
      {
        id: "goal_faucet",
        actionKey: "claim_faucet",
        title: "Claim Daily Community Faucet",
        description: "Grab your free daily Waya Tokens and build your streak.",
        category: "daily",
        progress: 0,
        target: 1,
        rewardTokens: 10,
        rewardXP: 25,
        claimed: false
      },
      {
        id: "goal_social",
        actionKey: "link_social",
        title: "Connect YouTube or Social Account",
        description: "Sync your YouTube channel, Discord guild, or GitHub profile.",
        category: "daily",
        progress: 1,
        target: 1,
        rewardTokens: 25,
        rewardXP: 50,
        claimed: false
      },
      {
        id: "goal_stream",
        actionKey: "watch_stream",
        title: "Watch a Live Stream or Send a Tip",
        description: "Support live creators in the Live Streaming Studio.",
        category: "daily",
        progress: 0,
        target: 1,
        rewardTokens: 15,
        rewardXP: 30,
        claimed: false
      },
      {
        id: "goal_scan",
        actionKey: "run_scan",
        title: "Run AI Security Optimization Scan",
        description: "Audit an asset or package with our smart security scanner.",
        category: "weekly",
        progress: 0,
        target: 1,
        rewardTokens: 20,
        rewardXP: 40,
        claimed: false
      },
      {
        id: "goal_upload",
        actionKey: "publish_tutorial",
        title: "Upload or Import a Free Tutorial",
        description: "Share 3D tips or import from YouTube to grow the creator library.",
        category: "weekly",
        progress: 0,
        target: 1,
        rewardTokens: 50,
        rewardXP: 100,
        claimed: false
      }
    ]
    return getFromStorage('wayacreate_creator_goals', defaultGoals)
  },

  trackGoalAction(actionKey: string) {
    const goals = this.getGoals()
    let updated = false
    goals.forEach((g: { actionKey: string; progress: number; target: number }) => {
      if (g.actionKey === actionKey && g.progress < g.target) {
        g.progress = Math.min(g.target, g.progress + 1)
        updated = true
      }
    })
    if (updated) {
      saveToStorage('wayacreate_creator_goals', goals)
    }
  },

  claimGoalReward(goalId: string): { success: boolean; tokens: number; xp: number } {
    const goals = this.getGoals()
    const target = goals.find((g: { id: string }) => g.id === goalId)
    if (target && target.progress >= target.target && !target.claimed) {
      target.claimed = true
      saveToStorage('wayacreate_creator_goals', goals)

      // Add tokens
      this.addCredits(target.rewardTokens, `🏆 Completed Quest: ${target.title}`)

      // Add XP to user
      const user = this.getUser()
      user.level.xp += target.rewardXP
      if (user.level.xp >= user.level.xp_to_next) {
        user.level.level += 1
        user.level.xp = user.level.xp - user.level.xp_to_next
        user.level.xp_to_next = Math.round(user.level.xp_to_next * 1.5)
      }
      this.saveUser(user)

      return { success: true, tokens: target.rewardTokens, xp: target.rewardXP }
    }
    return { success: false, tokens: 0, xp: 0 }
  }
}


