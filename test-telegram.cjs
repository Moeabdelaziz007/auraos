#!/usr/bin/env node

/**
 * Telegram Bot Test Script
 * Tests the Telegram bot functionality with the provided token
 */

const TelegramBot = require('node-telegram-bot-api');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Bot token provided by user
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

class TelegramBotTester {
  constructor(token) {
    if (!token) {
      throw new Error('Telegram bot token not provided!');
    }
    this.bot = new TelegramBot(token, { polling: false });
    this.testResults = [];
  }

  async testConnectivity() {
    console.log('📡 Testing Basic Connectivity...');
    try {
      const botInfo = await this.bot.getMe();
      console.log(`✅ Connected to @${botInfo.username} (${botInfo.first_name})`);
      this.addTestResult('Basic Connectivity', 'PASS', `Connected to @${botInfo.username}`);
    } catch (error) {
      console.error(`❌ Connection failed: ${error.message}`);
      this.addTestResult('Basic Connectivity', 'FAIL', `Connection failed: ${error.message}`);
      throw error; // re-throw to stop tests if connection fails
    }
  }

  addTestResult(testName, status, details = '') {
    this.testResults.push({ testName, status, details });
  }

  async runAllTests() {
    console.log('🤖 Starting Telegram Bot Tests...\n');

    try {
      if (!this.bot.token) {
        console.error('❌ Bot token is missing. Please check your .env file.');
        return;
      }
      await this.testConnectivity();

      // ... other tests can be added here
    } catch (error) {
      console.error('\n🛑 Halting tests due to critical error.');
    } finally {
      this.printTestSummary();
    }
  }

  printTestSummary() {
    console.log('\n📊 Test Summary:');
    this.testResults.forEach(result => {
      const status = result.status === 'PASS' ? '✅ PASS' : '❌ FAIL';
      console.log(`  - ${result.testName}: ${status} ${result.details ? `(${result.details})` : ''}`);
    });

    const passCount = this.testResults.filter(r => r.status === 'PASS').length;
    const failCount = this.testResults.length - passCount;
    console.log(`\nTotal tests: ${this.testResults.length}, Passed: ${passCount}, Failed: ${failCount}`);
  }
}

async function main() {
  if (!BOT_TOKEN) {
    console.error('❌ TELEGRAM_BOT_TOKEN is not set in your .env file.');
    process.exit(1);
  }

  const tester = new TelegramBotTester(BOT_TOKEN);
  await tester.runAllTests();
}

if (require.main === module) {
  main();
}

module.exports = TelegramBotTester;
