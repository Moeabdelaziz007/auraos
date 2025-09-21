import { useState } from 'react';
import { Agent, AgentExecution, AgentStep } from './data';

const getPluginAction = (plugin: string, task: string): string => {
  const actions: Record<string, string> = {
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
  const inputs: Record<string, any> = {
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
  const outputs: Record<string, string> = {
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
    execution_time: steps.reduce((total) => total + (Math.random() * 2000 + 1000), 0),
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

const simulateAgentExecution = async (agent: Agent, task: string): Promise<AgentStep[]> => {
  const steps: AgentStep[] = [];
  const relevantPlugins = agent.plugins.slice(0, Math.min(4, agent.plugins.length));
  
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
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));
    step.status = 'completed';
    step.output = generatePluginOutput(plugin, task);
  }
  return steps;
};

const simulateCodeAssistantExecution = async (role: string, task: string): Promise<AgentStep[]> => {
  const roleToOperation: Record<string, string> = {
    'Code_Explainer': 'explain',
    'Code_Generator': 'generate',
    'Code_Fixer': 'debug',
    'Test_Generator': 'test',
    'Refactor_Assistant': 'refactor',
    'Knowledge_Advisor': 'review',
  };

  const step: AgentStep = {
    id: `step-${Date.now()}-0`,
    plugin: 'code_assistant',
    action: roleToOperation[role] || 'explain',
    input: { role, task },
    status: 'running',
    timestamp: newtoISOString()
  };

  await new Promise(resolve => setTimeout(resolve, Math.random() * 1500 + 500));

  step.status = 'completed';
  step.output = generatePluginOutput('cursor_cli', `Task: ${task} with role ${role}`);
  return [step];
};

export const useAgentExecutor = () => {
  const [isExecuting, setIsExecuting] = useState(false);
  const [executions, setExecutions] = useState<AgentExecution[]>([]);

  const executeAgentTask = async (agent: Agent, task: string, role?: string) => {
    if (!task.trim()) return;

    const executionId = `exec-${Date.now()}`;
    const newExecution: AgentExecution = {
      id: executionId,
      agentId: agent.id,
      task: agent.id === 'code-assistant' && role ? `Role: ${role} - Task: ${task}` : task,
      status: 'running',
      steps: [],
      timestamp: new Date().toISOString()
    };

    setExecutions(prev => [newExecution, ...prev]);
    setIsExecuting(true);

    try {
      let steps: AgentStep[];
      if (agent.id === 'code-assistant' && role) {
        steps = await simulateCodeAssistantExecution(role, task);
      } else {
        steps = await simulateAgentExecution(agent, task);
      }

      const completedExecution: AgentExecution = {
        ...newExecution,
        status: 'completed',
        steps,
        result: generateAgentResult(agent, task, steps),
        timestamp: new Date().toISOString()
      };

      setExecutions(prev => prev.map(exec => exec.id === executionId ? completedExecution : exec));
    } catch (error) {
      const failedExecution: AgentExecution = {
        ...newExecution,
        status: 'failed',
        result: { error: 'Agent execution failed' },
        timestamp: new Date().toISOString()
      };
      setExecutions(prev => prev.map(exec => exec.id === executionId ? failedExecution : exec));
    } finally {
      setIsExecuting(false);
    }
  };

  return { isExecuting, executions, executeAgentTask };
};