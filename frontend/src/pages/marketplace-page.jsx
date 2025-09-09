import React, { useState, useEffect } from "react"
import axios from "axios"
import { useAuth } from "@/contexts/AuthContext"
import { useTokens } from "@/contexts/TokenContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  ShoppingCart, 
  Star, 
  Clock, 
  Coins, 
  Search,
  Filter,
  TrendingUp,
  Video,
  Image,
  Code,
  Palette,
  Music,
  BookOpen,
  ArrowRight,
  Users,
  Zap,
  Trophy,
  Gamepad2
} from "lucide-react"

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL
const API = `${BACKEND_URL}/api`

export function MarketplacePage() {
  const { user } = useAuth()
  const { getTokenBalance } = useTokens()
  const [services, setServices] = useState([])
  const [content, setContent] = useState([])
  const [creators, setCreators] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [activeTab, setActiveTab] = useState("services")

  const categories = [
    { id: "all", name: "All", icon: ShoppingCart, color: "text-blue-500" },
    { id: "gaming", name: "Gaming", icon: Gamepad2, color: "text-purple-500" },
    { id: "design", name: "Design", icon: Palette, color: "text-pink-500" },
    { id: "development", name: "Development", icon: Code, color: "text-green-500" },
    { id: "content", name: "Content", icon: Video, color: "text-red-500" },
    { id: "audio", name: "Audio", icon: Music, color: "text-yellow-500" },
    { id: "education", name: "Education", icon: BookOpen, color: "text-indigo-500" }
  ]

  const marketplaceStats = [
    { label: "Active Services", value: "1,200+", icon: ShoppingCart, color: "text-blue-500" },
    { label: "Content Items", value: "5,000+", icon: Video, color: "text-red-500" },
    { label: "Creators", value: "800+", icon: Users, color: "text-green-500" },
    { label: "Transactions", value: "25K+", icon: TrendingUp, color: "text-purple-500" }
  ]

  useEffect(() => {
    fetchMarketplaceData()
  }, [selectedCategory, activeTab])

  const fetchMarketplaceData = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        limit: "12",
        ...(selectedCategory !== "all" && { category: selectedCategory })
      })
      
      if (activeTab === "services") {
        const response = await axios.get(`${API}/services?${params}`)
        setServices(response.data)
      } else if (activeTab === "content") {
        const response = await axios.get(`${API}/content?${params}`)
        setContent(response.data)
      } else if (activeTab === "creators") {
        const response = await axios.post(`${API}/search/creators`, {
          categories: selectedCategory !== "all" ? [selectedCategory] : null,
          verified_only: false
        })
        setCreators(response.data.creators || [])
      }
    } catch (error) {
      console.error('Error fetching marketplace data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
    // TODO: Implement debounced search
  }

  const filteredItems = () => {
    if (activeTab === "services") {
      return services.filter(service =>
        service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    } else if (activeTab === "content") {
      return content.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    } else {
      return creators.filter(creator =>
        creator.creator.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        creator.creator.bio?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
  }

  const renderServiceCard = (service) => (
    <Card key={service.id} className="gaming-card hover:shadow-lg transition-all duration-300 group">
      <CardContent className="p-6">
        {/* Creator Info */}
        <div className="flex items-center space-x-3 mb-4">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-gradient-gaming text-white">
              {service.creator_name?.charAt(0) || "W"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-sm">Creator</span>
              <Badge className="text-xs bg-blue-500">✓</Badge>
            </div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Star className="h-3 w-3 text-yellow-500 fill-current" />
              <span>{service.rating || "4.9"}</span>
              <span>({service.review_count || "156"})</span>
            </div>
          </div>
        </div>

        {/* Service Info */}
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
              {service.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-3">
              {service.description}
            </p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {service.tags?.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          {/* Pricing & Action */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center space-x-2">
              <Coins className="h-4 w-4 text-primary" />
              <span className="text-lg font-bold text-primary">
                {service.packages?.basic?.price || 299}
              </span>
              <span className="text-sm text-muted-foreground">credits</span>
            </div>
            <Button size="sm" className="gaming-card">
              View Details
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {/* Tutorial Badge */}
          <div className="flex items-center space-x-2 text-xs text-green-600 bg-green-50 dark:bg-green-950/20 p-2 rounded-md">
            <Trophy className="h-3 w-3" />
            <span>Tutorial Included</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderContentCard = (item) => (
    <Card key={item.id} className="gaming-card hover:shadow-lg transition-all duration-300 group">
      <CardContent className="p-6">
        {/* Content Preview */}
        <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg mb-4 flex items-center justify-center">
          <Video className="h-8 w-8 text-primary" />
        </div>

        {/* Content Info */}
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-lg mb-1 line-clamp-2 group-hover:text-primary transition-colors">
              {item.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {item.description}
            </p>
          </div>

          {/* Stats */}
          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Star className="h-3 w-3 text-yellow-500 fill-current" />
              <span>{item.rating || "4.8"}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="h-3 w-3" />
              <span>{item.views_count || "1.2K"} views</span>
            </div>
          </div>

          {/* Price & Action */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center space-x-2">
              <Coins className="h-4 w-4 text-primary" />
              <span className="font-bold text-primary">
                {item.price || "Free"}
              </span>
              {item.price > 0 && <span className="text-xs text-muted-foreground">credits</span>}
            </div>
            <Button size="sm" variant="outline">
              {item.price > 0 ? "Purchase" : "Watch"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderCreatorCard = (creatorData) => {
    const creator = creatorData.creator
    return (
      <Card key={creator.id} className="gaming-card hover:shadow-lg transition-all duration-300">
        <CardContent className="p-6">
          {/* Creator Header */}
          <div className="flex items-center space-x-4 mb-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={creator.avatar_url} />
              <AvatarFallback className="bg-gradient-gaming text-white text-lg">
                {creator.display_name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-semibold text-lg">{creator.display_name}</h3>
                {creator.is_verified && <Badge className="text-xs bg-blue-500">✓</Badge>}
              </div>
              <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span>{creator.rating || "4.9"}</span>
                  <span>({creator.review_count || "98"})</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Zap className="h-4 w-4 text-green-500" />
                  <span>{creatorData.response_time || "2 hrs"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {creator.skills?.slice(0, 4).map((skill, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          {/* Bio */}
          <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
            {creator.bio || "Experienced creator specializing in gaming content and tutorials."}
          </p>

          {/* Stats & Action */}
          <div className="flex items-center justify-between pt-3 border-t">
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">{creatorData.completion_rate || 98}%</span> completion rate
            </div>
            <Button size="sm" className="gaming-card">
              View Profile
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center animate-gaming-pulse">
            <ShoppingCart className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          🛍️ WayaCreate 
          <span className="gradient-gaming bg-clip-text text-transparent"> Marketplace</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Discover amazing services, content, and creators. Every purchase includes tutorials!
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {marketplaceStats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="gaming-card">
              <CardContent className="p-4 text-center">
                <Icon className={`h-6 w-6 ${stat.color} mx-auto mb-2`} />
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search marketplace..."
            value={searchQuery}
            onChange={handleSearch}
            className="pl-10"
          />
        </div>
        {user && (
          <div className="flex items-center space-x-2 text-sm">
            <Coins className="h-4 w-4 text-primary" />
            <span className="font-medium">{getTokenBalance().toLocaleString()} credits</span>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Categories */}
          <Card className="gaming-card">
            <CardHeader>
              <CardTitle className="text-lg">Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {categories.map((category) => {
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
                      <Icon className={`h-5 w-5 ${selectedCategory === category.id ? 'text-white' : category.color}`} />
                      <span className="font-medium">{category.name}</span>
                    </div>
                  </button>
                )
              })}
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="creators">Creators</TabsTrigger>
            </TabsList>

            <TabsContent value="services" className="space-y-6">
              {loading ? (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-10 h-10 bg-muted rounded-full" />
                          <div className="space-y-2 flex-1">
                            <div className="h-3 bg-muted rounded w-3/4" />
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
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredItems().map(renderServiceCard)}
                </div>
              )}
            </TabsContent>

            <TabsContent value="content" className="space-y-6">
              {loading ? (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-6">
                        <div className="aspect-video bg-muted rounded-lg mb-4" />
                        <div className="space-y-2">
                          <div className="h-4 bg-muted rounded w-full" />
                          <div className="h-4 bg-muted rounded w-2/3" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredItems().map(renderContentCard)}
                </div>
              )}
            </TabsContent>

            <TabsContent value="creators" className="space-y-6">
              {loading ? (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="w-16 h-16 bg-muted rounded-full" />
                          <div className="space-y-2 flex-1">
                            <div className="h-4 bg-muted rounded w-3/4" />
                            <div className="h-3 bg-muted rounded w-1/2" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-3 bg-muted rounded w-full" />
                          <div className="h-3 bg-muted rounded w-2/3" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredItems().map(renderCreatorCard)}
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Empty State */}
          {!loading && filteredItems().length === 0 && (
            <div className="text-center py-12">
              <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No items found</h3>
              <p className="text-muted-foreground">
                {searchQuery ? "Try different search terms" : "New items coming soon!"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}