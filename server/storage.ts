import { 
  type User, 
  type InsertUser, 
  type Post, 
  type InsertPost,
  type PostWithAuthor,
  type Workflow,
  type InsertWorkflow,
  type AgentTemplate,
  type InsertAgentTemplate,
  type UserAgent,
  type InsertUserAgent,
  type ChatMessage,
  type InsertChatMessage
} from "@shared/schema";
import { randomUUID } from "crypto";

/**
 * Interface for a storage provider.
 */
export interface IStorage {
  // Users
  /**
   * Gets a user by their ID.
   * @param {string} id The user's ID.
   * @returns {Promise<User | undefined>} The user, or undefined if not found.
   */
  getUser(id: string): Promise<User | undefined>;
  /**
   * Gets a user by their username.
   * @param {string} username The user's username.
   * @returns {Promise<User | undefined>} The user, or undefined if not found.
   */
  getUserByUsername(username: string): Promise<User | undefined>;
  /**
   * Gets a user by their email address.
   * @param {string} email The user's email address.
   * @returns {Promise<User | undefined>} The user, or undefined if not found.
   */
  getUserByEmail(email: string): Promise<User | undefined>;
  /**
   * Creates a new user.
   * @param {InsertUser} user The user data to create.
   * @returns {Promise<User>} The newly created user.
   */
  createUser(user: InsertUser): Promise<User>;

  // Posts
  /**
   * Creates a new post.
   * @param {InsertPost} post The post data to create.
   * @returns {Promise<Post>} The newly created post.
   */
  createPost(post: InsertPost): Promise<Post>;
  /**
   * Gets a list of posts, with their authors.
   * @param {number} [limit=10] The maximum number of posts to return.
   * @returns {Promise<PostWithAuthor[]>} A list of posts with their authors.
   */
  getPostsWithAuthor(limit?: number): Promise<PostWithAuthor[]>;
  /**
   * Gets a single post by its ID.
   * @param {string} id The post's ID.
   * @returns {Promise<Post | undefined>} The post, or undefined if not found.
   */
  getPost(id: string): Promise<Post | undefined>;
  /**
   * Updates the stats for a post.
   * @param {string} id The post's ID.
   * @param {number} likes The new number of likes.
   * @param {number} shares The new number of shares.
   * @param {number} comments The new number of comments.
   * @returns {Promise<void>}
   */
  updatePostStats(id: string, likes: number, shares: number, comments: number): Promise<void>;

  // Workflows
  /**
   * Creates a new workflow.
   * @param {InsertWorkflow} workflow The workflow data to create.
   * @returns {Promise<Workflow>} The newly created workflow.
   */
  createWorkflow(workflow: InsertWorkflow): Promise<Workflow>;
  /**
   * Gets all workflows for a user.
   * @param {string} userId The user's ID.
   * @returns {Promise<Workflow[]>} A list of the user's workflows.
   */
  getWorkflowsByUser(userId: string): Promise<Workflow[]>;
  /**
   * Gets a single workflow by its ID.
   * @param {string} id The workflow's ID.
   * @returns {Promise<Workflow | undefined>} The workflow, or undefined if not found.
   */
  getWorkflow(id: string): Promise<Workflow | undefined>;
  /**
   * Updates a workflow.
   * @param {string} id The workflow's ID.
   * @param {Partial<Workflow>} updates The updates to apply.
   * @returns {Promise<void>}
   */
  updateWorkflow(id: string, updates: Partial<Workflow>): Promise<void>;
  /**
   * Deletes a workflow.
   * @param {string} id The workflow's ID.
   * @returns {Promise<void>}
   */
  deleteWorkflow(id: string): Promise<void>;

  // Agent Templates
  /**
   * Gets all agent templates.
   * @returns {Promise<AgentTemplate[]>} A list of all agent templates.
   */
  getAgentTemplates(): Promise<AgentTemplate[]>;
  /**
   * Gets a single agent template by its ID.
   * @param {string} id The template's ID.
   * @returns {Promise<AgentTemplate | undefined>} The template, or undefined if not found.
   */
  getAgentTemplate(id: string): Promise<AgentTemplate | undefined>;
  /**
   * Creates a new agent template.
   * @param {InsertAgentTemplate} template The template data to create.
   * @returns {Promise<AgentTemplate>} The newly created template.
   */
  createAgentTemplate(template: InsertAgentTemplate): Promise<AgentTemplate>;
  /**
   * Increments the usage count of an agent template.
   * @param {string} id The template's ID.
   * @returns {Promise<void>}
   */
  incrementTemplateUsage(id: string): Promise<void>;

  // User Agents
  /**
   * Creates a new user agent.
   * @param {InsertUserAgent} agent The agent data to create.
   * @returns {Promise<UserAgent>} The newly created agent.
   */
  createUserAgent(agent: InsertUserAgent): Promise<UserAgent>;
  /**
   * Gets all agents for a user.
   * @param {string} userId The user's ID.
   * @returns {Promise<UserAgent[]>} A list of the user's agents.
   */
  getUserAgents(userId: string): Promise<UserAgent[]>;
  /**
   * Gets a single user agent by its ID.
   * @param {string} id The agent's ID.
   * @returns {Promise<UserAgent | undefined>} The agent, or undefined if not found.
   */
  getUserAgent(id: string): Promise<UserAgent | undefined>;
  /**
   * Updates a user agent.
   * @param {string} id The agent's ID.
   * @param {Partial<UserAgent>} updates The updates to apply.
   * @returns {Promise<void>}
   */
  updateUserAgent(id: string, updates: Partial<UserAgent>): Promise<void>;
  /**
   * Deletes a user agent.
   * @param {string} id The agent's ID.
   * @returns {Promise<void>}
   */
  deleteUserAgent(id: string): Promise<void>;

  // Chat Messages
  /**
   * Creates a new chat message.
   * @param {InsertChatMessage} message The chat message data to create.
   * @returns {Promise<ChatMessage>} The newly created chat message.
   */
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  /**
   * Gets all chat messages for a user.
   * @param {string} userId The user's ID.
   * @param {number} [limit=50] The maximum number of messages to return.
   * @returns {Promise<ChatMessage[]>} A list of the user's chat messages.
   */
  getChatMessages(userId: string, limit?: number): Promise<ChatMessage[]>;

  // Statistics
  /**
   * Gets statistics for a user.
   * @param {string} userId The user's ID.
   * @returns {Promise<{ totalPosts: number; activeAgents: number; engagementRate: number; automationsRun: number; }>} The user's statistics.
   */
  getUserStats(userId: string): Promise<{
    totalPosts: number;
    activeAgents: number;
    engagementRate: number;
    automationsRun: number;
  }>;
}

/**
 * An in-memory storage implementation for demonstration and testing purposes.
 * It implements the IStorage interface.
 */
export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private posts: Map<string, Post> = new Map();
  private workflows: Map<string, Workflow> = new Map();
  private agentTemplates: Map<string, AgentTemplate> = new Map();
  private userAgents: Map<string, UserAgent> = new Map();
  private chatMessages: Map<string, ChatMessage> = new Map();

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Create default user
    const defaultUser: User = {
      id: "user-1",
      username: "sarah_chen",
      email: "sarah@aiflow.com",
      password: "hashed_password",
      identityName: "Sarah Chen",
      identityIcon: "https://pixabay.com/get/g011ff5f5c9bd65a7bc140f57f12d8cfdf70bb92b9dd19ca90dce3197ce111976f37bb58b61f09efdc75e86cdc7ecbb61d7c6632c241ef7517650a98d2e8a979e_1280.jpg",
      identityType: "personal",
      verified: true,
      createdAt: new Date()
    };
    this.users.set(defaultUser.id, defaultUser);

    // Create sample agent templates
    const templates: AgentTemplate[] = [
      {
        id: "template-1",
        name: "Content Curator",
        description: "Finds and curates trending content in your niche",
        category: "Content",
        icon: "fas fa-magic",
        config: {
          triggers: ["trending_topic", "keyword_mention"],
          actions: ["create_post", "schedule_post"]
        },
        usageCount: 2300,
        isPopular: true,
        createdAt: new Date()
      },
      {
        id: "template-2",
        name: "Reply Assistant",
        description: "Auto-responds to comments and mentions",
        category: "Engagement",
        icon: "fas fa-comments",
        config: {
          triggers: ["new_comment", "mention"],
          actions: ["generate_reply", "send_notification"]
        },
        usageCount: 892,
        isPopular: false,
        createdAt: new Date()
      },
      {
        id: "template-3",
        name: "Trend Analyzer",
        description: "Analyzes trends and suggests content ideas",
        category: "Analytics",
        icon: "fas fa-chart-line",
        config: {
          triggers: ["daily_schedule"],
          actions: ["analyze_trends", "suggest_content"]
        },
        usageCount: 1500,
        isPopular: false,
        createdAt: new Date()
      }
    ];

    templates.forEach(template => {
      this.agentTemplates.set(template.id, template);
    });

    // Create sample posts
    const posts: Post[] = [
      {
        id: "post-1",
        authorId: "user-1",
        content: "Just launched my new AI-powered workflow automation! 🤖 It automatically generates social media content based on trending topics and schedules posts at optimal times. The results have been incredible - 300% increase in engagement! #AIAutomation #SocialMedia #ProductivityHack",
        imageUrl: "https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400",
        isAiGenerated: true,
        likes: 247,
        shares: 18,
        comments: 32,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      },
      {
        id: "post-2",
        authorId: "user-1",
        content: "Sharing my top 5 AI agent templates that have transformed my content strategy! These automation workflows handle everything from research to publishing. Who else is using AI to scale their social presence? 🚀",
        imageUrl: null,
        isAiGenerated: false,
        likes: 156,
        shares: 12,
        comments: 23,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000) // 4 hours ago
      }
    ];

    posts.forEach(post => {
      this.posts.set(post.id, post);
    });

    // Create sample workflow
    const workflow: Workflow = {
      id: "workflow-1",
      userId: "user-1",
      name: "Auto Engagement Responder",
      description: "Automatically responds to mentions with AI-generated replies",
      nodes: [
        {
          id: "trigger-1",
          type: "trigger",
          position: { x: 100, y: 100 },
          data: { type: "new_mention" }
        },
        {
          id: "ai-1",
          type: "ai",
          position: { x: 300, y: 100 },
          data: { type: "sentiment_analysis" }
        },
        {
          id: "action-1",
          type: "action",
          position: { x: 500, y: 100 },
          data: { type: "auto_reply" }
        }
      ],
      isActive: true,
      runCount: 12,
      lastRun: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
      createdAt: new Date()
    };
    this.workflows.set(workflow.id, workflow);
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id, 
      identityIcon: insertUser.identityIcon || null,
      identityType: insertUser.identityType || "personal",
      verified: false,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async createPost(insertPost: InsertPost): Promise<Post> {
    const id = randomUUID();
    const post: Post = {
      ...insertPost,
      id,
      imageUrl: insertPost.imageUrl || null,
      isAiGenerated: insertPost.isAiGenerated || false,
      likes: 0,
      shares: 0,
      comments: 0,
      createdAt: new Date()
    };
    this.posts.set(id, post);
    return post;
  }

  async getPostsWithAuthor(limit = 10): Promise<PostWithAuthor[]> {
    const posts = Array.from(this.posts.values())
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
      .slice(0, limit);

    return posts.map(post => {
      const author = this.users.get(post.authorId);
      if (!author) throw new Error('Post author not found');
      return { ...post, author };
    });
  }

  async getPost(id: string): Promise<Post | undefined> {
    return this.posts.get(id);
  }

  async updatePostStats(id: string, likes: number, shares: number, comments: number): Promise<void> {
    const post = this.posts.get(id);
    if (post) {
      this.posts.set(id, { ...post, likes, shares, comments });
    }
  }

  async createWorkflow(insertWorkflow: InsertWorkflow): Promise<Workflow> {
    const id = randomUUID();
    const workflow: Workflow = {
      ...insertWorkflow,
      id,
      description: insertWorkflow.description || null,
      isActive: insertWorkflow.isActive ?? false,
      runCount: 0,
      lastRun: null,
      createdAt: new Date()
    };
    this.workflows.set(id, workflow);
    return workflow;
  }

  async getWorkflowsByUser(userId: string): Promise<Workflow[]> {
    return Array.from(this.workflows.values()).filter(w => w.userId === userId);
  }

  async getWorkflow(id: string): Promise<Workflow | undefined> {
    return this.workflows.get(id);
  }

  async updateWorkflow(id: string, updates: Partial<Workflow>): Promise<void> {
    const workflow = this.workflows.get(id);
    if (workflow) {
      this.workflows.set(id, { ...workflow, ...updates });
    }
  }

  async deleteWorkflow(id: string): Promise<void> {
    this.workflows.delete(id);
  }

  async getAgentTemplates(): Promise<AgentTemplate[]> {
    return Array.from(this.agentTemplates.values());
  }

  async getAgentTemplate(id: string): Promise<AgentTemplate | undefined> {
    return this.agentTemplates.get(id);
  }

  async createAgentTemplate(insertTemplate: InsertAgentTemplate): Promise<AgentTemplate> {
    const id = randomUUID();
    const template: AgentTemplate = {
      ...insertTemplate,
      id,
      usageCount: 0,
      isPopular: insertTemplate.isPopular ?? false,
      createdAt: new Date()
    };
    this.agentTemplates.set(id, template);
    return template;
  }

  async incrementTemplateUsage(id: string): Promise<void> {
    const template = this.agentTemplates.get(id);
    if (template) {
      this.agentTemplates.set(id, { 
        ...template, 
        usageCount: template.usageCount + 1 
      });
    }
  }

  async createUserAgent(insertAgent: InsertUserAgent): Promise<UserAgent> {
    const id = randomUUID();
    const agent: UserAgent = {
      ...insertAgent,
      id,
      isActive: insertAgent.isActive ?? true,
      runCount: 0,
      lastRun: null,
      createdAt: new Date()
    };
    this.userAgents.set(id, agent);
    return agent;
  }

  async getUserAgents(userId: string): Promise<UserAgent[]> {
    return Array.from(this.userAgents.values()).filter(a => a.userId === userId);
  }

  async getUserAgent(id: string): Promise<UserAgent | undefined> {
    return this.userAgents.get(id);
  }

  async updateUserAgent(id: string, updates: Partial<UserAgent>): Promise<void> {
    const agent = this.userAgents.get(id);
    if (agent) {
      this.userAgents.set(id, { ...agent, ...updates });
    }
  }

  async deleteUserAgent(id: string): Promise<void> {
    this.userAgents.delete(id);
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = randomUUID();
    const message: ChatMessage = {
      ...insertMessage,
      id,
      createdAt: new Date()
    };
    this.chatMessages.set(id, message);
    return message;
  }

  async getChatMessages(userId: string, limit = 50): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(m => m.userId === userId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
      .slice(0, limit);
  }

  async getUserStats(userId: string): Promise<{
    totalPosts: number;
    activeAgents: number;
    engagementRate: number;
    automationsRun: number;
  }> {
    const userPosts = Array.from(this.posts.values()).filter(p => p.authorId === userId);
    const userAgents = Array.from(this.userAgents.values()).filter(a => a.userId === userId && a.isActive);
    const userWorkflows = Array.from(this.workflows.values()).filter(w => w.userId === userId);
    
    const totalLikes = userPosts.reduce((sum, post) => sum + post.likes, 0);
    const totalPosts = userPosts.length;
    const engagementRate = totalPosts > 0 ? (totalLikes / totalPosts) / 100 : 0;
    const automationsRun = userWorkflows.reduce((sum, w) => sum + w.runCount, 0);

    return {
      totalPosts,
      activeAgents: userAgents.length,
      engagementRate: Math.round(engagementRate * 100) / 100,
      automationsRun
    };
  }
}

export const storage = new MemStorage();
