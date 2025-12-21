import React from 'react';
import { AnalysisResult } from '../types';
import { 
  ClipboardCheck, 
  Activity, 
  ListChecks, 
  AlertCircle, 
  Stethoscope 
} from 'lucide-react';

interface Props {
  analysis: AnalysisResult;
}

const AnalysisDisplay: React.FC<Props> = ({ analysis }) => {
  // Colores dinámicos según la urgencia
  const urgencyStyles = {
    low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    medium: 'bg-amber-50 text-amber-700 border-amber-200',
    high: 'bg-rose-50 text-rose-700 border-rose-200'
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      {/* Cabecera del Informe */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <div className="bg-[#006070] p-1.5 rounded-md">
            <ClipboardCheck className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-black text-[#001e2b] italic uppercase tracking-tighter">
            Informe Clínico
          </h2>
        </div>
        <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${urgencyStyles[analysis.urgency]}`}>
          Prioridad: {analysis.urgency}
        </span>
      </div>

      <div className="space-y-8 text-left">
        {/* Diagnóstico */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Stethoscope className="w-4 h-4 text-[#006070]" />
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Diagnóstico Presuntivo</h3>
          </div>
          <p className="text-[#001e2b] text-lg font-bold leading-tight">
            {analysis.diagnosis}
          </p>
        </section>

        {/* Hallazgos */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <ListChecks className="w-4 h-4 text-[#006070]" />
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Hallazgos Clave</h3>
          </div>
          <div className="space-y-2">
            {analysis.findings.map((finding, i) => (
              <div key={i} className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#006070] shrink-0" />
                <p className="text-sm text-slate-700 font-medium">{finding}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Recomendaciones */}
        <section className="mt-auto bg-[#006070]/5 rounded-2xl p-5 border border-[#006070]/10">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-[#006070]" />
            <h3 className="text-[11px] font-black text-[#006070] uppercase tracking-widest">Plan de Acción Sugerido</h3>
          </div>
          <ul className="space-y-2">
            {analysis.recommendations.map((rec, i) => (
              <li key={i} className="text-sm text-[#004d5a] font-bold flex items-start gap-2">
                <span className="text-[#006070]">•</span>
                {rec}
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Nota de Descargo */}
      <div className="mt-8 pt-6 border-t border-slate-100">
        <div className="flex items-center gap-2 text-rose-500">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <p className="text-[9px] font-bold uppercase leading-none">
            Uso exclusivo para apoyo a la decisión clínica. Requiere validación médica profesional.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AnalysisDisplay;
