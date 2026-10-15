import { useState, useEffect } from "react"
import { MockStore } from "@/data/mockStore"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { showToast } from "@/components/ui/toaster"
import { soundFX } from "@/lib/soundEffects"
import confetti from "canvas-confetti"
import { 
  Trophy, 
  Coins, 
  Flame, 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  Gift, 
  Wand2, 
  ExternalLink,
  Zap,
  ArrowRight
} from "lucide-react"

export function GoalTracker() {
  const { user, refreshUser } = useAuth()
  const [faucetStatus, setFaucetStatus] = useState(() => MockStore.getFaucetStatus())
  const [goals, setGoals] = useState(() => MockStore.getGoals())
  const [claimingFaucet, setClaimingFaucet] = useState(false)
  const [activeTab, setActiveTab] = useState<"quests" | "faucet" | "tools">("quests")

  // Refresh faucet status timer
  useEffect(() => {
    const timer = setInterval(() => {
      setFaucetStatus(MockStore.getFaucetStatus())
    }, 10000)
    return () => clearInterval(timer)
  }, [])

  const handleClaimFaucet = () => {
    setClaimingFaucet(true)
    setTimeout(() => {
      const res = MockStore.claimDailyFaucet()
      setClaimingFaucet(false)
      if (res.success) {
        soundFX.playCoin()
        try {
          confetti({
            particleCount: 60,
            spread: 60,
            origin: { y: 0.7 }
          })
        } catch {
          // ignore
        }
        showToast({
          title: "Daily Faucet Claimed!",
          description: `+${res.creditsAdded} Free Waya Tokens added! Current Streak: Day ${res.streak} 🔥`,
          variant: "success"
        })
        setFaucetStatus(MockStore.getFaucetStatus())
        setGoals(MockStore.getGoals())
        refreshUser()
      }
    }, 400)
  }

  const handleClaimGoal = (goalId: string, title: string) => {
    const res = MockStore.claimGoalReward(goalId)
    if (res.success) {
      soundFX.playFanfare()
      try {
        confetti({
          particleCount: 70,
          spread: 70,
          origin: { y: 0.6 }
        })
      } catch {
        // ignore
      }
      showToast({
        title: "Quest Completed!",
        description: `Awarded +${res.tokens} Tokens & +${res.xp} XP for "${title}".`,
        variant: "success"
      })
      setGoals(MockStore.getGoals())
      refreshUser()
    }
  }

  const formatRemainingTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${mins}m`
  }

  const freeAiTools = [
    {
      title: "Gemini 2.5 Flash Free Copilot",
      desc: "Instant high-speed prompt generation for 3D game concepts, UV unwrapping steps & tutorial titles with zero token cost.",
      tag: "Built-In AI",
      badge: "Free Tier"
    },
    {
      title: "Dream Textures (Blender)",
      desc: "Free open-source Blender add-on to generate PBR seamless textures, roughness maps, and normal maps directly in your viewport.",
      tag: "Blender Plugin",
      badge: "Open Source"
    },
    {
      title: "Poly Haven PBR Library",
      desc: "100% free CC0 3D models, textures, and HDRIs that you can bundle with your tutorials and marketplace packs.",
      tag: "Asset Resource",
      badge: "CC0 Free"
    },
    {
      title: "Audacity Open Audio Engine",
      desc: "Free sound effect editor and noise suppressor for cleaning up microphone audio during livestreams and tutorial recordings.",
      tag: "Audio Tool",
      badge: "Open Source"
    }
  ]

  return (
    <Card className="border-border bg-card overflow-hidden">
      <CardHeader className="p-4 sm:p-5 border-b bg-muted/20">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-gradient-gaming rounded-xl text-white">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg font-black flex items-center gap-2">
                Creator Quests &amp; Free Daily Faucet
                <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px] gap-1">
                  <Flame className="h-3 w-3 fill-current" />
                  Streak: Day {faucetStatus.streak}
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs">
                Earn free tokens every 24h, level up your creator rank, and access free AI development tools
              </CardDescription>
            </div>
          </div>

          <div className="flex gap-1 border rounded-lg p-0.5 bg-muted/50 text-xs font-semibold self-stretch sm:self-auto justify-center">
            <button
              onClick={() => setActiveTab("quests")}
              className={`px-3 py-1 rounded-md transition-colors ${
                activeTab === "quests" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Active Quests
            </button>
            <button
              onClick={() => setActiveTab("faucet")}
              className={`px-3 py-1 rounded-md transition-colors ${
                activeTab === "faucet" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Daily Faucet
            </button>
            <button
              onClick={() => setActiveTab("tools")}
              className={`px-3 py-1 rounded-md transition-colors ${
                activeTab === "tools" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Free AI Tools
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5">
        {/* Tab 1: Quests */}
        {activeTab === "quests" && (
          <div className="space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              {goals.map((g: { id: string; title: string; description: string; category: string; progress: number; target: number; rewardTokens: number; rewardXP: number; claimed: boolean }) => {
                const isReady = g.progress >= g.target
                return (
                  <div
                    key={g.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      g.claimed
                        ? "bg-muted/30 border-muted opacity-75"
                        : isReady
                        ? "bg-gradient-to-r from-emerald-500/10 to-primary/5 border-emerald-500/30"
                        : "bg-card hover:border-primary/40"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1.5">
                      <div className="space-y-0.5">
                        <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                          {g.claimed ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                          ) : (
                            <Zap className="h-3.5 w-3.5 text-amber-500" />
                          )}
                          {g.title}
                        </span>
                        <p className="text-[11px] text-muted-foreground line-clamp-1">{g.description}</p>
                      </div>

                      <Badge variant="outline" className="text-[10px] shrink-0 font-mono text-primary border-primary/20">
                        +{g.rewardTokens} cr • +{g.rewardXP} XP
                      </Badge>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1 mt-2">
                      <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                        <span>Progress: {g.progress}/{g.target}</span>
                        <span>{Math.round((g.progress / g.target) * 100)}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${Math.min(100, (g.progress / g.target) * 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-3">
                      {g.claimed ? (
                        <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Reward Claimed
                        </div>
                      ) : isReady ? (
                        <Button
                          size="sm"
                          onClick={() => handleClaimGoal(g.id, g.title)}
                          className="w-full h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                        >
                          <Gift className="mr-1.5 h-3.5 w-3.5" />
                          Claim Reward (+{g.rewardTokens} Tokens)
                        </Button>
                      ) : (
                        <span className="text-[10px] text-muted-foreground italic">
                          Action pending • Complete in app to unlock
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Faucet */}
        {activeTab === "faucet" && (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl border bg-gradient-to-br from-emerald-500/10 via-primary/5 to-transparent text-center space-y-3">
              <div className="w-14 h-14 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                <Gift className="h-7 w-7" />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-black">Daily Community Faucet</h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  Every user on WayaCreate receives free daily tokens to spend on creator tips, 3D asset downloads, and community bounties!
                </p>
              </div>

              <div className="inline-flex items-center gap-2 p-2 px-4 rounded-full bg-card border text-xs font-bold text-primary">
                <Flame className="h-4 w-4 text-amber-500 fill-current" />
                <span>Day {faucetStatus.streak} Consecutive Streak (+{faucetStatus.faucetAmount} Tokens / day)</span>
              </div>

              <div className="pt-2">
                {faucetStatus.canClaim ? (
                  <Button
                    size="sm"
                    disabled={claimingFaucet}
                    onClick={handleClaimFaucet}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-6 h-9 shadow-lg shadow-emerald-600/20"
                  >
                    <Coins className="mr-2 h-4 w-4 fill-current animate-bounce" />
                    {claimingFaucet ? "Dispensing Tokens..." : `Claim +${faucetStatus.faucetAmount} Free Tokens Now`}
                  </Button>
                ) : (
                  <div className="inline-flex items-center space-x-2 text-xs text-muted-foreground bg-muted/60 px-4 py-2 rounded-xl">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>Next claim available in: <strong>{formatRemainingTime(faucetStatus.remainingSeconds)}</strong></span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Free AI Tools */}
        {activeTab === "tools" && (
          <div className="grid sm:grid-cols-2 gap-3">
            {freeAiTools.map((tool, i) => (
              <div key={i} className="p-4 rounded-xl border bg-card space-y-2 flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                      <Wand2 className="h-3.5 w-3.5 text-primary" />
                      {tool.title}
                    </span>
                    <Badge variant="secondary" className="text-[10px]">
                      {tool.badge}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {tool.desc}
                  </p>
                </div>
                <div className="pt-2 flex items-center justify-between text-[11px] text-primary font-semibold">
                  <span>{tool.tag}</span>
                  <span className="flex items-center gap-1">
                    Free Forever
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
