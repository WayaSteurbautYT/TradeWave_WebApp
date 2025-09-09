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
  DropdownMenuSeparator
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
  X
} from "lucide-react"
import { useTheme } from "@/components/theme-provider"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { theme, setTheme } = useTheme()
  const location = useLocation()

  // Mock user data - replace with real user context
  const user = {
    name: "Alex Thompson",
    email: "alex@example.com",
    avatar: "",
    tokenBalance: 1250,
    unreadNotifications: 3
  }

  const navigation = [
    { name: "Marketplace", href: "/marketplace" },
    { name: "Services", href: "/services" },
    { name: "Courses", href: "/courses" },
    { name: "Streaming", href: "/streaming" },
    { name: "Community", href: "/community" }
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        {/* Logo */}
        <Link to="/" className="mr-6 flex items-center space-x-2">
          <img 
            src="https://customer-assets.emergentagent.com/job_shadcn-integration/artifacts/n7bmsw2n_tradewave_logo_transparent.png" 
            alt="TradeWave" 
            className="h-8 w-auto"
          />
          <span className="hidden font-bold text-xl gradient-primary bg-clip-text text-transparent sm:inline-block">
            TradeWave
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium mr-6">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "transition-colors hover:text-foreground/80",
                location.pathname === item.href
                  ? "text-foreground"
                  : "text-foreground/60"
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Search */}
        <div className="flex-1 max-w-md mr-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search content, creators, services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          {/* Token Balance */}
          <div className="hidden sm:flex items-center space-x-1 text-sm">
            <Coins className="h-4 w-4 text-primary" />
            <span className="font-medium">{user.tokenBalance.toLocaleString()}</span>
          </div>

          {/* Upload Button */}
          <Button size="sm" className="hidden sm:flex">
            <Upload className="mr-2 h-4 w-4" />
            Upload
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-4 w-4" />
            {user.unreadNotifications > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs">
                {user.unreadNotifications}
              </Badge>
            )}
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">{user.name}</p>
                  <p className="w-[200px] truncate text-sm text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
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
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t">
          <nav className="flex flex-col space-y-2 p-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  location.pathname === item.href
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground/60 hover:text-foreground hover:bg-accent"
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center space-x-2">
                <Coins className="h-4 w-4 text-primary" />
                <span className="font-medium">{user.tokenBalance.toLocaleString()} Tokens</span>
              </div>
              <Button size="sm">
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}