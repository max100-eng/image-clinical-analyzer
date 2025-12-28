import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

// ASEGÚRATE DE QUE SE LLAME EXACTAMENTE ASÍ
export async function chatWithClinicalAI(history: any[], message: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }, { apiVersion: 'v1' });
  const chat = model.startChat({
    history: history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    })),
  });
  const result = await chat.sendMessage(message);
  return result.response.text();
}

export async function analyzeClinicalImage(imageData: string, prompt: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }, { apiVersion: 'v1' });
  const base64Data = imageData.split(',')[1] || imageData;
  const result = await model.generateContent([
    prompt,
    { inlineData: { data: base64Data, mimeType: "image/jpeg" } }
  ]);
  return result.response.text();
}
