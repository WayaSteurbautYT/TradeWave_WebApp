import { useState, useMemo } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useTokens } from "@/contexts/TokenContext"
import { MockStore } from "@/data/mockStore"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { showToast } from "@/components/ui/toaster"
import { Service, ContentItem } from "@/types"
import confetti from "canvas-confetti"
import { 
  ShoppingCart, 
  Star, 
  Coins, 
  Search, 
  TrendingUp, 
  Video, 
  Code, 
  Palette, 
  Music, 
  BookOpen, 
  ArrowRight, 
  Users, 
  Zap, 
  Trophy, 
  Gamepad2,
  CheckCircle2,
  Download,
  ExternalLink
} from "lucide-react"

export function MarketplacePage() {
  const { user } = useAuth()
  const { getTokenBalance, refreshPackages } = useTokens()
  
  const [services] = useState<Service[]>(() => MockStore.getServices())
  const [content] = useState<ContentItem[]>(() => MockStore.getContent())
  
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [activeTab, setActiveTab] = useState("services")

  // Modals for purchasing / booking
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedPackageType, setSelectedPackageType] = useState<"basic" | "standard" | "premium">("basic")
  const [orderRequirements, setOrderRequirements] = useState("")
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false)

  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null)
  const [isContentModalOpen, setIsContentModalOpen] = useState(false)

  const categories = [
    { id: "all", name: "All", icon: ShoppingCart, color: "text-blue-500" },
    { id: "gaming", name: "Gaming", icon: Gamepad2, color: "text-purple-500" },
    { id: "design", name: "Design", icon: Palette, color: "text-pink-500" },
    { id: "development", name: "Development", icon: Code, color: "text-emerald-500" },
    { id: "content", name: "Content", icon: Video, color: "text-red-500" },
    { id: "audio", name: "Audio", icon: Music, color: "text-yellow-500" },
    { id: "education", name: "Education", icon: BookOpen, color: "text-indigo-500" }
  ]

  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const matchCat = selectedCategory === "all" || s.category.toLowerCase() === selectedCategory.toLowerCase()
      const matchQuery = !searchQuery || 
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
      return matchCat && matchQuery
    })
  }, [services, selectedCategory, searchQuery])

  const filteredContent = useMemo(() => {
    return content.filter((c) => {
      const matchCat = selectedCategory === "all" || c.category.toLowerCase() === selectedCategory.toLowerCase()
      const matchQuery = !searchQuery || 
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
      return matchCat && matchQuery
    })
  }, [content, selectedCategory, searchQuery])

  const handleOpenOrder = (service: Service) => {
    setSelectedService(service)
    setSelectedPackageType("basic")
    setOrderRequirements("")
    setIsOrderModalOpen(true)
  }

  const handleConfirmOrder = () => {
    if (!selectedService) return
    const pkg = selectedService.packages[selectedPackageType]
    const balance = getTokenBalance()

    if (balance < pkg.price) {
      showToast({
        title: "Insufficient Credits",
        description: `This package costs ${pkg.price} credits, but you currently have ${balance} credits. Please top up your tokens.`,
        variant: "destructive"
      })
      return
    }

    MockStore.createOrder(
      selectedService,
      selectedPackageType,
      orderRequirements || "Standard requirement specification as outlined in package."
    )

    try {
      confetti({ particleCount: 70, spread: 60 })
    } catch (e) {}

    showToast({
      title: "Order Placed & In Escrow!",
      description: `Successfully hired ${selectedService.creator_name} for ${pkg.name}. Credits held securely in escrow.`,
      variant: "success"
    })

    setIsOrderModalOpen(false)
  }

  const handlePurchaseContent = (item: ContentItem) => {
    setSelectedContent(item)
    setIsContentModalOpen(true)
  }

  const handleConfirmContentDownload = () => {
    if (!selectedContent) return
    const price = selectedContent.price
    const balance = getTokenBalance()

    if (price > 0 && balance < price) {
      showToast({
        title: "Insufficient Credits",
        description: `This digital asset requires ${price} credits. Top up tokens in the Tokens tab.`,
        variant: "destructive"
      })
      return
    }

    if (price > 0) {
      MockStore.deductCredits(price, `Downloaded asset: ${selectedContent.title}`)
    }

    try {
      confetti({ particleCount: 50, spread: 50 })
    } catch (e) {}

    showToast({
      title: "Asset Download Unlocked!",
      description: `Downloaded "${selectedContent.title}". Tutorial video & project files are now available in your orders.`,
      variant: "success"
    })

    setIsContentModalOpen(false)
  }

  return (
    <div className="container py-8 md:py-12">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
        <div className="flex justify-center mb-2">
          <div className="w-14 h-14 bg-gradient-gaming rounded-2xl flex items-center justify-center shadow-lg">
            <ShoppingCart className="h-7 w-7 text-white" />
          </div>
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
          🛍️ WayaCreate{" "}
          <span className="gradient-gaming bg-clip-text text-transparent">Marketplace</span>
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Discover vetted game assets, 3D models, shaders, and hire specialized creators. Every purchase includes video tutorials!
        </p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <Card className="gaming-card border-border bg-card">
          <CardContent className="p-3.5 text-center">
            <ShoppingCart className="h-5 w-5 text-blue-500 mx-auto mb-1" />
            <div className="text-xl font-bold">1,200+</div>
            <div className="text-[11px] text-muted-foreground">Active Services</div>
          </CardContent>
        </Card>
        <Card className="gaming-card border-border bg-card">
          <CardContent className="p-3.5 text-center">
            <Video className="h-5 w-5 text-red-500 mx-auto mb-1" />
            <div className="text-xl font-bold">5,000+</div>
            <div className="text-[11px] text-muted-foreground">Asset Downloads</div>
          </CardContent>
        </Card>
        <Card className="gaming-card border-border bg-card">
          <CardContent className="p-3.5 text-center">
            <Users className="h-5 w-5 text-emerald-500 mx-auto mb-1" />
            <div className="text-xl font-bold">800+</div>
            <div className="text-[11px] text-muted-foreground">Verified Creators</div>
          </CardContent>
        </Card>
        <Card className="gaming-card border-border bg-card">
          <CardContent className="p-3.5 text-center">
            <TrendingUp className="h-5 w-5 text-purple-500 mx-auto mb-1" />
            <div className="text-xl font-bold">25K+</div>
            <div className="text-[11px] text-muted-foreground">Transactions</div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Token Balance Header */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8 items-center justify-between">
        <div className="relative flex-1 w-full max-w-xl">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search services, props, 3D models, tutorials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10"
          />
        </div>
        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-bold">
            <Coins className="h-4 w-4" />
            <span>Balance: {getTokenBalance()} credits</span>
          </div>
          <Button size="sm" variant="outline" className="h-9 text-xs" onClick={() => window.location.href = "/tokens"}>
            Get Tokens
          </Button>
        </div>
      </div>

      {/* Layout with Categories sidebar + Content */}
      <div className="grid lg:grid-cols-4 gap-6">
        {/* Categories Sidebar */}
        <div className="space-y-4">
          <Card className="border-border bg-card">
            <div className="p-4 border-b">
              <h3 className="font-bold text-sm">Categories</h3>
            </div>
            <div className="p-2 space-y-1">
              {categories.map((cat) => {
                const Icon = cat.icon
                const isSelected = selectedCategory === cat.id
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      isSelected 
                        ? "bg-primary text-primary-foreground font-semibold" 
                        : "text-foreground/70 hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Icon className={`h-4 w-4 ${isSelected ? "text-white" : cat.color}`} />
                      <span>{cat.name}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </Card>

          {/* Quick info promo */}
          <Card className="border-emerald-500/20 bg-emerald-500/5 p-4 text-xs space-y-2">
            <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-bold">
              <Trophy className="h-4 w-4" />
              <span>WayaCreate Guarantee</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Every deliverable and digital asset includes project files and a recorded video breakdown tutorial.
            </p>
          </Card>
        </div>

        {/* Content Area with Tabs */}
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 max-w-sm">
              <TabsTrigger value="services">Custom Services ({filteredServices.length})</TabsTrigger>
              <TabsTrigger value="content">Digital Products ({filteredContent.length})</TabsTrigger>
            </TabsList>

            {/* Services Tab */}
            <TabsContent value="services" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-5">
                {filteredServices.map((service) => (
                  <Card key={service.id} className="gaming-card border-border bg-card flex flex-col justify-between">
                    <CardContent className="p-5 space-y-4">
                      {/* Creator Header */}
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={service.creator_avatar} />
                          <AvatarFallback className="bg-gradient-gaming text-white text-xs">
                            {service.creator_name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-1.5">
                            <span className="font-bold text-xs truncate">{service.creator_name}</span>
                            <Badge className="bg-blue-500 text-white text-[9px] h-3.5 px-1">✓</Badge>
                          </div>
                          <div className="flex items-center space-x-2 text-[11px] text-muted-foreground">
                            <div className="flex items-center text-yellow-500">
                              <Star className="h-3 w-3 fill-current mr-0.5" />
                              <span className="font-semibold text-foreground">{service.rating}</span>
                            </div>
                            <span>({service.review_count} reviews)</span>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-[10px] capitalize">
                          {service.category}
                        </Badge>
                      </div>

                      {/* Title & Description */}
                      <div>
                        <h3 className="font-bold text-sm mb-1.5 line-clamp-2 hover:text-primary transition-colors">
                          {service.title}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                          {service.description}
                        </p>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5">
                        {service.tags.map((tag, idx) => (
                          <Badge key={idx} variant="secondary" className="text-[10px] px-2 py-0">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      {/* Tutorial badge */}
                      <div className="flex items-center space-x-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1.5 rounded-lg">
                        <Trophy className="h-3.5 w-3.5 shrink-0" />
                        <span className="font-medium">Video Breakdown Tutorial Included</span>
                      </div>

                      {/* Footer & Action */}
                      <div className="pt-3 border-t flex items-center justify-between">
                        <div>
                          <div className="flex items-baseline space-x-1">
                            <span className="text-xs text-muted-foreground">From</span>
                            <span className="text-lg font-black text-primary">
                              {service.packages.basic.price}
                            </span>
                            <span className="text-xs text-muted-foreground">credits</span>
                          </div>
                        </div>
                        <Button size="sm" className="bg-primary text-primary-foreground text-xs" onClick={() => handleOpenOrder(service)}>
                          View Packages
                          <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Content / Assets Tab */}
            <TabsContent value="content" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-5">
                {filteredContent.map((item) => (
                  <Card key={item.id} className="gaming-card border-border bg-card flex flex-col justify-between">
                    <CardContent className="p-5 space-y-4">
                      {/* Visual Banner */}
                      <div className="aspect-video bg-gradient-to-br from-primary/15 via-background to-accent/15 rounded-xl flex items-center justify-center relative overflow-hidden border">
                        <div className="p-4 bg-background/60 rounded-2xl backdrop-blur-sm">
                          {item.content_type === "3d_model" ? (
                            <Gamepad2 className="h-8 w-8 text-primary" />
                          ) : item.content_type === "code" ? (
                            <Code className="h-8 w-8 text-primary" />
                          ) : item.content_type === "audio" ? (
                            <Music className="h-8 w-8 text-primary" />
                          ) : (
                            <Palette className="h-8 w-8 text-primary" />
                          )}
                        </div>
                        <Badge className="absolute top-2.5 left-2.5 text-[10px] uppercase font-bold bg-background/90 text-foreground border">
                          {item.content_type}
                        </Badge>
                        <Badge className="absolute bottom-2.5 right-2.5 text-[10px] bg-emerald-500 text-white">
                          Tutorial Included
                        </Badge>
                      </div>

                      <div>
                        <h3 className="font-bold text-sm mb-1.5 line-clamp-2 hover:text-primary transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Star className="h-3.5 w-3.5 text-yellow-500 fill-current" />
                          <span className="font-semibold text-foreground">{item.rating}</span>
                          <span>({item.review_count} ratings)</span>
                        </div>
                        <span>{item.download_count} downloads</span>
                      </div>

                      <div className="pt-3 border-t flex items-center justify-between">
                        <div>
                          <span className="text-lg font-black text-primary">
                            {item.price} credits
                          </span>
                        </div>
                        <Button size="sm" variant="outline" className="text-xs" onClick={() => handlePurchaseContent(item)}>
                          <Download className="mr-1.5 h-3.5 w-3.5" />
                          Download
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Service Order Booking Dialog */}
      {selectedService && (
        <Dialog open={isOrderModalOpen} onOpenChange={setIsOrderModalOpen}>
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">{selectedService.title}</DialogTitle>
            <DialogDescription className="text-xs">
              Select your desired package and specify project requirements.
            </DialogDescription>
          </DialogHeader>

          {/* Package Selection Tabs */}
          <div className="grid grid-cols-3 gap-2 my-4">
            {(["basic", "standard", "premium"] as const).map((type) => {
              const p = selectedService.packages[type]
              const isSelected = selectedPackageType === type
              return (
                <div
                  key={type}
                  onClick={() => setSelectedPackageType(type)}
                  className={`p-3 rounded-xl border text-center cursor-pointer transition-all ${
                    isSelected ? "border-primary bg-primary/10 shadow-sm" : "border-border hover:bg-muted"
                  }`}
                >
                  <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    {type}
                  </div>
                  <div className="text-base font-extrabold text-primary my-1">
                    {p.price} credits
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {p.delivery_time}d delivery
                  </div>
                </div>
              )
            })}
          </div>

          <div className="p-3 bg-muted/40 rounded-xl space-y-2 text-xs">
            <div className="font-bold">{selectedService.packages[selectedPackageType].name}</div>
            <p className="text-muted-foreground">{selectedService.packages[selectedPackageType].description}</p>
            <div className="space-y-1 pt-1">
              {selectedService.packages[selectedPackageType].features.map((f, i) => (
                <div key={i} className="flex items-center space-x-1.5 text-foreground font-medium">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-1.5 my-3">
            <label className="text-xs font-semibold">Your Project Notes &amp; Requirements:</label>
            <Textarea
              placeholder="Describe what you need built, references, target game engine, polygon budgets..."
              value={orderRequirements}
              onChange={(e) => setOrderRequirements(e.target.value)}
              rows={3}
              className="text-xs"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setIsOrderModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleConfirmOrder} className="bg-primary text-primary-foreground">
              Confirm &amp; Hold {selectedService.packages[selectedPackageType].price} Credits in Escrow
            </Button>
          </DialogFooter>
        </Dialog>
      )}

      {/* Content Purchase Dialog */}
      {selectedContent && (
        <Dialog open={isContentModalOpen} onOpenChange={setIsContentModalOpen}>
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Download {selectedContent.title}</DialogTitle>
            <DialogDescription className="text-xs">
              Unlock source project files and companion video tutorial.
            </DialogDescription>
          </DialogHeader>

          <div className="p-4 bg-muted/30 rounded-xl space-y-3 text-xs my-3">
            <div className="flex justify-between items-center font-bold">
              <span>Price:</span>
              <span className="text-base text-primary font-black">{selectedContent.price} credits</span>
            </div>
            <div className="flex justify-between items-center text-muted-foreground">
              <span>Your Current Balance:</span>
              <span>{getTokenBalance()} credits</span>
            </div>
            <div className="border-t pt-2 space-y-1">
              <div className="flex items-center space-x-1.5 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>Full commercial license included</span>
              </div>
              <div className="flex items-center space-x-1.5 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>Instant download link to FBX/Blend/Code files</span>
              </div>
              <div className="flex items-center space-x-1.5 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>45m YouTube-style tutorial breakdown video</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setIsContentModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleConfirmContentDownload} className="bg-primary text-primary-foreground">
              Confirm Download ({selectedContent.price} credits)
            </Button>
          </DialogFooter>
        </Dialog>
      )}
    </div>
  )
}
