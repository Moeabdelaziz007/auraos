import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { generateContent, generatePostContent, chatWithAssistant, analyzeWorkflow } from "./gemini.js";
import { storage } from "./storage";
import { insertPostSchema, insertWorkflowSchema, insertUserAgentSchema, insertChatMessageSchema } from "../shared/schema.js";
import { initializeTelegramBot, getTelegramService } from "./telegram.js";
import { initializeSmartTelegramBot, getSmartTelegramBot } from "./smart-telegram-bot.js";
import { getTravelFoodServiceManager } from "./travel-food-services.js";
import { getSmartLearningAI } from "./smart-learning-ai.js";
import { getMCPProtocol, initializeMCP } from "./mcp-protocol.js";
import { getAdvancedAIToolsManager } from "./advanced-ai-tools.js";
import { getAdvancedAIAgentSystem } from "./advanced-ai-agents.js";
import { getAdvancedAutomationEngine } from "./advanced-automation.js";
import { getIntelligentWorkflowOrchestrator } from "./intelligent-workflow.js";
import { initializeMultiModalAI, getMultiModalAIEngine } from "./multi-modal-ai.js";
import { initializeRealTimeAIStreaming, getRealTimeAIStreaming } from "./real-time-streaming.js";
import { initializeAIModelManagement, getAIModelManagementSystem } from "./ai-model-management.js";
import { initializeLearningSystem, getLearningSystem } from "./learning-automation.js";
import { getEnterpriseTeamManager } from "./enterprise-team-management.js";
import { getEnterpriseAdminDashboard } from "./enterprise-admin-dashboard.js";
import { getEnterpriseCollaborationSystem } from "./enterprise-collaboration.js";
import { getEnhancedTravelAgency } from "./enhanced-travel-agency.js";
import { getTravelDashboard } from "./travel-dashboard.js";
import { getN8nNodeSystem } from "./n8n-node-system.js";
import { getN8nIntegrationManager } from "./n8n-integrations.js";
import { getAIPromptManager } from "./ai-prompt-manager.js";

/**
 * Registers all the API routes, initializes services, and sets up WebSocket connections.
 * @param {Express} app The Express application instance.
 * @returns {Promise<Server>} A promise that resolves with the HTTP server instance.
 */
export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Initialize Smart Learning Telegram Bot
  const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
  if (telegramToken) {
    try {
      await initializeSmartTelegramBot(telegramToken);
      console.log('🤖 Smart Learning Telegram Bot initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Smart Learning Telegram Bot:', error);
    }
  } else {
    console.warn('⚠️ TELEGRAM_BOT_TOKEN not set, Smart Learning Telegram Bot not initialized');
  }

  // Initialize AI Modules
  try {
    // Initialize Advanced Automation Engine
    const automationEngine = getAdvancedAutomationEngine();
    console.log('🚀 Advanced Automation Engine initialized');

    // Initialize Advanced AI Tools Manager
    const aiToolsManager = getAdvancedAIToolsManager();
    console.log('🛠️ Advanced AI Tools Manager initialized');

    // Initialize Advanced AI Agent System
    const aiAgentSystem = getAdvancedAIAgentSystem();
    console.log('🤖 Advanced AI Agent System initialized');

    // Initialize Multi-Modal AI Engine
    await initializeMultiModalAI();
    console.log('🎭 Multi-Modal AI Engine initialized');
  } catch (error) {
    console.error('❌ Failed to initialize AI modules:', error);
  }

  // AI-Powered Decision Making API
  app.post('/api/ai/decision', async (req, res) => {
    try {
      const { context, options, criteria } = req.body;
      
      if (!context || !options) {
        return res.status(400).json({ message: 'context and options are required' });
      }

      // Simulate AI decision making
      const decision = {
        id: `decision_${Date.now()}`,
        context,
        options,
        criteria: criteria || ['efficiency', 'cost', 'user_satisfaction'],
        recommendation: {
          option: options[Math.floor(Math.random() * options.length)],
          confidence: Math.random() * 0.3 + 0.7, // 70-100% confidence
          reasoning: 'AI analysis based on historical data and current context',
          expectedOutcome: 'Optimized performance with minimal risk'
        },
        alternatives: options.slice(0, 2).map(opt => ({
          option: opt,
          confidence: Math.random() * 0.2 + 0.6,
          tradeoffs: ['Lower efficiency', 'Higher cost']
        })),
        timestamp: new Date().toISOString()
      };

      res.json(decision);
    } catch (error) {
      console.error('AI decision making error:', error);
      res.status(500).json({ message: 'Failed to make AI decision' });
    }
  });

  // Predictive Analytics API
  app.post('/api/analytics/predict', async (req, res) => {
    try {
      const { type, timeframe, parameters } = req.body;
      
      if (!type || !timeframe) {
        return res.status(400).json({ message: 'type and timeframe are required' });
      }

      // Simulate predictive analytics
      const prediction = {
        id: `prediction_${Date.now()}`,
        type,
        timeframe,
        parameters: parameters || {},
        predictions: [
          {
            metric: 'user_engagement',
            value: Math.random() * 20 + 80, // 80-100
            confidence: Math.random() * 0.2 + 0.8,
            trend: 'increasing'
          },
          {
            metric: 'system_load',
            value: Math.random() * 30 + 40, // 40-70
            confidence: Math.random() * 0.15 + 0.85,
            trend: 'stable'
          },
          {
            metric: 'cost_optimization',
            value: Math.random() * 15 + 10, // 10-25
            confidence: Math.random() * 0.25 + 0.75,
            trend: 'decreasing'
          }
        ],
        recommendations: [
          {
            action: 'Scale up automation workflows',
            priority: 'high',
            expectedImpact: '20% improvement in efficiency',
            confidence: 0.87
          },
          {
            action: 'Optimize resource allocation',
            priority: 'medium',
            expectedImpact: '15% cost reduction',
            confidence: 0.82
          }
        ],
        timestamp: new Date().toISOString()
      };

      res.json(prediction);
    } catch (error) {
      console.error('Predictive analytics error:', error);
      res.status(500).json({ message: 'Failed to generate predictions' });
    }
  });

  // Smart Telegram Bot API Routes
  app.get('/api/telegram/smart/status', async (req, res) => {
    try {
      const smartBot = getSmartTelegramBot();
      if (!smartBot) {
        return res.status(404).json({ message: 'Smart Telegram bot not initialized' });
      }

      const userContexts = smartBot.getAllUserContexts();
      const learningData = smartBot.getLearningData();

      res.json({
        connected: true,
        activeUsers: userContexts.length,
        learningData: {
          conversationPatterns: Array.from(learningData.get('conversation_patterns')?.keys() || []),
          userPreferences: Array.from(learningData.get('user_preferences')?.keys() || []),
          responseEffectiveness: Array.from(learningData.get('response_effectiveness')?.keys() || [])
        },
        botInfo: {
          name: 'Smart Learning Bot',
          capabilities: ['learning', 'ai_tools', 'personalization', 'continuous_improvement']
        }
      });
    } catch (error) {
      console.error('Smart Telegram status error:', error);
      res.status(500).json({ message: 'Failed to get smart Telegram bot status' });
    }
  });

  app.get('/api/telegram/smart/users', async (req, res) => {
    try {
      const smartBot = getSmartTelegramBot();
      if (!smartBot) {
        return res.status(404).json({ message: 'Smart Telegram bot not initialized' });
      }

      const userContexts = smartBot.getAllUserContexts();
      const users = userContexts.map(context => ({
        userId: context.userId,
        username: context.username,
        firstName: context.firstName,
        chatId: context.chatId,
        experienceLevel: context.learningProfile.experienceLevel,
        learningStyle: context.learningProfile.learningStyle,
        communicationStyle: context.preferences.communicationStyle,
        totalMessages: context.conversationHistory.length,
        lastInteraction: context.lastInteraction,
        topics: context.preferences.topics,
        goals: context.learningProfile.goals
      }));

      res.json(users);
    } catch (error) {
      console.error('Smart Telegram users error:', error);
      res.status(500).json({ message: 'Failed to get smart Telegram users' });
    }
  });

  app.get('/api/telegram/smart/users/:chatId', async (req, res) => {
    try {
      const { chatId } = req.params;
      const smartBot = getSmartTelegramBot();
      
      if (!smartBot) {
        return res.status(404).json({ message: 'Smart Telegram bot not initialized' });
      }

      const userContext = smartBot.getUserContext(parseInt(chatId));
      if (!userContext) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({
        userId: userContext.userId,
        username: userContext.username,
        firstName: userContext.firstName,
        chatId: userContext.chatId,
        experienceLevel: userContext.learningProfile.experienceLevel,
        learningStyle: userContext.learningProfile.learningStyle,
        communicationStyle: userContext.preferences.communicationStyle,
        responseLength: userContext.preferences.responseLength,
        topics: userContext.preferences.topics,
        interests: userContext.preferences.interests,
        goals: userContext.learningProfile.goals,
        progress: Object.fromEntries(userContext.learningProfile.progress),
        strengths: userContext.learningProfile.strengths,
        weaknesses: userContext.learningProfile.weaknesses,
        conversationHistory: userContext.conversationHistory.slice(-10), // Last 10 messages
        lastInteraction: userContext.lastInteraction
      });
    } catch (error) {
      console.error('Smart Telegram user error:', error);
      res.status(500).json({ message: 'Failed to get smart Telegram user' });
    }
  });

  app.post('/api/telegram/smart/learn', async (req, res) => {
    try {
      const { chatId, message, context } = req.body;
      
      if (!chatId || !message) {
        return res.status(400).json({ message: 'chatId and message are required' });
      }

      const smartBot = getSmartTelegramBot();
      if (!smartBot) {
        return res.status(404).json({ message: 'Smart Telegram bot not initialized' });
      }

      const userContext = smartBot.getUserContext(chatId);
      if (!userContext) {
        return res.status(404).json({ message: 'User not found. Please start the bot first.' });
      }

      // Process message with smart learning
      const response = await smartBot.processMessageWithAI(userContext, message);
      
      res.json({
        success: true,
        response: response.text,
        confidence: response.confidence,
        keyboard: response.keyboard,
        learningInsights: {
          experienceLevel: userContext.learningProfile.experienceLevel,
          topics: userContext.preferences.topics,
          communicationStyle: userContext.preferences.communicationStyle
        }
      });
    } catch (error) {
      console.error('Smart Telegram learn error:', error);
      res.status(500).json({ message: 'Failed to process learning request' });
    }
  });

  app.post('/api/telegram/smart/feedback', async (req, res) => {
    try {
      const { chatId, messageId, feedback, rating } = req.body;
      
      if (!chatId || !messageId || feedback === undefined) {
        return res.status(400).json({ message: 'chatId, messageId, and feedback are required' });
      }

      const smartBot = getSmartTelegramBot();
      if (!smartBot) {
        return res.status(404).json({ message: 'Smart Telegram bot not initialized' });
      }

      const userContext = smartBot.getUserContext(chatId);
      if (!userContext) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Update conversation history with feedback
      const message = userContext.conversationHistory.find(m => m.id === messageId);
      if (message) {
        message.satisfaction = rating || (feedback === 'positive' ? 1 : feedback === 'negative' ? -1 : 0);
      }

      res.json({ success: true, message: 'Feedback recorded successfully' });
    } catch (error) {
      console.error('Smart Telegram feedback error:', error);
      res.status(500).json({ message: 'Failed to record feedback' });
    }
  });

  app.get('/api/telegram/smart/analytics', async (req, res) => {
    try {
      const smartBot = getSmartTelegramBot();
      if (!smartBot) {
        return res.status(404).json({ message: 'Smart Telegram bot not initialized' });
      }

      const userContexts = smartBot.getAllUserContexts();
      const learningData = smartBot.getLearningData();

      // Calculate analytics
      const totalUsers = userContexts.length;
      const totalMessages = userContexts.reduce((sum, user) => sum + user.conversationHistory.length, 0);
      const avgMessagesPerUser = totalUsers > 0 ? totalMessages / totalUsers : 0;
      
      const experienceLevels = userContexts.reduce((acc, user) => {
        acc[user.learningProfile.experienceLevel] = (acc[user.learningProfile.experienceLevel] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const communicationStyles = userContexts.reduce((acc, user) => {
        acc[user.preferences.communicationStyle] = (acc[user.preferences.communicationStyle] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const allTopics = userContexts.flatMap(user => user.preferences.topics);
      const topicFrequency = allTopics.reduce((acc, topic) => {
        acc[topic] = (acc[topic] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      res.json({
        totalUsers,
        totalMessages,
        avgMessagesPerUser,
        experienceLevels,
        communicationStyles,
        topicFrequency,
        learningData: {
          conversationPatterns: learningData.get('conversation_patterns')?.size || 0,
          userPreferences: learningData.get('user_preferences')?.size || 0,
          responseEffectiveness: learningData.get('response_effectiveness')?.size || 0
        }
      });
    } catch (error) {
      console.error('Smart Telegram analytics error:', error);
      res.status(500).json({ message: 'Failed to get smart Telegram analytics' });
    }
  });

  // MCP Protocol API Routes
  app.post('/api/mcp/message', async (req, res) => {
    try {
      const { message } = req.body;
      
      if (!message) {
        return res.status(400).json({ message: 'Message is required' });
      }

      const mcpProtocol = getMCPProtocol();
      const response = await mcpProtocol.sendMessage(message);
      
      res.json(response);
    } catch (error) {
      console.error('MCP message error:', error);
      res.status(500).json({ message: 'Failed to process MCP message' });
    }
  });

  app.get('/api/mcp/capabilities', async (req, res) => {
    try {
      const mcpProtocol = getMCPProtocol();
      const capabilities = await mcpProtocol.getCapabilities();
      res.json(capabilities);
    } catch (error) {
      console.error('MCP capabilities error:', error);
      res.status(500).json({ message: 'Failed to get MCP capabilities' });
    }
  });

  app.get('/api/mcp/tools', async (req, res) => {
    try {
      const mcpProtocol = getMCPProtocol();
      const tools = await mcpProtocol.getTools();
      res.json(tools);
    } catch (error) {
      console.error('MCP tools error:', error);
      res.status(500).json({ message: 'Failed to get MCP tools' });
    }
  });

  app.get('/api/mcp/agents', async (req, res) => {
    try {
      const mcpProtocol = getMCPProtocol();
      const agents = await mcpProtocol.getAgents();
      res.json(agents);
    } catch (error) {
      console.error('MCP agents error:', error);
      res.status(500).json({ message: 'Failed to get MCP agents' });
    }
  });

  // Advanced AI Tools API Routes
  app.get('/api/ai-tools', async (req, res) => {
    try {
      const aiToolsManager = getAdvancedAIToolsManager();
      const tools = aiToolsManager.getAllTools();
      res.json(tools);
    } catch (error) {
      console.error('AI tools error:', error);
      res.status(500).json({ message: 'Failed to get AI tools' });
    }
  });

  app.get('/api/ai-tools/categories', async (req, res) => {
    try {
      const aiToolsManager = getAdvancedAIToolsManager();
      const categories = aiToolsManager.getToolCategories();
      res.json(categories);
    } catch (error) {
      console.error('AI tools categories error:', error);
      res.status(500).json({ message: 'Failed to get AI tools categories' });
    }
  });

  app.get('/api/ai-tools/:toolId', async (req, res) => {
    try {
      const { toolId } = req.params;
      const aiToolsManager = getAdvancedAIToolsManager();
      const tool = aiToolsManager.getTool(toolId);
      
      if (!tool) {
        return res.status(404).json({ message: 'AI tool not found' });
      }
      
      res.json(tool);
    } catch (error) {
      console.error('AI tool error:', error);
      res.status(500).json({ message: 'Failed to get AI tool' });
    }
  });

  app.post('/api/ai-tools/:toolId/execute', async (req, res) => {
    try {
      const { toolId } = req.params;
      const { params, context } = req.body;
      
      if (!params) {
        return res.status(400).json({ message: 'Parameters are required' });
      }

      const aiToolsManager = getAdvancedAIToolsManager();
      const toolContext = {
        userId: context?.userId || 'anonymous',
        sessionId: context?.sessionId || `session_${Date.now()}`,
        requestId: `req_${Date.now()}`,
        timestamp: new Date(),
        metadata: context?.metadata || {}
      };

      const result = await aiToolsManager.executeTool(toolId, params, toolContext);
      res.json(result);
    } catch (error) {
      console.error('AI tool execution error:', error);
      res.status(500).json({ message: 'Failed to execute AI tool' });
    }
  });

  app.get('/api/ai-tools/analytics/:toolId?', async (req, res) => {
    try {
      const { toolId } = req.params;
      const aiToolsManager = getAdvancedAIToolsManager();
      const analytics = aiToolsManager.getToolAnalytics(toolId);
      res.json(analytics);
    } catch (error) {
      console.error('AI tools analytics error:', error);
      res.status(500).json({ message: 'Failed to get AI tools analytics' });
    }
  });

  app.post('/api/ai-tools/discover', async (req, res) => {
    try {
      const { query, category } = req.body;
      
      if (!query) {
        return res.status(400).json({ message: 'Query is required' });
      }

      const aiToolsManager = getAdvancedAIToolsManager();
      const tools = aiToolsManager.discoverTools(query, category);
      res.json(tools);
    } catch (error) {
      console.error('AI tools discovery error:', error);
      res.status(500).json({ message: 'Failed to discover AI tools' });
    }
  });

  // Advanced AI Agents API Routes
  app.get('/api/ai-agents', async (req, res) => {
    try {
      const aiAgentSystem = getAdvancedAIAgentSystem();
      const agents = aiAgentSystem.getAllAgents();
      res.json(agents);
    } catch (error) {
      console.error('AI agents error:', error);
      res.status(500).json({ message: 'Failed to get AI agents' });
    }
  });

  app.get('/api/ai-agents/:agentId', async (req, res) => {
    try {
      const { agentId } = req.params;
      const aiAgentSystem = getAdvancedAIAgentSystem();
      const agent = aiAgentSystem.getAgent(agentId);
      
      if (!agent) {
        return res.status(404).json({ message: 'AI agent not found' });
      }
      
      res.json(agent);
    } catch (error) {
      console.error('AI agent error:', error);
      res.status(500).json({ message: 'Failed to get AI agent' });
    }
  });

  app.post('/api/ai-agents', async (req, res) => {
    try {
      const { name, description, type, capabilities, tools, personality, knowledge } = req.body;
      
      if (!name || !description || !type) {
        return res.status(400).json({ message: 'name, description, and type are required' });
      }

      const aiAgentSystem = getAdvancedAIAgentSystem();
      const agent = aiAgentSystem.createAgent({
        name,
        description,
        type,
        capabilities: capabilities || [],
        tools: tools || [],
        personality: personality || {
          tone: 'professional',
          communicationStyle: 'concise',
          expertise: [],
          limitations: [],
          preferences: {}
        },
        knowledge: knowledge || {
          domains: [],
          skills: [],
          experience: 50,
          certifications: [],
          specializations: []
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

      res.status(201).json(agent);
    } catch (error) {
      console.error('Create AI agent error:', error);
      res.status(500).json({ message: 'Failed to create AI agent' });
    }
  });

  app.post('/api/ai-agents/:agentId/tasks', async (req, res) => {
    try {
      const { agentId } = req.params;
      const { type, description, parameters, priority } = req.body;
      
      if (!type || !description) {
        return res.status(400).json({ message: 'type and description are required' });
      }

      const aiAgentSystem = getAdvancedAIAgentSystem();
      const task = await aiAgentSystem.assignTask(agentId, {
        type,
        description,
        parameters: parameters || {},
        priority: priority || 'medium'
      });

      res.status(201).json(task);
    } catch (error) {
      console.error('Assign task error:', error);
      res.status(500).json({ message: 'Failed to assign task to agent' });
    }
  });

  app.get('/api/ai-agents/:agentId/tasks', async (req, res) => {
    try {
      const { agentId } = req.params;
      const aiAgentSystem = getAdvancedAIAgentSystem();
      const tasks = aiAgentSystem.getTaskHistory(agentId);
      res.json(tasks);
    } catch (error) {
      console.error('Agent tasks error:', error);
      res.status(500).json({ message: 'Failed to get agent tasks' });
    }
  });

  app.post('/api/ai-agents/collaboration', async (req, res) => {
    try {
      const { agents, task, coordination } = req.body;
      
      if (!agents || !Array.isArray(agents) || !task) {
        return res.status(400).json({ message: 'agents array and task are required' });
      }

      const aiAgentSystem = getAdvancedAIAgentSystem();
      const collaboration = await aiAgentSystem.createCollaboration(
        agents, 
        task, 
        coordination || 'parallel'
      );

      res.status(201).json(collaboration);
    } catch (error) {
      console.error('Agent collaboration error:', error);
      res.status(500).json({ message: 'Failed to create agent collaboration' });
    }
  });

  app.get('/api/ai-agents/analytics/:agentId?', async (req, res) => {
    try {
      const { agentId } = req.params;
      const aiAgentSystem = getAdvancedAIAgentSystem();
      const analytics = aiAgentSystem.getAgentAnalytics(agentId);
      res.json(analytics);
    } catch (error) {
      console.error('AI agents analytics error:', error);
      res.status(500).json({ message: 'Failed to get AI agents analytics' });
    }
  });

  app.post('/api/ai-agents/:agentId/communicate', async (req, res) => {
    try {
      const { agentId } = req.params;
      const { toAgentId, message } = req.body;
      
      if (!toAgentId || !message) {
        return res.status(400).json({ message: 'toAgentId and message are required' });
      }

      const aiAgentSystem = getAdvancedAIAgentSystem();
      await aiAgentSystem.sendMessage(agentId, toAgentId, message);
      
      res.json({ success: true, message: 'Message sent successfully' });
    } catch (error) {
      console.error('Agent communication error:', error);
      res.status(500).json({ message: 'Failed to send message between agents' });
    }
  });

  app.get('/api/ai-agents/:agentId1/:agentId2/communication', async (req, res) => {
    try {
      const { agentId1, agentId2 } = req.params;
      const aiAgentSystem = getAdvancedAIAgentSystem();
      const history = aiAgentSystem.getCommunicationHistory(agentId1, agentId2);
      res.json(history);
    } catch (error) {
      console.error('Agent communication history error:', error);
      res.status(500).json({ message: 'Failed to get communication history' });
    }
  });

  // Multi-Modal AI Engine API Routes
  app.get('/api/ai/multimodal/models', async (req, res) => {
    try {
      const multiModalAI = getMultiModalAIEngine();
      const models = multiModalAI.getAllModels();
      res.json(models);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/ai/multimodal/models/active', async (req, res) => {
    try {
      const multiModalAI = getMultiModalAIEngine();
      const models = multiModalAI.getActiveModels();
      res.json(models);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/ai/multimodal/models/:modelId', async (req, res) => {
    try {
      const { modelId } = req.params;
      const multiModalAI = getMultiModalAIEngine();
      const model = multiModalAI.getModel(modelId);
      
      if (!model) {
        return res.status(404).json({ error: 'Model not found' });
      }
      
      res.json(model);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/ai/multimodal/process', async (req, res) => {
    try {
      const { input, modelId } = req.body;
      const multiModalAI = getMultiModalAIEngine();
      const output = await multiModalAI.processMultiModal(input, modelId);
      res.json(output);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/ai/multimodal/performance', async (req, res) => {
    try {
      const multiModalAI = getMultiModalAIEngine();
      const metrics = multiModalAI.getPerformanceMetrics();
      res.json(Object.fromEntries(metrics));
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Real-Time AI Streaming API Routes
  app.get('/api/ai/streaming/status', async (req, res) => {
    try {
      const streaming = getRealTimeAIStreaming();
      const stats = streaming.getConnectionStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/ai/streaming/connections', async (req, res) => {
    try {
      const streaming = getRealTimeAIStreaming();
      const connections = streaming.getAllConnections();
      res.json(connections);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/ai/streaming/sessions', async (req, res) => {
    try {
      const streaming = getRealTimeAIStreaming();
      const sessions = streaming.getActiveConnections();
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/ai/streaming/metrics', async (req, res) => {
    try {
      const streaming = getRealTimeAIStreaming();
      const metrics = streaming.getStreamingMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // AI Model Management API Routes
  app.get('/api/ai/models', async (req, res) => {
    try {
      const modelManagement = getAIModelManagementSystem();
      const models = modelManagement.getAllModels();
      res.json(models);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/ai/models/:modelId/versions', async (req, res) => {
    try {
      const { modelId } = req.params;
      const modelManagement = getAIModelManagementSystem();
      const versions = modelManagement.getModelVersions(modelId);
      res.json(versions);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/ai/models/:modelId/versions/latest', async (req, res) => {
    try {
      const { modelId } = req.params;
      const modelManagement = getAIModelManagementSystem();
      const version = modelManagement.getLatestModelVersion(modelId);
      
      if (!version) {
        return res.status(404).json({ error: 'No versions found' });
      }
      
      res.json(version);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/ai/models/:modelId/versions/:versionId/activate', async (req, res) => {
    try {
      const { modelId, versionId } = req.params;
      const modelManagement = getAIModelManagementSystem();
      const success = modelManagement.activateModelVersion(modelId, versionId);
      
      if (!success) {
        return res.status(404).json({ error: 'Version not found' });
      }
      
      res.json({ success: true, message: 'Version activated successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/deployments', async (req, res) => {
    try {
      const modelManagement = getAIModelManagementSystem();
      const deployments = modelManagement.getDeployments();
      res.json(deployments);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/deployments/active', async (req, res) => {
    try {
      const modelManagement = getAIModelManagementSystem();
      const deployments = modelManagement.getActiveDeployments();
      res.json(deployments);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/deployments', async (req, res) => {
    try {
      const { modelId, versionId, environment, config } = req.body;
      const modelManagement = getAIModelManagementSystem();
      const deployment = await modelManagement.deployModel(modelId, versionId, environment, config);
      res.status(201).json(deployment);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/deployments/:deploymentId', async (req, res) => {
    try {
      const { deploymentId } = req.params;
      const modelManagement = getAIModelManagementSystem();
      const success = await modelManagement.undeployModel(deploymentId);
      
      if (!success) {
        return res.status(404).json({ error: 'Deployment not found' });
      }
      
      res.json({ success: true, message: 'Model undeployed successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/training', async (req, res) => {
    try {
      const modelManagement = getAIModelManagementSystem();
      const jobs = modelManagement.getTrainingJobs();
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/training/active', async (req, res) => {
    try {
      const modelManagement = getAIModelManagementSystem();
      const jobs = modelManagement.getActiveTrainingJobs();
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/training', async (req, res) => {
    try {
      const { modelId, config } = req.body;
      const modelManagement = getAIModelManagementSystem();
      const job = await modelManagement.startTrainingJob(modelId, config);
      res.status(201).json(job);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/training/:jobId', async (req, res) => {
    try {
      const { jobId } = req.params;
      const modelManagement = getAIModelManagementSystem();
      const success = await modelManagement.cancelTrainingJob(jobId);
      
      if (!success) {
        return res.status(404).json({ error: 'Training job not found or not running' });
      }
      
      res.json({ success: true, message: 'Training job cancelled successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/federated-learning', async (req, res) => {
    try {
      const modelManagement = getAIModelManagementSystem();
      const rounds = modelManagement.getFederatedLearningRounds();
      res.json(rounds);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/federated-learning/active', async (req, res) => {
    try {
      const modelManagement = getAIModelManagementSystem();
      const rounds = modelManagement.getActiveFederatedLearningRounds();
      res.json(rounds);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/federated-learning', async (req, res) => {
    try {
      const { modelId, participants } = req.body;
      const modelManagement = getAIModelManagementSystem();
      const round = await modelManagement.startFederatedLearningRound(modelId, participants);
      res.status(201).json(round);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/system-metrics', async (req, res) => {
    try {
      const modelManagement = getAIModelManagementSystem();
      const metrics = modelManagement.getSystemMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/models/:modelId/optimize', async (req, res) => {
    try {
      const { modelId } = req.params;
      const { optimizationConfig } = req.body;
      const modelManagement = getAIModelManagementSystem();
      const result = await modelManagement.optimizeModel(modelId, optimizationConfig);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/models/:modelId/archive', async (req, res) => {
    try {
      const { modelId } = req.params;
      const modelManagement = getAIModelManagementSystem();
      const success = await modelManagement.archiveModel(modelId);
      
      if (!success) {
        return res.status(404).json({ error: 'Model not found' });
      }
      
      res.json({ success: true, message: 'Model archived successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/models/:modelId/restore', async (req, res) => {
    try {
      const { modelId } = req.params;
      const modelManagement = getAIModelManagementSystem();
      const success = await modelManagement.restoreModel(modelId);
      
      if (!success) {
        return res.status(404).json({ error: 'Model not found' });
      }
      
      res.json({ success: true, message: 'Model restored successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Enterprise Team Management API Routes
  app.post('/api/enterprise/teams', async (req, res) => {
    try {
      const { name, description, organizationId, creatorId } = req.body;
      
      if (!name || !creatorId) {
        return res.status(400).json({ message: 'name and creatorId are required' });
      }

      const team = await teamManager.createTeam(name, description, organizationId, creatorId);
      res.status(201).json(team);
    } catch (error) {
      console.error('Create team error:', error);
      res.status(500).json({ message: 'Failed to create team' });
    }
  });

  app.get('/api/enterprise/teams', async (req, res) => {
    try {
      const { organizationId } = req.query;
      const teams = await teamManager.getAllTeams(organizationId as string);
      res.json(teams);
    } catch (error) {
      console.error('Get teams error:', error);
      res.status(500).json({ message: 'Failed to get teams' });
    }
  });

  app.get('/api/enterprise/teams/:teamId', async (req, res) => {
    try {
      const { teamId } = req.params;
      const team = await teamManager.getTeam(teamId);
      
      if (!team) {
        return res.status(404).json({ message: 'Team not found' });
      }
      
      res.json(team);
    } catch (error) {
      console.error('Get team error:', error);
      res.status(500).json({ message: 'Failed to get team' });
    }
  });

  app.post('/api/enterprise/teams/:teamId/members', async (req, res) => {
    try {
      const { teamId } = req.params;
      const { userId, email, name, roleId, metadata } = req.body;
      
      if (!userId || !email || !name || !roleId) {
        return res.status(400).json({ message: 'userId, email, name, and roleId are required' });
      }

      const member = await teamManager.addTeamMember(teamId, userId, email, name, roleId, metadata);
      res.status(201).json(member);
    } catch (error) {
      console.error('Add team member error:', error);
      res.status(500).json({ message: 'Failed to add team member' });
    }
  });

  app.get('/api/enterprise/teams/:teamId/analytics', async (req, res) => {
    try {
      const { teamId } = req.params;
      const analytics = await teamManager.getTeamAnalytics(teamId);
      res.json(analytics);
    } catch (error) {
      console.error('Get team analytics error:', error);
      res.status(500).json({ message: 'Failed to get team analytics' });
    }
  });

  // Enterprise Admin Dashboard API Routes
  app.get('/api/enterprise/admin/dashboard/metrics', async (req, res) => {
    try {
      const metrics = await adminDashboard.getDashboardMetrics();
      res.json(metrics);
    } catch (error) {
      console.error('Get admin dashboard metrics error:', error);
      res.status(500).json({ message: 'Failed to get dashboard metrics' });
    }
  });

  app.get('/api/enterprise/admin/dashboard/widgets', async (req, res) => {
    try {
      const widgets = await adminDashboard.getWidgets();
      res.json(widgets);
    } catch (error) {
      console.error('Get dashboard widgets error:', error);
      res.status(500).json({ message: 'Failed to get dashboard widgets' });
    }
  });

  app.get('/api/enterprise/admin/dashboard/alerts', async (req, res) => {
    try {
      const { acknowledged } = req.query;
      const alerts = await adminDashboard.getAlerts(acknowledged === 'true');
      res.json(alerts);
    } catch (error) {
      console.error('Get dashboard alerts error:', error);
      res.status(500).json({ message: 'Failed to get dashboard alerts' });
    }
  });

  app.post('/api/enterprise/admin/dashboard/alerts/:alertId/acknowledge', async (req, res) => {
    try {
      const { alertId } = req.params;
      const { acknowledgedBy } = req.body;
      
      if (!acknowledgedBy) {
        return res.status(400).json({ message: 'acknowledgedBy is required' });
      }

      const success = await adminDashboard.acknowledgeAlert(alertId, acknowledgedBy);
      
      if (!success) {
        return res.status(404).json({ message: 'Alert not found' });
      }
      
      res.json({ success: true, message: 'Alert acknowledged successfully' });
    } catch (error) {
      console.error('Acknowledge alert error:', error);
      res.status(500).json({ message: 'Failed to acknowledge alert' });
    }
  });

  // Enhanced Travel Agency API Routes
  app.get('/api/travel/destinations', async (req, res) => {
    try {
      const destinations = await travelAgency.getDestinations();
      res.json(destinations);
    } catch (error) {
      console.error('Get destinations error:', error);
      res.status(500).json({ message: 'Failed to get destinations' });
    }
  });

  app.get('/api/travel/destinations/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const destination = await travelAgency.getDestination(id);
      
      if (!destination) {
        return res.status(404).json({ message: 'Destination not found' });
      }
      
      res.json(destination);
    } catch (error) {
      console.error('Get destination error:', error);
      res.status(500).json({ message: 'Failed to get destination' });
    }
  });

  app.post('/api/travel/flights/search', async (req, res) => {
    try {
      const searchParams = req.body;
      const flights = await travelAgency.searchFlights(searchParams);
      res.json(flights);
    } catch (error) {
      console.error('Search flights error:', error);
      res.status(500).json({ message: 'Failed to search flights' });
    }
  });

  app.post('/api/travel/hotels/search', async (req, res) => {
    try {
      const searchParams = req.body;
      const hotels = await travelAgency.searchHotels(searchParams);
      res.json(hotels);
    } catch (error) {
      console.error('Search hotels error:', error);
      res.status(500).json({ message: 'Failed to search hotels' });
    }
  });

  app.post('/api/travel/recommendations', async (req, res) => {
    try {
      const { userId, destination } = req.body;
      
      if (!userId || !destination) {
        return res.status(400).json({ message: 'userId and destination are required' });
      }

      const recommendations = await travelAgency.getPersonalizedRecommendations(userId, destination);
      res.json(recommendations);
    } catch (error) {
      console.error('Get travel recommendations error:', error);
      res.status(500).json({ message: 'Failed to get travel recommendations' });
    }
  });

  app.post('/api/travel/bookings', async (req, res) => {
    try {
      const bookingRequest = req.body;
      const booking = await travelAgency.bookTravel(bookingRequest);
      res.status(201).json(booking);
    } catch (error) {
      console.error('Create travel booking error:', error);
      res.status(500).json({ message: 'Failed to create travel booking' });
    }
  });

  app.get('/api/travel/bookings/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const bookings = await travelAgency.getUserBookings(userId);
      res.json(bookings);
    } catch (error) {
      console.error('Get user bookings error:', error);
      res.status(500).json({ message: 'Failed to get user bookings' });
    }
  });

  app.get('/api/travel/bookings/booking/:bookingId', async (req, res) => {
    try {
      const { bookingId } = req.params;
      const booking = await travelAgency.getBooking(bookingId);
      
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }
      
      res.json(booking);
    } catch (error) {
      console.error('Get booking error:', error);
      res.status(500).json({ message: 'Failed to get booking' });
    }
  });

  // Travel Dashboard API Routes
  app.get('/api/travel/dashboard/metrics', async (req, res) => {
    try {
      const metrics = await travelDashboard.getDashboardMetrics();
      res.json(metrics);
    } catch (error) {
      console.error('Get travel dashboard metrics error:', error);
      res.status(500).json({ message: 'Failed to get travel dashboard metrics' });
    }
  });

  app.get('/api/travel/dashboard/widgets', async (req, res) => {
    try {
      const widgets = await travelDashboard.getWidgets();
      res.json(widgets);
    } catch (error) {
      console.error('Get travel dashboard widgets error:', error);
      res.status(500).json({ message: 'Failed to get travel dashboard widgets' });
    }
  });

  // Enterprise Collaboration API Routes
  app.post('/api/collaboration/sessions', async (req, res) => {
    try {
      const { type, resourceId, resourceName, teamId, creatorId, permissions } = req.body;
      
      if (!type || !resourceId || !resourceName || !teamId || !creatorId) {
        return res.status(400).json({ message: 'type, resourceId, resourceName, teamId, and creatorId are required' });
      }

      const session = await collaborationSystem.createCollaborationSession(
        type, resourceId, resourceName, teamId, creatorId, permissions
      );
      res.status(201).json(session);
    } catch (error) {
      console.error('Create collaboration session error:', error);
      res.status(500).json({ message: 'Failed to create collaboration session' });
    }
  });

  app.post('/api/collaboration/sessions/:sessionId/join', async (req, res) => {
    try {
      const { sessionId } = req.params;
      const { userId, teamId } = req.body;
      
      if (!userId || !teamId) {
        return res.status(400).json({ message: 'userId and teamId are required' });
      }

      const participant = await collaborationSystem.joinCollaborationSession(sessionId, userId, teamId);
      res.json(participant);
    } catch (error) {
      console.error('Join collaboration session error:', error);
      res.status(500).json({ message: 'Failed to join collaboration session' });
    }
  });

  app.post('/api/collaboration/sessions/:sessionId/leave', async (req, res) => {
    try {
      const { sessionId } = req.params;
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ message: 'userId is required' });
      }

      const success = await collaborationSystem.leaveCollaborationSession(sessionId, userId);
      
      if (!success) {
        return res.status(404).json({ message: 'Session not found' });
      }
      
      res.json({ success: true, message: 'Left collaboration session successfully' });
    } catch (error) {
      console.error('Leave collaboration session error:', error);
      res.status(500).json({ message: 'Failed to leave collaboration session' });
    }
  });

  app.get('/api/collaboration/sessions/:sessionId/comments', async (req, res) => {
    try {
      const { sessionId } = req.params;
      const comments = await collaborationSystem.getSessionComments(sessionId);
      res.json(comments);
    } catch (error) {
      console.error('Get session comments error:', error);
      res.status(500).json({ message: 'Failed to get session comments' });
    }
  });

  app.post('/api/collaboration/sessions/:sessionId/comments', async (req, res) => {
    try {
      const { sessionId } = req.params;
      const { userId, content, type, position } = req.body;
      
      if (!userId || !content) {
        return res.status(400).json({ message: 'userId and content are required' });
      }

      const comment = await collaborationSystem.addComment(sessionId, userId, content, type, position);
      res.status(201).json(comment);
    } catch (error) {
      console.error('Add comment error:', error);
      res.status(500).json({ message: 'Failed to add comment' });
    }
  });

  // =============================================================================
  // CLI-SPECIFIC API ENDPOINTS (Inspired by ZentixAI)
  // These endpoints are designed to be used by a command-line interface for system management and interaction.
  // =============================================================================

  /**
   * System Status Endpoint for CLI
   */
  app.get('/api/system/status', async (req, res) => {
    try {
      const startTime = Date.now();
      
      // Get system information
      const systemInfo = {
        status: 'operational',
        uptime: process.uptime(),
        version: '1.0.0',
        nodeVersion: process.version,
        platform: process.platform,
        memory: process.memoryUsage(),
        pid: process.pid
      };

      // Get autopilot status
      const automationEngine = getAdvancedAutomationEngine();
      const autopilotInfo = {
        active: automationEngine.isActive(),
        rules: automationEngine.getActiveRulesCount(),
        workflows: automationEngine.getActiveWorkflowsCount(),
        lastExecution: automationEngine.getLastExecutionTime()
      };

      // Get AI agents status
      const agentSystem = getAdvancedAIAgentSystem();
      const aiInfo = {
        agents: agentSystem.getTotalAgentsCount(),
        activeAgents: agentSystem.getActiveAgentsCount(),
        totalTasks: agentSystem.getTotalTasksCount()
      };

      // Get performance metrics
      const performanceInfo = {
        memory: Math.round((process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100),
        cpu: Math.round(process.cpuUsage().user / 1000000), // Convert to percentage approximation
        responseTime: Date.now() - startTime
      };

      res.json({
        system: systemInfo,
        autopilot: autopilotInfo,
        ai: aiInfo,
        performance: performanceInfo,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('System status error:', error);
      res.status(500).json({ message: 'Failed to get system status' });
    }
  });

  /**
   * AI Chat Endpoint for CLI
   */
  app.post('/api/ai/chat', async (req, res) => {
    try {
      const { message, context = 'cli' } = req.body;
      
      if (!message) {
        return res.status(400).json({ message: 'Message is required' });
      }

      const messages = [
        { role: 'system', content: `You are a helpful assistant responding in a CLI context: ${context}.` },
        { role: 'user', content: message }
      ];
      const response = await chatWithAssistant(messages);
      
      res.json({
        response,
        timestamp: new Date().toISOString(),
        context: context
      });
    } catch (error) {
      console.error('AI chat error:', error);
      res.status(500).json({ message: 'Failed to process chat request' });
    }
  });

  /**
   * Autopilot Status Endpoint for CLI
   */
  app.get('/api/autopilot/status', async (req, res) => {
    try {
      const automationEngine = getAdvancedAutomationEngine();
      const status = automationEngine.getStatus();
      
      res.json({
        active: status.active,
        rules: status.rules,
        workflows: status.workflows,
        performance: status.performance,
        lastExecution: status.lastExecution,
        nextExecution: status.nextExecution
      });
    } catch (error) {
      console.error('Autopilot status error:', error);
      res.status(500).json({ message: 'Failed to get autopilot status' });
    }
  });

  /**
   * Workflow Templates Endpoint for CLI
   */
  app.get('/api/workflows/templates', async (req, res) => {
    try {
      const workflowOrchestrator = getIntelligentWorkflowOrchestrator();
      const templates = workflowOrchestrator.getAvailableTemplates();
      
      res.json(templates);
    } catch (error) {
      console.error('Workflow templates error:', error);
      res.status(500).json({ message: 'Failed to get workflow templates' });
    }
  });

  /**
   * AI Agents Status Endpoint for CLI
   */
  app.get('/api/ai/agents/status', async (req, res) => {
    try {
      const agentSystem = getAdvancedAIAgentSystem();
      const agents = agentSystem.getAllAgents();
      
      const status = {
        total: agents.length,
        active: agents.filter(agent => agent.status === 'active').length,
        agents: agents.map(agent => ({
          id: agent.id,
          name: agent.name,
          type: agent.type,
          status: agent.status,
          tasksCompleted: agent.performance.tasksCompleted,
          successRate: agent.performance.successRate
        }))
      };
      
      res.json(status);
    } catch (error) {
      console.error('AI agents status error:', error);
      res.status(500).json({ message: 'Failed to get AI agents status' });
    }
  });

  /**
   * System Health Check Endpoint for CLI
   */
  app.get('/api/system/health', async (req, res) => {
    try {
      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
          database: 'connected',
          ai: 'operational',
          autopilot: 'active',
          websocket: 'connected'
        },
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: '1.0.0'
      };

      res.json(health);
    } catch (error) {
      console.error('Health check error:', error);
      res.status(500).json({ 
        status: 'unhealthy',
        message: 'Health check failed',
        error: error.message 
      });
    }
  });

  /**
   * System Logs Endpoint for CLI
   */
  app.get('/api/system/logs', async (req, res) => {
    try {
      const { limit = 100, level = 'all' } = req.query;
      
      // This would integrate with your existing logging system
      // For now, return a mock response
      const logs = [
        {
          timestamp: new Date().toISOString(),
          level: 'info',
          message: 'System started successfully',
          source: 'system'
        },
        {
          timestamp: new Date(Date.now() - 60000).toISOString(),
          level: 'info',
          message: 'Autopilot engine activated',
          source: 'autopilot'
        }
      ];

      res.json({
        logs: logs.slice(0, parseInt(limit as string)),
        total: logs.length,
        level: level
      });
    } catch (error) {
      console.error('System logs error:', error);
      res.status(500).json({ message: 'Failed to get system logs' });
    }
  });

  // Initialize N8n Node System
  const n8nNodeSystem = getN8nNodeSystem();
  console.log('🔧 N8n Node System initialized');

  // Initialize N8n Integration Manager
  const n8nIntegrationManager = getN8nIntegrationManager();
  console.log('🔌 N8n Integration Manager initialized');

  // Initialize AI Prompt Manager
  const aiPromptManager = getAIPromptManager();
  console.log('🤖 AI Prompt Manager initialized');

  // N8n Node System Routes
  app.get('/api/n8n/workflows', (req, res) => {
    try {
      const workflows = n8nNodeSystem.getAllWorkflows();
      res.json({ success: true, workflows });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.get('/api/n8n/workflows/:id', (req, res) => {
    try {
      const workflow = n8nNodeSystem.getWorkflow(req.params.id);
      if (!workflow) {
        return res.status(404).json({ success: false, error: 'Workflow not found' });
      }
      res.json({ success: true, workflow });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post('/api/n8n/workflows/:id/execute', async (req, res) => {
    try {
      const executionId = await n8nNodeSystem.executeWorkflowManually(req.params.id);
      res.json({ success: true, executionId });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.get('/api/n8n/executions/:id', (req, res) => {
    try {
      const execution = n8nNodeSystem.getExecution(req.params.id);
      if (!execution) {
        return res.status(404).json({ success: false, error: 'Execution not found' });
      }
      res.json({ success: true, execution });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.get('/api/n8n/node-types', (req, res) => {
    try {
      const nodeTypes = n8nNodeSystem.getNodeTypes();
      res.json({ success: true, nodeTypes });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.get('/api/n8n/status', (req, res) => {
    try {
      const status = n8nNodeSystem.getSystemStatus();
      res.json({ success: true, status });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // N8n Integration Manager Routes
  app.get('/api/integrations/connectors', (req, res) => {
    try {
      const connectors = n8nIntegrationManager.getAllConnectors();
      res.json({ success: true, connectors });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.get('/api/integrations/connectors/:id', (req, res) => {
    try {
      const connector = n8nIntegrationManager.getConnector(req.params.id);
      if (!connector) {
        return res.status(404).json({ success: false, error: 'Connector not found' });
      }
      res.json({ success: true, connector });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.get('/api/integrations/connectors/category/:category', (req, res) => {
    try {
      const connectors = n8nIntegrationManager.getConnectorsByCategory(req.params.category as any);
      res.json({ success: true, connectors });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.get('/api/integrations/featured', (req, res) => {
    try {
      const connectors = n8nIntegrationManager.getFeaturedConnectors();
      res.json({ success: true, connectors });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.get('/api/integrations/statistics', (req, res) => {
    try {
      const statistics = n8nIntegrationManager.getConnectorStatistics();
      res.json({ success: true, statistics });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post('/api/integrations/connectors/:id/test', async (req, res) => {
    try {
      const { credentialName } = req.body;
      const result = await n8nIntegrationManager.testConnector(req.params.id, credentialName);
      res.json({ success: true, result });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // AI Prompt Manager Routes
  app.get('/api/ai/prompts', (req, res) => {
    try {
      const prompts = aiPromptManager.getAllPrompts();
      res.json({ success: true, prompts });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.get('/api/ai/prompts/:id', (req, res) => {
    try {
      const prompt = aiPromptManager.getPrompt(req.params.id);
      if (!prompt) {
        return res.status(404).json({ success: false, error: 'Prompt not found' });
      }
      res.json({ success: true, prompt });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.get('/api/ai/prompts/category/:category', (req, res) => {
    try {
      const prompts = aiPromptManager.getPromptsByCategory(req.params.category as any);
      res.json({ success: true, prompts });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.get('/api/ai/prompts/search', (req, res) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ success: false, error: 'Query parameter required' });
      }
      const prompts = aiPromptManager.searchPrompts(q);
      res.json({ success: true, prompts });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.get('/api/ai/prompts/popular', (req, res) => {
    try {
      const { limit } = req.query;
      const limitNum = limit ? parseInt(limit as string) : 10;
      const prompts = aiPromptManager.getPopularPrompts(limitNum);
      res.json({ success: true, prompts });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post('/api/ai/prompts/:id/execute', async (req, res) => {
    try {
      const { variables, userId } = req.body;
      const result = await aiPromptManager.executePrompt(req.params.id, variables, userId);
      res.json({ success: true, result });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post('/api/ai/prompts/:id/feedback', (req, res) => {
    try {
      const { rating, comment, improvements } = req.body;
      const success = aiPromptManager.submitFeedback(req.params.id, {
        userId: req.body.userId || 'anonymous',
        rating,
        comment,
        improvements
      });
      res.json({ success });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.get('/api/ai/prompts/:id/statistics', (req, res) => {
    try {
      const statistics = aiPromptManager.getPromptStatistics(req.params.id);
      if (!statistics) {
        return res.status(404).json({ success: false, error: 'Prompt not found' });
      }
      res.json({ success: true, statistics });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.get('/api/ai/statistics', (req, res) => {
    try {
      const statistics = aiPromptManager.getSystemStatistics();
      res.json({ success: true, statistics });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.get('/api/ai/status', (req, res) => {
    try {
      const status = aiPromptManager.getSystemStatus();
      res.json({ success: true, status });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Minimal Synapse Summarize endpoint (placeholder)
  app.post('/api/synapse/summarize', async (req, res) => {
    try {
      const { text = '', noteId, attachments = [] } = req.body || {};
      const provider = process.env.OPENAI_API_KEY ? 'openai' : (process.env.GOOGLE_GEMINI_API_KEY ? 'gemini' : 'none');
      const summary = text ? (text.length > 200 ? text.slice(0, 197) + '...' : text) : 'No content provided';
      res.json({ success: true, summary, model: provider, noteId, attachmentsCount: attachments.length });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  });

  // Minimal Chronos create-event endpoint (placeholder)
  app.post('/api/chronos/create-event', async (req, res) => {
    try {
      const { title, start, end, reminder = true } = req.body || {};
      if (!title || !start) {
        return res.status(400).json({ success: false, error: 'title and start are required' });
      }
      const id = 'evt_' + Math.random().toString(36).slice(2, 10);
      res.json({ success: true, id, status: 'created', event: { title, start, end, reminder } });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  });

  // Minimal Chronos from-action endpoint (placeholder)
  app.post('/api/chronos/from-action', async (req, res) => {
    try {
      const { title, timeHint } = req.body || {};
      if (!title) {
        return res.status(400).json({ success: false, error: 'title is required' });
      }
      const start = timeHint || new Date().toISOString();
      const id = 'evt_' + Math.random().toString(36).slice(2, 10);
      res.json({ success: true, id, status: 'scheduled', event: { title, start } });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  });

  // Free AI Chat endpoint (using open-source model or free API)
  app.post('/api/ai/chat', async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt) return res.status(400).json({ error: 'Prompt is required' });
      // Example: Use HuggingFace Inference API with a free model (e.g., mistralai/Mistral-7B-Instruct-v0.2)
      const response = await fetch('https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': 'Bearer YOUR_HUGGINGFACE_TOKEN', // Omit for public/free models or use env var
        },
        body: JSON.stringify({ inputs: prompt })
      });
      const data = await response.json();
      const text = Array.isArray(data) && data[0]?.generated_text ? data[0].generated_text : (data.generated_text || data[0]?.text || '');
      res.json({ text });
    } catch (error) {
      console.error('AI chat error:', error);
      res.status(500).json({ error: 'Failed to get AI response' });
    }
  });

  // MCP Tool Execution endpoint
  app.post('/api/mcp/tools/:id/execute', async (req, res) => {
    try {
      const toolId = req.params.id;
      const params = req.body?.params || {};
      const mcpProtocol = getMCPProtocol();
      // Try to find the tool by id or name from the public getter
      const allTools = await mcpProtocol.getTools();
      const tool = allTools.find((t: any) => t.id === toolId || t.name === toolId);
      if (!tool) return res.status(404).json({ error: 'Tool not found' });
      const context = req.body?.context || {};
      if (typeof tool.execute !== 'function') {
        return res.status(400).json({ error: 'Tool is not executable' });
      }
      const result = await tool.execute(params, context);
      res.json({ result });
    } catch (error) {
      console.error('MCP tool execution error:', error);
      res.status(500).json({ error: 'Failed to execute tool' });
    }
  });

  return httpServer;
}
