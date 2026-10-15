import { useState } from "react"
import { MockStore } from "@/data/mockStore"
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { soundFX } from "@/lib/soundEffects"
import { showToast } from "@/components/ui/toaster"
import { 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles, 
  Hash, 
  Cpu, 
  FileCheck, 
  Zap, 
  RefreshCw,
  Lock
} from "lucide-react"

interface AssetSecurityModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  assetName?: string
}

export function AssetSecurityModal({ open, onOpenChange, assetName = "Stylized_Cyberpunk_Alley_Pack_v2.blend" }: AssetSecurityModalProps) {
  const [scanning, setScanning] = useState(false)
  const [optimizing, setOptimizing] = useState(false)
  const [scanResult, setScanResult] = useState(() => MockStore.scanAssetSecurity(assetName))
  const [optimized, setOptimized] = useState(false)

  const handleRescan = () => {
    setScanning(true)
    setTimeout(() => {
      const res = MockStore.scanAssetSecurity(assetName)
      setScanResult(res)
      setScanning(false)
      soundFX.playSuccess()
      MockStore.trackGoalAction("run_scan")
      showToast({
        title: "AI Security Audit Complete",
        description: `Verified asset integrity and anti-malware clearance (Score: ${res.score}/100).`,
        variant: "success"
      })
    }, 600)
  }

  const handleApplyOptimizations = () => {
    setOptimizing(true)
    setTimeout(() => {
      setOptimizing(false)
      setOptimized(true)
      soundFX.playFanfare()
      showToast({
        title: "Security & Asset Optimized!",
        description: "Applied WebP texture compression, collision hulls, and certified commercial escrow seal.",
        variant: "success"
      })
    }, 800)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-xl">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <DialogTitle>AI Security &amp; Asset Optimizer</DialogTitle>
            <DialogDescription className="text-xs">
              Automated smart contract escrow protection, SHA-256 verification &amp; anti-malware audit
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <div className="space-y-4 my-2 text-xs max-h-[60vh] overflow-y-auto pr-1">
        {/* Score & Asset Name */}
        <div className="p-4 rounded-xl border bg-gradient-to-r from-emerald-500/10 via-primary/5 to-transparent flex items-center justify-between">
          <div className="space-y-1">
            <span className="font-bold text-foreground text-sm flex items-center gap-1.5">
              <FileCheck className="h-4 w-4 text-emerald-500" />
              {assetName}
            </span>
            <div className="flex items-center space-x-2 text-[11px] text-muted-foreground font-mono">
              <Hash className="h-3 w-3 text-primary" />
              <span className="truncate max-w-[220px]">SHA-256: {scanResult.hashSha256}</span>
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {optimized ? "100" : scanResult.score}<span className="text-xs font-semibold text-muted-foreground">/100</span>
            </div>
            <Badge className="bg-emerald-600 text-white text-[10px]">
              Grade {optimized ? "A++" : scanResult.grade} (Secure)
            </Badge>
          </div>
        </div>

        {/* Audit Checklist */}
        <div className="space-y-2">
          <span className="font-bold text-foreground flex items-center gap-1.5">
            <Cpu className="h-3.5 w-3.5 text-primary" />
            Vulnerability &amp; Integrity Checklist
          </span>

          <div className="space-y-1.5">
            {scanResult.checks.map((check: { name: string; passed: boolean; details: string }, i: number) => (
              <div key={i} className="p-2.5 rounded-lg border bg-card flex items-start space-x-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="font-semibold text-foreground">{check.name}</div>
                  <p className="text-[11px] text-muted-foreground">{check.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Optimizations */}
        <div className="p-3 bg-muted/40 rounded-xl space-y-2 border">
          <span className="font-bold text-foreground flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-purple-500" />
            AI Performance Enhancements
          </span>
          <ul className="space-y-1 text-muted-foreground text-[11px]">
            {scanResult.optimizationsAvailable.map((opt: string, i: number) => (
              <li key={i} className="flex items-center gap-1.5">
                <Zap className="h-3 w-3 text-amber-500 shrink-0" />
                <span>{opt}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Escrow Anti-Fraud Protection */}
        <div className="p-3 rounded-xl border bg-blue-500/5 border-blue-500/20 space-y-1.5">
          <span className="font-bold text-foreground flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
            <Lock className="h-3.5 w-3.5" />
            Escrow Buyer &amp; Seller Protection Active
          </span>
          <p className="text-[11px] text-muted-foreground">
            Digital transactions are held in smart milestone escrow until the buyer inspects files and confirms delivery. Automated dispute mediation protects both parties.
          </p>
        </div>
      </div>

      <DialogFooter className="gap-2 sm:gap-0 pt-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={scanning}
          onClick={handleRescan}
          className="text-xs"
        >
          <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${scanning ? "animate-spin" : ""}`} />
          {scanning ? "Auditing..." : "Re-Scan"}
        </Button>

        <Button
          type="button"
          size="sm"
          disabled={optimizing || optimized}
          onClick={handleApplyOptimizations}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
        >
          {optimizing ? (
            "Applying AI Fixes..."
          ) : optimized ? (
            <>
              <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
              Optimized (Score 100)
            </>
          ) : (
            <>
              <Zap className="mr-1.5 h-3.5 w-3.5" />
              Apply 1-Click AI Optimizations
            </>
          )}
        </Button>
      </DialogFooter>
    </Dialog>
  )
}
