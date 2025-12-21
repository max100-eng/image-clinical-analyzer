import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { ImageType, AnalysisResult } from "../types";

// Configuración de la API Key con soporte para Vite (Vercel)
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

const SYSTEM_INSTRUCTION = `
You are an expert Clinical Intelligence AI. 
Your task is to analyze medical images and generate structured reports.

ANALYSIS PROTOCOLS:
1. ECG: Provide exactly these 7 points: 1. Heart Rate (bpm), 2. Rhythm, 3. PR Interval (ms), 4. QT Interval (ms), 5. Axis, 6. ST Segment, 7. Other abnormalities.
2. UROSTICK (Urinalysis): Analyze the reagent strip. Report levels (Negative, Trace, +, ++, +++) for: Glucose, Protein, pH, Nitrites, Leukocytes, Blood, Ketones, Bilirubin, and Specific Gravity.
3. TOXICOLOGY: Identify drug panels (THC, COC, AMP, OPI, etc.). State clearly if POSITIVE or NEGATIVE for each.
4. RADIOLOGY/RETINA/DERMATOSCOPY: Use professional medical terminology to describe findings.

DIAGNOSIS CODES (1-10):
1: Normal, 2: AFib/Arrythmia, 3: Bradycardia, 4: Tachycardia, 5: Abnormal Urostick (Infection), 6: Positive Toxicology, 7: Ischemia/ST Elevation, 8: Fracture/Abnormality, 9: Advanced Pathology, 10: Critical Emergency.

URGENCY: Set 'urgentAlert' to true ONLY for life-threatening findings (e.g., ST elevation, critical drug overdose, severe sepsis signs).
`;

export const analyzeImage = async (
  base64Data: string,
  mimeType: string,
  imageType: ImageType
): Promise<AnalysisResult> => {
  if (!API_KEY) {
    throw new Error("VITE_GEMINI_API_KEY no configurada en Vercel.");
  }

  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: SYSTEM_INSTRUCTION 
    });

    // Limpieza del prefijo base64 para evitar errores de envío
    const cleanBase64 = base64Data.includes(",") ? base64Data.split(",")[1] : base64Data;

    const result = await model.generateContent({
      contents: [{ 
        role: "user", 
        parts: [
          { inlineData: { data: cleanBase64, mimeType } },
          { text: `Analyze this ${imageType} image and return a clinical report in JSON format.` }
        ] 
      }],
      generationConfig: {
        temperature: 0.1, // Baja temperatura para máxima precisión médica
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            modalityDetected: { type: SchemaType.STRING },
            clinicalFindings: { type: SchemaType.STRING, description: "Detailed list of clinical findings" },
            confidenceScore: { type: SchemaType.NUMBER },
            urgentAlert: { type: SchemaType.BOOLEAN },
            finalDiagnosisCode: { type: SchemaType.NUMBER, description: "Numeric code from 1 to 10" }
          },
          required: ["modalityDetected", "clinicalFindings", "confidenceScore", "urgentAlert", "finalDiagnosisCode"],
        },
      },
    });

    const response = await result.response;
    return JSON.parse(response.text()) as AnalysisResult;

  } catch (error) {
    console.error("Error en Gemini Service:", error);
    throw new Error("Error al analizar la imagen clínica. Por favor, intente de nuevo.");
  }
};