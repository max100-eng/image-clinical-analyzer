export enum ImageType {
  ECG = "ECG",
  RADIOLOGY = "RADIOLOGY",
  RETINA = "RETINA",
  DERMATOSCOPY = "DERMATOSCOPY",
  UROSTICK = "UROSTICK",
  TOXICOLOGY = "TOXICOLOGY"
}

export interface AnalysisResult {
  diagnosis: string;
  details: string;
  urgency: 'BAJA' | 'MEDIA' | 'ALTA' | 'CRÍTICA';
  recommendations: string[];
  technicalMetrics?: {
    [key: string]: string | number;
  };
}