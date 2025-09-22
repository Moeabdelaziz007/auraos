import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Play, CheckCircle, XCircle, Bot, Zap, Brain, Settings, Plug } from "lucide-react";
import { availableAgents, availablePlugins, Agent, codeAssistantAgent } from "./data.tsx";
import { useAgentExecutor } from "../hooks/use-agent-executor";

export default function AIAgentsApp() {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [task, setTask] = useState("");
  const [activeTab, setActiveTab] = useState('agents');
  const [selectedRole, setSelectedRole] = useState('Code_Explainer');

  const { isExecuting, executions, executeAgentTask } = useAgentExecutor();
  const allAgents = [...availableAgents, codeAssistantAgent];

  const handleAgentExecution = async () => {
    if (selectedAgent) {
      executeAgentTask(selectedAgent, task, selectedRole);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold neon-text">AI Agents with Plugins</h1>
          <p className="text-muted-foreground mt-2">
            Powerful AI agents that use multiple MCP tools as plugins for complex tasks
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {availableAgents.length} Agents • {availablePlugins.length} Plugins
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="agents">Agents</TabsTrigger>
          <TabsTrigger value="execute">Execute Task</TabsTrigger>
          <TabsTrigger value="history">Execution History</TabsTrigger>
        </TabsList>

        <TabsContent value="agents" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allAgents.map(agent => (
              <Card 
                key={agent.id} 
                className={`glass-card cursor-pointer transition-all hover:scale-105 ${
                  selectedAgent?.id === agent.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedAgent(agent)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">{agent.icon}</span>
                    {agent.name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {agent.description}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Personality:</h4>
                    <p className="text-sm text-muted-foreground">{agent.personality}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Capabilities:</h4>
                    <div className="flex flex-wrap gap-1">
                      {agent.capabilities.map(capability => (
                        <Badge key={capability} variant="outline" className="text-xs">
                          {capability}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Plugins ({agent.plugins.length}):</h4>
                    <div className="flex flex-wrap gap-1">
                      {agent.plugins.slice(0, 4).map(pluginId => {
                        const plugin = availablePlugins.find(p => p.id === pluginId);
                        return plugin ? (
                          <Badge key={pluginId} variant="secondary" className="text-xs">
                            {plugin.name}
                          </Badge>
                        ) : null;
                      })}
                      {agent.plugins.length > 4 && (
                        <Badge variant="secondary" className="text-xs">
                          +{agent.plugins.length - 4} more
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="execute" className="space-y-6">
          {selectedAgent ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-xl">{selectedAgent.icon}</span>
                    {selectedAgent.name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {selectedAgent.description}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Task Description <span className="text-red-500">*</span>
                    </label>
                    <Textarea
                      placeholder="Describe the complex task you want the agent to perform..."
                      value={task}
                      onChange={(e) => setTask(e.target.value)}
                      rows={6}
                    />
                  </div>

                  {selectedAgent.id === 'code-assistant' && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Select Role <span className="text-red-500">*</span>
                      </label>
                      <Select value={selectedRole} onValueChange={setSelectedRole}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Code_Explainer">Code Explainer (مفسر الكود)</SelectItem>
                          <SelectItem value="Code_Generator">Code Generator (مولد الكود)</SelectItem>
                          <SelectItem value="Code_Fixer">Code Fixer (مصلح الكود)</SelectItem>
                          <SelectItem value="Test_Generator">Test Generator (مولد الاختبارات)</SelectItem>
                          <SelectItem value="Refactor_Assistant">Refactor Assistant (مساعد إعادة الهيكلة)</SelectItem>
                          <SelectItem value="Knowledge_Advisor">Knowledge Advisor (مستشار المعرفة)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Available Plugins:</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedAgent.plugins.map(pluginId => {
                        const plugin = availablePlugins.find(p => p.id === pluginId);
                        return plugin ? (
                          <Badge key={pluginId} variant="outline" className="text-xs">
                            {plugin.icon} {plugin.name}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  </div>

                  <Button 
                    onClick={handleAgentExecution} 
                    disabled={isExecuting || !task.trim()}
                    className="w-full gradient-cyber-primary hover:gradient-cyber-secondary"
                  >
                    {isExecuting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Agent Working...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Execute with {selectedAgent.name}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Agent Capabilities</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Personality:</h4>
                    <p className="text-sm text-muted-foreground">{selectedAgent.personality}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Core Capabilities:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {selectedAgent.capabilities.map(capability => (
                        <li key={capability}>{capability}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Plugin Ecosystem:</h4>
                    <div className="space-y-2">
                      {selectedAgent.plugins.map(pluginId => {
                        const plugin = availablePlugins.find(p => p.id === pluginId);
                        return plugin ? (
                          <div key={pluginId} className="flex items-center gap-2 text-sm">
                            {plugin.icon}
                            <span>{plugin.name}</span>
                            <Badge variant="outline" className="text-xs">{plugin.category}</Badge>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="glass-card">
              <CardContent className="text-center py-12">
                <Bot className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">Select an Agent</h3>
                <p className="text-muted-foreground mb-4">
                  Choose an AI agent from the Agents tab to start executing complex tasks
                </p>
                <Button onClick={() => setActiveTab('agents')}>
                  Browse Agents
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <div className="space-y-4">
            {executions.length === 0 ? (
              <Card className="glass-card">
                <CardContent className="text-center py-12">
                  <Bot className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No Executions Yet</h3>
                  <p className="text-muted-foreground">
                    Execute tasks with AI agents to see their execution history here
                  </p>
                </CardContent>
              </Card>
            ) : (
              executions.map(execution => {
                const agent = allAgents.find(a => a.id === execution.agentId);
                return (
                  <Card key={execution.id} className="glass-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {agent?.icon} {agent?.name}
                        <Badge variant={execution.status === 'completed' ? 'default' : execution.status === 'failed' ? 'destructive' : 'secondary'}>
                          {execution.status}
                        </Badge>
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {execution.task}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Started:</span>
                            <p className="text-muted-foreground">
                              {new Date(execution.timestamp).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium">Steps:</span>
                            <p className="text-muted-foreground">
                              {execution.steps.length} plugin operations
                            </p>
                          </div>
                          <div>
                            <span className="font-medium">Plugins Used:</span>
                            <p className="text-muted-foreground">
                              {execution.steps.map(step => step.plugin).join(', ')}
                            </p>
                          </div>
                        </div>

                        {execution.steps.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2">Execution Steps:</h4>
                            <div className="space-y-2">
                              {execution.steps.map((step, index) => (
                                <div key={step.id} className="flex items-center gap-2 p-2 rounded bg-muted/50">
                                  <Badge variant="outline" className="text-xs">
                                    {index + 1}
                                  </Badge>
                                  <span className="text-sm font-medium">{step.plugin}</span>
                                  <span className="text-sm text-muted-foreground">{step.action}</span>
                                  <Badge variant={step.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                                    {step.status}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {execution.result && (
                          <div>
                            <h4 className="font-medium mb-2">Results:</h4>
                            <div className="bg-muted/50 p-4 rounded-lg">
                              <pre className="text-sm whitespace-pre-wrap">
                                {JSON.stringify(execution.result, null, 2)}
                              </pre>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Alert>
        <Brain className="h-4 w-4" />
        <AlertDescription>
          AI Agents with Plugins provide powerful task automation by combining multiple MCP tools. 
          Each agent has specialized capabilities and can orchestrate complex workflows using their plugin ecosystem.
        </AlertDescription>
      </Alert>
    </div>
  );
}
