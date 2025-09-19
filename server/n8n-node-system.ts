import { storage } from './storage.js';

// Enhanced Node System inspired by n8n architecture
export interface N8nNode {
  id: string;
  name: string;
  type: string;
  typeVersion: number;
  position: [number, number];
  parameters: Record<string, any>;
  credentials?: Record<string, string>;
  webhookUrl?: string;
  disabled?: boolean;
  notes?: string;
  color?: string;
  icon?: string;
  version?: number;
  executeOnce?: boolean;
  retryOnFail?: boolean;
  maxTries?: number;
  waitBetweenTries?: number;
  continueOnFail?: boolean;
  alwaysOutputData?: boolean;
  executeOnce?: boolean;
}

export interface N8nConnection {
  node: string;
  type: string;
  index: number;
}

export interface N8nWorkflow {
  id: string;
  name: string;
  nodes: N8nNode[];
  connections: Record<string, N8nConnection[]>;
  active: boolean;
  settings: N8nWorkflowSettings;
  staticData?: Record<string, any>;
  pinData?: Record<string, any>;
  tags: string[];
  meta?: {
    templateCredsSetupCompleted?: boolean;
    instanceId?: string;
  };
}

export interface N8nWorkflowSettings {
  executionOrder: 'v1' | 'v2';
  saveManualExecutions: boolean;
  callerPolicy: 'workflowsFromSameOwner' | 'anyone' | 'none';
  errorWorkflow?: string;
  timezone?: string;
  executionTimeout?: number;
  saveDataErrorExecution?: 'all' | 'none';
  saveDataSuccessExecution?: 'all' | 'none';
  saveManualExecutions?: boolean;
  executionTimeout?: number;
  retryPolicy?: {
    maxRetries: number;
    retryInterval: number;
    retryMultiplier: number;
  };
}

export interface N8nNodeType {
  name: string;
  displayName: string;
  description: string;
  version: number;
  defaults: {
    name: string;
    color: string;
    inputs: string[];
    outputs: string[];
  };
  inputs: string[];
  outputs: string[];
  credentials?: string[];
  properties: N8nNodeProperty[];
  codex?: {
    categories: string[];
    subcategories?: Record<string, string[]>;
    alias: string[];
    featured?: boolean;
  };
  group: string[];
  documentationUrl?: string;
  icon?: string;
  iconUrl?: string;
}

export interface N8nNodeProperty {
  displayName: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'options' | 'collection' | 'fixedCollection' | 'multiOptions' | 'dateTime' | 'json' | 'color' | 'notice' | 'hidden';
  default?: any;
  description?: string;
  placeholder?: string;
  required?: boolean;
  options?: N8nNodePropertyOption[];
  displayOptions?: Record<string, any>;
  typeOptions?: Record<string, any>;
  routing?: {
    output: string;
    operations: string[];
  };
  noDataExpression?: boolean;
}

export interface N8nNodePropertyOption {
  name: string;
  value: string | number | boolean;
  description?: string;
  action?: string;
  rightIcon?: string;
}

export interface N8nExecution {
  id: string;
  finished: boolean;
  mode: 'manual' | 'trigger' | 'webhook';
  startedAt: string;
  stoppedAt?: string;
  workflowId: string;
  workflowData: N8nWorkflow;
  data: N8nExecutionData;
  status: 'running' | 'success' | 'error' | 'canceled' | 'waiting';
  result?: any;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

export interface N8nExecutionData {
  resultData: N8nExecutionResult[];
  startTime: number;
  executionTime: number;
  lastNodeExecuted?: string;
}

export interface N8nExecutionResult {
  node: {
    name: string;
    type: string;
  };
  data: {
    main: any[][];
    error?: any[][];
  };
  finished?: boolean;
  executionTime?: number;
}

export class N8nNodeSystem {
  private nodeTypes: Map<string, N8nNodeType> = new Map();
  private workflows: Map<string, N8nWorkflow> = new Map();
  private executions: Map<string, N8nExecution> = new Map();
  private isLive: boolean = false;
  private executionQueue: string[] = [];
  private monitoringSubscribers: Set<any> = new Set();

  constructor() {
    this.initializeDefaultNodeTypes();
    this.initializeDefaultWorkflows();
    this.startExecutionEngine();
    this.initializeLiveMode();
  }

  private initializeLiveMode() {
    this.isLive = true;
    console.log('🚀 N8n Node System is now LIVE');
    
    // Start real-time monitoring
    setInterval(() => {
      this.broadcastSystemStatus();
    }, 5000);
  }

  private initializeDefaultNodeTypes() {
    // Trigger Nodes
    this.registerNodeType({
      name: 'amrikyy.trigger.schedule',
      displayName: 'Schedule Trigger',
      description: 'Triggers workflow execution on a schedule',
      version: 1,
      defaults: {
        name: 'Schedule Trigger',
        color: '#3B82F6',
        inputs: [],
        outputs: ['main']
      },
      inputs: [],
      outputs: ['main'],
      properties: [
        {
          displayName: 'Schedule',
          name: 'schedule',
          type: 'options',
          default: 'daily',
          options: [
            { name: 'Daily', value: 'daily' },
            { name: 'Weekly', value: 'weekly' },
            { name: 'Monthly', value: 'monthly' },
            { name: 'Custom Cron', value: 'cron' }
          ],
          required: true
        },
        {
          displayName: 'Time',
          name: 'time',
          type: 'string',
          default: '09:00',
          placeholder: 'HH:MM',
          required: true,
          displayOptions: {
            show: {
              schedule: ['daily', 'weekly']
            }
          }
        }
      ],
      group: ['trigger']
    });

    // AI Nodes
    this.registerNodeType({
      name: 'amrikyy.ai.gemini',
      displayName: 'Gemini AI',
      description: 'Execute AI tasks using Google Gemini',
      version: 1,
      defaults: {
        name: 'Gemini AI',
        color: '#8B5CF6',
        inputs: ['main'],
        outputs: ['main']
      },
      inputs: ['main'],
      outputs: ['main'],
      properties: [
        {
          displayName: 'Operation',
          name: 'operation',
          type: 'options',
          default: 'generate',
          options: [
            { name: 'Generate Content', value: 'generate' },
            { name: 'Analyze Text', value: 'analyze' },
            { name: 'Translate', value: 'translate' },
            { name: 'Summarize', value: 'summarize' }
          ],
          required: true
        },
        {
          displayName: 'Prompt',
          name: 'prompt',
          type: 'string',
          typeOptions: {
            rows: 4
          },
          default: '',
          placeholder: 'Enter your prompt here...',
          required: true
        },
        {
          displayName: 'Model',
          name: 'model',
          type: 'options',
          default: 'gemini-pro',
          options: [
            { name: 'Gemini Pro', value: 'gemini-pro' },
            { name: 'Gemini Pro Vision', value: 'gemini-pro-vision' }
          ]
        }
      ],
      group: ['ai']
    });

    // Social Media Nodes
    this.registerNodeType({
      name: 'amrikyy.social.telegram',
      displayName: 'Telegram',
      description: 'Send messages and interact with Telegram',
      version: 1,
      defaults: {
        name: 'Telegram',
        color: '#0088cc',
        inputs: ['main'],
        outputs: ['main']
      },
      inputs: ['main'],
      outputs: ['main'],
      credentials: ['telegramApi'],
      properties: [
        {
          displayName: 'Operation',
          name: 'operation',
          type: 'options',
          default: 'sendMessage',
          options: [
            { name: 'Send Message', value: 'sendMessage' },
            { name: 'Send Photo', value: 'sendPhoto' },
            { name: 'Get Updates', value: 'getUpdates' }
          ],
          required: true
        },
        {
          displayName: 'Chat ID',
          name: 'chatId',
          type: 'string',
          default: '',
          placeholder: 'Chat ID or @username',
          required: true
        },
        {
          displayName: 'Message',
          name: 'message',
          type: 'string',
          typeOptions: {
            rows: 4
          },
          default: '',
          placeholder: 'Message text...',
          required: true,
          displayOptions: {
            show: {
              operation: ['sendMessage']
            }
          }
        }
      ],
      group: ['social']
    });

    // Data Processing Nodes
    this.registerNodeType({
      name: 'amrikyy.data.set',
      displayName: 'Set Data',
      description: 'Set data values for the workflow',
      version: 1,
      defaults: {
        name: 'Set Data',
        color: '#10B981',
        inputs: ['main'],
        outputs: ['main']
      },
      inputs: ['main'],
      outputs: ['main'],
      properties: [
        {
          displayName: 'Values to Set',
          name: 'values',
          type: 'collection',
          typeOptions: {
            multipleValues: true
          },
          default: {},
          options: [
            {
              displayName: 'Name',
              name: 'name',
              type: 'string',
              default: '',
              placeholder: 'Property name'
            },
            {
              displayName: 'Value',
              name: 'value',
              type: 'string',
              default: '',
              placeholder: 'Property value'
            }
          ]
        }
      ],
      group: ['data']
    });

    // Conditional Logic Nodes
    this.registerNodeType({
      name: 'amrikyy.logic.if',
      displayName: 'If',
      description: 'Conditional logic node',
      version: 1,
      defaults: {
        name: 'If',
        color: '#F59E0B',
        inputs: ['main'],
        outputs: ['true', 'false']
      },
      inputs: ['main'],
      outputs: ['true', 'false'],
      properties: [
        {
          displayName: 'Conditions',
          name: 'conditions',
          type: 'collection',
          typeOptions: {
            multipleValues: true
          },
          default: {},
          options: [
            {
              displayName: 'Left Value',
              name: 'leftValue',
              type: 'string',
              default: '',
              placeholder: 'Left operand'
            },
            {
              displayName: 'Operation',
              name: 'operation',
              type: 'options',
              default: 'equals',
              options: [
                { name: 'Equals', value: 'equals' },
                { name: 'Not Equals', value: 'notEquals' },
                { name: 'Contains', value: 'contains' },
                { name: 'Greater Than', value: 'gt' },
                { name: 'Less Than', value: 'lt' }
              ]
            },
            {
              displayName: 'Right Value',
              name: 'rightValue',
              type: 'string',
              default: '',
              placeholder: 'Right operand'
            }
          ]
        }
      ],
      group: ['logic']
    });

    // HTTP Request Node
    this.registerNodeType({
      name: 'amrikyy.http.request',
      displayName: 'HTTP Request',
      description: 'Make HTTP requests',
      version: 1,
      defaults: {
        name: 'HTTP Request',
        color: '#FF6B6B',
        inputs: ['main'],
        outputs: ['main']
      },
      inputs: ['main'],
      outputs: ['main'],
      properties: [
        {
          displayName: 'Method',
          name: 'method',
          type: 'options',
          default: 'GET',
          options: [
            { name: 'GET', value: 'GET' },
            { name: 'POST', value: 'POST' },
            { name: 'PUT', value: 'PUT' },
            { name: 'DELETE', value: 'DELETE' }
          ],
          required: true
        },
        {
          displayName: 'URL',
          name: 'url',
          type: 'string',
          default: '',
          placeholder: 'https://api.example.com/endpoint',
          required: true
        },
        {
          displayName: 'Headers',
          name: 'headers',
          type: 'collection',
          typeOptions: {
            multipleValues: true
          },
          default: {},
          options: [
            {
              displayName: 'Name',
              name: 'name',
              type: 'string',
              default: ''
            },
            {
              displayName: 'Value',
              name: 'value',
              type: 'string',
              default: ''
            }
          ]
        }
      ],
      group: ['http']
    });
  }

  private initializeDefaultWorkflows() {
    // AI Content Generation Workflow
    const aiContentWorkflow: N8nWorkflow = {
      id: 'ai_content_generation',
      name: 'AI Content Generation & Distribution',
      nodes: [
        {
          id: 'schedule_trigger',
          name: 'Daily Schedule',
          type: 'amrikyy.trigger.schedule',
          typeVersion: 1,
          position: [0, 0],
          parameters: {
            schedule: 'daily',
            time: '09:00'
          }
        },
        {
          id: 'set_topic',
          name: 'Set Topic',
          type: 'amrikyy.data.set',
          typeVersion: 1,
          position: [300, 0],
          parameters: {
            values: {
              string: [
                { name: 'topic', value: 'AI Technology Trends' },
                { name: 'platform', value: 'social_media' }
              ]
            }
          }
        },
        {
          id: 'ai_generate',
          name: 'AI Content Generation',
          type: 'amrikyy.ai.gemini',
          typeVersion: 1,
          position: [600, 0],
          parameters: {
            operation: 'generate',
            prompt: 'Generate engaging social media content about {{ $json.topic }}. Make it informative and engaging for {{ $json.platform }} audience.',
            model: 'gemini-pro'
          }
        },
        {
          id: 'telegram_send',
          name: 'Send to Telegram',
          type: 'amrikyy.social.telegram',
          typeVersion: 1,
          position: [900, 0],
          parameters: {
            operation: 'sendMessage',
            chatId: '@your_channel',
            message: '{{ $json.content }}'
          }
        }
      ],
      connections: {
        schedule_trigger: [{ node: 'set_topic', type: 'main', index: 0 }],
        set_topic: [{ node: 'ai_generate', type: 'main', index: 0 }],
        ai_generate: [{ node: 'telegram_send', type: 'main', index: 0 }]
      },
      active: true,
      settings: {
        executionOrder: 'v1',
        saveManualExecutions: true,
        callerPolicy: 'workflowsFromSameOwner'
      },
      tags: ['ai', 'content', 'automation']
    };

    this.workflows.set(aiContentWorkflow.id, aiContentWorkflow);
  }

  private startExecutionEngine() {
    // Start workflow execution engine
    setInterval(() => {
      this.processExecutionQueue();
    }, 1000);

    // Start workflow trigger checking
    setInterval(() => {
      this.checkWorkflowTriggers();
    }, 30000);
  }

  private async checkWorkflowTriggers() {
    const activeWorkflows = Array.from(this.workflows.values()).filter(w => w.active);
    
    for (const workflow of activeWorkflows) {
      for (const node of workflow.nodes) {
        if (node.type === 'amrikyy.trigger.schedule') {
          if (await this.evaluateScheduleTrigger(node.parameters)) {
            await this.executeWorkflow(workflow.id);
          }
        }
      }
    }
  }

  private async evaluateScheduleTrigger(parameters: any): Promise<boolean> {
    const now = new Date();
    const schedule = parameters.schedule;
    const time = parameters.time;
    
    if (schedule === 'daily') {
      const [hours, minutes] = time.split(':').map(Number);
      return now.getHours() === hours && now.getMinutes() === minutes;
    }
    
    return false;
  }

  private async processExecutionQueue() {
    if (this.executionQueue.length === 0) return;
    
    const workflowId = this.executionQueue.shift();
    if (workflowId) {
      await this.executeWorkflow(workflowId);
    }
  }

  private async executeWorkflow(workflowId: string): Promise<void> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      console.error(`Workflow ${workflowId} not found`);
      return;
    }

    const executionId = `exec_${Date.now()}_${workflowId}`;
    const execution: N8nExecution = {
      id: executionId,
      finished: false,
      mode: 'trigger',
      startedAt: new Date().toISOString(),
      workflowId,
      workflowData: workflow,
      data: {
        resultData: [],
        startTime: Date.now(),
        executionTime: 0
      },
      status: 'running'
    };

    this.executions.set(executionId, execution);
    console.log(`🚀 Executing workflow: ${workflow.name} (${executionId})`);

    try {
      await this.executeWorkflowNodes(workflow, execution);
      
      execution.status = 'success';
      execution.finished = true;
      execution.stoppedAt = new Date().toISOString();
      execution.data.executionTime = Date.now() - execution.data.startTime;
      
      console.log(`✅ Workflow completed: ${workflow.name} (${execution.data.executionTime}ms)`);
    } catch (error) {
      execution.status = 'error';
      execution.finished = true;
      execution.stoppedAt = new Date().toISOString();
      execution.error = {
        name: error.name || 'ExecutionError',
        message: error.message || 'Unknown error',
        stack: error.stack
      };
      
      console.error(`❌ Workflow failed: ${workflow.name}`, error);
    }

    this.broadcastExecutionUpdate(execution);
  }

  private async executeWorkflowNodes(workflow: N8nWorkflow, execution: N8nExecution): Promise<void> {
    const executedNodes = new Set<string>();
    const nodeData: Record<string, any[]> = {};

    // Initialize trigger nodes
    const triggerNodes = workflow.nodes.filter(n => n.type.includes('trigger'));
    for (const triggerNode of triggerNodes) {
      nodeData[triggerNode.id] = [{}]; // Trigger nodes provide initial data
    }

    // Execute nodes in order
    let hasMoreNodes = true;
    while (hasMoreNodes) {
      hasMoreNodes = false;
      
      for (const node of workflow.nodes) {
        if (executedNodes.has(node.id)) continue;
        
        // Check if all input connections are satisfied
        const inputConnections = workflow.connections[node.id] || [];
        const hasInputData = inputConnections.length === 0 || inputConnections.some(conn => nodeData[conn.node]);
        
        if (hasInputData) {
          const result = await this.executeNode(node, nodeData, execution);
          nodeData[node.id] = result;
          executedNodes.add(node.id);
          hasMoreNodes = true;
        }
      }
    }
  }

  private async executeNode(node: N8nNode, nodeData: Record<string, any[]>, execution: N8nExecution): Promise<any[]> {
    console.log(`  📋 Executing node: ${node.name} (${node.type})`);
    
    const startTime = Date.now();
    
    try {
      let result: any[] = [];
      
      switch (node.type) {
        case 'amrikyy.trigger.schedule':
          result = [{}]; // Trigger nodes provide initial data
          break;
          
        case 'amrikyy.data.set':
          result = this.executeSetDataNode(node, nodeData);
          break;
          
        case 'amrikyy.ai.gemini':
          result = await this.executeGeminiNode(node, nodeData);
          break;
          
        case 'amrikyy.social.telegram':
          result = await this.executeTelegramNode(node, nodeData);
          break;
          
        case 'amrikyy.logic.if':
          result = this.executeIfNode(node, nodeData);
          break;
          
        case 'amrikyy.http.request':
          result = await this.executeHttpRequestNode(node, nodeData);
          break;
          
        default:
          throw new Error(`Unknown node type: ${node.type}`);
      }
      
      const executionTime = Date.now() - startTime;
      
      // Record execution result
      execution.data.resultData.push({
        node: {
          name: node.name,
          type: node.type
        },
        data: {
          main: result
        },
        finished: true,
        executionTime
      });
      
      return result;
    } catch (error) {
      console.error(`Node execution error: ${node.name}`, error);
      throw error;
    }
  }

  private executeSetDataNode(node: N8nNode, nodeData: Record<string, any[]>): any[] {
    const inputData = this.getInputData(node, nodeData);
    const values = node.parameters.values || {};
    
    return inputData.map(item => ({
      ...item,
      ...values
    }));
  }

  private async executeGeminiNode(node: N8nNode, nodeData: Record<string, any[]>): Promise<any[]> {
    const inputData = this.getInputData(node, nodeData);
    const prompt = node.parameters.prompt || '';
    const operation = node.parameters.operation || 'generate';
    
    try {
      const { generateContent } = await import('./gemini.js');
      
      // Replace template variables in prompt
      const processedPrompt = this.replaceTemplateVariables(prompt, inputData[0] || {});
      
      const response = await generateContent(processedPrompt);
      
      return inputData.map(item => ({
        ...item,
        content: response,
        operation,
        prompt: processedPrompt
      }));
    } catch (error) {
      console.error('Gemini execution error:', error);
      throw error;
    }
  }

  private async executeTelegramNode(node: N8nNode, nodeData: Record<string, any[]>): Promise<any[]> {
    const inputData = this.getInputData(node, nodeData);
    const operation = node.parameters.operation || 'sendMessage';
    const chatId = node.parameters.chatId || '';
    const message = this.replaceTemplateVariables(node.parameters.message || '', inputData[0] || {});
    
    try {
      // In a real implementation, this would use the Telegram API
      console.log(`📱 Telegram ${operation}: ${message} to ${chatId}`);
      
      return inputData.map(item => ({
        ...item,
        telegramResult: {
          success: true,
          operation,
          chatId,
          message
        }
      }));
    } catch (error) {
      console.error('Telegram execution error:', error);
      throw error;
    }
  }

  private executeIfNode(node: N8nNode, nodeData: Record<string, any[]>): any[] {
    const inputData = this.getInputData(node, nodeData);
    const conditions = node.parameters.conditions || {};
    
    // Simple condition evaluation (in real implementation, this would be more sophisticated)
    const conditionMet = Math.random() > 0.5; // Simplified for demo
    
    return inputData.map(item => ({
      ...item,
      conditionResult: conditionMet
    }));
  }

  private async executeHttpRequestNode(node: N8nNode, nodeData: Record<string, any[]>): Promise<any[]> {
    const inputData = this.getInputData(node, nodeData);
    const method = node.parameters.method || 'GET';
    const url = this.replaceTemplateVariables(node.parameters.url || '', inputData[0] || {});
    
    try {
      // In a real implementation, this would make actual HTTP requests
      console.log(`🌐 HTTP ${method}: ${url}`);
      
      return inputData.map(item => ({
        ...item,
        httpResult: {
          success: true,
          method,
          url,
          response: { status: 200, data: 'Mock response' }
        }
      }));
    } catch (error) {
      console.error('HTTP request execution error:', error);
      throw error;
    }
  }

  private getInputData(node: N8nNode, nodeData: Record<string, any[]>): any[] {
    // Get data from connected nodes (simplified implementation)
    for (const [nodeId, data] of Object.entries(nodeData)) {
      if (data && data.length > 0) {
        return data;
      }
    }
    return [{}]; // Default empty data
  }

  private replaceTemplateVariables(template: string, data: Record<string, any>): string {
    return template.replace(/\{\{\s*\$json\.([^}]+)\s*\}\}/g, (match, key) => {
      return data[key] || match;
    });
  }

  // Public API Methods
  registerNodeType(nodeType: N8nNodeType): void {
    this.nodeTypes.set(nodeType.name, nodeType);
    console.log(`📦 Registered node type: ${nodeType.displayName}`);
  }

  createWorkflow(workflowData: Omit<N8nWorkflow, 'id'>): N8nWorkflow {
    const workflow: N8nWorkflow = {
      ...workflowData,
      id: `workflow_${Date.now()}`
    };
    
    this.workflows.set(workflow.id, workflow);
    console.log(`🆕 Created workflow: ${workflow.name} (${workflow.id})`);
    return workflow;
  }

  async executeWorkflowManually(workflowId: string): Promise<string> {
    this.executionQueue.push(workflowId);
    return `exec_manual_${Date.now()}_${workflowId}`;
  }

  getWorkflow(workflowId: string): N8nWorkflow | undefined {
    return this.workflows.get(workflowId);
  }

  getAllWorkflows(): N8nWorkflow[] {
    return Array.from(this.workflows.values());
  }

  getExecution(executionId: string): N8nExecution | undefined {
    return this.executions.get(executionId);
  }

  getAllExecutions(): N8nExecution[] {
    return Array.from(this.executions.values());
  }

  getNodeTypes(): N8nNodeType[] {
    return Array.from(this.nodeTypes.values());
  }

  getSystemStatus(): any {
    return {
      isLive: this.isLive,
      totalWorkflows: this.workflows.size,
      activeWorkflows: Array.from(this.workflows.values()).filter(w => w.active).length,
      totalExecutions: this.executions.size,
      nodeTypes: this.nodeTypes.size,
      executionQueue: this.executionQueue.length,
      recentExecutions: Array.from(this.executions.values()).slice(-5)
    };
  }

  // Monitoring and Control
  subscribeToUpdates(callback: (status: any) => void): () => void {
    this.monitoringSubscribers.add(callback);
    return () => this.monitoringSubscribers.delete(callback);
  }

  private broadcastSystemStatus(): void {
    if (!this.isLive) return;

    const status = {
      timestamp: new Date().toISOString(),
      system: this.getSystemStatus(),
      workflows: this.getAllWorkflows().map(w => ({
        id: w.id,
        name: w.name,
        active: w.active,
        nodeCount: w.nodes.length
      })),
      recentExecutions: this.getAllExecutions().slice(-3)
    };

    this.monitoringSubscribers.forEach(callback => {
      try {
        callback(status);
      } catch (error) {
        console.error('Error broadcasting system status:', error);
      }
    });
  }

  private broadcastExecutionUpdate(execution: N8nExecution): void {
    this.monitoringSubscribers.forEach(callback => {
      try {
        callback({
          type: 'execution_update',
          execution: {
            id: execution.id,
            status: execution.status,
            workflowId: execution.workflowId,
            startedAt: execution.startedAt,
            finished: execution.finished
          }
        });
      } catch (error) {
        console.error('Error broadcasting execution update:', error);
      }
    });
  }
}

// Export singleton instance
let n8nNodeSystem: N8nNodeSystem | null = null;

export function getN8nNodeSystem(): N8nNodeSystem {
  if (!n8nNodeSystem) {
    n8nNodeSystem = new N8nNodeSystem();
  }
  return n8nNodeSystem;
}
