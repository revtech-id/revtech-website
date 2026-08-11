"use client";

import { useAdminTheme } from "@/app/(admin)/layout";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, MoreVertical, Paperclip, Mic, Smile,
  Plus, CheckCheck, Trash2, X, Settings, User, Save, Edit3, Star, Check, Archive, ChevronDown
} from "lucide-react";
import { AdminToast, AdminConfirmModal } from "@/components/admin/ui";
import { logActivity } from "@/lib/activityLog";

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
  status: "published" | "draft" | "archived";
  starred?: boolean;
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
  const { dark } = useAdminTheme();
  const [isClient, setIsClient] = useState(false);
  const [items, setItems] = useState<Testimonial[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "published" | "draft" | "starred" | "archived">("all");
  const [menuOpen, setMenuOpen] = useState(false);
  const [filterDropOpen, setFilterDropOpen] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [chatMenuOpen, setChatMenuOpen] = useState(false);
  
  // Chat Input State
  const [chatInput, setChatInput] = useState("");
  const [senderMode, setSenderMode] = useState<"me" | "client">("client");
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);

  // Modals & Toasts
  const [draftClient, setDraftClient] = useState<Testimonial | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [toast, setToast] = useState<{ isVisible: boolean; message: string; type: "success" | "error" }>({
    isVisible: false, message: "", type: "success"
  });
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; action: () => void; title: string; message: string; confirmText: string; confirmVariant: "danger" | "primary" | "warning"; icon?: React.ReactNode }>({
    isOpen: false, action: () => {}, title: "", message: "", confirmText: "", confirmVariant: "danger"
  });

  const chatScrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + 'px';
    }
  }, [chatInput]);

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

  const getColorFromName = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % AVATAR_COLORS.length;
    return AVATAR_COLORS[index].value;
  };

  const handleCreateNew = () => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const newTestimonial: Testimonial = {
      id: Date.now().toString(),
      name: "",
      role: "",
      initials: "",
      service: "",
      avatarBg: "bg-gray-200 text-gray-500",
      lastSeen: `hari ini pukul ${timeStr}`,
      status: "draft",
      messages: [],
    };
    setDraftClient(newTestimonial);
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
    
    if (editingMessageId) {
      const newItems = items.map(item => {
        if (item.id === activeId) {
          return {
            ...item,
            messages: item.messages.map(m => m.id === editingMessageId ? { ...m, text: chatInput.trim() } : m)
          };
        }
        return item;
      });
      saveToStorage(newItems);
      setEditingMessageId(null);
      setChatInput("");
      setToast({ isVisible: true, message: "Pesan berhasil diubah", type: "success" });
      logActivity({ type: "testimonial_updated", title: "Pesan Testimoni Diedit", description: `Pesan klien diedit di Testimoni ID: ${activeId}`, user: "Admin" });
      return;
    }

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
    logActivity({ type: "testimonial_updated", title: "Pesan Baru Testimoni", description: `Pesan baru ditambahkan di Testimoni ID: ${activeId}`, user: "Admin" });
  };

  const handleDeleteMessage = (msgId: string) => {
    if (!activeId) return;
    setConfirmModal({
      isOpen: true,
      title: "Konfirmasi Hapus Pesan",
      message: "Apakah Anda yakin ingin menghapus pesan ini? Tindakan ini tidak dapat dibatalkan.",
      confirmText: "Hapus",
      confirmVariant: "danger",
      icon: <Trash2 size={20} />,
      action: () => {
        const newItems = items.map(item => {
          if (item.id === activeId) {
            return { ...item, messages: item.messages.filter(m => m.id !== msgId) };
          }
          return item;
        });
        saveToStorage(newItems);
        setToast({ isVisible: true, message: "Pesan berhasil dihapus", type: "success" });
        logActivity({ type: "testimonial_deleted", title: "Pesan Testimoni Dihapus", description: `Satu pesan dihapus dari Testimoni ID: ${activeId}`, user: "Admin" });
      }
    });
  };

  const handleUpdateDraft = (updates: Partial<Testimonial>) => {
    if (!draftClient) return;
    
    let newInitials = draftClient.initials;
    let newAvatarBg = draftClient.avatarBg;

    if (updates.name !== undefined) {
      let cleanName = updates.name.replace(/\([^)]*(?:\)|$)/g, '');
      cleanName = cleanName.replace(/[^a-zA-Z\s]/g, '').trim();
      
      const words = cleanName.split(/\s+/).filter(Boolean);
      if (words.length >= 2) {
        newInitials = (words[0][0] + words[1][0]).toUpperCase();
      } else if (words.length === 1) {
        newInitials = words[0][0].toUpperCase();
      } else {
        newInitials = "";
      }
      if (updates.avatarBg === undefined) {
        newAvatarBg = updates.name && updates.name.trim() ? getColorFromName(updates.name) : "bg-gray-200 text-gray-500";
      }
    }

    setDraftClient({ ...draftClient, ...updates, initials: newInitials, avatarBg: newAvatarBg });
  };

  const handleSaveDraft = () => {
    if (!draftClient) return;
    
    const isExisting = items.some(i => i.id === draftClient.id);
    const nameToSave = draftClient.name.trim() === "" ? "Klien Tanpa Nama" : draftClient.name;
    const finalClient = { ...draftClient, name: nameToSave };
    
    let newItems;
    if (isExisting) {
      newItems = items.map(i => i.id === finalClient.id ? finalClient : i);
    } else {
      newItems = [finalClient, ...items];
      setActiveId(finalClient.id);
    }
    saveToStorage(newItems);
    setDraftClient(null);
    setToast({ 
      isVisible: true, 
      message: isExisting ? "Perubahan data klien berhasil disimpan" : "Klien baru berhasil ditambahkan", 
      type: "success" 
    });
    logActivity({ 
      type: "testimonial_updated", 
      title: isExisting ? "Data Klien Testimoni Diedit" : "Klien Testimoni Baru", 
      description: isExisting ? `Profil klien diperbarui untuk ${finalClient.name}` : `Klien baru ditambahkan: ${finalClient.name}`, 
      user: "Admin" 
    });
  };
    
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const activeItem = items.find(i => i.id === activeId);

  const filteredItems = items.filter(i => {
    if (filter === "published") return i.status === "published";
    if (filter === "draft") return i.status === "draft";
    if (filter === "archived") return i.status === "archived";
    if (filter === "starred") return i.starred === true;
    if (filter === "all") return i.status !== "archived";
    return true;
  }).filter(i => i.name.toLowerCase().includes(search.toLowerCase()) || i.messages.some(m => m.text.toLowerCase().includes(search.toLowerCase())))
  .sort((a, b) => {
    if (a.starred && !b.starred) return -1;
    if (!a.starred && b.starred) return 1;
    return 0;
  });

  const toggleArchive = (id: string) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    const newStatus = item.status === "archived" ? "draft" : "archived";
    const newItems = items.map(i => i.id === id ? { ...i, status: newStatus } : i);
    saveToStorage(newItems);
    setToast({ isVisible: true, message: newStatus === "archived" ? "Chat diarsipkan" : "Chat dipulihkan ke Draft", type: "success" });
    if (activeId === id && newStatus === "archived") setActiveId(null);
  };

  const toggleStar = (id: string) => {
    const newItems = items.map(i => i.id === id ? { ...i, starred: !i.starred } : i);
    saveToStorage(newItems);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const deleteSelected = () => {
    setConfirmModal({
      isOpen: true,
      title: `Hapus ${selectedIds.size} Testimoni?`,
      message: "Seluruh obrolan yang dipilih akan dihapus permanen.",
      confirmText: "Hapus",
      confirmVariant: "danger",
      action: () => {
        const newItems = items.filter(i => !selectedIds.has(i.id));
        saveToStorage(newItems);
        if (activeId && selectedIds.has(activeId)) setActiveId(newItems[0]?.id ?? null);
        setSelectedIds(new Set());
        setSelectMode(false);
        setToast({ isVisible: true, message: "Testimoni terpilih dihapus", type: "success" });
      }
    });
  };

  if (!isClient) return null;

  return (
    <div className="h-[calc(100vh-8rem)] min-h-[600px] w-full max-w-[1400px] mx-auto pb-4">
      
      {/* Kontainer WhatsApp */}
      <div className={`w-full h-[calc(100%-4rem)] rounded-2xl shadow-xl border flex overflow-hidden font-sans relative ${dark ? 'bg-[#111b21] border-[#222e35]' : 'bg-white border-gray-200'}`}>
        
        {/* =========================================================================
            KOLOM KIRI: SIDEBAR CHAT LIST
            ========================================================================= */}
        <div className={`w-1/3 min-w-[300px] max-w-[420px] border-r flex flex-col h-full z-10 relative ${dark ? 'bg-[#111b21] border-[#222e35]' : 'bg-white border-gray-200'}`}>
          
          {/* Header Kiri */}
          <div className={`h-16 px-4 py-3 flex items-center justify-between shrink-0 border-b ${dark ? 'bg-[#202c33] border-[#222e35]' : 'bg-[#f0f2f5] border-gray-200'}`}>
            {selectMode ? (
              <div className="flex items-center gap-3 flex-1">
                <button onClick={() => { setSelectMode(false); setSelectedIds(new Set()); }} className="text-[#00a884] text-sm font-semibold">Batal</button>
                <span className={`text-sm font-semibold ${dark ? 'text-[#e9edef]' : 'text-[#111b21]'}`}>{selectedIds.size} dipilih</span>
                {selectedIds.size > 0 && (
                  <button onClick={deleteSelected} className="ml-auto p-1.5 rounded-full text-red-500 hover:bg-red-50">
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ) : (
              <>
                <div></div>
                <div className={`flex gap-1 ${dark ? 'text-[#aebac1]' : 'text-[#54656f]'}`}>
                  <button
                    onClick={handleCreateNew}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${dark ? 'hover:bg-[#2a3942]' : 'hover:bg-gray-200'}`}
                    title="Klien Baru"
                  >
                    <Plus size={22} />
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Search Bar + Filter Tabs */}
          <div className={`border-b shrink-0 ${dark ? 'bg-[#111b21] border-[#222e35]' : 'bg-white border-gray-200'}`}>
            <div className="p-2">
              <div className={`h-9 rounded-lg flex items-center px-4 gap-4 border border-transparent focus-within:shadow-sm transition-all ${dark ? 'bg-[#202c33] focus-within:bg-[#111b21] focus-within:border-[#222e35]' : 'bg-[#f0f2f5] focus-within:bg-white focus-within:border-gray-200'}`}>
                <Search size={18} className={dark ? "text-[#aebac1]" : "text-[#54656f]"} />
                <input
                  type="text"
                  placeholder="Cari atau mulai chat"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className={`w-full bg-transparent border-none focus:outline-none text-sm ${dark ? 'text-[#e9edef] placeholder-[#aebac1]' : 'text-[#111b21] placeholder-[#54656f]'}`}
                />
              </div>
            </div>
            {/* WA-style pill filter tabs */}
            <div className="flex gap-2 px-3 pb-2 items-center">
              {(["all", "published", "draft"] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[13px] font-semibold whitespace-nowrap transition-all border ${
                    filter === f
                      ? (dark ? "bg-[#0a332c] text-[#00a884] border-[#00a884]/20" : "bg-[#d9fdd3] text-[#059669] border-[#059669]/20")
                      : (dark ? "bg-[#202c33] text-[#aebac1] border-transparent hover:bg-[#2a3942]" : "bg-[#f0f2f5] text-[#54656f] border-transparent hover:bg-gray-200")
                  }`}
                >
                  {f === "all" ? "Semua" : f === "published" ? "Diterbitkan" : "Draft"}
                </button>
              ))}

              {/* Chevron dropdown for Favorit & Arsip */}
              <div className="relative ml-auto shrink-0">
                <button
                  onClick={() => setFilterDropOpen(p => !p)}
                  className={`flex items-center justify-center w-7 h-7 rounded-full transition-all border ${
                    filter === "starred" || filter === "archived"
                      ? (dark ? "bg-[#0a332c] text-[#00a884] border-[#00a884]/20" : "bg-[#d9fdd3] text-[#059669] border-[#059669]/20")
                      : (dark ? "bg-[#202c33] text-[#aebac1] border-transparent hover:bg-[#2a3942]" : "bg-[#f0f2f5] text-[#54656f] border-transparent hover:bg-gray-200")
                  }`}
                >
                  <ChevronDown size={14} className={filterDropOpen ? "rotate-180 transition-transform" : "transition-transform"} />
                </button>
                {filterDropOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setFilterDropOpen(false)} />
                    <div className={`absolute top-9 right-0 w-44 shadow-xl rounded-xl border py-1 z-50 overflow-hidden ${dark ? 'bg-[#1f2c34] border-gray-700' : 'bg-white border-gray-100'}`}>
                      <button
                        onClick={() => { setFilter(f => f === "starred" ? "all" : "starred"); setFilterDropOpen(false); }}
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                          dark ? 'hover:bg-[#2a3942]' : 'hover:bg-gray-50'
                        } ${
                          filter === "starred" 
                            ? (dark ? "text-[#00a884] font-semibold" : "text-[#059669] font-semibold") 
                            : (dark ? "text-[#e9edef]" : "text-[#111b21]")
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Star size={16} className={filter === "starred" ? "fill-amber-400 text-amber-400" : (dark ? "text-[#8696a0]" : "text-[#54656f]")} />
                          Favorit
                        </div>
                        {filter === "starred" && <Check size={14} className={dark ? "text-[#00a884]" : "text-[#059669]"} />}
                      </button>
                      <button
                        onClick={() => { setFilter(f => f === "archived" ? "all" : "archived"); setFilterDropOpen(false); }}
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                          dark ? 'hover:bg-[#2a3942]' : 'hover:bg-gray-50'
                        } ${
                          filter === "archived" 
                            ? (dark ? "text-[#00a884] font-semibold" : "text-[#059669] font-semibold") 
                            : (dark ? "text-[#e9edef]" : "text-[#111b21]")
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Archive size={16} className={filter === "archived" ? "text-blue-500" : (dark ? "text-[#8696a0]" : "text-[#54656f]")} />
                          Arsip
                        </div>
                        {filter === "archived" && <Check size={14} className={dark ? "text-[#00a884]" : "text-[#059669]"} />}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Chat List */}
          <div className={`flex-1 overflow-y-auto custom-scrollbar ${dark ? 'bg-[#111b21]' : 'bg-white'}`}>
            {filteredItems.map(item => {
              const lastMsg = item.messages[item.messages.length - 1];
              const isActive = activeId === item.id;
              
              return (
                <div 
                  key={item.id}
                  onClick={() => setActiveId(item.id)}
                  className={`flex items-center gap-3 p-3 cursor-pointer transition-colors relative group ${isActive ? (dark ? 'bg-[#2a3942]' : 'bg-[#f0f2f5]') : (dark ? 'hover:bg-[#202c33]' : 'hover:bg-[#f5f6f6]')}`}
                >
                  <div className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-lg shadow-sm border border-white transition-colors duration-300 ${item.status === 'draft' ? 'bg-gray-200 text-gray-500' : item.avatarBg}`}>
                    {item.initials || <User size={22} strokeWidth={2.5} />}
                  </div>
                  
                  <div className={`flex-1 min-w-0 pb-3 pt-1 border-b ${isActive ? 'border-transparent' : (dark ? 'border-[#222e35]' : 'border-gray-100')} ${item.status === 'draft' ? 'opacity-60 grayscale' : ''}`}>
                    <div className="flex justify-between items-baseline mb-1">
                      <div className="flex items-center gap-1 min-w-0">
                        <h4 className={`font-semibold text-[16px] truncate pr-2 ${dark ? 'text-[#e9edef]' : 'text-[#111b21]'}`}>
                          {item.name}
                        </h4>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {item.starred && <Star size={12} className={dark ? "text-[#8696a0]" : "text-[#667781]"} fill="currentColor" />}
                        <span className={`text-[11px] ${dark ? 'text-[#8696a0]' : 'text-[#667781]'}`}>{lastMsg?.time || ''}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 min-w-0 flex-1">
                        {lastMsg?.sender === "me" && <span className="material-symbols-outlined text-[15px] text-[#53bdeb] leading-none">done_all</span>}
                        <p className={`text-[13px] truncate ${dark ? 'text-[#8696a0]' : 'text-[#667781]'}`}>{lastMsg?.text || <span className="italic">Belum ada obrolan</span>}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Select Mode Checkbox */}
                  {selectMode && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleSelect(item.id); }}
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                          selectedIds.has(item.id) 
                            ? 'bg-[#00a884] border-[#00a884]' 
                            : (dark ? 'bg-[#111b21] border-[#8696a0]' : 'bg-white border-gray-300')
                        }`}
                      >
                        {selectedIds.has(item.id) && <Check size={11} className="text-white" />}
                      </button>
                    </div>
                  )}
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
          <div className={`flex-1 flex flex-col relative h-full ${dark ? 'bg-[#0b141a]' : 'bg-[#efeae2]'}`}>
            
            {/* Header Kanan */}
            <div className={`h-16 px-4 flex items-center justify-between border-b shrink-0 z-20 shadow-sm relative ${dark ? 'bg-[#202c33] border-[#222e35]' : 'bg-[#f0f2f5] border-gray-200'}`}>
              <div 
                className="flex items-center gap-4 cursor-pointer hover:bg-black/5 p-1 -ml-1 rounded-lg transition-colors flex-1"
                onClick={() => setDraftClient({ ...activeItem })}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 ${activeItem.avatarBg}`}>
                  {activeItem.initials || <User size={18} strokeWidth={2.5} />}
                </div>
                <div>
                  <h4 className={`font-semibold text-[15px] leading-tight flex items-center gap-2 ${dark ? 'text-[#e9edef]' : 'text-[#111b21]'}`}>
                    {activeItem.name} <Edit3 size={12} className="text-gray-400" />
                  </h4>
                  <p className={`text-[12px] truncate ${dark ? 'text-[#8696a0]' : 'text-[#667781]'}`}>terakhir dilihat {activeItem.lastSeen}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 ml-4">
                <span className="text-xs font-semibold text-gray-500 mr-2 uppercase tracking-wide">Status:</span>
                <select
                  value={activeItem.status}
                  onChange={e => {
                    const newStatus = e.target.value as any;
                    setConfirmModal({
                      isOpen: true,
                      title: "Konfirmasi Perubahan Status",
                      message: `Apakah Anda yakin ingin mengubah status chat ini menjadi ${newStatus.toUpperCase()}?`,
                      confirmText: "Ubah Status",
                      confirmVariant: "primary",
                      icon: <Check size={20} />,
                      action: () => {
                        const newItems = items.map(item => item.id === activeId ? { ...item, status: newStatus } : item);
                        saveToStorage(newItems);
                        setToast({ isVisible: true, message: `Status diubah menjadi ${newStatus.toUpperCase()}`, type: "success" });
                        logActivity({ type: "testimonial_updated", title: "Status Testimoni Diubah", description: `Status testimoni klien diubah menjadi ${newStatus.toUpperCase()}`, user: "Admin" });
                      }
                    });
                  }}
                  className={`text-xs font-bold rounded-lg px-3 py-1.5 focus:outline-none appearance-none cursor-pointer border-0
                    ${activeItem.status === 'published' ? (dark ? 'bg-[#005c4b] text-[#d9fdd3]' : 'bg-[#d9fdd3] text-[#059669]') 
                      : activeItem.status === 'archived' ? (dark ? 'bg-[#2a3942] text-[#8696a0]' : 'bg-gray-200 text-gray-600') 
                      : (dark ? 'bg-[#5c4b00] text-[#fff3c4]' : 'bg-[#fff3c4] text-[#d97706]')}
                  `}
                >
                  <option value="draft" className={dark ? "bg-[#202c33] text-white" : "bg-white text-black"}>DRAFT</option>
                  <option value="published" className={dark ? "bg-[#202c33] text-white" : "bg-white text-black"}>PUBLISHED</option>
                  <option value="archived" className={dark ? "bg-[#202c33] text-white" : "bg-white text-black"}>ARSIP</option>
                </select>
                <div className="relative">
                  <button 
                    onClick={() => setChatMenuOpen(!chatMenuOpen)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ml-1 ${dark ? 'text-[#aebac1] hover:bg-[#2a3942]' : 'text-[#54656f] hover:bg-gray-200'}`}
                    title="Menu"
                  >
                    <MoreVertical size={20} />
                  </button>
                  
                  <AnimatePresence>
                    {chatMenuOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setChatMenuOpen(false)} />
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          className={`absolute right-0 top-12 w-48 rounded-lg shadow-xl border py-2 z-50 ${dark ? 'bg-[#2a3942] border-[#222e35]' : 'bg-white border-gray-100'}`}
                        >
                          <button 
                            onClick={() => {
                              const newItems = items.map(i => i.id === activeId ? { ...i, starred: !i.starred } : i);
                              saveToStorage(newItems);
                              setChatMenuOpen(false);
                              setToast({ isVisible: true, message: activeItem.starred ? "Bintang dihapus" : "Pesan dibintangi", type: "success" });
                              logActivity({ type: "testimonial_updated", title: activeItem.starred ? "Bintang Testimoni Dihapus" : "Testimoni Dibintangi", description: `Status bintang diperbarui untuk klien ${activeItem.name}`, user: "Admin" });
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${dark ? 'text-[#e9edef] hover:bg-[#202c33]' : 'text-[#111b21] hover:bg-gray-50'}`}
                          >
                            <Star size={16} className={activeItem.starred ? "text-yellow-500 fill-current" : (dark ? "text-[#8696a0]" : "text-[#54656f]")} />
                            {activeItem.starred ? "Hapus Bintang" : "Bintangi Pesan"}
                          </button>
                          
                          <button 
                            onClick={() => {
                              const newItems = items.map(i => i.id === activeId ? { ...i, status: 'archived' as any } : i);
                              saveToStorage(newItems);
                              setChatMenuOpen(false);
                              setToast({ isVisible: true, message: "Chat diarsipkan", type: "success" });
                              logActivity({ type: "testimonial_updated", title: "Testimoni Diarsipkan", description: `Testimoni klien ${activeItem.name} dipindahkan ke arsip`, user: "Admin" });
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${dark ? 'text-[#e9edef] hover:bg-[#202c33]' : 'text-[#111b21] hover:bg-gray-50'}`}
                          >
                            <Archive size={16} className={dark ? "text-[#8696a0]" : "text-[#54656f]"} />
                            Arsipkan Chat
                          </button>

                          <button 
                            onClick={() => {
                              setChatMenuOpen(false);
                              setConfirmModal({
                                isOpen: true,
                                title: "Hapus Chat",
                                message: "Apakah Anda yakin ingin menghapus seluruh chat dengan klien ini? Tindakan ini tidak dapat dibatalkan.",
                                confirmText: "Hapus",
                                confirmVariant: "danger",
                                action: () => {
                                  const newItems = items.filter(i => i.id !== activeId);
                                  saveToStorage(newItems);
                                  if (newItems.length > 0) setActiveId(newItems[0].id);
                                  else setActiveId(null);
                                  setToast({ isVisible: true, message: "Seluruh chat telah dihapus", type: "success" });
                                  logActivity({ type: "testimonial_deleted", title: "Chat Testimoni Dihapus", description: `Seluruh riwayat chat dengan klien ${activeItem.name} dihapus secara permanen`, user: "Admin" });
                                }
                              });
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 transition-colors ${dark ? 'hover:bg-[#202c33]' : 'hover:bg-red-50'}`}
                          >
                            <Trash2 size={16} />
                            Hapus Chat
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* WA Background Pattern */}
            <div className="absolute inset-0 opacity-40 mix-blend-multiply pointer-events-none z-0" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')" }}></div>

            {/* Area Chat Bubbles */}
            <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 lg:p-8 relative z-10 scrollbar-thin scrollbar-thumb-[#cfd1d2] scrollbar-track-transparent">
              <div className="flex justify-center mb-6">
                <span className={`px-3 py-1.5 rounded-lg text-[12px] font-medium shadow-sm uppercase ${dark ? 'bg-[#182229] text-[#8696a0]' : 'bg-[#e1f3fb] text-[#54656f]'}`}>
                  HARI INI
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
                        <div className={`relative px-3 py-2 lg:px-4 lg:py-2.5 max-w-[85%] lg:max-w-[70%] min-w-0 rounded-lg shadow-[0_1px_0.5px_rgba(11,20,26,0.13)]
                          ${isMe ? (dark ? 'bg-[#005c4b] rounded-tr-none' : 'bg-[#d9fdd3] rounded-tr-none') : (dark ? 'bg-[#202c33] rounded-tl-none' : 'bg-white rounded-tl-none')}
                        `} style={{ wordBreak: 'break-word' }}>
                          
                          {/* Triangle tail */}
                          <div className={`absolute top-0 w-3 h-3 ${isMe ? '-right-2' : '-left-2'}`}>
                            <svg viewBox="0 0 8 13" width="8" height="13" className={`fill-current ${isMe ? (dark ? 'text-[#005c4b]' : 'text-[#d9fdd3]') : (dark ? 'text-[#202c33]' : 'text-white')}`}>
                              {isMe 
                                ? <path d="M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z" />
                                : <path d="M1.533 3.568L8 12.193V1H2.812C1.042 1 .474 2.156 1.533 3.568z" />
                              }
                            </svg>
                          </div>

                          {/* Message Actions (Edit & Delete) */}
                          <div className={`absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 flex flex-row gap-1.5 z-20 transition-all ${isMe ? '-left-[4.5rem]' : '-right-[4.5rem]'}`}>
                            <button
                              onClick={() => {
                                setChatInput(msg.text);
                                setEditingMessageId(msg.id!);
                                setTimeout(() => {
                                  if (textareaRef.current) {
                                    textareaRef.current.focus();
                                    // Move cursor to end
                                    const len = msg.text.length;
                                    textareaRef.current.setSelectionRange(len, len);
                                  }
                                }, 50);
                              }}
                              className={`p-1.5 rounded-full shadow-sm transition-colors ${dark ? 'bg-[#2a3942] text-[#8696a0] hover:bg-[#32454f]' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                              title="Edit Pesan"
                            >
                              <Edit3 size={12} />
                            </button>
                            <button
                              onClick={() => handleDeleteMessage(msg.id!)}
                              className={`p-1.5 rounded-full shadow-sm transition-colors ${dark ? 'bg-[#2a3942] text-red-400 hover:bg-[#32454f]' : 'bg-red-100 text-red-500 hover:bg-red-200'}`}
                              title="Hapus Pesan"
                            >
                              <X size={12} />
                            </button>
                          </div>

                          <div 
                            className={`text-[14px] leading-relaxed break-words whitespace-pre-wrap
                              ${isMe ? (dark ? 'text-[#e9edef]' : 'text-[#111b21]') : (dark ? 'text-[#e9edef]' : 'text-[#111b21]')}
                            `}
                          >
                            {msg.text}
                            <span className="inline-block w-14 h-3 align-bottom" />
                          </div>
                          
                          <div className={`flex items-center gap-1 text-[11px] absolute bottom-1 right-2 ${dark ? 'text-[#8696a0]' : 'text-[#667781]'}`}>
                            {msg.time}
                            {isMe && <span className="material-symbols-outlined text-[14px] text-[#53bdeb] leading-none">done_all</span>}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </AnimatePresence>
            </div>

            {/* Input Chat Bawah */}
            <div className={`px-4 py-3 flex items-center gap-3 shrink-0 z-20 ${dark ? 'bg-[#202c33]' : 'bg-[#f0f2f5]'}`}>
              {/* Sender Toggle */}
              <div 
                onClick={() => setSenderMode(prev => prev === 'me' ? 'client' : 'me')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors shadow-sm font-semibold text-xs border
                  ${senderMode === 'me' 
                    ? (dark ? 'bg-[#00a884] text-[#111b21] border-[#00a884]' : 'bg-[#d9fdd3] text-[#059669] border-[#c0f5b8]')
                    : (dark ? 'bg-[#2a3942] text-[#e9edef] border-[#222e35]' : 'bg-white text-[#111b21] border-gray-200')}
                `}
                title="Klik untuk ganti pengirim"
              >
                {senderMode === 'me' ? 'Admin' : 'Klien'}
              </div>

              <Smile size={24} className={`hidden sm:block ${dark ? 'text-[#8696a0]' : 'text-[#54656f]'}`} />
              
              <div className={`flex-1 rounded-lg flex flex-col shadow-sm ${dark ? 'bg-[#2a3942]' : 'bg-white'}`}>
                {editingMessageId && (
                  <div className={`flex justify-between items-center px-4 py-1.5 text-[11px] font-medium border-b ${dark ? 'border-[#222e35] text-[#8696a0]' : 'border-gray-100 text-gray-500'}`}>
                    <span>Mengedit pesan...</span>
                    <button onClick={() => { setEditingMessageId(null); setChatInput(""); }} className="hover:text-red-500 transition-colors"><X size={12}/></button>
                  </div>
                )}
                <textarea 
                  ref={textareaRef}
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Ketik pesan testimoni di sini..."
                  rows={1}
                  className={`w-full px-4 py-2.5 rounded-lg border-none focus:outline-none text-[15px] bg-transparent resize-none overflow-y-auto ${dark ? 'text-[#e9edef] placeholder-[#8696a0]' : 'text-[#111b21]'}`}
                  style={{ minHeight: '40px', maxHeight: '150px' }}
                />
              </div>

              {chatInput.trim() ? (
                <button onClick={handleSendMessage} className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md transition-colors shrink-0 ${editingMessageId ? 'bg-[#53bdeb] hover:bg-[#4295ba]' : 'bg-[#00a884] hover:bg-[#008f6f]'}`}>
                  {editingMessageId ? <Check size={20} /> : (
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
                    </svg>
                  )}
                </button>
              ) : (
                <Mic size={24} className="text-[#54656f] shrink-0" />
              )}
            </div>
            
          </div>
        ) : (
          <div className={`flex-1 flex flex-col items-center justify-center relative h-full text-center p-8 z-10 border-b-8 ${dark ? 'bg-[#222e35] border-[#00a884]' : 'bg-[#f0f2f5] border-[#25D366]'}`}>
            <h2 className={`text-3xl font-light mb-4 ${dark ? 'text-[#e9edef]' : 'text-[#41525d]'}`}>RevTech WhatsApp Editor</h2>
            <p className={`text-sm max-w-md ${dark ? 'text-[#8696a0]' : 'text-[#667781]'}`}>
              Pilih klien dari menu sebelah kiri atau klik tombol tambah <strong>[+]</strong> untuk membuat obrolan testimoni baru. Pesan yang di-set PUBLISHED akan langsung tampil di landing page.
            </p>
          </div>
        )}

      </div>

      {/* =========================================================================
          MODAL PENGATURAN KLIEN
          ========================================================================= */}
      <AnimatePresence>
        {draftClient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setDraftClient(null)}
              className="absolute inset-0 bg-black/50"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={`relative w-full max-w-md max-h-[90vh] shadow-2xl flex flex-col z-10 rounded-2xl overflow-hidden ${dark ? 'bg-[#111b21]' : 'bg-white'}`}
            >
              <div className={`h-16 flex items-center px-4 gap-4 shrink-0 ${dark ? 'bg-[#202c33] text-[#e9edef]' : 'bg-[#008069] text-white'}`}>
                <button onClick={() => setDraftClient(null)} className={`p-2 rounded-full transition-colors -ml-2 ${dark ? 'hover:bg-[#2a3942]' : 'hover:bg-white/10'}`}><X size={24} /></button>
                <h2 className="font-medium text-lg">Info Klien</h2>
              </div>
              
              <div className={`flex-1 overflow-y-auto custom-scrollbar ${dark ? 'bg-[#0b141a]' : 'bg-[#f0f2f5]'}`}>
                {/* Profile Picture Config */}
                <div className={`p-6 flex flex-col items-center justify-center shadow-sm mb-2 ${dark ? 'bg-[#111b21]' : 'bg-white'}`}>
                  <div className={`w-32 h-32 rounded-full flex items-center justify-center font-bold text-5xl mb-6 shadow-sm border-2 transition-colors duration-300 ${dark ? 'border-[#202c33]' : 'border-white'} ${draftClient.avatarBg}`}>
                    {draftClient.initials || <User size={56} strokeWidth={2.5} />}
                  </div>
                  
                  <div className="w-full">
                    <label className={`text-[12px] font-bold mb-1 block ${dark ? 'text-[#00a884]' : 'text-[#008069]'}`}>NAMA KLIEN</label>
                    <input 
                      type="text" 
                      value={draftClient.name} 
                      onChange={e => handleUpdateDraft({ name: e.target.value })}
                      placeholder="Masukkan nama klien..."
                      className={`w-full border-b-2 py-1 text-base bg-transparent outline-none transition-colors ${dark ? 'border-[#222e35] focus:border-[#00a884] text-[#e9edef]' : 'border-gray-200 focus:border-[#008069] text-[#111b21]'}`} 
                    />
                  </div>
                </div>

                {/* Additional Info (Simplified - Hidden) */}
                <div className={`px-6 py-4 shadow-sm mb-2 space-y-5 hidden ${dark ? 'bg-[#111b21]' : 'bg-white'}`}>
                  {/* Sembunyikan role, service, lastSeen dari modal sesuai request agar simpel */}
                </div>

                {/* Avatar Colors (Simplified - Hidden) */}
                <div className={`px-6 py-4 shadow-sm mb-4 hidden ${dark ? 'bg-[#111b21]' : 'bg-white'}`}>
                  <label className={`text-[12px] font-bold mb-3 block ${dark ? 'text-[#8696a0]' : 'text-gray-500'}`}>WARNA AVATAR</label>
                </div>

                <div className="p-4 flex gap-3">
                  <button 
                    onClick={handleSaveDraft}
                    className="flex-1 py-3 rounded-lg font-semibold shadow-sm flex items-center justify-center gap-2 transition-colors bg-[#008069] text-white hover:bg-[#01705c]"
                  >
                    Simpan
                  </button>
                  {items.some(i => i.id === draftClient.id) && (
                    <button 
                      onClick={() => {
                        handleDeleteClient(draftClient.id);
                        setDraftClient(null);
                      }}
                      className={`py-3 px-4 rounded-lg font-semibold shadow-sm flex items-center justify-center transition-colors ${dark ? 'bg-[#202c33] text-red-400 hover:bg-red-900/20' : 'bg-white text-red-500 hover:bg-red-50'}`}
                      title="Hapus Klien"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
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
        icon={confirmModal.icon}
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
