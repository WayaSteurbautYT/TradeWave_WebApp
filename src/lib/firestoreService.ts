import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  getDocs, 
  query, 
  where, 
  onSnapshot, 
  serverTimestamp,
  orderBy,
  limit
} from 'firebase/firestore'
import { db } from './firebase'
import { handleFirestoreError, OperationType } from './firestoreErrors'
import { UserProfile, TokenTransaction } from '@/types'

export interface FirestoreVideo {
  id: string
  creator_id: string
  creator_name: string
  title: string
  description: string
  video_url: string
  thumbnail_url: string
  duration: string
  is_live: boolean
  ai_generated: boolean
  ai_tags: string
  copyright_status: 'clean' | 'flagged' | 'verified' | 'pending'
  sha256_hash: string
  rights_for_sale: boolean
  rights_price_credits: number
  views_count: number
  created_at: string
}

export interface FirestoreMarketplaceRight {
  id: string
  asset_id: string
  title: string
  seller_id: string
  seller_name: string
  current_owner_id: string
  price_credits: number
  rights_type: 'full_commercial' | 'non_exclusive' | 'resellable'
  status: 'listed' | 'sold' | 'in_escrow'
  created_at: string
}

// User Profile Operations
export async function syncUserProfileToFirestore(user: UserProfile): Promise<void> {
  const path = `users/${user.id}`
  try {
    const userRef = doc(db, 'users', user.id)
    await setDoc(userRef, {
      id: user.id,
      email: user.email || `${user.username}@wayacreate.com`,
      display_name: user.display_name || 'Creator',
      role: user.role || 'user',
      bio: user.bio || '',
      avatar_url: user.avatar_url || '',
      cover_image_url: user.cover_image_url || '',
      location: user.location || '',
      website: user.website || '',
      youtube_url: user.youtube_channel_url || 'https://www.youtube.com/@wayacreate',
      discord_tag: user.discord_tag || '',
      github_handle: user.github_handle || '',
      token_balance: user.token_balance || 0,
      earned_balance: user.earned_balance || 0,
      can_earn: user.role === 'creator',
      is_verified: user.is_verified || false,
      skills: user.skills || [],
      ai_rating: user.ai_rating || 94,
      ai_badges: user.ai_badges || [],
      ai_skill_evaluation: user.ai_skill_evaluation || null,
      created_at: user.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    }, { merge: true })
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path)
  }
}

export async function fetchUserProfileFromFirestore(userId: string): Promise<any | null> {
  const path = `users/${userId}`
  try {
    const userRef = doc(db, 'users', userId)
    const snap = await getDoc(userRef)
    if (snap.exists()) {
      return snap.data()
    }
    return null
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path)
  }
}

// Videos Collection Operations
export async function createFirestoreVideo(video: FirestoreVideo): Promise<void> {
  const path = `videos/${video.id}`
  try {
    const videoRef = doc(db, 'videos', video.id)
    await setDoc(videoRef, {
      ...video,
      created_at: video.created_at || new Date().toISOString()
    })
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path)
  }
}

export async function fetchFirestoreVideos(): Promise<FirestoreVideo[]> {
  const path = 'videos'
  try {
    const q = query(collection(db, 'videos'), limit(50))
    const snap = await getDocs(q)
    return snap.docs.map(doc => doc.data() as FirestoreVideo)
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path)
  }
}

// Marketplace Rights Operations
export async function createMarketplaceRight(right: FirestoreMarketplaceRight): Promise<void> {
  const path = `marketplace_rights/${right.id}`
  try {
    const ref = doc(db, 'marketplace_rights', right.id)
    await setDoc(ref, right)
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path)
  }
}

export async function fetchMarketplaceRights(): Promise<FirestoreMarketplaceRight[]> {
  const path = 'marketplace_rights'
  try {
    const snap = await getDocs(collection(db, 'marketplace_rights'))
    return snap.docs.map(doc => doc.data() as FirestoreMarketplaceRight)
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path)
  }
}

export async function transferMarketplaceRight(rightId: string, newOwnerId: string): Promise<void> {
  const path = `marketplace_rights/${rightId}`
  try {
    const ref = doc(db, 'marketplace_rights', rightId)
    await updateDoc(ref, {
      current_owner_id: newOwnerId,
      status: 'sold'
    })
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path)
  }
}

// Token Transactions Ledger
export async function recordFirestoreTransaction(tx: {
  id: string
  user_id: string
  transaction_type: 'purchase' | 'faucet' | 'rights_trade' | 'tip' | 'creator_earning' | 'withdrawal'
  amount: number
  usd_amount?: number
  description: string
  status: 'completed' | 'pending' | 'failed'
}): Promise<void> {
  const path = `transactions/${tx.id}`
  try {
    const ref = doc(db, 'transactions', tx.id)
    await setDoc(ref, {
      ...tx,
      created_at: new Date().toISOString()
    })
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path)
  }
}
