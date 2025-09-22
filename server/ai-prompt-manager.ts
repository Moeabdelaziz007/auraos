import { storage } from './storage.js';

/**
 * Represents an AI prompt.
 */
export interface AIPrompt {
  id: string;
  title: string;
  description: string;
  category: PromptCategory;
  subcategory?: string;
  tags: string[];
  prompt: string;
  variables?: PromptVariable[];
  examples?: PromptExample[];
  usage: {
    complexity: 'beginner' | 'intermediate' | 'advanced';
    estimatedTime: number; // in minutes
    successRate: number; // 0-1
    popularity: number; // 0-100
  };
  metadata: {
    author: string;
    createdAt: Date;
    updatedAt: Date;
    version: string;
    source?: string;
    isCommunity: boolean;
    isOfficial: boolean;
    isPremium: boolean;
  };
  performance: {
    totalUses: number;
    averageRating: number;
    lastUsed?: Date;
    feedback: PromptFeedback[];
  };
}

/**
 * Represents the category of a prompt.
 */
export type PromptCategory = 
  | 'technical' | 'creative' | 'business' | 'productivity' 
  | 'education' | 'health' | 'marketing' | 'development'
  | 'ai_ml' | 'security' | 'content' | 'social_media'
  | 'analytics' | 'automation' | 'communication';

/**
 * Represents a variable in a prompt.
 */
export interface PromptVariable {
  name: string;
  displayName: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'multiselect' | 'textarea';
  required: boolean;
  defaultValue?: any;
  options?: string[];
  placeholder?: string;
  description?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    custom?: string;
  };
}

/**
 * Represents an example of a prompt.
 */
export interface PromptExample {
  title: string;
  description: string;
  input: Record<string, any>;
  expectedOutput: string;
  actualOutput?: string;
  rating?: number;
}

/**
 * Represents feedback for a prompt.
 */
export interface PromptFeedback {
  userId: string;
  rating: number; // 1-5
  comment?: string;
  timestamp: Date;
  improvements?: string[];
}

/**
 * Represents a template for a prompt.
 */
export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  category: PromptCategory;
  prompts: string[];
  variables: PromptVariable[];
  workflow: {
    steps: PromptStep[];
    parallel: boolean;
    timeout: number;
  };
}

/**
 * Represents a step in a prompt template workflow.
 */
export interface PromptStep {
  id: string;
  name: string;
  promptId: string;
  dependencies: string[];
  conditions?: Record<string, any>;
  outputMapping?: Record<string, string>;
}

/**
 * Manages AI prompts and templates.
 */
export class AIPromptManager {
  private prompts: Map<string, AIPrompt> = new Map();
  private templates: Map<string, PromptTemplate> = new Map();
  private categories: Map<PromptCategory, AIPrompt[]> = new Map();
  private isLive: boolean = false;
  private usageStats: Map<string, any> = new Map();
  private monitoringSubscribers: Set<any> = new Set();

  /**
   * Creates an instance of AIPromptManager.
   */
  constructor() {
    this.initializeDefaultPrompts();
    this.initializePromptTemplates();
    this.initializeLiveMode();
  }

  private initializeLiveMode() {
    this.isLive = true;
    console.log('🤖 AI Prompt Manager is now LIVE');
    
    // Start usage analytics
    setInterval(() => {
      this.updateUsageAnalytics();
    }, 60000); // Update every minute
  }

  private initializeDefaultPrompts() {
    // Technical Prompts
    this.registerPrompt({
      id: 'devops_engineer',
      title: 'Act as DevOps Engineer',
      description: 'Expert DevOps engineer providing scalable, efficient, and automated solutions',
      category: 'technical',
      subcategory: 'devops',
      tags: ['devops', 'automation', 'infrastructure', 'ci-cd'],
      prompt: `You are a \${Title:Senior} DevOps engineer working at \${Company Type: Big Company}. Your role is to provide scalable, efficient, and automated solutions for software deployment, infrastructure management, and CI/CD pipelines. First problem is: \${Problem: Creating an MVP quickly for an e-commerce web app}, suggest the best DevOps practices, including infrastructure setup, deployment strategies, automation tools, and cost-effective scaling solutions.`,
      variables: [
        {
          name: 'title',
          displayName: 'Seniority Level',
          type: 'select',
          required: true,
          options: ['Junior', 'Mid-Level', 'Senior', 'Lead', 'Principal'],
          defaultValue: 'Senior'
        },
        {
          name: 'companyType',
          displayName: 'Company Type',
          type: 'select',
          required: true,
          options: ['Startup', 'Mid-size Company', 'Big Company', 'Enterprise'],
          defaultValue: 'Big Company'
        },
        {
          name: 'problem',
          displayName: 'Problem Description',
          type: 'textarea',
          required: true,
          placeholder: 'Describe the DevOps challenge...',
          defaultValue: 'Creating an MVP quickly for an e-commerce web app'
        }
      ],
      usage: {
        complexity: 'advanced',
        estimatedTime: 15,
        successRate: 0.92,
        popularity: 85
      },
      metadata: {
        author: 'Amrikyy Team',
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0.0',
        source: 'awesome-chatgpt-prompts',
        isCommunity: false,
        isOfficial: true,
        isPremium: false
      },
      performance: {
        totalUses: 0,
        averageRating: 0,
        feedback: []
      }
    });

    // AI/ML Prompts
    this.registerPrompt({
      id: 'ai_security_specialist',
      title: 'Act as Large Language Models Security Specialist',
      description: 'Security specialist for identifying vulnerabilities in LLMs',
      category: 'ai_ml',
      subcategory: 'security',
      tags: ['ai', 'security', 'llm', 'vulnerabilities', 'testing'],
      prompt: `I want you to act as a Large Language Model security specialist. Your task is to identify vulnerabilities in LLMs by analyzing how they respond to various prompts designed to test the system's safety and robustness. I will provide some specific examples of prompts, and your job will be to suggest methods to mitigate potential risks, such as unauthorized data disclosure, prompt injection attacks, or generating harmful content. Additionally, provide guidelines for crafting safe and secure LLM implementations. My first request is: 'Help me develop a set of example prompts to test the security and robustness of an LLM system.'`,
      variables: [
        {
          name: 'request',
          displayName: 'Security Request',
          type: 'textarea',
          required: true,
          placeholder: 'Describe your security testing needs...',
          defaultValue: 'Help me develop a set of example prompts to test the security and robustness of an LLM system.'
        }
      ],
      usage: {
        complexity: 'advanced',
        estimatedTime: 20,
        successRate: 0.88,
        popularity: 72
      },
      metadata: {
        author: 'Amrikyy Team',
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0.0',
        source: 'awesome-chatgpt-prompts',
        isCommunity: false,
        isOfficial: true,
        isPremium: false
      },
      performance: {
        totalUses: 0,
        averageRating: 0,
        feedback: []
      }
    });

    // Business/Marketing Prompts
    this.registerPrompt({
      id: 'seo_expert',
      title: 'Act as SEO Expert',
      description: 'Expert SEO specialist for content optimization and strategy',
      category: 'business',
      subcategory: 'marketing',
      tags: ['seo', 'marketing', 'content', 'optimization', 'strategy'],
      prompt: `Using WebPilot, create an outline for an article that will be 2,000 words on the keyword "\${keyword:Best SEO Prompts}" based on the top 10 results from Google. Include every relevant heading possible. Keep the keyword density of the headings high. For each section of the outline, include the word count. Include FAQs section in the outline too, based on people also ask section from Google for the keyword. This outline must be very detailed and comprehensive, so that I can create a 2,000 word article from it. Generate a long list of LSI and NLP keywords related to my keyword. Also include any other words related to the keyword. Give me a list of 3 relevant external links to include and the recommended anchor text. Make sure they're not competing articles. Split the outline into part 1 and part 2.`,
      variables: [
        {
          name: 'keyword',
          displayName: 'Target Keyword',
          type: 'string',
          required: true,
          placeholder: 'Enter your target keyword...',
          defaultValue: 'Best SEO Prompts'
        }
      ],
      usage: {
        complexity: 'intermediate',
        estimatedTime: 25,
        successRate: 0.90,
        popularity: 78
      },
      metadata: {
        author: 'Amrikyy Team',
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0.0',
        source: 'awesome-chatgpt-prompts',
        isCommunity: false,
        isOfficial: true,
        isPremium: false
      },
      performance: {
        totalUses: 0,
        averageRating: 0,
        feedback: []
      }
    });

    // Creative/Content Prompts
    this.registerPrompt({
      id: 'content_generator',
      title: 'Act as Content Generator',
      description: 'Generate engaging content for various platforms and audiences',
      category: 'creative',
      subcategory: 'content',
      tags: ['content', 'writing', 'creative', 'social-media', 'marketing'],
      prompt: `Act as a professional content creator and social media expert. Create engaging, high-quality content for \${platform:social media platforms} that will \${goal:increase engagement and reach}. The content should be \${tone:professional and friendly}, target \${audience:your target audience}, and include \${elements:relevant hashtags and call-to-actions}. Consider current trends and best practices for \${platform} content creation.`,
      variables: [
        {
          name: 'platform',
          displayName: 'Platform',
          type: 'multiselect',
          required: true,
          options: ['Instagram', 'Twitter', 'LinkedIn', 'Facebook', 'TikTok', 'YouTube'],
          defaultValue: ['Instagram', 'Twitter']
        },
        {
          name: 'goal',
          displayName: 'Content Goal',
          type: 'select',
          required: true,
          options: ['increase engagement', 'drive traffic', 'build brand awareness', 'generate leads', 'educate audience'],
          defaultValue: 'increase engagement'
        },
        {
          name: 'tone',
          displayName: 'Tone',
          type: 'select',
          required: true,
          options: ['professional', 'casual', 'friendly', 'authoritative', 'humorous', 'inspirational'],
          defaultValue: 'professional'
        },
        {
          name: 'audience',
          displayName: 'Target Audience',
          type: 'string',
          required: true,
          placeholder: 'Describe your target audience...',
          defaultValue: 'young professionals aged 25-35'
        },
        {
          name: 'elements',
          displayName: 'Required Elements',
          type: 'multiselect',
          required: false,
          options: ['hashtags', 'call-to-actions', 'emojis', 'mentions', 'links', 'images'],
          defaultValue: ['hashtags', 'call-to-actions']
        }
      ],
      usage: {
        complexity: 'beginner',
        estimatedTime: 10,
        successRate: 0.95,
        popularity: 92
      },
      metadata: {
        author: 'Amrikyy Team',
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0.0',
        source: 'awesome-chatgpt-prompts',
        isCommunity: false,
        isOfficial: true,
        isPremium: false
      },
      performance: {
        totalUses: 0,
        averageRating: 0,
        feedback: []
      }
    });

    // Productivity Prompts
    this.registerPrompt({
      id: 'note_taking_assistant',
      title: 'Act as Note-Taking Assistant',
      description: 'Professional note-taking assistant for lectures and meetings',
      category: 'productivity',
      subcategory: 'organization',
      tags: ['productivity', 'notes', 'lecture', 'meeting', 'organization'],
      prompt: `I want you to act as a note-taking assistant for a lecture. Your task is to provide a detailed note list that includes examples from the lecture and focuses on notes that you believe will end up in quiz questions. Additionally, please make a separate list for notes that have numbers and data in them and another separated list for the examples that included in this lecture. The notes should be concise and easy to read.`,
      variables: [
        {
          name: 'lectureContent',
          displayName: 'Lecture Content',
          type: 'textarea',
          required: true,
          placeholder: 'Paste the lecture content here...'
        },
        {
          name: 'subject',
          displayName: 'Subject/Topic',
          type: 'string',
          required: false,
          placeholder: 'e.g., Computer Science, Business, etc.'
        }
      ],
      usage: {
        complexity: 'beginner',
        estimatedTime: 8,
        successRate: 0.93,
        popularity: 68
      },
      metadata: {
        author: 'Amrikyy Team',
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0.0',
        source: 'awesome-chatgpt-prompts',
        isCommunity: false,
        isOfficial: true,
        isPremium: false
      },
      performance: {
        totalUses: 0,
        averageRating: 0,
        feedback: []
      }
    });

    // Development Prompts
    this.registerPrompt({
      id: 'linux_script_developer',
      title: 'Act as Linux Script Developer',
      description: 'Expert Linux script developer for automation workflows',
      category: 'development',
      subcategory: 'automation',
      tags: ['linux', 'bash', 'scripting', 'automation', 'devops'],
      prompt: `You are an expert Linux script developer. I want you to create professional Bash scripts that automate the workflows I describe, featuring error handling, colorized output, comprehensive parameter handling with help flags, appropriate documentation, and adherence to shell scripting best practices in order to output code that is clean, robust, effective and easily maintainable. Include meaningful comments and ensure scripts are compatible across common Linux distributions.`,
      variables: [
        {
          name: 'workflowDescription',
          displayName: 'Workflow Description',
          type: 'textarea',
          required: true,
          placeholder: 'Describe the workflow you want to automate...'
        },
        {
          name: 'scriptName',
          displayName: 'Script Name',
          type: 'string',
          required: false,
          placeholder: 'e.g., backup-system.sh'
        },
        {
          name: 'requirements',
          displayName: 'Special Requirements',
          type: 'textarea',
          required: false,
          placeholder: 'Any specific requirements or constraints...'
        }
      ],
      usage: {
        complexity: 'advanced',
        estimatedTime: 30,
        successRate: 0.89,
        popularity: 76
      },
      metadata: {
        author: 'Amrikyy Team',
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0.0',
        source: 'awesome-chatgpt-prompts',
        isCommunity: false,
        isOfficial: true,
        isPremium: false
      },
      performance: {
        totalUses: 0,
        averageRating: 0,
        feedback: []
      }
    });

    // Health/Wellness Prompts
    this.registerPrompt({
      id: 'nutritionist',
      title: 'Act as Nutritionist',
      description: 'Professional nutritionist for healthy meal planning',
      category: 'health',
      subcategory: 'nutrition',
      tags: ['health', 'nutrition', 'diet', 'meal-planning', 'wellness'],
      prompt: `Act as a nutritionist and create a healthy recipe for a \${mealType:vegan dinner}. Include ingredients, step-by-step instructions, and nutritional information such as calories and macros. Consider \${dietaryRestrictions:any dietary restrictions} and ensure the recipe is \${difficulty:easy to prepare}.`,
      variables: [
        {
          name: 'mealType',
          displayName: 'Meal Type',
          type: 'select',
          required: true,
          options: ['breakfast', 'lunch', 'dinner', 'snack', 'dessert'],
          defaultValue: 'dinner'
        },
        {
          name: 'dietaryRestrictions',
          displayName: 'Dietary Restrictions',
          type: 'multiselect',
          required: false,
          options: ['vegan', 'vegetarian', 'gluten-free', 'dairy-free', 'keto', 'paleo', 'low-carb'],
          defaultValue: ['vegan']
        },
        {
          name: 'difficulty',
          displayName: 'Difficulty Level',
          type: 'select',
          required: true,
          options: ['very easy', 'easy', 'moderate', 'challenging'],
          defaultValue: 'easy'
        }
      ],
      usage: {
        complexity: 'beginner',
        estimatedTime: 12,
        successRate: 0.94,
        popularity: 58
      },
      metadata: {
        author: 'Amrikyy Team',
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0.0',
        source: 'awesome-chatgpt-prompts',
        isCommunity: false,
        isOfficial: true,
        isPremium: false
      },
      performance: {
        totalUses: 0,
        averageRating: 0,
        feedback: []
      }
    });

    console.log(`🤖 Initialized ${this.prompts.size} AI prompts across ${this.categories.size} categories`);
  }

  private initializePromptTemplates() {
    // Content Creation Workflow Template
    this.registerTemplate({
      id: 'content_creation_workflow',
      name: 'Content Creation Workflow',
      description: 'Complete workflow for creating and optimizing content',
      category: 'creative',
      prompts: ['seo_expert', 'content_generator'],
      variables: [
        {
          name: 'topic',
          displayName: 'Content Topic',
          type: 'string',
          required: true,
          placeholder: 'Enter your content topic...'
        },
        {
          name: 'platform',
          displayName: 'Target Platform',
          type: 'multiselect',
          required: true,
          options: ['Blog', 'Social Media', 'Email', 'Website'],
          defaultValue: ['Blog']
        }
      ],
      workflow: {
        steps: [
          {
            id: 'seo_research',
            name: 'SEO Research',
            promptId: 'seo_expert',
            dependencies: [],
            outputMapping: { 'outline': 'seo_outline', 'keywords': 'seo_keywords' }
          },
          {
            id: 'content_creation',
            name: 'Content Creation',
            promptId: 'content_generator',
            dependencies: ['seo_research'],
            outputMapping: { 'content': 'final_content' }
          }
        ],
        parallel: false,
        timeout: 300000 // 5 minutes
      }
    });

    // Technical Development Workflow Template
    this.registerTemplate({
      id: 'technical_development_workflow',
      name: 'Technical Development Workflow',
      description: 'Workflow for technical development tasks',
      category: 'technical',
      prompts: ['devops_engineer', 'linux_script_developer'],
      variables: [
        {
          name: 'projectType',
          displayName: 'Project Type',
          type: 'select',
          required: true,
          options: ['Web Application', 'Mobile App', 'API', 'Infrastructure'],
          defaultValue: 'Web Application'
        },
        {
          name: 'complexity',
          displayName: 'Complexity Level',
          type: 'select',
          required: true,
          options: ['MVP', 'Production', 'Enterprise'],
          defaultValue: 'Production'
        }
      ],
      workflow: {
        steps: [
          {
            id: 'devops_planning',
            name: 'DevOps Planning',
            promptId: 'devops_engineer',
            dependencies: [],
            outputMapping: { 'strategy': 'devops_strategy' }
          },
          {
            id: 'script_development',
            name: 'Script Development',
            promptId: 'linux_script_developer',
            dependencies: ['devops_planning'],
            outputMapping: { 'script': 'automation_script' }
          }
        ],
        parallel: false,
        timeout: 600000 // 10 minutes
      }
    });
  }

  /**
   * Registers a new AI prompt.
   * @param {AIPrompt} prompt The prompt to register.
   */
  registerPrompt(prompt: AIPrompt): void {
    this.prompts.set(prompt.id, prompt);
    
    // Add to category
    if (!this.categories.has(prompt.category)) {
      this.categories.set(prompt.category, []);
    }
    this.categories.get(prompt.category)!.push(prompt);
    
    console.log(`📝 Registered prompt: ${prompt.title}`);
  }

  /**
   * Registers a new prompt template.
   * @param {PromptTemplate} template The template to register.
   */
  registerTemplate(template: PromptTemplate): void {
    this.templates.set(template.id, template);
    console.log(`📋 Registered template: ${template.name}`);
  }

  /**
   * Gets a prompt by its ID.
   * @param {string} promptId The ID of the prompt to get.
   * @returns {AIPrompt | undefined} The prompt, or undefined if not found.
   */
  getPrompt(promptId: string): AIPrompt | undefined {
    return this.prompts.get(promptId);
  }

  /**
   * Gets all prompts.
   * @returns {AIPrompt[]} A list of all prompts.
   */
  getAllPrompts(): AIPrompt[] {
    return Array.from(this.prompts.values());
  }

  /**
   * Gets all prompts in a category.
   * @param {PromptCategory} category The category to get prompts from.
   * @returns {AIPrompt[]} A list of prompts in the category.
   */
  getPromptsByCategory(category: PromptCategory): AIPrompt[] {
    return this.categories.get(category) || [];
  }

  /**
   * Gets popular prompts.
   * @param {number} [limit=10] The maximum number of prompts to return.
   * @returns {AIPrompt[]} A list of popular prompts.
   */
  getPopularPrompts(limit: number = 10): AIPrompt[] {
    return Array.from(this.prompts.values())
      .sort((a, b) => b.usage.popularity - a.usage.popularity)
      .slice(0, limit);
  }

  /**
   * Gets featured prompts.
   * @returns {AIPrompt[]} A list of featured prompts.
   */
  getFeaturedPrompts(): AIPrompt[] {
    return Array.from(this.prompts.values())
      .filter(p => p.metadata.isOfficial && !p.metadata.isPremium)
      .sort((a, b) => b.usage.popularity - a.usage.popularity);
  }

  /**
   * Searches for prompts.
   * @param {string} query The search query.
   * @returns {AIPrompt[]} A list of matching prompts.
   */
  searchPrompts(query: string): AIPrompt[] {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.prompts.values()).filter(prompt =>
      prompt.title.toLowerCase().includes(lowercaseQuery) ||
      prompt.description.toLowerCase().includes(lowercaseQuery) ||
      prompt.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
      prompt.category.toLowerCase().includes(lowercaseQuery)
    );
  }

  /**
   * Executes a prompt.
   * @param {string} promptId The ID of the prompt to execute.
   * @param {Record<string, any>} variables The variables to use in the prompt.
   * @param {string} [userId] The ID of the user executing the prompt.
   * @returns {Promise<{ success: boolean; result?: string; error?: string }>} A promise that resolves with the execution result.
   */
  async executePrompt(promptId: string, variables: Record<string, any>, userId?: string): Promise<{ success: boolean; result?: string; error?: string }> {
    const prompt = this.getPrompt(promptId);
    if (!prompt) {
      return { success: false, error: 'Prompt not found' };
    }

    try {
      console.log(`🚀 Executing prompt: ${prompt.title}`);
      
      // Replace variables in prompt
      let processedPrompt = prompt.prompt;
      for (const [key, value] of Object.entries(variables)) {
        const placeholder = new RegExp(`\\$\\{${key}:[^}]*\\}`, 'g');
        processedPrompt = processedPrompt.replace(placeholder, String(value));
      }

      // Execute with AI (in real implementation, this would use OpenAI/Gemini)
      const { generateContent } = await import('./gemini.js');
      const result = await generateContent(processedPrompt);

      // Update usage statistics
      this.updatePromptUsage(promptId, userId);

      return { success: true, result };
    } catch (error) {
      console.error(`Prompt execution error: ${prompt.title}`, error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Executes a prompt template.
   * @param {string} templateId The ID of the template to execute.
   * @param {Record<string, any>} variables The variables to use in the template.
   * @param {string} [userId] The ID of the user executing the template.
   * @returns {Promise<{ success: boolean; results?: Record<string, any>; error?: string }>} A promise that resolves with the execution results.
   */
  async executeTemplate(templateId: string, variables: Record<string, any>, userId?: string): Promise<{ success: boolean; results?: Record<string, any>; error?: string }> {
    const template = this.templates.get(templateId);
    if (!template) {
      return { success: false, error: 'Template not found' };
    }

    try {
      console.log(`🚀 Executing template: ${template.name}`);
      const results: Record<string, any> = {};
      const completedSteps = new Set<string>();

      // Execute steps in order
      for (const step of template.workflow.steps) {
        // Check dependencies
        const dependenciesMet = step.dependencies.every(dep => completedSteps.has(dep));
        if (!dependenciesMet) {
          return { success: false, error: `Dependencies not met for step: ${step.name}` };
        }

        // Execute step
        const stepResult = await this.executePrompt(step.promptId, {
          ...variables,
          ...(step.outputMapping ? this.mapOutputs(results, step.outputMapping) : {})
        }, userId);

        if (!stepResult.success) {
          return { success: false, error: `Step failed: ${step.name} - ${stepResult.error}` };
        }

        results[step.id] = stepResult.result;
        completedSteps.add(step.id);
      }

      return { success: true, results };
    } catch (error) {
      console.error(`Template execution error: ${template.name}`, error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  private mapOutputs(results: Record<string, any>, outputMapping: Record<string, string>): Record<string, any> {
    const mapped: Record<string, any> = {};
    for (const [source, target] of Object.entries(outputMapping)) {
      if (results[source]) {
        mapped[target] = results[source];
      }
    }
    return mapped;
  }

  // Usage Analytics
  private updatePromptUsage(promptId: string, userId?: string): void {
    const prompt = this.getPrompt(promptId);
    if (!prompt) return;

    prompt.performance.totalUses++;
    prompt.performance.lastUsed = new Date();

    // Update usage stats
    const statsKey = `prompt_${promptId}`;
    const stats = this.usageStats.get(statsKey) || { totalUses: 0, uniqueUsers: new Set() };
    stats.totalUses++;
    if (userId) {
      stats.uniqueUsers.add(userId);
    }
    this.usageStats.set(statsKey, stats);
  }

  private updateUsageAnalytics(): void {
    // Update popularity based on recent usage
    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);

    for (const prompt of this.prompts.values()) {
      if (prompt.performance.lastUsed && prompt.performance.lastUsed.getTime() > oneDayAgo) {
        // Increase popularity for recently used prompts
        prompt.usage.popularity = Math.min(100, prompt.usage.popularity + 1);
      }
    }
  }

  /**
   * Submits feedback for a prompt.
   * @param {string} promptId The ID of the prompt to submit feedback for.
   * @param {Omit<PromptFeedback, 'timestamp'>} feedback The feedback to submit.
   * @returns {boolean} True if the feedback was submitted, false otherwise.
   */
  submitFeedback(promptId: string, feedback: Omit<PromptFeedback, 'timestamp'>): boolean {
    const prompt = this.getPrompt(promptId);
    if (!prompt) return false;

    const feedbackWithTimestamp: PromptFeedback = {
      ...feedback,
      timestamp: new Date()
    };

    prompt.performance.feedback.push(feedbackWithTimestamp);
    
    // Update average rating
    const ratings = prompt.performance.feedback.map(f => f.rating);
    prompt.performance.averageRating = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;

    console.log(`📝 Feedback submitted for prompt: ${prompt.title}`);
    return true;
  }

  /**
   * Gets system-wide statistics.
   * @returns {any} System-wide statistics.
   */
  getSystemStatistics(): any {
    const prompts = Array.from(this.prompts.values());
    const categories = Array.from(this.categories.keys());
    
    return {
      totalPrompts: prompts.length,
      totalTemplates: this.templates.size,
      categories: categories.length,
      totalUses: prompts.reduce((sum, p) => sum + p.performance.totalUses, 0),
      averageRating: prompts.reduce((sum, p) => sum + p.performance.averageRating, 0) / prompts.length,
      mostPopularCategory: categories.reduce((max, cat) => {
        const catPrompts = this.categories.get(cat) || [];
        const maxPrompts = this.categories.get(max) || [];
        return catPrompts.length > maxPrompts.length ? cat : max;
      }),
      topPrompts: this.getPopularPrompts(5).map(p => ({
        id: p.id,
        title: p.title,
        uses: p.performance.totalUses,
        rating: p.performance.averageRating
      }))
    };
  }

  /**
   * Gets statistics for a specific prompt.
   * @param {string} promptId The ID of the prompt to get statistics for.
   * @returns {any} Statistics for the prompt.
   */
  getPromptStatistics(promptId: string): any {
    const prompt = this.getPrompt(promptId);
    if (!prompt) return null;

    const stats = this.usageStats.get(`prompt_${promptId}`);
    
    return {
      prompt: {
        id: prompt.id,
        title: prompt.title,
        category: prompt.category
      },
      usage: {
        totalUses: prompt.performance.totalUses,
        uniqueUsers: stats?.uniqueUsers.size || 0,
        lastUsed: prompt.performance.lastUsed,
        averageRating: prompt.performance.averageRating
      },
      feedback: {
        totalFeedback: prompt.performance.feedback.length,
        recentFeedback: prompt.performance.feedback.slice(-5)
      }
    };
  }

  /**
   * Gets the system status.
   * @returns {any} The system status.
   */
  getSystemStatus(): any {
    return {
      isLive: this.isLive,
      statistics: this.getSystemStatistics(),
      categories: Array.from(this.categories.keys()),
      templates: Array.from(this.templates.keys())
    };
  }

  /**
   * Subscribes to updates from the prompt manager.
   * @param {(status: any) => void} callback The callback to call with updates.
   * @returns {() => void} A function to unsubscribe.
   */
  subscribeToUpdates(callback: (status: any) => void): () => void {
    this.monitoringSubscribers.add(callback);
    return () => this.monitoringSubscribers.delete(callback);
  }
}

// Export singleton instance
let aiPromptManager: AIPromptManager | null = null;

/**
 * Gets the singleton instance of the AIPromptManager.
 * @returns {AIPromptManager} The singleton instance of the AIPromptManager.
 */
export function getAIPromptManager(): AIPromptManager {
  if (!aiPromptManager) {
    aiPromptManager = new AIPromptManager();
  }
  return aiPromptManager;
}
