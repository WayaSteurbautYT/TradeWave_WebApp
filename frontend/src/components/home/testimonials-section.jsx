import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Star, Quote } from "lucide-react"

export function TestimonialsSection() {
  const testimonials = [
    {
      id: 1,
      name: "Sarah Mitchell",
      role: "Content Creator",
      avatar: "",
      rating: 5,
      content: "TradeWave has completely transformed how I monetize my content. The token system is brilliant and the community is incredibly supportive. I've earned more in 3 months than I did in a whole year on other platforms!",
      stats: "Earned $15K+ in 3 months"
    },
    {
      id: 2,
      name: "Marcus Chen",
      role: "Trading Educator",
      avatar: "",
      rating: 5,
      content: "The live streaming feature with integrated trading tools is game-changing. My students can follow along in real-time and the engagement has never been higher. TradeWave truly understands what educators need.",
      stats: "1000+ active students"
    },
    {
      id: 3,
      name: "Jessica Rodriguez",
      role: "3D Artist",
      avatar: "",
      rating: 5,
      content: "As a 3D artist, finding clients was always challenging. TradeWave's marketplace connected me with amazing projects and the rights trading system means I earn ongoing revenue from my work. It's a creative's dream!",
      stats: "200+ projects completed"
    },
    {
      id: 4,
      name: "David Park",
      role: "Business Owner",
      avatar: "",
      rating: 5,
      content: "The quality of creators on TradeWave is exceptional. I've hired several for marketing content and the results have been outstanding. The token system makes transactions smooth and transparent.",
      stats: "50+ successful hires"
    },
    {
      id: 5,
      name: "Amanda Foster",
      role: "Online Student",
      avatar: "",
      rating: 5,
      content: "The educational content on TradeWave is top-notch. I've learned more about trading and digital marketing here than anywhere else. The interactive courses and direct access to instructors is invaluable.",
      stats: "Completed 15+ courses"
    },
    {
      id: 6,
      name: "Roberto Silva",
      role: "Video Editor",
      avatar: "",
      rating: 5,
      content: "TradeWave's community is unlike any other platform. The collaboration opportunities are endless and the support from fellow creators is amazing. It's not just a marketplace, it's a true community.",
      stats: "Collaborated on 100+ videos"
    }
  ]

  return (
    <section className="py-20 bg-muted/30">
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            💬 Testimonials
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Loved by creators
            <span className="gradient-primary bg-clip-text text-transparent"> worldwide</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join thousands of creators who are already building their success story on TradeWave
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="group hover:shadow-lg transition-all duration-300 relative overflow-hidden">
              {/* Quote Icon */}
              <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Quote className="h-8 w-8" />
              </div>

              <CardContent className="p-6">
                {/* Rating */}
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                  ))}
                </div>

                {/* Content */}
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>

                {/* Author */}
                <div className="flex items-center space-x-3 mb-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={testimonial.avatar} />
                    <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>

                {/* Stats */}
                <Badge variant="secondary" className="text-xs">
                  {testimonial.stats}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom Stats */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center space-x-8 p-6 bg-background rounded-2xl shadow-sm">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">4.9/5</div>
              <div className="text-sm text-muted-foreground">Average Rating</div>
            </div>
            <div className="w-px h-12 bg-border"></div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">10K+</div>
              <div className="text-sm text-muted-foreground">Happy Users</div>
            </div>
            <div className="w-px h-12 bg-border"></div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">99.9%</div>
              <div className="text-sm text-muted-foreground">Uptime</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}