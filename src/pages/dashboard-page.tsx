import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useTokens } from "@/contexts/TokenContext"
import { MockStore } from "@/data/mockStore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  BarChart3, 
  Coins, 
  ShoppingCart, 
  Upload, 
  Star, 
  TrendingUp, 
  Clock, 
  CheckCircle2,
  ArrowRight,
  Shield,
  Zap
} from "lucide-react"
import { Link, useNavigate } from "react-router-dom"

export function DashboardPage() {
  const { user } = useAuth()
  const { getTokenBalance, getTotalEarned } = useTokens()
  const navigate = useNavigate()

  const orders = MockStore.getOrders()
  const services = MockStore.getServices().filter(s => s.creator_id === user?.id)
  const content = MockStore.getContent().filter(c => c.creator_id === user?.id)

  return (
    <div className="container py-8 md:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Creator Dashboard
            </h1>
            <Badge className="bg-primary text-primary-foreground text-xs">
              Level {user?.level.level || 1}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Welcome back, {user?.display_name}. Track your gig orders, active tenders, and asset earnings.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link to="/upload">
            <Button size="sm" className="bg-primary text-primary-foreground">
              <Upload className="mr-1.5 h-4 w-4" />
              Upload Content
            </Button>
          </Link>
          <Link to="/tokens">
            <Button variant="outline" size="sm">
              <Coins className="mr-1.5 h-4 w-4 text-primary" />
              Tokens
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="gaming-card border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-muted-foreground font-semibold">Token Balance</span>
              <Coins className="h-4 w-4 text-primary" />
            </div>
            <div className="text-2xl font-black text-primary">{getTokenBalance().toLocaleString()}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">credits ready for payout</div>
          </CardContent>
        </Card>

        <Card className="gaming-card border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-muted-foreground font-semibold">Active Orders</span>
              <ShoppingCart className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-black text-foreground">{orders.filter(o => o.status === 'in_progress').length}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">milestones in production</div>
          </CardContent>
        </Card>

        <Card className="gaming-card border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-muted-foreground font-semibold">Published Assets</span>
              <Upload className="h-4 w-4 text-purple-500" />
            </div>
            <div className="text-2xl font-black text-foreground">{content.length + services.length}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">services &amp; digital packs</div>
          </CardContent>
        </Card>

        <Card className="gaming-card border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-muted-foreground font-semibold">Creator Rating</span>
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
            </div>
            <div className="text-2xl font-black text-foreground">{user?.rating || 4.96}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">from {user?.review_count || 248} reviews</div>
          </CardContent>
        </Card>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Recent Client Orders &amp; Milestones</h2>
          <Link to="/orders" className="text-xs text-primary font-semibold hover:underline">
            View All Orders →
          </Link>
        </div>

        <div className="space-y-3">
          {orders.map((order) => (
            <Card key={order.id} className="gaming-card border-border bg-card p-5">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm">{order.service_title}</span>
                    <Badge variant="outline" className={`text-[10px] capitalize ${
                      order.status === 'completed' ? 'text-emerald-500 border-emerald-500/30' : 'text-blue-500 border-blue-500/30'
                    }`}>
                      {order.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Client: {order.client_name} • Due: {order.delivery_date}
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <span className="font-extrabold text-sm text-primary">{order.amount} credits</span>
                    <span className="block text-[10px] text-muted-foreground">held in escrow</span>
                  </div>
                  <Button size="sm" variant="outline" className="text-xs" onClick={() => navigate("/orders")}>
                    Manage Order
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
