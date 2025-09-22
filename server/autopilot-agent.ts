
import { getAdvancedAIAgentSystem, AIAgent, AgentTask } from './advanced-ai-agents.js';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAdvancedAutomationEngine } from './advanced-automation.js';
import { getIntelligentWorkflowOrchestrator } from './intelligent-workflow.js';
import { getSelfImprovingAISystem } from './self-improving-ai.js';
import { enhancedLogger } from './enhanced-logger.js';
import { getMCPProtocol } from './mcp-protocol.js';
import { SmartLearningTelegramBot } from './smart-telegram-bot.js';

export class AutopilotAgent {
  private agentSystem: any;
  public agent: AIAgent;
  private db!: Firestore;
  private debug: boolean;
  private automationEngine: any;
  private workflowOrchestrator: any;
  private selfImprovingSystem: any;
  private mainLoopTimeout: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;
  private availableMcpTools: string[] = [];
  private telegramBot: SmartLearningTelegramBot | null = null;

  constructor(debug = false) {
    this.debug = debug;
    this.agentSystem = getAdvancedAIAgentSystem();
    this.agent = this.agentSystem.createAgent({
      name: 'Autopilot Agent',
      description: 'An advanced AI agent that autonomously manages and optimizes complex projects.',
      type: 'coordinator',
      capabilities: [
        'system_monitoring',
        'performance_analysis',
        'workflow_optimization',
        'self_improvement',
        'automated_decision_making'
      ],
      tools: ['system_info', 'data_analyzer', 'automation_tool'],
      personality: {
        tone: 'professional',
        communicationStyle: 'concise',
        expertise: ['system_optimization', 'workflow_management', 'ai_strategy'],
        limitations: ['direct_user_interaction'],
        preferences: {
          optimization_goal: 'efficiency'
        }
      },
      knowledge: {
        domains: ['system_architecture', 'automation_best_practices', 'performance_metrics'],
        skills: ['monitoring', 'analysis', 'optimization', 'coordination'],
        experience: 95,
        certifications: ['Certified AI Architect', 'Automation Professional'],
        specializations: ['system_health', 'workflow_efficiency']
      },
      memory: {
        shortTerm: new Map(),
        longTerm: new Map(),
        episodic: [],
        semantic: new Map()
      },
      performance: {
        tasksCompleted: 0, successRate: 0, averageResponseTime: 0,
        userSatisfaction: 0, learningProgress: 0, efficiency: 0
      }
    });

    try {
      this.db = getFirestore();
      if (this.debug) {
        console.log('Firestore initialized successfully.');
      }
    } catch (error) {
      console.error('Error initializing Firestore:', error);
    }

    this.automationEngine = getAdvancedAutomationEngine();
    this.workflowOrchestrator = getIntelligentWorkflowOrchestrator();
    this.selfImprovingSystem = getSelfImprovingAISystem();

    if (this.debug) {
      console.log('Autopilot Agent initialized in debug mode.');
    }

    this.start();
  }

  public setTelegramBot(bot: SmartLearningTelegramBot) {
    this.telegramBot = bot;
  }

  public async sendTelegramMessage(chatId: number, message: string) {
    if (this.telegramBot) {
      await this.telegramBot.sendMessage(chatId, message);
    } else {
      enhancedLogger.error('Telegram bot not set for AutopilotAgent.', 'autopilot');
    }
  }
  
  public start() {
    if (this.isRunning) {
      return;
    }
    this.isRunning = true;
    enhancedLogger.info('Autopilot Agent started.', 'autopilot');
    // Use a self-scheduling timeout to prevent overlapping runs
    this.runCycle();
  }

  public stop() {
    this.isRunning = false;
    if (this.mainLoopTimeout) {
      clearTimeout(this.mainLoopTimeout);
      this.mainLoopTimeout = null;
      enhancedLogger.info('Autopilot Agent stopped.', 'autopilot');
    }
  }

  private async runCycle() {
    if (!this.isRunning) {
      return;
    }
    enhancedLogger.info('Autopilot Agent running cycle.', 'autopilot');
    try {
      const health = await this.monitorSystemHealth();
      if (health.status !== 'healthy') {
        enhancedLogger.warn('System health is not optimal.', 'autopilot', health);
        await this.suggestOptimizations(health);
      }

      await this.optimizeWorkflows();

      // Interact with the self-improving system
      await this.selfImprovingSystem.runImprovementCycle();

      this.agentSystem.updateAgent(this.agent.id, { lastActive: new Date() });
    } catch (error) {
      enhancedLogger.error('Autopilot cycle failed', 'autopilot', undefined, error as Error);
    } finally {
      // Schedule the next cycle if the agent is still running
      if (this.isRunning) {
        this.mainLoopTimeout = setTimeout(() => this.runCycle(), 60000); // Run again in 1 minute
      }
    }
  }

  public async monitorSystemHealth(): Promise<any> {
    enhancedLogger.info('Monitoring system health...', 'autopilot');
    const automationStats = this.automationEngine.getAutomationStats();
    const workflowStats = this.workflowOrchestrator.getWorkflowStats();

    const health = {
      status: automationStats.averageSuccessRate > 0.9 && workflowStats.averageSuccessRate > 0.9 ? 'healthy' : 'warning',
      automation: automationStats,
      workflows: workflowStats,
      timestamp: new Date()
    };

    return health;
  }

  public async optimizeWorkflows() {
    enhancedLogger.info('Optimizing workflows...', 'autopilot');
    // In a real implementation, this would analyze and optimize workflows.
    // For now, we just log the action.
    return { success: true, message: 'Workflow optimization cycle completed.' };
  }

  public async suggestOptimizations(healthReport: any) {
    enhancedLogger.info('Suggesting system optimizations...', 'autopilot');

    // Find a suitable agent to handle the analysis.
    const analysisAgent = this.agentSystem.getAgentsByType('specialist').find(
        (agent: AIAgent) => agent.name === 'Data Insights Expert'
    );

    if (!analysisAgent) {
        enhancedLogger.error('No suitable agent found for optimization analysis.', 'autopilot');
        return { success: false, message: 'No analysis agent available.' };
    }

    // Create and assign a task to the analysis agent.
    const optimizationTask: Omit<AgentTask, 'id' | 'agentId' | 'status' | 'createdAt'> = {
        type: 'system_health_analysis',
        description: `System health is suboptimal. Analyze the following health report and suggest concrete optimizations: ${JSON.stringify(healthReport)}`,
        parameters: {
            healthReport,
            goal: 'Identify root cause of performance degradation and propose solutions.'
        },
        priority: 'high',
    };

    const assignedTask = await this.agentSystem.assignTask(analysisAgent.id, optimizationTask);
    enhancedLogger.info(`Assigned optimization task ${assignedTask.id} to agent ${analysisAgent.name}.`, 'autopilot');
    return { success: true, taskId: assignedTask.id };
  }

  public async createTaskFromTelegram(description: string, chatId: number) {
    enhancedLogger.info(`Creating task from Telegram: ${description}`, 'autopilot');

    const analysisAgent = this.agentSystem.getAgentsByType('specialist').find(
        (agent: AIAgent) => agent.name === 'Data Insights Expert'
    );

    if (!analysisAgent) {
        enhancedLogger.error('No suitable agent found for Telegram task.', 'autopilot');
        return { success: false, message: 'No analysis agent available.' };
    }

    const task: Omit<AgentTask, 'id' | 'agentId' | 'status' | 'createdAt'> = {
        type: 'telegram_task',
        description: description,
        parameters: {
            source: 'telegram',
            chatId: chatId
        },
        priority: 'medium',
    };

    const assignedTask = await this.agentSystem.assignTask(analysisAgent.id, task);
    enhancedLogger.info(`Assigned Telegram task ${assignedTask.id} to agent ${analysisAgent.name}.`, 'autopilot');

    await this.sendTelegramMessage(chatId, `Task "${description}" has been created and assigned to ${analysisAgent.name}.`);

    return { success: true, taskId: assignedTask.id };
  }
}

export const autopilotAgent = new AutopilotAgent(process.env.NODE_ENV === 'development');
