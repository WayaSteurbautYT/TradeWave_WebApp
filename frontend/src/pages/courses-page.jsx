import React from "react"
import { Badge } from "@/components/ui/badge"

export function CoursesPage() {
  return (
    <div className="container py-20">
      <div className="text-center">
        <Badge variant="secondary" className="mb-4">
          📚 Coming Soon
        </Badge>
        <h1 className="text-4xl font-bold mb-4">
          Educational
          <span className="gradient-primary bg-clip-text text-transparent"> Courses</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Comprehensive courses on trading, content creation, and digital marketing from industry experts.
        </p>
      </div>
    </div>
  )
}