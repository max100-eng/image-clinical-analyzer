// src/types.ts

/**
 * Define las especialidades médicas soportadas por el analizador.
 */
export enum ImageType {
  ECG = "ECG",
  RADIOLOGY = "RADIOLOGY",
  RETINA = "RETINA",
  DERMATOSCOPY = "DERMATOSCOPY",
  UROSTICK = "UROSTICK",      // Para análisis de orina (tiras reactivas)
  TOXICOLOGY = "TOXICOLOGY"   // Para tests de drogas en orina
}

/**
 * Estructura de la respuesta que Gemini debe devolver.
 */
export interface AnalysisResult {
  modalityDetected: string;
  clinicalFindings: string;    // Aquí irá el desglose de los 7 puntos de EKG o los niveles de Urostick
  confidenceScore: number;
  urgentAlert: boolean;        // True si detecta algo crítico (ej. Infarto o Droga peligrosa)
  finalDiagnosisCode: number;  // Código del 1 al 10 según la gravedad
}