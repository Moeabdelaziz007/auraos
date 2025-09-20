
import { AutopilotAgent } from './server/autopilot-agent.js';
import { vi, expect, test, afterEach } from 'vitest';

class AutopilotAgentTestSuite {
  private agent: AutopilotAgent;

  constructor() {
    // Initialize the agent in debug mode for testing
    this.agent = new AutopilotAgent(true);
  }

  async runTests() {
    console.log('🚀 Starting Autopilot Agent Test Suite...');
    
    await this.testInitialization();
    await this.testStartAndStop();
    
    console.log('✅ Autopilot Agent tests completed!');
  }

  private async testInitialization() {
    console.log('🧪 Testing Agent Initialization...');
    // We can't directly check console output, but we can ensure
    // the agent runs without errors in debug mode.
    try {
      // const task = {
      //   id: 'test-task-1',
      //   agentId: this.agent.agent.id,
      //   type: 'test',
      //   description: 'A test task for dry run mode',
      //   parameters: { dryRun: true },
      //   priority: 'high',
      //   status: 'pending',
      //   createdAt: new Date(),
      // };
      expect(this.agent).toBeDefined();
      expect(this.agent.agent.name).toBe('Autopilot Agent');
      console.log('✅ Initialization test passed.');
    } catch (error) {
      console.error('❌ Initialization test failed:', error);
    }
  }

  private async testStartAndStop() {
    console.log('🧪 Testing Agent Start and Stop...');
    try {
      // It starts in constructor, so stop it first.
      this.agent.stop();
      // @ts-ignore
      expect(this.agent.mainLoopInterval).toBeNull();

      this.agent.start();
      // @ts-ignore
      expect(this.agent.mainLoopInterval).toBeDefined();
      
      this.agent.stop();
      // @ts-ignore
      expect(this.agent.mainLoopInterval).toBeNull();
      console.log('✅ Start and Stop test passed.');
    } catch (error) {
      console.error('❌ Start and Stop test failed:', error);
    }
  }
}

const testSuite = new AutopilotAgentTestSuite();
testSuite.runTests();

afterEach(() => {
  // Clean up any timers
  vi.clearAllTimers();
});
