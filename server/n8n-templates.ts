import { storage } from './storage.js';

export interface N8nWorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: 'content' | 'engagement' | 'analytics' | 'automation';
  nodes: N8nNode[];
  connections: N8nConnection[];
  tags: string[];
  isPublic: boolean;
  usageCount: number;
  createdAt: Date;
}

export interface N8nNode {
  id: string;
  name: string;
  type: string;
  typeVersion: number;
  position: [number, number];
  parameters: Record<string, any>;
  credentials?: Record<string, string>;
}

export interface N8nConnection {
  node: string;
  type: string;
  index: number;
}

export class N8nTemplateService {
  private templates: Map<string, N8nWorkflowTemplate> = new Map();

  constructor() {
    this.initializeTemplates();
  }

  private initializeTemplates() {
    // AI Content Generator Template
    const contentGeneratorTemplate: N8nWorkflowTemplate = {
      id: 'ai-content-generator',
      name: 'AI Content Generator',
      description: 'Automatically generates and posts content across multiple social media platforms using AI',
      category: 'content',
      tags: ['ai', 'content', 'automation', 'social-media'],
      isPublic: true,
      usageCount: 0,
      createdAt: new Date(),
      nodes: [
        {
          id: 'trigger-schedule',
          name: 'Schedule Trigger',
          type: 'n8n-nodes-base.scheduleTrigger',
          typeVersion: 1,
          position: [240, 300],
          parameters: {
            rule: {
              interval: [{ field: 'hours', value: 6 }]
            }
          }
        },
        {
          id: 'ai-content-generation',
          name: 'AI Content Generation',
          type: 'n8n-nodes-base.openAi',
          typeVersion: 1,
          position: [460, 300],
          parameters: {
            resource: 'chat',
            operation: 'create',
            model: 'gpt-4',
            messages: {
              values: [
                {
                  role: 'system',
                  content: 'You are a social media content creator. Generate engaging posts for Twitter, Instagram, and LinkedIn. Include relevant hashtags and emojis.'
                },
                {
                  role: 'user',
                  content: 'Generate a post about {{ $json.topic || "technology trends" }}'
                }
              ]
            }
          }
        },
        {
          id: 'content-optimizer',
          name: 'Content Optimizer',
          type: 'n8n-nodes-base.function',
          typeVersion: 1,
          position: [680, 300],
          parameters: {
            functionCode: `
              const content = $input.first().json.message.content;
              const platforms = ['twitter', 'instagram', 'linkedin'];
              
              const optimizedContent = platforms.map(platform => {
                let optimized = content;
                
                switch(platform) {
                  case 'twitter':
                    optimized = content.substring(0, 280);
                    break;
                  case 'instagram':
                    optimized = content + '\\n\\n#instagood #socialmedia #ai';
                    break;
                  case 'linkedin':
                    optimized = content.replace(/\\n/g, '\\n\\n');
                    break;
                }
                
                return {
                  platform,
                  content: optimized,
                  hashtags: content.match(/#\\w+/g) || []
                };
              });
              
              return optimizedContent.map(item => ({ json: item }));
            `
          }
        },
        {
          id: 'social-media-poster',
          name: 'Social Media Poster',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 4,
          position: [900, 300],
          parameters: {
            url: '={{ $json.platform === "twitter" ? "https://api.twitter.com/2/tweets" : $json.platform === "instagram" ? "https://graph.instagram.com/v18.0/me/media" : "https://api.linkedin.com/v2/ugcPosts" }}',
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer {{ $credentials.socialMediaToken }}'
            },
            body: {
              'twitter': {
                text: '={{ $json.content }}'
              },
              'instagram': {
                image_url: '={{ $json.imageUrl }}',
                caption: '={{ $json.content }}'
              },
              'linkedin': {
                author: 'urn:li:person:{{ $credentials.linkedinUserId }}',
                lifecycleState: 'PUBLISHED',
                specificContent: {
                  'com.linkedin.ugc.ShareContent': {
                    shareCommentary: {
                      text: '={{ $json.content }}'
                    },
                    shareMediaCategory: 'NONE'
                  }
                },
                visibility: {
                  'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
                }
              }
            }['{{ $json.platform }}']
          }
        }
      ],
      connections: [
        { node: 'trigger-schedule', type: 'main', index: 0 },
        { node: 'ai-content-generation', type: 'main', index: 0 },
        { node: 'content-optimizer', type: 'main', index: 0 },
        { node: 'social-media-poster', type: 'main', index: 0 }
      ]
    };

    // Engagement Monitor Template
    const engagementMonitorTemplate: N8nWorkflowTemplate = {
      id: 'engagement-monitor',
      name: 'Engagement Monitor',
      description: 'Monitors social media engagement and triggers automated responses',
      category: 'engagement',
      tags: ['engagement', 'monitoring', 'automation', 'response'],
      isPublic: true,
      usageCount: 0,
      createdAt: new Date(),
      nodes: [
        {
          id: 'webhook-trigger',
          name: 'Webhook Trigger',
          type: 'n8n-nodes-base.webhook',
          typeVersion: 1,
          position: [240, 300],
          parameters: {
            path: 'engagement-webhook',
            httpMethod: 'POST'
          }
        },
        {
          id: 'engagement-analyzer',
          name: 'Engagement Analyzer',
          type: 'n8n-nodes-base.function',
          typeVersion: 1,
          position: [460, 300],
          parameters: {
            functionCode: `
              const data = $input.first().json;
              const engagement = data.engagement || {};
              
              const analysis = {
                sentiment: 'neutral',
                priority: 'low',
                responseNeeded: false,
                suggestedResponse: ''
              };
              
              // Analyze sentiment
              if (engagement.sentiment_score > 0.7) {
                analysis.sentiment = 'positive';
                analysis.priority = 'high';
                analysis.responseNeeded = true;
                analysis.suggestedResponse = 'Thank you for your positive feedback! 🙌';
              } else if (engagement.sentiment_score < -0.7) {
                analysis.sentiment = 'negative';
                analysis.priority = 'high';
                analysis.responseNeeded = true;
                analysis.suggestedResponse = 'I understand your concern. Let me help you with that.';
              }
              
              return [{ json: { ...data, analysis } }];
            `
          }
        },
        {
          id: 'ai-response-generator',
          name: 'AI Response Generator',
          type: 'n8n-nodes-base.openAi',
          typeVersion: 1,
          position: [680, 300],
          parameters: {
            resource: 'chat',
            operation: 'create',
            model: 'gpt-4',
            messages: {
              values: [
                {
                  role: 'system',
                  content: 'You are a helpful social media manager. Generate appropriate responses to user engagement.'
                },
                {
                  role: 'user',
                  content: 'Generate a response to: {{ $json.content }} (Sentiment: {{ $json.analysis.sentiment }})'
                }
              ]
            }
          }
        },
        {
          id: 'auto-responder',
          name: 'Auto Responder',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 4,
          position: [900, 300],
          parameters: {
            url: '={{ $json.platform === "twitter" ? "https://api.twitter.com/2/tweets" : "https://api.linkedin.com/v2/ugcPosts" }}',
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer {{ $credentials.socialMediaToken }}'
            },
            body: {
              text: '={{ $json.aiResponse }}',
              reply: {
                in_reply_to_tweet_id: '={{ $json.tweet_id }}'
              }
            }
          }
        }
      ],
      connections: [
        { node: 'webhook-trigger', type: 'main', index: 0 },
        { node: 'engagement-analyzer', type: 'main', index: 0 },
        { node: 'ai-response-generator', type: 'main', index: 0 },
        { node: 'auto-responder', type: 'main', index: 0 }
      ]
    };

    // Analytics Dashboard Template
    const analyticsDashboardTemplate: N8nWorkflowTemplate = {
      id: 'analytics-dashboard',
      name: 'Analytics Dashboard',
      description: 'Collects and processes social media analytics data',
      category: 'analytics',
      tags: ['analytics', 'dashboard', 'metrics', 'reporting'],
      isPublic: true,
      usageCount: 0,
      createdAt: new Date(),
      nodes: [
        {
          id: 'schedule-trigger',
          name: 'Daily Schedule',
          type: 'n8n-nodes-base.scheduleTrigger',
          typeVersion: 1,
          position: [240, 300],
          parameters: {
            rule: {
              interval: [{ field: 'days', value: 1 }]
            }
          }
        },
        {
          id: 'twitter-analytics',
          name: 'Twitter Analytics',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 4,
          position: [460, 200],
          parameters: {
            url: 'https://api.twitter.com/2/users/me',
            method: 'GET',
            headers: {
              'Authorization': 'Bearer {{ $credentials.twitterToken }}'
            }
          }
        },
        {
          id: 'instagram-analytics',
          name: 'Instagram Analytics',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 4,
          position: [460, 300],
          parameters: {
            url: 'https://graph.instagram.com/v18.0/me/insights',
            method: 'GET',
            headers: {
              'Authorization': 'Bearer {{ $credentials.instagramToken }}'
            }
          }
        },
        {
          id: 'linkedin-analytics',
          name: 'LinkedIn Analytics',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 4,
          position: [460, 400],
          parameters: {
            url: 'https://api.linkedin.com/v2/ugcPosts',
            method: 'GET',
            headers: {
              'Authorization': 'Bearer {{ $credentials.linkedinToken }}'
            }
          }
        },
        {
          id: 'data-processor',
          name: 'Data Processor',
          type: 'n8n-nodes-base.function',
          typeVersion: 1,
          position: [680, 300],
          parameters: {
            functionCode: `
              const twitterData = $input.all().find(item => item.json.platform === 'twitter')?.json;
              const instagramData = $input.all().find(item => item.json.platform === 'instagram')?.json;
              const linkedinData = $input.all().find(item => item.json.platform === 'linkedin')?.json;
              
              const analytics = {
                date: new Date().toISOString(),
                platforms: {
                  twitter: {
                    followers: twitterData?.public_metrics?.followers_count || 0,
                    following: twitterData?.public_metrics?.following_count || 0,
                    tweets: twitterData?.public_metrics?.tweet_count || 0
                  },
                  instagram: {
                    followers: instagramData?.followers_count || 0,
                    following: instagramData?.following_count || 0,
                    posts: instagramData?.media_count || 0
                  },
                  linkedin: {
                    connections: linkedinData?.connections_count || 0,
                    posts: linkedinData?.posts_count || 0
                  }
                },
                totalEngagement: 0,
                topPerformingPost: null
              };
              
              return [{ json: analytics }];
            `
          }
        },
        {
          id: 'database-saver',
          name: 'Save to Database',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 4,
          position: [900, 300],
          parameters: {
            url: 'http://localhost:5000/api/analytics/save',
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: '={{ $json }}'
          }
        }
      ],
      connections: [
        { node: 'schedule-trigger', type: 'main', index: 0 },
        { node: 'twitter-analytics', type: 'main', index: 0 },
        { node: 'instagram-analytics', type: 'main', index: 0 },
        { node: 'linkedin-analytics', type: 'main', index: 0 },
        { node: 'data-processor', type: 'main', index: 0 },
        { node: 'database-saver', type: 'main', index: 0 }
      ]
    };

    // Store templates
    this.templates.set(contentGeneratorTemplate.id, contentGeneratorTemplate);
    this.templates.set(engagementMonitorTemplate.id, engagementMonitorTemplate);
    this.templates.set(analyticsDashboardTemplate.id, analyticsDashboardTemplate);
  }

  async getTemplates(): Promise<N8nWorkflowTemplate[]> {
    return Array.from(this.templates.values());
  }

  async getTemplate(id: string): Promise<N8nWorkflowTemplate | undefined> {
    return this.templates.get(id);
  }

  async createTemplate(template: Omit<N8nWorkflowTemplate, 'id' | 'createdAt' | 'usageCount'>): Promise<N8nWorkflowTemplate> {
    const id = `template_${Date.now()}`;
    const newTemplate: N8nWorkflowTemplate = {
      ...template,
      id,
      createdAt: new Date(),
      usageCount: 0
    };
    
    this.templates.set(id, newTemplate);
    return newTemplate;
  }

  async incrementUsage(id: string): Promise<void> {
    const template = this.templates.get(id);
    if (template) {
      template.usageCount++;
      this.templates.set(id, template);
    }
  }

  async exportTemplate(id: string): Promise<string> {
    const template = this.templates.get(id);
    if (!template) {
      throw new Error('Template not found');
    }
    
    return JSON.stringify(template, null, 2);
  }

  async importTemplate(templateJson: string): Promise<N8nWorkflowTemplate> {
    const template = JSON.parse(templateJson) as N8nWorkflowTemplate;
    const id = `imported_${Date.now()}`;
    
    const importedTemplate: N8nWorkflowTemplate = {
      ...template,
      id,
      createdAt: new Date(),
      usageCount: 0
    };
    
    this.templates.set(id, importedTemplate);
    return importedTemplate;
  }
}

// Export singleton instance
let n8nTemplateService: N8nTemplateService | null = null;

export function getN8nTemplateService(): N8nTemplateService {
  if (!n8nTemplateService) {
    n8nTemplateService = new N8nTemplateService();
  }
  return n8nTemplateService;
}
