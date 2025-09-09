import React, { useState, useEffect } from "react"
import axios from "axios"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  Play, 
  Download, 
  Eye, 
  Clock,
  Palette,
  Layers,
  Brush,
  Zap,
  Award,
  Star
} from "lucide-react"

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL
const API = `${BACKEND_URL}/api`

export function DesignPage() {
  const [content, setContent] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  const designCategories = [
    { name: "Blender 3D", color: "bg-orange-500", icon: "🎨", count: "120+ tutorials" },
    { name: "Video Editing", color: "bg-purple-500", icon: "🎬", count: "85+ guides" },
    { name: "Graphics Design", color: "bg-pink-500", icon: "✨", count: "95+ templates" },
    { name: "UI/UX Design", color: "bg-blue-500", icon: "📱", count: "45+ courses" },
    { name: "Animation", color: "bg-green-500", icon: "🎭", count: "60+ tutorials" },
    { name: "3D Modeling", color: "bg-red-500", icon: "🏗️", count: "75+ models" }
  ]

  useEffect(() => {
    fetchDesignContent()
  }, [])

  const fetchDesignContent = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API}/content?category=Design&limit=20`)
      setContent(response.data)
    } catch (error) {
      console.error('Error fetching design content:', error)
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
          <div className="w-16 h-16 bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl flex items-center justify-center animate-gaming-pulse">
            <Palette className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          🎨 Design & 
          <span className="gradient-gaming bg-clip-text text-transparent"> Creative</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Master Blender 3D modeling, video editing, graphics design, and animation. 
          Every tutorial includes project files and step-by-step guidance!
        </p>
      </div>

      {/* Featured Categories */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">🎯 Design Specialties</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {designCategories.map((category, index) => (
            <Card key={index} className="gaming-card cursor-pointer hover:shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 ${category.color} rounded-lg flex items-center justify-center`}>
                    <span className="text-2xl">{category.icon}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{category.name}</h3>
                    <p className="text-sm text-muted-foreground">{category.count}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Waya's Specialties Banner */}
      <div className="bg-gradient-to-r from-orange-500/10 to-purple-500/10 rounded-lg p-6 mb-8 border border-orange-500/20">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
            <Layers className="h-6 w-6 text-orange-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">🎨 Waya's Design Masterclasses</h3>
            <p className="text-muted-foreground mb-2">
              Learn directly from Waya Steurbaut's design expertise! Every design tutorial includes:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div className="flex items-center space-x-2">
                <Brush className="h-4 w-4 text-blue-500" />
                <span>Complete Blender project files</span>
              </div>
              <div className="flex items-center space-x-2">
                <Play className="h-4 w-4 text-green-500" />
                <span>HD screen recordings</span>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="h-4 w-4 text-yellow-500" />
                <span>Pro tips and shortcuts</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4 text-purple-500" />
                <span>Bonus technique videos</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-md mx-auto mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search design tutorials, models, templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
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
                  src={item.thumbnail_url || `https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=225&fit=crop&auto=format`}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                
                {/* Play Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <Button size="lg" className="gaming-card">
                    <Play className="mr-2 h-5 w-5" />
                    Learn Now
                  </Button>
                </div>

                {/* Badges */}
                <div className="absolute top-3 left-3 flex gap-2">
                  <Badge className="bg-purple-500 hover:bg-purple-600">
                    🎨 Design
                  </Badge>
                  {item.price === 0 && (
                    <Badge className="bg-green-500 hover:bg-green-600">
                      🆓 Free
                    </Badge>
                  )}
                </div>

                {/* Duration/Complexity */}
                <div className="absolute bottom-3 right-3">
                  <Badge variant="secondary" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    {item.difficulty || "Intermediate"}
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

                {/* Design Features */}
                <div className="flex items-center space-x-3 text-xs text-muted-foreground mb-3">
                  <div className="flex items-center space-x-1">
                    <Layers className="h-3 w-3" />
                    <span>Project Files</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Brush className="h-3 w-3" />
                    <span>Editable</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="h-3 w-3 text-yellow-500" />
                    <span>{item.rating || "4.9"}</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {item.tags?.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Pricing */}
                <div className="flex items-center justify-between">
                  <div className="text-lg font-bold text-primary">
                    {item.price === 0 ? "Free to Watch" : `${item.price} Tokens`}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline">
                      Preview
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
          <Palette className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No design content found</h3>
          <p className="text-muted-foreground">
            {searchQuery ? "Try different search terms" : "New design tutorials coming soon!"}
          </p>
        </div>
      )}
    </div>
  )
}