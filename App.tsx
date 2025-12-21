import React, { useState, useRef } from 'react';
// Importación con extensión explícita para evitar errores en el build de Vercel
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
      setError("Error en el análisis. Verifica tu conexión y que VITE_GEMINI_API_KEY esté en Vercel.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header Estilo AI Studio */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">C</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">Clinical Intelligence</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-mono bg-slate-100 px-2 py-1 rounded text-slate-500 uppercase tracking-widest">
            Gemini 1.5 Flash
          </span>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-4 md:p-8">
        {/* Selector de Especialidad Médico: Mapeo dinámico de ImageType */}
        <div className="flex flex-wrap gap-3 mb-10 justify-center">
          {Object.values(ImageType).map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 uppercase tracking-wider ${
                selectedType === type
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 ring-2 ring-indigo-400 ring-offset-2'
                  : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {type.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Panel Izquierdo: Entrada de Datos */}
          <div className="space-y-6">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="group relative aspect-video bg-white border-2 border-dashed border-slate-300 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-all overflow-hidden shadow-sm"
            >
              {image ? (
                <img src={image} alt="Clinical view" className="w-full h-full object-contain p-4 transition-transform group-hover:scale-[1.02]" />
              ) : (
                <div className="text-center p-8">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-indigo-100 transition-colors">
                    <span className="text-3xl">📤</span>
                  </div>
                  <p className="text-slate-600 font-semibold">Cargar Imagen Clínica</p>
                  <p className="text-slate-400 text-xs mt-1 italic">JPG, PNG o DICOM export</p>
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
              className={`w-full py-5 rounded-2xl font-bold text-lg shadow-xl transition-all ${
                !image || loading
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-200 active:scale-[0.98]'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>PROCESANDO...</span>
                </div>
              ) : (
                'GENERAR REPORTE CLÍNICO'
              )}
            </button>

            {error && (
              <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl text-sm border border-rose-100 flex items-center gap-3">
                <span>⚠️</span> {error}
              </div>
            )}
          </div>

          {/* Panel Derecho: Reporte de IA */}
          <div className="bg-slate-100/50 rounded-[2rem] p-1 min-h-[500px]">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center p-12 text-center">
                <div className="w-20 h-20 relative mb-6">
                  <div className="absolute inset-0 border-4 border-indigo-200 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                </div>
                <h3 className="text-indigo-900 font-bold text-lg mb-2">Analizando Biomarcadores</h3>
                <p className="text-slate-500 text-sm max-w-[250px]">Gemini está revisando morfología, colores y signos de urgencia...</p>
              </div>
            ) : result ? (
              <div className="bg-white rounded-[1.8rem] shadow-sm overflow-hidden">
                <AnalysisDisplay data={result} />
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 p-12 text-center">
                <div className="text-6xl mb-6 opacity-20">🏥</div>
                <p className="text-slate-500 font-medium">Esperando imagen para diagnóstico</p>
                <p className="text-slate-400 text-xs mt-2 italic">Selecciona el tipo de prueba arriba y sube tu evidencia.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="max-w-6xl mx-auto p-8 mt-10 border-t border-slate-200 text-center">
        <p className="text-[10px] text-slate-400 leading-relaxed uppercase tracking-[0.2em] max-w-2xl mx-auto">
          AVISO: ESTE SISTEMA ES UNA HERRAMIENTA DE APOYO BASADA EN IA. LOS RESULTADOS DEBEN SER VALIDADOS POR UN MÉDICO COLEGIADO. 
        </p>
      </footer>
    </div>
  );
};

export default App;