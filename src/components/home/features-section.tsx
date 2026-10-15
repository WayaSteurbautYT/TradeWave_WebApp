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
  Globe,
  Gavel,
  Gamepad2
} from "lucide-react"

export function FeaturesSection() {
  const mainFeatures = [
    {
      icon: Zap,
      title: "Instant Digital Trading",
      description: "Trade 3D models, shader graphs, video project files, and sound effects with an instant token economy. Every purchase includes video walkthroughs.",
      badge: "Popular"
    },
    {
      icon: Users,
      title: "Creator Marketplace & Gigs",
      description: "Hire talented creators for custom game assets, trailers, and netcode programming with multi-tiered packages and escrow protection.",
      badge: "Active"
    },
    {
      icon: Gavel,
      title: "Smart Bidding & Proposals",
      description: "Post game development requirements or browse open client tenders. Submit competitive bids with automated milestone projections.",
      badge: "New"
    },
    {
      icon: Shield,
      title: "Creator Guilds & Teams",
      description: "Form or join specialized creator syndicates with shared treasuries, collaborative projects, and revenue sharing.",
      badge: "Featured"
    }
  ]

  const additionalFeatures = [
    {
      icon: Coins,
      title: "Transparent Token Economy",
      description: "Earn credits for your work, redeem for platform assets, or withdraw directly to real cash via Stripe."
    },
    {
      icon: BookOpen,
      title: "Tutorial-First Philosophy",
      description: "Every gig and marketplace item is paired with a breakdown tutorial so buyers learn while they build."
    },
    {
      icon: Gamepad2,
      title: "Gaming-Native Architecture",
      description: "Built specifically for game artists, indie game studios, Blender modelers, and YouTubers."
    },
    {
      icon: Award,
      title: "Gamified Skill Tree & XP",
      description: "Level up your creator tier from Bronze to Diamond, unlock rare badges, and claim token rewards."
    },
    {
      icon: TrendingUp,
      title: "Creator Analytics Dashboard",
      description: "Real-time metrics on conversion rates, revenue trends, gig deliveries, and customer satisfaction."
    },
    {
      icon: Globe,
      title: "Global Collaboration",
      description: "Connect with developers, technical artists, sound designers, and clients across 40+ countries."
    }
  ]

  return (
    <section className="py-16 md:py-24 bg-muted/20">
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-3 text-xs bg-primary/10 text-primary border-primary/20">
            ✨ Platform Features
          </Badge>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4 tracking-tight">
            Everything you need to{" "}
            <span className="gradient-primary bg-clip-text text-transparent">create, trade &amp; level up</span>
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            WayaCreate combines digital asset trading, freelance service contracts, creator guilds, and an interactive tutorial system into one unified platform.
          </p>
        </div>

        {/* Main Features Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {mainFeatures.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card key={index} className="gaming-card relative group hover:shadow-lg transition-all duration-300 border-border bg-card">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
                        <Icon className="h-6 w-6" />
                      </div>
                      <CardTitle className="text-lg md:text-xl">{feature.title}</CardTitle>
                    </div>
                    <Badge variant="secondary" className="text-[11px] bg-primary/10 text-primary border-primary/20">
                      {feature.badge}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Additional Features */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {additionalFeatures.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card key={index} className="group hover:border-primary/40 transition-colors border-border bg-card/60">
                <CardContent className="p-5">
                  <div className="flex items-start space-x-3.5">
                    <div className="p-2 bg-primary/10 text-primary rounded-lg shrink-0 mt-0.5">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm mb-1">{feature.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
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
