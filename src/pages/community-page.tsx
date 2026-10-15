import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { showToast } from "@/components/ui/toaster"
import { 
  Users, 
  MessageSquare, 
  Heart, 
  Share2, 
  Sparkles, 
  Send,
  Trophy,
  Flame
} from "lucide-react"

export function CommunityPage() {
  const { user } = useAuth()
  const [newPost, setNewPost] = useState("")
  const [posts, setPosts] = useState([
    {
      id: "p1",
      author: "Waya Steurbaut",
      role: "Lead Creator",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      content: "Just dropped a 45-minute deep dive on Lumen lighting optimization for modular sci-fi corridors in Unreal Engine 5.5! Source FBX files and trim sheets are in the Marketplace. What game theme should we build next week?",
      likes: 64,
      comments: 18,
      timestamp: "2 hours ago",
      tags: ["UnrealEngine", "Tutorial", "Gamedev"]
    },
    {
      id: "p2",
      author: "Sarah Chen",
      role: "Alpha Guild Officer",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      content: "We just accepted our first large studio tender through the Bidding system! Alpha Guild members can check the private Discord channel for milestone task allocations.",
      likes: 42,
      comments: 9,
      timestamp: "5 hours ago",
      tags: ["Guilds", "Milestones", "Collaboration"]
    },
    {
      id: "p3",
      author: "Marcus Vance",
      role: "Gameplay Engineer",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      content: "Pro-tip for junior programmers using Unity: avoid allocating closures in your update loops! Cache your delegates or use static struct event payloads to keep GC spikes at absolute zero.",
      likes: 51,
      comments: 12,
      timestamp: "Yesterday",
      tags: ["UnityTips", "CSharp", "Performance"]
    }
  ])

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPost.trim()) return

    const postObj = {
      id: `p_${Date.now()}`,
      author: user?.display_name || "Community Creator",
      role: user?.role === "creator" ? "Verified Creator" : "Member",
      avatar: user?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      content: newPost,
      likes: 1,
      comments: 0,
      timestamp: "Just now",
      tags: ["Community", "Discussion"]
    }

    setPosts([postObj, ...posts])
    setNewPost("")
    showToast({
      title: "Post Published!",
      description: "Shared with the WayaCreate community feed.",
      variant: "success"
    })
  }

  const handleLike = (id: string) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p))
  }

  return (
    <div className="container py-8 md:py-12 max-w-4xl space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="flex justify-center mb-2">
          <div className="w-14 h-14 bg-gradient-gaming rounded-2xl flex items-center justify-center shadow-lg">
            <Users className="h-7 w-7 text-white" />
          </div>
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
          🌐 Creator{" "}
          <span className="gradient-primary bg-clip-text text-transparent">Community</span>
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Connect with 125K+ game developers, 3D artists, and content creators. Share WIPs, feedback, and tips.
        </p>
      </div>

      {/* Create Post Box */}
      <Card className="border-border bg-card p-4">
        <form onSubmit={handleCreatePost} className="space-y-3">
          <div className="flex items-start space-x-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user?.avatar_url} />
              <AvatarFallback className="bg-gradient-gaming text-white text-xs">
                {user?.display_name?.charAt(0) || "W"}
              </AvatarFallback>
            </Avatar>
            <Textarea
              placeholder="Share a game development update, question, or asset showcase..."
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              rows={3}
              className="text-sm"
            />
          </div>
          <div className="flex justify-between items-center pt-1 border-t">
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Flame className="h-4 w-4 text-orange-500" />
              <span>Visible to all creators</span>
            </div>
            <Button type="submit" size="sm" className="bg-primary text-primary-foreground text-xs">
              <Send className="mr-1.5 h-3.5 w-3.5" />
              Post Update
            </Button>
          </div>
        </form>
      </Card>

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.map((post) => (
          <Card key={post.id} className="gaming-card border-border bg-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={post.avatar} />
                  <AvatarFallback className="bg-gradient-gaming text-white text-xs">
                    {post.author.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="font-bold text-sm">{post.author}</span>
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      {post.role}
                    </Badge>
                  </div>
                  <div className="text-[11px] text-muted-foreground">{post.timestamp}</div>
                </div>
              </div>
            </div>

            <p className="text-sm text-foreground/90 leading-relaxed">
              {post.content}
            </p>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {post.tags.map((tag, i) => (
                <span key={i} className="text-xs text-primary font-medium">
                  #{tag}
                </span>
              ))}
            </div>

            <div className="flex items-center space-x-6 pt-3 border-t text-xs text-muted-foreground">
              <button
                type="button"
                onClick={() => handleLike(post.id)}
                className="flex items-center space-x-1.5 hover:text-red-500 transition-colors"
              >
                <Heart className="h-4 w-4" />
                <span>{post.likes}</span>
              </button>
              <div className="flex items-center space-x-1.5">
                <MessageSquare className="h-4 w-4" />
                <span>{post.comments} comments</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  showToast({ title: "Link Copied", description: "Post URL copied to clipboard." })
                }}
                className="flex items-center space-x-1.5 hover:text-foreground transition-colors ml-auto"
              >
                <Share2 className="h-4 w-4" />
                <span>Share</span>
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
