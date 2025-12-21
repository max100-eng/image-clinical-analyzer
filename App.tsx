import React, { useState } from 'react';

const App = () => {
  const [specialty, setSpecialty] = useState('EKG');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Lista de especialidades basadas en tu diseño de AI Studio
  const specialties = [
    { id: 'EKG', icon: '🫀', label: 'EKG' },
    { id: 'Radiología', icon: '🦴', label: 'RADIOLOGÍA' },
    { id: 'Retina', icon: '👁️', label: 'RETINA' },
    { id: 'Dermatoscopia', icon: '🔍', label: 'DERMATOSCOPIA' },
    { id: 'Urostick', icon: '🧪', label: 'UROSTICK' },
    { id: 'Toxicología', icon: '⚗️', label: 'TOXICOLOGÍA' }
  ];

  return (
    <div className="flex h-screen bg-white font-sans text-gray-900">
      
      {/* BARRA LATERAL (Sidebar) */}
      <aside className="w-64 bg-[#f8f9fa] border-r flex flex-col p-4">
        <button className="flex items-center justify-center gap-2 p-2 bg-white border rounded-full shadow-sm hover:bg-gray-50 mb-6 font-medium">
          <span className="text-xl">+</span> Nueva conversación
        </button>
        <nav className="flex-1 space-y-2 text-sm">
          <div className="font-bold text-gray-400 px-2 uppercase text-[10px] tracking-widest">Recientes</div>
          <div className="p-2 bg-blue-50 text-blue-700 rounded-lg font-medium cursor-pointer">
            Último análisis: {specialty}
          </div>
        </nav>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* Header */}
        <header className="p-4 border-b flex justify-between items-center bg-white">
          <h1 className="text-lg font-semibold text-gray-700">Clinical Intelligence Image Analyzer</h1>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 bg-green-500 rounded-full"></span>
            <span className="text-xs font-medium text-gray-500">Gemini 3 Flash Ready</span>
          </div>
        </header>

        {/* SELECTOR DE ESPECIALIDAD (Botones Superiores) */}
        <div className="grid grid-cols-6 gap-2 p-4 bg-gray-50 border-b">
          {specialties.map((item) => (
            <button
              key={item.id}
              onClick={() => setSpecialty(item.id)}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                specialty === item.id 
                ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-[10px] font-bold tracking-tighter">{item.label}</span>
            </button>
          ))}
        </div>

        {/* CONTENIDO DE ANÁLISIS */}
        <div className="flex-1 overflow-y-auto p-6 bg-white">
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* Zona de Carga de Imagen */}
            <div className="border-2 border-dashed border-gray-200 rounded-3xl p-12 text-center hover:bg-gray-50 transition-colors cursor-pointer">
              <div className="text-4xl mb-4 text-gray-300">☁️</div>
              <p className="text-gray-500 font-medium text-sm">Arrastra o selecciona la imagen de {specialty}</p>
              <button className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-full text-sm font-bold shadow-lg hover:bg-blue-700">
                SUBIR ARCHIVO
              </button>
            </div>

            {/* Puntos Técnicos Dinámicos */}
            <div className="bg-white rounded-2xl border p-6 shadow-sm">
              <h3 className="text-lg font-bold mb-4 text-blue-900 border-b pb-2">Informe de {specialty}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-sm text-gray-400 italic">Esperando imagen para procesar los puntos técnicos específicos...</div>
              </div>
            </div>

            {/* CAJA DE DIAGNÓSTICO FINAL (Estilo Google Keep) */}
            <div className="bg-[#f1f3f4] border border-gray-300 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-black text-gray-400 uppercase">Google Keep ⌵</span>
              </div>
              <p className="text-sm font-medium text-gray-600 mb-2">Diagnóstico final detectado:</p>
              <div className="bg-white/70 p-4 rounded-xl font-bold text-2xl text-blue-800 border border-white">
                --
              </div>
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-100 rounded-lg text-[10px] text-yellow-800 leading-tight">
                ⚠️ **AVISO MÉDICO:** Los resultados generados por IA deben ser validados por un profesional de la salud colegiado.
              </div>
            </div>

          </div>
        </div>

      </main>
    </div>
  );
};

export default App;
