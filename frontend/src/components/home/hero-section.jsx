import React from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Play, 
  TrendingUp, 
  Users, 
  Star,
  ArrowRight,
  Zap,
  Shield,
  Globe
} from "lucide-react"

export function HeroSection() {
  const stats = [
    { label: "Active Creators", value: "10K+", icon: Users },
    { label: "Content Pieces", value: "100K+", icon: Play },
    { label: "Token Transactions", value: "$2M+", icon: TrendingUp },
    { label: "Avg Rating", value: "4.9", icon: Star }
  ]

  const features = [
    {
      icon: Zap,
      title: "Instant Trading",
      description: "Trade content rights instantly with our token-based economy"
    },
    {
      icon: Shield,
      title: "Secure Platform",
      description: "Bank-level security for all your transactions and content"
    },
    {
      icon: Globe,
      title: "Global Community",
      description: "Connect with creators and traders from around the world"
    }
  ]

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
      
      <div className="container relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            {/* Badge */}
            <Badge variant="secondary" className="w-fit">
              🚀 New: Live Trading Streams Available Now
            </Badge>

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                Trade Content,
                <span className="gradient-primary bg-clip-text text-transparent block">
                  Build Wealth
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-lg">
                Join the revolution where creators and traders collaborate through 
                innovative content trading, educational resources, and live streaming experiences.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="text-lg px-8">
                Start Trading
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8">
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8">
              {stats.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <div key={index} className="text-center">
                    <div className="flex justify-center mb-2">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right Content */}
          <div className="relative">
            {/* Main Card */}
            <Card className="gradient-card border-primary/20 animate-float">
              <CardContent className="p-8">
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold">Live Trading</h3>
                      <p className="text-muted-foreground">Real-time market activity</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-sm text-green-500">Live</span>
                    </div>
                  </div>

                  {/* Mock Trading Data */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                          <Play className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">Trading Masterclass</div>
                          <div className="text-sm text-muted-foreground">by Alex Chen</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-500">+12.5%</div>
                        <div className="text-sm text-muted-foreground">150 TW</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center">
                          <TrendingUp className="h-5 w-5 text-accent-foreground" />
                        </div>
                        <div>
                          <div className="font-medium">Market Analysis</div>
                          <div className="text-sm text-muted-foreground">by Sarah Johnson</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-500">+8.3%</div>
                        <div className="text-sm text-muted-foreground">89 TW</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-secondary/20 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-secondary-foreground" />
                        </div>
                        <div>
                          <div className="font-medium">Community Tips</div>
                          <div className="text-sm text-muted-foreground">by Mike Davis</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-red-500">-2.1%</div>
                        <div className="text-sm text-muted-foreground">45 TW</div>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button className="w-full" variant="outline">
                    View All Trades
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Floating Feature Cards */}
            <div className="absolute -top-6 -left-6 space-y-3">
              {features.slice(0, 2).map((feature, index) => {
                const Icon = feature.icon
                return (
                  <Card key={index} className="w-48 animate-float" style={{ animationDelay: `${index * 0.5}s` }}>
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <Icon className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <h4 className="font-medium text-sm">{feature.title}</h4>
                          <p className="text-xs text-muted-foreground">{feature.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Bottom Right Feature Card */}
            <div className="absolute -bottom-6 -right-6">
              <Card className="w-48 animate-float" style={{ animationDelay: "1.5s" }}>
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Globe className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium text-sm">{features[2].title}</h4>
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