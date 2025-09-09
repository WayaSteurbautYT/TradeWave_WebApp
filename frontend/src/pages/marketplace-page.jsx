import React from "react"
import { Badge } from "@/components/ui/badge"

export function MarketplacePage() {
  return (
    <div className="container py-20">
      <div className="text-center">
        <Badge variant="secondary" className="mb-4">
          🛍️ Coming Soon
        </Badge>
        <h1 className="text-4xl font-bold mb-4">
          Marketplace
          <span className="gradient-primary bg-clip-text text-transparent"> Hub</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          The complete marketplace for trading content, hiring creators, and discovering amazing digital assets.
        </p>
      </div>
    </div>
  )
}