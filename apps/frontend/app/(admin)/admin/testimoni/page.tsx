"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, MoreVertical, Paperclip, Mic, Smile,
  Plus, CheckCheck, Trash2, X, Settings, User, Save, Edit3, MessageSquareQuote
} from "lucide-react";
import { AdminToast, AdminConfirmModal } from "@/components/admin/ui";

// Types
interface TestimonialMessage {
  id?: string;
  sender: 'me' | 'client';
  text: string;
  time: string;
}

interface Testimonial {
  id: string;
  name: string;
  role: string;
  initials: string;
  service: string;
  avatarBg: string;
  lastSeen: string;
  messages: TestimonialMessage[];
  status: "published" | "draft";
}

const AVATAR_COLORS = [
  { label: "Biru", value: "bg-blue-100 text-blue-600", hex: "#3b82f6" },
  { label: "Indigo", value: "bg-indigo-100 text-indigo-600", hex: "#6366f1" },
  { label: "Hijau", value: "bg-emerald-100 text-emerald-600", hex: "#10b981" },
  { label: "Merah Muda", value: "bg-rose-100 text-rose-600", hex: "#f43f5e" },
  { label: "Kuning", value: "bg-amber-100 text-amber-600", hex: "#f59e0b" },
  { label: "Ungu", value: "bg-purple-100 text-purple-600", hex: "#a855f7" },
];

export default function TestimonialWhatsAppAdmin() {
  const [isClient, setIsClient] = useState(false);
  const [items, setItems] = useState<Testimonial[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");
  
  // Chat Input State
  const [chatInput, setChatInput] = useState("");
  const [senderMode, setSenderMode] = useState<"me" | "client">("client");
  
  // Modals & Toasts
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [toast, setToast] = useState<{ isVisible: boolean; message: string; type: "success" | "error" }>({
    isVisible: false, message: "", type: "success"
  });
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; action: () => void; title: string; message: string; confirmText: string; confirmVariant: "danger" | "primary" | "warning" }>({
    isOpen: false, action: () => {}, title: "", message: "", confirmText: "", confirmVariant: "danger"
  });

  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem("revtech_testimonials");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setItems(parsed);
        if (parsed.length > 0) setActiveId(parsed[0].id);
      } catch (e) {
        console.error("Failed to parse testimonials");
      }
    }
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom when messages change
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [items, activeId]);

  const saveToStorage = (newItems: Testimonial[]) => {
    setItems(newItems);
    localStorage.setItem("revtech_testimonials", JSON.stringify(newItems));
    window.dispatchEvent(new Event("testimonials-updated"));
  };

  const handleCreateNew = () => {
    const newTestimonial: Testimonial = {
      id: `testimoni_${Date.now()}`,
      name: "Klien Baru",
      role: "Role / Perusahaan",
      initials: "K",
      service: "Layanan",
      avatarBg: "bg-blue-100 text-blue-600",
      lastSeen: "hari ini",
      status: "draft",
      messages: [],
    };
    const newItems = [newTestimonial, ...items];
    saveToStorage(newItems);
    setActiveId(newTestimonial.id);
    setShowSettingsModal(true);
  };

  const handleDeleteClient = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Hapus Testimoni?",
      message: "Seluruh riwayat obrolan dengan klien ini akan dihapus permanen.",
      confirmText: "Hapus",
      confirmVariant: "danger",
      action: () => {
        const newItems = items.filter(i => i.id !== id);
        saveToStorage(newItems);
        if (activeId === id) {
          setActiveId(newItems.length > 0 ? newItems[0].id : null);
        }
        setToast({ isVisible: true, message: "Testimoni dihapus", type: "success" });
      }
    });
  };

  const handleSendMessage = () => {
    if (!chatInput.trim() || !activeId) return;
    
    const newMessage: TestimonialMessage = {
      id: Date.now().toString(),
      sender: senderMode,
      text: chatInput.trim(),
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };

    const newItems = items.map(item => {
      if (item.id === activeId) {
        return { ...item, messages: [...item.messages, newMessage] };
      }
      return item;
    });

    saveToStorage(newItems);
    setChatInput("");
  };

  const handleDeleteMessage = (msgId: string) => {
    if (!activeId) return;
    const newItems = items.map(item => {
      if (item.id === activeId) {
        return { ...item, messages: item.messages.filter(m => m.id !== msgId) };
      }
      return item;
    });
    saveToStorage(newItems);
  };

  const handleUpdateActiveClient = (updates: Partial<Testimonial>) => {
    if (!activeId) return;
    
    // Auto initials
    if (updates.name && !updates.initials) {
      updates.initials = updates.name.charAt(0).toUpperCase();
    }

    const newItems = items.map(item => {
      if (item.id === activeId) return { ...item, ...updates };
      return item;
    });
    saveToStorage(newItems);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const activeItem = items.find(i => i.id === activeId);

  const filteredItems = items.filter(i => {
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase()) || i.role.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filter === "all" || i.status === filter;
    return matchSearch && matchStatus;
  });

  if (!isClient) return null;

  return (
    <div className="h-[calc(100vh-8rem)] min-h-[600px] w-full max-w-[1400px] mx-auto pb-4">
      
      {/* Header Info Halaman (Diluar UI WA) */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2 text-[var(--adm-text)]">
            <MessageSquareQuote size={20} className="text-[#00a884]" /> CMS Testimoni (WhatsApp Editor)
          </h1>
          <p className="text-sm text-[var(--adm-text-2)] mt-0.5">Kelola testimoni dengan pengalaman UI obrolan yang otentik.</p>
        </div>
      </div>

      {/* Kontainer WhatsApp */}
      <div className="w-full h-[calc(100%-4rem)] bg-white rounded-2xl shadow-xl border border-gray-200 flex overflow-hidden font-sans relative">
        
        {/* =========================================================================
            KOLOM KIRI: SIDEBAR CHAT LIST
            ========================================================================= */}
        <div className="w-1/3 min-w-[300px] max-w-[420px] bg-white border-r border-gray-200 flex flex-col h-full z-10 relative">
          
          {/* Header Kiri */}
          <div className="h-16 bg-[#f0f2f5] px-4 py-3 flex items-center justify-between shrink-0 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white overflow-hidden">
                <User size={24} className="text-gray-100" />
              </div>
              <span className="font-semibold text-[#111b21] hidden lg:block">Admin</span>
            </div>
            
            <div className="flex gap-4 text-[#54656f]">
              <button 
                onClick={handleCreateNew}
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors tooltip-trigger relative group"
                title="Klien Baru"
              >
                <Plus size={22} />
              </button>
              <button 
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors group relative"
                title="Filter Status"
              >
                <MoreVertical size={22} />
                <div className="absolute top-10 right-0 w-36 bg-white shadow-lg rounded-lg border border-gray-100 py-1 hidden group-hover:block z-50">
                  <div className="px-4 py-2 text-xs text-gray-500 font-bold uppercase">Filter</div>
                  {["all", "published", "draft"].map(f => (
                    <div 
                      key={f} 
                      onClick={() => setFilter(f as any)}
                      className={`px-4 py-2 text-sm cursor-pointer hover:bg-[#f0f2f5] ${filter === f ? 'text-[#00a884] font-semibold' : 'text-[#111b21]'}`}
                    >
                      {f === "all" ? "Semua Chat" : f === "published" ? "Diterbitkan" : "Draft"}
                    </div>
                  ))}
                </div>
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="p-2 bg-white border-b border-gray-200 shrink-0">
            <div className="bg-[#f0f2f5] h-9 rounded-lg flex items-center px-4 gap-4 focus-within:bg-white focus-within:shadow-sm focus-within:border focus-within:border-gray-200 transition-all">
              <Search size={18} className="text-[#54656f]" />
              <input 
                type="text" 
                placeholder="Cari atau mulai chat" 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-transparent border-none focus:outline-none text-sm text-[#111b21] placeholder-[#54656f]" 
              />
            </div>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto bg-white custom-scrollbar">
            {filteredItems.map(item => {
              const lastMsg = item.messages[item.messages.length - 1];
              const isActive = activeId === item.id;
              
              return (
                <div 
                  key={item.id}
                  onClick={() => setActiveId(item.id)}
                  className={`flex items-center gap-3 p-3 cursor-pointer transition-colors relative group ${isActive ? 'bg-[#f0f2f5]' : 'hover:bg-[#f5f6f6]'}`}
                >
                  <div className={`w-12 h-12 rounded-full shrink-0 flex items-center justify-center font-bold text-lg ${item.avatarBg}`}>
                    {item.initials}
                  </div>
                  
                  <div className={`flex-1 min-w-0 pb-3 pt-1 border-b ${isActive ? 'border-transparent' : 'border-gray-100'}`}>
                    <div className="flex justify-between items-baseline mb-1">
                      <h4 className="font-semibold text-[16px] text-[#111b21] truncate pr-2">{item.name}</h4>
                      <span className="text-[11px] text-[#667781] shrink-0">{lastMsg?.time || ''}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 min-w-0 flex-1">
                        {lastMsg?.sender === "me" && <CheckCheck size={16} className="text-[#53bdeb]" />}
                        <p className="text-[13px] text-[#667781] truncate">{lastMsg?.text || <span className="italic">Belum ada obrolan</span>}</p>
                      </div>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ml-2 ${
                        item.status === 'published' ? 'bg-[#d9fdd3] text-[#059669]' : 'bg-[#fff3c4] text-[#d97706]'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                  
                  {/* Delete Button (Hover) */}
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeleteClient(item.id); }}
                      className="p-1.5 rounded-full bg-white shadow-md border border-gray-200 text-red-500 hover:bg-red-50"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
            
            {filteredItems.length === 0 && (
              <div className="p-8 text-center text-sm text-[#667781]">
                Tidak ada chat yang sesuai dengan filter.
              </div>
            )}
          </div>
        </div>

        {/* =========================================================================
            KOLOM KANAN: CHAT WINDOW & EDITOR
            ========================================================================= */}
        {activeItem ? (
          <div className="flex-1 flex flex-col bg-[#efeae2] relative h-full">
            
            {/* Header Kanan */}
            <div className="h-16 bg-[#f0f2f5] px-4 flex items-center justify-between border-b border-gray-200 shrink-0 z-20 shadow-sm relative">
              <div 
                className="flex items-center gap-4 cursor-pointer hover:bg-black/5 p-1 -ml-1 rounded-lg transition-colors flex-1"
                onClick={() => setShowSettingsModal(true)}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${activeItem.avatarBg}`}>
                  {activeItem.initials}
                </div>
                <div>
                  <h4 className="font-semibold text-[15px] text-[#111b21] leading-tight flex items-center gap-2">
                    {activeItem.name} <Edit3 size={12} className="text-gray-400" />
                  </h4>
                  <p className="text-[12px] text-[#667781] truncate">{activeItem.role} • {activeItem.service}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 ml-4">
                <span className="text-xs font-semibold text-gray-500 mr-2 uppercase tracking-wide">Status:</span>
                <select
                  value={activeItem.status}
                  onChange={e => handleUpdateActiveClient({ status: e.target.value as any })}
                  className={`text-xs font-bold rounded-lg px-3 py-1.5 focus:outline-none appearance-none cursor-pointer border-0
                    ${activeItem.status === 'published' ? 'bg-[#d9fdd3] text-[#059669]' : 'bg-[#fff3c4] text-[#d97706]'}
                  `}
                >
                  <option value="draft">DRAFT</option>
                  <option value="published">PUBLISHED</option>
                </select>
                <button 
                  onClick={() => setShowSettingsModal(true)}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-[#54656f] hover:bg-gray-200 transition-colors ml-1"
                  title="Pengaturan Klien"
                >
                  <Settings size={20} />
                </button>
              </div>
            </div>

            {/* WA Background Pattern */}
            <div className="absolute inset-0 opacity-40 mix-blend-multiply pointer-events-none z-0" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')" }}></div>

            {/* Area Chat Bubbles */}
            <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 lg:p-8 relative z-10 scrollbar-thin scrollbar-thumb-[#cfd1d2] scrollbar-track-transparent">
              <div className="flex justify-center mb-6">
                <span className="bg-[#e1f3fb] px-3 py-1.5 rounded-lg text-[12px] font-medium text-[#54656f] shadow-sm uppercase">
                  Simulasi Tampilan Publik
                </span>
              </div>

              <AnimatePresence>
                <div className="space-y-2 lg:space-y-4 max-w-4xl mx-auto">
                  {activeItem.messages.map((msg, idx) => {
                    const isMe = msg.sender === 'me';
                    return (
                      <motion.div 
                        key={msg.id || idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'} group relative`}
                      >
                        <div className={`relative max-w-[85%] lg:max-w-[70%] px-3 py-2 rounded-lg shadow-[0_1px_0.5px_rgba(11,20,26,0.13)]
                          ${isMe ? 'bg-[#d9fdd3] rounded-tr-none' : 'bg-white rounded-tl-none'}
                        `}>
                          
                          {/* Triangle tail */}
                          <div className={`absolute top-0 w-3 h-3 ${isMe ? '-right-2' : '-left-2'}`}>
                            <svg viewBox="0 0 8 13" width="8" height="13" className={`fill-current ${isMe ? 'text-[#d9fdd3]' : 'text-white'}`}>
                              {isMe 
                                ? <path d="M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z" />
                                : <path d="M1.533 3.568L8 12.193V1H2.812C1.042 1 .474 2.156 1.533 3.568z" />
                              }
                            </svg>
                          </div>

                          {/* Delete bubble button (Admin only) */}
                          <button 
                            onClick={() => handleDeleteMessage(msg.id!)}
                            className={`absolute top-1 ${isMe ? '-left-8' : '-right-8'} w-6 h-6 rounded-full bg-red-100 text-red-500 items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex`}
                            title="Hapus pesan"
                          >
                            <X size={14} />
                          </button>

                          <p className="text-[14px] lg:text-[15px] leading-relaxed text-[#111b21] whitespace-pre-wrap outline-none pr-16" 
                             contentEditable 
                             suppressContentEditableWarning
                             onBlur={(e) => {
                               const newItems = items.map(item => {
                                 if (item.id === activeItem.id) {
                                   const newMsgs = [...item.messages];
                                   newMsgs[idx].text = e.currentTarget.textContent || '';
                                   return { ...item, messages: newMsgs };
                                 }
                                 return item;
                               });
                               saveToStorage(newItems);
                             }}>
                            {msg.text}
                          </p>
                          <div className="flex items-center gap-1 text-[11px] text-[#667781] absolute bottom-1.5 right-2">
                            {msg.time}
                            {isMe && <CheckCheck size={14} className="text-[#53bdeb]" />}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </AnimatePresence>
            </div>

            {/* Input Chat Bawah */}
            <div className="bg-[#f0f2f5] px-4 py-3 flex items-center gap-3 shrink-0 z-20">
              {/* Sender Toggle */}
              <div 
                onClick={() => setSenderMode(prev => prev === 'me' ? 'client' : 'me')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors shadow-sm font-semibold text-xs border
                  ${senderMode === 'me' ? 'bg-[#d9fdd3] text-[#059669] border-[#c0f5b8]' : 'bg-white text-[#111b21] border-gray-200'}
                `}
                title="Klik untuk ganti pengirim"
              >
                {senderMode === 'me' ? 'Tim RevTech (Kanan)' : 'Klien (Kiri)'}
              </div>

              <Smile size={24} className="text-[#54656f] hidden sm:block" />
              
              <div className="flex-1 bg-white rounded-lg flex items-center shadow-sm">
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ketik pesan testimoni di sini..."
                  className="w-full h-10 px-4 rounded-lg border-none focus:outline-none text-[15px] text-[#111b21]"
                />
              </div>

              {chatInput.trim() ? (
                <button onClick={handleSendMessage} className="w-10 h-10 rounded-full bg-[#00a884] flex items-center justify-center text-white hover:bg-[#008f6f] shadow-md transition-colors shrink-0">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
                  </svg>
                </button>
              ) : (
                <Mic size={24} className="text-[#54656f] shrink-0" />
              )}
            </div>
            
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-[#f0f2f5] relative h-full text-center p-8 z-10 border-b-8 border-[#25D366]">
            <img src="https://static.whatsapp.net/rsrc.php/v3/y6/r/wa66cgO032z.png" alt="WhatsApp Web" className="w-[320px] mb-8" />
            <h2 className="text-3xl font-light text-[#41525d] mb-4">RevTech WhatsApp Editor</h2>
            <p className="text-sm text-[#667781] max-w-md">
              Pilih klien dari menu sebelah kiri atau klik tombol tambah <strong>[+]</strong> untuk membuat obrolan testimoni baru. Pesan yang di-set PUBLISHED akan langsung tampil di landing page.
            </p>
          </div>
        )}

      </div>

      {/* =========================================================================
          MODAL PENGATURAN KLIEN
          ========================================================================= */}
      <AnimatePresence>
        {showSettingsModal && activeItem && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowSettingsModal(false)}
              className="absolute inset-0 bg-black/20"
            />
            <motion.div 
              initial={{ x: 400 }} animate={{ x: 0 }} exit={{ x: 400 }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col z-10"
            >
              <div className="h-16 bg-[#008069] flex items-center px-4 gap-4 text-white shrink-0">
                <button onClick={() => setShowSettingsModal(false)}><X size={24} /></button>
                <h2 className="font-medium text-lg">Info Klien</h2>
              </div>
              
              <div className="flex-1 overflow-y-auto bg-[#f0f2f5]">
                {/* Profile Picture Config */}
                <div className="bg-white p-6 flex flex-col items-center justify-center shadow-sm mb-2">
                  <div className={`w-32 h-32 rounded-full flex items-center justify-center font-bold text-5xl mb-6 shadow-sm border-2 border-white ${activeItem.avatarBg}`}>
                    {activeItem.initials}
                  </div>
                  
                  <div className="w-full">
                    <label className="text-[12px] font-bold text-[#008069] mb-1 block">NAMA KLIEN</label>
                    <input 
                      type="text" 
                      value={activeItem.name} 
                      onChange={e => handleUpdateActiveClient({ name: e.target.value })}
                      className="w-full border-b-2 border-gray-200 focus:border-[#008069] py-1 text-base text-[#111b21] bg-transparent outline-none transition-colors" 
                    />
                  </div>
                </div>

                {/* Additional Info */}
                <div className="bg-white px-6 py-4 shadow-sm mb-2 space-y-5">
                  <div>
                    <label className="text-[12px] font-bold text-gray-500 mb-1 block">PERUSAHAAN / ROLE</label>
                    <input 
                      type="text" 
                      value={activeItem.role} 
                      onChange={e => handleUpdateActiveClient({ role: e.target.value })}
                      className="w-full border-b border-gray-200 focus:border-[#008069] py-1 text-sm text-[#111b21] bg-transparent outline-none transition-colors" 
                    />
                  </div>
                  <div>
                    <label className="text-[12px] font-bold text-gray-500 mb-1 block">LAYANAN / SERVICE TAG</label>
                    <input 
                      type="text" 
                      value={activeItem.service} 
                      onChange={e => handleUpdateActiveClient({ service: e.target.value })}
                      className="w-full border-b border-gray-200 focus:border-[#008069] py-1 text-sm text-[#111b21] bg-transparent outline-none transition-colors" 
                    />
                  </div>
                  <div>
                    <label className="text-[12px] font-bold text-gray-500 mb-1 block">INISIAL (MAX 2 HURUF)</label>
                    <input 
                      type="text" 
                      maxLength={2}
                      value={activeItem.initials} 
                      onChange={e => handleUpdateActiveClient({ initials: e.target.value.toUpperCase() })}
                      className="w-full border-b border-gray-200 focus:border-[#008069] py-1 text-sm text-[#111b21] bg-transparent outline-none transition-colors" 
                    />
                  </div>
                  <div>
                    <label className="text-[12px] font-bold text-gray-500 mb-1 block">TERAKHIR DILIHAT (LAST SEEN)</label>
                    <input 
                      type="text" 
                      value={activeItem.lastSeen} 
                      onChange={e => handleUpdateActiveClient({ lastSeen: e.target.value })}
                      placeholder="Contoh: hari ini pukul 10:45"
                      className="w-full border-b border-gray-200 focus:border-[#008069] py-1 text-sm text-[#111b21] bg-transparent outline-none transition-colors" 
                    />
                  </div>
                </div>

                {/* Avatar Colors */}
                <div className="bg-white px-6 py-4 shadow-sm mb-4">
                  <label className="text-[12px] font-bold text-gray-500 mb-3 block">WARNA AVATAR</label>
                  <div className="flex flex-wrap gap-4">
                    {AVATAR_COLORS.map(color => (
                      <button
                        key={color.value}
                        onClick={() => handleUpdateActiveClient({ avatarBg: color.value })}
                        className={`w-8 h-8 rounded-full border-2 transition-transform ${activeItem.avatarBg === color.value ? 'scale-125 border-[#008069] shadow-sm' : 'border-transparent opacity-50 hover:opacity-100'}`}
                        style={{ backgroundColor: color.hex }}
                        title={color.label}
                      />
                    ))}
                  </div>
                </div>

                <div className="p-4">
                  <button 
                    onClick={() => handleDeleteClient(activeItem.id)}
                    className="w-full py-3 bg-white rounded-lg text-red-500 font-semibold shadow-sm flex items-center justify-center gap-2 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={18} /> Hapus Testimoni Ini
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AdminConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        confirmVariant={confirmModal.confirmVariant}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={() => { confirmModal.action(); setConfirmModal(prev => ({ ...prev, isOpen: false })); }}
      />
      <AdminToast
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />
    </div>
  );
}
