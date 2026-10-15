import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/contexts/AuthContext"
import { TokenProvider } from "@/contexts/TokenContext"
import { Toaster } from "@/components/ui/toaster"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

// Pages
import { HomePage } from "@/pages/home-page"
import { GamingPage } from "@/pages/gaming-page"
import { TutorialsPage } from "@/pages/tutorials-page"
import { DesignPage } from "@/pages/design-page"
import { CommunityPage } from "@/pages/community-page"
import { MarketplacePage } from "@/pages/marketplace-page"
import { HirePage } from "@/pages/hire-page"
import { BiddingPage } from "@/pages/bidding-page"
import { GuildsPage } from "@/pages/guilds-page"
import { AIStudioPage } from "@/pages/ai-studio-page"
import { TokensPage } from "@/pages/tokens-page"
import { DashboardPage } from "@/pages/dashboard-page"
import { OrdersPage } from "@/pages/orders-page"
import { AnalyticsPage } from "@/pages/analytics-page"
import { AchievementsPage } from "@/pages/achievements-page"
import { MessagesPage } from "@/pages/messages-page"
import { ProfilePage } from "@/pages/profile-page"
import { SettingsPage } from "@/pages/settings-page"
import { SubscriptionPage } from "@/pages/subscription-page"
import { UploadPage } from "@/pages/upload-page"
import { SearchPage } from "@/pages/search-page"
import { ServicesPage } from "@/pages/services-page"
import { CoursesPage } from "@/pages/courses-page"
import { StreamingPage } from "@/pages/streaming-page"

export function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <AuthProvider>
        <TokenProvider>
          <div className="min-h-screen flex flex-col bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary">
            <BrowserRouter>
              <Header />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/gaming" element={<GamingPage />} />
                  <Route path="/tutorials" element={<TutorialsPage />} />
                  <Route path="/design" element={<DesignPage />} />
                  <Route path="/community" element={<CommunityPage />} />
                  <Route path="/marketplace" element={<MarketplacePage />} />
                  <Route path="/hire" element={<HirePage />} />
                  <Route path="/bidding" element={<BiddingPage />} />
                  <Route path="/guilds" element={<GuildsPage />} />
                  <Route path="/ai-studio" element={<AIStudioPage />} />
                  <Route path="/tokens" element={<TokensPage />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/orders" element={<OrdersPage />} />
                  <Route path="/analytics" element={<AnalyticsPage />} />
                  <Route path="/achievements" element={<AchievementsPage />} />
                  <Route path="/messages" element={<MessagesPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/subscription" element={<SubscriptionPage />} />
                  <Route path="/upload" element={<UploadPage />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/services" element={<ServicesPage />} />
                  <Route path="/courses" element={<CoursesPage />} />
                  <Route path="/streaming" element={<StreamingPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              <Footer />
              <Toaster />
            </BrowserRouter>
          </div>
        </TokenProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
