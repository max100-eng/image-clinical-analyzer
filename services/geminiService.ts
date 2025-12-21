import { GoogleGenerativeAI } from "@google/generative-ai";
import { ImageType, AnalysisResult } from "../types";

// Vite utiliza import.meta.env para acceder a las variables de entorno
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

// Inicialización del cliente de Google AI
const genAI = new GoogleGenerativeAI(API_KEY);

export const analyzeImage = async (
  base64Image: string,
  mimeType: string,
  type: ImageType
): Promise<AnalysisResult> => {
  
  // Validación de seguridad para la API KEY
  if (!API_KEY || API_KEY === "") {
    throw new Error("La clave VITE_GEMINI_API_KEY no está configurada en el servidor.");
  }

  try {
    // Usamos el modelo Flash que es rápido y eficiente para análisis clínico
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Limpiamos el prefijo base64 si existe (data:image/jpeg;base64,...)
    const imageData = base64Image.split(",")[1] || base64Image;

    const prompt = `
      Eres un asistente de inteligencia clínica de alta precisión. 
      Analiza esta imagen médica de tipo: ${type}.
      
      REGLAS ESTRICTAS:
      1. Proporciona un análisis técnico detallado.
      2. Clasifica el nivel de urgencia (BAJA, MEDIA, ALTA, CRÍTICA).
      3. Genera una lista de hallazgos clave.
      4. Da una recomendación médica preliminar siempre sugiriendo validación profesional.
      
      Responde EXCLUSIVAMENTE en formato JSON con la siguiente estructura:
      {
        "diagnosis": "resumen del diagnóstico",
        "details": "explicación técnica",
        "urgency": "BAJA | MEDIA | ALTA | CRÍTICA",
        "recommendations": ["rec 1", "rec 2"],
        "technicalMetrics": { "key": "valor" }
      }
    `;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: imageData,
          mimeType: mimeType,
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();
    
    // Limpiar el texto en caso de que Gemini devuelva markdown (```json ... ```)
    const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    return JSON.parse(cleanJson) as AnalysisResult;
    
  } catch (error) {
    console.error("Error en geminiService:", error);
    throw new Error("Error al procesar la imagen con Gemini IA.");
  }
};