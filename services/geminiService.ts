import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "");

// Cambiamos el nombre a chatWithClinicalAI_Fixed
export const chatWithClinicalAI = async (history: any[], message: string) => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const chat = model.startChat({
    history: history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    })),
  });
  const result = await chat.sendMessage(message);
  const response = await result.response;
  return response.text();
};

export const analyzeClinicalImage = async (imageData: string, prompt: string) => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const base64Data = imageData.split(',')[1] || imageData;
  const result = await model.generateContent([
    prompt,
    { inlineData: { data: base64Data, mimeType: "image/jpeg" } }
  ]);
  return (await result.response).text();
};