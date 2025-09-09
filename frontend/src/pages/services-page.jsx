import React from "react"
import { Badge } from "@/components/ui/badge"

export function ServicesPage() {
  return (
    <div className="container py-20">
      <div className="text-center">
        <Badge variant="secondary" className="mb-4">
          🛠️ Coming Soon
        </Badge>
        <h1 className="text-4xl font-bold mb-4">
          Services
          <span className="gradient-primary bg-clip-text text-transparent"> Marketplace</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Hire talented creators for custom projects, from video editing to 3D modeling and beyond.
        </p>
      </div>
    </div>
  )
}