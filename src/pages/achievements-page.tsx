import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { MockStore } from "@/data/mockStore"
import { Achievement, SkillNode, AISkillEvaluation, AIBadge } from "@/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { showToast } from "@/components/ui/toaster"
import { soundFX } from "@/lib/soundEffects"
import { 
  CAREER_PATHS, 
  runAISkillAudit, 
  applyAiSkillAuditToProfile,
  ALL_AI_BADGES
} from "@/lib/aiSkillCoach"
import { 
  Award, 
  Trophy, 
  Sparkles, 
  CheckCircle2, 
  Zap, 
  Lock,
  ArrowUpCircle,
  Star,
  BrainCircuit,
  Compass,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  RefreshCw,
  Flame,
  Check
} from "lucide-react"
import confetti from "canvas-confetti"

export function AchievementsPage() {
  const { user, refreshUser } = useAuth()
  const [achievements] = useState<Achievement[]>(() => MockStore.getAchievements())
  const [skills, setSkills] = useState<SkillNode[]>(() => MockStore.getSkills())
  
  // AI Growth State
  const [selectedCareerId, setSelectedCareerId] = useState(CAREER_PATHS[0].id)
  const [isAuditing, setIsAuditing] = useState(false)
  const [auditResult, setAuditResult] = useState<AISkillEvaluation | null>(() => user?.ai_skill_evaluation || null)
  const [isApplying, setIsApplying] = useState(false)

  const handleUpgradeSkill = (skillId: string) => {
    const success = MockStore.levelUpSkill(skillId)
    if (success) {
      setSkills(MockStore.getSkills())
      refreshUser()
      try {
        confetti({ particleCount: 50, spread: 60 })
      } catch (e) {}

      showToast({
        title: "Skill Upgraded! ⚡",
        description: "Earned +150 XP towards your creator tier progression.",
        variant: "success"
      })
    }
  }

  const handleRunAiAudit = async () => {
    if (!user) return
    setIsAuditing(true)
    soundFX.playClick()

    try {
      // Simulate real-time neural evaluation pass
      await new Promise(r => setTimeout(r, 900))
      const evalResult = await runAISkillAudit(selectedCareerId, user, skills)
      setAuditResult(evalResult)
      soundFX.playFanfare()
      try {
        confetti({ particleCount: 70, spread: 70 })
      } catch (e) {}

      showToast({
        title: "AI Skill Audit Complete! 🧠",
        description: `Overall Score: ${evalResult.overall_score}/100 • ${evalResult.badges_awarded.length} Badges Evaluated.`,
        variant: "success"
      })
    } catch (e) {
      showToast({
        title: "Audit Error",
        description: "Could not complete AI audit. Try again.",
        variant: "destructive"
      })
    } finally {
      setIsAuditing(false)
    }
  }

  const handleApplyToProfile = async () => {
    if (!auditResult || !user) return
    setIsApplying(true)

    try {
      await applyAiSkillAuditToProfile(auditResult, user)
      refreshUser()
      soundFX.playFanfare()
      try {
        confetti({ particleCount: 100, spread: 90 })
      } catch (e) {}

      showToast({
        title: "AI Endorsements Saved to Profile! 🌟",
        description: "Your verified badges and skill ratings are now published to your public profile and Firestore.",
        variant: "success"
      })
    } catch (e) {
      showToast({
        title: "Sync Error",
        description: "Failed to persist to profile.",
        variant: "destructive"
      })
    } finally {
      setIsApplying(false)
    }
  }

  const xpPercent = user?.level ? Math.min(100, Math.round((user.level.xp / user.level.xp_to_next) * 100)) : 75
  const activeBadges: AIBadge[] = user?.ai_badges?.length ? user.ai_badges : ALL_AI_BADGES.slice(0, 3)

  return (
    <div className="container py-8 md:py-12 space-y-8">
      {/* Level Header Banner */}
      <Card className="gradient-primary text-white p-6 md:p-8 rounded-2xl shadow-xl border-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-white/20 text-white hover:bg-white/30 text-xs border-0">
                {user?.level.tier || "Gold"} Tier Creator
              </Badge>
              <Badge className="bg-emerald-500 text-white text-xs border-0 flex items-center gap-1">
                <BrainCircuit className="h-3 w-3" />
                AI Rating: {user?.ai_rating || 96}/100 (Master)
              </Badge>
              <span className="text-xs opacity-90">Production Progression Hub</span>
            </div>

            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">
              Level {user?.level.level || 18} • {user?.level.title || "Master Game Architect"}
            </h1>
            <p className="text-xs md:text-sm opacity-90 max-w-xl leading-relaxed">
              Level up your skill tree, get evaluated by the AI Skill Coach, earn verifiable blockchain-ready badges, and showcase your ratings on your public profile.
            </p>
          </div>

          <div className="w-full md:w-72 bg-black/30 backdrop-blur-md p-4 rounded-xl space-y-2 border border-white/10">
            <div className="flex justify-between text-xs font-semibold">
              <span>XP Progress</span>
              <span>{user?.level.xp || 4850} / {user?.level.xp_to_next || 6000} XP</span>
            </div>
            <Progress value={xpPercent} className="h-2.5 bg-white/20" />
            <div className="text-[10px] text-right opacity-80">{xpPercent}% to Level {(user?.level.level || 18) + 1}</div>
          </div>
        </div>
      </Card>

      {/* ================= AI SKILL COACH & GROWTH ENGINE ================= */}
      <Card className="border-border bg-card shadow-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/10 via-purple-500/10 to-transparent border-b p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-primary text-primary-foreground rounded-2xl shadow-md">
                <BrainCircuit className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-xl md:text-2xl font-black">
                    AI Career &amp; Skill Growth Engine
                  </CardTitle>
                  <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px]">
                    Autonomous AI Coach
                  </Badge>
                </div>
                <CardDescription className="text-xs mt-0.5">
                  Select your target creative specialty to receive an AI skill gap analysis, personalized milestones, and verified credentials.
                </CardDescription>
              </div>
            </div>

            <Button
              onClick={handleRunAiAudit}
              disabled={isAuditing}
              className="bg-primary text-primary-foreground font-bold text-xs h-10 px-5 shadow-md shrink-0"
            >
              {isAuditing ? <RefreshCw className="mr-1.5 h-4 w-4 animate-spin" /> : <Sparkles className="mr-1.5 h-4 w-4" />}
              {isAuditing ? "Auditing Skills..." : "Run AI Skill Audit"}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Target Career Specialty Picker */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-3">
              <Compass className="h-4 w-4 text-primary" />
              Choose Target Career Specialty:
            </label>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {CAREER_PATHS.map((path) => (
                <div
                  key={path.id}
                  onClick={() => setSelectedCareerId(path.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all space-y-1.5 ${
                    selectedCareerId === path.id
                      ? "border-primary bg-primary/10 shadow-md ring-1 ring-primary"
                      : "border-border bg-card/60 hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs line-clamp-1">{path.title}</span>
                    {selectedCareerId === path.id && (
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                    {path.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Audit Results Presentation */}
          {auditResult && (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/5 via-card to-card border border-primary/20 space-y-5 animate-in fade-in-50">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black">{auditResult.target_career}</span>
                    <Badge className="bg-emerald-500 text-white font-bold text-[10px]">
                      {auditResult.tier}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Evaluated on {new Date(auditResult.evaluated_at).toLocaleDateString()} • Overall Score:{" "}
                    <strong className="text-primary font-black">{auditResult.overall_score}/100</strong>
                  </p>
                </div>

                <Button
                  onClick={handleApplyToProfile}
                  disabled={isApplying}
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 shadow-md"
                >
                  {isApplying ? <RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />}
                  {isApplying ? "Saving..." : "Apply Badges & Rating to Profile"}
                </Button>
              </div>

              {/* Summary */}
              <div className="p-3.5 bg-primary/5 border border-primary/20 rounded-xl text-xs leading-relaxed text-foreground">
                <strong className="text-primary block mb-1">AI Executive Analysis:</strong>
                {auditResult.summary}
              </div>

              {/* Two Column Breakdown: Strengths & Next Steps */}
              <div className="grid md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl border bg-card space-y-2">
                  <span className="font-bold text-emerald-500 flex items-center gap-1.5">
                    <Check className="h-4 w-4" />
                    Core Demonstrated Strengths:
                  </span>
                  <ul className="space-y-1.5 text-muted-foreground">
                    {auditResult.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-500 font-bold">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl border bg-card space-y-2">
                  <span className="font-bold text-amber-500 flex items-center gap-1.5">
                    <TrendingUp className="h-4 w-4" />
                    Recommended Next-Level Actions:
                  </span>
                  <ul className="space-y-1.5 text-muted-foreground">
                    {auditResult.recommended_actions.map((a, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-amber-500 font-bold">•</span>
                        <span>{a}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Skill Ratings Matrix */}
              <div>
                <span className="font-bold text-xs uppercase tracking-wider text-muted-foreground block mb-2.5">
                  Detailed Skill Competency Matrix:
                </span>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(auditResult.skill_ratings).map(([skillTitle, data]) => (
                    <div key={skillTitle} className="p-3.5 rounded-xl border bg-card space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-xs">{skillTitle}</span>
                        <Badge variant="outline" className="text-[10px] font-black border-primary/40 text-primary">
                          {data.grade} ({data.score})
                        </Badge>
                      </div>
                      <Progress value={data.score} className="h-1.5" />
                      <p className="text-[11px] text-muted-foreground leading-tight pt-1">
                        {data.feedback}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ================= VERIFIED AI BADGES SHOWCASE ================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            <h2 className="text-xl font-bold">AI Endorsed Credentials &amp; Badges</h2>
          </div>
          <Badge variant="outline" className="text-xs text-primary border-primary/30">
            {activeBadges.length} Active Badges
          </Badge>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeBadges.map((badge) => (
            <Card key={badge.id} className="gaming-card border-border bg-card p-5 space-y-3 relative overflow-hidden group">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-3xl p-2.5 rounded-xl bg-primary/10 border border-primary/20">
                    {badge.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm line-clamp-1">{badge.name}</h4>
                    <span className="text-[11px] text-muted-foreground">{badge.category}</span>
                  </div>
                </div>

                <Badge className={`text-[10px] font-bold ${
                  badge.tier === "Diamond" ? "bg-cyan-500 text-white" :
                  badge.tier === "Platinum" ? "bg-purple-500 text-white" : "bg-amber-500 text-white"
                }`}>
                  {badge.tier}
                </Badge>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                {badge.description}
              </p>

              <div className="pt-2 border-t flex items-center justify-between text-[11px]">
                <span className="text-emerald-500 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Verified by AI
                </span>
                <span className="text-muted-foreground font-mono">Score: {badge.score}/100</span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* ================= CREATOR SKILL TREE ================= */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Zap className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">Interactive Creator Skill Tree</h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {skills.map((skill) => (
            <Card key={skill.id} className="gaming-card border-border bg-card p-5 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2.5">
                    <span className="text-2xl">{skill.icon}</span>
                    <div>
                      <h3 className="font-bold text-sm">{skill.name}</h3>
                      <div className="text-[11px] text-muted-foreground capitalize">{skill.category}</div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs text-primary border-primary/30 font-bold">
                    Lvl {skill.level} / {skill.max_level}
                  </Badge>
                </div>

                <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                  {skill.description}
                </p>

                <div className="space-y-1.5 mt-3">
                  <div className="flex justify-between text-[11px] text-muted-foreground font-medium">
                    <span>Proficiency</span>
                    <span>{skill.current_xp} / {skill.xp_required} XP</span>
                  </div>
                  <Progress value={Math.round((skill.current_xp / skill.xp_required) * 100)} className="h-1.5" />
                </div>
              </div>

              <div className="pt-3 border-t mt-3 flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">
                  {skill.level >= skill.max_level ? "Mastered" : "+150 XP on Upgrade"}
                </span>
                <Button
                  size="sm"
                  disabled={skill.level >= skill.max_level}
                  onClick={() => handleUpgradeSkill(skill.id)}
                  className="h-7 text-xs bg-primary text-primary-foreground font-semibold"
                >
                  <ArrowUpCircle className="mr-1 h-3.5 w-3.5" />
                  {skill.level >= skill.max_level ? "Max Level" : "Upgrade Skill"}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* ================= ACHIEVEMENTS LIST ================= */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Award className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">Earned Badges &amp; Rewards</h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((ach) => (
            <Card key={ach.id} className={`gaming-card border-border bg-card p-4 ${ach.unlocked ? "border-emerald-500/30" : "opacity-75"}`}>
              <div className="flex items-start space-x-3">
                <span className="text-3xl p-2 bg-muted/60 rounded-xl">{ach.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm truncate">{ach.name}</h4>
                    {ach.unlocked && (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {ach.description}
                  </p>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t text-[11px]">
                    <span className="text-primary font-bold">+{ach.reward_credits} Credits Reward</span>
                    <span className="text-muted-foreground">{ach.progress} / {ach.max_progress}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
