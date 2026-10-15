import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { MockStore } from "@/data/mockStore"
import { Achievement, SkillNode } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { showToast } from "@/components/ui/toaster"
import { 
  Award, 
  Trophy, 
  Sparkles, 
  CheckCircle2, 
  Zap, 
  Lock,
  ArrowUpCircle,
  Star
} from "lucide-react"
import confetti from "canvas-confetti"

export function AchievementsPage() {
  const { user, refreshUser } = useAuth()
  const [achievements] = useState<Achievement[]>(() => MockStore.getAchievements())
  const [skills, setSkills] = useState<SkillNode[]>(() => MockStore.getSkills())

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

  const xpPercent = user?.level ? Math.min(100, Math.round((user.level.xp / user.level.xp_to_next) * 100)) : 75

  return (
    <div className="container py-8 md:py-12 space-y-8">
      {/* Level Header Banner */}
      <Card className="gradient-primary text-white p-6 rounded-2xl shadow-lg border-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Badge className="bg-white/20 text-white hover:bg-white/30 text-xs border-0">
                {user?.level.tier || "Gold"} Tier Creator
              </Badge>
              <span className="text-xs opacity-90">Progression Tracker</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">
              Level {user?.level.level || 18} • {user?.level.title || "Master Game Architect"}
            </h1>
            <p className="text-xs md:text-sm opacity-90 max-w-lg">
              Unlock new creator badges, lower platform fees, and get featured in the WayaCreate showcase by leveling up your skill tree.
            </p>
          </div>

          <div className="w-full md:w-64 bg-black/20 backdrop-blur-md p-4 rounded-xl space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span>XP Progress</span>
              <span>{user?.level.xp} / {user?.level.xp_to_next} XP</span>
            </div>
            <Progress value={xpPercent} className="h-2.5 bg-white/20" />
            <div className="text-[10px] text-right opacity-80">{xpPercent}% to Level {(user?.level.level || 18) + 1}</div>
          </div>
        </div>
      </Card>

      {/* Interactive Skill Tree */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Zap className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">Creator Skill Tree</h2>
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

      {/* Achievements List */}
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
