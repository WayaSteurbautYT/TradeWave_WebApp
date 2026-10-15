import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { MockStore } from "@/data/mockStore"
import { Order } from "@/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { showToast } from "@/components/ui/toaster"
import { useNavigate, Link } from "react-router-dom"
import confetti from "canvas-confetti"
import { 
  ShoppingCart, 
  CheckCircle2, 
  Clock, 
  FileText, 
  ShieldCheck, 
  ExternalLink,
  MessageSquare,
  Download,
  Play,
  Film,
  Lock,
  ArrowRight,
  Scale
} from "lucide-react"

export function OrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>(() => MockStore.getOrders())
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "completed">("all")
  const [selectedTutorialOrder, setSelectedTutorialOrder] = useState<Order | null>(null)
  const navigate = useNavigate()

  const handleApproveMilestone = (orderId: string, milestoneId: string) => {
    let releasedAmount = 0
    let serviceTitle = ""

    const updated = orders.map((o) => {
      if (o.id === orderId) {
        serviceTitle = o.service_title
        const updatedMilestones = o.milestones.map((m) => {
          if (m.id === milestoneId) {
            releasedAmount = m.amount
            return { ...m, status: "approved" as const }
          }
          return m
        })
        const allApproved = updatedMilestones.every((m) => m.status === "approved" || m.status === "paid")
        return {
          ...o,
          milestones: updatedMilestones,
          status: allApproved ? ("completed" as const) : o.status,
        }
      }
      return o
    })

    setOrders(updated)
    MockStore.saveOrders(updated)

    // Release escrow and record transaction
    if (releasedAmount > 0) {
      MockStore.addCredits(releasedAmount, `Escrow released for milestone on: ${serviceTitle}`)
    }

    try {
      confetti({ particleCount: 70, spread: 60 })
    } catch (e) {}

    showToast({
      title: "Milestone Approved & Released! 🎉",
      description: `${releasedAmount} credits transferred from escrow to creator earnings.`,
      variant: "success",
    })
  }

  const handleDownloadFiles = (order: Order) => {
    showToast({
      title: "Downloading Deliverables...",
      description: `Preparing package for "${order.service_title}" (ZIP bundle + 3D meshes).`,
      variant: "success",
    })

    // Simulate instant download trigger
    setTimeout(() => {
      const element = document.createElement("a")
      const file = new Blob([
        `WayaCreate Order #${order.id}\nService: ${order.service_title}\nCreator: ${order.creator_name}\nDeliverables: High-Poly Meshes, 4K Textures, FBX & BLEND files, Companion Tutorial Notes.\n\nThank you for commissioning through WayaCreate Escrow!`
      ], { type: "text/plain" })
      element.href = URL.createObjectURL(file)
      element.download = `WayaCreate_Order_${order.id}_Deliverables.txt`
      document.body.appendChild(element)
      element.click()
      document.body.removeChild(element)
    }, 500)
  }

  const filteredOrders = orders.filter((o) => {
    if (activeFilter === "active") return o.status !== "completed"
    if (activeFilter === "completed") return o.status === "completed"
    return true
  })

  return (
    <div className="container py-8 md:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-gradient-gaming rounded-xl text-white">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Order Management &amp; Escrow
            </h1>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Track commissioned gigs, release milestone escrow funds, and download deliverables.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link to="/rules">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs border-primary/30 text-primary">
              <Scale className="h-3.5 w-3.5" />
              <span>Escrow Protection Rules</span>
            </Button>
          </Link>
          <Button variant="outline" size="sm" onClick={() => navigate("/messages")}>
            <MessageSquare className="mr-1.5 h-4 w-4" />
            Open Messages
          </Button>
        </div>
      </div>

      {/* Escrow Protection Notice */}
      <div className="p-4 bg-muted/40 border border-primary/20 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 text-primary rounded-lg">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="font-bold text-foreground">100% WayaCreate Escrow Guarantee</div>
            <div className="text-muted-foreground">
              Credits are safely held by the platform until you review deliverables and approve each milestone.
            </div>
          </div>
        </div>
        <Link to="/marketplace" className="shrink-0 text-primary hover:underline font-semibold flex items-center gap-1">
          <span>Browse Marketplace</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1 bg-muted p-1 rounded-xl">
          <Button
            size="sm"
            variant={activeFilter === "all" ? "default" : "ghost"}
            className="text-xs h-7"
            onClick={() => setActiveFilter("all")}
          >
            All Orders ({orders.length})
          </Button>
          <Button
            size="sm"
            variant={activeFilter === "active" ? "default" : "ghost"}
            className="text-xs h-7"
            onClick={() => setActiveFilter("active")}
          >
            In Escrow ({orders.filter((o) => o.status !== "completed").length})
          </Button>
          <Button
            size="sm"
            variant={activeFilter === "completed" ? "default" : "ghost"}
            className="text-xs h-7"
            onClick={() => setActiveFilter("completed")}
          >
            Completed ({orders.filter((o) => o.status === "completed").length})
          </Button>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-6">
        {filteredOrders.length === 0 ? (
          <Card className="p-12 text-center space-y-4 border-dashed">
            <ShoppingCart className="h-10 w-10 text-muted-foreground mx-auto" />
            <h3 className="font-bold text-base">No orders found in this category</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Ready to hire specialized 3D artists, game developers, or download project files?
            </p>
            <Button onClick={() => navigate("/marketplace")} className="bg-primary text-primary-foreground text-xs">
              Explore Marketplace
            </Button>
          </Card>
        ) : (
          filteredOrders.map((order) => (
            <Card key={order.id} className="gaming-card border-border bg-card p-6 space-y-5 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-base md:text-lg">{order.service_title}</span>
                    <Badge
                      variant="outline"
                      className={`text-xs capitalize font-semibold ${
                        order.status === "completed"
                          ? "text-emerald-500 border-emerald-500/30 bg-emerald-500/10"
                          : "text-blue-500 border-blue-500/30 bg-blue-500/10"
                      }`}
                    >
                      {order.status === "completed" ? "✓ Completed & Released" : "⏳ In Escrow"}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Order ID: <span className="font-mono text-foreground">{order.id}</span> • Creator:{" "}
                    <strong className="text-foreground">{order.creator_name}</strong> • Client: {order.client_name}
                  </div>
                </div>

                <div className="text-right sm:text-right">
                  <div className="text-xl font-black text-primary">{order.amount} Credits</div>
                  <span className="block text-[11px] text-muted-foreground">Est. Delivery: {order.delivery_date}</span>
                </div>
              </div>

              {/* Requirements & Package Info */}
              <div className="grid sm:grid-cols-3 gap-3 text-xs">
                <div className="sm:col-span-2 p-3 bg-muted/30 rounded-xl space-y-1 border">
                  <span className="font-semibold text-muted-foreground uppercase text-[10px]">Specifications & Brief:</span>
                  <p className="text-foreground/90 leading-relaxed">{order.requirements}</p>
                </div>

                <div className="p-3 bg-muted/30 rounded-xl flex flex-col justify-between border">
                  <div>
                    <span className="font-semibold text-muted-foreground uppercase text-[10px]">Package Tier:</span>
                    <div className="font-bold capitalize text-sm">{order.package_type} Package</div>
                  </div>
                  <div className="flex items-center space-x-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold pt-2">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Tutorial Included</span>
                  </div>
                </div>
              </div>

              {/* Milestones list */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-foreground uppercase tracking-wider">Delivery Milestones:</span>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {order.milestones.map((m) => (
                    <div key={m.id} className="p-3 border rounded-xl bg-card/60 text-xs flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center justify-between font-bold mb-1">
                          <span className="truncate">{m.title}</span>
                          <span className="text-primary shrink-0">{m.amount} cr</span>
                        </div>
                        <p className="text-muted-foreground text-[11px] leading-relaxed">{m.description}</p>
                      </div>

                      <div className="pt-2 border-t flex items-center justify-between">
                        <Badge
                          variant="secondary"
                          className={`text-[10px] capitalize ${
                            m.status === "approved" || m.status === "paid" ? "text-emerald-600 font-bold" : ""
                          }`}
                        >
                          {m.status === "approved" ? "✓ Approved" : m.status}
                        </Badge>
                        {m.status === "pending" && (
                          <Button
                            size="sm"
                            className="h-7 text-[11px] bg-primary text-primary-foreground font-semibold"
                            onClick={() => handleApproveMilestone(order.id, m.id)}
                          >
                            Approve &amp; Release
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions footer */}
              <div className="pt-3 border-t flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-8 gap-1.5"
                    onClick={() => handleDownloadFiles(order)}
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download Package Files</span>
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-8 gap-1.5 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                    onClick={() => setSelectedTutorialOrder(order)}
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>Watch Companion Tutorial</span>
                  </Button>
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs h-8 gap-1 text-muted-foreground hover:text-foreground"
                  onClick={() => navigate("/messages")}
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>Chat with {order.creator_name}</span>
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Companion Tutorial Video Modal */}
      {selectedTutorialOrder && (
        <Dialog open={!!selectedTutorialOrder} onOpenChange={() => setSelectedTutorialOrder(null)}>
          <DialogHeader>
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-gradient-gaming text-white rounded-lg">
                <Film className="h-4 w-4" />
              </div>
              <div>
                <DialogTitle className="text-base">
                  Companion Breakdown Tutorial: {selectedTutorialOrder.service_title}
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Created by {selectedTutorialOrder.creator_name} • 1080p Masterclass
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 my-2">
            {/* Embedded Video Simulator */}
            <div className="relative aspect-video bg-black rounded-xl overflow-hidden flex items-center justify-center border group">
              <img
                src="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80"
                alt="Video"
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center space-y-2">
                <div className="w-14 h-14 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-2xl transition-transform transform group-hover:scale-110 cursor-pointer">
                  <Play className="h-6 w-6 fill-current ml-0.5" />
                </div>
                <Badge className="bg-black/80 text-white text-xs border border-white/20">
                  Duration: 32 minutes • 60 FPS
                </Badge>
              </div>
            </div>

            {/* Curriculum breakdown */}
            <div className="space-y-2 p-3 bg-muted/40 rounded-xl border text-xs">
              <div className="font-bold text-foreground">Video Chapters:</div>
              <ul className="space-y-1.5 text-muted-foreground list-decimal list-inside text-[11px]">
                <li>Poly Budgeting, Vertex Painting &amp; UV Seam Layout (00:00 - 08:30)</li>
                <li>Baking Normals, Curvature &amp; Ambient Occlusion in Substance / Blender (08:30 - 18:15)</li>
                <li>Importing into Unreal Engine 5 &amp; Setting up Material Instances (18:15 - 26:40)</li>
                <li>Custom Collision Hulls &amp; Optimization for Indie Performance (26:40 - 32:00)</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => handleDownloadFiles(selectedTutorialOrder)}
            >
              <Download className="mr-1.5 h-3.5 w-3.5" />
              Download Source Files (.ZIP)
            </Button>
            <Button
              size="sm"
              className="text-xs bg-primary text-primary-foreground"
              onClick={() => setSelectedTutorialOrder(null)}
            >
              Done Watching
            </Button>
          </DialogFooter>
        </Dialog>
      )}
    </div>
  )
}
