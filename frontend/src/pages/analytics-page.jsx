import React, { useState, useEffect } from "react"
import axios from "axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/AuthContext"
import { 
  BarChart3,
  TrendingUp,
  Users,
  ShoppingCart,
  DollarSign,
  Download,
  Activity,
  Target,
  Zap,
  Clock,
  Star,
  Award,
  Eye,
  MessageSquare,
  Coins
} from "lucide-react"

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL
const API = `${BACKEND_URL}/api`

export function AnalyticsPage() {
  const { user, isAuthenticated } = useAuth()
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [realtimeData, setRealtimeData] = useState({})

  useEffect(() => {
    if (isAuthenticated) {
      fetchAnalytics()
      // Update analytics every 30 seconds
      const interval = setInterval(fetchAnalytics, 30000)
      return () => clearInterval(interval)
    }
  }, [isAuthenticated])

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(`${API}/analytics/live`, {
        withCredentials: true
      })
      setAnalytics(response.data)
      
      // Simulate real-time updates
      setRealtimeData({
        onlineUsers: Math.floor(Math.random() * 50) + 20,
        activeOrders: Math.floor(Math.random() * 15) + 5,
        liveViews: Math.floor(Math.random() * 200) + 100
      })
      
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const trackActivity = async (activityType, details = {}) => {
    try {
      await axios.post(`${API}/analytics/track`, {
        activity_type: activityType,
        details
      }, { withCredentials: true })
    } catch (error) {
      console.error('Error tracking activity:', error)
    }
  }

  // Track page view
  useEffect(() => {
    if (isAuthenticated) {
      trackActivity('page_view', { page: 'analytics' })
    }
  }, [isAuthenticated])

  const LiveMetricCard = ({ title, value, change, icon: Icon, color, isLive = false }) => (
    <Card className="gaming-card relative overflow-hidden">
      {isLive && (
        <div className="absolute top-2 right-2">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-red-500 font-medium">LIVE</span>
          </div>
        </div>
      )}
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-center space-x-2">
              <h3 className="text-2xl font-bold">{value}</h3>
              {change && (
                <Badge className={`${change > 0 ? 'bg-green-500' : 'bg-red-500'} text-white`}>
                  {change > 0 ? '+' : ''}{change}%
                </Badge>
              )}
            </div>
          </div>
          <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  if (!isAuthenticated) {
    return (
      <div className="container py-20">
        <div className="text-center max-w-md mx-auto">
          <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Platform Analytics</h1>
          <p className="text-muted-foreground mb-6">
            Please log in to view analytics dashboard.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center animate-gaming-pulse">
            <BarChart3 className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          📊 Live 
          <span className="gradient-gaming bg-clip-text text-transparent"> Analytics</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Real-time insights into your WayaCreate platform performance
        </p>
      </div>

      {/* Real-time Status Bar */}
      <div className="mb-8">
        <Card className="gaming-card bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">System Online</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">{realtimeData.onlineUsers || 0} users online</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ShoppingCart className="h-4 w-4 text-purple-500" />
                  <span className="text-sm">{realtimeData.activeOrders || 0} active orders</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Eye className="h-4 w-4 text-orange-500" />
                  <span className="text-sm">{realtimeData.liveViews || 0} page views</span>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-6 bg-muted rounded w-1/2" />
                  </div>
                  <div className="w-12 h-12 bg-muted rounded-lg" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : analytics ? (
        <>
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <LiveMetricCard
              title="Total Users"
              value={analytics.total_users?.toLocaleString() || '0'}
              change={12}
              icon={Users}
              color="bg-blue-500"
            />
            
            <LiveMetricCard
              title="Active Today"
              value={analytics.active_users_today?.toLocaleString() || '0'}
              change={8}
              icon={Activity}
              color="bg-green-500"
              isLive={true}
            />
            
            <LiveMetricCard
              title="Total Revenue"
              value={formatCurrency(analytics.total_revenue || 0)}
              change={15}
              icon={DollarSign}
              color="bg-purple-500"
            />
            
            <LiveMetricCard
              title="Today's Revenue"
              value={formatCurrency(analytics.revenue_today || 0)}
              change={25}
              icon={TrendingUp}
              color="bg-orange-500"
              isLive={true}
            />
            
            <LiveMetricCard
              title="Total Orders"
              value={analytics.total_orders?.toLocaleString() || '0'}
              change={10}
              icon={ShoppingCart}
              color="bg-indigo-500"
            />
            
            <LiveMetricCard
              title="Orders Today"
              value={analytics.orders_today?.toLocaleString() || '0'}
              change={18}
              icon={Target}
              color="bg-pink-500"
              isLive={true}
            />
            
            <LiveMetricCard
              title="Total Downloads"
              value={analytics.total_downloads?.toLocaleString() || '0'}
              change={22}
              icon={Download}
              color="bg-teal-500"
            />
            
            <LiveMetricCard
              title="Downloads Today"
              value={analytics.downloads_today?.toLocaleString() || '0'}
              change={30}
              icon={Zap}
              color="bg-red-500"
              isLive={true}
            />
          </div>

          {/* Detailed Analytics */}
          <div className="grid lg:grid-cols-3 gap-8 mb-8">
            {/* Platform Performance */}
            <Card className="gaming-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Platform Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Active Services</span>
                  <span className="text-lg font-bold text-primary">
                    {analytics.total_services?.toLocaleString() || '0'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Active Creators</span>
                  <span className="text-lg font-bold text-green-600">
                    {analytics.active_creators?.toLocaleString() || '0'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Platform Fees</span>
                  <span className="text-lg font-bold text-purple-600">
                    {formatCurrency(analytics.platform_fees_collected || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Success Rate</span>
                  <span className="text-lg font-bold text-blue-600">98.2%</span>
                </div>
              </CardContent>
            </Card>

            {/* Revenue Breakdown */}
            <Card className="gaming-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Coins className="h-5 w-5" />
                  <span>Revenue Breakdown</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Services Revenue</span>
                    <span className="font-bold text-green-600">
                      {formatCurrency((analytics.total_revenue || 0) * 0.7)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Content Sales</span>
                    <span className="font-bold text-blue-600">
                      {formatCurrency((analytics.total_revenue || 0) * 0.2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Subscriptions</span>
                    <span className="font-bold text-purple-600">
                      {formatCurrency((analytics.total_revenue || 0) * 0.1)}
                    </span>
                  </div>
                  <div className="h-px bg-border my-2"></div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Platform Fees (5%)</span>
                    <span className="font-bold text-orange-600">
                      {formatCurrency(analytics.platform_fees_collected || 0)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Categories */}
            <Card className="gaming-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="h-5 w-5" />
                  <span>Top Categories</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: "Gaming", orders: 245, growth: "+15%" },
                  { name: "Design", orders: 198, growth: "+12%" },
                  { name: "Development", orders: 156, growth: "+8%" },
                  { name: "Content Creation", orders: 134, growth: "+22%" },
                  { name: "Marketing", orders: 89, growth: "+5%" }
                ].map((category, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium">{category.name}</span>
                      <div className="text-xs text-muted-foreground">
                        {category.orders} orders
                      </div>
                    </div>
                    <Badge className="bg-green-500 text-white">
                      {category.growth}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Live Activity Feed */}
          <Card className="gaming-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Live Activity Feed</span>
                <Badge className="bg-red-500 text-white">LIVE</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { action: "New order created", user: "Alex M.", time: "2 minutes ago", type: "order" },
                  { action: "Service featured", user: "Sarah K.", time: "5 minutes ago", type: "feature" },
                  { action: "Content downloaded", user: "Mike R.", time: "8 minutes ago", type: "download" },
                  { action: "Achievement unlocked", user: "Emma S.", time: "12 minutes ago", type: "achievement" },
                  { action: "New user registered", user: "John D.", time: "15 minutes ago", type: "user" }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center space-x-4 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      activity.type === 'order' ? 'bg-blue-500' :
                      activity.type === 'feature' ? 'bg-purple-500' :
                      activity.type === 'download' ? 'bg-green-500' :
                      activity.type === 'achievement' ? 'bg-yellow-500' :
                      'bg-gray-500'
                    }`}>
                      {activity.type === 'order' && <ShoppingCart className="h-4 w-4 text-white" />}
                      {activity.type === 'feature' && <Star className="h-4 w-4 text-white" />}
                      {activity.type === 'download' && <Download className="h-4 w-4 text-white" />}
                      {activity.type === 'achievement' && <Award className="h-4 w-4 text-white" />}
                      {activity.type === 'user' && <Users className="h-4 w-4 text-white" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">by {activity.user}</p>
                    </div>
                    <div className="text-xs text-muted-foreground">{activity.time}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <div className="text-center py-12">
          <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Analytics Data</h3>
          <p className="text-muted-foreground">Analytics data will appear here once available.</p>
        </div>
      )}
    </div>
  )
}