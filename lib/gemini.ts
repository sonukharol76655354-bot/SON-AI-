import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY as string });

export const contentSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "A punchy, engaging Facebook post title." },
    caption: { type: Type.STRING, description: "Engaging Facebook caption text with appropriate tone." },
    image_prompt: { type: Type.STRING, description: "Detailed prompt for generating a high-quality relative image." },
    video_prompt: { type: Type.STRING, description: "Detailed prompt for generating a dynamic short video." },
    hashtags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Set of relevant hashtags." },
    cta: { type: Type.STRING, description: "Clear call to action." },
  },
  required: ["title", "caption", "image_prompt", "video_prompt", "hashtags", "cta"]
};

export async function generateContent(masterPrompt: any) {
  const prompt = `
    Based on the following Master Prompt configuration, generate a high-quality Facebook post package.
    
    BRAND: ${masterPrompt.brandName}
    NICHE: ${masterPrompt.niche}
    AUDIENCE: ${masterPrompt.audience}
    TONE: ${masterPrompt.tone}
    GOAL: ${masterPrompt.contentGoal}
    LANGUAGE: ${masterPrompt.language}
    IMAGE STYLE: ${masterPrompt.imageStyle}
    VIDEO STYLE: ${masterPrompt.videoStyle}
    CTA STYLE: ${masterPrompt.ctaStyle}
    POST STYLE: ${masterPrompt.postStyle}
    VARIATION LEVEL: ${masterPrompt.variationLevel}
    
    Ensure the content is unique and optimized for engagement.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: contentSchema,
    },
  });

  return JSON.parse(response.text || "{}");
}
