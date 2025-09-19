import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';

export interface LearningActivity {
  id: string;
  userId: string;
  type: 'feature_usage' | 'ai_interaction' | 'automation_created' | 'social_post' | 'workflow_completed' | 'custom';
  category: string;
  points: number;
  metadata: Record<string, any>;
  timestamp: Date;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface UserProgress {
  userId: string;
  totalPoints: number;
  level: number;
  experience: number;
  badges: string[];
  achievements: Achievement[];
  learningStreak: number;
  lastActivityDate: Date;
  skillPoints: Record<string, number>;
  weeklyGoal: number;
  monthlyGoal: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  points: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt: Date;
  metadata: Record<string, any>;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  requirements: {
    type: string;
    threshold: number;
    timeframe?: string;
  }[];
  rarity: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
}

export interface LearningRecommendation {
  id: string;
  userId: string;
  type: 'feature_tutorial' | 'ai_prompt' | 'automation_template' | 'workflow_suggestion';
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number; // in minutes
  points: number;
  prerequisites: string[];
  category: string;
  priority: number;
  createdAt: Date;
}

export interface LearningChallenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'special';
  category: string;
  requirements: {
    type: string;
    threshold: number;
    timeframe: string;
  }[];
  rewards: {
    points: number;
    badges: string[];
    achievements: string[];
  };
  startDate: Date;
  endDate: Date;
  participants: string[];
  isActive: boolean;
}

export class LearningAutomationSystem extends EventEmitter {
  private activities: Map<string, LearningActivity[]> = new Map();
  private userProgress: Map<string, UserProgress> = new Map();
  private badges: Map<string, Badge> = new Map();
  private achievements: Map<string, Achievement> = new Map();
  private recommendations: Map<string, LearningRecommendation[]> = new Map();
  private challenges: Map<string, LearningChallenge> = new Map();
  
  // Learning multipliers based on user level
  private levelMultipliers = {
    1: 1.0,
    2: 1.1,
    3: 1.2,
    4: 1.3,
    5: 1.5,
    10: 2.0,
    20: 2.5,
    50: 3.0
  };

  constructor() {
    super();
    this.initializeDefaultBadges();
    this.initializeDefaultAchievements();
    this.initializeDefaultChallenges();
  }

  /**
   * Record a learning activity and update user progress
   */
  async recordActivity(activity: Omit<LearningActivity, 'id' | 'timestamp'>): Promise<LearningActivity> {
    const learningActivity: LearningActivity = {
      ...activity,
      id: uuidv4(),
      timestamp: new Date()
    };

    // Store activity
    if (!this.activities.has(activity.userId)) {
      this.activities.set(activity.userId, []);
    }
    this.activities.get(activity.userId)!.push(learningActivity);

    // Update user progress
    await this.updateUserProgress(activity.userId, learningActivity);

    // Check for badge/achievement unlocks
    await this.checkBadgeUnlocks(activity.userId);
    await this.checkAchievementUnlocks(activity.userId);

    // Generate new recommendations
    await this.generateRecommendations(activity.userId);

    this.emit('activityRecorded', learningActivity);
    return learningActivity;
  }

  /**
   * Update user progress based on activity
   */
  private async updateUserProgress(userId: string, activity: LearningActivity): Promise<void> {
    let progress = this.userProgress.get(userId);
    
    if (!progress) {
      progress = this.initializeUserProgress(userId);
    }

    // Calculate points with level multiplier
    const multiplier = this.getLevelMultiplier(progress.level);
    const earnedPoints = Math.floor(activity.points * multiplier);

    // Update progress
    progress.totalPoints += earnedPoints;
    progress.experience += earnedPoints;
    progress.lastActivityDate = new Date();

    // Update learning streak
    const today = new Date().toDateString();
    const lastActivity = progress.lastActivityDate.toDateString();
    if (today === lastActivity) {
      // Same day, maintain streak
    } else {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (lastActivity === yesterday.toDateString()) {
        progress.learningStreak += 1;
      } else {
        progress.learningStreak = 1;
      }
    }

    // Update skill points
    if (!progress.skillPoints[activity.category]) {
      progress.skillPoints[activity.category] = 0;
    }
    progress.skillPoints[activity.category] += earnedPoints;

    // Check for level up
    const newLevel = this.calculateLevel(progress.experience);
    if (newLevel > progress.level) {
      progress.level = newLevel;
      this.emit('levelUp', { userId, oldLevel: newLevel - 1, newLevel });
    }

    this.userProgress.set(userId, progress);
  }

  /**
   * Get user progress
   */
  getUserProgress(userId: string): UserProgress | null {
    return this.userProgress.get(userId) || null;
  }

  /**
   * Get user activities
   */
  getUserActivities(userId: string, limit: number = 50): LearningActivity[] {
    const activities = this.activities.get(userId) || [];
    return activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Get learning recommendations for user
   */
  getUserRecommendations(userId: string): LearningRecommendation[] {
    const recommendations = this.recommendations.get(userId) || [];
    return recommendations.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Generate personalized learning recommendations
   */
  private async generateRecommendations(userId: string): Promise<void> {
    const progress = this.getUserProgress(userId);
    if (!progress) return;

    const recommendations: LearningRecommendation[] = [];

    // Analyze user's skill gaps
    const skillCategories = Object.keys(progress.skillPoints);
    const avgSkillPoints = Object.values(progress.skillPoints).reduce((a, b) => a + b, 0) / skillCategories.length;

    // Recommend features user hasn't used much
    for (const [category, points] of Object.entries(progress.skillPoints)) {
      if (points < avgSkillPoints * 0.5) {
        recommendations.push({
          id: uuidv4(),
          userId,
          type: 'feature_tutorial',
          title: `Master ${category}`,
          description: `Improve your ${category} skills with guided tutorials`,
          difficulty: progress.level < 5 ? 'beginner' : progress.level < 15 ? 'intermediate' : 'advanced',
          estimatedTime: 15,
          points: 100,
          prerequisites: [],
          category,
          priority: Math.floor(avgSkillPoints / points),
          createdAt: new Date()
        });
      }
    }

    // AI interaction recommendations
    if (!skillCategories.includes('ai_interaction')) {
      recommendations.push({
        id: uuidv4(),
        userId,
        type: 'ai_prompt',
        title: 'Explore AI Features',
        description: 'Try advanced AI prompts to unlock new capabilities',
        difficulty: 'intermediate',
        estimatedTime: 20,
        points: 150,
        prerequisites: [],
        category: 'ai_interaction',
        priority: 8,
        createdAt: new Date()
      });
    }

    // Automation recommendations
    if (progress.skillPoints.automation_creation < 200) {
      recommendations.push({
        id: uuidv4(),
        userId,
        type: 'automation_template',
        title: 'Create Your First Automation',
        description: 'Build an automation workflow to save time',
        difficulty: 'beginner',
        estimatedTime: 25,
        points: 200,
        prerequisites: [],
        category: 'automation_creation',
        priority: 9,
        createdAt: new Date()
      });
    }

    this.recommendations.set(userId, recommendations.slice(0, 10)); // Keep top 10
  }

  /**
   * Check for badge unlocks
   */
  private async checkBadgeUnlocks(userId: string): Promise<void> {
    const progress = this.getUserProgress(userId);
    if (!progress) return;

    for (const [badgeId, badge] of Array.from(this.badges.entries())) {
      if (progress.badges.includes(badgeId)) continue; // Already unlocked

      let unlocked = true;
      for (const requirement of badge.requirements) {
        const activities = this.getUserActivities(userId, 1000);
        const filteredActivities = this.filterActivitiesByTimeframe(activities, requirement.timeframe);
        
        const count = filteredActivities.filter(a => a.type === requirement.type).length;
        if (count < requirement.threshold) {
          unlocked = false;
          break;
        }
      }

      if (unlocked) {
        progress.badges.push(badgeId);
        this.emit('badgeUnlocked', { userId, badgeId, badge });
      }
    }
  }

  /**
   * Check for achievement unlocks
   */
  private async checkAchievementUnlocks(userId: string): Promise<void> {
    const progress = this.getUserProgress(userId);
    if (!progress) return;

    // Level achievements
    if (progress.level >= 10 && !progress.achievements.find(a => a.id === 'level_10')) {
      const achievement = this.achievements.get('level_10');
      if (achievement) {
        progress.achievements.push({
          ...achievement,
          unlockedAt: new Date()
        });
        this.emit('achievementUnlocked', { userId, achievement });
      }
    }

    // Streak achievements
    if (progress.learningStreak >= 7 && !progress.achievements.find(a => a.id === 'week_streak')) {
      const achievement = this.achievements.get('week_streak');
      if (achievement) {
        progress.achievements.push({
          ...achievement,
          unlockedAt: new Date()
        });
        this.emit('achievementUnlocked', { userId, achievement });
      }
    }

    // Points achievements
    if (progress.totalPoints >= 1000 && !progress.achievements.find(a => a.id === 'points_1000')) {
      const achievement = this.achievements.get('points_1000');
      if (achievement) {
        progress.achievements.push({
          ...achievement,
          unlockedAt: new Date()
        });
        this.emit('achievementUnlocked', { userId, achievement });
      }
    }
  }

  /**
   * Initialize default badges
   */
  private initializeDefaultBadges(): void {
    const defaultBadges: Badge[] = [
      {
        id: 'first_ai_interaction',
        name: 'AI Explorer',
        description: 'First AI interaction',
        icon: '🤖',
        category: 'ai',
        requirements: [{ type: 'ai_interaction', threshold: 1 }],
        rarity: 'bronze'
      },
      {
        id: 'automation_master',
        name: 'Automation Master',
        description: 'Created 10 automations',
        icon: '⚙️',
        category: 'automation',
        requirements: [{ type: 'automation_created', threshold: 10 }],
        rarity: 'gold'
      },
      {
        id: 'social_butterfly',
        name: 'Social Butterfly',
        description: 'Posted 50 social media updates',
        icon: '📱',
        category: 'social',
        requirements: [{ type: 'social_post', threshold: 50 }],
        rarity: 'silver'
      },
      {
        id: 'workflow_wizard',
        name: 'Workflow Wizard',
        description: 'Completed 25 workflows',
        icon: '🪄',
        category: 'workflow',
        requirements: [{ type: 'workflow_completed', threshold: 25 }],
        rarity: 'gold'
      },
      {
        id: 'daily_learner',
        name: 'Daily Learner',
        description: 'Active for 30 consecutive days',
        icon: '📚',
        category: 'consistency',
        requirements: [{ type: 'feature_usage', threshold: 30, timeframe: '30_days' }],
        rarity: 'platinum'
      }
    ];

    defaultBadges.forEach(badge => {
      this.badges.set(badge.id, badge);
    });
  }

  /**
   * Initialize default achievements
   */
  private initializeDefaultAchievements(): void {
    const defaultAchievements: Achievement[] = [
      {
        id: 'level_10',
        name: 'Rising Star',
        description: 'Reached level 10',
        icon: '⭐',
        category: 'progression',
        points: 500,
        rarity: 'rare',
        unlockedAt: new Date(),
        metadata: {}
      },
      {
        id: 'week_streak',
        name: 'Dedicated Learner',
        description: '7-day learning streak',
        icon: '🔥',
        category: 'consistency',
        points: 300,
        rarity: 'rare',
        unlockedAt: new Date(),
        metadata: {}
      },
      {
        id: 'points_1000',
        name: 'Knowledge Seeker',
        description: 'Earned 1000 points',
        icon: '🎯',
        category: 'milestone',
        points: 200,
        rarity: 'epic',
        unlockedAt: new Date(),
        metadata: {}
      }
    ];

    defaultAchievements.forEach(achievement => {
      this.achievements.set(achievement.id, achievement);
    });
  }

  /**
   * Initialize default challenges
   */
  private initializeDefaultChallenges(): void {
    const weeklyChallenge: LearningChallenge = {
      id: 'weekly_automation',
      title: 'Weekly Automation Challenge',
      description: 'Create 3 new automations this week',
      type: 'weekly',
      category: 'automation',
      requirements: [{ type: 'automation_created', threshold: 3, timeframe: '7_days' }],
      rewards: {
        points: 500,
        badges: [],
        achievements: []
      },
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      participants: [],
      isActive: true
    };

    this.challenges.set(weeklyChallenge.id, weeklyChallenge);
  }

  /**
   * Helper methods
   */
  private initializeUserProgress(userId: string): UserProgress {
    return {
      userId,
      totalPoints: 0,
      level: 1,
      experience: 0,
      badges: [],
      achievements: [],
      learningStreak: 0,
      lastActivityDate: new Date(),
      skillPoints: {},
      weeklyGoal: 500,
      monthlyGoal: 2000
    };
  }

  private getLevelMultiplier(level: number): number {
    for (const [threshold, multiplier] of Object.entries(this.levelMultipliers).reverse()) {
      if (level >= parseInt(threshold)) {
        return multiplier;
      }
    }
    return 1.0;
  }

  private calculateLevel(experience: number): number {
    // Exponential leveling curve
    return Math.floor(Math.sqrt(experience / 100)) + 1;
  }

  private filterActivitiesByTimeframe(activities: LearningActivity[], timeframe?: string): LearningActivity[] {
    if (!timeframe) return activities;

    const now = new Date();
    const cutoff = new Date();

    switch (timeframe) {
      case '7_days':
        cutoff.setDate(now.getDate() - 7);
        break;
      case '30_days':
        cutoff.setDate(now.getDate() - 30);
        break;
      case '90_days':
        cutoff.setDate(now.getDate() - 90);
        break;
      default:
        return activities;
    }

    return activities.filter(activity => activity.timestamp >= cutoff);
  }

  /**
   * Get leaderboard data
   */
  getLeaderboard(limit: number = 10): Array<{ userId: string; points: number; level: number; badges: number }> {
    const allProgress = Array.from(this.userProgress.values());
    return allProgress
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, limit)
      .map(progress => ({
        userId: progress.userId,
        points: progress.totalPoints,
        level: progress.level,
        badges: progress.badges.length
      }));
  }

  /**
   * Get available challenges
   */
  getActiveChallenges(): LearningChallenge[] {
    return Array.from(this.challenges.values()).filter(challenge => challenge.isActive);
  }
}

// Singleton instance
let learningSystem: LearningAutomationSystem | null = null;

export function getLearningSystem(): LearningAutomationSystem {
  if (!learningSystem) {
    learningSystem = new LearningAutomationSystem();
  }
  return learningSystem;
}

export function initializeLearningSystem(): LearningAutomationSystem {
  const system = getLearningSystem();
  
  // Set up event listeners for WebSocket broadcasting
  system.on('activityRecorded', (activity) => {
    // Broadcast to connected clients
    console.log(`📊 Activity recorded: ${activity.type} for user ${activity.userId} (+${activity.points} points)`);
  });

  system.on('levelUp', ({ userId, oldLevel, newLevel }) => {
    console.log(`🎉 Level up! User ${userId} reached level ${newLevel}`);
  });

  system.on('badgeUnlocked', ({ userId, badgeId, badge }) => {
    console.log(`🏆 Badge unlocked! User ${userId} earned: ${badge.name}`);
  });

  system.on('achievementUnlocked', ({ userId, achievement }) => {
    console.log(`🏅 Achievement unlocked! User ${userId} earned: ${achievement.name}`);
  });

  return system;
}
