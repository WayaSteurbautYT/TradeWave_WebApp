import React from "react"
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
  Heart
} from "lucide-react"

export function MarketplacePreview() {
  const featuredContent = [
    {
      id: 1,
      title: "Advanced Trading Strategies",
      creator: {
        name: "Sarah Chen",
        avatar: "",
        verified: true
      },
      thumbnail: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=250&fit=crop",
      type: "Course",
      price: 299,
      rating: 4.9,
      reviews: 1234,
      views: 25000,
      duration: "4h 30m",
      category: "Trading",
      isHot: true
    },
    {
      id: 2,
      title: "3D Animation Masterclass",
      creator: {
        name: "Mike Johnson",
        avatar: "",
        verified: true
      },
      thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=250&fit=crop",
      type: "Video",
      price: 149,
      rating: 4.8,
      reviews: 892,
      views: 18000,
      duration: "2h 15m",
      category: "Design",
      isNew: true
    },
    {
      id: 3,
      title: "Crypto Market Analysis",
      creator: {
        name: "Alex Rivera",
        avatar: "",
        verified: true
      },
      thumbnail: "https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=400&h=250&fit=crop",
      type: "Live Stream",
      price: 0,
      rating: 4.7,
      reviews: 567,
      views: 32000,
      duration: "Live",
      category: "Finance",
      isLive: true
    },
    {
      id: 4,
      title: "Video Editing Pro Tips",
      creator: {
        name: "Emma Davis",
        avatar: "",
        verified: false
      },
      thumbnail: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=250&fit=crop",
      type: "Tutorial",
      price: 89,
      rating: 4.6,
      reviews: 445,
      views: 15000,
      duration: "1h 45m",
      category: "Content Creation",
      isPopular: true
    }
  ]

  const categories = [
    { name: "Trading", count: 1250, icon: TrendingUp },
    { name: "Design", count: 890, icon: Play },
    { name: "Development", count: 678, icon: Play },
    { name: "Marketing", count: 543, icon: Play }
  ]

  return (
    <section className="py-20">
      <div className="container">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Trending in 
              <span className="gradient-primary bg-clip-text text-transparent"> Marketplace</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Discover the most popular content and services from top creators
            </p>
          </div>
          <Button size="lg" asChild>
            <Link to="/marketplace">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Categories */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {categories.map((category, index) => {
            const Icon = category.icon
            return (
              <Card key={index} className="group cursor-pointer hover:shadow-md transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <Icon className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold mb-1">{category.name}</h3>
                  <p className="text-sm text-muted-foreground">{category.count} items</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Featured Content Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredContent.map((item) => (
            <Card key={item.id} className="group cursor-pointer hover:shadow-lg transition-all duration-300 overflow-hidden">
              {/* Thumbnail */}
              <div className="relative overflow-hidden">
                <img 
                  src={item.thumbnail} 
                  alt={item.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Overlay Badges */}
                <div className="absolute top-3 left-3 flex gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {item.type}
                  </Badge>
                  {item.isHot && (
                    <Badge className="text-xs bg-red-500 hover:bg-red-600">
                      🔥 Hot
                    </Badge>
                  )}
                  {item.isNew && (
                    <Badge className="text-xs bg-green-500 hover:bg-green-600">
                      ✨ New
                    </Badge>
                  )}
                  {item.isLive && (
                    <Badge className="text-xs bg-red-500 hover:bg-red-600 animate-pulse">
                      🔴 Live
                    </Badge>
                  )}
                  {item.isPopular && (
                    <Badge className="text-xs bg-purple-500 hover:bg-purple-600">
                      ⭐ Popular
                    </Badge>
                  )}
                </div>

                {/* Duration */}
                <div className="absolute bottom-3 right-3">
                  <Badge variant="secondary" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    {item.duration}
                  </Badge>
                </div>

                {/* Play Button Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                    <Play className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>

              <CardContent className="p-4">
                {/* Title */}
                <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                  {item.title}
                </h3>

                {/* Creator */}
                <div className="flex items-center space-x-2 mb-3">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={item.creator.avatar} />
                    <AvatarFallback>{item.creator.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-muted-foreground">
                    {item.creator.name}
                  </span>
                  {item.creator.verified && (
                    <Badge variant="secondary" className="text-xs px-1 py-0">
                      ✓
                    </Badge>
                  )}
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span>{item.rating}</span>
                      <span>({item.reviews})</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye className="h-4 w-4" />
                      <span>{item.views.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-primary">
                      {item.price === 0 ? 'Free' : `${item.price} TW`}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="p-4 pt-0">
                <Button className="w-full">
                  {item.price === 0 ? 'Watch Now' : 'Purchase'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            Ready to explore more amazing content?
          </p>
          <Button size="lg" variant="outline" asChild>
            <Link to="/marketplace">
              Browse Full Marketplace
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}