// AI-Powered Personalization System
// Machine learning for user preferences and behavior analysis

import { UserHistory, UserAction, ActionType, ActionCategory } from './firestore-types';
import { UserHistoryService } from './user-history-service';

export interface UserPreference {
  id: string;
  userId: string;
  category: string;
  preference: string;
  confidence: number;
  lastUpdated: Date;
  source: 'behavioral' | 'explicit' | 'inferred';
  metadata?: Record<string, any>;
}

export interface UserProfile {
  userId: string;
  preferences: UserPreference[];
  behaviorPatterns: BehaviorPattern[];
  interests: Interest[];
  personalityTraits: PersonalityTrait[];
  lastAnalyzed: Date;
  mlModel: string;
  version: number;
}

export interface BehaviorPattern {
  id: string;
  userId: string;
  pattern: string;
  frequency: number;
  confidence: number;
  timeOfDay?: string;
  dayOfWeek?: string;
  context?: Record<string, any>;
  lastSeen: Date;
}

export interface Interest {
  id: string;
  userId: string;
  topic: string;
  score: number;
  category: string;
  sources: string[];
  lastUpdated: Date;
}

export interface PersonalityTrait {
  trait: string;
  score: number;
  confidence: number;
  evidence: string[];
}

export interface Recommendation {
  id: string;
  userId: string;
  type: 'content' | 'feature' | 'workflow' | 'agent';
  itemId: string;
  title: string;
  description: string;
  score: number;
  reason: string;
  category: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface PersonalizationInsight {
  type: 'usage_pattern' | 'preference_change' | 'new_interest' | 'behavior_anomaly';
  title: string;
  description: string;
  confidence: number;
  actionable: boolean;
  recommendations?: string[];
  metadata?: Record<string, any>;
}

/**
 * AI Personalization Engine
 * Uses machine learning to understand user preferences and behavior
 */
export class AIPersonalizationEngine {
  private static readonly MIN_CONFIDENCE_THRESHOLD = 0.7;
  private static readonly LEARNING_WINDOW_DAYS = 30;

  /**
   * Analyze user behavior and generate preferences
   */
  static async analyzeUserBehavior(userId: string): Promise<UserProfile> {
    try {
      // Get recent user history
      const { history } = await UserHistoryService.getUserHistory(userId, {
        limit: 1000
      });

      // Analyze behavior patterns
      const behaviorPatterns = this.extractBehaviorPatterns(userId, history);
      
      // Infer preferences from behavior
      const preferences = this.inferPreferences(userId, history, behaviorPatterns);
      
      // Identify interests
      const interests = this.identifyInterests(userId, history);
      
      // Analyze personality traits
      const personalityTraits = this.analyzePersonalityTraits(userId, history);

      const profile: UserProfile = {
        userId,
        preferences,
        behaviorPatterns,
        interests,
        personalityTraits,
        lastAnalyzed: new Date(),
        mlModel: 'v1.0',
        version: 1
      };

      return profile;
    } catch (error) {
      console.error('Error analyzing user behavior:', error);
      throw error;
    }
  }

  /**
   * Generate personalized recommendations
   */
  static async generateRecommendations(
    userId: string, 
    type: 'content' | 'feature' | 'workflow' | 'agent',
    limit: number = 10
  ): Promise<Recommendation[]> {
    try {
      const profile = await this.getUserProfile(userId);
      const recommendations: Recommendation[] = [];

      switch (type) {
        case 'content':
          recommendations.push(...await this.recommendContent(userId, profile));
          break;
        case 'feature':
          recommendations.push(...await this.recommendFeatures(userId, profile));
          break;
        case 'workflow':
          recommendations.push(...await this.recommendWorkflows(userId, profile));
          break;
        case 'agent':
          recommendations.push(...await this.recommendAgents(userId, profile));
          break;
      }

      return recommendations
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return [];
    }
  }

  /**
   * Learn from user feedback
   */
  static async learnFromFeedback(
    userId: string,
    itemId: string,
    feedback: 'positive' | 'negative' | 'neutral',
    context?: Record<string, any>
  ): Promise<void> {
    try {
      // Get current profile
      const profile = await this.getUserProfile(userId);
      
      // Update preferences based on feedback
      await this.updatePreferencesFromFeedback(profile, itemId, feedback, context);
      
      // Retrain ML model if needed
      await this.retrainModel(userId, profile);
      
      // Generate new insights
      await this.generateInsights(userId, profile);
    } catch (error) {
      console.error('Error learning from feedback:', error);
    }
  }

  /**
   * Generate personalization insights
   */
  static async generateInsights(userId: string, profile?: UserProfile): Promise<PersonalizationInsight[]> {
    try {
      const userProfile = profile || await this.getUserProfile(userId);
      const insights: PersonalizationInsight[] = [];

      // Analyze usage patterns
      insights.push(...await this.analyzeUsagePatterns(userId, userProfile));
      
      // Detect preference changes
      insights.push(...await this.detectPreferenceChanges(userId, userProfile));
      
      // Identify new interests
      insights.push(...await this.identifyNewInterests(userId, userProfile));
      
      // Detect behavior anomalies
      insights.push(...await this.detectBehaviorAnomalies(userId, userProfile));

      return insights.filter(insight => insight.confidence > 0.6);
    } catch (error) {
      console.error('Error generating insights:', error);
      return [];
    }
  }

  /**
   * Extract behavior patterns from user history
   */
  private static extractBehaviorPatterns(userId: string, history: UserHistory[]): BehaviorPattern[] {
    const patterns: BehaviorPattern[] = [];
    
    // Time-based patterns
    const timePatterns = this.extractTimePatterns(userId, history);
    patterns.push(...timePatterns);
    
    // Action sequence patterns
    const sequencePatterns = this.extractSequencePatterns(userId, history);
    patterns.push(...sequencePatterns);
    
    // Frequency patterns
    const frequencyPatterns = this.extractFrequencyPatterns(userId, history);
    patterns.push(...frequencyPatterns);

    return patterns;
  }

  /**
   * Extract time-based behavior patterns
   */
  private static extractTimePatterns(userId: string, history: UserHistory[]): BehaviorPattern[] {
    const patterns: BehaviorPattern[] = [];
    const timeStats: Record<string, number[]> = {};

    // Group actions by time of day
    history.forEach(action => {
      const hour = new Date(action.timestamp).getHours();
      const actionType = action.action.type;
      const key = `${actionType}_hour_${hour}`;
      
      if (!timeStats[key]) timeStats[key] = [];
      timeStats[key].push(hour);
    });

    // Identify patterns
    Object.entries(timeStats).forEach(([key, hours]) => {
      if (hours.length >= 5) { // Minimum frequency threshold
        const [actionType, , hourStr] = key.split('_');
        const hour = parseInt(hourStr);
        
        patterns.push({
          id: `time_${userId}_${key}`,
          userId,
          pattern: `User typically performs ${actionType} at ${hour}:00`,
          frequency: hours.length,
          confidence: Math.min(hours.length / 20, 1), // Normalize to 0-1
          timeOfDay: this.getTimeOfDay(hour),
          lastSeen: new Date()
        });
      }
    });

    return patterns;
  }

  /**
   * Extract action sequence patterns
   */
  private static extractSequencePatterns(userId: string, history: UserHistory[]): BehaviorPattern[] {
    const patterns: BehaviorPattern[] = [];
    const sequences: Record<string, number> = {};

    // Look for common action sequences
    for (let i = 0; i < history.length - 1; i++) {
      const current = history[i].action.type;
      const next = history[i + 1].action.type;
      const sequence = `${current}->${next}`;
      sequences[sequence] = (sequences[sequence] || 0) + 1;
    }

    // Identify significant sequences
    Object.entries(sequences).forEach(([sequence, count]) => {
      if (count >= 3) { // Minimum sequence frequency
        patterns.push({
          id: `sequence_${userId}_${sequence}`,
          userId,
          pattern: `User often follows ${sequence.split('->')[0]} with ${sequence.split('->')[1]}`,
          frequency: count,
          confidence: Math.min(count / 10, 1),
          lastSeen: new Date()
        });
      }
    });

    return patterns;
  }

  /**
   * Extract frequency patterns
   */
  private static extractFrequencyPatterns(userId: string, history: UserHistory[]): BehaviorPattern[] {
    const patterns: BehaviorPattern[] = [];
    const actionCounts: Record<string, number> = {};

    // Count action frequencies
    history.forEach(action => {
      const key = action.action.type;
      actionCounts[key] = (actionCounts[key] || 0) + 1;
    });

    // Identify high-frequency actions
    Object.entries(actionCounts).forEach(([action, count]) => {
      if (count >= 10) { // High frequency threshold
        patterns.push({
          id: `frequency_${userId}_${action}`,
          userId,
          pattern: `User frequently performs ${action} (${count} times)`,
          frequency: count,
          confidence: Math.min(count / 50, 1),
          lastSeen: new Date()
        });
      }
    });

    return patterns;
  }

  /**
   * Infer user preferences from behavior
   */
  private static inferPreferences(
    userId: string, 
    history: UserHistory[], 
    patterns: BehaviorPattern[]
  ): UserPreference[] {
    const preferences: UserPreference[] = [];

    // Infer preferences from action patterns
    patterns.forEach(pattern => {
      if (pattern.confidence > this.MIN_CONFIDENCE_THRESHOLD) {
        preferences.push({
          id: `pref_${userId}_${pattern.id}`,
          userId,
          category: 'behavior',
          preference: pattern.pattern,
          confidence: pattern.confidence,
          lastUpdated: new Date(),
          source: 'behavioral',
          metadata: {
            patternId: pattern.id,
            frequency: pattern.frequency
          }
        });
      }
    });

    // Infer preferences from action categories
    const categoryCounts: Record<string, number> = {};
    history.forEach(action => {
      const category = action.action.category;
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });

    Object.entries(categoryCounts).forEach(([category, count]) => {
      if (count >= 5) {
        preferences.push({
          id: `pref_${userId}_category_${category}`,
          userId,
          category: 'interest',
          preference: `User is interested in ${category}`,
          confidence: Math.min(count / 20, 1),
          lastUpdated: new Date(),
          source: 'behavioral',
          metadata: { category, count }
        });
      }
    });

    return preferences;
  }

  /**
   * Identify user interests from behavior
   */
  private static identifyInterests(userId: string, history: UserHistory[]): Interest[] {
    const interests: Interest[] = [];
    const topicCounts: Record<string, number> = {};

    // Extract topics from action details
    history.forEach(action => {
      if (action.action.details?.tags) {
        action.action.details.tags.forEach((tag: string) => {
          topicCounts[tag] = (topicCounts[tag] || 0) + 1;
        });
      }
      
      if (action.action.targetType) {
        topicCounts[action.action.targetType] = (topicCounts[action.action.targetType] || 0) + 1;
      }
    });

    // Create interests from frequent topics
    Object.entries(topicCounts).forEach(([topic, count]) => {
      if (count >= 3) {
        interests.push({
          id: `interest_${userId}_${topic}`,
          userId,
          topic,
          score: Math.min(count / 10, 1),
          category: 'behavioral',
          sources: ['user_actions'],
          lastUpdated: new Date()
        });
      }
    });

    return interests;
  }

  /**
   * Analyze personality traits from behavior
   */
  private static analyzePersonalityTraits(userId: string, history: UserHistory[]): PersonalityTrait[] {
    const traits: PersonalityTrait[] = [];

    // Analyze action patterns for personality indicators
    const socialActions = history.filter(h => h.action.category === 'social').length;
    const aiActions = history.filter(h => h.action.category === 'ai').length;
    const workflowActions = history.filter(h => h.action.category === 'workflow').length;
    const totalActions = history.length;

    // Social personality
    if (socialActions / totalActions > 0.3) {
      traits.push({
        trait: 'Social',
        score: socialActions / totalActions,
        confidence: 0.8,
        evidence: [`${socialActions} social interactions`]
      });
    }

    // Tech-savvy personality
    if (aiActions / totalActions > 0.4) {
      traits.push({
        trait: 'Tech-Savvy',
        score: aiActions / totalActions,
        confidence: 0.9,
        evidence: [`${aiActions} AI interactions`]
      });
    }

    // Efficiency-focused personality
    if (workflowActions / totalActions > 0.2) {
      traits.push({
        trait: 'Efficiency-Focused',
        score: workflowActions / totalActions,
        confidence: 0.7,
        evidence: [`${workflowActions} workflow interactions`]
      });
    }

    return traits;
  }

  /**
   * Recommend content based on user profile
   */
  private static async recommendContent(userId: string, profile: UserProfile): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];

    // Recommend based on interests
    profile.interests.forEach(interest => {
      if (interest.score > 0.5) {
        recommendations.push({
          id: `content_${userId}_${interest.topic}`,
          userId,
          type: 'content',
          itemId: `content_${interest.topic}`,
          title: `Content about ${interest.topic}`,
          description: `Based on your interest in ${interest.topic}`,
          score: interest.score,
          reason: `You've shown interest in ${interest.topic}`,
          category: interest.category,
          createdAt: new Date()
        });
      }
    });

    return recommendations;
  }

  /**
   * Recommend features based on user profile
   */
  private static async recommendFeatures(userId: string, profile: UserProfile): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];

    // Recommend features based on personality traits
    profile.personalityTraits.forEach(trait => {
      if (trait.trait === 'Tech-Savvy' && trait.score > 0.5) {
        recommendations.push({
          id: `feature_${userId}_advanced_ai`,
          userId,
          type: 'feature',
          itemId: 'advanced_ai_tools',
          title: 'Advanced AI Tools',
          description: 'Advanced AI features for power users',
          score: trait.score,
          reason: 'You frequently use AI features',
          category: 'ai',
          createdAt: new Date()
        });
      }
    });

    return recommendations;
  }

  /**
   * Recommend workflows based on user profile
   */
  private static async recommendWorkflows(userId: string, profile: UserProfile): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];

    // Recommend workflows based on behavior patterns
    profile.behaviorPatterns.forEach(pattern => {
      if (pattern.frequency > 5) {
        recommendations.push({
          id: `workflow_${userId}_${pattern.id}`,
          userId,
          type: 'workflow',
          itemId: `workflow_${pattern.id}`,
          title: `Automated ${pattern.pattern}`,
          description: `Automate your frequent ${pattern.pattern}`,
          score: pattern.confidence,
          reason: `You frequently ${pattern.pattern}`,
          category: 'automation',
          createdAt: new Date()
        });
      }
    });

    return recommendations;
  }

  /**
   * Recommend agents based on user profile
   */
  private static async recommendAgents(userId: string, profile: UserProfile): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];

    // Recommend agents based on interests and traits
    profile.interests.forEach(interest => {
      if (interest.score > 0.6) {
        recommendations.push({
          id: `agent_${userId}_${interest.topic}`,
          userId,
          type: 'agent',
          itemId: `agent_${interest.topic}`,
          title: `${interest.topic} Assistant`,
          description: `AI agent specialized in ${interest.topic}`,
          score: interest.score,
          reason: `You're interested in ${interest.topic}`,
          category: interest.category,
          createdAt: new Date()
        });
      }
    });

    return recommendations;
  }

  /**
   * Get user profile (mock implementation)
   */
  private static async getUserProfile(userId: string): Promise<UserProfile> {
    // In a real implementation, this would fetch from Firestore
    // For now, return a mock profile
    return {
      userId,
      preferences: [],
      behaviorPatterns: [],
      interests: [],
      personalityTraits: [],
      lastAnalyzed: new Date(),
      mlModel: 'v1.0',
      version: 1
    };
  }

  /**
   * Update preferences based on feedback
   */
  private static async updatePreferencesFromFeedback(
    profile: UserProfile,
    itemId: string,
    feedback: 'positive' | 'negative' | 'neutral',
    context?: Record<string, any>
  ): Promise<void> {
    // Update preference confidence based on feedback
    const relevantPreferences = profile.preferences.filter(p => 
      p.metadata?.itemId === itemId
    );

    relevantPreferences.forEach(preference => {
      if (feedback === 'positive') {
        preference.confidence = Math.min(preference.confidence + 0.1, 1);
      } else if (feedback === 'negative') {
        preference.confidence = Math.max(preference.confidence - 0.1, 0);
      }
      preference.lastUpdated = new Date();
    });
  }

  /**
   * Retrain ML model
   */
  private static async retrainModel(userId: string, profile: UserProfile): Promise<void> {
    // In a real implementation, this would trigger ML model retraining
    console.log(`Retraining ML model for user ${userId}`);
  }

  /**
   * Generate insights from analysis
   */
  private static async analyzeUsagePatterns(
    userId: string, 
    profile: UserProfile
  ): Promise<PersonalizationInsight[]> {
    const insights: PersonalizationInsight[] = [];

    // Analyze usage patterns
    if (profile.behaviorPatterns.length > 0) {
      insights.push({
        type: 'usage_pattern',
        title: 'Usage Pattern Detected',
        description: `We've identified ${profile.behaviorPatterns.length} behavior patterns in your usage`,
        confidence: 0.8,
        actionable: true,
        recommendations: ['Create automated workflows', 'Set up notifications'],
        metadata: { patternCount: profile.behaviorPatterns.length }
      });
    }

    return insights;
  }

  /**
   * Detect preference changes
   */
  private static async detectPreferenceChanges(
    userId: string, 
    profile: UserProfile
  ): Promise<PersonalizationInsight[]> {
    // Mock implementation - would compare with historical data
    return [];
  }

  /**
   * Identify new interests
   */
  private static async identifyNewInterests(
    userId: string, 
    profile: UserProfile
  ): Promise<PersonalizationInsight[]> {
    const insights: PersonalizationInsight[] = [];

    profile.interests.forEach(interest => {
      if (interest.score > 0.7) {
        insights.push({
          type: 'new_interest',
          title: 'New Interest Detected',
          description: `You've shown strong interest in ${interest.topic}`,
          confidence: interest.score,
          actionable: true,
          recommendations: [`Explore more ${interest.topic} content`],
          metadata: { topic: interest.topic, score: interest.score }
        });
      }
    });

    return insights;
  }

  /**
   * Detect behavior anomalies
   */
  private static async detectBehaviorAnomalies(
    userId: string, 
    profile: UserProfile
  ): Promise<PersonalizationInsight[]> {
    // Mock implementation - would detect unusual patterns
    return [];
  }

  /**
   * Get time of day category
   */
  private static getTimeOfDay(hour: number): string {
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  }
}

export default AIPersonalizationEngine;
