
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Language } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeFoodImage = async (base64Image: string, lang: Language): Promise<any> => {
  const ai = getAI();
  const languageInstruction = lang === 'zh' ? "請使用繁體中文回應。" : "Please respond in English.";
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
        { text: `Analyze this food image. Provide the food name and estimated calories, protein (g), carbs (g), and fats (g) per serving. Respond in JSON format. ${languageInstruction}` }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          calories: { type: Type.NUMBER },
          protein: { type: Type.NUMBER },
          carbs: { type: Type.NUMBER },
          fats: { type: Type.NUMBER }
        },
        required: ["name", "calories", "protein", "carbs", "fats"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
};

export const generateReport = async (logs: string, period: { start: string, end: string }, lang: Language): Promise<string> => {
  const ai = getAI();
  const languageInstruction = lang === 'zh' ? "請使用繁體中文撰寫分析報告。" : "Please write the analysis report in English.";

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `You are an expert sports scientist and nutritionist. Analyze the following fitness log from ${period.start} to ${period.end} (Eat, Sleep, Train) and provide a concise analysis report. 
    Cross-analyze the correlation between training volume, nutrition intake, and sleep quality for this specific timeframe. 
    ${languageInstruction}
    Provide:
    1. A summary of performance for this specific period.
    2. Specific adjustments and actionable advice for the next phase.
    3. A "Readiness Score" (0-100).
    
    Log Data:
    ${logs}`,
    config: {
      temperature: 0.7,
      thinkingConfig: { thinkingBudget: 4000 }
    }
  });

  return response.text || 'Failed to generate report.';
};
