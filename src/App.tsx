import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthWrapper } from "./components/AuthWrapper.tsx";
import { AppShell } from "./components/AppShell.tsx";
import { MarketingNav } from "./components/MarketingNav.tsx";
import { MarketingFooter } from "./components/MarketingFooter.tsx";
import { ProgressProvider } from "./contexts/ProgressContext.tsx";
import Home from "./pages/Home.tsx";
import Terms from "./pages/Terms.tsx";
import Privacy from "./pages/Privacy.tsx";
import Login from "./pages/Login.tsx";
import VideoGenerator from "./pages/VideoGenerator.tsx";
import Furnisher from "./pages/Furnisher.tsx";
import Assets from "./pages/Assets.tsx";
import { Library } from "./pages/app/Library.tsx";
import { Docs } from "./pages/app/Docs.tsx";
import { Profile } from "./pages/app/Profile.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

function AppContent() {
  const location = useLocation();
  const isAppRoute = location.pathname.startsWith('/app') && !location.pathname.startsWith('/app/login');

  if (isAppRoute) {
    return (
      <AuthWrapper>
        {(user, session) => (
          <Routes>
            <Route path="/app" element={<AppShell />}>
              <Route index element={<Library />} />
              <Route path="library" element={<Library />} />
              <Route path="reel" element={<VideoGenerator user={user} session={session} />} />
              <Route path="stage" element={<Furnisher />} />
              <Route path="docs" element={<Docs />} />
              <Route path="profile" element={<Profile />} />
              <Route path="assets" element={<Assets />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        )}
      </AuthWrapper>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <MarketingNav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/app/login" element={<Login />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <MarketingFooter />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default function AppRoot() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <ProgressProvider>
            <App />
          </ProgressProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

