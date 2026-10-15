import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Play, 
  Search, 
  Clock, 
  BookOpen, 
  Youtube, 
  Eye, 
  Star, 
  CheckCircle2,
  Download
} from "lucide-react"
import { showToast } from "@/components/ui/toaster"

export function TutorialsPage() {
  const [search, setSearch] = useState("")

  const tutorials = [
    {
      id: "tut_1",
      title: "Building AAA Modular Sci-Fi Environments in Unreal Engine 5 & Blender",
      author: "Waya Steurbaut",
      duration: "48 min",
      views: "18.5K",
      rating: 4.98,
      level: "Intermediate",
      tags: ["Blender", "Unreal Engine 5", "Modular Kits", "Lumen"],
      description: "Learn the exact grid-snapping workflow, trim sheets, and material instances used to construct high-performance sci-fi alleys in under an hour.",
    },
    {
      id: "tut_2",
      title: "Stylized Water & Waterfall Shader Graph in Unity URP",
      author: "Sarah Chen",
      duration: "32 min",
      views: "12.1K",
      rating: 4.94,
      level: "Beginner",
      tags: ["Unity", "Shader Graph", "URP", "Stylized"],
      description: "Step-by-step creation of caustic depth fading, vertex foam displacement, and surface refraction without writing a single line of raw HLSL.",
    },
    {
      id: "tut_3",
      title: "Fast-Paced Rollback Netcode Fundamentals for Multiplayer Combat Games",
      author: "Marcus Vance",
      duration: "55 min",
      views: "9.8K",
      rating: 4.92,
      level: "Advanced",
      tags: ["C#", "Multiplayer", "Netcode", "Architecture"],
      description: "How to decouple simulation state from visual representation, implement determinism checkpoints, and smoothly blend client predictions.",
    },
    {
      id: "tut_4",
      title: "Cinematic Game Trailer Cutting: Sound Design Stems & Pacing",
      author: "Elena Rostova",
      duration: "36 min",
      views: "14.2K",
      rating: 4.96,
      level: "All Levels",
      tags: ["DaVinci Resolve", "Sound Design", "Marketing", "Steam"],
      description: "The secret 3-act trailer pacing structure that drives Steam wishlists: hook in the first 5 seconds, escalating rhythm, and memorable outro call-to-action.",
    },
  ]

  const filtered = tutorials.filter(t => 
    !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="container py-8 md:py-12 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="flex justify-center mb-2">
          <div className="w-14 h-14 bg-gradient-gaming rounded-2xl flex items-center justify-center shadow-lg">
            <Play className="h-7 w-7 text-white" />
          </div>
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
          🎥 Masterclass{" "}
          <span className="gradient-gaming bg-clip-text text-transparent">Tutorials</span>
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Every tutorial includes downloadable project files, source scripts, and step-by-step video instructions from Waya Steurbaut and top creators.
        </p>
      </div>

      <div className="max-w-md mx-auto relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search tutorials by engine, skill, or topic..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-10"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {filtered.map((tut) => (
          <Card key={tut.id} className="gaming-card border-border bg-card p-6 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs text-primary border-primary/30 font-semibold">
                  {tut.level}
                </Badge>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{tut.duration}</span>
                </div>
              </div>

              <h3 className="text-lg font-bold hover:text-primary transition-colors cursor-pointer">
                {tut.title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {tut.description}
              </p>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {tut.tags.map((tag, i) => (
                  <Badge key={i} variant="secondary" className="text-[10px]">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t mt-4 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs">
                <span className="font-semibold">{tut.author}</span>
                <span className="text-muted-foreground">• {tut.views} views</span>
              </div>
              <Button
                size="sm"
                className="bg-primary text-primary-foreground text-xs"
                onClick={() => {
                  showToast({
                    title: "Opening Tutorial Video",
                    description: `Streaming "${tut.title}" with downloadable workshop files.`,
                    variant: "success"
                  })
                }}
              >
                <Play className="mr-1.5 h-3.5 w-3.5 fill-current" />
                Watch Tutorial
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
