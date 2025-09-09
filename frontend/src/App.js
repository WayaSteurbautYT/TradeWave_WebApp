import React, { useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import { TokenProvider } from "@/contexts/TokenContext";
import { Toaster } from "@/components/ui/toaster";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

// Pages
import { HomePage } from "@/pages/home-page";
import { GamingPage } from "@/pages/gaming-page";
import { TutorialsPage } from "@/pages/tutorials-page";
import { DesignPage } from "@/pages/design-page";
import { CommunityPage } from "@/pages/community-page";
import { MarketplacePage } from "@/pages/marketplace-page";
import { HirePage } from "@/pages/hire-page";
import { ProfilePage } from "@/pages/profile-page";
import { DashboardPage } from "@/pages/dashboard-page";
import { UploadPage } from "@/pages/upload-page";
import { AIStudioPage } from "@/pages/ai-studio-page";
import { SubscriptionPage } from "@/pages/subscription-page";
import { MessagesPage } from "@/pages/messages-page";
import { SearchPage } from "@/pages/search-page";
import { SettingsPage } from "@/pages/settings-page";
import { TokensPage } from "@/pages/tokens-page";
import { OrdersPage } from "@/pages/orders-page";
import { AnalyticsPage } from "@/pages/analytics-page";
import { AchievementsPage } from "@/pages/achievements-page";

function AppRoutes() {
  const location = useLocation();

  // Handle session authentication from URL fragment
  useEffect(() => {
    if (location.hash.includes('session_id=') && location.pathname !== '/profile') {
      // Redirect to profile page while preserving the session fragment
      window.location.href = '/profile' + location.hash;
    }
  }, [location]);

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/gaming" element={<GamingPage />} />
      <Route path="/tutorials" element={<TutorialsPage />} />
      <Route path="/design" element={<DesignPage />} />
      <Route path="/community" element={<CommunityPage />} />
      <Route path="/marketplace" element={<MarketplacePage />} />
      <Route path="/hire" element={<HirePage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/upload" element={<UploadPage />} />
      <Route path="/ai-studio" element={<AIStudioPage />} />
      <Route path="/subscription" element={<SubscriptionPage />} />
      <Route path="/messages" element={<MessagesPage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/tokens" element={<TokensPage />} />
      <Route path="/orders" element={<OrdersPage />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <AuthProvider>
        <TokenProvider>
          <div className="App min-h-screen flex flex-col">
            <BrowserRouter>
              <Header />
              <main className="flex-1">
                <AppRoutes />
              </main>
              <Footer />
              <Toaster />
            </BrowserRouter>
          </div>
        </TokenProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;