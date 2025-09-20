import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Workflow, Play, Save, Plus, Trash2, ArrowRight, Bot, Zap } from "lucide-react";
import { availableAgents, availablePlugins } from "./data";

interface WorkflowStep {
  id: string;
  type: 'agent' | 'plugin' | 'condition' | 'delay';
  name: string;
  config: any;
  position: { x: number; y: number };
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  connections: { from: string; to: string }[];
  status: 'draft' | 'active' | 'paused';
  createdAt: string;
  lastRun?: string;
}

export default function WorkflowBuilderApp() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeTab, setActiveTab] = useState('builder');

  const createNewWorkflow = () => {
    const newWorkflow: Workflow = {
      id: `workflow-${Date.now()}`,
      name: 'New Workflow',
      description: 'A new automated workflow',
      steps: [],
      connections: [],
      status: 'draft',
      createdAt: new Date().toISOString()
    };
    
    setWorkflows(prev => [...prev, newWorkflow]);
    setSelectedWorkflow(newWorkflow);
  };

  const addStep = (type: WorkflowStep['type']) => {
    if (!selectedWorkflow) return;

    const newStep: WorkflowStep = {
      id: `step-${Date.now()}`,
      type,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} Step`,
      config: {},
      position: { x: 100, y: 100 + (selectedWorkflow.steps.length * 150) }
    };

    const updatedWorkflow = {
      ...selectedWorkflow,
      steps: [...selectedWorkflow.steps, newStep]
    };

    setSelectedWorkflow(updatedWorkflow);
    setWorkflows(prev => prev.map(w => w.id === selectedWorkflow.id ? updatedWorkflow : w));
  };

  const updateStep = (stepId: string, updates: Partial<WorkflowStep>) => {
    if (!selectedWorkflow) return;

    const updatedWorkflow = {
      ...selectedWorkflow,
      steps: selectedWorkflow.steps.map(step => 
        step.id === stepId ? { ...step, ...updates } : step
      )
    };

    setSelectedWorkflow(updatedWorkflow);
    setWorkflows(prev => prev.map(w => w.id === selectedWorkflow.id ? updatedWorkflow : w));
  };

  const deleteStep = (stepId: string) => {
    if (!selectedWorkflow) return;

    const updatedWorkflow = {
      ...selectedWorkflow,
      steps: selectedWorkflow.steps.filter(step => step.id !== stepId),
      connections: selectedWorkflow.connections.filter(
        conn => conn.from !== stepId && conn.to !== stepId
      )
    };

    setSelectedWorkflow(updatedWorkflow);
    setWorkflows(prev => prev.map(w => w.id === selectedWorkflow.id ? updatedWorkflow : w));
  };

  const addConnection = (from: string, to: string) => {
    if (!selectedWorkflow) return;

    const connection = { from, to };
    const updatedWorkflow = {
      ...selectedWorkflow,
      connections: [...selectedWorkflow.connections, connection]
    };

    setSelectedWorkflow(updatedWorkflow);
    setWorkflows(prev => prev.map(w => w.id === selectedWorkflow.id ? updatedWorkflow : w));
  };

  const executeWorkflow = async () => {
    if (!selectedWorkflow) return;

    setIsExecuting(true);
    try {
      // Simulate workflow execution
      await new Promise(resolve => setTimeout(resolve, Math.random() * 5000 + 2000));
      
      const updatedWorkflow = {
        ...selectedWorkflow,
        lastRun: new Date().toISOString()
      };

      setSelectedWorkflow(updatedWorkflow);
      setWorkflows(prev => prev.map(w => w.id === selectedWorkflow.id ? updatedWorkflow : w));
    } finally {
      setIsExecuting(false);
    }
  };

  const saveWorkflow = () => {
    if (!selectedWorkflow) return;

    const updatedWorkflow = {
      ...selectedWorkflow,
      status: 'active' as const
    };

    setSelectedWorkflow(updatedWorkflow);
    setWorkflows(prev => prev.map(w => w.id === selectedWorkflow.id ? updatedWorkflow : w));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold neon-text">Workflow Builder</h1>
          <p className="text-muted-foreground mt-2">
            Create complex automated workflows using AI agents and MCP plugins
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={createNewWorkflow}>
            <Plus className="w-4 h-4 mr-2" />
            New Workflow
          </Button>
          {selectedWorkflow && (
            <>
              <Button onClick={saveWorkflow} variant="outline">
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button 
                onClick={executeWorkflow} 
                disabled={isExecuting}
                className="gradient-cyber-primary hover:gradient-cyber-secondary"
              >
                {isExecuting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Executing...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Execute
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="builder">Workflow Builder</TabsTrigger>
          <TabsTrigger value="library">Workflow Library</TabsTrigger>
          <TabsTrigger value="executions">Executions</TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="space-y-6">
          {selectedWorkflow ? (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1 space-y-4">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>Workflow Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Name</label>
                      <Input
                        value={selectedWorkflow.name}
                        onChange={(e) => setSelectedWorkflow({
                          ...selectedWorkflow,
                          name: e.target.value
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Description</label>
                      <Textarea
                        value={selectedWorkflow.description}
                        onChange={(e) => setSelectedWorkflow({
                          ...selectedWorkflow,
                          description: e.target.value
                        })}
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Status</label>
                      <Select 
                        value={selectedWorkflow.status} 
                        onValueChange={(value: Workflow['status']) => setSelectedWorkflow({
                          ...selectedWorkflow,
                          status: value
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="paused">Paused</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>Add Steps</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button 
                      onClick={() => addStep('agent')} 
                      variant="outline" 
                      className="w-full justify-start"
                    >
                      <Bot className="w-4 h-4 mr-2" />
                      AI Agent
                    </Button>
                    <Button 
                      onClick={() => addStep('plugin')} 
                      variant="outline" 
                      className="w-full justify-start"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      MCP Plugin
                    </Button>
                    <Button 
                      onClick={() => addStep('condition')} 
                      variant="outline" 
                      className="w-full justify-start"
                    >
                      <Workflow className="w-4 h-4 mr-2" />
                      Condition
                    </Button>
                    <Button 
                      onClick={() => addStep('delay')} 
                      variant="outline" 
                      className="w-full justify-start"
                    >
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Delay
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-3">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>Workflow Canvas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="min-h-[600px] border-2 border-dashed border-border rounded-lg p-6">
                      {selectedWorkflow.steps.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <Workflow className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                            <h3 className="text-lg font-medium mb-2">Empty Workflow</h3>
                            <p className="text-muted-foreground">
                              Add steps from the sidebar to build your workflow
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {selectedWorkflow.steps.map((step, index) => (
                            <div key={step.id} className="flex items-center gap-4">
                              <Card className="flex-1">
                                <CardContent className="p-4">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      {step.type === 'agent' && <Bot className="w-4 h-4" />}
                                      {step.type === 'plugin' && <Zap className="w-4 h-4" />}
                                      {step.type === 'condition' && <Workflow className="w-4 h-4" />}
                                      {step.type === 'delay' && <ArrowRight className="w-4 h-4" />}
                                      <span className="font-medium">{step.name}</span>
                                      <Badge variant="outline">{step.type}</Badge>
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => deleteStep(step.id)}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                  
                                  {step.type === 'agent' && (
                                    <div className="mt-2">
                                      <Select
                                        value={step.config.agentId || ''}
                                        onValueChange={(value) => updateStep(step.id, {
                                          config: { ...step.config, agentId: value }
                                        })}
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select Agent" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {availableAgents.map(agent => (
                                            <SelectItem key={agent.id} value={agent.id}>
                                              {agent.icon} {agent.name}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  )}

                                  {step.type === 'plugin' && (
                                    <div className="mt-2">
                                      <Select
                                        value={step.config.pluginId || ''}
                                        onValueChange={(value) => updateStep(step.id, {
                                          config: { ...step.config, pluginId: value }
                                        })}
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select Plugin" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {availablePlugins.map(plugin => (
                                            <SelectItem key={plugin.id} value={plugin.id}>
                                              {plugin.name} ({plugin.category})
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  )}

                                  {step.type === 'condition' && (
                                    <div className="mt-2">
                                      <Input
                                        placeholder="Condition expression"
                                        value={step.config.condition || ''}
                                        onChange={(e) => updateStep(step.id, {
                                          config: { ...step.config, condition: e.target.value }
                                        })}
                                      />
                                    </div>
                                  )}

                                  {step.type === 'delay' && (
                                    <div className="mt-2">
                                      <Input
                                        type="number"
                                        placeholder="Delay in seconds"
                                        value={step.config.delay || ''}
                                        onChange={(e) => updateStep(step.id, {
                                          config: { ...step.config, delay: Number(e.target.value) }
                                        })}
                                      />
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                              
                              {index < selectedWorkflow.steps.length - 1 && (
                                <div className="flex flex-col items-center">
                                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <Card className="glass-card">
              <CardContent className="text-center py-12">
                <Workflow className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">No Workflow Selected</h3>
                <p className="text-muted-foreground mb-4">
                  Create a new workflow or select an existing one to start building
                </p>
                <Button onClick={createNewWorkflow}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Workflow
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="library" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workflows.map(workflow => (
              <Card 
                key={workflow.id} 
                className="glass-card cursor-pointer hover:scale-105 transition-all"
                onClick={() => setSelectedWorkflow(workflow)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {workflow.name}
                    <Badge variant={workflow.status === 'active' ? 'default' : 'secondary'}>
                      {workflow.status}
                    </Badge>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {workflow.description}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="font-medium">Steps:</span> {workflow.steps.length}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Created:</span> {new Date(workflow.createdAt).toLocaleDateString()}
                    </div>
                    {workflow.lastRun && (
                      <div className="text-sm">
                        <span className="font-medium">Last Run:</span> {new Date(workflow.lastRun).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="executions" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Execution History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Workflow className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">No Executions Yet</h3>
                <p className="text-muted-foreground">
                  Execute workflows to see their execution history here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Alert>
        <Workflow className="h-4 w-4" />
        <AlertDescription>
          Workflow Builder allows you to create complex automated workflows by combining AI agents and MCP plugins. 
          Build sophisticated automation pipelines for any task.
        </AlertDescription>
      </Alert>
    </div>
  );
}
