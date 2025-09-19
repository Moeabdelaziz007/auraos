// Firestore Type Definitions for AuraOS

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  emailVerified: boolean;
  createdAt: Date;
  lastLoginAt: Date;
  updatedAt?: Date;
  preferences: {
    theme: 'light' | 'dark';
    notifications: boolean;
    language: string;
  };
  likedPosts?: string[];
  followers?: string[];
  following?: string[];
}

export interface Post {
  id: string;
  userId: string;
  title?: string;
  content: string;
  imageUrl?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
  likes: number;
  comments: number;
  shares: number;
  likedBy?: string[];
  visibility: 'public' | 'private' | 'followers';
}

export interface Workflow {
  id: string;
  userId: string;
  name: string;
  description?: string;
  steps: WorkflowStep[];
  status: 'draft' | 'active' | 'paused' | 'archived';
  createdAt: Date;
  updatedAt: Date;
  executions: number;
  lastExecuted?: Date;
  schedule?: {
    type: 'manual' | 'scheduled' | 'triggered';
    cronExpression?: string;
    trigger?: string;
  };
}

export interface WorkflowStep {
  id: string;
  type: 'action' | 'condition' | 'delay' | 'webhook';
  name: string;
  config: Record<string, any>;
  nextSteps?: string[];
}

export interface Agent {
  id: string;
  userId: string;
  name: string;
  description?: string;
  persona: string;
  capabilities: string[];
  status: 'inactive' | 'active' | 'training' | 'error';
  createdAt: Date;
  updatedAt: Date;
  interactions: number;
  lastInteraction?: Date;
  settings: {
    responseStyle: 'formal' | 'casual' | 'creative';
    maxTokens: number;
    temperature: number;
    model: string;
  };
}

export interface ChatMessage {
  id: string;
  userId: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'command';
  sender: 'user' | 'agent' | 'system';
  agentId?: string;
  createdAt: Date;
  read: boolean;
  readAt?: Date;
  metadata?: Record<string, any>;
}

export interface UserHistory {
  id: string;
  userId: string;
  action: UserAction;
  timestamp: Date;
  sessionId: string;
  metadata?: Record<string, any>;
  duration?: number; // in milliseconds
  success: boolean;
  errorMessage?: string;
}

export interface UserAction {
  type: ActionType;
  category: ActionCategory;
  description: string;
  target?: string; // ID of the target resource
  targetType?: string; // Type of target (post, workflow, agent, etc.)
  details?: Record<string, any>;
}

export type ActionType = 
  | 'login' | 'logout' | 'signup'
  | 'create' | 'update' | 'delete' | 'view' | 'search'
  | 'like' | 'unlike' | 'share' | 'comment'
  | 'execute' | 'pause' | 'resume' | 'stop'
  | 'chat' | 'message' | 'command'
  | 'navigate' | 'scroll' | 'click' | 'hover'
  | 'upload' | 'download' | 'export' | 'import'
  | 'error' | 'warning' | 'info';

export type ActionCategory = 
  | 'authentication' | 'content' | 'social' | 'workflow' | 'ai' | 'navigation' | 'system';

export interface UserSession {
  id: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number; // in milliseconds
  deviceInfo: {
    userAgent: string;
    platform: string;
    language: string;
    timezone: string;
    screenResolution: string;
    viewport: string;
  };
  location?: {
    country: string;
    region: string;
    city: string;
    ip?: string;
  };
  actions: number;
  lastActivity: Date;
  isActive: boolean;
}

export interface UserAnalytics {
  userId: string;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  date: Date;
  stats: {
    totalSessions: number;
    totalActions: number;
    averageSessionDuration: number;
    mostUsedFeatures: Array<{
      feature: string;
      count: number;
      percentage: number;
    }>;
    topPages: Array<{
      page: string;
      visits: number;
      averageTime: number;
    }>;
    deviceBreakdown: Array<{
      device: string;
      count: number;
      percentage: number;
    }>;
    errorRate: number;
    retentionRate: number;
  };
}

export interface UserStats {
  user: User;
  stats: {
    posts: number;
    workflows: number;
    agents: number;
    messages: number;
    totalLikes: number;
    totalExecutions: number;
    totalInteractions: number;
  };
}

export interface ExportData {
  user: User | null;
  posts: Post[];
  workflows: Workflow[];
  agents: Agent[];
  messages: ChatMessage[];
  exportedAt: string;
}

// Firestore Collection Names
export const COLLECTIONS = {
  USERS: 'users',
  POSTS: 'posts',
  WORKFLOWS: 'workflows',
  AGENTS: 'agents',
  CHAT_MESSAGES: 'chatMessages',
  ANALYTICS: 'analytics',
  NOTIFICATIONS: 'notifications',
  USER_HISTORY: 'userHistory',
  USER_SESSIONS: 'userSessions',
  USER_ANALYTICS: 'userAnalytics'
} as const;

// Firestore Query Types
export interface PaginationOptions {
  limit?: number;
  lastDoc?: any;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

export interface SearchOptions {
  searchTerm?: string;
  userId?: string;
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
}

// Error Types
export interface FirestoreError {
  code: string;
  message: string;
  details?: any;
}

// Real-time Subscription Types
export type RealtimeCallback<T> = (data: T[]) => void;
export type UnsubscribeFunction = () => void;
