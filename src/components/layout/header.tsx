import React, { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu"
import { 
  Search, 
  Bell, 
  User, 
  Settings, 
  LogOut, 
  Upload,
  Coins,
  Menu,
  X,
  BarChart3,
  Gamepad2,
  Youtube,
  Play,
  Palette,
  Users,
  ShoppingBag,
  Briefcase,
  MessageSquare,
  Zap,
  TrendingUp,
  Award,
  ShoppingCart,
  Gavel,
  Shield,
  Moon,
  Sun,
  Radio,
  Scale,
  Download,
  Volume2,
  VolumeX
} from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { useAuth } from "@/contexts/AuthContext"
import { soundFX } from "@/lib/soundEffects"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [soundEnabled, setSoundEnabled] = useState(() => soundFX.isEnabled())
  const { theme, setTheme } = useTheme()
  const { user, logout, isAuthenticated, loginWithGoogle, loginAs, getCreditsRemaining } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleToggleSound = () => {
    const next = soundFX.toggle()
    setSoundEnabled(next)
    if (next) soundFX.playCoin()
  }

  const navigation = [
    { name: "Gaming", href: "/gaming", icon: Gamepad2 },
    { name: "Tutorials", href: "/tutorials", icon: Play },
    { name: "YouTube Hub", href: "/youtube", icon: Youtube },
    { name: "Live", href: "/streaming", icon: Radio, isLive: true },
    { name: "Marketplace", href: "/marketplace", icon: ShoppingBag },
    { name: "Bidding", href: "/bidding", icon: Gavel },
    { name: "Hire", href: "/hire", icon: Briefcase },
    { name: "Apps", href: "/apps", icon: Download }
  ]

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 md:h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-6">
          <Link to="/" className="flex items-center space-x-2">
            <div className="h-9 w-9 bg-gradient-gaming rounded-xl flex items-center justify-center shadow-md">
              <Gamepad2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg md:text-xl gradient-primary bg-clip-text text-transparent">
                WayaCreate
              </span>
              <div className="flex items-center space-x-1 text-[10px] text-muted-foreground">
                <Youtube className="h-3 w-3 text-red-500" />
                <span>by Waya Steurbaut</span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center space-x-1 text-sm font-medium">
            {navigation.map((item) => {
              const Icon = item.icon
              const active = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center space-x-1.5 px-3 py-2 rounded-lg transition-colors text-sm",
                    active
                      ? "text-primary font-semibold bg-accent"
                      : "text-foreground/70 hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Icon className={cn("h-4 w-4", item.isLive && "text-red-500 animate-pulse")} />
                  <span>{item.name}</span>
                  {item.isLive && (
                    <span className="relative flex h-2 w-2 ml-0.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Search */}
        <div className="hidden md:flex flex-1 max-w-sm mx-4">
          <form onSubmit={handleSearch} className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search assets, tutorials, gigs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 bg-muted/50 border-input focus:bg-background"
            />
          </form>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-2">
          {isAuthenticated ? (
            <>
              {/* Credits Balance */}
              <Link to="/tokens">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-1.5 h-8 border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary"
                >
                  <Zap className="h-3.5 w-3.5 fill-current" />
                  <span className="font-bold text-xs">{getCreditsRemaining()}</span>
                  <span className="text-[10px] opacity-80 hidden sm:inline">credits</span>
                </Button>
              </Link>

              {/* AI Studio Quick Link */}
              <Link to="/ai-studio" className="hidden lg:flex">
                <Button size="sm" variant="outline" className="h-8 gap-1 border-primary/20 hover:border-primary">
                  <Zap className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs">AI Studio</span>
                </Button>
              </Link>

              {/* Upload Action */}
              <Link to="/upload" className="hidden sm:flex">
                <Button size="sm" className="h-8 gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90">
                  <Upload className="h-3.5 w-3.5" />
                  <span className="text-xs">Upload</span>
                </Button>
              </Link>

              {/* Sound FX Toggle */}
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={handleToggleSound}
                title={soundEnabled ? "Mute Sound Effects" : "Enable Sound Effects"}
              >
                {soundEnabled ? (
                  <Volume2 className="h-4 w-4 text-emerald-500" />
                ) : (
                  <VolumeX className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>

              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                title="Toggle Theme"
              >
                {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </Button>

              {/* Notifications */}
              <Link to="/messages">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 relative">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  <span className="absolute 1 top-1 right-1 h-2 w-2 rounded-full bg-primary" />
                </Button>
              </Link>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger className="relative h-8 w-8 rounded-full focus:outline-none ring-2 ring-primary/20">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatar_url} alt={user?.display_name} />
                    <AvatarFallback className="bg-gradient-gaming text-white text-xs">
                      {user?.display_name?.charAt(0) || "W"}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64" align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-semibold leading-none">{user?.display_name}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center space-x-1.5 text-primary">
                          <Coins className="h-3.5 w-3.5" />
                          <span className="text-xs font-bold">{getCreditsRemaining()} Credits</span>
                        </div>
                        <Badge variant="secondary" className="text-[10px] capitalize">
                          {user?.role} • Lvl {user?.level?.level}
                        </Badge>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile &amp; Portfolio</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/youtube")}>
                    <Youtube className="mr-2 h-4 w-4 text-red-500" />
                    <span>YouTube &amp; Social Channels</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/apps")}>
                    <Download className="mr-2 h-4 w-4 text-primary" />
                    <span>Desktop &amp; Mobile Apps</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                    <BarChart3 className="mr-2 h-4 w-4" />
                    <span>Creator Dashboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/orders")}>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    <span>My Orders</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/tokens")}>
                    <Coins className="mr-2 h-4 w-4" />
                    <span>Token Economy &amp; Faucet</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/guilds")}>
                    <Shield className="mr-2 h-4 w-4" />
                    <span>Creator Guilds</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/achievements")}>
                    <Award className="mr-2 h-4 w-4" />
                    <span>Achievements &amp; Skills</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/analytics")}>
                    <TrendingUp className="mr-2 h-4 w-4" />
                    <span>Analytics</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/messages")}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    <span>Messages</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/streaming")}>
                    <Radio className="mr-2 h-4 w-4 text-red-500" />
                    <span>Live Studio &amp; API</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/rules")}>
                    <Scale className="mr-2 h-4 w-4 text-emerald-500" />
                    <span>Platform Rules &amp; Escrow</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/settings")}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <div className="px-2 py-1 text-[11px] font-semibold text-muted-foreground uppercase">
                    Switch Test Persona
                  </div>
                  <div className="grid grid-cols-2 gap-1 px-1 py-1">
                    <Button size="sm" variant={user?.role === 'creator' ? 'default' : 'outline'} className="h-7 text-xs" onClick={() => loginAs('creator')}>
                      Creator
                    </Button>
                    <Button size="sm" variant={user?.role === 'business' ? 'default' : 'outline'} className="h-7 text-xs" onClick={() => loginAs('business')}>
                      Business
                    </Button>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={loginWithGoogle} className="h-8 text-xs">
                Log In
              </Button>
              <Button size="sm" onClick={loginWithGoogle} className="h-8 text-xs bg-primary text-primary-foreground">
                Join WayaCreate
              </Button>
            </div>
          )}

          {/* Mobile menu trigger */}
          <Button
            variant="ghost"
            size="sm"
            className="xl:hidden h-8 w-8 p-0"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMenuOpen && (
        <div className="xl:hidden border-t bg-background p-4 space-y-4">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search content, tutorials, gigs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </form>
          <div className="grid grid-cols-2 gap-2">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted text-sm font-medium"
                >
                  <Icon className="h-4 w-4 text-primary" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </div>
          <div className="pt-2 border-t grid grid-cols-2 gap-2 text-sm">
            <Link to="/youtube" onClick={() => setIsMenuOpen(false)} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted">
              <Youtube className="h-4 w-4 text-red-500" />
              <span>YouTube Hub</span>
            </Link>
            <Link to="/apps" onClick={() => setIsMenuOpen(false)} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted">
              <Download className="h-4 w-4 text-primary" />
              <span>Install App</span>
            </Link>
            <Link to="/streaming" onClick={() => setIsMenuOpen(false)} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted">
              <Radio className="h-4 w-4 text-red-500 animate-pulse" />
              <span>Live Studio</span>
            </Link>
            <Link to="/ai-studio" onClick={() => setIsMenuOpen(false)} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span>AI Studio</span>
            </Link>
            <Link to="/guilds" onClick={() => setIsMenuOpen(false)} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted">
              <Shield className="h-4 w-4 text-blue-500" />
              <span>Guilds</span>
            </Link>
            <Link to="/tokens" onClick={() => setIsMenuOpen(false)} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted">
              <Coins className="h-4 w-4 text-emerald-500" />
              <span>Tokens</span>
            </Link>
            <Link to="/upload" onClick={() => setIsMenuOpen(false)} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted">
              <Upload className="h-4 w-4 text-purple-500" />
              <span>Upload</span>
            </Link>
            <Link to="/rules" onClick={() => setIsMenuOpen(false)} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted">
              <Scale className="h-4 w-4 text-indigo-500" />
              <span>Rules</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
