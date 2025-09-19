import TelegramBot from 'node-telegram-bot-api';
import { storage } from './storage.js';

export class TelegramService {
  private bot: TelegramBot;
  private isConnected: boolean = false;

  constructor(token: string) {
    this.bot = new TelegramBot(token, { polling: true });
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    // Handle incoming messages
    this.bot.on('message', async (msg) => {
      try {
        await this.handleMessage(msg);
      } catch (error) {
        console.error('Error handling message:', error);
      }
    });

    // Handle callback queries (inline keyboard buttons)
    this.bot.on('callback_query', async (callbackQuery) => {
      try {
        await this.handleCallbackQuery(callbackQuery);
      } catch (error) {
        console.error('Error handling callback query:', error);
      }
    });

    // Handle polling errors
    this.bot.on('polling_error', (error) => {
      console.error('Telegram polling error:', error);
    });

    // Handle connection status
    this.bot.on('webhook_error', (error) => {
      console.error('Telegram webhook error:', error);
    });

    this.isConnected = true;
    console.log('🤖 Telegram bot connected and listening for messages');
  }

  private async handleMessage(msg: TelegramBot.Message) {
    const chatId = msg.chat.id;
    const text = msg.text;
    const username = msg.from?.username || msg.from?.first_name || 'Unknown';

    console.log(`📨 Received message from ${username}: ${text}`);

    // Save message to database
    await storage.createChatMessage({
      userId: 'telegram-user',
      message: `[Telegram] ${username}: ${text}`,
      response: 'Message received by AuraOS'
    });

    // Handle different types of messages
    if (text?.startsWith('/start')) {
      await this.sendWelcomeMessage(chatId, username);
    } else if (text?.startsWith('/help')) {
      await this.sendHelpMessage(chatId);
    } else if (text?.startsWith('/status')) {
      await this.sendStatusMessage(chatId);
    } else if (text?.startsWith('/posts')) {
      await this.sendRecentPosts(chatId);
    } else if (text?.startsWith('/agents')) {
      await this.sendAgentTemplates(chatId);
    } else {
      await this.sendDefaultResponse(chatId, text);
    }
  }

  private async handleCallbackQuery(callbackQuery: TelegramBot.CallbackQuery) {
    const chatId = callbackQuery.message?.chat.id;
    const data = callbackQuery.data;

    if (!chatId) return;

    // Answer the callback query to remove loading state
    await this.bot.answerCallbackQuery(callbackQuery.id);

    switch (data) {
      case 'get_posts':
        await this.sendRecentPosts(chatId);
        break;
      case 'get_agents':
        await this.sendAgentTemplates(chatId);
        break;
      case 'get_status':
        await this.sendStatusMessage(chatId);
        break;
      case 'create_post':
        await this.bot.sendMessage(chatId, '📝 To create a post, send your content with the format:\n\n`/create Your post content here`');
        break;
      default:
        await this.bot.sendMessage(chatId, '❓ Unknown command. Use /help to see available commands.');
    }
  }

  private async sendWelcomeMessage(chatId: number, username: string) {
    const welcomeText = `🎉 Welcome to AuraOS, ${username}!

I'm your AI-powered social media automation assistant. I can help you:

🤖 Manage AI agents and workflows
📊 View analytics and statistics  
📝 Create and schedule posts
🔄 Monitor automation status
💬 Chat with AI assistant

Use /help to see all available commands or click the buttons below:`;

    const keyboard = {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '📊 Dashboard Status', callback_data: 'get_status' },
            { text: '📝 Recent Posts', callback_data: 'get_posts' }
          ],
          [
            { text: '🤖 AI Agents', callback_data: 'get_agents' },
            { text: '📝 Create Post', callback_data: 'create_post' }
          ],
          [
            { text: '❓ Help', callback_data: 'help' }
          ]
        ]
      }
    };

    await this.bot.sendMessage(chatId, welcomeText, keyboard);
  }

  private async sendHelpMessage(chatId: number) {
    const helpText = `🆘 AuraOS Telegram Bot Commands:

/start - Welcome message and main menu
/help - Show this help message
/status - Get platform status and statistics
/posts - View recent posts
/agents - List available AI agent templates
/create <content> - Create a new post
/schedule <time> <content> - Schedule a post

📱 You can also use the inline buttons for quick actions!

💡 Pro tip: Send any message and I'll help you with AI-powered content suggestions.`;

    await this.bot.sendMessage(chatId, helpText);
  }

  private async sendStatusMessage(chatId: number) {
    try {
      const stats = await storage.getUserStats('user-1');
      const posts = await storage.getPostsWithAuthor(5);
      const agents = await storage.getUserAgents('user-1');

      const statusText = `📊 AuraOS Platform Status:

📝 Total Posts: ${stats.totalPosts}
🤖 Active Agents: ${stats.activeAgents}
📈 Engagement Rate: ${stats.engagementRate}%
🔄 Automations Run: ${stats.automationsRun}

📱 Recent Activity:
${posts.slice(0, 3).map(post => 
  `• ${post.content.substring(0, 50)}... (${post.likes} likes)`
).join('\n')}

🤖 Active Agents: ${agents.filter(a => a.isActive).length}`;

      await this.bot.sendMessage(chatId, statusText);
    } catch (error) {
      await this.bot.sendMessage(chatId, '❌ Error retrieving status. Please try again later.');
    }
  }

  private async sendRecentPosts(chatId: number) {
    try {
      const posts = await storage.getPostsWithAuthor(5);
      
      if (posts.length === 0) {
        await this.bot.sendMessage(chatId, '📝 No posts found. Create your first post!');
        return;
      }

      let postsText = '📝 Recent Posts:\n\n';
      posts.forEach((post, index) => {
        postsText += `${index + 1}. ${post.content.substring(0, 100)}${post.content.length > 100 ? '...' : ''}\n`;
        postsText += `   👍 ${post.likes} | 🔄 ${post.shares} | 💬 ${post.comments}\n\n`;
      });

      await this.bot.sendMessage(chatId, postsText);
    } catch (error) {
      await this.bot.sendMessage(chatId, '❌ Error retrieving posts. Please try again later.');
    }
  }

  private async sendAgentTemplates(chatId: number) {
    try {
      const templates = await storage.getAgentTemplates();
      
      let agentsText = '🤖 Available AI Agent Templates:\n\n';
      templates.forEach((template, index) => {
        agentsText += `${index + 1}. ${template.name}\n`;
        agentsText += `   📝 ${template.description}\n`;
        agentsText += `   🏷️ Category: ${template.category}\n`;
        agentsText += `   📊 Used ${template.usageCount} times\n\n`;
      });

      await this.bot.sendMessage(chatId, agentsText);
    } catch (error) {
      await this.bot.sendMessage(chatId, '❌ Error retrieving agent templates. Please try again later.');
    }
  }

  private async sendDefaultResponse(chatId: number, text?: string) {
    if (!text) return;

    // Check if it's a create post command
    if (text.startsWith('/create ')) {
      const content = text.substring(8);
      await this.createPostFromTelegram(chatId, content);
      return;
    }

    // Check if it's a schedule post command
    if (text.startsWith('/schedule ')) {
      const parts = text.substring(10).split(' ', 2);
      if (parts.length >= 2) {
        await this.schedulePostFromTelegram(chatId, parts[0], parts[1]);
        return;
      }
    }

    // Default AI response
    const aiResponse = await this.generateAIResponse(text);
    await this.bot.sendMessage(chatId, `🤖 AI Response:\n\n${aiResponse}`);
  }

  private async createPostFromTelegram(chatId: number, content: string) {
    try {
      const post = await storage.createPost({
        authorId: 'user-1',
        content: content,
        isAiGenerated: false
      });

      await this.bot.sendMessage(chatId, `✅ Post created successfully!\n\n📝 Content: ${content}\n🆔 Post ID: ${post.id}`);
    } catch (error) {
      await this.bot.sendMessage(chatId, '❌ Error creating post. Please try again.');
    }
  }

  private async schedulePostFromTelegram(chatId: number, time: string, content: string) {
    // This would integrate with a scheduling system
    await this.bot.sendMessage(chatId, `⏰ Post scheduled for ${time}:\n\n📝 Content: ${content}\n\nNote: Scheduling feature coming soon!`);
  }

  private async generateAIResponse(text: string): Promise<string> {
    try {
      // This would integrate with your AI service
      return `I understand you said: "${text}". This is a placeholder response. The AI integration will provide more intelligent responses based on your message.`;
    } catch (error) {
      return 'Sorry, I encountered an error processing your message. Please try again.';
    }
  }

  // Public methods for external use
  async sendMessage(chatId: number, text: string, options?: TelegramBot.SendMessageOptions) {
    return await this.bot.sendMessage(chatId, text, options);
  }

  async sendPhoto(chatId: number, photo: string, options?: TelegramBot.SendPhotoOptions) {
    return await this.bot.sendPhoto(chatId, photo, options);
  }

  async getBotInfo() {
    return await this.bot.getMe();
  }

  async stopPolling() {
    await this.bot.stopPolling();
    this.isConnected = false;
    console.log('🤖 Telegram bot polling stopped');
  }

  isBotConnected(): boolean {
    return this.isConnected;
  }
}

// Export singleton instance
let telegramService: TelegramService | null = null;

export function initializeTelegramBot(token: string): TelegramService {
  if (!telegramService) {
    telegramService = new TelegramService(token);
  }
  return telegramService;
}

export function getTelegramService(): TelegramService | null {
  return telegramService;
}
