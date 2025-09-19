#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import axios from 'axios';
import WebSocket from 'ws';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface AuraOSStatus {
  system: {
    status: string;
    uptime: number;
    version: string;
  };
  autopilot: {
    active: boolean;
    rules: number;
    workflows: number;
    lastExecution: string;
  };
  ai: {
    agents: number;
    activeAgents: number;
    totalTasks: number;
  };
  performance: {
    memory: number;
    cpu: number;
    responseTime: number;
  };
}

class AuraOSCLI {
  private baseUrl: string;
  private wsConnection: WebSocket | null = null;

  constructor() {
    this.baseUrl = process.env.AURAOS_API_URL || 'http://localhost:5000';
  }

  /**
   * Display system status information
   */
  async status() {
    try {
      console.log(chalk.blue.bold('\n🚀 AuraOS System Status\n'));
      
      const response = await axios.get(`${this.baseUrl}/api/system/status`);
      const status: AuraOSStatus = response.data;

      // System Status
      console.log(chalk.green('📊 System Information:'));
      console.log(`   Status: ${chalk.green(status.system.status)}`);
      console.log(`   Version: ${chalk.blue(status.system.version)}`);
      console.log(`   Uptime: ${chalk.yellow(this.formatUptime(status.system.uptime))}\n`);

      // Autopilot Status
      console.log(chalk.green('🤖 Autopilot System:'));
      console.log(`   Active: ${status.autopilot.active ? chalk.green('✅ Yes') : chalk.red('❌ No')}`);
      console.log(`   Active Rules: ${chalk.blue(status.autopilot.rules)}`);
      console.log(`   Active Workflows: ${chalk.blue(status.autopilot.workflows)}`);
      console.log(`   Last Execution: ${chalk.yellow(status.autopilot.lastExecution)}\n`);

      // AI Agents
      console.log(chalk.green('🧠 AI Agents:'));
      console.log(`   Total Agents: ${chalk.blue(status.ai.agents)}`);
      console.log(`   Active Agents: ${chalk.blue(status.ai.activeAgents)}`);
      console.log(`   Total Tasks: ${chalk.blue(status.ai.totalTasks)}\n`);

      // Performance
      console.log(chalk.green('⚡ Performance:'));
      console.log(`   Memory Usage: ${chalk.blue(status.performance.memory + '%')}`);
      console.log(`   CPU Usage: ${chalk.blue(status.performance.cpu + '%')}`);
      console.log(`   Response Time: ${chalk.blue(status.performance.responseTime + 'ms')}\n`);

    } catch (error) {
      console.error(chalk.red('❌ Failed to fetch system status:'), error.message);
    }
  }

  /**
   * Start interactive chat session with AI agents
   */
  async interactive() {
    console.log(chalk.blue.bold('\n🤖 AuraOS Interactive Chat\n'));
    console.log(chalk.gray('Type "exit" to quit, "help" for commands, "status" for system info\n'));

    while (true) {
      const { message } = await inquirer.prompt([
        {
          type: 'input',
          name: 'message',
          message: chalk.cyan('You:'),
          validate: (input) => input.trim().length > 0 || 'Please enter a message'
        }
      ]);

      if (message.toLowerCase() === 'exit') {
        console.log(chalk.yellow('\n👋 Goodbye!'));
        break;
      }

      if (message.toLowerCase() === 'help') {
        this.showHelp();
        continue;
      }

      if (message.toLowerCase() === 'status') {
        await this.status();
        continue;
      }

      try {
        console.log(chalk.blue('🤖 AuraOS:'), 'Processing...');
        
        const response = await axios.post(`${this.baseUrl}/api/ai/chat`, {
          message: message,
          context: 'cli_interaction'
        });

        console.log(chalk.green('🤖 AuraOS:'), response.data.response);
        console.log(''); // Empty line for readability

      } catch (error) {
        console.error(chalk.red('❌ Error:'), error.response?.data?.message || error.message);
      }
    }
  }

  /**
   * Run predefined demo interactions
   */
  async demo() {
    console.log(chalk.blue.bold('\n🎭 AuraOS Demo Mode\n'));
    
    const demos = [
      {
        name: 'System Health Check',
        action: async () => {
          console.log(chalk.yellow('🔍 Running system health check...'));
          await this.status();
        }
      },
      {
        name: 'AI Agent Interaction',
        action: async () => {
          console.log(chalk.yellow('🤖 Testing AI agent interaction...'));
          try {
            const response = await axios.post(`${this.baseUrl}/api/ai/chat`, {
              message: 'Hello! Can you help me understand what AuraOS can do?',
              context: 'demo'
            });
            console.log(chalk.green('🤖 AI Response:'), response.data.response);
          } catch (error) {
            console.error(chalk.red('❌ Error:'), error.message);
          }
        }
      },
      {
        name: 'Autopilot Status',
        action: async () => {
          console.log(chalk.yellow('🚀 Checking autopilot status...'));
          try {
            const response = await axios.get(`${this.baseUrl}/api/autopilot/status`);
            console.log(chalk.green('📊 Autopilot:'), JSON.stringify(response.data, null, 2));
          } catch (error) {
            console.error(chalk.red('❌ Error:'), error.message);
          }
        }
      },
      {
        name: 'Workflow Templates',
        action: async () => {
          console.log(chalk.yellow('📋 Fetching workflow templates...'));
          try {
            const response = await axios.get(`${this.baseUrl}/api/workflows/templates`);
            console.log(chalk.green('📋 Templates:'), response.data.length + ' templates available');
          } catch (error) {
            console.error(chalk.red('❌ Error:'), error.message);
          }
        }
      }
    ];

    for (const demo of demos) {
      console.log(chalk.cyan(`\n▶️  ${demo.name}`));
      await demo.action();
      console.log(chalk.gray('─────────────────────────────────────────'));
      
      // Wait a moment between demos
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(chalk.green.bold('\n✅ Demo completed successfully!'));
  }

  /**
   * Monitor real-time system events
   */
  async monitor() {
    console.log(chalk.blue.bold('\n📡 AuraOS Real-time Monitor\n'));
    console.log(chalk.gray('Press Ctrl+C to exit monitor mode\n'));

    try {
      this.wsConnection = new WebSocket(`${this.baseUrl.replace('http', 'ws')}/ws`);
      
      this.wsConnection.on('open', () => {
        console.log(chalk.green('✅ Connected to AuraOS real-time stream'));
      });

      this.wsConnection.on('message', (data) => {
        try {
          const event = JSON.parse(data.toString());
          const timestamp = new Date(event.timestamp).toLocaleTimeString();
          
          if (event.type === 'log') {
            console.log(chalk.gray(`[${timestamp}]`), event.message);
          } else if (event.type === 'autopilot') {
            console.log(chalk.blue(`[${timestamp}]`), `🤖 Autopilot: ${event.message}`);
          } else if (event.type === 'ai') {
            console.log(chalk.green(`[${timestamp}]`), `🧠 AI: ${event.message}`);
          } else {
            console.log(chalk.yellow(`[${timestamp}]`), `📊 ${event.type}: ${event.message}`);
          }
        } catch (error) {
          console.log(chalk.red('❌ Failed to parse event:'), data.toString());
        }
      });

      this.wsConnection.on('close', () => {
        console.log(chalk.yellow('\n📡 Connection closed'));
      });

      this.wsConnection.on('error', (error) => {
        console.error(chalk.red('❌ WebSocket error:'), error.message);
      });

    } catch (error) {
      console.error(chalk.red('❌ Failed to connect to real-time stream:'), error.message);
    }
  }

  /**
   * Show help information
   */
  private showHelp() {
    console.log(chalk.blue.bold('\n📚 AuraOS CLI Help\n'));
    console.log(chalk.green('Available Commands:'));
    console.log('  help     - Show this help message');
    console.log('  status   - Display system status');
    console.log('  exit     - Exit the interactive session');
    console.log('\n' + chalk.green('CLI Commands:'));
    console.log('  auraos status     - Show system status');
    console.log('  auraos interactive - Start interactive chat');
    console.log('  auraos demo       - Run demo interactions');
    console.log('  auraos monitor    - Monitor real-time events');
    console.log('');
  }

  /**
   * Format uptime in human readable format
   */
  private formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    if (this.wsConnection) {
      this.wsConnection.close();
    }
  }
}

// CLI Setup
const program = new Command();
const cli = new AuraOSCLI();

program
  .name('auraos')
  .description('AuraOS Command Line Interface')
  .version('1.0.0');

program
  .command('status')
  .description('Display system status information')
  .action(async () => {
    await cli.status();
    process.exit(0);
  });

program
  .command('interactive')
  .description('Start interactive chat session')
  .action(async () => {
    await cli.interactive();
    process.exit(0);
  });

program
  .command('demo')
  .description('Run predefined demo interactions')
  .action(async () => {
    await cli.demo();
    process.exit(0);
  });

program
  .command('monitor')
  .description('Monitor real-time system events')
  .action(async () => {
    await cli.monitor();
    // Keep process alive for WebSocket connection
    process.on('SIGINT', () => {
      cli.cleanup();
      console.log(chalk.yellow('\n👋 Monitor stopped'));
      process.exit(0);
    });
  });

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error(chalk.red('❌ Uncaught Exception:'), error.message);
  cli.cleanup();
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error(chalk.red('❌ Unhandled Rejection:'), reason);
  cli.cleanup();
  process.exit(1);
});

// Parse command line arguments
program.parse();

// If no command provided, show help
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
