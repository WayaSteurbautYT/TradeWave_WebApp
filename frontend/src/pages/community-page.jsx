import React from "react"
import { Badge } from "@/components/ui/badge"

export function CommunityPage() {
  return (
    <div className="container py-20">
      <div className="text-center">
        <Badge variant="secondary" className="mb-4">
          👥 Coming Soon
        </Badge>
        <h1 className="text-4xl font-bold mb-4">
          Community
          <span className="gradient-primary bg-clip-text text-transparent"> Hub</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Connect with creators and traders from around the world. Share knowledge, collaborate, and grow together.
        </p>
      </div>
    </div>
  )
}