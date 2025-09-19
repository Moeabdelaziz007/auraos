import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bot, Zap, Brain, Settings, Play, CheckCircle, XCircle, Loader2, Workflow, Plug } from "lucide-react";
import AIAgentsApp from "@/apps/ai-agents/ai-agents-app";
import PluginManagerApp from "@/apps/ai-agents/plugin-manager-app";
import WorkflowBuilderApp from "@/apps/ai-agents/workflow-builder-app";

export default function AIAgentsPage() {
  const [activeTab, setActiveTab] = useState('agents');

  return (
    <div className="flex h-screen overflow-hidden bg-background carbon-texture">
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold neon-text">AI Agents & Plugins</h1>
              <p className="text-muted-foreground mt-2">
                Powerful AI agents with MCP plugin capabilities for complex task automation
              </p>
            </div>
            <Badge variant="outline" className="text-sm">
              Advanced AI System
            </Badge>
          </div>
        </div>

        <div className="flex-1 overflow-auto cyber-scrollbar">
          <div className="p-6 max-w-7xl mx-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="agents">AI Agents</TabsTrigger>
                <TabsTrigger value="plugins">Plugin Manager</TabsTrigger>
                <TabsTrigger value="workflows">Workflow Builder</TabsTrigger>
                <TabsTrigger value="overview">Overview</TabsTrigger>
              </TabsList>

              <TabsContent value="agents" className="space-y-6">
                <AIAgentsApp />
              </TabsContent>

              <TabsContent value="plugins" className="space-y-6">
                <PluginManagerApp />
              </TabsContent>

              <TabsContent value="workflows" className="space-y-6">
                <WorkflowBuilderApp />
              </TabsContent>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Bot className="w-5 h-5 text-primary" />
                        AI Agents
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Intelligent agents that can use multiple MCP tools as plugins to handle complex tasks
                      </p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Available Agents:</span>
                          <span className="font-medium">6</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Active Agents:</span>
                          <span className="font-medium text-green-500">6</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Total Capabilities:</span>
                          <span className="font-medium">25+</span>
                        </div>
                      </div>
                      <Button 
                        className="w-full mt-4" 
                        onClick={() => setActiveTab('agents')}
                      >
                        Manage Agents
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Plug className="w-5 h-5 text-primary" />
                        MCP Plugins
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Manage and configure MCP tools that agents can use as plugins
                      </p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Available Plugins:</span>
                          <span className="font-medium">16</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Active Plugins:</span>
                          <span className="font-medium text-green-500">15</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Categories:</span>
                          <span className="font-medium">8</span>
                        </div>
                      </div>
                      <Button 
                        className="w-full mt-4" 
                        onClick={() => setActiveTab('plugins')}
                      >
                        Manage Plugins
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Workflow className="w-5 h-5 text-primary" />
                        Workflows
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Create complex automated workflows using agents and plugins
                      </p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Workflows Created:</span>
                          <span className="font-medium">0</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Active Workflows:</span>
                          <span className="font-medium text-green-500">0</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Executions:</span>
                          <span className="font-medium">0</span>
                        </div>
                      </div>
                      <Button 
                        className="w-full mt-4" 
                        onClick={() => setActiveTab('workflows')}
                      >
                        Build Workflows
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="w-5 h-5 text-primary" />
                      System Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="text-center p-4 rounded-lg bg-primary/10">
                        <div className="text-2xl font-bold text-primary">100%</div>
                        <div className="text-sm text-muted-foreground">System Uptime</div>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-accent/10">
                        <div className="text-2xl font-bold text-accent">2.1s</div>
                        <div className="text-sm text-muted-foreground">Avg Response</div>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-green-500/10">
                        <div className="text-2xl font-bold text-green-500">1,247</div>
                        <div className="text-sm text-muted-foreground">Tasks Completed</div>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-blue-500/10">
                        <div className="text-2xl font-bold text-blue-500">24/7</div>
                        <div className="text-sm text-muted-foreground">Availability</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle>Agent Types</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-2 rounded bg-blue-500/10">
                          <span className="text-lg">🔍</span>
                          <div>
                            <div className="font-medium">Research Agent</div>
                            <div className="text-sm text-muted-foreground">Web research & analysis</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-2 rounded bg-green-500/10">
                          <span className="text-lg">💻</span>
                          <div>
                            <div className="font-medium">Development Agent</div>
                            <div className="text-sm text-muted-foreground">Code analysis & debugging</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-2 rounded bg-purple-500/10">
                          <span className="text-lg">📝</span>
                          <div>
                            <div className="font-medium">Content Agent</div>
                            <div className="text-sm text-muted-foreground">Content creation & optimization</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-2 rounded bg-orange-500/10">
                          <span className="text-lg">📊</span>
                          <div>
                            <div className="font-medium">Analytics Agent</div>
                            <div className="text-sm text-muted-foreground">Data analysis & visualization</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-2 rounded bg-red-500/10">
                          <span className="text-lg">⚙️</span>
                          <div>
                            <div className="font-medium">Automation Agent</div>
                            <div className="text-sm text-muted-foreground">Workflow automation</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-2 rounded bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                          <span className="text-lg">🚀</span>
                          <div>
                            <div className="font-medium">Super Agent</div>
                            <div className="text-sm opacity-90">All capabilities combined</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle>Plugin Categories</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                          <span className="font-medium">Development</span>
                          <Badge variant="outline">5 plugins</Badge>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                          <span className="font-medium">Web</span>
                          <Badge variant="outline">3 plugins</Badge>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                          <span className="font-medium">Analytics</span>
                          <Badge variant="outline">2 plugins</Badge>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                          <span className="font-medium">AI</span>
                          <Badge variant="outline">2 plugins</Badge>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                          <span className="font-medium">System</span>
                          <Badge variant="outline">3 plugins</Badge>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                          <span className="font-medium">Text</span>
                          <Badge variant="outline">1 plugin</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <Alert className="fixed bottom-4 right-4 w-96">
        <Brain className="h-4 w-4" />
        <AlertDescription>
          AI Agents with Plugins provide powerful task automation by combining multiple MCP tools. 
          Each agent has specialized capabilities and can orchestrate complex workflows using their plugin ecosystem.
        </AlertDescription>
      </Alert>
    </div>
  );
}