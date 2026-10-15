import React, { createContext, useContext, useState, useEffect } from "react"
import { TokenPackage, TokenTransaction } from "@/types"
import { MockStore, tokenPackages } from "@/data/mockStore"
import { useAuth } from "./AuthContext"
import { showToast } from "@/components/ui/toaster"
import confetti from "canvas-confetti"

interface TokenContextValue {
  packages: TokenPackage[]
  transactions: TokenTransaction[]
  loading: boolean
  purchaseTokens: (packageId: string) => Promise<{ success: boolean; package?: TokenPackage }>
  withdrawTokens: (credits: number, method: string, email: string) => Promise<{ success: boolean; message: string }>
  getTokenBalance: () => number
  getTotalEarned: () => number
  getTotalSpent: () => number
  refreshPackages: () => void
}

const TokenContext = createContext<TokenContextValue | null>(null)

export const useTokens = () => {
  const context = useContext(TokenContext)
  if (!context) {
    throw new Error("useTokens must be used within a TokenProvider")
  }
  return context
}

export const TokenProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, refreshUser } = useAuth()
  const [packages] = useState<TokenPackage[]>(tokenPackages)
  const [transactions, setTransactions] = useState<TokenTransaction[]>(() => MockStore.getTransactions())
  const [loading, setLoading] = useState<boolean>(false)

  const reloadTransactions = () => {
    setTransactions(MockStore.getTransactions())
  }

  useEffect(() => {
    const handleStorageChange = () => {
      reloadTransactions()
    }
    window.addEventListener("wayacreate_storage_change", handleStorageChange)
    return () => {
      window.removeEventListener("wayacreate_storage_change", handleStorageChange)
    }
  }, [])

  const purchaseTokens = async (packageId: string): Promise<{ success: boolean; package?: TokenPackage }> => {
    const pkg = packages.find((p) => p.id === packageId)
    if (!pkg) {
      return { success: false }
    }

    setLoading(true)
    await new Promise((res) => setTimeout(res, 600))

    const totalCredits = pkg.credits + pkg.bonus_credits
    MockStore.addCredits(
      totalCredits,
      `Purchased ${pkg.name} (${totalCredits} credits)`,
      pkg.price_usd
    )

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      })
    } catch (e) {
      // Ignore confetti errors
    }

    showToast({
      title: "Tokens Added!",
      description: `Added ${totalCredits} credits to your WayaCreate balance.`,
      variant: "success",
    })

    refreshUser()
    reloadTransactions()
    setLoading(false)

    return { success: true, package: pkg }
  }

  const withdrawTokens = async (credits: number, method: string, email: string): Promise<{ success: boolean; message: string }> => {
    setLoading(true)
    await new Promise((res) => setTimeout(res, 500))

    const rate = 0.1 // 10 credits = $1.00 USD
    const usdAmount = +(credits * rate).toFixed(2)

    const success = MockStore.requestWithdrawal(credits, usdAmount, method, email)
    setLoading(false)

    if (success) {
      showToast({
        title: "Withdrawal Submitted",
        description: `Successfully requested payout of $${usdAmount} USD (${credits} credits).`,
        variant: "success",
      })
      refreshUser()
      reloadTransactions()
      return { success: true, message: "Payout request submitted." }
    } else {
      showToast({
        title: "Insufficient Balance",
        description: "You do not have enough credits for this withdrawal.",
        variant: "destructive",
      })
      return { success: false, message: "Insufficient credits." }
    }
  }

  const getTokenBalance = () => {
    return user?.token_balance || 0
  }

  const getTotalEarned = () => {
    return user?.total_earned || 0
  }

  const getTotalSpent = () => {
    return user?.total_spent || 0
  }

  const value: TokenContextValue = {
    packages,
    transactions,
    loading,
    purchaseTokens,
    withdrawTokens,
    getTokenBalance,
    getTotalEarned,
    getTotalSpent,
    refreshPackages: () => {},
  }

  return <TokenContext.Provider value={value}>{children}</TokenContext.Provider>
}
