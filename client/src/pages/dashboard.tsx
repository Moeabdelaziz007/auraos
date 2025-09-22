import { useQuery } from "@tanstack/react-query";
import { useState, useRef } from "react";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import StatsGrid from "@/components/dashboard/stats-grid";
import PostCard from "@/components/social/post-card";
import AgentTemplateCard from "@/components/agents/agent-template-card";
import ChatWidget from "@/components/chat/chat-widget";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import UserHistoryAnalytics from "@/components/analytics/user-history-analytics";
import AIPersonalizationDashboard from "@/components/ai/ai-personalization-dashboard";
import WorkflowMarketplace from "@/components/workflow/workflow-marketplace";
import type { PostWithAuthor, AgentTemplate, UserAgent } from "@shared/schema";

export default function Dashboard() {
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showAIFeatures, setShowAIFeatures] = useState(false);
  const [showWorkflows, setShowWorkflows] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [executingToolId, setExecutingToolId] = useState<string | null>(null);
  const [toolResults, setToolResults] = useState<Record<string, any>>({});
  const aiInputRef = useRef<HTMLInputElement>(null);

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

  const { data: mcpTools, isLoading: toolsLoading, error: toolsError } = useQuery<any[]>({
    queryKey: ['/api/mcp/tools'],
    queryFn: () => fetch('/api/mcp/tools').then(res => res.json()),
  });

  // AI Assistant handler
  async function handleAiChat(e: React.FormEvent) {
    e.preventDefault();
    if (!aiInput.trim()) return;
    setAiLoading(true);
    setAiResponse("");
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiInput })
      });
      const data = await res.json();
      setAiResponse(data.text || "No response");
    } catch (err) {
      setAiResponse("Error: Could not reach AI model.");
    } finally {
      setAiLoading(false);
      setAiInput("");
      aiInputRef.current?.focus();
    }
  }

  // MCP tool execution handler
  async function handleExecuteTool(toolId: string) {
    setExecutingToolId(toolId);
    setToolResults(r => ({ ...r, [toolId]: { loading: true, result: null, error: null } }));
    try {
      const res = await fetch(`/api/mcp/tools/${toolId}/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ params: {} }) // Extend to support params if needed
      });
      const data = await res.json();
      setToolResults(r => ({ ...r, [toolId]: { loading: false, result: data.result, error: null } }));
    } catch (err) {
      setToolResults(r => ({ ...r, [toolId]: { loading: false, result: null, error: "Execution failed" } }));
    } finally {
      setExecutingToolId(null);
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background carbon-texture">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Dashboard" subtitle="Manage your AI-powered social platform" />
        
        <main className="flex-1 overflow-auto cyber-scrollbar">
          <div className="p-6 max-w-7xl mx-auto">
            {showAnalytics ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold neon-text">User Analytics</h1>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowAnalytics(false)}
                    className="neon-glow-sm"
                  >
                    Back to Dashboard
                  </Button>
                </div>
                <UserHistoryAnalytics />
              </div>
            ) : showAIFeatures ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold neon-text">AI Personalization</h1>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowAIFeatures(false)}
                    className="neon-glow-sm"
                  >
                    Back to Dashboard
                  </Button>
                </div>
                <AIPersonalizationDashboard />
              </div>
            ) : showWorkflows ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold neon-text">Workflow Marketplace</h1>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowWorkflows(false)}
                    className="neon-glow-sm"
                  >
                    Back to Dashboard
                  </Button>
                </div>
                <WorkflowMarketplace />
              </div>
            ) : (
              <>
                <StatsGrid />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
              {/* Left Column: Social Feed */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold neon-text animate-neon-flicker">Recent Posts</h2>
                  <div className="flex items-center gap-2">
                    <Button variant="neon" size="sm" data-testid="filter-all">
                      All
                    </Button>
                    <Button variant="cyber" size="sm" data-testid="filter-ai-generated">
                      AI Generated
                    </Button>
                    <Button variant="outline" size="sm" data-testid="filter-manual">
                      Manual
                    </Button>
                  </div>
                </div>

                {postsLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Card key={i} className="p-6 animate-pulse">
                        <div className="space-y-3">
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

                {/* Quick Actions */}
                <Card className="relative overflow-hidden">
                  <CardHeader>
                    <CardTitle className="gradient-cyber-tertiary bg-clip-text text-transparent">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      <Button variant="ghost" className="p-4 bg-gradient-to-br from-primary/20 to-primary/10 text-primary hover:from-primary/30 hover:to-primary/20 h-auto flex-col neon-glow-sm hover:neon-glow-md transition-all duration-300" data-testid="button-schedule-post">
                        <i className="fas fa-calendar-plus text-xl mb-2"></i>
                        <span className="text-sm font-medium">Schedule Post</span>
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        className="p-4 bg-gradient-to-br from-purple-500/20 to-purple-500/10 text-purple-400 hover:from-purple-500/30 hover:to-purple-500/20 h-auto flex-col neon-glow-sm hover:neon-glow-md transition-all duration-300" 
                        data-testid="button-ai-personalization"
                        onClick={() => setShowAIFeatures(true)}
                      >
                        <i className="fas fa-brain text-xl mb-2"></i>
                        <span className="text-sm font-medium">AI Personalization</span>
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        className="p-4 bg-gradient-to-br from-blue-500/20 to-blue-500/10 text-blue-400 hover:from-blue-500/30 hover:to-blue-500/20 h-auto flex-col neon-glow-sm hover:neon-glow-md transition-all duration-300" 
                        data-testid="button-view-analytics"
                        onClick={() => setShowAnalytics(true)}
                      >
                        <i className="fas fa-chart-bar text-xl mb-2"></i>
                        <span className="text-sm font-medium">Analytics</span>
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        className="p-4 bg-gradient-to-br from-orange-500/20 to-orange-500/10 text-orange-400 hover:from-orange-500/30 hover:to-orange-500/20 h-auto flex-col neon-glow-sm hover:neon-glow-md transition-all duration-300" 
                        data-testid="button-workflow-marketplace"
                        onClick={() => setShowWorkflows(true)}
                      >
                        <i className="fas fa-cogs text-xl mb-2"></i>
                        <span className="text-sm font-medium">Workflows</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* MCP Tools Section */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>MCP Tools</CardTitle>
              </CardHeader>
              <CardContent>
                {toolsLoading && <div>Loading MCP tools...</div>}
                {toolsError && <div className="text-red-500">Failed to load MCP tools.</div>}
                {mcpTools && mcpTools.length === 0 && <div>No MCP tools available.</div>}
                {mcpTools && mcpTools.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {mcpTools.map(tool => (
                      <Card key={tool.id} className="border border-primary/30">
                        <CardHeader>
                          <CardTitle>{tool.name}</CardTitle>
                          <div className="text-xs text-muted-foreground">{tool.category} | v{tool.version}</div>
                        </CardHeader>
                        <CardContent>
                          <div className="mb-2">{tool.description}</div>
                          <div className="mb-2">
                            <Badge variant={tool.isActive ? "default" : "secondary"}>
                              {tool.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <div className="text-xs">
                            <div>Capabilities: {tool.capabilities?.join(', ')}</div>
                            <div>Total Calls: {tool.usage?.totalCalls ?? 0}</div>
                            <div>Success Rate: {tool.usage?.successRate != null ? `${(tool.usage.successRate * 100).toFixed(1)}%` : 'N/A'}</div>
                            <div>Avg. Execution: {tool.usage?.averageExecutionTime ?? 'N/A'} ms</div>
                            <div>Last Used: {tool.usage?.lastUsed ? new Date(tool.usage.lastUsed).toLocaleString() : 'Never'}</div>
                          </div>
                          <div className="mt-2">
                            <Button size="sm" variant="outline" onClick={() => handleExecuteTool(tool.id)} disabled={executingToolId === tool.id}>
                              {executingToolId === tool.id ? 'Executing...' : 'Execute'}
                            </Button>
                          </div>
                          {toolResults[tool.id]?.loading && <div className="text-xs text-muted-foreground mt-1">Running...</div>}
                          {toolResults[tool.id]?.result && (
                            <div className="text-xs mt-2 bg-muted/30 p-2 rounded">Result: {JSON.stringify(toolResults[tool.id].result)}</div>
                          )}
                          {toolResults[tool.id]?.error && (
                            <div className="text-xs text-red-500 mt-2">{toolResults[tool.id].error}</div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
              </>
            )}
          </div>
        </main>
      </div>

      {/* Right Sidebar: AI Assistant */}
      <Card className="fixed right-0 top-0 h-full w-80 z-40 shadow-xl border-l border-primary/20 bg-background flex flex-col">
        <CardHeader>
          <CardTitle>AI Assistant (Free Model)</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <form onSubmit={handleAiChat} className="flex mb-2">
            <input
              ref={aiInputRef}
              className="flex-1 border rounded-l px-2 py-1 text-sm"
              placeholder="Ask the AI anything..."
              value={aiInput}
              onChange={e => setAiInput(e.target.value)}
              disabled={aiLoading}
            />
            <Button type="submit" size="sm" className="rounded-l-none" disabled={aiLoading || !aiInput.trim()}>Send</Button>
          </form>
          <div className="flex-1 overflow-auto text-sm p-2 bg-muted/10 rounded">
            {aiLoading ? <div>Thinking...</div> : aiResponse && <div>{aiResponse}</div>}
          </div>
        </CardContent>
      </Card>

      <ChatWidget />
    </div>
  );
}
