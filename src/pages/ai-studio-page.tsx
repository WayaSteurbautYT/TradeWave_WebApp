import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { MockStore } from "@/data/mockStore"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { showToast } from "@/components/ui/toaster"
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
  Upload,
  RefreshCw
} from "lucide-react"

export function AIStudioPage() {
  const { user } = useAuth()
  const [generationType, setGenerationType] = useState<"code" | "text" | "image" | "tutorial">("code")
  const [prompt, setPrompt] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ title: string; content: string; language?: string } | null>(null)
  const [copied, setCopied] = useState(false)

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      showToast({
        title: "Prompt Required",
        description: "Please enter a description of what you'd like the AI to generate.",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    await new Promise(r => setTimeout(r, 700))

    const generated = MockStore.generateAI(prompt, generationType)
    setResult(generated)
    setLoading(false)

    showToast({
      title: "Generation Complete!",
      description: `Generated ${generationType} output using Gemini AI.`,
      variant: "success"
    })
  }

  const handleCopy = () => {
    if (!result) return
    navigator.clipboard.writeText(result.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    showToast({
      title: "Copied to Clipboard",
      description: "Content is ready to paste into your game editor.",
    })
  }

  return (
    <div className="container py-8 md:py-12 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="flex justify-center mb-2">
          <div className="w-14 h-14 bg-gradient-gaming rounded-2xl flex items-center justify-center shadow-lg">
            <Zap className="h-7 w-7 text-white" />
          </div>
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
          ⚡ WayaCreate{" "}
          <span className="gradient-primary bg-clip-text text-transparent">AI Studio</span>
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Powered by Google Gemini 2.0. Generate C# gameplay mechanics, GLSL shaders, 3D prompt blueprints, and video tutorial outlines in seconds.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Controls Column */}
        <div className="space-y-6">
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">Select Generator</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <button
                type="button"
                onClick={() => setGenerationType("code")}
                className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                  generationType === "code"
                    ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                    : "border-border hover:bg-muted"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Code className="h-5 w-5" />
                  <div>
                    <div className="text-xs font-semibold">C# &amp; Shader Code</div>
                    <div className="text-[10px] text-muted-foreground font-normal">Game mechanics, netcode, logic</div>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setGenerationType("tutorial")}
                className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                  generationType === "tutorial"
                    ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                    : "border-border hover:bg-muted"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <BookOpen className="h-5 w-5" />
                  <div>
                    <div className="text-xs font-semibold">Tutorial Script Generator</div>
                    <div className="text-[10px] text-muted-foreground font-normal">YouTube video outlines &amp; notes</div>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setGenerationType("image")}
                className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                  generationType === "image"
                    ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                    : "border-border hover:bg-muted"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <ImageIcon className="h-5 w-5" />
                  <div>
                    <div className="text-xs font-semibold">3D Concept Prompting</div>
                    <div className="text-[10px] text-muted-foreground font-normal">Asset concepts &amp; aesthetics</div>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setGenerationType("text")}
                className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                  generationType === "text"
                    ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                    : "border-border hover:bg-muted"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5" />
                  <div>
                    <div className="text-xs font-semibold">Creative Brief &amp; Gigs</div>
                    <div className="text-[10px] text-muted-foreground font-normal">Marketplace listing copy &amp; pricing</div>
                  </div>
                </div>
              </button>
            </CardContent>
          </Card>

          {/* Quick Prompts */}
          <Card className="border-border bg-card p-4 space-y-3">
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Example Prompts
            </div>
            <div className="space-y-1.5 text-xs">
              <button
                onClick={() => setPrompt("Smooth third-person character movement controller with ground check and slope sliding in Unity C#")}
                className="w-full text-left p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground line-clamp-2"
              >
                💡 "Smooth character controller with slope sliding in Unity C#"
              </button>
              <button
                onClick={() => setPrompt("Complete 20-minute YouTube tutorial script for building a stylized cyberpunk lamp in Blender 4.2")}
                className="w-full text-left p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground line-clamp-2"
              >
                💡 "20-minute tutorial script for Blender cyberpunk asset"
              </button>
              <button
                onClick={() => setPrompt("Procedural low-poly asteroid generator with customizable noise displacement")}
                className="w-full text-left p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground line-clamp-2"
              >
                💡 "Procedural low-poly asteroid generator with noise"
              </button>
            </div>
          </Card>
        </div>

        {/* Input & Output Column */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">Prompt Input</CardTitle>
              <CardDescription className="text-xs">
                Detail your desired architecture, asset constraints, target game engine, or tutorial pacing.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Describe what you want generated... (e.g. A modular inventory and crafting script with weight calculation for Unity)"
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="text-sm font-sans"
              />

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center space-x-1.5 text-xs text-muted-foreground">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span>Powered by Gemini 2.0 Flash</span>
                </div>
                <Button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="bg-primary text-primary-foreground font-semibold"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      Generate Output
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Result Card */}
          {result && (
            <Card className="border-primary/40 shadow-md bg-card">
              <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold">{result.title}</CardTitle>
                  <CardDescription className="text-xs">Generated Asset Preview</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={handleCopy} className="h-8 text-xs">
                  {copied ? (
                    <>
                      <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-1.5 h-3.5 w-3.5" />
                      Copy Code
                    </>
                  )}
                </Button>
              </CardHeader>
              <CardContent className="p-4">
                <pre className="p-4 bg-muted/60 dark:bg-black/60 rounded-xl overflow-x-auto text-xs font-mono leading-relaxed max-h-[450px]">
                  {result.content}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
