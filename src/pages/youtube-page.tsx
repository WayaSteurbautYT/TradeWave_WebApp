import { useState } from "react"
import { MockStore } from "@/data/mockStore"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { showToast } from "@/components/ui/toaster"
import { soundFX } from "@/lib/soundEffects"
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
  Tv,
  ArrowRight,
  ShieldCheck,
  Globe,
  Radio,
  BookOpen
} from "lucide-react"

export function YouTubePage() {
  const [channelData, setChannelData] = useState(() => MockStore.getYouTubeChannel())
  const [socials, setSocials] = useState(() => MockStore.getSocialConnections())
  const [inputHandle, setInputHandle] = useState(channelData.handle || "@WayaSteurbaut")
  const [isSyncing, setIsSyncing] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<{ id: string; videoId: string; title: string; description: string; duration: string; thumbnailUrl: string } | null>(null)
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)

  const handleFetchChannel = () => {
    if (!inputHandle.trim()) return
    setIsSyncing(true)
    setTimeout(() => {
      const updated = MockStore.syncYouTubeChannel(inputHandle.trim())
      setChannelData(updated)
      setIsSyncing(false)
      soundFX.playFanfare()
      showToast({
        title: "YouTube Channel Synced!",
        description: `Successfully fetched channel data for ${updated.title}.`,
        variant: "success"
      })
    }, 700)
  }

  const handleImportVideo = (videoId: string, title: string) => {
    const course = MockStore.importYouTubeVideoToCourse(videoId)
    if (course) {
      setChannelData(MockStore.getYouTubeChannel())
      soundFX.playCoin()
      showToast({
        title: "Video Imported to Academy!",
        description: `"${title}" is now available in your WayaCreate Courses & Tutorials.`,
        variant: "success"
      })
    }
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

  return (
    <div className="container py-8 md:py-12 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2.5 mb-2">
            <div className="p-2.5 bg-red-600 rounded-xl text-white shadow-md shadow-red-600/20">
              <Youtube className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">
                YouTube &amp; Social Channels Hub
              </h1>
              <p className="text-sm text-muted-foreground">
                Fetch your YouTube channel data, sync video tutorials, and connect Discord, Google &amp; GitHub accounts.
              </p>
            </div>
          </div>
        </div>

        {/* Sync Controls */}
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <Input
            value={inputHandle}
            onChange={(e) => setInputHandle(e.target.value)}
            placeholder="@yourchannel"
            className="text-xs h-9 font-medium max-w-xs"
          />
          <Button
            size="sm"
            onClick={handleFetchChannel}
            disabled={isSyncing}
            className="bg-red-600 hover:bg-red-700 text-white font-bold h-9 shrink-0"
          >
            <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${isSyncing ? "animate-spin" : ""}`} />
            {isSyncing ? "Fetching..." : "Fetch Channel"}
          </Button>
        </div>
      </div>

      {/* Channel Showcase Banner */}
      <Card className="border-border bg-card overflow-hidden">
        <div className="h-36 md:h-52 relative overflow-hidden bg-muted">
          <img
            src={channelData.bannerUrl}
            alt="Channel Banner"
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent" />
        </div>

        <CardContent className="p-6 md:p-8 pt-0 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between -mt-14 sm:-mt-16 gap-4 mb-4">
            <div className="flex items-end space-x-4">
              <img
                src={channelData.avatarUrl}
                alt="Channel Avatar"
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-background object-cover shadow-xl"
              />
              <div className="space-y-1 pb-1">
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl sm:text-2xl font-black">{channelData.title}</h2>
                  <Badge className="bg-red-600 text-white text-[10px] gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Verified Creator
                  </Badge>
                </div>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground font-mono">
                  <span>{channelData.handle}</span>
                  <span>•</span>
                  <span className="text-emerald-500 font-semibold">Active Sync</span>
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
                Uploaded Tutorials
              </span>
              <div className="text-xl sm:text-2xl font-black">
                {channelData.videoCount}
              </div>
            </div>

            <div className="space-y-0.5">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-purple-500" />
                Free Course Sync
              </span>
              <div className="text-xl sm:text-2xl font-black text-primary">
                Instant 1-Click
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Videos Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Video className="h-5 w-5 text-red-500" />
              Latest YouTube Videos &amp; Masterclasses
            </h3>
            <p className="text-xs text-muted-foreground">
              Watch embedded video breakdowns or import them directly into WayaCreate Academy as companion tutorials.
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {channelData.videos.map((vid: { id: string; videoId: string; title: string; description: string; views: number; duration: string; publishedAt: string; thumbnailUrl: string; tags: string[]; importedAsTutorial: boolean }) => (
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
                    {vid.tags.slice(0, 3).map((tag, i) => (
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

      {/* Connected Social Accounts Manager */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Share2 className="h-5 w-5 text-primary" />
            Connected Social Media Accounts
          </h3>
          <p className="text-xs text-muted-foreground">
            Link Discord, Google, GitHub, and YouTube to unlock cross-platform badges, community perks, and escrow storage.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {socials.map((soc: { platform: string; name: string; username: string; connected: boolean; stats: string; verified: boolean }) => (
            <Card key={soc.platform} className="border-border bg-card p-5 space-y-3">
              <div className="flex items-center justify-between">
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

              <Button
                size="sm"
                variant={soc.connected ? "outline" : "default"}
                onClick={() => handleToggleSocial(soc.platform)}
                className="w-full text-xs h-7"
              >
                {soc.connected ? "Disconnect" : "Connect Account"}
              </Button>
            </Card>
          ))}
        </div>
      </div>

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
            {/* Embedded Player or Demo iframe */}
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
