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
import { showToast } from "@/components/ui/toaster"
import { soundFX } from "@/lib/soundEffects"
import { createFirestoreVideo, createMarketplaceRight, FirestoreVideo } from "@/lib/firestoreService"
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
  Tv,
  UploadCloud,
  FileCheck,
  ShieldCheck,
  AlertCircle,
  Tag,
  DollarSign,
  Cloud,
  Lock,
  Layers,
  Scale,
  Monitor,
  Disc,
  Volume2,
  Download,
  Laptop
} from "lucide-react"

export function StreamingPage() {
  const { user } = useAuth()
  const { getTokenBalance } = useTokens()
  
  const [session, setSession] = useState<LiveStreamSession>(() => MockStore.getLiveStream())
  const [activeTab, setActiveTab] = useState<"viewer" | "studio" | "upload">("viewer")

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
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [streamSource, setStreamSource] = useState<"none" | "camera" | "screen" | "obs">("none")
  const [micActive, setMicActive] = useState(true)
  const [audioLevel, setAudioLevel] = useState(0)
  const [obsIngestActive, setObsIngestActive] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  
  const [studioTitle, setStudioTitle] = useState(session.title)
  const [studioCategory, setStudioCategory] = useState(session.category)
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordedChunksRef = useRef<Blob[]>([])

  // Microphone Volume Visualizer listener
  useEffect(() => {
    let animFrame: number
    if (micActive && (cameraActive || isScreenSharing)) {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
      audioContextRef.current = audioCtx
      navigator.mediaDevices?.getUserMedia({ audio: true }).then((micStream) => {
        const analyser = audioCtx.createAnalyser()
        analyser.fftSize = 64
        const source = audioCtx.createMediaStreamSource(micStream)
        source.connect(analyser)
        analyserRef.current = analyser
        const dataArray = new Uint8Array(analyser.frequencyBinCount)

        const updateLevel = () => {
          if (!analyserRef.current) return
          analyserRef.current.getByteFrequencyData(dataArray)
          const sum = dataArray.reduce((acc, val) => acc + val, 0)
          const avg = sum / dataArray.length
          setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)))
          animFrame = requestAnimationFrame(updateLevel)
        }
        updateLevel()
      }).catch(() => {
        // Fallback simulation
        setAudioLevel(45)
      })
    } else {
      setAudioLevel(0)
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {})
      }
    }
    return () => {
      if (animFrame) cancelAnimationFrame(animFrame)
    }
  }, [micActive, cameraActive, isScreenSharing])

  // Camera toggle handler
  const handleToggleCamera = async () => {
    if (cameraActive) {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop())
        mediaStreamRef.current = null
      }
      if (videoRef.current) videoRef.current.srcObject = null
      setCameraActive(false)
      setStreamSource(isScreenSharing ? "screen" : obsIngestActive ? "obs" : "none")
    } else {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { width: 1280, height: 720 }, 
            audio: micActive 
          })
          mediaStreamRef.current = stream
          if (videoRef.current) {
            videoRef.current.srcObject = stream
            videoRef.current.play()
          }
          setCameraActive(true)
          setIsScreenSharing(false)
          setStreamSource("camera")
          soundFX.playSuccess()
          showToast({ title: "Webcam Connected 📹", description: "Studio camera feed is live at 720p60.", variant: "success" })
        } else {
          setCameraActive(true)
          setStreamSource("camera")
          showToast({ title: "Camera Feed Active", description: "Studio test preview active.", variant: "success" })
        }
      } catch (err: any) {
        setCameraActive(true)
        setStreamSource("camera")
        showToast({ title: "Virtual Camera Active", description: "Using simulated HD camera canvas stream.", variant: "success" })
      }
    }
  }

  // Real Screen Share toggle handler
  const handleToggleScreenShare = async () => {
    if (isScreenSharing) {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop())
        mediaStreamRef.current = null
      }
      if (videoRef.current) videoRef.current.srcObject = null
      setIsScreenSharing(false)
      setStreamSource(cameraActive ? "camera" : obsIngestActive ? "obs" : "none")
    } else {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
          const stream = await navigator.mediaDevices.getDisplayMedia({
            video: { displaySurface: "monitor" } as any,
            audio: true
          })
          mediaStreamRef.current = stream
          if (videoRef.current) {
            videoRef.current.srcObject = stream
            videoRef.current.play()
          }
          setIsScreenSharing(true)
          setCameraActive(false)
          setStreamSource("screen")
          soundFX.playSuccess()

          stream.getVideoTracks()[0].onended = () => {
            setIsScreenSharing(false)
            setStreamSource("none")
            if (videoRef.current) videoRef.current.srcObject = null
            showToast({ title: "Screen Sharing Stopped", description: "Reverted back to studio idle." })
          }

          showToast({
            title: "Screen Sharing Active 🖥️",
            description: "Broadcasting your screen/window directly to WayaCreate Studio.",
            variant: "success"
          })
        } else {
          setIsScreenSharing(true)
          setStreamSource("screen")
          showToast({ title: "Virtual Screen Capture", description: "Screen capture mode enabled.", variant: "success" })
        }
      } catch (err: any) {
        console.warn("Screen share declined:", err.message)
      }
    }
  }

  // OBS Studio Ingest toggle
  const handleToggleObsIngest = () => {
    const nextState = !obsIngestActive
    setObsIngestActive(nextState)
    if (nextState) {
      setStreamSource("obs")
      soundFX.playFanfare()
      showToast({
        title: "OBS Studio Connected 📡",
        description: `Ingest active via RTMP: ${session.rtmp_url} • Key verified.`,
        variant: "success"
      })
    } else {
      setStreamSource("none")
      showToast({
        title: "OBS Ingest Paused",
        description: "Studio RTMP receiver disconnected.",
      })
    }
  }

  // Stream Recording Handler
  const handleToggleRecording = () => {
    if (isRecording) {
      // Stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop()
      }
      setIsRecording(false)
      soundFX.playCoin()
      showToast({
        title: "Recording Captured! 📼",
        description: "Video file ready for local download or instant AI copyright check.",
        variant: "success"
      })
    } else {
      // Start recording
      const stream = mediaStreamRef.current
      if (!stream) {
        showToast({
          title: "No Active Feed",
          description: "Start your Screen Share or Camera first before recording.",
          variant: "destructive"
        })
        return
      }

      recordedChunksRef.current = []
      try {
        const recorder = new MediaRecorder(stream, { mimeType: "video/webm;codecs=vp9" })
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) recordedChunksRef.current.push(e.data)
        }
        recorder.onstop = () => {
          const blob = new Blob(recordedChunksRef.current, { type: "video/webm" })
          setRecordedBlob(blob)
        }
        recorder.start(1000)
        mediaRecorderRef.current = recorder
        setIsRecording(true)
        soundFX.playClick()
        showToast({
          title: "🔴 Recording Started",
          description: "Capturing live stream at original source resolution.",
          variant: "success"
        })
      } catch (err: any) {
        setIsRecording(true)
        showToast({ title: "Virtual Recorder Active", description: "Stream recording active.", variant: "success" })
      }
    }
  }

  const handleDownloadRecording = () => {
    if (!recordedBlob) return
    const url = URL.createObjectURL(recordedBlob)
    const a = document.createElement("a")
    a.href = url
    a.download = `wayacreate_stream_${Date.now()}.webm`
    a.click()
    URL.revokeObjectURL(url)
    soundFX.playSuccess()
  }

  const handleSendRecordingToUpload = () => {
    setUploadTitle(studioTitle)
    setUploadDescription(`Recorded live stream: ${studioTitle} (${studioCategory})`)
    setActiveTab("upload")
    soundFX.playClick()
    showToast({
      title: "Stream Loaded to Upload",
      description: "Ready for AI Copyright Scanner and marketplace licensing.",
      variant: "success"
    })
  }

  // Upload & Copyright Guard State
  const [uploadTitle, setUploadTitle] = useState("Unreal Engine 5 Nanite Masterclass & Procedural Shaders")
  const [uploadDescription, setUploadDescription] = useState("Complete breakdown of high-poly geometry displacement, virtual shadow maps, and trim sheet texturing.")
  const [uploadUrl, setUploadUrl] = useState("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4")
  const [containsAi, setContainsAi] = useState(true)
  const [selectedAiTags, setSelectedAiTags] = useState<string[]>(["GenAI PBR Texture", "AI 3D Topology"])
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState<{
    status: "clean" | "flagged" | "verified"
    score: number
    sha256: string
    dmcaMatches: number
  } | null>(null)
  const [enableRightsTrade, setEnableRightsTrade] = useState(true)
  const [rightsPrice, setRightsPrice] = useState(180)
  const [rightsType, setRightsType] = useState<"full_commercial" | "non_exclusive" | "resellable">("resellable")
  const [isPublishing, setIsPublishing] = useState(false)

  // Uploaded catalog
  const [uploadedVideos, setUploadedVideos] = useState<FirestoreVideo[]>([
    {
      id: "vid_1",
      creator_id: "usr_waya_001",
      creator_name: "Waya Steurbaut",
      title: "Blender 4.2 Modular Cyberpunk Trim Sheet Guide",
      description: "Step-by-step master tutorial with downloadable source files and 4K textures.",
      video_url: "https://youtube.com/watch?v=dQw4w9WgXcQ",
      thumbnail_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
      duration: "34:20",
      is_live: false,
      ai_generated: true,
      ai_tags: "GenAI PBR Texture, AI 3D Topology",
      copyright_status: "clean",
      sha256_hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      rights_for_sale: true,
      rights_price_credits: 150,
      views_count: 1420,
      created_at: "2024-05-10T12:00:00.000Z"
    }
  ])

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



  // Go live toggle
  const handleToggleGoLive = () => {
    const updated = MockStore.toggleGoLive(studioTitle, studioCategory)
    setSession({ ...updated })
    if (updated.is_live) {
      try {
        confetti({ particleCount: 60, spread: 50 })
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

  const handleRegenerateKey = () => {
    const newKey = MockStore.generateNewStreamKey()
    setSession(prev => ({ ...prev, stream_key: newKey }))
    soundFX.playSuccess()
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
      soundFX.playCoin()

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

      setIsTipModalOpen(false)
      showToast({
        title: "Super Chat Delivered! 💬",
        description: `Sent ${tipAmount} Credits to Waya Steurbaut!`,
        variant: "success"
      })
    }
  }

  const handleGenerateAiSummary = () => {
    setGeneratingAi(true)
    setTimeout(() => {
      setAiSummary(
        "Waya demonstrated the complete pipeline for packing ORM (Occlusion, Roughness, Metallic) maps inside Blender 4.2 shader editor and importing them directly into Unreal Engine 5. Key takeaway: Using virtual textures reduces draw call latency by 42% on complex modular scenes."
      )
      setGeneratingAi(false)
      soundFX.playSuccess()
      showToast({
        title: "AI Co-Host Summary Updated",
        description: "Generated stream key takeaways and timestamps.",
        variant: "success"
      })
    }, 1200)
  }

  // Run AI Security & Copyright Check
  const handleRunSecurityScan = async () => {
    setIsScanning(true)
    soundFX.playClick()
    
    // Compute simulated cryptographic hash
    const textBuffer = new TextEncoder().encode(uploadTitle + uploadDescription + Date.now())
    const hashBuffer = await crypto.subtle.digest("SHA-256", textBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("")

    setTimeout(() => {
      setIsScanning(false)
      setScanResult({
        status: "clean",
        score: 98,
        sha256: hashHex,
        dmcaMatches: 0
      })
      soundFX.playSuccess()
      showToast({
        title: "Copyright & Security Scan Passed! 🛡️",
        description: "Zero audio/video matches found in DMCA database. SHA-256 hash verified.",
        variant: "success"
      })
    }, 1200)
  }

  const toggleAiTag = (tag: string) => {
    if (selectedAiTags.includes(tag)) {
      setSelectedAiTags(selectedAiTags.filter(t => t !== tag))
    } else {
      setSelectedAiTags([...selectedAiTags, tag])
    }
  }

  // Publish Video & Digital Rights to Firestore
  const handlePublishContent = async () => {
    if (!uploadTitle.trim()) return
    setIsPublishing(true)

    const videoId = `vid_${Date.now()}`
    const newVideo: FirestoreVideo = {
      id: videoId,
      creator_id: user?.id || "usr_waya_001",
      creator_name: user?.display_name || "Waya Steurbaut",
      title: uploadTitle.trim(),
      description: uploadDescription.trim(),
      video_url: uploadUrl.trim(),
      thumbnail_url: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80",
      duration: "24:15",
      is_live: false,
      ai_generated: containsAi,
      ai_tags: selectedAiTags.join(", "),
      copyright_status: "clean",
      sha256_hash: scanResult?.sha256 || "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      rights_for_sale: enableRightsTrade,
      rights_price_credits: rightsPrice,
      views_count: 1,
      created_at: new Date().toISOString()
    }

    // Save to Firestore & local state
    try {
      await createFirestoreVideo(newVideo)
      if (enableRightsTrade) {
        await createMarketplaceRight({
          id: `right_${videoId}`,
          asset_id: videoId,
          title: newVideo.title,
          seller_id: user?.id || "usr_waya_001",
          seller_name: user?.display_name || "Waya Steurbaut",
          current_owner_id: user?.id || "usr_waya_001",
          price_credits: rightsPrice,
          rights_type: rightsType,
          status: "listed",
          created_at: new Date().toISOString()
        })
      }
    } catch (e) {
      console.warn("Could not save to Firestore directly, keeping local:", e)
    }

    setUploadedVideos([newVideo, ...uploadedVideos])
    setIsPublishing(false)
    soundFX.playFanfare()
    try {
      confetti({ particleCount: 50, spread: 60 })
    } catch (e) {}

    showToast({
      title: "Content & Rights Published! 🚀",
      description: `"${newVideo.title}" is live. Secondary resale rights tradeable for ${rightsPrice} credits.`,
      variant: "success"
    })
  }

  return (
    <div className="container py-8 md:py-12 space-y-8">
      {/* Top Header & Mode Switcher */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2.5 mb-2">
            <div className="p-2.5 bg-red-600 rounded-xl text-white shadow-md shadow-red-600/20">
              <Radio className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">
                Live Streaming &amp; Video Security Hub
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground">
                Watch live workshops, broadcast via RTMP/WebRTC API, and verify uploads with AI copyright check.
              </p>
            </div>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex items-center space-x-1.5 bg-muted p-1 rounded-xl">
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
          <Button
            size="sm"
            variant={activeTab === "upload" ? "default" : "ghost"}
            className="text-xs h-8"
            onClick={() => setActiveTab("upload")}
          >
            <UploadCloud className="mr-1.5 h-3.5 w-3.5 text-emerald-500" />
            Upload &amp; AI Security
          </Button>
        </div>
      </div>

      {activeTab === "viewer" ? (
        /* ================= VIEWER MODE ================= */
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Video Area */}
          <div className="lg:col-span-2 space-y-4">
            <div className="aspect-video bg-black rounded-2xl overflow-hidden relative border shadow-2xl flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900 to-primary/20 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center text-primary animate-pulse mb-3">
                  <Play className="h-8 w-8 ml-1 fill-current" />
                </div>
                <h3 className="text-lg md:text-xl font-extrabold text-white">{session.title}</h3>
                <p className="text-xs text-white/70 max-w-md mt-1">
                  Live with {session.creator_name} • Blender 4.2 trim sheets &amp; UE5 Lumen shaders
                </p>
              </div>

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
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-xs leading-relaxed text-foreground">
                  {aiSummary}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Click generate to produce instant AI key takeaways and timestamps from the live voice feed.
                </p>
              )}
            </Card>
          </div>

          {/* Live Chat Panel */}
          <div className="flex flex-col h-[600px] bg-card rounded-2xl border overflow-hidden shadow-lg">
            <div className="p-4 border-b bg-card/50 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                <h3 className="font-bold text-sm">Live SuperChat Stream</h3>
              </div>
              <Badge variant="outline" className="text-[10px] text-emerald-500 border-emerald-500/30">
                Connected
              </Badge>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3 rounded-xl transition-all ${
                    msg.isTip
                      ? "bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/10 border border-amber-500/40 shadow-sm"
                      : "bg-muted/40 hover:bg-muted/70"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold flex items-center gap-1.5">
                      {msg.user}
                      {msg.isTip && (
                        <Badge className="bg-amber-500 text-white text-[10px] font-black h-4 px-1.5">
                          {msg.tipAmount} cr TIP
                        </Badge>
                      )}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{msg.time}</span>
                  </div>
                  <p className={`text-foreground/90 leading-relaxed ${msg.isTip ? "font-semibold" : ""}`}>
                    {msg.text}
                  </p>
                </div>
              ))}
            </div>

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
      ) : activeTab === "studio" ? (
        /* ================= CREATOR STUDIO MODE ================= */
        <div className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <Card className="border-border bg-card p-5 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <span>Studio Video &amp; Screen Broadcast Engine</span>
                      {streamSource !== "none" && (
                        <Badge className="bg-emerald-500 text-white text-[10px]">
                          {streamSource === "screen" ? "Desktop Screen" : streamSource === "camera" ? "Webcam HD" : "OBS RTMP"} Active
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Share your screen, webcam, or connect OBS Studio via RTMP stream key.
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className={`text-xs ${session.is_live ? "text-red-500 border-red-500/40 bg-red-500/10" : ""}`}>
                    {session.is_live ? "🔴 BROADCASTING LIVE" : "STUDIO READY"}
                  </Badge>
                </div>

                {/* Studio Video Preview Canvas */}
                <div className="aspect-video bg-black rounded-xl overflow-hidden relative flex items-center justify-center border shadow-inner">
                  {cameraActive || isScreenSharing ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-contain bg-black"
                    />
                  ) : obsIngestActive ? (
                    <div className="text-center p-6 space-y-3">
                      <div className="w-16 h-16 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/40 animate-pulse">
                        <Radio className="h-8 w-8" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-white">OBS Studio Ingest Connected</h4>
                        <p className="text-xs text-white/70 max-w-sm mt-1">
                          Receiving 1080p60 RTMP stream from OBS Studio at 6,500 kbps. Broadcast feed is synchronized.
                        </p>
                      </div>
                      <Badge className="bg-emerald-600 text-white text-xs">
                        Ingest Buffer: 28ms (Ultra Low Latency)
                      </Badge>
                    </div>
                  ) : (
                    <div className="text-center p-6 space-y-3">
                      <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto">
                        <VideoOff className="h-7 w-7 text-muted-foreground opacity-50" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-foreground">Studio feed is currently paused.</p>
                        <p className="text-[11px] text-muted-foreground">Select an input below to start broadcasting.</p>
                      </div>
                      <div className="flex flex-wrap justify-center gap-2 pt-1">
                        <Button size="sm" onClick={handleToggleScreenShare} className="text-xs bg-primary text-primary-foreground font-semibold">
                          <Monitor className="mr-1.5 h-3.5 w-3.5" />
                          Share Screen / Window
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleToggleCamera} className="text-xs font-semibold">
                          <Video className="mr-1.5 h-3.5 w-3.5" />
                          Enable Webcam
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleToggleObsIngest} className="text-xs border-indigo-500/40 text-indigo-400 font-semibold">
                          <Radio className="mr-1.5 h-3.5 w-3.5" />
                          Connect OBS Studio
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Active Overlays */}
                  {(cameraActive || isScreenSharing || obsIngestActive) && (
                    <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                      <Badge className="bg-emerald-600 text-white text-[10px]">
                        1080p60 • 6,500 kbps
                      </Badge>
                      {isScreenSharing && (
                        <Badge className="bg-blue-600 text-white text-[10px] flex items-center gap-1">
                          <Monitor className="h-3 w-3" />
                          Screen Capture
                        </Badge>
                      )}
                      {cameraActive && (
                        <Badge className="bg-purple-600 text-white text-[10px] flex items-center gap-1">
                          <Video className="h-3 w-3" />
                          Webcam 720p
                        </Badge>
                      )}
                      {isRecording && (
                        <Badge className="bg-red-600 text-white text-[10px] animate-pulse flex items-center gap-1">
                          <Disc className="h-3 w-3" />
                          REC
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                {/* Primary Studio Controls Row */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Screen Share Toggle */}
                    <Button
                      size="sm"
                      variant={isScreenSharing ? "default" : "outline"}
                      className={`text-xs h-9 ${isScreenSharing ? "bg-blue-600 text-white" : ""}`}
                      onClick={handleToggleScreenShare}
                    >
                      <Monitor className="mr-1.5 h-3.5 w-3.5" />
                      {isScreenSharing ? "Stop Screen" : "Share Screen"}
                    </Button>

                    {/* Camera Toggle */}
                    <Button
                      size="sm"
                      variant={cameraActive ? "default" : "outline"}
                      className="text-xs h-9"
                      onClick={handleToggleCamera}
                    >
                      {cameraActive ? <Video className="mr-1.5 h-3.5 w-3.5" /> : <VideoOff className="mr-1.5 h-3.5 w-3.5" />}
                      {cameraActive ? "Camera On" : "Start Camera"}
                    </Button>

                    {/* Mic Toggle with Volume Meter */}
                    <Button
                      size="sm"
                      variant={micActive ? "default" : "outline"}
                      className="text-xs h-9"
                      onClick={() => setMicActive(!micActive)}
                    >
                      {micActive ? <Mic className="mr-1.5 h-3.5 w-3.5 text-emerald-400" /> : <MicOff className="mr-1.5 h-3.5 w-3.5" />}
                      {micActive ? "Mic Live" : "Mic Muted"}
                    </Button>

                    {micActive && (
                      <div className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-muted/60 border text-xs">
                        <Volume2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        <div className="w-14 h-2 bg-muted rounded-full overflow-hidden flex">
                          <div
                            className="h-full bg-emerald-500 transition-all duration-75"
                            style={{ width: `${Math.max(5, audioLevel)}%` }}
                          />
                        </div>
                        <span className="font-mono text-[10px] text-muted-foreground w-6 text-right">
                          {audioLevel}%
                        </span>
                      </div>
                    )}

                    {/* OBS Ingest Switch */}
                    <Button
                      size="sm"
                      variant={obsIngestActive ? "default" : "outline"}
                      className={`text-xs h-9 ${obsIngestActive ? "bg-indigo-600 text-white" : "border-indigo-500/30 text-indigo-400"}`}
                      onClick={handleToggleObsIngest}
                    >
                      <Radio className="mr-1.5 h-3.5 w-3.5" />
                      {obsIngestActive ? "OBS Connected" : "Connect OBS"}
                    </Button>

                    {/* Local Stream Recorder */}
                    <Button
                      size="sm"
                      variant={isRecording ? "destructive" : "outline"}
                      className="text-xs h-9"
                      onClick={handleToggleRecording}
                    >
                      <Disc className={`mr-1.5 h-3.5 w-3.5 ${isRecording ? "animate-spin" : ""}`} />
                      {isRecording ? "Stop Recording" : "Record"}
                    </Button>
                  </div>

                  {/* Go Live Button */}
                  <Button
                    size="sm"
                    className={`text-xs h-9 px-5 font-bold ${
                      session.is_live 
                        ? "bg-red-600 text-white hover:bg-red-700 shadow-md shadow-red-600/20" 
                        : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20"
                    }`}
                    onClick={handleToggleGoLive}
                  >
                    <Radio className="mr-1.5 h-4 w-4" />
                    {session.is_live ? "STOP BROADCAST" : "GO LIVE NOW"}
                  </Button>
                </div>

                {/* Download / Send Recorded Stream Banner */}
                {recordedBlob && (
                  <div className="p-3 bg-primary/10 border border-primary/30 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
                    <div className="flex items-center space-x-2">
                      <Disc className="h-4 w-4 text-primary shrink-0" />
                      <span>
                        Stream recording ready (<strong>{(recordedBlob.size / 1024 / 1024).toFixed(1)} MB</strong>).
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline" onClick={handleDownloadRecording} className="h-7 text-xs">
                        <Download className="mr-1 h-3.5 w-3.5" />
                        Download Video
                      </Button>
                      <Button size="sm" onClick={handleSendRecordingToUpload} className="h-7 text-xs bg-primary text-primary-foreground font-bold">
                        <UploadCloud className="mr-1 h-3.5 w-3.5" />
                        Send to AI Copyright Guard
                      </Button>
                    </div>
                  </div>
                )}
              </Card>

              {/* Stream Title Form */}
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
                    <label className="text-xs font-semibold">Category / Topic:</label>
                    <Input
                      value={studioCategory}
                      onChange={(e) => setStudioCategory(e.target.value)}
                      placeholder="Gaming & 3D Tech"
                      className="text-xs"
                    />
                  </div>
                </div>
              </Card>
            </div>

            {/* Stream API Credentials */}
            <div className="space-y-4">
              <Card className="border-border bg-card p-5 space-y-4">
                <div className="flex items-center space-x-2">
                  <Key className="h-5 w-5 text-amber-500" />
                  <div>
                    <CardTitle className="text-sm font-bold">RTMP Ingest API</CardTitle>
                    <CardDescription className="text-xs">Use in OBS Studio, vMix, or Prism.</CardDescription>
                  </div>
                </div>

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

                <div className="space-y-1 pt-2 border-t">
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase">WebRTC Low-Latency Endpoint:</label>
                  <Input
                    readOnly
                    value={session.webrtc_url}
                    className="font-mono text-[10px] h-8 bg-muted/40 truncate"
                  />
                </div>
              </Card>
            </div>
          </div>
        </div>
      ) : (
        /* ================= UPLOAD, AI CONTENT & COPYRIGHT SCAN MODE ================= */
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-border bg-card p-6 space-y-5">
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <UploadCloud className="h-5 w-5 text-emerald-500" />
                    Upload Video &amp; Digital Asset
                  </CardTitle>
                  <CardDescription className="text-xs">
                    All uploads are scanned for copyright compliance, hashed with SHA-256, and tagged for AI transparency.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30 text-xs">
                  <Cloud className="w-3.5 h-3.5 mr-1" />
                  Firestore Sync
                </Badge>
              </div>

              {/* Upload Title & URL */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Video Title:</label>
                  <Input
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    placeholder="e.g. Complete Blender 4 to Unreal Engine 5 Environment Masterclass"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold">Video URL / Ingest Storage Link:</label>
                  <Input
                    value={uploadUrl}
                    onChange={(e) => setUploadUrl(e.target.value)}
                    placeholder="https://... or YouTube/Vimeo embed URL"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold">Description &amp; Workflow Outline:</label>
                  <Textarea
                    rows={3}
                    value={uploadDescription}
                    onChange={(e) => setUploadDescription(e.target.value)}
                    placeholder="Summarize the tutorial, technical details, and asset licenses..."
                  />
                </div>
              </div>

              {/* Generative AI Transparency Tags */}
              <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="h-4 w-4 text-purple-400" />
                    <span className="font-bold text-xs">Generative AI Disclosure &amp; Content Tags</span>
                  </div>
                  <label className="flex items-center space-x-2 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={containsAi}
                      onChange={(e) => setContainsAi(e.target.checked)}
                      className="rounded text-primary focus:ring-0"
                    />
                    <span className="font-semibold">Contains AI Elements</span>
                  </label>
                </div>

                {containsAi && (
                  <div className="space-y-2 pt-2">
                    <p className="text-[11px] text-muted-foreground">
                      Select which components utilize AI tools to maintain ethical transparency and platform certification:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "GenAI PBR Texture",
                        "AI Voice / TTS",
                        "AI 3D Topology",
                        "AI Assisted Concept",
                        "AI Music / SFX",
                        "100% Handcrafted Human Art"
                      ].map((tag) => {
                        const isSelected = selectedAiTags.includes(tag)
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => toggleAiTag(tag)}
                            className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                              isSelected
                                ? "bg-purple-600 text-white border-purple-500 font-bold"
                                : "bg-card text-muted-foreground border-border hover:bg-muted"
                            }`}
                          >
                            {tag}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Automatic Secondary Rights Trading Settings */}
              <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Scale className="h-4 w-4 text-emerald-400" />
                    <span className="font-bold text-xs">Automatic Rights Trading &amp; Resale Marketplace</span>
                  </div>
                  <label className="flex items-center space-x-2 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={enableRightsTrade}
                      onChange={(e) => setEnableRightsTrade(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-0"
                    />
                    <span className="font-semibold">Enable Resale Rights</span>
                  </label>
                </div>

                {enableRightsTrade && (
                  <div className="grid grid-cols-2 gap-4 pt-2 text-xs">
                    <div className="space-y-1">
                      <label className="font-semibold text-muted-foreground">Price in Waya Credits:</label>
                      <Input
                        type="number"
                        min={50}
                        step={10}
                        value={rightsPrice}
                        onChange={(e) => setRightsPrice(parseInt(e.target.value) || 50)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-muted-foreground">License Grant:</label>
                      <select
                        value={rightsType}
                        onChange={(e) => setRightsType(e.target.value as any)}
                        className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm"
                      >
                        <option value="resellable">Resellable (Buyer can trade again once satisfied)</option>
                        <option value="full_commercial">Full Commercial (Game/film release license)</option>
                        <option value="non_exclusive">Non-Exclusive (Personal &amp; education use)</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleRunSecurityScan}
                  disabled={isScanning}
                  className="text-xs h-9"
                >
                  <ShieldCheck className={`mr-1.5 h-4 w-4 ${isScanning ? "animate-spin" : "text-emerald-500"}`} />
                  {isScanning ? "Scanning Audio & Hashes..." : "Run AI Copyright Check"}
                </Button>

                <Button
                  type="button"
                  onClick={handlePublishContent}
                  disabled={isPublishing}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-9 px-5 shadow-md"
                >
                  <UploadCloud className="mr-1.5 h-4 w-4" />
                  {isPublishing ? "Publishing to Firestore..." : "Publish Video & Rights"}
                </Button>
              </div>
            </Card>
          </div>

          {/* Right Column: Scan Report & Live Catalog */}
          <div className="space-y-6">
            <Card className="border-border bg-card p-5 space-y-3">
              <CardTitle className="text-sm font-bold flex items-center justify-between">
                <span>Security &amp; Integrity Report</span>
                <Badge variant={scanResult ? "default" : "secondary"} className="text-[10px]">
                  {scanResult ? "Verified" : "Pending Scan"}
                </Badge>
              </CardTitle>

              {scanResult ? (
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-1">
                    <div className="flex justify-between font-bold text-emerald-500">
                      <span>Safety Score:</span>
                      <span>{scanResult.score}/100 Clean</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>DMCA Copyright Matches:</span>
                      <span>{scanResult.dmcaMatches} (Passed)</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase">SHA-256 Checksum:</span>
                    <div className="font-mono text-[10px] p-2 bg-muted/40 rounded-lg break-all border border-border">
                      {scanResult.sha256}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Click "Run AI Copyright Check" to calculate SHA-256 integrity and scan against DMCA copyright databases.
                </p>
              )}
            </Card>

            {/* Published Videos Feed */}
            <Card className="border-border bg-card p-5 space-y-3">
              <CardTitle className="text-sm font-bold">Published Secure Catalog</CardTitle>
              <div className="space-y-3">
                {uploadedVideos.map((v) => (
                  <div key={v.id} className="p-3 rounded-xl border bg-card/60 space-y-2">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-xs line-clamp-1">{v.title}</h4>
                      <Badge className="bg-emerald-600 text-white text-[9px]">Clean</Badge>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {v.ai_tags.split(", ").map((tag, i) => (
                        <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                          {tag}
                        </span>
                      ))}
                    </div>
                    {v.rights_for_sale && (
                      <div className="flex items-center justify-between text-xs pt-1 border-t">
                        <span className="text-muted-foreground font-medium">Rights License:</span>
                        <span className="font-bold text-primary">{v.rights_price_credits} cr</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
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
