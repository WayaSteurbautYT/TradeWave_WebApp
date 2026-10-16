/**
 * Unique Scoped ID Generator for TradeWave / WayaCreate MVP.
 * Generates user-dependent identifiers across all platform modules:
 * - Profiles & Sessions
 * - Guilds
 * - Achievements & Badges
 * - AI Skill Evaluations
 * - Token Purchases & Transactions
 * - YouTube Verified Channel Hubs
 * - Live Streaming & Superchats
 */

export function sanitizeUserPrefix(userId?: string): string {
  if (!userId) return 'usr_anon'
  return userId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 12)
}

function randomSuffix(length = 6): string {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyz'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export const IdGenerator = {
  // User Profile & Authentication ID
  user(emailOrHandle?: string): string {
    const slug = emailOrHandle
      ? emailOrHandle.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '').slice(0, 10).toLowerCase()
      : 'creator'
    return `usr_${slug}_${Date.now().toString(36)}_${randomSuffix(4)}`
  },

  // Guild Creation ID (scoped to owner)
  guild(ownerUserId: string, guildName: string): string {
    const uPrefix = sanitizeUserPrefix(ownerUserId)
    const gSlug = guildName.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toLowerCase() || 'guild'
    return `gld_${uPrefix}_${gSlug}_${Date.now().toString(36)}`
  },

  // Achievement Unlock ID (scoped to user and achievement)
  achievement(userId: string, achievementKey: string): string {
    const uPrefix = sanitizeUserPrefix(userId)
    const aKey = achievementKey.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8)
    return `ach_${uPrefix}_${aKey}_${Date.now().toString(36)}`
  },

  // AI Skill Evaluation Record ID
  aiEvaluation(userId: string, careerId: string): string {
    const uPrefix = sanitizeUserPrefix(userId)
    const cSlug = careerId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8)
    return `eval_${uPrefix}_${cSlug}_${Date.now().toString(36)}`
  },

  // AI Verified Badge ID
  aiBadge(userId: string, badgeName: string): string {
    const uPrefix = sanitizeUserPrefix(userId)
    const bSlug = badgeName.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10).toLowerCase()
    return `badge_${uPrefix}_${bSlug}_${randomSuffix(4)}`
  },

  // Token Purchase & Transaction ID
  tokenTransaction(userId: string, type: 'purchase' | 'earning' | 'withdrawal' | 'tip'): string {
    const uPrefix = sanitizeUserPrefix(userId)
    return `tx_${uPrefix}_${type}_${Date.now().toString(36)}_${randomSuffix(4)}`
  },

  // Stripe Subscription ID
  subscription(userId: string, tier: string): string {
    const uPrefix = sanitizeUserPrefix(userId)
    return `sub_${uPrefix}_${tier.toLowerCase()}_${Date.now().toString(36)}`
  },

  // Verified YouTube Hub ID
  youtubeHub(userId: string, channelHandle: string): string {
    const uPrefix = sanitizeUserPrefix(userId)
    const cClean = channelHandle.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10).toLowerCase()
    return `yt_hub_${uPrefix}_${cClean}_${Date.now().toString(36)}`
  },

  // Live Stream Broadcast Session ID
  streamSession(userId: string): string {
    const uPrefix = sanitizeUserPrefix(userId)
    return `stream_${uPrefix}_${Date.now().toString(36)}_${randomSuffix(4)}`
  },

  // Escrow / Marketplace Order ID
  order(clientId: string, creatorId: string): string {
    const cPrefix = sanitizeUserPrefix(clientId)
    const crPrefix = sanitizeUserPrefix(creatorId)
    return `ord_${cPrefix}_to_${crPrefix}_${Date.now().toString(36)}`
  }
}
