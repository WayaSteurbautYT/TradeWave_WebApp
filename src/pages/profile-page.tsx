import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useTokens } from "@/contexts/TokenContext"
import { MockStore } from "@/data/mockStore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { showToast } from "@/components/ui/toaster"
import { soundFX } from "@/lib/soundEffects"
import { 
  User, 
  MapPin, 
  Globe, 
  Youtube, 
  Twitter, 
  Github, 
  Star, 
  Coins, 
  Edit, 
  CheckCircle2, 
  Award,
  Gamepad2,
  DollarSign,
  ArrowUpRight,
  ShieldCheck,
  Sparkles,
  Cloud,
  X,
  Plus,
  Radio,
  ExternalLink,
  MessageSquare,
  BrainCircuit,
  Trophy
} from "lucide-react"
import { Link } from "react-router-dom"

export function ProfilePage() {
  const { user, updateProfile, upgradeToCreator, firebaseUser } = useAuth()
  const { getTokenBalance } = useTokens()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false)

  // Edit form state
  const [displayName, setDisplayName] = useState(user?.display_name || "Waya Steurbaut")
  const [bio, setBio] = useState(user?.bio || "")
  const [location, setLocation] = useState(user?.location || "")
  const [website, setWebsite] = useState(user?.website || "")
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || "")
  const [coverUrl, setCoverUrl] = useState(user?.cover_image_url || "")
  const [youtubeUrl, setYoutubeUrl] = useState(user?.youtube_channel_url || "https://www.youtube.com/@wayacreate")
  const [discordTag, setDiscordTag] = useState(user?.discord_tag || "waya_creative#0001")
  const [githubHandle, setGithubHandle] = useState(user?.github_handle || "waya-creations")
  const [skills, setSkills] = useState<string[]>(user?.skills || ["Blender 3D", "Unreal Engine 5", "PBR Shaders", "GameDev"])
  const [newSkill, setNewSkill] = useState("")

  // Payout form state
  const [payoutAmount, setPayoutAmount] = useState(100)
  const [payoutEmail, setPayoutEmail] = useState(user?.email || "steurbautwaya703@gmail.com")

  const handleOpenEdit = () => {
    setDisplayName(user?.display_name || "")
    setBio(user?.bio || "")
    setLocation(user?.location || "")
    setWebsite(user?.website || "")
    setAvatarUrl(user?.avatar_url || "")
    setCoverUrl(user?.cover_image_url || "")
    setYoutubeUrl(user?.youtube_channel_url || "https://www.youtube.com/@wayacreate")
    setDiscordTag(user?.discord_tag || "waya_creative#0001")
    setGithubHandle(user?.github_handle || "waya-creations")
    setSkills(user?.skills || ["Blender 3D", "Unreal Engine 5", "PBR Shaders"])
    setIsEditModalOpen(true)
  }

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()])
      setNewSkill("")
    }
  }

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove))
  }

  const handleSaveProfile = async () => {
    await updateProfile({
      display_name: displayName.trim(),
      bio: bio.trim(),
      location: location.trim(),
      website: website.trim(),
      avatar_url: avatarUrl.trim() || user?.avatar_url,
      cover_image_url: coverUrl.trim() || user?.cover_image_url,
      youtube_channel_url: youtubeUrl.trim(),
      discord_tag: discordTag.trim(),
      github_handle: githubHandle.trim(),
      skills
    })
    setIsEditModalOpen(false)
  }

  const handleRequestPayout = () => {
    if ((user?.earned_balance || 0) < payoutAmount) {
      showToast({
        title: "Insufficient Earned Balance",
        description: `You have ${user?.earned_balance || 0} earned credits. Minimum payout is 100 cr.`,
        variant: "destructive"
      })
      return
    }

    const usdVal = (payoutAmount * 0.05).toFixed(2)
    MockStore.requestWithdrawal(payoutAmount, parseFloat(usdVal), "Stripe Express Connect", payoutEmail)
    soundFX.playCoin()
    showToast({
      title: "Stripe Payout Initiated! 💳",
      description: `Transferred $${usdVal} USD to Stripe Connect Account (${payoutEmail}).`,
      variant: "success"
    })
    setIsPayoutModalOpen(false)
  }

  const isCreator = user?.role === "creator" || user?.can_earn

  return (
    <div className="container py-8 md:py-12 max-w-5xl space-y-8">
      {/* Profile Header Banner */}
      <div className="relative rounded-2xl overflow-hidden border bg-card shadow-sm">
        <div className="h-44 md:h-64 bg-gradient-gaming relative">
          <img
            src={user?.cover_image_url || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80"}
            alt="Cover"
            className="w-full h-full object-cover opacity-70"
          />
          <div className="absolute top-4 right-4 flex items-center space-x-2">
            <Badge variant="outline" className="bg-black/60 backdrop-blur text-emerald-400 border-emerald-500/30 text-xs py-1 px-3">
              <Cloud className="w-3.5 h-3.5 mr-1.5" />
              Firebase Firestore Active
            </Badge>
          </div>
        </div>

        <div className="p-6 md:p-8 pt-0 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between -mt-16 sm:-mt-20 gap-4 mb-4">
            <Avatar className="h-28 w-28 sm:h-32 sm:w-32 border-4 border-background shadow-xl">
              <AvatarImage src={user?.avatar_url} />
              <AvatarFallback className="bg-gradient-gaming text-white text-3xl font-black">
                {user?.display_name?.charAt(0) || "W"}
              </AvatarFallback>
            </Avatar>

            <div className="flex flex-wrap items-center gap-2">
              {!isCreator ? (
                <Button size="sm" onClick={upgradeToCreator} className="bg-gradient-to-r from-amber-500 to-emerald-600 text-white font-bold shadow-md">
                  <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                  Upgrade to Paid Creator ($0/Free trial)
                </Button>
              ) : (
                <Button size="sm" variant="outline" onClick={() => setIsPayoutModalOpen(true)} className="border-emerald-500/40 text-emerald-500 hover:bg-emerald-500/10 font-semibold">
                  <DollarSign className="mr-1 h-3.5 w-3.5" />
                  Stripe Payout ({user?.earned_balance || 0} cr)
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={handleOpenEdit}>
                <Edit className="mr-1.5 h-3.5 w-3.5" />
                Edit Profile
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-extrabold">{user?.display_name}</h1>
              {user?.is_verified && (
                <Badge className="bg-blue-500 text-white text-xs">✓ Verified Creator</Badge>
              )}
              <Badge variant={isCreator ? "default" : "secondary"} className="text-xs capitalize">
                {user?.role} • Level {user?.level?.level || 1}
              </Badge>
              {isCreator ? (
                <Badge className="bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 text-xs">
                  ★ Monitored Earning Rights Active
                </Badge>
              ) : (
                <Badge variant="outline" className="text-amber-500 border-amber-500/30 text-xs">
                  Free Explorer (Spend-only credits)
                </Badge>
              )}
            </div>

            <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
              {user?.bio || "Game environment artist, 3D modeling specialist, and digital rights creator. Building open tutorials and assets."}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
              {user?.location && (
                <div className="flex items-center space-x-1">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{user.location}</span>
                </div>
              )}
              {user?.website && (
                <a href={user.website} target="_blank" rel="noreferrer" className="flex items-center space-x-1 hover:text-primary transition-colors">
                  <Globe className="h-3.5 w-3.5" />
                  <span>{user.website}</span>
                </a>
              )}
              <div className="flex items-center space-x-1 text-yellow-500 font-semibold">
                <Star className="h-3.5 w-3.5 fill-current" />
                <span>{user?.rating || 4.9} ({user?.review_count || 12} reviews)</span>
              </div>
              <div className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-bold text-xs">
                <BrainCircuit className="h-3.5 w-3.5" />
                <span>AI Rating: {user?.ai_rating || 96}/100</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Economy & Creator Rules Banner */}
      <Card className="border-border bg-card/60 backdrop-blur p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Coins className="h-5 w-5 text-amber-500" />
              <h3 className="font-extrabold text-base">Automatic Token &amp; Rights Economy</h3>
            </div>
            <p className="text-xs text-muted-foreground max-w-xl">
              <strong>Rules:</strong> Making content and watching is free. Free users get credits from the faucet and starter pass to watch, tip, and trade rights, but <em>only verified creators can earn withdrawable revenue</em> from paid supporters and secondary rights sales.
            </p>
          </div>

          <div className="flex items-center space-x-4 bg-muted/40 p-3 rounded-xl border border-border">
            <div className="text-center px-3 border-r border-border">
              <div className="text-xs text-muted-foreground font-medium">Spendable Credits</div>
              <div className="text-lg font-black text-primary">{getTokenBalance()} cr</div>
            </div>
            <div className="text-center px-3">
              <div className="text-xs text-muted-foreground font-medium">Withdrawable Earnings</div>
              <div className={`text-lg font-black ${isCreator ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                {isCreator ? `${user?.earned_balance || 0} cr` : 'Locked (Creators only)'}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Content Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Left Column: Socials & Connected Accounts */}
        <div className="space-y-6">
          <Card className="border-border bg-card p-5 space-y-4">
            <h3 className="font-bold text-sm flex items-center justify-between">
              <span>Connected Socials</span>
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
            </h3>
            <div className="space-y-2 text-xs">
              <a
                href={user?.youtube_channel_url || "https://www.youtube.com/@wayacreate"}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500/15 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <Youtube className="h-4 w-4 text-red-500" />
                  <span className="font-bold text-red-400">YouTube Channel</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <span className="mr-1">@wayacreate</span>
                  <ExternalLink className="h-3 w-3" />
                </div>
              </a>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-4 w-4 text-indigo-400" />
                  <span className="font-bold text-indigo-300">Discord</span>
                </div>
                <span className="text-muted-foreground">{user?.discord_tag || "waya_creative#0001"}</span>
              </div>

              <a
                href={`https://github.com/${user?.github_handle || 'waya-creations'}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40 hover:bg-muted transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <Github className="h-4 w-4" />
                  <span className="font-semibold">GitHub</span>
                </div>
                <span className="text-muted-foreground">@{user?.github_handle || "waya-creations"}</span>
              </a>
            </div>
          </Card>

          {/* AI Verified Credentials & Badges */}
          <Card className="border-border bg-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Trophy className="h-4 w-4 text-amber-500" />
                <h3 className="font-bold text-sm">AI Verified Badges</h3>
              </div>
              <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px]">
                {user?.ai_badges?.length || 3} Endorsed
              </Badge>
            </div>

            <div className="space-y-2">
              {(user?.ai_badges?.length ? user.ai_badges : [
                {
                  id: 'b1',
                  name: 'Nanite Geometry Master',
                  icon: '💎',
                  tier: 'Diamond',
                  category: 'Unreal Engine 5',
                  score: 98
                },
                {
                  id: 'b2',
                  name: 'PBR Shading Perfectionist',
                  icon: '🎨',
                  tier: 'Platinum',
                  category: 'Material Science',
                  score: 95
                },
                {
                  id: 'b3',
                  name: 'Verified Commercial Rights Seller',
                  icon: '⚡',
                  tier: 'Diamond',
                  category: 'Economy & Legal',
                  score: 97
                }
              ]).map((badge: any) => (
                <div key={badge.id} className="p-2.5 rounded-xl border bg-muted/30 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2.5">
                    <span className="text-xl">{badge.icon}</span>
                    <div>
                      <div className="font-bold line-clamp-1">{badge.name}</div>
                      <div className="text-[10px] text-muted-foreground">{badge.category}</div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary">
                    {badge.score}/100
                  </Badge>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                Verified Skill Set:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {user?.skills?.map((s, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {s}
                  </Badge>
                ))}
              </div>
            </div>

            <Link to="/achievements" className="block pt-1">
              <Button size="sm" variant="outline" className="w-full text-xs h-8 border-primary/30 text-primary hover:bg-primary/10 font-bold">
                <BrainCircuit className="mr-1.5 h-3.5 w-3.5" />
                Level Up with AI Skill Coach →
              </Button>
            </Link>
          </Card>
        </div>

        {/* Right Column: Published Works & Digital Rights */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border-border bg-card p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <h3 className="font-bold text-base">Creator Portfolio &amp; Tradeable Content Rights</h3>
                <p className="text-xs text-muted-foreground">Assets with active commercial licensing and secondary resale rights</p>
              </div>
              <Badge variant="outline" className="text-xs text-primary border-primary/30">
                Verified Contracts
              </Badge>
            </div>

            <div className="space-y-3">
              <div className="p-4 border rounded-xl bg-card/60 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 text-primary rounded-lg">
                    <Gamepad2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Custom AAA Game Asset Modeling &amp; PBR Texturing</h4>
                    <p className="text-xs text-muted-foreground">Includes 45m video tutorial • License: Full Commercial</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-extrabold text-sm text-primary">250 cr</div>
                  <Badge variant="secondary" className="text-[10px] text-emerald-500">Resellable</Badge>
                </div>
              </div>

              <div className="p-4 border rounded-xl bg-card/60 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-500/10 text-purple-500 rounded-lg">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Stylized Cyberpunk Neon Alley Asset Pack</h4>
                    <p className="text-xs text-muted-foreground">50+ Modular Models &amp; Shaders • Resell rights granted</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-extrabold text-sm text-primary">150 cr</div>
                  <Badge variant="secondary" className="text-[10px] text-purple-400">Tradeable</Badge>
                </div>
              </div>

              <div className="p-4 border rounded-xl bg-card/60 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-500/10 text-red-500 rounded-lg">
                    <Youtube className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Blender to Unreal Engine 5 Environment Masterclass</h4>
                    <p className="text-xs text-muted-foreground">Official YouTube Video Course • Free for all watchers</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-extrabold text-sm text-emerald-500">Free</div>
                  <Badge variant="secondary" className="text-[10px]">YouTube Sync</Badge>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogHeader>
          <DialogTitle>Edit Profile Information</DialogTitle>
          <DialogDescription>
            Update your profile details. Changes are automatically saved to Firebase Firestore and synced across devices.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-4 max-h-[65vh] overflow-y-auto pr-1">
          <div className="space-y-1">
            <label className="text-xs font-semibold">Display Name:</label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Waya Steurbaut"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold">Avatar Image URL:</label>
              <Input
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold">Banner Cover URL:</label>
              <Input
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold">Location / Country:</label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Ghent, Belgium"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold">Website / Portfolio:</label>
              <Input
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://wayacreate.com"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold">YouTube Channel URL:</label>
            <Input
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/@wayacreate"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold">Discord Username / Tag:</label>
              <Input
                value={discordTag}
                onChange={(e) => setDiscordTag(e.target.value)}
                placeholder="waya_creative#0001"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold">GitHub Handle:</label>
              <Input
                value={githubHandle}
                onChange={(e) => setGithubHandle(e.target.value)}
                placeholder="waya-creations"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold">Biography:</label>
            <Textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Describe your work, art style, and skills..."
            />
          </div>

          {/* Skills Tag Editor */}
          <div className="space-y-2">
            <label className="text-xs font-semibold">Skills &amp; Tags:</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {skills.map((s) => (
                <Badge key={s} variant="secondary" className="text-xs flex items-center gap-1">
                  {s}
                  <button type="button" onClick={() => handleRemoveSkill(s)} className="hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                size={1}
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add skill (e.g. Geometry Nodes, Unreal Engine 5)..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleAddSkill()
                  }
                }}
              />
              <Button type="button" size="sm" variant="outline" onClick={handleAddSkill}>
                <Plus className="h-3.5 w-3.5 mr-1" /> Add
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(false)}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSaveProfile} className="bg-primary text-primary-foreground font-semibold">
            Save Profile to Firebase
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Stripe Express Payout Modal */}
      <Dialog open={isPayoutModalOpen} onOpenChange={setIsPayoutModalOpen}>
        <DialogHeader>
          <DialogTitle>Stripe Creator Payout</DialogTitle>
          <DialogDescription>
            Withdraw your earned credits directly into your connected bank account via Stripe Connect.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-4">
          <div className="p-3 bg-muted/40 rounded-xl border space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Available Earned Balance:</span>
              <span className="font-bold text-emerald-500">{user?.earned_balance || 0} cr</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Conversion Rate:</span>
              <span className="font-semibold">100 cr = $5.00 USD</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Platform Fee:</span>
              <span className="text-emerald-500 font-semibold">0% (All proceeds to creator)</span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold">Credits to Cash Out:</label>
            <Input
              type="number"
              min={100}
              max={user?.earned_balance || 100}
              step={50}
              value={payoutAmount}
              onChange={(e) => setPayoutAmount(Math.max(100, parseInt(e.target.value) || 100))}
            />
            <p className="text-[11px] text-muted-foreground">Estimated payout: ${(payoutAmount * 0.05).toFixed(2)} USD</p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold">Stripe Payout Email / Account:</label>
            <Input
              type="email"
              value={payoutEmail}
              onChange={(e) => setPayoutEmail(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => setIsPayoutModalOpen(false)}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleRequestPayout} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold">
            Confirm Stripe Payout (${(payoutAmount * 0.05).toFixed(2)})
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  )
}
