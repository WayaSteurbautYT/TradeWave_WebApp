import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useTokens } from "@/contexts/TokenContext"
import { TokenPackage } from "@/types"
import { TokenPurchaseModal } from "@/components/tokens/TokenPurchaseModal"
import { StripeConfigModal } from "@/components/tokens/StripeConfigModal"
import { AssetSecurityModal } from "@/components/security/AssetSecurityModal"
import { GoalTracker } from "@/components/gamification/GoalTracker"
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
  Lock,
  Gift,
  ShieldCheck,
  Sliders,
  Zap,
  HelpCircle
} from "lucide-react"

export function TokensPage() {
  const { user } = useAuth()
  const { packages, transactions, purchaseTokens, withdrawTokens, getTokenBalance, getTotalEarned, getTotalSpent, loading } = useTokens()

  const [withdrawCredits, setWithdrawCredits] = useState<number>(500)
  const [withdrawMethod, setWithdrawMethod] = useState("stripe")
  const [withdrawEmail, setWithdrawEmail] = useState(user?.email || "")
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<TokenPackage | null>(null)
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false)
  const [isStripeModalOpen, setIsStripeModalOpen] = useState(false)
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false)

  const handleOpenPurchase = (pkg: TokenPackage) => {
    setSelectedPackage(pkg)
    setIsPurchaseModalOpen(true)
  }

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
          <div className="flex items-center space-x-2.5 mb-2">
            <div className="p-2.5 bg-gradient-gaming rounded-xl text-white shadow-lg shadow-primary/20">
              <Coins className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">
                Token Economy &amp; Microtransactions
              </h1>
              <p className="text-sm text-muted-foreground">
                Manage your Waya tokens, claim free daily faucet credits, configure Stripe microtransactions &amp; run security scans.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => setIsSecurityModalOpen(true)}
            variant="outline"
            size="sm"
            className="text-xs border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10"
          >
            <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
            Security &amp; Fraud Scan
          </Button>

          <Button
            onClick={() => setIsStripeModalOpen(true)}
            variant="outline"
            size="sm"
            className="text-xs border-purple-500/30 text-purple-600 hover:bg-purple-500/10"
          >
            <Sliders className="mr-1.5 h-3.5 w-3.5" />
            Stripe &amp; Micro-tips Setup
          </Button>

          <Button
            onClick={() => setIsWithdrawModalOpen(true)}
            size="sm"
            className="text-xs bg-primary text-primary-foreground font-bold"
          >
            <ArrowUpRight className="mr-1.5 h-3.5 w-3.5 text-white" />
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

      {/* Gamified Goal Tracker & Free Faucet Component */}
      <GoalTracker />

      {/* Purchase Token Packages */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Coins className="h-5 w-5 text-primary" />
              Token &amp; Community Packages
            </h2>
            <p className="text-xs text-muted-foreground">
              Includes a 100% Free Forever Community Tier, plus instant credit bundles for active studio creators.
            </p>
          </div>

          <div className="text-xs text-muted-foreground">
            Exchange Rate: <strong className="text-foreground">10 Credits = $1.00 USD</strong>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {packages.map((pkg) => {
            const isFree = pkg.price_usd === 0
            return (
              <Card
                key={pkg.id}
                className={`gaming-card border-border bg-card flex flex-col justify-between relative ${
                  isFree 
                    ? "border-emerald-500/50 bg-emerald-500/5 shadow-md ring-1 ring-emerald-500/20" 
                    : pkg.popular 
                    ? "border-primary/50 shadow-md ring-1 ring-primary/20" 
                    : ""
                }`}
              >
                {isFree ? (
                  <div className="absolute -top-2.5 right-4">
                    <Badge className="bg-emerald-600 text-white text-[10px] font-extrabold gap-1">
                      <Gift className="h-3 w-3" />
                      FREE FOREVER
                    </Badge>
                  </div>
                ) : pkg.popular ? (
                  <div className="absolute -top-2.5 right-4">
                    <Badge className="bg-primary text-primary-foreground text-[10px] font-bold">
                      MOST POPULAR
                    </Badge>
                  </div>
                ) : null}

                <CardHeader className="pb-3">
                  <CardTitle className="text-sm sm:text-base font-bold line-clamp-1">{pkg.name}</CardTitle>
                  <div className="text-2xl font-black text-foreground mt-1">
                    {isFree ? "$0.00" : `$${pkg.price_usd}`}
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className={`p-3 rounded-xl text-center ${isFree ? "bg-emerald-500/10 text-emerald-600" : "bg-primary/10 text-primary"}`}>
                    <span className="text-xl font-black">{pkg.credits}</span>
                    <span className="text-xs text-muted-foreground ml-1">Credits</span>
                    {pkg.bonus_credits > 0 && (
                      <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                        + {pkg.bonus_credits} Free Bonus!
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      <span>{isFree ? "Free daily token faucet" : "Instant wallet delivery"}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      <span>{isFree ? "Watch live streams & chat" : "Never expires"}</span>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleOpenPurchase(pkg)}
                    disabled={loading}
                    className={`w-full font-semibold text-xs mt-2 ${
                      isFree 
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white" 
                        : "bg-primary text-primary-foreground"
                    }`}
                  >
                    {isFree ? "Claim Free Explorer" : "Buy with Card / Stripe"}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
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
                      : "bg-purple-500/10 text-purple-500"
                  }`}>
                    {tx.transaction_type === "earning" ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : tx.transaction_type === "withdrawal" ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <CreditCard className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">{tx.description}</div>
                    <div className="text-[11px] text-muted-foreground">{new Date(tx.created_at).toLocaleDateString()}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`font-mono font-bold text-sm ${
                    tx.transaction_type === "earning" || tx.transaction_type === "purchase"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-foreground"
                  }`}>
                    {tx.transaction_type === "withdrawal" ? "-" : "+"}{tx.amount} cr
                  </div>
                  {tx.usd_amount && (
                    <div className="text-[11px] text-muted-foreground font-mono">
                      ${tx.usd_amount.toFixed(2)} USD
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Modals */}
      <TokenPurchaseModal
        open={isPurchaseModalOpen}
        onOpenChange={setIsPurchaseModalOpen}
        pkg={selectedPackage}
      />

      <StripeConfigModal
        open={isStripeModalOpen}
        onOpenChange={setIsStripeModalOpen}
      />

      <AssetSecurityModal
        open={isSecurityModalOpen}
        onOpenChange={setIsSecurityModalOpen}
      />

      {/* Withdrawal Modal */}
      <Dialog open={isWithdrawModalOpen} onOpenChange={setIsWithdrawModalOpen}>
        <DialogHeader>
          <DialogTitle>Withdraw Creator Earnings</DialogTitle>
          <DialogDescription className="text-xs">
            Transfer token credits directly to your Stripe Connect bank account or PayPal (10 cr = $1.00 USD).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-2 text-xs">
          <div className="p-3 bg-muted/40 rounded-xl space-y-1">
            <div className="flex justify-between">
              <span>Current Available Balance:</span>
              <strong className="text-primary font-bold">{getTokenBalance()} Credits</strong>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Withdrawal Value:</span>
              <span>${(withdrawCredits * 0.1).toFixed(2)} USD</span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold">Credits to Withdraw (min 100):</label>
            <Input
              type="number"
              min={100}
              max={getTokenBalance()}
              value={withdrawCredits}
              onChange={(e) => setWithdrawCredits(parseInt(e.target.value) || 0)}
              className="text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold">Payout Account Email (Stripe / Bank):</label>
            <Input
              type="email"
              value={withdrawEmail}
              onChange={(e) => setWithdrawEmail(e.target.value)}
              placeholder="creator@studio.com"
              className="text-xs"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-2">
          <Button variant="outline" size="sm" onClick={() => setIsWithdrawModalOpen(false)}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleWithdrawSubmit} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold">
            Confirm Withdrawal
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  )
}
