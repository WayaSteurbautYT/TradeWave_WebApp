import React, { useState, useEffect } from "react"
import axios from "axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { 
  Zap, 
  Check, 
  Star, 
  Crown, 
  Rocket,
  Users,
  Sparkles,
  Shield,
  Headphones,
  BarChart3,
  Palette,
  Code,
  Video
} from "lucide-react"

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL
const API = `${BACKEND_URL}/api`

export function SubscriptionPage() {
  const { user, isAuthenticated } = useAuth()
  
  const getCreditsRemaining = () => {
    return user?.subscription?.credits_remaining || 0
  }
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      const response = await axios.get(`${API}/subscriptions/plans`)
      setPlans(response.data)
    } catch (error) {
      console.error('Error fetching plans:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubscribe = async (planId) => {
    if (!isAuthenticated) {
      alert('Please log in to subscribe')
      return
    }

    try {
      const response = await axios.post(`${API}/subscriptions/subscribe`, 
        { plan_id: planId },
        { withCredentials: true }
      )
      
      // Handle Stripe payment flow here
      console.log('Subscription created:', response.data)
      alert('Subscription process initiated! (Stripe integration would continue here)')
      
    } catch (error) {
      console.error('Subscription error:', error)
      alert(error.response?.data?.detail || 'Subscription failed')
    }
  }

  const planIcons = {
    free: Users,
    creator: Star,
    pro: Crown,
    business: Rocket
  }

  const planColors = {
    free: "text-gray-500",
    creator: "text-blue-500", 
    pro: "text-purple-500",
    business: "text-orange-500"
  }

  const planBadges = {
    free: null,
    creator: "Most Popular",
    pro: "Best Value",
    business: "Enterprise"
  }

  if (!isAuthenticated) {
    return (
      <div className="container py-20">
        <div className="text-center max-w-md mx-auto">
          <Zap className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-muted-foreground mb-6">
            Please log in to view and manage your subscription.
          </p>
          <Button onClick={() => window.location.href = '/'}>
            Login to Continue
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center animate-gaming-pulse">
            <Zap className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          ⚡ Choose Your 
          <span className="gradient-gaming bg-clip-text text-transparent"> Plan</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Get monthly credits to access premium content, AI generation, and creator services. 
          Cancel anytime, no hidden fees!
        </p>
      </div>

      {/* Current Plan Status */}
      <div className="max-w-4xl mx-auto mb-12">
        <Card className="gaming-card bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Current Plan: {user?.subscription?.plan || 'Free'}</h3>
                  <p className="text-muted-foreground">
                    {getCreditsRemaining()} credits remaining this month
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">{getCreditsRemaining()}</div>
                <div className="text-sm text-muted-foreground">Credits Available</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pricing Plans */}
      <div className="max-w-6xl mx-auto">
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="p-6">
                  <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-8 bg-muted rounded w-1/2" />
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {[...Array(5)].map((_, j) => (
                      <div key={j} className="h-4 bg-muted rounded" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => {
              const Icon = planIcons[plan.id] || Star
              const iconColor = planColors[plan.id] || "text-primary"
              const badge = planBadges[plan.id]
              const isCurrentPlan = user?.subscription?.plan === plan.id
              const isPopular = plan.id === 'creator'
              
              return (
                <Card 
                  key={plan.id} 
                  className={`gaming-card relative ${
                    isPopular ? 'border-primary ring-2 ring-primary/20 scale-105' : ''
                  } ${isCurrentPlan ? 'bg-primary/5' : ''}`}
                >
                  {badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary px-3 py-1">
                        {badge}
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center p-6">
                    <div className="flex justify-center mb-4">
                      <div className={`w-12 h-12 ${iconColor.replace('text-', 'bg-').replace('500', '500/20')} rounded-lg flex items-center justify-center`}>
                        <Icon className={`h-6 w-6 ${iconColor}`} />
                      </div>
                    </div>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <div className="text-center">
                      <div className="text-3xl font-bold">
                        {plan.price_monthly === 0 ? 'Free' : `$${plan.price_monthly}`}
                      </div>
                      {plan.price_monthly > 0 && (
                        <div className="text-sm text-muted-foreground">per month</div>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-6 pt-0">
                    <div className="space-y-4">
                      {/* Credits */}
                      <div className="text-center p-3 bg-accent/50 rounded-lg">
                        <div className="text-2xl font-bold text-primary">{plan.monthly_credits}</div>
                        <div className="text-sm text-muted-foreground">Monthly Credits</div>
                      </div>
                      
                      {/* Features */}
                      <div className="space-y-3">
                        {plan.features.map((feature, index) => (
                          <div key={index} className="flex items-start space-x-2">
                            <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{feature}</span>
                          </div>
                        ))}
                        
                        {/* Additional features based on plan */}
                        <div className="flex items-start space-x-2">
                          <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">
                            {plan.max_uploads === -1 ? 'Unlimited uploads' : `${plan.max_uploads} uploads/month`}
                          </span>
                        </div>
                        
                        <div className="flex items-start space-x-2">
                          <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{plan.ai_requests_included} AI requests included</span>
                        </div>
                        
                        {plan.priority_support && (
                          <div className="flex items-start space-x-2">
                            <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">Priority support</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Action Button */}
                      <div className="pt-4">
                        {isCurrentPlan ? (
                          <Button disabled className="w-full">
                            Current Plan
                          </Button>
                        ) : (
                          <Button 
                            onClick={() => handleSubscribe(plan.id)}
                            className={`w-full ${isPopular ? 'gaming-card' : ''}`}
                            variant={plan.price_monthly === 0 ? 'outline' : 'default'}
                          >
                            {plan.price_monthly === 0 ? 'Current Plan' : 'Upgrade Now'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Feature Comparison */}
      <div className="max-w-4xl mx-auto mt-16">
        <Card className="gaming-card">
          <CardHeader>
            <CardTitle className="text-center text-2xl">What You Can Do With Credits</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Video className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="font-semibold mb-2">Watch Premium Content</h3>
                <p className="text-sm text-muted-foreground">
                  Access exclusive tutorials and courses
                </p>
                <Badge variant="secondary" className="mt-2">1-5 credits</Badge>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="h-6 w-6 text-green-500" />
                </div>
                <h3 className="font-semibold mb-2">AI Generation</h3>
                <p className="text-sm text-muted-foreground">
                  Generate content with Gemini 2.0 Flash
                </p>
                <Badge variant="secondary" className="mt-2">2-5 credits</Badge>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Palette className="h-6 w-6 text-purple-500" />
                </div>
                <h3 className="font-semibold mb-2">Download Project Files</h3>
                <p className="text-sm text-muted-foreground">
                  Get source files and assets
                </p>
                <Badge variant="secondary" className="mt-2">10-50 credits</Badge>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Users className="h-6 w-6 text-orange-500" />
                </div>
                <h3 className="font-semibold mb-2">Hire Creators</h3>
                <p className="text-sm text-muted-foreground">
                  Commission custom work
                </p>
                <Badge variant="secondary" className="mt-2">50-500 credits</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* FAQ */}
      <div className="max-w-2xl mx-auto mt-16">
        <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {[
            {
              q: "What happens if I run out of credits?",
              a: "You can still watch free content and browse the platform. Credits renew monthly or you can upgrade your plan anytime."
            },
            {
              q: "Do unused credits roll over?",
              a: "No, credits reset each month. We recommend using your credits for AI generation, premium content, or hiring creators."
            },
            {
              q: "Can I cancel anytime?",
              a: "Yes! Cancel anytime with no penalty. You'll keep your credits until the end of your billing period."
            },
            {
              q: "How does the tutorial requirement work?",
              a: "Every creator must provide tutorials showing their process. This ensures you learn while accessing premium content."
            }
          ].map((faq, index) => (
            <Card key={index} className="gaming-card">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">{faq.q}</h3>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}