import { GoogleGenAI } from "@google/genai";
import { PersonaType, Message } from '../types';
import { SYSTEM_INSTRUCTION_BASE, PERSONA_PROMPTS, PERSONAS, FALLBACK_TOPICS } from '../constants';

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey });
};

// Helper to get a random fallback topic
const getFallbackTopic = (personaType: PersonaType): string => {
  const topics = FALLBACK_TOPICS[personaType];
  return topics[Math.floor(Math.random() * topics.length)];
};

export const generateOpeningMessage = async (personaType: PersonaType): Promise<string> => {
  const persona = PERSONAS[personaType];
  const staticGreeting = persona.greeting;

  try {
    const ai = getClient();
    
    // Construct a single, self-contained prompt. 
    // We avoid using 'systemInstruction' in config for this specific call 
    // to prevent the model from getting confused between "Being a chatbot" and "Generating a single topic".
    const prompt = `
Role: You are ${persona.name} (${persona.title}).
Description: ${persona.description}
Task: Generate ONE abrupt, specific, and slightly confusing question/statement to start a conversation, based on your obsession.
Constraint: Do NOT include any greeting (like "Hello" or "I am..."). ONLY output the topic sentence.
Language: Japanese.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt, // Simple string prompt works best for one-shot instructions
      config: {
        maxOutputTokens: 100,
        temperature: 1.0, 
      },
    });
    
    const generatedTopic = response.text?.trim();
    
    // If empty response, throw to trigger fallback
    if (!generatedTopic) {
      throw new Error("Empty generated topic");
    }
    
    return `${staticGreeting}\n\n${generatedTopic}`;

  } catch (error) {
    console.warn("Gemini Opening Gen Error (Using Fallback):", error);
    // Use fallback to ensure the UI never looks broken
    const fallback = getFallbackTopic(personaType);
    return `${staticGreeting}\n\n${fallback}`;
  }
}

export const generateResponse = async (
  currentPersona: PersonaType,
  history: Message[],
  userMessage: string
): Promise<string> => {
  try {
    const ai = getClient();
    
    // Construct the specific system instruction
    const systemInstruction = SYSTEM_INSTRUCTION_BASE + PERSONA_PROMPTS[currentPersona];

    // Map history to Gemini format
    const contents = history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content }]
    }));

    // Add current user message
    contents.push({
      role: 'user',
      parts: [{ text: userMessage }]
    });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        maxOutputTokens: 60,
        temperature: 0.8,
      },
    });

    const text = response.text;
    
    // If text is empty (e.g. blocked by safety filters or network issue), use fallback
    if (!text) {
      console.warn("Gemini returned empty text. Using fallback.");
      return getFallbackTopic(currentPersona);
    }
    
    return text.trim();
  } catch (error) {
    console.error("Gemini API Error:", error);
    // Return a persona-specific fallback instead of a generic error message
    // This maintains the immersion even when the API fails
    return getFallbackTopic(currentPersona);
  }
};