import React, { useState, useRef } from 'react';
import { ImageType, AnalysisResult } from './types';
import { analyzeImage } from './services/geminiService';
import { AnalysisDisplay } from './components/AnalysisDisplay';

const App: React.FC = () => {
  const [selectedType, setSelectedType] = useState<ImageType>(ImageType.ECG);
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Manejador de carga de archivos
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

  // Función principal de análisis
  const handleAnalyze = async () => {
    if (!image) return;
    setLoading(true);
    setError(null);

    try {
      const mimeType = image.split(';')[0].split(':')[1];
      const data = await analyzeImage(image, mimeType, selectedType);
      setResult(data);
    } catch (err) {
      setError("No se pudo completar el análisis clínico. Verifique su API Key.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* Header Estilo AI Studio */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-xl">+</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-gray-800">Clinical Intelligence</h1>
        </div>
        <div className="text-xs font-mono bg-gray-100 px-3 py-1 rounded text-gray-500">
          v2.0 - Gemini 1.5 Flash
        </div>
      </nav>

      <main className="max-w-5xl mx-auto p-6 md:p-10">
        {/* Selector de Especialidad */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {Object.values(ImageType).map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                selectedType === type
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105'
                  : 'bg-white text-gray-500 border border-gray-200 hover:border-blue-400'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-10">
          {/* Lado Izquierdo: Carga de Imagen */}
          <div className="space-y-6">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="aspect-video bg-white border-2 border-dashed border-gray-300 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors overflow-hidden group relative"
            >
              {image ? (
                <>
                  <img src={image} alt="Preview" className="w-full h-full object-contain p-4" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white font-bold">
                    Cambiar Imagen
                  </div>
                </>
              ) : (
                <div className="text-center p-10">
                  <div className="text-4xl mb-4 text-gray-300">📁</div>
                  <p className="text-gray-500 font-medium">Sube una imagen médica</p>
                  <p className="text-xs text-gray-400 mt-2">Radiografía, EKG o Dermatoscopia</p>
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
              className={`w-full py-4 rounded-2xl font-black text-lg transition-all ${
                !image || loading
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-xl active:scale-95'
              }`}
            >
              {loading ? 'PROCESANDO CON IA...' : 'INICIAR ANÁLISIS CLÍNICO'}
            </button>

            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
                ⚠️ {error}
              </div>
            )}
          </div>

          {/* Lado Derecho: Resultados */}
          <div className="bg-white/50 rounded-3xl p-2 min-h-[400px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full space-y-4">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500 font-medium animate-pulse text-sm">Escaneando hallazgos médicos...</p>
              </div>
            ) : result ? (
              <AnalysisDisplay data={result} />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 p-10 text-center">
                <div className="text-5xl mb-4 opacity-20">🔬</div>
                <p className="text-sm">Seleccione una especialidad y cargue una imagen para ver el informe detallado.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Disclaimer Médico */}
      <footer className="max-w-5xl mx-auto p-10 mt-10 border-t border-gray-100 text-center">
        <p className="text-[10px] text-gray-400 leading-relaxed uppercase tracking-widest">
          ESTA HERRAMIENTA UTILIZA INTELIGENCIA ARTIFICIAL PARA APOYO EDUCATIVO. NO CONSTITUYE UN DIAGNÓSTICO MÉDICO OFICIAL. 
          SIEMPRE CONSULTE CON UN ESPECIALISTA COLEGIADO.
        </p>
      </footer>
    </div>
  );
};

export default App;
