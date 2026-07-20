"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function TestimonialsSection({ testimonials }: { testimonials: any[] }) {
  const [activeId, setActiveId] = useState(testimonials[0]?.id || 1);
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);
  const activeChat = testimonials.find(t => t.id === activeId) || testimonials[0];

  return (
    <section className="py-20 lg:py-28 bg-[#f0f2f5] relative overflow-hidden border-t border-gray-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-16 lg:mb-24 relative z-10">
          <h2 className="text-blue-600 font-bold tracking-wider uppercase text-xs mb-4">Testimoni</h2>
          <h3 className="text-3xl md:text-[2.5rem] lg:text-5xl font-black text-gray-900 mb-6 tracking-tight">Apa Kata <span className="text-blue-600">Mereka?</span></h3>
          <p className="text-xl md:text-lg lg:text-xl text-gray-600 leading-relaxed font-medium">
            Bukan sekadar janji teknis, tapi dampak nyata dari produk digital yang kami hasilkan, layaknya obrolan nyata bersama klien kami.
          </p>
        </div>

        {/* WhatsApp UI Container */}
        <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] shadow-2xl overflow-hidden border border-gray-200 flex flex-col md:flex-row h-[650px] md:h-[500px] lg:h-[600px] w-full">
          
          {/* Sidebar (Chat List) */}
          <div className={`w-full md:w-1/3 lg:w-[30%] md:border-r border-gray-200 bg-white flex-col h-full shrink-0 ${showChatOnMobile ? 'hidden md:flex' : 'flex'}`}>
            {/* Sidebar Header */}
            <div className="bg-[#f0f2f5] px-4 py-3 border-b border-gray-200 flex justify-end items-center h-16 shrink-0">
              <div className="flex gap-4 text-gray-500">
                <span className="material-symbols-outlined text-[22px] cursor-pointer hover:text-gray-700 transition-colors">donut_large</span>
                <span className="material-symbols-outlined text-[22px] cursor-pointer hover:text-gray-700 transition-colors">chat</span>
                <span className="material-symbols-outlined text-[22px] cursor-pointer hover:text-gray-700 transition-colors">more_vert</span>
              </div>
            </div>

            {/* Sidebar Search */}
            <div className="p-2 border-b border-gray-200 bg-white shrink-0">
              <div className="bg-[#f0f2f5] rounded-lg px-4 py-1.5 flex items-center gap-4 border border-transparent focus-within:border-white focus-within:bg-white focus-within:shadow-sm transition-all duration-300">
                <span className="material-symbols-outlined text-[18px] text-gray-500">search</span>
                <span className="text-sm text-gray-500 whitespace-nowrap">Cari atau mulai chat</span>
              </div>
            </div>

            {/* Chats List */}
            <div className="overflow-y-auto flex-1 bg-white scrollbar-thin scrollbar-thumb-gray-200">
              {testimonials.map(t => {
                const lastMsg = t.messages[t.messages.length - 1];
                const isActive = activeId === t.id;
                
                return (
                  <div 
                    key={t.id} 
                    onClick={() => {
                      setActiveId(t.id);
                      setShowChatOnMobile(true);
                    }}
                    className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${isActive ? 'bg-[#f0f2f5]' : 'hover:bg-[#f5f6f6]'}`}
                  >
                    <div className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-lg shadow-sm border border-white ${t.avatarBg}`}>
                      {t.initials}
                    </div>
                    <div className={`flex-1 min-w-0 pb-3 pt-1 border-b ${isActive ? 'border-transparent' : 'border-gray-100'}`}>
                      <div className="flex justify-between items-baseline mb-1">
                        <h4 className="font-medium text-[17px] text-gray-900 truncate">{t.name}</h4>
                        <span className="text-xs text-gray-400 shrink-0 ml-2">{lastMsg.time}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {lastMsg.sender === "me" && <span className="material-symbols-outlined text-[14px] text-blue-500 leading-none">done_all</span>}
                        <p className="text-[14px] text-gray-500 truncate">{lastMsg.text}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Main Chat Window */}
          <div className={`flex-1 flex-col bg-[#efeae2] relative h-full md:h-full ${showChatOnMobile ? 'flex' : 'hidden md:flex'}`}>
            {/* Chat Header */}
            <div className="bg-[#f0f2f5] px-4 py-3 border-b border-gray-200 flex items-center justify-between h-16 shrink-0 z-20">
              <div className="flex items-center gap-2 md:gap-4">
                <span 
                  className="material-symbols-outlined text-[24px] text-gray-500 cursor-pointer md:hidden hover:text-gray-700" 
                  onClick={() => setShowChatOnMobile(false)}
                >
                  arrow_back
                </span>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm border border-white ${activeChat.avatarBg}`}>
                  {activeChat.initials}
                </div>
                <div>
                  <h4 className="font-medium text-[16px] text-gray-900 leading-tight">{activeChat.name}</h4>
                  <p className="text-[13px] text-gray-500 truncate">terakhir dilihat {activeChat.lastSeen}</p>
                </div>
              </div>
              <div className="flex gap-4 text-gray-500">
                <span className="material-symbols-outlined text-[22px] cursor-pointer hover:text-gray-700 transition-colors">search</span>
                <span className="material-symbols-outlined text-[22px] cursor-pointer hover:text-gray-700 transition-colors">more_vert</span>
              </div>
            </div>

            {/* WhatsApp Background Pattern */}
            <div className="absolute inset-0 opacity-40 mix-blend-multiply pointer-events-none z-0" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')" }}></div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-3 md:space-y-4 relative z-10 scrollbar-thin scrollbar-thumb-gray-300">
              <div className="flex justify-center mb-6">
                <span className="bg-[#e1f3fb] px-3 py-1.5 rounded-lg text-[12px] font-medium text-gray-600 shadow-sm">
                  HARI INI
                </span>
              </div>

              <AnimatePresence mode="wait">
                <motion.div 
                  key={activeChat.id}
                  
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-3 md:space-y-4"
                >
                  {activeChat.messages.map((msg: any, idx: number) => {
                    const isMe = msg.sender === "me";
                    return (
                      <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`relative max-w-[85%] md:max-w-[75%] px-3 py-2 md:px-4 md:py-2.5 rounded-lg shadow-sm ${isMe ? 'bg-[#d9fdd3] rounded-tr-none' : 'bg-white rounded-tl-none'}`}>
                          
                          {/* Triangle tail for chat bubbles */}
                          <div className={`absolute top-0 w-3 h-3 ${isMe ? '-right-2' : '-left-2'}`}>
                            <svg viewBox="0 0 8 13" width="8" height="13" className={`fill-current ${isMe ? 'text-[#d9fdd3]' : 'text-white'}`}>
                              {isMe 
                                ? <path d="M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z" />
                                : <path d="M1.533 3.568L8 12.193V1H2.812C1.042 1 .474 2.156 1.533 3.568z" />
                              }
                            </svg>
                          </div>

                          <p className="text-[14px] md:text-[15px] leading-relaxed text-[#111b21] break-words whitespace-pre-wrap">
                            {msg.text}
                          </p>
                          <div className="flex items-center justify-end gap-1 text-[11px] text-gray-500 mt-1 float-right clear-both ml-4">
                            {msg.time}
                            {isMe && <span className="material-symbols-outlined text-[15px] text-[#53bdeb] leading-none">done_all</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Chat Input Field */}
            <div className="bg-[#f0f2f5] px-4 py-3 flex items-center gap-4 shrink-0 z-20 h-[62px]">
              <span className="material-symbols-outlined text-[26px] text-gray-500 cursor-pointer hover:text-gray-700 transition-colors">mood</span>
              <span className="material-symbols-outlined text-[26px] text-gray-500 cursor-pointer hover:text-gray-700 transition-colors -rotate-45">attach_file</span>
              <div className="flex-1 bg-white rounded-lg px-4 py-2.5 text-[15px] text-gray-400 border border-white shadow-sm flex items-center cursor-text">
                Ketik pesan...
              </div>
              <span className="material-symbols-outlined text-[26px] text-gray-500 cursor-pointer hover:text-gray-700 transition-colors">mic</span>
            </div>
            
          </div>
        </div>
      </div>
    </section>
  );
}
