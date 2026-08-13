"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader, StatusBadge, AdminToolbar, AdminModal, AdminTable, AdminButton } from "@/components/admin/ui";
import { CheckCircle2, MessageSquare, Trash2, X, MoreHorizontal, ChevronDown, AlertTriangle, CircleDollarSign } from "lucide-react";
import { logActivity } from "@/lib/activityLog";
import rawInvoices from "@/data/admin/invoices.json";
import rawInbox from "@/data/admin/inbox.json";

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

  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem("revtech_invoices");
    let currentInvoices: Invoice[] = saved ? JSON.parse(saved) : [];
    
    setInvoiceList(currentInvoices);
    if (!saved) localStorage.setItem("revtech_invoices", JSON.stringify(currentInvoices));

    const savedOrders = localStorage.getItem("revtech_orders");
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    }
  }, []);

  const handleMarkPaid = (inv: Invoice, date: string) => {
    const updated: Invoice[] = invoiceList.map((item) =>
      item.id === inv.id ? { ...item, status: "paid" as const, paidAt: date } : item
    );
    setInvoiceList(updated);
    localStorage.setItem("revtech_invoices", JSON.stringify(updated));
    logActivity({ type: "system", title: "Invoice Dilunasi", description: `Invoice ${inv.id} untuk klien ${inv.client} telah dilunasi.`, user: "Admin" });
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
    setInvoiceList(updated);
    localStorage.setItem("revtech_invoices", JSON.stringify(updated));
  }

  function handleQuickLunas(inv: Invoice) {
    setLunasInvoice(inv);
    setLunasDate(new Date().toISOString().split("T")[0]);
  }

  function handleDelete(id: string) {
    if (window.confirm("Apakah Anda yakin ingin menghapus tagihan ini?")) {
      save(invoiceList.filter(inv => inv.id !== id));
      logActivity({ type: "system", title: "Invoice Dihapus", description: `Invoice dengan ID ${id} telah dihapus.`, user: "Admin" });
    }
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
      <AdminModal isOpen={!!lunasInvoice} onClose={() => setLunasInvoice(null)} maxWidth="max-w-md" noPadding={true}>
        {lunasInvoice && (
          <>
            <div className="p-5 border-b border-[var(--adm-border)] flex justify-between items-center bg-[var(--adm-bg)]">
              <h3 className="font-bold text-lg text-[var(--adm-text)] flex items-center gap-2">
                <CircleDollarSign className="text-[var(--adm-success)]" size={20} strokeWidth={2.5} />
                Konfirmasi Pelunasan
              </h3>
              <button onClick={() => setLunasInvoice(null)} className="text-[var(--adm-text-3)] hover:text-[var(--adm-text)] transition-colors">
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-[var(--adm-bg)] p-3 rounded-xl border border-[var(--adm-border)] flex justify-between items-center mb-2">
                <div>
                  <p className="text-[10px] font-bold text-[var(--adm-text-3)] uppercase tracking-wide mb-0.5">Total Tagihan</p>
                  <p className="font-bold text-[var(--adm-text)] text-sm">{formatRp(lunasInvoice.amount)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-[var(--adm-text-3)] uppercase tracking-wide mb-0.5">Klien</p>
                  <p className="font-bold text-[var(--adm-text)] text-sm">{lunasInvoice.client}</p>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--adm-text-2)] uppercase tracking-wide block mb-1.5">Tanggal Pelunasan</label>
                <input
                  type="date"
                  value={lunasDate}
                  onChange={(e) => setLunasDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-transparent text-sm font-semibold text-[var(--adm-text)] focus:outline-none focus:ring-2 focus:ring-[var(--adm-success)]/30 border border-[var(--adm-border)] [color-scheme:dark]"
                />
              </div>
            </div>

            <div className="p-5 border-t border-[var(--adm-border)] flex gap-3 bg-[var(--adm-bg)]">
              <button 
                onClick={() => setLunasInvoice(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-[var(--adm-text-2)] bg-transparent hover:text-[var(--adm-text)] transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={() => {
                  save(invoiceList.map(inv => inv.id === lunasInvoice.id ? { ...inv, status: "paid", paidAt: new Date(lunasDate).toISOString().split("T")[0] } : inv));
                  setLunasInvoice(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-[var(--adm-success)] text-white text-sm font-bold shadow-sm hover:opacity-90 transition-opacity flex justify-center items-center gap-2"
              >
                <CheckCircle2 size={18} strokeWidth={2.5} />
                Tandai Lunas
              </button>
            </div>
          </>
        )}
      </AdminModal>
    </div>
  );
}
