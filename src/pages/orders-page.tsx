import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { MockStore } from "@/data/mockStore"
import { Order } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { showToast } from "@/components/ui/toaster"
import { 
  ShoppingCart, 
  CheckCircle2, 
  Clock, 
  FileText, 
  ShieldCheck, 
  ExternalLink,
  MessageSquare
} from "lucide-react"
import { useNavigate } from "react-router-dom"

export function OrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>(() => MockStore.getOrders())
  const navigate = useNavigate()

  const handleApproveMilestone = (orderId: string, milestoneId: string) => {
    const updated = orders.map((o) => {
      if (o.id === orderId) {
        const updatedMilestones = o.milestones.map((m) => {
          if (m.id === milestoneId) {
            return { ...m, status: "approved" as const }
          }
          return m
        })
        const allApproved = updatedMilestones.every((m) => m.status === "approved" || m.status === "paid")
        return {
          ...o,
          milestones: updatedMilestones,
          status: allApproved ? ("completed" as const) : o.status
        }
      }
      return o
    })

    setOrders(updated)
    MockStore.saveOrders(updated)

    showToast({
      title: "Milestone Approved!",
      description: "Escrow funds released to creator wallet.",
      variant: "success"
    })
  }

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
            Track active orders, approve delivery milestones, and view files.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={() => navigate("/messages")}>
          <MessageSquare className="mr-1.5 h-4 w-4" />
          Open Chat
        </Button>
      </div>

      <div className="space-y-6">
        {orders.map((order) => (
          <Card key={order.id} className="gaming-card border-border bg-card p-6 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-base">{order.service_title}</span>
                  <Badge variant="outline" className={`text-xs capitalize ${
                    order.status === "completed" ? "text-emerald-500 border-emerald-500/30" : "text-blue-500 border-blue-500/30"
                  }`}>
                    {order.status}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Order ID: {order.id} • Creator: <strong>{order.creator_name}</strong> • Client: {order.client_name}
                </div>
              </div>

              <div className="text-right">
                <span className="text-lg font-black text-primary">{order.amount} Credits</span>
                <span className="block text-[10px] text-muted-foreground">Delivery: {order.delivery_date}</span>
              </div>
            </div>

            {/* Requirements */}
            <div className="p-3 bg-muted/40 rounded-xl text-xs space-y-1">
              <span className="font-semibold text-muted-foreground uppercase text-[10px]">Specifications:</span>
              <p className="text-foreground/90">{order.requirements}</p>
            </div>

            {/* Milestones list */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-foreground">Delivery Milestones:</span>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {order.milestones.map((m) => (
                  <div key={m.id} className="p-3 border rounded-xl bg-card/60 text-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between font-bold mb-1">
                        <span>{m.title}</span>
                        <span className="text-primary">{m.amount} cr</span>
                      </div>
                      <p className="text-muted-foreground text-[11px] leading-relaxed">{m.description}</p>
                    </div>

                    <div className="pt-3 border-t mt-3 flex items-center justify-between">
                      <Badge variant="secondary" className="text-[10px] capitalize">
                        {m.status}
                      </Badge>
                      {m.status === "pending" && (
                        <Button
                          size="sm"
                          className="h-7 text-[11px] bg-primary text-primary-foreground"
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
          </Card>
        ))}
      </div>
    </div>
  )
}
