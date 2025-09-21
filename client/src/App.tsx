import { Switch, Route } from "wouter";
import { Suspense, lazy } from "react";
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

// Lazy load pages for better performance
const Dashboard = lazy(() => import("@/pages/dashboard"));
const SocialFeed = lazy(() => import("@/pages/social-feed"));
const Workflows = lazy(() => import("@/pages/workflows"));
const AIAgents = lazy(() => import("@/pages/ai-agents"));
const MCPToolsPage = lazy(() => import("@/pages/mcp-tools"));
const PromptLibraryPage = lazy(() => import("@/pages/prompt-library"));
const TelegramPage = lazy(() => import("@/pages/telegram"));
const SmartLearningPage = lazy(() => import("@/pages/smart-learning"));
const AdvancedAIToolsPage = lazy(() => import("@/pages/advanced-ai-tools"));
const LearningDashboard = lazy(() => import("@/pages/learning-dashboard"));
const NotFound = lazy(() => import("@/pages/not-found"));
const DebugView = lazy(() => import("@/pages/DebugView"));
const Workspace = lazy(() => import("@/pages/Workspace"));
const Analytics = lazy(() => import("@/pages/analytics"));
const Settings = lazy(() => import("@/pages/settings"));
const Login = lazy(() => import("@/pages/login"));

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
  </div>
);

function Router() {
  useRouterTracking(); // Track router navigation
  
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/login" component={Login} />
        <ProtectedRoute>
          <Switch>
            <Route path="/" component={withPageTracking(Dashboard, 'Dashboard')} />
            <Route path="/social-feed" component={withPageTracking(SocialFeed, 'Social Feed')} />
            <Route path="/workflows" component={withPageTracking(Workflows, 'Workflows')} />
            <Route path="/ai-agents" component={withPageTracking(AIAgents, 'AI Agents')} />
            <Route path="/mcp-tools" component={withPageTracking(MCPToolsPage, 'MCP Tools')} />
            <Route path="/prompt-library" component={withPageTracking(PromptLibraryPage, 'Prompt Library')} />
            <Route path="/telegram" component={withPageTracking(TelegramPage, 'Telegram')} />
            <Route path="/smart-learning" component={withPageTracking(SmartLearningPage, 'Smart Learning')} />
            <Route path="/advanced-ai-tools" component={withPageTracking(AdvancedAIToolsPage, 'Advanced AI Tools')} />
            <Route path="/learning" component={withPageTracking(LearningDashboard, 'Learning Dashboard')} />
            <Route path="/debug" component={withPageTracking(DebugView, 'Debug View')} />
            <Route path="/workspace" component={withPageTracking(Workspace, 'Workspace')} />
            <Route path="/analytics" component={withPageTracking(Analytics, 'Analytics')} />
            <Route path="/settings" component={withPageTracking(Settings, 'Settings')} />
            <Route component={withPageTracking(NotFound, 'Not Found')} />
          </Switch>
        </ProtectedRoute>
      </Switch>
    </Suspense>
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
