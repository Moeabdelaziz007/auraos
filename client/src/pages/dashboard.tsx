import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import StatsGrid from "@/components/dashboard/stats-grid";
import PostCard from "@/components/social/post-card";
import AgentTemplateCard from "@/components/agents/agent-template-card";
import ChatWidget from "@/components/chat/chat-widget";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { PostWithAuthor, AgentTemplate, UserAgent } from "@shared/schema";

export default function Dashboard() {
  const { data: posts, isLoading: postsLoading } = useQuery<PostWithAuthor[]>({
    queryKey: ['/api/posts'],
  });

  const { data: agentTemplates, isLoading: templatesLoading } = useQuery<AgentTemplate[]>({
    queryKey: ['/api/agent-templates'],
  });

  const { data: userAgents, isLoading: agentsLoading } = useQuery<UserAgent[]>({
    queryKey: ['/api/user-agents'],
    queryFn: () => fetch('/api/user-agents?userId=user-1').then(res => res.json()),
  });

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Dashboard" subtitle="Manage your AI-powered social platform" />
        
        <main className="flex-1 overflow-auto">
          <div className="p-6 max-w-7xl mx-auto">
            <StatsGrid />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
              {/* Left Column: Social Feed */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-foreground">Recent Posts</h2>
                  <div className="flex items-center gap-2">
                    <Button variant="default" size="sm" data-testid="filter-all">
                      All
                    </Button>
                    <Button variant="ghost" size="sm" data-testid="filter-ai-generated">
                      AI Generated
                    </Button>
                    <Button variant="ghost" size="sm" data-testid="filter-manual">
                      Manual
                    </Button>
                  </div>
                </div>

                {postsLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Card key={i} className="p-6">
                        <div className="animate-pulse space-y-3">
                          <div className="h-4 bg-muted rounded w-3/4"></div>
                          <div className="h-3 bg-muted rounded w-1/2"></div>
                          <div className="h-32 bg-muted rounded"></div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {posts?.map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </div>
                )}

                {/* Workflow Builder Preview */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Visual Workflow Builder</CardTitle>
                      <Button variant="link" size="sm" data-testid="link-open-editor">
                        Open Editor
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="relative bg-muted/30 rounded-lg p-6 min-h-[300px] overflow-hidden">
                      <div className="flex items-center justify-center space-x-8">
                        {/* Trigger Node */}
                        <div className="bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg cursor-move transition-transform hover:scale-105" data-testid="workflow-node-trigger">
                          <div className="flex items-center gap-2">
                            <i className="fas fa-play-circle"></i>
                            <div>
                              <div className="text-sm font-medium">Trigger</div>
                              <div className="text-xs opacity-80">New Mention</div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center">
                          <div className="h-0.5 w-12 bg-border"></div>
                          <i className="fas fa-chevron-right text-muted-foreground ml-2"></i>
                        </div>

                        {/* AI Node */}
                        <div className="bg-primary text-primary-foreground px-4 py-3 rounded-lg shadow-lg cursor-move transition-transform hover:scale-105" data-testid="workflow-node-ai">
                          <div className="flex items-center gap-2">
                            <i className="fas fa-robot"></i>
                            <div>
                              <div className="text-sm font-medium">AI Analysis</div>
                              <div className="text-xs opacity-80">Sentiment Check</div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center">
                          <div className="h-0.5 w-12 bg-border"></div>
                          <i className="fas fa-chevron-right text-muted-foreground ml-2"></i>
                        </div>

                        {/* Action Node */}
                        <div className="bg-accent text-accent-foreground px-4 py-3 rounded-lg shadow-lg cursor-move transition-transform hover:scale-105" data-testid="workflow-node-action">
                          <div className="flex items-center gap-2">
                            <i className="fas fa-reply"></i>
                            <div>
                              <div className="text-sm font-medium">Auto Reply</div>
                              <div className="text-xs opacity-80">Generate Response</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground" data-testid="text-last-run">Last run: 2 minutes ago</span>
                          <div className="flex items-center gap-4">
                            <span className="text-green-600" data-testid="text-successful-runs">✓ 12 successful runs today</span>
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
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>AI Agent Templates</CardTitle>
                      <Button variant="link" size="sm" data-testid="link-view-all-templates">
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
                      className="w-full" 
                      data-testid="button-create-agent"
                    >
                      <i className="fas fa-plus mr-2"></i>
                      Create Custom Agent
                    </Button>
                  </CardContent>
                </Card>

                {/* Active Automations */}
                <Card>
                  <CardHeader>
                    <CardTitle>Active Automations</CardTitle>
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
                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg" data-testid="automation-daily-scheduler">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <div>
                              <p className="text-sm font-medium text-foreground">Daily Content Scheduler</p>
                              <p className="text-xs text-muted-foreground">Last run: 30 min ago</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" data-testid="button-automation-options">
                            <i className="fas fa-ellipsis-v"></i>
                          </Button>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg" data-testid="automation-engagement-tracker">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <div>
                              <p className="text-sm font-medium text-foreground">Engagement Tracker</p>
                              <p className="text-xs text-muted-foreground">Last run: 1 hour ago</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" data-testid="button-automation-options">
                            <i className="fas fa-ellipsis-v"></i>
                          </Button>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg" data-testid="automation-hashtag-optimizer">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                            <div>
                              <p className="text-sm font-medium text-foreground">Hashtag Optimizer</p>
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

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      <Button variant="ghost" className="p-3 bg-primary/10 text-primary hover:bg-primary/20 h-auto flex-col" data-testid="button-schedule-post">
                        <i className="fas fa-calendar-plus text-lg mb-2"></i>
                        <span className="text-sm font-medium">Schedule Post</span>
                      </Button>
                      
                      <Button variant="ghost" className="p-3 bg-accent/10 text-accent hover:bg-accent/20 h-auto flex-col" data-testid="button-ai-generate">
                        <i className="fas fa-sparkles text-lg mb-2"></i>
                        <span className="text-sm font-medium">AI Generate</span>
                      </Button>
                      
                      <Button variant="ghost" className="p-3 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 h-auto flex-col" data-testid="button-view-analytics">
                        <i className="fas fa-chart-bar text-lg mb-2"></i>
                        <span className="text-sm font-medium">Analytics</span>
                      </Button>
                      
                      <Button variant="ghost" className="p-3 bg-green-500/10 text-green-500 hover:bg-green-500/20 h-auto flex-col" data-testid="button-create-workflow">
                        <i className="fas fa-plus text-lg mb-2"></i>
                        <span className="text-sm font-medium">New Agent</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>

      <ChatWidget />
    </div>
  );
}
