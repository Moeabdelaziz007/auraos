// Web Scraping and Automation Tools for AuraOS
// Zero-cost web scraping and automation capabilities

import axios from 'axios';
import * as cheerio from 'cheerio';
import { FirestoreService } from '../client/src/lib/firebase';

export class WebScrapingTools {
  private static readonly USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  ];

  /**
   * Scrape website content with intelligent parsing
   */
  static async scrapeWebsite(url: string, options: ScrapingOptions = {}): Promise<ScrapingResult> {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': this.getRandomUserAgent(),
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
        },
        timeout: options.timeout || 10000,
        maxRedirects: 5,
      });

      const $ = cheerio.load(response.data);
      
      const result: ScrapingResult = {
        success: true,
        url,
        title: $('title').text().trim(),
        content: this.extractContent($, options),
        metadata: this.extractMetadata($, response),
        links: this.extractLinks($, url),
        images: this.extractImages($, url),
        timestamp: new Date().toISOString(),
      };

      return result;
    } catch (error) {
      return {
        success: false,
        url,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Extract structured content from HTML
   */
  private static extractContent($: cheerio.CheerioAPI, options: ScrapingOptions): ContentData {
    const content: ContentData = {
      text: '',
      headings: [],
      paragraphs: [],
      lists: [],
      tables: [],
    };

    // Extract main content (try different selectors)
    const mainSelectors = [
      'main', 'article', '.content', '#content', '.main-content',
      '.post-content', '.entry-content', '.page-content'
    ];

    let mainContent = $('body');
    for (const selector of mainSelectors) {
      const element = $(selector);
      if (element.length > 0) {
        mainContent = element;
        break;
      }
    }

    // Extract text content
    content.text = mainContent.text().replace(/\s+/g, ' ').trim();

    // Extract headings
    $('h1, h2, h3, h4, h5, h6').each((_, element) => {
      const heading = $(element);
      content.headings.push({
        level: parseInt(element.tagName.substring(1)),
        text: heading.text().trim(),
        id: heading.attr('id') || '',
      });
    });

    // Extract paragraphs
    $('p').each((_, element) => {
      const paragraph = $(element).text().trim();
      if (paragraph.length > 20) { // Filter out short paragraphs
        content.paragraphs.push(paragraph);
      }
    });

    // Extract lists
    $('ul, ol').each((_, element) => {
      const list = $(element);
      const items: string[] = [];
      list.find('li').each((_, item) => {
        items.push($(item).text().trim());
      });
      content.lists.push({
        type: element.tagName.toLowerCase(),
        items,
      });
    });

    // Extract tables
    $('table').each((_, element) => {
      const table = $(element);
      const rows: string[][] = [];
      
      table.find('tr').each((_, row) => {
        const cells: string[] = [];
        $(row).find('td, th').each((_, cell) => {
          cells.push($(cell).text().trim());
        });
        if (cells.length > 0) {
          rows.push(cells);
        }
      });

      if (rows.length > 0) {
        content.tables.push({
          headers: rows[0] || [],
          rows: rows.slice(1),
        });
      }
    });

    return content;
  }

  /**
   * Extract metadata from HTML
   */
  private static extractMetadata($: cheerio.CheerioAPI, response: any): Metadata {
    const metadata: Metadata = {
      description: $('meta[name="description"]').attr('content') || '',
      keywords: $('meta[name="keywords"]').attr('content') || '',
      author: $('meta[name="author"]').attr('content') || '',
      language: $('html').attr('lang') || 'en',
      charset: $('meta[charset]').attr('charset') || 'utf-8',
      viewport: $('meta[name="viewport"]').attr('content') || '',
      robots: $('meta[name="robots"]').attr('content') || '',
      canonical: $('link[rel="canonical"]').attr('href') || '',
      ogTitle: $('meta[property="og:title"]').attr('content') || '',
      ogDescription: $('meta[property="og:description"]').attr('content') || '',
      ogImage: $('meta[property="og:image"]').attr('content') || '',
      twitterCard: $('meta[name="twitter:card"]').attr('content') || '',
      lastModified: response.headers['last-modified'] || '',
      contentType: response.headers['content-type'] || '',
    };

    return metadata;
  }

  /**
   * Extract links from HTML
   */
  private static extractLinks($: cheerio.CheerioAPI, baseUrl: string): LinkData[] {
    const links: LinkData[] = [];
    
    $('a[href]').each((_, element) => {
      const link = $(element);
      const href = link.attr('href');
      const text = link.text().trim();
      
      if (href && text) {
        const absoluteUrl = this.resolveUrl(href, baseUrl);
        links.push({
          url: absoluteUrl,
          text,
          title: link.attr('title') || '',
          isExternal: !absoluteUrl.includes(new URL(baseUrl).hostname),
        });
      }
    });

    return links;
  }

  /**
   * Extract images from HTML
   */
  private static extractImages($: cheerio.CheerioAPI, baseUrl: string): ImageData[] {
    const images: ImageData[] = [];
    
    $('img[src]').each((_, element) => {
      const img = $(element);
      const src = img.attr('src');
      const alt = img.attr('alt') || '';
      
      if (src) {
        const absoluteUrl = this.resolveUrl(src, baseUrl);
        images.push({
          url: absoluteUrl,
          alt,
          title: img.attr('title') || '',
          width: parseInt(img.attr('width') || '0'),
          height: parseInt(img.attr('height') || '0'),
        });
      }
    });

    return images;
  }

  /**
   * Resolve relative URLs to absolute URLs
   */
  private static resolveUrl(url: string, baseUrl: string): string {
    try {
      return new URL(url, baseUrl).href;
    } catch {
      return url;
    }
  }

  /**
   * Get random user agent
   */
  private static getRandomUserAgent(): string {
    return this.USER_AGENTS[Math.floor(Math.random() * this.USER_AGENTS.length)];
  }

  /**
   * Scrape multiple URLs in parallel
   */
  static async scrapeMultipleUrls(urls: string[], options: ScrapingOptions = {}): Promise<ScrapingResult[]> {
    const promises = urls.map(url => this.scrapeWebsite(url, options));
    return Promise.all(promises);
  }

  /**
   * Scrape search results from Google (for educational purposes)
   */
  static async scrapeGoogleSearch(query: string, options: SearchOptions = {}): Promise<SearchResult[]> {
    try {
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&num=${options.limit || 10}`;
      
      const response = await axios.get(searchUrl, {
        headers: {
          'User-Agent': this.getRandomUserAgent(),
        },
        timeout: 10000,
      });

      const $ = cheerio.load(response.data);
      const results: SearchResult[] = [];

      $('.g').each((_, element) => {
        const result = $(element);
        const titleElement = result.find('h3');
        const linkElement = result.find('a[href^="/url?q="]');
        const snippetElement = result.find('.VwiC3b, .s3v9rd');

        if (titleElement.length > 0 && linkElement.length > 0) {
          const title = titleElement.text().trim();
          const href = linkElement.attr('href');
          const snippet = snippetElement.text().trim();

          if (href) {
            const url = href.replace('/url?q=', '').split('&')[0];
            results.push({
              title,
              url: decodeURIComponent(url),
              snippet,
              position: results.length + 1,
            });
          }
        }
      });

      return results;
    } catch (error) {
      console.error('Google search scraping error:', error);
      return [];
    }
  }

  /**
   * Scrape social media posts (public data only)
   */
  static async scrapeSocialMedia(platform: 'twitter' | 'reddit' | 'hackernews', query: string): Promise<SocialMediaPost[]> {
    try {
      switch (platform) {
        case 'twitter':
          return await this.scrapeTwitter(query);
        case 'reddit':
          return await this.scrapeReddit(query);
        case 'hackernews':
          return await this.scrapeHackerNews(query);
        default:
          throw new Error(`Unsupported platform: ${platform}`);
      }
    } catch (error) {
      console.error(`Error scraping ${platform}:`, error);
      return [];
    }
  }

  private static async scrapeTwitter(query: string): Promise<SocialMediaPost[]> {
    // Note: This is a simplified example. Real Twitter scraping requires API access
    const posts: SocialMediaPost[] = [];
    
    // This would integrate with Twitter's public API or use alternative methods
    // For now, return a placeholder structure
    
    return posts;
  }

  private static async scrapeReddit(query: string): Promise<SocialMediaPost[]> {
    try {
      const subreddit = query.includes('/r/') ? query : `r/${query}`;
      const url = `https://www.reddit.com/${subreddit}.json`;
      
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'AuraOS Bot 1.0',
        },
      });

      const posts: SocialMediaPost[] = [];
      
      if (response.data?.data?.children) {
        response.data.data.children.forEach((post: any) => {
          const data = post.data;
          posts.push({
            id: data.id,
            title: data.title,
            content: data.selftext,
            author: data.author,
            score: data.score,
            url: `https://reddit.com${data.permalink}`,
            platform: 'reddit',
            timestamp: new Date(data.created_utc * 1000).toISOString(),
            subreddit: data.subreddit,
          });
        });
      }

      return posts;
    } catch (error) {
      console.error('Reddit scraping error:', error);
      return [];
    }
  }

  private static async scrapeHackerNews(query: string): Promise<SocialMediaPost[]> {
    try {
      const response = await axios.get('https://hacker-news.firebaseio.com/v0/topstories.json');
      const storyIds = response.data.slice(0, 30); // Get top 30 stories
      
      const posts: SocialMediaPost[] = [];
      
      for (const id of storyIds) {
        try {
          const storyResponse = await axios.get(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
          const story = storyResponse.data;
          
          if (story && story.title) {
            posts.push({
              id: story.id.toString(),
              title: story.title,
              content: story.text || '',
              author: story.by,
              score: story.score || 0,
              url: story.url || `https://news.ycombinator.com/item?id=${story.id}`,
              platform: 'hackernews',
              timestamp: new Date(story.time * 1000).toISOString(),
            });
          }
        } catch (error) {
          console.error(`Error fetching story ${id}:`, error);
        }
      }

      return posts;
    } catch (error) {
      console.error('HackerNews scraping error:', error);
      return [];
    }
  }

  /**
   * Save scraping results to Firestore
   */
  static async saveScrapingResults(userId: string, results: ScrapingResult[]): Promise<string[]> {
    try {
      const postIds: string[] = [];
      
      for (const result of results) {
        if (result.success) {
          const postData = {
            type: 'scraping_result',
            title: result.title || 'Scraped Content',
            content: result.content.text,
            metadata: {
              url: result.url,
              scrapingTimestamp: result.timestamp,
              linkCount: result.links?.length || 0,
              imageCount: result.images?.length || 0,
            },
            visibility: 'private',
          };
          
          const postId = await FirestoreService.createPost(userId, postData);
          postIds.push(postId);
        }
      }
      
      return postIds;
    } catch (error) {
      throw new Error(`Failed to save scraping results: ${error.message}`);
    }
  }
}

// Type definitions
export interface ScrapingOptions {
  timeout?: number;
  extractImages?: boolean;
  extractLinks?: boolean;
  maxDepth?: number;
  followRedirects?: boolean;
}

export interface ScrapingResult {
  success: boolean;
  url: string;
  title?: string;
  content?: ContentData;
  metadata?: Metadata;
  links?: LinkData[];
  images?: ImageData[];
  error?: string;
  timestamp: string;
}

export interface ContentData {
  text: string;
  headings: HeadingData[];
  paragraphs: string[];
  lists: ListData[];
  tables: TableData[];
}

export interface HeadingData {
  level: number;
  text: string;
  id: string;
}

export interface ListData {
  type: string;
  items: string[];
}

export interface TableData {
  headers: string[];
  rows: string[][];
}

export interface Metadata {
  description: string;
  keywords: string;
  author: string;
  language: string;
  charset: string;
  viewport: string;
  robots: string;
  canonical: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterCard: string;
  lastModified: string;
  contentType: string;
}

export interface LinkData {
  url: string;
  text: string;
  title: string;
  isExternal: boolean;
}

export interface ImageData {
  url: string;
  alt: string;
  title: string;
  width: number;
  height: number;
}

export interface SearchOptions {
  limit?: number;
  language?: string;
  region?: string;
}

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  position: number;
}

export interface SocialMediaPost {
  id: string;
  title: string;
  content: string;
  author: string;
  score: number;
  url: string;
  platform: string;
  timestamp: string;
  subreddit?: string;
}

export default WebScrapingTools;
