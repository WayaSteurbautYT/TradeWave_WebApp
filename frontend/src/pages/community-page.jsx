import React, { useState, useEffect } from "react"
import axios from "axios"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/AuthContext"
import { 
  Search, 
  Heart, 
  MessageSquare, 
  Share2,
  Users,
  TrendingUp,
  Award,
  Send,
  Image,
  Video,
  Plus,
  Gamepad2,
  Palette,
  Code,
  Youtube
} from "lucide-react"

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL
const API = `${BACKEND_URL}/api`

export function CommunityPage() {
  const { user, isAuthenticated } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [newPost, setNewPost] = useState("")
  const [postTitle, setPostTitle] = useState("")

  const communityStats = [
    { label: "Active Members", value: "25K+", icon: Users, color: "text-blue-500" },
    { label: "Posts Today", value: "487", icon: TrendingUp, color: "text-green-500" },
    { label: "Tutorials Shared", value: "1.2K", icon: Award, color: "text-purple-500" }
  ]

  const trendingTopics = [
    { tag: "minecraft-builds", count: 234, icon: "🏰" },
    { tag: "blender-tips", count: 189, icon: "🎨" },
    { tag: "video-editing", count: 156, icon: "🎬" },
    { tag: "ai-tools", count: 143, icon: "🤖" },
    { tag: "fortnite-strategies", count: 128, icon: "⚔️" },
    { tag: "tutorial-requests", count: 102, icon: "📚" }
  ]

  useEffect(() => {
    fetchCommunityPosts()
  }, [])

  const fetchCommunityPosts = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API}/community/posts?limit=20`)
      setPosts(response.data)
    } catch (error) {
      console.error('Error fetching community posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePost = async () => {
    if (!newPost.trim()) return
    
    try {
      const postData = {
        title: postTitle || null,
        content: newPost,
        post_type: "text",
        tags: []
      }
      
      await axios.post(`${API}/community/posts`, postData)
      setNewPost("")
      setPostTitle("")
      fetchCommunityPosts()
    } catch (error) {
      console.error('Error creating post:', error)
    }
  }

  const filteredPosts = posts.filter(post =>
    post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center animate-gaming-pulse">
            <Users className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          👥 WayaCreate 
          <span className="gradient-gaming bg-clip-text text-transparent"> Community</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Connect with fellow creators, share your work, get feedback, and collaborate on amazing projects!
        </p>
      </div>

      {/* Community Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {communityStats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="gaming-card">
              <CardContent className="p-6 text-center">
                <Icon className={`h-8 w-8 mx-auto mb-3 ${stat.color}`} />
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Create Post */}
          {isAuthenticated && (
            <Card className="gaming-card">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user?.avatar_url} />
                    <AvatarFallback className="bg-gradient-gaming text-white">
                      {user?.display_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-3">
                    <Input
                      placeholder="Give your post a title (optional)..."
                      value={postTitle}
                      onChange={(e) => setPostTitle(e.target.value)}
                    />
                    <Textarea
                      placeholder="What's on your mind? Share your latest project, ask for help, or start a discussion!"
                      value={newPost}
                      onChange={(e) => setNewPost(e.target.value)}
                      className="min-h-[100px]"
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Image className="h-4 w-4 mr-2" />
                          Image
                        </Button>
                        <Button variant="outline" size="sm">
                          <Video className="h-4 w-4 mr-2" />
                          Video
                        </Button>
                      </div>
                      <Button onClick={handleCreatePost} disabled={!newPost.trim()}>
                        <Send className="h-4 w-4 mr-2" />
                        Post
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search community posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Posts Feed */}
          <div className="space-y-6">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-10 h-10 bg-muted rounded-full" />
                      <div className="space-y-2">
                        <div className="h-4 bg-muted rounded w-32" />
                        <div className="h-3 bg-muted rounded w-24" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded w-full" />
                      <div className="h-4 bg-muted rounded w-3/4" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              filteredPosts.map((post) => (
                <Card key={post.id} className="gaming-card">
                  <CardContent className="p-6">
                    {/* Post Header */}
                    <div className="flex items-center space-x-4 mb-4">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-gradient-gaming text-white">
                          W
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold">Waya Steurbaut</h4>
                          <Badge variant="secondary" className="text-xs">Creator</Badge>
                          <Youtube className="h-4 w-4 text-red-500" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(post.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Post Content */}
                    <div className="mb-4">
                      {post.title && (
                        <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
                      )}
                      <p className="text-muted-foreground leading-relaxed">
                        {post.content}
                      </p>
                    </div>

                    {/* Post Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Post Actions */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center space-x-6">
                        <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                          <Heart className="h-4 w-4" />
                          <span>{post.likes_count || 0}</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                          <MessageSquare className="h-4 w-4" />
                          <span>{post.comments_count || 0}</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                          <Share2 className="h-4 w-4" />
                          <span>{post.shares_count || 0}</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Trending Topics */}
          <Card className="gaming-card">
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                Trending Topics
              </h3>
              <div className="space-y-3">
                {trendingTopics.map((topic, index) => (
                  <div key={index} className="flex items-center justify-between cursor-pointer hover:bg-accent p-2 rounded-md transition-colors">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{topic.icon}</span>
                      <span className="text-sm font-medium">#{topic.tag}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {topic.count}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Community Guidelines */}
          <Card className="gaming-card">
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center">
                <Award className="h-5 w-5 mr-2 text-primary" />
                Community Rules
              </h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-start space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>Share your creative work and tutorials</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>Help others learn and grow</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>Give constructive feedback</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-red-500">✗</span>
                  <span>No spam or self-promotion only</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Join Discord */}
          <Card className="gaming-card bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="h-6 w-6 text-purple-500" />
              </div>
              <h3 className="font-semibold mb-2">Join Our Discord!</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Real-time chat with the community
              </p>
              <Button className="w-full" variant="outline">
                Join Discord Server
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}