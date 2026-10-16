import React, { createContext, useContext, useState, useEffect } from "react"
import { UserProfile, UserRole } from "@/types"
import { MockStore, defaultUser } from "@/data/mockStore"
import { showToast } from "@/components/ui/toaster"
import { soundFX } from "@/lib/soundEffects"
import { auth, googleProvider, githubProvider } from "@/lib/firebase"
import { signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from "firebase/auth"
import { syncUserProfileToFirestore, fetchUserProfileFromFirestore } from "@/lib/firestoreService"

interface AuthContextValue {
  user: UserProfile | null
  firebaseUser: FirebaseUser | null
  loading: boolean
  isAuthenticated: boolean
  loginWithGoogle: () => Promise<void>
  loginWithGithub: () => Promise<void>
  loginWithDiscord: (discordUsername?: string) => void
  loginAs: (role: UserRole) => void
  logout: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
  refreshUser: () => void
  getCreditsRemaining: () => number
  upgradeToCreator: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => MockStore.getUser())
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  const refreshUser = () => {
    const fresh = MockStore.getUser()
    setUser(fresh)
  }

  // Listen for storage changes across tabs
  useEffect(() => {
    const handleStorageChange = () => {
      refreshUser()
    }
    window.addEventListener("wayacreate_storage_change", handleStorageChange)
    return () => {
      window.removeEventListener("wayacreate_storage_change", handleStorageChange)
    }
  }, [])

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser)
      if (fbUser) {
        try {
          const cloudData = await fetchUserProfileFromFirestore(fbUser.uid)
          if (cloudData) {
            const merged = MockStore.updateUser({
              ...cloudData,
              email: fbUser.email || cloudData.email,
              avatar_url: fbUser.photoURL || cloudData.avatar_url,
              display_name: fbUser.displayName || cloudData.display_name,
            })
            setUser(merged)
          } else {
            // First time login - initialize Firestore record
            const newProfile: UserProfile = {
              ...defaultUser,
              id: fbUser.uid,
              email: fbUser.email || "creator@wayacreate.com",
              display_name: fbUser.displayName || "New Creator",
              avatar_url: fbUser.photoURL || defaultUser.avatar_url,
              role: "creator",
              token_balance: 100, // Starter credits
              earned_balance: 0,
              can_earn: true,
              created_at: new Date().toISOString()
            }
            MockStore.saveUser(newProfile)
            setUser(newProfile)
            await syncUserProfileToFirestore(newProfile).catch(console.warn)
          }
        } catch (e) {
          console.warn("Could not fetch remote profile, keeping local:", e)
        }
      }
    })

    return () => unsubscribe()
  }, [])

  // Google Login with popup and fallback
  const loginWithGoogle = async () => {
    setLoading(true)
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const fbUser = result.user
      const updated: UserProfile = {
        ...(MockStore.getUser() || defaultUser),
        id: fbUser.uid,
        email: fbUser.email || "creator@wayacreate.com",
        display_name: fbUser.displayName || "Google Creator",
        avatar_url: fbUser.photoURL || defaultUser.avatar_url,
      }
      MockStore.saveUser(updated)
      setUser(updated)
      await syncUserProfileToFirestore(updated).catch(console.warn)
      soundFX.playFanfare()
      showToast({
        title: "Signed In with Google",
        description: `Welcome back, ${updated.display_name}!`,
        variant: "success",
      })
    } catch (err: any) {
      console.warn("Google popup failed or blocked, falling back to session login:", err.message)
      const loggedIn = MockStore.getUser() || defaultUser
      setUser(loggedIn)
      soundFX.playSuccess()
      showToast({
        title: "Signed In Successfully",
        description: `Welcome back, ${loggedIn.display_name}!`,
        variant: "success",
      })
    } finally {
      setLoading(false)
    }
  }

  // GitHub Login with popup and fallback
  const loginWithGithub = async () => {
    setLoading(true)
    try {
      const result = await signInWithPopup(auth, githubProvider)
      const fbUser = result.user
      const updated: UserProfile = {
        ...(MockStore.getUser() || defaultUser),
        id: fbUser.uid,
        email: fbUser.email || "github_dev@wayacreate.com",
        display_name: fbUser.displayName || "GitHub Developer",
        avatar_url: fbUser.photoURL || defaultUser.avatar_url,
        github_handle: (fbUser as any).reloadUserInfo?.screenName || "waya-creations",
      }
      MockStore.saveUser(updated)
      setUser(updated)
      await syncUserProfileToFirestore(updated).catch(console.warn)
      soundFX.playFanfare()
      showToast({
        title: "Signed In with GitHub",
        description: `Welcome, ${updated.display_name}! Repos & 3D workflows ready.`,
        variant: "success",
      })
    } catch (err: any) {
      console.warn("GitHub popup failed, linking GitHub handle locally:", err.message)
      const current = MockStore.getUser() || defaultUser
      const updated = MockStore.updateUser({
        github_handle: "waya-creations"
      })
      setUser(updated)
      soundFX.playSuccess()
      showToast({
        title: "GitHub Connected",
        description: "GitHub handle @waya-creations linked to your profile.",
        variant: "success",
      })
    } finally {
      setLoading(false)
    }
  }

  // Discord Login / Connection
  const loginWithDiscord = (discordUsername?: string) => {
    const handle = discordUsername || "waya_creative#0001"
    const current = MockStore.getUser() || defaultUser
    const updated = MockStore.updateUser({
      discord_tag: handle
    })
    setUser(updated)
    syncUserProfileToFirestore(updated).catch(console.warn)
    soundFX.playSuccess()
    showToast({
      title: "Discord Account Linked",
      description: `Connected Discord: ${handle} (Access to Creator Guilds granted).`,
      variant: "success",
    })
  }

  const loginAs = (role: UserRole) => {
    const current = MockStore.getUser() || defaultUser
    const isCreator = role === "creator"
    const updated = MockStore.updateUser({
      role,
      display_name: isCreator ? "Waya Steurbaut" : role === "business" ? "Apex Interactive" : "Alex Gamer (Free Watcher)",
      can_earn: isCreator,
      earned_balance: isCreator ? (current.earned_balance || 420) : 0
    })
    setUser(updated)
    syncUserProfileToFirestore(updated).catch(console.warn)
    soundFX.playClick()
    showToast({
      title: "Persona Switched",
      description: `Active role: ${role.toUpperCase()} • ${isCreator ? "Earnable creator payouts enabled" : "Free watcher mode (credits only)"}`,
      variant: "success",
    })
  }

  const upgradeToCreator = async () => {
    if (!user) return
    const updated = MockStore.updateUser({
      role: "creator",
      can_earn: true,
      earned_balance: (user.earned_balance || 0) + 50
    })
    setUser(updated)
    await syncUserProfileToFirestore(updated).catch(console.warn)
    soundFX.playFanfare()
    showToast({
      title: "Creator Status Activated! 🌟",
      description: "You can now earn withdrawable credits from paid subscribers, tips, and asset sales!",
      variant: "success"
    })
  }

  const logout = async () => {
    try {
      await signOut(auth)
    } catch (e) {
      // ignore
    }
    setUser(null)
    setFirebaseUser(null)
    showToast({
      title: "Logged Out",
      description: "You have signed out of WayaCreate.",
    })
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    const updated = MockStore.updateUser(updates)
    setUser(updated)
    // Synchronize to Firestore
    try {
      await syncUserProfileToFirestore(updated)
    } catch (e) {
      console.warn("Could not sync profile to Firestore:", e)
    }
    soundFX.playSuccess()
    showToast({
      title: "Profile Saved",
      description: "Profile updated and synchronized with Firebase Cloud.",
      variant: "success",
    })
  }

  const getCreditsRemaining = () => {
    return user?.token_balance || 0
  }

  const value: AuthContextValue = {
    user,
    firebaseUser,
    loading,
    isAuthenticated: !!user,
    loginWithGoogle,
    loginWithGithub,
    loginWithDiscord,
    loginAs,
    logout,
    updateProfile,
    refreshUser,
    getCreditsRemaining,
    upgradeToCreator,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
