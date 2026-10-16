import { useState, useRef } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { showToast } from "@/components/ui/toaster"
import { soundFX } from "@/lib/soundEffects"
import { useTheme } from "@/components/theme-provider"
import { 
  Settings, 
  Upload, 
  Image as ImageIcon, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  ShieldCheck, 
  Sun, 
  Moon, 
  Cloud, 
  User, 
  Key, 
  RefreshCw,
  Sparkles,
  Youtube,
  Globe,
  Radio,
  Github
} from "lucide-react"

export function SettingsPage() {
  const { user, updateProfile, loginAs } = useAuth()
  const { theme, setTheme } = useTheme()

  // Form Fields
  const [displayName, setDisplayName] = useState(user?.display_name || "")
  const [bio, setBio] = useState(user?.bio || "")
  const [location, setLocation] = useState(user?.location || "")
  const [website, setWebsite] = useState(user?.website || "")
  const [youtubeUrl, setYoutubeUrl] = useState(user?.youtube_channel_url || "")
  const [discordTag, setDiscordTag] = useState(user?.discord_tag || "")
  const [githubHandle, setGithubHandle] = useState(user?.github_handle || "")

  // Images state
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || "")
  const [coverUrl, setCoverUrl] = useState(user?.cover_image_url || "")
  const [avatarInfo, setAvatarInfo] = useState<{ width: number; height: number; sizeMb: number } | null>(null)
  const [bannerInfo, setBannerInfo] = useState<{ sizeMb: number } | null>(null)

  const [saving, setSaving] = useState(false)
  const [copiedId, setCopiedId] = useState(false)

  const avatarInputRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)

  // Avatar upload with strict 2024x2024 max & 15MB max validation
  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 15MB limit check (15 * 1024 * 1024 = 15,728,640 bytes)
    const MAX_AVATAR_BYTES = 15 * 1024 * 1024
    if (file.size > MAX_AVATAR_BYTES) {
      soundFX.playClick()
      showToast({
        title: "Avatar Exceeds 15MB Limit",
        description: `File size is ${(file.size / 1024 / 1024).toFixed(1)}MB. Maximum allowed is 15MB.`,
        variant: "destructive"
      })
      if (avatarInputRef.current) avatarInputRef.current.value = ""
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string
      const img = new Image()
      img.onload = () => {
        // Dimension limit check (2024 x 2024 max)
        if (img.width > 2024 || img.height > 2024) {
          soundFX.playClick()
          showToast({
            title: "Avatar Dimensions Exceed 2024x2024 px",
            description: `Image is ${img.width}x${img.height} px. Maximum resolution allowed is 2024x2024 px.`,
            variant: "destructive"
          })
          if (avatarInputRef.current) avatarInputRef.current.value = ""
          return
        }

        setAvatarUrl(dataUrl)
        setAvatarInfo({
          width: img.width,
          height: img.height,
          sizeMb: parseFloat((file.size / 1024 / 1024).toFixed(2))
        })
        soundFX.playSuccess()
        showToast({
          title: "Avatar Validated & Loaded! 📸",
          description: `${img.width}x${img.height} px • ${(file.size / 1024 / 1024).toFixed(2)}MB (Verified under 2024x2024 / 15MB).`,
          variant: "success"
        })
      }
      img.src = dataUrl
    }
    reader.readAsDataURL(file)
  }

  // Banner upload with strict 25MB max validation
  const handleBannerSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 25MB limit check (25 * 1024 * 1024 = 26,214,400 bytes)
    const MAX_BANNER_BYTES = 25 * 1024 * 1024
    if (file.size > MAX_BANNER_BYTES) {
      soundFX.playClick()
      showToast({
        title: "Banner Exceeds 25MB Limit",
        description: `File size is ${(file.size / 1024 / 1024).toFixed(1)}MB. Maximum allowed is 25MB.`,
        variant: "destructive"
      })
      if (bannerInputRef.current) bannerInputRef.current.value = ""
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string
      setCoverUrl(dataUrl)
      setBannerInfo({
        sizeMb: parseFloat((file.size / 1024 / 1024).toFixed(2))
      })
      soundFX.playSuccess()
      showToast({
        title: "Banner Validated & Loaded! 🖼️",
        description: `Cover banner loaded (${(file.size / 1024 / 1024).toFixed(2)}MB / 25MB max).`,
        variant: "success"
      })
    }
    reader.readAsDataURL(file)
  }

  const handleSaveAll = async () => {
    setSaving(true)
    soundFX.playClick()

    try {
      await updateProfile({
        display_name: displayName.trim() || user?.display_name,
        bio: bio.trim(),
        location: location.trim(),
        website: website.trim(),
        avatar_url: avatarUrl,
        cover_image_url: coverUrl,
        youtube_channel_url: youtubeUrl.trim(),
        discord_tag: discordTag.trim(),
        github_handle: githubHandle.trim(),
      })

      soundFX.playFanfare()
      showToast({
        title: "Profile & Media Saved to Firebase! ☁️",
        description: "Your verified images, dimensions, and credentials are saved to Firestore.",
        variant: "success"
      })
    } catch (e: any) {
      showToast({
        title: "Save Error",
        description: e.message || "Could not save to Firebase.",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const copyUserId = () => {
    if (!user?.id) return
    navigator.clipboard.writeText(user.id)
    setCopiedId(true)
    soundFX.playSuccess()
    setTimeout(() => setCopiedId(false), 2000)
    showToast({ title: "Copied User ID", description: user.id })
  }

  return (
    <div className="container py-8 md:py-12 max-w-4xl space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-6">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 bg-gradient-gaming rounded-xl text-white shadow-md">
              <Settings className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                Profile &amp; Media Settings
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground">
                Manage your verified avatar (max 2024x2024, 15MB), banner (max 25MB), and Firebase database sync.
              </p>
            </div>
          </div>
        </div>

        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30 text-xs py-1 px-3">
          <Cloud className="w-3.5 h-3.5 mr-1.5" />
          Firestore Cloud Sync Active
        </Badge>
      </div>

      {/* User Scoped ID & Account Status Box */}
      <Card className="border-border bg-card p-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Key className="h-3 w-3 text-primary" />
              Unique Scoped Creator ID:
            </span>
            <div className="flex items-center space-x-2">
              <code className="text-xs font-mono font-bold bg-muted px-2.5 py-1 rounded-lg text-foreground select-all">
                {user?.id || "usr_waya_001"}
              </code>
              <Button size="sm" variant="ghost" onClick={copyUserId} className="h-7 px-2">
                {copiedId ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Badge className="bg-primary text-primary-foreground text-xs capitalize">
              {user?.role || "Creator"} Account
            </Badge>
            <Badge variant="outline" className="text-xs border-primary/30 text-primary">
              Lvl {user?.level.level || 18} • {user?.token_balance || 0} Credits
            </Badge>
          </div>
        </div>
      </Card>

      {/* ================= IMAGE & BANNER UPLOAD SECTION ================= */}
      <Card className="border-border bg-card p-6 space-y-6">
        <div>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-primary" />
            Verified Avatar &amp; Cover Banner Upload
          </CardTitle>
          <CardDescription className="text-xs mt-1">
            Complies with platform constraints: Avatar maximum 2024×2024 px &amp; 15MB limit; Banner maximum 25MB limit. Automatically stored in Firebase.
          </CardDescription>
        </div>

        {/* Banner Preview & Upload */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Cover Banner (Max 25MB):
            </label>
            {bannerInfo && (
              <Badge variant="outline" className="text-[10px] text-emerald-500 border-emerald-500/30">
                {bannerInfo.sizeMb} MB / 25MB Limit OK
              </Badge>
            )}
          </div>

          <div className="relative h-44 sm:h-56 rounded-2xl overflow-hidden border bg-muted group">
            <img
              src={coverUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80"}
              alt="Cover Banner"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button
                type="button"
                size="sm"
                onClick={() => bannerInputRef.current?.click()}
                className="bg-primary text-primary-foreground font-bold text-xs shadow-lg"
              >
                <Upload className="mr-1.5 h-3.5 w-3.5" />
                Change Banner (Max 25MB)
              </Button>
            </div>
          </div>

          <input
            ref={bannerInputRef}
            type="file"
            accept="image/*"
            onChange={handleBannerSelect}
            className="hidden"
          />
        </div>

        {/* Avatar Preview & Upload */}
        <div className="space-y-3 pt-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Profile Avatar / Icon (Max 2024×2024 px, Max 15MB):
            </label>
            {avatarInfo && (
              <Badge variant="outline" className="text-[10px] text-emerald-500 border-emerald-500/30">
                {avatarInfo.width}×{avatarInfo.height} px • {avatarInfo.sizeMb} MB / 15MB OK
              </Badge>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-4 rounded-xl border bg-muted/20">
            <Avatar className="h-24 w-24 sm:h-28 sm:w-28 border-4 border-background shadow-xl shrink-0">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback className="bg-gradient-gaming text-white text-3xl font-black">
                {displayName.charAt(0) || "W"}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-2 text-center sm:text-left flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => avatarInputRef.current?.click()}
                  className="bg-primary text-primary-foreground text-xs font-bold"
                >
                  <Upload className="mr-1.5 h-3.5 w-3.5" />
                  Upload Avatar Image
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setAvatarUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80")
                    showToast({ title: "Default Avatar Applied", description: "Standard high-res creator avatar." })
                  }}
                  className="text-xs"
                >
                  Reset to Official
                </Button>
              </div>

              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Supports PNG, JPEG, WEBP, and SVG formats. Images with dimensions up to 2024×2024 px and file sizes up to 15MB are validated client-side and saved to Firestore.
              </p>
            </div>
          </div>

          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarSelect}
            className="hidden"
          />
        </div>
      </Card>

      {/* ================= PROFILE DETAILS & SOCIAL LINKS ================= */}
      <Card className="border-border bg-card p-6 space-y-4">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          Profile Information &amp; Social Links
        </CardTitle>

        <div className="grid sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-foreground">Display Name:</label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Waya Steurbaut"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-foreground">Location:</label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Ghent, Belgium"
            />
          </div>

          <div className="sm:col-span-2 space-y-1">
            <label className="font-semibold text-foreground">Creator Bio / Studio Overview:</label>
            <Textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Describe your 3D workflow, gaming engines, and tutorial specialties..."
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-foreground flex items-center gap-1.5">
              <Youtube className="h-3.5 w-3.5 text-red-500" />
              YouTube Channel URL:
            </label>
            <Input
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/@wayacreate"
              className="font-mono text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-foreground flex items-center gap-1.5">
              <Radio className="h-3.5 w-3.5 text-indigo-400" />
              Discord Tag:
            </label>
            <Input
              value={discordTag}
              onChange={(e) => setDiscordTag(e.target.value)}
              placeholder="waya_creative#0001"
              className="font-mono text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-foreground flex items-center gap-1.5">
              <Github className="h-3.5 w-3.5 text-foreground" />
              GitHub Handle:
            </label>
            <Input
              value={githubHandle}
              onChange={(e) => setGithubHandle(e.target.value)}
              placeholder="waya-creations"
              className="font-mono text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-foreground flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-primary" />
              Portfolio Website:
            </label>
            <Input
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://wayacreate.com"
              className="font-mono text-xs"
            />
          </div>
        </div>
      </Card>

      {/* ================= APPEARANCE & ACCOUNT MODE ================= */}
      <div className="grid sm:grid-cols-2 gap-6">
        <Card className="border-border bg-card p-5 space-y-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Sun className="h-4 w-4 text-amber-500" />
            Theme &amp; Appearance
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant={theme === "light" ? "default" : "outline"}
              onClick={() => setTheme("light")}
              size="sm"
              className="text-xs"
            >
              Light
            </Button>
            <Button
              variant={theme === "dark" ? "default" : "outline"}
              onClick={() => setTheme("dark")}
              size="sm"
              className="text-xs"
            >
              Dark
            </Button>
          </div>
        </Card>

        <Card className="border-border bg-card p-5 space-y-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Key className="h-4 w-4 text-primary" />
            Account Persona Mode
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            {(["creator", "viewer", "business"] as const).map((r) => (
              <Button
                key={r}
                size="sm"
                variant={user?.role === r ? "default" : "outline"}
                onClick={() => loginAs(r)}
                className="text-xs capitalize"
              >
                {r === "creator" ? "Creator (Earning)" : r === "viewer" ? "Free Watcher" : "Studio Business"}
              </Button>
            ))}
          </div>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <Button
          onClick={handleSaveAll}
          disabled={saving}
          size="lg"
          className="bg-primary text-primary-foreground font-bold px-8 shadow-lg shadow-primary/20"
        >
          {saving ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
          {saving ? "Saving to Firebase..." : "Save All Settings & Sync"}
        </Button>
      </div>
    </div>
  )
}
