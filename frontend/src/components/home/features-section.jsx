import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Zap, 
  Shield, 
  TrendingUp, 
  Users, 
  BookOpen, 
  Video,
  Coins,
  MessageSquare,
  Award,
  Globe
} from "lucide-react"

export function FeaturesSection() {
  const mainFeatures = [
    {
      icon: Zap,
      title: "Instant Content Trading",
      description: "Trade video content, tutorials, and digital assets with our advanced token system. Get instant access to premium content from top creators.",
      badge: "Popular"
    },
    {
      icon: Users,
      title: "Creator Marketplace",
      description: "Hire skilled creators for custom projects. From video editing to 3D modeling, find the perfect creator for your needs.",
      badge: "New"
    },
    {
      icon: BookOpen,
      title: "Educational Courses",
      description: "Access comprehensive courses on trading, content creation, and digital marketing. Learn from industry experts.",
      badge: "Featured"
    },
    {
      icon: Video,
      title: "Live Streaming",
      description: "Stream live trading sessions, tutorials, and interactive workshops. Engage with your audience in real-time.",
      badge: "Hot"
    }
  ]

  const additionalFeatures = [
    {
      icon: Coins,
      title: "Token Economy",
      description: "Earn and spend tokens for content access, services, and platform features."
    },
    {
      icon: Shield,
      title: "Secure Transactions",
      description: "Bank-level security for all your transactions and content purchases."
    },
    {
      icon: MessageSquare,
      title: "Direct Messaging",
      description: "Communicate directly with creators and collaborate on projects."
    },
    {
      icon: Award,
      title: "Creator Rewards",
      description: "Earn rewards and recognition for high-quality content and services."
    },
    {
      icon: TrendingUp,
      title: "Analytics Dashboard",
      description: "Track your performance, earnings, and audience engagement."
    },
    {
      icon: Globe,
      title: "Global Community",
      description: "Connect with creators and traders from around the world."
    }
  ]

  return (
    <section className="py-20 bg-muted/30">
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            ✨ Platform Features
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything you need to 
            <span className="gradient-primary bg-clip-text text-transparent"> succeed</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            TradeWave provides all the tools and features you need to create, trade, 
            and monetize content in the digital economy.
          </p>
        </div>

        {/* Main Features Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {mainFeatures.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card key={index} className="relative group hover:shadow-lg transition-all duration-300 border-primary/20">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{feature.title}</CardTitle>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {feature.badge}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Additional Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {additionalFeatures.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card key={index} className="group hover:shadow-md transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="p-2 bg-accent/10 rounded-lg">
                      <Icon className="h-5 w-5 text-accent-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}