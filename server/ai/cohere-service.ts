import { CohereClient } from 'cohere-ai';
import type { AIService } from './ai-manager';

/**
 * Implements the AIService interface for the Cohere API.
 * This service specializes in providing high-quality embeddings and reranking
 * capabilities, which are essential for Retrieval-Augmented Generation (RAG).
 */
export class CohereService implements AIService {
  private cohere: CohereClient;
  private embeddingModel = 'embed-english-v3.0';
  private rerankModel = 'rerank-english-v2.0';

  constructor() {
    this.cohere = new CohereClient({
      token: process.env.COHERE_API_KEY,
    });
  }

  /**
   * Checks if the Cohere service is configured and available.
   * @returns A boolean indicating if the API key is present.
   */
  async isAvailable(): Promise<boolean> {
    return !!process.env.COHERE_API_KEY;
  }

  /**
   * This service is specialized and does not provide general text generation.
   * Throws an error if called.
   */
  async generate(prompt: string): Promise<string> {
    console.warn('CohereService is not intended for general text generation.');
    throw new Error('Cohere generate function is not implemented. Use for embeddings or rerank.');
  }

  /**
   * Generates a vector embedding for a given text.
   * @param text The text to embed.
   * @returns A promise that resolves to an array of numbers representing the vector.
   */
  async getEmbedding(text: string): Promise<number[]> {
    if (!await this.isAvailable()) {
      throw new Error('Cohere service is not available for embeddings. API key is missing.');
    }
    const response = await this.cohere.embed({
      texts: [text],
      model: this.embeddingModel,
      inputType: 'search_document',
    });
    return response.embeddings[0];
  }

  /**
   * Reranks a list of documents based on a query.
   * @param query The search query.
   * @param documents A list of documents to rerank.
   * @returns A promise that resolves to a sorted list of the most relevant documents.
   */
  async rerank(query: string, documents: string[]): Promise<string[]> {
    if (!await this.isAvailable()) {
      throw new Error('Cohere service is not available for rerank. API key is missing.');
    }
    const response = await this.cohere.rerank({
      query,
      documents,
      model: this.rerankModel,
      topN: 5, // Return the top 5 most relevant documents
    });
    // Return the original document text in the new, reranked order.
    return response.results.map(result => documents[result.index]);
  }
}
