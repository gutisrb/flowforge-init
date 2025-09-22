import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthWrapper } from "@/components/AuthWrapper";
import { Navigation } from "@/components/Navigation";
import { MarketingNav } from "@/components/MarketingNav";
import { MarketingFooter } from "@/components/MarketingFooter";
import { ProgressProvider, useProgress } from "@/contexts/ProgressContext";
import Home from "./pages/Home";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Login from "./pages/Login";
import VideoGenerator from "./pages/VideoGenerator";
import Furnisher from "./pages/Furnisher";
import Assets from "./pages/Assets";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppContent() {
  const location = useLocation();
  const isAppRoute = location.pathname.startsWith('/app');
  const { progress } = useProgress();

  if (isAppRoute) {
    return (
      <AuthWrapper>
        {(user, session) => (
          <div className="min-h-screen bg-background">
            <Navigation user={user} session={session} progress={progress} />
            <Routes>
              <Route path="/app" element={<VideoGenerator user={user} session={session} />} />
              <Route path="/app/furnisher" element={<Furnisher />} />
              <Route path="/app/assets" element={<Assets />} />
              <Route path="/app/login" element={<Login />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        )}
      </AuthWrapper>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <MarketingNav />
      <Routes>
        <Route path="/" element={<Home />} />
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
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <ProgressProvider>
          <App />
        </ProgressProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
