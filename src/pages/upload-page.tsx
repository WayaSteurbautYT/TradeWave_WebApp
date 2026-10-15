import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { MockStore } from "@/data/mockStore"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { showToast } from "@/components/ui/toaster"
import { useNavigate } from "react-router-dom"
import { 
  Upload, 
  Youtube, 
  CheckCircle2, 
  Coins, 
  Film, 
  FolderArchive,
  Trophy,
  AlertCircle
} from "lucide-react"

export function UploadPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [contentType, setContentType] = useState<any>("3d_model")
  const [category, setCategory] = useState("gaming")
  const [price, setPrice] = useState<number>(150)
  const [tags, setTags] = useState("Unreal Engine, Blender, Sci-Fi")
  const [tutorialUrl, setTutorialUrl] = useState("")
  const [filesUrl, setFilesUrl] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !description.trim()) {
      showToast({
        title: "Missing Information",
        description: "Please fill out title and description.",
        variant: "destructive"
      })
      return
    }

    if (!tutorialUrl.trim()) {
      showToast({
        title: "Tutorial Required!",
        description: "WayaCreate requires every product to include a companion breakdown video tutorial.",
        variant: "destructive"
      })
      return
    }

    MockStore.addContent({
      creator_id: user?.id || "usr_waya_001",
      creator_name: user?.display_name || "Waya Steurbaut",
      creator_avatar: user?.avatar_url,
      title,
      description,
      content_type: contentType,
      category,
      price: Number(price),
      download_price: Number(price),
      rating: 5.0,
      review_count: 1,
      views_count: 10,
      likes_count: 2,
      download_count: 0,
      tags: tags.split(",").map(t => t.trim()).filter(Boolean),
      rights: ["view", "download", "commercial"],
      tutorial_included: true,
      tutorial_url: tutorialUrl,
      file_url: filesUrl || "https://example.com/assets.zip",
      duration: 1800,
    })

    showToast({
      title: "Content Published!",
      description: `"${title}" is now available on the WayaCreate marketplace.`,
      variant: "success"
    })

    navigate("/marketplace")
  }

  return (
    <div className="container py-8 md:py-12 max-w-3xl space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-gradient-gaming rounded-xl text-white">
            <Upload className="h-5 w-5" />
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Publish Digital Asset / Course
          </h1>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Share your 3D models, shaders, scripts, or video presets with the WayaCreate community.
        </p>
      </div>

      <Card className="border-border bg-card p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold">Title:</label>
            <Input
              placeholder="e.g. Modular Sci-Fi Corridor Pack (40+ Meshes & PBR Materials)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Content Type:</label>
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm"
              >
                <option value="3d_model">3D Model / Asset Pack</option>
                <option value="code">Code / Engine Script</option>
                <option value="template">Template / Project File</option>
                <option value="audio">Audio / Sound Effects</option>
                <option value="course">Course / Masterclass</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Price (in Credits, 0 = Free):</label>
              <Input
                type="number"
                min={0}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold">Tags (comma-separated):</label>
            <Input
              placeholder="Blender, Unreal Engine 5, PBR, Shaders"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold">Description &amp; Specifications:</label>
            <Textarea
              placeholder="Detail vertex counts, texture resolutions, compatibility, and file formats..."
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          {/* Tutorial Requirement Banner */}
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-3">
            <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
              <Trophy className="h-4 w-4" />
              <span>Mandatory Companion Tutorial (WayaCreate Rule)</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Every item sold on WayaCreate must include a step-by-step video breakdown tutorial so customers can learn how it was constructed and customize it.
            </p>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Video Tutorial URL (YouTube, Vimeo or Unlisted):</label>
              <Input
                placeholder="https://youtube.com/watch?v=..."
                value={tutorialUrl}
                onChange={(e) => setTutorialUrl(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold">Downloadable Package Link (ZIP, Google Drive or CDN):</label>
            <Input
              placeholder="https://drive.google.com/file/..."
              value={filesUrl}
              onChange={(e) => setFilesUrl(e.target.value)}
            />
          </div>

          <div className="pt-2 flex justify-end">
            <Button type="submit" size="lg" className="bg-primary text-primary-foreground font-semibold">
              <Upload className="mr-2 h-4 w-4" />
              Publish to Marketplace
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
