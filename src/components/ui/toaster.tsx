import * as React from "react"
import { cn } from "@/lib/utils"
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react"

export interface ToastMessage {
  id: string
  title?: string
  description?: string
  variant?: "default" | "destructive" | "success"
}

interface ToastContextValue {
  toast: (props: Omit<ToastMessage, "id">) => void
}

export const ToastContext = React.createContext<ToastContextValue>({
  toast: () => {},
})

export function useToast() {
  const context = React.useContext(ToastContext)
  return { toast: context.toast }
}

export function Toaster() {
  const [toasts, setToasts] = React.useState<ToastMessage[]>([])

  const addToast = React.useCallback((props: Omit<ToastMessage, "id">) => {
    const id = Math.random().toString(36).slice(2)
    const newToast = { ...props, id }
    setToasts((prev) => [...prev, newToast])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  React.useEffect(() => {
    // Listen for custom toast event
    const handleCustomToast = (e: CustomEvent<Omit<ToastMessage, "id">>) => {
      addToast(e.detail)
    }
    window.addEventListener("wayacreate_toast" as any, handleCustomToast)
    return () => {
      window.removeEventListener("wayacreate_toast" as any, handleCustomToast)
    }
  }, [addToast])

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "pointer-events-auto flex items-start gap-3 p-4 rounded-lg shadow-lg border text-sm backdrop-blur-md animate-in slide-in-from-bottom-2",
            t.variant === "destructive"
              ? "bg-destructive text-destructive-foreground border-destructive/20"
              : t.variant === "success"
              ? "bg-emerald-950/90 text-white border-emerald-500/30"
              : "bg-background/95 text-foreground border-border"
          )}
        >
          {t.variant === "destructive" ? (
            <AlertCircle className="h-5 w-5 text-red-300 shrink-0 mt-0.5" />
          ) : t.variant === "success" ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            {t.title && <div className="font-semibold">{t.title}</div>}
            {t.description && (
              <div className="text-xs text-muted-foreground mt-0.5">
                {t.description}
              </div>
            )}
          </div>
          <button
            onClick={() => setToasts((prev) => prev.filter((item) => item.id !== t.id))}
            className="opacity-70 hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}

export function showToast(props: Omit<ToastMessage, "id">) {
  window.dispatchEvent(new CustomEvent("wayacreate_toast", { detail: props }))
}
