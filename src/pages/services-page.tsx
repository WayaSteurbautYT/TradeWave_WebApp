import { useState } from "react"
import { MockStore } from "@/data/mockStore"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Briefcase, Star, ArrowRight, Trophy } from "lucide-react"
import { useNavigate } from "react-router-dom"

export function ServicesPage() {
  const services = MockStore.getServices()
  const navigate = useNavigate()

  return (
    <div className="container py-8 md:py-12 space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="flex justify-center mb-2">
          <div className="w-14 h-14 bg-gradient-gaming rounded-2xl flex items-center justify-center shadow-lg">
            <Briefcase className="h-7 w-7 text-white" />
          </div>
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
          Custom Freelance Services
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Commission expert 3D artists, shader programmers, and video trailer editors with milestone protection.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {services.map((service) => (
          <Card key={service.id} className="gaming-card border-border bg-card p-6 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs capitalize font-semibold border-primary/30 text-primary">
                  {service.category}
                </Badge>
                <div className="flex items-center text-yellow-500 text-xs font-semibold">
                  <Star className="h-3.5 w-3.5 fill-current mr-1" />
                  <span>{service.rating} ({service.review_count} reviews)</span>
                </div>
              </div>

              <h3 className="font-bold text-base hover:text-primary transition-colors cursor-pointer" onClick={() => navigate("/marketplace")}>
                {service.title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {service.description}
              </p>

              <div className="flex items-center space-x-1.5 text-xs text-emerald-600 bg-emerald-500/10 p-2 rounded-lg font-medium">
                <Trophy className="h-3.5 w-3.5" />
                <span>Full Recorded Breakdown Tutorial Included</span>
              </div>
            </div>

            <div className="pt-4 border-t mt-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-muted-foreground block">From</span>
                <span className="text-base font-extrabold text-primary">{service.packages.basic.price} credits</span>
              </div>
              <Button size="sm" className="bg-primary text-primary-foreground text-xs" onClick={() => navigate("/marketplace")}>
                Select Package
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
