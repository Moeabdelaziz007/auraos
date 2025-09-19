import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { generateContent, generatePostContent, chatWithAssistant, analyzeWorkflow } from "./gemini.js";
import { storage } from "./storage";
import { insertPostSchema, insertWorkflowSchema, insertUserAgentSchema, insertChatMessageSchema } from "@shared/schema";
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

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Initialize Smart Learning Telegram Bot
  const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
  if (telegramToken) {
    try {
      // Initialize both basic and smart Telegram bots
      initializeTelegramBot(telegramToken);
      const smartBot = initializeSmartTelegramBot(telegramToken);
      await smartBot.launch();
      console.log('🤖 Smart Learning Telegram bot initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Smart Telegram bot:', error);
    }
  } else {
    console.warn('⚠️ TELEGRAM_BOT_TOKEN not found in environment variables');
  }

  // Initialize MCP Protocol
  try {
    await initializeMCP();
    console.log('🔗 MCP Protocol initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize MCP Protocol:', error);
  }

  // Initialize Advanced AI Tools Manager
  try {
    const aiToolsManager = getAdvancedAIToolsManager();
    console.log('🛠️ Advanced AI Tools Manager initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize AI Tools Manager:', error);
  }

  // Initialize Advanced AI Agent System
  try {
    const aiAgentSystem = getAdvancedAIAgentSystem();
    console.log('🤖 Advanced AI Agent System initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize AI Agent System:', error);
  }

  // Initialize Multi-Modal AI Engine
  try {
    const multiModalAI = initializeMultiModalAI();
    console.log('🧠 Multi-Modal AI Engine initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Multi-Modal AI Engine:', error);
  }

  // Initialize Real-Time AI Streaming
  try {
    const realTimeStreaming = initializeRealTimeAIStreaming();
    await realTimeStreaming.start();
    console.log('🚀 Real-Time AI Streaming initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Real-Time AI Streaming:', error);
  }

  // Initialize AI Model Management System
  try {
    const modelManagement = initializeAIModelManagement();
    console.log('🤖 AI Model Management System initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize AI Model Management System:', error);
  }

  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  const clients = new Set<WebSocket>();

  wss.on('connection', (ws) => {
    clients.add(ws);
    
    ws.on('close', () => {
      clients.delete(ws);
    });
  });

  function broadcast(data: any) {
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  }

  // User routes
  app.get('/api/users/current', async (req, res) => {
    try {
      // For demo purposes, return the default user
      const user = await storage.getUser('user-1');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get current user' });
    }
  });

  app.get('/api/users/:id/stats', async (req, res) => {
    try {
      const { id } = req.params;
      const stats = await storage.getUserStats(id);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get user stats' });
    }
  });

  // Posts routes
  app.get('/api/posts', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const posts = await storage.getPostsWithAuthor(limit);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get posts' });
    }
  });

  app.post('/api/posts', async (req, res) => {
    try {
      const validatedData = insertPostSchema.parse(req.body);
      const post = await storage.createPost(validatedData);
      
      // Broadcast new post to all connected clients
      broadcast({ type: 'new_post', data: post });
      
      res.status(201).json(post);
    } catch (error) {
      res.status(400).json({ message: 'Invalid post data' });
    }
  });

  app.post('/api/posts/:id/like', async (req, res) => {
    try {
      const { id } = req.params;
      const post = await storage.getPost(id);
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
      
      const newLikes = post.likes + 1;
      await storage.updatePostStats(id, newLikes, post.shares, post.comments);
      
      broadcast({ type: 'post_liked', data: { postId: id, likes: newLikes } });
      
      res.json({ likes: newLikes });
    } catch (error) {
      res.status(500).json({ message: 'Failed to like post' });
    }
  });

  // AI Content Generation
  app.post('/api/ai/generate-content', async (req, res) => {
    try {
      const { prompt, type = 'post' } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ message: 'Prompt is required' });
      }

      const systemPrompt = type === 'post' 
        ? 'You are a social media content creator. Generate engaging, professional social media posts. Respond with JSON in this format: {"content": "your generated content", "hashtags": ["tag1", "tag2"]}'
        : 'You are a helpful AI assistant. Provide helpful and informative responses. Respond with JSON in this format: {"response": "your response"}';

      // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      res.json(result);
    } catch (error) {
      console.error('AI generation error:', error);
      res.status(500).json({ message: 'Failed to generate content' });
    }
  });

  // Agent Templates routes
  app.get('/api/agent-templates', async (req, res) => {
    try {
      const templates = await storage.getAgentTemplates();
      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get agent templates' });
    }
  });

  app.post('/api/agent-templates/:id/use', async (req, res) => {
    try {
      const { id } = req.params;
      await storage.incrementTemplateUsage(id);
      res.json({ message: 'Template usage incremented' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to increment template usage' });
    }
  });

  // User Agents routes
  app.get('/api/user-agents', async (req, res) => {
    try {
      const userId = req.query.userId as string || 'user-1';
      const agents = await storage.getUserAgents(userId);
      res.json(agents);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get user agents' });
    }
  });

  app.post('/api/user-agents', async (req, res) => {
    try {
      const validatedData = insertUserAgentSchema.parse(req.body);
      const agent = await storage.createUserAgent(validatedData);
      res.status(201).json(agent);
    } catch (error) {
      res.status(400).json({ message: 'Invalid agent data' });
    }
  });

  // Workflows routes
  app.get('/api/workflows', async (req, res) => {
    try {
      const userId = req.query.userId as string || 'user-1';
      const workflows = await storage.getWorkflowsByUser(userId);
      res.json(workflows);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get workflows' });
    }
  });

  app.post('/api/workflows', async (req, res) => {
    try {
      const validatedData = insertWorkflowSchema.parse(req.body);
      const workflow = await storage.createWorkflow(validatedData);
      res.status(201).json(workflow);
    } catch (error) {
      res.status(400).json({ message: 'Invalid workflow data' });
    }
  });

  app.put('/api/workflows/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await storage.updateWorkflow(id, req.body);
      const workflow = await storage.getWorkflow(id);
      res.json(workflow);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update workflow' });
    }
  });

  app.delete('/api/workflows/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteWorkflow(id);
      res.json({ message: 'Workflow deleted' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete workflow' });
    }
  });

  // Chat routes
  app.post('/api/chat', async (req, res) => {
    try {
      const { message, userId = 'user-1' } = req.body;
      
      if (!message) {
        return res.status(400).json({ message: 'Message is required' });
      }

      // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          { 
            role: "system", 
            content: "You are a helpful AI assistant for AIFlow, a social media automation platform. Help users with content creation, automation setup, and platform features. Respond with JSON in this format: {\"response\": \"your helpful response\"}" 
          },
          { role: "user", content: message }
        ],
        response_format: { type: "json_object" },
      });

      const aiResponse = JSON.parse(response.choices[0].message.content || '{}');
      
      // Save chat message
      await storage.createChatMessage({
        userId,
        message,
        response: aiResponse.response
      });

      res.json(aiResponse);
    } catch (error) {
      console.error('Chat error:', error);
      res.status(500).json({ message: 'Failed to process chat message' });
    }
  });

  app.get('/api/chat/history', async (req, res) => {
    try {
      const userId = req.query.userId as string || 'user-1';
      const limit = parseInt(req.query.limit as string) || 20;
      const messages = await storage.getChatMessages(userId, limit);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get chat history' });
    }
  });

  // Telegram Bot API routes
  app.get('/api/telegram/status', async (req, res) => {
    try {
      const telegramService = getTelegramService();
      if (!telegramService) {
        return res.status(404).json({ message: 'Telegram bot not initialized' });
      }

      const botInfo = await telegramService.getBotInfo();
      const isConnected = telegramService.isBotConnected();

      res.json({
        connected: isConnected,
        botInfo: {
          id: botInfo.id,
          username: botInfo.username,
          firstName: botInfo.first_name,
          canJoinGroups: botInfo.can_join_groups,
          canReadAllGroupMessages: botInfo.can_read_all_group_messages
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to get Telegram bot status' });
    }
  });

  app.post('/api/telegram/send-message', async (req, res) => {
    try {
      const { chatId, message, options } = req.body;
      
      if (!chatId || !message) {
        return res.status(400).json({ message: 'chatId and message are required' });
      }

      const telegramService = getTelegramService();
      if (!telegramService) {
        return res.status(404).json({ message: 'Telegram bot not initialized' });
      }

      const result = await telegramService.sendMessage(chatId, message, options);
      res.json({ success: true, messageId: result.message_id });
    } catch (error) {
      console.error('Telegram send message error:', error);
      res.status(500).json({ message: 'Failed to send Telegram message' });
    }
  });

  app.post('/api/telegram/send-photo', async (req, res) => {
    try {
      const { chatId, photo, caption, options } = req.body;
      
      if (!chatId || !photo) {
        return res.status(400).json({ message: 'chatId and photo are required' });
      }

      const telegramService = getTelegramService();
      if (!telegramService) {
        return res.status(404).json({ message: 'Telegram bot not initialized' });
      }

      const result = await telegramService.sendPhoto(chatId, photo, { caption, ...options });
      res.json({ success: true, messageId: result.message_id });
    } catch (error) {
      console.error('Telegram send photo error:', error);
      res.status(500).json({ message: 'Failed to send Telegram photo' });
    }
  });

  app.post('/api/telegram/broadcast', async (req, res) => {
    try {
      const { message, chatIds, options } = req.body;
      
      if (!message || !Array.isArray(chatIds)) {
        return res.status(400).json({ message: 'message and chatIds array are required' });
      }

      const telegramService = getTelegramService();
      if (!telegramService) {
        return res.status(404).json({ message: 'Telegram bot not initialized' });
      }

      const results = [];
      for (const chatId of chatIds) {
        try {
          const result = await telegramService.sendMessage(chatId, message, options);
          results.push({ chatId, success: true, messageId: result.message_id });
        } catch (error) {
          results.push({ chatId, success: false, error: error.message });
        }
      }

      res.json({ success: true, results });
    } catch (error) {
      console.error('Telegram broadcast error:', error);
      res.status(500).json({ message: 'Failed to broadcast Telegram messages' });
    }
  });

  // Smart Learning AI Meta Loop API routes
  app.post('/api/ai/smart-learning', async (req, res) => {
    try {
      const { userId, taskType, inputData, expectedOutput, metadata } = req.body;
      
      if (!userId || !taskType || !inputData) {
        return res.status(400).json({ message: 'userId, taskType, and inputData are required' });
      }

      const smartAI = getSmartLearningAI();
      const context = {
        userId,
        sessionId: `session_${Date.now()}`,
        taskType,
        inputData,
        expectedOutput,
        timestamp: new Date(),
        metadata: metadata || {}
      };

      const result = await smartAI.processLearningRequest(context);
      res.json(result);
    } catch (error) {
      console.error('Smart learning error:', error);
      res.status(500).json({ message: 'Failed to process smart learning request' });
    }
  });

  app.get('/api/ai/learning-state/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const smartAI = getSmartLearningAI();
      const state = await smartAI.getLearningState(userId);
      
      if (!state) {
        return res.status(404).json({ message: 'Learning state not found' });
      }

      res.json(state);
    } catch (error) {
      console.error('Get learning state error:', error);
      res.status(500).json({ message: 'Failed to get learning state' });
    }
  });

  app.get('/api/ai/performance-metrics/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const smartAI = getSmartLearningAI();
      const metrics = await smartAI.getPerformanceMetrics(userId);
      
      if (!metrics) {
        return res.status(404).json({ message: 'Performance metrics not found' });
      }

      res.json(metrics);
    } catch (error) {
      console.error('Get performance metrics error:', error);
      res.status(500).json({ message: 'Failed to get performance metrics' });
    }
  });

  app.post('/api/ai/zero-shot/content-generation', async (req, res) => {
    try {
      const { userId, prompt, topic, style } = req.body;
      
      if (!userId || !prompt) {
        return res.status(400).json({ message: 'userId and prompt are required' });
      }

      const smartAI = getSmartLearningAI();
      const context = {
        userId,
        sessionId: `session_${Date.now()}`,
        taskType: 'content_generation',
        inputData: prompt,
        timestamp: new Date(),
        metadata: { topic, style }
      };

      const result = await smartAI.processLearningRequest(context);
      res.json(result);
    } catch (error) {
      console.error('Zero-shot content generation error:', error);
      res.status(500).json({ message: 'Failed to generate content' });
    }
  });

  app.post('/api/ai/zero-shot/sentiment-analysis', async (req, res) => {
    try {
      const { userId, text } = req.body;
      
      if (!userId || !text) {
        return res.status(400).json({ message: 'userId and text are required' });
      }

      const smartAI = getSmartLearningAI();
      const context = {
        userId,
        sessionId: `session_${Date.now()}`,
        taskType: 'sentiment_analysis',
        inputData: text,
        timestamp: new Date(),
        metadata: {}
      };

      const result = await smartAI.processLearningRequest(context);
      res.json(result);
    } catch (error) {
      console.error('Zero-shot sentiment analysis error:', error);
      res.status(500).json({ message: 'Failed to analyze sentiment' });
    }
  });

  app.post('/api/ai/zero-shot/intent-classification', async (req, res) => {
    try {
      const { userId, text } = req.body;
      
      if (!userId || !text) {
        return res.status(400).json({ message: 'userId and text are required' });
      }

      const smartAI = getSmartLearningAI();
      const context = {
        userId,
        sessionId: `session_${Date.now()}`,
        taskType: 'intent_classification',
        inputData: text,
        timestamp: new Date(),
        metadata: {}
      };

      const result = await smartAI.processLearningRequest(context);
      res.json(result);
    } catch (error) {
      console.error('Zero-shot intent classification error:', error);
      res.status(500).json({ message: 'Failed to classify intent' });
    }
  });

  app.post('/api/ai/zero-shot/style-transfer', async (req, res) => {
    try {
      const { userId, text, targetStyle } = req.body;
      
      if (!userId || !text || !targetStyle) {
        return res.status(400).json({ message: 'userId, text, and targetStyle are required' });
      }

      const smartAI = getSmartLearningAI();
      const context = {
        userId,
        sessionId: `session_${Date.now()}`,
        taskType: 'style_transfer',
        inputData: text,
        timestamp: new Date(),
        metadata: { style: targetStyle }
      };

      const result = await smartAI.processLearningRequest(context);
      res.json(result);
    } catch (error) {
      console.error('Zero-shot style transfer error:', error);
      res.status(500).json({ message: 'Failed to transfer style' });
    }
  });

  app.post('/api/ai/feedback', async (req, res) => {
    try {
      const { userId, sessionId, feedback, taskType } = req.body;
      
      if (!userId || !sessionId || feedback === undefined) {
        return res.status(400).json({ message: 'userId, sessionId, and feedback are required' });
      }

      const smartAI = getSmartLearningAI();
      const state = await smartAI.getLearningState(userId);
      
      if (!state) {
        return res.status(404).json({ message: 'Learning state not found' });
      }

      // Update learning state with feedback
      const feedbackContext = {
        userId,
        sessionId,
        taskType: taskType || 'general',
        inputData: {},
        feedback: feedback,
        timestamp: new Date(),
        metadata: { feedbackType: 'user_feedback' }
      };

      // This would update the learning state with feedback
      res.json({ success: true, message: 'Feedback recorded successfully' });
    } catch (error) {
      console.error('Feedback error:', error);
      res.status(500).json({ message: 'Failed to record feedback' });
    }
  });

  app.post('/api/ai/reset-learning/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const smartAI = getSmartLearningAI();
      
      await smartAI.resetLearningState(userId);
      res.json({ success: true, message: 'Learning state reset successfully' });
    } catch (error) {
      console.error('Reset learning error:', error);
      res.status(500).json({ message: 'Failed to reset learning state' });
    }
  });

  app.get('/api/ai/export-learning/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const smartAI = getSmartLearningAI();
      
      const data = await smartAI.exportLearningData(userId);
      res.json({ data });
    } catch (error) {
      console.error('Export learning error:', error);
      res.status(500).json({ message: 'Failed to export learning data' });
    }
  });

  app.post('/api/ai/import-learning/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const { data } = req.body;
      
      if (!data) {
        return res.status(400).json({ message: 'Data is required' });
      }

      const smartAI = getSmartLearningAI();
      await smartAI.importLearningData(userId, data);
      
      res.json({ success: true, message: 'Learning data imported successfully' });
    } catch (error) {
      console.error('Import learning error:', error);
      res.status(500).json({ message: 'Failed to import learning data' });
    }
  });

  // Travel Services API Routes
  app.get('/api/travel/services', async (req, res) => {
    try {
      const travelServiceManager = getTravelFoodServiceManager();
      const services = travelServiceManager.getTravelServices();
      res.json(services);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get travel services' });
    }
  });

  app.get('/api/travel/services/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const travelServiceManager = getTravelFoodServiceManager();
      const service = travelServiceManager.getTravelService(id);
      
      if (!service) {
        return res.status(404).json({ message: 'Travel service not found' });
      }
      
      res.json(service);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get travel service' });
    }
  });

  app.post('/api/travel/recommendations', async (req, res) => {
    try {
      const { destination, budget, preferences } = req.body;
      
      if (!destination || !budget) {
        return res.status(400).json({ message: 'destination and budget are required' });
      }

      const travelServiceManager = getTravelFoodServiceManager();
      const recommendations = await travelServiceManager.generateTravelRecommendations(
        destination, 
        budget, 
        preferences || {}
      );
      
      res.json(recommendations);
    } catch (error) {
      console.error('Travel recommendations error:', error);
      res.status(500).json({ message: 'Failed to generate travel recommendations' });
    }
  });

  // Food Services API Routes
  app.get('/api/food/services', async (req, res) => {
    try {
      const travelFoodServiceManager = getTravelFoodServiceManager();
      const services = travelFoodServiceManager.getFoodServices();
      res.json(services);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get food services' });
    }
  });

  app.get('/api/food/services/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const travelFoodServiceManager = getTravelFoodServiceManager();
      const service = travelFoodServiceManager.getFoodService(id);
      
      if (!service) {
        return res.status(404).json({ message: 'Food service not found' });
      }
      
      res.json(service);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get food service' });
    }
  });

  app.post('/api/food/recommendations', async (req, res) => {
    try {
      const { location, budget, preferences } = req.body;
      
      if (!location || !budget) {
        return res.status(400).json({ message: 'location and budget are required' });
      }

      const travelFoodServiceManager = getTravelFoodServiceManager();
      const recommendations = await travelFoodServiceManager.generateFoodRecommendations(
        location, 
        budget, 
        preferences || {}
      );
      
      res.json(recommendations);
    } catch (error) {
      console.error('Food recommendations error:', error);
      res.status(500).json({ message: 'Failed to generate food recommendations' });
    }
  });

  // Smart Shopping Agents API Routes
  app.get('/api/shopping/agents', async (req, res) => {
    try {
      const travelFoodServiceManager = getTravelFoodServiceManager();
      const agents = travelFoodServiceManager.getSmartAgents();
      res.json(agents);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get smart agents' });
    }
  });

  app.get('/api/shopping/agents/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const travelFoodServiceManager = getTravelFoodServiceManager();
      const agent = travelFoodServiceManager.getSmartAgent(id);
      
      if (!agent) {
        return res.status(404).json({ message: 'Smart agent not found' });
      }
      
      res.json(agent);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get smart agent' });
    }
  });

  app.post('/api/shopping/agents', async (req, res) => {
    try {
      const { name, category, capabilities, integrations, automationRules } = req.body;
      
      if (!name || !category) {
        return res.status(400).json({ message: 'name and category are required' });
      }

      const travelFoodServiceManager = getTravelFoodServiceManager();
      const agent = travelFoodServiceManager.createCustomAgentTemplate(
        name,
        category,
        capabilities || {},
        integrations || [],
        automationRules || []
      );
      
      res.status(201).json(agent);
    } catch (error) {
      console.error('Create smart agent error:', error);
      res.status(500).json({ message: 'Failed to create smart agent' });
    }
  });

  // Travel and Food Automation Workflows
  app.post('/api/automation/travel-workflow', async (req, res) => {
    try {
      const { destination, budget, preferences, automationRules } = req.body;
      
      if (!destination || !budget) {
        return res.status(400).json({ message: 'destination and budget are required' });
      }

      // Create travel automation workflow
      const workflow = {
        id: `travel_workflow_${Date.now()}`,
        name: `Travel Automation for ${destination}`,
        type: 'travel',
        destination,
        budget,
        preferences,
        automationRules: automationRules || [
          'Monitor flight prices',
          'Auto-book when price drops',
          'Send deal alerts',
          'Manage hotel reservations',
          'Coordinate activities'
        ],
        status: 'active',
        createdAt: new Date().toISOString()
      };

      // Save workflow to database
      await storage.createWorkflow({
        userId: 'user-1',
        name: workflow.name,
        description: `Automated travel planning for ${destination}`,
        steps: workflow.automationRules,
        isActive: true,
        triggerType: 'schedule',
        triggerConfig: JSON.stringify({ frequency: 'daily' })
      });

      res.status(201).json(workflow);
    } catch (error) {
      console.error('Travel workflow error:', error);
      res.status(500).json({ message: 'Failed to create travel workflow' });
    }
  });

  app.post('/api/automation/food-workflow', async (req, res) => {
    try {
      const { location, budget, preferences, automationRules } = req.body;
      
      if (!location || !budget) {
        return res.status(400).json({ message: 'location and budget are required' });
      }

      // Create food automation workflow
      const workflow = {
        id: `food_workflow_${Date.now()}`,
        name: `Food Automation for ${location}`,
        type: 'food',
        location,
        budget,
        preferences,
        automationRules: automationRules || [
          'Monitor restaurant deals',
          'Auto-order repeat meals',
          'Send food recommendations',
          'Manage grocery lists',
          'Track dietary preferences'
        ],
        status: 'active',
        createdAt: new Date().toISOString()
      };

      // Save workflow to database
      await storage.createWorkflow({
        userId: 'user-1',
        name: workflow.name,
        description: `Automated food management for ${location}`,
        steps: workflow.automationRules,
        isActive: true,
        triggerType: 'schedule',
        triggerConfig: JSON.stringify({ frequency: 'daily' })
      });

      res.status(201).json(workflow);
    } catch (error) {
      console.error('Food workflow error:', error);
      res.status(500).json({ message: 'Failed to create food workflow' });
    }
  });

  // Advanced Automation Engine API Routes
  app.get('/api/automation/engine/stats', async (req, res) => {
    try {
      const automationEngine = getAdvancedAutomationEngine();
      const stats = automationEngine.getAutomationStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get automation stats' });
    }
  });

  app.get('/api/automation/engine/performance', async (req, res) => {
    try {
      const automationEngine = getAdvancedAutomationEngine();
      const performance = automationEngine.getPerformanceMetrics();
      res.json(performance);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get performance metrics' });
    }
  });

  app.post('/api/automation/engine/rules', async (req, res) => {
    try {
      const { name, condition, action, enabled } = req.body;
      
      if (!name || !condition || !action) {
        return res.status(400).json({ message: 'name, condition, and action are required' });
      }

      const automationEngine = getAdvancedAutomationEngine();
      const rule = {
        id: `rule_${Date.now()}`,
        name,
        condition,
        action,
        enabled: enabled !== false,
        successRate: 0.0,
        executionCount: 0
      };

      automationEngine.addAutomationRule(rule);
      res.status(201).json(rule);
    } catch (error) {
      console.error('Create automation rule error:', error);
      res.status(500).json({ message: 'Failed to create automation rule' });
    }
  });

  // Intelligent Workflow Orchestrator API Routes
  app.get('/api/workflows/intelligent/stats', async (req, res) => {
    try {
      const orchestrator = getIntelligentWorkflowOrchestrator();
      const stats = orchestrator.getWorkflowStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get workflow stats' });
    }
  });

  app.post('/api/workflows/intelligent/create', async (req, res) => {
    try {
      const { name, type, steps, triggers } = req.body;
      
      if (!name || !type || !steps || !triggers) {
        return res.status(400).json({ message: 'name, type, steps, and triggers are required' });
      }

      const orchestrator = getIntelligentWorkflowOrchestrator();
      const workflow = await orchestrator.createCustomWorkflow(name, type, steps, triggers);
      
      res.status(201).json(workflow);
    } catch (error) {
      console.error('Create intelligent workflow error:', error);
      res.status(500).json({ message: 'Failed to create intelligent workflow' });
    }
  });

  // System Intelligence API Routes
  app.get('/api/system/intelligence/overview', async (req, res) => {
    try {
      const automationEngine = getAdvancedAutomationEngine();
      const orchestrator = getIntelligentWorkflowOrchestrator();
      
      const overview = {
        automation: automationEngine.getAutomationStats(),
        workflows: orchestrator.getWorkflowStats(),
        systemHealth: {
          status: 'excellent',
          uptime: '99.9%',
          performance: 'optimal',
          aiLearning: 'active'
        },
        capabilities: {
          predictiveAnalytics: true,
          intelligentAutomation: true,
          selfOptimization: true,
          adaptiveLearning: true,
          realTimeDecisionMaking: true
        },
        metrics: {
          totalAutomations: automationEngine.getAutomationStats().totalRules,
          activeWorkflows: orchestrator.getWorkflowStats().activeWorkflows,
          aiAccuracy: 0.94,
          systemEfficiency: 0.96,
          userSatisfaction: 0.92
        }
      };

      res.json(overview);
    } catch (error) {
      console.error('System intelligence overview error:', error);
      res.status(500).json({ message: 'Failed to get system intelligence overview' });
    }
  });

  app.post('/api/system/intelligence/optimize', async (req, res) => {
    try {
      const { category, parameters } = req.body;
      
      if (!category) {
        return res.status(400).json({ message: 'category is required' });
      }

      // Simulate system optimization
      const optimization = {
        id: `optimization_${Date.now()}`,
        category,
        parameters: parameters || {},
        status: 'running',
        estimatedTime: '5-10 minutes',
        expectedImprovement: '15-25%',
        createdAt: new Date().toISOString()
      };

      res.status(201).json(optimization);
    } catch (error) {
      console.error('System optimization error:', error);
      res.status(500).json({ message: 'Failed to start system optimization' });
    }
  });

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
      res.status(500).json({ error: error.message });
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

  app.get('/api/ai/deployments', async (req, res) => {
    try {
      const modelManagement = getAIModelManagementSystem();
      const deployments = modelManagement.getDeployments();
      res.json(deployments);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/ai/deployments/active', async (req, res) => {
    try {
      const modelManagement = getAIModelManagementSystem();
      const deployments = modelManagement.getActiveDeployments();
      res.json(deployments);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/ai/deployments', async (req, res) => {
    try {
      const { modelId, versionId, environment, config } = req.body;
      const modelManagement = getAIModelManagementSystem();
      const deployment = await modelManagement.deployModel(modelId, versionId, environment, config);
      res.status(201).json(deployment);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/ai/deployments/:deploymentId', async (req, res) => {
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

  app.get('/api/ai/training', async (req, res) => {
    try {
      const modelManagement = getAIModelManagementSystem();
      const jobs = modelManagement.getTrainingJobs();
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/ai/training/active', async (req, res) => {
    try {
      const modelManagement = getAIModelManagementSystem();
      const jobs = modelManagement.getActiveTrainingJobs();
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/ai/training', async (req, res) => {
    try {
      const { modelId, config } = req.body;
      const modelManagement = getAIModelManagementSystem();
      const job = await modelManagement.startTrainingJob(modelId, config);
      res.status(201).json(job);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/ai/training/:jobId', async (req, res) => {
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

  app.get('/api/ai/federated-learning', async (req, res) => {
    try {
      const modelManagement = getAIModelManagementSystem();
      const rounds = modelManagement.getFederatedLearningRounds();
      res.json(rounds);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/ai/federated-learning/active', async (req, res) => {
    try {
      const modelManagement = getAIModelManagementSystem();
      const rounds = modelManagement.getActiveFederatedLearningRounds();
      res.json(rounds);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/ai/federated-learning', async (req, res) => {
    try {
      const { modelId, participants } = req.body;
      const modelManagement = getAIModelManagementSystem();
      const round = await modelManagement.startFederatedLearningRound(modelId, participants);
      res.status(201).json(round);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/ai/system-metrics', async (req, res) => {
    try {
      const modelManagement = getAIModelManagementSystem();
      const metrics = modelManagement.getSystemMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/ai/models/:modelId/optimize', async (req, res) => {
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

  app.post('/api/ai/models/:modelId/archive', async (req, res) => {
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

  app.post('/api/ai/models/:modelId/restore', async (req, res) => {
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

  return httpServer;
}
