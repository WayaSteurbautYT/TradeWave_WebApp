import React, { useState } from "react"
import { Link, useLocation } from "react-router-dom"
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
  Plus,
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
  Gavel
} from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { useAuth } from "@/contexts/AuthContext"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { theme, setTheme } = useTheme()
  const { user, logout, isAuthenticated, loginWithGoogle, getCreditsRemaining } = useAuth()
  const location = useLocation()

  const navigation = [
    { name: "Gaming", href: "/gaming", icon: Gamepad2 },
    { name: "Tutorials", href: "/tutorials", icon: Play },
    { name: "Design", href: "/design", icon: Palette },
    { name: "Community", href: "/community", icon: Users },
    { name: "Marketplace", href: "/marketplace", icon: ShoppingBag },
    { name: "Bidding", href: "/bidding", icon: Gavel },
    { name: "Hire", href: "/hire", icon: Briefcase }
  ]

  const userNavigation = [
    { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
    { name: "Orders", href: "/orders", icon: ShoppingCart },
    { name: "Analytics", href: "/analytics", icon: TrendingUp },
    { name: "Achievements", href: "/achievements", icon: Award },
    { name: "Tokens", href: "/tokens", icon: Coins },
    { name: "Messages", href: "/messages", icon: MessageSquare },
    { name: "Profile", href: "/profile", icon: User },
    { name: "Settings", href: "/settings", icon: Settings }
  ]

  const handleLogout = () => {
    logout()
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`
    }
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 md:h-16 items-center">
          {/* Logo */}
          <Link to="/" className="mr-4 md:mr-6 flex items-center space-x-2">
            <div className="h-8 w-8 bg-gradient-gaming rounded-lg flex items-center justify-center">
              <Gamepad2 className="h-5 w-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-lg md:text-xl gradient-primary bg-clip-text text-transparent">
                WayaCreate
              </span>
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <Youtube className="h-3 w-3" />
                <span>by Waya Steurbaut</span>
              </div>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center space-x-2 text-sm font-medium mr-4">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center space-x-1 transition-colors hover:text-foreground/80 px-3 py-2 rounded-md",
                    location.pathname === item.href
                      ? "text-foreground bg-accent"
                      : "text-foreground/60"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* Search */}
          <div className="flex-1 max-w-md mr-3 md:mr-4">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search content, creators, tutorials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-9 md:h-10"
              />
            </form>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-1 md:space-x-2">
            {isAuthenticated ? (
              <>
                {/* Credits Balance */}
                <Link to="/subscription">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hidden sm:flex items-center space-x-1 text-sm px-2 md:px-3"
                  >
                    <Zap className="h-4 w-4 text-primary" />
                    <span className="font-medium">{getCreditsRemaining()}</span>
                    <span className="text-xs text-muted-foreground">credits</span>
                  </Button>
                </Link>

                {/* Creator Actions */}
                {(user?.role === 'creator' || user?.role === 'business') && (
                  <>
                    <Button size="sm" variant="outline" className="hidden md:flex" asChild>
                      <Link to="/dashboard">
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </Button>
                    <Button size="sm" className="gaming-card" asChild>
                      <Link to="/upload">
                        <Upload className="mr-2 h-4 w-4" />
                        <span className="hidden md:inline">Upload</span>
                      </Link>
                    </Button>
                  </>
                )}

                {/* AI Generation */}
                <Button size="sm" variant="outline" className="hidden md:flex" asChild>
                  <Link to="/ai-studio">
                    <Zap className="mr-2 h-4 w-4" />
                    AI Studio
                  </Link>
                </Button>

                {/* Notifications */}
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="h-4 w-4" />
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs">
                    3
                  </Badge>
                </Button>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.avatar_url} alt={user?.display_name} />
                        <AvatarFallback className="bg-gradient-gaming text-white">
                          {user?.display_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.display_name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user?.email}
                        </p>
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center space-x-2">
                            <Zap className="h-3 w-3 text-primary" />
                            <span className="text-xs font-medium">{getCreditsRemaining()} Credits</span>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {user?.subscription?.plan} • Level {user?.level?.level}
                          </Badge>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/profile">
                        <User className="mr-2 h-4 w-4" />
                        Profile & Settings
                      </Link>
                    </DropdownMenuItem>
                    {(user?.role === 'creator' || user?.role === 'business') && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link to="/dashboard">
                            <BarChart3 className="mr-2 h-4 w-4" />
                            Creator Dashboard
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to="/analytics">
                            <TrendingUp className="mr-2 h-4 w-4" />
                            Analytics & Insights
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to="/upload">
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Content
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuItem asChild>
                      <Link to="/orders">
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        My Orders
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/achievements">
                        <Award className="mr-2 h-4 w-4" />
                        Achievements & Rewards
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/tokens">
                        <Coins className="mr-2 h-4 w-4" />
                        Token Management
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/subscription">
                        <Zap className="mr-2 h-4 w-4" />
                        Subscription & Credits
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/ai-studio">
                        <Zap className="mr-2 h-4 w-4" />
                        AI Studio
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/messages">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Messages
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/guilds">
                        <Shield className="mr-2 h-4 w-4" />
                        Creator Guilds
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
                      <Settings className="mr-2 h-4 w-4" />
                      Toggle Theme
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              /* Guest Actions */
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={loginWithGoogle}>
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Login with Google
                </Button>
                <Button size="sm" className="gaming-card" onClick={loginWithGoogle}>
                  Join WayaCreate
                </Button>
              </div>
            )}

            {/* Mobile Menu */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden ml-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden border-t bg-background">
            <nav className="flex flex-col space-y-1 p-4">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "flex items-center space-x-3 px-3 py-3 rounded-md text-sm font-medium transition-colors",
                      location.pathname === item.href
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground/60 hover:text-foreground hover:bg-accent"
                    )}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
              
              {isAuthenticated && (
                <>
                  <div className="border-t pt-4 mt-4">
                    <div className="flex items-center justify-between px-3 py-2">
                      <div className="flex items-center space-x-2">
                        <Zap className="h-4 w-4 text-primary" />
                        <span className="font-medium text-sm">{getCreditsRemaining()} Credits</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {user?.subscription?.plan}
                      </Badge>
                    </div>
                  </div>
                  
                  <Link
                    to="/ai-studio"
                    className="flex items-center space-x-3 px-3 py-3 rounded-md text-sm font-medium text-foreground/60 hover:text-foreground hover:bg-accent"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Zap className="h-5 w-5" />
                    <span>AI Studio</span>
                  </Link>

                  {(user?.role === 'creator' || user?.role === 'business') && (
                    <>
                      <Link
                        to="/dashboard"
                        className="flex items-center space-x-3 px-3 py-3 rounded-md text-sm font-medium text-foreground/60 hover:text-foreground hover:bg-accent"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <BarChart3 className="h-5 w-5" />
                        <span>Dashboard</span>
                      </Link>
                      <Link
                        to="/upload"
                        className="flex items-center space-x-3 px-3 py-3 rounded-md text-sm font-medium text-foreground/60 hover:text-foreground hover:bg-accent"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Upload className="h-5 w-5" />
                        <span>Upload Content</span>
                      </Link>
                    </>
                  )}
                </>
              )}
            </nav>
          </div>
        )}
      </header>
    </>
  )
}