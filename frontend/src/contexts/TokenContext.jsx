import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from './AuthContext'

const TokenContext = createContext()

export const useTokens = () => {
  const context = useContext(TokenContext)
  if (!context) {
    throw new Error('useTokens must be used within a TokenProvider')
  }
  return context
}

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL
const API = `${BACKEND_URL}/api`

export const TokenProvider = ({ children }) => {
  const { user, refreshUser } = useAuth()
  const [packages, setPackages] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(false)

  // Get token packages
  const fetchPackages = async () => {
    try {
      const response = await axios.get(`${API}/tokens/packages`)
      setPackages(response.data)
    } catch (error) {
      console.error('Failed to fetch token packages:', error)
    }
  }

  // Purchase tokens
  const purchaseTokens = async (packageId) => {
    setLoading(true)
    try {
      const response = await axios.post(`${API}/tokens/purchase`, {
        package_id: packageId
      })
      
      return {
        success: true,
        client_secret: response.data.client_secret,
        package: response.data.package
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Purchase failed'
      }
    } finally {
      setLoading(false)
    }
  }

  // Confirm payment
  const confirmPayment = async (paymentIntentId) => {
    try {
      const response = await axios.post(`${API}/tokens/confirm-payment`, {
        payment_intent_id: paymentIntentId
      })
      
      // Refresh user data to get updated token balance
      await refreshUser()
      
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Payment confirmation failed'
      }
    }
  }

  // Get user's token balance
  const getTokenBalance = () => {
    return user?.token_balance || 0
  }

  // Get user's total earned
  const getTotalEarned = () => {
    return user?.total_earned || 0
  }

  // Get user's total spent
  const getTotalSpent = () => {
    return user?.total_spent || 0
  }

  useEffect(() => {
    fetchPackages()
  }, [])

  const value = {
    packages,
    transactions,
    loading,
    purchaseTokens,
    confirmPayment,
    getTokenBalance,
    getTotalEarned,
    getTotalSpent,
    refreshPackages: fetchPackages
  }

  return (
    <TokenContext.Provider value={value}>
      {children}
    </TokenContext.Provider>
  )
}