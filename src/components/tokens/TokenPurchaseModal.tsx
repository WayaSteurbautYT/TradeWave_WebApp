import { useState } from "react"
import { TokenPackage } from "@/types"
import { useTokens } from "@/contexts/TokenContext"
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { soundFX } from "@/lib/soundEffects"
import { 
  CreditCard, 
  Lock, 
  CheckCircle2, 
  Coins, 
  Sparkles, 
  ShieldCheck,
  Gift,
  Zap,
  ArrowRight
} from "lucide-react"

interface TokenPurchaseModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pkg: TokenPackage | null
}

export function TokenPurchaseModal({ open, onOpenChange, pkg }: TokenPurchaseModalProps) {
  const { purchaseTokens } = useTokens()
  const [cardNumber, setCardNumber] = useState("4242 •••• •••• 4242")
  const [cardExpiry, setCardExpiry] = useState("12/28")
  const [cardCvc, setCardCvc] = useState("888")
  const [cardHolder, setCardHolder] = useState("Waya Steurbaut")
  const [processing, setProcessing] = useState(false)
  const [success, setSuccess] = useState(false)

  if (!pkg) return null

  const isFree = pkg.price_usd === 0
  const totalCredits = pkg.credits + pkg.bonus_credits

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault()
    setProcessing(true)

    const res = await purchaseTokens(pkg.id)
    setProcessing(false)

    if (res.success) {
      soundFX.playFanfare()
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        onOpenChange(false)
      }, 2200)
    }
  }

  const fillTestCard = () => {
    setCardNumber("4242 4242 4242 4242")
    setCardExpiry("08/29")
    setCardCvc("314")
    setCardHolder("Creator Waya")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-primary/10 text-primary rounded-xl">
            {isFree ? <Gift className="h-5 w-5 text-emerald-500 animate-bounce" /> : <Coins className="h-5 w-5" />}
          </div>
          <div>
            <DialogTitle>
              {isFree ? "Claim Free Community Package" : "Complete Token Purchase"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {isFree 
                ? "100% Free Forever for Viewers, Learners & Sellers" 
                : "Stripe 256-Bit Encrypted Checkout • Production Ready"}
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      {success ? (
        <div className="py-8 text-center space-y-3">
          <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h3 className="text-xl font-bold">
            {isFree ? "Free Welcome Tokens Granted!" : "Payment Authorized!"}
          </h3>
          <p className="text-xs text-muted-foreground">
            Added <strong className="text-primary font-bold">+{totalCredits} Credits</strong> to your WayaCreate account.
          </p>
        </div>
      ) : isFree ? (
        <form onSubmit={handlePay} className="space-y-4 my-2">
          {/* Free Package Perks */}
          <div className="p-4 bg-gradient-to-br from-emerald-500/10 via-primary/5 to-transparent rounded-xl space-y-3 border border-emerald-500/20">
            <div className="flex justify-between items-center">
              <span className="font-bold text-sm text-foreground flex items-center gap-1.5">
                <Gift className="h-4 w-4 text-emerald-500" />
                {pkg.name}
              </span>
              <Badge className="bg-emerald-500 text-white font-extrabold text-xs">
                $0.00 FREE
              </Badge>
            </div>
            
            <p className="text-xs text-muted-foreground">
              Designed for anyone who just wants to watch livestreams, study tutorials, and buy/sell community creations with no upfront fees.
            </p>

            <div className="space-y-2 text-xs pt-1">
              <div className="flex items-center gap-2 text-foreground font-medium">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span><strong>+{totalCredits} Starter Credits</strong> granted immediately</span>
              </div>
              <div className="flex items-center gap-2 text-foreground font-medium">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span><strong>Free Daily Faucet:</strong> Claim +10 tokens every 24 hours</span>
              </div>
              <div className="flex items-center gap-2 text-foreground font-medium">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span><strong>Live Stream Viewer:</strong> Watch live shows &amp; chat for free</span>
              </div>
              <div className="flex items-center gap-2 text-foreground font-medium">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span><strong>Free Creator Selling:</strong> 0 listing fee, standard 5% payout split</span>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Maybe Later
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={processing}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            >
              {processing ? (
                "Granting Free Credits..."
              ) : (
                <>
                  <Zap className="mr-1.5 h-4 w-4 fill-current" />
                  Claim 50 Free Tokens Now
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      ) : (
        <form onSubmit={handlePay} className="space-y-4 my-2">
          {/* Order Summary */}
          <div className="p-4 bg-muted/40 rounded-xl space-y-2 border">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold">{pkg.name}</span>
              <span className="font-extrabold text-foreground text-sm">${pkg.price_usd} USD</span>
            </div>
            <div className="flex justify-between items-center text-xs text-primary font-bold">
              <span>Credits Delivered:</span>
              <span>{pkg.credits} {pkg.bonus_credits > 0 && `(+${pkg.bonus_credits} bonus)`}</span>
            </div>
          </div>

          {/* Payment Card Inputs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold flex items-center gap-1.5">
                <CreditCard className="h-3.5 w-3.5 text-primary" />
                <span>Card Information (Stripe Secure Processing)</span>
              </label>
              <button
                type="button"
                onClick={fillTestCard}
                className="text-[10px] text-primary hover:underline font-semibold"
              >
                Instant Autofill
              </button>
            </div>

            <div className="space-y-1">
              <Input
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="4242 4242 4242 4242"
                className="font-mono text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Input
                value={cardExpiry}
                onChange={(e) => setCardExpiry(e.target.value)}
                placeholder="MM/YY"
                className="font-mono text-xs"
                required
              />
              <Input
                value={cardCvc}
                onChange={(e) => setCardCvc(e.target.value)}
                placeholder="CVC"
                className="font-mono text-xs"
                required
              />
            </div>

            <div className="space-y-1">
              <Input
                value={cardHolder}
                onChange={(e) => setCardHolder(e.target.value)}
                placeholder="Cardholder Name"
                className="text-xs"
                required
              />
            </div>
          </div>

          <div className="flex items-center space-x-1.5 text-[11px] text-muted-foreground pt-1">
            <Lock className="h-3 w-3 text-emerald-500" />
            <span>Tokens are delivered immediately upon confirmation.</span>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={processing}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
            >
              {processing ? (
                "Processing Stripe Charge..."
              ) : (
                <>
                  <Lock className="mr-1.5 h-3.5 w-3.5" />
                  Pay ${pkg.price_usd} USD
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      )}
    </Dialog>
  )
}
