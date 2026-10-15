import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Play, 
  Users, 
  Star,
  ArrowRight,
  Gamepad2,
  Youtube,
  Palette,
  Code,
  ShoppingCart,
  Award,
  Zap,
} from "lucide-react"

export function HeroSection() {
  const [liveStats] = useState({
    total_users: 1250,
    total_creators: 380,
    total_orders: 5420,
    total_reviews: 1890,
    average_rating: 4.96
  })
  
  const socialProof = {
    success_stories: [
      { user: "Alex M.", achievement: "Earned 2,500 credits in first week", category: "Design" },
      { user: "Sarah K.", achievement: "140+ completed orders", category: "Gaming" },
      { user: "Mike R.", achievement: "100% 5-star rating", category: "Development" }
    ]
  }

  const stats = [
    { label: "Active Users", value: liveStats.total_users.toLocaleString(), icon: Users, color: "text-blue-500" },
    { label: "Creators", value: liveStats.total_creators.toLocaleString(), icon: Gamepad2, color: "text-purple-500" },
    { label: "Orders Completed", value: liveStats.total_orders.toLocaleString(), icon: ShoppingCart, color: "text-green-500" },
    { label: "Avg Rating", value: liveStats.average_rating.toFixed(2), icon: Star, color: "text-yellow-500" }
  ]

  const features = [
    {
      icon: Gamepad2,
      title: "Gaming Content",
      description: "Unreal Engine, Unity, Minecraft & Roblox assets"
    },
    {
      icon: Palette,
      title: "Design Mastery",
      description: "Blender 3D modeling, Shaders & UI Kits"
    },
    {
      icon: Code,
      title: "Tech Innovation",
      description: "AI Studio code generator & netcode tools"
    }
  ]

  return (
    <section className="relative py-12 md:py-20 overflow-hidden">
      {/* Gaming-inspired background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
      <div className="absolute top-20 left-10 w-48 h-48 bg-primary/10 rounded-full blur-3xl animate-float pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-60 h-60 bg-accent/15 rounded-full blur-3xl animate-float pointer-events-none" style={{ animationDelay: "1s" }} />
      
      <div className="container relative">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6 md:space-y-8">
            <Badge variant="secondary" className="w-fit text-xs font-semibold px-3 py-1 bg-primary/10 text-primary border-primary/20">
              🎮 By Waya Steurbaut - WayaCreate Community
            </Badge>

            <div className="space-y-4">
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
                Where YOUR{" "}
                <span className="gradient-gaming bg-clip-text text-transparent block neon-text">
                  Gaming Ideas
                </span>
                Come to Life! 🚀
              </h1>
              <p className="text-base md:text-lg text-muted-foreground max-w-lg leading-relaxed">
                Join our community-driven platform for gaming, 3D design, freelance gigs, and cutting-edge tech. Every gig and digital product includes instructional video tutorials!
              </p>
            </div>

            {/* YouTube Channel Banner */}
            <div className="flex items-center space-x-3 p-3.5 bg-red-500/10 dark:bg-red-950/20 rounded-xl border border-red-500/20">
              <div className="p-2 bg-red-500/20 rounded-lg text-red-500">
                <Youtube className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm text-foreground">
                  Subscribe to WayaCreate on YouTube!
                </p>
                <a 
                  href="https://www.youtube.com/@wayasteurbaut" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-red-500 hover:underline font-medium"
                >
                  @wayasteurbaut - 125K+ Creators Learning Together
                </a>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <Link to="/marketplace">
                <Button size="lg" className="w-full sm:w-auto text-sm px-6 h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-md">
                  Explore Marketplace
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/tutorials">
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-sm px-6 h-11 border-border font-medium">
                  <Play className="mr-2 h-4 w-4 text-primary" />
                  Watch Tutorials
                </Button>
              </Link>
              <Link to="/bidding">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto text-sm px-5 h-11">
                  Smart Bidding
                </Button>
              </Link>
            </div>

            {/* Live Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {stats.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <Card key={index} className="gaming-card bg-card/60 backdrop-blur-sm border-border">
                    <CardContent className="p-3.5 text-center">
                      <div className="flex items-center justify-center mb-1.5">
                        <Icon className={`h-5 w-5 ${stat.color}`} />
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full ml-1.5 animate-pulse" />
                      </div>
                      <div className="text-xl md:text-2xl font-bold">{stat.value}</div>
                      <div className="text-[11px] text-muted-foreground">{stat.label}</div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Live Success Stories */}
            <div className="p-3.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
              <div className="flex items-center space-x-2 mb-2">
                <Award className="h-4 w-4 text-emerald-500" />
                <span className="font-semibold text-xs text-foreground">Recent Success Stories</span>
                <Badge className="bg-emerald-500 text-white text-[10px] h-4 px-1.5">LIVE</Badge>
              </div>
              <div className="grid sm:grid-cols-3 gap-2">
                {socialProof.success_stories.map((story, index) => (
                  <div key={index} className="text-xs bg-background/50 p-2 rounded-lg border border-emerald-500/10">
                    <span className="font-semibold">{story.user}</span>
                    <span className="text-muted-foreground block text-[11px] mt-0.5">{story.achievement}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Interactive Preview Card */}
          <div className="relative">
            <Card className="gradient-card border-primary/30 shadow-xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between pb-4 border-b">
                  <div className="flex items-center space-x-2">
                    <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-bold text-sm">Live Marketplace Activity</span>
                  </div>
                  <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                    Real-time
                  </Badge>
                </div>

                <div className="space-y-3 mt-4">
                  <div className="flex items-center justify-between p-3 bg-background/80 rounded-xl border">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center text-primary">
                        <Gamepad2 className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm">Cyberpunk Alley Pack (50+ Models)</div>
                        <div className="text-xs text-muted-foreground">by Waya Steurbaut • Includes 45m tutorial</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-sm text-primary">150 credits</span>
                      <span className="block text-[10px] text-emerald-500">🔥 Top Asset</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-background/80 rounded-xl border">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center text-purple-500">
                        <Palette className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm">Cyberpunk & Sci-Fi UI/UX System</div>
                        <div className="text-xs text-muted-foreground">by Sarah Chen • Figma + React</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-sm text-primary">320 credits</span>
                      <span className="block text-[10px] text-blue-500">UI System</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-background/80 rounded-xl border">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center text-emerald-500">
                        <Code className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm">Unity C# Multiplayer Rollback Netcode</div>
                        <div className="text-xs text-muted-foreground">by Marcus Vance • Full source code</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-sm text-primary">450 credits</span>
                      <span className="block text-[10px] text-purple-500">Verified Gig</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <Zap className="h-4 w-4 text-primary" />
                    <span>Instant token checkout with buyer protection</span>
                  </div>
                  <Link to="/marketplace">
                    <Button size="sm" className="bg-primary text-primary-foreground text-xs">
                      View All
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Floating mini badges */}
            <div className="absolute -bottom-4 -left-4 hidden sm:block">
              <div className="p-3 bg-background/95 backdrop-blur-md border rounded-xl shadow-lg flex items-center space-x-3 text-xs">
                <div className="p-1.5 bg-yellow-500/20 text-yellow-500 rounded-lg">
                  <Star className="h-4 w-4 fill-current" />
                </div>
                <div>
                  <div className="font-bold">4.96 / 5.0 Rating</div>
                  <div className="text-[10px] text-muted-foreground">Over 1,800 client reviews</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
