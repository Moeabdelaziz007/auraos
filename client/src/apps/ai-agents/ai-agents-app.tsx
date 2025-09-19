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

interface Agent {
  id: string;
  name: string;
  description: string;
  personality: string;
  capabilities: string[];
  plugins: string[];
  icon: string;
  color: string;
}

interface Plugin {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ReactNode;
}

interface AgentExecution {
  id: string;
  agentId: string;
  task: string;
  status: 'running' | 'completed' | 'failed';
  steps: AgentStep[];
  result?: any;
  timestamp: string;
}

interface AgentStep {
  id: string;
  plugin: string;
  action: string;
  input: any;
  output?: any;
  status: 'pending' | 'running' | 'completed' | 'failed';
  timestamp: string;
}

const availableAgents: Agent[] = [
  {
    id: 'research-agent',
    name: 'Research Agent',
    description: 'Specialized in web research, content analysis, and data gathering',
    personality: 'Analytical, thorough, and detail-oriented researcher',
    capabilities: ['Web Research', 'Content Analysis', 'Data Collection', 'Report Generation'],
    plugins: ['comet_chrome', 'web_scraper', 'text_processor', 'data_analyzer'],
    icon: '🔍',
    color: 'blue'
  },
  {
    id: 'development-agent',
    name: 'Development Agent',
    description: 'Expert in code analysis, debugging, and software development tasks',
    personality: 'Technical, methodical, and solution-focused developer',
    capabilities: ['Code Analysis', 'Debugging', 'Refactoring', 'Testing', 'Documentation'],
    plugins: ['cursor_cli', 'code_generator', 'code_formatter', 'file_operations'],
    icon: '💻',
    color: 'green'
  },
  {
    id: 'content-agent',
    name: 'Content Agent',
    description: 'Creates, analyzes, and optimizes content across multiple formats',
    personality: 'Creative, versatile, and audience-focused content creator',
    capabilities: ['Content Creation', 'SEO Analysis', 'Translation', 'Sentiment Analysis'],
    plugins: ['ai_generation_tool', 'text_processor', 'comet_chrome', 'data_visualizer'],
    icon: '📝',
    color: 'purple'
  },
  {
    id: 'analytics-agent',
    name: 'Analytics Agent',
    description: 'Processes data, generates insights, and creates visualizations',
    personality: 'Data-driven, analytical, and insight-focused analyst',
    capabilities: ['Data Analysis', 'Statistical Modeling', 'Visualization', 'Reporting'],
    plugins: ['data_analyzer', 'data_visualizer', 'text_processor', 'ai_generation_tool'],
    icon: '📊',
    color: 'orange'
  },
  {
    id: 'automation-agent',
    name: 'Automation Agent',
    description: 'Automates workflows and integrates multiple systems',
    personality: 'Efficient, systematic, and process-optimization focused',
    capabilities: ['Workflow Automation', 'System Integration', 'Task Orchestration'],
    plugins: ['automation', 'api_tester', 'file_operations', 'database_operations'],
    icon: '⚙️',
    color: 'red'
  },
  {
    id: 'super-agent',
    name: 'Super Agent',
    description: 'Ultimate AI agent with access to all MCP tools and capabilities',
    personality: 'Omniscient, adaptive, and capable of handling any complex task',
    capabilities: ['All Capabilities', 'Multi-domain Expertise', 'Complex Problem Solving'],
    plugins: ['cursor_cli', 'comet_chrome', 'web_scraper', 'data_analyzer', 'text_processor', 'ai_generation_tool', 'file_operations', 'image_processor', 'database_operations', 'api_tester', 'code_generator', 'data_visualizer', 'automation', 'knowledge_base', 'system_info', 'code_formatter'],
    icon: '🚀',
    color: 'gradient'
  }
];

const availablePlugins: Plugin[] = [
  { id: 'cursor_cli', name: 'Cursor CLI', description: 'AI-powered code analysis and generation', category: 'Development', icon: <Bot className="w-4 h-4" /> },
  { id: 'comet_chrome', name: 'Comet Chrome', description: 'Web browsing and content analysis', category: 'Web', icon: <Brain className="w-4 h-4" /> },
  { id: 'web_scraper', name: 'Web Scraper', description: 'Extract content from web pages', category: 'Web', icon: <Zap className="w-4 h-4" /> },
  { id: 'data_analyzer', name: 'Data Analyzer', description: 'Statistical analysis and insights', category: 'Analytics', icon: <Settings className="w-4 h-4" /> },
  { id: 'text_processor', name: 'Text Processor', description: 'NLP operations and text analysis', category: 'Text', icon: <Plug className="w-4 h-4" /> },
  { id: 'ai_generation_tool', name: 'AI Generator', description: 'Content and code generation', category: 'AI', icon: <Brain className="w-4 h-4" /> },
  { id: 'file_operations', name: 'File Operations', description: 'File system interactions', category: 'System', icon: <Settings className="w-4 h-4" /> },
  { id: 'image_processor', name: 'Image Processor', description: 'Image analysis and manipulation', category: 'Media', icon: <Zap className="w-4 h-4" /> },
  { id: 'database_operations', name: 'Database Operations', description: 'Database management', category: 'Data', icon: <Settings className="w-4 h-4" /> },
  { id: 'api_tester', name: 'API Tester', description: 'HTTP request testing', category: 'Development', icon: <Bot className="w-4 h-4" /> },
  { id: 'code_generator', name: 'Code Generator', description: 'Template-based code generation', category: 'Development', icon: <Bot className="w-4 h-4" /> },
  { id: 'data_visualizer', name: 'Data Visualizer', description: 'Chart and graph creation', category: 'Analytics', icon: <Settings className="w-4 h-4" /> },
  { id: 'automation', name: 'Automation', description: 'Task automation and scheduling', category: 'System', icon: <Settings className="w-4 h-4" /> },
  { id: 'knowledge_base', name: 'Knowledge Base', description: 'Information retrieval', category: 'AI', icon: <Brain className="w-4 h-4" /> },
  { id: 'system_info', name: 'System Info', description: 'System information gathering', category: 'System', icon: <Settings className="w-4 h-4" /> },
  { id: 'code_formatter', name: 'Code Formatter', description: 'Code formatting and styling', category: 'Development', icon: <Bot className="w-4 h-4" /> }
];

export default function AIAgentsApp() {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [task, setTask] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [executions, setExecutions] = useState<AgentExecution[]>([]);
  const [activeTab, setActiveTab] = useState('agents');

  const handleAgentExecution = async () => {
    if (!selectedAgent || !task.trim()) return;
    
    const executionId = `exec-${Date.now()}`;
    const newExecution: AgentExecution = {
      id: executionId,
      agentId: selectedAgent.id,
      task,
      status: 'running',
      steps: [],
      timestamp: new Date().toISOString()
    };
    
    setExecutions(prev => [newExecution, ...prev]);
    setIsExecuting(true);
    
    try {
      // Simulate agent execution with multiple plugin steps
      const steps = await simulateAgentExecution(selectedAgent, task);
      
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
