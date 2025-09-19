// This file contains OpenAI integration utilities for the frontend
// Actual API calls should go through the backend for security

export interface AIGenerationRequest {
  prompt: string;
  type: 'post' | 'reply' | 'analysis';
}

export interface AIGenerationResponse {
  content?: string;
  response?: string;
  hashtags?: string[];
}

export async function generateContent(request: AIGenerationRequest): Promise<AIGenerationResponse> {
  const response = await fetch('/api/ai/generate-content', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error('Failed to generate content');
  }

  return response.json();
}

export async function sendChatMessage(message: string, userId: string = 'user-1'): Promise<{ response: string }> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message, userId }),
  });

  if (!response.ok) {
    throw new Error('Failed to send chat message');
  }

  return response.json();
}
