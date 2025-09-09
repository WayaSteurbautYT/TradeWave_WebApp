import React, { useState, useEffect } from "react"
import axios from "axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/AuthContext"
import { useTokens } from "@/contexts/TokenContext"
import { 
  Trophy,
  Star,
  Crown,
  Zap,
  Target,
  Award,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  Lock,
  Gift,
  Sparkles,
  Flame,
  Shield
} from "lucide-react"

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL
const API = `${BACKEND_URL}/api`

export function AchievementsPage() {
  const { user, isAuthenticated } = useAuth()
  const { getTokenBalance } = useTokens()
  const [achievements, setAchievements] = useState([])
  const [userAchievements, setUserAchievements] = useState([])
  const [loading, setLoading] = useState(true)
  const [userStats, setUserStats] = useState({})

  useEffect(() => {
    if (isAuthenticated) {
      fetchAchievements()
      fetchUserAchievements()
      fetchUserStats()
    }
  }, [isAuthenticated])

  const fetchAchievements = async () => {
    try {
      const response = await axios.get(`${API}/achievements`)
      setAchievements(response.data)
    } catch (error) {
      console.error('Error fetching achievements:', error)
    }
  }

  const fetchUserAchievements = async () => {
    try {
      const response = await axios.get(`${API}/users/${user.id}/achievements`, {
        withCredentials: true
      })
      setUserAchievements(response.data)
    } catch (error) {
      console.error('Error fetching user achievements:', error)
    }
  }

  const fetchUserStats = async () => {
    try {
      // Simulate user stats - in real app this would come from backend
      setUserStats({
        orders_completed: 8,
        five_star_orders: 3,
        total_reviews: 12,
        total_revenue: 2500,
        level: 3,
        xp: 350,
        xp_to_next: 500,
        tier: "Silver",
        streak_days: 7
      })
    } catch (error) {
      console.error('Error fetching user stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkAchievements = async () => {
    try {
      const response = await axios.post(`${API}/users/check-achievements`, {}, {
        withCredentials: true
      })
      
      if (response.data.unlocked_achievements.length > 0) {
        alert(`🎉 Congratulations! You unlocked ${response.data.unlocked_achievements.length} new achievements!`)
        fetchUserAchievements()
      } else {
        alert("No new achievements unlocked. Keep creating!")
      }
    } catch (error) {
      console.error('Error checking achievements:', error)
      alert('Failed to check achievements')
    }
  }

  const getAchievementProgress = (achievement) => {
    const criteria = achievement.criteria
    const category = achievement.category
    
    switch (category) {
      case "sales":
        return Math.min(100, (userStats.orders_completed / criteria.orders_completed) * 100)
      case "quality":
        return Math.min(100, (userStats.five_star_orders / criteria.five_star_orders) * 100)
      case "engagement":
        return Math.min(100, (userStats.total_reviews / criteria.total_reviews) * 100)
      case "revenue":
        return Math.min(100, (userStats.total_revenue / criteria.total_revenue) * 100)
      default:
        return 0
    }
  }

  const isAchievementUnlocked = (achievementId) => {
    return userAchievements.some(ua => ua.achievement.id === achievementId)
  }

  const getProgressText = (achievement) => {
    const criteria = achievement.criteria
    const category = achievement.category
    
    switch (category) {
      case "sales":
        return `${userStats.orders_completed}/${criteria.orders_completed} orders completed`
      case "quality":
        return `${userStats.five_star_orders}/${criteria.five_star_orders} 5-star orders`
      case "engagement":
        return `${userStats.total_reviews}/${criteria.total_reviews} total reviews`
      case "revenue":
        return `${userStats.total_revenue}/${criteria.total_revenue} credits earned`
      default:
        return "Progress tracking"
    }
  }

  const getLevelProgress = () => {
    return (userStats.xp / userStats.xp_to_next) * 100
  }

  const getTierColor = (tier) => {
    switch (tier) {
      case "Bronze": return "text-orange-600"
      case "Silver": return "text-gray-500"
      case "Gold": return "text-yellow-500"
      case "Platinum": return "text-blue-500"
      case "Diamond": return "text-purple-500"
      default: return "text-gray-500"
    }
  }

  const getTierIcon = (tier) => {
    switch (tier) {
      case "Bronze": return Shield
      case "Silver": return Star
      case "Gold": return Crown
      case "Platinum": return Trophy
      case "Diamond": return Sparkles
      default: return Shield
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="container py-20">
        <div className="text-center max-w-md mx-auto">
          <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Achievements & Rewards</h1>
          <p className="text-muted-foreground mb-6">
            Please log in to view your achievements and progress.
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
          <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center animate-gaming-pulse">
            <Trophy className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          🏆 Achievements 
          <span className="gradient-gaming bg-clip-text text-transparent"> & Rewards</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Level up your creator journey and unlock amazing rewards!
        </p>
      </div>

      {/* User Progress Overview */}
      <div className="max-w-4xl mx-auto mb-8">
        <Card className="gaming-card bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Level Progress */}
              <div className="text-center">
                <div className="flex items-center justify-center mb-3">
                  {(() => {
                    const TierIcon = getTierIcon(userStats.tier)
                    return <TierIcon className={`h-8 w-8 ${getTierColor(userStats.tier)}`} />
                  })()}
                </div>
                <div className="text-2xl font-bold mb-1">Level {userStats.level}</div>
                <div className={`text-sm font-medium mb-3 ${getTierColor(userStats.tier)}`}>
                  {userStats.tier} Creator
                </div>
                <Progress value={getLevelProgress()} className="h-2 mb-2" />
                <div className="text-xs text-muted-foreground">
                  {userStats.xp}/{userStats.xp_to_next} XP
                </div>
              </div>

              {/* Credits Balance */}
              <div className="text-center">
                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Gift className="h-5 w-5 text-green-500" />
                </div>
                <div className="text-2xl font-bold mb-1">{getTokenBalance()}</div>
                <div className="text-sm text-muted-foreground mb-3">Credits Available</div>
                <Button size="sm" onClick={checkAchievements} className="gaming-card">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Check Progress
                </Button>
              </div>

              {/* Streak */}
              <div className="text-center">
                <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Flame className="h-5 w-5 text-orange-500" />
                </div>
                <div className="text-2xl font-bold mb-1">{userStats.streak_days}</div>
                <div className="text-sm text-muted-foreground mb-3">Day Streak</div>
                <Badge className="bg-orange-500">
                  🔥 On Fire!
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Achievements Grid */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unlocked">Unlocked</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="quality">Quality</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-12 h-12 bg-muted rounded-full" />
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded w-full" />
                      <div className="h-2 bg-muted rounded w-full" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements.map((achievement) => {
                const isUnlocked = isAchievementUnlocked(achievement.id)
                const progress = getAchievementProgress(achievement)
                
                return (
                  <Card 
                    key={achievement.id} 
                    className={`gaming-card transition-all duration-300 ${
                      isUnlocked 
                        ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20' 
                        : 'hover:shadow-lg'
                    }`}
                  >
                    <CardContent className="p-6">
                      {/* Achievement Header */}
                      <div className="flex items-start space-x-4 mb-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                          isUnlocked 
                            ? 'bg-yellow-500/20 border-2 border-yellow-500' 
                            : 'bg-gray-200 dark:bg-gray-700'
                        }`}>
                          {isUnlocked ? achievement.icon : <Lock className="h-6 w-6 text-gray-400" />}
                        </div>
                        <div className="flex-1">
                          <h3 className={`font-semibold text-lg mb-1 ${isUnlocked ? 'text-yellow-600' : ''}`}>
                            {achievement.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {achievement.description}
                          </p>
                        </div>
                        {isUnlocked && (
                          <CheckCircle className="h-6 w-6 text-yellow-500" />
                        )}
                      </div>

                      {/* Progress */}
                      {!isUnlocked && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Progress</span>
                            <span className="text-sm text-muted-foreground">
                              {Math.round(progress)}%
                            </span>
                          </div>
                          <Progress value={progress} className="h-2 mb-2" />
                          <div className="text-xs text-muted-foreground">
                            {getProgressText(achievement)}
                          </div>
                        </div>
                      )}

                      {/* Reward */}
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center space-x-2">
                          <Gift className="h-4 w-4 text-green-500" />
                          <span className="text-sm font-medium">
                            {achievement.reward_credits} credits
                          </span>
                        </div>
                        <Badge 
                          className={
                            achievement.category === 'sales' ? 'bg-blue-500' :
                            achievement.category === 'quality' ? 'bg-green-500' :
                            achievement.category === 'engagement' ? 'bg-purple-500' :
                            achievement.category === 'revenue' ? 'bg-orange-500' :
                            'bg-gray-500'
                          }
                        >
                          {achievement.category}
                        </Badge>
                      </div>

                      {/* Unlocked Date */}
                      {isUnlocked && (
                        <div className="mt-4 pt-4 border-t">
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>
                              Unlocked {new Date(userAchievements.find(ua => ua.achievement.id === achievement.id)?.unlocked_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="unlocked" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.filter(a => isAchievementUnlocked(a.id)).map((achievement) => (
              <Card key={achievement.id} className="gaming-card border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center text-2xl border-2 border-yellow-500">
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-yellow-600">{achievement.name}</h3>
                      <div className="flex items-center space-x-2 text-sm">
                        <Gift className="h-4 w-4 text-green-500" />
                        <span className="font-medium">{achievement.reward_credits} credits earned</span>
                      </div>
                    </div>
                    <CheckCircle className="h-6 w-6 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {achievements.filter(a => isAchievementUnlocked(a.id)).length === 0 && (
            <div className="text-center py-12">
              <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Achievements Unlocked Yet</h3>
              <p className="text-muted-foreground">
                Start creating and completing orders to unlock your first achievement!
              </p>
            </div>
          )}
        </TabsContent>

        {/* Category-specific tabs */}
        {['sales', 'quality', 'engagement'].map(category => (
          <TabsContent key={category} value={category} className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements.filter(a => a.category === category).map((achievement) => {
                const isUnlocked = isAchievementUnlocked(achievement.id)
                const progress = getAchievementProgress(achievement)
                
                return (
                  <Card 
                    key={achievement.id} 
                    className={`gaming-card ${isUnlocked ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20' : ''}`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                          isUnlocked ? 'bg-yellow-500/20' : 'bg-gray-200 dark:bg-gray-700'
                        }`}>
                          {isUnlocked ? achievement.icon : <Lock className="h-6 w-6 text-gray-400" />}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{achievement.name}</h3>
                          <p className="text-sm text-muted-foreground">{achievement.description}</p>
                        </div>
                      </div>
                      
                      {!isUnlocked && (
                        <div className="mb-4">
                          <Progress value={progress} className="h-2 mb-2" />
                          <div className="text-xs text-muted-foreground">
                            {getProgressText(achievement)}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Gift className="h-4 w-4 text-green-500" />
                          <span className="text-sm">{achievement.reward_credits} credits</span>
                        </div>
                        {isUnlocked && <CheckCircle className="h-5 w-5 text-yellow-500" />}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Tips Section */}
      <div className="max-w-4xl mx-auto mt-16">
        <Card className="gaming-card">
          <CardHeader>
            <CardTitle className="text-center text-2xl">💡 Tips to Unlock Achievements</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3 flex items-center space-x-2">
                  <Target className="h-5 w-5 text-blue-500" />
                  <span>Sales Achievements</span>
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Complete orders on time to build reputation</li>
                  <li>• Offer competitive pricing for your services</li>
                  <li>• Provide excellent customer service</li>
                  <li>• Create compelling service descriptions</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-3 flex items-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span>Quality Achievements</span>
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Always include tutorials with your work</li>
                  <li>• Exceed client expectations</li>
                  <li>• Communicate clearly throughout projects</li>
                  <li>• Deliver high-quality, polished work</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-3 flex items-center space-x-2">
                  <Users className="h-5 w-5 text-purple-500" />
                  <span>Engagement Achievements</span>
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Build long-term client relationships</li>
                  <li>• Encourage satisfied clients to leave reviews</li>
                  <li>• Participate in the community</li>
                  <li>• Share your expertise and help others</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-3 flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <span>Revenue Achievements</span>
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Offer premium service packages</li>
                  <li>• Build a portfolio of recurring clients</li>
                  <li>• Create high-value, specialized services</li>
                  <li>• Continuously improve your skills</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}