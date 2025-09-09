import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Play, 
  TrendingUp, 
  Users, 
  Star,
  ArrowRight,
  Gamepad2,
  Zap,
  Shield,
  Youtube,
  Palette,
  Code,
  ShoppingCart,
  Award,
  DollarSign
} from "lucide-react"

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL
const API = `${BACKEND_URL}/api`

export function HeroSection() {
  const [liveStats, setLiveStats] = useState({
    total_users: 1250,
    total_creators: 380,
    total_orders: 5420,
    total_reviews: 1890,
    average_rating: 4.9
  })
  
  const [socialProof, setSocialProof] = useState({
    success_stories: [
      { user: "Alex M.", achievement: "Earned $2,500 in first month", category: "Design" },
      { user: "Sarah K.", achievement: "500+ completed orders", category: "Gaming" },
      { user: "Mike R.", achievement: "100% 5-star rating", category: "Development" }
    ]
  })

  useEffect(() => {
    fetchLiveStats()
    // Update stats every 30 seconds
    const interval = setInterval(fetchLiveStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchLiveStats = async () => {
    try {
      const response = await axios.get(`${API}/social-proof/stats`)
      setLiveStats(response.data)
      setSocialProof(response.data)
    } catch (error) {
      console.error('Error fetching live stats:', error)
      // Use mock data with simulated growth
      setLiveStats(prev => ({
        ...prev,
        total_users: prev.total_users + Math.floor(Math.random() * 5),
        total_orders: prev.total_orders + Math.floor(Math.random() * 3)
      }))
    }
  }

  const stats = [
    { label: "Active Users", value: liveStats.total_users?.toLocaleString() || "1.2K+", icon: Users, color: "text-blue-500" },
    { label: "Creators", value: liveStats.total_creators?.toLocaleString() || "380+", icon: Gamepad2, color: "text-purple-500" },
    { label: "Orders Completed", value: liveStats.total_orders?.toLocaleString() || "5.4K+", icon: ShoppingCart, color: "text-green-500" },
    { label: "Avg Rating", value: liveStats.average_rating?.toFixed(1) || "4.9", icon: Star, color: "text-yellow-500" }
  ]

  const features = [
    {
      icon: Gamepad2,
      title: "Gaming Content",
      description: "Minecraft, Fortnite, Roblox tutorials and builds"
    },
    {
      icon: Palette,
      title: "Design Mastery",
      description: "Blender 3D modeling and video editing guides"
    },
    {
      icon: Code,
      title: "Tech Innovation",
      description: "AI tools, graphics design, and cutting-edge tech"
    }
  ]

  return (
    <section className="relative py-12 md:py-20 overflow-hidden">
      {/* Gaming-inspired background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
      
      <div className="container relative">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6 md:space-y-8">
            {/* Badge */}
            <Badge variant="secondary" className="w-fit animate-gaming-pulse">
              🎮 By Waya Steurbaut - WayaCreate Community
            </Badge>

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold leading-tight">
                Where YOUR 
                <span className="gradient-gaming bg-clip-text text-transparent block neon-text">
                  Gaming Ideas
                </span>
                Come to Life! 🚀
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-lg">
                Join our community-driven platform for gaming, design, and cutting-edge tech content. 
                From Minecraft builds to Blender tutorials - we've got you covered!
              </p>
            </div>

            {/* YouTube Channel Link */}
            <div className="flex items-center space-x-3 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
              <Youtube className="h-6 w-6 text-red-600" />
              <div>
                <p className="font-medium text-red-900 dark:text-red-100">
                  Subscribe to WayaCreate on YouTube!
                </p>
                <a 
                  href="https://www.youtube.com/@wayasteurbaut" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-red-600 hover:text-red-700 underline"
                >
                  @wayasteurbaut - Gaming, Design & Tech Tutorials
                </a>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="text-lg px-6 md:px-8 gaming-card">
                Join Community
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-6 md:px-8 gaming-card">
                <Play className="mr-2 h-5 w-5" />
                Watch Tutorials
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 pt-6 md:pt-8">
              {stats.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <div key={index} className="text-center">
                    <div className="flex justify-center mb-2">
                      <Icon className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                    </div>
                    <div className="text-xl md:text-2xl font-bold">{stat.value}</div>
                    <div className="text-xs md:text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right Content */}
          <div className="relative">
            {/* Main Card */}
            <Card className="gradient-card border-primary/20 animate-float gaming-card">
              <CardContent className="p-6 md:p-8">
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl md:text-2xl font-bold">Live Community</h3>
                      <p className="text-muted-foreground">Real-time activity</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-sm text-green-500">Live</span>
                    </div>
                  </div>

                  {/* Mock Activity Data */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-background rounded-lg gaming-card">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-primary/20 rounded-full flex items-center justify-center">
                          <Gamepad2 className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium text-sm md:text-base">Epic Castle Build</div>
                          <div className="text-xs md:text-sm text-muted-foreground">by Waya</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-500">🔥 Hot</div>
                        <div className="text-xs md:text-sm text-muted-foreground">2.1K views</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-background rounded-lg gaming-card">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-accent/20 rounded-full flex items-center justify-center">
                          <Palette className="h-4 w-4 md:h-5 md:w-5 text-accent-foreground" />
                        </div>
                        <div>
                          <div className="font-medium text-sm md:text-base">Blender Character</div>
                          <div className="text-xs md:text-sm text-muted-foreground">by Community</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-blue-500">📚 Tutorial</div>
                        <div className="text-xs md:text-sm text-muted-foreground">1.5K views</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-background rounded-lg gaming-card">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-secondary/20 rounded-full flex items-center justify-center">
                          <Code className="h-4 w-4 md:h-5 md:w-5 text-secondary-foreground" />
                        </div>
                        <div>
                          <div className="font-medium text-sm md:text-base">AI Design Tips</div>
                          <div className="text-xs md:text-sm text-muted-foreground">by Expert</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-purple-500">🤖 AI</div>
                        <div className="text-xs md:text-sm text-muted-foreground">890 views</div>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button className="w-full gaming-card" variant="outline">
                    Join the Community 🎮
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Floating Feature Cards */}
            <div className="absolute -top-4 -left-4 md:-top-6 md:-left-6 space-y-3">
              {features.slice(0, 2).map((feature, index) => {
                const Icon = feature.icon
                return (
                  <Card key={index} className="w-36 md:w-48 animate-float gaming-card" style={{ animationDelay: `${index * 0.5}s` }}>
                    <CardContent className="p-3 md:p-4">
                      <div className="flex items-start space-x-2 md:space-x-3">
                        <Icon className="h-4 w-4 md:h-5 md:w-5 text-primary mt-0.5" />
                        <div>
                          <h4 className="font-medium text-xs md:text-sm">{feature.title}</h4>
                          <p className="text-xs text-muted-foreground">{feature.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Bottom Right Feature Card */}
            <div className="absolute -bottom-4 -right-4 md:-bottom-6 md:-right-6">
              <Card className="w-36 md:w-48 animate-float gaming-card" style={{ animationDelay: "1.5s" }}>
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-start space-x-2 md:space-x-3">
                    <Code className="h-4 w-4 md:h-5 md:w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium text-xs md:text-sm">{features[2].title}</h4>
                      <p className="text-xs text-muted-foreground">{features[2].description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}