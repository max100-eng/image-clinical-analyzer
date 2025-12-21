import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { ImageType, AnalysisResult, ChatMessage } from "../types";

// Instrucción del sistema para mantener el rigor médico
const SYSTEM_INSTRUCTION = `Eres "Android Heal", el núcleo de Inteligencia Clínica... (tu texto original)`;

// Inicialización corregida
// Nota: En Vite/React se usa import.meta.env.VITE_API_KEY en lugar de process.env
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "");

const getModalityPrompt = (type: string): string => {
  // Asegúrate de que el valor de 'type' coincida con estos strings o con tu Enum
  switch (type) {
    case 'ecg': return "Analiza este ECG. Evalúa ritmo, frecuencia, eje e intervalos...";
    case 'radiology': return "Analiza esta imagen radiológica. Describe campos pulmonares...";
    case 'retina': return "Evalúa esta imagen de retina. Analiza la papila óptica...";
    case 'dermatoscopy': return "Analiza esta lesión dermatoscópica...";
    case 'urinalysis': return "Interpreta esta tira reactiva de orina (Urostick 10)...";
    case 'toxicology': return "Analiza este panel de toxicología. Verifica línea C y T...";
    default: return "Realiza una interpretación clínica exhaustiva.";
  }
};

export const analyzeImage = async (
  base64Data: string,
  mimeType: string,
  imageType: string
): Promise<AnalysisResult> => {
  
  // Usamos Gemini 1.5 Flash: es más rápido y mejor para visión
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    systemInstruction: SYSTEM_INSTRUCTION 
  });

  const prompt = getModalityPrompt(imageType);

  try {
    const result = await model.generateContent({
      contents: [{
        role: "user",
        parts: [
          { inlineData: { data: base64Data, mimeType: mimeType.split(';')[0] } },
          { text: prompt }
        ]
      }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            modalityDetected: { type: SchemaType.STRING },
            clinicalFindings: { type: SchemaType.STRING },
            urgentAlert: { type: SchemaType.BOOLEAN },
            confidenceScore: { type: SchemaType.NUMBER },
            suggestedFollowUp: { type: SchemaType.STRING },
            differentialDiagnoses: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  condition: { type: SchemaType.STRING },
                  probability: { type: SchemaType.STRING },
                  reasoning: { type: SchemaType.STRING }
                },
                required: ["condition", "probability", "reasoning"]
              }
            }
          },
          required: ["modalityDetected", "clinicalFindings", "urgentAlert", "differentialDiagnoses"]
        }
      }
    });

    const response = result.response;
    return JSON.parse(response.text()) as AnalysisResult;
  } catch (error) {
    console.error("Error Clínico:", error);
    throw new Error("Fallo en el motor de análisis.");
  }
};