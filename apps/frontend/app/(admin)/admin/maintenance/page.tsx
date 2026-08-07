"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader, StatusBadge, AdminTable, AdminToolbar } from "@/components/admin/ui";
import { SlidersHorizontal, ChevronDown, AlertTriangle, Filter, CheckCircle2, Globe, Calendar, MessageSquare, Pencil, Trash2, RefreshCw, AlertCircle, Server, Wand2, MoreHorizontal, X } from "lucide-react";
import rawClients from "@/data/admin/clients.json";
import { CountrySelector } from "@/components/ui/CountrySelector";
import { countries as COUNTRIES } from "@/lib/countries";

const SERVICE_TABS = ["Semua", "Jasa Website", "Produk Digital", "Custom Project"];

interface Client {
  id: string;
  name: string;
  contact: string;
  phone: string;
  email: string;
  website: string | null;
  websiteStatus: "active" | "down";
  joinDate: string;
  totalSpend: number;
  activeProjects: number;
  domain: string | null;
  domainExpiry: string | null;
  hosting: string | null;
  hostingExpiry: string | null;
  service?: string;
  handover?: string;
  recurringFee?: number;
  unpaidFee?: number;
  modificationsQuota?: number;
}

function formatRp(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);
}

function daysUntil(dateStr: string | null) {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

const fadeUp = (i: number) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { delay: i * 0.06, type: "spring" as const, stiffness: 300, damping: 24 } },
});

const EMPTY_FORM = {
  name: "", contact: "", phone: "", email: "",
  website: "", domain: "", domainExpiry: "",
  hosting: "", hostingExpiry: "", websiteStatus: "active" as "active" | "down", service: "",
  handover: "", recurringFee: 0, modificationsQuota: 0
};

function ClientCard({ client, index, onEdit, onDelete, onRenew, onMessageClick, onUseMod }: { client: Client; index: number; onEdit: () => void; onDelete: () => void; onRenew: () => void; onMessageClick: () => void; onUseMod: () => void; }) {
  const [showMenu, setShowMenu] = useState(false);
  const getStatusColor = (status: string) => status === "active" ? "var(--adm-success)" : "var(--adm-danger)";
  const statusLabel = client.websiteStatus === "active" ? "Aktif" : "Down";

  const daysLeft = daysUntil(client.domainExpiry);
  let daysText = "";
  let daysColor = "text-[var(--adm-text)]";
  if (daysLeft !== null) {
    if (daysLeft > 30) {
      daysText = `${daysLeft} hari lagi`;
      daysColor = "text-emerald-400";
    } else if (daysLeft > 7) {
      daysText = `${daysLeft} hari lagi`;
      daysColor = "text-amber-400";
    } else if (daysLeft > 0) {
      daysText = `${daysLeft} hari lagi`;
      daysColor = "text-orange-500";
    } else if (daysLeft === 0) {
      daysText = `Hari ini!`;
      daysColor = "text-red-500";
    } else {
      daysText = `Lewat ${Math.abs(daysLeft)} hari`;
      daysColor = "text-red-500";
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0, transition: { delay: index * 0.04, type: "spring", stiffness: 300, damping: 28 } }}
      className="bg-[var(--adm-card)] rounded-2xl shadow-[var(--adm-shadow)] p-5 flex flex-col gap-4 border border-[var(--adm-border)] hover:border-blue-500/30 transition-colors group"
    >
      {/* Top Row: Info */}
      <div className="flex justify-between items-start gap-4">
        <div className="flex flex-col gap-1.5 min-w-0">
          <div className="flex items-start flex-wrap min-w-0">
            <h3 className="text-[16px] font-bold text-[var(--adm-text)] truncate max-w-full">
              {client.name}
              {client.handover && (
                <sup className="ml-1 text-blue-500 text-[9px] font-extrabold uppercase tracking-widest">
                  {client.handover.includes("Basic") ? "Basic" : client.handover.includes("Plus") ? "Plus" : client.handover}
                </sup>
              )}
            </h3>
          </div>
          {client.website || client.domain ? (
            <a href={((client.website || client.domain) ?? undefined)?.startsWith('http') ? (client.website || client.domain) ?? undefined : `https://${client.website || client.domain}`} target="_blank" rel="noopener noreferrer" className="text-[13px] text-blue-500 hover:underline truncate max-w-xs" onClick={e => e.stopPropagation()}>
              {client.website || client.domain}
            </a>
          ) : <span className="text-[13px] italic text-[var(--adm-text-3)]">Tidak ada link</span>}
        </div>
        {/* Top Right: Actions, Status Badge & Tagihan */}
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <div className="flex items-center gap-3">
            {(client.modificationsQuota ?? 0) > 0 && (
              <button onClick={(e) => { e.stopPropagation(); onUseMod(); }} className="inline-flex items-center justify-center text-[var(--adm-text-3)] hover:text-[var(--adm-success)] transition-colors focus:outline-none" title="Gunakan Revisi">
                <Wand2 size={15} strokeWidth={2.5} />
              </button>
            )}
            <div className="flex items-center gap-1.5 text-[11px] font-bold" style={{ color: getStatusColor(client.websiteStatus) }}>
              <span>{statusLabel}</span>
              {client.websiteStatus === "active" ? <CheckCircle2 size={13} strokeWidth={2.5} /> : <AlertTriangle size={13} strokeWidth={2.5} />}
            </div>
          </div>
          
        </div>
      </div>

      {/* Bottom Row: Billing Date & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-[var(--adm-border)] mt-1">
        <div className="flex items-center gap-4 shrink-0">
          <div className="flex flex-col gap-0.5 shrink-0">
            {client.domainExpiry ? (
              <>
                {daysText && <span className={`text-[13px] font-bold whitespace-nowrap ${daysColor}`}>{daysText}</span>}
                <span className="text-[11px] text-[var(--adm-text-2)] font-medium tracking-wide whitespace-nowrap">
                  {new Date(client.domainExpiry).toLocaleDateString("id-ID", { day: 'numeric', month: 'numeric', year: 'numeric' })}
                </span>
              </>
            ) : (
              <span className="text-[12px] italic text-[var(--adm-text-2)] mt-1">Belum ada info tagihan</span>
            )}
          </div>
          
          {client.recurringFee ? (
            <div className="h-6 w-px bg-[var(--adm-border)] hidden sm:block mx-1"></div>
          ) : null}
          
          {client.recurringFee ? (
            <div className="text-[13px] text-[var(--adm-text)] font-bold whitespace-nowrap">
              {formatRp(client.recurringFee)}
            </div>
          ) : null}

          {(client.unpaidFee ?? 0) > 0 ? (
            <div className="text-[11px] font-bold text-red-500 ml-2">
              Kurang: {formatRp(client.unpaidFee!)}
            </div>
          ) : null}
        </div>

        {/* Actions Expandable Pill */}
        <div 
          className={`flex items-center shrink-0 overflow-hidden transition-all duration-300 ease-out ${
            showMenu 
              ? 'bg-[var(--adm-bg)] border border-[var(--adm-border)] shadow-sm rounded-full pl-1' 
              : 'bg-transparent border border-transparent'
          }`}
        >
          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "auto", opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-0.5 whitespace-nowrap"
              >
                {client.domainExpiry && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); setShowMenu(false); onRenew(); }} 
                    className="inline-flex items-center justify-center p-2 text-[var(--adm-text-3)] hover:text-[var(--adm-success)] rounded-full transition-colors focus:outline-none shrink-0"
                    title="Perpanjang Layanan"
                  >
                    <RefreshCw size={15} strokeWidth={2.5} />
                  </button>
                )}
                <button 
                  onClick={(e) => { e.stopPropagation(); setShowMenu(false); onMessageClick(); }} 
                  className="inline-flex items-center justify-center p-2 text-[var(--adm-text-3)] hover:text-[var(--adm-text)] rounded-full transition-colors focus:outline-none shrink-0"
                  title="Detail & Pesan"
                >
                  <MessageSquare size={15} strokeWidth={2.5} />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); setShowMenu(false); onEdit(); }} 
                  className="inline-flex items-center justify-center p-2 text-[var(--adm-text-3)] hover:text-[var(--adm-text)] rounded-full transition-colors focus:outline-none shrink-0"
                  title="Edit Data"
                >
                  <Pencil size={15} strokeWidth={2.5} />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); setShowMenu(false); onDelete(); }} 
                  className="inline-flex items-center justify-center p-2 text-[var(--adm-text-3)] hover:text-[var(--adm-danger)] rounded-full transition-colors focus:outline-none shrink-0"
                  title="Hapus"
                >
                  <Trash2 size={15} strokeWidth={2.5} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }} 
            className={`inline-flex items-center justify-center p-2 rounded-full transition-colors focus:outline-none shrink-0 ${
              showMenu 
                ? 'text-[var(--adm-text)]' 
                : 'text-[var(--adm-text-3)] hover:text-[var(--adm-text)]'
            }`}
          >
            {showMenu ? <X size={16} strokeWidth={2.5} /> : <MoreHorizontal size={18} strokeWidth={2.5} />}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function MaintenancePage() {
  const [isClient, setIsClient] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [tabFilter, setTabFilter] = useState("all");
  const [sortBy, setSortBy] = useState("Terbaru");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [view, setView] = useState<"list" | "form">("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [renewingClient, setRenewingClient] = useState<Client | null>(null);
  const [renewForm, setRenewForm] = useState<{ amountPaid: number; newExpiryDate: string }>({ amountPaid: 0, newExpiryDate: "" });
  const [toastMessage, setToastMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);
  const [usingModId, setUsingModId] = useState<string | null>(null);
  const [modNotes, setModNotes] = useState("");
  const [modDeadline, setModDeadline] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [selectedMsgCountry, setSelectedMsgCountry] = useState(COUNTRIES[0]);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    setIsClient(true);
    const savedClients = localStorage.getItem("revtech_clients");
    let currentClients: Client[] = savedClients ? JSON.parse(savedClients) : [];
    
    // Auto-sync from finished orders
    const savedOrders = localStorage.getItem("revtech_orders");
    if (savedOrders) {
      const orders = JSON.parse(savedOrders);
      const finishedOrders = orders.filter((o: any) => o.status === "selesai");

      let changed = false;
      finishedOrders.forEach((o: any) => {
        const isTerimaBeres = o.handoverOption?.includes("Terima Beres");

        // Derive domain from handover link (e.g. "https://majujaya.com" → "majujaya.com")
        let derivedDomain: string | null = null;
        if (o.handover) {
          try {
            derivedDomain = new URL(o.handover.startsWith("http") ? o.handover : `https://${o.handover}`).hostname;
          } catch {
            derivedDomain = o.handover;
          }
        }

        const builtClient: Client = {
          id: o.id,
          name: o.company || o.client,
          contact: o.client,
          phone: o.phone,
          email: "",
          website: (o.handover && o.handover.startsWith("http")) ? o.handover : (derivedDomain ? `https://${derivedDomain}` : null),
          websiteStatus: "active",
          joinDate: (o.createdAt || "").split("T")[0],
          totalSpend: o.total || 0,
          activeProjects: 0,
          domain: derivedDomain,
          domainExpiry: o.nextBillingDate || null,
          hosting: isTerimaBeres ? "RevTech Managed" : null,
          hostingExpiry: isTerimaBeres ? (o.nextBillingDate || null) : null,
          service: o.service,
          handover: o.handoverOption || undefined,
          recurringFee: o.recurringFee || undefined,
        };

        const existing = currentClients.find(c => c.id === o.id);
        if (!existing) {
          if (isTerimaBeres) {
            changed = true;
            currentClients.unshift(builtClient);
          }
        } else {
          if (!isTerimaBeres) {
            changed = true;
            currentClients = currentClients.filter(c => c.id !== o.id);
          } else {
            // Fix previous bug where name and contact were swapped
            if (existing.name === o.client && existing.contact === (o.company || o.client) && o.company) {
              changed = true;
              existing.name = o.company;
              existing.contact = o.client;
            }
          }
        }
      });

      if (changed) {
        localStorage.setItem("revtech_clients", JSON.stringify(currentClients));
      }
    }
    
    // Monthly Auto-Reset Quota for Plus Clients
    const currentMonth = new Date().toISOString().slice(0, 7);
    const savedMonth = localStorage.getItem("revtech_last_quota_reset_month");
    
    if (savedMonth !== currentMonth) {
      let resetOccurred = false;
      currentClients = currentClients.map(c => {
        if ((c.handover || "").toLowerCase().includes("plus")) {
          if (c.modificationsQuota !== 1) {
             resetOccurred = true;
             return { ...c, modificationsQuota: 1 };
          }
        }
        return c;
      });
      
      localStorage.setItem("revtech_last_quota_reset_month", currentMonth);
      if (resetOccurred || !savedClients) {
        localStorage.setItem("revtech_clients", JSON.stringify(currentClients));
      }
    }

    setClients(currentClients);
    if (!savedClients && savedMonth === currentMonth) localStorage.setItem("revtech_clients", JSON.stringify(currentClients));
  }, []);

  function save(updated: Client[]) {
    setClients(updated);
    localStorage.setItem("revtech_clients", JSON.stringify(updated));
  }

  function handleEdit(c: Client) {
    setForm({
      name: c.name, contact: c.contact, phone: c.phone, email: c.email,
      website: c.website || "", domain: c.domain || "",
      domainExpiry: c.domainExpiry || "", hosting: c.hosting || "",
      hostingExpiry: c.hostingExpiry || "", websiteStatus: c.websiteStatus, service: c.service || "",
      handover: c.handover || "", recurringFee: c.recurringFee || 0,
      modificationsQuota: c.modificationsQuota || 0
    });
    setEditingId(c.id);
    setSelectedClient(null);
    setView("form");
  }

  function handleRenew(c: Client) {
    if (!c.domainExpiry) return;
    setRenewingClient(c);
    const nextYear = new Date(c.domainExpiry);
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    setRenewForm({
      amountPaid: c.recurringFee || 0,
      newExpiryDate: nextYear.toISOString().split("T")[0]
    });
  }

  function confirmRenew() {
    if (!renewingClient || !renewingClient.domainExpiry) return;
    const c = renewingClient;

    let updatedHostingExpiry = c.hostingExpiry;
    if (c.hostingExpiry) {
      const hExpiry = new Date(c.hostingExpiry!);
      hExpiry.setFullYear(hExpiry.getFullYear() + 1);
      updatedHostingExpiry = hExpiry.toISOString().split("T")[0];
    }

    const sisa = (c.recurringFee || 0) - renewForm.amountPaid;
    const finalUnpaidFee = Math.max(0, (c.unpaidFee || 0) + sisa);

    const updatedClient = {
      ...c,
      domainExpiry: renewForm.newExpiryDate,
      hostingExpiry: updatedHostingExpiry,
      websiteStatus: "active" as "active", // Pastikan status aktif
      totalSpend: (c.totalSpend || 0) + renewForm.amountPaid, // Tambahkan tagihan ke total pengeluaran
      unpaidFee: finalUnpaidFee,
      modificationsQuota: (c.handover || "").toLowerCase().includes("plus") ? 1 : (c.modificationsQuota || 0),
    };

    save(clients.map(client => client.id === c.id ? updatedClient : client));
    
    if (selectedClient && selectedClient.id === c.id) {
      setSelectedClient(updatedClient);
    }
    
    setRenewingClient(null);
    showToast(`Layanan ${c.name} berhasil diperpanjang`);
  }

  function handleDelete(id: string) {
    save(clients.filter(c => c.id !== id));
    
    // Cascade delete: hapus tagihan maintenance terkait
    try {
      const savedInvoices = localStorage.getItem("revtech_invoices");
      if (savedInvoices) {
        let invoiceList = JSON.parse(savedInvoices);
        invoiceList = invoiceList.filter((i: any) => i.orderId !== id);
        localStorage.setItem("revtech_invoices", JSON.stringify(invoiceList));
      }
    } catch (err) {
      console.error("Failed to cascade delete invoices from maintenance", err);
    }

    setDeletingId(null);
    if (selectedClient?.id === id) setSelectedClient(null);
    showToast("Data klien beserta tagihannya berhasil dihapus");
  }

  function handleMessageClick(c: Client) {
    setSelectedClient(c);
  }

  function confirmUseMod() {
    if (!usingModId) return;
    const clientName = clients.find(c => c.id === usingModId)?.name || "Klien";
    
    save(clients.map(c => {
      if (c.id === usingModId) {
        return { ...c, modificationsQuota: Math.max(0, (c.modificationsQuota || 0) - 1) };
      }
      return c;
    }));
    
    // Auto Create Order for tracking
    const savedOrders = localStorage.getItem("revtech_orders");
    const orders = savedOrders ? JSON.parse(savedOrders) : [];
    
    const clientData = clients.find(c => c.id === usingModId);
    
    const newOrder = {
      id: `ORD-${Date.now().toString().slice(-5)}`,
      client: clientName,
      company: clientData?.name || "",
      service: "Jasa Modifikasi",
      status: "antrean",
      dp: 0,
      total: 0,
      phone: clientData?.phone || "",
      createdAt: new Date().toISOString(),
      deadline: modDeadline || null,
      handover: clientData?.website || clientData?.domain || "",
      notes: modNotes || "Menggunakan kuota revisi maintenance."
    };
    
    orders.unshift(newOrder);
    localStorage.setItem("revtech_orders", JSON.stringify(orders));
    
    setUsingModId(null);
    setModNotes("");
    setModDeadline("");
    showToast("Revisi dicatat dan masuk ke Antrean Pesanan!");
  }

  function updateSelectedClient(field: keyof Client, value: any) {
    if (!selectedClient) return;
    const updatedClient = { ...selectedClient, [field]: value };
    setSelectedClient(updatedClient);
    save(clients.map(c => c.id === updatedClient.id ? updatedClient : c));
  }

  function getAutoDraft(c: Client | null) {
    if (!c) return "";
    let draft = "";
    const days = daysUntil(c.domainExpiry);
    if (c.domainExpiry && days !== null && days <= 60) {
      draft = `Halo Kak dari tim ${c.name},\n\nSemoga kabarnya baik! Kami dari RevTech ingin menginformasikan bahwa layanan ${c.service || "Website"} untuk domain ${c.domain || c.website} akan jatuh tempo pada ${new Date(c.domainExpiry).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}.\n\nBiaya perpanjangan layanan untuk 1 tahun ke depan adalah ${formatRp(c.recurringFee || 0)}.\n\nMohon konfirmasinya ya Kak. Terima kasih!`;
    } else {
      draft = `Halo Kak dari tim ${c.name},\n\nSemoga kabarnya baik! Kami dari RevTech ingin menyapa sekaligus memastikan apakah layanan ${c.service || "Website"} untuk domain ${c.domain || c.website} sejauh ini berjalan lancar?\n\nJika ada yang perlu dibantu, jangan ragu untuk mengabari kami ya.`;
    }
    return draft;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    let updated = [...clients];
    if (editingId) {
      updated = clients.map(c => c.id === editingId ? {
        ...c, name: form.name, contact: form.contact, phone: form.phone,
        email: form.email, website: form.website || null, domain: form.domain || null,
        domainExpiry: form.domainExpiry || null, hosting: form.hosting || null,
        hostingExpiry: form.hostingExpiry || null, websiteStatus: form.websiteStatus, service: form.service || undefined,
        handover: form.handover || undefined, recurringFee: form.recurringFee || undefined,
        modificationsQuota: typeof form.modificationsQuota === 'number' ? form.modificationsQuota : undefined
      } : c);

      // Sinkronisasi perubahan ke invoice yang berstatus pending (jika ada)
      try {
        const savedInvoices = localStorage.getItem("revtech_invoices");
        if (savedInvoices) {
          let invoiceList = JSON.parse(savedInvoices);
          let invoiceChanged = false;
          invoiceList = invoiceList.map((inv: any) => {
            // Update invoice jika orderId cocok, type "maintenance", dan status belum dibayar
            if (inv.orderId === editingId && inv.type === "maintenance" && inv.status === "pending") {
              invoiceChanged = true;
              return {
                ...inv,
                client: form.contact || form.name,
                company: form.name,
                service: form.service || inv.service,
                phone: form.phone || inv.phone,
                amount: typeof form.recurringFee === "number" ? form.recurringFee : inv.amount
              };
            }
            return inv;
          });
          if (invoiceChanged) {
            localStorage.setItem("revtech_invoices", JSON.stringify(invoiceList));
            // Trigger event for other tabs to catch up (optional)
            window.dispatchEvent(new Event("storage"));
          }
        }
      } catch (err) {
        console.error("Failed to sync invoice updates from maintenance edit", err);
      }
    } else {
      updated = [{
        id: `CLN-${Date.now().toString().slice(-5)}`,
        name: form.name, contact: form.contact, phone: form.phone,
        email: form.email, website: form.website || null, domain: form.domain || null,
        domainExpiry: form.domainExpiry || null, hosting: form.hosting || null,
        hostingExpiry: form.hostingExpiry || null, websiteStatus: form.websiteStatus,
        joinDate: new Date().toISOString().split("T")[0],
        totalSpend: 0, activeProjects: 0, service: form.service || undefined,
        handover: form.handover || undefined, recurringFee: form.recurringFee || undefined,
        modificationsQuota: typeof form.modificationsQuota === 'number' ? form.modificationsQuota : ((form.handover || "").toLowerCase().includes("plus") ? 1 : 0)
      }, ...clients];
    }
    save(updated);
    setView("list");
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  const filtered = clients.filter(c => {
    const isMaintenance = Boolean(c.domainExpiry) || Boolean(c.recurringFee && c.recurringFee > 0) || Boolean(c.handover?.includes("Terima Beres"));
    const days = daysUntil(c.domainExpiry);
    const matchTab = tabFilter === "all" || 
      (tabFilter === "kritis" ? (days !== null && days <= 14) : 
      tabFilter === "segera" ? (days !== null && days > 14 && days <= 60) : true);
      
    const matchStatus = statusFilter === "Semua" || (
      statusFilter === "Aktif" ? c.websiteStatus === "active" :
      c.websiteStatus === "down"
    );
    const matchSearch = !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.contact.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase());
    return isMaintenance && matchTab && matchStatus && matchSearch;
  });

  let sortedData = [...filtered];
  if (sortBy === "Terlama") {
    sortedData.sort((a, b) => new Date(a.joinDate).getTime() - new Date(b.joinDate).getTime());
  } else if (sortBy === "Kadaluarsa") {
    sortedData.sort((a, b) => {
      const aTime = a.domainExpiry ? new Date(a.domainExpiry).getTime() : Infinity;
      const bTime = b.domainExpiry ? new Date(b.domainExpiry).getTime() : Infinity;
      return aTime - bTime;
    });
  } else {
    // Terbaru (Default for all other statuses)
    sortedData.sort((a, b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime());
  }

  const expiringDomains = clients.filter(c => {
    const days = daysUntil(c.domainExpiry);
    return days !== null && days <= 60;
  });

  if (!isClient) return null;

  return (
    <div>
      {/* Toolbar */}
      {/* Toolbar */}
      <AdminToolbar
        view={view}
        onBack={() => setView("list")}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari nama bisnis..."
        dropdown={
          <div className="relative flex items-center shrink-0">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none bg-transparent py-2.5 pl-4 pr-8 text-sm font-semibold text-[var(--adm-text)] focus:outline-none cursor-pointer w-full"
            >
              <option value="Semua" className="bg-[var(--adm-card)] text-[var(--adm-text)]">Semua Status</option>
              <option value="Aktif" className="bg-[var(--adm-card)] text-[var(--adm-text)]">Aktif</option>
              <option value="Down" className="bg-[var(--adm-card)] text-[var(--adm-text)]">Down</option>
            </select>
            <div className="pointer-events-none absolute right-3">
              <ChevronDown size={14} strokeWidth={2.5} className="text-[var(--adm-text-3)]" />
            </div>
          </div>
        }
        onAdd={() => { setEditingId(null); setForm(EMPTY_FORM); setView("form"); }}
        addLabel="Tambah Data"
        addIcon="add"
      />

          {view === "list" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          {/* Tabs & Actions Row */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-4 sm:gap-0">
            {/* Tabs Status (Underline Style) */}
            <div className="flex items-center gap-6 overflow-x-auto overflow-y-hidden scrollbar-hide w-full sm:w-auto border-b border-[var(--adm-border)] sm:border-0 sm:flex-1">
              {[
                { id: "all", label: "Semua", count: clients.filter(c => Boolean(c.domainExpiry) || Boolean(c.recurringFee && c.recurringFee > 0)).length },
                { id: "kritis", label: "Kritis (≤14 Hari)", count: clients.filter(c => c.domainExpiry && daysUntil(c.domainExpiry) !== null && daysUntil(c.domainExpiry)! <= 14).length },
                { id: "segera", label: "Segera (≤60 Hari)", count: clients.filter(c => c.domainExpiry && daysUntil(c.domainExpiry) !== null && daysUntil(c.domainExpiry)! > 14 && daysUntil(c.domainExpiry)! <= 60).length },
              ].map((t) => {
                const active = tabFilter === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTabFilter(t.id)}
                    className={`shrink-0 pb-3 text-sm font-semibold transition-all flex items-center gap-2 border-b-2 -mb-px sm:mb-0 sm:-mb-[2px] ${
                      active
                        ? "border-red-500 text-red-500"
                        : "border-transparent text-[var(--adm-text-2)] hover:text-[var(--adm-text)]"
                    }`}
                  >
                    {t.label}
                    {t.count > 0 && (
                      <span className={`px-1.5 py-0.5 text-[10px] rounded-full ${active ? "bg-red-500 text-white" : "bg-[var(--adm-bg)] text-[var(--adm-text-2)]"}`}>
                        {t.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            
            {/* Actions Row */}
            <div className="flex items-center gap-4 shrink-0 pb-2.5 px-1 sm:px-0">
              
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
                  <option value="Terbaru" className="bg-[var(--adm-card)] text-[var(--adm-text)]" dir="ltr">Terbaru</option>
                  <option value="Terlama" className="bg-[var(--adm-card)] text-[var(--adm-text)]" dir="ltr">Terlama</option>
                  <option value="Kadaluarsa" className="bg-[var(--adm-card)] text-[var(--adm-text)]" dir="ltr">Kadaluarsa Terdekat</option>
                </select>
              </div>
              </div>
            </div>
          <motion.div {...fadeUp(1)} className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4">
            {sortedData.length > 0 ? (
              sortedData.map((c, i) => (
                  <ClientCard
                    key={c.id}
                    client={c}
                    index={i}
                    onEdit={() => handleEdit(c)}
                    onDelete={() => setDeletingId(c.id)}
                    onRenew={() => handleRenew(c)}
                    onMessageClick={() => handleMessageClick(c)}
                    onUseMod={() => setUsingModId(c.id)}
                  />
              ))
            ) : (
              <div className="col-span-full py-24 flex flex-col items-center justify-center text-center px-4">
                <span className="material-symbols-outlined text-[48px] text-[var(--adm-text-3)] mb-4">group_off</span>
                <p className="text-[14px] text-[var(--adm-text-2)]">Tidak ada klien ditemukan.</p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}

      {/* Form Tambah / Edit */}
      {view === "form" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
          <div className="bg-[var(--adm-card)] rounded-2xl border border-[var(--adm-border)] p-6 sm:p-8 shadow-[var(--adm-shadow)]">
            <h2 className="text-xl font-bold text-[var(--adm-text)] mb-6">{editingId ? "Edit Data Klien" : "Tambah Klien Baru"}</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-semibold text-[var(--adm-text-2)] mb-1.5 block">Nama Bisnis / Instansi *</label>
                  <input required type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-[var(--adm-border)] bg-transparent text-[var(--adm-text)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="Masukkan nama bisnis / instansi" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--adm-text-2)] mb-1.5 block">Status Website</label>
                  <select value={form.websiteStatus} onChange={e => setForm({ ...form, websiteStatus: e.target.value as "active" | "down" })} className="w-full px-3 py-2.5 rounded-xl border border-[var(--adm-border)] bg-transparent text-[var(--adm-text)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                    <option value="active" className="bg-[var(--adm-card)]">Aktif</option>
                    <option value="down" className="bg-[var(--adm-card)]">Down</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-semibold text-[var(--adm-text-2)] mb-1.5 block">Alamat Website</label>
                  <input type="text" value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-[var(--adm-border)] bg-transparent text-[var(--adm-text)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="Masukkan alamat website" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--adm-text-2)] mb-1.5 block">Nomor WhatsApp</label>
                  <div className="flex rounded-xl bg-transparent focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all border border-[var(--adm-border)]">
                    <CountrySelector selected={selectedCountry} onSelect={setSelectedCountry} theme="admin" />
                    <input 
                      type="text" 
                      value={form.phone ? form.phone.replace(new RegExp(`^${selectedCountry.dial_code.replace('+', '')}`), '') : ''} 
                      onChange={e => {
                        const val = e.target.value.replace(/\D/g, '');
                        const cleanVal = val.startsWith('0') ? val.substring(1) : val;
                        const code = selectedCountry.dial_code.replace('+', '');
                        setForm({ ...form, phone: cleanVal ? `${code}${cleanVal}` : '' });
                      }} 
                      className="w-full px-3 py-2.5 text-sm bg-transparent border-0 text-[var(--adm-text)] focus:outline-none focus:ring-0 placeholder-[var(--adm-text-3)]" 
                      placeholder={selectedCountry.code === 'ID' ? "8123456..." : "123456789..."} 
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="text-xs font-semibold text-[var(--adm-text-2)] mb-1.5 block">Serah Terima</label>
                    <select value={form.handover || ""} onChange={e => setForm({ ...form, handover: e.target.value })} className="w-full pl-3 pr-8 py-2.5 rounded-xl border border-[var(--adm-border)] bg-transparent text-[var(--adm-text)] text-sm truncate focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                      <option value="" disabled className="bg-[var(--adm-card)] text-[var(--adm-text-3)]">- Pilih Opsi -</option>
                      <option value="Terima Beres (Basic)" className="bg-[var(--adm-card)]">Terima Beres (Basic)</option>
                      <option value="Terima Beres (Plus)" className="bg-[var(--adm-card)]">Terima Beres (Plus)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[var(--adm-text-2)] mb-1.5 block">Jatah Revisi</label>
                    <input type="number" min="0" value={form.modificationsQuota !== undefined ? form.modificationsQuota : ""} onChange={e => setForm({ ...form, modificationsQuota: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2.5 rounded-xl border border-[var(--adm-border)] bg-transparent text-[var(--adm-text)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="0" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[var(--adm-text-2)] mb-1.5 block">Tanggal Tagihan</label>
                    <input type="date" value={form.domainExpiry} onChange={e => setForm({ ...form, domainExpiry: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-[var(--adm-border)] bg-transparent text-[var(--adm-text)] text-[var(--adm-text-3)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[var(--adm-text-2)] mb-1.5 block">Nominal Tagihan</label>
                    <input 
                      type="text" 
                      value={form.recurringFee ? `Rp ${form.recurringFee.toLocaleString('id-ID')}` : ""} 
                      onChange={e => {
                        const val = parseInt(e.target.value.replace(/\D/g, ''));
                        setForm({ ...form, recurringFee: isNaN(val) ? 0 : val });
                      }} 
                      className="w-full px-3 py-2.5 rounded-xl border border-[var(--adm-border)] bg-transparent text-[var(--adm-text)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" 
                      placeholder="Rp 0" 
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--adm-border)]">
                <button type="button" onClick={() => setView("list")} className="px-5 py-2.5 rounded-xl font-semibold text-[var(--adm-text-2)] bg-transparent hover:text-[var(--adm-text)] transition-colors text-sm">Batal</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl font-semibold bg-[var(--adm-accent)] text-white hover:opacity-90 transition-colors shadow-sm text-sm">{editingId ? "Simpan Perubahan" : "Tambah Klien"}</button>
              </div>
            </form>
          </div>
        </motion.div>
      )}

      {/* Client detail popup */}
      <AnimatePresence>
        {selectedClient && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 flex items-center justify-center p-4"
            onClick={() => setSelectedClient(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={e => e.stopPropagation()}
              className="bg-[var(--adm-card)] max-w-md w-full rounded-2xl shadow-2xl overflow-hidden border border-[var(--adm-border)]"
            >
              <div className="flex items-center justify-between p-5 border-b border-[var(--adm-border)]">
                <h2 className="text-base font-bold text-[var(--adm-text)]">{selectedClient.name}</h2>
                <div className="flex items-center gap-2">
                  <button id="close-client-drawer" onClick={() => setSelectedClient(null)} className="p-1.5 rounded-lg hover:bg-[var(--adm-bg)] text-[var(--adm-text-3)] transition-colors">
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                </div>
              </div>
              <div className="p-5 space-y-4 overflow-y-auto max-h-[70vh]">
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-[var(--adm-text-2)] mb-1 block">Nama Bisnis</label>
                    <input type="text" value={selectedClient.name} onChange={e => updateSelectedClient('name', e.target.value)} className="w-full px-3 py-2 rounded-xl border border-[var(--adm-border)] bg-[var(--adm-bg)] text-[var(--adm-text)] text-sm focus:outline-none focus:border-emerald-500 transition-colors" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[var(--adm-text-2)] mb-1 block">Domain</label>
                    <input type="text" value={selectedClient.domain || ""} onChange={e => updateSelectedClient('domain', e.target.value)} className="w-full px-3 py-2 rounded-xl border border-[var(--adm-border)] bg-[var(--adm-bg)] text-[var(--adm-text)] text-sm focus:outline-none focus:border-emerald-500 transition-colors" placeholder="contoh.com" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-[var(--adm-text-2)] mb-1 block">Tanggal Tagihan</label>
                      <input type="date" value={selectedClient.domainExpiry || ""} onChange={e => updateSelectedClient('domainExpiry', e.target.value)} className="w-full px-3 py-2 rounded-xl border border-[var(--adm-border)] bg-[var(--adm-bg)] text-[var(--adm-text)] text-sm focus:outline-none focus:border-emerald-500 transition-colors" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[var(--adm-text-2)] mb-1 block">Biaya Perpanjangan</label>
                      <div className="relative flex items-center">
                        <span className="absolute left-3 text-[var(--adm-text-3)] text-sm font-medium">Rp</span>
                        <input 
                          type="text" 
                          value={selectedClient.recurringFee ? selectedClient.recurringFee.toLocaleString('id-ID') : ""} 
                          onChange={e => {
                            const val = parseInt(e.target.value.replace(/\D/g, ''));
                            updateSelectedClient('recurringFee', isNaN(val) ? 0 : val);
                          }} 
                          className="w-full pl-9 pr-3 py-2 rounded-xl border border-[var(--adm-border)] bg-[var(--adm-bg)] text-[var(--adm-text)] text-sm focus:outline-none focus:border-emerald-500 transition-colors" 
                          placeholder="900.000"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[var(--adm-text-2)] mb-1 block">Nomor WhatsApp Tujuan</label>
                    <div className="flex rounded-lg bg-[var(--adm-bg)] focus-within:ring-2 focus-within:ring-emerald-500/50 focus-within:border-emerald-500 transition-all border border-[var(--adm-border)]">
                      <CountrySelector selected={selectedMsgCountry} onSelect={setSelectedMsgCountry} theme="admin" />
                      <input 
                        type="text" 
                        value={selectedClient.phone ? selectedClient.phone.replace(new RegExp(`^${selectedMsgCountry.dial_code.replace('+', '')}`), '') : ''} 
                        onChange={e => {
                          const val = e.target.value.replace(/\D/g, '');
                          const cleanVal = val.startsWith('0') ? val.substring(1) : val;
                          const code = selectedMsgCountry.dial_code.replace('+', '');
                          updateSelectedClient('phone', cleanVal ? `${code}${cleanVal}` : '');
                        }} 
                        className="w-full px-3 py-2.5 text-sm bg-transparent border-0 text-[var(--adm-text)] focus:outline-none focus:ring-0 placeholder-[var(--adm-text-3)]" 
                        placeholder={selectedMsgCountry.code === 'ID' ? "8123456..." : "123456789..."} 
                      />
                    </div>
                  </div>
                </div>

                <a
                  href={`https://wa.me/${selectedClient.phone}?text=${encodeURIComponent(getAutoDraft(selectedClient))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                  Kirim Pesan via WhatsApp
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Renew Confirmation Modal */}
      <AnimatePresence>
        {renewingClient && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setRenewingClient(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={e => e.stopPropagation()}
              className="bg-[var(--adm-card)] max-w-md w-full rounded-2xl shadow-2xl overflow-hidden border border-[var(--adm-border)]"
            >
              <div className="p-6">
                <div className="w-12 h-12 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-4">
                  <RefreshCw size={24} strokeWidth={2.5} />
                </div>
                <h3 className="text-xl font-bold text-[var(--adm-text)] mb-2">Perpanjang Layanan</h3>
                <p className="text-[var(--adm-text-2)] text-sm mb-4 leading-relaxed">
                  Silakan sesuaikan nominal pembayaran dan tanggal masa aktif baru untuk klien <strong className="text-[var(--adm-text)]">{renewingClient.name}</strong>.
                </p>
                <div className="space-y-4 mb-6 text-left">
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs font-semibold text-[var(--adm-text-2)] block">Nominal Dibayar</label>
                      <span className="text-[11px] font-medium text-[var(--adm-text-3)]">Biaya Perpanjangan: {formatRp(renewingClient.recurringFee || 0)}</span>
                    </div>
                    <div className="relative flex items-center">
                      <span className="absolute left-3 text-[var(--adm-text-3)] text-sm font-medium">Rp</span>
                      <input 
                        type="text" 
                        value={renewForm.amountPaid ? renewForm.amountPaid.toLocaleString('id-ID') : ""} 
                        onChange={e => {
                          const val = parseInt(e.target.value.replace(/\D/g, ''));
                          setRenewForm({ ...renewForm, amountPaid: isNaN(val) ? 0 : val });
                        }} 
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[var(--adm-border)] bg-[var(--adm-bg)] text-[var(--adm-text)] text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" 
                        placeholder="0" 
                      />
                    </div>
                    {((renewingClient.recurringFee || 0) - renewForm.amountPaid) > 0 && (
                      <div className="mt-2 text-[11px] font-semibold text-red-500 flex items-center gap-1 w-fit">
                        <AlertCircle size={12} strokeWidth={2.5} />
                        Sisa tagihan: {formatRp((renewingClient.recurringFee || 0) - renewForm.amountPaid)}
                      </div>
                    )}
                    {((renewingClient.recurringFee || 0) - renewForm.amountPaid) < 0 && (
                      <div className="mt-2 text-[11px] font-semibold text-emerald-500 flex items-center gap-1 w-fit">
                        <CheckCircle2 size={12} strokeWidth={2.5} />
                        Kelebihan bayar: {formatRp(Math.abs((renewingClient.recurringFee || 0) - renewForm.amountPaid))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[var(--adm-text-2)] mb-1.5 block">Tanggal Kadaluarsa Baru</label>
                    <input 
                      type="date" 
                      value={renewForm.newExpiryDate} 
                      onChange={e => setRenewForm({ ...renewForm, newExpiryDate: e.target.value })} 
                      className="w-full px-3 py-2.5 rounded-xl border border-[var(--adm-border)] bg-[var(--adm-bg)] text-[var(--adm-text)] text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" 
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setRenewingClient(null)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold text-[var(--adm-text-2)] bg-transparent hover:text-[var(--adm-text)] transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={confirmRenew}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-indigo-500 text-white hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/20"
                  >
                    Ya, Perpanjang
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setDeletingId(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={e => e.stopPropagation()}
              className="bg-[var(--adm-card)] max-w-md w-full rounded-2xl shadow-2xl overflow-hidden border border-[var(--adm-border)]"
            >
              <div className="p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-4">
                  <Trash2 size={32} strokeWidth={2} />
                </div>
                <h3 className="text-xl font-bold text-[var(--adm-text)] mb-2">Pindahkan ke Tempat Sampah?</h3>
                <p className="text-[var(--adm-text-2)] text-sm mb-6">
                  Klien <strong className="text-[var(--adm-text)]">{clients.find(c => c.id === deletingId)?.name}</strong> akan dihapus dan dipindahkan ke tempat sampah. Anda dapat memulihkannya nanti.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeletingId(null)}
                    className="flex-1 py-2.5 rounded-xl font-bold text-[var(--adm-text-2)] bg-transparent hover:text-[var(--adm-text)] transition-colors text-sm"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => {
                      const clientToDelete = clients.find(c => c.id === deletingId);
                      if (clientToDelete) {
                        // Simpan ke trash
                        const savedTrash = localStorage.getItem("revtech_clients_trash");
                        const currentTrash = savedTrash ? JSON.parse(savedTrash) : [];
                        const trashItem = {
                          ...clientToDelete,
                          deletedAt: new Date().toISOString(),
                          deletedBy: "Admin"
                        };
                        localStorage.setItem("revtech_clients_trash", JSON.stringify([trashItem, ...currentTrash]));

                        // Hapus dari data aktif
                        const updatedClients = clients.filter(c => c.id !== deletingId);
                        setClients(updatedClients);
                        localStorage.setItem("revtech_clients", JSON.stringify(updatedClients));
                        setDeletingId(null);
                        showToast(`Klien ${clientToDelete.name} berhasil dihapus`);
                      }
                    }}
                    className="flex-1 py-2.5 rounded-xl font-bold bg-red-500 text-white hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20 text-sm"
                  >
                    Ya, Hapus
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Use Modification Confirmation Modal */}
      <AnimatePresence>
        {usingModId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setUsingModId(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={e => e.stopPropagation()}
              className="bg-[var(--adm-card)] max-w-md w-full rounded-2xl shadow-2xl overflow-hidden border border-[var(--adm-border)]"
            >
              <div className="p-6 text-left">
                <div className="w-16 h-16 rounded-full bg-[var(--adm-success)]/10 text-[var(--adm-success)] flex items-center justify-center mx-auto mb-4">
                  <Wand2 size={32} strokeWidth={2} />
                </div>
                <h3 className="text-xl font-bold text-[var(--adm-text)] mb-2 text-center">Gunakan Kuota Revisi?</h3>
                <p className="text-[var(--adm-text-2)] text-sm mb-4 text-center">
                  Satu (1) jatah revisi/modifikasi akan dipotong dari klien <strong className="text-[var(--adm-text)]">{clients.find(c => c.id === usingModId)?.name}</strong>.
                </p>
                
                <div className="space-y-4 mb-6">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-[var(--adm-text-2)] uppercase tracking-wide">Detail Revisi (Opsional)</label>
                    <textarea
                      value={modNotes}
                      onChange={(e) => setModNotes(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-[var(--adm-bg)] text-[var(--adm-text)] placeholder-[var(--adm-text-3)] focus:outline-none focus:ring-1 focus:ring-[var(--adm-accent)]/30 transition-all border border-[var(--adm-border)]"
                      placeholder="Contoh: Ubah gambar banner di halaman depan..."
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-[var(--adm-text-2)] uppercase tracking-wide">Deadline (Opsional)</label>
                    <input
                      type="date"
                      value={modDeadline}
                      onChange={(e) => setModDeadline(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-[var(--adm-bg)] text-[var(--adm-text)] focus:outline-none focus:ring-1 focus:ring-[var(--adm-accent)]/30 transition-all border border-[var(--adm-border)] [color-scheme:dark]"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => { setUsingModId(null); setModNotes(""); setModDeadline(""); }}
                    className="flex-1 py-2.5 rounded-xl font-bold text-[var(--adm-text-2)] bg-transparent hover:text-[var(--adm-text)] transition-colors text-sm border border-[var(--adm-border)]"
                  >
                    Batal
                  </button>
                  <button
                    onClick={confirmUseMod}
                    className="flex-1 py-2.5 rounded-xl font-bold bg-emerald-500 text-white hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20 text-sm"
                  >
                    Buat Pesanan
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={`fixed bottom-6 right-6 px-6 py-3 rounded-xl shadow-xl flex items-center gap-3 z-[100] ${
              toastMessage.type === 'success' 
                ? 'bg-emerald-500 text-white' 
                : 'bg-red-500 text-white'
            }`}
          >
            {toastMessage.type === 'success' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
            <span className="font-medium text-sm">{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--adm-text-3)] mb-2">{label}</p>
      <div className="bg-[var(--adm-bg)] rounded-xl divide-y divide-[var(--adm-border)]">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-3 py-2.5">
      <span className="text-xs text-[var(--adm-text-2)]">{label}</span>
      <span className="text-xs font-medium text-[var(--adm-text)] text-right max-w-[60%] break-words">{value}</span>
    </div>
  );
}
