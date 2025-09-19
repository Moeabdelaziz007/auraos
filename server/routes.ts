import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { generateContent, generatePostContent, chatWithAssistant, analyzeWorkflow } from "./gemini.js";
import { storage } from "./storage";
import { insertPostSchema, insertWorkflowSchema, insertUserAgentSchema, insertChatMessageSchema } from "@shared/schema";
import { initializeTelegramBot, getTelegramService } from "./telegram.js";
import { getTravelFoodServiceManager } from "./travel-food-services.js";
import { getSmartLearningAI } from "./smart-learning-ai.js";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Initialize Telegram Bot
  const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
  if (telegramToken) {
    try {
      initializeTelegramBot(telegramToken);
      console.log('🤖 Telegram bot initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Telegram bot:', error);
    }
  } else {
    console.warn('⚠️ TELEGRAM_BOT_TOKEN not found in environment variables');
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

  return httpServer;
}
