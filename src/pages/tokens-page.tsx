import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useTokens } from "@/contexts/TokenContext"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { showToast } from "@/components/ui/toaster"
import { 
  Coins, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Sparkles, 
  DollarSign, 
  CreditCard,
  History,
  CheckCircle2,
  Lock
} from "lucide-react"

export function TokensPage() {
  const { user } = useAuth()
  const { packages, transactions, purchaseTokens, withdrawTokens, getTokenBalance, getTotalEarned, getTotalSpent, loading } = useTokens()

  const [withdrawCredits, setWithdrawCredits] = useState<number>(500)
  const [withdrawMethod, setWithdrawMethod] = useState("stripe")
  const [withdrawEmail, setWithdrawEmail] = useState(user?.email || "")
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false)

  const handleWithdrawSubmit = async () => {
    if (!withdrawEmail || withdrawCredits < 100) {
      showToast({
        title: "Invalid Withdrawal",
        description: "Minimum withdrawal is 100 credits ($10 USD) and email is required.",
        variant: "destructive"
      })
      return
    }

    const res = await withdrawTokens(withdrawCredits, withdrawMethod, withdrawEmail)
    if (res.success) {
      setIsWithdrawModalOpen(false)
    }
  }

  return (
    <div className="container py-8 md:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <div className="p-2 bg-gradient-gaming rounded-xl text-white">
              <Coins className="h-5 w-5" />
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">
              Token Economy &amp; Credits
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Manage your WayaCreate tokens. 10 credits = $1.00 USD. Earn credits from gig sales, buy packages, or withdraw to your bank.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button onClick={() => setIsWithdrawModalOpen(true)} variant="outline" className="border-border">
            <ArrowUpRight className="mr-1.5 h-4 w-4 text-emerald-500" />
            Withdraw Credits
          </Button>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="gaming-card border-border bg-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-muted-foreground">Available Token Balance</span>
              <Coins className="h-5 w-5 text-primary" />
            </div>
            <div className="text-3xl font-black text-primary">
              {getTokenBalance().toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              ≈ ${(getTokenBalance() * 0.1).toFixed(2)} USD in purchasing power
            </div>
          </CardContent>
        </Card>

        <Card className="gaming-card border-border bg-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-muted-foreground">Total Lifetime Earned</span>
              <TrendingUp className="h-5 w-5 text-emerald-500" />
            </div>
            <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
              {getTotalEarned().toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              From completed gigs &amp; digital downloads
            </div>
          </CardContent>
        </Card>

        <Card className="gaming-card border-border bg-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-muted-foreground">Total Spent</span>
              <CreditCard className="h-5 w-5 text-purple-500" />
            </div>
            <div className="text-3xl font-black text-foreground">
              {getTotalSpent().toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Invested in assets, tools &amp; contracts
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Purchase Token Packages */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold">Purchase Token Packages</h2>
          <p className="text-xs text-muted-foreground">Instant credit top-up with bonus tokens on higher tiers.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {packages.map((pkg) => (
            <Card key={pkg.id} className={`gaming-card border-border bg-card flex flex-col justify-between relative ${pkg.popular ? "border-primary/50 shadow-md ring-1 ring-primary/20" : ""}`}>
              {pkg.popular && (
                <div className="absolute -top-2.5 right-4">
                  <Badge className="bg-primary text-primary-foreground text-[10px] font-bold">
                    MOST POPULAR
                  </Badge>
                </div>
              )}
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold">{pkg.name}</CardTitle>
                <div className="text-2xl font-black text-foreground mt-1">
                  ${pkg.price_usd}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-primary/10 rounded-xl text-center">
                  <span className="text-xl font-black text-primary">{pkg.credits}</span>
                  <span className="text-xs text-muted-foreground ml-1">Credits</span>
                  {pkg.bonus_credits > 0 && (
                    <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                      + {pkg.bonus_credits} Free Bonus!
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex items-center space-x-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Instant wallet delivery</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Never expires</span>
                  </div>
                </div>

                <Button
                  onClick={() => purchaseTokens(pkg.id)}
                  disabled={loading}
                  className="w-full bg-primary text-primary-foreground font-semibold text-xs mt-2"
                >
                  Buy with Card / Stripe
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Transaction History Ledger */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Transaction Ledger</h2>
            <p className="text-xs text-muted-foreground">Audit trail of all purchases, escrow releases, and earnings.</p>
          </div>
          <Badge variant="outline" className="text-xs">
            <History className="mr-1 h-3 w-3" />
            {transactions.length} Records
          </Badge>
        </div>

        <Card className="border-border bg-card">
          <div className="divide-y divide-border">
            {transactions.map((tx) => (
              <div key={tx.id} className="p-4 flex items-center justify-between text-xs hover:bg-muted/30 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-xl ${
                    tx.transaction_type === "earning" 
                      ? "bg-emerald-500/10 text-emerald-500" 
                      : tx.transaction_type === "withdrawal"
                      ? "bg-blue-500/10 text-blue-500"
                      : tx.transaction_type === "purchase"
                      ? "bg-primary/10 text-primary"
                      : "bg-purple-500/10 text-purple-500"
                  }`}>
                    {tx.transaction_type === "earning" ? (
                      <ArrowDownLeft className="h-4 w-4" />
                    ) : tx.transaction_type === "withdrawal" ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <Coins className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground text-sm">{tx.description}</div>
                    <div className="text-muted-foreground text-[11px] mt-0.5">
                      {new Date(tx.created_at).toLocaleDateString()} • Status: {tx.status}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`font-black text-sm ${
                    tx.transaction_type === "earning" || tx.transaction_type === "purchase"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-foreground"
                  }`}>
                    {tx.transaction_type === "spending" || tx.transaction_type === "withdrawal" ? "-" : "+"}
                    {tx.amount} credits
                  </div>
                  {tx.usd_amount && (
                    <div className="text-[11px] text-muted-foreground font-medium">
                      ${tx.usd_amount.toFixed(2)} USD
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Withdrawal Dialog */}
      <Dialog open={isWithdrawModalOpen} onOpenChange={setIsWithdrawModalOpen}>
        <DialogHeader>
          <DialogTitle>Withdraw Credits to USD</DialogTitle>
          <DialogDescription>
            Conversion rate: 10 Credits = $1.00 USD. Processed via Stripe Direct Payouts.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-4">
          <div className="p-3 bg-muted/40 rounded-xl space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Your Balance:</span>
              <span className="font-bold">{getTokenBalance()} credits</span>
            </div>
            <div className="flex justify-between font-bold text-foreground">
              <span>Estimated Payout:</span>
              <span className="text-emerald-600">${(withdrawCredits * 0.1).toFixed(2)} USD</span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold">Credits to Withdraw (Min 100):</label>
            <Input
              type="number"
              min={100}
              max={getTokenBalance()}
              value={withdrawCredits}
              onChange={(e) => setWithdrawCredits(Number(e.target.value))}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold">Payout Method:</label>
            <select
              value={withdrawMethod}
              onChange={(e) => setWithdrawMethod(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm"
            >
              <option value="stripe">Stripe Connect (Bank Transfer)</option>
              <option value="paypal">PayPal</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold">Payout Account / Email:</label>
            <Input
              type="email"
              value={withdrawEmail}
              onChange={(e) => setWithdrawEmail(e.target.value)}
              placeholder="payout@example.com"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => setIsWithdrawModalOpen(false)}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleWithdrawSubmit} className="bg-primary text-primary-foreground font-semibold">
            Confirm ${(withdrawCredits * 0.1).toFixed(2)} USD Withdrawal
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  )
}
