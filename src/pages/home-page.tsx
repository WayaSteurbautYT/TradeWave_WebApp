import { HeroSection } from "@/components/home/hero-section"
import { FeaturesSection } from "@/components/home/features-section"
import { MarketplacePreview } from "@/components/home/marketplace-preview"
import { TestimonialsSection } from "@/components/home/testimonials-section"
import { CTASection } from "@/components/home/cta-section"

export function HomePage() {
  return (
    <div className="space-y-0">
      <HeroSection />
      <FeaturesSection />
      <MarketplacePreview />
      <TestimonialsSection />
      <CTASection />
    </div>
  )
}
