import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL
const API = `${BACKEND_URL}/api`

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check for session authentication from URL fragment
  useEffect(() => {
    const checkAuth = async () => {
      // Check for Emergent Auth session ID in URL fragment
      const fragment = window.location.hash
      if (fragment.includes('session_id=')) {
        const sessionId = fragment.split('session_id=')[1].split('&')[0]
        
        try {
          const response = await axios.post(`${API}/auth/emergentagent-login`, 
            { session_id: sessionId },
            { withCredentials: true }
          )
          
          if (response.data.success) {
            setUser(response.data.user)
            // Clear the fragment from URL
            window.history.replaceState({}, document.title, window.location.pathname + window.location.search)
            return
          }
        } catch (error) {
          console.error('Session authentication failed:', error)
        }
      }
      
      // Check existing session
      try {
        const response = await axios.get(`${API}/auth/me`, { withCredentials: true })
        setUser(response.data)
      } catch (error) {
        // User not authenticated
        setUser(null)
      }
      
      setLoading(false)
    }

    checkAuth()
  }, [])

  const loginWithGoogle = () => {
    const redirectUrl = window.location.origin + '/profile'
    const authUrl = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`
    window.location.href = authUrl
  }

  const logout = async () => {
    try {
      await axios.post(`${API}/auth/logout`, {}, { withCredentials: true })
    } catch (error) {
      console.error('Logout error:', error)
    }
    setUser(null)
  }

  const refreshUser = async () => {
    try {
      const response = await axios.get(`${API}/auth/me`, { withCredentials: true })
      setUser(response.data)
    } catch (error) {
      console.error('Failed to refresh user data:', error)
      setUser(null)
    }
  }

  const getCreditsRemaining = () => {
    return user?.subscription?.credits_remaining || 0
  }

  const value = {
    user,
    loading,
    loginWithGoogle,
    logout,
    refreshUser,
    getCreditsRemaining,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}