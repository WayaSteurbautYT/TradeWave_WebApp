import React from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useTokens } from "@/contexts/TokenContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  User, 
  Mail, 
  Calendar, 
  Coins, 
  TrendingUp, 
  TrendingDown,
  Star,
  MapPin,
  Globe,
  Edit
} from "lucide-react"

export function ProfilePage() {
  const { user } = useAuth()
  const { getTokenBalance, getTotalEarned, getTotalSpent } = useTokens()

  if (!user) {
    return (
      <div className="container py-20">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to view your profile</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Profile Header */}
        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.avatar_url} alt={user.display_name} />
                <AvatarFallback className="text-2xl">{user.display_name?.charAt(0)}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold">{user.display_name}</h1>
                    {user.is_verified && (
                      <Badge className="bg-blue-500">
                        ✓ Verified
                      </Badge>
                    )}
                    <Badge variant="secondary">
                      {user.role}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      <span>{user.email}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  {user.location && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{user.location}</span>
                    </div>
                  )}
                  
                  {user.website && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Globe className="h-4 w-4" />
                      <a href={user.website} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                        {user.website}
                      </a>
                    </div>
                  )}
                </div>
                
                {user.bio && (
                  <p className="text-muted-foreground max-w-2xl">{user.bio}</p>
                )}
                
                {user.skills && user.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {user.skills.map((skill, index) => (
                      <Badge key={index} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <Button>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Token Balance</CardTitle>
              <Coins className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {getTokenBalance().toLocaleString()} TW
              </div>
              <p className="text-xs text-muted-foreground">
                Available for purchases
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {getTotalEarned().toLocaleString()} TW
              </div>
              <p className="text-xs text-muted-foreground">
                All-time earnings
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {getTotalSpent().toLocaleString()} TW
              </div>
              <p className="text-xs text-muted-foreground">
                All-time spending
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Rating & Reviews */}
        {user.rating > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Reputation</CardTitle>
              <CardDescription>Your rating and reviews from the community</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500 fill-current" />
                  <span className="text-2xl font-bold">{user.rating.toFixed(1)}</span>
                  <span className="text-muted-foreground">
                    ({user.review_count} reviews)
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Social Media Accounts */}
        {user.social_accounts && user.social_accounts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Social Media</CardTitle>
              <CardDescription>Connected social media accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {user.social_accounts.map((account, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="font-medium">{account.platform}</div>
                      <div className="text-muted-foreground">@{account.username}</div>
                      {account.verified && (
                        <Badge variant="secondary" className="text-xs">
                          ✓ Verified
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {account.followers?.toLocaleString()} followers
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}