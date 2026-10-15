import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  TrendingUp, 
  Eye, 
  Coins, 
  ShoppingCart, 
  Users, 
  ArrowUpRight,
  BarChart2
} from "lucide-react"

export function AnalyticsPage() {
  const chartData = [
    { day: "Mon", revenue: 420, views: 1800 },
    { day: "Tue", revenue: 680, views: 2400 },
    { day: "Wed", revenue: 510, views: 2100 },
    { day: "Thu", revenue: 890, views: 3200 },
    { day: "Fri", revenue: 1200, views: 4100 },
    { day: "Sat", revenue: 1540, views: 5600 },
    { day: "Sun", revenue: 1350, views: 4900 },
  ]

  const maxRevenue = Math.max(...chartData.map(d => d.revenue))

  return (
    <div className="container py-8 md:py-12 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-gradient-gaming rounded-xl text-white">
            <TrendingUp className="h-5 w-5" />
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">
            Analytics &amp; Performance
          </h1>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Detailed metrics on your sales velocity, tutorial viewership, and conversion rates.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="gaming-card border-border bg-card p-4">
          <div className="text-xs text-muted-foreground font-semibold">Weekly Gross Volume</div>
          <div className="text-2xl font-black text-primary mt-1">6,590 cr</div>
          <div className="flex items-center text-xs text-emerald-500 font-medium mt-1">
            <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" />
            <span>+24.5% vs last week</span>
          </div>
        </Card>

        <Card className="gaming-card border-border bg-card p-4">
          <div className="text-xs text-muted-foreground font-semibold">Tutorial Impressions</div>
          <div className="text-2xl font-black text-foreground mt-1">24.1K</div>
          <div className="flex items-center text-xs text-emerald-500 font-medium mt-1">
            <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" />
            <span>+18.2% views</span>
          </div>
        </Card>

        <Card className="gaming-card border-border bg-card p-4">
          <div className="text-xs text-muted-foreground font-semibold">Gig Conversion Rate</div>
          <div className="text-2xl font-black text-foreground mt-1">8.4%</div>
          <div className="text-xs text-muted-foreground mt-1">Industry avg 4.2%</div>
        </Card>

        <Card className="gaming-card border-border bg-card p-4">
          <div className="text-xs text-muted-foreground font-semibold">Client Repeat Rate</div>
          <div className="text-2xl font-black text-foreground mt-1">42%</div>
          <div className="text-xs text-muted-foreground mt-1">High retention</div>
        </Card>
      </div>

      {/* Bar Chart Visualization */}
      <Card className="border-border bg-card p-6">
        <CardHeader className="p-0 pb-6">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-base font-bold">Weekly Token Revenue Activity</CardTitle>
              <p className="text-xs text-muted-foreground">Credits earned each day across all marketplace sales &amp; contracts</p>
            </div>
            <Badge variant="outline" className="text-xs text-primary border-primary/30">
              Live Feed
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-64 flex items-end justify-between gap-2 sm:gap-6 pt-4 border-b pb-2">
            {chartData.map((d, i) => {
              const heightPct = Math.round((d.revenue / maxRevenue) * 100)
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    {d.revenue}cr
                  </div>
                  <div
                    className="w-full max-w-[48px] bg-gradient-to-t from-primary to-accent rounded-t-lg transition-all duration-300 hover:brightness-110"
                    style={{ height: `${heightPct}%` }}
                  />
                  <span className="text-xs font-semibold text-muted-foreground">{d.day}</span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
