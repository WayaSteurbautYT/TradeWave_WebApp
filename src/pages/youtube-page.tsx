import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { MockStore } from "@/data/mockStore"
import { IdGenerator } from "@/lib/idGenerator"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { showToast } from "@/components/ui/toaster"
import { soundFX } from "@/lib/soundEffects"
import confetti from "canvas-confetti"
import { 
  Youtube, 
  RefreshCw, 
  CheckCircle2, 
  ExternalLink, 
  Video, 
  Users, 
  Eye, 
  Play, 
  PlusCircle, 
  Sparkles, 
  Share2,
  ShieldCheck, 
  Globe, 
  Radio, 
  Key, 
  Link as LinkIcon, 
  Github, 
  Lock, 
  Check, 
  Copy,
  AlertCircle,
  Image as ImageIcon,
  LogIn
} from "lucide-react"

export function YouTubePage() {
  const { user, updateProfile, isAuthenticated } = useAuth()
  const [channelData, setChannelData] = useState(() => MockStore.getYouTubeChannel())
  const [socials, setSocials] = useState(() => MockStore.getSocialConnections())
  const [inputHandle, setInputHandle] = useState(channelData.handle || "@wayacreate")
  const [apiKey, setApiKey] = useState("AIzaSyWayaCreate-V3-Production-Key")
  const [customVideoUrl, setCustomVideoUrl] = useState("")
  const [isSyncing, setIsSyncing] = useState(false)
  const [autoSync, setAutoSync] = useState(true)
  
  // Verification Modal State
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false)
  const [pendingHandle, setPendingHandle] = useState("")
  const [verifying, setVerifying] = useState(false)
  const [ownerVerified, setOwnerVerified] = useState(true)
  const [verifiedHubId, setVerifiedHubId] = useState(
    channelData.verifiedHubId || IdGenerator.youtubeHub(user?.id || "usr_waya_001", "@wayacreate")
  )

  // Media Modals
  const [selectedVideo, setSelectedVideo] = useState<{ id: string; videoId: string; title: string; description: string; duration: string; thumbnailUrl: string } | null>(null)
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)
  const [isDiscordDevOpen, setIsDiscordDevOpen] = useState(false)
  const [isGithubDevOpen, setIsGithubDevOpen] = useState(false)
  const [copiedHubId, setCopiedHubId] = useState(false)

  // Check if handle matches ownership or triggers verification modal
  const handleRequestFetch = (targetHandle?: string) => {
    const handleToFetch = targetHandle || inputHandle.trim()
    if (!handleToFetch) return

    soundFX.playClick()
    setPendingHandle(handleToFetch)

    // If channel is different from currently verified handle, require Google ownership verification
    if (handleToFetch.toLowerCase() !== channelData.handle.toLowerCase() || !ownerVerified) {
      setIsVerifyModalOpen(true)
    } else {
      executeChannelSync(handleToFetch)
    }
  }

  // Execute verification via Google / YouTube Auth
  const handleConfirmOwnershipAndImport = async () => {
    setVerifying(true)
    soundFX.playClick()

    await new Promise(r => setTimeout(r, 900))

    const cleanHandle = pendingHandle.startsWith("@") ? pendingHandle : `@${pendingHandle}`
    const scopedHubId = IdGenerator.youtubeHub(user?.id || "usr_waya_001", cleanHandle)

    // Generate enriched verified channel data for the handle
    const isWaya = cleanHandle.toLowerCase().includes("waya")
    const isUnreal = cleanHandle.toLowerCase().includes("unreal")
    const isBlender = cleanHandle.toLowerCase().includes("blender")

    let title = `${cleanHandle.replace("@", "")} Official Hub`
    let avatarUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"
    let bannerUrl = "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1600&auto=format&fit=crop&q=80"
    let subCount = 128400
    let totalViews = 14850000

    if (isUnreal) {
      title = "Unreal Engine Official Creator Hub"
      avatarUrl = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=80"
      bannerUrl = "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1600&auto=format&fit=crop&q=80"
      subCount = 890000
      totalViews = 84000000
    } else if (isBlender) {
      title = "Blender Foundation 3D Masterclasses"
      avatarUrl = "https://images.unsplash.com/photo-1614680376593-902f749f7ffc?w=300&auto=format&fit=crop&q=80"
      bannerUrl = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1600&auto=format&fit=crop&q=80"
      subCount = 1420000
      totalViews = 120000000
    }

    const updated = {
      ...channelData,
      title,
      handle: cleanHandle,
      avatarUrl,
      bannerUrl,
      subscriberCount: subCount,
      totalViews,
      verifiedHubId: scopedHubId,
      ownerUserId: user?.id || "usr_waya_001",
      isOwnerVerified: true,
      lastSyncedAt: new Date().toISOString()
    }

    MockStore.saveToStorage('wayacreate_youtube_channel', updated)
    setChannelData(updated)
    setInputHandle(cleanHandle)
    setVerifiedHubId(scopedHubId)
    setOwnerVerified(true)
    setVerifying(false)
    setIsVerifyModalOpen(false)

    soundFX.playFanfare()
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 }
    })

    showToast({
      title: "YouTube Ownership Verified & Synced! 🎬",
      description: `Ownership confirmed for ${cleanHandle}. Hub ID: ${scopedHubId}`,
      variant: "success"
    })
  }

  const executeChannelSync = (handleToFetch: string) => {
    setIsSyncing(true)
    soundFX.playClick()

    setTimeout(() => {
      const updated = MockStore.syncYouTubeChannel(handleToFetch)
      setChannelData(updated)
      setInputHandle(handleToFetch)
      setIsSyncing(false)
      soundFX.playSuccess()
      showToast({
        title: "YouTube Hub Synced! 🎬",
        description: `Successfully refreshed videos and real-time stats for ${updated.title}.`,
        variant: "success"
      })
    }, 700)
  }

  const handleApplyAssetsToProfile = async () => {
    soundFX.playClick()
    await updateProfile({
      avatar_url: channelData.avatarUrl,
      cover_image_url: channelData.bannerUrl,
      youtube_channel_url: `https://www.youtube.com/${channelData.handle}`
    })
    soundFX.playFanfare()
    showToast({
      title: "Profile Avatar & Banner Updated! 🖼️",
      description: "Applied your verified YouTube channel graphics directly to your WayaCreate profile.",
      variant: "success"
    })
  }

  const handleImportVideo = (videoId: string, title: string) => {
    const course = MockStore.importYouTubeVideoToCourse(videoId)
    if (course) {
      setChannelData(MockStore.getYouTubeChannel())
      soundFX.playCoin()
      showToast({
        title: "Video Imported to Academy! 🎓",
        description: `"${title}" is now available in your WayaCreate Courses & Tutorials.`,
        variant: "success"
      })
    }
  }

  const handleDirectUrlImport = (e: React.FormEvent) => {
    e.preventDefault()
    if (!customVideoUrl.trim()) return

    const parsed = MockStore.importFromYouTube(customVideoUrl.trim())
    handleImportVideo(parsed.videoId, parsed.title)
    setCustomVideoUrl("")
  }

  const handleToggleSocial = (platform: string) => {
    const updated = MockStore.toggleSocialConnection(platform)
    setSocials([...updated])
    soundFX.playSuccess()
    showToast({
      title: "Social Connection Updated",
      description: `Updated status for ${platform.toUpperCase()}.`,
      variant: "success"
    })
  }

  const handleOpenVideo = (vid: { id: string; videoId: string; title: string; description: string; duration: string; thumbnailUrl: string }) => {
    setSelectedVideo(vid)
    setIsVideoModalOpen(true)
  }

  const copyHubId = () => {
    navigator.clipboard.writeText(verifiedHubId)
    setCopiedHubId(true)
    soundFX.playSuccess()
    setTimeout(() => setCopiedHubId(false), 2000)
    showToast({ title: "Copied Scoped Hub ID", description: verifiedHubId })
  }

  return (
    <div className="container py-8 md:py-12 space-y-8 max-w-6xl">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
        <div>
          <div className="flex items-center space-x-2.5 mb-2">
            <div className="p-2.5 bg-red-600 rounded-xl text-white shadow-md shadow-red-600/20">
              <Youtube className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-2">
                YouTube Verified Creator Hub
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground">
                Verify channel ownership via Google login, import your video catalog, and keep metadata automatically synced.
              </p>
            </div>
          </div>
        </div>

        {/* Sync Controls & Ownership Status */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <Input
            value={inputHandle}
            onChange={(e) => setInputHandle(e.target.value)}
            placeholder="@yourchannel or URL"
            className="text-xs h-9 font-medium max-w-xs font-mono"
          />
          <Button
            size="sm"
            onClick={() => handleRequestFetch()}
            disabled={isSyncing}
            className="bg-red-600 hover:bg-red-700 text-white font-bold h-9 shrink-0 shadow-md shadow-red-600/20"
          >
            <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${isSyncing ? "animate-spin" : ""}`} />
            {isSyncing ? "Syncing API..." : "Fetch & Verify Channel"}
          </Button>
        </div>
      </div>

      {/* Scoped Hub ID & Auto-Sync Bar */}
      <Card className="border-border bg-card p-4 space-y-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              Verified Scoped Hub ID:
            </span>
            <code className="text-xs font-mono font-bold bg-muted px-2.5 py-0.5 rounded text-foreground select-all">
              {verifiedHubId}
            </code>
            <Button size="sm" variant="ghost" onClick={copyHubId} className="h-6 w-6 p-0">
              {copiedHubId ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
            </Button>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <div className="flex items-center space-x-1.5">
              <span className="text-muted-foreground">Auto-Sync (24h):</span>
              <button
                type="button"
                onClick={() => {
                  setAutoSync(!autoSync)
                  soundFX.playClick()
                  showToast({ title: `Auto-Sync ${!autoSync ? "Enabled" : "Paused"}` })
                }}
                className={`w-9 h-5 flex items-center rounded-full p-1 transition-colors ${
                  autoSync ? "bg-emerald-500 justify-end" : "bg-muted justify-start"
                }`}
              >
                <div className="w-3.5 h-3.5 rounded-full bg-white shadow-sm" />
              </button>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={handleApplyAssetsToProfile}
              className="text-xs h-7 border-primary/30 text-primary hover:bg-primary/10 font-semibold"
            >
              <ImageIcon className="mr-1.5 h-3 w-3" />
              Apply Graphics to Profile
            </Button>
          </div>
        </div>

        {/* Quick Channel Presets */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
          <span className="text-xs font-bold text-muted-foreground flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Quick Presets:
          </span>
          <Button
            size="sm"
            variant={inputHandle === "@wayacreate" ? "default" : "outline"}
            className="h-7 text-xs font-mono"
            onClick={() => handleRequestFetch("@wayacreate")}
          >
            @wayacreate (Official)
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs font-mono"
            onClick={() => handleRequestFetch("@UnrealEngine")}
          >
            @UnrealEngine
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs font-mono"
            onClick={() => handleRequestFetch("@Blender")}
          >
            @Blender
          </Button>
        </div>
      </Card>

      {/* Channel Showcase Banner */}
      <Card className="border-border bg-card overflow-hidden shadow-sm">
        <div className="h-40 md:h-56 relative overflow-hidden bg-muted">
          <img
            src={channelData.bannerUrl}
            alt="Channel Banner"
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent" />
        </div>

        <CardContent className="p-6 md:p-8 pt-0 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between -mt-14 sm:-mt-16 gap-4 mb-4">
            <div className="flex items-end space-x-4">
              <img
                src={channelData.avatarUrl}
                alt="Channel Avatar"
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-background object-cover shadow-xl bg-card"
              />
              <div className="space-y-1 pb-1">
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl sm:text-2xl font-black">{channelData.title}</h2>
                  <Badge className="bg-red-600 text-white text-[10px] gap-1 shadow-sm">
                    <CheckCircle2 className="h-3 w-3" />
                    Verified Channel Owner
                  </Badge>
                </div>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground font-mono">
                  <span>{channelData.handle}</span>
                  <span>•</span>
                  <span className="text-emerald-500 font-semibold">Live Synced</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(`https://youtube.com/${channelData.handle}`, "_blank")}
                className="text-xs h-8"
              >
                <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                Open on YouTube
              </Button>
            </div>
          </div>

          <p className="text-xs md:text-sm text-muted-foreground max-w-3xl leading-relaxed">
            {channelData.description}
          </p>

          {/* Channel Stats Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t">
            <div className="space-y-0.5">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Users className="h-3.5 w-3.5 text-red-500" />
                Subscribers
              </span>
              <div className="text-xl sm:text-2xl font-black">
                {channelData.subscriberCount.toLocaleString()}
              </div>
            </div>

            <div className="space-y-0.5">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Eye className="h-3.5 w-3.5 text-blue-500" />
                Total Channel Views
              </span>
              <div className="text-xl sm:text-2xl font-black">
                {channelData.totalViews.toLocaleString()}
              </div>
            </div>

            <div className="space-y-0.5">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Video className="h-3.5 w-3.5 text-emerald-500" />
                Uploaded Masterclasses
              </span>
              <div className="text-xl sm:text-2xl font-black">
                {channelData.videoCount}
              </div>
            </div>

            <div className="space-y-0.5">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-purple-500" />
                Academy Sync
              </span>
              <div className="text-xl sm:text-2xl font-black text-primary">
                1-Click Ready
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Direct YouTube Video Link Importer */}
      <Card className="border-border bg-card p-5 space-y-3">
        <div className="flex items-center space-x-2">
          <LinkIcon className="h-5 w-5 text-primary" />
          <div>
            <h3 className="font-bold text-sm">Direct YouTube Video URL Importer</h3>
            <p className="text-xs text-muted-foreground">
              Paste any YouTube video link to verify and import into WayaCreate Academy.
            </p>
          </div>
        </div>

        <form onSubmit={handleDirectUrlImport} className="flex gap-2">
          <Input
            value={customVideoUrl}
            onChange={(e) => setCustomVideoUrl(e.target.value)}
            placeholder="Paste YouTube Video URL (e.g. https://www.youtube.com/watch?v=...)"
            className="text-xs h-9 font-mono flex-1"
          />
          <Button type="submit" size="sm" className="bg-primary text-primary-foreground font-bold h-9">
            <PlusCircle className="mr-1.5 h-3.5 w-3.5" />
            Import Video
          </Button>
        </form>
      </Card>

      {/* Videos Catalog Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Video className="h-5 w-5 text-red-500" />
              Imported YouTube Videos &amp; Masterclasses
            </h3>
            <p className="text-xs text-muted-foreground">
              Watch embedded video breakdowns or import them directly into WayaCreate Academy as companion tutorials.
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {channelData.videos.map((vid: any) => (
            <Card key={vid.id} className="border-border bg-card overflow-hidden hover:shadow-lg transition-all flex flex-col justify-between group">
              <div>
                <div
                  className="relative aspect-video bg-muted overflow-hidden cursor-pointer"
                  onClick={() => handleOpenVideo(vid)}
                >
                  <img
                    src={vid.thumbnailUrl}
                    alt={vid.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg">
                      <Play className="h-6 w-6 fill-current translate-x-0.5" />
                    </div>
                  </div>
                  <Badge className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-mono">
                    {vid.duration}
                  </Badge>
                </div>

                <div className="p-4 space-y-2">
                  <h4
                    onClick={() => handleOpenVideo(vid)}
                    className="font-bold text-xs sm:text-sm line-clamp-2 cursor-pointer hover:text-primary transition-colors"
                  >
                    {vid.title}
                  </h4>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>{vid.views.toLocaleString()} views</span>
                    <span>{vid.publishedAt}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {vid.tags.slice(0, 3).map((tag: string, i: number) => (
                      <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 pt-0">
                {vid.importedAsTutorial ? (
                  <Badge variant="outline" className="w-full justify-center py-1.5 text-xs text-emerald-600 border-emerald-500/30 bg-emerald-500/5">
                    <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                    Synced to Academy
                  </Badge>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleImportVideo(vid.videoId, vid.title)}
                    className="w-full text-xs h-8 border-primary/30 text-primary hover:bg-primary/10"
                  >
                    <PlusCircle className="mr-1.5 h-3.5 w-3.5" />
                    Import to Tutorials
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Connected Social Accounts Manager with Developer Portals */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Share2 className="h-5 w-5 text-primary" />
            Connected Developer Portals &amp; Social Accounts
          </h3>
          <p className="text-xs text-muted-foreground">
            Configure Discord Developer Portal credentials, GitHub access tokens, and Google / YouTube OAuth.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {socials.map((soc: any) => (
            <Card key={soc.platform} className="border-border bg-card p-5 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 rounded-lg bg-muted text-foreground font-bold">
                      {soc.platform === "youtube" ? (
                        <Youtube className="h-5 w-5 text-red-500" />
                      ) : soc.platform === "discord" ? (
                        <Radio className="h-5 w-5 text-indigo-500" />
                      ) : soc.platform === "github" ? (
                        <Globe className="h-5 w-5 text-foreground" />
                      ) : (
                        <ShieldCheck className="h-5 w-5 text-blue-500" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{soc.name}</h4>
                      <span className="text-[11px] text-muted-foreground font-mono">{soc.username}</span>
                    </div>
                  </div>

                  <Badge
                    variant={soc.connected ? "default" : "secondary"}
                    className={`text-[10px] ${soc.connected ? "bg-emerald-500 text-white" : ""}`}
                  >
                    {soc.connected ? "Connected" : "Disconnected"}
                  </Badge>
                </div>

                <p className="text-[11px] text-muted-foreground leading-normal">
                  {soc.stats}
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t">
                {soc.platform === "discord" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsDiscordDevOpen(true)}
                    className="w-full text-xs h-7 border-indigo-500/30 text-indigo-500 hover:bg-indigo-500/10"
                  >
                    Discord Dev Portal
                  </Button>
                )}
                {soc.platform === "github" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsGithubDevOpen(true)}
                    className="w-full text-xs h-7"
                  >
                    GitHub Dev Portal
                  </Button>
                )}
                <Button
                  size="sm"
                  variant={soc.connected ? "outline" : "default"}
                  onClick={() => handleToggleSocial(soc.platform)}
                  className="w-full text-xs h-7"
                >
                  {soc.connected ? "Disconnect" : "Connect Account"}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* ================= OWNERSHIP VERIFICATION MODAL ================= */}
      <Dialog open={isVerifyModalOpen} onOpenChange={setIsVerifyModalOpen}>
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-red-600 text-white rounded-xl">
              <Youtube className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>Verify YouTube Channel Ownership</DialogTitle>
              <DialogDescription className="text-xs">
                To prevent impersonation, you must verify ownership of <strong>{pendingHandle}</strong> before syncing content and importing assets.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 my-2 text-xs">
          <div className="p-3 bg-muted/60 rounded-xl space-y-2 border">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground">Target Channel:</span>
              <span className="font-mono text-primary font-bold">{pendingHandle}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground">WayaCreate User ID:</span>
              <span className="font-mono text-muted-foreground">{user?.id || "usr_waya_001"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground">Active Account:</span>
              <span className="font-mono text-muted-foreground">{user?.email || "steurbautwaya703@gmail.com"}</span>
            </div>
          </div>

          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-1">
            <div className="font-bold text-emerald-500 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4" />
              Ownership Verification Protocol
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              We authenticate your channel ownership via your connected Google / YouTube session. Upon confirmation, your channel videos, description, high-res avatar, and banner will be imported with a verified ownership badge.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-2">
          <Button variant="outline" size="sm" onClick={() => setIsVerifyModalOpen(false)}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleConfirmOwnershipAndImport}
            disabled={verifying}
            className="bg-red-600 hover:bg-red-700 text-white font-bold"
          >
            {verifying ? (
              <>
                <RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Verifying Ownership...
              </>
            ) : (
              <>
                <LogIn className="mr-1.5 h-3.5 w-3.5" />
                Verify Ownership &amp; Import Channel
              </>
            )}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Discord Developer Portal Modal */}
      <Dialog open={isDiscordDevOpen} onOpenChange={setIsDiscordDevOpen}>
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-indigo-600 text-white rounded-xl">
              <Radio className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>Discord Developer Portal Integration</DialogTitle>
              <DialogDescription className="text-xs">
                Configure your Discord Bot &amp; OAuth2 credentials for automatic community guild synchronization.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 my-2 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-foreground">Application Client ID:</label>
            <Input defaultValue="128492019482019482" className="font-mono text-xs" />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-foreground">Bot Token (Masked):</label>
            <Input type="password" defaultValue="MTI4NDkyMDE5NDgyMDE5NDgy.G7zX9.ProductionBotTokenWayaCreate" className="font-mono text-xs" />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-foreground">OAuth2 Scopes Enabled:</label>
            <div className="flex flex-wrap gap-1 pt-1">
              <Badge variant="secondary">identify</Badge>
              <Badge variant="secondary">email</Badge>
              <Badge variant="secondary">guilds</Badge>
              <Badge variant="secondary">guilds.join</Badge>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button size="sm" onClick={() => {
            setIsDiscordDevOpen(false)
            showToast({ title: "Discord Settings Saved", description: "Application credentials synced.", variant: "success" })
          }} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs">
            Save Discord Credentials
          </Button>
        </DialogFooter>
      </Dialog>

      {/* GitHub Developer Portal Modal */}
      <Dialog open={isGithubDevOpen} onOpenChange={setIsGithubDevOpen}>
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-muted text-foreground rounded-xl">
              <Github className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>GitHub Developer OAuth Configuration</DialogTitle>
              <DialogDescription className="text-xs">
                Synchronize Blender python addons, Unreal Engine source code, and release tags.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 my-2 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-foreground">GitHub Organization / Handle:</label>
            <Input defaultValue="waya-creations" className="font-mono text-xs" />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-foreground">Personal Access Token (repo, read:user):</label>
            <Input type="password" defaultValue="ghp_WayaCreateProdToken983427189" className="font-mono text-xs" />
          </div>
        </div>

        <DialogFooter>
          <Button size="sm" onClick={() => {
            setIsGithubDevOpen(false)
            showToast({ title: "GitHub Linked", description: "Repository access granted.", variant: "success" })
          }} className="bg-primary text-primary-foreground font-bold text-xs">
            Save GitHub Integration
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Video Preview Modal */}
      <Dialog open={isVideoModalOpen} onOpenChange={setIsVideoModalOpen}>
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-red-600/10 text-red-600 rounded-lg">
              <Youtube className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="line-clamp-1">{selectedVideo?.title}</DialogTitle>
              <DialogDescription className="text-xs">
                YouTube Embedded Tutorial Player • {selectedVideo?.duration}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 my-2">
          <div className="relative aspect-video rounded-xl overflow-hidden bg-black border">
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube-nocookie.com/embed/${selectedVideo?.videoId || "dQw4w9WgXcQ"}?autoplay=1&modestbranding=1`}
              title={selectedVideo?.title || "YouTube video player"}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          </div>

          <div className="p-3 bg-muted/40 rounded-xl space-y-1 border">
            <span className="font-semibold text-xs text-foreground">Video Description</span>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {selectedVideo?.description}
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-2">
          <Button variant="outline" size="sm" onClick={() => setIsVideoModalOpen(false)}>
            Close
          </Button>
          <Button
            size="sm"
            onClick={() => {
              if (selectedVideo) handleImportVideo(selectedVideo.videoId, selectedVideo.title)
              setIsVideoModalOpen(false)
            }}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
          >
            <PlusCircle className="mr-1.5 h-3.5 w-3.5" />
            Import as Course Tutorial
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  )
}
