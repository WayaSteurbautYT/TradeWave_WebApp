import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowRight, 
  Sparkles, 
  Gift, 
  Zap, 
  Users, 
  Trophy 
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

export function CTASection() {
  const { loginWithGoogle, isAuthenticated } = useAuth()

  const benefits = [
    {
      icon: Gift,
      title: "Bonus Start Credits",
      description: "Get started with free tokens to test assets"
    },
    {
      icon: Zap,
      title: "AI Studio Access",
      description: "Generate game scripts and prompts instantly"
    },
    {
      icon: Users,
      title: "Guild Collaboration",
      description: "Team up on high-ticket client bids"
    },
    {
      icon: Trophy,
      title: "Verified Badges",
      description: "Showcase skills with tiered progression"
    }
  ]

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 pointer-events-none" />
      
      <div className="container relative">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">
            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            Join the Next Generation Creator Economy
          </Badge>
          
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            Ready to elevate your{" "}
            <span className="gradient-primary bg-clip-text text-transparent">
              game dev &amp; creative journey?
            </span>
          </h2>
          
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Trade assets, earn tokens, collaborate in creator guilds, and level up your skills with tutorials by Waya Steurbaut and top educators.
          </p>

          {/* Benefits Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4">
            {benefits.map((b, index) => {
              const Icon = b.icon
              return (
                <Card key={index} className="border-border bg-card/60 hover:border-primary/40 transition-colors">
                  <CardContent className="p-4 text-center">
                    <Icon className="h-6 w-6 text-primary mx-auto mb-2" />
                    <h3 className="font-semibold text-xs mb-1">{b.title}</h3>
                    <p className="text-[11px] text-muted-foreground">{b.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            {isAuthenticated ? (
              <Link to="/marketplace">
                <Button size="lg" className="h-11 px-8 bg-primary text-primary-foreground font-semibold shadow-md">
                  Explore Marketplace
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Button size="lg" onClick={loginWithGoogle} className="h-11 px-8 bg-primary text-primary-foreground font-semibold shadow-md">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
            <Link to="/tutorials">
              <Button variant="outline" size="lg" className="h-11 px-8 border-border">
                Watch Free Tutorials
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground pt-4">
            <div className="flex items-center space-x-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>No credit card required to explore</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span>Instant token transactions</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="w-2 h-2 rounded-full bg-purple-500" />
              <span>100% tutorial guarantee</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
