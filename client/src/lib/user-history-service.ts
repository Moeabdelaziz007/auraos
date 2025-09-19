// User History Service for AuraOS
// Comprehensive tracking of all user actions and behaviors

import { db } from './firebase';
import { 
  collection, 
  doc, 
  addDoc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  updateDoc, 
  increment,
  writeBatch,
  Timestamp,
  onSnapshot,
  startAfter
} from 'firebase/firestore';
import { 
  UserHistory, 
  UserAction, 
  UserSession, 
  UserAnalytics,
  ActionType,
  ActionCategory,
  COLLECTIONS 
} from './firestore-types';

/**
 * User History Service
 * Handles all user activity tracking, session management, and analytics
 */
export class UserHistoryService {
  private static currentSession: UserSession | null = null;
  private static sessionStartTime: Date | null = null;
  private static actionBuffer: UserHistory[] = [];
  private static bufferSize = 10;
  private static flushInterval = 5000; // 5 seconds

  /**
   * Initialize user history tracking
   */
  static async initialize(userId: string): Promise<void> {
    try {
      // Start a new session
      await this.startSession(userId);
      
      // Set up periodic buffer flushing
      setInterval(() => {
        if (this.actionBuffer.length > 0) {
          this.flushActionBuffer();
        }
      }, this.flushInterval);

      // Track page visibility changes
      if (typeof document !== 'undefined') {
        document.addEventListener('visibilitychange', () => {
          if (document.hidden) {
            this.trackAction(userId, {
              type: 'navigate',
              category: 'navigation',
              description: 'Page hidden',
              details: { visibility: 'hidden' }
            });
          } else {
            this.trackAction(userId, {
              type: 'navigate',
              category: 'navigation',
              description: 'Page visible',
              details: { visibility: 'visible' }
            });
          }
        });

        // Track page unload
        window.addEventListener('beforeunload', () => {
          this.trackAction(userId, {
            type: 'navigate',
            category: 'navigation',
            description: 'Page unload',
            details: { event: 'beforeunload' }
          });
          this.endSession(userId);
        });
      }

      console.log('User history tracking initialized');
    } catch (error) {
      console.error('Failed to initialize user history tracking:', error);
    }
  }

  /**
   * Start a new user session
   */
  static async startSession(userId: string): Promise<UserSession> {
    try {
      const sessionId = this.generateSessionId();
      const startTime = new Date();
      
      const session: UserSession = {
        id: sessionId,
        userId,
        startTime,
        deviceInfo: this.getDeviceInfo(),
        location: await this.getLocationInfo(),
        actions: 0,
        lastActivity: startTime,
        isActive: true
      };

      // Save session to Firestore
      await setDoc(doc(db, COLLECTIONS.USER_SESSIONS, sessionId), {
        ...session,
        startTime: Timestamp.fromDate(session.startTime),
        lastActivity: Timestamp.fromDate(session.lastActivity)
      });

      this.currentSession = session;
      this.sessionStartTime = startTime;

      return session;
    } catch (error) {
      console.error('Failed to start session:', error);
      throw error;
    }
  }

  /**
   * End the current user session
   */
  static async endSession(userId: string): Promise<void> {
    try {
      if (!this.currentSession) return;

      const endTime = new Date();
      const duration = endTime.getTime() - this.currentSession.startTime.getTime();

      await updateDoc(doc(db, COLLECTIONS.USER_SESSIONS, this.currentSession.id), {
        endTime: Timestamp.fromDate(endTime),
        duration,
        isActive: false,
        lastActivity: Timestamp.fromDate(endTime)
      });

      this.currentSession = null;
      this.sessionStartTime = null;

      // Flush any remaining actions
      if (this.actionBuffer.length > 0) {
        await this.flushActionBuffer();
      }
    } catch (error) {
      console.error('Failed to end session:', error);
    }
  }

  /**
   * Track a user action
   */
  static async trackAction(
    userId: string, 
    action: UserAction, 
    metadata?: Record<string, any>,
    success: boolean = true,
    errorMessage?: string
  ): Promise<void> {
    try {
      const historyEntry: UserHistory = {
        id: this.generateHistoryId(),
        userId,
        action,
        timestamp: new Date(),
        sessionId: this.currentSession?.id || 'unknown',
        metadata,
        success,
        errorMessage
      };

      // Add to buffer for batch processing
      this.actionBuffer.push(historyEntry);

      // Update session activity
      if (this.currentSession) {
        await updateDoc(doc(db, COLLECTIONS.USER_SESSIONS, this.currentSession.id), {
          actions: increment(1),
          lastActivity: Timestamp.fromDate(new Date())
        });
      }

      // Flush buffer if it's full
      if (this.actionBuffer.length >= this.bufferSize) {
        await this.flushActionBuffer();
      }
    } catch (error) {
      console.error('Failed to track action:', error);
    }
  }

  /**
   * Track page navigation
   */
  static async trackNavigation(
    userId: string, 
    page: string, 
    previousPage?: string,
    duration?: number
  ): Promise<void> {
    await this.trackAction(userId, {
      type: 'navigate',
      category: 'navigation',
      description: `Navigated to ${page}`,
      details: { 
        page, 
        previousPage,
        duration 
      }
    });
  }

  /**
   * Track content interaction
   */
  static async trackContentInteraction(
    userId: string,
    actionType: ActionType,
    targetType: string,
    targetId: string,
    details?: Record<string, any>
  ): Promise<void> {
    await this.trackAction(userId, {
      type: actionType,
      category: 'content',
      description: `${actionType} ${targetType}`,
      target: targetId,
      targetType,
      details
    });
  }

  /**
   * Track AI interaction
   */
  static async trackAIInteraction(
    userId: string,
    actionType: ActionType,
    agentId?: string,
    details?: Record<string, any>
  ): Promise<void> {
    await this.trackAction(userId, {
      type: actionType,
      category: 'ai',
      description: `AI ${actionType}`,
      target: agentId,
      targetType: 'agent',
      details
    });
  }

  /**
   * Track social interaction
   */
  static async trackSocialInteraction(
    userId: string,
    actionType: ActionType,
    targetId: string,
    details?: Record<string, any>
  ): Promise<void> {
    await this.trackAction(userId, {
      type: actionType,
      category: 'social',
      description: `Social ${actionType}`,
      target: targetId,
      targetType: 'post',
      details
    });
  }

  /**
   * Track workflow interaction
   */
  static async trackWorkflowInteraction(
    userId: string,
    actionType: ActionType,
    workflowId: string,
    details?: Record<string, any>
  ): Promise<void> {
    await this.trackAction(userId, {
      type: actionType,
      category: 'workflow',
      description: `Workflow ${actionType}`,
      target: workflowId,
      targetType: 'workflow',
      details
    });
  }

  /**
   * Track authentication events
   */
  static async trackAuthEvent(
    userId: string,
    actionType: 'login' | 'logout' | 'signup',
    details?: Record<string, any>
  ): Promise<void> {
    await this.trackAction(userId, {
      type: actionType,
      category: 'authentication',
      description: `User ${actionType}`,
      details
    });
  }

  /**
   * Track errors
   */
  static async trackError(
    userId: string,
    error: Error,
    context?: string,
    details?: Record<string, any>
  ): Promise<void> {
    await this.trackAction(userId, {
      type: 'error',
      category: 'system',
      description: `Error: ${error.message}`,
      details: {
        ...details,
        context,
        stack: error.stack,
        name: error.name
      }
    }, undefined, false, error.message);
  }

  /**
   * Get user history with pagination
   */
  static async getUserHistory(
    userId: string,
    options: {
      limit?: number;
      startAfter?: any;
      actionType?: ActionType;
      category?: ActionCategory;
      dateRange?: { start: Date; end: Date };
    } = {}
  ): Promise<{ history: UserHistory[]; lastDoc: any }> {
    try {
      let q = query(
        collection(db, COLLECTIONS.USER_HISTORY),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(options.limit || 50)
      );

      if (options.actionType) {
        q = query(q, where('action.type', '==', options.actionType));
      }

      if (options.category) {
        q = query(q, where('action.category', '==', options.category));
      }

      if (options.startAfter) {
        q = query(q, startAfter(options.startAfter));
      }

      const querySnapshot = await getDocs(q);
      const history = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate()
      })) as UserHistory[];

      const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];

      return { history, lastDoc };
    } catch (error) {
      console.error('Failed to get user history:', error);
      throw error;
    }
  }

  /**
   * Get user sessions
   */
  static async getUserSessions(
    userId: string,
    limitCount: number = 20
  ): Promise<UserSession[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.USER_SESSIONS),
        where('userId', '==', userId),
        orderBy('startTime', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        startTime: doc.data().startTime.toDate(),
        endTime: doc.data().endTime?.toDate(),
        lastActivity: doc.data().lastActivity.toDate()
      })) as UserSession[];
    } catch (error) {
      console.error('Failed to get user sessions:', error);
      throw error;
    }
  }

  /**
   * Generate analytics for a user
   */
  static async generateUserAnalytics(
    userId: string,
    period: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly'
  ): Promise<UserAnalytics> {
    try {
      const now = new Date();
      const startDate = this.getPeriodStartDate(now, period);
      
      // Get history for the period
      const { history } = await this.getUserHistory(userId, {
        dateRange: { start: startDate, end: now }
      });

      // Get sessions for the period
      const sessions = await this.getUserSessions(userId, 1000);

      const analytics: UserAnalytics = {
        userId,
        period,
        date: now,
        stats: {
          totalSessions: sessions.length,
          totalActions: history.length,
          averageSessionDuration: this.calculateAverageSessionDuration(sessions),
          mostUsedFeatures: this.calculateMostUsedFeatures(history),
          topPages: this.calculateTopPages(history),
          deviceBreakdown: this.calculateDeviceBreakdown(sessions),
          errorRate: this.calculateErrorRate(history),
          retentionRate: this.calculateRetentionRate(sessions)
        }
      };

      // Save analytics
      await setDoc(
        doc(db, COLLECTIONS.USER_ANALYTICS, `${userId}_${period}_${now.getTime()}`),
        {
          ...analytics,
          date: Timestamp.fromDate(analytics.date)
        }
      );

      return analytics;
    } catch (error) {
      console.error('Failed to generate user analytics:', error);
      throw error;
    }
  }

  /**
   * Flush action buffer to Firestore
   */
  private static async flushActionBuffer(): Promise<void> {
    if (this.actionBuffer.length === 0) return;

    try {
      const batch = writeBatch(db);
      
      this.actionBuffer.forEach(action => {
        const docRef = doc(collection(db, COLLECTIONS.USER_HISTORY));
        batch.set(docRef, {
          ...action,
          timestamp: Timestamp.fromDate(action.timestamp)
        });
      });

      await batch.commit();
      this.actionBuffer = [];
    } catch (error) {
      console.error('Failed to flush action buffer:', error);
    }
  }

  /**
   * Generate unique session ID
   */
  private static generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique history ID
   */
  private static generateHistoryId(): string {
    return `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get device information
   */
  private static getDeviceInfo() {
    if (typeof navigator === 'undefined') {
      return {
        userAgent: 'Unknown',
        platform: 'Unknown',
        language: 'Unknown',
        timezone: 'Unknown',
        screenResolution: 'Unknown',
        viewport: 'Unknown'
      };
    }

    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screenResolution: `${screen.width}x${screen.height}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`
    };
  }

  /**
   * Get location information (mock implementation)
   */
  private static async getLocationInfo() {
    // In a real implementation, you might use a geolocation service
    // For now, return mock data
    return {
      country: 'Unknown',
      region: 'Unknown',
      city: 'Unknown'
    };
  }

  /**
   * Get period start date
   */
  private static getPeriodStartDate(date: Date, period: string): Date {
    const start = new Date(date);
    
    switch (period) {
      case 'daily':
        start.setHours(0, 0, 0, 0);
        break;
      case 'weekly':
        start.setDate(start.getDate() - 7);
        break;
      case 'monthly':
        start.setMonth(start.getMonth() - 1);
        break;
      case 'yearly':
        start.setFullYear(start.getFullYear() - 1);
        break;
    }
    
    return start;
  }

  /**
   * Calculate average session duration
   */
  private static calculateAverageSessionDuration(sessions: UserSession[]): number {
    const sessionsWithDuration = sessions.filter(s => s.duration);
    if (sessionsWithDuration.length === 0) return 0;
    
    const totalDuration = sessionsWithDuration.reduce((sum, session) => 
      sum + (session.duration || 0), 0
    );
    
    return totalDuration / sessionsWithDuration.length;
  }

  /**
   * Calculate most used features
   */
  private static calculateMostUsedFeatures(history: UserHistory[]) {
    const featureCounts: Record<string, number> = {};
    
    history.forEach(action => {
      const feature = action.action.category;
      featureCounts[feature] = (featureCounts[feature] || 0) + 1;
    });
    
    const total = history.length;
    return Object.entries(featureCounts)
      .map(([feature, count]) => ({
        feature,
        count,
        percentage: (count / total) * 100
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  /**
   * Calculate top pages
   */
  private static calculateTopPages(history: UserHistory[]) {
    const pageCounts: Record<string, { visits: number; totalTime: number }> = {};
    
    history
      .filter(action => action.action.type === 'navigate')
      .forEach(action => {
        const page = action.action.details?.page;
        if (page) {
          if (!pageCounts[page]) {
            pageCounts[page] = { visits: 0, totalTime: 0 };
          }
          pageCounts[page].visits++;
          pageCounts[page].totalTime += action.duration || 0;
        }
      });
    
    return Object.entries(pageCounts)
      .map(([page, data]) => ({
        page,
        visits: data.visits,
        averageTime: data.totalTime / data.visits
      }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 10);
  }

  /**
   * Calculate device breakdown
   */
  private static calculateDeviceBreakdown(sessions: UserSession[]) {
    const deviceCounts: Record<string, number> = {};
    
    sessions.forEach(session => {
      const device = session.deviceInfo.platform;
      deviceCounts[device] = (deviceCounts[device] || 0) + 1;
    });
    
    const total = sessions.length;
    return Object.entries(deviceCounts)
      .map(([device, count]) => ({
        device,
        count,
        percentage: (count / total) * 100
      }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Calculate error rate
   */
  private static calculateErrorRate(history: UserHistory[]): number {
    const errorCount = history.filter(action => !action.success).length;
    return (errorCount / history.length) * 100;
  }

  /**
   * Calculate retention rate
   */
  private static calculateRetentionRate(sessions: UserSession[]): number {
    // Simplified retention calculation
    // In a real implementation, you'd calculate based on user return patterns
    const activeSessions = sessions.filter(session => session.isActive).length;
    return (activeSessions / sessions.length) * 100;
  }
}

export default UserHistoryService;
