import { AutopilotAgent } from './server/autopilot-agent.js';

class AutopilotAgentTestSuite {
  private agent: AutopilotAgent;

  constructor() {
    // Initialize the agent in debug mode for testing
    this.agent = new AutopilotAgent(true);
  }

  async runTests() {
    console.log('🚀 Starting Autopilot Agent Test Suite...');
    
    await this.testDebugMode();
    await this.testDryRun();
    
    console.log('✅ Autopilot Agent tests completed!');
  }

  private async testDebugMode() {
    console.log('🧪 Testing Debug Mode...');
    // In debug mode, the agent should output detailed logs.
    // We can't directly check console output, but we can ensure
    // the agent runs without errors in debug mode.
    try {
      await this.agent.start();
      await this.agent.autonomousLoop();
      console.log('✅ Debug Mode test passed.');
    } catch (error) {
      console.error('❌ Debug Mode test failed:', error);
    }
  }

  private async testDryRun() {
    console.log('🧪 Testing Dry Run Mode...');
    // In dry-run mode, the agent should simulate actions without
    // making actual changes.
    try {
      const task = {
        id: 'test-task-1',
        agentId: this.agent.agent.id,
        type: 'test',
        description: 'A test task for dry run mode',
        parameters: { dryRun: true },
        priority: 'high',
        status: 'pending',
        createdAt: new Date(),
      };
      
      // The agent should handle the task without throwing an error.
      await this.agent.handleNewTask(task);
      console.log('✅ Dry Run Mode test passed.');
    } catch (error) {
      console.error('❌ Dry Run Mode test failed:', error);
    }
  }
}

const testSuite = new AutopilotAgentTestSuite();
testSuite.runTests();
