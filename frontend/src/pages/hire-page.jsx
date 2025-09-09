import React, { useState, useEffect } from "react"
import axios from "axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Search, 
  Star, 
  MapPin, 
  Clock, 
  DollarSign,
  Briefcase,
  Users,
  TrendingUp,
  Filter,
  ChevronRight,
  Gamepad2,
  Palette,
  Code,
  Video,
  Mic,
  PenTool
} from "lucide-react"

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL
const API = `${BACKEND_URL}/api`

export function HirePage() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const serviceCategories = [
    { id: "all", name: "All Services", icon: Briefcase, count: "500+" },
    { id: "gaming", name: "Gaming", icon: Gamepad2, count: "150+", description: "Minecraft builds, game tutorials, streaming setup" },
    { id: "design", name: "Design & Video", icon: Palette, count: "120+", description: "3D modeling, video editing, graphics design" },
    { id: "development", name: "Development", icon: Code, count: "80+", description: "Website development, game development, automation" },
    { id: "content", name: "Content Creation", icon: Video, count: "90+", description: "Video production, script writing, thumbnails" },
    { id: "audio", name: "Audio & Music", icon: Mic, count: "45+", description: "Sound design, music production, voice overs" },
    { id: "marketing", name: "Marketing", icon: TrendingUp, count: "60+", description: "Social media, SEO, brand design" }
  ]

  const topCreators = [
    {
      id: "waya-creator",
      name: "Waya Steurbaut",
      username: "@wayacreate",
      avatar: "",
      rating: 5.0,
      reviews: 328,
      specialties: ["Minecraft", "Blender", "Video Editing"],
      level: "Master Creator",
      hourly_rate: 85,
      completed_orders: 1250,
      response_time: "1 hour",
      verified: true
    },
    {
      id: "minecraft-expert",
      name: "BlockMaster Alex",
      username: "@blockmaster",
      avatar: "",
      rating: 4.9,
      reviews: 245,
      specialties: ["Minecraft", "Building", "Redstone"],
      level: "Expert Builder",
      hourly_rate: 65,
      completed_orders: 890,
      response_time: "2 hours",
      verified: true
    },
    {
      id: "blender-pro",
      name: "Sarah Chen",
      username: "@blenderpro",
      avatar: "",
      rating: 4.8,
      reviews: 189,
      specialties: ["Blender", "3D Animation", "Character Design"],
      level: "3D Master",
      hourly_rate: 75,
      completed_orders: 567,
      response_time: "3 hours",
      verified: true
    }
  ]

  useEffect(() => {
    fetchServices()
  }, [selectedCategory])

  const fetchServices = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        limit: "20"
      })
      
      if (selectedCategory !== "all") {
        params.append("category", selectedCategory)
      }
      
      const response = await axios.get(`${API}/services?${params}`)
      setServices(response.data)
    } catch (error) {
      console.error('Error fetching services:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredServices = services.filter(service =>
    service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center animate-gaming-pulse">
            <Briefcase className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          💼 Hire Amazing 
          <span className="gradient-gaming bg-clip-text text-transparent"> Creators</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Find skilled creators for your gaming, design, and tech projects. 
          Every creator provides tutorials showing their process!
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Active Creators", value: "500+", icon: Users },
          { label: "Services Available", value: "1.2K+", icon: Briefcase },
          { label: "Completed Projects", value: "15K+", icon: TrendingUp },
          { label: "Avg Response Time", value: "2 hours", icon: Clock }
        ].map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="gaming-card">
              <CardContent className="p-4 text-center">
                <Icon className="h-6 w-6 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Search */}
          <Card className="gaming-card">
            <CardHeader>
              <CardTitle className="text-lg">Find Services</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search for services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Categories */}
          <Card className="gaming-card">
            <CardHeader>
              <CardTitle className="text-lg">Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {serviceCategories.map((category) => {
                const Icon = category.icon
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedCategory === category.id 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-accent'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="h-5 w-5" />
                      <div className="flex-1">
                        <div className="font-medium">{category.name}</div>
                        <div className="text-sm opacity-70">{category.count}</div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </CardContent>
          </Card>

          {/* Top Creators */}
          <Card className="gaming-card">
            <CardHeader>
              <CardTitle className="text-lg">⭐ Top Creators</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {topCreators.map((creator) => (
                <div key={creator.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-accent cursor-pointer">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={creator.avatar} />
                    <AvatarFallback className="bg-gradient-gaming text-white">
                      {creator.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-1">
                      <span className="font-medium text-sm truncate">{creator.name}</span>
                      {creator.verified && <Badge className="text-xs bg-blue-500">✓</Badge>}
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <Star className="h-3 w-3 text-yellow-500 fill-current" />
                      <span>{creator.rating}</span>
                      <span>({creator.reviews})</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Category Info */}
          {selectedCategory !== "all" && (
            <Card className="gaming-card bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  {(() => {
                    const category = serviceCategories.find(c => c.id === selectedCategory)
                    const Icon = category?.icon || Briefcase
                    return (
                      <>
                        <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold mb-2">{category?.name} Services</h3>
                          <p className="text-muted-foreground">{category?.description}</p>
                        </div>
                      </>
                    )
                  })()}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Services Grid */}
          {loading ? (
            <div className="grid md:grid-cols-2 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-12 h-12 bg-muted rounded-full" />
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded w-full" />
                      <div className="h-4 bg-muted rounded w-2/3" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {filteredServices.map((service) => (
                <Card key={service.id} className="gaming-card hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    {/* Creator Info */}
                    <div className="flex items-center space-x-4 mb-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-gradient-gaming text-white">
                          W
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold">Waya Steurbaut</h4>
                          <Badge className="text-xs bg-blue-500">✓ Verified</Badge>
                          <Badge variant="secondary" className="text-xs">Master Creator</Badge>
                        </div>
                        <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span>{service.rating || "4.9"}</span>
                            <span>({service.review_count || "156"})</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>2 hours response</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Service Info */}
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                          {service.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {service.description}
                        </p>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2">
                        {service.tags?.slice(0, 4).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      {/* Pricing */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">Starting at</span>
                          <span className="text-lg font-bold text-primary">
                            {service.packages?.basic?.price || 299} credits
                          </span>
                        </div>
                        <Button size="sm" className="gaming-card">
                          View Details
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>

                      {/* Tutorial Badge */}
                      <div className="flex items-center space-x-2 text-xs text-green-600 bg-green-50 dark:bg-green-950/20 p-2 rounded-md">
                        <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                          ✅ Tutorial Included
                        </Badge>
                        <span>Learn how it's made!</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredServices.length === 0 && (
            <div className="text-center py-12">
              <Briefcase className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No services found</h3>
              <p className="text-muted-foreground">
                {searchQuery ? "Try different search terms" : "New services coming soon!"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}