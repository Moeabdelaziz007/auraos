import { Telegraf } from 'telegraf';

// Test Telegram bot functionality
async function testTelegramBot() {
  const token = process.env.TELEGRAM_BOT_TOKEN || '8310343758:AAFLtyqdQ5PE8YtyChwJ4uGfAgy4s5qMYi0';
  
  if (!token) {
    console.error('❌ TELEGRAM_BOT_TOKEN not found');
    return;
  }

  console.log('🤖 Testing Telegram Bot...');
  
  try {
    const bot = new Telegraf(token);
    
    // Test bot info
    const botInfo = await bot.telegram.getMe();
    console.log('✅ Bot Info:', {
      id: botInfo.id,
      username: botInfo.username,
      firstName: botInfo.first_name,
      canJoinGroups: botInfo.can_join_groups,
      canReadAllGroupMessages: botInfo.can_read_all_group_messages
    });

    // Test webhook info
    const webhookInfo = await bot.telegram.getWebhookInfo();
    console.log('✅ Webhook Info:', webhookInfo);

    // Test bot commands
    const commands = await bot.telegram.getMyCommands();
    console.log('✅ Bot Commands:', commands);

    console.log('✅ Telegram bot test completed successfully!');
    
  } catch (error) {
    console.error('❌ Telegram bot test failed:', error.message);
  }
}

// Run the test
testTelegramBot();
