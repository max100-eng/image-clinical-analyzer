import React, { useState, useRef, useEffect } from 'react';
import { 
  ClipboardDocumentCheckIcon, 
  ChatBubbleLeftRightIcon, 
  ArrowPathIcon,
  BeakerIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { AnalysisResult, ChatMessage } from '../types';
import * as GeminiService from '../services/geminiService';

interface AnalysisDisplayProps {
  result: AnalysisResult;
  onReset: () => void;
}

const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ result, onReset }) => {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isTyping) return;

    const userMsg: ChatMessage = { role: 'user', content: userInput };
    setChatHistory(prev => [...prev, userMsg]);
    setUserInput('');
    setIsTyping(true);

    try {
      if (GeminiService.chatWithClinicalAI) {
        const response = await GeminiService.chatWithClinicalAI([...chatHistory, userMsg], userInput);
        setChatHistory(prev => [...prev, { role: 'assistant', content: response }]);
      }
    } catch (error) {
      setChatHistory(prev => [...prev, { role: 'assistant', content: "Error en la consulta. Reintente." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 animate-fade-in">
      {/* CABECERA DE RESULTADOS */}
      <div className="bg-white rounded-2xl shadow-xl border border-blue-50 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-5 flex justify-between items-center text-white">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <ClipboardDocumentCheckIcon className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Interpretación Diagnóstica</h2>
              <p className="text-blue-100 text-xs">Núcleo de Inteligencia Clínica v0.1</p>
            </div>
          </div>
          <button 
            onClick={onReset}
            className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition-all border border-white/20"
          >
            <ArrowPathIcon className="h-4 w-4" />
            <span className="text-sm font-medium">Nuevo Análisis</span>
          </button>
        </div>
        
        <div className="p-8">
          <div className="prose prose-blue max-w-none">
            <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 text-gray-800 leading-relaxed whitespace-pre-wrap shadow-sm">
              {result.analysis}
            </div>
          </div>
        </div>
      </div>

      {/* PANEL INFERIOR: CHAT Y SEGURIDAD */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* CHAT INTERACTIVO (2 columnas) */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-200 flex flex-col h-[550px]">
          <div className="p-4 border-b flex items-center justify-between bg-gray-50/50 rounded-t-2xl">
            <div className="flex items-center space-x-2 font-semibold text-gray-700">
              <ChatBubbleLeftRightIcon className="h-5 w-5 text-blue-600" />
              <span>Consultas sobre el Informe</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {chatHistory.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2">
                <BeakerIcon className="h-12 w-12 opacity-20" />
                <p className="text-sm">¿Tiene dudas sobre los hallazgos? Pregunte aquí.</p>
              </div>
            )}
            
            {chatHistory.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none shadow-md' 
                    : 'bg-gray-100 text-gray-800 rounded-bl-none border border-gray-200'
                }`}>
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex space-x-2 items-center text-blue-600">
                <div className="flex space-x-1">
                  <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce"></div>
                  <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                </div>
                <span className="text-xs font-medium uppercase tracking-widest">Analizando</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="p-4 bg-white border-t rounded-b-2xl">
            <div className="relative flex items-center">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Ej: ¿Qué significan estos niveles de opacidad?"
                className="w-full border border-gray-200 rounded-xl pl-4 pr-12 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                disabled={isTyping}
              />
              <button
                type="submit"
                disabled={isTyping}
                className="absolute right-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              </button>
            </div>
          </form>
        </div>

        {/* INFO LATERAL / SEGURIDAD */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-2xl border border-blue-100">
            <div className="flex items-center space-x-2 mb-4 text-blue-800">
              <ShieldCheckIcon className="h-5 w-5" />
              <h4 className="font-bold text-sm uppercase tracking-wide">Protocolo de Seguridad</h4>
            </div>
            <ul className="text-xs text-blue-900/70 space-y-3">
              <li className="flex items-start space-x-2">
                <span className="text-blue-500">•</span>
                <span>Procesamiento encriptado de imágenes médicas.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500">•</span>
                <span>Análisis basado en modelos Gemini 1.5 Flash optimizados.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500">•</span>
                <span>Cumplimiento ético de IA clínica.</span>
              </li>
            </ul>
          </div>

          <div className="p-5 bg-amber-50 rounded-2xl border border-amber-100">
            <p className="text-[11px] text-amber-800 leading-tight italic">
              <strong>Nota:</strong> Esta herramienta es un asistente de apoyo. La decisión diagnóstica final corresponde exclusivamente al personal médico calificado.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisDisplay;