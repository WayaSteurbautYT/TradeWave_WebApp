import React from "react"
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

export function CTASection() {
  const benefits = [
    {
      icon: Gift,
      title: "1000 Free Tokens",
      description: "Start trading immediately"
    },
    {
      icon: Zap,
      title: "Premium Features",
      description: "30-day free trial"
    },
    {
      icon: Users,
      title: "Community Access",
      description: "Join exclusive creator groups"
    },
    {
      icon: Trophy,
      title: "Creator Badge",
      description: "Show your expertise"
    }
  ]

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
      <div className="absolute top-20 left-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-20 w-48 h-48 bg-accent/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
      
      <div className="container relative">
        <div className="max-w-4xl mx-auto text-center">
          {/* Header */}
          <Badge variant="secondary" className="mb-6">
            <Sparkles className="mr-2 h-4 w-4" />
            Limited Time Offer
          </Badge>
          
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Ready to start your
            <span className="gradient-primary bg-clip-text text-transparent block">
              TradeWave journey?
            </span>
          </h2>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of creators and traders who are already building their success story. 
            Get started today with our exclusive welcome package.
          </p>

          {/* Benefits Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <Card key={index} className="group hover:shadow-md transition-all duration-300">
                  <CardContent className="p-4 text-center">
                    <Icon className="h-8 w-8 text-primary mx-auto mb-2" />
                    <h3 className="font-semibold text-sm mb-1">{benefit.title}</h3>
                    <p className="text-xs text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button size="lg" className="text-lg px-8 py-6">
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6">
              Watch Demo
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-8 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full" />
              <span>24/7 support</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}