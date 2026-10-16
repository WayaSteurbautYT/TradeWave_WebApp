import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { soundFX } from "@/lib/soundEffects"
import { 
  Globe, 
  Github, 
  Sparkles, 
  Radio, 
  Coins, 
  CheckCircle2, 
  ShieldCheck, 
  UserCheck,
  Zap,
  ArrowRight
} from "lucide-react"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { loginWithGoogle, loginWithGithub, loginWithDiscord, loginAs, loading } = useAuth()
  const [discordInput, setDiscordInput] = useState("waya_creative#0001")
  const [showDiscordInput, setShowDiscordInput] = useState(false)

  const handleGoogle = async () => {
    await loginWithGoogle()
    onClose()
  }

  const handleGithub = async () => {
    await loginWithGithub()
    onClose()
  }

  const handleDiscord = () => {
    loginWithDiscord(discordInput)
    onClose()
  }

  const handlePersona = (role: "creator" | "viewer") => {
    loginAs(role as any)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogHeader>
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-primary/10 text-primary rounded-xl">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <DialogTitle>Sign In to WayaCreate</DialogTitle>
            <DialogDescription className="text-xs">
              Access the creator marketplace, YouTube content hub, and token economy.
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <div className="space-y-4 my-3 text-xs">
        {/* Real OAuth Providers */}
        <div className="space-y-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogle}
            disabled={loading}
            className="w-full justify-start h-10 border-border hover:bg-muted font-semibold relative"
          >
            <svg className="h-4 w-4 mr-3" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Continue with Google</span>
            <Badge className="ml-auto text-[10px] bg-blue-500/10 text-blue-500 border border-blue-500/20">
              Firebase Auth
            </Badge>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleGithub}
            disabled={loading}
            className="w-full justify-start h-10 border-border hover:bg-muted font-semibold relative"
          >
            <Github className="h-4 w-4 mr-3" />
            <span>Continue with GitHub</span>
            <Badge className="ml-auto text-[10px] bg-slate-500/10 text-foreground border border-border">
              Developer Hub
            </Badge>
          </Button>

          {showDiscordInput ? (
            <div className="p-3 rounded-xl border bg-muted/30 space-y-2">
              <label className="text-[11px] font-semibold text-indigo-400">Discord Username or Tag:</label>
              <div className="flex gap-2">
                <Input
                  size={1}
                  value={discordInput}
                  onChange={(e) => setDiscordInput(e.target.value)}
                  placeholder="waya_creative#0001"
                  className="h-8 text-xs font-mono"
                />
                <Button size="sm" onClick={handleDiscord} className="bg-indigo-600 hover:bg-indigo-500 text-white h-8">
                  Connect
                </Button>
              </div>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDiscordInput(true)}
              className="w-full justify-start h-10 border-border hover:bg-muted font-semibold relative"
            >
              <Radio className="h-4 w-4 mr-3 text-indigo-500" />
              <span>Connect with Discord</span>
              <Badge className="ml-auto text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Guild Perks
              </Badge>
            </Button>
          )}
        </div>

        {/* Quick Role & Economy Selection */}
        <div className="pt-2 border-t space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Instant Persona Sign-in:</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div
              onClick={() => handlePersona("viewer")}
              className="p-3 rounded-xl border border-border bg-card hover:border-primary/50 cursor-pointer transition-all space-y-1 group"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs group-hover:text-primary">Free Explorer</span>
                <Badge variant="secondary" className="text-[9px]">Watcher</Badge>
              </div>
              <p className="text-[11px] text-muted-foreground leading-tight">
                Get 50 free credits + daily faucet to watch, tip, and trade digital rights.
              </p>
            </div>

            <div
              onClick={() => handlePersona("creator")}
              className="p-3 rounded-xl border border-primary/40 bg-primary/5 hover:border-primary cursor-pointer transition-all space-y-1 group"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-primary">Creator Tier</span>
                <Badge className="bg-primary text-primary-foreground text-[9px]">Monetize</Badge>
              </div>
              <p className="text-[11px] text-muted-foreground leading-tight">
                Upload videos, stream live, and earn withdrawable cash from paid supporters.
              </p>
            </div>
          </div>
        </div>

        {/* Platform Economy Disclosures */}
        <div className="p-2.5 rounded-lg bg-muted/40 border text-[11px] text-muted-foreground space-y-1">
          <div className="flex items-center text-foreground font-semibold">
            <Coins className="h-3.5 w-3.5 text-amber-500 mr-1.5" />
            <span>Automatic Token &amp; Rights Economy:</span>
          </div>
          <p>
            Viewing and learning is free. Creators monetize via Stripe payouts from paid users who purchase packages and buy secondary rights licenses.
          </p>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
          Close
        </Button>
      </DialogFooter>
    </Dialog>
  )
}
