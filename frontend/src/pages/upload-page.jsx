import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/contexts/AuthContext"
import { 
  Upload, 
  FileVideo, 
  FileImage, 
  FileText,
  BookOpen,
  Gamepad2,
  Palette,
  Code,
  Award,
  Zap,
  DollarSign,
  Download
} from "lucide-react"

export function UploadPage() {
  const { user, isAuthenticated } = useAuth()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content_type: "",
    category: "",
    price: 0,
    download_price: 150,
    tags: "",
    tutorial_required: true
  })

  const contentTypes = [
    { value: "video", label: "Video Tutorial", icon: FileVideo, color: "text-red-500" },
    { value: "course", label: "Complete Course", icon: BookOpen, color: "text-blue-500" },
    { value: "3d_model", label: "3D Model/Project", icon: FileText, color: "text-purple-500" },
    { value: "template", label: "Design Template", icon: FileImage, color: "text-green-500" }
  ]

  const categories = [
    { value: "Gaming", label: "Gaming Content", icon: Gamepad2, examples: "Minecraft builds, Fortnite strategies, game tutorials" },
    { value: "Design", label: "Design & Creative", icon: Palette, examples: "Blender models, graphics, video editing" },
    { value: "Tech", label: "Tech & Development", icon: Code, examples: "AI tools, programming, software tutorials" }
  ]

  if (!isAuthenticated) {
    return (
      <div className="container py-20">
        <div className="text-center max-w-md mx-auto">
          <Upload className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Upload Content</h1>
          <p className="text-muted-foreground mb-6">
            Please log in to upload your gaming, design, and tech content to WayaCreate.
          </p>
          <Button>Login to Upload</Button>
        </div>
      </div>
    )
  }

  if (user?.role === 'viewer') {
    return (
      <div className="container py-20">
        <div className="text-center max-w-md mx-auto">
          <Award className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Become a Creator</h1>
          <p className="text-muted-foreground mb-6">
            Only creators and businesses can upload content. Upgrade your account to start sharing your amazing work!
          </p>
          <Button>Upgrade Account</Button>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log("Upload form submitted:", formData)
    // Here you would typically upload the content
  }

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-gaming rounded-2xl flex items-center justify-center animate-gaming-pulse">
            <Upload className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          📤 Upload Your 
          <span className="gradient-gaming bg-clip-text text-transparent"> Content</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Share your gaming builds, design tutorials, and tech knowledge with the WayaCreate community!
        </p>
      </div>

      {/* Tutorial Requirement Banner */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-6 mb-8 border border-primary/20">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
            <Award className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">📚 WayaCreate Tutorial Requirement</h3>
            <p className="text-muted-foreground mb-2">
              Every content upload must include a complete tutorial showing how you created it. This ensures 
              the community learns and grows together!
            </p>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <Zap className="h-4 w-4 text-green-500" />
                <span>Step-by-step explanation</span>
              </div>
              <div className="flex items-center space-x-1">
                <Download className="h-4 w-4 text-blue-500" />
                <span>Project files included</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Content Type Selection */}
          <Card className="gaming-card">
            <CardHeader>
              <CardTitle>What are you uploading?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {contentTypes.map((type) => {
                  const Icon = type.icon
                  return (
                    <div
                      key={type.value}
                      className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                        formData.content_type === type.value 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border'
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, content_type: type.value }))}
                    >
                      <Icon className={`h-8 w-8 ${type.color} mb-2`} />
                      <h3 className="font-semibold mb-1">{type.label}</h3>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card className="gaming-card">
            <CardHeader>
              <CardTitle>Content Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Epic Minecraft Castle Build Tutorial"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what you're teaching and what viewers will learn..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="min-h-[100px]"
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select content category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => {
                      const Icon = category.icon
                      return (
                        <SelectItem key={category.value} value={category.value}>
                          <div className="flex items-center space-x-2">
                            <Icon className="h-4 w-4" />
                            <div>
                              <div>{category.label}</div>
                              <div className="text-sm text-muted-foreground">{category.examples}</div>
                            </div>
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  placeholder="minecraft, building, tutorial, medieval, castle"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Help people discover your content with relevant tags
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card className="gaming-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Pricing & Access</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Watch Price (Tokens)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    0 = Free to watch (recommended for tutorials)
                  </p>
                </div>

                <div>
                  <Label htmlFor="download_price">Download Price (Tokens)</Label>
                  <Input
                    id="download_price"
                    type="number"
                    min="0"
                    placeholder="150"
                    value={formData.download_price}
                    onChange={(e) => setFormData(prev => ({ ...prev, download_price: parseInt(e.target.value) || 0 }))}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Price for project files & resources
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="tutorial_required" 
                  checked={formData.tutorial_required}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, tutorial_required: checked }))}
                />
                <Label htmlFor="tutorial_required" className="text-sm">
                  I confirm this includes a complete tutorial showing how I created this content
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* File Upload */}
          <Card className="gaming-card">
            <CardHeader>
              <CardTitle>Upload Files</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Drop your files here</h3>
                <p className="text-muted-foreground mb-4">or click to browse</p>
                <Button variant="outline">Select Files</Button>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end space-x-4">
            <Button variant="outline">Save as Draft</Button>
            <Button type="submit" className="gaming-card">
              <Upload className="mr-2 h-4 w-4" />
              Publish Content
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}