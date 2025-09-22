import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import ChatWidget from "@/components/chat/chat-widget";
import UserHistoryAnalytics from "@/components/analytics/user-history-analytics";
import AIPersonalizationDashboard from "@/components/ai/ai-personalization-dashboard";
import WorkflowMarketplace from "@/components/workflow/workflow-marketplace";
import DashboardOverview from "@/components/dashboard/DashboardOverview";
import MCPToolsPanel from "@/components/dashboard/MCPToolsPanel";
import TelegramBotPanel from "@/components/dashboard/TelegramBotPanel";
import AutomationDashboard from "@/components/dashboard/AutomationDashboard";
import TaskQueue from "@/components/dashboard/TaskQueue";
import { Button } from "@/components/ui/button";
import type { AgentTemplate, UserAgent } from "@shared/schema";

export default function Dashboard() {
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showAIFeatures, setShowAIFeatures] = useState(false);
  const [showWorkflows, setShowWorkflows] = useState(false);

  const { data: agentTemplates = [], isLoading: templatesLoading } = useQuery<AgentTemplate[]>({
    queryKey: ['/api/agent-templates'],
  });

  const { data: userAgents = [], isLoading: agentsLoading } = useQuery<UserAgent[]>({
    queryKey: ['/api/user-agents'],
    queryFn: () => fetch('/api/user-agents?userId=user-1').then(res => res.json()),
  });

  const mainContent = () => {
    if (showAnalytics) {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold neon-text">User Analytics</h1>
            <Button variant="outline" onClick={() => setShowAnalytics(false)} className="neon-glow-sm">
              Back to Dashboard
            </Button>
          </div>
          <UserHistoryAnalytics />
        </div>
      );
    }
    if (showAIFeatures) {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold neon-text">AI Personalization</h1>
            <Button variant="outline" onClick={() => setShowAIFeatures(false)} className="neon-glow-sm">
              Back to Dashboard
            </Button>
          </div>
          <AIPersonalizationDashboard />
        </div>
      );
    }
    if (showWorkflows) {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold neon-text">Workflow Marketplace</h1>
            <Button variant="outline" onClick={() => setShowWorkflows(false)} className="neon-glow-sm">
              Back to Dashboard
            </Button>
          </div>
          <WorkflowMarketplace />
        </div>
      );
    }
    return (
      <div className="space-y-8">
        <DashboardOverview
          onShowAIFeatures={() => setShowAIFeatures(true)}
          onShowAnalytics={() => setShowAnalytics(true)}
          onShowWorkflows={() => setShowWorkflows(true)}
          agentTemplates={agentTemplates}
          userAgents={userAgents}
          templatesLoading={templatesLoading}
          agentsLoading={agentsLoading}
        />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <TaskQueue />
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
            <MCPToolsPanel />
            <TelegramBotPanel />
            <AutomationDashboard />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background carbon-texture">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Dashboard" subtitle="Manage your AI-powered social platform" />
        <main className="flex-1 overflow-auto cyber-scrollbar">
          <div className="p-6 max-w-7xl mx-auto">
            {mainContent()}
          </div>
        </main>
      </div>
      <ChatWidget />
    </div>
  );
}
