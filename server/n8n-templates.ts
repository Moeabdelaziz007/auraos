import { storage } from './storage.js';

// ... (N8nWorkflowTemplate, N8nNode, N8nConnection interfaces remain the same)

export interface SubWorkflow {
  id: string;
  name: string;
  nodes: N8nNode[];
  connections: N8nConnection[];
}

// Sub-workflows definition
const subWorkflows: Record<string, SubWorkflow> = {
  scheduleTrigger: {
    id: 'schedule-trigger',
    name: 'Schedule Trigger',
    nodes: [
      {
        id: 'trigger',
        name: 'Schedule Trigger',
        type: 'n8n-nodes-base.scheduleTrigger',
        typeVersion: 1.1,
        position: [0, 0],
        parameters: {
          rule: {
            interval: [{ "field": "hours", "value": 6 }]
          }
        }
      }
    ],
    connections: []
  },
  aiContentGeneration: {
    id: 'ai-content-generation',
    name: 'AI Content Generation',
    nodes: [
      {
        id: 'ai-content',
        name: 'AI Content Generation',
        type: 'n8n-nodes-base.openAi',
        typeVersion: 4,
        position: [250, 0],
        parameters: {
          resource: 'chat',
          operation: 'create',
          model: 'gpt-4',
          messages: {
            values: [
              {
                role: 'system',
                content: 'You are a social media content creator. Generate engaging posts for various platforms.'
              },
              {
                role: 'user',
                content: 'Generate a post about {{ $json.topic || "technology trends" }}'
              }
            ]
          }
        }
      }
    ],
    connections: []
  },
  tweet: {
    id: 'tweet',
    name: 'Tweet on X',
    nodes: [
      {
        id: 'tweet',
        name: 'Tweet on X',
        type: 'n8n-nodes-base.x',
        typeVersion: 1,
        position: [500, 0],
        parameters: {
          text: '{{ $json.content }}'
        },
        credentials: { xApi: 'aura-x' }
      }
    ],
    connections: []
  },
  linkedInPost: {
    id: 'linkedInPost',
    name: 'Post on LinkedIn',
    nodes: [
      {
        id: 'linkedIn',
        name: 'Post on LinkedIn',
        type: 'n8n-nodes-base.linkedIn',
        typeVersion: 2,
        position: [500, 150],
        parameters: {
          content: '{{ $json.content }}'
        },
        credentials: { linkedInApi: 'aura-linkedin' }
      }
    ],
    connections: []
  },
  setData: {
    id: 'setData',
    name: 'Set Data',
    nodes: [
      {
        id: 'setData',
        name: 'Set Data',
        type: 'n8n-nodes-base.set',
        typeVersion: 2.1,
        position: [250, 0],
        parameters: {
          values: {
            string: [{ name: 'topic', value: 'AI in 2024' }]
          },
          options: {}
        }
      }
    ],
    connections: []
  },
  ifNode: {
    id: 'ifNode',
    name: 'If',
    nodes: [
      {
        id: 'if',
        name: 'If',
        type: 'n8n-nodes-base.if',
        typeVersion: 1,
        position: [500, 0],
        parameters: {
          conditions: {
            string: [{ value1: '{{ $json.topic }}', operation: 'contains', value2: 'AI' }]
          }
        }
      }
    ],
    connections: []
  },
  httpRequest: {
    id: 'httpRequest',
    name: 'HTTP Request',
    nodes: [
      {
        id: 'httpRequest',
        name: 'HTTP Request',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 4.1,
        position: [250, 0],
        parameters: {
          url: 'https://api.example.com/data?topic={{ $json.topic }}',
          options: {}
        }
      }
    ],
    connections: []
  },
  executeWorkflow: {
    id: 'executeWorkflow',
    name: 'Execute Workflow',
    nodes: [
      {
        id: 'executeWorkflow',
        name: 'Execute Another Workflow',
        type: 'n8n-nodes-base.executeWorkflow',
        typeVersion: 1,
        position: [750, 0],
        parameters: {
          workflowId: '{{ $json.workflowId }}'
        }
      }
    ],
    connections: []
  }
};

export class DynamicTemplateBuilder {
  private nodes: N8nNode[] = [];
  private connections: N8nConnection[] = [];
  private lastNodeId: string | null = null;
  private lastNodePosition: [number, number] = [-250, 0];

  constructor(private workflowName: string) {}

  add(subWorkflowId: string, connectionType: 'main' | 'true' | 'false' = 'main'): this {
    const subWorkflow = subWorkflows[subWorkflowId];
    if (!subWorkflow) {
      throw new Error(`Sub-workflow with id ${subWorkflowId} not found.`);
    }

    const newNodeId = `${subWorkflow.nodes[0].id}_${this.nodes.length}`;
    const newNode: N8nNode = {
      ...subWorkflow.nodes[0],
      id: newNodeId,
      position: [this.lastNodePosition[0] + 250, this.lastNodePosition[1]]
    };
    
    this.nodes.push(newNode);
    
    if (this.lastNodeId) {
      const outputType = connectionType === 'main' ? 'main' : (connectionType === 'true' ? 'output_0' : 'output_1');
      this.connections.push({ 
        source: this.lastNodeId, 
        target: newNodeId, 
        type: outputType, 
        index: 0 
      } as any);
    }

    this.lastNodeId = newNodeId;
    this.lastNodePosition = newNode.position;

    return this;
  }
  
  build(): Omit<N8nWorkflowTemplate, 'id' | 'createdAt' | 'usageCount'> {
    return {
      name: this.workflowName,
      description: `A dynamically generated workflow for ${this.workflowName}`,
      category: 'automation',
      tags: ['dynamic', 'automation', this.workflowName.toLowerCase().replace(/\s/g, '-')],
      isPublic: false,
      nodes: this.nodes,
      connections: this.connections
    };
  }
}

export class N8nTemplateService {
  private templates: Map<string, N8nWorkflowTemplate> = new Map();

  constructor() {
    this.initializeTemplates();
  }

  private initializeTemplates() {
    const socialMediaContent = new DynamicTemplateBuilder('Scheduled Social Media Content')
      .add('scheduleTrigger')
      .add('setData')
      .add('aiContentGeneration')
      .add('tweet')
      .build();

    const conditionalWorkflow = new DynamicTemplateBuilder('Conditional Content Posting')
      .add('scheduleTrigger')
      .add('httpRequest')
      .add('ifNode')
      .add('aiContentGeneration', 'true')
      .add('linkedInPost', 'true')
      .build();

    this.createTemplate(socialMediaContent);
    this.createTemplate(conditionalWorkflow);
  }

  // ... (rest of the N8nTemplateService remains the same)
}
