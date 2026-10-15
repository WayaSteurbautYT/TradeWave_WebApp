import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useTokens } from "@/contexts/TokenContext"
import { MockStore } from "@/data/mockStore"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { showToast } from "@/components/ui/toaster"
import { 
  User, 
  MapPin, 
  Globe, 
  Youtube, 
  Twitter, 
  Github, 
  Star, 
  Coins, 
  Edit, 
  CheckCircle2, 
  Award,
  Gamepad2
} from "lucide-react"

export function ProfilePage() {
  const { user, updateProfile } = useAuth()
  const { getTokenBalance } = useTokens()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const [displayName, setDisplayName] = useState(user?.display_name || "")
  const [bio, setBio] = useState(user?.bio || "")
  const [location, setLocation] = useState(user?.location || "")
  const [website, setWebsite] = useState(user?.website || "")

  const handleSaveProfile = () => {
    updateProfile({
      display_name: displayName,
      bio,
      location,
      website
    })
    setIsEditModalOpen(false)
  }

  return (
    <div className="container py-8 md:py-12 max-w-5xl space-y-8">
      {/* Profile Header Banner */}
      <div className="relative rounded-2xl overflow-hidden border bg-card">
        <div className="h-44 md:h-60 bg-gradient-gaming relative">
          <img
            src={user?.cover_image_url || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80"}
            alt="Cover"
            className="w-full h-full object-cover opacity-60"
          />
        </div>

        <div className="p-6 md:p-8 pt-0 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between -mt-16 sm:-mt-20 gap-4 mb-4">
            <Avatar className="h-28 w-28 sm:h-32 sm:w-32 border-4 border-background shadow-xl">
              <AvatarImage src={user?.avatar_url} />
              <AvatarFallback className="bg-gradient-gaming text-white text-3xl font-black">
                {user?.display_name.charAt(0) || "W"}
              </AvatarFallback>
            </Avatar>

            <div className="flex items-center space-x-2">
              <Button size="sm" variant="outline" onClick={() => setIsEditModalOpen(true)}>
                <Edit className="mr-1.5 h-3.5 w-3.5" />
                Edit Profile
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-extrabold">{user?.display_name}</h1>
              {user?.is_verified && (
                <Badge className="bg-blue-500 text-white text-xs">✓ Verified Creator</Badge>
              )}
              <Badge variant="secondary" className="text-xs capitalize">
                {user?.role} • Level {user?.level.level}
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
              {user?.bio}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
              {user?.location && (
                <div className="flex items-center space-x-1">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{user.location}</span>
                </div>
              )}
              {user?.website && (
                <a href={user.website} target="_blank" rel="noreferrer" className="flex items-center space-x-1 hover:text-primary">
                  <Globe className="h-3.5 w-3.5" />
                  <span>{user.website}</span>
                </a>
              )}
              <div className="flex items-center space-x-1 text-yellow-500 font-semibold">
                <Star className="h-3.5 w-3.5 fill-current" />
                <span>{user?.rating} ({user?.review_count} reviews)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Left Column: Socials & Skills */}
        <div className="space-y-6">
          <Card className="border-border bg-card p-5 space-y-4">
            <h3 className="font-bold text-sm">Skills &amp; Technologies</h3>
            <div className="flex flex-wrap gap-1.5">
              {user?.skills.map((s, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {s}
                </Badge>
              ))}
            </div>
          </Card>

          <Card className="border-border bg-card p-5 space-y-4">
            <h3 className="font-bold text-sm">Social Channels</h3>
            <div className="space-y-2 text-xs">
              {user?.social_accounts.map((soc, i) => (
                <a
                  key={i}
                  href={soc.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    {soc.platform === "YouTube" ? (
                      <Youtube className="h-4 w-4 text-red-500" />
                    ) : soc.platform === "Twitter" ? (
                      <Twitter className="h-4 w-4 text-blue-400" />
                    ) : (
                      <Github className="h-4 w-4" />
                    )}
                    <span className="font-semibold">{soc.platform}</span>
                  </div>
                  <span className="text-muted-foreground">{soc.followers?.toLocaleString()} subs</span>
                </a>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Published Works */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border-border bg-card p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-4">
              <h3 className="font-bold text-base">Creator Portfolio &amp; Services</h3>
              <Badge variant="outline" className="text-xs text-primary border-primary/30">
                Active Listings
              </Badge>
            </div>

            <div className="space-y-3">
              <div className="p-4 border rounded-xl bg-card/60 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 text-primary rounded-lg">
                    <Gamepad2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Custom AAA Game Asset Modeling &amp; PBR Texturing</h4>
                    <p className="text-xs text-muted-foreground">Includes 45m tutorial breakdown video</p>
                  </div>
                </div>
                <div className="font-extrabold text-sm text-primary">From 250 cr</div>
              </div>

              <div className="p-4 border rounded-xl bg-card/60 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-500/10 text-purple-500 rounded-lg">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Stylized Cyberpunk Neon Alley Asset Pack</h4>
                    <p className="text-xs text-muted-foreground">50+ Modular Models &amp; Rain Shaders</p>
                  </div>
                </div>
                <div className="font-extrabold text-sm text-primary">150 cr</div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogHeader>
          <DialogTitle>Edit Profile Information</DialogTitle>
          <DialogDescription>
            Update your public display name, biography, and external links.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold">Display Name:</label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold">Location:</label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold">Website / Portfolio:</label>
            <Input
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold">Biography:</label>
            <Textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(false)}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSaveProfile} className="bg-primary text-primary-foreground font-semibold">
            Save Profile
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  )
}
