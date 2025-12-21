import { GoogleGenerativeAI } from "@google/generative-ai";
import { AnalysisResult } from "../types";

// Accedemos a la API Key desde las variables de entorno de Vite
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export async function analyzeImage(imageFile: File, category: string): Promise<AnalysisResult> {
  // Usamos el modelo flash por su velocidad y eficiencia en visión
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const imageData = await fileToGenerativePart(imageFile);
  
  const prompt = `Actúa como un sistema experto de inteligencia clínica especializado en ${category}.
  Analiza esta imagen médica y proporciona un informe detallado.
  DEBES responder ÚNICAMENTE con un objeto JSON válido con la siguiente estructura:
  {
    "diagnosis": "Breve resumen del diagnóstico presuntivo",
    "findings": ["hallazgo 1", "hallazgo 2", "hallazgo 3"],
    "recommendations": ["acción 1", "acción 2"],
    "urgency": "low" | "medium" | "high"
  }
  Importante: No añadas texto explicativo fuera del JSON. Todo el análisis debe ser profesional y técnico.`;

  try {
    const result = await model.generateContent([prompt, imageData]);
    const response = await result.response;
    const text = response.text();
    
    // Extraemos el JSON del texto por si la IA añade bloques de código Markdown
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const cleanJson = jsonMatch ? jsonMatch[0] : text;
    
    return JSON.parse(cleanJson) as AnalysisResult;
  } catch (error) {
    console.error("Error en la llamada a Gemini:", error);
    throw new Error("No se pudo completar el análisis clínico.");
  }
}

// Función auxiliar para convertir el archivo de imagen a formato compatible con Gemini
async function fileToGenerativePart(file: File): Promise<{ inlineData: { data: string, mimeType: string } }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = (reader.result as string).split(',')[1];
      resolve({
        inlineData: { data: base64Data, mimeType: file.type },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}