import React, { createContext, useContext, useState, useEffect } from "react"
import { UserProfile, UserRole } from "@/types"
import { MockStore, defaultUser } from "@/data/mockStore"
import { showToast } from "@/components/ui/toaster"

interface AuthContextValue {
  user: UserProfile | null
  loading: boolean
  isAuthenticated: boolean
  loginWithGoogle: () => void
  loginAs: (role: UserRole) => void
  logout: () => void
  updateProfile: (updates: Partial<UserProfile>) => void
  refreshUser: () => void
  getCreditsRemaining: () => number
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
  const [loading, setLoading] = useState<boolean>(false)

  const refreshUser = () => {
    const fresh = MockStore.getUser()
    setUser(fresh)
  }

  useEffect(() => {
    const handleStorageChange = () => {
      refreshUser()
    }
    window.addEventListener("wayacreate_storage_change", handleStorageChange)
    return () => {
      window.removeEventListener("wayacreate_storage_change", handleStorageChange)
    }
  }, [])

  const loginWithGoogle = () => {
    setLoading(true)
    setTimeout(() => {
      const loggedIn = MockStore.getUser() || defaultUser
      setUser(loggedIn)
      setLoading(false)
      showToast({
        title: "Signed In Successfully",
        description: `Welcome back, ${loggedIn.display_name}!`,
        variant: "success",
      })
    }, 400)
  }

  const loginAs = (role: UserRole) => {
    const current = MockStore.getUser() || defaultUser
    const updated = MockStore.updateUser({
      role,
      display_name: role === "creator" ? "Waya Steurbaut" : role === "business" ? "Apex Interactive" : "Alex Gamer",
    })
    setUser(updated)
    showToast({
      title: "Persona Switched",
      description: `Active role changed to ${role.toUpperCase()}`,
      variant: "success",
    })
  }

  const logout = () => {
    setUser(null)
    showToast({
      title: "Logged Out",
      description: "You have signed out of WayaCreate.",
    })
  }

  const updateProfile = (updates: Partial<UserProfile>) => {
    const updated = MockStore.updateUser(updates)
    setUser(updated)
    showToast({
      title: "Profile Saved",
      description: "Your settings and profile were updated.",
      variant: "success",
    })
  }

  const getCreditsRemaining = () => {
    return user?.token_balance || 0
  }

  const value: AuthContextValue = {
    user,
    loading,
    isAuthenticated: !!user,
    loginWithGoogle,
    loginAs,
    logout,
    updateProfile,
    refreshUser,
    getCreditsRemaining,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
