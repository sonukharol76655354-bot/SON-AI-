import { GoogleGenAI, Type } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

function getAI() {
  if (!aiInstance) {
    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('NEXT_PUBLIC_GEMINI_API_KEY is not defined');
      }
      aiInstance = new GoogleGenAI({ apiKey });
    } catch (e) {
      console.error("AI Initialization Failed:", e);
      throw e;
    }
  }
  return aiInstance;
}

/**
 * Generates a title, caption, and optimized hashtags from an image or video description.
 */
export async function autoCaptionMedia(fileData: string, mimeType: string, context: string = '') {
  const ai = getAI();
  const prompt = `
    Analyze this ${mimeType.startsWith('image') ? 'image' : 'video'} and generate professional social media content.
    
    Context from the business: ${context}
    
    Return the response as a JSON object with:
    - title: A striking, professional headline (max 8 words)
    - caption: A high-quality, engaging Facebook caption (max 100 words)
    - hashtags: array of 5 optimized hashtags
    - orientation: '9:16' for Reels or '1:1' for Posts based on the visual content.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          { inlineData: { data: fileData.split(',')[1], mimeType } },
          { text: prompt }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          caption: { type: Type.STRING },
          hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
          orientation: { type: Type.STRING, enum: ['9:16', '1:1', '4:5'] }
        },
        required: ['title', 'caption', 'hashtags', 'orientation']
      }
    }
  });

  return JSON.parse(response.text || '{}');
}

/**
 * Generates content based on a master prompt and context file.
 * Standardizes for USA / North American audience and timezone.
 */
export async function generateContentFromMaster(masterConfig: any) {
  const ai = getAI();
  const prompt = `
    BRAND: ${masterConfig.brandName}
    MASTER INPUT: ${masterConfig.masterPrompt}
    
    SYSTEM CONTEXT (MANDATORY):
    - Tone: Professional, Premium, High-Value (Elite SaaS Style)
    - Audience: USA / North American based
    - Location Reference: Optimized for USA (e.g., America/New_York)
    - Cultural Context: ${masterConfig.mediaPreference === 'video' ? 'Dynamic Reel/TikTok style' : 'Premium Instagram/Facebook aesthetic'}
    - Language: Perfect High-Quality English
    
    TASK: Generate a complete social media package from the Master Input.
    
    OUTPUT JSON:
    - title: Striking, attention-grabbing headline (Max 8 words)
    - caption: High-quality, professional, engaging caption with paragraph breaks (Max 120 words)
    - image_prompt: Detailed creative prompt for generating a high-quality 1080x1080 image
    - video_prompt: Detailed creative prompt for generating a dynamic 9:16 video (15-30 seconds)
    - hashtags: array of 5 highly relative hashtags
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json"
    }
  });

  const parsed = JSON.parse(response.text || '{}');
  
  // Simulate high-quality media asset generation
  const seed = Math.floor(Math.random() * 1000000);
  const isVideo = masterConfig.mediaPreference === 'video';
  const mediaUrl = isVideo 
    ? `https://picsum.photos/seed/${seed}/1080/1920?blur=1` // Cinematic blurred video placeholder
    : `https://picsum.photos/seed/${seed}/1080/1080`;       // High-res photography placeholder

  return {
    ...parsed,
    mediaUrl,
    mediaType: isVideo ? 'video' : 'image',
    mediaPrompt: isVideo ? parsed.video_prompt : parsed.image_prompt
  };
}
