
import { AutopilotAgent } from './server/autopilot-agent.js';
import { vi, expect, test, describe, beforeEach, afterEach } from 'vitest';
import { AIAgent } from './server/advanced-ai-agents.js';

// Mock external dependencies to isolate the AutopilotAgent during tests.
const mockAgentSystem = {
  createAgent: vi.fn(() => ({ id: 'autopilot-agent-id', name: 'Autopilot Agent' })),
  updateAgent: vi.fn(),
  getAgentsByType: vi.fn(),
  assignTask: vi.fn(),
};
vi.mock('./server/advanced-ai-agents.js', () => ({
  getAdvancedAIAgentSystem: vi.fn(() => mockAgentSystem),
}));

const mockAutomationEngine = {
  getAutomationStats: vi.fn(),
};
vi.mock('./server/advanced-automation.js', () => ({
  getAdvancedAutomationEngine: vi.fn(() => mockAutomationEngine),
}));

const mockWorkflowOrchestrator = {
  getWorkflowStats: vi.fn(),
};
vi.mock('./server/intelligent-workflow.js', () => ({
  getIntelligentWorkflowOrchestrator: vi.fn(() => mockWorkflowOrchestrator),
}));

const mockSelfImprovingSystem = {
  runImprovementCycle: vi.fn(),
};
vi.mock('./server/self-improving-ai.js', () => ({
  getSelfImprovingAISystem: vi.fn(() => mockSelfImprovingSystem),
}));

vi.mock('firebase-admin/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
}));

describe('AutopilotAgent', () => {
  let agent: AutopilotAgent;

  beforeEach(() => {
    vi.clearAllMocks();
    // Initialize the agent in debug mode for testing
    // The agent starts its main loop in the constructor, so we stop it immediately
    // to isolate our tests.
    agent = new AutopilotAgent(true);
    agent.stop();
  });

  afterEach(() => {
    // Ensure the agent is stopped and timers are cleared after each test
    agent.stop();
    vi.clearAllTimers();
  });

  test('should initialize correctly', () => {
    expect(agent).toBeDefined();
    expect(agent.agent.name).toBe('Autopilot Agent');
    // @ts-ignore - Accessing private properties for testing
    expect(agent.isRunning).toBe(false);
    expect(agent.mainLoopTimeout).toBeNull();
  });

  test('should start and stop the main loop', () => {
    // Check initial state
    // @ts-ignore - Accessing private properties for testing
    expect(agent.isRunning).toBe(false);
    expect(agent.mainLoopTimeout).toBeNull();

    agent.start();
    // @ts-ignore - Accessing private properties for testing
    expect(agent.isRunning).toBe(true);

    agent.stop();
    // @ts-ignore - Accessing private properties for testing
    expect(agent.isRunning).toBe(false);
    expect(agent.mainLoopTimeout).toBeNull();
  });

  test('should run a cycle on a healthy system', async () => {
    // Setup mocks for a "healthy" system
    mockAutomationEngine.getAutomationStats.mockReturnValue({ averageSuccessRate: 0.95 });
    mockWorkflowOrchestrator.getWorkflowStats.mockReturnValue({ averageSuccessRate: 0.95 });

    // @ts-ignore - Accessing private method for testing
    const suggestOptimizationsSpy = vi.spyOn(agent, 'suggestOptimizations');

    // @ts-ignore - Accessing private method for testing
    await agent.runCycle();

    // Verify core monitoring functions were called
    expect(mockAutomationEngine.getAutomationStats).toHaveBeenCalled();
    expect(mockWorkflowOrchestrator.getWorkflowStats).toHaveBeenCalled();
    expect(mockSelfImprovingSystem.runImprovementCycle).toHaveBeenCalled();

    // Verify that no optimizations were suggested for a healthy system
    expect(suggestOptimizationsSpy).not.toHaveBeenCalled();
  });

  test('should suggest optimizations for an unhealthy system', async () => {
    // Setup mocks for an "unhealthy" system
    const unhealthyHealthReport = { status: 'warning', automation: { averageSuccessRate: 0.8 }, workflows: { averageSuccessRate: 0.95 } };
    mockAutomationEngine.getAutomationStats.mockReturnValue({ averageSuccessRate: 0.8 }); // Below threshold
    mockWorkflowOrchestrator.getWorkflowStats.mockReturnValue({ averageSuccessRate: 0.95 });

    // Mock the agent system to return an analysis agent
    const mockAnalysisAgent = { id: 'analysis-agent-123', name: 'Data Insights Expert' } as AIAgent;
    mockAgentSystem.getAgentsByType.mockReturnValue([mockAnalysisAgent]);
    mockAgentSystem.assignTask.mockResolvedValue({ id: 'task-456', status: 'pending' });

    // @ts-ignore - Accessing private method for testing
    await agent.runCycle();

    // Verify that an optimization task was created and assigned
    expect(mockAgentSystem.getAgentsByType).toHaveBeenCalledWith('specialist');
    expect(mockAgentSystem.assignTask).toHaveBeenCalledWith(
      mockAnalysisAgent.id,
      expect.objectContaining({
        type: 'system_health_analysis',
        priority: 'high',
        parameters: expect.objectContaining({
          healthReport: expect.objectContaining(unhealthyHealthReport),
        }),
      })
    );
  });
});
