import React, { useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { 
  Github, 
  Twitter, 
  Instagram, 
  Youtube, 
  Mail, 
  Gamepad2,
  CheckCircle2
} from "lucide-react"
import { showToast } from "@/components/ui/toaster"

export function Footer() {
  const [email, setEmail] = useState("")

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    showToast({
      title: "Subscribed!",
      description: "You have subscribed to the WayaCreate creator newsletter.",
      variant: "success",
    })
    setEmail("")
  }

  const footerLinks = {
    platform: [
      { name: "Marketplace", href: "/marketplace" },
      { name: "Hire Creators", href: "/hire" },
      { name: "Smart Bidding", href: "/bidding" },
      { name: "Gaming Hub", href: "/gaming" },
      { name: "Tutorials", href: "/tutorials" },
      { name: "Design Showcase", href: "/design" },
      { name: "AI Studio", href: "/ai-studio" },
    ],
    creators: [
      { name: "Creator Guilds", href: "/guilds" },
      { name: "Upload Content", href: "/upload" },
      { name: "Token Economy", href: "/tokens" },
      { name: "Skill Tree & XP", href: "/achievements" },
      { name: "Creator Dashboard", href: "/dashboard" },
    ],
    community: [
      { name: "Community Feed", href: "/community" },
      { name: "Orders & Milestones", href: "/orders" },
      { name: "Platform Analytics", href: "/analytics" },
      { name: "Subscriptions", href: "/subscription" },
    ],
  }

  return (
    <footer className="border-t bg-muted/20">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-gradient-gaming rounded-lg flex items-center justify-center">
                <Gamepad2 className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-xl gradient-primary bg-clip-text text-transparent">
                WayaCreate
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-sm">
              The community-driven hybrid marketplace for game developers, 3D artists, and creators. Every gig and digital product includes breakdown video tutorials!
            </p>
            <div className="flex items-center space-x-3 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Created by Waya Steurbaut</span>
              <span>•</span>
              <div className="flex items-center space-x-1">
                <Youtube className="h-3.5 w-3.5 text-red-500" />
                <span>YouTube Creator</span>
              </div>
            </div>

            {/* Newsletter */}
            <form onSubmit={handleSubscribe} className="space-y-2 pt-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Get Weekly Tutorials & Free Asset Drops
              </span>
              <div className="flex max-w-md gap-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-9"
                  required
                />
                <Button type="submit" size="sm" className="bg-primary text-primary-foreground shrink-0">
                  Join
                </Button>
              </div>
            </form>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-sm mb-4">Platform</h4>
            <ul className="space-y-2.5 text-sm">
              {footerLinks.platform.map((l) => (
                <li key={l.name}>
                  <Link to={l.href} className="text-muted-foreground hover:text-foreground transition-colors">
                    {l.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-4">Creators</h4>
            <ul className="space-y-2.5 text-sm">
              {footerLinks.creators.map((l) => (
                <li key={l.name}>
                  <Link to={l.href} className="text-muted-foreground hover:text-foreground transition-colors">
                    {l.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-4">Community</h4>
            <ul className="space-y-2.5 text-sm">
              {footerLinks.community.map((l) => (
                <li key={l.name}>
                  <Link to={l.href} className="text-muted-foreground hover:text-foreground transition-colors">
                    {l.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} WayaCreate by Waya Steurbaut. All rights reserved.</p>
          <div className="flex items-center space-x-4">
            <a href="https://youtube.com" target="_blank" rel="noreferrer" className="hover:text-foreground">
              <Youtube className="h-4 w-4" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-foreground">
              <Twitter className="h-4 w-4" />
            </a>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-foreground">
              <Github className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
