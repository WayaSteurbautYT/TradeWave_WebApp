import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { MockStore } from "@/data/mockStore"
import { Guild } from "@/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { showToast } from "@/components/ui/toaster"
import { soundFX } from "@/lib/soundEffects"
import { IdGenerator } from "@/lib/idGenerator"
import confetti from "canvas-confetti"
import { 
  Shield, 
  Users, 
  Trophy, 
  Coins, 
  Plus, 
  Star, 
  Sparkles,
  ArrowRight,
  CheckCircle2
} from "lucide-react"

export function GuildsPage() {
  const { user } = useAuth()
  const [guilds, setGuilds] = useState<Guild[]>(() => MockStore.getGuilds())

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [newGuildName, setNewGuildName] = useState("")
  const [newGuildDesc, setNewGuildDesc] = useState("")
  const [newGuildSpecs, setNewGuildSpecs] = useState("Unreal Engine 5, 3D Sculpting, Shaders")

  const handleJoinGuild = (guildId: string) => {
    const success = MockStore.joinGuild(guildId)
    if (success) {
      setGuilds(MockStore.getGuilds())
      soundFX.playFanfare()
      confetti({ particleCount: 35, spread: 60 })
      showToast({
        title: "Joined Guild! 🛡️",
        description: "You are now an active member of the creator guild.",
        variant: "success"
      })
    }
  }

  const handleCreateGuild = () => {
    if (!newGuildName.trim() || !newGuildDesc.trim()) {
      soundFX.playClick()
      showToast({
        title: "Required Fields",
        description: "Please provide a guild name and description.",
        variant: "destructive"
      })
      return
    }

    const scopedGuildId = IdGenerator.guild(user?.id || "usr_waya_001", newGuildName)

    const newGuild: Guild = {
      id: scopedGuildId,
      name: newGuildName,
      description: newGuildDesc,
      logo_url: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=150&auto=format&fit=crop&q=80",
      leader_id: user?.id || "usr_waya_001",
      specializations: newGuildSpecs.split(",").map(s => s.trim()).filter(Boolean),
      member_count: 1,
      max_members: 50,
      level: 1,
      xp: 0,
      reputation: 5.0,
      total_earnings: 0,
      guild_credits: 500,
      is_recruiting: true,
      members: [
        {
          user_id: user?.id || "usr_guest",
          display_name: user?.display_name || "Guild Founder",
          avatar_url: user?.avatar_url,
          role: "leader",
          contribution_points: 500,
          joined_at: new Date().toISOString()
        }
      ],
      created_at: new Date().toISOString()
    }

    const current = MockStore.getGuilds()
    MockStore.saveGuilds([newGuild, ...current])
    setGuilds(MockStore.getGuilds())

    showToast({
      title: "Guild Founded!",
      description: `"${newGuild.name}" is now live on WayaCreate.`,
      variant: "success"
    })
    setIsCreateModalOpen(false)
    setNewGuildName("")
    setNewGuildDesc("")
  }

  return (
    <div className="container py-8 md:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <div className="p-2 bg-gradient-gaming rounded-xl text-white">
              <Shield className="h-5 w-5" />
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">
              Creator Guilds &amp; Syndicates
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Form high-performing creative teams, pool talent on major studio tenders, and grow your shared guild treasury.
          </p>
        </div>

        <Button onClick={() => setIsCreateModalOpen(true)} className="bg-primary text-primary-foreground font-semibold">
          <Plus className="mr-1.5 h-4 w-4" />
          Found a New Guild
        </Button>
      </div>

      {/* Guilds Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {guilds.map((guild) => {
          const isMember = guild.members.some(m => m.user_id === user?.id)
          return (
            <Card key={guild.id} className="gaming-card border-border bg-card flex flex-col justify-between">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={guild.logo_url}
                      alt={guild.name}
                      className="w-12 h-12 rounded-xl object-cover border"
                    />
                    <div>
                      <CardTitle className="text-base font-bold">{guild.name}</CardTitle>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-0.5">
                        <Badge variant="outline" className="text-[10px] py-0">
                          Level {guild.level}
                        </Badge>
                        <div className="flex items-center text-yellow-500">
                          <Star className="h-3 w-3 fill-current mr-0.5" />
                          <span>{guild.reputation}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <CardDescription className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                  {guild.description}
                </CardDescription>

                {/* Specializations */}
                <div className="flex flex-wrap gap-1">
                  {guild.specializations.map((spec, i) => (
                    <Badge key={i} variant="secondary" className="text-[10px] px-2 py-0">
                      {spec}
                    </Badge>
                  ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t text-xs">
                  <div>
                    <span className="text-muted-foreground text-[11px]">Members</span>
                    <div className="font-bold">{guild.member_count} / {guild.max_members}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[11px]">Treasury</span>
                    <div className="font-bold text-primary">{guild.guild_credits.toLocaleString()} credits</div>
                  </div>
                </div>

                {/* Action */}
                <div className="pt-2">
                  {isMember ? (
                    <Button disabled variant="outline" size="sm" className="w-full text-xs text-emerald-600 border-emerald-500/30">
                      <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                      Active Member
                    </Button>
                  ) : (
                    <Button onClick={() => handleJoinGuild(guild.id)} size="sm" className="w-full bg-primary text-primary-foreground text-xs font-semibold">
                      Join Guild
                      <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Found Guild Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogHeader>
          <DialogTitle>Found a New Creator Guild</DialogTitle>
          <DialogDescription>
            Establish your collective to collaborate on tenders, pool revenues, and build guild assets.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold">Guild Name:</label>
            <Input
              placeholder="e.g. Unreal Engine 5 Virtual Production Collective"
              value={newGuildName}
              onChange={(e) => setNewGuildName(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold">Specializations (Comma separated):</label>
            <Input
              placeholder="e.g. Niagara VFX, Blender, C# Netcode, Game Audio"
              value={newGuildSpecs}
              onChange={(e) => setNewGuildSpecs(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold">Guild Mission &amp; Standards:</label>
            <Textarea
              placeholder="Describe your guild's focus, recruitment criteria, and revenue share guidelines..."
              rows={4}
              value={newGuildDesc}
              onChange={(e) => setNewGuildDesc(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => setIsCreateModalOpen(false)}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleCreateGuild} className="bg-primary text-primary-foreground">
            Found Guild (500 Starter XP)
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  )
}
