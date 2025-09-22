import { GoogleGenAI } from "@google/genai";

// This API key is from Gemini Developer API Key, not vertex AI API Key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

/**
 * Generates content using the Gemini AI model.
 * @param {string} prompt The prompt to generate content from.
 * @returns {Promise<string>} A promise that resolves with the generated content.
 */
export async function generateContent(prompt: string): Promise<string> {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        return response.text || "Something went wrong generating content";
    } catch (error) {
        console.error('Error generating content:', error);
        throw new Error(`Failed to generate content: ${error}`);
    }
}

/**
 * Generates social media post content, including hashtags, based on a topic and mood.
 * @param {string} topic The topic of the post.
 * @param {string} [mood] The desired mood or tone of the post.
 * @returns {Promise<{ content: string; hashtags: string[] }>} A promise that resolves with the post content and hashtags.
 */
export async function generatePostContent(topic: string, mood?: string): Promise<{ content: string; hashtags: string[] }> {
    try {
        const systemPrompt = `You are a social media content creator. Generate engaging social media post content based on the topic "${topic}"${mood ? ` with a ${mood} tone` : ''}. 
        
        Respond with JSON in this exact format:
        {
            "content": "The main post content (keep it engaging and under 280 characters)",
            "hashtags": ["relevant", "hashtags", "without", "hash", "symbols"]
        }`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: "object",
                    properties: {
                        content: { type: "string" },
                        hashtags: { 
                            type: "array",
                            items: { type: "string" }
                        }
                    },
                    required: ["content", "hashtags"]
                }
            },
            contents: systemPrompt,
        });

        const rawJson = response.text;
        if (rawJson) {
            const data = JSON.parse(rawJson);
            return data;
        } else {
            throw new Error("Empty response from model");
        }
    } catch (error) {
        console.error('Error generating post content:', error);
        throw new Error(`Failed to generate post content: ${error}`);
    }
}

/**
 * Chats with the AI assistant.
 * @param {Array<{ role: string; content: string }>} messages An array of message objects, representing the conversation history.
 * @returns {Promise<string>} A promise that resolves with the assistant's response.
 */
export async function chatWithAssistant(messages: Array<{ role: string; content: string }>): Promise<string> {
    try {
        // Convert messages to Gemini format
        const geminiMessages = messages.map(msg => {
            if (msg.role === 'system') {
                return { role: 'model', parts: [{ text: msg.content }] };
            } else if (msg.role === 'assistant') {
                return { role: 'model', parts: [{ text: msg.content }] };
            } else {
                return { role: 'user', parts: [{ text: msg.content }] };
            }
        });

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: geminiMessages,
        });

        return response.text || "I'm sorry, I couldn't generate a response.";
    } catch (error) {
        console.error('Error in chat assistant:', error);
        throw new Error(`Failed to get chat response: ${error}`);
    }
}

/**
 * Analyzes a workflow configuration and provides suggestions and optimizations.
 * @param {any} workflowConfig The workflow configuration to analyze.
 * @returns {Promise<{ suggestions: string[]; optimizations: string[] }>} A promise that resolves with suggestions and optimizations.
 */
export async function analyzeWorkflow(workflowConfig: any): Promise<{ suggestions: string[]; optimizations: string[] }> {
    try {
        const systemPrompt = `You are a workflow automation expert. Analyze this n8n-style workflow configuration and provide suggestions for improvement and optimization.

        Workflow config: ${JSON.stringify(workflowConfig)}

        Respond with JSON in this exact format:
        {
            "suggestions": ["suggestion 1", "suggestion 2"],
            "optimizations": ["optimization 1", "optimization 2"]
        }`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: "object",
                    properties: {
                        suggestions: { 
                            type: "array",
                            items: { type: "string" }
                        },
                        optimizations: { 
                            type: "array",
                            items: { type: "string" }
                        }
                    },
                    required: ["suggestions", "optimizations"]
                }
            },
            contents: systemPrompt,
        });

        const rawJson = response.text;
        if (rawJson) {
            const data = JSON.parse(rawJson);
            return data;
        } else {
            throw new Error("Empty response from model");
        }
    } catch (error) {
        console.error('Error analyzing workflow:', error);
        throw new Error(`Failed to analyze workflow: ${error}`);
    }
}