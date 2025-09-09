import React from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Badge } from "@/components/ui/badge"

export function DashboardPage() {
  const { user } = useAuth()
  
  if (!user) {
    return (
      <div className="container py-20">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to access your dashboard</h1>
        </div>
      </div>
    )
  }

  if (user.role === 'viewer') {
    return (
      <div className="container py-20">
        <div className="text-center">
          <Badge variant="secondary" className="mb-4">
            🚫 Access Restricted
          </Badge>
          <h1 className="text-4xl font-bold mb-4">
            Creator
            <span className="gradient-primary bg-clip-text text-transparent"> Dashboard</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            This dashboard is for creators and businesses only. Upgrade your account to access creator tools and analytics.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-20">
      <div className="text-center">
        <Badge variant="secondary" className="mb-4">
          📊 Coming Soon
        </Badge>
        <h1 className="text-4xl font-bold mb-4">
          Creator
          <span className="gradient-primary bg-clip-text text-transparent"> Dashboard</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Your comprehensive dashboard for managing content, services, orders, and analytics.
        </p>
      </div>
    </div>
  )
}