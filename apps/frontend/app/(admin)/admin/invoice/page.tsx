"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader, StatusBadge, AdminToolbar, AdminModal, AdminTable, AdminButton } from "@/components/admin/ui";
import { CheckCircle2, MessageSquare, Trash2, X, MoreHorizontal, ChevronDown, AlertTriangle, CircleDollarSign } from "lucide-react";
import { logActivity } from "@/lib/activityLog";
import rawInvoices from "@/data/admin/invoices.json";
import rawInbox from "@/data/admin/inbox.json";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, doc, updateDoc, deleteDoc, query, orderBy, setDoc } from "firebase/firestore";

interface Invoice {
  id: string;
  orderId: string;
  client: string;
  company?: string;
  service?: string;
  phone?: string;
  type: "dp" | "pelunasan" | "maintenance";
  amount: number;
  status: "paid" | "pending";
  issuedAt: string;
  paidAt: string | null;
  dueDate: string;
  description: string;
}

function formatRp(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);
}

function formatDateTime(isoString: string | undefined | null) {
  if (!isoString) return "-";
  const d = new Date(isoString);
  const dateStr = d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
  if (isoString.includes("T")) {
    const timeStr = d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    return `${dateStr} • ${timeStr}`;
  }
  return `${dateStr} • 09:00`; // Jam default untuk data lama
}

function isOverdue(dueDate: string, status: string) {
  return status === "pending" && new Date(dueDate) < new Date();
}

const fadeUp = (i: number) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { delay: i * 0.07, type: "spring" as const, stiffness: 300, damping: 24 } },
});

function InvoiceCard({ 
  inv, 
  onMarkPaid, 
  onDelete 
}: { 
  inv: Invoice, 
  onMarkPaid: (inv: Invoice) => void, 
  onDelete: (id: string) => void 
}) {
  
  const handleChat = () => {
    if (!inv.phone) return;
    const text = inv.status === "pending"
      ? `Halo Kak ${inv.client}, dari RevTech. Mengingatkan kembali terkait tagihan ${inv.description} sebesar ${formatRp(inv.amount)}. Jika sudah ditransfer, mohon konfirmasinya ya Kak 🙏`
      : `Halo Kak ${inv.client}, dari RevTech. Terima kasih, pembayaran untuk ${inv.description} sudah kami terima.`;
    window.open(`https://wa.me/${inv.phone}?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      layout
      className="bg-[var(--adm-card)] rounded-2xl shadow-[var(--adm-shadow)] overflow-hidden hover:shadow-[var(--adm-shadow-md)] transition-shadow group border border-[var(--adm-border)]"
    >
      <div className="p-4 flex flex-col gap-2">
        {/* Top Row: Identity & Status */}
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-[var(--adm-text-2)] font-medium mt-1">
            <span className="text-sm font-semibold text-[var(--adm-text)]">{inv.company || inv.client}</span>
            {inv.service && (
              <span>{inv.service.split(" - ")[0]}</span>
            )}
          </div>

          <div className="flex items-center justify-end gap-1.5 shrink-0">
            {inv.status === "pending" && (
              <button 
                onClick={(e) => { e.stopPropagation(); onMarkPaid(inv); }} 
                className="inline-flex items-center justify-center p-1.5 text-[var(--adm-success)] hover:opacity-70 transition-all active:scale-95 focus:outline-none" 
                title="Tandai Lunas"
              >
                <CheckCircle2 size={18} strokeWidth={2.5} />
              </button>
            )}

            {inv.status === "paid" ? (
              <div className="flex items-center gap-1.5 py-1.5 text-[11px] font-bold shrink-0 ml-1 text-[var(--adm-success)]">
                <span className="truncate">Lunas</span>
                <CheckCircle2 size={13} strokeWidth={2.5} />
              </div>
            ) : isOverdue(inv.dueDate, inv.status) ? (
              <div className="flex items-center gap-1.5 py-1.5 text-[11px] font-bold shrink-0 ml-1 text-[var(--adm-danger)]">
                <span className="truncate">Terlambat</span>
                <AlertTriangle size={13} strokeWidth={2.5} />
              </div>
            ) : (
              <div className="flex items-center gap-1.5 py-1.5 text-[11px] font-bold shrink-0 ml-1 text-[var(--adm-warning)]">
                <span className="truncate">Pending</span>
                <CircleDollarSign size={13} strokeWidth={2.5} />
              </div>
            )}
          </div>
        </div>

        {/* Middle Row: Amount */}
        <div className="flex items-center gap-1.5 mt-1 mb-2">
          <span className="text-[16px] font-black text-[var(--adm-text)] tracking-tight">
            {formatRp(inv.amount)}
          </span>
        </div>

        {/* Bottom Row: Description + Actions + Deadline */}
        <div className="flex flex-wrap items-end justify-between gap-4 mt-1">
          <div className="flex items-baseline gap-2 pr-2 sm:pr-4 overflow-hidden min-w-0 flex-1">
            <h3 className="text-[13px] font-medium text-[var(--adm-text-2)] whitespace-nowrap">
              {(() => {
                if (inv.description.startsWith("Pembayaran Penuh")) return "Pembayaran Penuh";
                if (inv.type === "dp") return inv.description.includes("DP") ? `Pembayaran ${inv.description.split(" — ")[0]}` : "Pembayaran DP";
                if (inv.type === "pelunasan") return "Pembayaran Pelunasan";
                return "Pembayaran Maintenance";
              })()}
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0 ml-auto mt-2 sm:mt-0">
            <div className="flex items-center gap-1.5">
              {inv.phone && (
                <button onClick={(e) => { e.stopPropagation(); handleChat(); }} className="inline-flex items-center justify-center p-1.5 text-[var(--adm-text-3)] hover:text-[var(--adm-text)] transition-colors focus:outline-none" title="Chat Klien">
                  <MessageSquare size={13} strokeWidth={2} />
                </button>
              )}
              <button onClick={(e) => { e.stopPropagation(); onDelete(inv.id); }} className="inline-flex items-center justify-center p-1.5 text-[var(--adm-text-3)] hover:text-[var(--adm-danger)] transition-colors focus:outline-none" title="Hapus">
                <Trash2 size={13} strokeWidth={2} />
              </button>
            </div>

            <div className="w-px h-4 bg-[var(--adm-border)] hidden sm:block"></div>

            <div className="flex items-center gap-2 text-[10px] font-semibold shrink-0 uppercase tracking-wider">
              {inv.status === "paid" ? (
                <span className="text-[var(--adm-text-3)]">
                  {formatDateTime(inv.paidAt || inv.issuedAt)}
                </span>
              ) : inv.type === "maintenance" ? (
                <span className={isOverdue(inv.dueDate, inv.status) ? "text-[var(--adm-danger)]" : "text-[var(--adm-text-3)]"}>
                  Tempo: {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase() : "BELUM DIATUR"}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function InvoicePage() {
  const [isClient, setIsClient] = useState(false);
  const [invoiceList, setInvoiceList] = useState<Invoice[]>([]);
  const [tabFilter, setTabFilter] = useState<"all" | "paid" | "overdue" | "pending">("all");
  const [sortBy, setSortBy] = useState<"Terbaru" | "Terlama" | "Jatuh Tempo">("Terbaru");
  const [typeFilter, setTypeFilter] = useState<"all" | "dp" | "pelunasan" | "maintenance">("all");
  const [layananFilter, setLayananFilter] = useState("Semua Layanan");
  const [search, setSearch] = useState("");
  const [lunasInvoice, setLunasInvoice] = useState<Invoice | null>(null);
  const [lunasDate, setLunasDate] = useState("");
  const [orders, setOrders] = useState<any[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }

  useEffect(() => {
    setIsClient(true);
    
    // Sinkronisasi Realtime dengan Firestore untuk Invoices
    const qInvoices = query(collection(db, "invoices"), orderBy("issuedAt", "desc"));
    const unsubInvoices = onSnapshot(qInvoices, (snapshot) => {
      const firestoreInvoices: Invoice[] = [];
      snapshot.forEach(document => {
        firestoreInvoices.push({ id: document.id, ...document.data() } as Invoice);
      });
      setInvoiceList(firestoreInvoices);
    });

    // Sinkronisasi Realtime dengan Firestore untuk Orders (dibutuhkan untuk filter Layanan)
    const qOrders = query(collection(db, "orders"));
    const unsubOrders = onSnapshot(qOrders, (snapshot) => {
      const firestoreOrders: any[] = [];
      snapshot.forEach(document => {
        firestoreOrders.push({ id: document.id, ...document.data() });
      });
      setOrders(firestoreOrders);
    });

    return () => {
      unsubInvoices();
      unsubOrders();
    };
  }, []);

  const handleMarkPaid = async (inv: Invoice, date: string) => {
    try {
      await updateDoc(doc(db, "invoices", inv.id), {
        status: "paid",
        paidAt: date
      });
      logActivity({ type: "system", title: "Invoice Dilunasi", description: `Invoice ${inv.id} untuk klien ${inv.client} telah dilunasi.`, user: "Admin" });
    } catch (err) {
      console.error(err);
      alert("Gagal memperbarui status invoice.");
    }
  };

  const confirmLunas = () => {
    if (!lunasInvoice || !lunasDate) return;
    
    // Gabungkan tanggal pilihan user dengan jam saat ini agar format ISO lengkap
    const now = new Date();
    const timeString = now.toISOString().substring(11); // ambil bagian T00:00:00.000Z
    const fullIsoString = `${lunasDate}T${timeString}`;

    handleMarkPaid(lunasInvoice, fullIsoString);
    setLunasInvoice(null);
  };

  const invoiceColumns = [
    {
      key: "identitas",
      label: "Klien & Layanan",
      render: (inv: Invoice) => (
        <div className="flex flex-col gap-1">
          <span className="font-semibold text-[var(--adm-text)]">{inv.company || inv.client}</span>
          {inv.service && <span className="text-[11px] text-[var(--adm-text-2)]">{inv.service.split(" - ")[0]}</span>}
        </div>
      ),
    },
    {
      key: "deskripsi",
      label: "Deskripsi",
      render: (inv: Invoice) => {
        let title = "Pembayaran Maintenance";
        if (inv.description.startsWith("Pembayaran Penuh")) title = "Pembayaran Penuh";
        else if (inv.type === "dp") title = inv.description.includes("DP") ? `Pembayaran ${inv.description.split(" — ")[0]}` : "Pembayaran DP";
        else if (inv.type === "pelunasan") title = "Pembayaran Pelunasan";
        
        return (
          <div className="flex flex-col gap-1 max-w-[200px]">
            <span className="text-[13px] font-medium text-[var(--adm-text-2)]">{title}</span>
            <span className="text-[11px] text-[var(--adm-text-3)] truncate" title={inv.description}>{inv.description}</span>
          </div>
        );
      },
    },
    {
      key: "jumlah",
      label: "Jumlah",
      render: (inv: Invoice) => (
        <span className="text-[14px] font-bold text-[var(--adm-text)] whitespace-nowrap">
          {formatRp(inv.amount)}
        </span>
      ),
    },
    {
      key: "tanggal",
      label: "Tanggal & Tempo",
      render: (inv: Invoice) => (
        <div className="flex flex-col gap-1">
          {inv.status === "paid" ? (
            <span className="text-[11px] text-[var(--adm-text-3)] whitespace-nowrap">
              Lunas: {formatDateTime(inv.paidAt || inv.issuedAt)}
            </span>
          ) : inv.type === "maintenance" ? (
            <span className={`text-[11px] whitespace-nowrap ${isOverdue(inv.dueDate, inv.status) ? "text-[var(--adm-danger)] font-bold" : "text-[var(--adm-text-3)]"}`}>
              Tempo: {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase() : "BELUM DIATUR"}
            </span>
          ) : (
             <span className="text-[11px] text-[var(--adm-text-3)]">-</span>
          )}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (inv: Invoice) => (
        <div className="flex items-center gap-2">
          {inv.status === "pending" && (
            <button
              onClick={(e) => { e.stopPropagation(); handleQuickLunas(inv); }}
              className="inline-flex items-center justify-center text-[var(--adm-success)] hover:opacity-70 active:scale-95 transition-all focus:outline-none"
              title="Tandai Lunas"
            >
              <CheckCircle2 size={16} strokeWidth={2.5} />
            </button>
          )}
          
          {inv.status === "paid" ? (
            <div className="flex items-center gap-1.5 py-1 text-[11px] font-bold text-[var(--adm-success)]">
              <span>Lunas</span>
              <CheckCircle2 size={13} strokeWidth={2.5} />
            </div>
          ) : isOverdue(inv.dueDate, inv.status) ? (
            <div className="flex items-center gap-1.5 py-1 text-[11px] font-bold text-[var(--adm-danger)]">
              <span>Terlambat</span>
              <AlertTriangle size={13} strokeWidth={2.5} />
            </div>
          ) : (
            <div className="flex items-center gap-1.5 py-1 text-[11px] font-bold text-[var(--adm-warning)]">
              <span>Pending</span>
              <CircleDollarSign size={13} strokeWidth={2.5} />
            </div>
          )}
        </div>
      ),
    },
    {
      key: "aksi",
      label: "Aksi",
      render: (inv: Invoice) => (
        <div className="flex items-center gap-1.5">
          {inv.phone && (
            <button
              onClick={(e) => { 
                e.stopPropagation(); 
                const text = inv.status === "pending"
                  ? `Halo Kak ${inv.client}, dari RevTech. Mengingatkan kembali terkait tagihan ${inv.description} sebesar ${formatRp(inv.amount)}. Jika sudah ditransfer, mohon konfirmasinya ya Kak 🙏`
                  : `Halo Kak ${inv.client}, dari RevTech. Terima kasih, pembayaran untuk ${inv.description} sudah kami terima.`;
                window.open(`https://wa.me/${inv.phone}?text=${encodeURIComponent(text)}`, "_blank");
              }}
              className="inline-flex items-center justify-center p-1.5 text-[var(--adm-text-3)] hover:text-[var(--adm-text)] transition-colors focus:outline-none"
              title="Chat Klien"
            >
              <MessageSquare size={14} strokeWidth={2} />
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); handleDelete(inv.id); }}
            className="inline-flex items-center justify-center p-1.5 text-[var(--adm-text-3)] hover:text-[var(--adm-danger)] transition-colors focus:outline-none"
            title="Hapus"
          >
            <Trash2 size={14} strokeWidth={2} />
          </button>
        </div>
      ),
    }
  ];

  function save(updated: Invoice[]) {
    // No-op karena onSnapshot akan menangani update UI
  }

  function handleQuickLunas(inv: Invoice) {
    setLunasInvoice(inv);
    setLunasDate(new Date().toISOString().split("T")[0]);
  }

  function handleDelete(id: string) {
    setDeletingId(id);
  }

  async function confirmDelete() {
    if (!deletingId) return;
    try {
      const invoiceToDelete = invoiceList.find(i => i.id === deletingId);
      if (invoiceToDelete) {
        const trashItem = {
          ...invoiceToDelete,
          deletedAt: new Date().toISOString(),
          deletedBy: "Admin",
          _module: "Tagihan"
        };
        await setDoc(doc(db, "trash", deletingId), trashItem);
      }
      
      await deleteDoc(doc(db, "invoices", deletingId));
      logActivity({ type: "system", title: "Invoice Dihapus", description: `Invoice dengan ID ${deletingId} telah dihapus.`, user: "Admin" });
      showToast("Invoice berhasil dihapus dari sistem.");
    } catch (err) {
      console.error(err);
      showToast("Gagal menghapus invoice.");
    }
    setDeletingId(null);
  }

  const filtered = invoiceList.filter(i => {
    let matchTab = true;
    if (tabFilter === "paid") {
      matchTab = i.status === "paid";
    } else if (tabFilter === "overdue") {
      matchTab = isOverdue(i.dueDate, i.status);
    } else if (tabFilter === "pending") {
      matchTab = i.status === "pending" && !isOverdue(i.dueDate, i.status);
    }

    const matchType = typeFilter === "all" ? true : i.type === typeFilter;

    const matchSearch = !search || 
      i.client.toLowerCase().includes(search.toLowerCase()) || 
      i.id.toLowerCase().includes(search.toLowerCase()) ||
      i.description.toLowerCase().includes(search.toLowerCase());

    let matchLayanan = true;
    if (layananFilter !== "Semua Layanan") {
      const order = orders.find((o: any) => o.id === i.orderId);
      const invService = order?.service || "";
      if (layananFilter === "Jasa Modifikasi" && i.type === "maintenance") {
        matchLayanan = true;
      } else if (invService.startsWith(layananFilter)) {
        matchLayanan = true;
      } else {
        matchLayanan = false;
      }
    }
      
    return matchTab && matchType && matchSearch && matchLayanan;
  });

  let sortedData = [...filtered];
  if (sortBy === "Terlama") {
    sortedData.sort((a, b) => new Date(a.issuedAt).getTime() - new Date(b.issuedAt).getTime());
  } else if (sortBy === "Jatuh Tempo") {
    sortedData.sort((a, b) => {
      const aTime = new Date(a.dueDate).getTime();
      const bTime = new Date(b.dueDate).getTime();
      return aTime - bTime;
    });
  } else {
    // Terbaru
    sortedData.sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime());
  }

  const totalPaid = invoiceList.filter(i => i.status === "paid").reduce((s, i) => s + i.amount, 0);
  const totalPending = invoiceList.filter(i => i.status === "pending").reduce((s, i) => s + i.amount, 0);
  const overdue = invoiceList.filter(i => isOverdue(i.dueDate, i.status));

  if (!isClient) return null;

  return (
    <div>
      {/* Toolbar */}
      <AdminToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari invoice, klien..."
        dropdown={
          <div className="relative flex items-center shrink-0">
            <select
              value={layananFilter}
              onChange={(e) => setLayananFilter(e.target.value)}
              className="appearance-none bg-transparent py-2.5 pl-4 pr-8 text-sm font-semibold text-[var(--adm-text)] focus:outline-none cursor-pointer w-full"
            >
              <option value="Semua Layanan" className="bg-[var(--adm-card)] text-[var(--adm-text)]">Semua Layanan</option>
              <option value="Jasa Website" className="bg-[var(--adm-card)] text-[var(--adm-text)]">Jasa Website</option>
              <option value="Produk Digital" className="bg-[var(--adm-card)] text-[var(--adm-text)]">Produk Digital</option>
              <option value="Custom Project" className="bg-[var(--adm-card)] text-[var(--adm-text)]">Custom Project</option>
              <option value="Jasa Modifikasi" className="bg-[var(--adm-card)] text-[var(--adm-text)]">Jasa Modifikasi</option>
            </select>
            <div className="pointer-events-none absolute right-3">
              <ChevronDown size={14} strokeWidth={2.5} className="text-[var(--adm-text-3)]" />
            </div>
          </div>
        }
      />

      <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
            {[
              { label: "Total Terbayar", value: formatRp(totalPaid), icon: "check_circle", iconBg: "bg-emerald-500/10", iconColor: "text-emerald-500" },
              { label: "Menunggu Pembayaran", value: formatRp(totalPending), icon: "pending", iconBg: "bg-amber-500/10", iconColor: "text-amber-500" },
              { label: "Jatuh Tempo", value: String(overdue.length), icon: "warning", iconBg: "bg-rose-500/10", iconColor: "text-rose-500" },
            ].map((s, i) => (
              <motion.div key={s.label} {...fadeUp(i)} className="bg-[var(--adm-card)] rounded-2xl border border-[var(--adm-border)] p-4 shadow-[var(--adm-shadow)] flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.iconBg}`}>
                  <span className={`material-symbols-outlined text-[20px] ${s.iconColor}`} style={{ fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
                </div>
                <div>
                  <p className="text-xs text-[var(--adm-text-2)]">{s.label}</p>
                  <p className="text-lg font-bold text-[var(--adm-text)]">{s.value}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Tabs & Actions Row */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-4 sm:gap-0">
            {/* Tabs Prioritas */}
            <div className="flex items-center gap-6 overflow-x-auto overflow-y-hidden scrollbar-hide w-full sm:w-auto border-b border-[var(--adm-border)] sm:border-0 sm:flex-1">
              {[
                { id: "all", label: "Semua", count: invoiceList.length },
                { id: "overdue", label: "Jatuh Tempo", count: overdue.length },
                { id: "pending", label: "Belum Lunas", count: invoiceList.filter(i => i.status === "pending" && !isOverdue(i.dueDate, i.status)).length },
                { id: "paid", label: "Lunas", count: totalPaid > 0 ? invoiceList.filter(i => i.status === "paid").length : 0 },
              ].map((t) => {
                const active = tabFilter === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTabFilter(t.id as any)}
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
              {/* Type Filter */}
              <div className="relative flex items-center justify-center shrink-0 group">
                <button className="text-[var(--adm-text-3)] group-hover:text-[var(--adm-text)] transition-colors focus:outline-none">
                  <span className="material-symbols-outlined text-[18px]">filter_alt</span>
                </button>
                <select
                  dir="rtl"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as any)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  title="Filter Tipe"
                >
                  <option value="all" className="bg-[var(--adm-card)] text-[var(--adm-text)]" dir="ltr">Semua Tipe</option>
                  <option value="dp" className="bg-[var(--adm-card)] text-[var(--adm-text)]" dir="ltr">DP</option>
                  <option value="pelunasan" className="bg-[var(--adm-card)] text-[var(--adm-text)]" dir="ltr">Pelunasan</option>
                  <option value="maintenance" className="bg-[var(--adm-card)] text-[var(--adm-text)]" dir="ltr">Maintenance</option>
                </select>
              </div>

              {/* Sort By */}
              <div className="relative flex items-center justify-center shrink-0 group">
                <button className="text-[var(--adm-text-3)] group-hover:text-[var(--adm-text)] transition-colors focus:outline-none">
                  <span className="material-symbols-outlined text-[18px]">tune</span>
                </button>
                <select
                  dir="rtl"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  title="Urutkan"
                >
                  <option value="Terbaru" className="bg-[var(--adm-card)] text-[var(--adm-text)]" dir="ltr">Terbaru</option>
                  <option value="Terlama" className="bg-[var(--adm-card)] text-[var(--adm-text)]" dir="ltr">Terlama</option>
                  <option value="Jatuh Tempo" className="bg-[var(--adm-card)] text-[var(--adm-text)]" dir="ltr">Jatuh Tempo Terdekat</option>
                </select>
              </div>
            </div>
          </div>

          {/* Invoice List Unified Table */}
          <div className="mt-4">
            <AdminTable
              columns={invoiceColumns}
              data={sortedData}
              keyField="id"
              emptyMessage="Tidak ada invoice ditemukan."
            />
          </div>
        </>

      {/* Modal Konfirmasi Lunas */}
      <AnimatePresence>
        {lunasInvoice && (
          <AdminModal isOpen={true} title="Konfirmasi Pelunasan" onClose={() => setLunasInvoice(null)}>
            <div className="space-y-4">
              <p className="text-[13px] text-[var(--adm-text)] leading-relaxed">
                Tandai invoice <strong className="font-bold">{lunasInvoice.id}</strong> ({lunasInvoice.client}) sebagai LUNAS?
              </p>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-bold text-[var(--adm-text-2)] ml-1">Tanggal Pembayaran</label>
                <input
                  type="date"
                  value={lunasDate}
                  onChange={(e) => setLunasDate(e.target.value)}
                  className="w-full bg-[var(--adm-bg)] border border-[var(--adm-border)] rounded-xl px-4 py-2.5 text-[13px] text-[var(--adm-text)] focus:outline-none focus:border-[var(--adm-primary)] transition-colors"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <AdminButton variant="secondary" onClick={() => setLunasInvoice(null)} className="flex-1">Batal</AdminButton>
                <AdminButton variant="primary" onClick={() => confirmLunas()} className="flex-1">
                  <CheckCircle2 size={18} strokeWidth={2.5} className="mr-2" />
                  Tandai Lunas
                </AdminButton>
              </div>
            </div>
          </AdminModal>
        )}

        {/* Modal Hapus */}
        {deletingId && (
          <AdminModal isOpen={true} title="Hapus Invoice" onClose={() => setDeletingId(null)}>
            <div className="space-y-4">
              <p className="text-[13px] text-[var(--adm-text)] leading-relaxed">
                Apakah Anda yakin ingin menghapus tagihan <strong className="font-bold">{deletingId}</strong>?
                Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex gap-3 pt-2">
                <AdminButton variant="secondary" onClick={() => setDeletingId(null)} className="flex-1">Batal</AdminButton>
                <button
                  onClick={confirmDelete}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 rounded-xl transition-colors text-[13px]"
                >
                  Ya, Hapus
                </button>
              </div>
            </div>
          </AdminModal>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 bg-[var(--adm-card)] border border-[var(--adm-border)] shadow-xl rounded-2xl px-5 py-3 flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-[var(--adm-success)]/20 flex items-center justify-center text-[var(--adm-success)] shrink-0">
              <CheckCircle2 size={18} strokeWidth={2.5} />
            </div>
            <p className="text-[13px] font-bold text-[var(--adm-text)]">{toastMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
