import React, { useState, useEffect } from "react"
import axios from "axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/contexts/AuthContext"
import { useTokens } from "@/contexts/TokenContext"
import { 
  Shield,
  Users,
  Crown,
  Star,
  Trophy,
  Coins,
  TrendingUp,
  Zap,
  Target,
  Plus,
  Search,
  Settings,
  UserPlus,
  Award,
  Calendar,
  BarChart3,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Briefcase,
  Sword,
  Gem,
  Fire,
  Sparkles
} from "lucide-react"

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL
const API = `${BACKEND_URL}/api`

export function GuildsPage() {
  const { user, isAuthenticated } = useAuth()
  const { getTokenBalance } = useTokens()
  const [activeTab, setActiveTab] = useState("browse")
  const [guilds, setGuilds] = useState([])
  const [myGuild, setMyGuild] = useState(null)
  const [selectedGuild, setSelectedGuild] = useState(null)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // New guild form
  const [newGuild, setNewGuild] = useState({
    name: "",
    description: "",
    specializations: [],
    max_members: 10,
    requirements: {}
  })

  const specializations = [
    { id: "gaming", name: "Gaming", icon: "🎮", color: "text-purple-500" },
    { id: "design", name: "Design", icon: "🎨", color: "text-pink-500" },
    { id: "development", name: "Development", icon: "💻", color: "text-blue-500" },
    { id: "animation", name: "Animation", icon: "🎬", color: "text-red-500" },
    { id: "audio", name: "Audio", icon: "🎵", color: "text-yellow-500" },
    { id: "content", name: "Content", icon: "📹", color: "text-green-500" }
  ]

  const guildLevels = [
    { level: 1, name: "Novice Guild", color: "text-gray-500", icon: Shield },
    { level: 5, name: "Skilled Guild", color: "text-green-500", icon: Star },
    { level: 10, name: "Expert Guild", color: "text-blue-500", icon: Trophy },
    { level: 15, name: "Master Guild", color: "text-purple-500", icon: Crown },
    { level: 20, name: "Legendary Guild", color: "text-orange-500", icon: Gem }
  ]

  useEffect(() => {
    if (isAuthenticated) {
      fetchGuilds()
      if (activeTab === "my-guild") {
        fetchMyGuild()
      }
    }
  }, [isAuthenticated, activeTab])

  const fetchGuilds = async () => {
    try {
      setLoading(true)
      // Mock guilds for demo since backend doesn't have guild endpoints yet
      setGuilds([
        {
          id: "guild1",
          name: "Elite Builders",
          description: "Professional Minecraft builders creating epic structures and worlds. We specialize in medieval castles, modern cities, and fantasy realms.",
          logo_url: "",
          leader_id: "leader1",
          leader_name: "MasterBuilder",
          specializations: ["gaming", "design"],
          member_count: 8,
          max_members: 12,
          level: 7,
          xp: 3450,
          reputation: 4.9,
          total_earnings: 12500,
          completed_projects: 47,
          is_recruiting: true,
          requirements: { min_level: 5, min_rating: 4.0 },
          created_at: new Date().toISOString()
        },
        {
          id: "guild2",
          name: "Digital Artisans",
          description: "Creative collective of digital artists, 3D modelers, and animators. We bring imagination to life through cutting-edge visual experiences.",
          logo_url: "",
          leader_id: "leader2", 
          leader_name: "ArtMaster",
          specializations: ["design", "animation"],
          member_count: 15,
          max_members: 20,
          level: 12,
          xp: 8200,
          reputation: 4.8,
          total_earnings: 28750,
          completed_projects: 89,
          is_recruiting: true,
          requirements: { min_level: 8, min_rating: 4.5 },
          created_at: new Date().toISOString()
        },
        {
          id: "guild3",
          name: "Code Warriors",
          description: "Elite development team creating innovative games, apps, and web solutions. We tackle the most challenging technical projects.",
          logo_url: "",
          leader_id: "leader3",
          leader_name: "CodeNinja",
          specializations: ["development", "gaming"],
          member_count: 6,
          max_members: 8,
          level: 15,
          xp: 12800,
          reputation: 5.0,
          total_earnings: 45200,
          completed_projects: 124,
          is_recruiting: false,
          requirements: { min_level: 12, min_rating: 4.8 },
          created_at: new Date().toISOString()
        }
      ])
    } catch (error) {
      console.error('Error fetching guilds:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMyGuild = async () => {
    try {
      // Check if user is in a guild
      setMyGuild(null)
    } catch (error) {
      console.error('Error fetching my guild:', error)
    }
  }

  const createGuild = async () => {
    try {
      setLoading(true)
      // API call would go here
      alert("Guild created successfully! Start recruiting members to grow your empire.")
      setNewGuild({
        name: "",
        description: "",
        specializations: [],
        max_members: 10,
        requirements: {}
      })
    } catch (error) {
      alert("Failed to create guild")
    } finally {
      setLoading(false)
    }
  }

  const joinGuild = async (guildId) => {
    try {
      setLoading(true)
      // API call would go here
      alert("Application sent! The guild leader will review your request.")
    } catch (error) {
      alert("Failed to apply to guild")
    } finally {
      setLoading(false)
    }
  }

  const getGuildLevelInfo = (level) => {
    for (let i = guildLevels.length - 1; i >= 0; i--) {
      if (level >= guildLevels[i].level) {
        return guildLevels[i]
      }
    }
    return guildLevels[0]
  }

  const filteredGuilds = guilds.filter(guild =>
    guild.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    guild.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const GuildCard = ({ guild }) => {
    const levelInfo = getGuildLevelInfo(guild.level)
    const LevelIcon = levelInfo.icon

    return (
      <Card className="gaming-card hover:shadow-lg transition-all duration-300 cursor-pointer"
            onClick={() => setSelectedGuild(guild)}>
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-gaming rounded-lg flex items-center justify-center">
                <LevelIcon className={`h-6 w-6 ${levelInfo.color}`} />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{guild.name}</h3>
                <div className="flex items-center space-x-2">
                  <Badge className={`${levelInfo.color.replace('text-', 'bg-').replace('500', '500/20')}`}>
                    Level {guild.level} • {levelInfo.name}
                  </Badge>
                  {guild.is_recruiting && <Badge className="bg-green-500">Recruiting</Badge>}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                <span className="font-semibold">{guild.reputation}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                {guild.member_count}/{guild.max_members} members
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
            {guild.description}
          </p>

          {/* Specializations */}
          <div className="flex flex-wrap gap-2 mb-4">
            {guild.specializations.map((spec) => {
              const specInfo = specializations.find(s => s.id === spec)
              return (
                <Badge key={spec} variant="outline" className="text-xs">
                  {specInfo?.icon} {specInfo?.name}
                </Badge>
              )
            })}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-4 text-center">
            <div>
              <div className="text-lg font-bold text-primary">{guild.completed_projects}</div>
              <div className="text-xs text-muted-foreground">Projects</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-500">
                ${(guild.total_earnings * 0.10).toFixed(0)}
              </div>
              <div className="text-xs text-muted-foreground">Earned</div>
            </div>
            <div>
              <div className="text-lg font-bold text-purple-500">{guild.xp}</div>
              <div className="text-xs text-muted-foreground">Guild XP</div>
            </div>
          </div>

          {/* Action */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Led by <span className="font-medium">{guild.leader_name}</span>
            </div>
            <Button size="sm" className="gaming-card">
              View Guild
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const GuildDetailsModal = ({ guild, onClose }) => {
    if (!guild) return null

    const levelInfo = getGuildLevelInfo(guild.level)
    const LevelIcon = levelInfo.icon

    return (
      <Dialog open={!!guild} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-gaming rounded-lg flex items-center justify-center">
                <LevelIcon className={`h-6 w-6 ${levelInfo.color}`} />
              </div>
              <div>
                <span>{guild.name}</span>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge className={`${levelInfo.color.replace('text-', 'bg-').replace('500', '500/20')}`}>
                    Level {guild.level} • {levelInfo.name}
                  </Badge>
                  {guild.is_recruiting && <Badge className="bg-green-500">Recruiting</Badge>}
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Guild Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* About */}
              <div>
                <h3 className="font-semibold mb-3">About This Guild</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{guild.description}</p>
              </div>

              {/* Specializations */}
              <div>
                <h3 className="font-semibold mb-3">Specializations</h3>
                <div className="flex flex-wrap gap-3">
                  {guild.specializations.map((spec) => {
                    const specInfo = specializations.find(s => s.id === spec)
                    return (
                      <div key={spec} className="flex items-center space-x-2 p-3 border rounded-lg">
                        <span className="text-2xl">{specInfo?.icon}</span>
                        <span className="font-medium">{specInfo?.name}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Recent Projects */}
              <div>
                <h3 className="font-semibold mb-3">Recent Projects</h3>
                <div className="space-y-3">
                  {[
                    { name: "Epic Medieval Castle", client: "GameStudio", earnings: 1250, status: "completed" },
                    { name: "3D Character Pack", client: "IndieDevs", earnings: 980, status: "in_progress" },
                    { name: "Tutorial Series", client: "EduChannel", earnings: 750, status: "completed" }
                  ].map((project, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{project.name}</h4>
                        <p className="text-sm text-muted-foreground">for {project.client}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-green-600">
                          {project.earnings} credits
                        </div>
                        <Badge className={project.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'}>
                          {project.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Stats */}
              <Card className="gaming-card">
                <CardHeader>
                  <CardTitle className="text-lg">Guild Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Members</span>
                    <span className="font-semibold">{guild.member_count}/{guild.max_members}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Reputation</span>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="font-semibold">{guild.reputation}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Projects Completed</span>
                    <span className="font-semibold">{guild.completed_projects}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Earnings</span>
                    <span className="font-semibold text-green-600">
                      ${(guild.total_earnings * 0.10).toFixed(0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Success Rate</span>
                    <span className="font-semibold text-blue-600">98%</span>
                  </div>
                </CardContent>
              </Card>

              {/* Requirements */}
              <Card className="gaming-card">
                <CardHeader>
                  <CardTitle className="text-lg">Join Requirements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Minimum Level</span>
                    <Badge variant="outline">{guild.requirements.min_level || 1}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Minimum Rating</span>
                    <Badge variant="outline">{guild.requirements.min_rating || 0}⭐</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Application Review</span>
                    <Badge variant="outline">Required</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="space-y-3">
                {guild.is_recruiting ? (
                  <Button 
                    onClick={() => joinGuild(guild.id)}
                    className="w-full gaming-card"
                    size="lg"
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Apply to Join
                  </Button>
                ) : (
                  <Button disabled className="w-full" size="lg">
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Not Recruiting
                  </Button>
                )}
                
                <Button variant="outline" className="w-full">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Contact Guild
                </Button>
              </div>

              {/* Guild Benefits */}
              <Card className="gaming-card bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    <span>Guild Benefits</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Coins className="h-4 w-4 text-primary" />
                      <span>Shared credit pool</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span>Higher project rates</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-blue-500" />
                      <span>Collaborative projects</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Zap className="h-4 w-4 text-purple-500" />
                      <span>Priority support</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Award className="h-4 w-4 text-orange-500" />
                      <span>Exclusive achievements</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="container py-20">
        <div className="text-center max-w-md mx-auto">
          <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Creator Guilds</h1>
          <p className="text-muted-foreground mb-6">
            Please log in to explore and join creator guilds.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center animate-gaming-pulse">
            <Shield className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          🛡️ Creator 
          <span className="gradient-gaming bg-clip-text text-transparent"> Guilds</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Join forces with other creators. Build together. Earn together. Level up together.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Active Guilds", value: "47", icon: Shield, color: "text-purple-500" },
          { label: "Guild Members", value: "892", icon: Users, color: "text-blue-500" },
          { label: "Collaborative Projects", value: "234", icon: Briefcase, color: "text-green-500" },
          { label: "Your Credits", value: getTokenBalance(), icon: Coins, color: "text-primary" }
        ].map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="gaming-card">
              <CardContent className="p-4 text-center">
                <Icon className={`h-6 w-6 ${stat.color} mx-auto mb-2`} />
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="browse">Browse Guilds</TabsTrigger>
          <TabsTrigger value="create">Create Guild</TabsTrigger>
          <TabsTrigger value="my-guild">My Guild</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-6">
          {/* Search */}
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search guilds..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>

          {/* Guilds Grid */}
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-muted rounded-lg" />
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded w-full" />
                      <div className="h-3 bg-muted rounded w-2/3" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGuilds.map((guild) => (
                <GuildCard key={guild.id} guild={guild} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="create" className="space-y-6">
          <Card className="gaming-card max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>Create New Guild</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="guild-name">Guild Name</Label>
                <Input
                  id="guild-name"
                  placeholder="e.g. Elite Builders"
                  value={newGuild.name}
                  onChange={(e) => setNewGuild({...newGuild, name: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="guild-description">Description</Label>
                <Textarea
                  id="guild-description"
                  placeholder="Describe your guild's mission and culture..."
                  value={newGuild.description}
                  onChange={(e) => setNewGuild({...newGuild, description: e.target.value})}
                  rows={6}
                />
              </div>
              
              <div>
                <Label>Specializations</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                  {specializations.map((spec) => (
                    <div
                      key={spec.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        newGuild.specializations.includes(spec.id)
                          ? 'border-primary bg-primary/10'
                          : 'hover:bg-accent'
                      }`}
                      onClick={() => {
                        const updated = newGuild.specializations.includes(spec.id)
                          ? newGuild.specializations.filter(s => s !== spec.id)
                          : [...newGuild.specializations, spec.id]
                        setNewGuild({...newGuild, specializations: updated})
                      }}
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-1">{spec.icon}</div>
                        <div className="text-sm font-medium">{spec.name}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <Label htmlFor="max-members">Maximum Members</Label>
                <Input
                  id="max-members"
                  type="number"
                  min="3"
                  max="50"
                  value={newGuild.max_members}
                  onChange={(e) => setNewGuild({...newGuild, max_members: parseInt(e.target.value)})}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Larger guilds can take on bigger projects but require more coordination
                </p>
              </div>
              
              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center space-x-2">
                  <Trophy className="h-4 w-4 text-blue-500" />
                  <span>Guild Creation Fee</span>
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Creating a guild costs 100 credits to ensure commitment and quality.
                </p>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Cost: 100 credits</span>
                  <span className="text-sm text-muted-foreground">
                    Your balance: {getTokenBalance()} credits
                  </span>
                </div>
              </div>
              
              <Button 
                onClick={createGuild}
                disabled={loading || !newGuild.name || !newGuild.description || getTokenBalance() < 100}
                className="w-full gaming-card"
                size="lg"
              >
                {loading ? "Creating..." : "Create Guild (100 credits)"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my-guild" className="space-y-6">
          {myGuild ? (
            <div>Guild management interface would go here</div>
          ) : (
            <div className="text-center py-12">
              <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">You're Not in a Guild Yet</h3>
              <p className="text-muted-foreground mb-6">
                Join a guild to collaborate with other creators and take on bigger projects together.
              </p>
              <div className="space-x-4">
                <Button onClick={() => setActiveTab("browse")} className="gaming-card">
                  <Search className="mr-2 h-4 w-4" />
                  Browse Guilds
                </Button>
                <Button onClick={() => setActiveTab("create")} variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Guild
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Guild Details Modal */}
      <GuildDetailsModal 
        guild={selectedGuild} 
        onClose={() => setSelectedGuild(null)} 
      />
    </div>
  )
}