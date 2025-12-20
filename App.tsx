import React, { useState } from 'react';

const App = () => {
  const [analisisCompleto, setAnalisisCompleto] = useState(true); // Controla si mostrar resultados

  return (
    <div className="flex h-screen w-full bg-white text-gray-800 font-sans">
      
      {/* SIDEBAR: Barra Lateral Estilo Gemini/AI Studio */}
      <aside className="w-64 bg-[#f8f9fa] border-r border-gray-200 flex flex-col">
        <div className="p-4">
          <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-white border border-gray-300 rounded-full text-sm font-medium hover:bg-gray-50 shadow-sm">
            <span className="text-xl">+</span> Nueva conversación
          </button>
        </div>
        
        <nav className="flex-1 overflow-y-auto px-4">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Recientes</div>
          <div className="space-y-1">
            <div className="p-2 bg-blue-50 text-blue-700 rounded-lg text-sm cursor-pointer font-medium">
              Diagnósticos Frecuentes de EKG
            </div>
            <div className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm cursor-pointer">
              Análisis imagen_0a0161.jpg
            </div>
          </div>
        </nav>

        <div className="p-4 border-t border-gray-200 text-xs text-gray-500">
          Configuración y ayuda
        </div>
      </aside>

      {/* MAIN: Área de Análisis */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-white">
        
        {/* Header Superior */}
        <header className="h-14 border-b border-gray-200 flex items-center justify-between px-6">
          <h1 className="text-lg font-medium text-gray-700">Clinical Intelligence Image Analyzer</h1>
          <div className="flex gap-2">
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Gemini 3 Flash</span>
          </div>
        </header>

        {/* Contenido del Chat / Resultados */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-3xl mx-auto space-y-8">
            
            {/* Sección de los 7 Puntos Técnicos */}
            <section className="space-y-4">
              <h2 className="text-xl font-semibold border-b pb-2">Resultados del Análisis</h2>
              <div className="grid grid-cols-1 gap-4 text-sm">
                <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-bold">1. Frecuencia Cardiaca:</span>
                  <span>75 lpm</span>
                </div>
                <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-bold">2. Análisis del Ritmo:</span>
                  <span>Sinusal</span>
                </div>
                <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-bold">3. Intervalo PR:</span>
                  <span>160 ms</span>
                </div>
                <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-bold">4. Intervalo QT:</span>
                  <span>400 ms</span>
                </div>
                <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-bold">5. Eje Eléctrico:</span>
                  <span>+60° (Normal)</span>
                </div>
                <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-bold">6. Segmento ST:</span>
                  <span>Sin alteraciones</span>
                </div>
                <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-bold">7. Otras alteraciones:</span>
                  <span>Ninguna detectable</span>
                </div>
              </div>
            </section>

            

            {/* CAJA DE DIAGNÓSTICO FINAL (Estilo Google Keep) */}
            <div className="bg-[#f1f3f4] border border-gray-300 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-gray-600">Google Keep ⌵</span>
              </div>
              
              <p className="text-sm text-gray-700 mb-2">He creado el diagnóstico final codificado:</p>
              
              <div className="bg-white/50 p-4 rounded-lg">
                <ol className="list-decimal ml-5 space-y-1 font-bold text-lg text-blue-900">
                  <li>Ritmo sinusal normal</li>
                </ol>
              </div>
              
              <p className="mt-4 text-[10px] text-gray-500 italic">
                ⚠️ Esta información tiene un carácter meramente informativo. Para obtener asesoramiento médico, consulte a un profesional.
              </p>
            </div>

          </div>
        </div>

        {/* Input Inferior (Estilo Gemini) */}
        <div className="p-4 bg-white border-t border-gray-200">
          <div className="max-w-3xl mx-auto relative">
            <input 
              type="text" 
              placeholder="Sube una imagen o pregunta sobre el EKG..."
              className="w-full p-4 pr-12 bg-[#f0f4f9] rounded-2xl border-none focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <button className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-600 font-bold">
              →
            </button>
          </div>
        </div>

      </main>
    </div>
  );
};

export default App;
