export interface ImageType {
  id: string;
  url: string;
  file: File;
  category: string;
}

export interface AnalysisResult {
  diagnosis: string;
  findings: string[];
  recommendations: string[];
  urgency: 'low' | 'medium' | 'high';
}