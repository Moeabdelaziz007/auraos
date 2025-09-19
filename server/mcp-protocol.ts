import { EventEmitter } from 'events';

// MCP (Model Context Protocol) Implementation
export interface MCPMessage {
  id: string;
  type: 'request' | 'response' | 'notification' | 'error';
  method?: string;
  params?: any;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
  timestamp: Date;
}

export interface MCPCapability {
  name: string;
  description: string;
  version: string;
  methods: MCPMethod[];
  resources: MCPResource[];
}

export interface MCPMethod {
  name: string;
  description: string;
  parameters: MCPParameter[];
  returns: MCPReturn;
  async: boolean;
}

export interface MCPParameter {
  name: string;
  type: string;
  required: boolean;
  description: string;
  default?: any;
}

export interface MCPReturn {
  type: string;
  description: string;
}

export interface MCPResource {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
  size?: number;
  lastModified?: Date;
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: any;
  execute: (params: any) => Promise<any>;
}

export interface MCPAgent {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  tools: MCPTool[];
  context: Map<string, any>;
  isActive: boolean;
}

export class MCPProtocol extends EventEmitter {
  private capabilities: Map<string, MCPCapability> = new Map();
  private agents: Map<string, MCPAgent> = new Map();
  private tools: Map<string, MCPTool> = new Map();
  private messageQueue: MCPMessage[] = [];
  private isConnected: boolean = false;

  constructor() {
    super();
    this.initializeCoreCapabilities();
    this.initializeCoreTools();
  }

  private initializeCoreCapabilities() {
    // Core MCP capabilities
    const coreCapabilities: MCPCapability[] = [
      {
        name: 'file_system',
        description: 'Access to file system operations',
        version: '1.0.0',
        methods: [
          {
            name: 'read_file',
            description: 'Read contents of a file',
            parameters: [
              { name: 'path', type: 'string', required: true, description: 'File path to read' }
            ],
            returns: { type: 'string', description: 'File contents' },
            async: true
          },
          {
            name: 'write_file',
            description: 'Write contents to a file',
            parameters: [
              { name: 'path', type: 'string', required: true, description: 'File path to write' },
              { name: 'content', type: 'string', required: true, description: 'Content to write' }
            ],
            returns: { type: 'boolean', description: 'Success status' },
            async: true
          },
          {
            name: 'list_directory',
            description: 'List directory contents',
            parameters: [
              { name: 'path', type: 'string', required: true, description: 'Directory path' }
            ],
            returns: { type: 'array', description: 'Directory contents' },
            async: true
          }
        ],
        resources: []
      },
      {
        name: 'web_search',
        description: 'Perform web searches and retrieve information',
        version: '1.0.0',
        methods: [
          {
            name: 'search',
            description: 'Search the web for information',
            parameters: [
              { name: 'query', type: 'string', required: true, description: 'Search query' },
              { name: 'limit', type: 'number', required: false, description: 'Number of results', default: 10 }
            ],
            returns: { type: 'array', description: 'Search results' },
            async: true
          },
          {
            name: 'get_page_content',
            description: 'Get content from a specific URL',
            parameters: [
              { name: 'url', type: 'string', required: true, description: 'URL to fetch' }
            ],
            returns: { type: 'string', description: 'Page content' },
            async: true
          }
        ],
        resources: []
      },
      {
        name: 'database',
        description: 'Database operations and queries',
        version: '1.0.0',
        methods: [
          {
            name: 'query',
            description: 'Execute database query',
            parameters: [
              { name: 'sql', type: 'string', required: true, description: 'SQL query' },
              { name: 'params', type: 'array', required: false, description: 'Query parameters' }
            ],
            returns: { type: 'array', description: 'Query results' },
            async: true
          },
          {
            name: 'insert',
            description: 'Insert data into database',
            parameters: [
              { name: 'table', type: 'string', required: true, description: 'Table name' },
              { name: 'data', type: 'object', required: true, description: 'Data to insert' }
            ],
            returns: { type: 'object', description: 'Insert result' },
            async: true
          }
        ],
        resources: []
      },
      {
        name: 'ai_models',
        description: 'Access to various AI models and capabilities',
        version: '1.0.0',
        methods: [
          {
            name: 'generate_text',
            description: 'Generate text using AI models',
            parameters: [
              { name: 'prompt', type: 'string', required: true, description: 'Text prompt' },
              { name: 'model', type: 'string', required: false, description: 'AI model to use', default: 'gpt-4' },
              { name: 'max_tokens', type: 'number', required: false, description: 'Maximum tokens', default: 1000 }
            ],
            returns: { type: 'string', description: 'Generated text' },
            async: true
          },
          {
            name: 'analyze_image',
            description: 'Analyze image using AI vision models',
            parameters: [
              { name: 'image_url', type: 'string', required: true, description: 'Image URL or base64' },
              { name: 'analysis_type', type: 'string', required: false, description: 'Type of analysis', default: 'general' }
            ],
            returns: { type: 'object', description: 'Analysis results' },
            async: true
          },
          {
            name: 'translate_text',
            description: 'Translate text between languages',
            parameters: [
              { name: 'text', type: 'string', required: true, description: 'Text to translate' },
              { name: 'target_language', type: 'string', required: true, description: 'Target language code' },
              { name: 'source_language', type: 'string', required: false, description: 'Source language code' }
            ],
            returns: { type: 'string', description: 'Translated text' },
            async: true
          }
        ],
        resources: []
      },
      {
        name: 'social_media',
        description: 'Social media platform integrations',
        version: '1.0.0',
        methods: [
          {
            name: 'post_content',
            description: 'Post content to social media platforms',
            parameters: [
              { name: 'platform', type: 'string', required: true, description: 'Social media platform' },
              { name: 'content', type: 'string', required: true, description: 'Content to post' },
              { name: 'media_urls', type: 'array', required: false, description: 'Media URLs to attach' }
            ],
            returns: { type: 'object', description: 'Post result' },
            async: true
          },
          {
            name: 'get_analytics',
            description: 'Get social media analytics',
            parameters: [
              { name: 'platform', type: 'string', required: true, description: 'Social media platform' },
              { name: 'metric', type: 'string', required: true, description: 'Analytics metric' },
              { name: 'period', type: 'string', required: false, description: 'Time period', default: '7d' }
            ],
            returns: { type: 'object', description: 'Analytics data' },
            async: true
          }
        ],
        resources: []
      }
    ];

    coreCapabilities.forEach(capability => {
      this.capabilities.set(capability.name, capability);
    });
  }

  private initializeCoreTools() {
    // Core MCP tools
    const coreTools: MCPTool[] = [
       {
        name: 'cursor_cli',
        description: 'Execute commands to LLMs via Cursor CLI with advanced capabilities',
        inputSchema: {
          type: 'object',
          properties: {
            command: { 
              type: 'string', 
              description: 'The command to execute in the Cursor CLI (e.g., "explain this code", "refactor this function", "add error handling")' 
            },
            model: { 
              type: 'string', 
              description: 'The LLM model to use (e.g., gpt-4, claude-3.5-sonnet, claude-3-opus)', 
              default: 'claude-3.5-sonnet'
            },
            context: {
              type: 'string',
              description: 'Additional context for the command (optional)',
            },
            file_path: {
              type: 'string',
              description: 'Path to the file to operate on (optional)',
            },
            operation_type: {
              type: 'string',
              enum: ['explain', 'refactor', 'debug', 'optimize', 'generate', 'review', 'test'],
              description: 'Type of operation to perform',
              default: 'explain'
            }
          },
          required: ['command'],
        },
        execute: async (params) => {
            return await this.executeCursorCLI(params);
        },
      },
      {
        name: 'comet_chrome',
        description: 'Integrate with Comet Chrome extension for AI-powered web browsing and content analysis',
        inputSchema: {
          type: 'object',
          properties: {
            action: {
              type: 'string',
              enum: ['analyze_page', 'extract_content', 'summarize_article', 'find_similar', 'translate_content', 'generate_questions', 'create_outline', 'extract_links', 'analyze_sentiment', 'get_keywords'],
              description: 'Action to perform with Comet',
            },
            url: {
              type: 'string',
              description: 'URL of the webpage to analyze (optional)',
            },
            content: {
              type: 'string',
              description: 'Content to analyze (optional, if not providing URL)',
            },
            language: {
              type: 'string',
              description: 'Target language for translation (optional)',
              default: 'en',
            },
            max_results: {
              type: 'number',
              description: 'Maximum number of results to return',
              default: 10,
            },
            context: {
              type: 'string',
              description: 'Additional context for the analysis (optional)',
            },
          },
          required: ['action'],
        },
        execute: async (params) => {
            return await this.executeCometChrome(params);
        },
      },
      {
        name: 'web_search_tool',
        description: 'Search the web for real-time information',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Search query' },
            limit: { type: 'number', description: 'Number of results', default: 10 }
          },
          required: ['query']
        },
        execute: async (params) => {
          return await this.executeWebSearch(params.query, params.limit || 10);
        }
      },
      {
        name: 'file_operations_tool',
        description: 'Perform file system operations',
        inputSchema: {
          type: 'object',
          properties: {
            operation: { type: 'string', enum: ['read', 'write', 'list'], description: 'File operation' },
            path: { type: 'string', description: 'File or directory path' },
            content: { type: 'string', description: 'Content to write (for write operation)' }
          },
          required: ['operation', 'path']
        },
        execute: async (params) => {
          return await this.executeFileOperation(params.operation, params.path, params.content);
        }
      },
      {
        name: 'ai_generation_tool',
        description: 'Generate content using AI models',
        inputSchema: {
          type: 'object',
          properties: {
            prompt: { type: 'string', description: 'AI prompt' },
            model: { type: 'string', description: 'AI model to use', default: 'gpt-4' },
            max_tokens: { type: 'number', description: 'Maximum tokens', default: 1000 }
          },
          required: ['prompt']
        },
        execute: async (params) => {
          return await this.executeAIGeneration(params.prompt, params.model, params.max_tokens);
        }
      },
      {
        name: 'data_analysis_tool',
        description: 'Analyze data and generate insights',
        inputSchema: {
          type: 'object',
          properties: {
            data: { type: 'array', description: 'Data to analyze' },
            analysis_type: { type: 'string', description: 'Type of analysis' },
            parameters: { type: 'object', description: 'Analysis parameters' }
          },
          required: ['data', 'analysis_type']
        },
        execute: async (params) => {
          return await this.executeDataAnalysis(params.data, params.analysis_type, params.parameters);
        }
      },
      {
        name: 'automation_tool',
        description: 'Create and manage automation workflows',
        inputSchema: {
          type: 'object',
          properties: {
            action: { type: 'string', enum: ['create', 'execute', 'update', 'delete'], description: 'Automation action' },
            workflow: { type: 'object', description: 'Workflow definition' },
            parameters: { type: 'object', description: 'Workflow parameters' }
          },
          required: ['action']
        },
        execute: async (params) => {
          return await this.executeAutomation(params.action, params.workflow, params.parameters);
        }
      }
    ];

    coreTools.forEach(tool => {
      this.tools.set(tool.name, tool);
    });
  }

  // MCP Protocol Methods
  async connect(): Promise<boolean> {
    try {
      this.isConnected = true;
      this.emit('connected');
      console.log('MCP Protocol connected successfully');
      return true;
    } catch (error) {
      console.error('Failed to connect MCP Protocol:', error);
      return false;
    }
  }

  async disconnect(): Promise<void> {
    this.isConnected = false;
    this.emit('disconnected');
  }

  async sendMessage(message: MCPMessage): Promise<MCPMessage> {
    if (!this.isConnected) {
      throw new Error('MCP Protocol not connected');
    }

    this.messageQueue.push(message);
    this.emit('message', message);

    // Process message
    const response = await this.processMessage(message);
    return response;
  }

  private async processMessage(message: MCPMessage): Promise<MCPMessage> {
    try {
      let result: any;

      switch (message.method) {
        case 'initialize':
          result = await this.handleInitialize(message.params);
          break;
        case 'capabilities/list':
          result = await this.handleListCapabilities();
          break;
        case 'capabilities/get':
          result = await this.handleGetCapability(message.params);
          break;
        case 'tools/list':
          result = await this.handleListTools();
          break;
        case 'tools/call':
          result = await this.handleCallTool(message.params);
          break;
        case 'agents/list':
          result = await this.handleListAgents();
          break;
        case 'agents/create':
          result = await this.handleCreateAgent(message.params);
          break;
        case 'agents/execute':
          result = await this.handleExecuteAgent(message.params);
          break;
        default:
          throw new Error(`Unknown method: ${message.method}`);
      }

      return {
        id: message.id,
        type: 'response',
        result,
        timestamp: new Date()
      };
    } catch (error) {
      return {
        id: message.id,
        type: 'error',
        error: {
          code: -1,
          message: error.message
        },
        timestamp: new Date()
      };
    }
  }

  // Message Handlers
  private async handleInitialize(params: any): Promise<any> {
    return {
      protocolVersion: '1.0.0',
      capabilities: Array.from(this.capabilities.keys()),
      tools: Array.from(this.tools.keys()),
      agents: Array.from(this.agents.keys())
    };
  }

  private async handleListCapabilities(): Promise<any> {
    return Array.from(this.capabilities.values());
  }

  private async handleGetCapability(params: any): Promise<any> {
    const capability = this.capabilities.get(params.name);
    if (!capability) {
      throw new Error(`Capability not found: ${params.name}`);
    }
    return capability;
  }

  private async handleListTools(): Promise<any> {
    return Array.from(this.tools.values()).map(tool => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema
    }));
  }

  private async handleCallTool(params: any): Promise<any> {
    const tool = this.tools.get(params.name);
    if (!tool) {
      throw new Error(`Tool not found: ${params.name}`);
    }

    return await tool.execute(params.arguments || {});
  }

  private async handleListAgents(): Promise<any> {
    return Array.from(this.agents.values());
  }

  private async handleCreateAgent(params: any): Promise<any> {
    const agent: MCPAgent = {
      id: `agent_${Date.now()}`,
      name: params.name,
      description: params.description,
      capabilities: params.capabilities || [],
      tools: params.tools || [],
      context: new Map(),
      isActive: true
    };

    this.agents.set(agent.id, agent);
    return agent;
  }

  private async handleExecuteAgent(params: any): Promise<any> {
    const agent = this.agents.get(params.agentId);
    if (!agent) {
      throw new Error(`Agent not found: ${params.agentId}`);
    }

    return await this.executeAgent(agent, params.task, params.context);
  }

  // Tool Execution Methods
  private async executeCursorCLI(params: any): Promise<any> {
    const { command, model = 'claude-3.5-sonnet', context, file_path, operation_type = 'explain' } = params;
    
    try {
      // Enhanced Cursor CLI simulation with realistic responses
      const responses = {
        explain: `**Code Explanation:**\n\n${command}\n\nThis code appears to be implementing a ${operation_type} operation. Here's what it does:\n\n1. **Purpose**: The code is designed to ${command.toLowerCase()}\n2. **Key Components**: \n   - Main logic handles the core functionality\n   - Error handling ensures robustness\n   - Performance optimizations are in place\n\n3. **Flow**: The execution follows a logical sequence that ensures proper data handling and user experience.\n\n**Recommendations**:\n- Consider adding more detailed comments\n- Implement additional error handling for edge cases\n- Add unit tests for better coverage`,
        
        refactor: `**Refactoring Suggestions:**\n\nFor: ${command}\n\n**Current Issues Identified:**\n- Code duplication detected\n- Complex nested conditions\n- Missing error handling\n\n**Proposed Refactoring:**\n\n\`\`\`typescript\n// Refactored version\nfunction optimizedFunction() {\n  // Simplified logic\n  // Better error handling\n  // Improved readability\n}\n\`\`\`\n\n**Benefits:**\n- 40% reduction in code complexity\n- Improved maintainability\n- Better performance\n- Enhanced readability`,
        
        debug: `**Debug Analysis:**\n\nIssue: ${command}\n\n**Potential Problems:**\n1. **Null Reference**: Possible undefined variable access\n2. **Type Mismatch**: Inconsistent data types\n3. **Logic Error**: Incorrect conditional statement\n\n**Debugging Steps:**\n1. Add console.log statements at key points\n2. Check variable values before operations\n3. Verify data types and structures\n4. Test edge cases\n\n**Suggested Fix:**\n\`\`\`typescript\n// Add proper null checks\nif (variable && variable.property) {\n  // Safe operation\n}\n\`\`\``,
        
        optimize: `**Performance Optimization:**\n\nTarget: ${command}\n\n**Current Performance Issues:**\n- O(n²) time complexity detected\n- Memory leaks in event handlers\n- Inefficient DOM queries\n\n**Optimization Strategies:**\n\n1. **Algorithm Optimization:**\n   - Replace nested loops with hash maps\n   - Use memoization for repeated calculations\n   - Implement lazy loading\n\n2. **Memory Management:**\n   - Remove event listeners properly\n   - Use WeakMap for object references\n   - Implement object pooling\n\n3. **Rendering Optimization:**\n   - Use virtual scrolling\n   - Implement debouncing\n   - Batch DOM updates\n\n**Expected Improvements:**\n- 60% faster execution time\n- 50% reduction in memory usage\n- Smoother user experience`,
        
        generate: `**Code Generation:**\n\nRequest: ${command}\n\n**Generated Implementation:**\n\n\`\`\`typescript\n// Generated code based on requirements\ninterface GeneratedInterface {\n  id: string;\n  name: string;\n  createdAt: Date;\n}\n\nclass GeneratedClass {\n  private data: GeneratedInterface[] = [];\n\n  constructor(private config: Config) {\n    this.initialize();\n  }\n\n  private initialize(): void {\n    // Initialization logic\n  }\n\n  public processData(input: any): GeneratedInterface[] {\n    // Processing logic\n    return this.data;\n  }\n\n  private validateInput(input: any): boolean {\n    // Validation logic\n    return true;\n  }\n}\n\`\`\`\n\n**Features Included:**\n- TypeScript interfaces\n- Error handling\n- Input validation\n- Clean architecture\n- Documentation`,
        
        review: `**Code Review:**\n\nReviewing: ${command}\n\n**Overall Assessment:** ⭐⭐⭐⭐☆ (4/5)\n\n**Strengths:**\n✅ Clean, readable code structure\n✅ Proper error handling\n✅ Good naming conventions\n✅ Appropriate use of TypeScript features\n\n**Areas for Improvement:**\n⚠️ Missing unit tests\n⚠️ Some functions could be more modular\n⚠️ Consider adding JSDoc comments\n⚠️ Magic numbers should be constants\n\n**Security Considerations:**\n🔒 Input validation looks good\n🔒 No obvious security vulnerabilities\n🔒 Proper sanitization implemented\n\n**Performance Notes:**\n⚡ Efficient algorithms used\n⚡ Memory usage is reasonable\n⚡ No obvious performance bottlenecks`,
        
        test: `**Test Generation:**\n\nFor: ${command}\n\n**Generated Test Suite:**\n\n\`\`\`typescript\nimport { describe, it, expect, beforeEach, jest } from '@jest/globals';\nimport { FunctionToTest } from './function-to-test';\n\ndescribe('FunctionToTest', () => {\n  let instance: FunctionToTest;\n\n  beforeEach(() => {\n    instance = new FunctionToTest();\n  });\n\n  describe('basic functionality', () => {\n    it('should handle normal input correctly', () => {\n      const input = 'test input';\n      const result = instance.process(input);\n      expect(result).toBeDefined();\n      expect(result.success).toBe(true);\n    });\n\n    it('should handle edge cases', () => {\n      const result = instance.process(null);\n      expect(result.error).toBeDefined();\n    });\n\n    it('should handle empty input', () => {\n      const result = instance.process('');\n      expect(result).toEqual({ success: false, error: 'Empty input' });\n    });\n  });\n\n  describe('error handling', () => {\n    it('should throw error for invalid input', () => {\n      expect(() => instance.process(undefined)).toThrow();\n    });\n  });\n});\n\`\`\`\n\n**Test Coverage:**\n- ✅ Happy path scenarios\n- ✅ Edge cases\n- ✅ Error conditions\n- ✅ Input validation\n- ✅ Output verification`
      };

      const response = responses[operation_type] || responses.explain;
      
      return {
        success: true,
        model,
        operation_type,
        command,
        context: context || 'No additional context provided',
        file_path: file_path || 'No specific file targeted',
        output: response,
        timestamp: new Date().toISOString(),
        execution_time_ms: Math.floor(Math.random() * 2000) + 500, // Simulate realistic execution time
        suggestions: [
          'Consider implementing the suggested improvements',
          'Run tests to verify functionality',
          'Review the generated code for your specific use case',
          'Add proper error handling if not already present'
        ]
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        command,
        model,
        timestamp: new Date().toISOString()
      };
    }
  }

  private async executeWebSearch(query: string, limit: number): Promise<any> {
    // Simulate web search (in production, integrate with real search APIs)
    return {
      query,
      results: [
        {
          title: `Search result for: ${query}`,
          url: `https://example.com/search?q=${encodeURIComponent(query)}`,
          snippet: `This is a simulated search result for "${query}". In production, this would be real search results.`,
          relevance: 0.95
        }
      ],
      totalResults: limit,
      searchTime: Date.now()
    };
  }

  private async executeFileOperation(operation: string, path: string, content?: string): Promise<any> {
    // Simulate file operations (in production, use actual file system)
    switch (operation) {
      case 'read':
        return {
          path,
          content: `Simulated content of ${path}`,
          size: 1024,
          lastModified: new Date()
        };
      case 'write':
        return {
          path,
          success: true,
          bytesWritten: content?.length || 0
        };
      case 'list':
        return {
          path,
          contents: [
            { name: 'file1.txt', type: 'file', size: 1024 },
            { name: 'folder1', type: 'directory' }
          ]
        };
      default:
        throw new Error(`Unknown file operation: ${operation}`);
    }
  }

  private async executeAIGeneration(prompt: string, model: string, maxTokens: number): Promise<any> {
    // Simulate AI generation (in production, integrate with real AI models)
    return {
      prompt,
      model,
      generatedText: `This is simulated AI-generated content for: "${prompt}". In production, this would be real AI-generated content using ${model}.`,
      tokensUsed: Math.min(prompt.length + 100, maxTokens),
      generationTime: Date.now()
    };
  }

  private async executeDataAnalysis(data: any[], analysisType: string, parameters: any): Promise<any> {
    // Simulate data analysis (in production, use real analysis libraries)
    return {
      analysisType,
      dataSize: data.length,
      insights: [
        {
          type: 'summary',
          value: `Analyzed ${data.length} data points`,
          confidence: 0.95
        },
        {
          type: 'trend',
          value: 'Positive trend detected',
          confidence: 0.87
        }
      ],
      recommendations: [
        'Consider increasing sample size',
        'Monitor for outliers',
        'Apply additional filters'
      ]
    };
  }

  private async executeAutomation(action: string, workflow: any, parameters: any): Promise<any> {
    // Simulate automation (in production, integrate with real automation systems)
    switch (action) {
      case 'create':
        return {
          workflowId: `workflow_${Date.now()}`,
          name: workflow?.name || 'New Workflow',
          status: 'created',
          steps: workflow?.steps || [],
          createdAt: new Date()
        };
      case 'execute':
        return {
          executionId: `exec_${Date.now()}`,
          status: 'running',
          progress: 0,
          startedAt: new Date()
        };
      case 'update':
        return {
          workflowId: workflow?.id,
          status: 'updated',
          updatedAt: new Date()
        };
      case 'delete':
        return {
          workflowId: workflow?.id,
          status: 'deleted',
          deletedAt: new Date()
        };
      default:
        throw new Error(`Unknown automation action: ${action}`);
    }
  }

  private async executeAgent(agent: MCPAgent, task: string, context: any): Promise<any> {
    // Simulate agent execution (in production, use real agent logic)
    return {
      agentId: agent.id,
      task,
      result: `Agent ${agent.name} executed task: "${task}". This is a simulated result.`,
      context: Object.fromEntries(agent.context),
      executionTime: Date.now(),
      toolsUsed: agent.tools.map(tool => tool.name)
    };
  }

  // Public API Methods
  async createAgent(name: string, description: string, capabilities: string[], tools: string[]): Promise<MCPAgent> {
    const agent: MCPAgent = {
      id: `agent_${Date.now()}`,
      name,
      description,
      capabilities,
      tools: tools.map(toolName => this.tools.get(toolName)).filter(Boolean) as MCPTool[],
      context: new Map(),
      isActive: true
    };

    this.agents.set(agent.id, agent);
    return agent;
  }

  async executeAgentTask(agentId: string, task: string, context: any = {}): Promise<any> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }

    return await this.executeAgent(agent, task, context);
  }

  async addTool(tool: MCPTool): Promise<void> {
    this.tools.set(tool.name, tool);
  }

  async removeTool(toolName: string): Promise<void> {
    this.tools.delete(toolName);
  }

  async getCapabilities(): Promise<MCPCapability[]> {
    return Array.from(this.capabilities.values());
  }

  async getTools(): Promise<MCPTool[]> {
    return Array.from(this.tools.values());
  }

  async getAgents(): Promise<MCPAgent[]> {
    return Array.from(this.agents.values());
  }

  // Real-time capabilities
  async enableRealTimeUpdates(): Promise<void> {
    // Enable real-time updates for connected clients
    this.emit('realTimeEnabled');
  }

  async broadcastUpdate(type: string, data: any): Promise<void> {
    this.emit('update', { type, data, timestamp: new Date() });
  }
}

// Export singleton instance
let mcpProtocol: MCPProtocol | null = null;

export function getMCPProtocol(): MCPProtocol {
  if (!mcpProtocol) {
    mcpProtocol = new MCPProtocol();
  }
  return mcpProtocol;
}

// Initialize MCP Protocol
export async function initializeMCP(): Promise<MCPProtocol> {
  const protocol = getMCPProtocol();
  await protocol.connect();
  return protocol;
}
