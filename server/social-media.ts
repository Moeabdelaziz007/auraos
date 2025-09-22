import { TwitterApi } from 'twitter-api-v2';
import axios from 'axios';
import { storage } from './storage.js';

/**
 * Represents a social media account.
 */
export interface SocialMediaAccount {
  id: string;
  platform: 'twitter' | 'instagram' | 'linkedin' | 'facebook';
  username: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  isActive: boolean;
  userId: string;
  createdAt: Date;
}

/**
 * Represents a social media post.
 */
export interface SocialPost {
  id: string;
  content: string;
  platforms: string[];
  scheduledAt?: Date;
  imageUrl?: string;
  hashtags?: string[];
  isPublished: boolean;
  publishedAt?: Date;
  engagement?: {
    likes: number;
    shares: number;
    comments: number;
  };
}

/**
 * Manages social media accounts and posting.
 */
export class SocialMediaService {
  private twitterClients: Map<string, TwitterApi> = new Map();

  /**
   * Connects a Twitter account.
   * @param {string} userId The ID of the user connecting the account.
   * @param {string} accessToken The access token for the account.
   * @param {string} [refreshToken] The refresh token for the account.
   * @returns {Promise<SocialMediaAccount>} A promise that resolves with the connected account.
   */
  async connectTwitterAccount(userId: string, accessToken: string, refreshToken?: string): Promise<SocialMediaAccount> {
    try {
      const client = new TwitterApi(accessToken);
      const user = await client.v2.me();
      
      const account: SocialMediaAccount = {
        id: `twitter_${user.data.id}`,
        platform: 'twitter',
        username: user.data.username,
        accessToken,
        refreshToken,
        isActive: true,
        userId,
        createdAt: new Date()
      };

      this.twitterClients.set(account.id, client);
      return account;
    } catch (error) {
      throw new Error(`Failed to connect Twitter account: ${error.message}`);
    }
  }

  /**
   * Connects an Instagram account.
   * @param {string} userId The ID of the user connecting the account.
   * @param {string} accessToken The access token for the account.
   * @returns {Promise<SocialMediaAccount>} A promise that resolves with the connected account.
   */
  async connectInstagramAccount(userId: string, accessToken: string): Promise<SocialMediaAccount> {
    try {
      // Instagram Basic Display API integration
      const response = await axios.get(`https://graph.instagram.com/me?fields=id,username&access_token=${accessToken}`);
      
      const account: SocialMediaAccount = {
        id: `instagram_${response.data.id}`,
        platform: 'instagram',
        username: response.data.username,
        accessToken,
        isActive: true,
        userId,
        createdAt: new Date()
      };

      return account;
    } catch (error) {
      throw new Error(`Failed to connect Instagram account: ${error.message}`);
    }
  }

  /**
   * Connects a LinkedIn account.
   * @param {string} userId The ID of the user connecting the account.
   * @param {string} accessToken The access token for the account.
   * @returns {Promise<SocialMediaAccount>} A promise that resolves with the connected account.
   */
  async connectLinkedInAccount(userId: string, accessToken: string): Promise<SocialMediaAccount> {
    try {
      const response = await axios.get('https://api.linkedin.com/v2/me', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      const account: SocialMediaAccount = {
        id: `linkedin_${response.data.id}`,
        platform: 'linkedin',
        username: response.data.localizedFirstName + ' ' + response.data.localizedLastName,
        accessToken,
        isActive: true,
        userId,
        createdAt: new Date()
      };

      return account;
    } catch (error) {
      throw new Error(`Failed to connect LinkedIn account: ${error.message}`);
    }
  }

  /**
   * Posts a tweet to Twitter.
   * @param {string} accountId The ID of the Twitter account to post from.
   * @param {string} content The content of the tweet.
   * @param {string} [imageUrl] The URL of an image to attach to the tweet.
   * @returns {Promise<any>} A promise that resolves with the tweet data.
   */
  async postToTwitter(accountId: string, content: string, imageUrl?: string): Promise<any> {
    const client = this.twitterClients.get(accountId);
    if (!client) {
      throw new Error('Twitter client not found');
    }

    try {
      let tweetData: any = { text: content };
      
      if (imageUrl) {
        // Upload media first
        const mediaId = await client.v1.uploadMedia(imageUrl);
        tweetData.media = { media_ids: [mediaId] };
      }

      const tweet = await client.v2.tweet(tweetData);
      return tweet.data;
    } catch (error) {
      throw new Error(`Failed to post to Twitter: ${error.message}`);
    }
  }

  /**
   * Posts to Instagram.
   * @param {string} accountId The ID of the Instagram account to post from.
   * @param {string} content The content of the post.
   * @param {string} imageUrl The URL of the image to post.
   * @returns {Promise<any>} A promise that resolves with the post data.
   */
  async postToInstagram(accountId: string, content: string, imageUrl: string): Promise<any> {
    try {
      // Instagram requires a different approach - using Instagram Basic Display API
      // This is a simplified version - in production you'd need proper Instagram Graph API
      const account = await this.getAccountById(accountId);
      
      const response = await axios.post(`https://graph.instagram.com/v18.0/me/media`, {
        image_url: imageUrl,
        caption: content,
        access_token: account.accessToken
      });

      return response.data;
    } catch (error) {
      throw new Error(`Failed to post to Instagram: ${error.message}`);
    }
  }

  /**
   * Posts to LinkedIn.
   * @param {string} accountId The ID of the LinkedIn account to post from.
   * @param {string} content The content of the post.
   * @param {string} [imageUrl] The URL of an image to attach to the post.
   * @returns {Promise<any>} A promise that resolves with the post data.
   */
  async postToLinkedIn(accountId: string, content: string, imageUrl?: string): Promise<any> {
    try {
      const account = await this.getAccountById(accountId);
      
      const postData: any = {
        author: `urn:li:person:${account.id.replace('linkedin_', '')}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: content
            },
            shareMediaCategory: imageUrl ? 'IMAGE' : 'NONE'
          }
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
        }
      };

      if (imageUrl) {
        postData.specificContent['com.linkedin.ugc.ShareContent'].media = [{
          status: 'READY',
          description: {
            text: content
          },
          media: imageUrl
        }];
      }

      const response = await axios.post('https://api.linkedin.com/v2/ugcPosts', postData, {
        headers: { 
          Authorization: `Bearer ${account.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      throw new Error(`Failed to post to LinkedIn: ${error.message}`);
    }
  }

  /**
   * Schedules a post to be published at a later time.
   * @param {SocialPost} post The post to schedule.
   * @returns {Promise<void>}
   */
  async schedulePost(post: SocialPost): Promise<void> {
    // This would integrate with a scheduling service like node-cron
    // For now, we'll store the scheduled post
    console.log(`Scheduling post for platforms: ${post.platforms.join(', ')}`);
    console.log(`Content: ${post.content}`);
    console.log(`Scheduled for: ${post.scheduledAt}`);
  }

  /**
   * Publishes a scheduled post.
   * @param {string} postId The ID of the post to publish.
   * @returns {Promise<void>}
   */
  async publishScheduledPost(postId: string): Promise<void> {
    // This would fetch the scheduled post and publish it to all platforms
    console.log(`Publishing scheduled post: ${postId}`);
  }

  /**
   * Gets a social media account by its ID.
   * @param {string} accountId The ID of the account to get.
   * @returns {Promise<SocialMediaAccount>} A promise that resolves with the account.
   */
  async getAccountById(accountId: string): Promise<SocialMediaAccount> {
    // This would fetch from database
    // For now, return a mock account
    return {
      id: accountId,
      platform: 'twitter',
      username: 'demo_user',
      accessToken: 'demo_token',
      isActive: true,
      userId: 'user-1',
      createdAt: new Date()
    };
  }

  /**
   * Gets analytics for a social media account.
   * @param {string} accountId The ID of the account to get analytics for.
   * @param {string} platform The platform of the account.
   * @returns {Promise<any>} A promise that resolves with the analytics data.
   */
  async getAccountAnalytics(accountId: string, platform: string): Promise<any> {
    try {
      const account = await this.getAccountById(accountId);
      
      switch (platform) {
        case 'twitter':
          const twitterClient = this.twitterClients.get(accountId);
          if (twitterClient) {
            const user = await twitterClient.v2.me();
            return {
              followers: user.data.public_metrics?.followers_count || 0,
              following: user.data.public_metrics?.following_count || 0,
              tweets: user.data.public_metrics?.tweet_count || 0
            };
          }
          break;
        
        case 'instagram':
          // Instagram analytics would require Instagram Graph API
          return {
            followers: 0,
            following: 0,
            posts: 0
          };
        
        case 'linkedin':
          // LinkedIn analytics would require LinkedIn Marketing API
          return {
            connections: 0,
            posts: 0
          };
      }
      
      return {};
    } catch (error) {
      console.error(`Failed to get analytics for ${platform}:`, error);
      return {};
    }
  }

  /**
   * Cross-posts content to multiple platforms.
   * @param {string} content The content to post.
   * @param {string[]} platforms The platforms to post to.
   * @param {string} [imageUrl] The URL of an image to attach to the post.
   * @returns {Promise<any>} A promise that resolves with the results of the cross-posting.
   */
  async crossPost(content: string, platforms: string[], imageUrl?: string): Promise<any> {
    const results = [];
    
    for (const platform of platforms) {
      try {
        let result;
        
        switch (platform) {
          case 'twitter':
            result = await this.postToTwitter('twitter_demo', content, imageUrl);
            break;
          case 'instagram':
            if (imageUrl) {
              result = await this.postToInstagram('instagram_demo', content, imageUrl);
            } else {
              throw new Error('Instagram requires an image');
            }
            break;
          case 'linkedin':
            result = await this.postToLinkedIn('linkedin_demo', content, imageUrl);
            break;
        }
        
        results.push({ platform, success: true, data: result });
      } catch (error) {
        results.push({ platform, success: false, error: error.message });
      }
    }
    
    return results;
  }
}

// Export singleton instance
let socialMediaService: SocialMediaService | null = null;

/**
 * Gets the singleton instance of the SocialMediaService.
 * @returns {SocialMediaService} The singleton instance of the SocialMediaService.
 */
export function getSocialMediaService(): SocialMediaService {
  if (!socialMediaService) {
    socialMediaService = new SocialMediaService();
  }
  return socialMediaService;
}
