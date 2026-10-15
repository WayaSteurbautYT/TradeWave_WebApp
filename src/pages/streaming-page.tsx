import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useTokens } from "@/contexts/TokenContext"
import { MockStore } from "@/data/mockStore"
import { LiveStreamSession, SuperChatTip } from "@/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { showToast } from "@/components/ui/toaster"
import confetti from "canvas-confetti"
import { 
  Radio, 
  Users, 
  MessageSquare, 
  Play, 
  Heart, 
  Send, 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Key, 
  Copy, 
  Check, 
  Sparkles, 
  Coins, 
  Share2, 
  Settings, 
  RefreshCw,
  Terminal,
  Shield,
  Flame,
  CheckCircle2,
  Tv
} from "lucide-react"

export function StreamingPage() {
  const { user } = useAuth()
  const { getTokenBalance } = useTokens()
  
  const [session, setSession] = useState<LiveStreamSession>(() => MockStore.getLiveStream())
  const [activeTab, setActiveTab] = useState<"viewer" | "studio">("viewer")

  // Stream viewer state
  const [chatInput, setChatInput] = useState("")
  const [streamQuality, setStreamQuality] = useState("1080p60")
  const [copiedKey, setCopiedKey] = useState(false)
  const [copiedRtmp, setCopiedRtmp] = useState(false)
  const [showKey, setShowKey] = useState(false)

  // Super Chat Tip State
  const [isTipModalOpen, setIsTipModalOpen] = useState(false)
  const [tipAmount, setTipAmount] = useState(100)
  const [tipMessage, setTipMessage] = useState("Awesome stream, Waya! Keep the tutorials coming! 🚀")

  // Live Studio State
  const [cameraActive, setCameraActive] = useState(false)
  const [micActive, setMicActive] = useState(true)
  const [studioTitle, setStudioTitle] = useState(session.title)
  const [studioCategory, setStudioCategory] = useState(session.category)
  const [streamDuration, setStreamDuration] = useState("45:12")
  const videoRef = useRef<HTMLVideoElement>(null)

  // Simulated live chat feed
  const [chatMessages, setChatMessages] = useState<Array<{ id: string; user: string; text: string; time: string; isTip?: boolean; tipAmount?: number }>>([
    { id: "c1", user: "GamerPro99", text: "Are the Blender 4.2 trim sheets available in the marketplace?", time: "12:01" },
    { id: "c2", user: "AlexDev", text: "The normal map bake quality is insane! 🔥", time: "12:02" },
    { id: "c3", user: "Sarah Chen", text: "Super excited for the trim sheet section! Keep it up Waya!", time: "12:05", isTip: true, tipAmount: 100 },
    { id: "c4", user: "PixelCraft", text: "How did you set up the roughness channel packing?", time: "12:08" },
    { id: "c5", user: "Apex Studios", text: "Loving the clean topology walkthrough!", time: "12:12", isTip: true, tipAmount: 250 },
  ])

  // AI Stream Assistant State
  const [aiSummary, setAiSummary] = useState("")
  const [generatingAi, setGeneratingAi] = useState(false)

  // Camera toggle handler
  const handleToggleCamera = async () => {
    if (cameraActive) {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach(track => track.stop())
        videoRef.current.srcObject = null
      }
      setCameraActive(false)
    } else {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: micActive })
          if (videoRef.current) {
            videoRef.current.srcObject = stream
            videoRef.current.play()
          }
          setCameraActive(true)
          showToast({ title: "Camera Connected", description: "Studio preview feed is live.", variant: "success" })
        } else {
          setCameraActive(true)
          showToast({ title: "Simulated Video Feed", description: "Virtual test stream active.", variant: "success" })
        }
      } catch (err) {
        // Fallback to virtual feed if permission denied
        setCameraActive(true)
        showToast({ title: "Virtual Camera Active", description: "Using simulated HD camera canvas stream.", variant: "success" })
      }
    }
  }

  // Go live toggle
  const handleToggleGoLive = () => {
    const updated = MockStore.toggleGoLive(studioTitle, studioCategory)
    setSession({ ...updated })
    if (updated.is_live) {
      try {
        confetti({ particleCount: 60, spread: 50 })
      } catch (e) {}
      showToast({
        title: "🔴 YOU ARE LIVE!",
        description: `Broadcast started for "${updated.title}". Streaming to WayaCreate viewers.`,
        variant: "success"
      })
    } else {
      showToast({
        title: "Broadcast Ended",
        description: "Stream session closed. Recording queued for automatic tutorial archive.",
      })
    }
  }

  const handleRegenerateKey = () => {
    const newKey = MockStore.generateNewStreamKey()
    setSession(prev => ({ ...prev, stream_key: newKey }))
    showToast({
      title: "Stream Key Reset",
      description: "New stream key generated. Update your OBS Studio settings.",
      variant: "success"
    })
  }

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim()) return

    const newMsg = {
      id: `c_${Date.now()}`,
      user: user?.display_name || "You",
      text: chatInput,
      time: "Just now"
    }

    setChatMessages(prev => [...prev, newMsg])
    setChatInput("")

    // Simulated chatter reaction
    setTimeout(() => {
      setChatMessages(prev => [
        ...prev,
        {
          id: `c_${Date.now() + 1}`,
          user: "IndieGamer",
          text: "Agreed! That part of the shader workflow is so clean.",
          time: "Just now"
        }
      ])
    }, 2500)
  }

  const handleSendSuperChat = () => {
    const balance = getTokenBalance()
    if (balance < tipAmount) {
      showToast({
        title: "Insufficient Credits",
        description: `You have ${balance} credits, but super chat requires ${tipAmount} credits.`,
        variant: "destructive"
      })
      return
    }

    const success = MockStore.sendSuperChatTip(tipAmount, tipMessage)
    if (success) {
      try {
        confetti({ particleCount: 70, spread: 70, origin: { y: 0.7 } })
      } catch (e) {}

      setChatMessages(prev => [
        ...prev,
        {
          id: `tip_${Date.now()}`,
          user: user?.display_name || "Anonymous",
          text: tipMessage,
          time: "Just now",
          isTip: true,
          tipAmount: tipAmount
        }
      ])

      setSession(MockStore.getLiveStream())
      showToast({
        title: "Super Chat Delivered! 🎉",
        description: `Sent ${tipAmount} credits with your highlighted message.`,
        variant: "success"
      })
      setIsTipModalOpen(false)
    }
  }

  const handleGenerateAiSummary = async () => {
    setGeneratingAi(true)
    await new Promise(r => setTimeout(r, 600))
    setAiSummary(`### AI Live Stream Recap
- **Key Focus**: Constructing modular cyberpunk corridors in Blender & UE5 Lumen.
- **Top Answered Question**: Trim sheets achieve 70% memory reduction with zero performance hit.
- **Next Topic**: Dynamic forcefield ripple shaders and Niagara particle sparks.`)
    setGeneratingAi(false)
  }

  return (
    <div className="container py-8 md:py-12 space-y-6">
      {/* Top Banner & Mode Switcher */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-gradient-gaming rounded-xl text-white">
              <Radio className="h-5 w-5" />
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Live Streaming &amp; Studio API
            </h1>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
            Watch live interactive workshops or stream directly with your own WayaCreate RTMP/WebRTC API credentials.
          </p>
        </div>

        {/* Tab switch between Watching and Broadcasting */}
        <div className="flex items-center space-x-2 bg-muted p-1 rounded-xl">
          <Button
            size="sm"
            variant={activeTab === "viewer" ? "default" : "ghost"}
            className="text-xs h-8"
            onClick={() => setActiveTab("viewer")}
          >
            <Tv className="mr-1.5 h-3.5 w-3.5" />
            Live Viewer
          </Button>
          <Button
            size="sm"
            variant={activeTab === "studio" ? "default" : "ghost"}
            className="text-xs h-8"
            onClick={() => setActiveTab("studio")}
          >
            <Radio className="mr-1.5 h-3.5 w-3.5 text-red-500" />
            Creator Studio &amp; API
          </Button>
        </div>
      </div>

      {activeTab === "viewer" ? (
        /* ================= VIEWER MODE ================= */
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Video Area */}
          <div className="lg:col-span-2 space-y-4">
            <div className="aspect-video bg-black rounded-2xl overflow-hidden relative border shadow-2xl flex items-center justify-center">
              {/* Animated Live Feed Simulation */}
              <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900 to-primary/20 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center text-primary animate-pulse mb-3">
                  <Play className="h-8 w-8 ml-1 fill-current" />
                </div>
                <h3 className="text-lg md:text-xl font-extrabold text-white">{session.title}</h3>
                <p className="text-xs text-white/70 max-w-md mt-1">
                  Live with {session.creator_name} • Demonstrating Blender 4.2 trim sheets &amp; UE5 Lumen shaders
                </p>
              </div>

              {/* Badges on Video */}
              <div className="absolute top-3 left-3 flex items-center space-x-2">
                <Badge className="bg-red-600 text-white animate-pulse text-xs font-bold px-2 py-0.5">
                  ● LIVE
                </Badge>
                <Badge variant="secondary" className="bg-black/60 text-white backdrop-blur-sm border-0 text-xs">
                  <Users className="h-3 w-3 mr-1 inline" />
                  {session.viewers.toLocaleString()} Viewers
                </Badge>
              </div>

              <div className="absolute top-3 right-3">
                <Badge variant="secondary" className="bg-black/60 text-white backdrop-blur-sm border-0 text-[10px]">
                  {streamQuality}
                </Badge>
              </div>
            </div>

            {/* Creator info & Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-4 rounded-xl border">
              <div className="flex items-center space-x-3">
                <Avatar className="h-11 w-11 border-2 border-primary">
                  <AvatarImage src={session.creator_avatar} />
                  <AvatarFallback className="bg-gradient-gaming text-white">W</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-bold text-sm md:text-base flex items-center gap-1.5">
                    <span>{session.creator_name}</span>
                    <Badge className="bg-blue-500 text-white text-[9px] h-3.5 px-1">✓</Badge>
                  </h2>
                  <p className="text-xs text-muted-foreground">{session.category}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  className="bg-gradient-gaming text-white font-bold text-xs h-9 shadow-md"
                  onClick={() => setIsTipModalOpen(true)}
                >
                  <Coins className="mr-1.5 h-3.5 w-3.5" />
                  Super Chat Tip
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-9"
                  onClick={() => showToast({ title: "Shared!", description: "Stream link copied to clipboard." })}
                >
                  <Share2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* AI Live Co-Host & Summary */}
            <Card className="border-border bg-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-primary font-bold text-xs">
                  <Sparkles className="h-4 w-4" />
                  <span>AI Stream Co-Host &amp; Live Summary</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  onClick={handleGenerateAiSummary}
                  disabled={generatingAi}
                >
                  {generatingAi ? <RefreshCw className="h-3 w-3 animate-spin mr-1" /> : null}
                  {aiSummary ? "Update Summary" : "Generate Live Recap"}
                </Button>
              </div>

              {aiSummary ? (
                <div className="p-3 bg-muted/40 rounded-xl text-xs space-y-1.5 leading-relaxed">
                  <div className="font-bold text-foreground">Active Topics Covered:</div>
                  <p className="text-muted-foreground whitespace-pre-line">{aiSummary}</p>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  The AI Co-Host listens to the live discussion and generates real-time chapter markers and code takeaways.
                </p>
              )}
            </Card>
          </div>

          {/* Live Chat Sidebar */}
          <div className="border rounded-2xl bg-card flex flex-col h-[600px] overflow-hidden">
            <div className="p-3 border-b flex items-center justify-between bg-muted/40">
              <div className="flex items-center space-x-2 font-bold text-xs">
                <MessageSquare className="h-4 w-4 text-primary" />
                <span>Stream Live Chat</span>
              </div>
              <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                AI Filter Active
              </Badge>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-3 overflow-y-auto space-y-3 text-xs">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-2.5 rounded-xl transition-all ${
                    msg.isTip 
                      ? "bg-gradient-to-r from-amber-500/15 via-primary/15 to-purple-500/15 border border-amber-500/30 shadow-sm"
                      : "bg-muted/30"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-1.5">
                      <span className={`font-bold ${msg.isTip ? "text-amber-500 font-black" : "text-primary"}`}>
                        {msg.user}
                      </span>
                      {msg.isTip && (
                        <Badge className="bg-amber-500 text-white font-extrabold text-[10px] h-4 px-1.5">
                          ⭐ {msg.tipAmount} Credits Tip
                        </Badge>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground">{msg.time}</span>
                  </div>
                  <p className={`text-foreground/90 leading-relaxed ${msg.isTip ? "font-semibold" : ""}`}>
                    {msg.text}
                  </p>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendChat} className="p-3 border-t bg-card flex gap-1.5">
              <Input
                placeholder="Chat in live stream..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="h-9 text-xs"
              />
              <Button type="submit" size="sm" className="h-9 px-3 bg-primary text-primary-foreground">
                <Send className="h-3.5 w-3.5" />
              </Button>
            </form>
          </div>
        </div>
      ) : (
        /* ================= CREATOR STUDIO & STREAMING API MODE ================= */
        <div className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Live Camera / Screen Preview Area */}
            <div className="lg:col-span-2 space-y-4">
              <Card className="border-border bg-card p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-base font-bold">Studio Camera &amp; Mic Preview</CardTitle>
                    <CardDescription className="text-xs">
                      Connect your webcam or test with the browser streaming engine.
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className={`text-xs ${session.is_live ? "text-red-500 border-red-500/40" : ""}`}>
                    {session.is_live ? "🔴 BROADCASTING" : "OFFLINE"}
                  </Badge>
                </div>

                {/* Video Monitor */}
                <div className="aspect-video bg-black rounded-xl overflow-hidden relative flex items-center justify-center border shadow-inner">
                  {cameraActive ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-6 space-y-2">
                      <VideoOff className="h-10 w-10 text-muted-foreground mx-auto opacity-50" />
                      <p className="text-xs text-muted-foreground">Camera feed is currently paused.</p>
                      <Button size="sm" onClick={handleToggleCamera} className="text-xs bg-primary text-primary-foreground">
                        Enable Camera Preview
                      </Button>
                    </div>
                  )}

                  {cameraActive && (
                    <div className="absolute top-3 left-3 flex gap-2">
                      <Badge className="bg-emerald-600 text-white text-[10px]">
                        1080p60 • 6,200 kbps
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Studio Control Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant={cameraActive ? "default" : "outline"}
                      className="text-xs h-9"
                      onClick={handleToggleCamera}
                    >
                      {cameraActive ? <Video className="mr-1.5 h-3.5 w-3.5" /> : <VideoOff className="mr-1.5 h-3.5 w-3.5" />}
                      {cameraActive ? "Camera On" : "Start Camera"}
                    </Button>

                    <Button
                      size="sm"
                      variant={micActive ? "default" : "outline"}
                      className="text-xs h-9"
                      onClick={() => setMicActive(!micActive)}
                    >
                      {micActive ? <Mic className="mr-1.5 h-3.5 w-3.5" /> : <MicOff className="mr-1.5 h-3.5 w-3.5" />}
                      {micActive ? "Mic Live" : "Mic Muted"}
                    </Button>
                  </div>

                  <Button
                    size="sm"
                    className={`text-xs h-9 px-5 font-bold ${
                      session.is_live 
                        ? "bg-red-600 text-white hover:bg-red-700" 
                        : "bg-emerald-600 text-white hover:bg-emerald-700"
                    }`}
                    onClick={handleToggleGoLive}
                  >
                    <Radio className="mr-1.5 h-4 w-4" />
                    {session.is_live ? "Stop Live Stream" : "GO LIVE NOW"}
                  </Button>
                </div>
              </Card>

              {/* Stream Title & Category Form */}
              <Card className="border-border bg-card p-5 space-y-3">
                <CardTitle className="text-sm font-bold">Broadcast Metadata</CardTitle>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold">Stream Title:</label>
                    <Input
                      value={studioTitle}
                      onChange={(e) => setStudioTitle(e.target.value)}
                      placeholder="e.g. Live Game Jam: Building an Action Roguelike in 3 Hours"
                      className="text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold">Stream Category:</label>
                    <Input
                      value={studioCategory}
                      onChange={(e) => setStudioCategory(e.target.value)}
                      placeholder="Gaming & 3D Modeling"
                      className="text-xs"
                    />
                  </div>
                </div>
              </Card>
            </div>

            {/* Own Livestreaming API Credentials Column */}
            <div className="space-y-4">
              <Card className="border-border bg-card p-5 space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-primary/10 text-primary rounded-lg">
                    <Key className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-bold">Your Livestreaming API</CardTitle>
                    <CardDescription className="text-[11px]">Use with OBS Studio, Streamlabs or WebRTC</CardDescription>
                  </div>
                </div>

                {/* RTMP Ingest URL */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase">RTMP Ingest Server:</label>
                  <div className="flex items-center space-x-1">
                    <Input
                      readOnly
                      value={session.rtmp_url}
                      className="font-mono text-[11px] h-8 bg-muted/40"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 px-2"
                      onClick={() => {
                        navigator.clipboard.writeText(session.rtmp_url)
                        setCopiedRtmp(true)
                        setTimeout(() => setCopiedRtmp(false), 2000)
                      }}
                    >
                      {copiedRtmp ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                </div>

                {/* Stream Key */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-semibold text-muted-foreground uppercase">Stream Key (Keep Private):</label>
                    <button
                      type="button"
                      className="text-[10px] text-primary hover:underline"
                      onClick={() => setShowKey(!showKey)}
                    >
                      {showKey ? "Hide" : "Show"}
                    </button>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Input
                      readOnly
                      type={showKey ? "text" : "password"}
                      value={session.stream_key}
                      className="font-mono text-[11px] h-8 bg-muted/40"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 px-2"
                      onClick={() => {
                        navigator.clipboard.writeText(session.stream_key)
                        setCopiedKey(true)
                        setTimeout(() => setCopiedKey(false), 2000)
                      }}
                    >
                      {copiedKey ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-[11px] text-muted-foreground h-7 w-full justify-start px-0 mt-1"
                    onClick={handleRegenerateKey}
                  >
                    <RefreshCw className="mr-1 h-3 w-3" />
                    Reset Stream Key
                  </Button>
                </div>

                {/* WebRTC Endpoint */}
                <div className="space-y-1 pt-2 border-t">
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase">WebRTC Low-Latency Endpoint:</label>
                  <Input
                    readOnly
                    value={session.webrtc_url}
                    className="font-mono text-[10px] h-8 bg-muted/40 truncate"
                  />
                </div>
              </Card>

              {/* OBS Setup Quick Guide */}
              <Card className="border-border bg-card p-5 space-y-2.5 text-xs">
                <div className="flex items-center space-x-1.5 font-bold text-foreground">
                  <Terminal className="h-4 w-4 text-primary" />
                  <span>OBS Studio Ingest Setup</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground text-[11px] leading-relaxed">
                  <li>Open OBS Studio &gt; Settings &gt; Stream.</li>
                  <li>Service: Select <strong>Custom...</strong></li>
                  <li>Server: Paste <code>{session.rtmp_url}</code></li>
                  <li>Stream Key: Paste your private key above.</li>
                  <li>Video Bitrate: 6000 Kbps (Keyframe: 2s).</li>
                </ol>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Super Chat Tip Modal */}
      <Dialog open={isTipModalOpen} onOpenChange={setIsTipModalOpen}>
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-amber-500/20 text-amber-500 rounded-lg">
              <Coins className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>Send Super Chat Tip</DialogTitle>
              <DialogDescription className="text-xs">
                Highlight your message on Waya Steurbaut's live broadcast.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 my-3 text-xs">
          {/* Preset Tip Buttons */}
          <div className="space-y-1.5">
            <label className="font-semibold text-muted-foreground">Select Tip Amount (Credits):</label>
            <div className="grid grid-cols-4 gap-2">
              {[50, 100, 250, 500].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setTipAmount(amt)}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    tipAmount === amt
                      ? "border-amber-500 bg-amber-500/10 font-bold text-amber-500"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  <div className="text-sm font-black">{amt}</div>
                  <div className="text-[10px] text-muted-foreground">credits</div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-muted-foreground">Your Highlighted Message:</label>
            <Textarea
              rows={3}
              value={tipMessage}
              onChange={(e) => setTipMessage(e.target.value)}
              placeholder="Cheer on the creator or ask a featured question..."
              className="text-xs"
            />
          </div>

          <div className="p-3 bg-muted/40 rounded-xl space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span>Your Token Balance:</span>
              <span className="font-bold">{getTokenBalance()} credits</span>
            </div>
            <div className="flex justify-between text-amber-500 font-bold">
              <span>Total Tip:</span>
              <span>{tipAmount} credits (${(tipAmount * 0.1).toFixed(2)} USD)</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => setIsTipModalOpen(false)}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSendSuperChat} className="bg-amber-500 text-white hover:bg-amber-600 font-bold">
            Send {tipAmount} Credits Super Chat
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  )
}
