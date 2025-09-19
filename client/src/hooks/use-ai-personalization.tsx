// React Hooks for AI Personalization
// Easy-to-use hooks for machine learning-based personalization

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './use-auth';
import { 
  AIPersonalizationEngine,
  UserProfile,
  Recommendation,
  PersonalizationInsight
} from '../lib/ai-personalization';

/**
 * Hook for AI-powered personalization
 */
export function useAIPersonalization() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Analyze user behavior and generate profile
  const analyzeBehavior = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const userProfile = await AIPersonalizationEngine.analyzeUserBehavior(user.uid);
      setProfile(userProfile);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Learn from user feedback
  const learnFromFeedback = useCallback(async (
    itemId: string,
    feedback: 'positive' | 'negative' | 'neutral',
    context?: Record<string, any>
  ) => {
    if (!user) return;

    try {
      await AIPersonalizationEngine.learnFromFeedback(user.uid, itemId, feedback, context);
      // Refresh profile after learning
      await analyzeBehavior();
    } catch (err: any) {
      setError(err.message);
    }
  }, [user, analyzeBehavior]);

  // Auto-analyze when user changes
  useEffect(() => {
    if (user && !profile) {
      analyzeBehavior();
    }
  }, [user, profile, analyzeBehavior]);

  return {
    profile,
    loading,
    error,
    analyzeBehavior,
    learnFromFeedback,
    refresh: analyzeBehavior
  };
}

/**
 * Hook for personalized recommendations
 */
export function usePersonalizedRecommendations(type?: 'content' | 'feature' | 'workflow' | 'agent') {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRecommendations = useCallback(async (
    recommendationType: 'content' | 'feature' | 'workflow' | 'agent' = 'content',
    limit: number = 10
  ) => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const recs = await AIPersonalizationEngine.generateRecommendations(
        user.uid,
        recommendationType,
        limit
      );
      setRecommendations(recs);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load recommendations when type changes
  useEffect(() => {
    if (user && type) {
      loadRecommendations(type);
    }
  }, [user, type, loadRecommendations]);

  return {
    recommendations,
    loading,
    error,
    loadRecommendations,
    refresh: () => type && loadRecommendations(type)
  };
}

/**
 * Hook for personalization insights
 */
export function usePersonalizationInsights() {
  const { user } = useAuth();
  const [insights, setInsights] = useState<PersonalizationInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadInsights = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const userInsights = await AIPersonalizationEngine.generateInsights(user.uid);
      setInsights(userInsights);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load insights when user changes
  useEffect(() => {
    if (user) {
      loadInsights();
    }
  }, [user, loadInsights]);

  return {
    insights,
    loading,
    error,
    loadInsights,
    refresh: loadInsights
  };
}

/**
 * Hook for user behavior tracking with personalization
 */
export function usePersonalizedTracking() {
  const { user } = useAuth();
  const { learnFromFeedback } = useAIPersonalization();

  // Track interaction with personalization learning
  const trackInteraction = useCallback(async (
    itemId: string,
    action: 'view' | 'click' | 'like' | 'share' | 'complete',
    context?: Record<string, any>
  ) => {
    if (!user) return;

    try {
      // Determine feedback based on action
      let feedback: 'positive' | 'negative' | 'neutral' = 'neutral';
      
      switch (action) {
        case 'like':
        case 'share':
        case 'complete':
          feedback = 'positive';
          break;
        case 'view':
        case 'click':
          feedback = 'neutral';
          break;
        default:
          feedback = 'neutral';
      }

      // Learn from the interaction
      await learnFromFeedback(itemId, feedback, {
        action,
        ...context
      });
    } catch (error) {
      console.error('Error tracking personalized interaction:', error);
    }
  }, [user, learnFromFeedback]);

  // Track content engagement
  const trackContentEngagement = useCallback(async (
    contentId: string,
    engagementType: 'view' | 'like' | 'comment' | 'share',
    metadata?: Record<string, any>
  ) => {
    await trackInteraction(contentId, engagementType, {
      contentType: 'content',
      engagementType,
      ...metadata
    });
  }, [trackInteraction]);

  // Track feature usage
  const trackFeatureUsage = useCallback(async (
    featureId: string,
    usageType: 'open' | 'use' | 'complete',
    metadata?: Record<string, any>
  ) => {
    await trackInteraction(featureId, usageType, metadata);
  }, [trackInteraction]);

  // Track workflow interaction
  const trackWorkflowInteraction = useCallback(async (
    workflowId: string,
    interactionType: 'view' | 'install' | 'execute' | 'complete',
    metadata?: Record<string, any>
  ) => {
    await trackInteraction(workflowId, interactionType, {
      contentType: 'workflow',
      interactionType,
      ...metadata
    });
  }, [trackInteraction]);

  return {
    trackInteraction,
    trackContentEngagement,
    trackFeatureUsage,
    trackWorkflowInteraction
  };
}

/**
 * Hook for smart content suggestions
 */
export function useSmartSuggestions() {
  const { recommendations, loading, error } = usePersonalizedRecommendations('content');
  const { trackContentEngagement } = usePersonalizedTracking();

  // Get suggestions for specific context
  const getContextualSuggestions = useCallback((context: string) => {
    return recommendations.filter(rec => 
      rec.metadata?.context === context || 
      rec.category === context
    );
  }, [recommendations]);

  // Track suggestion interaction
  const trackSuggestionInteraction = useCallback(async (
    suggestionId: string,
    action: 'view' | 'click' | 'dismiss',
    metadata?: Record<string, any>
  ) => {
    await trackContentEngagement(suggestionId, action as any, {
      suggestionType: 'ai_generated',
      ...metadata
    });
  }, [trackContentEngagement]);

  return {
    suggestions: recommendations,
    loading,
    error,
    getContextualSuggestions,
    trackSuggestionInteraction
  };
}

/**
 * Hook for adaptive UI personalization
 */
export function useAdaptiveUI() {
  const { profile } = useAIPersonalization();
  const [uiPreferences, setUIPreferences] = useState<Record<string, any>>({});

  // Generate UI preferences based on user profile
  useEffect(() => {
    if (!profile) return;

    const preferences: Record<string, any> = {};

    // Analyze personality traits for UI customization
    profile.personalityTraits.forEach(trait => {
      if (trait.trait === 'Tech-Savvy' && trait.score > 0.7) {
        preferences.showAdvancedFeatures = true;
        preferences.defaultView = 'detailed';
        preferences.animationLevel = 'minimal';
      } else if (trait.trait === 'Social' && trait.score > 0.6) {
        preferences.showSocialFeatures = true;
        preferences.defaultView = 'social';
        preferences.animationLevel = 'standard';
      } else if (trait.trait === 'Efficiency-Focused' && trait.score > 0.6) {
        preferences.showQuickActions = true;
        preferences.defaultView = 'compact';
        preferences.animationLevel = 'minimal';
      }
    });

    // Analyze interests for feature prioritization
    profile.interests.forEach(interest => {
      if (interest.score > 0.7) {
        preferences.prioritizedFeatures = [
          ...(preferences.prioritizedFeatures || []),
          interest.topic
        ];
      }
    });

    // Analyze behavior patterns for layout preferences
    profile.behaviorPatterns.forEach(pattern => {
      if (pattern.pattern.includes('frequently') && pattern.confidence > 0.8) {
        preferences.frequentActions = [
          ...(preferences.frequentActions || []),
          pattern.pattern
        ];
      }
    });

    setUIPreferences(preferences);
  }, [profile]);

  // Get personalized layout configuration
  const getLayoutConfig = useCallback(() => {
    return {
      sidebar: {
        showAdvancedFeatures: uiPreferences.showAdvancedFeatures || false,
        prioritizedItems: uiPreferences.prioritizedFeatures || []
      },
      dashboard: {
        defaultView: uiPreferences.defaultView || 'standard',
        showQuickActions: uiPreferences.showQuickActions || false,
        showSocialFeatures: uiPreferences.showSocialFeatures || false
      },
      animations: {
        level: uiPreferences.animationLevel || 'standard'
      }
    };
  }, [uiPreferences]);

  // Get personalized theme configuration
  const getThemeConfig = useCallback(() => {
    if (!profile) return {};

    const themeConfig: Record<string, any> = {};

    // Adjust theme based on usage patterns
    const nightUsage = profile.behaviorPatterns.some(p => 
      p.timeOfDay === 'night' && p.confidence > 0.7
    );

    if (nightUsage) {
      themeConfig.autoDarkMode = true;
      themeConfig.preferredTheme = 'dark';
    }

    return themeConfig;
  }, [profile]);

  return {
    uiPreferences,
    getLayoutConfig,
    getThemeConfig,
    isAdaptive: Object.keys(uiPreferences).length > 0
  };
}

export default useAIPersonalization;
