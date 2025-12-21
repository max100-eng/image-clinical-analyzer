import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { ImageType, AnalysisResult } from "../types";

// Usamos import.meta.env para Vite y el prefijo VITE_ obligatorio
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

const genAI = new GoogleGenerativeAI(API_KEY);

const SYSTEM_INSTRUCTION = `
You are an expert Clinical Intelligence AI. 
Your task is to analyze medical images (ECG, Radiology, Retina, Dermatoscopy) and generate reports.

CRITICAL GUIDELINES:
1. ECG ANALYSIS: Provide exactly these 7 points in 'clinicalFindings': 
   - 1. Heart Rate (bpm), 2. Rhythm, 3. PR Interval (ms), 4. QT Interval (ms), 5. Axis, 6. ST Segment, 7. Other abnormalities.
2. DIAGNOSIS CODE: 1: Normal, 2: AFib, 3: Bradycardia, 4: Tachycardia, 5: Bundle Branch Block, 6: LVH, 7: Ischemia, 8: PVC/PAC, 9: AV Block, 10: WPW/Long QT.
3. OBJECTIVITY: Use professional medical terminology.
4. URGENCY: Set 'urgentAlert' to true for life-threatening conditions.
`;

export const analyzeImage = async (
  base64Data: string,
  mimeType: string,
  imageType: ImageType
): Promise<AnalysisResult> => {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: SYSTEM_INSTRUCTION 
    });

    const cleanBase64 = base64Data.includes(",") ? base64Data.split(",")[1] : base64Data;

    const result = await model.generateContent({
      contents: [{ 
        role: "user", 
        parts: [
          { inlineData: { data: cleanBase64, mimeType } },
          { text: `Analyze this ${imageType}. Return JSON with clinicalFindings as a list.` }
        ] 
      }],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            modalityDetected: { type: SchemaType.STRING },
            clinicalFindings: { type: SchemaType.STRING },
            confidenceScore: { type: SchemaType.NUMBER },
            urgentAlert: { type: SchemaType.BOOLEAN },
            finalDiagnosisCode: { type: SchemaType.NUMBER }
          },
          required: ["modalityDetected", "clinicalFindings", "confidenceScore", "urgentAlert", "finalDiagnosisCode"],
        },
      },
    });

    return JSON.parse(result.response.text());
  } catch (error) {
    console.error("Error:", error);
    throw new Error("Error en el análisis clínico.");
  }
};