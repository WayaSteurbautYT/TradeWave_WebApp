import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/AuthContext"
import axios from "axios"
import { 
  Zap, 
  Sparkles, 
  Code, 
  Image, 
  FileText, 
  BookOpen,
  Copy,
  Download,
  Heart,
  Share2,
  RefreshCw,
  Wand2
} from "lucide-react"

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL
const API = `${BACKEND_URL}/api`

export function AIStudioPage() {
  const { user, isAuthenticated, getCreditsRemaining } = useAuth()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("text")
  const [prompt, setPrompt] = useState("")
  const [result, setResult] = useState("")
  const [generationHistory, setGenerationHistory] = useState([])

  const aiFeatures = [
    {
      id: "text_generation",
      tab: "text",
      name: "Text Generation",
      description: "Generate tutorials, descriptions, scripts",
      icon: FileText,
      cost: 2,
      placeholder: "Write a tutorial on creating epic Minecraft builds...",
      color: "text-blue-500"
    },
    {
      id: "code_generation", 
      tab: "code",
      name: "Code Generation",
      description: "Generate code, scripts, automation",
      icon: Code,
      cost: 3,
      placeholder: "Create a Python script for video processing...",
      color: "text-green-500"
    },
    {
      id: "image_generation",
      tab: "image", 
      name: "Image Generation",
      description: "Generate thumbnails, artwork, designs",
      icon: Image,
      cost: 5,
      placeholder: "Create a gaming thumbnail for Minecraft castle build...",
      color: "text-purple-500"
    },
    {
      id: "tutorial_generation",
      tab: "tutorial",
      name: "Tutorial Generation", 
      description: "Generate step-by-step tutorials",
      icon: BookOpen,
      cost: 4,
      placeholder: "Create a complete tutorial for Blender character modeling...",
      color: "text-orange-500"
    }
  ]

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    
    const activeFeature = aiFeatures.find(f => f.tab === activeTab)
    if (!activeFeature) return

    if (getCreditsRemaining() < activeFeature.cost) {
      alert(`Not enough credits! You need ${activeFeature.cost} credits for this generation.`)
      return
    }

    setLoading(true)
    try {
      const response = await axios.post(`${API}/ai/generate`, {
        request_type: activeFeature.id,
        prompt: prompt,
        parameters: {}
      }, { withCredentials: true })

      setResult(response.data.result_text || "Generation completed successfully!")
      setGenerationHistory(prev => [response.data, ...prev.slice(0, 9)]) // Keep last 10
      
    } catch (error) {
      console.error('AI generation error:', error)
      alert(error.response?.data?.detail || 'Generation failed')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
  }

  if (!isAuthenticated) {
    return (
      <div className="container py-20">
        <div className="text-center max-w-md mx-auto">
          <Zap className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">AI Studio</h1>
          <p className="text-muted-foreground mb-6">
            Please log in to access AI content generation powered by Gemini 2.0 Flash.
          </p>
          <Button onClick={() => window.location.href = '/'}>
            Login to Continue
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center animate-gaming-pulse">
            <Wand2 className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          🤖 AI Studio
          <span className="gradient-gaming bg-clip-text text-transparent"> Powered by Gemini 2.0</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Generate amazing content, code, tutorials, and images with cutting-edge AI. 
          Perfect for gaming, design, and tech content creation!
        </p>
      </div>

      {/* Credits Display */}
      <div className="max-w-4xl mx-auto mb-8">
        <Card className="gaming-card bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Available Credits</h3>
                  <p className="text-muted-foreground">Use credits to generate amazing AI content</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-primary">{getCreditsRemaining()}</div>
                <Button variant="outline" size="sm" onClick={() => window.location.href = '/subscription'}>
                  Get More Credits
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-8">
        {/* AI Generation Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Feature Selection */}
          <Card className="gaming-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5" />
                <span>AI Generation Tools</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                  {aiFeatures.map((feature) => {
                    const Icon = feature.icon
                    return (
                      <TabsTrigger key={feature.tab} value={feature.tab} className="flex flex-col items-center space-y-1 p-3">
                        <Icon className={`h-5 w-5 ${feature.color}`} />
                        <span className="text-xs hidden sm:inline">{feature.name.split(' ')[0]}</span>
                      </TabsTrigger>
                    )
                  })}
                </TabsList>

                {aiFeatures.map((feature) => (
                  <TabsContent key={feature.tab} value={feature.tab} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{feature.name}</h3>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                      <Badge variant="secondary" className="flex items-center space-x-1">
                        <Zap className="h-3 w-3" />
                        <span>{feature.cost} credits</span>
                      </Badge>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="prompt">Your Prompt</Label>
                        <Textarea
                          id="prompt"
                          placeholder={feature.placeholder}
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          className="min-h-[120px]"
                        />
                      </div>

                      <Button 
                        onClick={handleGenerate} 
                        disabled={loading || !prompt.trim() || getCreditsRemaining() < feature.cost}
                        className="w-full gaming-card"
                        size="lg"
                      >
                        {loading ? (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Wand2 className="mr-2 h-4 w-4" />
                            Generate with AI ({feature.cost} credits)
                          </>
                        )}
                      </Button>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>

          {/* Result Display */}
          {result && (
            <Card className="gaming-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <span>AI Generated Result</span>
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard(result)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm">{result}</pre>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="gaming-card">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" onClick={() => {
                setActiveTab("text")
                setPrompt("Write a step-by-step tutorial for beginners on creating their first Minecraft build")
              }}>
                <FileText className="mr-2 h-4 w-4" />
                Minecraft Tutorial
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => {
                setActiveTab("code")
                setPrompt("Create a Python script to batch process video files for YouTube upload")
              }}>
                <Code className="mr-2 h-4 w-4" />
                Video Processing Script
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => {
                setActiveTab("image")
                setPrompt("Design a professional gaming thumbnail with epic text effects and bright colors")
              }}>
                <Image className="mr-2 h-4 w-4" />
                Gaming Thumbnail
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => {
                setActiveTab("tutorial")
                setPrompt("Complete beginner's guide to 3D modeling in Blender")
              }}>
                <BookOpen className="mr-2 h-4 w-4" />
                Blender Guide
              </Button>
            </CardContent>
          </Card>

          {/* Generation History */}
          {generationHistory.length > 0 && (
            <Card className="gaming-card">
              <CardHeader>
                <CardTitle className="text-lg">Recent Generations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {generationHistory.slice(0, 5).map((item, index) => (
                  <div key={index} className="p-3 bg-muted rounded-lg cursor-pointer hover:bg-accent transition-colors"
                       onClick={() => setResult(item.result_text)}>
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant="secondary" className="text-xs">
                        {item.request_type.replace('_', ' ')}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {item.cost_credits} credits
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {item.prompt}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Tips */}
          <Card className="gaming-card">
            <CardHeader>
              <CardTitle className="text-lg">💡 Pro Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                <span>Be specific in your prompts for better results</span>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                <span>Include context about your target audience</span>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                <span>Mention the platform (YouTube, TikTok, etc.)</span>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2" />
                <span>Use generated content as starting points</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}