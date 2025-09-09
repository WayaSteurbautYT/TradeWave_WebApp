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
  BookOpen,
  Video,
  FileText,
  Zap,
  Award
} from "lucide-react"

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL
const API = `${BACKEND_URL}/api`

export function TutorialsPage() {
  const [content, setContent] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  const tutorialCategories = [
    { name: "Minecraft Building", color: "bg-green-500", icon: "🏰" },
    { name: "Blender 3D", color: "bg-orange-500", icon: "🎨" },
    { name: "Video Editing", color: "bg-purple-500", icon: "🎬" },
    { name: "AI Tools", color: "bg-blue-500", icon: "🤖" },
    { name: "Game Development", color: "bg-red-500", icon: "🎮" },
    { name: "Graphics Design", color: "bg-pink-500", icon: "✨" }
  ]

  useEffect(() => {
    fetchTutorials()
  }, [])

  const fetchTutorials = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API}/content?content_type=course&limit=20`)
      setContent(response.data)
    } catch (error) {
      console.error('Error fetching tutorials:', error)
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
          <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center animate-gaming-pulse">
            <BookOpen className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          📚 Tutorials & 
          <span className="gradient-gaming bg-clip-text text-transparent"> Courses</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Master gaming, design, and tech with step-by-step tutorials. 
          Every tutorial includes project files and detailed explanations!
        </p>
      </div>

      {/* Featured Categories */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">🔥 Popular Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {tutorialCategories.map((category, index) => (
            <Card key={index} className="gaming-card cursor-pointer">
              <CardContent className="p-4 text-center">
                <div className={`w-12 h-12 ${category.color} rounded-lg flex items-center justify-center mx-auto mb-3`}>
                  <span className="text-2xl">{category.icon}</span>
                </div>
                <h3 className="font-semibold text-sm">{category.name}</h3>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="max-w-md mx-auto mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tutorials and courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tutorial Requirements Banner */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-6 mb-8 border border-primary/20">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
            <Award className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">WayaCreate Tutorial Promise 🎯</h3>
            <p className="text-muted-foreground mb-2">
              Every creator on WayaCreate must provide a complete tutorial showing how they made their content. 
              You get both the final result AND learn how to create it yourself!
            </p>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <Video className="h-4 w-4 text-green-500" />
                <span>Step-by-step video</span>
              </div>
              <div className="flex items-center space-x-1">
                <FileText className="h-4 w-4 text-blue-500" />
                <span>Project files included</span>
              </div>
              <div className="flex items-center space-x-1">
                <Zap className="h-4 w-4 text-yellow-500" />
                <span>Bonus tips & tricks</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tutorials Grid */}
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
                    Start Tutorial
                  </Button>
                </div>

                {/* Badges */}
                <div className="absolute top-3 left-3 flex gap-2">
                  <Badge className="bg-purple-500 hover:bg-purple-600">
                    📚 Tutorial
                  </Badge>
                  {item.price === 0 && (
                    <Badge className="bg-green-500 hover:bg-green-600">
                      🆓 Free
                    </Badge>
                  )}
                </div>

                {/* Duration */}
                <div className="absolute bottom-3 right-3">
                  <Badge variant="secondary" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    45:20
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

                {/* Tutorial Features */}
                <div className="flex items-center space-x-3 text-xs text-muted-foreground mb-3">
                  <div className="flex items-center space-x-1">
                    <Video className="h-3 w-3" />
                    <span>HD Video</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Download className="h-3 w-3" />
                    <span>Files</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Eye className="h-3 w-3" />
                    <span>{item.views_count?.toLocaleString() || "1.2K"}</span>
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
                        Download {item.download_price} TW
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
          <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No tutorials found</h3>
          <p className="text-muted-foreground">
            {searchQuery ? "Try different search terms" : "New tutorials coming soon!"}
          </p>
        </div>
      )}
    </div>
  )
}