import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { MockStore } from "@/data/mockStore"
import { BiddingProject, Bid } from "@/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { showToast } from "@/components/ui/toaster"
import { 
  Gavel, 
  Coins, 
  Clock, 
  CheckCircle2, 
  Plus, 
  Sparkles, 
  Users, 
  TrendingUp, 
  ShieldCheck,
  Star,
  Send
} from "lucide-react"

export function BiddingPage() {
  const { user } = useAuth()
  const [projects, setProjects] = useState<BiddingProject[]>(() => MockStore.getProjects())

  // New Bid State
  const [selectedProject, setSelectedProject] = useState<BiddingProject | null>(null)
  const [bidAmount, setBidAmount] = useState<number>(500)
  const [bidDeliveryDays, setBidDeliveryDays] = useState<number>(7)
  const [bidProposal, setBidProposal] = useState("")
  const [isBidModalOpen, setIsBidModalOpen] = useState(false)

  // New Project Tender State
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newDesc, setNewDesc] = useState("")
  const [newCategory, setNewCategory] = useState("gaming")
  const [newBudgetMin, setNewBudgetMin] = useState(400)
  const [newBudgetMax, setNewBudgetMax] = useState(1200)
  const [newSkills, setNewSkills] = useState("Blender, Unreal Engine 5, C#")

  const handleOpenBid = (prj: BiddingProject) => {
    setSelectedProject(prj)
    setBidAmount(Math.round((prj.budget_min + prj.budget_max) / 2))
    setBidDeliveryDays(7)
    setBidProposal("")
    setIsBidModalOpen(true)
  }

  const handleSubmitBid = () => {
    if (!selectedProject || !bidProposal.trim()) {
      showToast({
        title: "Proposal Required",
        description: "Please write a brief pitch for why you are the best fit for this project.",
        variant: "destructive"
      })
      return
    }

    MockStore.addBidToProject(selectedProject.id, {
      amount: Number(bidAmount),
      delivery_time: Number(bidDeliveryDays),
      proposal: bidProposal,
    })

    setProjects(MockStore.getProjects())
    showToast({
      title: "Bid Submitted!",
      description: `Your bid of ${bidAmount} credits was placed on "${selectedProject.title}".`,
      variant: "success"
    })
    setIsBidModalOpen(false)
  }

  const handleCreateProject = () => {
    if (!newTitle.trim() || !newDesc.trim()) {
      showToast({
        title: "Missing Fields",
        description: "Please provide a title and detailed description for your tender.",
        variant: "destructive"
      })
      return
    }

    const created = MockStore.addProject({
      client_id: user?.id || "usr_guest",
      client_name: user?.display_name || "Guest Client",
      title: newTitle,
      description: newDesc,
      category: newCategory,
      required_skills: newSkills.split(",").map(s => s.trim()).filter(Boolean),
      budget_min: Number(newBudgetMin),
      budget_max: Number(newBudgetMax),
      deadline: "2026-12-01",
      status: "open",
    })

    setProjects(MockStore.getProjects())
    showToast({
      title: "Tender Published!",
      description: `Your project "${created.title}" is now open for creator proposals.`,
      variant: "success"
    })
    setIsNewProjectModalOpen(false)
    setNewTitle("")
    setNewDesc("")
  }

  return (
    <div className="container py-8 md:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <div className="p-2 bg-gradient-gaming rounded-xl text-white">
              <Gavel className="h-5 w-5" />
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">
              Smart Bidding &amp; Tenders
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Post development tenders or bid on gaming, 3D modeling, and netcode contracts with escrow security.
          </p>
        </div>

        <Button onClick={() => setIsNewProjectModalOpen(true)} className="bg-primary text-primary-foreground font-semibold">
          <Plus className="mr-1.5 h-4 w-4" />
          Post a New Tender
        </Button>
      </div>

      {/* AI Bidding Market Overview */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="gaming-card border-border bg-card">
          <CardContent className="p-4 flex items-center space-x-3">
            <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-xl">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Average Winning Bid</div>
              <div className="text-xl font-bold">1,020 Credits</div>
            </div>
          </CardContent>
        </Card>
        <Card className="gaming-card border-border bg-card">
          <CardContent className="p-4 flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-xl">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Escrow Fulfillment Rate</div>
              <div className="text-xl font-bold">99.4%</div>
            </div>
          </CardContent>
        </Card>
        <Card className="gaming-card border-border bg-card">
          <CardContent className="p-4 flex items-center space-x-3">
            <div className="p-2.5 bg-purple-500/10 text-purple-500 rounded-xl">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">AI Match Recommendation</div>
              <div className="text-xl font-bold">Active</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projects List */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold">Active Open Tenders ({projects.length})</h2>

        <div className="space-y-4">
          {projects.map((project) => (
            <Card key={project.id} className="gaming-card border-border bg-card p-6">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs capitalize font-semibold border-primary/30 text-primary">
                      {project.category}
                    </Badge>
                    <Badge className="bg-emerald-500 text-white text-[10px]">
                      Open for Bids
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Posted by {project.client_name}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold">{project.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {project.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {project.required_skills.map((skill, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col justify-between items-end border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6 min-w-[200px]">
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">Budget Range</div>
                    <div className="text-xl font-black text-primary">
                      {project.budget_min} - {project.budget_max}
                    </div>
                    <div className="text-[11px] text-muted-foreground">credits</div>
                  </div>

                  <div className="w-full mt-4 flex flex-col gap-2">
                    <Button onClick={() => handleOpenBid(project)} size="sm" className="w-full bg-primary text-primary-foreground font-semibold">
                      <Gavel className="mr-1.5 h-4 w-4" />
                      Place Bid ({project.bids.length} placed)
                    </Button>
                  </div>
                </div>
              </div>

              {/* Existing Bids Breakdown */}
              {project.bids.length > 0 && (
                <div className="mt-6 pt-4 border-t space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                    <span>Submitted Proposals:</span>
                    <span>AI Predicted Delivery: ~{Math.round(project.bids.reduce((acc, b) => acc + b.delivery_time, 0) / project.bids.length)} days</span>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    {project.bids.map((b) => (
                      <div key={b.id} className="p-3 bg-muted/40 rounded-xl border border-border/60 text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold">{b.creator_name}</span>
                            <Badge variant="outline" className="text-[10px]">Lvl {b.creator_level}</Badge>
                            <div className="flex items-center text-yellow-500">
                              <Star className="h-3 w-3 fill-current" />
                              <span className="text-[10px] ml-0.5">{b.creator_rating}</span>
                            </div>
                          </div>
                          <span className="font-black text-primary">{b.amount} credits ({b.delivery_time}d)</span>
                        </div>
                        <p className="text-muted-foreground line-clamp-2 italic">
                          "{b.proposal}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* Place Bid Modal */}
      {selectedProject && (
        <Dialog open={isBidModalOpen} onOpenChange={setIsBidModalOpen}>
          <DialogHeader>
            <DialogTitle>Place Bid on: {selectedProject.title}</DialogTitle>
            <DialogDescription>
              Client budget: {selectedProject.budget_min} - {selectedProject.budget_max} credits
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold">Your Bid (Credits):</label>
                <Input
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(Number(e.target.value))}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold">Delivery Time (Days):</label>
                <Input
                  type="number"
                  value={bidDeliveryDays}
                  onChange={(e) => setBidDeliveryDays(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold">Your Proposal &amp; Approach:</label>
              <Textarea
                placeholder="Explain your technical strategy, similar work you've done, and confirm inclusion of the breakdown tutorial..."
                rows={4}
                value={bidProposal}
                onChange={(e) => setBidProposal(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setIsBidModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSubmitBid} className="bg-primary text-primary-foreground">
              Submit Official Proposal
            </Button>
          </DialogFooter>
        </Dialog>
      )}

      {/* Create New Tender Modal */}
      <Dialog open={isNewProjectModalOpen} onOpenChange={setIsNewProjectModalOpen}>
        <DialogHeader>
          <DialogTitle>Post a New Development Tender</DialogTitle>
          <DialogDescription>
            Describe your project scope. Verified creators will submit bids and proposals.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold">Project Title:</label>
            <Input
              placeholder="e.g. Procedural Inventory System in Unity C#"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold">Category:</label>
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm"
            >
              <option value="gaming">Gaming</option>
              <option value="development">Game Programming / Netcode</option>
              <option value="design">3D Design &amp; Modeling</option>
              <option value="content">Video Editing &amp; Trailers</option>
              <option value="audio">Audio &amp; SFX</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold">Min Budget (Credits):</label>
              <Input
                type="number"
                value={newBudgetMin}
                onChange={(e) => setNewBudgetMin(Number(e.target.value))}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold">Max Budget (Credits):</label>
              <Input
                type="number"
                value={newBudgetMax}
                onChange={(e) => setNewBudgetMax(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold">Required Skills (Comma separated):</label>
            <Input
              value={newSkills}
              onChange={(e) => setNewSkills(e.target.value)}
              placeholder="Blender, UE5, C#, Shaders"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold">Detailed Specification &amp; Deliverables:</label>
            <Textarea
              placeholder="Detail polygon limits, performance requirements, and tutorial expectations..."
              rows={4}
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => setIsNewProjectModalOpen(false)}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleCreateProject} className="bg-primary text-primary-foreground">
            Publish Tender
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  )
}
