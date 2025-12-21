import React, { useState, useRef } from 'react';
import { ImageType, AnalysisResult } from './types';
import { analyzeImage } from './services/geminiService';
import AnalysisDisplay from './components/AnalysisDisplay';

const App: React.FC = () => {
  const [selectedType, setSelectedType] = useState<ImageType>(ImageType.ECG);
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setLoading(true);
    setError(null);

    try {
      const mimeType = image.split(';')[0].split(':')[1];
      const data = await analyzeImage(image, mimeType, selectedType);
      setResult(data);
    } catch (err) {
      console.error(err);
      setError("Error en el análisis clínico. Verifica tu VITE_GEMINI_API_KEY en Vercel.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Navbar Superior */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">C</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">Clinical Intelligence</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-mono bg-indigo-50 text-indigo-600 px-2 py-1 rounded border border-indigo-100 uppercase tracking-widest font-bold">
            Gemini 1.5 Flash AI
          </span>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-4 md:p-8">
        {/* Selector Dinámico de Especialidades (Incluye Urostick y Tox) */}
        <div className="flex flex-wrap gap-2 mb-10 justify-center">
          {Object.values(ImageType).map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-4 py-2 rounded-xl text-[11px] font-black transition-all duration-200 uppercase tracking-tighter ${
                selectedType === type
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 ring-2 ring-indigo-400 ring-offset-2 scale-105'
                  : 'bg-white text-slate-400 border border-slate-200 hover:border-indigo-300 hover:text-indigo-500'
              }`}
            >
              {type.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Panel de Carga de Imagen */}
          <div className="space-y-6">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="group relative aspect-video bg-white border-2 border-dashed border-slate-300 rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-all overflow-hidden shadow-sm"
            >
              {image ? (
                <img src={image} alt="Preview" className="w-full h-full object-contain p-6 transition-transform group-hover:scale-[1.02]" />
              ) : (
                <div className="text-center p-8">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <span className="text-4xl">📸</span>
                  </div>
                  <p className="text-slate-600 font-bold">Cargar Evidencia Clínica</p>
                  <p className="text-slate-400 text-xs mt-1">Soporta ECG, Tiras de Orina y Tests de Drogas</p>
                </div>
              )}
            </div>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept="image/*"
            />

            <button
              onClick={handleAnalyze}
              disabled={!image || loading}
              className={`w-full py-6 rounded-[2rem] font-black text-sm tracking-[0.2em] shadow-2xl transition-all ${
                !image || loading
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'
              }`}
            >
              {loading ? 'PROCESANDO CON IA...' : 'GENERAR DIAGNÓSTICO'}
            </button>

            {error && (
              <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl text-[11px] font-bold border border-rose-100 flex items-center gap-3 animate-pulse">
                <span>❌</span> {error}
              </div>
            )}
          </div>

          {/* Panel de Resultados */}
          <div className="bg-slate-900 rounded-[3rem] p-1 shadow-2xl min-h-[550px] overflow-hidden">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center p-12 text-center text-white">
                <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-6"></div>
                <h3 className="font-black text-xl mb-2 tracking-tighter">SISTEMA ANALIZANDO</h3>
                <p className="text-slate-400 text-sm italic">Evaluando biomarcadores y morfología técnica...</p>
              </div>
            ) : result ? (
              <div className="h-full bg-white m-1 rounded-[2.8rem] overflow-hidden">
                <AnalysisDisplay data={result} />
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-12 text-center">
                <div className="text-6xl mb-6 grayscale opacity-30">🔬</div>
                <p className="text-slate-500 font-bold text-lg">Módulo de Diagnóstico Listo</p>
                <p className="text-slate-400 text-xs mt-2 max-w-[280px] mx-auto">
                  Selecciona el tipo de estudio y carga una imagen para ver los puntos técnicos.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="max-w-4xl mx-auto p-12 text-center">
        <div className="inline-block p-1 px-4 bg-slate-200 rounded-full text-[9px] font-black text-slate-500 tracking-[0.3em] mb-4">
          MODO: ASISTENCIA CLÍNICA AVANZADA
        </div>
        <p className="text-[10px] text-slate-400 leading-relaxed uppercase tracking-widest">
          ESTA IA NO SUSTITUYE EL CRITERIO MÉDICO. LAS IMÁGENES DE UROSTICK Y TOXICOLOGÍA DEBEN TENER BUENA ILUMINACIÓN.
        </p>
      </footer>
    </div>
  );
};

export default App;