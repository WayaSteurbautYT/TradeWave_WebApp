import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label" 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/contexts/AuthContext"
import { useTokens } from "@/contexts/TokenContext"
import { 
  Gavel,
  TrendingUp,
  Clock,
  DollarSign,
  Users,
  Target,
  Zap,
  Star,
  Calendar,
  Eye,
  MessageSquare,
  Send,
  Plus,
  Filter,
  Search,
  Coins,
  Trophy,
  AlertCircle,
  CheckCircle,
  Timer,
  Briefcase,
  FileText,
  Award,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Lightbulb
} from "lucide-react"

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL
const API = `${BACKEND_URL}/api`

export function BiddingPage() {
  const { user, isAuthenticated } = useAuth()
  const { getTokenBalance } = useTokens()
  const [activeTab, setActiveTab] = useState("browse")
  const [projects, setProjects] = useState([])
  const [myProjects, setMyProjects] = useState([])
  const [myBids, setMyBids] = useState([])
  const [selectedProject, setSelectedProject] = useState(null)
  const [projectBids, setProjectBids] = useState([])
  const [bidAnalytics, setBidAnalytics] = useState(null)
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    category: "",
    min_budget: "",
    max_budget: "",
    skills: ""
  })

  // New project form
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    category: "gaming",
    required_skills: [],
    budget_min: 50,
    budget_max: 500,
    deadline: "",
    bid_deadline: "",
    requirements: {}
  })

  // Bid form
  const [newBid, setNewBid] = useState({
    amount: 100,
    delivery_time: 7,
    proposal: "",
    milestones: [],
    extras: []
  })

  const categories = [
    { id: "gaming", name: "Gaming", icon: "🎮" },
    { id: "design", name: "Design", icon: "🎨" },
    { id: "development", name: "Development", icon: "💻" },
    { id: "content", name: "Content Creation", icon: "📹" },
    { id: "animation", name: "Animation", icon: "🎬" },
    { id: "audio", name: "Audio", icon: "🎵" }
  ]

  useEffect(() => {
    if (isAuthenticated) {
      fetchProjects()
      if (activeTab === "my-projects") {
        fetchMyProjects()
      } else if (activeTab === "my-bids") {
        fetchMyBids()
      }
    }
  }, [isAuthenticated, activeTab, filters])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        status: "open",
        ...(filters.category && { category: filters.category }),
        ...(filters.min_budget && { min_budget: filters.min_budget }),
        ...(filters.max_budget && { max_budget: filters.max_budget }),
        ...(filters.skills && { skills: filters.skills })
      })
      
      const response = await axios.get(`${API}/projects/bidding?${params}`)
      setProjects(response.data)
    } catch (error) {
      console.error('Error fetching projects:', error)
      // Mock data for demo
      setProjects([
        {
          id: "proj1",
          title: "Epic Minecraft Castle Build",
          description: "I need someone to build a massive medieval castle on my Minecraft server. Must include interior design, redstone mechanisms, and a full tutorial.",
          category: "gaming",
          client_id: "client1",
          budget_min: 200,
          budget_max: 500,
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          bid_deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          required_skills: ["minecraft", "building", "redstone"],
          current_bid_count: 12,
          status: "open",
          created_at: new Date().toISOString()
        },
        {
          id: "proj2", 
          title: "3D Character Animation for Game",
          description: "Looking for a skilled Blender artist to create 3D character animations for my indie game. Need walk, run, jump, and attack animations.",
          category: "animation",
          client_id: "client2",
          budget_min: 300,
          budget_max: 800,
          deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          bid_deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          required_skills: ["blender", "3d-animation", "game-dev"],
          current_bid_count: 8,
          status: "open",
          created_at: new Date().toISOString()
        },
        {
          id: "proj3",
          title: "YouTube Thumbnail Design Package",
          description: "Need 20 eye-catching YouTube thumbnails for my gaming channel. Must be bold, colorful, and click-worthy. Include source files.",
          category: "design",
          client_id: "client3",
          budget_min: 100,
          budget_max: 250,
          deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          bid_deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          required_skills: ["photoshop", "thumbnail-design", "gaming"],
          current_bid_count: 15,
          status: "open",
          created_at: new Date().toISOString()
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const fetchMyProjects = async () => {
    try {
      // This would fetch projects created by the current user
      setMyProjects([])
    } catch (error) {
      console.error('Error fetching my projects:', error)
    }
  }

  const fetchMyBids = async () => {
    try {
      // This would fetch bids made by the current user
      setMyBids([])
    } catch (error) {
      console.error('Error fetching my bids:', error)
    }
  }

  const fetchProjectDetails = async (projectId) => {
    try {
      setLoading(true)
      
      // Fetch project bids
      const bidsResponse = await axios.get(`${API}/projects/${projectId}/bids`, {
        withCredentials: true
      })
      setProjectBids(bidsResponse.data)
      
      // Fetch analytics
      const analyticsResponse = await axios.get(`${API}/projects/${projectId}/analytics`)
      setBidAnalytics(analyticsResponse.data)
      
    } catch (error) {
      console.error('Error fetching project details:', error)
      // Mock data for demo
      setProjectBids([
        {
          id: "bid1",
          creator_id: "creator1",
          amount: 350,
          delivery_time: 5,
          proposal: "I can build your epic castle! I have 3+ years of Minecraft building experience and specialize in medieval architecture. I'll include full redstone mechanisms and provide a detailed tutorial.",
          created_at: new Date().toISOString(),
          creator_name: "MasterBuilder99",
          creator_rating: 4.9,
          creator_completed_orders: 156
        },
        {
          id: "bid2",
          creator_id: "creator2", 
          amount: 420,
          delivery_time: 7,
          proposal: "I'm a professional Minecraft architect with over 500 completed builds. I'll create an amazing castle with advanced redstone systems, custom interiors, and a comprehensive video tutorial.",
          created_at: new Date().toISOString(),
          creator_name: "CraftMaster_Pro",
          creator_rating: 5.0,
          creator_completed_orders: 289
        }
      ])
      
      setBidAnalytics({
        project_id: projectId,
        average_bid: 385,
        lowest_bid: 250,
        highest_bid: 500,
        total_bids: 12,
        estimated_completion_time: 6.2,
        success_prediction: 0.92,
        recommended_budget: { min: 300, max: 450, optimal: 375 }
      })
    } finally {
      setLoading(false)
    }
  }

  const createProject = async () => {
    try {
      setLoading(true)
      const response = await axios.post(`${API}/projects/bidding`, newProject, {
        withCredentials: true
      })
      
      alert("Project created successfully! Creators can now bid on your project.")
      setNewProject({
        title: "",
        description: "",
        category: "gaming",
        required_skills: [],
        budget_min: 50,
        budget_max: 500,
        deadline: "",
        bid_deadline: "",
        requirements: {}
      })
      
      // Refresh projects
      fetchProjects()
      
    } catch (error) {
      alert(error.response?.data?.detail || "Failed to create project")
    } finally {
      setLoading(false)
    }
  }

  const submitBid = async () => {
    if (!selectedProject) return
    
    try {
      setLoading(true)
      const response = await axios.post(`${API}/projects/${selectedProject.id}/bids`, newBid, {
        withCredentials: true
      })
      
      alert("Bid submitted successfully! The client will review your proposal.")
      setNewBid({
        amount: 100,
        delivery_time: 7,
        proposal: "",
        milestones: [],
        extras: []
      })
      
      // Refresh project bids
      fetchProjectDetails(selectedProject.id)
      
    } catch (error) {
      alert(error.response?.data?.detail || "Failed to submit bid")
    } finally {
      setLoading(false)
    }
  }

  const getTimeLeft = (deadline) => {
    const timeLeft = new Date(deadline) - new Date()
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24))
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    if (days > 0) return `${days}d ${hours}h left`
    if (hours > 0) return `${hours}h left`
    return "Ending soon"
  }

  const ProjectCard = ({ project }) => (
    <Card className="gaming-card hover:shadow-lg transition-all duration-300 cursor-pointer" 
          onClick={() => setSelectedProject(project)}>
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2 line-clamp-2">{project.title}</h3>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <span className="capitalize">{project.category}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="h-3 w-3" />
                <span>{project.current_bid_count} bids</span>
              </div>
              <div className="flex items-center space-x-1">
                <Timer className="h-3 w-3" />
                <span>{getTimeLeft(project.bid_deadline)}</span>
              </div>
            </div>
          </div>
          <Badge className="bg-green-500">Open</Badge>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
          {project.description}
        </p>

        {/* Skills */}
        <div className="flex flex-wrap gap-2 mb-4">
          {project.required_skills?.slice(0, 3).map((skill, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {skill}
            </Badge>
          ))}
          {project.required_skills?.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{project.required_skills.length - 3} more
            </Badge>
          )}
        </div>

        {/* Budget & Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center space-x-2">
            <Coins className="h-4 w-4 text-primary" />
            <span className="font-semibold text-primary">
              {project.budget_min} - {project.budget_max} credits
            </span>
          </div>
          <Button size="sm" className="gaming-card">
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const ProjectDetailsModal = ({ project, onClose }) => {
    if (!project) return null

    return (
      <Dialog open={!!project} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Gavel className="h-5 w-5" />
              <span>{project.title}</span>
              <Badge className="bg-green-500">Open for Bidding</Badge>
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Project Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <div>
                <h3 className="font-semibold mb-3">Project Description</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{project.description}</p>
              </div>

              {/* Requirements */}
              <div>
                <h3 className="font-semibold mb-3">Skills Required</h3>
                <div className="flex flex-wrap gap-2">
                  {project.required_skills?.map((skill, index) => (
                    <Badge key={index} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </div>

              {/* Bidding Analytics */}
              {bidAnalytics && (
                <Card className="gaming-card">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <BarChart3 className="h-5 w-5" />
                      <span>Bidding Analytics</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-500">{bidAnalytics.total_bids}</div>
                        <div className="text-xs text-muted-foreground">Total Bids</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-500">{Math.round(bidAnalytics.average_bid)}</div>
                        <div className="text-xs text-muted-foreground">Avg Bid</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-500">{bidAnalytics.lowest_bid}</div>
                        <div className="text-xs text-muted-foreground">Lowest</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-500">{Math.round(bidAnalytics.success_prediction * 100)}%</div>
                        <div className="text-xs text-muted-foreground">Success Rate</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Current Bids */}
              {user?.id === project.client_id && (
                <div>
                  <h3 className="font-semibold mb-3">Current Bids ({projectBids.length})</h3>
                  <div className="space-y-4">
                    {projectBids.map((bid) => (
                      <Card key={bid.id} className="gaming-card">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="bg-gradient-gaming text-white">
                                    {bid.creator_name?.charAt(0) || "C"}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <span className="font-medium">{bid.creator_name}</span>
                                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                    <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                    <span>{bid.creator_rating}</span>
                                    <span>•</span>
                                    <span>{bid.creator_completed_orders} orders</span>
                                  </div>
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground mb-3">{bid.proposal}</p>
                              <div className="flex items-center space-x-4 text-sm">
                                <div className="flex items-center space-x-1">
                                  <Coins className="h-3 w-3 text-primary" />
                                  <span className="font-semibold">{bid.amount} credits</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Clock className="h-3 w-3 text-muted-foreground" />
                                  <span>{bid.delivery_time} days</span>
                                </div>
                              </div>
                            </div>
                            <Button size="sm" className="gaming-card">
                              Accept Bid
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Project Info */}
              <Card className="gaming-card">
                <CardHeader>
                  <CardTitle className="text-lg">Project Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Budget Range</span>
                    <span className="font-semibold">{project.budget_min} - {project.budget_max} credits</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Project Deadline</span>
                    <span className="font-semibold">{new Date(project.deadline).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Bidding Ends</span>
                    <span className="font-semibold text-orange-600">{getTimeLeft(project.bid_deadline)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Current Bids</span>
                    <span className="font-semibold">{project.current_bid_count}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Submit Bid */}
              {user?.role !== 'viewer' && user?.id !== project.client_id && (
                <Card className="gaming-card">
                  <CardHeader>
                    <CardTitle className="text-lg">Submit Your Bid</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="bid-amount">Bid Amount (Credits)</Label>
                      <Input
                        id="bid-amount"
                        type="number"
                        min={project.budget_min}
                        max={project.budget_max}
                        value={newBid.amount}
                        onChange={(e) => setNewBid({...newBid, amount: parseInt(e.target.value)})}
                      />
                      <div className="text-xs text-muted-foreground mt-1">
                        ≈ ${(newBid.amount * 0.10).toFixed(2)} USD
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="delivery-time">Delivery Time (Days)</Label>
                      <Input
                        id="delivery-time"
                        type="number"
                        min="1"
                        max="30"
                        value={newBid.delivery_time}
                        onChange={(e) => setNewBid({...newBid, delivery_time: parseInt(e.target.value)})}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="proposal">Your Proposal</Label>
                      <Textarea
                        id="proposal"
                        placeholder="Explain why you're the perfect fit for this project..."
                        value={newBid.proposal}
                        onChange={(e) => setNewBid({...newBid, proposal: e.target.value})}
                        rows={4}
                      />
                    </div>
                    
                    <Button 
                      onClick={submitBid} 
                      disabled={loading || !newBid.proposal.trim()}
                      className="w-full gaming-card"
                    >
                      {loading ? "Submitting..." : "Submit Bid"}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* AI Offer Generator */}
              <Card className="gaming-card bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Lightbulb className="h-5 w-5 text-purple-500" />
                    <span>AI Smart Bid</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Let AI analyze this project and generate the perfect bid for you!
                  </p>
                  <Button variant="outline" className="w-full">
                    <Zap className="mr-2 h-4 w-4" />
                    Generate AI Bid (5 credits)
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="container py-20">
        <div className="text-center max-w-md mx-auto">
          <Gavel className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Smart Bidding System</h1>
          <p className="text-muted-foreground mb-6">
            Please log in to access the revolutionary bidding marketplace.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-orange-600 rounded-2xl flex items-center justify-center animate-gaming-pulse">
            <Gavel className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          🏆 Smart 
          <span className="gradient-gaming bg-clip-text text-transparent"> Bidding</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Revolutionary bidding system with AI-powered matching and real-time analytics
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Active Projects", value: "127", icon: Briefcase, color: "text-blue-500" },
          { label: "Total Bids", value: "1.2K", icon: Gavel, color: "text-purple-500" },
          { label: "Avg Success Rate", value: "94%", icon: Trophy, color: "text-green-500" },
          { label: "Credits Available", value: getTokenBalance(), icon: Coins, color: "text-primary" }
        ].map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="gaming-card">
              <CardContent className="p-4 text-center">
                <Icon className={`h-6 w-6 ${stat.color} mx-auto mb-2`} />
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="browse">Browse Projects</TabsTrigger>
          <TabsTrigger value="create">Create Project</TabsTrigger>
          <TabsTrigger value="my-projects">My Projects</TabsTrigger>
          <TabsTrigger value="my-bids">My Bids</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-6">
          {/* Filters */}
          <Card className="gaming-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Filter className="h-5 w-5" />
                <span>Filters</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <Label>Category</Label>
                  <Select value={filters.category} onValueChange={(value) => setFilters({...filters, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Categories</SelectItem>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.icon} {cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Min Budget</Label>
                  <Input
                    type="number"
                    placeholder="Min credits"
                    value={filters.min_budget}
                    onChange={(e) => setFilters({...filters, min_budget: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Max Budget</Label>
                  <Input
                    type="number"
                    placeholder="Max credits"
                    value={filters.max_budget}
                    onChange={(e) => setFilters({...filters, max_budget: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Skills</Label>
                  <Input
                    placeholder="e.g. minecraft,blender"
                    value={filters.skills}
                    onChange={(e) => setFilters({...filters, skills: e.target.value})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Projects Grid */}
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-4 bg-muted rounded w-1/2" />
                      <div className="h-16 bg-muted rounded" />
                      <div className="h-4 bg-muted rounded w-2/3" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="create" className="space-y-6">
          <Card className="gaming-card max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>Create New Project</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="project-title">Project Title</Label>
                <Input
                  id="project-title"
                  placeholder="e.g. Epic Minecraft Castle Build"
                  value={newProject.title}
                  onChange={(e) => setNewProject({...newProject, title: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="project-description">Description</Label>
                <Textarea
                  id="project-description"
                  placeholder="Describe your project in detail..."
                  value={newProject.description}
                  onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                  rows={6}
                />
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <Select value={newProject.category} onValueChange={(value) => setNewProject({...newProject, category: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.icon} {cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Required Skills</Label>
                  <Input
                    placeholder="e.g. minecraft,building,redstone"
                    onChange={(e) => setNewProject({...newProject, required_skills: e.target.value.split(',')})}
                  />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Min Budget (Credits)</Label>
                  <Input
                    type="number"
                    value={newProject.budget_min}
                    onChange={(e) => setNewProject({...newProject, budget_min: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <Label>Max Budget (Credits)</Label>
                  <Input
                    type="number"
                    value={newProject.budget_max}
                    onChange={(e) => setNewProject({...newProject, budget_max: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Project Deadline</Label>
                  <Input
                    type="datetime-local"
                    value={newProject.deadline}
                    onChange={(e) => setNewProject({...newProject, deadline: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Bidding Deadline</Label>
                  <Input
                    type="datetime-local"
                    value={newProject.bid_deadline}
                    onChange={(e) => setNewProject({...newProject, bid_deadline: e.target.value})}
                  />
                </div>
              </div>
              
              <Button 
                onClick={createProject}
                disabled={loading || !newProject.title || !newProject.description}
                className="w-full gaming-card"
                size="lg"
              >
                {loading ? "Creating..." : "Create Project & Start Bidding"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my-projects" className="space-y-6">
          <div className="text-center py-12">
            <Briefcase className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Projects Yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first project to start receiving bids from talented creators.
            </p>
            <Button onClick={() => setActiveTab("create")} className="gaming-card">
              <Plus className="mr-2 h-4 w-4" />
              Create First Project
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="my-bids" className="space-y-6">
          <div className="text-center py-12">
            <Gavel className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Bids Yet</h3>
            <p className="text-muted-foreground mb-4">
              Browse projects and submit your first bid to start earning!
            </p>
            <Button onClick={() => setActiveTab("browse")} className="gaming-card">
              <Search className="mr-2 h-4 w-4" />
              Browse Projects
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Project Details Modal */}
      <ProjectDetailsModal 
        project={selectedProject} 
        onClose={() => {
          setSelectedProject(null)
          setBidAnalytics(null)
          setProjectBids([])
        }} 
      />
    </div>
  )
}