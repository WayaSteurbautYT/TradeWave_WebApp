import React from "react"
import { Badge } from "@/components/ui/badge"

export function StreamingPage() {
  return (
    <div className="container py-20">
      <div className="text-center">
        <Badge variant="secondary" className="mb-4">
          📺 Coming Soon
        </Badge>
        <h1 className="text-4xl font-bold mb-4">
          Live
          <span className="gradient-primary bg-clip-text text-transparent"> Streaming</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Stream live trading sessions, tutorials, and interactive workshops with real-time audience engagement.
        </p>
      </div>
    </div>
  )
}