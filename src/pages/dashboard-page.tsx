import { useState, useRef, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useTokens } from "@/contexts/TokenContext"
import { MockStore } from "@/data/mockStore"
import { LiveStreamSession } from "@/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { showToast } from "@/components/ui/toaster"
import { soundFX } from "@/lib/soundEffects"
import { 
  BarChart3, 
  Coins, 
  ShoppingCart, 
  Upload, 
  Star, 
  TrendingUp, 
  Clock, 
  CheckCircle2,
  ArrowRight,
  Shield,
  Zap,
  Radio,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Monitor,
  Copy,
  Check,
  BrainCircuit,
  Volume2,
  Sparkles
} from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import confetti from "canvas-confetti"

export function DashboardPage() {
  const { user } = useAuth()
  const { getTokenBalance, getTotalEarned } = useTokens()
  const navigate = useNavigate()

  const [session, setSession] = useState<LiveStreamSession>(() => MockStore.getLiveStream())
  const [screenActive, setScreenActive] = useState(false)
  const [cameraActive, setCameraActive] = useState(false)
  const [micActive, setMicActive] = useState(true)
  const [copiedKey, setCopiedKey] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)

  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const orders = MockStore.getOrders()
  const services = MockStore.getServices().filter(s => s.creator_id === user?.id)
  const content = MockStore.getContent().filter(c => c.creator_id === user?.id)

  const handleToggleScreen = async () => {
    if (screenActive) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop())
        streamRef.current = null
      }
      if (videoRef.current) videoRef.current.srcObject = null
      setScreenActive(false)
    } else {
      try {
        if (navigator.mediaDevices?.getDisplayMedia) {
          const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
          streamRef.current = stream
          if (videoRef.current) {
            videoRef.current.srcObject = stream
            videoRef.current.play()
          }
          setScreenActive(true)
          setCameraActive(false)
          soundFX.playSuccess()
          stream.getVideoTracks()[0].onended = () => {
            setScreenActive(false)
            if (videoRef.current) videoRef.current.srcObject = null
          }
          showToast({
            title: "Screen Share Active 🖥️",
            description: "Broadcasting your desktop/window into WayaCreate dashboard preview.",
            variant: "success"
          })
        } else {
          setScreenActive(true)
          showToast({ title: "Screen Mode Active", description: "Dashboard screen share active." })
        }
      } catch (err: any) {
        console.warn("Screen share canceled:", err.message)
      }
    }
  }

  const handleToggleCamera = async () => {
    if (cameraActive) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop())
        streamRef.current = null
      }
      if (videoRef.current) videoRef.current.srcObject = null
      setCameraActive(false)
    } else {
      try {
        if (navigator.mediaDevices?.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: micActive })
          streamRef.current = stream
          if (videoRef.current) {
            videoRef.current.srcObject = stream
            videoRef.current.play()
          }
          setCameraActive(true)
          setScreenActive(false)
          soundFX.playSuccess()
          showToast({ title: "Webcam Connected 📹", description: "Studio camera feed ready.", variant: "success" })
        } else {
          setCameraActive(true)
          showToast({ title: "Webcam Active", description: "Virtual camera preview on." })
        }
      } catch (err: any) {
        setCameraActive(true)
        showToast({ title: "Webcam Stream", description: "Virtual preview enabled." })
      }
    }
  }

  const handleToggleGoLive = () => {
    const updated = MockStore.toggleGoLive(session.title, session.category)
    setSession({ ...updated })
    if (updated.is_live) {
      try {
        confetti({ particleCount: 50, spread: 60 })
      } catch (e) {}
      soundFX.playFanfare()
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

  return (
    <div className="container py-8 md:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Creator Dashboard
            </h1>
            <Badge className="bg-primary text-primary-foreground text-xs">
              Level {user?.level.level || 18}
            </Badge>
            <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-xs flex items-center gap-1">
              <BrainCircuit className="h-3.5 w-3.5" />
              AI Rating: {user?.ai_rating || 96}/100
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Welcome back, {user?.display_name}. Track your gig orders, active tenders, live streams, and asset earnings.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link to="/streaming">
            <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white font-bold">
              <Radio className="mr-1.5 h-4 w-4" />
              Live Studio &amp; OBS
            </Button>
          </Link>
          <Link to="/upload">
            <Button size="sm" variant="outline" className="border-primary/30 text-primary">
              <Upload className="mr-1.5 h-4 w-4" />
              Upload Content
            </Button>
          </Link>
          <Link to="/tokens">
            <Button variant="outline" size="sm">
              <Coins className="mr-1.5 h-4 w-4 text-primary" />
              Tokens
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="gaming-card border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-muted-foreground font-semibold">Token Balance</span>
              <Coins className="h-4 w-4 text-primary" />
            </div>
            <div className="text-2xl font-black text-primary">{getTokenBalance().toLocaleString()}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">credits ready for payout</div>
          </CardContent>
        </Card>

        <Card className="gaming-card border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-muted-foreground font-semibold">Active Orders</span>
              <ShoppingCart className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-black text-foreground">{orders.filter(o => o.status === 'in_progress').length}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">milestones in production</div>
          </CardContent>
        </Card>

        <Card className="gaming-card border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-muted-foreground font-semibold">Published Assets</span>
              <Upload className="h-4 w-4 text-purple-500" />
            </div>
            <div className="text-2xl font-black text-foreground">{content.length + services.length}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">services &amp; digital packs</div>
          </CardContent>
        </Card>

        <Card className="gaming-card border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-muted-foreground font-semibold">Creator Rating</span>
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
            </div>
            <div className="text-2xl font-black text-foreground">{user?.rating || 4.96}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">from {user?.review_count || 248} reviews</div>
          </CardContent>
        </Card>
      </div>

      {/* ================= DASHBOARD LIVE STREAM & VIDEO STATION ================= */}
      <Card className="border-border bg-card overflow-hidden shadow-lg">
        <CardHeader className="p-5 border-b bg-gradient-to-r from-red-600/10 via-primary/5 to-transparent">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-red-600 text-white rounded-xl shadow-md">
                <Radio className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg font-bold">
                    Live Broadcast Station &amp; OBS Studio Ingest
                  </CardTitle>
                  <Badge className={`text-[10px] ${session.is_live ? "bg-red-600 text-white animate-pulse" : "bg-muted text-muted-foreground"}`}>
                    {session.is_live ? "● LIVE STREAMING" : "STANDBY"}
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  Share screen directly from the dashboard, test microphone audio, or broadcast from OBS Studio.
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                onClick={handleToggleGoLive}
                className={`font-bold text-xs h-9 ${
                  session.is_live ? "bg-red-600 hover:bg-red-700 text-white" : "bg-emerald-600 hover:bg-emerald-700 text-white"
                }`}
              >
                <Radio className="mr-1.5 h-3.5 w-3.5" />
                {session.is_live ? "End Broadcast" : "Go Live Now"}
              </Button>

              <Link to="/streaming">
                <Button size="sm" variant="outline" className="text-xs h-9">
                  Open Full Studio →
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5">
          <div className="grid md:grid-cols-3 gap-5">
            {/* Live Video Monitor */}
            <div className="md:col-span-2 space-y-3">
              <div className="aspect-video bg-black rounded-xl overflow-hidden relative flex items-center justify-center border shadow-inner">
                {screenActive || cameraActive ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-contain bg-black"
                  />
                ) : (
                  <div className="text-center p-6 space-y-2">
                    <Radio className="h-8 w-8 text-muted-foreground mx-auto opacity-50" />
                    <p className="text-xs text-muted-foreground">Monitor is in standby. Click Screen Share or Webcam to preview.</p>
                  </div>
                )}

                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <Badge className="bg-black/70 backdrop-blur text-white text-[10px]">
                    {screenActive ? "🖥️ Screen Feed" : cameraActive ? "📹 Webcam" : "Dashboard Monitor"}
                  </Badge>
                  {session.is_live && (
                    <Badge className="bg-red-600 text-white text-[10px] animate-pulse">
                      Live to {session.viewers.toLocaleString()} Viewers
                    </Badge>
                  )}
                </div>
              </div>

              {/* Controls bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    variant={screenActive ? "default" : "outline"}
                    className={`text-xs h-8 ${screenActive ? "bg-blue-600 text-white" : ""}`}
                    onClick={handleToggleScreen}
                  >
                    <Monitor className="mr-1.5 h-3.5 w-3.5" />
                    {screenActive ? "Stop Screen" : "Share Screen"}
                  </Button>

                  <Button
                    size="sm"
                    variant={cameraActive ? "default" : "outline"}
                    className="text-xs h-8"
                    onClick={handleToggleCamera}
                  >
                    {cameraActive ? <Video className="mr-1.5 h-3.5 w-3.5" /> : <VideoOff className="mr-1.5 h-3.5 w-3.5" />}
                    {cameraActive ? "Camera On" : "Webcam"}
                  </Button>

                  <Button
                    size="sm"
                    variant={micActive ? "default" : "outline"}
                    className="text-xs h-8"
                    onClick={() => setMicActive(!micActive)}
                  >
                    {micActive ? <Mic className="mr-1.5 h-3.5 w-3.5 text-emerald-400" /> : <MicOff className="mr-1.5 h-3.5 w-3.5" />}
                    {micActive ? "Mic On" : "Muted"}
                  </Button>
                </div>

                <span className="text-[11px] text-muted-foreground">
                  Stream Title: <strong>{session.title}</strong>
                </span>
              </div>
            </div>

            {/* OBS Studio Stream Ingest Box */}
            <div className="p-4 rounded-xl border bg-muted/30 space-y-3.5 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-[10px] border-indigo-500/40 text-indigo-400">
                    OBS Studio Ready
                  </Badge>
                  <span className="text-[11px] text-muted-foreground font-semibold">RTMP Protocol</span>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground">Server URL:</label>
                  <div className="p-2 bg-background border rounded font-mono text-[10px] truncate select-all">
                    {session.rtmp_url}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground">Private Stream Key:</label>
                  <div className="flex items-center space-x-1">
                    <div className="p-2 bg-background border rounded font-mono text-[10px] flex-1 truncate select-all">
                      {session.stream_key}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 shrink-0"
                      onClick={() => {
                        navigator.clipboard.writeText(session.stream_key)
                        setCopiedKey(true)
                        soundFX.playSuccess()
                        setTimeout(() => setCopiedKey(false), 2000)
                      }}
                    >
                      {copiedKey ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t space-y-2">
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Paste the server URL and stream key into OBS Studio (Settings → Stream → Custom) to broadcast your gaming or 3D workflow directly!
                </p>
                <Link to="/streaming" className="block">
                  <Button size="sm" variant="outline" className="w-full text-xs h-8 border-primary/30 text-primary hover:bg-primary/10">
                    View Studio Controls &amp; Chat →
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Recent Client Orders &amp; Milestones</h2>
          <Link to="/orders" className="text-xs text-primary font-semibold hover:underline">
            View All Orders →
          </Link>
        </div>

        <div className="space-y-3">
          {orders.map((order) => (
            <Card key={order.id} className="gaming-card border-border bg-card p-5">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm">{order.service_title}</span>
                    <Badge variant="outline" className={`text-[10px] capitalize ${
                      order.status === 'completed' ? 'text-emerald-500 border-emerald-500/30' : 'text-blue-500 border-blue-500/30'
                    }`}>
                      {order.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Client: {order.client_name} • Due: {order.delivery_date}
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <span className="font-extrabold text-sm text-primary">{order.amount} credits</span>
                    <span className="block text-[10px] text-muted-foreground">held in escrow</span>
                  </div>
                  <Button size="sm" variant="outline" className="text-xs" onClick={() => navigate("/orders")}>
                    Manage Order
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
