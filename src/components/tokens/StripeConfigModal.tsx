import { useState } from "react"
import { MockStore } from "@/data/mockStore"
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { showToast } from "@/components/ui/toaster"
import { soundFX } from "@/lib/soundEffects"
import { 
  CreditCard, 
  Key, 
  Webhook, 
  Copy, 
  Check, 
  Send, 
  Sliders, 
  ShieldCheck, 
  CheckCircle2, 
  Code2, 
  HelpCircle,
  Sparkles,
  RefreshCw
} from "lucide-react"

interface StripeConfigModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function StripeConfigModal({ open, onOpenChange }: StripeConfigModalProps) {
  const [config, setConfig] = useState(() => MockStore.getStripeConfig())
  const [activeTab, setActiveTab] = useState<"keys" | "micro" | "webhook" | "code">("keys")
  const [copied, setCopied] = useState<string | null>(null)
  const [testAmount, setTestAmount] = useState<number>(5.00)
  const [testingWebhook, setTestingWebhook] = useState(false)

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    soundFX.playSuccess()
    showToast({
      title: "Copied to Clipboard",
      description: `Copied ${label} to clipboard.`,
      variant: "success"
    })
    setTimeout(() => setCopied(null), 2000)
  }

  const handleSave = () => {
    MockStore.saveStripeConfig(config)
    soundFX.playSuccess()
    showToast({
      title: "Stripe Settings Saved",
      description: "API keys and microtransaction parameters updated.",
      variant: "success"
    })
    onOpenChange(false)
  }

  const handleSimulateWebhook = (type: string, amount: number) => {
    setTestingWebhook(true)
    setTimeout(() => {
      const log = MockStore.simulateStripeWebhook(type, amount, `Stripe Test Event (${type})`)
      setConfig(MockStore.getStripeConfig())
      setTestingWebhook(false)
      soundFX.playCoin()
      showToast({
        title: "Webhook Dispatched & Processed",
        description: `Dispatched ${type} for $${amount.toFixed(2)} USD. Token credits credited automatically.`,
        variant: "success"
      })
    }, 500)
  }

  const backendCodeSnippet = `// Node.js Express Stripe Webhook Handler (production ready)
import express from 'express';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

app.post('/api/webhook/stripe', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    return res.status(400).send(\`Webhook Error: \${err.message}\`);
  }

  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      // Award Waya Tokens: 10 tokens per $1 USD
      const credits = Math.round((session.amount_total / 100) * 10);
      fulfillTokenOrder(session.client_reference_id, credits);
      break;
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('Payment succeeded:', paymentIntent.id);
      break;
    default:
      console.log(\`Unhandled event type \${event.type}\`);
  }

  res.json({ received: true });
});`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-purple-500/10 text-purple-600 rounded-xl">
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <DialogTitle>Stripe &amp; Microtransactions Setup</DialogTitle>
            <DialogDescription className="text-xs">
              Configure your Stripe live/test API keys, micro-tip settings, and webhook handler
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      {/* Navigation Tabs */}
      <div className="flex border-b text-xs font-semibold gap-1 pt-2">
        <button
          type="button"
          onClick={() => setActiveTab("keys")}
          className={`px-3 py-1.5 border-b-2 transition-colors ${
            activeTab === "keys"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          API Keys &amp; Mode
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("micro")}
          className={`px-3 py-1.5 border-b-2 transition-colors ${
            activeTab === "micro"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Microtransactions
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("webhook")}
          className={`px-3 py-1.5 border-b-2 transition-colors ${
            activeTab === "webhook"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Webhook Tester
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("code")}
          className={`px-3 py-1.5 border-b-2 transition-colors ${
            activeTab === "code"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Server Code Snippet
        </button>
      </div>

      <div className="py-3 space-y-4 max-h-[60vh] overflow-y-auto pr-1">
        {/* Tab 1: Keys & Mode */}
        {activeTab === "keys" && (
          <div className="space-y-4 text-xs">
            {/* Mode Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl border bg-muted/30">
              <div>
                <span className="font-bold text-foreground">Stripe Environment Mode</span>
                <p className="text-[11px] text-muted-foreground">
                  Switch between Stripe Test Mode (safe testing with 4242 card) and Live Production Mode
                </p>
              </div>
              <Button
                size="sm"
                variant={config.isLiveMode ? "destructive" : "default"}
                onClick={() => setConfig({ ...config, isLiveMode: !config.isLiveMode })}
                className="text-xs h-7"
              >
                {config.isLiveMode ? "LIVE Mode" : "TEST Mode"}
              </Button>
            </div>

            {/* Publishable Key */}
            <div className="space-y-1">
              <label className="font-semibold text-foreground flex items-center justify-between">
                <span>Stripe Publishable Key ({config.isLiveMode ? "pk_live_..." : "pk_test_..."})</span>
                <span className="text-[10px] text-muted-foreground font-normal">Client-side safe</span>
              </label>
              <Input
                value={config.publishableKey}
                onChange={(e) => setConfig({ ...config, publishableKey: e.target.value })}
                placeholder={config.isLiveMode ? "pk_live_..." : "pk_test_..."}
                className="font-mono text-xs"
              />
            </div>

            {/* Secret Key */}
            <div className="space-y-1">
              <label className="font-semibold text-foreground flex items-center justify-between">
                <span>Stripe Secret Key ({config.isLiveMode ? "sk_live_..." : "sk_test_..."})</span>
                <Badge variant="outline" className="text-[10px] text-yellow-600 border-yellow-500/30">
                  Server-side Secret
                </Badge>
              </label>
              <Input
                type="password"
                value={config.secretKeyMasked}
                onChange={(e) => setConfig({ ...config, secretKeyMasked: e.target.value })}
                placeholder="sk_test_••••••••"
                className="font-mono text-xs"
              />
              <p className="text-[10px] text-muted-foreground">
                In production, save this as an environment variable <code>STRIPE_SECRET_KEY</code> in your backend.
              </p>
            </div>

            {/* Webhook Secret */}
            <div className="space-y-1">
              <label className="font-semibold text-foreground flex items-center justify-between">
                <span>Stripe Webhook Signing Secret (whsec_...)</span>
                <span className="text-[10px] text-muted-foreground font-normal">For signature validation</span>
              </label>
              <Input
                type="password"
                value={config.webhookSecretMasked}
                onChange={(e) => setConfig({ ...config, webhookSecretMasked: e.target.value })}
                placeholder="whsec_••••••••"
                className="font-mono text-xs"
              />
            </div>

            {/* Quick Guide */}
            <div className="p-3 bg-primary/5 rounded-xl border border-primary/20 space-y-2">
              <span className="font-bold text-foreground flex items-center gap-1.5">
                <HelpCircle className="h-3.5 w-3.5 text-primary" />
                Where to get your Stripe credentials:
              </span>
              <ol className="list-decimal pl-4 space-y-1 text-muted-foreground text-[11px]">
                <li>Sign up or log into <a href="https://dashboard.stripe.com" target="_blank" rel="noreferrer" className="text-primary hover:underline font-semibold">dashboard.stripe.com</a>.</li>
                <li>Go to <strong>Developers &gt; API keys</strong> to copy Publishable and Secret keys.</li>
                <li>Go to <strong>Developers &gt; Webhooks</strong>, add your endpoint (e.g. <code>https://yourdomain.com/api/webhook/stripe</code>), and reveal the Signing Secret.</li>
              </ol>
            </div>
          </div>
        )}

        {/* Tab 2: Microtransactions */}
        {activeTab === "micro" && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-muted/30 rounded-xl space-y-2 border">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground">Micro-Tip Amounts</span>
                <Badge className="bg-emerald-500/20 text-emerald-600 text-[10px]">
                  Enabled
                </Badge>
              </div>
              <p className="text-muted-foreground text-[11px]">
                Enables viewers to tip creators in live streams and on marketplace assets without high card processing minimums.
              </p>
              <div className="flex gap-2 pt-1">
                {["$0.50 (5 cr)", "$1.00 (10 cr)", "$2.00 (20 cr)", "$5.00 (50 cr)"].map((tip, i) => (
                  <span key={i} className="px-2 py-1 bg-card border rounded text-[11px] font-semibold">
                    {tip}
                  </span>
                ))}
              </div>
            </div>

            {/* Platform Fee Split */}
            <div className="space-y-2 p-3 bg-muted/30 rounded-xl border">
              <div className="flex justify-between items-center">
                <span className="font-bold text-foreground">Platform Fee Split</span>
                <span className="font-mono font-bold text-primary">{config.platformFeePercent}%</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Current platform commission on sales. Creator keeps <strong>{100 - config.platformFeePercent}%</strong> of every transaction!
              </p>
              <input
                type="range"
                min="0"
                max="15"
                step="0.5"
                value={config.platformFeePercent}
                onChange={(e) => setConfig({ ...config, platformFeePercent: parseFloat(e.target.value) })}
                className="w-full accent-primary cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>0% (Free Community)</span>
                <span>5% (Recommended)</span>
                <span>15% (Enterprise)</span>
              </div>
            </div>

            {/* 1-Click Token Top-Up */}
            <div className="flex items-center justify-between p-3 rounded-xl border bg-card">
              <div>
                <span className="font-semibold text-foreground">1-Click Saved Card Purchases</span>
                <p className="text-[11px] text-muted-foreground">
                  Use Stripe Customer tokens for instantaneous micro-purchases during streams
                </p>
              </div>
              <Button
                size="sm"
                variant={config.oneClickCheckout ? "default" : "outline"}
                onClick={() => setConfig({ ...config, oneClickCheckout: !config.oneClickCheckout })}
                className="text-xs h-7"
              >
                {config.oneClickCheckout ? "Active" : "Disabled"}
              </Button>
            </div>
          </div>
        )}

        {/* Tab 3: Webhook Tester */}
        {activeTab === "webhook" && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-muted/30 rounded-xl space-y-3 border">
              <span className="font-bold text-foreground">Test Dispatch Stripe Events</span>
              <p className="text-muted-foreground text-[11px]">
                Simulate realistic Stripe webhook payload dispatching to your applet store without touching real bank cards.
              </p>

              <div className="flex flex-wrap gap-2 pt-1">
                <Button
                  size="sm"
                  disabled={testingWebhook}
                  onClick={() => handleSimulateWebhook("checkout.session.completed", 24.99)}
                  className="text-xs h-8 bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Send className="mr-1.5 h-3.5 w-3.5" />
                  Test Token Package ($24.99)
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  disabled={testingWebhook}
                  onClick={() => handleSimulateWebhook("payment_intent.succeeded", 1.00)}
                  className="text-xs h-8"
                >
                  <Sparkles className="mr-1.5 h-3.5 w-3.5 text-yellow-500" />
                  Test Stream Micro-Tip ($1.00)
                </Button>
              </div>
            </div>

            {/* Webhook Activity Logs */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground">Recent Webhook Logs</span>
                <Badge variant="outline" className="text-[10px]">
                  {config.webhookLogs.length} Events Received
                </Badge>
              </div>

              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {config.webhookLogs.map((log: { id: string; type: string; amount: number; time: string; status: string }) => (
                  <div key={log.id} className="p-2.5 rounded-lg border bg-card flex items-center justify-between text-[11px]">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 font-mono font-semibold">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                        <span>{log.type}</span>
                      </div>
                      <span className="text-muted-foreground">{log.time} • ${log.amount.toFixed(2)} USD</span>
                    </div>
                    <Badge variant="secondary" className="text-[10px] font-mono">
                      HTTP 200 OK
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Backend Snippet */}
        {activeTab === "code" && (
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground">Express Server Route Template</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(backendCodeSnippet, "Express Webhook Handler")}
                className="text-xs h-7 gap-1"
              >
                {copied === "Express Webhook Handler" ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                Copy Code
              </Button>
            </div>
            <pre className="p-3 bg-muted/80 rounded-xl font-mono text-[11px] overflow-x-auto text-foreground/90 border">
              {backendCodeSnippet}
            </pre>
          </div>
        )}
      </div>

      <DialogFooter className="gap-2 sm:gap-0 pt-2">
        <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
          Close
        </Button>
        <Button size="sm" onClick={handleSave} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold">
          Save Configuration
        </Button>
      </DialogFooter>
    </Dialog>
  )
}
