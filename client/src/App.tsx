import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/use-theme";
import { AuthProvider } from "@/hooks/use-auth";
import ProtectedRoute from "@/components/auth/protected-route";
import Dashboard from "@/pages/dashboard";
import SocialFeed from "@/pages/social-feed";
import Workflows from "@/pages/workflows";
import AIAgents from "@/pages/ai-agents";
import TelegramPage from "@/pages/telegram";
import SmartLearningPage from "@/pages/smart-learning";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <ProtectedRoute>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/social-feed" component={SocialFeed} />
        <Route path="/workflows" component={Workflows} />
        <Route path="/ai-agents" component={AIAgents} />
        <Route path="/telegram" component={TelegramPage} />
        <Route path="/smart-learning" component={SmartLearningPage} />
        <Route component={NotFound} />
      </Switch>
    </ProtectedRoute>
  );
}

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
