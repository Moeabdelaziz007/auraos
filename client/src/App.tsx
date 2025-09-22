import { Switch, Route } from "wouter";
import { Suspense, lazy } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/use-theme";
import { AuthProvider } from "@/hooks/use-auth";
import ProtectedRoute from "@/components/auth/protected-route";
import MainLayout from "@/components/layout/main-layout";

// Lazy load pages
const Dashboard = lazy(() => import("@/pages/dashboard"));
const AIBrowserPage = lazy(() => import("@/pages/ai-browser"));
const AINotesPage = lazy(() => import("@/pages/ai-notes"));
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

const PageLoader = () => (
  <div className="flex h-screen items-center justify-center bg-background">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  </div>
);

function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/login" component={Login} />
        <ProtectedRoute>
          <MainLayout>
            <Switch>
              <Route path="/" component={Dashboard} />
              <Route path="/ai-browser" component={AIBrowserPage} />
              <Route path="/ai-notes" component={AINotesPage} />
              <Route path="/social-feed" component={SocialFeed} />
              <Route path="/workflows" component={Workflows} />
              <Route path="/ai-agents" component={AIAgents} />
              <Route path="/mcp-tools" component={MCPToolsPage} />
              <Route path="/prompt-library" component={PromptLibraryPage} />
              <Route path="/telegram" component={TelegramPage} />
              <Route path="/smart-learning" component={SmartLearningPage} />
              <Route path="/advanced-ai-tools" component={AdvancedAIToolsPage} />
              <Route path="/learning" component={LearningDashboard} />
              <Route path="/debug" component={DebugView} />
              <Route path="/workspace" component={Workspace} />
              <Route path="/analytics" component={Analytics} />
              <Route path="/settings" component={Settings} />
              <Route component={NotFound} />
            </Switch>
          </MainLayout>
        </ProtectedRoute>
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <TooltipProvider>
            <Toaster />
            <AppRoutes />
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
