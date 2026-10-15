import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  ShieldCheck, 
  BookOpen, 
  Coins, 
  Radio, 
  Scale, 
  Lock, 
  Search,
  CheckCircle2,
  AlertTriangle
} from "lucide-react"

export function RulesPage() {
  const [search, setSearch] = useState("")

  const sections = [
    {
      id: "tutorials",
      icon: BookOpen,
      title: "1. The Mandatory Tutorial Rule",
      rules: [
        "Every single 3D model, code template, shader, or preset uploaded to the Marketplace must include a recorded video breakdown tutorial (minimum 10 minutes).",
        "Tutorials must demonstrate the asset's construction, UV layout, parameter modifications, and engine integration (Unreal Engine, Unity, or Blender).",
        "Listings without clear instructional value will be flagged for revision before escrow payouts are cleared."
      ]
    },
    {
      id: "tokens",
      icon: Coins,
      title: "2. Token Economy & Escrow Standards",
      rules: [
        "Fixed Exchange Rate: 10 WayaCreate Credits = $1.00 USD. Credits have guaranteed redemption value.",
        "100% Escrow Protection: When commissioning custom gigs or bidding contracts, client funds are held securely by the platform until milestone signoff.",
        "Minimum Withdrawal Threshold: Creators can request payouts starting at 100 credits ($10 USD) via Stripe Connect or PayPal.",
        "Platform Revenue Split: Creators retain 85% of contract volume (higher than typical 80/20 industry splits). Pro/Studio tier subscribers enjoy up to 100% fee exemption."
      ]
    },
    {
      id: "licensing",
      icon: Scale,
      title: "3. Content Licensing & Rights Trading",
      rules: [
        "Standard Commercial License: Grants the buyer royalty-free rights to integrate the asset into commercial video games, films, and animations.",
        "Resell Prohibition: Digital products may not be redistributed as raw standalone assets unless explicit 'Resell Rights' are specified by the seller.",
        "Attribution: Derivative works should credit the original author in game credits where reasonable."
      ]
    },
    {
      id: "streaming",
      icon: Radio,
      title: "4. Live Streaming & Broadcast Guidelines",
      rules: [
        "Safe for Work: All live streams, asset modeling, and coding streams must adhere to PG-13 community safety standards.",
        "Stream Keys & WebRTC API: Creators must treat their private stream ingest keys with confidentiality. Never share your RTMP stream key on broadcast.",
        "Super Chat Moderation: Inappropriate or harassing super chats are automatically filtered by AI moderation."
      ]
    },
    {
      id: "conduct",
      icon: ShieldCheck,
      title: "5. User Conduct & Zero-Tolerance Policies",
      rules: [
        "No Piracy or Asset Rips: Submitting ripped game meshes, stolen code repositories, or unauthorized third-party IP results in permanent account suspension.",
        "No Off-Platform Solicitation: All project contracts, chat communications, and token transfers must stay within WayaCreate for dispute mediation.",
        "14-Day Dispute Mediation: Any contested milestone is reviewed by WayaCreate administrators within 14 business days."
      ]
    }
  ]

  const filtered = sections.filter(s =>
    !search || s.title.toLowerCase().includes(search.toLowerCase()) || s.rules.some(r => r.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="container py-8 md:py-12 max-w-4xl space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="flex justify-center mb-2">
          <div className="w-14 h-14 bg-gradient-gaming rounded-2xl flex items-center justify-center shadow-lg">
            <Scale className="h-7 w-7 text-white" />
          </div>
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
          Platform Rules &amp;{" "}
          <span className="gradient-primary bg-clip-text text-transparent">Constitution</span>
        </h1>
        <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto">
          The core guidelines that keep WayaCreate fair, educational, safe, and transparent for creators and developers worldwide.
        </p>
      </div>

      <div className="max-w-md mx-auto relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search rules, licensing, escrow..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-10"
        />
      </div>

      <div className="space-y-6">
        {filtered.map((sec) => {
          const Icon = sec.icon
          return (
            <Card key={sec.id} className="gaming-card border-border bg-card p-6 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-bold">{sec.title}</h2>
              </div>

              <div className="space-y-2.5 pt-1">
                {sec.rules.map((rule, idx) => (
                  <div key={idx} className="flex items-start space-x-3 text-xs md:text-sm text-foreground/90 leading-relaxed">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{rule}</span>
                  </div>
                ))}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
