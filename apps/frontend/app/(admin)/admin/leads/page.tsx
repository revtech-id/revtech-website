"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AdminCard, AdminToolbar, AdminTabs, AdminModal, AdminTable, AdminButton } from "@/components/admin/ui";
import { Pencil, Trash2, MessageSquare, Handshake, X, ChevronDown, Globe, MonitorPlay, Box, SlidersHorizontal, CheckCircle2, Undo2, AlertTriangle } from "lucide-react";
import inboxData from "@/data/admin/inbox.json";
import { countries as COUNTRIES } from "@/lib/countries";
import { CountrySelector } from "@/components/ui/CountrySelector";
import { logActivity } from "@/lib/activityLog";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, doc, updateDoc, deleteDoc, addDoc, setDoc, query, orderBy, getDoc, getDocs, where } from "firebase/firestore";

interface Lead {
  id: string;
  name: string;
  phone: string;
  company: string;
  service: string;
  serviceDetail?: string;
  budget: string;
  message: string;
  status: string; // new | followup | waiting_dp | ghosting | deal (read-only, set via modal)
  createdAt: string;
  handover?: string;
  lastContactedAt?: string;
  followUpNote?: string;
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
  
  const [deadline, setDeadline] = useState("");

  return (
    <AdminModal isOpen={true} onClose={onClose} title="Konfirmasi Deal" subtitle={`${lead.name} · ${lead.company}`}>
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
                  className="w-full px-3 py-2.5 rounded-xl bg-transparent border border-[var(--adm-border)] text-[var(--adm-text)] text-sm font-bold focus:outline-none focus:ring-1 focus:ring-[var(--adm-success)]/40 transition-all"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-[var(--adm-text-2)]">Nominal DP (Rp) *</label>
                  <button type="button" onClick={() => setDp(total)} className="text-[10px] font-bold text-[var(--adm-accent)] hover:opacity-80 transition-opacity">Bayar Lunas</button>
                </div>
                <input
                  type="text"
                  required
                  value={dp ? `Rp ${dp.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}` : ""}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, "");
                    setDp(raw === "" ? "" : raw);
                  }}
                  className="w-full px-3 py-2.5 rounded-xl bg-transparent border border-[var(--adm-border)] text-[var(--adm-text)] text-sm font-bold focus:outline-none focus:ring-1 focus:ring-[var(--adm-success)]/40 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--adm-text-2)] mb-1 block">Deadline Estimasi</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-transparent border border-[var(--adm-border)] text-[var(--adm-text)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--adm-success)]/40 transition-all [color-scheme:dark]"
              />
            </div>
          </div>

          <div className="flex gap-2 mt-6">
            <button
              onClick={onClose}
              className="flex-1 py-2 rounded-xl bg-transparent font-semibold text-[var(--adm-text-2)] hover:text-[var(--adm-text)] transition-colors text-sm"
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
              Pindahkan ke Project
            </button>
          </div>
    </AdminModal>
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
  const [toastMessage, setToastMessage] = useState<{ text: string, type: "success" | "error" | "info" } | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dealLead, setDealLead] = useState<Lead | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteAction, setDeleteAction] = useState<"soft" | "permanent">("soft");
  const [pendingStatusChange, setPendingStatusChange] = useState<{from: "form" | "list", newStatus?: string, lead?: Lead} | null>(null);
  
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);

  const [newLead, setNewLead] = useState({
    name: "", phone: "", company: "",
    service: "", serviceDetail: "",
    budget: "", message: "", status: "new", handover: "",
    followUpNote: "", referenceLink: ""
  });

  useEffect(() => {
    setIsClient(true);
    
    // Sinkronisasi Realtime dengan Firestore
    const q = query(collection(db, "leads"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const firestoreLeads: Lead[] = [];
      snapshot.forEach(document => {
        firestoreLeads.push({ id: document.id, ...document.data() } as Lead);
      });
      setLeads(firestoreLeads);
    });

    return () => unsubscribe();
  }, []);

  function showToast(text: string, type: "success" | "error" | "info" = "success") {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  }

  const calculateBudget = (service: string, detail: string) => {
    let base = 0;
    if (service === "Jasa Website") {
      if (detail === "Paket Usaha") base = 499000;
      else if (detail === "Paket Profesional") base = 1499000;
      else if (detail === "Paket Eksklusif") base = 5000000;
    }
    
    if (base === 0) return "";
    
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

  const SERVICE_TABS = ["Semua", "Jasa Website", "Produk Digital", "Custom Project", "Jasa Modifikasi"];

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

  function handleQuickStatus(lead: Lead, newStatus: string, skipConfirm = false) {
    if (newStatus === "deal") {
      showToast("Klien belum melakukan pembayaran awal! Silakan selesaikan terlebih dahulu.", "error");
      return;
    }
    
    // Prevent changing from deal to something else
    if (lead.status === "deal") {
      showToast("Prospek ini sudah menjadi Project! Status tidak dapat diubah untuk mencegah hilangnya data.", "error");
      return;
    }
    
    const restrictedStatuses = ["ghosting"];
    if (!skipConfirm && restrictedStatuses.includes(lead.status) && newStatus !== lead.status) {
       setPendingStatusChange({ from: "list", newStatus, lead });
       return;
    }

    updateDoc(doc(db, "leads", lead.id), { status: newStatus, lastContactedAt: new Date().toISOString() });
    showToast("Status berhasil diperbarui");
  }

  function handleEdit(lead: Lead) {
    const [cat, ...rest] = lead.service.split(" - ");
    const serviceCat = ["Jasa Website", "Produk Digital", "Custom Project", "Jasa Modifikasi"].includes(cat) ? cat : "Jasa Website";
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
      referenceLink: lead.referenceLink || ""
    });
    setEditingId(lead.id);
    setView("form");
  }

  function requestDelete(id: string, isPermanent: boolean = false) {
    setDeletingId(id);
    setDeleteAction(isPermanent ? "permanent" : "soft");
  }

  async function confirmDelete() {
    if (!deletingId) return;
    
    if (deleteAction === "soft") {
      const leadToMove = leads.find(l => l.id === deletingId);
      if (leadToMove) {
        const deletedLead = {
          ...leadToMove,
          deletedAt: new Date().toISOString(),
          deletedBy: "Superadmin",
          _module: "Inbox"
        };
        await setDoc(doc(db, "trash", deletingId), deletedLead);
        await deleteDoc(doc(db, "leads", deletingId));
        
        showToast("Prospek dipindahkan ke tempat sampah.");
      }
    } else {
      await deleteDoc(doc(db, "leads", deletingId));
      showToast("Prospek berhasil dihapus permanen.");
    }
    setDeletingId(null);
  }

  async function handleAddLead(e?: React.FormEvent, skipConfirm = false) {
    if (e && e.preventDefault) e.preventDefault();
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

    if (editingId) {
      const oldLead = leads.find(l => l.id === editingId);
      
      // Prevent changing status to deal from the edit form
      if (oldLead && newLead.status === "deal" && oldLead.status !== "deal") {
        showToast("Klien belum melakukan pembayaran awal! Silakan selesaikan terlebih dahulu.", "error");
        return;
      }
      
      // Prevent changing from deal to something else
      if (oldLead && oldLead.status === "deal" && newLead.status !== "deal") {
        showToast("Prospek sudah menjadi Project. Status tidak dapat diubah ke sebelumnya.", "error");
        return;
      }

      const restrictedStatuses = ["ghosting"];
      if (!skipConfirm && oldLead && restrictedStatuses.includes(oldLead.status) && newLead.status !== oldLead.status) {
        setPendingStatusChange({ from: "form" });
        return;
      }
      
      await updateDoc(doc(db, "leads", editingId), {
        name: newLead.name, phone: finalPhone, company: newLead.company,
        service: serviceFull, budget: finalBudget || "-",
        message: newLead.message, status: newLead.status,
        handover: newLead.handover, followUpNote: newLead.followUpNote,
        referenceLink: newLead.referenceLink
      });

      // Cascade update to downstream data
      if (oldLead) {
        try {
          const budgetMatch = finalBudget.match(/\d+(\.\d+)?/g);
          const parsedAmount = budgetMatch ? parseInt(budgetMatch.join("").replace(/\./g, '')) : 0;
          const dpAmount = parsedAmount > 0 ? parsedAmount / 2 : 0;

          // Update Orders in Firestore
          const qOrders = query(collection(db, "orders"), where("phone", "==", oldLead.phone));
          const orderDocs = await getDocs(qOrders);
          orderDocs.forEach(async (orderDoc) => {
            await updateDoc(doc(db, "orders", orderDoc.id), {
              client: newLead.name,
              company: newLead.company || "-",
              phone: finalPhone,
              service: serviceFull
            });
          });

          // Update Invoices in Firestore
          const qInvoices = query(collection(db, "invoices"), where("phone", "==", oldLead.phone));
          const invoiceDocs = await getDocs(qInvoices);
          invoiceDocs.forEach(async (invDoc) => {
            await updateDoc(doc(db, "invoices", invDoc.id), {
              client: newLead.name,
              company: newLead.company || "-",
              phone: finalPhone,
              service: serviceFull
            });
          });

          // Update Maintenance Clients in Firestore
          const qClients = query(collection(db, "maintenance"), where("phone", "==", oldLead.phone));
          const clientDocs = await getDocs(qClients);
          clientDocs.forEach(async (clientDoc) => {
            await updateDoc(doc(db, "maintenance", clientDoc.id), {
              name: newLead.company || newLead.name,
              contact: newLead.name,
              phone: finalPhone,
              service: serviceFull
            });
          });
        } catch (err) {
          console.error("Failed to cascade update to Firestore", err);
        }
      }
    } else {
      await addDoc(collection(db, "leads"), {
        ticketNumber: "LD-" + Math.floor(Math.random() * 1000).toString().padStart(3, "0"),
        name: newLead.name, phone: finalPhone, company: newLead.company || "-",
        service: serviceFull, budget: finalBudget || "-",
        message: newLead.message || "-", status: newLead.status,
        createdAt: new Date().toISOString(),
        handover: newLead.handover, followUpNote: newLead.followUpNote,
        referenceLink: newLead.referenceLink
      });
    }
    
    // Log activity
    if (!editingId) {
      logActivity({
        type: "lead_added",
        title: "Prospek Baru Ditambahkan",
        description: `Prospek baru dari ${newLead.name}${newLead.company ? ` (${newLead.company})` : ""} untuk ${newLead.service} ditambahkan oleh admin.`,
        user: "Admin",
      });
    }
    
    showToast(editingId ? "Perubahan prospek berhasil disimpan." : "Prospek baru berhasil ditambahkan.");
    setView("list");
    setEditingId(null);
    setSelectedCountry(COUNTRIES[0]);
    setNewLead({ name: "", phone: "", company: "", service: "", serviceDetail: "", budget: "", message: "", status: "new", handover: "", followUpNote: "", referenceLink: "" });
  }

  async function handleConfirmDeal(lead: Lead, data: { total: number; dp: number; deadline: string; handover: string }) {
    // 1. Tandai lead sebagai deal di Inbox
    await updateDoc(doc(db, "leads", lead.id), { status: "deal", handover: data.handover, lastContactedAt: new Date().toISOString() });

    const orderId = `ORD-${Date.now().toString().slice(-5)}`;
    const today = new Date().toISOString().split("T")[0];

    // 2. Masukkan ke Pesanan (Antrean)
    const orderPayload = {
      id: orderId,
      client: lead.name,
      company: lead.company || "",
      service: lead.serviceDetail ? `${lead.service} - ${lead.serviceDetail}` : lead.service,
      status: "antrean",
      dp: data.dp,
      total: data.total,
      phone: lead.phone,
      createdAt: today,
      deadline: data.deadline || null,
      notes: lead.message || "",
      handover: data.handover,
      assignedDev: "",
      progressLog: [{ date: new Date().toISOString(), note: "Project masuk antrean dari Leads.", by: "Admin" }]
    };

    // 3. Buat Invoice Pertama (DP / Lunas) ke Firestore
    const isLunas = data.dp >= data.total;
    const dpPercent = Math.round((data.dp / (data.total || 1)) * 100);
    const invDesc = isLunas 
      ? `Pembayaran Penuh — ${lead.service || lead.company || lead.name}` 
      : `DP ${dpPercent}% — ${lead.service || lead.company || lead.name}`;

    const invoiceDP = {
      id: `INV-DP-${lead.id}`,
      orderId: orderId, // Terhubung ke Order ID baru
      client: lead.name,
      company: lead.company,
      service: lead.service,
      phone: lead.phone,
      type: "dp",
      amount: data.dp,
      status: "paid",
      issuedAt: new Date().toISOString(),
      paidAt: new Date().toISOString(),
      dueDate: today, 
      description: invDesc,
    };

    // 4. Buat Invoice Pelunasan otomatis (Pending) JIKA BELUM LUNAS
    let invoicePelunasan = null;
    if (!isLunas) {
      invoicePelunasan = {
        id: `INV-PL-${orderId}`,
        orderId: orderId,
        client: lead.name,
        company: lead.company,
        service: lead.service,
        phone: lead.phone,
        type: "pelunasan",
        amount: data.total - data.dp,
        status: "pending",
        issuedAt: new Date().toISOString(),
        paidAt: null,
        dueDate: data.deadline || today, 
        description: `Pelunasan — ${lead.service || lead.company || lead.name}`,
      };
    }

    try {
      // Simpan ke Firestore
      await setDoc(doc(db, "orders", orderId), orderPayload);
      await setDoc(doc(db, "invoices", invoiceDP.id), invoiceDP);
      if (invoicePelunasan) {
        await setDoc(doc(db, "invoices", invoicePelunasan.id), invoicePelunasan);
      }
    } catch (err) {
      console.error("Gagal memindahkan data ke tabel pesanan:", err);
      showToast("Gagal memindahkan data ke tabel pesanan", "error");
    }

    setDealLead(null);
    
    // Log activity
    const isLunasUpfront = data.dp >= data.total;
    logActivity({
      type: "lead_deal",
      title: isLunasUpfront ? "Deal — Pembayaran Penuh" : "Deal — DP Diterima",
      description: isLunasUpfront
        ? `Project ${lead.name} (${lead.service}) deal & bayar penuh Rp ${data.total.toLocaleString('id-ID')}.`
        : `Project ${lead.name} (${lead.service}) deal dengan DP Rp ${data.dp.toLocaleString('id-ID')} dari total Rp ${data.total.toLocaleString('id-ID')}.`,
      user: "Admin",
    });
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
    }
    return 0;
  });

  const inboxColumns = [
    {
      key: "identitas",
      label: "Identitas",
      render: (lead: Lead) => (
        <div className="flex flex-col">
          <span className="font-semibold text-[var(--adm-text)]">{lead.name}</span>
          {lead.company && <span className="text-[11px] text-[var(--adm-text-2)]">{lead.company}</span>}
        </div>
      ),
    },
    {
      key: "layanan",
      label: "Layanan & Budget",
      render: (lead: Lead) => {
        const [cat, ...rest] = lead.service.split(" - ");
        const fallbackDetail = rest.length > 0 ? rest.join(" - ") : lead.service;
        const displayTitle = lead.serviceDetail ? lead.serviceDetail : fallbackDetail;
        return (
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-[var(--adm-text)]">{displayTitle}</span>
            <span className="text-[11px] text-[var(--adm-text-2)]">{cat}</span>
            {lead.budget && lead.budget !== "-" && (
              <span className="w-max px-2 py-0.5 rounded bg-[var(--adm-bg)] text-[var(--adm-text-2)] text-[10px] font-semibold mt-0.5">
                {lead.budget}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "pesan",
      label: "Pesan & Info",
      render: (lead: Lead) => (
        <div className="flex flex-col gap-1.5 max-w-[200px]">
          <p 
            className="text-[12px] text-[var(--adm-text-2)] line-clamp-2"
            title={lead.message || "Tidak ada pesan khusus"}
          >
            {lead.message ? `"${lead.message}"` : <span className="italic text-[var(--adm-text-3)]">Tidak ada pesan khusus</span>}
          </p>
          <div className="flex flex-wrap gap-1 mt-0.5">
            {lead.referenceLink && (
              <a href={lead.referenceLink.startsWith('http') ? lead.referenceLink : `https://${lead.referenceLink}`} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-500 hover:underline font-semibold max-w-[100px] truncate" onClick={e => e.stopPropagation()} title={lead.referenceLink}>
                Link Referensi
              </a>
            )}
            {lead.followUpNote && (
              <div className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-semibold inline-flex items-center gap-1 border border-blue-100 max-w-[100px] truncate" title={lead.followUpNote}>
                <Pencil size={8} /> <span className="truncate">{lead.followUpNote}</span>
              </div>
            )}
            {lead.handover && (
              <span className="px-1.5 py-0.5 rounded bg-[var(--adm-bg)] text-[var(--adm-text-2)] text-[10px] font-semibold truncate max-w-[80px]" title={lead.handover}>
                {lead.handover}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "tanggal",
      label: "Tanggal",
      render: (lead: Lead) => (
        <span className="text-[11px] font-medium text-[var(--adm-text-3)] whitespace-nowrap">
          {new Date(lead.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (lead: Lead) => {
        const cfg = STATUS_CONFIG[lead.status] || STATUS_CONFIG.new;
        return (
          <div className="flex items-center gap-2">
            {lead.status === "waiting_dp" && (
              <button
                onClick={(e) => { e.stopPropagation(); setDealLead(lead); }}
                className="inline-flex items-center justify-center text-[var(--adm-success)] hover:opacity-70 active:scale-95 transition-all focus:outline-none"
                title="Tandai Selesai (Deal)"
              >
                <Handshake size={16} strokeWidth={2.5} />
              </button>
            )}
            
            {lead.status === "deal" ? (
              <div className="flex items-center gap-1.5 py-1 text-[11px] font-bold" style={cfg.style}>
                <span>{cfg.label}</span>
                <CheckCircle2 size={13} strokeWidth={2.5} />
              </div>
            ) : (
              <select
                value={lead.status}
                onClick={e => e.stopPropagation()}
                onChange={e => handleQuickStatus(lead, e.target.value)}
                className="text-[11px] font-bold py-1 border-0 bg-transparent cursor-pointer focus:outline-none"
                style={cfg.style}
              >
                <option value="new" className="bg-[var(--adm-card)] text-[var(--adm-text)]">Baru Masuk</option>
                <option value="followup" className="bg-[var(--adm-card)] text-[var(--adm-text)]">Tindak Lanjut</option>
                <option value="waiting_dp" className="bg-[var(--adm-card)] text-[var(--adm-text)]">Menunggu DP</option>
                <option value="deal" className="bg-[var(--adm-card)] text-[var(--adm-text)]">Selesai</option>
                <option value="ghosting" className="bg-[var(--adm-card)] text-[var(--adm-text)]">Batal</option>
              </select>
            )}
          </div>
        );
      }
    },
    {
      key: "aksi",
      label: "Aksi",
      render: (lead: Lead) => (
        <div className="flex items-center gap-1.5">
          <a
            href={getWaLink(lead)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="inline-flex items-center justify-center p-1.5 text-[var(--adm-text-3)] hover:text-[var(--adm-text)] transition-colors focus:outline-none"
            title="Chat via WhatsApp"
          >
            <MessageSquare size={14} strokeWidth={2} />
          </a>
          <button
            onClick={(e) => { e.stopPropagation(); handleEdit(lead); }}
            className="inline-flex items-center justify-center p-1.5 text-[var(--adm-text-3)] hover:text-[var(--adm-text)] transition-colors focus:outline-none"
            title="Edit"
          >
            <Pencil size={14} strokeWidth={2} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); requestDelete(lead.id, false); }}
            className="inline-flex items-center justify-center p-1.5 text-[var(--adm-text-3)] hover:text-[var(--adm-danger)] transition-colors focus:outline-none"
            title="Hapus"
          >
            <Trash2 size={14} strokeWidth={2} />
          </button>
        </div>
      ),
    }
  ];

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
          setNewLead({ name: "", phone: "", company: "", service: "", serviceDetail: "", handover: "", budget: "", status: "new", message: "", followUpNote: "", referenceLink: "" });
          setView("form");
        }}
        addLabel="Prospek Baru"
        addIcon="add"
      />

      {view === "list" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>


          {/* Tabs & Actions Row */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-4 sm:gap-0">
            {/* Tabs Status */}
            <AdminTabs tabs={TABS} activeTab={filter} onTabChange={setFilter} />

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
                </select>
              </div>
            </div>
          </div>

          {/* Lead List Unified Table */}
          <div className="mt-4">
            <AdminTable
              columns={inboxColumns}
              data={filtered}
              keyField="id"
              emptyMessage="Tidak ada prospek ditemukan."
            />
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
                    <input required type="text" value={newLead.name} onChange={e => setNewLead({...newLead, name: e.target.value})} className="w-full px-3 py-2.5 rounded-xl text-sm bg-transparent border border-[var(--adm-border)] text-[var(--adm-text)] focus:outline-none focus:ring-2 focus:ring-[var(--adm-accent)]/30 focus:border-[var(--adm-accent)] transition-colors" placeholder="Masukkan nama lengkap" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold mb-1.5 block text-[var(--adm-text-2)]">Nomor WhatsApp *</label>
                    <div className="flex rounded-xl bg-transparent border border-[var(--adm-border)] focus-within:ring-2 focus-within:ring-[var(--adm-accent)]/30 focus-within:border-[var(--adm-accent)] transition-colors">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-xs font-semibold mb-1.5 block text-[var(--adm-text-2)]">Kategori Layanan</label>
                    <select value={newLead.service} onChange={e => {
                        const val = e.target.value;
                        const newDetail = "";
                        const newBudget = calculateBudget(val, newDetail);
                        setNewLead({...newLead, service: val, serviceDetail: newDetail, budget: newBudget});
                      }} className="w-full px-3 py-2.5 rounded-xl text-sm bg-transparent border border-[var(--adm-border)] text-[var(--adm-text)] focus:outline-none focus:ring-2 focus:ring-[var(--adm-accent)]/30 focus:border-[var(--adm-accent)] transition-colors">
                      <option value="" disabled className="bg-[var(--adm-card)] text-[var(--adm-text-3)]">- Pilih Layanan -</option>
                      <option value="Jasa Website" className="bg-[var(--adm-card)]">Jasa Website</option>
                      <option value="Produk Digital" className="bg-[var(--adm-card)]">Produk Digital</option>
                      <option value="Custom Project" className="bg-[var(--adm-card)]">Custom Project</option>
                      <option value="Jasa Modifikasi" className="bg-[var(--adm-card)]">Jasa Modifikasi</option>
                    </select>
                  </div>
                  
                  {newLead.service === "Jasa Website" ? (
                    <div>
                      <label className="text-xs font-semibold mb-1.5 block text-[var(--adm-text-2)]">Paket Website</label>
                      <select value={newLead.serviceDetail} onChange={e => {
                          const val = e.target.value;
                          const newBudget = calculateBudget(newLead.service, val);
                          setNewLead({...newLead, serviceDetail: val, budget: newBudget});
                        }} className="w-full px-3 py-2.5 rounded-xl text-sm bg-transparent border border-[var(--adm-border)] text-[var(--adm-text)] focus:outline-none focus:ring-2 focus:ring-[var(--adm-accent)]/30 focus:border-[var(--adm-accent)] transition-colors">
                        <option value="" disabled className="bg-[var(--adm-card)] text-[var(--adm-text-3)]">- Pilih Paket -</option>
                        <option value="Paket Usaha" className="bg-[var(--adm-card)]">Paket Usaha</option>
                        <option value="Paket Profesional" className="bg-[var(--adm-card)]">Paket Profesional</option>
                        <option value="Paket Eksklusif" className="bg-[var(--adm-card)]">Paket Eksklusif</option>
                      </select>
                    </div>
                  ) : newLead.service === "Produk Digital" ? (
                    <div>
                      <label className="text-xs font-semibold mb-1.5 block text-[var(--adm-text-2)]">Nama Produk</label>
                      <input type="text" value={newLead.serviceDetail || ""} onChange={e => setNewLead({...newLead, serviceDetail: e.target.value})} className="w-full px-3 py-2.5 rounded-xl text-sm bg-transparent border border-[var(--adm-border)] text-[var(--adm-text)] focus:outline-none focus:ring-2 focus:ring-[var(--adm-accent)]/30 focus:border-[var(--adm-accent)] transition-colors" placeholder="Masukkan nama produk" />
                    </div>
                  ) : newLead.service === "Jasa Modifikasi" ? (
                    <div>
                      <label className="text-xs font-semibold mb-1.5 block text-[var(--adm-text-2)]">Link Website / Referensi</label>
                      <input type="text" value={newLead.referenceLink || ""} onChange={e => setNewLead({...newLead, referenceLink: e.target.value})} className="w-full px-3 py-2.5 rounded-xl text-sm bg-transparent border border-[var(--adm-border)] text-[var(--adm-text)] focus:outline-none focus:ring-2 focus:ring-[var(--adm-accent)]/30 focus:border-[var(--adm-accent)] transition-colors" placeholder="Misal: revtech.id" />
                    </div>
                  ) : null}
                </div>

                <div>
                  <label className="text-xs font-semibold mb-1.5 block text-[var(--adm-text-2)]">Bisnis / Instansi <span className="text-[10px] text-[var(--adm-text-3)] normal-case font-normal">(Opsional)</span></label>
                  <input type="text" value={newLead.company} onChange={e => setNewLead({...newLead, company: e.target.value})} className="w-full px-3 py-2.5 rounded-xl text-sm bg-transparent border border-[var(--adm-border)] text-[var(--adm-text)] focus:outline-none focus:ring-2 focus:ring-[var(--adm-accent)]/30 focus:border-[var(--adm-accent)] transition-colors" placeholder="Masukkan nama bisnis atau instansi (jika ada)" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-xs font-semibold mb-1.5 block text-[var(--adm-text-2)]">
                      {newLead.service === "Produk Digital" ? "Harga Produk" : "Estimasi Budget"}
                    </label>
                    <input 
                      type="text" 
                      value={newLead.budget ? (newLead.budget.startsWith("Rp ") ? newLead.budget : `Rp ${newLead.budget.replace(/[^0-9]/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`) : ""} 
                      onChange={e => {
                        const rawValue = e.target.value.replace(/\D/g, '');
                        if (!rawValue) {
                          setNewLead({...newLead, budget: ""});
                          return;
                        }
                        const formatted = rawValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
                        setNewLead({...newLead, budget: `Rp ${formatted}`});
                      }} 
                      className="w-full px-3 py-2.5 rounded-lg text-sm bg-transparent border border-[var(--adm-border)] text-[var(--adm-text)] focus:outline-none focus:ring-2 focus:ring-[var(--adm-accent)]/30 focus:border-[var(--adm-accent)]" 
                      placeholder="Rp 0" 
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold mb-1.5 block text-[var(--adm-text-2)]">Status Saat Ini</label>
                    <select value={newLead.status} onChange={e => setNewLead({...newLead, status: e.target.value})} className="w-full px-3 py-2.5 rounded-lg text-sm bg-transparent border border-[var(--adm-border)] text-[var(--adm-text)] focus:outline-none focus:ring-2 focus:ring-[var(--adm-accent)]/30 focus:border-[var(--adm-accent)]">
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
                    <input type="text" value={newLead.referenceLink} onChange={e => setNewLead({...newLead, referenceLink: e.target.value})} className="w-full px-3 py-2.5 rounded-xl text-sm bg-transparent border border-[var(--adm-border)] text-[var(--adm-text)] focus:outline-none focus:ring-2 focus:ring-[var(--adm-accent)]/30 focus:border-[var(--adm-accent)] transition-colors" placeholder="Masukkan link referensi..." />
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold mb-1.5 block text-[var(--adm-text-2)]">Pesan / Kebutuhan Klien</label>
                  <textarea rows={3} value={newLead.message} onChange={e => setNewLead({...newLead, message: e.target.value})} className="w-full px-3 py-2.5 rounded-xl text-sm bg-transparent border border-[var(--adm-border)] text-[var(--adm-text)] focus:outline-none focus:ring-2 focus:ring-[var(--adm-accent)]/30 focus:border-[var(--adm-accent)] transition-colors resize-none" placeholder={newLead.service === "Custom Project" ? "Ceritakan ide sistem, web app, atau solusi custom yang Anda butuhkan secara singkat..." : "Tuliskan kebutuhan spesifik dari klien..."} />
                </div>

                {/* Progressive Disclosure: Hanya tampilkan Catatan Follow-up jika status bukan Baru Masuk */}
                {newLead.status !== "new" && (
                  <div className="p-4 bg-[var(--adm-warning)]/5 rounded-xl border border-[var(--adm-warning)]/20 mt-4">
                    <label className="text-xs font-semibold mb-1.5 block text-[var(--adm-warning)] uppercase tracking-wide">Catatan Follow-up Internal</label>
                    <input type="text" value={newLead.followUpNote} onChange={e => setNewLead({...newLead, followUpNote: e.target.value})} className="w-full px-3 py-2.5 rounded-xl text-sm bg-transparent border border-[var(--adm-border)] text-[var(--adm-text)] focus:outline-none focus:ring-1 focus:ring-[var(--adm-warning)] transition-colors" placeholder="Cth: Klien mau diingatkan lagi Senin depan" />
                  </div>
                )}

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button type="button" onClick={() => setView("list")} className="px-5 py-2 rounded-lg font-semibold text-[var(--adm-text-2)] bg-transparent hover:text-[var(--adm-text)] transition-colors text-sm">Batal</button>
                  <button type="submit" className="px-5 py-2 rounded-lg bg-[var(--adm-accent)] text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm">
                    {editingId ? "Simpan Perubahan" : "Simpan ke Leads"}
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
      <AdminModal isOpen={!!deletingId} onClose={() => setDeletingId(null)} maxWidth="max-w-sm">
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
            className="flex-1 py-2 text-sm font-semibold text-[var(--adm-text-2)] bg-transparent hover:text-[var(--adm-text)] rounded-xl transition-colors"
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
      </AdminModal>

      <AdminModal isOpen={!!pendingStatusChange} onClose={() => setPendingStatusChange(null)} maxWidth="max-w-sm">
        <div className="flex flex-col -mx-6 -mt-6">
          <div className="p-5">
            <div className="w-12 h-12 rounded-full bg-[var(--adm-warning)]/20 flex items-center justify-center mb-4 text-[var(--adm-warning)]">
              <AlertTriangle size={24} strokeWidth={2.5} />
            </div>
            <h2 className="text-lg font-bold text-[var(--adm-text)] mb-2">Yakin Mengubah Status?</h2>
            <p className="text-sm text-[var(--adm-text-2)] leading-relaxed">
              Prospek ini sebelumnya berstatus <strong>
                {pendingStatusChange?.from === "list" 
                  ? (pendingStatusChange?.lead?.status === "deal" ? "Selesai" : "Batal") 
                  : (leads.find(l => l.id === editingId)?.status === "deal" ? "Selesai" : "Batal")}
              </strong>. Mengubah statusnya akan mengembalikannya ke pipeline aktif. Apakah Anda yakin?
            </p>
          </div>
          <div className="p-4 bg-[var(--adm-card)] border-t border-[var(--adm-border)] flex gap-3 rounded-b-2xl">
            <button onClick={() => setPendingStatusChange(null)} className="flex-1 px-4 py-2 text-sm font-bold text-[var(--adm-text-2)] bg-transparent border border-[var(--adm-border)] rounded-xl hover:text-[var(--adm-text)] transition-colors">Batal</button>
            <button onClick={() => {
              if (pendingStatusChange?.from === "form") {
                handleAddLead(undefined, true);
              } else if (pendingStatusChange?.from === "list" && pendingStatusChange.lead && pendingStatusChange.newStatus) {
                handleQuickStatus(pendingStatusChange.lead, pendingStatusChange.newStatus, true);
              }
            }} className="flex-1 px-4 py-2 text-sm font-bold bg-[var(--adm-warning)] text-white rounded-xl hover:opacity-90 transition-opacity">Ya, Ubah Status</button>
          </div>
        </div>
      </AdminModal>


    </div>
  );
}
