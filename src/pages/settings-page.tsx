import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { showToast } from "@/components/ui/toaster"
import { useTheme } from "@/components/theme-provider"
import { Settings, Shield, Bell, Moon, Sun, Lock } from "lucide-react"

export function SettingsPage() {
  const { user, loginAs } = useAuth()
  const { theme, setTheme } = useTheme()

  const [emailNotifications, setEmailNotifications] = useState(true)
  const [orderAlerts, setOrderAlerts] = useState(true)

  const handleSave = () => {
    showToast({
      title: "Settings Saved",
      description: "Preferences updated successfully.",
      variant: "success"
    })
  }

  return (
    <div className="container py-8 md:py-12 max-w-3xl space-y-8">
      <div>
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-gradient-gaming rounded-xl text-white">
            <Settings className="h-5 w-5" />
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Account &amp; Platform Settings
          </h1>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Customize notifications, persona preferences, and security configurations.
        </p>
      </div>

      <div className="space-y-6">
        {/* Appearance */}
        <Card className="border-border bg-card p-6">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-base font-bold">Theme &amp; Appearance</CardTitle>
            <CardDescription className="text-xs">Select your preferred color scheme.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 flex gap-3">
            <Button
              variant={theme === "light" ? "default" : "outline"}
              onClick={() => setTheme("light")}
              size="sm"
              className="text-xs gap-1.5"
            >
              <Sun className="h-4 w-4" />
              Light Theme
            </Button>
            <Button
              variant={theme === "dark" ? "default" : "outline"}
              onClick={() => setTheme("dark")}
              size="sm"
              className="text-xs gap-1.5"
            >
              <Moon className="h-4 w-4" />
              Dark Theme
            </Button>
          </CardContent>
        </Card>

        {/* Role Switching */}
        <Card className="border-border bg-card p-6">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-base font-bold">Account Persona</CardTitle>
            <CardDescription className="text-xs">Switch roles to experience WayaCreate as different users.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 flex flex-wrap gap-2">
            {(["creator", "viewer", "business"] as const).map((r) => (
              <Button
                key={r}
                size="sm"
                variant={user?.role === r ? "default" : "outline"}
                onClick={() => loginAs(r)}
                className="text-xs capitalize"
              >
                {r} Mode
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="border-border bg-card p-6">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-base font-bold">Notifications</CardTitle>
            <CardDescription className="text-xs">Manage how and when you receive order updates.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 space-y-3 text-xs">
            <label className="flex items-center space-x-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={orderAlerts}
                onChange={(e) => setOrderAlerts(e.target.checked)}
                className="rounded"
              />
              <span>Instant alerts for new tender bids &amp; milestone deliveries</span>
            </label>
            <label className="flex items-center space-x-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="rounded"
              />
              <span>Weekly digest of new tutorials and marketplace releases</span>
            </label>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} className="bg-primary text-primary-foreground font-semibold">
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  )
}
