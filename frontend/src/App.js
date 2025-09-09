import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import { TokenProvider } from "@/contexts/TokenContext";
import { Toaster } from "@/components/ui/toaster";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { HomePage } from "@/pages/home-page";
import { MarketplacePage } from "@/pages/marketplace-page";
import { ServicesPage } from "@/pages/services-page";
import { CoursesPage } from "@/pages/courses-page";
import { StreamingPage } from "@/pages/streaming-page";
import { CommunityPage } from "@/pages/community-page";
import { ProfilePage } from "@/pages/profile-page";
import { DashboardPage } from "@/pages/dashboard-page";

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <AuthProvider>
        <TokenProvider>
          <div className="App min-h-screen flex flex-col">
            <BrowserRouter>
              <Header />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/marketplace" element={<MarketplacePage />} />
                  <Route path="/services" element={<ServicesPage />} />
                  <Route path="/courses" element={<CoursesPage />} />
                  <Route path="/streaming" element={<StreamingPage />} />
                  <Route path="/community" element={<CommunityPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                </Routes>
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