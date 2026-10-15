import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Play, 
  Star, 
  Eye, 
  Clock, 
  ArrowRight,
  TrendingUp,
  Download,
  Heart,
  Gamepad2,
  Video,
  Code,
  Palette
} from "lucide-react"
import { MockStore } from "@/data/mockStore"

export function MarketplacePreview() {
  const content = MockStore.getContent().slice(0, 4)

  const categories = [
    { name: "Gaming Assets", count: "1,250+", icon: Gamepad2, color: "text-purple-500" },
    { name: "3D Design & UI", count: "890+", icon: Palette, color: "text-pink-500" },
    { name: "Code & Netcode", count: "678+", icon: Code, color: "text-emerald-500" },
    { name: "Video & Sound", count: "540+", icon: Video, color: "text-blue-500" }
  ]

  return (
    <section className="py-16 md:py-24">
      <div className="container">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
          <div>
            <Badge variant="outline" className="mb-2 text-xs border-primary/30 text-primary">
              Trending Marketplace
            </Badge>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Trending in{" "}
              <span className="gradient-primary bg-clip-text text-transparent">Marketplace</span>
            </h2>
            <p className="text-sm md:text-base text-muted-foreground mt-1">
              Top-selling models, shaders, templates, and courses with step-by-step breakdown tutorials.
            </p>
          </div>
          <Link to="/marketplace">
            <Button size="sm" className="bg-primary text-primary-foreground">
              Browse All Assets
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Categories */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {categories.map((category, index) => {
            const Icon = category.icon
            return (
              <Link to="/marketplace" key={index}>
                <Card className="gaming-card group cursor-pointer hover:border-primary/50 transition-all border-border bg-card">
                  <CardContent className="p-4 text-center">
                    <Icon className={`h-6 w-6 ${category.color} mx-auto mb-2`} />
                    <h3 className="font-semibold text-sm">{category.name}</h3>
                    <p className="text-xs text-muted-foreground">{category.count} items</p>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>

        {/* Featured Content Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {content.map((item) => (
            <Card key={item.id} className="gaming-card group hover:shadow-lg transition-all duration-300 overflow-hidden border-border bg-card flex flex-col justify-between">
              <div>
                {/* Thumbnail Preview Area */}
                <div className="relative aspect-video bg-gradient-to-br from-primary/20 via-background to-accent/20 flex items-center justify-center overflow-hidden">
                  <div className="p-4 bg-background/50 rounded-2xl backdrop-blur-sm group-hover:scale-110 transition-transform">
                    {item.content_type === "3d_model" ? (
                      <Gamepad2 className="h-8 w-8 text-primary" />
                    ) : item.content_type === "code" ? (
                      <Code className="h-8 w-8 text-primary" />
                    ) : item.content_type === "audio" ? (
                      <Play className="h-8 w-8 text-primary" />
                    ) : (
                      <Palette className="h-8 w-8 text-primary" />
                    )}
                  </div>
                  
                  {/* Overlay Badges */}
                  <div className="absolute top-2.5 left-2.5 flex gap-1.5">
                    <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-wider">
                      {item.content_type}
                    </Badge>
                    {item.tutorial_included && (
                      <Badge className="text-[10px] bg-emerald-500 text-white hover:bg-emerald-600">
                        Tutorial
                      </Badge>
                    )}
                  </div>

                  <div className="absolute bottom-2.5 right-2.5">
                    <Badge variant="secondary" className="text-[10px] bg-black/60 text-white backdrop-blur-sm border-0">
                      <Clock className="h-3 w-3 mr-1 inline" />
                      {Math.round((item.duration || 1800) / 60)} min
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-4">
                  {/* Title */}
                  <h3 className="font-bold text-sm mb-1.5 line-clamp-2 group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>

                  {/* Creator */}
                  <div className="flex items-center space-x-2 mb-3">
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={item.creator_avatar} />
                      <AvatarFallback className="text-[9px] bg-gradient-gaming text-white">
                        {item.creator_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground truncate">
                      {item.creator_name}
                    </span>
                  </div>

                  {/* Rating & Views */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                    <div className="flex items-center space-x-1">
                      <Star className="h-3.5 w-3.5 text-yellow-500 fill-current" />
                      <span className="font-semibold text-foreground">{item.rating}</span>
                      <span>({item.review_count})</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye className="h-3.5 w-3.5" />
                      <span>{item.views_count.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </div>

              {/* Price & Action */}
              <CardFooter className="p-4 pt-0 border-t mt-2 flex items-center justify-between">
                <div>
                  <span className="text-base font-extrabold text-primary">
                    {item.price} credits
                  </span>
                  <span className="block text-[10px] text-muted-foreground">instant download</span>
                </div>
                <Link to="/marketplace">
                  <Button size="sm" className="h-8 text-xs bg-primary text-primary-foreground">
                    Get Access
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
