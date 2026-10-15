import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Star, Quote } from "lucide-react"

export function TestimonialsSection() {
  const testimonials = [
    {
      id: 1,
      name: "Alex Rivera",
      role: "Indie Game Developer",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      rating: 5,
      content: "WayaCreate changed everything for our small studio. We purchased Waya's modular sci-fi kit and followed the included tutorial. Our Steam demo received overwhelmingly positive feedback on visuals!",
      stats: "Saved 3 weeks of dev time"
    },
    {
      id: 2,
      name: "Sarah Chen",
      role: "UI/UX & Shader Artist",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      rating: 5,
      content: "The creator guilds feature is revolutionary. Collaborating with other high-level artists inside Alpha Guild allowed us to bid on large commercial tenders that we couldn't take alone.",
      stats: "Earned 8,500+ credits"
    },
    {
      id: 3,
      name: "Marcus Vance",
      role: "Gameplay Programmer",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      rating: 5,
      content: "The smart bidding system is fair, transparent, and direct. Clients know exactly what they are getting with milestone escrow, and the tutorial requirement means clients always love the deliverable.",
      stats: "100% 5.0 client rating"
    }
  ]

  return (
    <section className="py-16 md:py-24 bg-muted/20">
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-3 text-xs bg-primary/10 text-primary border-primary/20">
            💬 Creator Reviews
          </Badge>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-3 tracking-tight">
            Loved by developers &amp; creators{" "}
            <span className="gradient-primary bg-clip-text text-transparent">worldwide</span>
          </h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto">
            From solo indie creators to mid-sized game studios, discover why the community builds on WayaCreate.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <Card key={t.id} className="gaming-card relative overflow-hidden border-border bg-card">
              <div className="absolute top-4 right-4 opacity-10">
                <Quote className="h-8 w-8 text-primary" />
              </div>

              <CardContent className="p-6">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                  ))}
                </div>

                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                  "{t.content}"
                </p>

                <div className="flex items-center justify-between border-t pt-4">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={t.avatar} />
                      <AvatarFallback className="bg-gradient-gaming text-white text-xs">
                        {t.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-bold text-xs">{t.name}</div>
                      <div className="text-[11px] text-muted-foreground">{t.role}</div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] text-primary border-primary/30">
                    {t.stats}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Live Metrics Bar */}
        <div className="mt-12 text-center">
          <div className="inline-flex flex-wrap items-center justify-center gap-6 sm:gap-12 p-5 bg-card border rounded-2xl shadow-sm">
            <div className="text-center">
              <div className="text-2xl font-black text-primary">4.96 / 5.0</div>
              <div className="text-xs text-muted-foreground">Average Gig Rating</div>
            </div>
            <div className="hidden sm:block w-px h-8 bg-border" />
            <div className="text-center">
              <div className="text-2xl font-black text-primary">10K+</div>
              <div className="text-xs text-muted-foreground">Tutorial Downloads</div>
            </div>
            <div className="hidden sm:block w-px h-8 bg-border" />
            <div className="text-center">
              <div className="text-2xl font-black text-primary">100%</div>
              <div className="text-xs text-muted-foreground">Escrow Protection</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
