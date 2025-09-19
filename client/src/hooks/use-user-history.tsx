// React Hooks for User History Tracking
// Provides easy-to-use hooks for tracking user actions throughout the app

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './use-auth';
import { 
  UserHistoryService 
} from '../lib/user-history-service';
import { 
  UserHistory, 
  UserSession, 
  UserAnalytics,
  ActionType,
  ActionCategory 
} from '../lib/firestore-types';

/**
 * Hook for tracking user actions
 */
export function useUserHistory() {
  const { user } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentSession, setCurrentSession] = useState<UserSession | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize history tracking when user logs in
  useEffect(() => {
    if (user && !isInitialized) {
      UserHistoryService.initialize(user.uid)
        .then(() => {
          setIsInitialized(true);
          setError(null);
        })
        .catch((err) => {
          setError(err.message);
          console.error('Failed to initialize user history:', err);
        });
    } else if (!user && isInitialized) {
      setIsInitialized(false);
      setCurrentSession(null);
    }
  }, [user, isInitialized]);

  // Track navigation
  const trackNavigation = useCallback((
    page: string, 
    previousPage?: string, 
    duration?: number
  ) => {
    if (user && isInitialized) {
      UserHistoryService.trackNavigation(user.uid, page, previousPage, duration);
    }
  }, [user, isInitialized]);

  // Track content interaction
  const trackContentInteraction = useCallback((
    actionType: ActionType,
    targetType: string,
    targetId: string,
    details?: Record<string, any>
  ) => {
    if (user && isInitialized) {
      UserHistoryService.trackContentInteraction(
        user.uid, 
        actionType, 
        targetType, 
        targetId, 
        details
      );
    }
  }, [user, isInitialized]);

  // Track AI interaction
  const trackAIInteraction = useCallback((
    actionType: ActionType,
    agentId?: string,
    details?: Record<string, any>
  ) => {
    if (user && isInitialized) {
      UserHistoryService.trackAIInteraction(user.uid, actionType, agentId, details);
    }
  }, [user, isInitialized]);

  // Track social interaction
  const trackSocialInteraction = useCallback((
    actionType: ActionType,
    targetId: string,
    details?: Record<string, any>
  ) => {
    if (user && isInitialized) {
      UserHistoryService.trackSocialInteraction(user.uid, actionType, targetId, details);
    }
  }, [user, isInitialized]);

  // Track workflow interaction
  const trackWorkflowInteraction = useCallback((
    actionType: ActionType,
    workflowId: string,
    details?: Record<string, any>
  ) => {
    if (user && isInitialized) {
      UserHistoryService.trackWorkflowInteraction(user.uid, actionType, workflowId, details);
    }
  }, [user, isInitialized]);

  // Track errors
  const trackError = useCallback((
    error: Error,
    context?: string,
    details?: Record<string, any>
  ) => {
    if (user && isInitialized) {
      UserHistoryService.trackError(user.uid, error, context, details);
    }
  }, [user, isInitialized]);

  return {
    isInitialized,
    currentSession,
    error,
    trackNavigation,
    trackContentInteraction,
    trackAIInteraction,
    trackSocialInteraction,
    trackWorkflowInteraction,
    trackError
  };
}

/**
 * Hook for tracking page views with automatic duration calculation
 */
export function usePageTracking(pageName: string) {
  const { trackNavigation } = useUserHistory();
  const [previousPage, setPreviousPage] = useState<string | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  // Track page entry
  useEffect(() => {
    const startTime = Date.now();
    startTimeRef.current = startTime;

    // Calculate duration for previous page
    if (previousPage) {
      const duration = startTime - startTimeRef.current;
      trackNavigation(pageName, previousPage, duration);
    } else {
      trackNavigation(pageName);
    }

    setPreviousPage(pageName);

    // Track page exit
    return () => {
      const duration = Date.now() - startTimeRef.current;
      if (duration > 1000) { // Only track if user spent more than 1 second
        trackNavigation(pageName, undefined, duration);
      }
    };
  }, [pageName, trackNavigation, previousPage]);
}

/**
 * Hook for tracking component interactions
 */
export function useInteractionTracking(componentName: string) {
  const { trackContentInteraction } = useUserHistory();

  const trackClick = useCallback((targetId: string, details?: Record<string, any>) => {
    trackContentInteraction('click', componentName, targetId, details);
  }, [trackContentInteraction, componentName]);

  const trackView = useCallback((targetId: string, details?: Record<string, any>) => {
    trackContentInteraction('view', componentName, targetId, details);
  }, [trackContentInteraction, componentName]);

  const trackCreate = useCallback((targetId: string, details?: Record<string, any>) => {
    trackContentInteraction('create', componentName, targetId, details);
  }, [trackContentInteraction, componentName]);

  const trackUpdate = useCallback((targetId: string, details?: Record<string, any>) => {
    trackContentInteraction('update', componentName, targetId, details);
  }, [trackContentInteraction, componentName]);

  const trackDelete = useCallback((targetId: string, details?: Record<string, any>) => {
    trackContentInteraction('delete', componentName, targetId, details);
  }, [trackContentInteraction, componentName]);

  return {
    trackClick,
    trackView,
    trackCreate,
    trackUpdate,
    trackDelete
  };
}

/**
 * Hook for getting user history data
 */
export function useUserHistoryData(options: {
  limit?: number;
  actionType?: ActionType;
  category?: ActionCategory;
} = {}) {
  const { user } = useAuth();
  const [history, setHistory] = useState<UserHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState<any>(null);

  const loadHistory = useCallback(async (reset = false) => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const result = await UserHistoryService.getUserHistory(user.uid, {
        ...options,
        startAfter: reset ? undefined : lastDoc
      });

      if (reset) {
        setHistory(result.history);
      } else {
        setHistory(prev => [...prev, ...result.history]);
      }

      setLastDoc(result.lastDoc);
      setHasMore(result.history.length === (options.limit || 50));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, options, lastDoc]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadHistory(false);
    }
  }, [loading, hasMore, loadHistory]);

  const refresh = useCallback(() => {
    setLastDoc(null);
    setHasMore(true);
    loadHistory(true);
  }, [loadHistory]);

  useEffect(() => {
    loadHistory(true);
  }, [user]);

  return {
    history,
    loading,
    error,
    hasMore,
    loadMore,
    refresh
  };
}

/**
 * Hook for getting user sessions
 */
export function useUserSessions() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSessions = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const data = await UserHistoryService.getUserSessions(user.uid);
      setSessions(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  return {
    sessions,
    loading,
    error,
    refresh: loadSessions
  };
}

/**
 * Hook for user analytics
 */
export function useUserAnalytics(period: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly') {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const generateAnalytics = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const data = await UserHistoryService.generateUserAnalytics(user.uid, period);
      setAnalytics(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, period]);

  useEffect(() => {
    generateAnalytics();
  }, [generateAnalytics]);

  return {
    analytics,
    loading,
    error,
    refresh: generateAnalytics
  };
}

/**
 * Hook for tracking form interactions
 */
export function useFormTracking(formName: string) {
  const { trackContentInteraction } = useUserHistory();
  const [formStartTime, setFormStartTime] = useState<number | null>(null);
  const [fieldInteractions, setFieldInteractions] = useState<Record<string, number>>({});

  const trackFormStart = useCallback(() => {
    setFormStartTime(Date.now());
    trackContentInteraction('view', 'form', formName, { action: 'form_start' });
  }, [trackContentInteraction, formName]);

  const trackFieldFocus = useCallback((fieldName: string) => {
    setFieldInteractions(prev => ({
      ...prev,
      [fieldName]: (prev[fieldName] || 0) + 1
    }));
    trackContentInteraction('click', 'form_field', fieldName, { 
      form: formName,
      action: 'field_focus' 
    });
  }, [trackContentInteraction, formName]);

  const trackFormSubmit = useCallback((success: boolean, fieldData?: Record<string, any>) => {
    const duration = formStartTime ? Date.now() - formStartTime : 0;
    trackContentInteraction('create', 'form', formName, {
      action: 'form_submit',
      success,
      duration,
      fieldInteractions,
      fieldData
    });
  }, [trackContentInteraction, formName, formStartTime, fieldInteractions]);

  const trackFormAbandon = useCallback(() => {
    const duration = formStartTime ? Date.now() - formStartTime : 0;
    trackContentInteraction('navigate', 'form', formName, {
      action: 'form_abandon',
      duration,
      fieldInteractions
    });
  }, [trackContentInteraction, formName, formStartTime, fieldInteractions]);

  return {
    trackFormStart,
    trackFieldFocus,
    trackFormSubmit,
    trackFormAbandon
  };
}

/**
 * Hook for tracking search behavior
 */
export function useSearchTracking() {
  const { trackContentInteraction } = useUserHistory();

  const trackSearch = useCallback((
    query: string,
    resultsCount: number,
    filters?: Record<string, any>
  ) => {
    trackContentInteraction('search', 'search', 'query', {
      query,
      resultsCount,
      filters
    });
  }, [trackContentInteraction]);

  const trackSearchResultClick = useCallback((
    resultId: string,
    position: number,
    query: string
  ) => {
    trackContentInteraction('click', 'search_result', resultId, {
      position,
      query
    });
  }, [trackContentInteraction]);

  return {
    trackSearch,
    trackSearchResultClick
  };
}

export default useUserHistory;
