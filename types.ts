
export enum ImageType {
  ECG = "ECG",
  RADIOLOGY = "Radiology",
  RETINA = "Retina",
  DERMATOSCOPY = "Dermatoscopy",
}

export interface AnalysisResult {
  modalityDetected: string;
  clinicalFindings: string;
  confidenceScore: number;
  urgentAlert: boolean;
}
