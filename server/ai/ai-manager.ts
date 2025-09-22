import { HuggingFaceService } from './huggingface-service';
import { GroqService } from './groq-service';
import { CohereService } from './cohere-service';
// The AIService interface defines the contract for all AI provider services.
// This ensures a consistent structure, making them interchangeable.
export interface AIService {
  generate(prompt: string): Promise<string>;
  isAvailable(): Promise<boolean>;
  getEmbedding?(text: string): Promise<number[]>;
  rerank?(query: string, documents: string[]): Promise<string[]>;
}

/**
 * Manages multiple AI service providers, with a fallback mechanism.
 * This class is designed to be a central point for all AI interactions,
 * allowing for easy switching and addition of new providers.
 */
export class AIManager {
  private services: Map<string, AIService> = new Map();
  private fallbackChain: string[] = [];

  constructor() {
    this.initializeServices();
    this.setupFallbackChain();
  }

  /**
   * Initializes the AI service clients.
   * Following the approved plan, I will start by integrating Hugging Face,
   * and then gradually add other providers like Groq and Gemini.
   */
  private initializeServices(): void {
    this.services.set('huggingface', new HuggingFaceService());
    this.services.set('groq', new GroqService());
    this.services.set('cohere', new CohereService());
  }

  /**
   * Defines the order of AI providers to try in case of failure.
   * This ensures resilience and high availability.
   */
  private setupFallbackChain(): void {
    this.fallbackChain = ['huggingface', 'groq', 'gemini', 'cohere'];
  }

  /**
   * Generates a response from the best available AI service.
   * It iterates through the fallback chain until a service responds successfully.
   * @param prompt The input prompt for the AI.
   * @returns A promise that resolves to the AI-generated response.
   */
  async generateResponse(prompt: string): Promise<string> {
    for (const serviceName of this.fallbackChain) {
      const service = this.services.get(serviceName);
      if (service) {
        try {
          if (await service.isAvailable()) {
            console.log(`Using AI service: ${serviceName}`);
            return await service.generate(prompt);
          }
        } catch (error) {
          console.warn(`Service ${serviceName} failed. Trying next...`, error);
        }
      }
    }
    throw new Error('All AI services are unavailable.');
  }

  /**
   * Generates a vector embedding for a given text using the Cohere service.
   * @param text The text to embed.
   * @returns A promise that resolves to an array of numbers representing the vector.
   */
  async getEmbedding(text: string): Promise<number[]> {
    const cohereService = this.services.get('cohere');
    if (cohereService?.getEmbedding && await cohereService.isAvailable()) {
      return cohereService.getEmbedding(text);
    }
    throw new Error('Embedding service (Cohere) is not available.');
  }

  /**
   * Reranks a list of documents based on a query using the Cohere service.
   * @param query The search query.
   * @param documents A list of documents to rerank.
   * @returns A promise that resolves to a sorted list of the most relevant documents.
   */
  async rerank(query: string, documents: string[]): Promise<string[]> {
    const cohereService = this.services.get('cohere');
    if (cohereService?.rerank && await cohereService.isAvailable()) {
      return cohereService.rerank(query, documents);
    }
    throw new Error('Rerank service (Cohere) is not available.');
  }
}

// Export a singleton instance of the manager for use throughout the application.
export const aiManager = new AIManager();
