import React from 'react';

const App = () => {
  return (
    <div className="flex h-screen bg-white font-sans text-gray-900">
      {/* BARRA LATERAL (Sidebar) estilo Gemini */}
      <aside className="w-64 bg-[#f8f9fa] border-r flex flex-col p-4">
        <button className="flex items-center justify-center gap-2 p-2 bg-white border rounded-full shadow-sm hover:bg-gray-50 mb-6">
          <span className="text-xl">+</span> Nueva conversación
        </button>
        <nav className="flex-1 space-y-2 text-sm">
          <div className="font-bold text-gray-500 px-2 uppercase text-[10px]">Recientes</div>
          <div className="p-2 bg-blue-100 text-blue-800 rounded-lg">Diagnósticos Frecuentes de EKG</div>
        </nav>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="p-4 border-b flex justify-between items-center">
          <h1 className="text-lg font-medium">Clinical Intelligence Image Analyzer</h1>
          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Gemini 3 Flash</span>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-3xl mx-auto">
            {/* 7 PUNTOS DE ANÁLISIS */}
            <div className="bg-white rounded-xl border p-6 shadow-sm mb-6">
              <h2 className="text-xl font-bold mb-4 text-blue-900">Informe Técnico de EKG</h2>
              <ul className="space-y-3 text-sm">
                <li className="flex justify-between border-b pb-1"><strong>1. Frecuencia Cardiaca:</strong> <span>72 lpm</span></li>
                <li className="flex justify-between border-b pb-1"><strong>2. Análisis del Ritmo:</strong> <span>Sinusal</span></li>
                <li className="flex justify-between border-b pb-1"><strong>3. Valoración PR:</strong> <span>160 ms</span></li>
                <li className="flex justify-between border-b pb-1"><strong>4. Valoración QT:</strong> <span>400 ms</span></li>
                <li className="flex justify-between border-b pb-1"><strong>5. Eje Eléctrico:</strong> <span>+60°</span></li>
                <li className="flex justify-between border-b pb-1"><strong>6. Segmento ST:</strong> <span>Normal</span></li>
                <li className="flex justify-between border-b pb-1"><strong>7. Otras Alteraciones:</strong> <span>Ninguna</span></li>
              </ul>
            </div>

            {/* CAJA DE DIAGNÓSTICO FINAL (Estilo Google Keep) */}
            <div className="bg-[#f1f3f4] border border-gray-300 rounded-2xl p-6">
              <div className="text-xs font-bold text-gray-500 mb-2">Google Keep ⌵</div>
              <p className="text-sm mb-3">Diagnóstico final codificado:</p>
              <div className="bg-white/60 p-4 rounded-lg font-bold text-xl text-blue-800">
                1. Ritmo sinusal normal
              </div>
              <p className="mt-4 text-[10px] text-gray-400 italic">
                Información meramente informativa. Consulte a un médico.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
