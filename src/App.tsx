import { useState } from 'react';
import { ImageType, AnalysisResult } from './types';
import { analyzeImage } from './services/geminiService';
import AnalysisDisplay from './components/AnalysisDisplay';
import './index.css';

function App() {
  const [selectedType, setSelectedType] = useState<ImageType | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    if (!image || !selectedType) return;

    setLoading(true);
    setError(null);
    try {
      // Extraemos el mimeType (ej: image/jpeg) de la cadena base64
      const mimeType = image.match(/data:(.*?);base64/)?.[1] || 'image/jpeg';
      const analysis = await analyzeImage(image, mimeType, selectedType);
      setResult(analysis);
    } catch (err: any) {
      setError(err.message || "Error al conectar con la IA");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 font-sans">
      <header className="max-w-4xl mx-auto text-center py-8">
        <h1 className="text-3xl font-bold tracking-tight text-blue-400">
          CLINICAL IMAGE ANALYZER
        </h1>
        <p className="text-slate-400 mt-2">Inteligencia Artificial para Soporte Clínico</p>
      </header>

      <main className="max-w-4xl mx-auto space-y-6">
        {/* Selector de Categorías */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Object.values(ImageType).map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`p-3 rounded-lg border-2 transition-all ${
                selectedType === type 
                ? 'border-blue-500 bg-blue-500/20 text-blue-200' 
                : 'border-slate-700 bg-slate-800 hover:border-slate-500'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Zona de Carga de Imagen */}
        <div className="relative group">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="image-input"
          />
          <label
            htmlFor="image-input"
            className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
              image ? 'border-green-500/50 bg-slate-800' : 'border-slate-700 bg-slate-800/50 hover:bg-slate-800'
            }`}
          >
            {image ? (
              <img src={image} alt="Preview" className="h-full w-full object-contain p-2 rounded-xl" />
            ) : (
              <div className="text-center p-6">
                <p className="text-4xl mb-2">📸</p>
                <p className="text-slate-300 font-medium">Tocar para Cargar o Capturar</p>
                <p className="text-slate-500 text-sm mt-1">ECG, Radiología, Urostick...</p>
              </div>
            )}
          </label>
        </div>

        {/* Botón de Acción */}
        <button
          onClick={handleAnalyze}
          disabled={!image || !selectedType || loading}
          className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all ${
            !image || !selectedType || loading
            ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-500 active:scale-95 text-white'
          }`}
        >
          {loading ? 'ANALIZANDO IMAGEN...' : 'GENERAR INFORME CLÍNICO'}
        </button>

        {/* Mensajes de Error */}
        {error && (
          <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm text-center">
            ⚠️ {error}
          </div>
        )}

        {/* Resultados */}
        {result && <AnalysisDisplay result={result} />}
      </main>

      <footer className="max-w-4xl mx-auto mt-12 text-center text-slate-600 text-xs">
        © 2025 Clinical Analyzer - Herramienta de soporte para profesionales. No reemplaza criterio médico.
      </footer>
    </div>
  );
}

export default App;