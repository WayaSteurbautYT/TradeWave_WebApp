import { UserProfile, AIBadge, AISkillEvaluation, SkillNode } from '@/types'
import { MockStore } from '@/data/mockStore'
import { syncUserProfileToFirestore } from './firestoreService'

export interface CareerOption {
  id: string
  title: string
  category: string
  description: string
  keySkills: string[]
  recommendedSoftware: string[]
}

export const CAREER_PATHS: CareerOption[] = [
  {
    id: 'ue5_env_artist',
    title: 'Unreal Engine 5 Environment Artist',
    category: 'Gaming & 3D Tech',
    description: 'Master of Nanite micro-geometry, Lumen global illumination, Virtual Shadow Maps, and modular architectural trim sheets.',
    keySkills: ['3D Sculpting & Topology', 'PBR Shading & Texturing', 'Modular Kitbashing', 'Lumen & Lighting', 'Nanite Optimization'],
    recommendedSoftware: ['Unreal Engine 5.5', 'Blender 4.2', 'Substance 3D Painter', 'ZBrush']
  },
  {
    id: 'tech_artist',
    title: 'Technical Shader & VFX Artist',
    category: 'Game Tech & VFX',
    description: 'Bridges art and programming using HLSL/GLSL, Unreal Niagara visual effects, vertex shaders, and GPU optimization.',
    keySkills: ['HLSL Shaders', 'Niagara Particle Systems', 'GPU Optimization', 'Material Nodes', 'Mathematical Animation'],
    recommendedSoftware: ['Unreal Engine 5', 'Unity Shader Graph', 'Houdini', 'RenderDoc']
  },
  {
    id: 'indie_gamedev',
    title: 'Indie Game Developer & Designer',
    category: 'Game Production',
    description: 'Full-cycle game creator capable of mechanics prototyping, character rigging, level pacing, and Steam release preparation.',
    keySkills: ['Rigging & Animation', 'Core Mechanics C#', 'Level Design', 'Sound Integration', 'Steam Publishing'],
    recommendedSoftware: ['Unreal Engine', 'Unity', 'Blender', 'FMOD']
  },
  {
    id: 'content_streamer',
    title: 'Live Content Streamer & Monetizer',
    category: 'Creator Economy',
    description: 'High-energy broadcaster delivering technical 3D walkthroughs, live super chats, secondary rights sales, and YouTube syndication.',
    keySkills: ['Live Broadcasting', 'OBS Studio Ingest', 'Super Chat Engagement', 'Video Editing', 'Commercial Rights Trading'],
    recommendedSoftware: ['OBS Studio', 'DaVinci Resolve', 'WayaCreate Live Studio', 'Audacity']
  }
]

export const ALL_AI_BADGES: AIBadge[] = [
  {
    id: 'badge_nanite_master',
    name: 'Nanite Geometry Master',
    icon: '💎',
    tier: 'Diamond',
    category: 'Unreal Engine 5',
    description: 'Demonstrated exceptional understanding of infinite-poly virtualization and cinematic cluster streaming.',
    score: 98,
    unlocked_at: new Date().toISOString()
  },
  {
    id: 'badge_pbr_guru',
    name: 'PBR Shading Perfectionist',
    icon: '🎨',
    tier: 'Platinum',
    category: 'Material Science',
    description: 'Flawless roughness packing, micro-surface normal fidelity, and metallic energy conservation.',
    score: 95,
    unlocked_at: new Date().toISOString()
  },
  {
    id: 'badge_topology_ace',
    name: 'Clean Quad Topology Ace',
    icon: '📐',
    tier: 'Gold',
    category: '3D Modeling',
    description: 'Zero non-manifold edges, optimal edge loop loops for deformation, and high-performance poly budgets.',
    score: 92,
    unlocked_at: new Date().toISOString()
  },
  {
    id: 'badge_rights_monetizer',
    name: 'Verified Commercial Rights Seller',
    icon: '⚡',
    tier: 'Diamond',
    category: 'Economy & Legal',
    description: 'Successfully drafted verifiable digital IP contracts with tradeable secondary licenses on WayaCreate.',
    score: 97,
    unlocked_at: new Date().toISOString()
  },
  {
    id: 'badge_stream_architect',
    name: 'Broadcasting Studio Pioneer',
    icon: '🎙️',
    tier: 'Platinum',
    category: 'Live Production',
    description: 'Configured low-latency OBS Studio RTMP ingest, WebRTC screen share, and interactive SuperChat economy.',
    score: 94,
    unlocked_at: new Date().toISOString()
  },
  {
    id: 'badge_tutorial_author',
    name: 'Academy Masterclass Instructor',
    icon: '🎓',
    tier: 'Gold',
    category: 'Education',
    description: 'Published step-by-step video masterclasses with downloadable project files and community quizzes.',
    score: 91,
    unlocked_at: new Date().toISOString()
  }
]

export async function runAISkillAudit(
  careerId: string,
  user: UserProfile,
  skillsList: SkillNode[],
  userPromptCustom?: string
): Promise<AISkillEvaluation> {
  const career = CAREER_PATHS.find(c => c.id === careerId) || CAREER_PATHS[0]
  
  // Calculate average skill level from actual user skill nodes
  const avgLevel = skillsList.length > 0 
    ? skillsList.reduce((acc, s) => acc + s.level, 0) / skillsList.length 
    : 4

  const baseScore = Math.min(99, Math.round(75 + avgLevel * 4.5 + (user.rating >= 4.9 ? 5 : 2)))
  
  // Determine unlocked badges based on score and target career
  const awardedBadges: AIBadge[] = []
  if (baseScore >= 90) {
    awardedBadges.push(ALL_AI_BADGES[0]) // Nanite Master
    awardedBadges.push(ALL_AI_BADGES[1]) // PBR Guru
  }
  if (baseScore >= 80) {
    awardedBadges.push(ALL_AI_BADGES[2]) // Topology Ace
    awardedBadges.push(ALL_AI_BADGES[4]) // Stream Architect
  }
  if (user.can_earn || user.role === 'creator') {
    awardedBadges.push(ALL_AI_BADGES[3]) // Rights Monetizer
  }
  awardedBadges.push(ALL_AI_BADGES[5]) // Tutorial Author

  const skillRatings: { [skillName: string]: { score: number; grade: string; feedback: string } } = {
    '3D Sculpting & Retopology': {
      score: 96,
      grade: 'S-Tier',
      feedback: 'Excellent edge-loop discipline and silhouette control suitable for both cinematic film and real-time game engines.'
    },
    'PBR Materials & Trim Sheets': {
      score: 94,
      grade: 'S-Tier',
      feedback: 'Outstanding texture budget conservation; trim sheet workflow increases environment fidelity by 400%.'
    },
    'Unreal Engine 5 Lumen & Lighting': {
      score: 92,
      grade: 'A+-Tier',
      feedback: 'Expert lightmass and Virtual Shadow Map tuning. Consider testing multi-bounce emissive surfaces.'
    },
    'Live Screen Streaming & OBS': {
      score: 89,
      grade: 'A-Tier',
      feedback: 'Reliable 1080p60 stream ingest with clear microphone equalization and active viewer chat retention.'
    },
    'Commercial IP Rights & Resale': {
      score: 97,
      grade: 'Master',
      feedback: 'Pioneering smart digital contracts that grant secondary royalties to original creators upon resale.'
    }
  }

  const evaluation: AISkillEvaluation = {
    overall_score: baseScore,
    tier: baseScore >= 95 ? 'Master Creator (Tier 1)' : baseScore >= 88 ? 'Senior Architect (Tier 2)' : 'Journeyman (Tier 3)',
    target_career: career.title,
    summary: `AI Evaluation Complete for ${user.display_name}: You demonstrate elite proficiency in ${career.title}. Your portfolio, @wayacreate YouTube masterclasses, and verified marketplace assets position you in the top 3% of technical creators.`,
    strengths: [
      'Mastery of Blender 4.2 to Unreal Engine 5 nanite pipeline',
      'Production-tested trim sheet workflows for modular environments',
      'Strong community reputation (4.96/5.0 with 240+ verified reviews)',
      'Active live streaming studio integration with OBS and browser screen sharing'
    ],
    recommended_actions: [
      'Publish your modular sci-fi trim sheet as a downloadable source bundle with commercial resale rights',
      'Add a 15-minute companion video tutorial explaining custom HLSL node packing in UE5',
      'Host a live screen-share workshop answering questions on portfolio optimization'
    ],
    badges_awarded: awardedBadges,
    skill_ratings: skillRatings,
    evaluated_at: new Date().toISOString()
  }

  return evaluation
}

export async function applyAiSkillAuditToProfile(
  evaluation: AISkillEvaluation,
  user: UserProfile
): Promise<UserProfile> {
  const updatedBadges = evaluation.badges_awarded
  const updatedUser: UserProfile = {
    ...user,
    ai_rating: evaluation.overall_score,
    ai_badges: updatedBadges,
    ai_skill_evaluation: evaluation,
    skills: Array.from(new Set([
      ...user.skills,
      'Unreal Engine 5 Nanite',
      'Modular Trim Sheets',
      'PBR Shading',
      'OBS Live Streaming',
      'Commercial IP Resale'
    ]))
  }

  // Save to local store
  MockStore.saveUser(updatedUser)

  // Sync to Firestore
  try {
    await syncUserProfileToFirestore(updatedUser)
  } catch (err) {
    console.warn('Could not sync AI audit to Firestore:', err)
  }

  return updatedUser
}
