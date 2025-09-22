import { HfInference } from '@huggingface/inference';
import type { AIService } from './ai-manager';

/**
 * Implements the AIService interface for the Hugging Face Inference API.
 * This service handles text generation using a conversational model.
 */
export class HuggingFaceService implements AIService {
  private hf: HfInference;
  // Using a model recommended in the user's comprehensive list.
  private model = 'microsoft/DialoGPT-medium';

  constructor() {
    // Initializes the Hugging Face client with the API token from environment variables.
    this.hf = new HfInference(process.env.HUGGINGFACE_TOKEN);
  }

  /**
   * Checks if the Hugging Face service is configured and available.
   * @returns A boolean indicating if the API token is present.
   */
  async isAvailable(): Promise<boolean> {
    return !!process.env.HUGGINGFACE_TOKEN;
  }

  /**
   * Generates a conversational response using the Hugging Face API.
   * @param prompt The user's input to the conversational model.
   * @returns A promise that resolves to the model's generated text.
   */
  async generate(prompt: string): Promise<string> {
    if (!await this.isAvailable()) {
      throw new Error('Hugging Face service is not available. API token is missing.');
    }

    try {
      const result = await this.hf.conversational({
        model: this.model,
        inputs: {
          text: prompt,
          // Providing empty arrays for context as this is a simple implementation.
          generated_responses: [],
          past_user_inputs: [],
        },
      });
      return result.generated_text;
    } catch (error) {
      console.error('Error generating response from Hugging Face:', error);
      throw new Error('Failed to get response from Hugging Face.');
    }
  }
}
