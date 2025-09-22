
import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Agent } from '../apps/ai-agents/data';

// Assuming Execution and ExecutionStep interfaces are defined somewhere
// For now, let's define them here.
export interface ExecutionStep {
  id: string;
  plugin: string;
  action: string;
  status: 'pending' | 'completed' | 'failed';
}

export interface Execution {
  id: string;
  agentId: string;
  task: string;
  timestamp: number;
  status: 'running' | 'completed' | 'failed';
  steps: ExecutionStep[];
  result: any;
}

export const useAgentExecutor = () => {
  const [isExecuting, setIsExecuting] = useState(false);
  const [executions, setExecutions] = useState<Execution[]>([]);

  const executeAgentTask = useCallback(async (agent: Agent, task: string, role: string) => {
    setIsExecuting(true);
    const executionId = uuidv4();
    const newExecution: Execution = {
      id: executionId,
      agentId: agent.id,
      task,
      timestamp: Date.now(),
      status: 'running',
      steps: [],
      result: null,
    };

    setExecutions(prev => [newExecution, ...prev]);

    // Simulate agent execution
    await new Promise(resolve => setTimeout(resolve, 2000));

    const finalExecution: Execution = {
      ...newExecution,
      status: 'completed',
      result: { message: 'Task completed successfully' },
      steps: agent.plugins.map(pluginId => ({
        id: uuidv4(),
        plugin: pluginId,
        action: 'Simulated action',
        status: 'completed'
      }))
    };

    setExecutions(prev => prev.map(e => e.id === executionId ? finalExecution : e));
    setIsExecuting(false);
  }, []);

  return { isExecuting, executions, executeAgentTask };
};
