import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/AuthContext"
import { useTheme } from "@/components/theme-provider"
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Link, 
  Youtube, 
  Twitter, 
  Instagram, 
  Github,
  Globe,
  Camera,
  Save,
  Trash2,
  Eye,
  EyeOff,
  Zap,
  Crown
} from "lucide-react"

export function SettingsPage() {
  const { user, isAuthenticated } = useAuth()
  const { theme, setTheme } = useTheme()
  const [activeTab, setActiveTab] = useState("profile")
  const [saving, setSaving] = useState(false)

  // Profile settings state
  const [profileSettings, setProfileSettings] = useState({
    display_name: user?.display_name || "",
    bio: user?.bio || "",
    location: user?.location || "",
    website: user?.website || "",
    skills: user?.skills || [],
    languages: user?.languages || []
  })

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    email_notifications: true,
    push_notifications: true,
    marketing_emails: false,
    order_updates: true,
    community_mentions: true,
    new_followers: true,
    content_likes: false,
    weekly_digest: true
  })

  // Privacy settings state  
  const [privacySettings, setPrivacySettings] = useState({
    profile_visibility: "public",
    show_online_status: true,
    show_earnings: false,
    allow_direct_messages: true,
    show_social_accounts: true
  })

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      // Save profile settings
      console.log("Saving profile settings:", profileSettings)
      // API call would go here
      setTimeout(() => setSaving(false), 1000)
    } catch (error) {
      console.error("Save error:", error)
      setSaving(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="container py-20">
        <div className="text-center max-w-md mx-auto">
          <Settings className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Settings</h1>
          <p className="text-muted-foreground mb-6">
            Please log in to access your account settings and preferences.
          </p>
          <Button onClick={() => window.location.href = '/'}>
            Login to Continue
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          ⚙️ Settings
        </h1>
        <p className="text-muted-foreground">
          Manage your account, preferences, and privacy settings
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center space-x-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Privacy</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center space-x-2">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Appearance</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Settings */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="gaming-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Profile Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Picture */}
                <div className="flex items-center space-x-6">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={user?.avatar_url} />
                    <AvatarFallback className="bg-gradient-gaming text-white text-2xl">
                      {user?.display_name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm">
                      <Camera className="mr-2 h-4 w-4" />
                      Change Photo
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      Upload a profile picture to help others recognize you
                    </p>
                  </div>
                </div>

                {/* Basic Info */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="display_name">Display Name</Label>
                    <Input
                      id="display_name"
                      value={profileSettings.display_name}
                      onChange={(e) => setProfileSettings(prev => ({
                        ...prev,
                        display_name: e.target.value
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="City, Country"
                      value={profileSettings.location}
                      onChange={(e) => setProfileSettings(prev => ({
                        ...prev,
                        location: e.target.value
                      }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell people about yourself, your skills, and what you create..."
                    value={profileSettings.bio}
                    onChange={(e) => setProfileSettings(prev => ({
                      ...prev,
                      bio: e.target.value
                    }))}
                    className="min-h-[100px]"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    {profileSettings.bio.length}/500 characters
                  </p>
                </div>

                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    placeholder="https://your-website.com"
                    value={profileSettings.website}
                    onChange={(e) => setProfileSettings(prev => ({
                      ...prev,
                      website: e.target.value
                    }))}
                  />
                </div>

                <Button onClick={handleSaveProfile} disabled={saving} className="gaming-card">
                  {saving ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Social Media Links */}
            <Card className="gaming-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Link className="h-5 w-5" />
                  <span>Social Media</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="flex items-center space-x-4">
                    <Youtube className="h-5 w-5 text-red-500" />
                    <div className="flex-1">
                      <Label>YouTube Channel</Label>
                      <Input placeholder="https://www.youtube.com/@wayasteurbaut" />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <Twitter className="h-5 w-5 text-blue-500" />
                    <div className="flex-1">
                      <Label>Twitter/X</Label>
                      <Input placeholder="https://twitter.com/wayacreate" />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <Instagram className="h-5 w-5 text-pink-500" />
                    <div className="flex-1">
                      <Label>Instagram</Label>
                      <Input placeholder="https://instagram.com/wayacreate" />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <Github className="h-5 w-5 text-gray-600" />
                    <div className="flex-1">
                      <Label>GitHub</Label>
                      <Input placeholder="https://github.com/wayacreate" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Status */}
            <Card className="gaming-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Crown className="h-5 w-5" />
                  <span>Account Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">Account Type</h3>
                      <p className="text-sm text-muted-foreground">
                        Current role and permissions
                      </p>
                    </div>
                    <Badge variant="secondary" className="capitalize">
                      {user?.role} • Level {user?.level?.level}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">Verification Status</h3>
                      <p className="text-sm text-muted-foreground">
                        Verified creators get priority visibility
                      </p>
                    </div>
                    <Badge className={user?.is_verified ? "bg-blue-500" : "bg-gray-500"}>
                      {user?.is_verified ? "✓ Verified" : "Not Verified"}
                    </Badge>
                  </div>
                  
                  {!user?.is_verified && (
                    <Button variant="outline" size="sm">
                      Apply for Verification
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="gaming-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>Notification Preferences</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(notificationSettings).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium capitalize">
                        {key.replace(/_/g, ' ')}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {key === 'email_notifications' && 'Receive notifications via email'}
                        {key === 'push_notifications' && 'Browser push notifications'}
                        {key === 'marketing_emails' && 'Updates about new features and promotions'}
                        {key === 'order_updates' && 'Updates about your orders and projects'}
                        {key === 'community_mentions' && 'When someone mentions you in posts'}
                        {key === 'new_followers' && 'When someone follows your profile'}
                        {key === 'content_likes' && 'When someone likes your content'}
                        {key === 'weekly_digest' && 'Weekly summary of platform activity'}
                      </p>
                    </div>
                    <Switch
                      checked={value}
                      onCheckedChange={(checked) => 
                        setNotificationSettings(prev => ({
                          ...prev,
                          [key]: checked
                        }))
                      }
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Settings */}
          <TabsContent value="privacy" className="space-y-6">
            <Card className="gaming-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Privacy Controls</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label>Profile Visibility</Label>
                    <Select 
                      value={privacySettings.profile_visibility}
                      onValueChange={(value) => setPrivacySettings(prev => ({
                        ...prev,
                        profile_visibility: value
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">
                          <div className="flex items-center space-x-2">
                            <Globe className="h-4 w-4" />
                            <span>Public - Anyone can see</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="followers">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4" />
                            <span>Followers only</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="private">
                          <div className="flex items-center space-x-2">
                            <EyeOff className="h-4 w-4" />
                            <span>Private</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {Object.entries(privacySettings)
                    .filter(([key]) => key !== 'profile_visibility')
                    .map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium capitalize">
                          {key.replace(/_/g, ' ')}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {key === 'show_online_status' && 'Let others see when you\'re online'}
                          {key === 'show_earnings' && 'Display your earnings on your profile'}
                          {key === 'allow_direct_messages' && 'Allow others to message you directly'}
                          {key === 'show_social_accounts' && 'Display linked social media accounts'}
                        </p>
                      </div>
                      <Switch
                        checked={value}
                        onCheckedChange={(checked) => 
                          setPrivacySettings(prev => ({
                            ...prev,
                            [key]: checked
                          }))
                        }
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="gaming-card border-red-200 dark:border-red-800">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-red-600">
                  <Trash2 className="h-5 w-5" />
                  <span>Danger Zone</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border border-red-200 dark:border-red-800 rounded-lg">
                  <h3 className="font-semibold text-red-600 mb-2">Delete Account</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                  <Button variant="destructive" size="sm">
                    Delete My Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Settings */}
          <TabsContent value="appearance" className="space-y-6">
            <Card className="gaming-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Palette className="h-5 w-5" />
                  <span>Appearance & Theme</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-base font-medium">Theme</Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    Choose how WayaCreate looks to you
                  </p>
                  <div className="grid grid-cols-3 gap-4">
                    <div 
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        theme === 'light' ? 'border-primary bg-primary/5' : 'border-border'
                      }`}
                      onClick={() => setTheme('light')}
                    >
                      <div className="w-full h-20 bg-white border rounded mb-3"></div>
                      <p className="text-sm font-medium">Light</p>
                    </div>
                    
                    <div 
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        theme === 'dark' ? 'border-primary bg-primary/5' : 'border-border'
                      }`}
                      onClick={() => setTheme('dark')}
                    >
                      <div className="w-full h-20 bg-gray-900 border rounded mb-3"></div>
                      <p className="text-sm font-medium">Dark</p>
                    </div>
                    
                    <div 
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        theme === 'system' ? 'border-primary bg-primary/5' : 'border-border'
                      }`}
                      onClick={() => setTheme('system')}
                    >
                      <div className="w-full h-20 bg-gradient-to-r from-white to-gray-900 border rounded mb-3"></div>
                      <p className="text-sm font-medium">System</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Reduce animations</h3>
                      <p className="text-sm text-muted-foreground">
                        Disable motion effects for better performance
                      </p>
                    </div>
                    <Switch />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">High contrast</h3>
                      <p className="text-sm text-muted-foreground">
                        Increase contrast for better accessibility
                      </p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}