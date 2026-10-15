import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { showToast } from "@/components/ui/toaster"
import { 
  Zap, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Crown,
  Coins
} from "lucide-react"

export function SubscriptionPage() {
  const { user, updateProfile } = useAuth()
  const [currentPlan, setCurrentPlan] = useState(user?.subscription.plan || "pro")

  const plans = [
    {
      id: "free",
      name: "Free Explorer",
      price: "$0",
      period: "forever",
      credits: "50 Free Credits",
      features: [
        "Browse all tutorials & marketplace",
        "Community feed access",
        "Public tender bidding",
        "5% platform transaction fee"
      ]
    },
    {
      id: "creator",
      name: "Creator Tier",
      price: "$19",
      period: "per month",
      credits: "1,000 Monthly Credits",
      popular: true,
      features: [
        "1,000 Monthly credits allowance",
        "Download full project source files",
        "Verified Creator badge",
        "Priority placement in search",
        "3% platform fee"
      ]
    },
    {
      id: "pro",
      name: "Studio Pro",
      price: "$49",
      period: "per month",
      credits: "3,000 Monthly Credits",
      features: [
        "3,000 Monthly credits allowance",
        "Unlimited AI Studio generations",
        "Found & lead Creator Guilds",
        "0% platform transaction fee",
        "24/7 dedicated support"
      ]
    }
  ]

  const handleSelectPlan = (planId: any) => {
    setCurrentPlan(planId)
    updateProfile({
      subscription: {
        ...user?.subscription,
        plan: planId,
        monthly_credits: planId === "pro" ? 3000 : planId === "creator" ? 1000 : 50,
        credits_used: 0,
        credits_remaining: planId === "pro" ? 3000 : planId === "creator" ? 1000 : 50
      } as any
    })
    showToast({
      title: "Plan Updated!",
      description: `You are now subscribed to the ${planId.toUpperCase()} plan.`,
      variant: "success"
    })
  }

  return (
    <div className="container py-8 md:py-12 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="flex justify-center mb-2">
          <div className="w-14 h-14 bg-gradient-gaming rounded-2xl flex items-center justify-center shadow-lg">
            <Zap className="h-7 w-7 text-white" />
          </div>
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
          Membership &amp;{" "}
          <span className="gradient-primary bg-clip-text text-transparent">Credits</span>
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Upgrade your creator plan to receive monthly credits, lower platform fees, and unlock unlimited AI Studio capabilities.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {plans.map((p) => {
          const isCurrent = currentPlan === p.id
          return (
            <Card key={p.id} className={`gaming-card border-border bg-card flex flex-col justify-between relative ${p.popular ? "border-primary/50 shadow-md ring-1 ring-primary/20" : ""}`}>
              {p.popular && (
                <div className="absolute -top-3 right-6">
                  <Badge className="bg-primary text-primary-foreground text-xs font-bold">
                    RECOMMENDED
                  </Badge>
                </div>
              )}

              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold">{p.name}</CardTitle>
                <div className="flex items-baseline space-x-1 mt-2">
                  <span className="text-3xl font-black">{p.price}</span>
                  <span className="text-xs text-muted-foreground">/{p.period}</span>
                </div>
                <div className="mt-2 p-2 bg-primary/10 rounded-lg text-primary text-xs font-bold text-center">
                  {p.credits}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2 text-xs">
                  {p.features.map((f, i) => (
                    <div key={i} className="flex items-center space-x-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t">
                  <Button
                    size="sm"
                    variant={isCurrent ? "outline" : "default"}
                    className={`w-full text-xs font-semibold ${!isCurrent ? "bg-primary text-primary-foreground" : ""}`}
                    onClick={() => handleSelectPlan(p.id)}
                  >
                    {isCurrent ? "Current Plan" : `Switch to ${p.name}`}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
