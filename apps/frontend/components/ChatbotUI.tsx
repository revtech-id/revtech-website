"use client";

import { useState, useRef, useEffect } from 'react';

export default function ChatbotUI() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Halo! Saya AI Asisten RevTech. Ada yang bisa saya bantu hari ini? Ingin konsultasi pembuatan website, katalog produk, atau punya ide custom?'
    }
  ]);
  const isLoading = false;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: input }]);
    setInput('');
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  useEffect(() => {
    const handleOpenChatbot = () => setIsOpen(true);
    window.addEventListener("open-chatbot", handleOpenChatbot);
    return () => window.removeEventListener("open-chatbot", handleOpenChatbot);
  }, []);

  // Lock body scroll when chatbot is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      {/* Overlay Dark (no blur) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-[90] transition-all duration-300" 
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Chat Window (Sidebar) */}
      {isOpen && (
        <div className="fixed inset-0 sm:left-auto right-0 top-0 w-full sm:w-[550px] h-[100dvh] z-[100] bg-white flex flex-col overflow-hidden shadow-[-20px_0_40px_rgba(0,0,0,0.2)] border-l border-gray-100 animate-fade-in origin-right">
          {/* Header */}
          <div className="bg-white p-5 flex justify-between items-center border-b border-gray-100 z-10">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-primary rounded-xl flex items-center justify-center overflow-hidden shadow-sm">
                <img src="/images/icon-robot.webp" alt="AI Icon" className="w-[80%] h-[80%] object-contain drop-shadow-sm" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-[15px] sm:text-base">RevTech Assistant</h3>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-700 p-2 rounded-lg transition-colors">
              <span className="material-symbols-outlined block text-[20px] sm:text-[24px]">close</span>
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 bg-white p-6 overflow-y-auto flex flex-col gap-6">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-1 overflow-hidden shadow-sm">
                    <img src="/images/icon-robot.webp" alt="AI Icon" className="w-[80%] h-[80%] object-contain drop-shadow-sm" />
                  </div>
                )}
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 sm:px-5 sm:py-3.5 text-[14px] sm:text-[15px] leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-primary text-white rounded-tr-sm' : 'bg-gray-100 text-gray-800 rounded-tl-sm'}`}>
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                </div>
              </div>
            ))}
            
            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex justify-start gap-3">
                <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-1 overflow-hidden shadow-sm">
                    <img src="/images/icon-robot.webp" alt="AI Icon" className="w-[80%] h-[80%] object-contain drop-shadow-sm" />
                </div>
                <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-5 bg-white border-t border-gray-100">
            <form onSubmit={handleSubmit} className="flex items-center gap-3">
              <input 
                type="text" 
                value={input}
                onChange={handleInputChange}
                placeholder="Tanya sesuatu..." 
                className="flex-1 bg-white border border-gray-300 rounded-xl px-4 py-3 sm:px-5 sm:py-3.5 text-[14px] sm:text-[15px] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                disabled={isLoading}
              />
              <button 
                type="submit" 
                disabled={!input.trim() || isLoading}
                className={`p-3.5 rounded-xl flex items-center justify-center transition-colors ${(input.trim() && !isLoading) ? 'bg-primary text-white hover:bg-blue-700 shadow-md' : 'bg-gray-100 text-gray-400'}`}
              >
                <span className="material-symbols-outlined block text-[22px]">send</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
