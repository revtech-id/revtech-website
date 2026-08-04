"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AdminCard, AdminToolbar } from "@/components/admin/ui";
import { Pencil, Trash2, MessageSquare, Handshake, X, ChevronDown, Globe, MonitorPlay, Box, SlidersHorizontal, CheckCircle2, Undo2, AlertTriangle } from "lucide-react";
import inboxData from "@/data/admin/inbox.json";
import { countries as COUNTRIES } from "@/lib/countries";
import { CountrySelector } from "@/components/ui/CountrySelector";

interface Lead {
  id: string;
  name: string;
  phone: string;
  company: string;
  service: string;
  budget: string;
  message: string;
  status: string; // new | followup | waiting_dp | ghosting | deal (read-only, set via modal)
  createdAt: string;
  handover?: string;
  lastContactedAt?: string;
  followUpNote?: string;
  isVip?: boolean;
  referenceLink?: string;
  deletedAt?: string;
  deletedBy?: string;
}


// Modal konfirmasi Deal — muncul saat admin klik "Tandai Deal & Pindah ke Pesanan"
interface DealModalProps {
  lead: Lead;
  onConfirm: (data: { total: number; dp: number; deadline: string; handover: string }) => void;
  onClose: () => void;
}

function DealModal({ lead, onConfirm, onClose }: DealModalProps) {
  const defaultTotal = parseInt(lead.budget.replace(/[^0-9]/g, "")) || 0;
  const [total, setTotal] = useState<number | string>(defaultTotal);
  const [dp, setDp] = useState<number | string>(Math.round(defaultTotal / 2));
  
  const [deadline, setDeadline] = useState(() => {
    let days = 14; // Default 14 hari
    const s = lead.service.toLowerCase();
    const isVip = lead.isVip || false;

    if (s.includes("usaha")) days = 5;
    else if (s.includes("profesional")) days = 14;
    else if (s.includes("digital")) days = 1;
    else if (s.includes("custom")) days = 30;
    
    // VIP = 2x lebih cepat
    if (isVip && days > 1) {
      days = Math.ceil(days / 2);
    }

    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split("T")[0];
  });

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="bg-[var(--adm-card)] rounded-2xl shadow-2xl w-full max-w-md p-6"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="mb-6">
            <h3 className="font-bold text-lg text-[var(--adm-text)]">Konfirmasi Deal</h3>
            <p className="text-sm text-[var(--adm-text-3)] mt-0.5">{lead.name} · {lead.company}</p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[var(--adm-text-2)] mb-1 block">Total Harga (Rp) *</label>
                <input
                  type="text"
                  required
                  value={total ? `Rp ${total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}` : ""}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, "");
                    setTotal(raw === "" ? "" : raw);
                    if (raw !== "") setDp(Math.round(parseInt(raw, 10) / 2).toString());
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--adm-bg)] text-[var(--adm-text)] text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--adm-text-2)] mb-1 block">Nominal DP (Rp) *</label>
                <input
                  type="text"
                  required
                  value={dp ? `Rp ${dp.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}` : ""}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, "");
                    setDp(raw === "" ? "" : raw);
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--adm-bg)] text-[var(--adm-text)] text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--adm-text-2)] mb-1 block">Deadline Estimasi</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--adm-bg)] text-[var(--adm-text)] text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 [color-scheme:dark]"
              />
            </div>
          </div>

          <div className="flex gap-2 mt-6">
            <button
              onClick={onClose}
              className="flex-1 py-2 rounded-lg font-semibold text-[var(--adm-text-2)] hover:bg-[var(--adm-bg)] hover:text-[var(--adm-text)] transition-colors text-sm"
            >
              Batal
            </button>
            <button
              onClick={() => onConfirm({ 
                total: parseInt(total.toString().replace(/\D/g, ""), 10), 
                dp: parseInt(dp.toString().replace(/\D/g, ""), 10), 
                deadline, 
                handover: "" 
              })}
              disabled={!total || !dp}
              className="flex-1 py-2 rounded-lg font-bold bg-[var(--adm-success)] text-white hover:opacity-90 transition-opacity text-sm shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Pindahkan ke Pesanan
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

const STATUS_CONFIG: Record<string, { label: string; style: React.CSSProperties; dot: string }> = {
  new:        { label: "Baru Masuk",     style: { color: "var(--adm-text-2)", backgroundColor: "transparent" },   dot: "bg-blue-500" },
  followup:   { label: "Tindak Lanjut",  style: { color: "var(--adm-text-2)", backgroundColor: "transparent" },  dot: "bg-purple-500" },
  waiting_dp: { label: "Menunggu DP",    style: { color: "var(--adm-text-2)", backgroundColor: "transparent" }, dot: "bg-amber-500 animate-pulse" },
  deal:       { label: "Selesai",        style: { color: "var(--adm-success)", backgroundColor: "transparent" },dot: "bg-emerald-500" },
  ghosting:   { label: "Batal",          style: { color: "var(--adm-text-2)", backgroundColor: "transparent" },  dot: "bg-slate-400" },
};

export default function InboxPage() {
  const [view, setView] = useState<"list" | "form">("list");
  const [filter, setFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("Semua");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("oldest");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [deletedLeads, setDeletedLeads] = useState<Lead[]>([]);
  const [toastMessage, setToastMessage] = useState<{ text: string, type: "success" | "error" | "info" } | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dealLead, setDealLead] = useState<Lead | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteAction, setDeleteAction] = useState<"soft" | "permanent">("soft");
  
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);

  const [newLead, setNewLead] = useState({
    name: "", phone: "", company: "",
    service: "Jasa Website", serviceDetail: "",
    budget: "", message: "", status: "new", handover: "",
    followUpNote: "", isVip: false, referenceLink: ""
  });

  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem("revtech_inbox");
    if (saved) {
      setLeads(JSON.parse(saved));
    } else {
      setLeads(inboxData as Lead[]);
      localStorage.setItem("revtech_inbox", JSON.stringify(inboxData));
    }

    const savedTrash = localStorage.getItem("revtech_inbox_trash");
    if (savedTrash) {
      setDeletedLeads(JSON.parse(savedTrash));
    }

    // Listener for auto-updating across tabs without refreshing
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "revtech_inbox" && e.newValue) {
        setLeads(JSON.parse(e.newValue));
      } else if (e.key === "revtech_inbox_trash" && e.newValue) {
        setDeletedLeads(JSON.parse(e.newValue));
      }
    };
    
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  function saveLeads(updated: Lead[]) {
    setLeads(updated);
    localStorage.setItem("revtech_inbox", JSON.stringify(updated));
  }

  function saveDeletedLeads(updated: Lead[]) {
    setDeletedLeads(updated);
    localStorage.setItem("revtech_inbox_trash", JSON.stringify(updated));
  }

  function showToast(text: string, type: "success" | "error" | "info" = "success") {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  }

  const calculateBudget = (service: string, detail: string, isVip: boolean) => {
    let base = 0;
    if (service === "Jasa Website") {
      if (detail === "Paket Usaha") base = 499000;
      else if (detail === "Paket Profesional") base = 1499000;
      else if (detail === "Paket Eksklusif") base = 5000000;
    } else if (service === "Produk Digital") {
      base = 150000;
    }
    
    if (base === 0) return "";
    if (isVip) base = Math.round(base * 1.3);
    
    return base.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const TABS = [
    { id: "all",        label: "Semua",        count: leads.filter(d => serviceFilter === "Semua" || d.service.startsWith(serviceFilter)).length },
    { id: "new",        label: "Baru Masuk",   count: leads.filter(d => d.status === "new" && (serviceFilter === "Semua" || d.service.startsWith(serviceFilter))).length },
    { id: "followup",   label: "Tindak Lanjut",count: leads.filter(d => d.status === "followup" && (serviceFilter === "Semua" || d.service.startsWith(serviceFilter))).length },
    { id: "waiting_dp", label: "Menunggu DP",  count: leads.filter(d => d.status === "waiting_dp" && (serviceFilter === "Semua" || d.service.startsWith(serviceFilter))).length },
    { id: "deal",       label: "Selesai",      count: leads.filter(d => d.status === "deal" && (serviceFilter === "Semua" || d.service.startsWith(serviceFilter))).length },
    { id: "ghosting",   label: "Batal",        count: leads.filter(d => d.status === "ghosting" && (serviceFilter === "Semua" || d.service.startsWith(serviceFilter))).length },
  ];

  const SERVICE_TABS = ["Semua", "Jasa Website", "Produk Digital", "Custom Project"];

  function getWaLink(lead: Lead) {
    const msgs: Record<string, string> = {
      new:        `Halo Kak ${lead.name}, saya admin RevTech. Terima kasih sudah menghubungi kami terkait kebutuhan ${lead.service}. Boleh cerita lebih detail kebutuhannya?`,
      followup:   `Halo Kak ${lead.name}, bagaimana kabarnya? Mau follow-up terkait rencana pembuatan ${lead.service}. Ada yang bisa kami bantu?`,
      waiting_dp: `Halo Kak ${lead.name}, mengingatkan kembali terkait proyek ${lead.service}. Untuk memulai pengerjaan, mohon konfirmasi pembayaran DP ya Kak 🙏`,
      deal:       `Halo Kak ${lead.name}, terima kasih! Proyek ${lead.service} sudah kami terima dan masuk antrian pengerjaan. Kami akan segera menghubungi Anda untuk koordinasi awal.`,
      ghosting:   `Halo Kak ${lead.name}, dari RevTech. Apakah masih berminat melanjutkan rencana pembuatan ${lead.service}?`,
    };
    const text = msgs[lead.status] || `Halo Kak ${lead.name}, dari RevTech!`;
    return `https://wa.me/${lead.phone}?text=${encodeURIComponent(text)}`;
  }

  function handleQuickStatus(lead: Lead, newStatus: string) {
    if (newStatus === "deal") return; // Deal hanya via modal
    const updated = leads.map(l => l.id === lead.id
      ? { ...l, status: newStatus, lastContactedAt: new Date().toISOString() }
      : l
    );
    saveLeads(updated);
  }

  function handleEdit(lead: Lead) {
    const [cat, ...rest] = lead.service.split(" - ");
    const serviceCat = ["Jasa Website", "Produk Digital", "Custom Project"].includes(cat) ? cat : "Jasa Website";
    const detail = rest.length > 0 ? rest.join(" - ") : (serviceCat !== cat ? lead.service : "");
    
    let phoneNum = lead.phone;
    let matchedCountry = COUNTRIES[0];
    for (const c of COUNTRIES) {
      const code = c.dial_code.replace('+', '');
      if (phoneNum.startsWith(code)) {
        matchedCountry = c;
        phoneNum = phoneNum.substring(code.length);
        break;
      }
    }
    setSelectedCountry(matchedCountry);

    const initialBudgetRaw = (lead.budget !== "-" ? lead.budget : "").replace(/^Rp\s*/i, "").replace(/[^0-9]/g, "");
    const formattedBudget = initialBudgetRaw.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    setNewLead({
      name: lead.name, phone: phoneNum, company: lead.company,
      service: serviceCat, serviceDetail: detail,
      budget: formattedBudget,
      message: lead.message, status: lead.status,
      handover: lead.handover || "", followUpNote: lead.followUpNote || "",
      isVip: lead.isVip || false, referenceLink: lead.referenceLink || ""
    });
    setEditingId(lead.id);
    setView("form");
  }

  function requestDelete(id: string, isPermanent: boolean = false) {
    setDeletingId(id);
    setDeleteAction(isPermanent ? "permanent" : "soft");
  }

  function confirmDelete() {
    if (!deletingId) return;
    
    if (deleteAction === "soft") {
      const leadToMove = leads.find(l => l.id === deletingId);
      if (leadToMove) {
        const deletedLead = {
          ...leadToMove,
          deletedAt: new Date().toISOString(),
          deletedBy: "Superadmin"
        };
        saveLeads(leads.filter(l => l.id !== deletingId));
        saveDeletedLeads([deletedLead, ...deletedLeads]);
        showToast("Prospek dipindahkan ke tempat sampah.");
      }
    } else {
      saveDeletedLeads(deletedLeads.filter(l => l.id !== deletingId));
      showToast("Prospek berhasil dihapus permanen.");
    }
    setDeletingId(null);
  }

  function restoreLead(id: string) {
    const leadToRestore = deletedLeads.find(l => l.id === id);
    if (leadToRestore) {
      saveDeletedLeads(deletedLeads.filter(l => l.id !== id));
      saveLeads([leadToRestore, ...leads]);
      showToast("Prospek berhasil dipulihkan.");
    }
  }

  function handleAddLead(e: React.FormEvent) {
    e.preventDefault();
    const serviceFull = newLead.serviceDetail
      ? `${newLead.service} - ${newLead.serviceDetail}`
      : newLead.service;

    let finalPhone = newLead.phone;
    if (selectedCountry.code === 'ID') {
      finalPhone = finalPhone.replace(/^0+/, '');
    }
    finalPhone = selectedCountry.dial_code.replace('+', '') + finalPhone;

    let finalBudget = newLead.budget.trim();
    if (finalBudget && !finalBudget.toLowerCase().startsWith("rp")) {
      finalBudget = `Rp ${finalBudget}`;
    }

    let updatedLeads = [...leads];
    if (editingId) {
      updatedLeads = leads.map(l => l.id === editingId ? {
        ...l, name: newLead.name, phone: finalPhone, company: newLead.company,
        service: serviceFull, budget: finalBudget || "-",
        message: newLead.message, status: newLead.status,
        handover: newLead.handover, followUpNote: newLead.followUpNote,
        isVip: newLead.isVip, referenceLink: newLead.referenceLink
      } : l);
    } else {
      updatedLeads.unshift({
        id: "LD-" + Math.floor(Math.random() * 1000).toString().padStart(3, "0"),
        name: newLead.name, phone: finalPhone, company: newLead.company || "-",
        service: serviceFull, budget: finalBudget || "-",
        message: newLead.message || "-", status: newLead.status,
        createdAt: new Date().toISOString(),
        handover: newLead.handover, followUpNote: newLead.followUpNote,
        isVip: newLead.isVip, referenceLink: newLead.referenceLink
      });
    }

    saveLeads(updatedLeads);
    showToast(editingId ? "Perubahan prospek berhasil disimpan." : "Prospek baru berhasil ditambahkan.");
    setView("list");
    setEditingId(null);
    setSelectedCountry(COUNTRIES[0]);
    setNewLead({ name: "", phone: "", company: "", service: "Jasa Website", serviceDetail: "", budget: "", message: "", status: "new", handover: "", followUpNote: "", isVip: false, referenceLink: "" });
  }

  function handleConfirmDeal(lead: Lead, data: { total: number; dp: number; deadline: string; handover: string }) {
    // 1. Tandai lead sebagai deal di Inbox
    const updatedLeads = leads.map(l => l.id === lead.id
      ? { ...l, status: "deal", handover: data.handover, lastContactedAt: new Date().toISOString() }
      : l
    );
    saveLeads(updatedLeads);

    const orderId = `ORD-${Date.now().toString().slice(-5)}`;
    const today = new Date().toISOString().split("T")[0];

    // 2. Masukkan ke Pesanan (Antrean)
    const orderPayload = {
      id: orderId,
      client: lead.name,
      company: lead.company || "",
      service: lead.service,
      status: "antrean",
      dp: data.dp,
      total: data.total,
      phone: lead.phone,
      createdAt: today,
      deadline: data.deadline || null,
      notes: lead.message || "",
      handover: data.handover,
      isVip: lead.isVip || false,
      assignedDev: "",
      progressLog: [{ date: new Date().toISOString(), note: "Proyek masuk antrean dari Inbox.", by: "Admin" }]
    };

    // 3. Buat Invoice DP otomatis
    const invoiceDP = {
      id: `INV-${Date.now().toString().slice(-5)}`,
      orderId,
      client: lead.name,
      phone: lead.phone,
      type: "dp",
      amount: data.dp,
      status: "pending",
      issuedAt: today,
      paidAt: null,
      dueDate: today, // jatuh tempo hari ini (sudah seharusnya DP sudah masuk)
      description: `DP 50% — ${lead.service}`,
    };

    try {
      // Simpan order
      const savedOrders = localStorage.getItem("revtech_orders");
      const ordersList = savedOrders ? JSON.parse(savedOrders) : [];
      localStorage.setItem("revtech_orders", JSON.stringify([orderPayload, ...ordersList]));

      // Simpan invoice DP
      const savedInvoices = localStorage.getItem("revtech_invoices");
      const invoiceList = savedInvoices ? JSON.parse(savedInvoices) : [];
      localStorage.setItem("revtech_invoices", JSON.stringify([invoiceDP, ...invoiceList]));
    } catch (err) {
      console.error(err);
    }

    setDealLead(null);
  }

  const filtered = leads.filter(l => {
    const matchStatus = filter === "all" || l.status === filter;
    const matchService = serviceFilter === "Semua" || l.service.startsWith(serviceFilter);
    const matchSearch = !search ||
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.company.toLowerCase().includes(search.toLowerCase()) ||
      l.service.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchService && matchSearch;
  }).sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (sortBy === "oldest") {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else if (sortBy === "vip") {
      if (a.isVip && !b.isVip) return -1;
      if (!a.isVip && b.isVip) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return 0;
  });

  if (!isClient) return null;

  return (
    <div>
      <div className="pt-2"></div>

      {/* Toolbar */}
      <AdminToolbar
        view={view}
        onBack={() => setView("list")}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari nama, bisnis..."
        dropdown={
          <div className="relative flex items-center shrink-0">
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="appearance-none bg-transparent py-2.5 pl-4 pr-8 text-sm font-semibold text-[var(--adm-text)] focus:outline-none cursor-pointer w-full"
            >
              {SERVICE_TABS.map(s => (
                <option key={s} value={s} className="bg-[var(--adm-card)] text-[var(--adm-text)]">{s === "Semua" ? "Semua Layanan" : s}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3">
              <ChevronDown size={14} strokeWidth={2.5} className="text-[var(--adm-text-3)]" />
            </div>
          </div>
        }
        onAdd={() => {
          setEditingId(null);
          setSelectedCountry(COUNTRIES[0]);
          setNewLead({ name: "", phone: "", company: "", service: "Jasa Website", serviceDetail: "", handover: "", budget: "", status: "new", message: "", followUpNote: "", isVip: false, referenceLink: "" });
          setView("form");
        }}
        addLabel="Prospek Baru"
        addIcon="add"
      />

      {view === "list" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>


          {/* Tabs & Actions Row */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-4 sm:gap-0">
            {/* Tabs Status (Underline Style) */}
            <div className="flex items-center gap-6 overflow-x-auto overflow-y-hidden scrollbar-hide w-full sm:w-auto">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setFilter(t.id)}
                  className={`shrink-0 pb-3 text-sm font-semibold transition-all flex items-center gap-2 border-b-2 -mb-px ${
                    filter === t.id
                      ? "border-red-500 text-red-500"
                      : "border-transparent text-[var(--adm-text-2)] hover:text-[var(--adm-text)]"
                  }`}
                >
                  {t.label}
                  {t.count !== undefined && t.count > 0 && (
                    <span className={`px-1.5 py-0.5 text-[10px] rounded-full ${filter === t.id ? "bg-red-500 text-white" : "bg-[var(--adm-bg)] text-[var(--adm-text-2)]"}`}>
                      {t.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Actions (Sort) */}
            <div className="flex items-center pb-2.5 shrink-0 self-start sm:self-auto px-1 sm:px-0">
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
                  <option value="vip" className="bg-[var(--adm-card)] text-[var(--adm-text)]" dir="ltr">VIP Prioritas</option>
                </select>
              </div>
            </div>
          </div>

          {/* Lead List Unified Table/Card */}
          <div className="space-y-4">


            {/* Empty State */}
            {filtered.length === 0 && (
              <div className="bg-[var(--adm-card)] rounded-2xl shadow-[var(--adm-shadow)] py-16 text-center">
                <span className="material-symbols-outlined text-[48px] text-[var(--adm-text-3)] block mb-2">inbox</span>
                <p className="text-sm text-[var(--adm-text-2)]">Tidak ada prospek ditemukan.</p>
              </div>
            )}

            {/* Card List */}
            {filtered.map((lead, i) => {
              const cfg = STATUS_CONFIG[lead.status] || STATUS_CONFIG.new;
              return (
                <motion.div
                  key={lead.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: i * 0.04, type: "spring", stiffness: 300, damping: 28 } }}
                  className="bg-[var(--adm-card)] rounded-2xl shadow-[var(--adm-shadow)] overflow-hidden hover:shadow-[var(--adm-shadow-md)] transition-shadow"
                >
                      <div className="p-4 flex flex-col gap-2">
                        {/* Top Row: Identity & Status & Actions */}
                        <div className="flex flex-wrap justify-between items-start gap-4">
                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-[var(--adm-text-2)] font-medium mt-1">
                            <span className="text-sm font-semibold text-[var(--adm-text)]">{lead.name}</span>
                            {lead.company && (
                              <span className="px-2 py-0.5 rounded bg-[var(--adm-bg)] text-[var(--adm-text-2)] text-[10px] font-semibold hidden sm:inline-block">
                                {lead.company}
                              </span>
                            )}
                            {(() => {
                              const [cat] = lead.service.split(" - ");
                              return <span>{cat}</span>;
                            })()}
                          </div>

                          {/* Status & Deal Action */}
                          <div className="flex items-center justify-end gap-1.5 w-[130px] shrink-0">
                            {lead.status === "waiting_dp" && (
                              <button
                                onClick={() => setDealLead(lead)}
                                className="inline-flex items-center justify-center text-[var(--adm-success)] hover:opacity-70 active:scale-95 transition-all focus:outline-none shrink-0"
                                title="Tandai Selesai (Deal)"
                              >
                                <Handshake size={18} strokeWidth={2.5} />
                              </button>
                            )}
                            
                            {/* Status Dropdown/Badge */}
                            {lead.status === "deal" ? (
                              <div className="flex items-center gap-1.5 py-1.5 text-[11px] font-bold shrink-0" style={cfg.style}>
                                <span className="truncate">{cfg.label}</span>
                                <CheckCircle2 size={13} strokeWidth={2.5} />
                              </div>
                            ) : (
                              <select
                                value={lead.status}
                                onChange={e => handleQuickStatus(lead, e.target.value)}
                                className="text-[11px] font-bold py-1.5 border-0 bg-transparent cursor-pointer focus:outline-none text-right shrink-0"
                                style={cfg.style}
                              >
                                <option value="new" className="bg-[var(--adm-card)] text-[var(--adm-text)]">Baru Masuk</option>
                                <option value="followup" className="bg-[var(--adm-card)] text-[var(--adm-text)]">Tindak Lanjut</option>
                                <option value="waiting_dp" className="bg-[var(--adm-card)] text-[var(--adm-text)]">Menunggu DP</option>
                                <option value="ghosting" className="bg-[var(--adm-card)] text-[var(--adm-text)]">Batal</option>
                              </select>
                            )}
                          </div>
                        </div>

                        {/* Middle Row: Title & Message (Combined on one line like Gmail) */}
                        <div className="flex items-baseline gap-2 mt-1.5 mb-2 pr-4 sm:pr-8 overflow-hidden">
                          {(() => {
                            const [, ...rest] = lead.service.split(" - ");
                            const fallbackDetail = rest.length > 0 ? rest.join(" - ") : lead.service;
                            const displayTitle = lead.serviceDetail ? lead.serviceDetail : fallbackDetail;
                            
                            return (
                              <h3 className="text-[14px] font-bold text-[var(--adm-text)] whitespace-nowrap">{displayTitle}</h3>
                            );
                          })()}
                          <span className="text-[var(--adm-text-3)] hidden sm:inline">—</span>
                          <p 
                            className="text-[13px] text-[var(--adm-text-2)] truncate cursor-default flex-1 min-w-0"
                            title={lead.message || "Tidak ada pesan khusus"}
                          >
                            {lead.message ? `"${lead.message}"` : <span className="italic text-[var(--adm-text-3)]">Tidak ada pesan khusus</span>}
                          </p>
                        </div>

                        {/* Bottom Row: Tags & Date */}
                        <div className="flex flex-wrap items-end justify-between gap-4 mt-1">
                          {/* Left: Tags */}
                          <div className="flex flex-wrap items-center gap-1.5">
                            {lead.budget && lead.budget !== "-" && (
                              <span className="px-2 py-0.5 rounded bg-[var(--adm-bg)] text-[var(--adm-text-2)] text-[10px] font-semibold">
                                {lead.budget}
                              </span>
                            )}
                            {lead.referenceLink && (
                              <a href={lead.referenceLink.startsWith('http') ? lead.referenceLink : `https://${lead.referenceLink}`} target="_blank" rel="noopener noreferrer" className="text-[11px] text-[var(--adm-text-2)] hover:text-[var(--adm-text)] font-semibold inline-flex items-center gap-1 transition-colors">
                                <span className="material-symbols-outlined text-[10px]">open_in_new</span>
                                <span>Referensi</span>
                              </a>
                            )}
                            {lead.followUpNote && (
                              <div className="text-[10px] text-blue-600 bg-blue-50 px-2 py-1 rounded font-semibold inline-flex items-center gap-1 border border-blue-100">
                                <Pencil size={10} />
                                <span className="line-clamp-1">{lead.followUpNote}</span>
                              </div>
                            )}
                            {lead.handover && (
                              <span className="px-2 py-0.5 rounded bg-[var(--adm-bg)] text-[var(--adm-text-2)] text-[10px] font-semibold">
                                {lead.handover}
                              </span>
                            )}
                            {lead.isVip && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border" style={{ color: "var(--adm-warning)", backgroundColor: "rgba(245,158,11,0.1)", borderColor: "rgba(245,158,11,0.2)" }}>
                                VIP
                              </span>
                            )}
                            {lead.status === "deal" && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border" style={{ color: "var(--adm-success)", backgroundColor: "rgba(16,185,129,0.1)", borderColor: "rgba(16,185,129,0.2)" }}>
                                DP LUNAS
                              </span>
                            )}
                          </div>

                          {/* Right: Actions & Date */}
                          <div className="flex flex-wrap items-center gap-3 shrink-0 ml-auto mt-2 sm:mt-0">
                            {/* Secondary Actions */}
                            <div className="flex items-center gap-1.5">
                                <a
                                  href={getWaLink(lead)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center justify-center p-1.5 text-[var(--adm-text-3)] hover:text-[var(--adm-text)] transition-colors focus:outline-none"
                                  title="Chat via WhatsApp"
                                >
                                  <MessageSquare size={13} strokeWidth={2} />
                                </a>
  
                                <button
                                  onClick={() => handleEdit(lead)}
                                  className="inline-flex items-center justify-center p-1.5 text-[var(--adm-text-3)] hover:text-[var(--adm-text)] transition-colors focus:outline-none"
                                  title="Edit"
                                >
                                  <Pencil size={13} strokeWidth={2} />
                                </button>
  
                                <button
                                  onClick={() => requestDelete(lead.id, false)}
                                  className="inline-flex items-center justify-center p-1.5 text-[var(--adm-text-3)] hover:text-[var(--adm-danger)] transition-colors focus:outline-none"
                                  title="Hapus"
                                >
                                  <Trash2 size={13} strokeWidth={2} />
                                </button>
                            </div>

                            <div className="w-px h-4 bg-[var(--adm-border)] hidden sm:block"></div>

                            <div className="text-[10px] font-medium text-[var(--adm-text-3)] whitespace-nowrap">
                              {new Date(lead.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                            </div>
                          </div>
                        </div>
                      </div>

                    </motion.div>
                  );
                })}
          </div>
        </motion.div>

      )}

      {/* Form Tambah / Edit */}
      {view === "form" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mt-4 mx-auto">
          <AdminCard>
            <div className="p-6 sm:p-8">
              <h2 className="text-lg font-bold text-[var(--adm-text)] mb-6">{editingId ? "Edit Prospek" : "Tambah Prospek Baru"}</h2>
              <form onSubmit={handleAddLead} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-xs font-semibold mb-1.5 block text-[var(--adm-text-2)]">Nama Lengkap *</label>
                    <input required type="text" value={newLead.name} onChange={e => setNewLead({...newLead, name: e.target.value})} className="w-full px-3 py-2.5 rounded-lg text-sm bg-[var(--adm-bg)] text-[var(--adm-text)] focus:outline-none focus:ring-2 focus:ring-[var(--adm-accent)]/30 focus:border-[var(--adm-accent)]" placeholder="Masukkan nama lengkap" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold mb-1.5 block text-[var(--adm-text-2)]">Nomor WhatsApp *</label>
                    <div className="flex rounded-lg bg-[var(--adm-bg)] focus-within:ring-2 focus-within:ring-[var(--adm-accent)]/30 focus-within:border-[var(--adm-accent)] transition-all">
                      <CountrySelector 
                        selected={selectedCountry} 
                        onSelect={setSelectedCountry} 
                        theme="admin" 
                      />
                      <input required type="text" value={newLead.phone} onChange={e => {
                        setNewLead({...newLead, phone: e.target.value.replace(/\D/g,'')});
                      }} className="w-full px-3 py-2.5 text-sm bg-transparent border-0 text-[var(--adm-text)] focus:outline-none focus:ring-0 placeholder-[var(--adm-text-3)]" placeholder={selectedCountry.code === 'ID' ? "8123456..." : "123456789..."} />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold mb-1.5 block text-[var(--adm-text-2)]">Bisnis / Instansi</label>
                  <input type="text" value={newLead.company} onChange={e => setNewLead({...newLead, company: e.target.value})} className="w-full px-3 py-2.5 rounded-lg text-sm bg-[var(--adm-bg)] text-[var(--adm-text)] focus:outline-none focus:ring-2 focus:ring-[var(--adm-accent)]/30 focus:border-[var(--adm-accent)]" placeholder="Masukkan nama bisnis atau instansi" />
                </div>

                <div className={`grid grid-cols-1 ${newLead.service === "Custom Project" ? "" : "md:grid-cols-2"} gap-5`}>
                  <div>
                    <label className="text-xs font-semibold mb-1.5 block text-[var(--adm-text-2)]">Kategori Layanan</label>
                    <select value={newLead.service} onChange={e => {
                        const val = e.target.value;
                        const newDetail = val === "Jasa Website" ? "Paket Usaha" : "";
                        const newBudget = calculateBudget(val, newDetail, newLead.isVip);
                        setNewLead({...newLead, service: val, serviceDetail: newDetail, budget: newBudget});
                      }} className="w-full px-3 py-2.5 rounded-lg text-sm bg-[var(--adm-bg)] text-[var(--adm-text)] focus:outline-none focus:ring-2 focus:ring-[var(--adm-accent)]/30 focus:border-[var(--adm-accent)]">
                      <option value="Jasa Website" className="bg-[var(--adm-card)]">Jasa Website</option>
                      <option value="Produk Digital" className="bg-[var(--adm-card)]">Produk Digital</option>
                      <option value="Custom Project" className="bg-[var(--adm-card)]">Custom Project</option>
                    </select>
                  </div>
                  
                  {newLead.service === "Jasa Website" ? (
                    <div>
                      <label className="text-xs font-semibold mb-1.5 block text-[var(--adm-text-2)]">Paket Website</label>
                      <select value={newLead.serviceDetail} onChange={e => {
                          const val = e.target.value;
                          const newBudget = calculateBudget(newLead.service, val, newLead.isVip);
                          setNewLead({...newLead, serviceDetail: val, budget: newBudget});
                        }} className="w-full px-3 py-2.5 rounded-lg text-sm bg-[var(--adm-bg)] text-[var(--adm-text)] focus:outline-none focus:ring-2 focus:ring-[var(--adm-accent)]/30 focus:border-[var(--adm-accent)]">
                        <option value="" className="bg-[var(--adm-card)]">- Pilih Paket -</option>
                        <option value="Paket Usaha" className="bg-[var(--adm-card)]">Paket Usaha</option>
                        <option value="Paket Profesional" className="bg-[var(--adm-card)]">Paket Profesional</option>
                        <option value="Paket Eksklusif" className="bg-[var(--adm-card)]">Paket Eksklusif</option>
                      </select>
                    </div>
                  ) : newLead.service === "Produk Digital" ? (
                    <div>
                      <label className="text-xs font-semibold mb-1.5 block text-[var(--adm-text-2)]">Nama Produk</label>
                      <input type="text" value={newLead.serviceDetail} onChange={e => setNewLead({...newLead, serviceDetail: e.target.value})} className="w-full px-3 py-2.5 rounded-lg text-sm bg-[var(--adm-bg)] text-[var(--adm-text)] focus:outline-none focus:ring-2 focus:ring-[var(--adm-accent)]/30 focus:border-[var(--adm-accent)]" placeholder="Masukkan nama produk" />
                    </div>
                  ) : null}
                </div>

                {newLead.service === "Jasa Website" && (
                  <div className="flex items-center gap-3 mt-2">
                    <input 
                      type="checkbox" 
                      id="vip-check" 
                      checked={newLead.isVip} 
                      onChange={e => {
                        const vip = e.target.checked;
                        const calculated = calculateBudget(newLead.service, newLead.serviceDetail, vip);
                        if (calculated) {
                          setNewLead({...newLead, isVip: vip, budget: calculated});
                        } else {
                          const raw = parseInt(newLead.budget.replace(/[^0-9]/g, "")) || 0;
                          if (raw > 0) {
                            const adjusted = vip ? Math.round(raw * 1.3) : Math.round(raw / 1.3);
                            setNewLead({...newLead, isVip: vip, budget: adjusted.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")});
                          } else {
                            setNewLead({...newLead, isVip: vip});
                          }
                        }
                      }}
                      className="w-[18px] h-[18px] rounded bg-[var(--adm-bg)] text-[var(--adm-accent)] focus:ring-[var(--adm-accent)] cursor-pointer shrink-0 border-[var(--adm-border)]"
                    />
                    <label htmlFor="vip-check" className="text-sm font-bold text-[var(--adm-warning)] cursor-pointer leading-snug">
                      Jalur VIP (+30% Biaya)
                    </label>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-xs font-semibold mb-1.5 block text-[var(--adm-text-2)]">
                      {newLead.service === "Produk Digital" ? "Harga Produk" : "Estimasi Budget"}
                    </label>
                    <div className="flex rounded-lg bg-[var(--adm-bg)] focus-within:ring-2 focus-within:ring-[var(--adm-accent)]/30 focus-within:border-[var(--adm-accent)] transition-all">
                      <div className="bg-transparent rounded-l-lg border-r border-[var(--adm-border)] text-[var(--adm-text)] font-bold text-[13px] px-4 flex items-center justify-center pointer-events-none">
                        Rp
                      </div>
                      <input 
                        type="text" 
                        value={newLead.budget} 
                        onChange={e => {
                          const rawValue = e.target.value.replace(/[^0-9]/g, '');
                          const formatted = rawValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
                          setNewLead({...newLead, budget: formatted});
                        }} 
                        className="w-full px-3 py-2.5 text-sm bg-transparent border-0 text-[var(--adm-text)] focus:outline-none focus:ring-0 placeholder-[var(--adm-text-3)]" 
                        placeholder={newLead.service === "Produk Digital" ? "Masukkan harga" : "Masukkan nominal budget"} 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold mb-1.5 block text-[var(--adm-text-2)]">Status Saat Ini</label>
                    <select value={newLead.status} onChange={e => setNewLead({...newLead, status: e.target.value})} className="w-full px-3 py-2.5 rounded-lg text-sm bg-[var(--adm-bg)] text-[var(--adm-text)] focus:outline-none focus:ring-2 focus:ring-[var(--adm-accent)]/30 focus:border-[var(--adm-accent)]">
                      <option value="new" className="bg-[var(--adm-card)] text-[var(--adm-text)]">Baru Masuk</option>
                      <option value="followup" className="bg-[var(--adm-card)] text-[var(--adm-text)]">Tindak Lanjut</option>
                      <option value="waiting_dp" className="bg-[var(--adm-card)] text-[var(--adm-text)]">Menunggu DP</option>
                      <option value="deal" className="bg-[var(--adm-card)] text-[var(--adm-text)]">Selesai</option>
                      <option value="ghosting" className="bg-[var(--adm-card)] text-[var(--adm-text)]">Batal</option>
                    </select>
                  </div>
                </div>

                {newLead.service === "Custom Project" && (
                  <div>
                    <label className="text-xs font-semibold mb-1.5 block text-[var(--adm-text-2)]">Link Referensi / Contoh Produk (Opsional)</label>
                    <input type="text" value={newLead.referenceLink} onChange={e => setNewLead({...newLead, referenceLink: e.target.value})} className="w-full px-3 py-2.5 rounded-lg text-sm bg-[var(--adm-bg)] text-[var(--adm-text)] focus:outline-none focus:ring-2 focus:ring-[var(--adm-accent)]/30 focus:border-[var(--adm-accent)]" placeholder="cth: www.contoh.com" />
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold mb-1.5 block text-[var(--adm-text-2)]">Pesan / Kebutuhan Klien</label>
                  <textarea rows={3} value={newLead.message} onChange={e => setNewLead({...newLead, message: e.target.value})} className="w-full px-3 py-2.5 rounded-lg text-sm bg-[var(--adm-bg)] text-[var(--adm-text)] focus:outline-none focus:ring-2 focus:ring-[var(--adm-accent)]/30 focus:border-[var(--adm-accent)] resize-none" placeholder={newLead.service === "Custom Project" ? "Ceritakan ide sistem, web app, atau solusi custom yang Anda butuhkan secara singkat..." : "Tuliskan kebutuhan spesifik dari klien..."} />
                </div>

                {/* Progressive Disclosure: Hanya tampilkan Catatan Follow-up jika status bukan Baru Masuk */}
                {newLead.status !== "new" && (
                  <div className="p-4 bg-[var(--adm-warning)]/5 rounded-xl border border-[var(--adm-warning)]/20 mt-4">
                    <label className="text-xs font-semibold mb-1.5 block text-[var(--adm-warning)] uppercase tracking-wide">Catatan Follow-up Internal</label>
                    <input type="text" value={newLead.followUpNote} onChange={e => setNewLead({...newLead, followUpNote: e.target.value})} className="w-full px-3 py-2.5 rounded-lg text-sm bg-[var(--adm-card)] text-[var(--adm-text)] focus:outline-none focus:ring-1 focus:ring-[var(--adm-warning)] border border-[var(--adm-border)]" placeholder="Cth: Klien mau diingatkan lagi Senin depan" />
                  </div>
                )}

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button type="button" onClick={() => setView("list")} className="px-5 py-2 rounded-lg font-semibold text-[var(--adm-text-2)] hover:bg-[var(--adm-bg)] hover:text-[var(--adm-text)] transition-colors text-sm">Batal</button>
                  <button type="submit" className="px-5 py-2 rounded-lg bg-[var(--adm-accent)] text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm">
                    {editingId ? "Simpan Perubahan" : "Simpan ke Inbox"}
                  </button>
                </div>
              </form>
            </div>
          </AdminCard>
        </motion.div>
      )}

      {/* Modal Deal */}
      {dealLead && (
        <DealModal
          lead={dealLead}
          onConfirm={(data) => handleConfirmDeal(dealLead, data)}
          onClose={() => setDealLead(null)}
        />
      )}

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-6 right-6 px-4 py-3 rounded-xl shadow-[var(--adm-shadow-lg)] text-sm font-semibold z-[999] flex items-center gap-2 bg-[var(--adm-card)] text-[var(--adm-text)]`}
          >
            {toastMessage.type === 'success' ? <CheckCircle2 size={18} className="text-[var(--adm-success)]" /> : 
             toastMessage.type === 'error' ? <AlertTriangle size={18} className="text-[var(--adm-danger)]" /> :
             <div className="w-4 h-4 rounded-full bg-blue-500" />}
            {toastMessage.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingId && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-[var(--adm-card)] rounded-2xl p-6 w-full max-w-sm shadow-[var(--adm-shadow-lg)]"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-[var(--adm-danger)]/10 text-[var(--adm-danger)]`}>
                  {deleteAction === 'permanent' ? <AlertTriangle size={20} /> : <Trash2 size={20} />}
                </div>
                <div>
                  <h3 className="font-bold text-[var(--adm-text)]">{deleteAction === "permanent" ? "Hapus Permanen?" : "Pindahkan ke Sampah?"}</h3>
                  <p className="text-[12px] text-[var(--adm-text-2)] leading-tight mt-0.5">
                    {deleteAction === "permanent" 
                      ? "Tindakan ini tidak dapat dibatalkan. Prospek akan dihapus dari sistem selamanya."
                      : "Prospek akan dipindahkan ke Tempat Sampah dan bisa dipulihkan nanti."}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => setDeletingId(null)}
                  className="flex-1 py-2 text-sm font-semibold text-[var(--adm-text-2)] bg-[var(--adm-bg)] hover:bg-[var(--adm-border)] rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={confirmDelete}
                  className={`flex-1 py-2 text-sm font-bold text-white rounded-xl transition-colors bg-red-500 hover:bg-red-600`}
                >
                  Ya, Hapus
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
