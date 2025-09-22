import TelegramBot from 'node-telegram-bot-api';
import { storage } from './storage.js';
import { workflowExecutor } from './workflow-executor.js';
import type { WorkflowNode } from "../shared/schema.js";
import { getSmartMenuService } from './smart-menu.js';
import { getEnhancedChatPersona } from './enhanced-persona.js';
import { chatWithAssistant } from './gemini.js';

/**
 * Service for interacting with the Telegram Bot API.
 * Handles incoming messages, commands, and callbacks.
 */
export class TelegramService {
  private bot: TelegramBot;
  private isConnected: boolean = false;
  private enhancedPersona = getEnhancedChatPersona();
  private smartMenuService = getSmartMenuService();

  /**
   * Creates an instance of TelegramService.
   * @param {string} token The Telegram bot token.
   */
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

    // Track command usage for smart suggestions
    if (text?.startsWith('/')) {
      this.smartMenuService.trackCommandUsage(chatId, text.split(' ')[0]);
    }

    // Save message to database
    await storage.createChatMessage({
      userId: 'telegram-user',
      message: `[Telegram] ${username}: ${text}`,
      response: 'Message received by AuraOS'
    });

    // Trigger workflows based on the new message
    try {
      const workflows = await storage.getActiveWorkflowsByTrigger('telegram-message-trigger');
      console.log(`Found ${workflows.length} active workflows with Telegram triggers.`);
      for (const workflow of workflows) {
        console.log(`Triggering workflow ${workflow.id} for new message.`);
        // We don't wait for the execution to finish
        workflowExecutor.execute(workflow.id, { message: msg });
      }
    } catch (error) {
      console.error("Error triggering workflows:", error);
    }

    // Handle different types of messages with smart menu integration
    if (text?.startsWith('/start')) {
      await this.sendSmartWelcomeMessage(chatId, username);
    } else if (text?.startsWith('/help')) {
      await this.sendSmartHelpMessage(chatId);
    } else if (text?.startsWith('/menu')) {
      await this.sendSmartMenu(chatId, username);
    } else if (text?.startsWith('/status')) {
      await this.sendStatusMessage(chatId);
    } else if (text?.startsWith('/posts')) {
      await this.sendRecentPosts(chatId);
    } else if (text?.startsWith('/agents')) {
      await this.sendAgentTemplates(chatId);
    } else {
      await this.sendDefaultResponse(chatId, text, username);
    }
  }

  private async handleCallbackQuery(callbackQuery: TelegramBot.CallbackQuery) {
    const chatId = callbackQuery.message?.chat.id;
    const data = callbackQuery.data;
   re CLI free const from = callbackQuery.from;

    if (!chatId) return;

    // Answer the callback query to remove loading state
    await this.bot.answerCallbackQuery(callbackQuery.id);

    // Handle smart menu callbacks
    if (data.endsWith('_menu')) {
      await this.handleSmartMenuCallback(chatId, data);
      return;
    }

    // Handle legacy callbacks
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
      case 'main_menu':
        const username = from.username || from.first_name || 'User';
        await this.sendSmartMenu(chatId, username);
        break;
      default:
        await this.handleSmartMenuCallback(chatId, data);
    }
  }

  // Handle smart menu callbacks
  private async handleSmartMenuCallback(chatId: number, callbackData: string) {
    const username = this.smartMenuService.getUserContext(chatId)?.username || 'User';
    
    switch (callbackData) {
      case 'posts_menu':
        const postsMenu = await this.smartMenuService.generateSmartMenu(chatId, username, 'posts');
        await this.bot.sendMessage(chatId, postsMenu.text, postsMenu.keyboard);
        break;
      case 'agents_menu':
        const agentsMenu = await this.smartMenuService.generateSmartMenu(chatId, username, 'agents');
        await this.bot.sendMessage(chatId, agentsMenu.text, agentsMenu.keyboard);
        break;
      case 'analytics_menu':
        const analyticsMenu = await this.smartMenuService.generateSmartMenu(chatId, username, 'analytics');
        await this.bot.sendMessage(chatId, analyticsMenu.text, analyticsMenu.keyboard);
        break;
      case 'settings_menu':
        const settingsMenu = await this.smartMenuService.generateSmartMenu(chatId, username, 'settings');
        await this.bot.sendMessage(chatId, settingsMenu.text, settingsMenu.keyboard);
        break;
      case 'quick_actions_menu':
        const quickActionsMenu = await this.smartMenuService.generateSmartMenu(chatId, username, 'quick_actions');
        await this.bot.sendMessage(chatId, quickActionsMenu.text, quickActionsMenu.keyboard);
        break;
      case 'help_menu':
        await this.sendSmartHelpMessage(chatId);
        break;
      case 'create_post':
        await this.bot.sendMessage(chatId, '📝 To create a post, send your content with the format:\n\n`/create Your post content here`');
        break;
      case 'schedule_post':
        await this.bot.sendMessage(chatId, '📅 To schedule a post, use:\n\n`/schedule YYYY-MM-DD HH:MM Your post content here`');
        break;
      case 'view_all_posts':
        await this.sendRecentPosts(chatId);
        break;
      case 'ai_generator':
        await this.bot.sendMessage(chatId, '🤖 AI Content Generator\n\nSend me a topic or idea, and I\'ll help you create engaging content!');
        break;
      case 'post_analytics':
        await this.sendStatusMessage(chatId);
        break;
      case 'create_agent':
        await this.bot.sendMessage(chatId, '🆕 Create AI Agent\n\nUse `/agents` to see available templates, or describe what you need!');
        break;
      case 'browse_templates':
        await this.sendAgentTemplates(chatId);
        break;
      case 'active_agents':
        await this.bot.sendMessage(chatId, '⚡ Active Agents\n\nChecking your active AI agents...');
        break;
      case 'agent_performance':
        await this.bot.sendMessage(chatId, '📊 Agent Performance\n\nAnalyzing your AI agents\' performance...');
        break;
      case 'performance_overview':
        await this.sendStatusMessage(chatId);
        break;
      case 'engagement_insights':
        await this.bot.sendMessage(chatId, '🎯 Engagement Insights\n\nAnalyzing your content engagement...');
        break;
      case 'quick_post':
        await this.bot.sendMessage(chatId, '📝 Quick Post\n\nSend your content and I\'ll help you optimize it!');
        break;
      case 'quick_agent':
        await this.bot.sendMessage(chatId, '🤖 Quick Agent\n\nTell me what you need automated!');
        break;
      case 'quick_stats':
        await this.sendStatusMessage(chatId);
        break;
      case 'run_automation':
        await this.bot.sendMessage(chatId, '🔄 Run Automation\n\nStarting your automation workflows...');
        break;
      case 'ai_chat':
        await this.bot.sendMessage(chatId, '💬 AI Chat\n\nI\'m here to help! What would you like to know?');
        break;
      // Travel service callbacks
      case 'travel_menu':
        const travelMenu = await this.smartMenuService.generateSmartMenu(chatId, username, 'travel');
        await this.bot.sendMessage(chatId, travelMenu.text, travelMenu.keyboard);
        break;
      case 'flight_booking':
        await this.bot.sendMessage(chatId, '✈️ Flight Booking\n\nI can help you find the best flight deals! Tell me your destination and travel dates.');
        break;
      case 'hotel_booking':
        await this.bot.sendMessage(chatId, '🏨 Hotel Booking\n\nI\'ll find the perfect hotel for you! What city are you visiting?');
        break;
      case 'car_rental':
        await this.bot.sendMessage(chatId, '🚗 Car Rental\n\nI can help you find the best car rental deals! Where do you need a car?');
        break;
      case 'travel_packages':
        await this.bot.sendMessage(chatId, '📦 Travel Packages\n\nI\'ll create a complete travel package for you! What\'s your dream destination?');
        break;
      case 'travel_activities':
        await this.bot.sendMessage(chatId, '🎯 Travel Activities\n\nI can recommend amazing activities! What type of experiences are you looking for?');
        break;
      case 'travel_agents':
        await this.bot.sendMessage(chatId, '🤖 Travel Agents\n\nHere are your AI travel agents:\n• Flight Booking Agent\n• Hotel Booking Agent\n• Car Rental Agent\n• Travel Package Agent\n• Activity Booking Agent');
        break;
      // Food service callbacks
      case 'food_menu':
        const foodMenu = await this.smartMenuService.generateSmartMenu(chatId, username, 'food');
        await this.bot.sendMessage(chatId, foodMenu.text, foodMenu.keyboard);
        break;
      case 'restaurant_discovery':
        await this.bot.sendMessage(chatId, '🍴 Restaurant Discovery\n\nI\'ll find the perfect restaurant for you! What cuisine do you prefer?');
        break;
      case 'food_delivery':
        await this.bot.sendMessage(chatId, '🚚 Food Delivery\n\nI can help you order food! What are you craving today?');
        break;
      case 'grocery_shopping':
        await this.bot.sendMessage(chatId, '🛒 Grocery Shopping\n\nI\'ll help you with your grocery shopping! What do you need to buy?');
        break;
      case 'meal_planning':
        await this.bot.sendMessage(chatId, '📋 Meal Planning\n\nI can create a meal plan for you! What are your dietary preferences?');
        break;
      case 'catering_services':
        await this.bot.sendMessage(chatId, '🎉 Catering Services\n\nI can help coordinate catering for your event! What type of event are you planning?');
        break;
      case 'food_agents':
        await this.bot.sendMessage(chatId, '🤖 Food Agents\n\nHere are your AI food agents:\n• Restaurant Discovery Agent\n• Food Delivery Agent\n• Grocery Shopping Agent\n• Meal Planning Agent\n• Catering Service Agent');
        break;
      // Shopping service callbacks
      case 'shopping_menu':
        const shoppingMenu = await this.smartMenuService.generateSmartMenu(chatId, username, 'shopping');
        await this.bot.sendMessage(chatId, shoppingMenu.text, shoppingMenu.keyboard);
        break;
      case 'price_comparison':
        await this.bot.sendMessage(chatId, '🔍 Price Comparison\n\nI can compare prices across multiple platforms! What are you looking to buy?');
        break;
      case 'deal_detection':
        await this.bot.sendMessage(chatId, '💰 Deal Detection\n\nI\'ll monitor deals for you! What products are you interested in?');
        break;
      case 'auto_purchase':
        await this.bot.sendMessage(chatId, '🤖 Auto-Purchase\n\nI can automatically purchase items when criteria are met! What should I watch for?');
        break;
      case 'wishlist_manager':
        await this.bot.sendMessage(chatId, '📋 Wishlist Manager\n\nI\'ll help you manage your wishlist! What would you like to add?');
        break;
      case 'budget_tracker':
        await this.bot.sendMessage(chatId, '📊 Budget Tracker\n\nI can help you track your shopping budget! What\'s your monthly budget?');
        break;
      case 'shopping_agents':
        await this.bot.sendMessage(chatId, '🤖 Shopping Agents\n\nHere are your AI shopping agents:\n• Travel Shopping Agent\n• Food Shopping Agent\n• Universal Shopping Agent');
        break;
      default:
        await this.bot.sendMessage(chatId, '❓ Unknown command. Use /menu to see available options.');
    }
  }

  // Smart welcome message using the smart menu system
  private async sendSmartWelcomeMessage(chatId: number, username: string) {
    const menu = await this.smartMenuService.generateSmartMenu(chatId, username, 'main');
    await this.bot.sendMessage(chatId, menu.text, menu.keyboard);
  }

  // Smart help message
  private async sendSmartHelpMessage(chatId: number) {
    const helpText = `🆘 AuraOS Smart Assistant Help

🎯 **Smart Commands:**
/start - Welcome message with smart menu
/menu - Access main smart menu
/help - Show this help message

📱 **Core Commands:**
/status - Get platform status and statistics
/posts - View recent posts
/agents - List available AI agent templates
/create <content> - Create a new post
/schedule <time> <content> - Schedule a post

🤖 **Smart Features:**
• Context-aware menus
• Personalized suggestions
• Quick actions for power users
• Intelligent command tracking
• Adaptive interface

💡 **Pro Tips:**
• Use /menu to access smart navigation
• The bot learns your preferences over time
• Quick actions appear after 10+ interactions
• All menus adapt to your usage patterns

🎯 Try /menu to see your personalized smart menu!`;

    await this.bot.sendMessage(chatId, helpText);
  }

  // Send smart menu
  private async sendSmartMenu(chatId: number, username: string) {
    const menu = await this.smartMenuService.generateSmartMenu(chatId, username, 'main');
    await this.bot.sendMessage(chatId, menu.text, menu.keyboard);
  }

  // Legacy welcome message (kept for compatibility)
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

  private async sendDefaultResponse(chatId: number, text?: string, username: string = 'User') {
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

    // Enhanced AI response with persona
    try {
      const intelligentResponse = await this.enhancedPersona.generateIntelligentResponse(text, chatId, username);
      
      // Send main response
      await this.bot.sendMessage(chatId, intelligentResponse.response);
      
      // Send suggestions if available
      if (intelligentResponse.suggestions.length > 0) {
        const suggestionsText = `💡 **Quick Actions:**\n${intelligentResponse.suggestions.map(s => `• ${s}`).join('\n')}`;
        await this.bot.sendMessage(chatId, suggestionsText);
      }
      
      // Add smart menu option for easy navigation
      const menuKeyboard = {
        reply_markup: {
          inline_keyboard: [
            [
              { text: '🎯 Smart Menu', callback_data: 'main_menu' },
              { text: '💬 Continue Chat', callback_data: 'continue_chat' }
            ]
          ]
        }
      };
      
      await this.bot.sendMessage(chatId, '🎯 Need more help? Use the smart menu for quick navigation!', menuKeyboard);
      
    } catch (error) {
      console.error('Enhanced persona error:', error);
      // Fallback to basic AI response
      const aiResponse = await this.generateAIResponse(text);
      await this.bot.sendMessage(chatId, `🤖 AI Response:\n\n${aiResponse}`);
    }
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
      const messages = [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: text }
      ];
      return await chatWithAssistant(messages);
    } catch (error) {
      console.error('Fallback AI response error:', error);
      return 'Sorry, I encountered an error processing your message. Please try again.';
    }
  }

  // Public methods for external use
  /**
   * Sends a text message to a chat.
   * @param {number} chatId The ID of the chat to send the message to.
   * @param {string} text The text of the message to send.
   * @param {TelegramBot.SendMessageOptions} [options] Additional Telegram options.
   * @returns {Promise<TelegramBot.Message>}
   */
  async sendMessage(chatId: number, text: string, options?: TelegramBot.SendMessageOptions) {
    return await this.bot.sendMessage(chatId, text, options);
  }

  /**
   * Sends a photo to a chat.
   * @param {number} chatId The ID of the chat to send the photo to.
   * @param {string} photo The file path or URL of the photo to send.
   * @param {TelegramBot.SendPhotoOptions} [options] Additional Telegram options.
   * @returns {Promise<TelegramBot.Message>}
   */
  async sendPhoto(chatId: number, photo: string, options?: TelegramBot.SendPhotoOptions) {
    return await this.bot.sendPhoto(chatId, photo, options);
  }

  /**
   * Gets information about the bot.
   * @returns {Promise<TelegramBot.User>}
   */
  async getBotInfo() {
    return await this.bot.getMe();
  }

  /**
   * Stops the bot from polling for updates.
   * @returns {Promise<void>}
   */
  async stopPolling() {
    await this.bot.stopPolling();
    this.isConnected = false;
    console.log('🤖 Telegram bot polling stopped');
  }

  /**
   * Checks if the bot is connected.
   * @returns {boolean} True if the bot is connected, false otherwise.
   */
  isBotConnected(): boolean {
    return this.isConnected;
  }
}

// Export singleton instance
let telegramService: TelegramService | null = null;

/**
 * Initializes the Telegram bot service.
 * @param {string} token The Telegram bot token.
 * @returns {TelegramService} The singleton instance of the Telegram service.
 */
export function initializeTelegramBot(token: string): TelegramService {
  if (!telegramService) {
    telegramService = new TelegramService(token);
  }
  return telegramService;
}

/**
 * Gets the singleton instance of the Telegram service.
 * @returns {TelegramService | null} The singleton instance of the Telegram service, or null if it has not been initialized.
 */
export function getTelegramService(): TelegramService | null {
  return telegramService;
}
