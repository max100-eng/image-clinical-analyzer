
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { AlertTriangleIcon, SparklesIcon, ClipboardIcon, CheckIcon, FileTextIcon, DownloadIcon } from './icons/Icons';
import { AnalysisResult } from '../types';

interface AnalysisDisplayProps {
  loading: boolean;
  error: string;
  result: AnalysisResult | null;
  previewUrl?: string | null;
}

const AnalysisSkeleton: React.FC<{ previewUrl?: string | null }> = ({ previewUrl }) => {
  return (
    <div className="w-full animate-fade-in space-y-6">
      {/* Image Scanning Effect */}
      <div className="flex justify-center mb-6">
        {previewUrl ? (
          <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700">
             <img src={previewUrl} alt="Scanning" className="w-full h-full object-cover opacity-50 blur-[2px]" />
             <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-secondary/20 to-transparent animate-scan h-[150%] w-full"></div>
          </div>
        ) : (
          <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center">
             <SparklesIcon className="h-8 w-8 text-gray-400" />
          </div>
        )}
      </div>

      <div className="animate-pulse space-y-5">
        {/* Urgent Banner Placeholder */}
        <div className="h-16 bg-red-50 dark:bg-red-900/10 border-l-4 border-red-200 dark:border-red-900/30 rounded-r-lg p-4 flex gap-4">
             <div className="h-6 w-6 rounded-full bg-red-200 dark:bg-red-800/50"></div>
             <div className="space-y-2 flex-1">
                 <div className="h-4 bg-red-200 dark:bg-red-800/50 rounded w-1/3"></div>
                 <div className="h-3 bg-red-100 dark:bg-red-900/30 rounded w-3/4"></div>
             </div>
        </div>

        {/* Header & Modality Chip */}
        <div className="flex justify-between items-center">
            <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>

        {/* Confidence Meter Skeleton */}
        <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-100 dark:border-gray-700/50">
            <div className="flex justify-between items-center mb-2">
                <div className="h-3 w-24 bg-gray-200 dark:bg-gray-600 rounded"></div>
                <div className="h-3 w-12 bg-gray-200 dark:bg-gray-600 rounded"></div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2"></div>
        </div>

        {/* Text Findings Skeleton */}
        <div className="space-y-3 pt-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div> {/* Heading */}
            
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-11/12"></div>
            
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mt-4"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/5"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-9/12"></div>
        </div>
      </div>
      
      <div className="flex justify-center mt-4">
         <span className="text-xs font-medium text-brand-secondary animate-pulse uppercase tracking-wider">Processing Clinical Data...</span>
      </div>
    </div>
  );
};

const ConfidenceMeter: React.FC<{ score: number }> = ({ score }) => {
    let colorClass = "bg-red-500";
    let textClass = "text-red-600 dark:text-red-400";
    let label = "Low Quality";

    if (score >= 80) {
        colorClass = "bg-emerald-500";
        textClass = "text-emerald-700 dark:text-emerald-400";
        label = "High Quality";
    } else if (score >= 50) {
        colorClass = "bg-yellow-500";
        textClass = "text-yellow-700 dark:text-yellow-400";
        label = "Moderate Quality";
    }

    return (
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-600 animate-fade-in">
            <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Signal Quality Confidence</span>
                <div className={`flex items-center gap-2 ${textClass}`}>
                    <span className="text-xs font-bold uppercase">{label}</span>
                    <span className="text-sm font-bold">{score}%</span>
                </div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 overflow-hidden">
                <div 
                    className={`h-2 rounded-full transition-all duration-1000 ease-out ${colorClass}`} 
                    style={{ width: `${score}%` }}
                ></div>
            </div>
        </div>
    );
};

const UrgentBanner: React.FC = () => (
    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-r-lg flex items-start animate-pulse-fast">
        <AlertTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-400 mr-3 flex-shrink-0 mt-0.5" />
        <div>
            <h4 className="text-red-800 dark:text-red-300 font-bold uppercase tracking-wide text-sm">Urgent Attention Required</h4>
            <p className="text-red-700 dark:text-red-200 text-sm mt-1">
                The analysis has detected indicators that may require immediate clinical evaluation.
            </p>
        </div>
    </div>
);


const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ loading, error, result, previewUrl }) => {
  const [copied, setCopied] = useState(false);

  // Generate the formatted text for eCAP
  const getFormattedEHRText = () => {
    if (!result) return "";
    const today = new Date().toLocaleDateString('es-ES');
    return `
=== NOTA CLÍNICA - ANÁLISIS IA ===
FECHA: ${today}
MODALIDAD: ${result.modalityDetected}
CALIDAD IMAGEN: ${result.confidenceScore}/100

-- HALLAZGOS --
${result.clinicalFindings.replace(/\*\*/g, '').replace(/###/g, '-')}

-- PLAN/SUGERENCIAS --
[ ] Verificar hallazgos clínicamente.
[ ] Adjuntar imagen original al curso clínico.
${result.urgentAlert ? '[!] ALERTA: Patología urgente detectada.' : ''}

[Generado por Android Heal AI Support Tool]
    `.trim();
  };

  const handleCopyToEHR = () => {
    if (!result) return;
    navigator.clipboard.writeText(getFormattedEHRText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadReport = () => {
      if (!result) return;
      const element = document.createElement("a");
      const file = new Blob([getFormattedEHRText()], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = `INFORME_CLINICO_IA_${Date.now()}.txt`;
      document.body.appendChild(element); // Required for this to work in FireFox
      element.click();
      document.body.removeChild(element);
  };

  return (
    <div className="flex-grow w-full bg-white dark:bg-gray-800 rounded-lg shadow-inner border border-gray-200 dark:border-gray-700 p-6 overflow-y-auto min-h-[300px] lg:min-h-0">
      
      {loading && <AnalysisSkeleton previewUrl={previewUrl} />}
      
      {error && (
        <div className="flex flex-col items-center justify-center h-full text-center text-red-500 animate-fade-in">
            <AlertTriangleIcon className="h-12 w-12 mb-4" />
            <h3 className="text-lg font-semibold">Analysis Failed</h3>
            <p className="text-sm max-w-xs mx-auto mt-2 opacity-80">{error}</p>
        </div>
      )}

      {!loading && !error && !result && (
        <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400 animate-fade-in">
          <p className="text-lg font-medium">Ready to Analyze</p>
          <p className="mt-2 text-sm max-w-sm">Upload a clinical image (ECG, X-Ray, etc.) and select the corresponding type to begin.</p>
        </div>
      )}

      {!loading && !error && result && (
        <div className="w-full animate-fade-in">
            {result.urgentAlert && <UrgentBanner />}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                 <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-brand-primary/10 text-brand-primary dark:text-brand-accent dark:bg-brand-accent/10 border border-brand-primary/20 w-fit">
                    Detected: {result.modalityDetected}
                </span>
                
                <div className="flex items-center gap-2">
                    <button 
                        onClick={handleDownloadReport}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-xs font-bold px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md transition-colors"
                        title="Download Text Report"
                    >
                        <FileTextIcon className="h-4 w-4" />
                        Download
                    </button>
                    <button 
                        onClick={handleCopyToEHR}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-xs font-bold px-3 py-1.5 bg-brand-secondary hover:bg-brand-secondary/90 text-white rounded-md transition-colors shadow-sm"
                        title="Copy formatted text for ECAP/SAP"
                    >
                        {copied ? <CheckIcon className="h-4 w-4" /> : <ClipboardIcon className="h-4 w-4" />}
                        {copied ? "Copied to Clipboard!" : "Copy for eCAP"}
                    </button>
                </div>
            </div>

            <ConfidenceMeter score={result.confidenceScore} />
            
            <div className="prose prose-sm dark:prose-invert max-w-none mt-4 text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-100 dark:border-gray-700/50">
                <ReactMarkdown>{result.clinicalFindings}</ReactMarkdown>
            </div>
            
            <div className="mt-8 pt-4 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-400 text-center italic">
                <p><strong>Integration Note:</strong> Use the "Copy for eCAP" button to paste this report directly into the Clinical Course (Curso Clínico).</p>
                <p className="mt-1">Disclaimer: Verify all AI-generated findings clinically before final entry.</p>
            </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisDisplay;
