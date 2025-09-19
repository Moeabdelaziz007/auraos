import { Telegraf, Context } from 'telegraf';
import { getSmartLearningAI } from './smart-learning-ai.js';
import { getAdvancedAIToolsManager } from './advanced-ai-tools.js';
import { getAdvancedAIAgentSystem } from './advanced-ai-agents.js';
import { getMCPProtocol } from './mcp-protocol.js';

export interface TelegramUserContext {
  userId: string;
  username: string;
  firstName: string;
  lastName?: string;
  chatId: number;
  languageCode?: string;
  isBot: boolean;
  lastInteraction: Date;
  conversationHistory: ConversationMessage[];
  preferences: UserPreferences;
  learningProfile: LearningProfile;
}

export interface ConversationMessage {
  id: string;
  timestamp: Date;
  type: 'user' | 'bot';
  content: string;
  intent?: string;
  sentiment?: number;
  entities?: any[];
  response?: string;
  satisfaction?: number;
}

export interface UserPreferences {
  language: string;
  communicationStyle: 'formal' | 'casual' | 'friendly';
  responseLength: 'short' | 'medium' | 'long';
  topics: string[];
  interests: string[];
}

export interface LearningProfile {
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  goals: string[];
  progress: Map<string, number>;
  strengths: string[];
  weaknesses: string[];
}

export class SmartLearningTelegramBot {
  private bot: Telegraf;
  private userContexts: Map<number, TelegramUserContext> = new Map();
  private smartLearningAI: any;
  private aiToolsManager: any;
  private aiAgentSystem: any;
  private mcpProtocol: any;
  private learningData: Map<string, any> = new Map();

  constructor(token: string) {
    this.bot = new Telegraf(token);
    this.smartLearningAI = getSmartLearningAI();
    this.aiToolsManager = getAdvancedAIToolsManager();
    this.aiAgentSystem = getAdvancedAIAgentSystem();
    this.mcpProtocol = getMCPProtocol();
    
    this.setupBot();
    this.initializeLearningCapabilities();
  }

  private setupBot() {
    // Basic commands
    this.bot.start(this.handleStart.bind(this));
    this.bot.help(this.handleHelp.bind(this));
    this.bot.command('learn', this.handleLearnCommand.bind(this));
    this.bot.command('profile', this.handleProfileCommand.bind(this));
    this.bot.command('stats', this.handleStatsCommand.bind(this));
    this.bot.command('reset', this.handleResetCommand.bind(this));

    // MCP-specific commands
    this.bot.command('mcp', this.handleMCPCommand.bind(this));
    this.bot.command('tools', this.handleToolsCommand.bind(this));
    this.bot.command('agents', this.handleAgentsCommand.bind(this));
    this.bot.command('execute', this.handleExecuteCommand.bind(this));
    this.bot.command('capabilities', this.handleCapabilitiesCommand.bind(this));

    // Message handlers
    this.bot.on('text', this.handleTextMessage.bind(this));
    this.bot.on('photo', this.handlePhotoMessage.bind(this));
    this.bot.on('document', this.handleDocumentMessage.bind(this));
    this.bot.on('voice', this.handleVoiceMessage.bind(this));

    // Error handling
    this.bot.catch(this.handleError.bind(this));

    console.log('🤖 Smart Learning Telegram Bot initialized');
  }

  private initializeLearningCapabilities() {
    // Initialize learning data structures
    this.learningData.set('conversation_patterns', new Map());
    this.learningData.set('user_preferences', new Map());
    this.learningData.set('response_effectiveness', new Map());
    this.learningData.set('topic_expertise', new Map());
  }

  private async handleStart(ctx: Context) {
    const user = ctx.from!;
    const chatId = ctx.chat!.id;
    
    // Initialize user context
    const userContext = await this.initializeUserContext(user, chatId);
    this.userContexts.set(chatId, userContext);

    const welcomeMessage = await this.generatePersonalizedWelcome(userContext);
    
    await ctx.reply(welcomeMessage, {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '🎓 Start Learning', callback_data: 'start_learning' },
            { text: '📊 View Profile', callback_data: 'view_profile' }
          ],
          [
            { text: '🛠️ AI Tools', callback_data: 'ai_tools' },
            { text: '📈 Analytics', callback_data: 'analytics' }
          ]
        ]
      }
    });

    // Store interaction
    await this.storeInteraction(userContext, 'start', 'user', 'Started bot');
  }

  private async handleHelp(ctx: Context) {
    const chatId = ctx.chat!.id;
    const userContext = this.userContexts.get(chatId);
    
    const helpMessage = await this.generateContextualHelp(userContext);
    
    await ctx.reply(helpMessage, {
      reply_markup: {
        keyboard: [
          ['/learn', '/profile'],
          ['/stats', '/reset'],
          ['Help', 'Settings']
        ],
        resize_keyboard: true
      }
    });
  }

  private async handleLearnCommand(ctx: Context) {
    const chatId = ctx.chat!.id;
    const userContext = this.userContexts.get(chatId);
    
    if (!userContext) {
      await ctx.reply('Please start the bot first with /start');
      return;
    }

    const learningContent = await this.generateLearningContent(userContext);
    
    await ctx.reply(learningContent, {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '📚 Content Generation', callback_data: 'learn_content' },
            { text: '📊 Data Analysis', callback_data: 'learn_analysis' }
          ],
          [
            { text: '🤖 AI Agents', callback_data: 'learn_agents' },
            { text: '🛠️ Tools', callback_data: 'learn_tools' }
          ],
          [
            { text: '🎯 Practice', callback_data: 'practice' },
            { text: '📈 Progress', callback_data: 'progress' }
          ]
        ]
      }
    });
  }

  private async handleProfileCommand(ctx: Context) {
    const chatId = ctx.chat!.id;
    const userContext = this.userContexts.get(chatId);
    
    if (!userContext) {
      await ctx.reply('Please start the bot first with /start');
      return;
    }

    const profile = await this.generateUserProfile(userContext);
    
    await ctx.reply(profile, {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '✏️ Edit Preferences', callback_data: 'edit_preferences' },
            { text: '🎯 Set Goals', callback_data: 'set_goals' }
          ],
          [
            { text: '📊 Learning Style', callback_data: 'learning_style' },
            { text: '🔄 Reset Profile', callback_data: 'reset_profile' }
          ]
        ]
      }
    });
  }

  private async handleStatsCommand(ctx: Context) {
    const chatId = ctx.chat!.id;
    const userContext = this.userContexts.get(chatId);
    
    if (!userContext) {
      await ctx.reply('Please start the bot first with /start');
      return;
    }

    const stats = await this.generateUserStats(userContext);
    
    await ctx.reply(stats);
  }

  private async handleResetCommand(ctx: Context) {
    const chatId = ctx.chat!.id;
    const userContext = this.userContexts.get(chatId);
    
    if (!userContext) {
      await ctx.reply('Please start the bot first with /start');
      return;
    }

    // Reset user context
    const newContext = await this.initializeUserContext(ctx.from!, chatId);
    this.userContexts.set(chatId, newContext);
    
    await ctx.reply('🔄 Your profile has been reset. Welcome back!');
  }

  // MCP Command Handlers
  private async handleMCPCommand(ctx: Context) {
    const chatId = ctx.chat!.id;
    const userContext = this.userContexts.get(chatId);
    
    if (!userContext) {
      await ctx.reply('Please start the bot first with /start');
      return;
    }

    try {
      const capabilities = await this.mcpProtocol.getCapabilities();
      const tools = await this.mcpProtocol.getTools();
      const agents = await this.mcpProtocol.getAgents();

      const mcpInfo = `🔗 MCP (Model Context Protocol) Access

📋 Available Capabilities:
${capabilities.map((cap: any) => `• ${cap.name}: ${cap.description}`).join('\n')}

🛠️ Available Tools:
${tools.map((tool: any) => `• ${tool.name}: ${tool.description}`).join('\n')}

🤖 Available Agents:
${agents.map((agent: any) => `• ${agent.name}: ${agent.description}`).join('\n')}

💡 Use /tools, /agents, or /execute to interact with MCP resources!`;

      await ctx.reply(mcpInfo, {
        reply_markup: {
          inline_keyboard: [
            [
              { text: '🛠️ View Tools', callback_data: 'mcp_tools' },
              { text: '🤖 View Agents', callback_data: 'mcp_agents' }
            ],
            [
              { text: '📋 Capabilities', callback_data: 'mcp_capabilities' },
              { text: '⚡ Execute Tool', callback_data: 'mcp_execute' }
            ]
          ]
        }
      });
    } catch (error) {
      await ctx.reply('❌ Failed to access MCP resources. Please try again.');
    }
  }

  private async handleToolsCommand(ctx: Context) {
    const chatId = ctx.chat!.id;
    const userContext = this.userContexts.get(chatId);
    
    if (!userContext) {
      await ctx.reply('Please start the bot first with /start');
      return;
    }

    try {
      const tools = await this.mcpProtocol.getTools();
      const aiTools = this.aiToolsManager.getAllTools();

      const toolsInfo = `🛠️ Available Tools

🔗 MCP Tools:
${tools.map((tool: any) => `• ${tool.name}: ${tool.description}`).join('\n')}

🤖 AI Tools:
${aiTools.map((tool: any) => `• ${tool.name}: ${tool.description}`).join('\n')}

💡 Use /execute <tool_name> <parameters> to run a tool!`;

      await ctx.reply(toolsInfo, {
        reply_markup: {
          inline_keyboard: [
            [
              { text: '🔗 MCP Tools', callback_data: 'tools_mcp' },
              { text: '🤖 AI Tools', callback_data: 'tools_ai' }
            ],
            [
              { text: '⚡ Execute Tool', callback_data: 'tools_execute' },
              { text: '📊 Tool Analytics', callback_data: 'tools_analytics' }
            ]
          ]
        }
      });
    } catch (error) {
      await ctx.reply('❌ Failed to get tools information. Please try again.');
    }
  }

  private async handleAgentsCommand(ctx: Context) {
    const chatId = ctx.chat!.id;
    const userContext = this.userContexts.get(chatId);
    
    if (!userContext) {
      await ctx.reply('Please start the bot first with /start');
      return;
    }

    try {
      const mcpAgents = await this.mcpProtocol.getAgents();
      const aiAgents = this.aiAgentSystem.getAllAgents();

      const agentsInfo = `🤖 Available Agents

🔗 MCP Agents:
${mcpAgents.map((agent: any) => `• ${agent.name}: ${agent.description}`).join('\n')}

🧠 AI Agents:
${aiAgents.map((agent: any) => `• ${agent.name} (${agent.type}): ${agent.description}`).join('\n')}

💡 Use /execute agent <agent_name> <task> to assign a task to an agent!`;

      await ctx.reply(agentsInfo, {
        reply_markup: {
          inline_keyboard: [
            [
              { text: '🔗 MCP Agents', callback_data: 'agents_mcp' },
              { text: '🧠 AI Agents', callback_data: 'agents_ai' }
            ],
            [
              { text: '⚡ Assign Task', callback_data: 'agents_assign' },
              { text: '📊 Agent Analytics', callback_data: 'agents_analytics' }
            ]
          ]
        }
      });
    } catch (error) {
      await ctx.reply('❌ Failed to get agents information. Please try again.');
    }
  }

  private async handleExecuteCommand(ctx: Context) {
    const chatId = ctx.chat!.id;
    const userContext = this.userContexts.get(chatId);
    const messageText = ctx.message?.text || '';
    
    if (!userContext) {
      await ctx.reply('Please start the bot first with /start');
      return;
    }

    // Parse command: /execute <type> <name> <parameters>
    const parts = messageText.split(' ').slice(1);
    if (parts.length < 2) {
      await ctx.reply(`⚡ Execute Command Usage:

/execute tool <tool_name> <parameters>
/execute agent <agent_name> <task>
/execute capability <capability_name> <parameters>

Examples:
/execute tool web_search_tool "AI technology"
/execute agent content_creator "Write a blog post about AI"
/execute capability file_system "read_file" "path/to/file.txt"`);

      return;
    }

    const [type, name, ...params] = parts;
    const parameters = params.join(' ');

    try {
      let result: any;

      switch (type.toLowerCase()) {
        case 'tool':
          result = await this.executeMCPTool(name, parameters, userContext);
          break;
        case 'agent':
          result = await this.executeMCPAgent(name, parameters, userContext);
          break;
        case 'capability':
          result = await this.executeMCPCapability(name, parameters, userContext);
          break;
        default:
          await ctx.reply('❌ Invalid execution type. Use: tool, agent, or capability');
          return;
      }

      await ctx.reply(`✅ Execution Result:\n\n${JSON.stringify(result, null, 2)}`);
    } catch (error) {
      await ctx.reply(`❌ Execution failed: ${error.message}`);
    }
  }

  private async handleCapabilitiesCommand(ctx: Context) {
    const chatId = ctx.chat!.id;
    const userContext = this.userContexts.get(chatId);
    
    if (!userContext) {
      await ctx.reply('Please start the bot first with /start');
      return;
    }

    try {
      const capabilities = await this.mcpProtocol.getCapabilities();

      const capabilitiesInfo = `📋 MCP Capabilities

${capabilities.map((cap: any) => 
  `🔹 ${cap.name} (v${cap.version})
   ${cap.description}
   
   Methods: ${cap.methods.map((m: any) => m.name).join(', ')}
   Resources: ${cap.resources.length} available`
).join('\n\n')}

💡 Use /execute capability <capability_name> <method> <parameters> to use a capability!`;

      await ctx.reply(capabilitiesInfo, {
        reply_markup: {
          inline_keyboard: [
            [
              { text: '📁 File System', callback_data: 'cap_file_system' },
              { text: '🌐 Web Search', callback_data: 'cap_web_search' }
            ],
            [
              { text: '🗄️ Database', callback_data: 'cap_database' },
              { text: '🤖 AI Models', callback_data: 'cap_ai_models' }
            ],
            [
              { text: '📱 Social Media', callback_data: 'cap_social_media' },
              { text: '⚡ Execute', callback_data: 'cap_execute' }
            ]
          ]
        }
      });
    } catch (error) {
      await ctx.reply('❌ Failed to get capabilities information. Please try again.');
    }
  }

  private async handleTextMessage(ctx: Context) {
    const chatId = ctx.chat!.id;
    const userContext = this.userContexts.get(chatId);
    const messageText = ctx.message?.text || '';
    
    if (!userContext) {
      await ctx.reply('Please start the bot first with /start');
      return;
    }

    // Process message with AI
    const response = await this.processMessageWithAI(userContext, messageText);
    
    // Send response
    await ctx.reply(response.text, {
      reply_markup: response.keyboard ? { inline_keyboard: response.keyboard } : undefined
    });

    // Store interaction
    await this.storeInteraction(userContext, 'text', 'user', messageText);
    await this.storeInteraction(userContext, 'text', 'bot', response.text);

    // Learn from interaction
    await this.learnFromInteraction(userContext, messageText, response);
  }

  private async handlePhotoMessage(ctx: Context) {
    const chatId = ctx.chat!.id;
    const userContext = this.userContexts.get(chatId);
    
    if (!userContext) {
      await ctx.reply('Please start the bot first with /start');
      return;
    }

    // Process image with AI
    const photo = ctx.message?.photo?.[ctx.message.photo.length - 1];
    if (photo) {
      const response = await this.processImageWithAI(userContext, photo);
      await ctx.reply(response);
    }
  }

  private async handleDocumentMessage(ctx: Context) {
    const chatId = ctx.chat!.id;
    const userContext = this.userContexts.get(chatId);
    
    if (!userContext) {
      await ctx.reply('Please start the bot first with /start');
      return;
    }

    const document = ctx.message?.document;
    if (document) {
      const response = await this.processDocumentWithAI(userContext, document);
      await ctx.reply(response);
    }
  }

  private async handleVoiceMessage(ctx: Context) {
    const chatId = ctx.chat!.id;
    const userContext = this.userContexts.get(chatId);
    
    if (!userContext) {
      await ctx.reply('Please start the bot first with /start');
      return;
    }

    const voice = ctx.message?.voice;
    if (voice) {
      const response = await this.processVoiceWithAI(userContext, voice);
      await ctx.reply(response);
    }
  }

  private async handleError(err: any, ctx: Context) {
    console.error('Telegram bot error:', err);
    
    try {
      await ctx.reply('Sorry, I encountered an error. Let me try to help you in a different way.');
    } catch (error) {
      console.error('Failed to send error message:', error);
    }
  }

  // MCP Execution Methods
  private async executeMCPTool(toolName: string, parameters: string, userContext: TelegramUserContext): Promise<any> {
    try {
      const mcpMessage = {
        id: `mcp_tool_${Date.now()}`,
        type: 'request' as const,
        method: 'tools/call',
        params: {
          name: toolName,
          arguments: this.parseParameters(parameters)
        },
        timestamp: new Date()
      };

      const result = await this.mcpProtocol.sendMessage(mcpMessage);
      return result.result;
    } catch (error) {
      throw new Error(`Failed to execute MCP tool ${toolName}: ${error.message}`);
    }
  }

  private async executeMCPAgent(agentName: string, task: string, userContext: TelegramUserContext): Promise<any> {
    try {
      const mcpMessage = {
        id: `mcp_agent_${Date.now()}`,
        type: 'request' as const,
        method: 'agents/execute',
        params: {
          agentId: agentName,
          task: task,
          context: {
            userId: userContext.userId,
            chatId: userContext.chatId,
            preferences: userContext.preferences
          }
        },
        timestamp: new Date()
      };

      const result = await this.mcpProtocol.sendMessage(mcpMessage);
      return result.result;
    } catch (error) {
      throw new Error(`Failed to execute MCP agent ${agentName}: ${error.message}`);
    }
  }

  private async executeMCPCapability(capabilityName: string, parameters: string, userContext: TelegramUserContext): Promise<any> {
    try {
      const [method, ...args] = parameters.split(' ');
      const mcpMessage = {
        id: `mcp_cap_${Date.now()}`,
        type: 'request' as const,
        method: `capabilities/${capabilityName}/${method}`,
        params: {
          arguments: args
        },
        timestamp: new Date()
      };

      const result = await this.mcpProtocol.sendMessage(mcpMessage);
      return result.result;
    } catch (error) {
      throw new Error(`Failed to execute MCP capability ${capabilityName}: ${error.message}`);
    }
  }

  private parseParameters(parameters: string): any {
    try {
      // Try to parse as JSON first
      return JSON.parse(parameters);
    } catch {
      // If not JSON, treat as simple string or split by spaces
      if (parameters.includes(' ')) {
        return { query: parameters };
      }
      return parameters;
    }
  }

  // AI Processing Methods
  private async processMessageWithAI(userContext: TelegramUserContext, message: string): Promise<any> {
    try {
      // Use smart learning AI to process the message
      const context = {
        userId: userContext.userId,
        sessionId: `telegram_${userContext.chatId}`,
        taskType: 'conversation',
        inputData: message,
        timestamp: new Date(),
        metadata: {
          platform: 'telegram',
          userContext: userContext,
          conversationHistory: userContext.conversationHistory.slice(-5) // Last 5 messages
        }
      };

      const result = await this.smartLearningAI.processLearningRequest(context);
      
      // Generate contextual response
      const response = await this.generateContextualResponse(userContext, message, result);
      
      return {
        text: response.text,
        keyboard: response.keyboard,
        confidence: result.confidence
      };
    } catch (error) {
      console.error('AI processing error:', error);
      return {
        text: 'I apologize, but I encountered an issue processing your message. Could you please try rephrasing it?',
        keyboard: undefined,
        confidence: 0
      };
    }
  }

  private async processImageWithAI(userContext: TelegramUserContext, photo: any): Promise<string> {
    try {
      // Use AI tools to analyze image
      const result = await this.aiToolsManager.executeTool('image_processor', {
        image_url: `https://api.telegram.org/file/bot${this.bot.token}/${photo.file_id}`,
        operation: 'analyze',
        output_format: 'description'
      }, {
        userId: userContext.userId,
        sessionId: `telegram_${userContext.chatId}`,
        requestId: `img_${Date.now()}`,
        timestamp: new Date(),
        metadata: { platform: 'telegram' }
      });

      if (result.success) {
        return `I can see this image contains: ${result.data.analysis || 'various elements'}. What would you like to know about it?`;
      } else {
        return 'I can see you sent an image, but I had trouble analyzing it. Could you describe what you see?';
      }
    } catch (error) {
      console.error('Image processing error:', error);
      return 'I can see you sent an image, but I had trouble processing it. Could you tell me about it?';
    }
  }

  private async processDocumentWithAI(userContext: TelegramUserContext, document: any): Promise<string> {
    try {
      // Use AI tools to process document
      const result = await this.aiToolsManager.executeTool('nlp_processor', {
        text: `Document: ${document.file_name} (${document.mime_type})`,
        operations: ['classification', 'summary']
      }, {
        userId: userContext.userId,
        sessionId: `telegram_${userContext.chatId}`,
        requestId: `doc_${Date.now()}`,
        timestamp: new Date(),
        metadata: { platform: 'telegram' }
      });

      if (result.success) {
        return `I received your document "${document.file_name}". Based on the file type (${document.mime_type}), it appears to be a ${result.data.results?.classification || 'document'}. How can I help you with it?`;
      } else {
        return `I received your document "${document.file_name}". What would you like me to help you with regarding this file?`;
      }
    } catch (error) {
      console.error('Document processing error:', error);
      return `I received your document "${document.file_name}". What would you like me to help you with?`;
    }
  }

  private async processVoiceWithAI(userContext: TelegramUserContext, voice: any): Promise<string> {
    try {
      // Use AI tools to process voice
      const result = await this.aiToolsManager.executeTool('nlp_processor', {
        text: 'Voice message received',
        operations: ['sentiment', 'intent']
      }, {
        userId: userContext.userId,
        sessionId: `telegram_${userContext.chatId}`,
        requestId: `voice_${Date.now()}`,
        timestamp: new Date(),
        metadata: { platform: 'telegram' }
      });

      return 'I received your voice message. While I can\'t process audio directly yet, I\'m here to help! What would you like to discuss?';
    } catch (error) {
      console.error('Voice processing error:', error);
      return 'I received your voice message. What would you like to talk about?';
    }
  }

  // Learning and Context Methods
  private async initializeUserContext(user: any, chatId: number): Promise<TelegramUserContext> {
    const userContext: TelegramUserContext = {
      userId: user.id.toString(),
      username: user.username || '',
      firstName: user.first_name || '',
      lastName: user.last_name || '',
      chatId,
      languageCode: user.language_code || 'en',
      isBot: user.is_bot || false,
      lastInteraction: new Date(),
      conversationHistory: [],
      preferences: {
        language: user.language_code || 'en',
        communicationStyle: 'friendly',
        responseLength: 'medium',
        topics: [],
        interests: []
      },
      learningProfile: {
        experienceLevel: 'beginner',
        learningStyle: 'reading',
        goals: [],
        progress: new Map(),
        strengths: [],
        weaknesses: []
      }
    };

    return userContext;
  }

  private async generatePersonalizedWelcome(userContext: TelegramUserContext): Promise<string> {
    const name = userContext.firstName || userContext.username || 'there';
    
    return `👋 Welcome ${name}! I'm your AI-powered learning assistant.

🧠 I'm equipped with:
• Smart learning capabilities
• Advanced AI tools
• Continuous learning from our interactions
• Personalized responses based on your preferences
• Full MCP (Model Context Protocol) access

🎯 I can help you with:
• Content generation and writing
• Data analysis and insights
• Learning new topics
• Using AI tools effectively
• Answering questions intelligently
• Executing MCP tools and agents
• Accessing external resources

🔗 MCP Commands:
/mcp - Access MCP resources
/tools - View available tools
/agents - View available agents
/execute - Execute tools directly

Let's start learning together! What would you like to explore?`;
  }

  private async generateContextualHelp(userContext: TelegramUserContext | undefined): Promise<string> {
    if (!userContext) {
      return `🤖 AIOS Smart Learning Bot Help

📋 Available Commands:
/start - Initialize your learning profile
/learn - Access learning content and tools
/profile - View and edit your profile
/stats - See your learning statistics
/reset - Reset your profile

🔗 MCP Commands:
/mcp - Access MCP (Model Context Protocol) resources
/tools - View available tools (MCP + AI)
/agents - View available agents (MCP + AI)
/execute - Execute tools, agents, or capabilities
/capabilities - View MCP capabilities

💡 Features:
• Smart conversation with AI
• Image and document analysis
• Personalized learning paths
• Continuous improvement
• AI tool integration
• Full MCP access

Just send me a message and I'll help you!`;
    }

    const name = userContext.firstName || userContext.username || 'there';
    const level = userContext.learningProfile.experienceLevel;
    
    return `🤖 Help for ${name}

📊 Your Profile:
• Experience Level: ${level}
• Learning Style: ${userContext.learningProfile.learningStyle}
• Communication Style: ${userContext.preferences.communicationStyle}

🎯 Personalized Commands:
/learn - Access content tailored to your ${level} level
/profile - Update your preferences and goals
/stats - Track your learning progress

🔗 MCP Access:
/mcp - Access Model Context Protocol resources
/tools - Execute AI tools and MCP tools
/agents - Assign tasks to AI agents
/execute - Direct tool/agent execution
/capabilities - Use MCP capabilities

💬 Just chat with me naturally - I learn from every conversation!
🔗 I have full MCP access for advanced AI capabilities!`;
  }

  private async generateLearningContent(userContext: TelegramUserContext): Promise<string> {
    const level = userContext.learningProfile.experienceLevel;
    const style = userContext.learningProfile.learningStyle;
    
    return `🎓 Learning Center - ${level.charAt(0).toUpperCase() + level.slice(1)} Level

📚 Available Learning Modules:
• Content Generation & Writing
• Data Analysis & Visualization  
• AI Tools & Automation
• Smart Learning Techniques

🎯 Based on your ${style} learning style, I recommend:
• Interactive examples and hands-on practice
• Step-by-step guided tutorials
• Real-world applications

What topic interests you most?`;
  }

  private async generateUserProfile(userContext: TelegramUserContext): Promise<string> {
    const name = userContext.firstName || userContext.username || 'User';
    const level = userContext.learningProfile.experienceLevel;
    const style = userContext.learningProfile.learningStyle;
    const topics = userContext.preferences.topics.length > 0 ? userContext.preferences.topics.join(', ') : 'None yet';
    
    return `👤 Profile: ${name}

📊 Learning Profile:
• Experience Level: ${level.charAt(0).toUpperCase() + level.slice(1)}
• Learning Style: ${style.charAt(0).toUpperCase() + style.slice(1)}
• Communication: ${userContext.preferences.communicationStyle.charAt(0).toUpperCase() + userContext.preferences.communicationStyle.slice(1)}
• Response Length: ${userContext.preferences.responseLength.charAt(0).toUpperCase() + userContext.preferences.responseLength.slice(1)}

🎯 Interests: ${topics}

📈 Progress: ${userContext.learningProfile.progress.size} topics tracked

💬 Conversations: ${userContext.conversationHistory.length} messages`;
  }

  private async generateUserStats(userContext: TelegramUserContext): Promise<string> {
    const totalMessages = userContext.conversationHistory.length;
    const userMessages = userContext.conversationHistory.filter(m => m.type === 'user').length;
    const botMessages = userContext.conversationHistory.filter(m => m.type === 'bot').length;
    const avgSatisfaction = userContext.conversationHistory
      .filter(m => m.satisfaction !== undefined)
      .reduce((sum, m) => sum + (m.satisfaction || 0), 0) / userContext.conversationHistory.length || 0;
    
    return `📈 Your Learning Statistics

💬 Conversations:
• Total Messages: ${totalMessages}
• Your Messages: ${userMessages}
• Bot Responses: ${botMessages}

📊 Learning Progress:
• Topics Explored: ${userContext.learningProfile.progress.size}
• Experience Level: ${userContext.learningProfile.experienceLevel}
• Learning Style: ${userContext.learningProfile.learningStyle}

⭐ Satisfaction: ${Math.round(avgSatisfaction * 100)}%

🎯 Goals: ${userContext.learningProfile.goals.length > 0 ? userContext.learningProfile.goals.join(', ') : 'None set yet'}`;
  }

  private async generateContextualResponse(userContext: TelegramUserContext, message: string, aiResult: any): Promise<any> {
    // Generate response based on user preferences and AI result
    const style = userContext.preferences.communicationStyle;
    const length = userContext.preferences.responseLength;
    
    let response = aiResult.output || 'I understand. How can I help you further?';
    
    // Adjust response based on preferences
    if (style === 'formal') {
      response = `I understand your inquiry. ${response}`;
    } else if (style === 'casual') {
      response = `Got it! ${response}`;
    }
    
    if (length === 'short' && response.length > 100) {
      response = response.substring(0, 100) + '...';
    } else if (length === 'long' && response.length < 200) {
      response += ` Would you like me to elaborate on any specific aspect?`;
    }
    
    return {
      text: response,
      keyboard: undefined
    };
  }

  private async storeInteraction(userContext: TelegramUserContext, type: string, sender: 'user' | 'bot', content: string) {
    const message: ConversationMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      type: sender,
      content
    };
    
    userContext.conversationHistory.push(message);
    userContext.lastInteraction = new Date();
    
    // Keep only last 100 messages
    if (userContext.conversationHistory.length > 100) {
      userContext.conversationHistory = userContext.conversationHistory.slice(-100);
    }
  }

  private async learnFromInteraction(userContext: TelegramUserContext, userMessage: string, botResponse: any) {
    // Learn from the interaction to improve future responses
    try {
      // Update learning profile based on interaction
      await this.updateLearningProfile(userContext, userMessage, botResponse);
      
      // Store patterns for future reference
      await this.storeConversationPattern(userContext, userMessage, botResponse);
      
      // Update preferences based on interaction
      await this.updateUserPreferences(userContext, userMessage, botResponse);
      
    } catch (error) {
      console.error('Learning from interaction error:', error);
    }
  }

  private async updateLearningProfile(userContext: TelegramUserContext, message: string, response: any) {
    // Analyze message complexity and update experience level
    const complexity = this.analyzeMessageComplexity(message);
    
    if (complexity > 0.7 && userContext.learningProfile.experienceLevel === 'beginner') {
      userContext.learningProfile.experienceLevel = 'intermediate';
    } else if (complexity > 0.9 && userContext.learningProfile.experienceLevel === 'intermediate') {
      userContext.learningProfile.experienceLevel = 'advanced';
    }
    
    // Update progress based on topics discussed
    const topics = this.extractTopics(message);
    topics.forEach(topic => {
      const currentProgress = userContext.learningProfile.progress.get(topic) || 0;
      userContext.learningProfile.progress.set(topic, currentProgress + 1);
    });
  }

  private async storeConversationPattern(userContext: TelegramUserContext, message: string, response: any) {
    const patterns = this.learningData.get('conversation_patterns') as Map<string, any>;
    const patternKey = `${userContext.userId}_${this.extractIntent(message)}`;
    
    if (!patterns.has(patternKey)) {
      patterns.set(patternKey, []);
    }
    
    const pattern = patterns.get(patternKey)!;
    pattern.push({
      timestamp: new Date(),
      message,
      response: response.text,
      confidence: response.confidence
    });
    
    // Keep only last 10 patterns per key
    if (pattern.length > 10) {
      pattern.splice(0, pattern.length - 10);
    }
  }

  private async updateUserPreferences(userContext: TelegramUserContext, message: string, response: any) {
    // Analyze user's communication style
    const style = this.analyzeCommunicationStyle(message);
    if (style && style !== userContext.preferences.communicationStyle) {
      userContext.preferences.communicationStyle = style;
    }
    
    // Update interests based on topics discussed
    const topics = this.extractTopics(message);
    topics.forEach(topic => {
      if (!userContext.preferences.topics.includes(topic)) {
        userContext.preferences.topics.push(topic);
      }
    });
  }

  private analyzeMessageComplexity(message: string): number {
    // Simple complexity analysis based on message characteristics
    const words = message.split(' ').length;
    const sentences = message.split(/[.!?]+/).length;
    const avgWordsPerSentence = words / sentences;
    
    // Complexity score based on length and structure
    let complexity = 0;
    if (words > 20) complexity += 0.3;
    if (avgWordsPerSentence > 15) complexity += 0.3;
    if (message.includes('?')) complexity += 0.2;
    if (message.includes('!')) complexity += 0.1;
    if (message.includes(',')) complexity += 0.1;
    
    return Math.min(complexity, 1);
  }

  private extractTopics(message: string): string[] {
    // Simple topic extraction based on keywords
    const topics: string[] = [];
    const lowerMessage = message.toLowerCase();
    
    const topicKeywords = {
      'ai': ['ai', 'artificial intelligence', 'machine learning', 'ml'],
      'programming': ['code', 'programming', 'development', 'software'],
      'data': ['data', 'analysis', 'statistics', 'analytics'],
      'content': ['content', 'writing', 'blog', 'article'],
      'learning': ['learn', 'study', 'education', 'knowledge']
    };
    
    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        topics.push(topic);
      }
    });
    
    return topics;
  }

  private extractIntent(message: string): string {
    // Simple intent extraction
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('help') || lowerMessage.includes('?')) return 'help';
    if (lowerMessage.includes('learn') || lowerMessage.includes('teach')) return 'learning';
    if (lowerMessage.includes('create') || lowerMessage.includes('generate')) return 'creation';
    if (lowerMessage.includes('analyze') || lowerMessage.includes('data')) return 'analysis';
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) return 'greeting';
    
    return 'general';
  }

  private analyzeCommunicationStyle(message: string): string | null {
    // Analyze communication style based on message characteristics
    if (message.includes('please') || message.includes('thank you')) return 'formal';
    if (message.includes('!') || message.includes('😊') || message.includes('👍')) return 'casual';
    if (message.includes('hey') || message.includes('what\'s up')) return 'friendly';
    
    return null;
  }

  // Public methods
  async launch() {
    try {
      await this.bot.launch();
      console.log('🚀 Smart Learning Telegram Bot launched successfully');
      
      // Enable graceful stop
      process.once('SIGINT', () => this.bot.stop('SIGINT'));
      process.once('SIGTERM', () => this.bot.stop('SIGTERM'));
    } catch (error) {
      console.error('Failed to launch Telegram bot:', error);
    }
  }

  async stop(reason: string) {
    try {
      await this.bot.stop(reason);
      console.log(`🛑 Smart Learning Telegram Bot stopped: ${reason}`);
    } catch (error) {
      console.error('Failed to stop Telegram bot:', error);
    }
  }

  getUserContext(chatId: number): TelegramUserContext | undefined {
    return this.userContexts.get(chatId);
  }

  getAllUserContexts(): TelegramUserContext[] {
    return Array.from(this.userContexts.values());
  }

  getLearningData(): Map<string, any> {
    return this.learningData;
  }
}

// Export singleton instance
let smartTelegramBot: SmartLearningTelegramBot | null = null;

export function initializeSmartTelegramBot(token: string): SmartLearningTelegramBot {
  if (!smartTelegramBot) {
    smartTelegramBot = new SmartLearningTelegramBot(token);
  }
  return smartTelegramBot;
}

export function getSmartTelegramBot(): SmartLearningTelegramBot | null {
  return smartTelegramBot;
}
