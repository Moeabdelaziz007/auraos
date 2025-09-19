import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import AgentTemplateCard from "@/components/agents/agent-template-card";
import ChatWidget from "@/components/chat/chat-widget";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { AgentTemplate, UserAgent } from "@shared/schema";

export default function AIAgents() {
  const { data: templates, isLoading: templatesLoading } = useQuery<AgentTemplate[]>({
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
        <Header 
          title="AI Agents" 
          subtitle="Create and manage your intelligent automation agents" 
        />
        
        <main className="flex-1 overflow-auto">
          <div className="p-6 max-w-7xl mx-auto">
            <Tabs defaultValue="templates" className="space-y-6">
              <TabsList>
                <TabsTrigger value="templates" data-testid="tab-templates">Templates</TabsTrigger>
                <TabsTrigger value="my-agents" data-testid="tab-my-agents">My Agents</TabsTrigger>
              </TabsList>

              <TabsContent value="templates" className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">Agent Templates</h2>
                    <p className="text-muted-foreground">Choose from pre-built templates or create your own</p>
                  </div>
                  <Button data-testid="button-create-custom-agent">
                    <i className="fas fa-plus mr-2"></i>
                    Create Custom Agent
                  </Button>
                </div>

                {templatesLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Card key={i} className="p-6">
                        <div className="animate-pulse space-y-4">
                          <div className="w-8 h-8 bg-muted rounded-lg"></div>
                          <div className="h-4 bg-muted rounded w-3/4"></div>
                          <div className="h-3 bg-muted rounded w-full"></div>
                          <div className="h-3 bg-muted rounded w-1/2"></div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates?.map((template) => (
                      <AgentTemplateCard 
                        key={template.id} 
                        template={template}
                        showActions 
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="my-agents" className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">My AI Agents</h2>
                    <p className="text-muted-foreground">Manage your active automation agents</p>
                  </div>
                </div>

                {agentsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Card key={i} className="p-6">
                        <div className="animate-pulse space-y-4">
                          <div className="h-4 bg-muted rounded w-3/4"></div>
                          <div className="h-3 bg-muted rounded w-full"></div>
                          <div className="h-8 bg-muted rounded w-1/3 mt-4"></div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : userAgents?.length ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userAgents.map((agent) => (
                      <Card key={agent.id} className="p-6" data-testid={`agent-card-${agent.id}`}>
                        <div className="space-y-4">
                          <div className="flex items-start justify-between">
                            <h3 className="font-semibold text-foreground">{agent.name}</h3>
                            <div className={`w-3 h-3 rounded-full ${agent.isActive ? 'bg-green-500' : 'bg-gray-400'}`} 
                                 data-testid={`status-${agent.id}`}></div>
                          </div>
                          
                          <div className="text-sm text-muted-foreground space-y-2">
                            <div className="flex justify-between">
                              <span>Status:</span>
                              <span className={agent.isActive ? 'text-green-600' : 'text-gray-500'}>
                                {agent.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Runs:</span>
                              <span data-testid={`run-count-${agent.id}`}>{agent.runCount}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Last Run:</span>
                              <span data-testid={`last-run-${agent.id}`}>
                                {agent.lastRun ? new Date(agent.lastRun).toLocaleDateString() : 'Never'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant={agent.isActive ? "secondary" : "default"}
                              data-testid={`button-toggle-${agent.id}`}
                            >
                              <i className={`fas ${agent.isActive ? 'fa-pause' : 'fa-play'} mr-1`}></i>
                              {agent.isActive ? 'Pause' : 'Start'}
                            </Button>
                            <Button size="sm" variant="outline" data-testid={`button-edit-${agent.id}`}>
                              <i className="fas fa-edit mr-1"></i>
                              Edit
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="p-12 text-center">
                    <div className="space-y-4">
                      <i className="fas fa-robot text-4xl text-muted-foreground"></i>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">No agents created yet</h3>
                        <p className="text-muted-foreground">Create your first AI agent from a template or build a custom one</p>
                      </div>
                      <Button data-testid="button-get-started">
                        <i className="fas fa-plus mr-2"></i>
                        Get Started
                      </Button>
                    </div>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      <ChatWidget />
    </div>
  );
}
