import { Telegraf, Context } from 'telegraf';
import { getSmartLearningAI } from './smart-learning-ai.js';
import { getAdvancedAIToolsManager } from './advanced-ai-tools.js';
import { getAdvancedAIAgentSystem } from './advanced-ai-agents.js';
import { getMCPProtocol } from './mcp-protocol.js';

// ... (rest of the interfaces remain the same)

/**
 * A more advanced Telegram bot that uses AI to learn from interactions with users.
 */
export class SmartLearningTelegramBot {
  // ... (rest of the properties remain the same)

  /**
   * Creates an instance of SmartLearningTelegramBot.
   * @param {string} token The Telegram bot token.
   */
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

  // ... (rest of the file remains the same)
}

// Export singleton instance
let smartTelegramBot: SmartLearningTelegramBot | null = null;

/**
 * Initializes the smart learning Telegram bot service.
 * @param {string} token The Telegram bot token.
 * @returns {SmartLearningTelegramBot} The singleton instance of the smart learning Telegram bot service.
 */
export function initializeSmartTelegramBot(token:string): SmartLearningTelegramBot {
  if (!smartTelegramBot) {
    smartTelegramBot = new SmartLearningTelegramBot(token);
  }
  return smartTelegramBot;
}

/**
 * Gets the singleton instance of the smart learning Telegram bot service.
 * @returns {SmartLearningTelegramBot | null} The singleton instance of the smart learning Telegram bot service, or null if it has not been initialized.
 */
export function getSmartTelegramBot(): SmartLearningTelegramBot | null {
  return smartTelegramBot;
}
