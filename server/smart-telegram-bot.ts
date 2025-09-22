import { Telegraf, Context } from 'telegraf';
import { getSmartLearningAI } from './smart-learning-ai.js';
import { getAdvancedAIToolsManager } from './advanced-ai-tools.js';
import { getAdvancedAIAgentSystem } from './advanced-ai-agents.js';
import { getMCPProtocol } from './mcp-protocol.js';
import { autopilotAgent } from './autopilot-agent.js';

// ... (rest of the interfaces remain the same)

export class SmartLearningTelegramBot {
  // ... (rest of the properties remain the same)

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
    // ... (rest of the commands remain the same)
    this.bot.command('test_learning', this.handleTestLearningCommand.bind(this));
    this.bot.command('autopilot_status', this.handleAutopilotStatusCommand.bind(this));
    this.bot.command('autopilot_start', this.handleAutopilotStartCommand.bind(this));
    this.bot.command('autopilot_stop', this.handleAutopilotStopCommand.bind(this));
    this.bot.command('autopilot_task', this.handleAutopilotTaskCommand.bind(this));

    // ... (rest of the message handlers remain the same)
  }
  
  // ... (rest of the functions remain the same)

  private async handleTestLearningCommand(ctx: Context) {
    const chatId = ctx.chat!.id;
    const userContext = this.userContexts.get(chatId);

    if (!userContext) {
      await ctx.reply('Please start the bot first with /start');
      return;
    }

    await ctx.reply('Initiating learning loop test...');

    try {
      const testContext = {
        userId: userContext.userId,
        sessionId: `telegram_${userContext.chatId}`,
        taskType: 'test_scenario',
        inputData: 'This is a test of the learning loop.',
        expectedOutput: 'A successful test confirmation.',
        timestamp: new Date(),
        metadata: {
          platform: 'telegram',
          testName: 'learning_loop_verification'
        }
      };

      const result = await this.smartLearningAI.processLearningRequest(testContext);

      await ctx.reply(`Learning loop test completed!\n\nResult:\n- Success: ${result.success}\n- Confidence: ${result.confidence.toFixed(2)}\n- Strategy: ${result.strategy}\n- Explanation: ${result.explanation}\n\nThe AI processed the test scenario and updated its learning state.`);
    } catch (error) {
      await ctx.reply(`Learning loop test failed: ${error.message}`);
    }
  }

  private async handleAutopilotStatusCommand(ctx: Context) {
    try {
      const health = await autopilotAgent.monitorSystemHealth();
      const statusText = `*Autopilot Status*
- *Status:* ${health.status}
- *Automation Success Rate:* ${health.automation.averageSuccessRate.toFixed(2)}%
- *Workflow Success Rate:* ${health.workflows.averageSuccessRate.toFixed(2)}%
      `;
      await ctx.replyWithMarkdown(statusText);
    } catch (error) {
      await ctx.reply(`Error getting autopilot status: ${error.message}`);
    }
  }

  private async handleAutopilotStartCommand(ctx: Context) {
    try {
      autopilotAgent.start();
      await ctx.reply('Autopilot agent started.');
    } catch (error) {
      await ctx.reply(`Error starting autopilot: ${error.message}`);
    }
  }

  private async handleAutopilotStopCommand(ctx: Context) {
    try {
      autopilotAgent.stop();
      await ctx.reply('Autopilot agent stopped.');
    } catch (error) {
      await ctx.reply(`Error stopping autopilot: ${error.message}`);
    }
  }

  private async handleAutopilotTaskCommand(ctx: Context) {
    const messageText = (ctx.message as any)?.text || '';
    const taskDescription = messageText.replace('/autopilot_task', '').trim();

    if (!taskDescription) {
      await ctx.reply('Please provide a task description. Usage: /autopilot_task <description>');
      return;
    }

    try {
      const result = await autopilotAgent.createTaskFromTelegram(taskDescription, ctx.chat.id);
      if (result.success) {
        await ctx.reply(`Task created with ID: ${result.taskId}`);
      } else {
        await ctx.reply(`Failed to create task: ${result.message}`);
      }
    } catch (error) {
      await ctx.reply(`Error creating task: ${error.message}`);
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

    try {
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
    } catch (error) {
        await ctx.reply('An error occurred while processing your message. Please try again later.');
        console.error('Error in handleTextMessage:', error);
    }
  }

  public async sendMessage(chatId: number, text: string) {
    try {
      await this.bot.telegram.sendMessage(chatId, text);
    } catch (error) {
      console.error(`Failed to send message to chat ${chatId}:`, error);
    }
  }

  // ... (rest of the file remains the same)
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
