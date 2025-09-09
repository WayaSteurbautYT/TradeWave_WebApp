import React, { useState, useEffect } from "react"
import axios from "axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Search, 
  Play, 
  Download, 
  Eye, 
  Heart, 
  Star,
  Gamepad2,
  Users,
  TrendingUp,
  Clock
} from "lucide-react"

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL
const API = `${BACKEND_URL}/api`

export function GamingPage() {
  const [content, setContent] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const gamingCategories = [
    { id: "all", name: "All Gaming", icon: Gamepad2 },
    { id: "minecraft", name: "Minecraft", icon: Play },
    { id: "fortnite", name: "Fortnite", icon: TrendingUp },
    { id: "roblox", name: "Roblox", icon: Users },
    { id: "destiny", name: "Destiny 2", icon: Star }
  ]

  useEffect(() => {
    fetchGamingContent()
  }, [selectedCategory])

  const fetchGamingContent = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        category: "Gaming",
        limit: "20"
      })
      
      if (selectedCategory !== "all") {
        params.append("tags", selectedCategory)
      }
      
      const response = await axios.get(`${API}/content?${params}`)
      setContent(response.data)
    } catch (error) {
      console.error('Error fetching content:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredContent = content.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-gaming rounded-2xl flex items-center justify-center animate-gaming-pulse">
            <Gamepad2 className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          🎮 Gaming 
          <span className="gradient-gaming bg-clip-text text-transparent"> Content</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Minecraft builds, Fortnite strategies, Roblox creations, and Destiny 2 guides - 
          all with complete tutorials and project files!
        </p>
      </div>

      {/* Search and Categories */}
      <div className="space-y-6 mb-8">
        {/* Search */}
        <div className="max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search gaming content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
            {gamingCategories.map((category) => {
              const Icon = category.icon
              return (
                <TabsTrigger key={category.id} value={category.id} className="flex items-center space-x-2">
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{category.name}</span>
                </TabsTrigger>
              )
            })}
          </TabsList>
        </Tabs>
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-video bg-muted rounded-t-lg" />
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded mb-2" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContent.map((item) => (
            <Card key={item.id} className="gaming-card overflow-hidden">
              {/* Thumbnail */}
              <div className="relative aspect-video overflow-hidden">
                <img 
                  src={item.thumbnail_url || `https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=400&h=225&fit=crop&auto=format`}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <Button size="sm" className="gaming-card">
                    <Play className="mr-2 h-4 w-4" />
                    Watch
                  </Button>
                </div>

                {/* Badges */}
                <div className="absolute top-3 left-3 flex gap-2">
                  <Badge className="bg-green-500 hover:bg-green-600">
                    🎮 {item.content_type}
                  </Badge>
                  {item.price === 0 && (
                    <Badge className="bg-blue-500 hover:bg-blue-600">
                      🆓 Free
                    </Badge>
                  )}
                </div>

                {/* Duration */}
                <div className="absolute bottom-3 right-3">
                  <Badge variant="secondary" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    {item.duration || "15:30"}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                  {item.title}
                </h3>
                
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {item.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {item.tags?.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
                      <Eye className="h-4 w-4" />
                      <span>{item.views_count?.toLocaleString() || "0"}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Heart className="h-4 w-4" />
                      <span>{item.likes_count?.toLocaleString() || "0"}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span>{item.rating || "4.8"}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between">
                  <div className="text-lg font-bold text-primary">
                    {item.price === 0 ? "Free" : `${item.price} Tokens`}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4" />
                    </Button>
                    {item.download_price && (
                      <Button size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        {item.download_price} TW
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredContent.length === 0 && (
        <div className="text-center py-12">
          <Gamepad2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No gaming content found</h3>
          <p className="text-muted-foreground">
            {searchQuery ? "Try adjusting your search terms" : "Be the first to create gaming content!"}
          </p>
        </div>
      )}
    </div>
  )
}