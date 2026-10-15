import { showToast } from "@/components/ui/toaster"

export function useToast() {
  return {
    toast: showToast,
  }
}
