#!/usr/bin/env node

/**
 * Telegram Bot Test Script
 * Tests the Telegram bot functionality with the provided token
 */

const TelegramBot = require('node-telegram-bot-api');

// Bot token provided by user
const BOT_TOKEN = '8310343758:AAFLtyqdQ5PE8YtyChwJ4uGfAgy4s5qMYi0';

class TelegramBotTester {
  constructor(token) {
    this.bot = new TelegramBot(token, { polling: false });
    this.testResults = [];
  }

  async runAllTests() {
    console.log('🤖 Starting Telegram Bot Tests...\n');
    
    try {
      await this.testBotConnection();
      await this.testBotInfo();
      await this.testBotCommands();
      await this.testMessageSending();
      
      this.printTestResults();
    } catch (error) {
      console.error('❌ Test suite failed:', error);
    }
  }

  async testBotConnection() {
    console.log('📡 Testing bot connection...');
    
    try {
      const botInfo = await this.bot.getMe();
      this.addTestResult('Bot Connection', 'PASS', `Connected successfully. Bot: @${botInfo.username}`);
      console.log(`✅ Bot connected: @${botInfo.username} (${botInfo.first_name})`);
    } catch (error) {
      this.addTestResult('Bot Connection', 'FAIL', `Connection failed: ${error.message}`);
      console.log(`❌ Connection failed: ${error.message}`);
    }
  }

  async testBotInfo() {
    console.log('ℹ️  Testing bot information...');
    
    try {
      const botInfo = await this.bot.getMe();
      
      const info = {
        id: botInfo.id,
        username: botInfo.username,
        firstName: botInfo.first_name,
        canJoinGroups: botInfo.can_join_groups,
        canReadAllGroupMessages: botInfo.can_read_all_group_messages,
        supportsInlineQueries: botInfo.supports_inline_queries
      };

      this.addTestResult('Bot Info', 'PASS', `Bot ID: ${info.id}, Username: @${info.username}`);
      console.log('✅ Bot Information:');
      console.log(`   ID: ${info.id}`);
      console.log(`   Username: @${info.username}`);
      console.log(`   Name: ${info.firstName}`);
      console.log(`   Can Join Groups: ${info.canJoinGroups ? 'Yes' : 'No'}`);
      console.log(`   Can Read Group Messages: ${info.canReadAllGroupMessages ? 'Yes' : 'No'}`);
      console.log(`   Supports Inline Queries: ${info.supportsInlineQueries ? 'Yes' : 'No'}`);
    } catch (error) {
      this.addTestResult('Bot Info', 'FAIL', `Failed to get bot info: ${error.message}`);
      console.log(`❌ Failed to get bot info: ${error.message}`);
    }
  }

  async testBotCommands() {
    console.log('⌨️  Testing bot commands...');
    
    try {
      const commands = await this.bot.getMyCommands();
      
      if (commands.length > 0) {
        this.addTestResult('Bot Commands', 'PASS', `Found ${commands.length} commands`);
        console.log('✅ Bot Commands:');
        commands.forEach(cmd => {
          console.log(`   /${cmd.command} - ${cmd.description}`);
        });
      } else {
        this.addTestResult('Bot Commands', 'PASS', 'No custom commands set (using default handlers)');
        console.log('✅ No custom commands set (bot uses message handlers)');
      }
    } catch (error) {
      this.addTestResult('Bot Commands', 'FAIL', `Failed to get commands: ${error.message}`);
      console.log(`❌ Failed to get commands: ${error.message}`);
    }
  }

  async testMessageSending() {
    console.log('📤 Testing message sending capabilities...');
    
    try {
      // Test with a dummy chat ID (this will fail but shows the bot can attempt to send)
      const testChatId = '123456789'; // This is a dummy ID for testing
      
      try {
        await this.bot.sendMessage(testChatId, 'Test message from AuraOS bot');
        this.addTestResult('Message Sending', 'PASS', 'Message sending API is accessible');
        console.log('✅ Message sending API is accessible');
      } catch (error) {
        if (error.message.includes('chat not found') || error.message.includes('bot was blocked')) {
          this.addTestResult('Message Sending', 'PASS', 'API accessible (expected error for test chat)');
          console.log('✅ Message sending API is accessible (expected error for test chat)');
        } else {
          throw error;
        }
      }
    } catch (error) {
      this.addTestResult('Message Sending', 'FAIL', `Message sending failed: ${error.message}`);
      console.log(`❌ Message sending failed: ${error.message}`);
    }
  }

  addTestResult(test, status, message) {
    this.testResults.push({ test, status, message });
  }

  printTestResults() {
    console.log('\n📊 Test Results Summary:');
    console.log('=' .repeat(50));
    
    const passed = this.testResults.filter(r => r.status === 'PASS').length;
    const failed = this.testResults.filter(r => r.status === 'FAIL').length;
    
    this.testResults.forEach(result => {
      const icon = result.status === 'PASS' ? '✅' : '❌';
      console.log(`${icon} ${result.test}: ${result.message}`);
    });
    
    console.log('=' .repeat(50));
    console.log(`Total: ${this.testResults.length} | Passed: ${passed} | Failed: ${failed}`);
    
    if (failed === 0) {
      console.log('\n🎉 All tests passed! Your Telegram bot is ready to use.');
    } else {
      console.log('\n⚠️  Some tests failed. Please check the configuration.');
    }
  }

  async testWithRealChat(chatId) {
    console.log(`\n📱 Testing with real chat ID: ${chatId}`);
    
    try {
      const message = `🤖 Hello! This is a test message from AuraOS bot.
      
✅ Bot is working correctly!
📅 Test time: ${new Date().toLocaleString()}
🔧 Bot features:
• Message handling
• Command processing  
• AI responses
• Social media integration

Use /start to begin interacting with the bot!`;

      const result = await this.bot.sendMessage(chatId, message);
      console.log(`✅ Test message sent successfully! Message ID: ${result.message_id}`);
      
      // Send a welcome message with inline keyboard
      const keyboard = {
        reply_markup: {
          inline_keyboard: [
            [
              { text: '📊 Dashboard Status', callback_data: 'get_status' },
              { text: '📝 Recent Posts', callback_data: 'get_posts' }
            ],
            [
              { text: '🤖 AI Agents', callback_data: 'get_agents' },
              { text: '❓ Help', callback_data: 'help' }
            ]
          ]
        }
      };
      
      await this.bot.sendMessage(chatId, '🎯 Choose an action:', keyboard);
      console.log('✅ Interactive keyboard sent successfully!');
      
    } catch (error) {
      console.log(`❌ Failed to send test message: ${error.message}`);
    }
  }
}

// Main execution
async function main() {
  const tester = new TelegramBotTester(BOT_TOKEN);
  
  console.log('🚀 AuraOS Telegram Bot Test Suite');
  console.log('=====================================\n');
  
  await tester.runAllTests();
  
  // Check if a chat ID was provided as command line argument
  const chatId = process.argv[2];
  if (chatId) {
    await tester.testWithRealChat(chatId);
  } else {
    console.log('\n💡 To test with a real chat, run:');
    console.log(`   node test-telegram.js <your-chat-id>`);
    console.log('\n📝 To get your chat ID:');
    console.log('   1. Start a chat with your bot');
    console.log('   2. Send any message to the bot');
    console.log('   3. Check the bot logs or use @userinfobot');
  }
}

// Handle errors gracefully
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});

// Run the tests
main().catch(console.error);
