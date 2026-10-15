import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { showToast } from "@/components/ui/toaster"
import { soundFX } from "@/lib/soundEffects"
import { 
  Download, 
  Smartphone, 
  Monitor, 
  Gamepad2, 
  CheckCircle2, 
  ExternalLink, 
  Terminal, 
  Copy, 
  Check, 
  Search, 
  Globe, 
  ShieldCheck, 
  Share2, 
  Sparkles, 
  Tv, 
  Flame,
  Zap,
  Info
} from "lucide-react"

export function AppsPage() {
  const [deferredPrompt, setDeferredPrompt] = useState<unknown>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [installed, setInstalled] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"install" | "playstore" | "steam" | "growth">("install")
  const [gamepadMode, setGamepadMode] = useState(false)

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstall)

    // Check if running in standalone mode already
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true)
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall)
    }
  }, [])

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      const promptEvent = deferredPrompt as { prompt: () => void; userChoice: Promise<{ outcome: string }> }
      promptEvent.prompt()
      const choice = await promptEvent.userChoice
      if (choice.outcome === "accepted") {
        soundFX.playFanfare()
        setInstalled(true)
        showToast({
          title: "App Installed!",
          description: "WayaCreate has been added to your device home screen or applications menu.",
          variant: "success"
        })
      }
      setDeferredPrompt(null)
    } else {
      // Manual instruction guidance
      soundFX.playSuccess()
      showToast({
        title: "Install WayaCreate",
        description: "Click the install icon in your browser address bar (Desktop) or 'Add to Home Screen' (Mobile Safari/Chrome).",
        variant: "info"
      })
    }
  }

  const copyCode = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedCode(id)
    soundFX.playSuccess()
    showToast({
      title: "Command Copied!",
      description: "Copied to your clipboard.",
      variant: "success"
    })
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const toggleGamepadMode = () => {
    const next = !gamepadMode
    setGamepadMode(next)
    soundFX.playCoin()
    showToast({
      title: next ? "Steam Deck / Couch Mode Activated" : "Standard Mouse & Touch Mode",
      description: next ? "Optimized with high-contrast borders and controller-friendly focus targets." : "Reverted to desktop UI scale.",
      variant: "info"
    })
  }

  const bubblewrapCommand = `npm install -g @bubblewrap/cli
bubblewrap init --manifest="https://ais-dev-5doedzzf4tfjmvnakzfsjv-77852212152.europe-west2.run.app/manifest.webmanifest"
bubblewrap build`

  const assetLinksJson = `[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.wayacreate.app",
    "sha256_cert_fingerprints": ["14:6D:E9:83:C5:73:06:50:D8:EE:B9:95:2F:34:FC:64:16:A0:83:42:E6:1D:BE:A8:8A:04:96:B2:3F:CF:44:E5"]
  }
}]`

  return (
    <div className={`container py-8 md:py-12 space-y-8 ${gamepadMode ? "max-w-6xl ring-4 ring-emerald-500/40 rounded-3xl p-4 my-4" : ""}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2.5 mb-2">
            <div className="p-2.5 bg-gradient-gaming rounded-xl text-white shadow-lg shadow-primary/20">
              <Download className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">
                Cross-Platform Desktop, Mobile &amp; Store Hub
              </h1>
              <p className="text-sm text-muted-foreground">
                Install WayaCreate on Windows, macOS, Android, iOS, and explore our Google Play &amp; Steam Deck distribution readiness.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant={gamepadMode ? "default" : "outline"}
            onClick={toggleGamepadMode}
            className={`text-xs gap-1.5 ${gamepadMode ? "bg-emerald-600 text-white" : ""}`}
          >
            <Gamepad2 className="h-4 w-4" />
            {gamepadMode ? "Steam Deck Couch Mode: ON" : "Steam Deck Couch Mode"}
          </Button>

          <Button
            size="sm"
            onClick={handleInstallClick}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs"
          >
            <Download className="mr-1.5 h-4 w-4" />
            {installed ? "App Installed ✓" : "Install App on Device"}
          </Button>
        </div>
      </div>

      {/* Hero Install Cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        {/* Desktop Card */}
        <Card className="border-border bg-card p-6 space-y-4 hover:border-primary/50 transition-all flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center">
              <Monitor className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-base">Desktop App (PC &amp; Mac)</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Install as a standalone desktop window on Windows 11, macOS, and Linux with full hardware video acceleration and live streaming support.
              </p>
            </div>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>Runs without browser tabs or URL bars</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>Native webcam &amp; microphone streaming access</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>Fast asset drag-and-drop file uploading</span>
              </li>
            </ul>
          </div>

          <Button size="sm" onClick={handleInstallClick} className="w-full text-xs font-semibold">
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Install on Desktop
          </Button>
        </Card>

        {/* Mobile App Card */}
        <Card className="border-border bg-card p-6 space-y-4 hover:border-primary/50 transition-all flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center">
              <Smartphone className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-base">Mobile App (Android &amp; iOS)</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Install directly to your mobile home screen. Fast touch gestures, bottom sheet drawers, and instant offline cache.
              </p>
            </div>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>Zero download wait &amp; lightweight footprint</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>Full screen touch navigation &amp; responsive UI</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>Daily Faucet push alerts &amp; live chat notifications</span>
              </li>
            </ul>
          </div>

          <Button size="sm" variant="outline" onClick={handleInstallClick} className="w-full text-xs font-semibold">
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Add to Phone
          </Button>
        </Card>

        {/* Steam Deck Card */}
        <Card className="border-border bg-card p-6 space-y-4 hover:border-primary/50 transition-all flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-12 h-12 bg-purple-500/10 text-purple-500 rounded-2xl flex items-center justify-center">
              <Gamepad2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-base">Steam Deck &amp; Couch Gaming</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Optimized for handheld consoles (Steam Deck, ROG Ally, Legion Go) at 1280x800 resolution with controller gamepad mode.
              </p>
            </div>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>1280x800 native 16:10 resolution verified</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>High-contrast visual targets for handheld screen</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>Watch game dev streams while playing or modeling</span>
              </li>
            </ul>
          </div>

          <Button size="sm" variant="secondary" onClick={toggleGamepadMode} className="w-full text-xs font-semibold">
            <Gamepad2 className="mr-1.5 h-3.5 w-3.5 text-purple-500" />
            Toggle Handheld Mode
          </Button>
        </Card>
      </div>

      {/* Strategic Analysis & Store Readiness Sections */}
      <div className="space-y-4">
        {/* Navigation Tabs */}
        <div className="flex border-b text-xs font-semibold gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("install")}
            className={`px-4 py-2 border-b-2 transition-colors ${
              activeTab === "install"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Why Will They Use It?
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("growth")}
            className={`px-4 py-2 border-b-2 transition-colors ${
              activeTab === "growth"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            How Will They Find It?
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("playstore")}
            className={`px-4 py-2 border-b-2 transition-colors ${
              activeTab === "playstore"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Google Play Store (TWA) Readiness
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("steam")}
            className={`px-4 py-2 border-b-2 transition-colors ${
              activeTab === "steam"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Steam Store &amp; Deck Readiness
          </button>
        </div>

        {/* Tab 1: Why Will They Use It */}
        {activeTab === "install" && (
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="border-border bg-card p-5 space-y-2">
              <span className="font-black text-sm text-foreground flex items-center gap-1.5">
                <Flame className="h-4 w-4 text-amber-500" />
                1. Free Community Package
              </span>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Most creator platforms lock everything behind high commissions or mandatory subscriptions. WayaCreate offers a <strong>$0 Free Forever Community Tier</strong> where anyone can watch streams, chat, claim daily tokens, and sell with no upfront listing fees.
              </p>
            </Card>

            <Card className="border-border bg-card p-5 space-y-2">
              <span className="font-black text-sm text-foreground flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-purple-500" />
                2. Mandatory Tutorial Rule
              </span>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Assets aren't just bare files. Every seller includes a video breakdown explaining how the 3D model, shader, or code was created and how to configure it. Buyers learn while building their games.
              </p>
            </Card>

            <Card className="border-border bg-card p-5 space-y-2">
              <span className="font-black text-sm text-foreground flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                3. Milestone Smart Escrow
              </span>
              <p className="text-xs text-muted-foreground leading-relaxed">
                No chargeback scams for creators, and no broken deliverable heartbreak for buyers. Payments are held in escrow and released milestone by milestone upon client inspection.
              </p>
            </Card>
          </div>
        )}

        {/* Tab 2: How Will They Find It */}
        {activeTab === "growth" && (
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="border-border bg-card p-5 space-y-2">
              <span className="font-black text-sm text-foreground flex items-center gap-1.5">
                <Search className="h-4 w-4 text-red-500" />
                YouTube Creator Funnel
              </span>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Creators link their WayaCreate tutorials in YouTube video descriptions: <em>"Download project source files and join the live studio stream at WayaCreate"</em>.
              </p>
            </Card>

            <Card className="border-border bg-card p-5 space-y-2">
              <span className="font-black text-sm text-foreground flex items-center gap-1.5">
                <Share2 className="h-4 w-4 text-indigo-500" />
                Discord Guild Bot
              </span>
              <p className="text-xs text-muted-foreground leading-relaxed">
                WayaCreate Discord Bot automatically announces when top creators go live or drop new asset packs into community servers, driving instant viral traffic.
              </p>
            </Card>

            <Card className="border-border bg-card p-5 space-y-2">
              <span className="font-black text-sm text-foreground flex items-center gap-1.5">
                <Globe className="h-4 w-4 text-emerald-500" />
                SEO Schema.org Metadata
              </span>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Structured JSON-LD schemas for <code>3DModel</code>, <code>Course</code>, and <code>SoftwareApplication</code> index pages directly in Google Search with rich star ratings and pricing previews.
              </p>
            </Card>
          </div>
        )}

        {/* Tab 3: Google Play Store Readiness */}
        {activeTab === "playstore" && (
          <div className="space-y-4">
            <Card className="border-border bg-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base">Google Play Store Trusted Web Activity (TWA)</h3>
                  <p className="text-xs text-muted-foreground">
                    Google officially supports publishing PWAs to the Google Play Store using Trusted Web Activity (TWA). This gives you an official APK/AAB package with Google Play billing and store listing.
                  </p>
                </div>
                <Badge className="bg-emerald-600 text-white font-mono text-xs">
                  100% PWA Compliant
                </Badge>
              </div>

              {/* Step 1: Bubblewrap */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-foreground">1. Generate Android Project via Bubblewrap CLI:</span>
                  <button
                    onClick={() => copyCode(bubblewrapCommand, "bubblewrap")}
                    className="text-primary hover:underline font-semibold flex items-center gap-1 text-[11px]"
                  >
                    {copiedCode === "bubblewrap" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    Copy Terminal Command
                  </button>
                </div>
                <pre className="p-3 bg-muted/80 rounded-xl font-mono text-[11px] overflow-x-auto text-foreground/90 border">
                  {bubblewrapCommand}
                </pre>
              </div>

              {/* Step 2: Digital Asset Links */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-foreground">2. Android Digital Asset Links (assetlinks.json):</span>
                  <button
                    onClick={() => copyCode(assetLinksJson, "assetlinks")}
                    className="text-primary hover:underline font-semibold flex items-center gap-1 text-[11px]"
                  >
                    {copiedCode === "assetlinks" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    Copy JSON
                  </button>
                </div>
                <pre className="p-3 bg-muted/80 rounded-xl font-mono text-[11px] overflow-x-auto text-foreground/90 border">
                  {assetLinksJson}
                </pre>
              </div>
            </Card>
          </div>
        )}

        {/* Tab 4: Steam Store Readiness */}
        {activeTab === "steam" && (
          <div className="space-y-4">
            <Card className="border-border bg-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base">Steam Store &amp; Steam Deck Packaging</h3>
                  <p className="text-xs text-muted-foreground">
                    You can distribute developer tools, asset suites, and game creation utilities on Steam (under Software &gt; Game Development).
                  </p>
                </div>
                <Badge className="bg-purple-600 text-white font-mono text-xs">
                  Steam Deck Verified Ready
                </Badge>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 bg-muted/30 rounded-xl space-y-2 border">
                  <span className="font-bold text-foreground flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    Steam Deck Compatibility Checklist
                  </span>
                  <ul className="space-y-1 text-muted-foreground text-[11px]">
                    <li>• <strong>Resolution:</strong> Fully responsive at 1280x800 16:10 layout.</li>
                    <li>• <strong>Legibility:</strong> Minimum font size 12px for clear readability on handheld screen.</li>
                    <li>• <strong>Input:</strong> D-Pad &amp; Touch navigation supported via Couch Mode.</li>
                    <li>• <strong>Offline:</strong> Service Worker caches all critical UI and offline tutorial guides.</li>
                  </ul>
                </div>

                <div className="p-3.5 bg-muted/30 rounded-xl space-y-2 border">
                  <span className="font-bold text-foreground flex items-center gap-1.5">
                    <Terminal className="h-4 w-4 text-purple-500" />
                    Steam Native Wrapper (Electron / Tauri)
                  </span>
                  <p className="text-muted-foreground text-[11px] leading-relaxed">
                    To release directly on Steamworks, wrap WayaCreate using <strong>Tauri</strong> or <strong>Electron</strong>. This produces a native <code>.exe</code> for Windows and AppImage for SteamOS (Linux) that hooks into the Steam Overlay and Steam Cloud saves.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
