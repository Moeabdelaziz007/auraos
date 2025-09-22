import Groq from 'groq-sdk';
import type { AIService } from './ai-manager';

/**
 * Implements the AIService interface for the Groq API.
 * This service is optimized for fast LLM inference.
 */
export class GroqService implements AIService {
  private groq: Groq;
  // Using a powerful and fast model as recommended in the blueprint.
  private model = 'llama3-8b-8192';

  constructor() {
    this.groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }

  /**
   * Checks if the Groq service is configured and available.
   * @returns A boolean indicating if the API key is present.
   */
  async isAvailable(): Promise<boolean> {
    return !!process.env.GROQ_API_KEY;
  }

  /**
   * Generates a chat response using the Groq API.
   * @param prompt The user's input prompt.
   * @returns A promise that resolves to the model's generated response.
   */
  async generate(prompt: string): Promise<string> {
    if (!await this.isAvailable()) {
      throw new Error('Groq service is not available. API key is missing.');
    }

    try {
      const chatCompletion = await this.groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: this.model,
      });
      return chatCompletion.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Error generating response from Groq:', error);
      throw new Error('Failed to get response from Groq.');
    }
  }
}
