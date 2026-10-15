import { useState, useMemo } from "react"
import { MockStore } from "@/data/mockStore"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  Clock,
  Sparkles
} from "lucide-react"
import { showToast } from "@/components/ui/toaster"

export function GamingPage() {
  const [content] = useState(() => MockStore.getContent())
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const gamingCategories = [
    { id: "all", name: "All Gaming", icon: Gamepad2 },
    { id: "unreal", name: "Unreal Engine 5", icon: Play },
    { id: "unity", name: "Unity C#", icon: TrendingUp },
    { id: "blender", name: "Blender 3D", icon: Users },
    { id: "minecraft", name: "Minecraft / Roblox", icon: Star }
  ]

  const filteredContent = useMemo(() => {
    return content.filter((item) => {
      const matchCat = selectedCategory === "all" || 
        item.tags.some(t => t.toLowerCase().includes(selectedCategory.toLowerCase())) ||
        item.title.toLowerCase().includes(selectedCategory.toLowerCase())
      const matchSearch = !searchQuery || 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      return matchCat && matchSearch
    })
  }, [content, selectedCategory, searchQuery])

  return (
    <div className="container py-8 md:py-12 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="flex justify-center mb-2">
          <div className="w-14 h-14 bg-gradient-gaming rounded-2xl flex items-center justify-center shadow-lg">
            <Gamepad2 className="h-7 w-7 text-white" />
          </div>
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
          🎮 Gaming Hub &amp;{" "}
          <span className="gradient-gaming bg-clip-text text-transparent">Assets</span>
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Unreal Engine 5 systems, Blender 3D game props, Unity netcode, and YouTube gaming builds — all with downloadable project files and tutorials!
        </p>
      </div>

      {/* Search and Categories */}
      <div className="space-y-4 max-w-2xl mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search game assets, character models, scripts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10"
          />
        </div>

        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 h-auto p-1">
            {gamingCategories.map((cat) => {
              const Icon = cat.icon
              return (
                <TabsTrigger key={cat.id} value={cat.id} className="flex items-center space-x-1.5 py-2 text-xs">
                  <Icon className="h-3.5 w-3.5" />
                  <span>{cat.name}</span>
                </TabsTrigger>
              )
            })}
          </TabsList>
        </Tabs>
      </div>

      {/* Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContent.map((item) => (
          <Card key={item.id} className="gaming-card border-border bg-card overflow-hidden flex flex-col justify-between">
            <div>
              <div className="relative aspect-video bg-gradient-to-br from-primary/10 via-background to-accent/15 flex items-center justify-center border-b">
                <div className="p-4 bg-background/60 rounded-2xl backdrop-blur-sm">
                  <Gamepad2 className="h-10 w-10 text-primary" />
                </div>
                <div className="absolute top-2.5 left-2.5 flex gap-1">
                  <Badge className="bg-emerald-500 text-white text-[10px]">
                    🎮 {item.content_type}
                  </Badge>
                  {item.tutorial_included && (
                    <Badge variant="secondary" className="text-[10px]">
                      Tutorial Included
                    </Badge>
                  )}
                </div>
                <div className="absolute bottom-2.5 right-2.5">
                  <Badge variant="secondary" className="text-[10px] bg-black/60 text-white border-0">
                    <Clock className="h-3 w-3 mr-1 inline" />
                    {Math.round((item.duration || 1800) / 60)}m
                  </Badge>
                </div>
              </div>

              <CardContent className="p-4 space-y-3">
                <h3 className="font-bold text-sm line-clamp-2 hover:text-primary transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {item.description}
                </p>

                <div className="flex flex-wrap gap-1">
                  {item.tags.map((tag, i) => (
                    <Badge key={i} variant="outline" className="text-[10px] px-1.5 py-0">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t">
                  <div className="flex items-center space-x-1">
                    <Star className="h-3.5 w-3.5 text-yellow-500 fill-current" />
                    <span className="font-semibold text-foreground">{item.rating}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Eye className="h-3.5 w-3.5" />
                    <span>{item.views_count.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Heart className="h-3.5 w-3.5 text-red-500" />
                    <span>{item.likes_count}</span>
                  </div>
                </div>
              </CardContent>
            </div>

            <div className="p-4 pt-0 flex items-center justify-between border-t mt-2">
              <span className="font-black text-sm text-primary">
                {item.price === 0 ? "Free" : `${item.price} Credits`}
              </span>
              <Button
                size="sm"
                className="bg-primary text-primary-foreground text-xs"
                onClick={() => {
                  showToast({
                    title: "Accessing Gaming Asset",
                    description: `Redirecting to "${item.title}" files and video tutorial.`,
                    variant: "success"
                  })
                }}
              >
                <Download className="mr-1.5 h-3.5 w-3.5" />
                Get Asset
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
