import { EventEmitter } from 'events';
import { getAdvancedAIToolsManager } from './advanced-ai-tools.js';
import { getMCPProtocol } from './mcp-protocol.js';

/**
 * Represents an AI agent.
 */
export interface AIAgent {
  id: string;
  name: string;
  description: string;
  type: 'assistant' | 'specialist' | 'coordinator' | 'custom';
  capabilities: string[];
  tools: string[];
  personality: AgentPersonality;
  knowledge: AgentKnowledge;
  memory: AgentMemory;
  status: 'active' | 'inactive' | 'learning' | 'error';
  performance: AgentPerformance;
  createdAt: Date;
  lastActive: Date;
}

/**
 * Represents the personality of an AI agent.
 */
export interface AgentPersonality {
  tone: 'professional' | 'casual' | 'friendly' | 'authoritative' | 'creative';
  communicationStyle: 'concise' | 'detailed' | 'conversational' | 'technical';
  expertise: string[];
  limitations: string[];
  preferences: Record<string, any>;
}

/**
 * Represents the knowledge of an AI agent.
 */
export interface AgentKnowledge {
  domains: string[];
  skills: string[];
  experience: number; // 0-100
  certifications: string[];
  specializations: string[];
}

/**
 * Represents the memory of an AI agent.
 */
export interface AgentMemory {
  shortTerm: Map<string, any>;
  longTerm: Map<string, any>;
  episodic: Array<{
    timestamp: Date;
    event: string;
    context: any;
    outcome: any;
  }>;
  semantic: Map<string, any>;
}

/**
 * Represents the performance of an AI agent.
 */
export interface AgentPerformance {
  tasksCompleted: number;
  successRate: number;
  averageResponseTime: number;
  userSatisfaction: number;
  learningProgress: number;
  efficiency: number;
}

/**
 * Represents a task for an AI agent.
 */
export interface AgentTask {
  id: string;
  agentId: string;
  type: string;
  description: string;
  parameters: any;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  result?: any;
  error?: string;
}

/**
 * Represents a collaboration between AI agents.
 */
export interface AgentCollaboration {
  id: string;
  agents: string[];
  task: string;
  coordination: 'sequential' | 'parallel' | 'hierarchical' | 'peer';
  status: 'planning' | 'executing' | 'completed' | 'failed';
  results: Map<string, any>;
  createdAt: Date;
}

/**
 * Manages a system of advanced AI agents.
 */
export class AdvancedAIAgentSystem extends EventEmitter {
  private agents: Map<string, AIAgent> = new Map();
  private tasks: Map<string, AgentTask> = new Map();
  private collaborations: Map<string, AgentCollaboration> = new Map();
  private aiToolsManager: any;
  private mcpProtocol: any;
  private agentCommunications: Map<string, any[]> = new Map();

  /**
   * Creates an instance of AdvancedAIAgentSystem.
   */
  constructor() {
    super();
    this.aiToolsManager = getAdvancedAIToolsManager();
    this.mcpProtocol = getMCPProtocol();
    this.initializeCoreAgents();
  }

  private initializeCoreAgents() {
    // Content Creation Agent
    this.createAgent({
      name: 'Content Creator Pro',
      description: 'Specialized in creating high-quality content for various platforms',
      type: 'specialist',
      capabilities: ['content_generation', 'seo_optimization', 'brand_voice', 'multi_platform'],
      tools: ['content_generator', 'nlp_processor', 'web_scraper'],
      personality: {
        tone: 'creative',
        communicationStyle: 'detailed',
        expertise: ['content marketing', 'SEO', 'social media', 'blogging'],
        limitations: ['technical documentation', 'legal content'],
        preferences: { style: 'engaging', length: 'medium' }
      },
      knowledge: {
        domains: ['marketing', 'content', 'social media'],
        skills: ['writing', 'editing', 'research', 'strategy'],
        experience: 85,
        certifications: ['Content Marketing Certified', 'SEO Specialist'],
        specializations: ['blog posts', 'social media content', 'email campaigns']
      },
      memory: {
        shortTerm: new Map(),
        longTerm: new Map(),
        episodic: [],
        semantic: new Map()
      },
      performance: {
        tasksCompleted: 0,
        successRate: 0,
        averageResponseTime: 0,
        userSatisfaction: 0,
        learningProgress: 0,
        efficiency: 0
      }
    });

    // Data Analysis Agent
    this.createAgent({
      name: 'Data Insights Expert',
      description: 'Expert in data analysis, visualization, and business intelligence',
      type: 'specialist',
      capabilities: ['data_analysis', 'statistical_modeling', 'visualization', 'predictive_analytics'],
      tools: ['data_analyzer', 'realtime_monitor', 'api_integrator'],
      personality: {
        tone: 'professional',
        communicationStyle: 'technical',
        expertise: ['statistics', 'machine learning', 'data visualization', 'business intelligence'],
        limitations: ['creative content', 'subjective analysis'],
        preferences: { accuracy: 'high', detail: 'comprehensive' }
      },
      knowledge: {
        domains: ['data science', 'statistics', 'business intelligence'],
        skills: ['python', 'r', 'sql', 'machine learning', 'visualization'],
        experience: 90,
        certifications: ['Data Science Professional', 'Statistical Analysis Expert'],
        specializations: ['predictive modeling', 'dashboard creation', 'trend analysis']
      },
      memory: {
        shortTerm: new Map(),
        longTerm: new Map(),
        episodic: [],
        semantic: new Map()
      },
      performance: {
        tasksCompleted: 0,
        successRate: 0,
        averageResponseTime: 0,
        userSatisfaction: 0,
        learningProgress: 0,
        efficiency: 0
      }
    });

    // Automation Specialist Agent
    this.createAgent({
      name: 'Workflow Automation Master',
      description: 'Specializes in creating and managing automated workflows',
      type: 'specialist',
      capabilities: ['workflow_design', 'process_optimization', 'integration', 'monitoring'],
      tools: ['workflow_automator', 'api_integrator', 'realtime_monitor'],
      personality: {
        tone: 'authoritative',
        communicationStyle: 'technical',
        expertise: ['process automation', 'system integration', 'workflow optimization'],
        limitations: ['creative tasks', 'subjective decisions'],
        preferences: { efficiency: 'maximum', reliability: 'high' }
      },
      knowledge: {
        domains: ['automation', 'integration', 'process management'],
        skills: ['workflow design', 'api integration', 'monitoring', 'optimization'],
        experience: 88,
        certifications: ['Automation Specialist', 'Process Optimization Expert'],
        specializations: ['business process automation', 'system integration', 'monitoring']
      },
      memory: {
        shortTerm: new Map(),
        longTerm: new Map(),
        episodic: [],
        semantic: new Map()
      },
      performance: {
        tasksCompleted: 0,
        successRate: 0,
        averageResponseTime: 0,
        userSatisfaction: 0,
        learningProgress: 0,
        efficiency: 0
      }
    });

    // General Assistant Agent
    this.createAgent({
      name: 'Universal Assistant',
      description: 'General-purpose AI assistant for various tasks',
      type: 'assistant',
      capabilities: ['general_assistance', 'information_retrieval', 'task_coordination', 'learning'],
      tools: ['content_generator', 'data_analyzer', 'nlp_processor', 'web_scraper'],
      personality: {
        tone: 'friendly',
        communicationStyle: 'conversational',
        expertise: ['general knowledge', 'task coordination', 'information synthesis'],
        limitations: ['highly specialized tasks', 'domain-specific expertise'],
        preferences: { helpfulness: 'maximum', clarity: 'high' }
      },
      knowledge: {
        domains: ['general', 'coordination', 'information'],
        skills: ['communication', 'research', 'coordination', 'learning'],
        experience: 75,
        certifications: ['General AI Assistant', 'Task Coordination Specialist'],
        specializations: ['general assistance', 'information retrieval', 'task coordination']
      },
      memory: {
        shortTerm: new Map(),
        longTerm: new Map(),
        episodic: [],
        semantic: new Map()
      },
      performance: {
        tasksCompleted: 0,
        successRate: 0,
        averageResponseTime: 0,
        userSatisfaction: 0,
        learningProgress: 0,
        efficiency: 0
      }
    });

    // Coordinator Agent
    this.createAgent({
      name: 'Project Coordinator',
      description: 'Coordinates multiple agents and manages complex projects',
      type: 'coordinator',
      capabilities: ['project_management', 'agent_coordination', 'resource_allocation', 'progress_tracking'],
      tools: ['workflow_automator', 'realtime_monitor', 'api_integrator'],
      personality: {
        tone: 'authoritative',
        communicationStyle: 'concise',
        expertise: ['project management', 'team coordination', 'resource optimization'],
        limitations: ['detailed execution', 'creative tasks'],
        preferences: { efficiency: 'maximum', organization: 'high' }
      },
      knowledge: {
        domains: ['project management', 'coordination', 'resource management'],
        skills: ['planning', 'coordination', 'monitoring', 'optimization'],
        experience: 92,
        certifications: ['Project Management Professional', 'Team Coordination Expert'],
        specializations: ['multi-agent coordination', 'project tracking', 'resource allocation']
      },
      memory: {
        shortTerm: new Map(),
        longTerm: new Map(),
        episodic: [],
        semantic: new Map()
      },
      performance: {
        tasksCompleted: 0,
        successRate: 0,
        averageResponseTime: 0,
        userSatisfaction: 0,
        learningProgress: 0,
        efficiency: 0
      }
    });
  }

  /**
   * Creates a new AI agent.
   * @param {Omit<AIAgent, 'id' | 'status' | 'createdAt' | 'lastActive'>} agentData The data for the new agent.
   * @returns {AIAgent} The newly created agent.
   */
  createAgent(agentData: Omit<AIAgent, 'id' | 'status' | 'createdAt' | 'lastActive'>): AIAgent {
    const agent: AIAgent = {
      ...agentData,
      id: `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'active',
      createdAt: new Date(),
      lastActive: new Date()
    };

    this.agents.set(agent.id, agent);
    return agent;
  }

  /**
   * Gets an agent by its ID.
   * @param {string} agentId The ID of the agent to get.
   * @returns {AIAgent | undefined} The agent, or undefined if not found.
   */
  getAgent(agentId: string): AIAgent | undefined {
    return this.agents.get(agentId);
  }

  /**
   * Gets all agents.
   * @returns {AIAgent[]} A list of all agents.
   */
  getAllAgents(): AIAgent[] {
    return Array.from(this.agents.values());
  }

  /**
   * Gets all agents of a specific type.
   * @param {string} type The type of agents to get.
   * @returns {AIAgent[]} A list of agents of the specified type.
   */
  getAgentsByType(type: string): AIAgent[] {
    return Array.from(this.agents.values()).filter(agent => agent.type === type);
  }

  /**
   * Updates an agent.
   * @param {string} agentId The ID of the agent to update.
   * @param {Partial<AIAgent>} updates The updates to apply to the agent.
   * @returns {boolean} True if the agent was updated, false otherwise.
   */
  updateAgent(agentId: string, updates: Partial<AIAgent>): boolean {
    const agent = this.agents.get(agentId);
    if (!agent) return false;

    Object.assign(agent, updates);
    agent.lastActive = new Date();
    return true;
  }

  /**
   * Deactivates an agent.
   * @param {string} agentId The ID of the agent to deactivate.
   * @returns {boolean} True if the agent was deactivated, false otherwise.
   */
  deactivateAgent(agentId: string): boolean {
    return this.updateAgent(agentId, { status: 'inactive' });
  }

  /**
   * Activates an agent.
   * @param {string} agentId The ID of the agent to activate.
   * @returns {boolean} True if the agent was activated, false otherwise.
   */
  activateAgent(agentId: string): boolean {
    return this.updateAgent(agentId, { status: 'active' });
  }

  /**
   * Assigns a task to an agent.
   * @param {string} agentId The ID of the agent to assign the task to.
   * @param {Omit<AgentTask, 'id' | 'agentId' | 'status' | 'createdAt'>} task The task to assign.
   * @returns {Promise<AgentTask>} A promise that resolves with the assigned task.
   */
  async assignTask(agentId: string, task: Omit<AgentTask, 'id' | 'agentId' | 'status' | 'createdAt'>): Promise<AgentTask> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }

    const agentTask: AgentTask = {
      ...task,
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      agentId,
      status: 'pending',
      createdAt: new Date()
    };

    this.tasks.set(agentTask.id, agentTask);
    
    // Start task execution
    this.executeTask(agentTask.id);
    
    return agentTask;
  }

  private async executeTask(taskId: string): Promise<void> {
    const task = this.tasks.get(taskId);
    if (!task) return;

    const agent = this.agents.get(task.agentId);
    if (!agent) {
      task.status = 'failed';
      task.error = 'Agent not found';
      return;
    }

    task.status = 'in_progress';
    task.startedAt = new Date();
    agent.lastActive = new Date();

    try {
      // Execute task using agent's tools
      const result = await this.executeAgentTask(agent, task);
      
      task.status = 'completed';
      task.completedAt = new Date();
      task.result = result;
      this.emit('task_update', task);

      // Update agent performance
      this.updateAgentPerformance(agent, true, task.completedAt.getTime() - task.startedAt!.getTime());

      // Store in agent memory
      this.storeInAgentMemory(agent, task, result);

    } catch (error) {
      task.status = 'failed';
      task.error = error.message;
      task.completedAt = new Date();
      this.emit('task_update', task);

      // Update agent performance
      this.updateAgentPerformance(agent, false, task.completedAt.getTime() - task.startedAt!.getTime());
    }
  }

  private async executeAgentTask(agent: AIAgent, task: AgentTask): Promise<any> {
    // Determine which tools to use based on task type
    const toolsToUse = this.selectToolsForTask(agent, task);
    
    const results: any[] = [];
    
    for (const toolId of toolsToUse) {
      try {
        const toolResult = await this.aiToolsManager.executeTool(toolId, task.parameters, {
          userId: 'system',
          sessionId: `session_${Date.now()}`,
          requestId: task.id,
          timestamp: new Date(),
          metadata: { agentId: agent.id, taskType: task.type }
        });

        results.push(toolResult);
      } catch (error) {
        console.error(`Tool execution failed: ${toolId}`, error);
      }
    }

    // Synthesize results based on agent personality and capabilities
    return this.synthesizeResults(agent, task, results);
  }

  private selectToolsForTask(agent: AIAgent, task: AgentTask): string[] {
    // Select tools based on task type and agent capabilities
    const availableTools = agent.tools;
    const taskType = task.type.toLowerCase();

    if (taskType.includes('content') || taskType.includes('writing')) {
      return availableTools.filter(tool => tool.includes('content') || tool.includes('nlp'));
    }
    
    if (taskType.includes('data') || taskType.includes('analysis')) {
      return availableTools.filter(tool => tool.includes('data') || tool.includes('analyzer'));
    }
    
    if (taskType.includes('automation') || taskType.includes('workflow')) {
      return availableTools.filter(tool => tool.includes('workflow') || tool.includes('automator'));
    }

    // Default to all available tools
    return availableTools;
  }

  private synthesizeResults(agent: AIAgent, task: AgentTask, results: any[]): any {
    // Synthesize results based on agent personality and capabilities
    const successfulResults = results.filter(r => r.success);
    
    if (successfulResults.length === 0) {
      throw new Error('No successful tool executions');
    }

    // Combine results based on agent type
    switch (agent.type) {
      case 'specialist':
        return this.synthesizeSpecialistResults(agent, task, successfulResults);
      case 'assistant':
        return this.synthesizeAssistantResults(agent, task, successfulResults);
      case 'coordinator':
        return this.synthesizeCoordinatorResults(agent, task, successfulResults);
      default:
        return this.synthesizeGeneralResults(agent, task, successfulResults);
    }
  }

  private synthesizeSpecialistResults(agent: AIAgent, task: AgentTask, results: any[]): any {
    // Specialist agents provide detailed, expert-level results
    return {
      type: 'specialist_result',
      agent: agent.name,
      expertise: agent.knowledge.specializations,
      analysis: results.map(r => r.data),
      recommendations: this.generateExpertRecommendations(agent, results),
      confidence: this.calculateExpertConfidence(agent, results),
      timestamp: new Date()
    };
  }

  private synthesizeAssistantResults(agent: AIAgent, task: AgentTask, results: any[]): any {
    // Assistant agents provide helpful, user-friendly results
    return {
      type: 'assistant_result',
      agent: agent.name,
      summary: this.generateUserFriendlySummary(results),
      details: results.map(r => r.data),
      nextSteps: this.generateNextSteps(results),
      confidence: this.calculateAssistantConfidence(results),
      timestamp: new Date()
    };
  }

  private synthesizeCoordinatorResults(agent: AIAgent, task: AgentTask, results: any[]): any {
    // Coordinator agents provide structured, project-focused results
    return {
      type: 'coordinator_result',
      agent: agent.name,
      projectStatus: 'in_progress',
      deliverables: results.map(r => r.data),
      timeline: this.generateTimeline(results),
      resources: this.assessResources(results),
      confidence: this.calculateCoordinatorConfidence(results),
      timestamp: new Date()
    };
  }

  private synthesizeGeneralResults(agent: AIAgent, task: AgentTask, results: any[]): any {
    // General synthesis for custom agents
    return {
      type: 'general_result',
      agent: agent.name,
      results: results.map(r => r.data),
      summary: 'Task completed successfully',
      confidence: 0.8,
      timestamp: new Date()
    };
  }

  private generateExpertRecommendations(agent: AIAgent, results: any[]): string[] {
    const recommendations: string[] = [];
    
    // Generate recommendations based on agent expertise
    agent.knowledge.specializations.forEach(specialization => {
      recommendations.push(`Consider ${specialization} best practices`);
    });

    return recommendations;
  }

  private calculateExpertConfidence(agent: AIAgent, results: any[]): number {
    const baseConfidence = agent.performance.successRate;
    const experienceBonus = agent.knowledge.experience / 100;
    const resultsQuality = results.length > 0 ? 0.9 : 0.5;
    
    return Math.min(baseConfidence + experienceBonus + resultsQuality, 1);
  }

  private generateUserFriendlySummary(results: any[]): string {
    return `Completed ${results.length} operations successfully. All tasks have been processed and are ready for review.`;
  }

  private generateNextSteps(results: any[]): string[] {
    return [
      'Review the results',
      'Provide feedback if needed',
      'Consider additional tasks'
    ];
  }

  private calculateAssistantConfidence(results: any[]): number {
    return results.length > 0 ? 0.85 : 0.5;
  }

  private generateTimeline(results: any[]): any {
    return {
      estimated: '2-4 hours',
      actual: '1.5 hours',
      status: 'ahead_of_schedule'
    };
  }

  private assessResources(results: any[]): any {
    return {
      tools_used: results.length,
      efficiency: 'high',
      resource_utilization: 'optimal'
    };
  }

  private calculateCoordinatorConfidence(results: any[]): number {
    return results.length > 0 ? 0.9 : 0.6;
  }

  private updateAgentPerformance(agent: AIAgent, success: boolean, executionTime: number): void {
    agent.performance.tasksCompleted++;
    
    // Update success rate using exponential moving average
    const alpha = 0.1;
    agent.performance.successRate = alpha * (success ? 1 : 0) + (1 - alpha) * agent.performance.successRate;
    
    // Update average response time
    agent.performance.averageResponseTime = alpha * executionTime + (1 - alpha) * agent.performance.averageResponseTime;
    
    // Update efficiency (tasks per hour)
    const hours = executionTime / (1000 * 60 * 60);
    agent.performance.efficiency = agent.performance.tasksCompleted / Math.max(hours, 0.1);
  }

  private storeInAgentMemory(agent: AIAgent, task: AgentTask, result: any): void {
    // Store in episodic memory
    agent.memory.episodic.push({
      timestamp: new Date(),
      event: `Task: ${task.type}`,
      context: task.parameters,
      outcome: result
    });

    // Keep only last 100 episodes
    if (agent.memory.episodic.length > 100) {
      agent.memory.episodic = agent.memory.episodic.slice(-100);
    }

    // Update semantic memory
    const taskType = task.type;
    if (!agent.memory.semantic.has(taskType)) {
      agent.memory.semantic.set(taskType, []);
    }
    
    const semanticMemory = agent.memory.semantic.get(taskType)!;
    semanticMemory.push({
      timestamp: new Date(),
      success: task.status === 'completed',
      executionTime: task.completedAt!.getTime() - task.startedAt!.getTime()
    });

    // Keep only last 50 semantic entries per task type
    if (semanticMemory.length > 50) {
      agent.memory.semantic.set(taskType, semanticMemory.slice(-50));
    }
  }

  /**
   * Creates a collaboration between agents.
   * @param {string[]} agents The IDs of the agents to collaborate.
   * @param {string} task The task for the collaboration.
   * @param {'sequential' | 'parallel' | 'hierarchical' | 'peer'} coordination The coordination mode for the collaboration.
   * @returns {Promise<AgentCollaboration>} A promise that resolves with the created collaboration.
   */
  async createCollaboration(agents: string[], task: string, coordination: 'sequential' | 'parallel' | 'hierarchical' | 'peer'): Promise<AgentCollaboration> {
    const collaboration: AgentCollaboration = {
      id: `collab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      agents,
      task,
      coordination,
      status: 'planning',
      results: new Map(),
      createdAt: new Date()
    };

    this.collaborations.set(collaboration.id, collaboration);
    
    // Start collaboration
    this.executeCollaboration(collaboration.id);
    
    return collaboration;
  }

  private async executeCollaboration(collaborationId: string): Promise<void> {
    const collaboration = this.collaborations.get(collaborationId);
    if (!collaboration) return;

    collaboration.status = 'executing';

    try {
      switch (collaboration.coordination) {
        case 'sequential':
          await this.executeSequentialCollaboration(collaboration);
          break;
        case 'parallel':
          await this.executeParallelCollaboration(collaboration);
          break;
        case 'hierarchical':
          await this.executeHierarchicalCollaboration(collaboration);
          break;
        case 'peer':
          await this.executePeerCollaboration(collaboration);
          break;
      }

      collaboration.status = 'completed';
    } catch (error) {
      collaboration.status = 'failed';
      console.error('Collaboration execution failed:', error);
    }
  }

  private async executeSequentialCollaboration(collaboration: AgentCollaboration): Promise<void> {
    for (const agentId of collaboration.agents) {
      const agent = this.agents.get(agentId);
      if (!agent) continue;

      const task = await this.assignTask(agentId, {
        type: 'collaboration_task',
        description: collaboration.task,
        parameters: { collaborationId: collaboration.id },
        priority: 'medium'
      });

      // Wait for task completion
      while (task.status === 'pending' || task.status === 'in_progress') {
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      collaboration.results.set(agentId, task.result);
    }
  }

  private async executeParallelCollaboration(collaboration: AgentCollaboration): Promise<void> {
    const tasks = collaboration.agents.map(agentId => 
      this.assignTask(agentId, {
        type: 'collaboration_task',
        description: collaboration.task,
        parameters: { collaborationId: collaboration.id },
        priority: 'medium'
      })
    );

    // Wait for all tasks to complete
    const completedTasks = await Promise.all(tasks);
    
    completedTasks.forEach(task => {
      collaboration.results.set(task.agentId, task.result);
    });
  }

  private async executeHierarchicalCollaboration(collaboration: AgentCollaboration): Promise<void> {
    // First agent (coordinator) plans the collaboration
    const coordinatorId = collaboration.agents[0];
    const coordinator = this.agents.get(coordinatorId);
    
    if (coordinator) {
      const planningTask = await this.assignTask(coordinatorId, {
        type: 'collaboration_planning',
        description: `Plan collaboration: ${collaboration.task}`,
        parameters: { 
          collaborationId: collaboration.id,
          participants: collaboration.agents.slice(1)
        },
        priority: 'high'
      });

      // Wait for planning to complete
      while (planningTask.status === 'pending' || planningTask.status === 'in_progress') {
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Execute planned tasks
      const plan = planningTask.result;
      if (plan && plan.subtasks) {
        for (const subtask of plan.subtasks) {
          const agentId = subtask.agentId;
          const task = await this.assignTask(agentId, {
            type: 'collaboration_subtask',
            description: subtask.description,
            parameters: subtask.parameters,
            priority: subtask.priority || 'medium'
          });

          while (task.status === 'pending' || task.status === 'in_progress') {
            await new Promise(resolve => setTimeout(resolve, 100));
          }

          collaboration.results.set(agentId, task.result);
        }
      }
    }
  }

  private async executePeerCollaboration(collaboration: AgentCollaboration): Promise<void> {
    // All agents work together as peers
    const tasks = collaboration.agents.map(agentId => 
      this.assignTask(agentId, {
        type: 'peer_collaboration',
        description: collaboration.task,
        parameters: { 
          collaborationId: collaboration.id,
          peers: collaboration.agents.filter(id => id !== agentId)
        },
        priority: 'medium'
      })
    );

    const completedTasks = await Promise.all(tasks);
    
    completedTasks.forEach(task => {
      collaboration.results.set(task.agentId, task.result);
    });
  }

  /**
   * Enables communication between two agents.
   * @param {string} agentId1 The ID of the first agent.
   * @param {string} agentId2 The ID of the second agent.
   * @returns {Promise<void>}
   */
  async enableAgentCommunication(agentId1: string, agentId2: string): Promise<void> {
    const communicationId = `${agentId1}_${agentId2}`;
    this.agentCommunications.set(communicationId, []);
  }

  /**
   * Sends a message from one agent to another.
   * @param {string} fromAgentId The ID of the agent sending the message.
   * @param {string} toAgentId The ID of the agent receiving the message.
   * @param {any} message The message to send.
   * @returns {Promise<void>}
   */
  async sendMessage(fromAgentId: string, toAgentId: string, message: any): Promise<void> {
    const communicationId = `${fromAgentId}_${toAgentId}`;
    const communications = this.agentCommunications.get(communicationId) || [];
    
    communications.push({
      from: fromAgentId,
      to: toAgentId,
      message,
      timestamp: new Date()
    });

    this.agentCommunications.set(communicationId, communications);
  }

  /**
   * Gets the communication history between two agents.
   * @param {string} agentId1 The ID of the first agent.
   * @param {string} agentId2 The ID of the second agent.
   * @returns {any[]} A list of communication messages.
   */
  getCommunicationHistory(agentId1: string, agentId2: string): any[] {
    const communicationId = `${agentId1}_${agentId2}`;
    return this.agentCommunications.get(communicationId) || [];
  }

  /**
   * Gets analytics for a specific agent or all agents.
   * @param {string} [agentId] The ID of the agent to get analytics for.
   * @returns {any} Analytics data.
   */
  getAgentAnalytics(agentId?: string): any {
    if (agentId) {
      const agent = this.agents.get(agentId);
      if (!agent) return null;

      const agentTasks = Array.from(this.tasks.values()).filter(task => task.agentId === agentId);
      
      return {
        agent: {
          id: agent.id,
          name: agent.name,
          type: agent.type,
          status: agent.status
        },
        performance: agent.performance,
        tasks: {
          total: agentTasks.length,
          completed: agentTasks.filter(t => t.status === 'completed').length,
          failed: agentTasks.filter(t => t.status === 'failed').length,
          averageExecutionTime: agentTasks.reduce((sum, t) => {
            if (t.startedAt && t.completedAt) {
              return sum + (t.completedAt.getTime() - t.startedAt.getTime());
            }
            return sum;
          }, 0) / agentTasks.length
        },
        memory: {
          episodic: agent.memory.episodic.length,
          semantic: agent.memory.semantic.size
        }
      };
    }

    // Return analytics for all agents
    return {
      totalAgents: this.agents.size,
      activeAgents: Array.from(this.agents.values()).filter(a => a.status === 'active').length,
      totalTasks: this.tasks.size,
      completedTasks: Array.from(this.tasks.values()).filter(t => t.status === 'completed').length,
      activeCollaborations: Array.from(this.collaborations.values()).filter(c => c.status === 'executing').length,
      agentTypes: Array.from(new Set(Array.from(this.agents.values()).map(a => a.type))),
      averagePerformance: Array.from(this.agents.values()).reduce((sum, a) => sum + a.performance.successRate, 0) / this.agents.size
    };
  }

  /**
   * Gets the task history for a specific agent or all agents.
   * @param {string} [agentId] The ID of the agent to get the task history for.
   * @returns {AgentTask[]} A list of tasks.
   */
  getTaskHistory(agentId?: string): AgentTask[] {
    const allTasks = Array.from(this.tasks.values());
    return agentId ? allTasks.filter(task => task.agentId === agentId) : allTasks;
  }

  getTasks(): AgentTask[] {
    return this.getTaskHistory();
  }

  getTask(id: string): AgentTask | undefined {
    return this.tasks.get(id);
  }

  updateTaskStatus(id: string, status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled' | 'paused'): boolean {
    const task = this.tasks.get(id);
    if (task) {
      task.status = status;
      this.emit('task_update', task);
      return true;
    }
    return false;
  }

  async retryTask(id: string): Promise<AgentTask | null> {
    const task = this.tasks.get(id);
    if (task && task.status === 'failed') {
      const newTaskData = {
        agentId: task.agentId,
        type: task.type,
        description: task.description,
        parameters: task.parameters,
        priority: task.priority,
      };
      return this.assignTask(task.agentId, newTaskData as any);
    }
    return null;
  }

  /**
   * Gets the collaboration history.
   * @returns {AgentCollaboration[]} A list of collaborations.
   */
  getCollaborationHistory(): AgentCollaboration[] {
    return Array.from(this.collaborations.values());
  }
}

// Export singleton instance
let aiAgentSystem: AdvancedAIAgentSystem | null = null;

/**
 * Gets the singleton instance of the AdvancedAIAgentSystem.
 * @returns {AdvancedAIAgentSystem} The singleton instance of the AdvancedAIAgentSystem.
 */
export function getAdvancedAIAgentSystem(): AdvancedAIAgentSystem {
  if (!aiAgentSystem) {
    aiAgentSystem = new AdvancedAIAgentSystem();
  }
  return aiAgentSystem;
}
