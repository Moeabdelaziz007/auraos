import TelegramBot from 'node-telegram-bot-api';
import { storage } from './storage.js';

interface UserContext {
  chatId: number;
  username: string;
  lastActivity: Date;
  preferences: {
    language: string;
    timezone: string;
    notifications: boolean;
  };
  session: {
    currentMenu: string;
    lastCommand: string;
    contextData: any;
  };
  stats: {
    totalInteractions: number;
    favoriteCommands: string[];
    lastPostTime?: Date;
  };
}

interface SmartMenuOption {
  text: string;
  callback_data: string;
  icon: string;
  description?: string;
  priority: number;
  context?: string[];
}

/**
 * Manages a smart menu system for a Telegram bot.
 */
export class SmartMenuService {
  private userContexts: Map<number, UserContext> = new Map();

  /**
   * Creates an instance of SmartMenuService.
   */
  constructor() {
    // Initialize with default contexts
  }

  // Get or create user context
  private getUserContext(chatId: number, username: string): UserContext {
    if (!this.userContexts.has(chatId)) {
      this.userContexts.set(chatId, {
        chatId,
        username,
        lastActivity: new Date(),
        preferences: {
          language: 'en',
          timezone: 'UTC',
          notifications: true
        },
        session: {
          currentMenu: 'main',
          lastCommand: '',
          contextData: {}
        },
        stats: {
          totalInteractions: 0,
          favoriteCommands: []
        }
      });
    }
    return this.userContexts.get(chatId)!;
  }

  // Update user context
  private updateUserContext(chatId: number, updates: Partial<UserContext>) {
    const context = this.getUserContext(chatId, '');
    Object.assign(context, updates);
    context.lastActivity = new Date();
    context.stats.totalInteractions++;
  }

  /**
   * Generates a smart menu based on the user's context.
   * @param {number} chatId The ID of the chat.
   * @param {string} username The username of the user.
   * @param {string} [menuType='main'] The type of menu to generate.
   * @returns {Promise<{ text: string; keyboard: any; }>} A promise that resolves with the menu text and keyboard.
   */
  async generateSmartMenu(chatId: number, username: string, menuType: string = 'main'): Promise<{
    text: string;
    keyboard: any;
  }> {
    const context = this.getUserContext(chatId, username);
    this.updateUserContext(chatId, { session: { ...context.session, currentMenu: menuType } });

    switch (menuType) {
      case 'main':
        return await this.generateMainMenu(context);
      case 'posts':
        return await this.generatePostsMenu(context);
      case 'agents':
        return await this.generateAgentsMenu(context);
      case 'analytics':
        return await this.generateAnalyticsMenu(context);
      case 'settings':
        return await this.generateSettingsMenu(context);
      case 'quick_actions':
        return await this.generateQuickActionsMenu(context);
      case 'travel':
        return await this.generateTravelMenu(context);
      case 'food':
        return await this.generateFoodMenu(context);
      case 'shopping':
        return await this.generateShoppingMenu(context);
      default:
        return await this.generateMainMenu(context);
    }
  }

  // Main smart menu with context-aware options
  private async generateMainMenu(context: UserContext): Promise<{ text: string; keyboard: any }> {
    const timeOfDay = this.getTimeOfDay();
    const greeting = this.getGreeting(timeOfDay);
    
    // Get user stats for personalized experience
    const userStats = await storage.getUserStats('user-1').catch(() => ({
      totalPosts: 0,
      activeAgents: 0,
      engagementRate: 0,
      automationsRun: 0
    }));

    const text = `${greeting} ${context.username}! 👋

🤖 Welcome to AuraOS Smart Assistant

📊 Your Dashboard:
• Posts: ${userStats.totalPosts}
• Active Agents: ${userStats.activeAgents}
• Engagement: ${userStats.engagementRate}%

🎯 What would you like to do today?`;

    // Generate context-aware menu options
    const menuOptions = await this.getContextualMenuOptions(context);

    const keyboard = {
      reply_markup: {
        inline_keyboard: this.organizeMenuOptions(menuOptions)
      }
    };

    return { text, keyboard };
  }

  // Posts management menu
  private async generatePostsMenu(context: UserContext): Promise<{ text: string; keyboard: any }> {
    const recentPosts = await storage.getPostsWithAuthor(3).catch(() => []);
    
    const text = `📝 Content Management Center

📊 Recent Activity:
${recentPosts.length > 0 ? 
  recentPosts.map((post, i) => 
    `${i + 1}. ${post.content.substring(0, 30)}... (${post.likes} 👍)`
  ).join('\n') : 
  'No posts yet. Create your first one!'
}

🎯 Choose an action:`;

    const menuOptions: SmartMenuOption[] = [
      { text: '✍️ Create New Post', callback_data: 'create_post', icon: '✍️', priority: 1 },
      { text: '📅 Schedule Post', callback_data: 'schedule_post', icon: '📅', priority: 2 },
      { text: '📊 View All Posts', callback_data: 'view_all_posts', icon: '📊', priority: 3 },
      { text: '🤖 AI Content Generator', callback_data: 'ai_generator', icon: '🤖', priority: 4 },
      { text: '📈 Post Analytics', callback_data: 'post_analytics', icon: '📈', priority: 5 },
      { text: '🔙 Back to Main', callback_data: 'main_menu', icon: '🔙', priority: 6 }
    ];

    const keyboard = {
      reply_markup: {
        inline_keyboard: this.organizeMenuOptions(menuOptions)
      }
    };

    return { text, keyboard };
  }

  // AI Agents menu
  private async generateAgentsMenu(context: UserContext): Promise<{ text: string; keyboard: any }> {
    const templates = await storage.getAgentTemplates().catch(() => []);
    const userAgents = await storage.getUserAgents('user-1').catch(() => []);

    const text = `🤖 AI Agents Hub

📋 Available Templates: ${templates.length}
🚀 Active Agents: ${userAgents.filter(a => a.isActive).length}

🎯 Manage your AI workforce:`;

    const menuOptions: SmartMenuOption[] = [
      { text: '🆕 Create Agent', callback_data: 'create_agent', icon: '🆕', priority: 1 },
      { text: '📋 Browse Templates', callback_data: 'browse_templates', icon: '📋', priority: 2 },
      { text: '⚡ Active Agents', callback_data: 'active_agents', icon: '⚡', priority: 3 },
      { text: '📊 Agent Performance', callback_data: 'agent_performance', icon: '📊', priority: 4 },
      { text: '🔧 Agent Settings', callback_data: 'agent_settings', icon: '🔧', priority: 5 },
      { text: '🔙 Back to Main', callback_data: 'main_menu', icon: '🔙', priority: 6 }
    ];

    const keyboard = {
      reply_markup: {
        inline_keyboard: this.organizeMenuOptions(menuOptions)
      }
    };

    return { text, keyboard };
  }

  // Analytics menu
  private async generateAnalyticsMenu(context: UserContext): Promise<{ text: string; keyboard: any }> {
    const userStats = await storage.getUserStats('user-1').catch(() => ({
      totalPosts: 0,
      activeAgents: 0,
      engagementRate: 0,
      automationsRun: 0
    }));

    const text = `📊 Analytics Dashboard

📈 Key Metrics:
• Total Posts: ${userStats.totalPosts}
• Active Agents: ${userStats.activeAgents}
• Engagement Rate: ${userStats.engagementRate}%
• Automations Run: ${userStats.automationsRun}

🎯 Dive deeper into your data:`;

    const menuOptions: SmartMenuOption[] = [
      { text: '📈 Performance Overview', callback_data: 'performance_overview', icon: '📈', priority: 1 },
      { text: '📊 Post Analytics', callback_data: 'post_analytics', icon: '📊', priority: 2 },
      { text: '🤖 Agent Performance', callback_data: 'agent_performance', icon: '🤖', priority: 3 },
      { text: '📅 Time-based Reports', callback_data: 'time_reports', icon: '📅', priority: 4 },
      { text: '🎯 Engagement Insights', callback_data: 'engagement_insights', icon: '🎯', priority: 5 },
      { text: '🔙 Back to Main', callback_data: 'main_menu', icon: '🔙', priority: 6 }
    ];

    const keyboard = {
      reply_markup: {
        inline_keyboard: this.organizeMenuOptions(menuOptions)
      }
    };

    return { text, keyboard };
  }

  // Settings menu
  private async generateSettingsMenu(context: UserContext): Promise<{ text: string; keyboard: any }> {
    const text = `⚙️ Settings & Preferences

🔧 Customize your AuraOS experience:

Current Settings:
• Language: ${context.preferences.language}
• Timezone: ${context.preferences.timezone}
• Notifications: ${context.preferences.notifications ? 'ON' : 'OFF'}

🎯 Adjust your preferences:`;

    const menuOptions: SmartMenuOption[] = [
      { text: '🌍 Language', callback_data: 'set_language', icon: '🌍', priority: 1 },
      { text: '🕐 Timezone', callback_data: 'set_timezone', icon: '🕐', priority: 2 },
      { text: '🔔 Notifications', callback_data: 'toggle_notifications', icon: '🔔', priority: 3 },
      { text: '🎨 Theme', callback_data: 'set_theme', icon: '🎨', priority: 4 },
      { text: '🔐 Privacy', callback_data: 'privacy_settings', icon: '🔐', priority: 5 },
      { text: '🔙 Back to Main', callback_data: 'main_menu', icon: '🔙', priority: 6 }
    ];

    const keyboard = {
      reply_markup: {
        inline_keyboard: this.organizeMenuOptions(menuOptions)
      }
    };

    return { text, keyboard };
  }

  // Quick actions menu for power users
  private async generateQuickActionsMenu(context: UserContext): Promise<{ text: string; keyboard: any }> {
    const text = `⚡ Quick Actions

🚀 Fast access to your most-used features:

${context.stats.favoriteCommands.length > 0 ? 
  `⭐ Your favorites: ${context.stats.favoriteCommands.join(', ')}` : 
  '⭐ Start using commands to build your favorites!'
}

🎯 Quick shortcuts:`;

    const menuOptions: SmartMenuOption[] = [
      { text: '📝 Quick Post', callback_data: 'quick_post', icon: '📝', priority: 1 },
      { text: '🤖 Quick Agent', callback_data: 'quick_agent', icon: '🤖', priority: 2 },
      { text: '📊 Quick Stats', callback_data: 'quick_stats', icon: '📊', priority: 3 },
      { text: '🔄 Run Automation', callback_data: 'run_automation', icon: '🔄', priority: 4 },
      { text: '💬 AI Chat', callback_data: 'ai_chat', icon: '💬', priority: 5 },
      { text: '🔙 Back to Main', callback_data: 'main_menu', icon: '🔙', priority: 6 }
    ];

    const keyboard = {
      reply_markup: {
        inline_keyboard: this.organizeMenuOptions(menuOptions)
      }
    };

    return { text, keyboard };
  }

  // Get contextual menu options based on user behavior
  private async getContextualMenuOptions(context: UserContext): Promise<SmartMenuOption[]> {
    const options: SmartMenuOption[] = [];

    // Always include core options
    options.push(
      { text: '📝 Posts', callback_data: 'posts_menu', icon: '📝', priority: 1 },
      { text: '🤖 Agents', callback_data: 'agents_menu', icon: '🤖', priority: 2 },
      { text: '📊 Analytics', callback_data: 'analytics_menu', icon: '📊', priority: 3 },
      { text: '✈️ Travel', callback_data: 'travel_menu', icon: '✈️', priority: 4 },
      { text: '🍽️ Food', callback_data: 'food_menu', icon: '🍽️', priority: 5 },
      { text: '🛒 Shopping', callback_data: 'shopping_menu', icon: '🛒', priority: 6 }
    );

    // Add contextual options based on user behavior
    if (context.stats.totalInteractions > 10) {
      options.push({ text: '⚡ Quick Actions', callback_data: 'quick_actions_menu', icon: '⚡', priority: 4 });
    }

    if (context.stats.lastPostTime && this.isRecent(context.stats.lastPostTime)) {
      options.push({ text: '📈 View Performance', callback_data: 'view_performance', icon: '📈', priority: 5 });
    }

    // Add settings option
    options.push({ text: '⚙️ Settings', callback_data: 'settings_menu', icon: '⚙️', priority: 6 });

    // Add help option for new users
    if (context.stats.totalInteractions < 5) {
      options.push({ text: '❓ Help', callback_data: 'help_menu', icon: '❓', priority: 7 });
    }

    return options;
  }

  // Organize menu options into rows
  private organizeMenuOptions(options: SmartMenuOption[]): any[][] {
    const sortedOptions = options.sort((a, b) => a.priority - b.priority);
    const rows: any[][] = [];
    
    for (let i = 0; i < sortedOptions.length; i += 2) {
      const row = sortedOptions.slice(i, i + 2).map(option => ({
        text: `${option.icon} ${option.text}`,
        callback_data: option.callback_data
      }));
      rows.push(row);
    }

    return rows;
  }

  // Travel Menu
  private async generateTravelMenu(context: UserContext): Promise<{ text: string; keyboard: any }> {
    const text = `✈️ Travel Services Hub

🎯 **AI-Powered Travel Solutions:**
• Smart flight booking with price optimization
• Hotel recommendations with amenity matching
• Car rental with route optimization
• Complete travel packages
• Activity booking and recommendations

🚀 **Smart Features:**
• Real-time price monitoring
• Deal detection and alerts
• Automated booking when criteria met
• Personalized recommendations
• Multi-service coordination

🎯 Choose your travel service:`;

    const menuOptions: SmartMenuOption[] = [
      { text: '✈️ Flight Booking', callback_data: 'flight_booking', icon: '✈️', priority: 1 },
      { text: '🏨 Hotel Booking', callback_data: 'hotel_booking', icon: '🏨', priority: 2 },
      { text: '🚗 Car Rental', callback_data: 'car_rental', icon: '🚗', priority: 3 },
      { text: '📦 Travel Packages', callback_data: 'travel_packages', icon: '📦', priority: 4 },
      { text: '🎯 Activities', callback_data: 'travel_activities', icon: '🎯', priority: 5 },
      { text: '🤖 Travel Agents', callback_data: 'travel_agents', icon: '🤖', priority: 6 },
      { text: '🔙 Back to Main', callback_data: 'main_menu', icon: '🔙', priority: 7 }
    ];

    const keyboard = {
      reply_markup: {
        inline_keyboard: this.organizeMenuOptions(menuOptions)
      }
    };

    return { text, keyboard };
  }

  // Food Menu
  private async generateFoodMenu(context: UserContext): Promise<{ text: string; keyboard: any }> {
    const text = `🍽️ Food Services Hub

🎯 **AI-Powered Food Solutions:**
• Restaurant discovery with cuisine matching
• Food delivery optimization
• Grocery shopping automation
• Meal planning with nutrition optimization
• Catering coordination

🚀 **Smart Features:**
• Dietary preference learning
• Price comparison across platforms
• Automated repeat orders
• Nutritional analysis and optimization
• Group coordination

🎯 Choose your food service:`;

    const menuOptions: SmartMenuOption[] = [
      { text: '🍴 Restaurant Discovery', callback_data: 'restaurant_discovery', icon: '🍴', priority: 1 },
      { text: '🚚 Food Delivery', callback_data: 'food_delivery', icon: '🚚', priority: 2 },
      { text: '🛒 Grocery Shopping', callback_data: 'grocery_shopping', icon: '🛒', priority: 3 },
      { text: '📋 Meal Planning', callback_data: 'meal_planning', icon: '📋', priority: 4 },
      { text: '🎉 Catering Services', callback_data: 'catering_services', icon: '🎉', priority: 5 },
      { text: '🤖 Food Agents', callback_data: 'food_agents', icon: '🤖', priority: 6 },
      { text: '🔙 Back to Main', callback_data: 'main_menu', icon: '🔙', priority: 7 }
    ];

    const keyboard = {
      reply_markup: {
        inline_keyboard: this.organizeMenuOptions(menuOptions)
      }
    };

    return { text, keyboard };
  }

  // Shopping Menu
  private async generateShoppingMenu(context: UserContext): Promise<{ text: string; keyboard: any }> {
    const text = `🛒 Smart Shopping Hub

🎯 **AI-Powered Shopping Solutions:**
• Universal price comparison
• Deal detection and alerts
• Automated purchasing
• Preference learning
• Budget optimization

🚀 **Smart Features:**
• Cross-platform price monitoring
• Deal aggregation and alerts
• Automated wishlist management
• Purchase timing optimization
• Budget tracking and optimization

🎯 Choose your shopping service:`;

    const menuOptions: SmartMenuOption[] = [
      { text: '🔍 Price Comparison', callback_data: 'price_comparison', icon: '🔍', priority: 1 },
      { text: '💰 Deal Detection', callback_data: 'deal_detection', icon: '💰', priority: 2 },
      { text: '🤖 Auto-Purchase', callback_data: 'auto_purchase', icon: '🤖', priority: 3 },
      { text: '📋 Wishlist Manager', callback_data: 'wishlist_manager', icon: '📋', priority: 4 },
      { text: '📊 Budget Tracker', callback_data: 'budget_tracker', icon: '📊', priority: 5 },
      { text: '🤖 Shopping Agents', callback_data: 'shopping_agents', icon: '🤖', priority: 6 },
      { text: '🔙 Back to Main', callback_data: 'main_menu', icon: '🔙', priority: 7 }
    ];

    const keyboard = {
      reply_markup: {
        inline_keyboard: this.organizeMenuOptions(menuOptions)
      }
    };

    return { text, keyboard };
  }

  // Helper methods
  private getTimeOfDay(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    if (hour < 20) return 'evening';
    return 'night';
  }

  private getGreeting(timeOfDay: string): string {
    const greetings = {
      morning: 'Good morning',
      afternoon: 'Good afternoon',
      evening: 'Good evening',
      night: 'Good evening'
    };
    return greetings[timeOfDay] || 'Hello';
  }

  private isRecent(date: Date): boolean {
    const now = new Date();
    const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    return diffHours < 24;
  }

  /**
   * Updates a user's preferences.
   * @param {number} chatId The ID of the chat.
   * @param {Partial<UserContext['preferences']>} preferences The preferences to update.
   */
  async updateUserPreferences(chatId: number, preferences: Partial<UserContext['preferences']>) {
    const context = this.getUserContext(chatId, '');
    context.preferences = { ...context.preferences, ...preferences };
  }

  /**
   * Gets the user context for a chat.
   * @param {number} chatId The ID of the chat.
   * @returns {UserContext | undefined} The user context, or undefined if not found.
   */
  getUserContext(chatId: number): UserContext | undefined {
    return this.userContexts.get(chatId);
  }

  /**
   * Tracks command usage for smart suggestions.
   * @param {number} chatId The ID of the chat.
   * @param {string} command The command that was used.
   */
  trackCommandUsage(chatId: number, command: string) {
    const context = this.getUserContext(chatId, '');
    if (!context.stats.favoriteCommands.includes(command)) {
      context.stats.favoriteCommands.push(command);
      // Keep only top 5 favorites
      if (context.stats.favoriteCommands.length > 5) {
        context.stats.favoriteCommands = context.stats.favoriteCommands.slice(-5);
      }
    }
  }
}

// Export singleton instance
let smartMenuService: SmartMenuService | null = null;

/**
 * Gets the singleton instance of the SmartMenuService.
 * @returns {SmartMenuService} The singleton instance of the SmartMenuService.
 */
export function getSmartMenuService(): SmartMenuService {
  if (!smartMenuService) {
    smartMenuService = new SmartMenuService();
  }
  return smartMenuService;
}
