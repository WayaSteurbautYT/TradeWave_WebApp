import React from "react"
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
  MapPin,
  Phone
} from "lucide-react"

export function Footer() {
  const footerLinks = {
    platform: [
      { name: "Marketplace", href: "/marketplace" },
      { name: "Services", href: "/services" },
      { name: "Courses", href: "/courses" },
      { name: "Live Streaming", href: "/streaming" },
      { name: "Community", href: "/community" }
    ],
    creators: [
      { name: "Become a Creator", href: "/creator-signup" },
      { name: "Creator Resources", href: "/creator-resources" },
      { name: "Analytics", href: "/analytics" },
      { name: "Monetization", href: "/monetization" },
      { name: "Support", href: "/creator-support" }
    ],
    company: [
      { name: "About Us", href: "/about" },
      { name: "Careers", href: "/careers" },
      { name: "Press", href: "/press" },
      { name: "Partners", href: "/partners" },
      { name: "Investors", href: "/investors" }
    ],
    legal: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Cookie Policy", href: "/cookies" },
      { name: "Community Guidelines", href: "/guidelines" },
      { name: "Copyright", href: "/copyright" }
    ]
  }

  const socialLinks = [
    { name: "GitHub", icon: Github, href: "https://github.com/tradewave" },
    { name: "Twitter", icon: Twitter, href: "https://twitter.com/tradewave" },
    { name: "Instagram", icon: Instagram, href: "https://instagram.com/tradewave" },
    { name: "YouTube", icon: Youtube, href: "https://youtube.com/tradewave" }
  ]

  return (
    <footer className="border-t bg-background">
      <div className="container py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <img 
                src="https://customer-assets.emergentagent.com/job_shadcn-integration/artifacts/n7bmsw2n_tradewave_logo_transparent.png" 
                alt="TradeWave" 
                className="h-8 w-auto"
              />
              <span className="font-bold text-xl gradient-primary bg-clip-text text-transparent">
                TradeWave
              </span>
            </Link>
            <p className="text-muted-foreground mb-4 max-w-xs">
              The leading platform for content creators and traders to collaborate, learn, and monetize their skills through innovative trading mechanisms.
            </p>
            
            {/* Newsletter Signup */}
            <div className="space-y-2">
              <h4 className="font-medium">Stay Updated</h4>
              <div className="flex space-x-2">
                <Input 
                  placeholder="Enter your email"
                  type="email"
                  className="max-w-xs"
                />
                <Button>Subscribe</Button>
              </div>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="font-medium mb-4">Platform</h4>
            <ul className="space-y-2">
              {footerLinks.platform.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Creator Links */}
          <div>
            <h4 className="font-medium mb-4">Creators</h4>
            <ul className="space-y-2">
              {footerLinks.creators.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-medium mb-4">Company</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-medium mb-4">Legal</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Copyright */}
          <div className="text-muted-foreground text-sm">
            © 2025 TradeWave. All rights reserved.
          </div>

          {/* Social Links */}
          <div className="flex items-center space-x-4">
            {socialLinks.map((social) => {
              const Icon = social.icon
              return (
                <Button
                  key={social.name}
                  variant="ghost"
                  size="sm"
                  asChild
                >
                  <a 
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="sr-only">{social.name}</span>
                  </a>
                </Button>
              )
            })}
          </div>

          {/* Contact Info */}
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Mail className="h-4 w-4" />
              <span>hello@tradewave.com</span>
            </div>
            <div className="flex items-center space-x-1">
              <Phone className="h-4 w-4" />
              <span>+1 (555) 123-4567</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}