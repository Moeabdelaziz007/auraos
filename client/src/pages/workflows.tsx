import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import WorkflowBuilder from "@/components/workflow/workflow-builder";
import ChatWidget from "@/components/chat/chat-widget";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Workflow } from "@shared/schema";

export default function Workflows() {
  const { data: workflows, isLoading } = useQuery<Workflow[]>({
    queryKey: ['/api/workflows'],
    queryFn: () => fetch('/api/workflows?userId=user-1').then(res => res.json()),
  });

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Workflows" 
          subtitle="Create and manage your automation workflows" 
        />
        
        <main className="flex-1 overflow-auto">
          <div className="p-6 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Workflow Builder */}
              <div className="lg:col-span-2">
                <WorkflowBuilder />
              </div>

              {/* Right Column: Existing Workflows */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Workflows</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className="p-4 bg-muted/50 rounded-lg animate-pulse">
                            <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-muted rounded w-1/2"></div>
                          </div>
                        ))}
                      </div>
                    ) : workflows?.length ? (
                      <div className="space-y-4">
                        {workflows.map((workflow) => (
                          <div key={workflow.id} className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors" data-testid={`workflow-${workflow.id}`}>
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-medium text-foreground">{workflow.name}</h4>
                              <Badge variant={workflow.isActive ? "default" : "secondary"} data-testid={`status-${workflow.id}`}>
                                {workflow.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">{workflow.description}</p>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span data-testid={`run-count-${workflow.id}`}>
                                {workflow.runCount} runs
                              </span>
                              <span data-testid={`last-run-${workflow.id}`}>
                                {workflow.lastRun ? `Last: ${new Date(workflow.lastRun).toLocaleDateString()}` : 'Never run'}
                              </span>
                            </div>
                            <div className="flex gap-2 mt-3">
                              <Button size="sm" variant="outline" data-testid={`button-edit-${workflow.id}`}>
                                <i className="fas fa-edit mr-1"></i>
                                Edit
                              </Button>
                              <Button size="sm" variant="outline" data-testid={`button-toggle-${workflow.id}`}>
                                <i className={`fas ${workflow.isActive ? 'fa-pause' : 'fa-play'} mr-1`}></i>
                                {workflow.isActive ? 'Pause' : 'Start'}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <i className="fas fa-project-diagram text-4xl text-muted-foreground mb-4"></i>
                        <p className="text-muted-foreground">No workflows created yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Workflow Templates */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Start Templates</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer" data-testid="template-auto-responder">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                          <i className="fas fa-reply text-white text-sm"></i>
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground">Auto Responder</h4>
                          <p className="text-sm text-muted-foreground">Respond to mentions automatically</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer" data-testid="template-content-scheduler">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
                          <i className="fas fa-calendar text-white text-sm"></i>
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground">Content Scheduler</h4>
                          <p className="text-sm text-muted-foreground">Schedule posts at optimal times</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer" data-testid="template-trend-analyzer">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                          <i className="fas fa-chart-line text-white text-sm"></i>
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground">Trend Analyzer</h4>
                          <p className="text-sm text-muted-foreground">Monitor and respond to trends</p>
                        </div>
                      </div>
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
