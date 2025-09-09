import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import { useAuth } from "@/contexts/AuthContext"
import { useTokens } from "@/contexts/TokenContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Star,
  ShoppingCart,
  Coins,
  DollarSign,
  Eye,
  MessageSquare,
  Clock,
  Award,
  Zap,
  Upload,
  Play,
  Download,
  Target,
  Calendar,
  CheckCircle,
  AlertCircle,
  ArrowUpRight,
  Plus
} from "lucide-react"

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL
const API = `${BACKEND_URL}/api`

export function DashboardPage() {
  const { user, isAuthenticated } = useAuth()
  const { getTokenBalance } = useTokens()
  const [dashboardData, setDashboardData] = useState({
    stats: {
      total_earnings: 2500,
      orders_completed: 23,
      active_orders: 5,
      rating: 4.9,
      views_today: 156,
      messages_unread: 3
    },
    recent_orders: [
      {
        id: "order1",
        title: "Epic Castle Build Tutorial",
        client: "Mike Johnson",
        amount: 250,
        status: "in_progress",
        deadline: "2 days",
        progress: 75
      },
      {
        id: "order2", 
        title: "3D Character Model",
        client: "Sarah Wilson",
        amount: 400,
        status: "delivered",
        deadline: "completed",
        progress: 100
      },
      {
        id: "order3",
        title: "Blender Animation Course",
        client: "Alex Chen",
        amount: 600,
        status: "pending",
        deadline: "5 days",
        progress: 0
      }
    ],
    achievements: [
      { name: "First Sale", unlocked: true, icon: "🎉" },
      { name: "Rising Star", unlocked: true, icon: "⭐" },
      { name: "Community Favorite", unlocked: false, progress: 65, icon: "💖" }
    ],
    goals: [
      { name: "Reach $5000 earnings", current: 2500, target: 5000, icon: DollarSign },
      { name: "Complete 50 orders", current: 23, target: 50, icon: Target },
      { name: "Achieve 5.0 rating", current: 4.9, target: 5.0, icon: Star }
    ]
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated && user?.role !== 'viewer') {
      fetchDashboardData()
      // Update every 30 seconds
      const interval = setInterval(fetchDashboardData, 30000)
      return () => clearInterval(interval)
    }
  }, [isAuthenticated, user])

  const fetchDashboardData = async () => {
    try {
      // Simulate API calls - replace with real endpoints
      // const response = await axios.get(`${API}/dashboard/stats`, { withCredentials: true })
      // setDashboardData(response.data)
      
      // Simulate some live updates
      setDashboardData(prev => ({
        ...prev,
        stats: {
          ...prev.stats,
          views_today: prev.stats.views_today + Math.floor(Math.random() * 3),
          messages_unread: Math.floor(Math.random() * 5)
        }
      }))
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="container py-20">
        <div className="text-center max-w-md mx-auto">
          <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Creator Dashboard</h1>
          <p className="text-muted-foreground mb-6">
            Please log in to access your creator dashboard.
          </p>
        </div>
      </div>
    )
  }

  if (user?.role === 'viewer') {
    return (
      <div className="container py-20">
        <div className="text-center max-w-2xl mx-auto">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Upload className="h-8 w-8 text-white" />
          </div>
          <Badge variant="secondary" className="mb-4">
            🚀 Become a Creator
          </Badge>
          <h1 className="text-4xl font-bold mb-6">
            Unlock Your 
            <span className="gradient-gaming bg-clip-text text-transparent"> Creative Potential</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of creators earning money by sharing their skills and passion.
            Upgrade to a Creator account and start building your empire today!
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {[
              { icon: DollarSign, title: "Earn Money", desc: "Get paid for your skills and creativity" },
              { icon: Users, title: "Build Community", desc: "Connect with clients and fans worldwide" },
              { icon: Award, title: "Level Up", desc: "Unlock achievements and grow your reputation" }
            ].map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index} className="gaming-card">
                  <CardContent className="p-6 text-center">
                    <Icon className="h-8 w-8 text-primary mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.desc}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="space-y-4">
            <Button size="lg" className="gaming-card" asChild>
              <Link to="/subscription">
                <ArrowUpRight className="mr-2 h-5 w-5" />
                Upgrade to Creator Plan
              </Link>
            </Button>
            <p className="text-sm text-muted-foreground">
              Starting at just $9.99/month • Cancel anytime
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">
            Welcome back, 
            <span className="gradient-gaming bg-clip-text text-transparent"> {user?.display_name}</span>! 👋
          </h1>
          <p className="text-muted-foreground mt-2">
            Track your performance and manage your creator business
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" asChild>
            <Link to="/analytics">
              <BarChart3 className="mr-2 h-4 w-4" />
              Full Analytics
            </Link>
          </Button>
          <Button className="gaming-card" asChild>
            <Link to="/upload">
              <Plus className="mr-2 h-4 w-4" />
              Create Content
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {[
          { 
            label: "Total Earnings", 
            value: `$${(dashboardData.stats.total_earnings * 0.10).toFixed(0)}`, 
            change: "+12%", 
            icon: DollarSign, 
            color: "text-green-500" 
          },
          { 
            label: "Orders Completed", 
            value: dashboardData.stats.orders_completed, 
            change: "+3", 
            icon: CheckCircle, 
            color: "text-blue-500" 
          },
          { 
            label: "Active Orders", 
            value: dashboardData.stats.active_orders, 
            change: "2 due", 
            icon: Clock, 
            color: "text-orange-500" 
          },
          { 
            label: "Rating", 
            value: dashboardData.stats.rating.toFixed(1), 
            change: "+0.1", 
            icon: Star, 
            color: "text-yellow-500" 
          },
          { 
            label: "Views Today", 
            value: dashboardData.stats.views_today, 
            change: "+24", 
            icon: Eye, 
            color: "text-purple-500" 
          },
          { 
            label: "Credits", 
            value: getTokenBalance(), 
            change: `$${(getTokenBalance() * 0.10).toFixed(0)}`, 
            icon: Coins, 
            color: "text-primary" 
          }
        ].map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="gaming-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                  <span className="text-xs text-green-600 font-medium">{stat.change}</span>
                </div>
                <div className="text-2xl font-bold mb-1">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Recent Orders */}
          <Card className="gaming-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <ShoppingCart className="h-5 w-5" />
                <span>Recent Orders</span>
              </CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link to="/orders">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.recent_orders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex-1">
                      <h4 className="font-medium mb-1">{order.title}</h4>
                      <p className="text-sm text-muted-foreground">by {order.client}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <div className="flex items-center space-x-1">
                          <Coins className="h-3 w-3 text-primary" />
                          <span className="text-sm font-medium">{order.amount} credits</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{order.deadline}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <Badge 
                        className={
                          order.status === 'completed' ? 'bg-green-500' :
                          order.status === 'in_progress' ? 'bg-blue-500' :
                          order.status === 'delivered' ? 'bg-purple-500' :
                          'bg-yellow-500'
                        }
                      >
                        {order.status.replace('_', ' ')}
                      </Badge>
                      <div className="mt-2 w-20">
                        <Progress value={order.progress} className="h-1" />
                        <span className="text-xs text-muted-foreground">{order.progress}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Goals Progress */}
          <Card className="gaming-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Your Goals</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {dashboardData.goals.map((goal, index) => {
                  const Icon = goal.icon
                  const progress = (goal.current / goal.target) * 100
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Icon className="h-4 w-4 text-primary" />
                          <span className="font-medium">{goal.name}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {goal.current}/{goal.target}
                        </span>
                      </div>
                      <Progress value={progress} className="h-2" />
                      <div className="text-xs text-muted-foreground">
                        {Math.round(progress)}% complete
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="gaming-card">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full gaming-card" asChild>
                <Link to="/upload">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Content
                </Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/messages">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Messages ({dashboardData.stats.messages_unread})
                </Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/achievements">
                  <Award className="mr-2 h-4 w-4" />
                  View Achievements
                </Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/tokens">
                  <Coins className="mr-2 h-4 w-4" />
                  Manage Tokens
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Recent Achievements */}
          <Card className="gaming-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-5 w-5" />
                <span>Achievements</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardData.achievements.map((achievement, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg ${
                      achievement.unlocked ? 'bg-yellow-500/20' : 'bg-gray-200 dark:bg-gray-700'
                    }`}>
                      {achievement.unlocked ? achievement.icon : '🔒'}
                    </div>
                    <div className="flex-1">
                      <div className={`font-medium text-sm ${achievement.unlocked ? 'text-yellow-600' : ''}`}>
                        {achievement.name}
                      </div>
                      {!achievement.unlocked && achievement.progress && (
                        <div className="mt-1">
                          <Progress value={achievement.progress} className="h-1" />
                          <span className="text-xs text-muted-foreground">{achievement.progress}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Performance Insights */}
          <Card className="gaming-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>This Week</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Profile Views</span>
                  <div className="flex items-center space-x-1">
                    <span className="font-medium">1.2K</span>
                    <TrendingUp className="h-3 w-3 text-green-500" />
                    <span className="text-xs text-green-600">+15%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Service Clicks</span>
                  <div className="flex items-center space-x-1">
                    <span className="font-medium">486</span>
                    <TrendingUp className="h-3 w-3 text-green-500" />
                    <span className="text-xs text-green-600">+22%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Orders Received</span>
                  <div className="flex items-center space-x-1">
                    <span className="font-medium">12</span>
                    <TrendingUp className="h-3 w-3 text-green-500" />
                    <span className="text-xs text-green-600">+8%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Response Time</span>
                  <div className="flex items-center space-x-1">
                    <span className="font-medium">2.1h</span>
                    <TrendingDown className="h-3 w-3 text-green-500" />
                    <span className="text-xs text-green-600">-12%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}