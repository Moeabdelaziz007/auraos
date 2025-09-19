import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/use-theme";
import { AuthProvider } from "@/hooks/use-auth";
import ProtectedRoute from "@/components/auth/protected-route";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { KeyboardShortcuts, COMMON_SHORTCUTS } from "@/components/ui/keyboard-navigation";
import { useRouterTracking } from "@/components/analytics/page-tracker";
import { withPageTracking } from "@/components/analytics/page-tracker";
import Dashboard from "@/pages/dashboard";
import SocialFeed from "@/pages/social-feed";
import Workflows from "@/pages/workflows";
import AIAgents from "@/pages/ai-agents";
import TelegramPage from "@/pages/telegram";
import SmartLearningPage from "@/pages/smart-learning";
import AdvancedAIToolsPage from "@/pages/advanced-ai-tools";
import LearningDashboard from "@/pages/learning-dashboard";
import NotFound from "@/pages/not-found";

function Router() {
  useRouterTracking(); // Track router navigation
  
  return (
    <ProtectedRoute>
      <Switch>
        <Route path="/" component={withPageTracking(Dashboard, 'Dashboard')} />
        <Route path="/social-feed" component={withPageTracking(SocialFeed, 'Social Feed')} />
        <Route path="/workflows" component={withPageTracking(Workflows, 'Workflows')} />
        <Route path="/ai-agents" component={withPageTracking(AIAgents, 'AI Agents')} />
        <Route path="/telegram" component={withPageTracking(TelegramPage, 'Telegram')} />
        <Route path="/smart-learning" component={withPageTracking(SmartLearningPage, 'Smart Learning')} />
        <Route path="/advanced-ai-tools" component={withPageTracking(AdvancedAIToolsPage, 'Advanced AI Tools')} />
        <Route path="/learning" component={withPageTracking(LearningDashboard, 'Learning Dashboard')} />
        <Route component={withPageTracking(NotFound, 'Not Found')} />
      </Switch>
    </ProtectedRoute>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <TooltipProvider>
              <KeyboardShortcuts shortcuts={COMMON_SHORTCUTS}>
                <Toaster />
                <Router />
              </KeyboardShortcuts>
            </TooltipProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
