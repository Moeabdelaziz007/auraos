import { useQuery } from "@tanstack/react-query";
import SystemMetrics from "@/components/dashboard/SystemMetrics";
import QuickActions from "@/components/dashboard/QuickActions";
import RecentActivity from "@/components/dashboard/RecentActivity";
import AgentTemplateCard from "@/components/agents/agent-template-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { AgentTemplate, UserAgent } from "@shared/schema";

interface DashboardOverviewProps {
  onShowAIFeatures: () => void;
  onShowAnalytics: () => void;
  onShowWorkflows: () => void;
  agentTemplates: AgentTemplate[];
  userAgents: UserAgent[];
  templatesLoading: boolean;
  agentsLoading: boolean;
}

export default function DashboardOverview({
  onShowAIFeatures,
  onShowAnalytics,
  onShowWorkflows,
  agentTemplates,
  userAgents,
  templatesLoading,
  agentsLoading
}: DashboardOverviewProps) {

  return (
    <>
      <SystemMetrics />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* Left Column: Social Feed */}
        <div className="lg:col-span-2 space-y-6">
          <RecentActivity />

          {/* Workflow Builder Preview */}
          <Card className="relative overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="gradient-cyber-primary bg-clip-text text-transparent">Visual Workflow Builder</CardTitle>
                <Button variant="holographic" size="sm" data-testid="link-open-editor">
                  Open Editor
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative bg-gradient-to-br from-muted/30 to-muted/10 rounded-xl p-6 min-h-[300px] overflow-hidden border border-primary/20">
                {/* Cyberpunk Grid Background */}
                <div className="absolute inset-0 opacity-10">
                  <div className="grid grid-cols-12 grid-rows-8 h-full w-full">
                    {Array.from({ length: 96 }).map((_, i) => (
                      <div key={i} className="border border-primary/20"></div>
                    ))}
                  </div>
                </div>

                <div className="relative flex items-center justify-center space-x-8">
                  {/* Trigger Node */}
                  <div className="gradient-cyber-primary text-white px-6 py-4 rounded-xl shadow-lg cursor-move transition-all duration-300 hover:scale-105 neon-glow-md hover:neon-glow-lg animate-hologram-flicker" data-testid="workflow-node-trigger">
                    <div className="flex items-center gap-3">
                      <i className="fas fa-play-circle text-xl"></i>
                      <div>
                        <div className="text-sm font-bold">Trigger</div>
                        <div className="text-xs opacity-80">New Mention</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="h-0.5 w-16 bg-gradient-to-r from-primary to-accent"></div>
                    <i className="fas fa-chevron-right text-primary ml-2 animate-neon-pulse"></i>
                  </div>

                  {/* AI Node */}
                  <div className="gradient-cyber-secondary text-white px-6 py-4 rounded-xl shadow-lg cursor-move transition-all duration-300 hover:scale-105 neon-glow-md hover:neon-glow-lg animate-hologram-flicker" data-testid="workflow-node-ai">
                    <div className="flex items-center gap-3">
                      <i className="fas fa-robot text-xl"></i>
                      <div>
                        <div className="text-sm font-bold">AI Analysis</div>
                        <div className="text-xs opacity-80">Sentiment Check</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="h-0.5 w-16 bg-gradient-to-r from-accent to-primary"></div>
                    <i className="fas fa-chevron-right text-accent ml-2 animate-neon-pulse"></i>
                  </div>

                  {/* Action Node */}
                  <div className="gradient-cyber-tertiary text-white px-6 py-4 rounded-xl shadow-lg cursor-move transition-all duration-300 hover:scale-105 neon-glow-md hover:neon-glow-lg animate-hologram-flicker" data-testid="workflow-node-action">
                    <div className="flex items-center gap-3">
                      <i className="fas fa-reply text-xl"></i>
                      <div>
                        <div className="text-sm font-bold">Auto Reply</div>
                        <div className="text-xs opacity-80">Generate Response</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground" data-testid="text-last-run">Last run: 2 minutes ago</span>
                    <div className="flex items-center gap-4">
                      <span className="text-primary neon-text" data-testid="text-successful-runs">✓ 12 successful runs today</span>
                      <span className="text-muted-foreground" data-testid="text-errors">• 0 errors</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: AI Agents & Templates */}
        <div className="space-y-6">
          {/* AI Agent Templates */}
          <Card className="relative overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="gradient-cyber-primary bg-clip-text text-transparent">AI Agent Templates</CardTitle>
                <Button variant="neon" size="sm" data-testid="link-view-all-templates">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {templatesLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="p-4 bg-muted/50 rounded-lg animate-pulse">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : (
                agentTemplates?.slice(0, 3).map((template) => (
                  <AgentTemplateCard key={template.id} template={template} />
                ))
              )}

              <Button
                className="w-full gradient-cyber-primary hover:gradient-cyber-secondary transition-all duration-300 neon-glow-md hover:neon-glow-lg"
                data-testid="button-create-agent"
              >
                <i className="fas fa-plus mr-2"></i>
                Create Custom Agent
              </Button>
            </CardContent>
          </Card>

          {/* Active Automations */}
          <Card className="relative overflow-hidden">
            <CardHeader>
              <CardTitle className="gradient-cyber-secondary bg-clip-text text-transparent">Active Automations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {agentsLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg animate-pulse">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl border border-primary/20 neon-glow-sm hover:neon-glow-md transition-all duration-300" data-testid="automation-daily-scheduler">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-primary rounded-full animate-neon-pulse neon-glow-sm"></div>
                      <div>
                        <p className="text-sm font-medium text-foreground neon-text">Daily Content Scheduler</p>
                        <p className="text-xs text-muted-foreground">Last run: 30 min ago</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" data-testid="button-automation-options">
                      <i className="fas fa-ellipsis-v"></i>
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-accent/10 to-primary/10 rounded-xl border border-accent/20 neon-glow-sm hover:neon-glow-md transition-all duration-300" data-testid="automation-engagement-tracker">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-accent rounded-full animate-neon-pulse neon-glow-sm"></div>
                      <div>
                        <p className="text-sm font-medium text-foreground neon-text">Engagement Tracker</p>
                        <p className="text-xs text-muted-foreground">Last run: 1 hour ago</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" data-testid="button-automation-options">
                      <i className="fas fa-ellipsis-v"></i>
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl border border-yellow-500/20 neon-glow-sm hover:neon-glow-md transition-all duration-300" data-testid="automation-hashtag-optimizer">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full animate-neon-pulse neon-glow-sm"></div>
                      <div>
                        <p className="text-sm font-medium text-foreground neon-text">Hashtag Optimizer</p>
                        <p className="text-xs text-muted-foreground">Paused</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" data-testid="button-automation-options">
                      <i className="fas fa-ellipsis-v"></i>
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <QuickActions
            onShowAIFeatures={onShowAIFeatures}
            onShowAnalytics={onShowAnalytics}
            onShowWorkflows={onShowWorkflows}
          />
        </div>
      </div>
    </>
  );
}
