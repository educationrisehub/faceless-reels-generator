
import { GoogleGenAI, Type } from "@google/genai";
import { Niche, CreationMode, Platform, ContentType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getHookSchema = () => ({
  type: Type.OBJECT,
  properties: {
    posts: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          content: { 
            type: Type.STRING,
            description: "The content of the post. Max 2 sentences, under 20 words total."
          },
          visualIdea: {
            type: Type.STRING,
            description: "A short visual description for the background (e.g., 'Aesthetic desk setup with a laptop', 'POV walking through a neon city')."
          }
        },
        required: ["content", "visualIdea"]
      }
    }
  },
  required: ["posts"]
});

const getCarouselSchema = () => ({
  type: Type.OBJECT,
  properties: {
    slides: {
      type: Type.ARRAY,
      items: { 
        type: Type.OBJECT,
        properties: {
          text: { type: Type.STRING, description: "Main text on the slide." },
          visual: { type: Type.STRING, description: "Visual idea for this specific slide." }
        },
        required: ["text", "visual"]
      }
    },
    cta: { type: Type.STRING }
  },
  required: ["slides", "cta"]
});

const getPlanSchema = () => ({
  type: Type.OBJECT,
  properties: {
    plan: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          day: { type: Type.NUMBER },
          topic: { type: Type.STRING },
          type: { type: Type.STRING },
          idea: { type: Type.STRING },
          visualIdea: { type: Type.STRING, description: "A general visual style or B-roll idea for this day's content." },
          slides: {
            type: Type.ARRAY,
            items: { 
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING },
                visual: { type: Type.STRING }
              },
              required: ["text", "visual"]
            },
            description: "Provide exactly 3 slides if type is Carousel. Otherwise leave empty."
          }
        },
        required: ["day", "topic", "type", "idea", "visualIdea"]
      }
    }
  },
  required: ["plan"]
});

export async function generateContent(params: {
  niche: Niche;
  mode: CreationMode;
  platforms: Platform[];
  contentType: ContentType;
  topic: string;
}): Promise<any> {
  const { niche, mode, platforms, contentType, topic } = params;
  
  let systemInstruction = "You are an expert faceless reels content strategist. ";
  let userPrompt = "";
  let responseSchema: any;

  const platformStr = platforms.join(", ");
  const topicContext = topic ? `Topic: ${topic}. ` : "";

  if (mode === 'HOOKS') {
    systemInstruction += "Generate 10 viral, hook-first short posts. Each post must have a 'visualIdea' describing aesthetic B-roll footage. STRICT CONSTRAINTS: 1. Max 2 sentences per post. 2. Total length MUST be under 20 words per post. 3. First line MUST be a powerful on-screen hook. 4. Use short lines for fast reading. 5. NO emojis, NO hashtags.";
    userPrompt = `Generate 10 ${contentType} posts for ${platformStr} in the ${niche} niche. ${topicContext}`;
    responseSchema = getHookSchema();
  } else if (mode === 'CAROUSEL') {
    systemInstruction += "Generate exactly 6-8 slides for a carousel. Slide 1 is the hook. Each slide must include a 'visual' field describing the background imagery or graphic style. Final slide is a strong CTA. NO emojis, NO hashtags.";
    userPrompt = `Generate a ${contentType} carousel for ${platformStr} in the ${niche} niche. ${topicContext}`;
    responseSchema = getCarouselSchema();
  } else {
    systemInstruction += "Generate exactly 30 days of standalone content. Each day must include a 'visualIdea'. IF the type is 'Carousel', you MUST provide exactly 3 slides in the 'slides' array with their own visual descriptions. For all types, the 'idea' must be a full content concept. NO emojis, NO hashtags.";
    userPrompt = `Generate a 30-day ${contentType} plan for ${platformStr} in the ${niche} niche. ${topicContext}`;
    responseSchema = getPlanSchema();
  }

  try {
    const result = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema,
      },
    });

    const parsedData = JSON.parse(result.text);
    
    if (mode === 'HOOKS') return parsedData.posts;
    if (mode === 'CAROUSEL') return parsedData;
    if (mode === 'PLAN_30') return parsedData.plan;
    
    return parsedData;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}
