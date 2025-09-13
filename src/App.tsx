import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthWrapper } from "@/components/AuthWrapper";
import { Navigation } from "@/components/Navigation";
import { ProgressProvider, useProgress } from "@/contexts/ProgressContext";
import Index from "./pages/Index";
import Furnisher from "./pages/Furnisher";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppContent() {
  const { progress } = useProgress();

  return (
    <AuthWrapper>
      {(user, session) => (
        <BrowserRouter>
          <div className="min-h-screen bg-background">
            <Navigation user={user} session={session} progress={progress} />
            <Routes>
              <Route path="/" element={<Index user={user} session={session} />} />
              <Route path="/furnisher" element={<Furnisher />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      )}
    </AuthWrapper>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ProgressProvider>
        <AppContent />
      </ProgressProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
