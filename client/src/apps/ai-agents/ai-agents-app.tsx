import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Play, CheckCircle, XCircle, Bot, Zap, Brain, Settings, Plug } from "lucide-react";
import { availableAgents, availablePlugins, Agent, AgentExecution, AgentStep } from "./data";
import { availableAgents, availablePlugins, Agent, AgentExecution, AgentStep, codeAssistantAgent } from "./data";

export default function AIAgentsApp() {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [task, setTask] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [executions, setExecutions] = useState<AgentExecution[]>([]);
  const [activeTab, setActiveTab] = useState('agents');
  // State for the new Code Assistant agent
  const [selectedRole, setSelectedRole] = useState('Code_Explainer');

  const allAgents = [...availableAgents, codeAssistantAgent];

  const handleAgentExecution = async () => {
    if (!selectedAgent || !task.trim()) return;
    
    const executionId = `exec-${Date.now()}`;
    const newExecution: AgentExecution = {
      id: executionId,
      agentId: selectedAgent.id,
      task,
      task: selectedAgent.id === 'code-assistant' 
        ? `Role: ${selectedRole} - Task: ${task}` 
        : task,
      status: 'running',
      steps: [],
      timestamp: new Date().toISOString()
    };
    
    setExecutions(prev => [newExecution, ...prev]);
    setIsExecuting(true);
    
    try {
      // Simulate agent execution with multiple plugin steps
      const steps = await simulateAgentExecution(selectedAgent, task);
      let steps: AgentStep[];
      if (selectedAgent.id === 'code-assistant') {
        // Simulate execution for the new Code Assistant agent
        steps = await simulateCodeAssistantExecution(selectedRole, task);
      } else {
        // Simulate agent execution with multiple plugin steps
        steps = await simulateAgentExecution(selectedAgent, task);
      }
      
      const completedExecution: AgentExecution = {
        ...newExecution,
        status: 'completed',
        steps,
        result: generateAgentResult(selectedAgent, task, steps),
        timestamp: new Date().toISOString()
      };
      
      setExecutions(prev => 
        prev.map(exec => exec.id === executionId ? completedExecution : exec)
      );
    } catch (error) {
      const failedExecution: AgentExecution = {
        ...newExecution,
        status: 'failed',
        result: { error: 'Agent execution failed' },
        timestamp: new Date().toISOString()
      };
      
      setExecutions(prev => 
        prev.map(exec => exec.id === executionId ? failedExecution : exec)
      );
    } finally {
      setIsExecuting(false);
    }
  };

  const simulateAgentExecution = async (agent: Agent, task: string): Promise<AgentStep[]> => {
    const steps: AgentStep[] = [];
    const relevantPlugins = agent.plugins.slice(0, Math.min(4, agent.plugins.length)); // Limit to 4 steps for demo
    
    for (let i = 0; i < relevantPlugins.length; i++) {
      const plugin = relevantPlugins[i];
      const stepId = `step-${Date.now()}-${i}`;
      
      const step: AgentStep = {
        id: stepId,
        plugin,
        action: getPluginAction(plugin, task),
        input: generatePluginInput(plugin, task),
        status: 'running',
        timestamp: new Date().toISOString()
      };
      
      steps.push(step);
      
      // Simulate plugin execution
      await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));
      
      step.status = 'completed';
      step.output = generatePluginOutput(plugin, task);
    }
    
    return steps;
  };

  const simulateCodeAssistantExecution = async (role: string, task: string): Promise<AgentStep[]> => {
    const roleToOperation = {
      'Code_Explainer': 'explain',
      'Code_Generator': 'generate',
      'Code_Fixer': 'debug',
      'Test_Generator': 'test',
      'Refactor_Assistant': 'refactor',
      'Knowledge_Advisor': 'review', // Using 'review' as a proxy for knowledge
    };

    const step: AgentStep = {
      id: `step-${Date.now()}-0`,
      plugin: 'code_assistant',
      action: roleToOperation[role] || 'explain',
      input: { role, task },
      status: 'running',
      timestamp: new Date().toISOString()
    };

    await new Promise(resolve => setTimeout(resolve, Math.random() * 1500 + 500));

    step.status = 'completed';
    step.output = generatePluginOutput('cursor_cli', `Task: ${task} with role ${role}`);
    return [step];
  };

  const getPluginAction = (plugin: string, task: string): string => {
    const actions = {
      cursor_cli: 'analyze_code',
      comet_chrome: 'analyze_page',
      web_scraper: 'extract_content',
      data_analyzer: 'statistical_analysis',
      text_processor: 'process_text',
      ai_generation_tool: 'generate_content',
      file_operations: 'read_file',
      image_processor: 'analyze_image',
      database_operations: 'query_database',
      api_tester: 'test_endpoint',
      code_generator: 'generate_code',
      data_visualizer: 'create_chart',
      automation: 'execute_workflow',
      knowledge_base: 'search_knowledge',
      system_info: 'gather_info',
      code_formatter: 'format_code'
    };
    
    return actions[plugin] || 'execute_action';
  };

  const generatePluginInput = (plugin: string, task: string): any => {
    const inputs = {
      cursor_cli: { command: `Analyze: ${task}`, operation_type: 'explain' },
      comet_chrome: { action: 'analyze_page', url: 'https://example.com' },
      web_scraper: { url: 'https://example.com', extract_text: true },
      data_analyzer: { data: [1, 2, 3, 4, 5], analysis_type: 'descriptive' },
      text_processor: { text: task, operation: 'summarize' },
      ai_generation_tool: { prompt: task, model: 'gpt-4' },
      file_operations: { operation: 'read', file_path: 'src/app.tsx' },
      image_processor: { image_path: 'assets/sample.jpg', operation: 'analyze' },
      database_operations: { operation: 'query', collection: 'users' },
      api_tester: { url: 'https://api.example.com', method: 'GET' },
      code_generator: { language: 'typescript', template: 'component' },
      data_visualizer: { data: [{ x: 1, y: 2 }], chart_type: 'line' },
      automation: { task_type: 'file_processing' },
      knowledge_base: { query: task },
      system_info: {},
      code_formatter: { code: 'function test(){}', language: 'javascript' }
    };
    
    return inputs[plugin] || { input: task };
  };

  const generatePluginOutput = (plugin: string, task: string): any => {
    const outputs = {
      cursor_cli: `Code analysis completed for: ${task}\n\n**Analysis Results:**\n- Code quality: 85/100\n- Performance: Good\n- Maintainability: Excellent\n- Security: Secure\n\n**Recommendations:**\n- Add error handling\n- Improve documentation\n- Consider refactoring`,
      comet_chrome: `Web analysis completed for: ${task}\n\n**Page Analysis:**\n- Content quality: 90/100\n- SEO score: 78/100\n- Accessibility: 85/100\n- Performance: 82/100\n\n**Key findings:**\n- Well-structured content\n- Good internal linking\n- Mobile-friendly design`,
      web_scraper: `Content extraction completed for: ${task}\n\n**Extracted Content:**\n- Word count: 1,250\n- Links found: 15\n- Images found: 8\n- Content type: Article\n\n**Quality:** High-quality, relevant content extracted successfully`,
      data_analyzer: `Statistical analysis completed for: ${task}\n\n**Analysis Results:**\n- Mean: 3.2\n- Median: 3.0\n- Standard deviation: 1.1\n- Trend: Increasing\n\n**Insights:**\n- Positive growth trend detected\n- Data shows normal distribution\n- No significant outliers`,
      text_processor: `Text processing completed for: ${task}\n\n**Processing Results:**\n- Sentiment: Positive (0.75)\n- Key topics: AI, development, automation\n- Reading level: Intermediate\n- Word count: 150\n\n**Summary:** Content focuses on AI development and automation benefits`,
      ai_generation_tool: `Content generation completed for: ${task}\n\n**Generated Content:**\nComprehensive analysis and implementation guide covering all aspects of the requested task. Includes detailed explanations, code examples, and best practices.\n\n**Quality:** High-quality, contextually relevant content generated`,
      file_operations: `File operation completed for: ${task}\n\n**Operation Results:**\n- File read successfully\n- Size: 2.5KB\n- Lines: 45\n- Last modified: Today\n\n**Content:** File contains relevant code and documentation`,
      image_processor: `Image analysis completed for: ${task}\n\n**Analysis Results:**\n- Dimensions: 1920x1080\n- Format: JPEG\n- Quality: High\n- Objects detected: 3\n\n**Features:**\n- Clear, high-resolution image\n- Good composition\n- Appropriate for use`,
      database_operations: `Database operation completed for: ${task}\n\n**Query Results:**\n- Records found: 25\n- Execution time: 45ms\n- Index used: primary\n\n**Data:** Relevant records retrieved successfully`,
      api_tester: `API testing completed for: ${task}\n\n**Test Results:**\n- Status: 200 OK\n- Response time: 120ms\n- Data size: 1.2KB\n\n**Validation:**\n- All endpoints responding correctly\n- Data format valid\n- Performance within acceptable limits`,
      code_generator: `Code generation completed for: ${task}\n\n**Generated Code:**\nHigh-quality, production-ready code generated based on requirements. Includes proper error handling, documentation, and follows best practices.\n\n**Features:**\n- TypeScript interfaces\n- Error handling\n- Unit tests\n- Documentation`,
      data_visualizer: `Visualization created for: ${task}\n\n**Chart Details:**\n- Type: Line chart\n- Data points: 12\n- Interactive: Yes\n- Export formats: PNG, SVG, PDF\n\n**Insights:**\nClear visualization showing trends and patterns in the data`,
      automation: `Automation workflow completed for: ${task}\n\n**Workflow Results:**\n- Tasks executed: 5\n- Success rate: 100%\n- Time saved: 2.5 hours\n\n**Process:**\nAll automated tasks completed successfully with no errors`,
      knowledge_base: `Knowledge search completed for: ${task}\n\n**Search Results:**\n- Relevant articles: 8\n- Documentation: 12\n- Best practices: 5\n\n**Information:**\nComprehensive information found covering all aspects of the query`,
      system_info: `System information gathered for: ${task}\n\n**System Status:**\n- CPU usage: 45%\n- Memory: 2.1GB/8GB\n- Disk space: 120GB/500GB\n- Network: Active\n\n**Health:** System running optimally`,
      code_formatter: `Code formatting completed for: ${task}\n\n**Formatting Results:**\n- Lines formatted: 25\n- Style applied: Prettier\n- Issues fixed: 3\n\n**Quality:** Code now follows consistent formatting standards`
    };
    
    return outputs[plugin] || `Plugin execution completed for: ${task}`;
  };

  const generateAgentResult = (agent: Agent, task: string, steps: AgentStep[]): any => {
    return {
      summary: `Task "${task}" completed successfully using ${agent.name}`,
      agent: agent.name,
      plugins_used: steps.map(step => step.plugin),
      execution_time: steps.reduce((total, step) => total + (Math.random() * 2000 + 1000), 0),
      success_rate: 100,
      insights: [
        `Successfully executed ${steps.length} plugin operations`,
        `All ${agent.capabilities.join(', ')} capabilities utilized`,
        `Task completed with high accuracy and efficiency`,
        `Agent demonstrated ${agent.personality} approach`
      ],
      recommendations: [
        'Consider running similar tasks with this agent',
        'Agent performed optimally for this type of task',
        'All plugins executed without errors',
        'Results meet quality standards'
      ]
    };
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
            {availableAgents.map(agent => (
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
                const agent = availableAgents.find(a => a.id === execution.agentId);
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
