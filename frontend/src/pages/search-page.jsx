import React, { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import axios from "axios"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Search, 
  Filter, 
  Play, 
  Download, 
  Eye, 
  Heart, 
  Star,
  Clock,
  User,
  Briefcase,
  Users,
  FileText,
  Gamepad2,
  Palette,
  Code
} from "lucide-react"

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL
const API = `${BACKEND_URL}/api`

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || "")
  const [results, setResults] = useState({
    content: [],
    services: [],
    creators: [],
    communities: []
  })
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [filters, setFilters] = useState({
    category: "",
    content_type: "",
    sort_by: "relevance"
  })

  const searchCategories = [
    { id: "all", name: "All Results", icon: Search },
    { id: "content", name: "Content", icon: Play },
    { id: "services", name: "Services", icon: Briefcase },
    { id: "creators", name: "Creators", icon: User },
    { id: "community", name: "Community", icon: Users }
  ]

  useEffect(() => {
    const query = searchParams.get('q')
    if (query) {
      setSearchQuery(query)
      performSearch(query)
    }
  }, [searchParams])

  const performSearch = async (query) => {
    if (!query.trim()) return
    
    setLoading(true)
    try {
      // Search content
      const contentResponse = await axios.get(`${API}/content?search=${encodeURIComponent(query)}&limit=10`)
      
      // Search services
      const servicesResponse = await axios.get(`${API}/services?search=${encodeURIComponent(query)}&limit=10`)
      
      // Mock community posts and creators for now
      const mockCreators = [
        {
          id: "1",
          name: "Waya Steurbaut",
          username: "@wayacreate",
          bio: "Gaming, design & tech content creator. YouTube @wayasteurbaut",
          avatar: "",
          followers: 25000,
          verified: true,
          specialties: ["Minecraft", "Blender", "Video Editing"],
          rating: 4.9
        }
      ].filter(creator => 
        creator.name.toLowerCase().includes(query.toLowerCase()) ||
        creator.bio.toLowerCase().includes(query.toLowerCase()) ||
        creator.specialties.some(s => s.toLowerCase().includes(query.toLowerCase()))
      )

      const mockCommunityPosts = [
        {
          id: "1",
          title: "Epic Minecraft Castle Build Tutorial Coming Soon!",
          content: "Working on an amazing medieval castle tutorial with complete project files. What builds would you like to see next?",
          author: "Waya Steurbaut",
          likes: 234,
          comments: 45,
          created_at: new Date().toISOString()
        }
      ].filter(post => 
        post.title.toLowerCase().includes(query.toLowerCase()) ||
        post.content.toLowerCase().includes(query.toLowerCase())
      )

      setResults({
        content: contentResponse.data || [],
        services: servicesResponse.data || [],
        creators: mockCreators,
        communities: mockCommunityPosts
      })
      
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery })
      performSearch(searchQuery)
    }
  }

  const getTotalResults = () => {
    return results.content.length + results.services.length + results.creators.length + results.communities.length
  }

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">
          🔍 Search Results
          {searchQuery && (
            <span className="text-muted-foreground text-xl ml-2">
              for "{searchQuery}"
            </span>
          )}
        </h1>
        
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="max-w-2xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search for content, creators, services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 text-lg"
            />
            <Button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2">
              Search
            </Button>
          </div>
        </form>
      </div>

      {searchQuery && (
        <>
          {/* Results Summary */}
          <div className="mb-6">
            <p className="text-muted-foreground">
              Found {getTotalResults()} results in {loading ? '...' : '0.15'} seconds
            </p>
          </div>

          {/* Search Categories */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-8">
              {searchCategories.map((category) => {
                const Icon = category.icon
                const count = category.id === 'all' ? getTotalResults() : 
                              category.id === 'content' ? results.content.length :
                              category.id === 'services' ? results.services.length :
                              category.id === 'creators' ? results.creators.length :
                              results.communities.length

                return (
                  <TabsTrigger key={category.id} value={category.id} className="flex items-center space-x-2">
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{category.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {count}
                    </Badge>
                  </TabsTrigger>
                )
              })}
            </TabsList>

            {/* All Results */}
            <TabsContent value="all" className="space-y-8">
              {/* Content Results */}
              {results.content.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <Play className="mr-2 h-5 w-5" />
                    Content ({results.content.length})
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {results.content.slice(0, 4).map((item) => (
                      <Card key={item.id} className="gaming-card">
                        <CardContent className="p-4">
                          <div className="flex space-x-4">
                            <img 
                              src={item.thumbnail_url || "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=120&h=80&fit=crop"}
                              alt={item.title}
                              className="w-20 h-14 object-cover rounded"
                            />
                            <div className="flex-1">
                              <h3 className="font-semibold line-clamp-1">{item.title}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                {item.description}
                              </p>
                              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                <div className="flex items-center space-x-1">
                                  <Eye className="h-3 w-3" />
                                  <span>{item.views_count || 0}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Star className="h-3 w-3 text-yellow-500" />
                                  <span>{item.rating || 4.8}</span>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {item.content_type}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Services Results */}
              {results.services.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <Briefcase className="mr-2 h-5 w-5" />
                    Services ({results.services.length})
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {results.services.slice(0, 4).map((service) => (
                      <Card key={service.id} className="gaming-card">
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-4">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-gradient-gaming text-white">
                                W
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <h3 className="font-semibold line-clamp-1">{service.title}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                {service.description}
                              </p>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                  <Star className="h-3 w-3 text-yellow-500" />
                                  <span>{service.rating || 4.9}</span>
                                  <span>({service.review_count || 156} reviews)</span>
                                </div>
                                <div className="text-sm font-semibold text-primary">
                                  From {service.packages?.basic?.price || 299} credits
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Creators Results */}
              {results.creators.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <User className="mr-2 h-5 w-5" />
                    Creators ({results.creators.length})
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {results.creators.map((creator) => (
                      <Card key={creator.id} className="gaming-card">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={creator.avatar} />
                              <AvatarFallback className="bg-gradient-gaming text-white">
                                {creator.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <h3 className="font-semibold">{creator.name}</h3>
                                {creator.verified && <Badge className="text-xs bg-blue-500">✓</Badge>}
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {creator.bio}
                              </p>
                              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                <span>{creator.followers?.toLocaleString()} followers</span>
                                <div className="flex items-center space-x-1">
                                  <Star className="h-3 w-3 text-yellow-500" />
                                  <span>{creator.rating}</span>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {creator.specialties?.slice(0, 3).map((specialty, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {specialty}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Community Results */}
              {results.communities.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <Users className="mr-2 h-5 w-5" />
                    Community Posts ({results.communities.length})
                  </h2>
                  <div className="space-y-4">
                    {results.communities.map((post) => (
                      <Card key={post.id} className="gaming-card">
                        <CardContent className="p-4">
                          <h3 className="font-semibold mb-2">{post.title}</h3>
                          <p className="text-muted-foreground mb-3">{post.content}</p>
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>by {post.author}</span>
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-1">
                                <Heart className="h-4 w-4" />
                                <span>{post.likes}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <FileText className="h-4 w-4" />
                                <span>{post.comments}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Individual category tabs */}
            <TabsContent value="content">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.content.map((item) => (
                  <Card key={item.id} className="gaming-card">
                    <CardContent className="p-4">
                      <img 
                        src={item.thumbnail_url || "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=300&h=200&fit=crop"}
                        alt={item.title}
                        className="w-full h-40 object-cover rounded mb-4"
                      />
                      <h3 className="font-semibold mb-2 line-clamp-2">{item.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                        {item.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Eye className="h-4 w-4" />
                          <span>{item.views_count || 0}</span>
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span>{item.rating || 4.8}</span>
                        </div>
                        <Button size="sm">
                          <Play className="mr-2 h-4 w-4" />
                          Watch
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Empty state */}
            {getTotalResults() === 0 && !loading && searchQuery && (
              <div className="text-center py-12">
                <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No results found</h3>
                <p className="text-muted-foreground mb-4">
                  Try different keywords or browse our categories
                </p>
                <div className="flex justify-center space-x-2">
                  <Button variant="outline" onClick={() => window.location.href = '/gaming'}>
                    <Gamepad2 className="mr-2 h-4 w-4" />
                    Gaming
                  </Button>
                  <Button variant="outline" onClick={() => window.location.href = '/design'}>
                    <Palette className="mr-2 h-4 w-4" />
                    Design
                  </Button>
                  <Button variant="outline" onClick={() => window.location.href = '/tutorials'}>
                    <Code className="mr-2 h-4 w-4" />
                    Tutorials
                  </Button>
                </div>
              </div>
            )}
          </Tabs>
        </>
      )}

      {/* Initial state */}
      {!searchQuery && (
        <div className="text-center py-12">
          <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Search WayaCreate</h3>
          <p className="text-muted-foreground">
            Find gaming tutorials, design resources, services, and creators
          </p>
        </div>
      )}
    </div>
  )
}