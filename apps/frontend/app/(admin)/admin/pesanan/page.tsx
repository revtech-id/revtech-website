"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader, StatusBadge } from "@/components/admin/ui";
import rawOrders from "@/data/admin/orders.json";

type OrderStatus = "antrean" | "pengerjaan" | "revisi" | "pelunasan" | "handover" | "selesai";

interface Order {
  id: string;
  client: string;
  service: string;
  status: OrderStatus;
  dp: number;
  total: number;
  phone: string;
  createdAt: string;
  deadline: string | null;
  notes: string;
  handover?: string;
  assignedDev?: string;           // siapa developer yang mengerjakan
  progressLog?: { date: string; note: string; by: string }[]; // log progress bertanggal
}

const defaultOrders: Order[] = rawOrders as Order[];



const PIPELINE: { status: OrderStatus; label: string; badgeVariant: "slate" | "purple" | "amber" | "blue" | "indigo" | "rose" | "emerald" | "blue" }[] = [
  { status: "antrean", label: "Antrean", badgeVariant: "slate" },
  { status: "pengerjaan", label: "Pengerjaan", badgeVariant: "blue" },
  { status: "revisi", label: "Revisi", badgeVariant: "indigo" },
  { status: "pelunasan", label: "Pelunasan", badgeVariant: "amber" },
  { status: "handover", label: "Handover", badgeVariant: "purple" },
  { status: "selesai", label: "Selesai", badgeVariant: "emerald" },
];

function formatRp(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);
}

// ── WA Follow-up Modal ────────────────────────────────────────────────────────

interface WAModalProps {
  order: Order;
  onClose: () => void;
}

function WAModal({ order, onClose }: WAModalProps) {
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const statusLabel = PIPELINE.find((p) => p.status === order.status)?.label ?? order.status;

  async function generateDraft() {
    setLoading(true);
    setError("");
    setDraft("");
    try {
      // TODO: replace with /api/admin/wa-draft endpoint
      const res = await fetch("/api/admin/wa-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client: order.client,
          service: order.service,
          status: statusLabel,
          total: formatRp(order.total),
          dp: formatRp(order.dp),
        }),
      });
      if (!res.ok) throw new Error("API error");
      const data = await res.json() as { draft: string };
      setDraft(data.draft);
    } catch {
      setError("Gagal generate draft. Pastikan Gemini API key sudah dikonfigurasi.");
    } finally {
      setLoading(false);
    }
  }

  function openWA() {
    const text = encodeURIComponent(draft);
    window.open(`https://wa.me/${order.phone}?text=${text}`, "_blank");
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="bg-white rounded-2xl shadow-2xl shadow-slate-900/20 border border-slate-200/80 w-full max-w-md overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="flex items-center gap-3 p-5 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-emerald-600"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
            </div>
            <div className="flex-1 min-w-0">
              <h2 id="wa-modal-title" className="text-sm font-bold text-slate-900">Follow-up WhatsApp</h2>
              <p className="text-xs text-slate-400 truncate">{order.client} — {statusLabel}</p>
            </div>
            <button id="wa-modal-close" onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          <div className="p-5 space-y-4">
            {/* Draft Area */}
            {!draft && !loading && !error && (
              <div className="text-center py-4">
                <p className="text-sm text-slate-400 mb-3">AI akan membuatkan pesan follow-up yang tepat untuk status <strong>{statusLabel}</strong>.</p>
                <button
                  id="generate-wa-draft"
                  onClick={generateDraft}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                  Generate Draft AI
                </button>
              </div>
            )}

            {loading && (
              <div className="flex flex-col gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className={`h-3 bg-slate-100 rounded animate-pulse ${i === 4 ? "w-1/2" : "w-full"}`} />
                ))}
              </div>
            )}

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-sm text-rose-600">{error}</div>
            )}

            {draft && (
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">Draft Pesan</label>
                <textarea
                  id="wa-draft-text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={7}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                />
                <button
                  id="regenerate-wa-draft"
                  onClick={generateDraft}
                  className="mt-1.5 text-xs text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">refresh</span> Regenerate
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center gap-2 px-5 pb-5">
            <button
              id="cancel-wa-modal"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Batal
            </button>
            <button
              id="send-wa-button"
              onClick={openWA}
              disabled={!draft}
              className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
              Kirim via WhatsApp
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Order Card ────────────────────────────────────────────────────────────────

function OrderCard({ order, onWA, onMove, onEdit }: { order: Order; onWA: () => void; onMove: (dir: "back" | "forward") => void; onEdit: () => void }) {
  const pipelineIndex = PIPELINE.findIndex((p) => p.status === order.status);
  const badge = PIPELINE[pipelineIndex];
  const canForward = pipelineIndex < PIPELINE.length - 1;
  const canBack = pipelineIndex > 0;

  const STRIP_COLORS: Record<string, string> = {
    emerald: "#059669",
    amber: "#D97706",
    indigo: "#6366F1",
    rose: "#DC2626",
    slate: "#64748B",
    blue: "#2563EB",
    purple: "#7C3AED",
  };

  return (
    <div className="bg-white rounded-xl shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] border border-slate-200 p-4 hover:shadow-md hover:border-blue-200 transition-all group relative overflow-hidden flex flex-col md:flex-row md:items-center gap-4">
      <div className="absolute top-0 left-0 w-1.5 h-full" style={{ background: STRIP_COLORS[badge.badgeVariant] || "#64748B" }}></div>
      
      {/* Kolom Info Klien */}
      <div className="flex-1 min-w-0 pl-2">
        <div className="flex items-center gap-3 mb-1.5">
          <p className="text-[15px] font-bold text-slate-800 truncate">{order.client}</p>
          <StatusBadge label={badge.label} variant={badge.badgeVariant as any} />
        </div>
        <p className="text-xs text-slate-500 truncate">{order.service}</p>
        
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          {order.handover && (
            <p className="text-[11px] font-medium text-slate-500 bg-slate-50 border border-slate-100 rounded px-1.5 py-0.5 inline-flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">local_shipping</span>
              {order.handover}
            </p>
          )}
          {order.notes && (
            <p className="text-[11px] text-slate-500 bg-slate-50 border border-slate-100 rounded px-1.5 py-0.5 truncate max-w-[200px]" title={order.notes}>{order.notes}</p>
          )}
        </div>
      </div>

      {/* Kolom Tagihan & Deadline */}
      <div className="flex flex-col gap-2 md:min-w-[220px] shrink-0 border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-4">
        <div className="flex justify-between items-center text-[12px]">
           <span className="text-slate-500 font-medium">Tagihan</span>
           <span className="font-bold text-slate-700">{formatRp(order.dp)} / {formatRp(order.total)}</span>
        </div>
        <div className="flex justify-between items-center text-[12px]">
           <span className="text-slate-500 font-medium flex items-center gap-1">
             <span className="material-symbols-outlined text-[14px]">calendar_today</span> Deadline
           </span>
           <span className={order.deadline ? "font-bold text-amber-600" : "text-slate-400"}>
             {order.deadline ? new Date(order.deadline).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-"}
           </span>
        </div>
      </div>

      {/* Kolom Aksi */}
      <div className="flex items-center gap-2 shrink-0 md:w-[260px] justify-end border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-4">
        <button
          onClick={onEdit}
          className="flex items-center justify-center h-9 w-9 shrink-0 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
          title="Edit Pesanan"
        >
          <span className="material-symbols-outlined text-[18px]">edit</span>
        </button>
        <button
          onClick={onWA}
          className="flex-1 md:flex-none px-4 h-9 flex items-center justify-center gap-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
          title="Follow-up WhatsApp"
        >
          <span className="material-symbols-outlined text-[18px]">chat</span>
          <span className="text-xs font-bold">Follow-up</span>
        </button>
        
        <div className="flex items-center gap-0.5 bg-slate-50 rounded-lg p-0.5 border border-slate-100">
          <button
            onClick={() => onMove("back")}
            disabled={!canBack}
            className="w-9 h-8 flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm text-slate-500 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
            title="Pindah ke tahap sebelumnya"
          >
            <span className="material-symbols-outlined text-[20px]">chevron_left</span>
          </button>
          <button
            onClick={() => onMove("forward")}
            disabled={!canForward}
            className="w-9 h-8 flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm text-blue-600 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
            title="Pindah ke tahap selanjutnya"
          >
            <span className="material-symbols-outlined text-[20px]">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function PesananPage() {
  const [isClient, setIsClient] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [waOrder, setWaOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | "all">("all");
  
  const [view, setView] = useState<"list" | "form">("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newOrder, setNewOrder] = useState<Partial<Order>>({ client: "", phone: "", service: "Jasa Website", status: "antrean", dp: 0, total: 0, deadline: "", notes: "", handover: "" });

  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem("revtech_orders");
    if (saved) {
      setOrders(JSON.parse(saved));
    } else {
      setOrders(defaultOrders);
      localStorage.setItem("revtech_orders", JSON.stringify(defaultOrders));
    }
  }, []);

  const moveOrder = (id: string, dir: "back" | "forward") => {
    const order = orders.find(o => o.id === id);
    if (!order) return;

    const idx = PIPELINE.findIndex(p => p.status === order.status);
    if (dir === "forward" && idx >= PIPELINE.length - 1) return;
    if (dir === "back" && idx <= 0) return;

    const newStatus = dir === "forward" ? PIPELINE[idx + 1].status : PIPELINE[idx - 1].status;
    const updated = orders.map(o => o.id === id ? { ...o, status: newStatus } : o);
    setOrders(updated);
    localStorage.setItem("revtech_orders", JSON.stringify(updated));

    const today = new Date().toISOString().split("T")[0];

    // ── Otomasi: Masuk ke Pelunasan → buat Invoice Pelunasan ──────────────────
    if (newStatus === "pelunasan") {
      const pelunasanAmount = order.total - order.dp;
      if (pelunasanAmount > 0) {
        const newInvoice = {
          id: `INV-${Date.now().toString().slice(-5)}`,
          orderId: order.id,
          client: order.client,
          phone: order.phone,
          type: "pelunasan",
          amount: pelunasanAmount,
          status: "pending",
          issuedAt: today,
          paidAt: null,
          dueDate: today,
          description: `Pelunasan — ${order.service}`,
        };
        try {
          const savedInv = localStorage.getItem("revtech_invoices");
          const invList = savedInv ? JSON.parse(savedInv) : [];
          // Cek tidak duplikat
          const exists = invList.find((i: any) => i.orderId === order.id && i.type === "pelunasan");
          if (!exists) {
            localStorage.setItem("revtech_invoices", JSON.stringify([newInvoice, ...invList]));
          }
        } catch (err) { console.error(err); }
      }
    }

    // ── Otomasi: Selesai → tambah/update data Klien ───────────────────────────
    if (newStatus === "selesai") {
      try {
        const savedClients = localStorage.getItem("revtech_clients");
        const clientList = savedClients ? JSON.parse(savedClients) : [];
        const existing = clientList.find((c: any) =>
          c.phone === order.phone || c.name.toLowerCase() === order.client.toLowerCase()
        );
        if (existing) {
          // Update total belanja
          const updatedClients = clientList.map((c: any) =>
            c.id === existing.id
              ? { ...c, totalSpend: (c.totalSpend || 0) + order.total, activeProjects: Math.max(0, (c.activeProjects || 0) - 1) }
              : c
          );
          localStorage.setItem("revtech_clients", JSON.stringify(updatedClients));
        } else {
          // Tambah klien baru
          const newClient = {
            id: `CLN-${Date.now().toString().slice(-5)}`,
            name: order.client, contact: order.client, phone: order.phone,
            email: "", website: null, domain: null, domainExpiry: null,
            hosting: null, hostingExpiry: null, websiteStatus: "active",
            joinDate: today, totalSpend: order.total, activeProjects: 0
          };
          localStorage.setItem("revtech_clients", JSON.stringify([newClient, ...clientList]));
        }
      } catch (err) { console.error(err); }
    }
  };

  const handleEdit = (order: Order) => {
    setNewOrder({
      client: order.client, phone: order.phone, service: order.service,
      status: order.status, dp: order.dp, total: order.total,
      deadline: order.deadline || "", notes: order.notes || "", handover: order.handover || ""
    });
    setEditingId(order.id);
    setView("form");
  };

  const handleAddOrder = (e: React.FormEvent) => {
    e.preventDefault();
    let updatedOrders = [...orders];

    if (editingId) {
      updatedOrders = orders.map(o => o.id === editingId ? {
        ...o, client: newOrder.client || "", phone: newOrder.phone || "", service: newOrder.service || "",
        status: newOrder.status as OrderStatus || "antrean", dp: Number(newOrder.dp) || 0, total: Number(newOrder.total) || 0,
        deadline: newOrder.deadline || null, notes: newOrder.notes || "", handover: newOrder.handover
      } : o);
    } else {
      const id = `ORD-${Date.now().toString().slice(-4)}`;
      updatedOrders = [{
        id, client: newOrder.client || "", phone: newOrder.phone || "", service: newOrder.service || "",
        status: newOrder.status as OrderStatus || "antrean", dp: Number(newOrder.dp) || 0, total: Number(newOrder.total) || 0,
        deadline: newOrder.deadline || null, notes: newOrder.notes || "", handover: newOrder.handover,
        createdAt: new Date().toISOString().split("T")[0]
      }, ...orders];
    }
    
    setOrders(updatedOrders);
    localStorage.setItem("revtech_orders", JSON.stringify(updatedOrders));
    setView("list");
    setEditingId(null);
  };

  const filtered = filterStatus === "all" ? orders : orders.filter((o) => o.status === filterStatus);

  return (
    <div>
      {/* Toolbar: Search & Add */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 mt-2">
        {view === "list" ? (
          <div className="relative w-full sm:w-72">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
            <input
              type="text"
              placeholder="Cari ID atau nama klien..."
              className="w-full pl-9 pr-4 py-2 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              style={{ background: "var(--adm-card)", borderColor: "var(--adm-border)", color: "var(--adm-text)" }}
            />
          </div>
        ) : (
          <button
            onClick={() => setView("list")}
            className="inline-flex shrink-0 items-center justify-center gap-2 px-1 py-2 text-sm font-medium active:scale-95 transition-all text-slate-600"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Kembali
          </button>
        )}

        {view === "list" && (
          <button
            id="add-pesanan"
            onClick={() => {
              setEditingId(null);
              setNewOrder({ client: "", phone: "", service: "Jasa Website", status: "antrean", dp: 0, total: 0, deadline: "", notes: "", handover: "" });
              setView("form");
            }}
            className="inline-flex shrink-0 items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:scale-95 transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            Tambah Pesanan
          </button>
        )}
      </div>
      {view === "list" && (
        <>
          {/* Filter tabs */}
          <div className="flex items-center gap-1.5 mb-5 flex-wrap">
            <button
              id="filter-all"
              onClick={() => setFilterStatus("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filterStatus === "all" ? "bg-blue-600 text-white" : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"}`}
            >
              Semua ({orders.length})
            </button>
            {PIPELINE.map((p) => {
              const count = orders.filter((o) => o.status === p.status).length;
              return (
                <button
                  key={p.status}
                  id={`filter-${p.status}`}
                  onClick={() => setFilterStatus(p.status)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filterStatus === p.status ? "bg-blue-600 text-white" : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"}`}
                >
                  {p.label} {count > 0 && `(${count})`}
                </button>
              );
            })}
          </div>

          {/* List Layout */}
          <div className="flex flex-col gap-4 pb-8 pt-2">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-slate-400 opacity-60 py-16 bg-white rounded-2xl border border-dashed border-slate-200">
                <span className="material-symbols-outlined text-[48px] mb-3 font-light">inbox</span>
                <p className="text-sm font-medium">Belum ada proyek yang sesuai dengan kriteria filter</p>
              </div>
            ) : (
              filtered.map((order) => (
                 <OrderCard
                    key={order.id}
                    order={order}
                    onWA={() => setWaOrder(order)}
                    onMove={(dir) => moveOrder(order.id, dir)}
                    onEdit={() => handleEdit(order)}
                 />
              ))
            )}
          </div>
        </>
      )}

      {view === "form" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mt-4 mx-auto">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-slate-800 mb-6">{editingId ? "Edit Pesanan" : "Tambah Pesanan Baru"}</h2>
            
            <form onSubmit={handleAddOrder} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Nama Klien / Instansi</label>
                  <input required type="text" value={newOrder.client} onChange={(e) => setNewOrder({ ...newOrder, client: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="Contoh: PT. Maju Jaya" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Nomor WhatsApp</label>
                  <input required type="text" value={newOrder.phone} onChange={(e) => setNewOrder({ ...newOrder, phone: e.target.value.replace(/\D/g, '') })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="Contoh: 62812..." />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Layanan</label>
                  <input required type="text" value={newOrder.service} onChange={(e) => setNewOrder({ ...newOrder, service: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="Contoh: Website Compro" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Opsi Serah Terima</label>
                  <input type="text" value={newOrder.handover} onChange={(e) => setNewOrder({ ...newOrder, handover: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="Contoh: Terima Beres (Hosting)" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Status</label>
                  <select value={newOrder.status} onChange={(e) => setNewOrder({ ...newOrder, status: e.target.value as OrderStatus })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                    {PIPELINE.map(p => <option key={p.status} value={p.status}>{p.label}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">DP (Rp)</label>
                  <input type="number" value={newOrder.dp} onChange={(e) => setNewOrder({ ...newOrder, dp: parseInt(e.target.value) || 0 })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Total Harga (Rp)</label>
                  <input type="number" required value={newOrder.total} onChange={(e) => setNewOrder({ ...newOrder, total: parseInt(e.target.value) || 0 })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Deadline</label>
                  <input type="date" value={newOrder.deadline || ""} onChange={(e) => setNewOrder({ ...newOrder, deadline: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Catatan Proyek</label>
                  <textarea rows={2} value={newOrder.notes} onChange={(e) => setNewOrder({ ...newOrder, notes: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 custom-scrollbar" placeholder="Fitur khusus, catatan tim, dll." />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
                <button type="button" onClick={() => setView("list")} className="px-5 py-2.5 rounded-xl font-semibold text-slate-500 hover:bg-slate-100 transition-colors">Batal</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm">{editingId ? "Simpan Perubahan" : "Simpan Pesanan"}</button>
              </div>
            </form>
          </div>
        </motion.div>
      )}

      {waOrder && <WAModal order={waOrder} onClose={() => setWaOrder(null)} />}
    </div>
  );
}
