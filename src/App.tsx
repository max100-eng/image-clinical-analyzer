import { useState } from 'react';
import { ImageType, AnalysisResult } from './types';
import { analyzeImage } from './services/geminiService';
import AnalysisDisplay from './components/AnalysisDisplay';
import { Camera, Upload, Activity, AlertCircle, FileText, ChevronRight } from 'lucide-react';

function App() {
  const [selectedImage, setSelectedImage] = useState<ImageType | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<string>('general');

  const categories = [
    { id: 'general', name: 'General', icon: Activity },
    { id: 'ekg', name: 'ECG/EKG', icon: Activity },
    { id: 'radiology', name: 'Radiología', icon: FileText },
    { id: 'dermatology', name: 'Dermatología', icon: AlertCircle },
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setSelectedImage({
        id: Math.random().toString(36).substr(2, 9),
        url,
        file,
        category
      });
      setAnalysis(null);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setError(null);
    try {
      const result = await analyzeImage(selectedImage.file, selectedImage.category);
      setAnalysis(result);
    } catch (err) {
      setError('Error al analizar la imagen. Por favor, intente de nuevo.');
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Clinical AI Agent</h1>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Upload and Preview */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Camera className="w-5 h-5 text-blue-600" />
                Captura de Imagen
              </h2>
              
              <div className="grid grid-cols-2 gap-3 mb-6">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                      category === cat.id
                        ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <cat.icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{cat.name}</span>
                  </button>
                ))}
              </div>

              {!selectedImage ? (
                <label className="border-2 border-dashed border-slate-200 rounded-2xl p-12 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors group">
                  <div className="bg-slate-100 p-4 rounded-full group-hover:bg-blue-50 transition-colors">
                    <Upload className="w-8 h-8 text-slate-400 group-hover:text-blue-600" />
                  </div>
                  <span className="mt-4 text-slate-600 font-medium">Subir imagen médica</span>
                  <span className="mt-1 text-slate-400 text-sm">PNG, JPG hasta 10MB</span>
                  <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                </label>
              ) : (
                <div className="space-y-4">
                  <div className="relative rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                    <img src={selectedImage.url} alt="Preview" className="w-full h-auto max-h-[400px] object-contain" />
                    <button 
                      onClick={() => setSelectedImage(null)}
                      className="absolute top-4 right-4 bg-white/90 backdrop-blur p-2 rounded-full shadow-lg hover:bg-white text-slate-600"
                    >
                      <AlertCircle className="w-5 h-5" />
                    </button>
                  </div>
                  <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-200"
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Analizando...
                      </>
                    ) : (
                      <>
                        Generar Informe Clínico
                        <ChevronRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              )}

              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-700 text-sm">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Results */}
          <div className="space-y-6">
            {analysis ? (
              <AnalysisDisplay analysis={analysis} />
            ) : (
              <div className="bg-white rounded-2xl p-12 shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center h-full min-h-[400px]">
                <div className="bg-slate-50 p-6 rounded-full mb-6">
                  <FileText className="w-12 h-12 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Informe Clínico</h3>
                <p className="text-slate-500 max-w-xs">
                  Sube una imagen y presiona el botón para generar un análisis detallado mediante IA.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// ESTO ES LO QUE FALTABA
export default App;