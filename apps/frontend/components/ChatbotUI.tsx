"use client";

import { useState, useRef, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';

export default function ChatbotUI() {
  const [isOpen, setIsOpen] = useState(false);
  
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    initialMessages: [
      {
        id: 'welcome',
        role: 'assistant',
        content: 'Halo! Saya AI Asisten RevTech. Ada yang bisa saya bantu hari ini? Ingin konsultasi pembuatan website, katalog produk, atau punya ide custom?'
      }
    ]
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, isLoading]);

  useEffect(() => {
    const handleOpenChatbot = () => setIsOpen(true);
    window.addEventListener("open-chatbot", handleOpenChatbot);
    return () => window.removeEventListener("open-chatbot", handleOpenChatbot);
  }, []);

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 max-w-[calc(100vw-3rem)] h-[500px] max-h-[calc(100vh-6rem)] bg-white rounded-2xl shadow-2xl flex flex-col z-[100] border border-gray-100 overflow-hidden animate-fade-in origin-bottom-right">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-blue-600 p-4 text-white flex justify-between items-center shadow-md z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm relative">
                <span className="material-symbols-outlined text-white">chat</span>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-primary rounded-full"></div>
              </div>
              <div>
                <h3 className="font-bold text-sm">RevTech AI</h3>
                <p className="text-xs text-blue-100 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[10px]">bolt</span> Online & Siap Membantu
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-blue-100 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors">
              <span className="material-symbols-outlined block">close</span>
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 bg-gray-50/50 p-4 overflow-y-auto flex flex-col gap-4">
            <div className="text-center text-xs text-gray-400 mb-2">Hari ini</div>
            
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${msg.role === 'user' ? 'bg-primary text-white rounded-tr-sm' : 'bg-white text-gray-800 border border-gray-100 rounded-tl-sm'}`}>
                  {/* Gunakan whitespace-pre-wrap agar line breaks dari AI ter-render dengan baik */}
                  <div className="leading-relaxed whitespace-pre-wrap">{msg.content}</div>
                </div>
              </div>
            ))}
            
            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-gray-100">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <button type="button" className="text-gray-400 hover:text-primary p-2 transition-colors">
                <span className="material-symbols-outlined block text-[20px]">attach_file</span>
              </button>
              <input 
                type="text" 
                value={input}
                onChange={handleInputChange}
                placeholder="Tulis pesan Anda di sini..." 
                className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                disabled={isLoading}
              />
              <button 
                type="submit" 
                disabled={!input.trim() || isLoading}
                className={`p-2 rounded-full flex items-center justify-center transition-colors ${(input.trim() && !isLoading) ? 'bg-primary text-white hover:bg-blue-700' : 'bg-gray-100 text-gray-400'}`}
              >
                <span className="material-symbols-outlined block text-[18px]">send</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
