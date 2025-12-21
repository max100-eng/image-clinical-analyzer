import { GoogleGenerativeAI } from "@google/generative-ai";
import { ImageType, AnalysisResult } from "../types";

// Acceso a la variable de entorno configurada en Vercel
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

// Inicialización del cliente de Google AI
const genAI = new GoogleGenerativeAI(API_KEY);

export const analyzeImage = async (
  base64Image: string,
  mimeType: string,
  type: ImageType
): Promise<AnalysisResult> => {
  
  // 1. Verificación de la API KEY
  if (!API_KEY) {
    throw new Error("API Key no detectada. Verifica VITE_GEMINI_API_KEY en Vercel.");
  }

  try {
    // 2. Selección del modelo (Gemini 1.5 Flash es el ideal por velocidad)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 3. Limpieza del prefijo Base64 (importante para archivos móviles)
    const imageData = base64Image.split(",")[1] || base64Image;

    // 4. Prompt especializado según el tipo de imagen
    const prompt = `
      Actúa como un asistente experto en análisis clínico multimodal.
      Analiza la siguiente imagen de tipo: ${type}.
      
      Instrucciones técnicas:
      - Identifica hallazgos significativos.
      - Determina el nivel de urgencia: BAJA, MEDIA, ALTA o CRÍTICA.
      - Proporciona recomendaciones basadas en guías clínicas estándar.
      
      IMPORTANTE: Tu respuesta debe ser ÚNICAMENTE un objeto JSON válido con esta estructura:
      {
        "diagnosis": "Resumen claro del hallazgo",
        "details": "Explicación técnica detallada",
        "urgency": "BAJA | MEDIA | ALTA | CRÍTICA",
        "recommendations": ["lista de pasos a seguir"],
        "technicalMetrics": { "parámetro": "valor" }
      }
    `;

    // 5. Envío a la IA
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
    
    // 6. Limpieza de posibles etiquetas Markdown en la respuesta
    const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    return JSON.parse(cleanJson) as AnalysisResult;
    
  } catch (error) {
    console.error("Error en el servicio de análisis:", error);
    throw new Error("No se pudo completar el análisis clínico. Inténtalo de nuevo.");
  }
};