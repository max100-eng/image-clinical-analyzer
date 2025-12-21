import React, { useState, useRef } from 'react';
import { ImageType, AnalysisResult } from './types.ts';
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
      setError("Error en el análisis. Verifica tu VITE_GEMINI_API_KEY en Vercel.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">C</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">Clinical Intelligence</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden md:inline text-[10px] font-mono bg-slate-100 px-2 py-1 rounded text-slate-500 uppercase tracking-widest">
            Gemini 1.5 Flash
          </span>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-4 md:p-8">
        {/* Selector de Especialidad */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {Object.values(ImageType).map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-4 py-2 rounded-xl text-[10px] md:text-xs font-bold transition-all duration-200 uppercase tracking-wider ${
                selectedType === type
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 ring-2 ring-indigo-400 ring-offset-2'
                  : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {type.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6 items-start">
          {/* Panel de Carga */}
          <div className="space-y-6">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="group relative aspect-[4/3] md:aspect-video bg-white border-2 border-dashed border-slate-300 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-all overflow-hidden shadow-sm"
            >
              {image ? (
                <img src={image} alt="Clinical view" className="w-full h-full object-contain p-4 transition-transform group-hover:scale-[1.01]" />
              ) : (
                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">📸</span>
                  </div>
                  <p className="text-slate-600 font-bold">Tocar para Cargar o Capturar</p>
                  <p className="text-slate-400 text-xs mt-1 italic">Compatible con Cámara y Galería</p>
                </div>
              )}
            </div>
            
            {/* INPUT CORREGIDO PARA MÓVILES */}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept="image/jpeg, image/png, image/jpg"
              capture="environment" 
            />

            <button
              onClick={handleAnalyze}
              disabled={!image || loading}
              className={`w-full py-5 rounded-2xl font-bold text-lg shadow-xl transition-all active:scale-[0.95] ${
                !image || loading
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-200'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>ANALIZANDO...</span>
                </div>
              ) : (
                'GENERAR INFORME CLÍNICO'
              )}
            </button>

            {error && (
              <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl text-xs font-bold border border-rose-100 flex items-center gap-3">
                <span>⚠️</span> {error}
              </div>
            )}
          </div>

          {/* Panel de Resultados */}
          <div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm min-h-[400px] overflow-hidden">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center p-12 text-center">
                <div className="w-16 h-16 relative mb-4">
                  <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                </div>
                <h3 className="text-indigo-900 font-bold text-lg">IA Procesando</h3>
                <p className="text-slate-400 text-xs">Evaluando imagen según protocolo {selectedType}...</p>
              </div>
            ) : result ? (
              <AnalysisDisplay data={result} />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 p-12 text-center">
                <div className="text-5xl mb-4 opacity-20">🏥</div>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Listo para Diagnóstico</p>
                <p className="text-slate-400 text-[10px] mt-2 italic px-8">Suba una foto clara de su prueba para obtener el informe detallado.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="p-8 text-center border-t border-slate-100 mt-10">
        <p className="text-[9px] text-slate-400 uppercase tracking-widest">
          SISTEMA ASISTIDO POR IA - SOLO PARA USO PROFESIONAL
        </p>
      </footer>
    </div>
  );
};

export default App;