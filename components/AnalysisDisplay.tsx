import React from 'react';
import { AnalysisResult } from '../types';

interface Props {
  data: AnalysisResult;
}

const AnalysisDisplay: React.FC<Props> = ({ data }) => {
  // Función para determinar el color según el código de diagnóstico (1-10)
  const getStatusColor = (code: number) => {
    if (code === 1) return 'bg-green-100 text-green-800 border-green-200';
    if (code >= 7) return 'bg-red-100 text-red-800 border-red-200';
    return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  };

  return (
    <div className="mt-6 space-y-4 animate-in fade-in duration-500">
      {/* Cabecera de Diagnóstico */}
      <div className={`p-4 rounded-lg border ${getStatusColor(data.finalDiagnosisCode)}`}>
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-lg uppercase tracking-wider">
            {data.modalityDetected} - Código: {data.finalDiagnosisCode}
          </h3>
          {data.urgentAlert && (
            <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-black animate-pulse">
              ALERTA URGENTE
            </span>
          )}
        </div>
      </div>

      {/* Hallazgos Clínicos (Aquí se pintan los 7 puntos) */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h4 className="text-gray-500 text-sm font-semibold mb-4 uppercase">Análisis Detallado</h4>
        <div className="prose prose-blue max-w-none">
          {/* Transformamos el texto de la IA en una lista limpia */}
          {data.clinicalFindings.split('\n').map((line, i) => (
            <p key={i} className="text-gray-700 leading-relaxed border-b border-gray-50 py-2 last:border-0">
              {line}
            </p>
          ))}
        </div>
      </div>

      {/* Puntaje de Confianza de la IA */}
      <div className="flex items-center gap-2 text-xs text-gray-400 justify-end">
        <span>Confianza del análisis:</span>
        <div className="w-24 bg-gray-200 rounded-full h-1.5">
          <div 
            className="bg-blue-500 h-1.5 rounded-full" 
            style={{ width: `${data.confidenceScore * 100}%` }}
          ></div>
        </div>
        <span>{(data.confidenceScore * 100).toFixed(0)}%</span>
      </div>
    </div>
  );
};

export default AnalysisDisplay;
