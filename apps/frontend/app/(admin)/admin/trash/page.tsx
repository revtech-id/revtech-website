"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Undo2, AlertTriangle, CheckCircle2, ChevronDown, MoreHorizontal, X, CheckSquare, SlidersHorizontal, Search, ArrowDownUp, Filter } from "lucide-react";

// Tipe data berdasarkan model Inbox (sementara hanya inbox yang didukung)
interface Lead {
  id: string;
  name: string;
  phone: string;
  company: string;
  service: string;
  budget: string;
  message: string;
  status: string;
  createdAt: string;
  handover?: string;
  lastContactedAt?: string;
  followUpNote?: string;
  referenceLink?: string;
  deletedAt?: string;
  deletedBy?: string;
  _module?: "Inbox" | "Pesanan";
  _original?: any;
}

export default function TrashPage() {
  const [deletedLeads, setDeletedLeads] = useState<Lead[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [toastMessage, setToastMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);
  
  // Modal State
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingBulk, setDeletingBulk] = useState(false);
  const [filterKategori, setFilterKategori] = useState("Semua");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [viewingLead, setViewingLead] = useState<Lead | null>(null);
  
  // Restore Modal State
  const [restoringAction, setRestoringAction] = useState<"single" | "bulk" | "all" | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
    let allTrash: Lead[] = [];
    
    const savedInboxTrash = localStorage.getItem("revtech_inbox_trash");
    if (savedInboxTrash) {
      const parsed = JSON.parse(savedInboxTrash);
      allTrash = [...allTrash, ...parsed.map((item: any) => ({ ...item, _module: "Inbox", _original: item }))];
    }
    
    const savedOrdersTrash = localStorage.getItem("revtech_orders_trash");
    if (savedOrdersTrash) {
      const parsed = JSON.parse(savedOrdersTrash);
      allTrash = [...allTrash, ...parsed.map((item: any) => ({
        ...item,
        _module: "Pesanan",
        _original: item,
        name: item.client,
        budget: item.total ? `Rp ${item.total}` : "-",
        message: item.notes || "-"
      }))];
    }

    const savedClientsTrash = localStorage.getItem("revtech_clients_trash");
    if (savedClientsTrash) {
      const parsed = JSON.parse(savedClientsTrash);
      allTrash = [...allTrash, ...parsed.map((item: any) => ({
        ...item,
        _module: "Klien",
        _original: item,
        name: item.name,
        company: item.contact || "-",
        budget: item.recurringFee ? `Rp ${item.recurringFee.toLocaleString('id-ID')}` : "-",
        message: item.domain || "Tidak ada domain",
        service: item.handover || item.service || "-"
      }))];
    }
    
    setDeletedLeads(allTrash);
  }, []);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const processRestore = (itemsToRestore: Lead[]) => {
    const inboxItems = itemsToRestore.filter(i => i._module !== "Pesanan");
    const orderItems = itemsToRestore.filter(i => i._module === "Pesanan");
    
    if (inboxItems.length > 0) {
      const savedInboxTrash = localStorage.getItem("revtech_inbox_trash");
      let currentInboxTrash = savedInboxTrash ? JSON.parse(savedInboxTrash) : [];
      currentInboxTrash = currentInboxTrash.filter((t: any) => !inboxItems.find(i => i.id === t.id));
      localStorage.setItem("revtech_inbox_trash", JSON.stringify(currentInboxTrash));
      
      const savedInbox = localStorage.getItem("revtech_inbox");
      const currentInbox = savedInbox ? JSON.parse(savedInbox) : [];
      localStorage.setItem("revtech_inbox", JSON.stringify([...inboxItems.map(i => i._original), ...currentInbox]));
    }
    
    if (orderItems.length > 0) {
      const savedOrdersTrash = localStorage.getItem("revtech_orders_trash");
      let currentOrdersTrash = savedOrdersTrash ? JSON.parse(savedOrdersTrash) : [];
      currentOrdersTrash = currentOrdersTrash.filter((t: any) => !orderItems.find(i => i.id === t.id));
      localStorage.setItem("revtech_orders_trash", JSON.stringify(currentOrdersTrash));
      
      const savedOrders = localStorage.getItem("revtech_orders");
      const currentOrders = savedOrders ? JSON.parse(savedOrders) : [];
      localStorage.setItem("revtech_orders", JSON.stringify([...orderItems.map(i => i._original), ...currentOrders]));
    }
    
    const restoredIds = itemsToRestore.map(i => i.id);
    setDeletedLeads(deletedLeads.filter(l => !restoredIds.includes(l.id)));
  };

  const processPermanentDelete = (itemsToDelete: Lead[]) => {
    const inboxItems = itemsToDelete.filter(i => i._module !== "Pesanan");
    const orderItems = itemsToDelete.filter(i => i._module === "Pesanan");
    
    if (inboxItems.length > 0) {
      const savedInboxTrash = localStorage.getItem("revtech_inbox_trash");
      let currentInboxTrash = savedInboxTrash ? JSON.parse(savedInboxTrash) : [];
      currentInboxTrash = currentInboxTrash.filter((t: any) => !inboxItems.find(i => i.id === t.id));
      localStorage.setItem("revtech_inbox_trash", JSON.stringify(currentInboxTrash));
    }
    
    if (orderItems.length > 0) {
      const savedOrdersTrash = localStorage.getItem("revtech_orders_trash");
      let currentOrdersTrash = savedOrdersTrash ? JSON.parse(savedOrdersTrash) : [];
      currentOrdersTrash = currentOrdersTrash.filter((t: any) => !orderItems.find(i => i.id === t.id));
      localStorage.setItem("revtech_orders_trash", JSON.stringify(currentOrdersTrash));
    }
    
    const deletedIds = itemsToDelete.map(i => i.id);
    setDeletedLeads(deletedLeads.filter(l => !deletedIds.includes(l.id)));
  };

  const handleRestoreLead = (id: string) => {
    setRestoringId(id);
    setRestoringAction("single");
  };

  const confirmDelete = () => {
    if (deletingBulk) {
      const itemsToDelete = deletedLeads.filter((l) => selectedIds.includes(l.id));
      processPermanentDelete(itemsToDelete);
      setDeletingBulk(false);
      setSelectedIds([]);
      showToast(`${selectedIds.length} item berhasil dihapus permanen`);
      return;
    }

    if (!deletingId) return;
    
    const itemToDelete = deletedLeads.find((l) => l.id === deletingId);
    if (itemToDelete) processPermanentDelete([itemToDelete]);
    setDeletingId(null);
    showToast("Item berhasil dihapus permanen");
  };

  const handleRestoreSelected = () => {
    if (selectedIds.length === 0) return;
    setRestoringAction("bulk");
  };

  const handleRestoreAll = () => {
    if (filteredLeads.length === 0) return;
    setRestoringAction("all");
  };
  
  const confirmRestore = () => {
    if (restoringAction === "single" && restoringId) {
      const leadToRestore = deletedLeads.find((l) => l.id === restoringId);
      if (leadToRestore) {
        processRestore([leadToRestore]);
        showToast(`Item berhasil dipulihkan ke ${leadToRestore._module === "Pesanan" ? "Project" : "Leads Utama"}`);
      }
    } else if (restoringAction === "bulk") {
      const leadsToRestore = deletedLeads.filter((l) => selectedIds.includes(l.id));
      processRestore(leadsToRestore);
    } else if (restoringAction === "all") {
      const leadsToRestore = filteredLeads;
      processRestore(leadsToRestore);
    }
    setRestoringAction(null);
    setRestoringId(null);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredLeads.length && filteredLeads.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredLeads.map(l => l.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  if (!isClient) return null;

  // Filter logika sementara: karena saat ini semua data berasal dari Inbox,
  // maka jika filter "Inbox" dipilih, tampilkan semua. Jika nanti ada modul lain, logic ini akan memisahkan per modul (misal lead.module === filterKategori).
  const filteredLeads = deletedLeads.filter(lead => {
    // Filter Kategori
    if (filterKategori !== "Semua") {
      if (filterKategori === "Inbox" && lead._module === "Pesanan") return false;
      if (filterKategori === "Pesanan" && lead._module !== "Pesanan") return false;
      if (filterKategori === "Klien" || filterKategori === "Invoice") return false; // not implemented yet
    }
    
    // Filter Pencarian
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      if (!lead.name.toLowerCase().includes(q) && !lead.company.toLowerCase().includes(q)) {
        return false;
      }
    }

    return true;
  }).sort((a, b) => {
    const timeA = a.deletedAt ? new Date(a.deletedAt).getTime() : new Date(a.createdAt).getTime();
    const timeB = b.deletedAt ? new Date(b.deletedAt).getTime() : new Date(b.createdAt).getTime();
    if (sortBy === "newest") {
      return timeB - timeA;
    } else {
      return timeA - timeB;
    }
  });

  return (
    <div>
      <div className="pt-2 mb-2">
      </div>

      {/* Toolbar Container */}
      <div className="relative mb-6">
        <AnimatePresence mode="wait">
          {!isSelectionMode ? (
            <motion.div
              key="normal-toolbar"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              {/* Search Bar */}
        <div className="flex items-center flex-1 max-w-full sm:max-w-[320px] rounded-full bg-[var(--adm-card)] shadow-sm transition-all focus-within:ring-2 focus-within:ring-blue-500/20">
          <div className="relative flex-1 flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama, bisnis..."
              className="w-full bg-transparent pl-4 pr-10 py-2.5 text-sm focus:outline-none text-[var(--adm-text)] font-semibold placeholder:font-normal placeholder:text-[var(--adm-text-3)]"
            />
            <span className="material-symbols-outlined absolute right-3 text-[var(--adm-text-3)] text-[18px] pointer-events-none">search</span>
          </div>
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-4 shrink-0">
          
          {/* Filter Status */}
          <div className="relative flex items-center justify-center shrink-0 group">
            <button className="text-[var(--adm-text-3)] group-hover:text-[var(--adm-text)] transition-colors focus:outline-none">
              <Filter size={18} strokeWidth={2.5} />
            </button>
            <select
              dir="rtl"
              value={filterKategori}
              onChange={(e) => setFilterKategori(e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              title="Filter Kategori"
            >
              <option value="Semua" className="bg-[var(--adm-card)] text-[var(--adm-text)]" dir="ltr">Semua Kategori</option>
              <option value="Inbox" className="bg-[var(--adm-card)] text-[var(--adm-text)]" dir="ltr">Leads</option>
              <option value="Klien" className="bg-[var(--adm-card)] text-[var(--adm-text)]" dir="ltr">Klien</option>
              <option value="Pesanan" className="bg-[var(--adm-card)] text-[var(--adm-text)]" dir="ltr">Project</option>
              <option value="Invoice" className="bg-[var(--adm-card)] text-[var(--adm-text)]" dir="ltr">Invoice</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="relative flex items-center justify-center shrink-0 group">
            <button className="text-[var(--adm-text-3)] group-hover:text-[var(--adm-text)] transition-colors focus:outline-none">
              <SlidersHorizontal size={18} strokeWidth={2.5} />
            </button>
            <select
              dir="rtl"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              title="Urutkan"
            >
              <option value="newest" className="bg-[var(--adm-card)] text-[var(--adm-text)]" dir="ltr">Terbaru</option>
              <option value="oldest" className="bg-[var(--adm-card)] text-[var(--adm-text)]" dir="ltr">Terlama</option>
            </select>
          </div>

          {filteredLeads.length > 0 && (
            <div className="flex items-center gap-2 sm:gap-3 relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-1.5 rounded-lg text-sm font-semibold transition-colors focus:outline-none bg-transparent text-[var(--adm-text-2)] hover:text-[var(--adm-text)]"
              >
                <MoreHorizontal size={20} strokeWidth={2.5} />
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
              {isMenuOpen && !isSelectionMode && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-[var(--adm-card)] shadow-[var(--adm-shadow-md)] overflow-hidden z-50 p-1 border border-[var(--adm-border)]"
                  >
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        setIsSelectionMode(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-[var(--adm-text)] hover:bg-[var(--adm-border)] rounded-lg transition-colors"
                    >
                      <CheckSquare size={14} className="text-[var(--adm-text-2)]" /> Pilih Item
                    </button>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        handleRestoreAll();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-[var(--adm-success)] hover:bg-[var(--adm-border)] rounded-lg transition-colors"
                    >
                      <Undo2 size={14} /> Pulihkan Semua
                    </button>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        setDeletingBulk(true);
                        setSelectedIds(filteredLeads.map(l => l.id)); // Select all before bulk delete
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-[var(--adm-danger)] hover:bg-[var(--adm-border)] rounded-lg transition-colors"
                    >
                      <Trash2 size={14} /> Hapus Semua
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        )}
        </div>
        </motion.div>
        ) : (
          <motion.div
            key="selection-toolbar"
            initial={{ opacity: 0, y: 50, scale: 0.95, x: "-50%" }}
            animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
            exit={{ opacity: 0, y: 50, scale: 0.95, x: "-50%" }}
            className="fixed bottom-6 left-1/2 z-[90] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--adm-accent)]/10 border border-[var(--adm-accent)]/20 backdrop-blur-md w-[calc(100%-2rem)] max-w-2xl px-4 py-3 rounded-2xl shadow-2xl"
          >
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  setIsSelectionMode(false);
                  setSelectedIds([]);
                }}
                className="p-1.5 hover:bg-black/5 rounded-lg text-[var(--adm-text)] focus:outline-none transition-colors"
                title="Batal"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
              <div className="flex items-center gap-4 pl-4">
                <span className="font-semibold text-[var(--adm-accent)] text-sm">
                  {selectedIds.length} item dipilih
                </span>
                <div className="flex items-center gap-2 text-sm font-semibold text-[var(--adm-text-2)]">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === filteredLeads.length && filteredLeads.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-[var(--adm-border)] text-[var(--adm-accent)] focus:ring-[var(--adm-accent)]/30 cursor-pointer hover:border-[var(--adm-accent)] transition-colors"
                  />
                  <span>Pilih Semua</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {selectedIds.length > 0 && (
                <>
                  <button onClick={handleRestoreSelected} className="text-sm font-semibold px-2 py-2 text-[var(--adm-success)] hover:opacity-75 transition-opacity flex items-center gap-2">
                    <Undo2 size={16} strokeWidth={2.5} /> Pulihkan
                  </button>
                  <button onClick={() => setDeletingBulk(true)} className="text-sm font-semibold px-2 py-2 text-[var(--adm-danger)] hover:opacity-75 transition-opacity flex items-center gap-2">
                    <Trash2 size={16} strokeWidth={2.5} /> Hapus
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
        </AnimatePresence>
      </div>

      <AnimatePresence mode="popLayout">
        {filteredLeads.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="text-center py-20"
          >
            <div className="w-16 h-16 rounded-full bg-[var(--adm-border)] flex items-center justify-center mx-auto mb-4 opacity-50">
              <Trash2 className="text-[var(--adm-text-3)]" size={32} />
            </div>
            <h3 className="font-bold text-[var(--adm-text)] mb-1">Tempat Sampah Kosong</h3>
            <p className="text-sm text-[var(--adm-text-3)]">Tidak ada item yang terhapus pada kategori ini.</p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {filteredLeads.map((lead) => (
              <motion.div
                layout
                key={lead.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <div 
                  className={`p-4 rounded-2xl bg-[var(--adm-card)] shadow-sm transition-colors cursor-pointer border ${
                    selectedIds.includes(lead.id) 
                      ? 'border-[var(--adm-text-2)] bg-[var(--adm-bg)]' 
                      : 'border-transparent hover:border-[var(--adm-border)]'
                  }`}
                  onClick={() => {
                    if (isSelectionMode) {
                      toggleSelect(lead.id);
                    } else {
                      setViewingLead(lead);
                    }
                  }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Left: Info */}
                    <div className="flex items-center gap-3">
                      {isSelectionMode && (
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(lead.id)}
                          onChange={() => toggleSelect(lead.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-4 h-4 rounded border-[var(--adm-border)] text-[var(--adm-accent)] focus:ring-[var(--adm-accent)]/30 mt-1 sm:mt-0 cursor-pointer shrink-0"
                        />
                      )}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-[var(--adm-text)]">{lead.name}</h3>
                        <span className="text-[11px] px-1.5 py-0.5 bg-[var(--adm-bg)] rounded text-[var(--adm-text-2)] font-semibold">
                          {lead._module === "Pesanan" ? "Project" : lead._module === "Inbox" ? "Leads" : (lead._module || "Sistem")}
                        </span>
                        </div>
                        <p className="text-xs text-[var(--adm-text-3)] line-clamp-1">{lead.company} — {lead.service}</p>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 sm:gap-6 shrink-0 mt-3 sm:mt-0">
                      
                      <div className="text-right">
                        {lead.deletedAt ? (
                          <p className="text-[11px] text-[var(--adm-text-3)] leading-snug">
                            Dihapus {new Date(lead.deletedAt).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}<br className="hidden sm:block" />
                            <span className="sm:hidden"> </span>oleh <span className="font-semibold text-[var(--adm-text-2)]">{lead.deletedBy || "Sistem"}</span>
                          </p>
                        ) : (
                          <p className="text-[11px] text-[var(--adm-text-3)] leading-snug">
                            Waktu penghapusan<br className="hidden sm:block" />
                            <span className="sm:hidden"> </span>tidak terekam
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRestoreLead(lead.id);
                        }}
                        className="inline-flex items-center justify-center p-1.5 text-[var(--adm-text-3)] hover:text-[var(--adm-success)] transition-colors focus:outline-none"
                        title="Pulihkan"
                      >
                        <Undo2 size={16} strokeWidth={2.5} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingId(lead.id);
                        }}
                        className="inline-flex items-center justify-center p-1.5 text-[var(--adm-text-3)] hover:text-[var(--adm-danger)] transition-colors focus:outline-none"
                        title="Hapus Permanen"
                      >
                        <Trash2 size={16} strokeWidth={2} />
                      </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-6 right-6 px-4 py-3 rounded-xl shadow-lg border text-sm font-semibold z-[999] flex items-center gap-2
              ${toastMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                toastMessage.type === 'error' ? 'bg-red-50 text-red-700 border-red-200' : 
                'bg-blue-50 text-blue-700 border-blue-200'}
            `}
          >
            {toastMessage.type === 'success' ? <CheckCircle2 size={18} className="text-emerald-500" /> : <AlertTriangle size={18} className="text-red-500" />}
            {toastMessage.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {(deletingId || deletingBulk) && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-[var(--adm-card)] border border-[var(--adm-border)] rounded-2xl p-6 w-full max-w-sm shadow-[var(--adm-shadow-lg)]"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-red-500/10 text-red-500">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-[var(--adm-text)]">Hapus Permanen?</h3>
                  <p className="text-[12px] text-[var(--adm-text-2)] leading-tight mt-0.5">
                    Tindakan ini tidak dapat dibatalkan. {deletingBulk ? `${selectedIds.length} data` : 'Data'} akan dihapus dari sistem selamanya.
                  </p>
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => {
                    setDeletingId(null);
                    setDeletingBulk(false);
                  }}
                  className="flex-1 py-2 text-sm font-semibold text-[var(--adm-text-2)] bg-transparent hover:text-[var(--adm-text)] border border-[var(--adm-border)] rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-2 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors"
                >
                  Ya, Hapus Permanen
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Restore Confirmation Modal */}
      <AnimatePresence>
        {restoringAction !== null && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-[var(--adm-card)] border border-[var(--adm-border)] rounded-2xl p-6 w-full max-w-sm shadow-[var(--adm-shadow-lg)]"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-emerald-500/10 text-emerald-500">
                  <Undo2 size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-[var(--adm-text)]">Pulihkan Data?</h3>
                  <p className="text-[12px] text-[var(--adm-text-2)] leading-tight mt-0.5">
                    {restoringAction === 'single' ? 'Data ini' : restoringAction === 'bulk' ? `${selectedIds.length} data` : 'Semua data'} akan dikembalikan ke tempat asalnya.
                  </p>
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => {
                    setRestoringAction(null);
                    setRestoringId(null);
                  }}
                  className="flex-1 py-2 text-sm font-semibold text-[var(--adm-text-2)] bg-transparent hover:text-[var(--adm-text)] border border-[var(--adm-border)] rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={confirmRestore}
                  className="flex-1 py-2 text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-colors"
                >
                  Ya, Pulihkan
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail Modal */}
      <AnimatePresence>
        {viewingLead && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-[var(--adm-card)] border border-[var(--adm-border)] rounded-2xl p-6 w-full max-w-lg shadow-[var(--adm-shadow-lg)] max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-[var(--adm-text)] text-lg">Detail Data Terhapus</h3>
                <button onClick={() => setViewingLead(null)} className="p-1 text-[var(--adm-text-3)] hover:text-[var(--adm-text)] transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-xs font-semibold text-[var(--adm-text-3)] mb-1">Nama / Klien</span>
                    <span className="block text-sm font-bold text-[var(--adm-text)]">{viewingLead.name}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-[var(--adm-text-3)] mb-1">Modul Asal</span>
                    <span className="inline-block px-2 py-0.5 rounded bg-[var(--adm-bg)] text-xs font-semibold text-[var(--adm-text-2)]">
                      {viewingLead._module || "Sistem"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-xs font-semibold text-[var(--adm-text-3)] mb-1">Perusahaan / Bisnis</span>
                    <span className="block text-sm font-semibold text-[var(--adm-text)]">{viewingLead.company || "-"}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-[var(--adm-text-3)] mb-1">Nomor Telepon</span>
                    <span className="block text-sm font-semibold text-[var(--adm-text)]">{viewingLead.phone || "-"}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-xs font-semibold text-[var(--adm-text-3)] mb-1">Layanan</span>
                    <span className="block text-sm font-semibold text-[var(--adm-text)]">{viewingLead.service || "-"}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-[var(--adm-text-3)] mb-1">Budget / Total</span>
                    <span className="block text-sm font-semibold text-[var(--adm-text)]">{viewingLead.budget || "-"}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[var(--adm-border)]">
                  <span className="block text-xs font-semibold text-[var(--adm-text-3)] mb-1">Pesan / Catatan</span>
                  <p className="text-sm text-[var(--adm-text-2)] bg-[var(--adm-bg)] p-3 rounded-xl whitespace-pre-wrap">
                    {viewingLead.message || "-"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[var(--adm-border)]">
                  <div>
                    <span className="block text-xs font-semibold text-[var(--adm-text-3)] mb-1">Waktu Dibuat</span>
                    <span className="block text-xs font-medium text-[var(--adm-text-2)]">
                      {new Date(viewingLead.createdAt).toLocaleString("id-ID", { dateStyle: "long", timeStyle: "short" })}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-[var(--adm-text-3)] mb-1">Waktu Dihapus</span>
                    <span className="block text-xs font-medium text-[var(--adm-text-2)]">
                      {viewingLead.deletedAt ? new Date(viewingLead.deletedAt).toLocaleString("id-ID", { dateStyle: "long", timeStyle: "short" }) : "Tidak terekam"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-8 pt-4 border-t border-[var(--adm-border)]">
                <button
                  onClick={() => {
                    handleRestoreLead(viewingLead.id);
                    setViewingLead(null);
                  }}
                  className="flex-1 py-2 text-sm font-semibold text-[var(--adm-success)] bg-[var(--adm-success)]/10 hover:bg-[var(--adm-success)]/20 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Undo2 size={16} /> Pulihkan
                </button>
                <button
                  onClick={() => {
                    setDeletingId(viewingLead.id);
                    setViewingLead(null);
                  }}
                  className="flex-1 py-2 text-sm font-semibold text-[var(--adm-danger)] bg-[var(--adm-danger)]/10 hover:bg-[var(--adm-danger)]/20 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 size={16} /> Hapus Permanen
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
