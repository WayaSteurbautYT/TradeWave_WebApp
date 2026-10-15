import * as React from "react"
import { cn } from "@/lib/utils"

interface DropdownContextValue {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const DropdownContext = React.createContext<DropdownContextValue | null>(null)

export function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  const menuRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [open])

  return (
    <DropdownContext.Provider value={{ open, setOpen }}>
      <div ref={menuRef} className="relative inline-block text-left">
        {children}
      </div>
    </DropdownContext.Provider>
  )
}

export function DropdownMenuTrigger({
  children,
  asChild,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }) {
  const context = React.useContext(DropdownContext)
  return (
    <button
      type="button"
      onClick={() => context?.setOpen((prev) => !prev)}
      className={cn("inline-flex items-center", className)}
      {...props}
    >
      {children}
    </button>
  )
}

export function DropdownMenuContent({
  className,
  align = "end",
  forceMount,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { align?: "start" | "end" | "center"; forceMount?: boolean }) {
  const context = React.useContext(DropdownContext)
  if (!context?.open && !forceMount) return null

  return (
    <div
      className={cn(
        "absolute z-50 min-w-[14rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-80",
        align === "end" ? "right-0" : "left-0",
        "mt-2 top-full",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function DropdownMenuItem({
  className,
  onClick,
  children,
  asChild,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { asChild?: boolean }) {
  const context = React.useContext(DropdownContext)
  return (
    <div
      onClick={(e) => {
        onClick?.(e)
        context?.setOpen(false)
      }}
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function DropdownMenuLabel({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("px-2 py-1.5 text-sm font-semibold", className)}
      {...props}
    />
  )
}

export function DropdownMenuSeparator({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("-mx-1 my-1 h-px bg-muted", className)}
      {...props}
    />
  )
}
