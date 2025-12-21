import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { ImageType, AnalysisResult } from "../types";

// 1. Corrección del nombre de la clase y API Key
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

// El nombre correcto del SDK es GoogleGenerativeAI
const genAI = new GoogleGenerativeAI(API_KEY);

const SYSTEM_INSTRUCTION = `
You are an expert Clinical Intelligence AI. 
Your task is to analyze medical images (ECG, Radiology, Retina, Dermatoscopy, Urostick, Toxicology) and generate reports.

CRITICAL GUIDELINES:
1. ECG ANALYSIS: You must ALWAYS provide exactly these 7 technical points in 'clinicalFindings': 
   - 1. Heart Rate (bpm)
   - 2. Rhythm
   - 3. PR Interval (ms)
   - 4. QT Interval (ms)
   - 5. Axis
   - 6. ST Segment
   - 7. Other abnormalities.
2. DIAGNOSIS CODE: Provide a number from 1 to 10 based on this scale: 
   1: Normal, 2: AFib, 3: Bradycardia, 4: Tachycardia, 5: Bundle Branch Block, 6: LVH, 7: Ischemia, 8: PVC/PAC, 9: AV Block, 10: WPW/Long QT.
3. OBJECTIVITY: Describe exactly what you see using professional medical terminology.
4. URGENCY: Set 'urgentAlert' to true ONLY for life-threatening conditions (e.g., ST elevation, severe bradycardia).
`;

const getPromptForType = (type: ImageType): string => {
  switch (type) {
    case ImageType.ECG:
      return `Analyze this ECG. Provide the 7 technical points in clinicalFindings and the numeric code (1-10).`;
    case ImageType.RADIOLOGY:
      return `Interpret this radiological image. Describe bones, soft tissues, and organs.`;
    case ImageType.RETINA:
      return `Analyze this fundus image. Check optic disc, macula, and vessels.`;
    case ImageType.DERMATOSCOPY:
      return `Analyze this skin lesion using ABCDE criteria.`;
    default:
      return `Analyze this clinical image and provide a professional interpretation.`;
  }
};

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

    // Eliminamos el prefijo 'data:image/jpeg;base64,' si existe
    const cleanBase64 = base64Data.includes(",") ? base64Data.split(",")[1] : base64Data;

    const imagePart = {
      inlineData: {
        data: cleanBase64,
        mimeType: mimeType,
      },
    };

    const prompt = getPromptForType(imageType);

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [imagePart, { text: prompt }] }],
      generationConfig: {
        temperature: 0.1, // Baja temperatura para mayor rigor médico
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            modalityDetected: { type: SchemaType.STRING },
            clinicalFindings: { type: SchemaType.STRING, description: "Detailed list of findings or the 7 ECG points" },
            confidenceScore: { type: SchemaType.NUMBER },
            urgentAlert: { type: SchemaType.BOOLEAN },
            finalDiagnosisCode: { type: SchemaType.NUMBER, description: "Numeric code 1-10" }
          },
          required: ["modalityDetected", "clinicalFindings", "confidenceScore", "urgentAlert", "finalDiagnosisCode"],
        },
      },
    });

    const response = await result.response;
    const text = response.text();
    
    // Parseo seguro del JSON
    const parsedResult = JSON.parse(text);
    return parsedResult as AnalysisResult;

  } catch (error) {
    console.error("Error en Gemini Service:", error);
    throw new Error("Error al analizar la imagen clínica. Verifique la conexión o el formato de imagen.");
  }
};