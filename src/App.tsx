import React, { useState } from 'react';
import { 
  HeartIcon, 
  BeakerIcon, 
  ViewfinderCircleIcon, 
  IdentificationIcon, 
  ClockIcon, 
  ShieldCheckIcon,
  PhotoIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { analyzeClinicalImage } from './services/geminiService';

// --- Interfaces ---
interface AnalysisDisplayProps {
  analysis: string;
  isAnalyzing: boolean;
}

// --- Componente de Visualización de Resultados ---
const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ analysis, isAnalyzing }) => {
  if (isAnalyzing) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-blue-50 rounded-2xl border-2 border-dashed border-blue-200 mt-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-blue-700 font-semibold animate-pulse">Procesando en Núcleo de Inteligencia...</p>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="mt-8 p-8 bg-white rounded-2xl shadow-xl border border-blue-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center mb-6">
        <div className="w-2 h-8 bg-blue-600 rounded-full mr-4"></div>
        <h3 className="text-xl font-bold text-gray-800">Informe de Análisis Clínico</h3>
      </div>
      <div className="prose prose-blue max-w-none">
        <div className="text-gray-700 leading-relaxed whitespace-pre-wrap font-mono text-sm bg-gray-50 p-6 rounded-lg border border-gray-100">
          {analysis}
        </div>
      </div>
    </div>
  );
};

// --- Componente Principal ---
export default function App() {
  const [image, setImage] = useState<string | null>(null);
  const [modality, setModality] = useState('ECG');
  const [analysis, setAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const modalities = [
    { id: 'ECG', name: 'ECG', icon: HeartIcon },
    { id: 'RX', name: 'RADIOLOGÍA', icon: ViewfinderCircleIcon },
    { id: 'RETINA', name: 'RETINA', icon: SparklesIcon },
    { id: 'DERMA', name: 'DERMATOSCOPIA', icon: BeakerIcon },
    { id: 'URIA', name: 'URIANÁLISIS', icon: IdentificationIcon },
    { id: 'TOX', name: 'TOXICOLOGÍA', icon: ShieldCheckIcon },
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const runAnalysis = async () => {
    if (!image) return;
    setIsAnalyzing(true);
    
    // Prompts específicos para evitar bloqueos y lentitud
    const prompts: Record<string, string> = {
      ECG: "Actúa como Cardiólogo. Analiza este ECG: Ritmo, Frecuencia, complejo QRS y segmento ST. Identifica anomalías clínicas.",
      RX: "Actúa como Radiólogo. Analiza esta placa: campos pulmonares, silueta cardiaca y estructuras óseas. Sé conciso.",
      RETINA: "Analiza esta imagen de fondo de ojo buscando signos de retinopatía o anomalías vasculares.",
      DEFAULT: "Realiza un análisis clínico detallado de esta imagen médica."
    };

    try {
      const prompt = prompts[modality] || prompts.DEFAULT;
      const result = await analyzeClinicalImage(image, prompt);
      setAnalysis(result);
    } catch (error) {
      setAnalysis("Error: No se pudo completar el análisis. Verifique su API Key o la conexión.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center mb-12 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="bg-blue-600 p-3 rounded-xl mr-4 shadow-lg shadow-blue-200">
            <HeartIcon className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Clinical Intelligence</h1>
            <p className="text-slate-500 font-medium text-sm tracking-widest uppercase">AI Image Analysis System</p>
          </div>
        </div>

        {/* 1. Modalidad */}
        <div className="mb-10">
          <label className="flex items-center text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 ml-1">
            <span className="bg-blue-100 text-blue-600 w-5 h-5 rounded-full flex items-center justify-center mr-2">1</span>
            Modalidad Diagnóstica
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {modalities.map((m) => (
              <button
                key={m.id}
                onClick={() => setModality(m.id)}
                className={`flex items-center p-4 rounded-xl border-2 transition-all duration-200 ${
                  modality === m.id 
                  ? 'border-blue-600 bg-blue-50/50 text-blue-700 shadow-md ring-4 ring-blue-50' 
                  : 'border-white bg-white text-slate-500 hover:border-slate-200 shadow-sm'
                }`}
              >
                <m.icon className={`w-6 h-6 mr-3 ${modality === m.id ? 'text-blue-600' : 'text-slate-400'}`} />
                <span className="font-bold text-sm tracking-wide">{m.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Entrada de Imagen */}
        <div className="mb-10">
          <label className="flex items-center text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 ml-1">
            <span className="bg-blue-100 text-blue-600 w-5 h-5 rounded-full flex items-center justify-center mr-2">2</span>
            Entrada de Imagen
          </label>
          <div className="bg-white p-8 rounded-3xl border-2 border-dashed border-slate-200 hover:border-blue-400 transition-colors group relative overflow-hidden shadow-inner bg-opacity-50">
            {image ? (
              <div className="flex flex-col items-center">
                <img src={image} alt="Preview" className="max-h-80 rounded-xl shadow-2xl mb-6 border-4 border-white" />
                <button 
                  onClick={() => setImage(null)}
                  className="text-red-500 font-bold text-xs uppercase tracking-tighter hover:text-red-700"
                >
                  Quitar Imagen
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center cursor-pointer py-10">
                <div className="bg-slate-100 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                  <PhotoIcon className="w-12 h-12 text-slate-400 group-hover:text-blue-500" />
                </div>
                <span className="text-slate-500 font-bold">Arrastra o selecciona imagen médica</span>
                <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
              </label>
            )}
          </div>
        </div>

        {/* Botón de Acción */}
        <button
          onClick={runAnalysis}
          disabled={!image || isAnalyzing}
          className={`w-full py-5 rounded-2xl font-black text-lg tracking-widest uppercase transition-all shadow-2xl ${
            !image || isAnalyzing 
            ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
            : 'bg-gradient-to-r from-blue-700 to-blue-600 text-white hover:from-blue-600 hover:to-blue-500 active:scale-[0.98]'
          }`}
        >
          {isAnalyzing ? (
            <div className="flex items-center justify-center">
              <ClockIcon className="w-6 h-6 mr-2 animate-spin" />
              Procesando...
            </div>
          ) : (
            <div className="flex items-center justify-center italic">
              Iniciar Análisis Clínico
            </div>
          )}
        </button>

        {/* Resultados */}
        <AnalysisDisplay analysis={analysis} isAnalyzing={isAnalyzing} />

        <footer className="mt-12 text-center text-slate-400 text-xs font-bold uppercase tracking-widest pb-8">
          © 2025 Clinical Intelligence Agent • Potenciado por Google Gemini Pro Vision
        </footer>
      </div>
    </div>
  );
}