import { useState } from 'react';
import { ImageType, AnalysisResult } from './types';
import { analyzeImage } from './services/geminiService';
import AnalysisDisplay from './components/AnalysisDisplay';
import { 
  Activity, FileText, Eye, ShieldAlert, 
  TestTube, FlaskConical, Upload, ChevronRight 
} from 'lucide-react';

function App() {
  const [selectedImage, setSelectedImage] = useState<ImageType | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [category, setCategory] = useState<string>('ecg');

  const modalities = [
    { id: 'ecg', name: 'ECG', icon: Activity },
    { id: 'radiology', name: 'RADIOLOGÍA', icon: FileText },
    { id: 'retina', name: 'RETINA', icon: Eye },
    { id: 'dermatoscopy', name: 'DERMATOSCOPIA', icon: ShieldAlert },
    { id: 'urinalysis', name: 'URIANÁLISIS', icon: TestTube },
    { id: 'toxicology', name: 'TOXICOLOGÍA', icon: FlaskConical },
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage({
        id: Math.random().toString(36).substr(2, 9),
        url: URL.createObjectURL(file),
        file,
        category
      });
      setAnalysis(null); // Limpiar análisis previo al subir nueva imagen
    }
  };

  const executeAnalysis = async () => {
    if (!selectedImage) return;
    setIsAnalyzing(true);
    try {
      const res = await analyzeImage(selectedImage.file, category);
      setAnalysis(res);
    } catch (error) {
      console.error("Error en el análisis:", error);
      alert("Hubo un error al procesar la imagen con la IA.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-8 font-sans">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* COLUMNA IZQUIERDA: Configuración y Carga */}
        <div className="lg:col-span-7 space-y-8">
          {/* Logo y Título */}
          <div className="flex items-center gap-3">
            <div className="bg-[#006070] p-2 rounded-lg">
              <Activity className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#001e2b]">Clinical Intelligence</h1>
              <p className="text-[#006070] text-[10px] font-black uppercase tracking-[0.2em]">AI Image Analysis</p>
            </div>
          </div>

          {/* 1. SECCIÓN: Modalidad Diagnóstica */}
          <section>
            <h2 className="text-[#001e2b] font-black italic mb-4 flex items-center gap-2 text-sm">
              <span className="text-[#006070] not-italic">1.</span> MODALIDAD DIAGNÓSTICA
            </h2>
            <div className="grid grid-cols-3 gap-4">
              {modalities.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setCategory(m.id)}
                  className={`flex flex-col items-center justify-center p-6 rounded-2xl border-b-4 transition-all ${
                    category === m.id 
                    ? 'bg-[#006070] text-white border-[#004d5a] shadow-lg' 
                    : 'bg-white text-[#006070] border-slate-200 hover:bg-slate-50 border-b-slate-300'
                  }`}
                >
                  <m.icon className={`w-8 h-8 mb-2 ${category === m.id ? 'text-white' : 'text-[#006070]'}`} />
                  <span className="text-[10px] font-black uppercase tracking-tighter">{m.name}</span>
                </button>
              ))}
            </div>
          </section>

          {/* 2. SECCIÓN: Entrada de Imagen */}
          <section>
            <h2 className="text-[#001e2b] font-black italic mb-4 flex items-center gap-2 text-sm">
              <span className="text-[#006070] not-italic">2.</span> ENTRADA DE IMAGEN
            </h2>
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-[32px] p-12 text-center shadow-sm">
              {!selectedImage ? (
                <label className="cursor-pointer block">
                  <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Upload className="text-slate-300 w-10 h-10" />
                  </div>
                  <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                  <p className="text-slate-400 font-bold text-sm">Subir imagen médica...</p>
                </label>
              ) : (
                <div className="space-y-4">
                  <div className="relative inline-block">
                    <img src={selectedImage.url} className="max-h-64 mx-auto rounded-xl shadow-md" alt="Preview" />
                    <button 
                      onClick={() => setSelectedImage(null)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg"
                    >
                      <ShieldAlert className="w-4 h-4" />
                    </button>
                  </div>
                  <button 
                    onClick={executeAnalysis}
                    disabled={isAnalyzing}
                    className="w-full bg-[#006070] text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-[#004d5a] transition-colors flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {isAnalyzing ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>Ejecutar Análisis <ChevronRight className="w-5 h-5" /></>
                    )}
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* COLUMNA DERECHA: Resultados (Núcleo de Inteligencia) */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-8 min-h-[600px] flex flex-col sticky top-8">
            {analysis ? (
              <AnalysisDisplay analysis={analysis} />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mb-6">
                  <FileText className="text-slate-200 w-12 h-12" />
                </div>
                <h3 className="text-[#001e2b] text-2xl font-black mb-2">Núcleo de Inteligencia</h3>
                <p className="text-slate-400 text-sm px-8 leading-relaxed">
                  Sube una imagen clínica y selecciona la modalidad para recibir una interpretación diagnóstica mediante IA.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;