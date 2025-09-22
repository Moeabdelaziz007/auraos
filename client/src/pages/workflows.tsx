import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import WorkflowBuilder from "@/components/workflow/workflow-builder";
import ChatWidget from "@/components/chat/chat-widget";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Workflow, WorkflowNode } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function Workflows() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [currentNodes, setCurrentNodes] = useState<WorkflowNode[]>([]);

  const { data: workflows, isLoading } = useQuery<Workflow[]>({
    queryKey: ['/api/workflows'],
    queryFn: () => fetch('/api/workflows?userId=user-1').then(res => res.json()),
  });

  const updateWorkflowMutation = useMutation({
    mutationFn: (updatedWorkflow: Workflow) => {
      if (!updatedWorkflow.id) throw new Error("Workflow ID is missing");
      return fetch(`/api/workflows/${updatedWorkflow.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedWorkflow),
      }).then(res => {
        if (!res.ok) throw new Error("Failed to save workflow");
        return res.json();
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/workflows'] });
      toast({ title: "Success", description: "Workflow saved successfully!" });
      setSelectedWorkflow(data);
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  useEffect(() => {
    if (selectedWorkflow && Array.isArray(selectedWorkflow.nodes)) {
      setCurrentNodes(selectedWorkflow.nodes as WorkflowNode[]);
    } else {
      setCurrentNodes([]);
    }
  }, [selectedWorkflow]);

  const handleSelectWorkflow = (workflow: Workflow) => {
    setSelectedWorkflow(workflow);
  };

  const handleNodesChange = (nodes: WorkflowNode[]) => {
    setCurrentNodes(nodes);
  };

  const handleSave = () => {
    if (!selectedWorkflow) return;
    updateWorkflowMutation.mutate({
      ...selectedWorkflow,
      nodes: currentNodes,
    });
  };

  const runWorkflowMutation = useMutation({
    mutationFn: (workflowId: string) => {
      return fetch(`/api/workflows/${workflowId}/run`, {
        method: 'POST',
      }).then(res => {
        if (!res.ok) throw new Error("Failed to run workflow");
        return res.json();
      });
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Workflow execution started!" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const handleRun = () => {
    if (!selectedWorkflow) return;
    runWorkflowMutation.mutate(selectedWorkflow.id);
  };

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
                {selectedWorkflow ? (
                  <WorkflowBuilder
                    nodes={currentNodes}
                    onNodesChange={handleNodesChange}
                    onSave={handleSave}
                    onRun={handleRun}
                    isSaving={updateWorkflowMutation.isPending}
                    isRunning={runWorkflowMutation.isPending}
                  />
                ) : (
                  <Card className="h-[600px] flex items-center justify-center">
                    <div className="text-center">
                      <i className="fas fa-sitemap text-4xl text-muted-foreground mb-4"></i>
                      <h3 className="text-lg font-medium">Select a Workflow</h3>
                      <p className="text-muted-foreground">Choose a workflow from the right to start editing.</p>
                    </div>
                  </Card>
                )}
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
                          <div
                            key={workflow.id}
                            className={`p-4 rounded-lg cursor-pointer transition-colors ${selectedWorkflow?.id === workflow.id ? 'bg-muted' : 'bg-muted/50 hover:bg-muted'}`}
                            onClick={() => handleSelectWorkflow(workflow)}
                            data-testid={`workflow-${workflow.id}`}
                          >
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
                              <Button size="sm" variant="outline" data-testid={`button-edit-${workflow.id}`} onClick={(e) => { e.stopPropagation(); handleSelectWorkflow(workflow); }}>
                                <i className="fas fa-edit mr-1"></i>
                                Edit
                              </Button>
                              <Button size="sm" variant="outline" data-testid={`button-toggle-${workflow.id}`} onClick={(e) => { e.stopPropagation(); toast({ title: "Coming Soon!", description: "Toggling workflows is not yet implemented." }); }}>
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
