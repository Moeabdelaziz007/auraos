// React Hooks for Workflow Automation
// Easy-to-use hooks for workflow templates and marketplace

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './use-auth';
import { 
  WorkflowAutomationEngine,
  WorkflowTemplate,
  WorkflowMarketplace,
  WorkflowExecution,
  WorkflowFilters
} from '../lib/workflow-automation';

/**
 * Hook for workflow marketplace
 */
export function useWorkflowMarketplace(filters?: WorkflowFilters) {
  const { user } = useAuth();
  const [marketplace, setMarketplace] = useState<WorkflowMarketplace | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMarketplace = useCallback(async (marketplaceFilters?: WorkflowFilters) => {
    try {
      setLoading(true);
      setError(null);
      const data = await WorkflowAutomationEngine.getMarketplace(marketplaceFilters);
      setMarketplace(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load marketplace when filters change
  useEffect(() => {
    loadMarketplace(filters);
  }, [loadMarketplace, filters]);

  // Search templates
  const searchTemplates = useCallback(async (query: string, searchFilters?: WorkflowFilters) => {
    try {
      setLoading(true);
      setError(null);
      const results = await WorkflowAutomationEngine.searchTemplates(query, searchFilters);
      setMarketplace(prev => prev ? { ...prev, searchResults: results } : null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    marketplace,
    loading,
    error,
    loadMarketplace,
    searchTemplates,
    refresh: () => loadMarketplace(filters)
  };
}

/**
 * Hook for workflow template management
 */
export function useWorkflowTemplate(templateId?: string) {
  const { user } = useAuth();
  const [template, setTemplate] = useState<WorkflowTemplate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTemplate = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await WorkflowAutomationEngine.getTemplate(id);
      setTemplate(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load template when ID changes
  useEffect(() => {
    if (templateId) {
      loadTemplate(templateId);
    }
  }, [templateId, loadTemplate]);

  // Create workflow from template
  const createWorkflow = useCallback(async (
    templateId: string,
    customizations?: Record<string, any>
  ) => {
    if (!user) throw new Error('User not authenticated');

    try {
      setLoading(true);
      setError(null);
      const workflowId = await WorkflowAutomationEngine.createWorkflowFromTemplate(
        templateId,
        user.uid,
        customizations
      );
      return workflowId;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  return {
    template,
    loading,
    error,
    loadTemplate,
    createWorkflow,
    refresh: () => templateId && loadTemplate(templateId)
  };
}

/**
 * Hook for workflow execution
 */
export function useWorkflowExecution(workflowId?: string) {
  const { user } = useAuth();
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [currentExecution, setCurrentExecution] = useState<WorkflowExecution | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Execute workflow
  const executeWorkflow = useCallback(async (
    workflowId: string,
    variables?: Record<string, any>
  ) => {
    if (!user) throw new Error('User not authenticated');

    try {
      setLoading(true);
      setError(null);
      const execution = await WorkflowAutomationEngine.executeWorkflow(
        workflowId,
        user.uid,
        variables
      );
      setCurrentExecution(execution);
      setExecutions(prev => [execution, ...prev]);
      return execution;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Get execution status
  const getExecutionStatus = useCallback(async (executionId: string) => {
    try {
      setLoading(true);
      setError(null);
      const status = await WorkflowAutomationEngine.getExecutionStatus(executionId);
      if (status) {
        setCurrentExecution(status);
        setExecutions(prev => 
          prev.map(exec => exec.id === executionId ? status : exec)
        );
      }
      return status;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    executions,
    currentExecution,
    loading,
    error,
    executeWorkflow,
    getExecutionStatus
  };
}

/**
 * Hook for intelligent workflow recommendations
 */
export function useIntelligentWorkflowRecommendations(limit: number = 5) {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<WorkflowTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRecommendations = useCallback(async (recommendationLimit: number = limit) => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const recs = await WorkflowAutomationEngine.getIntelligentRecommendations(
        user.uid,
        recommendationLimit
      );
      setRecommendations(recs);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, limit]);

  // Load recommendations when user changes
  useEffect(() => {
    if (user) {
      loadRecommendations();
    }
  }, [user, loadRecommendations]);

  return {
    recommendations,
    loading,
    error,
    loadRecommendations,
    refresh: () => loadRecommendations(limit)
  };
}

/**
 * Hook for user's custom workflows
 */
export function useUserWorkflows() {
  const { user } = useAuth();
  const [workflows, setWorkflows] = useState<WorkflowTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadWorkflows = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const userWorkflows = await WorkflowAutomationEngine.getUserWorkflows(user.uid);
      setWorkflows(userWorkflows);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load workflows when user changes
  useEffect(() => {
    if (user) {
      loadWorkflows();
    }
  }, [user, loadWorkflows]);

  // Publish workflow template
  const publishTemplate = useCallback(async (
    template: Omit<WorkflowTemplate, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'downloads'>
  ) => {
    if (!user) throw new Error('User not authenticated');

    try {
      setLoading(true);
      setError(null);
      const templateId = await WorkflowAutomationEngine.publishTemplate(template, user.uid);
      // Refresh workflows after publishing
      await loadWorkflows();
      return templateId;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, loadWorkflows]);

  return {
    workflows,
    loading,
    error,
    loadWorkflows,
    publishTemplate,
    refresh: loadWorkflows
  };
}

/**
 * Hook for workflow analytics
 */
export function useWorkflowAnalytics(workflowId?: string) {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await WorkflowAutomationEngine.getWorkflowAnalytics(id);
      setAnalytics(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load analytics when workflow ID changes
  useEffect(() => {
    if (workflowId) {
      loadAnalytics(workflowId);
    }
  }, [workflowId, loadAnalytics]);

  return {
    analytics,
    loading,
    error,
    loadAnalytics,
    refresh: () => workflowId && loadAnalytics(workflowId)
  };
}

/**
 * Hook for workflow builder
 */
export function useWorkflowBuilder() {
  const [workflow, setWorkflow] = useState<Partial<WorkflowTemplate>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  // Update workflow
  const updateWorkflow = useCallback((updates: Partial<WorkflowTemplate>) => {
    setWorkflow(prev => ({ ...prev, ...updates }));
    setIsDirty(true);
  }, []);

  // Add step to workflow
  const addStep = useCallback((step: any) => {
    setWorkflow(prev => ({
      ...prev,
      steps: [...(prev.steps || []), step]
    }));
    setIsDirty(true);
  }, []);

  // Update step
  const updateStep = useCallback((stepId: string, updates: any) => {
    setWorkflow(prev => ({
      ...prev,
      steps: prev.steps?.map(step => 
        step.id === stepId ? { ...step, ...updates } : step
      ) || []
    }));
    setIsDirty(true);
  }, []);

  // Remove step
  const removeStep = useCallback((stepId: string) => {
    setWorkflow(prev => ({
      ...prev,
      steps: prev.steps?.filter(step => step.id !== stepId) || []
    }));
    setIsDirty(true);
  }, []);

  // Save workflow
  const saveWorkflow = useCallback(async () => {
    try {
      setSaving(true);
      // In a real implementation, this would save to the backend
      console.log('Saving workflow:', workflow);
      setIsDirty(false);
    } catch (error) {
      console.error('Error saving workflow:', error);
      throw error;
    } finally {
      setSaving(false);
    }
  }, [workflow]);

  // Reset workflow
  const resetWorkflow = useCallback(() => {
    setWorkflow({});
    setIsDirty(false);
  }, []);

  return {
    workflow,
    isDirty,
    saving,
    updateWorkflow,
    addStep,
    updateStep,
    removeStep,
    saveWorkflow,
    resetWorkflow
  };
}

/**
 * Hook for workflow testing
 */
export function useWorkflowTesting(workflowId?: string) {
  const { executeWorkflow } = useWorkflowExecution();
  const [testResults, setTestResults] = useState<any[]>([]);
  const [testing, setTesting] = useState(false);

  // Test workflow with sample data
  const testWorkflow = useCallback(async (
    testData: Record<string, any>[],
    workflowIdToTest?: string
  ) => {
    const targetWorkflowId = workflowIdToTest || workflowId;
    if (!targetWorkflowId) throw new Error('No workflow ID provided');

    try {
      setTesting(true);
      const results = [];

      for (const data of testData) {
        const execution = await executeWorkflow(targetWorkflowId, data);
        results.push({
          input: data,
          execution,
          success: execution.status === 'completed'
        });
      }

      setTestResults(results);
      return results;
    } catch (error) {
      console.error('Error testing workflow:', error);
      throw error;
    } finally {
      setTesting(false);
    }
  }, [executeWorkflow, workflowId]);

  return {
    testResults,
    testing,
    testWorkflow
  };
}

export default useWorkflowMarketplace;
