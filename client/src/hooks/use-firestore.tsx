// React Hooks for Firestore Integration

import { useState, useEffect, useCallback } from 'react';
import { User } from 'firebase/auth';
import { 
  FirestoreService, 
  AuthService, 
  db 
} from './firebase';
import { 
  Post, 
  Workflow, 
  Agent, 
  ChatMessage, 
  UserStats,
  PaginationOptions,
  SearchOptions,
  RealtimeCallback,
  UnsubscribeFunction
} from './firestore-types';

/**
 * Hook for managing user authentication state
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = AuthService.onAuthStateChanged(
      (user) => {
        setUser(user);
        setLoading(false);
        setError(null);
      },
      (error) => {
        setError(error.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  const signInWithGoogle = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await AuthService.signInWithGoogle();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await AuthService.signOut();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    user,
    loading,
    error,
    signInWithGoogle,
    signOut
  };
}

/**
 * Hook for managing posts with real-time updates
 */
export function usePosts(userId?: string, options: PaginationOptions = {}) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState<any>(null);

  const loadPosts = useCallback(async (reset = false) => {
    try {
      setLoading(true);
      setError(null);

      const result = await FirestoreService.getPosts(
        userId,
        options.limit || 10,
        reset ? null : lastDoc
      );

      if (reset) {
        setPosts(result.posts);
      } else {
        setPosts(prev => [...prev, ...result.posts]);
      }

      setLastDoc(result.lastDoc);
      setHasMore(result.posts.length === (options.limit || 10));
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [userId, options.limit, lastDoc]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadPosts(false);
    }
  }, [loading, hasMore, loadPosts]);

  const refresh = useCallback(() => {
    setLastDoc(null);
    setHasMore(true);
    loadPosts(true);
  }, [loadPosts]);

  useEffect(() => {
    loadPosts(true);
  }, [userId]);

  return {
    posts,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    createPost: FirestoreService.createPost,
    updatePost: FirestoreService.updatePost,
    deletePost: FirestoreService.deletePost,
    likePost: FirestoreService.likePost,
    unlikePost: FirestoreService.unlikePost
  };
}

/**
 * Hook for real-time posts updates
 */
export function usePostsRealtime(userId: string) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    setLoading(true);
    const unsubscribe = FirestoreService.getPostsRealtime(userId, (newPosts) => {
      setPosts(newPosts);
      setLoading(false);
      setError(null);
    });

    return unsubscribe;
  }, [userId]);

  return { posts, loading, error };
}

/**
 * Hook for managing workflows
 */
export function useWorkflows(userId: string) {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadWorkflows = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await FirestoreService.getWorkflows(userId);
      setWorkflows(data);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      loadWorkflows();
    }
  }, [userId, loadWorkflows]);

  return {
    workflows,
    loading,
    error,
    refresh: loadWorkflows,
    createWorkflow: FirestoreService.createWorkflow,
    updateWorkflowStatus: FirestoreService.updateWorkflowStatus,
    incrementWorkflowExecutions: FirestoreService.incrementWorkflowExecutions
  };
}

/**
 * Hook for managing AI agents
 */
export function useAgents(userId: string) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAgents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await FirestoreService.getAgents(userId);
      setAgents(data);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      loadAgents();
    }
  }, [userId, loadAgents]);

  return {
    agents,
    loading,
    error,
    refresh: loadAgents,
    createAgent: FirestoreService.createAgent,
    updateAgentStatus: FirestoreService.updateAgentStatus,
    incrementAgentInteractions: FirestoreService.incrementAgentInteractions
  };
}

/**
 * Hook for managing chat messages with real-time updates
 */
export function useChatMessages(userId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMessages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await FirestoreService.getChatMessages(userId);
      setMessages(data);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    setLoading(true);
    const unsubscribe = FirestoreService.getChatMessagesRealtime(userId, (newMessages) => {
      setMessages(newMessages);
      setLoading(false);
      setError(null);
    });

    return unsubscribe;
  }, [userId]);

  return {
    messages,
    loading,
    error,
    refresh: loadMessages,
    createMessage: FirestoreService.createChatMessage,
    markAsRead: FirestoreService.markMessageAsRead
  };
}

/**
 * Hook for user statistics
 */
export function useUserStats(userId: string) {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await FirestoreService.getUserStats(userId);
      setStats(data);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      loadStats();
    }
  }, [userId, loadStats]);

  return {
    stats,
    loading,
    error,
    refresh: loadStats
  };
}

/**
 * Hook for searching posts
 */
export function usePostSearch(options: SearchOptions = {}) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (searchTerm: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await FirestoreService.searchPosts(searchTerm, options.userId);
      setPosts(data);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [options.userId]);

  return {
    posts,
    loading,
    error,
    search
  };
}

/**
 * Hook for batch operations
 */
export function useBatchOperations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const batchCreatePosts = useCallback(async (userId: string, postsData: any[]) => {
    try {
      setLoading(true);
      setError(null);
      const result = await FirestoreService.batchCreatePosts(userId, postsData);
      return result;
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const batchDeletePosts = useCallback(async (postIds: string[]) => {
    try {
      setLoading(true);
      setError(null);
      await FirestoreService.batchDeletePosts(postIds);
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    batchCreatePosts,
    batchDeletePosts
  };
}

/**
 * Hook for data export
 */
export function useDataExport() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportData = useCallback(async (userId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await FirestoreService.exportUserData(userId);
      return data;
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    exportData
  };
}
