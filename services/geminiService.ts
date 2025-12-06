
import { GoogleGenAI, Type } from "@google/genai";
import { ImageType, AnalysisResult } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const SYSTEM_INSTRUCTION = `
You are an expert Clinical Intelligence AI assisting medical professionals in the ICS (Institut Català de la Salut) context.
Your task is to analyze medical images (ECG, Radiology, Retina, Dermatoscopy) objectively and generate reports suitable for Electronic Health Records (EHR/eCAP).

CRITICAL GUIDELINES:
1. OBJECTIVITY: Describe exactly what you see. Do not hallucinate features.
2. CONFIDENCE: Your 'confidenceScore' (0-100) must reflect IMAGE QUALITY and clarity.
   - 80-100: Crystal clear, diagnostic quality.
   - <50: Blurry, artifact-heavy, or non-diagnostic.
3. MODALITY: Correctly identify if it is an X-ray, ECG strip, Fundus photo, etc.
4. DIAGNOSIS: Do NOT provide a definitive diagnosis (e.g., "This IS melanoma"). Use descriptive clinical terms (e.g., "irregular pigment network suggestive of...").
5. URGENCY: Set 'urgentAlert' to true ONLY if findings suggest an immediate life-threatening condition (e.g., STEMI, Pneumothorax, Retinal Detachment).
6. FORMATTING: Use concise, professional medical terminology. Avoid conversational filler. The output should be ready to be pasted into a Clinical Course note.
`;

const getPromptForType = (type: ImageType): string => {
  switch (type) {
    case ImageType.ECG:
      return `Analyze this ECG image. Identify rhythm, rate, axis, intervals, and morphological abnormalities (ST changes, T-waves). Return findings in a structured list.`;
    case ImageType.RADIOLOGY:
      return `Interpret this radiological image. Describe findings in bones, soft tissues, and organs. Note fractures, opacities, or lesions. Use standard radiological reporting terms.`;
    case ImageType.RETINA:
      return `Analyze this retinal fundus image. Check optic disc, macula, and vessels for signs of retinopathy, glaucoma, or other pathologies.`;
    case ImageType.DERMATOSCOPY:
      return `Analyze this skin lesion using ABCDE criteria. Describe structure, color, and specific dermatoscopic patterns.`;
    default:
      return `Analyze this clinical image and provide a medical interpretation.`;
  }
};

export const analyzeImage = async (
  base64Data: string,
  mimeType: string,
  imageType: ImageType
): Promise<AnalysisResult> => {
  try {
    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: mimeType,
      },
    };

    const textPart = {
      text: getPromptForType(imageType),
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePart, textPart] },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                modalityDetected: {
                    type: Type.STRING,
                    description: "The specific type of medical image identified (e.g., '12-Lead ECG', 'Chest X-Ray PA View').",
                },
                clinicalFindings: {
                    type: Type.STRING,
                    description: "Detailed objective clinical observations in Markdown format. Use headings and bullet points. Focus on clear, paste-able text.",
                },
                confidenceScore: {
                    type: Type.NUMBER,
                    description: "A score (0-100) reflecting image quality and feature clarity.",
                },
                urgentAlert: {
                    type: Type.BOOLEAN,
                    description: "True ONLY if the findings indicate an immediate emergency.",
                }
            },
            required: ["modalityDetected", "clinicalFindings", "confidenceScore", "urgentAlert"],
        },
      },
    });
    
    const responseText = response.text;
    if (!responseText) {
        throw new Error("Empty response from AI model.");
    }

    const jsonResult = JSON.parse(responseText);

    return {
        modalityDetected: jsonResult.modalityDetected,
        clinicalFindings: jsonResult.clinicalFindings,
        confidenceScore: jsonResult.confidenceScore,
        urgentAlert: jsonResult.urgentAlert
    };

  } catch (error) {
    console.error("Error analyzing image with Gemini API:", error);
    if (error instanceof Error && error.message.includes('API_KEY')) {
        return Promise.reject(new Error("API Error: Invalid or missing API Key. Please check your configuration."));
    }
    return Promise.reject(new Error("Failed to get analysis from the AI model."));
  }
};
