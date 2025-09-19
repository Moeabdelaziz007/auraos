import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { generateContent, generatePostContent, chatWithAssistant, analyzeWorkflow } from "./gemini.js";
import { storage } from "./storage";
import { insertPostSchema, insertWorkflowSchema, insertUserAgentSchema, insertChatMessageSchema } from "@shared/schema";
import { initializeTelegramBot, getTelegramService } from "./telegram.js";

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

  return httpServer;
}
