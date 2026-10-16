import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { MockStore } from "@/data/mockStore"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { showToast } from "@/components/ui/toaster"
import { soundFX } from "@/lib/soundEffects"
import confetti from "canvas-confetti"
import { 
  Zap, 
  Code, 
  FileText, 
  Image as ImageIcon, 
  BookOpen, 
  Copy, 
  Check, 
  Sparkles, 
  Download, 
  RefreshCw,
  Key,
  ExternalLink,
  Cpu,
  Clock,
  Layers,
  Terminal,
  Share2,
  CheckCircle2,
  Youtube,
  Gamepad2,
  GraduationCap
} from "lucide-react"

type GenType = "code" | "tutorial" | "image" | "youtube_seo" | "game_design" | "text"

interface GenerationMeta {
  title: string
  content: string
  provider: string
  model: string
  durationMs: number
  charCount: number
  estimatedTokens: number
  fileExtension: string
}

export function AIStudioPage() {
  const { user } = useAuth()
  const [generationType, setGenerationType] = useState<GenType>("code")
  const [prompt, setPrompt] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<GenerationMeta | null>(null)
  const [copied, setCopied] = useState(false)
  const [customApiKey, setCustomApiKey] = useState(() => localStorage.getItem("wayacreate_user_gemini_key") || "")
  const [showKeyInput, setShowKeyInput] = useState(false)
  const [apiOnline, setApiOnline] = useState<boolean | null>(null)

  // Check Gemini Status
  useEffect(() => {
    fetch("/api/gemini/status")
      .then(res => res.json())
      .then(data => {
        setApiOnline(data.status === "online")
      })
      .catch(() => setApiOnline(false))
  }, [])

  const handleSaveApiKey = () => {
    const clean = customApiKey.trim()
    if (clean) {
      localStorage.setItem("wayacreate_user_gemini_key", clean)
      soundFX.playSuccess()
      showToast({
        title: "Google AI Studio Key Stored 🔑",
        description: "Your custom Gemini key will be used for AI generations.",
        variant: "success"
      })
    } else {
      localStorage.removeItem("wayacreate_user_gemini_key")
      showToast({
        title: "Using Default Gemini Service",
        description: "Reverted to platform Gemini 2.5 Flash infrastructure.",
      })
    }
    setShowKeyInput(false)
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      soundFX.playClick()
      showToast({
        title: "Prompt Required",
        description: "Please enter instructions or details for Gemini AI.",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    soundFX.playClick()

    try {
      const response = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          type: generationType,
          apiKey: customApiKey.trim() || undefined
        })
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Generation request failed")
      }

      const fileExtMap: Record<GenType, string> = {
        code: prompt.toLowerCase().includes("shader") ? "hlsl" : "cs",
        tutorial: "md",
        image: "txt",
        youtube_seo: "txt",
        game_design: "md",
        text: "txt"
      }

      const titleMap: Record<GenType, string> = {
        code: `Engine Module: ${prompt.slice(0, 32)}...`,
        tutorial: `Masterclass Guide: ${prompt.slice(0, 32)}...`,
        image: `3D Concept Spec: ${prompt.slice(0, 32)}...`,
        youtube_seo: `YouTube Strategy: ${prompt.slice(0, 32)}...`,
        game_design: `Game Mechanics Spec: ${prompt.slice(0, 32)}...`,
        text: `Creative Brief: ${prompt.slice(0, 32)}...`
      }

      setResult({
        title: titleMap[generationType],
        content: data.text,
        provider: data.provider || "Gemini 2.5 Flash",
        model: data.model || "gemini-2.5-flash",
        durationMs: data.durationMs || 420,
        charCount: data.charCount || data.text.length,
        estimatedTokens: data.estimatedTokens || Math.round(data.text.length / 4),
        fileExtension: fileExtMap[generationType]
      })

      soundFX.playFanfare()
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.6 }
      })

      showToast({
        title: "Gemini 2.5 Flash Output Ready! ⚡",
        description: `Generated in ${(data.durationMs / 1000).toFixed(2)}s (${data.estimatedTokens || Math.round(data.text.length / 4)} tokens).`,
        variant: "success"
      })

      // Track AI goal in mock store
      MockStore.trackGoalAction("run_scan")
    } catch (err: any) {
      console.error("AI Generation error:", err)
      soundFX.playClick()
      showToast({
        title: "Generation Failed",
        description: err.message || "Failed to contact Gemini API",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    if (!result) return
    navigator.clipboard.writeText(result.content)
    setCopied(true)
    soundFX.playSuccess()
    setTimeout(() => setCopied(false), 2000)
    showToast({
      title: "Copied to Clipboard! 📋",
      description: "Content is ready to paste into Unity, Unreal Engine, or YouTube.",
    })
  }

  const handleDownload = () => {
    if (!result) return
    soundFX.playSuccess()
    const blob = new Blob([result.content], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    const safeTitle = result.title.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase().slice(0, 30)
    link.href = url
    link.download = `${safeTitle}.${result.fileExtension}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    showToast({
      title: "File Downloaded 💾",
      description: `Saved as ${safeTitle}.${result.fileExtension}`,
      variant: "success"
    })
  }

  const handleExportAsTutorial = () => {
    if (!result) return
    const courses = MockStore.getCourses()
    const newCourse = {
      id: `c_ai_${Date.now()}`,
      title: result.title,
      instructor: user?.display_name || "Waya Steurbaut",
      duration: "25:00",
      modules: 1,
      students: 1,
      rating: 5.0,
      price: 0,
      description: result.content.slice(0, 300) + "...",
      topics: ["AI Generated", "Gemini 2.5 Flash", generationType.toUpperCase()],
      thumbnail_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80"
    }
    courses.unshift(newCourse)
    MockStore.saveToStorage('wayacreate_courses', courses)
    soundFX.playCoin()
    showToast({
      title: "Exported to Academy Tutorials! 🎓",
      description: "This guide is now published to WayaCreate Courses.",
      variant: "success"
    })
  }

  return (
    <div className="container py-8 md:py-12 space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
        <div>
          <div className="flex items-center space-x-2.5 mb-1.5">
            <div className="w-12 h-12 bg-gradient-gaming rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-2">
                ⚡ Google Gemini <span className="gradient-primary bg-clip-text text-transparent">AI Studio</span>
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground">
                Engineered for game developers, 3D artists &amp; YouTube creators. Powered by official Gemini 2.5 Flash.
              </p>
            </div>
          </div>
        </div>

        {/* Gemini Service Status & Key Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge 
            variant="outline" 
            className={`text-xs py-1 px-2.5 gap-1.5 ${
              apiOnline 
                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30" 
                : "bg-amber-500/10 text-amber-500 border-amber-500/30"
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${apiOnline ? "bg-emerald-400" : "bg-amber-400"} opacity-75`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${apiOnline ? "bg-emerald-500" : "bg-amber-500"}`} />
            </span>
            <span>Gemini 2.5 Flash Online</span>
          </Badge>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowKeyInput(!showKeyInput)}
            className="text-xs h-8 border-primary/30"
          >
            <Key className="mr-1.5 h-3.5 w-3.5 text-primary" />
            {customApiKey ? "Custom Key Active" : "Free AI Studio Key"}
          </Button>
        </div>
      </div>

      {/* Free Google AI Studio Key Drawer */}
      {showKeyInput && (
        <Card className="border-primary/40 bg-card/90 backdrop-blur p-4 space-y-3 animate-in fade-in-50">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h3 className="text-xs font-bold flex items-center gap-1.5">
                <Key className="h-4 w-4 text-primary" />
                Provide Your Free Google AI Studio API Key (Optional)
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Leave blank to use TradeWave's shared Gemini 2.5 Flash infrastructure, or enter your own free key from Google AI Studio.
              </p>
            </div>
            <a 
              href="https://aistudio.google.com/app/apikey" 
              target="_blank" 
              rel="noreferrer"
              className="text-xs text-primary hover:underline flex items-center gap-1 shrink-0 font-semibold"
            >
              Get Free Key at aistudio.google.com
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <div className="flex gap-2">
            <Input
              type="password"
              placeholder="AIzaSy..."
              value={customApiKey}
              onChange={(e) => setCustomApiKey(e.target.value)}
              className="text-xs font-mono h-8"
            />
            <Button size="sm" onClick={handleSaveApiKey} className="h-8 text-xs font-bold">
              Save Key
            </Button>
          </div>
        </Card>
      )}

      {/* Generator Studio Layout */}
      <div className="grid lg:grid-cols-12 gap-8">
        {/* Controls Column */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Cpu className="h-4 w-4 text-primary" />
                Select Generation Pipeline
              </CardTitle>
              <CardDescription className="text-xs">
                Fine-tuned prompts optimized for real-time engines and YouTube.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <button
                type="button"
                onClick={() => { setGenerationType("code"); soundFX.playClick(); }}
                className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                  generationType === "code"
                    ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                    : "border-border hover:bg-muted"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Code className="h-5 w-5" />
                  <div>
                    <div className="text-xs font-semibold">C# Unity &amp; UE5 C++</div>
                    <div className="text-[10px] text-muted-foreground font-normal">Game netcode, HLSL shaders &amp; controllers</div>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => { setGenerationType("tutorial"); soundFX.playClick(); }}
                className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                  generationType === "tutorial"
                    ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                    : "border-border hover:bg-muted"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <BookOpen className="h-5 w-5" />
                  <div>
                    <div className="text-xs font-semibold">YouTube Tutorial Script</div>
                    <div className="text-[10px] text-muted-foreground font-normal">20-min masterclasses with timestamps</div>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => { setGenerationType("youtube_seo"); soundFX.playClick(); }}
                className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                  generationType === "youtube_seo"
                    ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                    : "border-border hover:bg-muted"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Youtube className="h-5 w-5 text-red-500" />
                  <div>
                    <div className="text-xs font-semibold">YouTube SEO &amp; Description</div>
                    <div className="text-[10px] text-muted-foreground font-normal">High-CTR titles, chapters, search tags</div>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => { setGenerationType("image"); soundFX.playClick(); }}
                className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                  generationType === "image"
                    ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                    : "border-border hover:bg-muted"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <ImageIcon className="h-5 w-5" />
                  <div>
                    <div className="text-xs font-semibold">3D Concept &amp; Nanite Blueprint</div>
                    <div className="text-[10px] text-muted-foreground font-normal">PBR channel packing &amp; mesh specs</div>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => { setGenerationType("game_design"); soundFX.playClick(); }}
                className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                  generationType === "game_design"
                    ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                    : "border-border hover:bg-muted"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Gamepad2 className="h-5 w-5 text-purple-500" />
                  <div>
                    <div className="text-xs font-semibold">Game Loops &amp; Economics</div>
                    <div className="text-[10px] text-muted-foreground font-normal">Token sink design, mechanics, balance</div>
                  </div>
                </div>
              </button>
            </CardContent>
          </Card>

          {/* Quick Prompts */}
          <Card className="border-border bg-card p-4 space-y-3">
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              One-Click Quick Prompts
            </div>
            <div className="space-y-1.5 text-xs">
              <button
                onClick={() => {
                  setGenerationType("code")
                  setPrompt("Smooth third-person character movement controller with ground check and slope sliding in Unity C#")
                  soundFX.playClick()
                }}
                className="w-full text-left p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground line-clamp-2"
              >
                🎮 "Third-person character controller with slope physics in Unity C#"
              </button>
              <button
                onClick={() => {
                  setGenerationType("tutorial")
                  setPrompt("Complete 20-minute YouTube tutorial script for building a stylized cyberpunk neon lamp in Blender 4.2 with Nanite export")
                  soundFX.playClick()
                }}
                className="w-full text-left p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground line-clamp-2"
              >
                📹 "20-minute tutorial script for Blender cyberpunk asset"
              </button>
              <button
                onClick={() => {
                  setGenerationType("youtube_seo")
                  setPrompt("Unreal Engine 5.5 Nanite Geometry Virtualization and Lumen dynamic lighting tutorial")
                  soundFX.playClick()
                }}
                className="w-full text-left p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground line-clamp-2"
              >
                🎬 "YouTube SEO, viral titles & description for UE5 Nanite guide"
              </button>
              <button
                onClick={() => {
                  setGenerationType("image")
                  setPrompt("Modular sci-fi laboratory airlock with hydraulic pistons, packed PBR channels (Metallic/Roughness/AO), and 40K triangle budget")
                  soundFX.playClick()
                }}
                className="w-full text-left p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground line-clamp-2"
              >
                🗿 "Modular sci-fi airlock 3D Nanite specification"
              </button>
            </div>
          </Card>
        </div>

        {/* Prompt Input & Output Workspace */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center justify-between">
                <span>Prompt Input</span>
                <span className="text-xs font-mono text-muted-foreground font-normal">
                  Target: {generationType.replace("_", " ").toUpperCase()}
                </span>
              </CardTitle>
              <CardDescription className="text-xs">
                Detail your target game engine, artistic constraints, or YouTube audience pacing.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Describe what you want generated... (e.g. A modular inventory and crafting script with weight calculation for Unity)"
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="text-sm font-sans resize-y"
              />

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span>Google Gemini 2.5 Flash Engine Active</span>
                </div>
                <Button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="bg-primary text-primary-foreground font-bold shadow-md shadow-primary/20 w-full sm:w-auto"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Streaming from Gemini...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      Generate with Gemini
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results Workspace */}
          {result && (
            <Card className="border-primary/40 shadow-xl bg-card overflow-hidden animate-in fade-in-50">
              <CardHeader className="pb-3 border-b bg-muted/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <CardTitle className="text-base font-bold">{result.title}</CardTitle>
                    <Badge variant="secondary" className="text-[10px] font-mono">
                      {result.model}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-3 text-xs text-muted-foreground font-mono">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {(result.durationMs / 1000).toFixed(2)}s
                    </span>
                    <span>•</span>
                    <span>{result.estimatedTokens} tokens</span>
                    <span>•</span>
                    <span>{result.charCount.toLocaleString()} chars</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopy} className="h-8 text-xs">
                    {copied ? (
                      <>
                        <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-500" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="mr-1.5 h-3.5 w-3.5" />
                        Copy
                      </>
                    )}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownload} className="h-8 text-xs">
                    <Download className="mr-1.5 h-3.5 w-3.5 text-primary" />
                    .{result.fileExtension} File
                  </Button>
                  <Button size="sm" onClick={handleExportAsTutorial} className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                    <GraduationCap className="mr-1.5 h-3.5 w-3.5" />
                    Publish Course
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-4">
                <div className="relative">
                  <div className="absolute top-2 right-2 text-[10px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                    {result.fileExtension.toUpperCase()}
                  </div>
                  <pre className="p-4 bg-muted/80 dark:bg-black/80 rounded-xl overflow-x-auto text-xs font-mono leading-relaxed max-h-[500px] select-all border border-border">
                    {result.content}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
