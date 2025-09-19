import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface AITool {
  id: string;
  name: string;
  description: string;
  category: string;
  version: string;
  capabilities: string[];
  parameters: AIToolParameter[];
  isActive: boolean;
  usage: {
    totalCalls: number;
    successRate: number;
    averageExecutionTime: number;
    lastUsed: string;
  };
}

interface AIToolParameter {
  name: string;
  type: string;
  required: boolean;
  description: string;
  default?: any;
}

interface AIToolResult {
  success: boolean;
  data?: any;
  error?: string;
  executionTime: number;
  toolUsed: string;
  confidence: number;
  suggestions?: string[];
}

export default function AdvancedAITools() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedTool, setSelectedTool] = useState<AITool | null>(null);
  const [toolParams, setToolParams] = useState<Record<string, any>>({});
  const [activeTab, setActiveTab] = useState('tools');

  // Fetch AI tools
  const { data: tools, isLoading: toolsLoading } = useQuery<AITool[]>({
    queryKey: ['/api/ai-tools'],
    refetchInterval: 30000
  });

  // Fetch tool categories
  const { data: categories } = useQuery<string[]>({
    queryKey: ['/api/ai-tools/categories'],
    refetchInterval: 30000
  });

  // Fetch tool analytics
  const { data: analytics } = useQuery({
    queryKey: ['/api/ai-tools/analytics'],
    refetchInterval: 30000
  });

  // Execute tool mutation
  const executeToolMutation = useMutation({
    mutationFn: async ({ toolId, params }: { toolId: string; params: any }) => {
      const response = await fetch(`/api/ai-tools/${toolId}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          params,
          context: {
            userId: user?.uid,
            sessionId: `session_${Date.now()}`,
            metadata: { source: 'ui' }
          }
        })
      });
      if (!response.ok) throw new Error('Failed to execute tool');
      return response.json();
    }
  });

  // Discover tools mutation
  const discoverToolsMutation = useMutation({
    mutationFn: async ({ query, category }: { query: string; category?: string }) => {
      const response = await fetch('/api/ai-tools/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, category })
      });
      if (!response.ok) throw new Error('Failed to discover tools');
      return response.json();
    }
  });

  const handleToolSelect = (tool: AITool) => {
    setSelectedTool(tool);
    setToolParams({});
  };

  const handleParamChange = (paramName: string, value: any) => {
    setToolParams(prev => ({
      ...prev,
      [paramName]: value
    }));
  };

  const handleExecuteTool = () => {
    if (!selectedTool) return;
    
    executeToolMutation.mutate({
      toolId: selectedTool.id,
      params: toolParams
    });
  };

  const getToolIcon = (category: string) => {
    const icons: Record<string, string> = {
      'content': 'fas fa-edit',
      'analysis': 'fas fa-chart-line',
      'data_extraction': 'fas fa-download',
      'media': 'fas fa-image',
      'integration': 'fas fa-plug',
      'automation': 'fas fa-cogs',
      'monitoring': 'fas fa-eye',
      'nlp': 'fas fa-language'
    };
    return icons[category] || 'fas fa-tool';
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'content': 'bg-blue-500',
      'analysis': 'bg-green-500',
      'data_extraction': 'bg-purple-500',
      'media': 'bg-pink-500',
      'integration': 'bg-orange-500',
      'automation': 'bg-red-500',
      'monitoring': 'bg-yellow-500',
      'nlp': 'bg-indigo-500'
    };
    return colors[category] || 'bg-gray-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Advanced AI Tools</h1>
          <p className="text-muted-foreground">Powerful AI tools with MCP integration</p>
        </div>
        <Badge variant="outline" className="text-sm">
          <i className="fas fa-brain mr-2"></i>
          MCP Enabled
        </Badge>
      </div>

      {/* Analytics Overview */}
      {analytics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <i className="fas fa-chart-bar text-primary"></i>
              Tools Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {analytics.totalTools || 0}
                </div>
                <div className="text-sm text-muted-foreground">Total Tools</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">
                  {analytics.categories?.length || 0}
                </div>
                <div className="text-sm text-muted-foreground">Categories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">
                  {analytics.totalExecutions || 0}
                </div>
                <div className="text-sm text-muted-foreground">Total Executions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">
                  {Math.round((analytics.toolStats?.reduce((sum: number, tool: any) => sum + tool.usage.successRate, 0) / (analytics.toolStats?.length || 1)) * 100)}%
                </div>
                <div className="text-sm text-muted-foreground">Avg Success Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tools">AI Tools</TabsTrigger>
          <TabsTrigger value="discover">Discover</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* AI Tools Tab */}
        <TabsContent value="tools">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tools List */}
            <Card>
              <CardHeader>
                <CardTitle>Available Tools</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {toolsLoading ? (
                  <div className="animate-pulse space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-16 bg-muted rounded"></div>
                    ))}
                  </div>
                ) : tools ? (
                  tools.map(tool => (
                    <div
                      key={tool.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedTool?.id === tool.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => handleToolSelect(tool)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg ${getCategoryColor(tool.category)} flex items-center justify-center`}>
                          <i className={`${getToolIcon(tool.category)} text-white`}></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-sm">{tool.name}</h3>
                            <Badge variant="secondary" className="text-xs">
                              v{tool.version}
                            </Badge>
                            {tool.isActive ? (
                              <Badge variant="default" className="text-xs">Active</Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs">Inactive</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{tool.description}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>{tool.usage.totalCalls} calls</span>
                            <span>{Math.round(tool.usage.successRate * 100)}% success</span>
                            <span>{tool.usage.averageExecutionTime}ms avg</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <Alert>
                    <AlertDescription>No AI tools available</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Tool Execution */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedTool ? `Execute: ${selectedTool.name}` : 'Select a Tool'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedTool ? (
                  <>
                    <div className="space-y-4">
                      {selectedTool.parameters.map(param => (
                        <div key={param.name}>
                          <Label htmlFor={param.name} className="text-sm font-medium">
                            {param.name}
                            {param.required && <span className="text-red-500 ml-1">*</span>}
                          </Label>
                          <div className="mt-1">
                            {param.type === 'string' && param.name.includes('text') ? (
                              <Textarea
                                id={param.name}
                                placeholder={param.description}
                                value={toolParams[param.name] || ''}
                                onChange={(e) => handleParamChange(param.name, e.target.value)}
                                rows={3}
                              />
                            ) : param.type === 'boolean' ? (
                              <Select
                                value={toolParams[param.name]?.toString() || ''}
                                onValueChange={(value) => handleParamChange(param.name, value === 'true')}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder={param.description} />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="true">True</SelectItem>
                                  <SelectItem value="false">False</SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              <Input
                                id={param.name}
                                type={param.type === 'number' ? 'number' : 'text'}
                                placeholder={param.description}
                                value={toolParams[param.name] || ''}
                                onChange={(e) => handleParamChange(param.name, param.type === 'number' ? Number(e.target.value) : e.target.value)}
                              />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{param.description}</p>
                        </div>
                      ))}
                    </div>

                    <Button 
                      onClick={handleExecuteTool}
                      disabled={executeToolMutation.isPending}
                      className="w-full"
                    >
                      {executeToolMutation.isPending ? 'Executing...' : 'Execute Tool'}
                    </Button>

                    {executeToolMutation.isError && (
                      <Alert variant="destructive">
                        <AlertDescription>{executeToolMutation.error?.message}</AlertDescription>
                      </Alert>
                    )}

                    {executeToolMutation.isSuccess && executeToolMutation.data && (
                      <div className="space-y-4">
                        <Separator />
                        <div>
                          <h4 className="font-medium mb-2">Execution Result:</h4>
                          <div className="p-4 bg-muted rounded-lg">
                            <pre className="whitespace-pre-wrap text-sm">
                              {JSON.stringify(executeToolMutation.data.data, null, 2)}
                            </pre>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Success:</span> {executeToolMutation.data.success ? 'Yes' : 'No'}
                          </div>
                          <div>
                            <span className="font-medium">Execution Time:</span> {executeToolMutation.data.executionTime}ms
                          </div>
                          <div>
                            <span className="font-medium">Confidence:</span> {Math.round(executeToolMutation.data.confidence * 100)}%
                          </div>
                          <div>
                            <span className="font-medium">Tool Used:</span> {executeToolMutation.data.toolUsed}
                          </div>
                        </div>

                        {executeToolMutation.data.suggestions && executeToolMutation.data.suggestions.length > 0 && (
                          <div>
                            <span className="font-medium">Suggestions:</span>
                            <ul className="text-sm text-muted-foreground mt-1">
                              {executeToolMutation.data.suggestions.map((suggestion: string, index: number) => (
                                <li key={index}>• {suggestion}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <i className="fas fa-tools text-4xl mb-4"></i>
                    <p>Select a tool from the list to execute it</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Discover Tab */}
        <TabsContent value="discover">
          <Card>
            <CardHeader>
              <CardTitle>Discover AI Tools</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Input
                  placeholder="Search for tools..."
                  value={discoverToolsMutation.variables?.query || ''}
                  onChange={(e) => {
                    // This would be handled by a search input component
                  }}
                />
                <Select>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={() => {
                  const query = 'content generation';
                  const category = 'content';
                  discoverToolsMutation.mutate({ query, category });
                }}>
                  Search
                </Button>
              </div>

              {discoverToolsMutation.isSuccess && discoverToolsMutation.data && (
                <div className="space-y-4">
                  <h4 className="font-medium">Search Results:</h4>
                  {discoverToolsMutation.data.map((tool: AITool) => (
                    <div key={tool.id} className="p-4 border rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded ${getCategoryColor(tool.category)} flex items-center justify-center`}>
                          <i className={`${getToolIcon(tool.category)} text-white text-sm`}></i>
                        </div>
                        <div className="flex-1">
                          <h5 className="font-semibold">{tool.name}</h5>
                          <p className="text-sm text-muted-foreground">{tool.description}</p>
                          <div className="flex gap-2 mt-2">
                            {tool.capabilities.map(capability => (
                              <Badge key={capability} variant="outline" className="text-xs">
                                {capability}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Tool Performance</CardTitle>
              </CardHeader>
              <CardContent>
                {analytics?.toolStats ? (
                  <div className="space-y-4">
                    {analytics.toolStats.map((tool: any) => (
                      <div key={tool.id} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{tool.name}</span>
                          <span>{Math.round(tool.usage.successRate * 100)}%</span>
                        </div>
                        <Progress value={tool.usage.successRate * 100} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <i className="fas fa-chart-line text-4xl mb-4"></i>
                    <p>No analytics data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {categories ? (
                  <div className="space-y-4">
                    {categories.map(category => {
                      const categoryTools = tools?.filter(tool => tool.category === category) || [];
                      const percentage = tools ? (categoryTools.length / tools.length) * 100 : 0;
                      
                      return (
                        <div key={category} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="capitalize">{category}</span>
                            <span>{categoryTools.length} tools</span>
                          </div>
                          <Progress value={percentage} />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <i className="fas fa-chart-pie text-4xl mb-4"></i>
                    <p>No category data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
