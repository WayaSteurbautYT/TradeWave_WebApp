import { useState } from "react"
import { MockStore } from "@/data/mockStore"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { 
  Briefcase, 
  Search, 
  Star, 
  Zap, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  Trophy
} from "lucide-react"
import { useNavigate } from "react-router-dom"

export function HirePage() {
  const [search, setSearch] = useState("")
  const navigate = useNavigate()

  const creators = [
    {
      id: "usr_waya_001",
      name: "Waya Steurbaut",
      title: "Lead Game Architect & 3D Environment Specialist",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      rating: 4.98,
      reviews: 248,
      responseTime: "< 1 hour",
      completionRate: "100%",
      skills: ["Unreal Engine 5", "Blender", "PBR Shaders", "Level Design", "Modular Kits"],
      bio: "Founder of WayaCreate with 125K+ YouTube students. Delivering production-ready 3D game environments with companion breakdown video tutorials.",
      startingPrice: 250
    },
    {
      id: "usr_sarah_002",
      name: "Sarah Chen",
      title: "Senior UI/UX & Technical Artist",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      rating: 4.95,
      reviews: 132,
      responseTime: "< 2 hours",
      completionRate: "98%",
      skills: ["Figma Design Systems", "Gaming HUDs", "React/Tailwind", "Shader Graph"],
      bio: "Crafting sci-fi and cyberpunk interfaces for indie and mid-sized game studios worldwide. Full component specs and implementation tutorials included.",
      startingPrice: 320
    },
    {
      id: "usr_marcus_003",
      name: "Marcus Vance",
      title: "Lead Multiplayer & Netcode Engineer",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      rating: 4.92,
      reviews: 89,
      responseTime: "< 3 hours",
      completionRate: "99%",
      skills: ["Unity C#", "Unreal C++", "Rollback Netcode", "ScriptableObjects"],
      bio: "10+ years architecting scalable multiplayer systems, inventory management, and fast-paced hitscan combat. Fully documented code and architectural tours.",
      startingPrice: 450
    },
    {
      id: "usr_elena_004",
      name: "Elena Rostova",
      title: "Cinematic Game Trailer Editor & Sound Designer",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
      rating: 4.97,
      reviews: 210,
      responseTime: "< 1 hour",
      completionRate: "100%",
      skills: ["DaVinci Resolve", "After Effects", "FMOD", "Steam Trailers"],
      bio: "Specializing in high-converting Steam store reveal trailers, audio mixing, and kinetic typography that drives player wishlists.",
      startingPrice: 280
    }
  ]

  const filtered = creators.filter(c => 
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.skills.some(s => s.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="container py-8 md:py-12 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="flex justify-center mb-2">
          <div className="w-14 h-14 bg-gradient-gaming rounded-2xl flex items-center justify-center shadow-lg">
            <Briefcase className="h-7 w-7 text-white" />
          </div>
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
          💼 Hire Top{" "}
          <span className="gradient-primary bg-clip-text text-transparent">Creators</span>
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Commission custom 3D models, code architectures, shaders, and video edits. All contracts backed by milestone escrow and instructional videos.
        </p>
      </div>

      <div className="max-w-md mx-auto relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by creator name or skill (e.g. Blender, Netcode)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-10"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {filtered.map((creator) => (
          <Card key={creator.id} className="gaming-card border-border bg-card p-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <Avatar className="h-16 w-16 border-2 border-primary/20">
                  <AvatarImage src={creator.avatar} />
                  <AvatarFallback className="bg-gradient-gaming text-white text-lg">
                    {creator.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1.5">
                    <h3 className="font-bold text-base">{creator.name}</h3>
                    <Badge className="bg-blue-500 text-white text-[9px] h-3.5 px-1">✓ Verified</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground font-medium truncate mt-0.5">
                    {creator.title}
                  </p>
                  <div className="flex items-center space-x-3 text-xs text-muted-foreground mt-1.5">
                    <div className="flex items-center text-yellow-500">
                      <Star className="h-3.5 w-3.5 fill-current mr-0.5" />
                      <span className="font-bold text-foreground">{creator.rating}</span>
                      <span className="ml-0.5">({creator.reviews})</span>
                    </div>
                    <div className="flex items-center text-emerald-500">
                      <Zap className="h-3.5 w-3.5 mr-0.5" />
                      <span>{creator.responseTime}</span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                {creator.bio}
              </p>

              <div className="flex flex-wrap gap-1.5">
                {creator.skills.map((skill, i) => (
                  <Badge key={i} variant="secondary" className="text-[10px]">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t mt-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-muted-foreground block">Starting from</span>
                <span className="text-base font-extrabold text-primary">{creator.startingPrice} credits</span>
              </div>
              <Button
                size="sm"
                className="bg-primary text-primary-foreground text-xs font-semibold"
                onClick={() => navigate("/marketplace")}
              >
                View Services &amp; Gigs
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
