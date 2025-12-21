export enum ImageType {
  ECG = "ECG",
  RADIOLOGY = "Radiology",
  RETINA = "Retina",
  DERMATOSCOPY = "Dermatoscopy",
  URINALYSIS = "Urinalysis",
  TOXICOLOGY = "Toxicology",
}

export interface DifferentialDiagnosis {
  condition: string;
  probability: "High" | "Moderate" | "Low";
  reasoning: string;
}

export interface AnalysisResult {
  modalityDetected: string;
  clinicalFindings: string;
  differentialDiagnoses: DifferentialDiagnosis[];
  suggestedFollowUp: string;
  confidenceScore: number;
  urgentAlert: boolean;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
