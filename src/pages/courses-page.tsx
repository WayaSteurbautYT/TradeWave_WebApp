import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookOpen, Clock, Users, Star, Play, CheckCircle2 } from "lucide-react"
import { showToast } from "@/components/ui/toaster"

export function CoursesPage() {
  const courses = [
    {
      id: "c1",
      title: "Complete Blender 4 to Unreal Engine 5 Environment Masterclass",
      instructor: "Waya Steurbaut",
      duration: "14 hours",
      modules: 24,
      students: 4200,
      rating: 4.98,
      price: 350,
      description: "From blank viewport to photorealistic, performant game scenes. Master modular trims, nanite meshes, lumen lighting, and packaging.",
      topics: ["Blender Modeling", "Trim Sheets", "UE5 Shaders", "Nanite & Lumen", "Optimizations"]
    },
    {
      id: "c2",
      title: "Interactive Game UI & Motion Design in Figma & Unity",
      instructor: "Sarah Chen",
      duration: "8 hours",
      modules: 16,
      students: 2150,
      rating: 4.95,
      price: 240,
      description: "Design game menus, responsive inventory interfaces, and animate HUD transitions using Unity UI Toolkit and Figma design tokens.",
      topics: ["Figma Design Systems", "UI Toolkit", "Animation Curves", "Responsive HUDs"]
    },
    {
      id: "c3",
      title: "High Performance C# Game Architecture & Deterministic Netcode",
      instructor: "Marcus Vance",
      duration: "11 hours",
      modules: 20,
      students: 1890,
      rating: 4.92,
      price: 290,
      description: "Write zero-allocation game loops, memory pools, state machines, and client-side prediction netcode for real-time action games.",
      topics: ["Memory Optimization", "Struct Events", "Rollback Netcode", "Custom Serialization"]
    }
  ]

  return (
    <div className="container py-8 md:py-12 space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="flex justify-center mb-2">
          <div className="w-14 h-14 bg-gradient-gaming rounded-2xl flex items-center justify-center shadow-lg">
            <BookOpen className="h-7 w-7 text-white" />
          </div>
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
          🎓 Academy Courses
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Comprehensive multi-hour video courses with downloadable project milestones and instructor Discord access.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Card key={course.id} className="gaming-card border-border bg-card flex flex-col justify-between">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <Badge variant="outline" className="text-primary border-primary/30 font-semibold">
                  {course.modules} Modules
                </Badge>
                <div className="flex items-center space-x-1 text-yellow-500 font-bold">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  <span className="text-foreground">{course.rating}</span>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-base hover:text-primary transition-colors">
                  {course.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">Instructor: {course.instructor}</p>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                {course.description}
              </p>

              <div className="space-y-1 pt-1 text-xs text-foreground/80">
                {course.topics.slice(0, 3).map((t, i) => (
                  <div key={i} className="flex items-center space-x-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>{t}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t flex items-center justify-between">
                <div>
                  <span className="text-lg font-black text-primary">{course.price} credits</span>
                  <span className="text-[10px] text-muted-foreground block">{course.duration} total</span>
                </div>
                <Button
                  size="sm"
                  className="bg-primary text-primary-foreground text-xs"
                  onClick={() => {
                    showToast({
                      title: "Course Enrolled!",
                      description: `Enrolled in "${course.title}". Added to your dashboard.`,
                      variant: "success"
                    })
                  }}
                >
                  <Play className="mr-1 h-3 w-3 fill-current" />
                  Enroll
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
