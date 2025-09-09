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
  ShoppingBag
} from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { useAuth } from "@/contexts/AuthContext"
import { useTokens } from "@/contexts/TokenContext"
import { AuthModal } from "@/components/auth/AuthModal"
import { TokenPurchaseModal } from "@/components/tokens/TokenPurchaseModal"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [tokenModalOpen, setTokenModalOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const { user, logout, isAuthenticated } = useAuth()
  const { getTokenBalance } = useTokens()
  const location = useLocation()

  const navigation = [
    { name: "Gaming", href: "/gaming", icon: Gamepad2 },
    { name: "Tutorials", href: "/tutorials", icon: Play },
    { name: "Design", href: "/design", icon: Palette },
    { name: "Community", href: "/community", icon: Users },
    { name: "Marketplace", href: "/marketplace", icon: ShoppingBag }
  ]

  const handleLogout = () => {
    logout()
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
          <nav className="hidden md:flex items-center space-x-4 lg:space-x-6 text-sm font-medium mr-4 lg:mr-6">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center space-x-1 transition-colors hover:text-foreground/80 px-2 py-1 rounded-md",
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
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search tutorials, builds..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-9 md:h-10"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-1 md:space-x-2">
            {isAuthenticated ? (
              <>
                {/* Token Balance */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden sm:flex items-center space-x-1 text-sm px-2 md:px-3"
                  onClick={() => setTokenModalOpen(true)}
                >
                  <Coins className="h-4 w-4 text-primary" />
                  <span className="font-medium">{getTokenBalance().toLocaleString()}</span>
                  <Plus className="h-3 w-3 text-muted-foreground" />
                </Button>

                {/* Creator Actions */}
                {(user?.role === 'creator' || user?.role === 'business') && (
                  <>
                    <Button size="sm" variant="outline" className="hidden md:flex" asChild>
                      <Link to="/dashboard">
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </Button>
                    <Button size="sm" className="gaming-card">
                      <Upload className="mr-2 h-4 w-4" />
                      <span className="hidden md:inline">Upload</span>
                    </Button>
                  </>
                )}

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
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.display_name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user?.email}
                        </p>
                        <div className="flex items-center space-x-2 pt-1">
                          <Coins className="h-3 w-3 text-primary" />
                          <span className="text-xs font-medium">{getTokenBalance().toLocaleString()} Tokens</span>
                          <Badge variant="secondary" className="text-xs">
                            {user?.role}
                          </Badge>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/profile">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    {(user?.role === 'creator' || user?.role === 'business') && (
                      <DropdownMenuItem asChild>
                        <Link to="/dashboard">
                          <BarChart3 className="mr-2 h-4 w-4" />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => setTokenModalOpen(true)}>
                      <Coins className="mr-2 h-4 w-4" />
                      Buy Tokens
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
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
                <Button variant="outline" size="sm" onClick={() => setAuthModalOpen(true)}>
                  Login
                </Button>
                <Button size="sm" className="gaming-card" onClick={() => setAuthModalOpen(true)}>
                  Join Now
                </Button>
              </div>
            )}

            {/* Mobile Menu */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden ml-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t">
            <nav className="flex flex-col space-y-1 p-4">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      location.pathname === item.href
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground/60 hover:text-foreground hover:bg-accent"
                    )}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
              
              {isAuthenticated && (
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center space-x-2">
                    <Coins className="h-4 w-4 text-primary" />
                    <span className="font-medium text-sm">{getTokenBalance().toLocaleString()} Tokens</span>
                  </div>
                  <Button size="sm" onClick={() => setTokenModalOpen(true)}>
                    <Plus className="mr-1 h-3 w-3" />
                    Buy
                  </Button>
                </div>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
      />

      {/* Token Purchase Modal */}
      <TokenPurchaseModal 
        isOpen={tokenModalOpen} 
        onClose={() => setTokenModalOpen(false)} 
      />
    </>
  )
}