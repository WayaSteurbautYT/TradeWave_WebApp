import { useState, useRef } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { MockStore } from "@/data/mockStore"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { showToast } from "@/components/ui/toaster"
import { useNavigate, Link } from "react-router-dom"
import confetti from "canvas-confetti"
import { 
  Upload, 
  Youtube, 
  CheckCircle2, 
  Coins, 
  Film, 
  FolderArchive,
  Trophy,
  AlertCircle,
  Sparkles,
  FileUp,
  Layers,
  ExternalLink,
  Eye,
  RefreshCw,
  Play,
  FileCode,
  Box,
  Music,
  Scale
} from "lucide-react"

export function UploadPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  // Form State
  const [title, setTitle] = useState("Sci-Fi Cyberpunk Corridor Pack (40+ Meshes & PBR)")
  const [description, setDescription] = useState(
    "Production-grade modular environment kit optimized for Unreal Engine 5 Lumen and Unity URP. Features 4K PBR textures, clean quad-dominant geometry, LOD0-LOD3 states, and pre-assembled master prefabs with physics colliders."
  )
  const [contentType, setContentType] = useState<"3d_model" | "code" | "template" | "audio" | "course">("3d_model")
  const [category, setCategory] = useState("gaming")
  const [price, setPrice] = useState<number>(180)
  const [tags, setTags] = useState("Blender, Unreal Engine 5, Modular, Sci-Fi, PBR")
  const [tutorialUrl, setTutorialUrl] = useState("https://youtube.com/watch?v=demo_waya_cyberpunk")
  const [tutorialDuration, setTutorialDuration] = useState("28:45")
  const [tutorialOutline, setTutorialOutline] = useState(
    "1. Modular Grid & Poly Budget Planning\n2. Efficient UV Packing & Trim Sheet Construction\n3. Material Graph Setup in UE5\n4. Collision Setup & Performance Profiling"
  )
  const [thumbnailUrl, setThumbnailUrl] = useState(
    "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80"
  )
  const [filesUrl, setFilesUrl] = useState("https://storage.wayacreate.com/packages/scifi_corridor_v2.zip")

  // File Upload Demo State
  const [uploadedFileName, setUploadedFileName] = useState("scifi_modular_corridor_ue5.zip")
  const [uploadedFileSize, setUploadedFileSize] = useState("142.8 MB")
  const [uploadProgress, setUploadProgress] = useState(100)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // AI Assistant State
  const [aiPrompt, setAiPrompt] = useState("")
  const [isAiGenerating, setIsAiGenerating] = useState(false)

  // YouTube Importer State
  const [ytUrlInput, setYtUrlInput] = useState("")
  const [isYtImporting, setIsYtImporting] = useState(false)

  // Handle file select simulation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadProgress(15)
    setUploadedFileName(file.name)
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1)
    setUploadedFileSize(`${sizeInMb} MB`)

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsUploading(false)
          showToast({
            title: "Asset Package Processed!",
            description: `${file.name} (${sizeInMb} MB) uploaded and checksum verified.`,
            variant: "success",
          })
          return 100
        }
        return prev + 25
      })
    }, 200)
  }

  // Handle AI Auto-Fill
  const handleAiAutoFill = async (presetConcept?: string) => {
    const concept = presetConcept || aiPrompt || title || "Game Asset Pack"
    setIsAiGenerating(true)
    await new Promise((r) => setTimeout(r, 600))

    const meta = MockStore.generateContentMetadata(concept)
    setTitle(meta.title)
    setDescription(meta.description)
    setTags(meta.tags.join(", "))
    setPrice(meta.price)
    setTutorialOutline(meta.tutorialOutline)

    setIsAiGenerating(false)
    showToast({
      title: "AI Metadata Generated! ✨",
      description: "Title, specs, tags, and tutorial outline automatically filled.",
      variant: "success",
    })
  }

  // Handle YouTube Quick Import
  const handleYouTubeImport = async () => {
    if (!ytUrlInput.trim()) {
      showToast({
        title: "URL Required",
        description: "Please enter a valid YouTube video or tutorial link.",
        variant: "destructive",
      })
      return
    }

    setIsYtImporting(true)
    await new Promise((r) => setTimeout(r, 500))

    const imported = MockStore.importFromYouTube(ytUrlInput)
    setTutorialUrl(ytUrlInput)
    if (!title || title.includes("Sci-Fi")) {
      setTitle(imported.title)
    }
    setThumbnailUrl(imported.thumbnailUrl)
    setTags(imported.tags.join(", "))
    setIsYtImporting(false)

    showToast({
      title: "YouTube Tutorial Linked!",
      description: `Imported "${imported.title}" from YouTube.`,
      variant: "success",
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !description.trim()) {
      showToast({
        title: "Missing Information",
        description: "Please fill out title and description.",
        variant: "destructive",
      })
      return
    }

    if (!tutorialUrl.trim()) {
      showToast({
        title: "Tutorial Required!",
        description: "WayaCreate requires every product to include a companion breakdown video tutorial.",
        variant: "destructive",
      })
      return
    }

    MockStore.addContent({
      creator_id: user?.id || "usr_waya_001",
      creator_name: user?.display_name || "Waya Steurbaut",
      creator_avatar: user?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      title,
      description,
      content_type: contentType,
      category,
      price: Number(price),
      download_price: Number(price),
      rating: 5.0,
      review_count: 1,
      views_count: 24,
      likes_count: 4,
      download_count: 0,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      rights: ["view", "download", "commercial"],
      tutorial_included: true,
      tutorial_url: tutorialUrl,
      file_url: filesUrl || "https://storage.wayacreate.com/packages/asset_bundle.zip",
      thumbnail_url: thumbnailUrl,
      duration: 1800,
    })

    try {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } })
    } catch (e) {}

    showToast({
      title: "Content Published to Marketplace! 🚀",
      description: `"${title}" is now available for purchase and download.`,
      variant: "success",
    })

    navigate("/marketplace")
  }

  return (
    <div className="container py-8 md:py-12 max-w-5xl space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-gradient-gaming rounded-xl text-white">
              <Upload className="h-5 w-5" />
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Publish Creator Asset / Tutorial
            </h1>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            Upload 3D models, shaders, scripts, or project files. Every listing includes a video breakdown tutorial!
          </p>
        </div>

        <Link to="/rules">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs border-primary/30 text-primary">
            <Scale className="h-3.5 w-3.5" />
            <span>Platform Rules & Escrow</span>
          </Button>
        </Link>
      </div>

      {/* AI Assistant Quick Tool Banner */}
      <Card className="border-primary/30 bg-primary/5 p-4 md:p-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-primary font-bold text-sm">
              <Sparkles className="h-4 w-4" />
              <span>WayaCreate AI Metadata Copilot</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Type a quick concept or pick an idea to generate title, technical specs, tags, and tutorial outline automatically:
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {["Stylized Sci-Fi Props", "Water & Caustics Shader", "FPS Character Controller"].map((concept) => (
              <Button
                key={concept}
                size="sm"
                variant="outline"
                className="text-[11px] h-7 bg-background"
                onClick={() => handleAiAutoFill(concept)}
                disabled={isAiGenerating}
              >
                {concept}
              </Button>
            ))}
            <Button
              size="sm"
              className="text-xs h-8 bg-primary text-primary-foreground gap-1.5"
              onClick={() => handleAiAutoFill()}
              disabled={isAiGenerating}
            >
              {isAiGenerating ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  Generate with AI
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Form (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border bg-card p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Package Upload Dropzone */}
              <div className="space-y-2">
                <label className="text-xs font-semibold flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <FileUp className="h-3.5 w-3.5 text-primary" />
                    Asset Package (.ZIP, .BLEND, .FBX, .UNITYPACKAGE)
                  </span>
                  <span className="text-[11px] text-muted-foreground">Max 2GB per package</span>
                </label>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".zip,.rar,.blend,.fbx,.obj,.gltf,.glb,.unitypackage,.mp4"
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border hover:border-primary/50 transition-colors rounded-xl p-5 text-center cursor-pointer bg-muted/20 hover:bg-muted/40 space-y-2"
                >
                  <FolderArchive className="h-8 w-8 mx-auto text-primary opacity-80" />
                  <div className="text-xs font-semibold">
                    Click to select digital package file or drag &amp; drop
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Supports Blender, Maya, Unreal Engine, Unity, GLTF, FBX, and script archives
                  </div>
                </div>

                {/* Upload Status */}
                {uploadedFileName && (
                  <div className="p-3 bg-muted/40 rounded-lg border space-y-2 text-xs">
                    <div className="flex items-center justify-between font-semibold">
                      <div className="flex items-center space-x-2 truncate">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                        <span className="truncate">{uploadedFileName}</span>
                      </div>
                      <span className="text-muted-foreground text-[11px] shrink-0">{uploadedFileSize}</span>
                    </div>
                    {isUploading ? (
                      <Progress value={uploadProgress} className="h-1.5" />
                    ) : (
                      <div className="flex items-center justify-between text-[11px] text-emerald-600 dark:text-emerald-400">
                        <span>Ready for delivery to buyers via instant cloud download.</span>
                        <span className="font-bold">100% Ready</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Listing Title:</label>
                <Input
                  placeholder="e.g. Modular Sci-Fi Corridor Pack (40+ Meshes & PBR)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              {/* Type & Category & Price */}
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Asset Category:</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="gaming">Gaming &amp; 3D</option>
                    <option value="development">Code &amp; Shaders</option>
                    <option value="design">Design &amp; UI</option>
                    <option value="content">Content &amp; Video</option>
                    <option value="audio">Audio &amp; SFX</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Asset Type:</label>
                  <select
                    value={contentType}
                    onChange={(e) => setContentType(e.target.value as any)}
                    className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="3d_model">3D Model / Meshes</option>
                    <option value="code">Engine Script / Shader</option>
                    <option value="template">Project Template</option>
                    <option value="audio">Soundtrack / SFX Pack</option>
                    <option value="course">Masterclass Course</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold flex items-center justify-between">
                    <span>Price (Credits):</span>
                    <span className="text-[10px] text-muted-foreground font-normal">
                      ≈ ${(price * 0.1).toFixed(2)} USD
                    </span>
                  </label>
                  <div className="relative">
                    <Coins className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-primary" />
                    <Input
                      type="number"
                      min={0}
                      step={10}
                      className="pl-8"
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Tags (comma-separated):</label>
                <Input
                  placeholder="Blender, Unreal Engine 5, PBR, Shaders, Low Poly"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Description &amp; Technical Specifications:</label>
                <Textarea
                  placeholder="Detail vertex counts, texture resolutions, compatibility, LOD states, and software requirements..."
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              {/* MANDATORY TUTORIAL SECTION */}
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                    <Trophy className="h-4 w-4" />
                    <span>Mandatory Companion Tutorial (Platform Rule)</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] bg-emerald-500/20 text-emerald-600 border-emerald-500/40">
                    Rule Enforced
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Every product listed on WayaCreate must include a step-by-step video breakdown showing how you made it, how to customize materials, and how to import it into game engines.
                </p>

                {/* YouTube Quick Importer Tool */}
                <div className="space-y-1.5 bg-background/80 p-3 rounded-lg border">
                  <div className="flex items-center space-x-1.5 text-xs font-semibold">
                    <Youtube className="h-4 w-4 text-red-500" />
                    <span>Quick Import from YouTube:</span>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="https://youtube.com/watch?v=..."
                      value={ytUrlInput}
                      onChange={(e) => setYtUrlInput(e.target.value)}
                      className="h-8 text-xs"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs shrink-0"
                      onClick={handleYouTubeImport}
                      disabled={isYtImporting}
                    >
                      {isYtImporting ? "Importing..." : "Import Video"}
                    </Button>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">Tutorial Video URL:</label>
                    <Input
                      placeholder="https://youtube.com/watch?v=..."
                      value={tutorialUrl}
                      onChange={(e) => setTutorialUrl(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">Video Duration:</label>
                    <Input
                      placeholder="e.g. 24:15"
                      value={tutorialDuration}
                      onChange={(e) => setTutorialDuration(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Tutorial Curriculum Outline:</label>
                  <Textarea
                    placeholder="1. Asset Blueprint & Poly Budget\n2. Efficient UV Unwrapping\n3. Shaders in Engine..."
                    rows={3}
                    value={tutorialOutline}
                    onChange={(e) => setTutorialOutline(e.target.value)}
                  />
                </div>
              </div>

              {/* Thumbnail URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Preview / Cover Thumbnail Image URL:</label>
                <Input
                  placeholder="https://images.unsplash.com/photo-..."
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <Link to="/rules" className="text-xs text-muted-foreground hover:underline flex items-center gap-1">
                  <Scale className="h-3.5 w-3.5" />
                  <span>Read Creator Monetization & Escrow Rules</span>
                </Link>

                <Button type="submit" size="lg" className="bg-primary text-primary-foreground font-semibold">
                  <Upload className="mr-2 h-4 w-4" />
                  Publish to Marketplace
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Live Marketplace Preview Column (1 col) */}
        <div className="space-y-6">
          <div className="sticky top-20 space-y-4">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <Eye className="h-4 w-4 text-primary" />
              <span>Live Marketplace Preview</span>
            </div>

            {/* Preview Card */}
            <Card className="overflow-hidden border border-border bg-card shadow-md">
              <div className="relative aspect-video bg-muted overflow-hidden">
                <img
                  src={thumbnailUrl || "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80"}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 flex gap-1">
                  <Badge variant="secondary" className="text-[10px] capitalize bg-background/90 backdrop-blur">
                    {contentType.replace("_", " ")}
                  </Badge>
                  <Badge className="text-[10px] bg-emerald-500 text-white font-semibold flex items-center gap-1">
                    <Play className="h-2.5 w-2.5 fill-current" />
                    <span>Tutorial Included</span>
                  </Badge>
                </div>
                <div className="absolute bottom-2 right-2">
                  <Badge className="bg-background/90 text-foreground font-bold text-xs backdrop-blur border">
                    {price} Credits
                  </Badge>
                </div>
              </div>

              <CardContent className="p-4 space-y-3">
                <h3 className="font-bold text-sm line-clamp-2 leading-snug">
                  {title || "Untitled Digital Product"}
                </h3>

                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {description || "No description provided yet."}
                </p>

                <div className="flex flex-wrap gap-1">
                  {tags.split(",").slice(0, 3).map((tag, i) => (
                    <Badge key={i} variant="outline" className="text-[10px] py-0">
                      {tag.trim()}
                    </Badge>
                  ))}
                </div>

                <div className="pt-2 border-t flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <img
                      src={user?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
                      className="h-6 w-6 rounded-full object-cover"
                      alt={user?.display_name || "Creator"}
                    />
                    <span className="font-semibold text-xs">{user?.display_name || "Waya Steurbaut"}</span>
                  </div>
                  <div className="text-primary font-bold text-xs">
                    ★ 5.0 (New)
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Tips */}
            <Card className="border-border bg-card p-4 space-y-2 text-xs">
              <h4 className="font-bold text-foreground">💡 Top Seller Recommendations:</h4>
              <ul className="space-y-1.5 text-muted-foreground text-[11px] list-disc list-inside">
                <li>Include at least 1 engine-ready file (.blend or .fbx).</li>
                <li>Ensure companion videos are recorded at 1080p60.</li>
                <li>Creators earn 85% of all credit purchases immediately upon escrow release.</li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
