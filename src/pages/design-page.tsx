import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Palette, 
  Eye, 
  Heart, 
  Download, 
  ExternalLink,
  Sparkles,
  Layers
} from "lucide-react"
import { showToast } from "@/components/ui/toaster"

export function DesignPage() {
  const [likes, setLikes] = useState<{ [id: string]: number }>({
    d1: 184,
    d2: 240,
    d3: 156,
    d4: 310
  })

  const designs = [
    {
      id: "d1",
      title: "Cyberpunk Neon HUD Interface Kit",
      author: "Sarah Chen",
      category: "UI/UX & Figma",
      image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80",
      description: "Vector-perfect gaming HUD elements, health bars, inventory slots, and sound triggers.",
      credits: 120
    },
    {
      id: "d2",
      title: "Hard-Surface Mecha 3D Model",
      author: "Waya Steurbaut",
      category: "3D Blender & Substance",
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
      description: "Modular mechanical rig with hydraulic pistons, 4K roughness maps, and baked normals.",
      credits: 220
    },
    {
      id: "d3",
      title: "Sci-Fi Weapon Silhouette Concepts",
      author: "Alex Rivera",
      category: "Concept Art",
      image: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80",
      description: "20 high-contrast weapon silhouettes and isometric thumbnail studies for level design.",
      credits: 90
    },
    {
      id: "d4",
      title: "Procedural Hexagonal Shield Shader",
      author: "Marcus Vance",
      category: "Shader Graph",
      image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80",
      description: "Dynamic forcefield shader with impact ripple rings, fresnel glow, and chromatic aberration.",
      credits: 140
    }
  ]

  const handleLike = (id: string) => {
    setLikes(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }))
    showToast({
      title: "Liked!",
      description: "Added to your design inspirations.",
    })
  }

  return (
    <div className="container py-8 md:py-12 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="flex justify-center mb-2">
          <div className="w-14 h-14 bg-gradient-gaming rounded-2xl flex items-center justify-center shadow-lg">
            <Palette className="h-7 w-7 text-white" />
          </div>
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
          🎨 Design &amp; 3D{" "}
          <span className="gradient-primary bg-clip-text text-transparent">Showcase</span>
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Explore curated 3D models, UI/UX systems, concept art, and shaders crafted by community creators with full project files.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {designs.map((d) => (
          <Card key={d.id} className="gaming-card border-border bg-card overflow-hidden group">
            <div className="relative aspect-video overflow-hidden">
              <img
                src={d.image}
                alt={d.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-3 left-3">
                <Badge className="bg-background/90 text-foreground text-xs backdrop-blur-sm border">
                  {d.category}
                </Badge>
              </div>
              <div className="absolute top-3 right-3">
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 w-8 p-0 bg-background/80 backdrop-blur-sm rounded-full"
                  onClick={() => handleLike(d.id)}
                >
                  <Heart className="h-4 w-4 text-red-500 fill-current" />
                </Button>
              </div>
            </div>

            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base hover:text-primary transition-colors">
                  {d.title}
                </h3>
                <span className="font-black text-sm text-primary">{d.credits} credits</span>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                {d.description}
              </p>

              <div className="pt-2 border-t flex items-center justify-between text-xs text-muted-foreground">
                <span>By <strong className="text-foreground">{d.author}</strong></span>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <Heart className="h-3.5 w-3.5 text-red-500" />
                    <span>{likes[d.id] || 0}</span>
                  </div>
                  <Button
                    size="sm"
                    className="h-7 text-xs bg-primary text-primary-foreground"
                    onClick={() => {
                      showToast({
                        title: "Asset Downloaded",
                        description: `Downloading files and tutorial for "${d.title}".`,
                        variant: "success"
                      })
                    }}
                  >
                    <Download className="mr-1 h-3 w-3" />
                    Download
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
