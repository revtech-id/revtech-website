"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader, StatusBadge } from "@/components/admin/ui";
import rawOrders from "@/data/admin/orders.json";

type OrderStatus = "inbox" | "chat" | "dp" | "pengerjaan" | "revisi" | "pelunasan" | "handover" | "selesai";

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
}

const orders: Order[] = rawOrders as Order[];

const PIPELINE: { status: OrderStatus; label: string; badgeVariant: "slate" | "purple" | "amber" | "blue" | "indigo" | "rose" | "emerald" | "blue" }[] = [
  { status: "inbox", label: "Inbox", badgeVariant: "slate" },
  { status: "chat", label: "Chat", badgeVariant: "purple" },
  { status: "dp", label: "DP 50%", badgeVariant: "amber" },
  { status: "pengerjaan", label: "Pengerjaan", badgeVariant: "blue" },
  { status: "revisi", label: "Revisi", badgeVariant: "indigo" },
  { status: "pelunasan", label: "Pelunasan", badgeVariant: "rose" },
  { status: "handover", label: "Handover", badgeVariant: "blue" },
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
              <span className="text-emerald-600 text-xl">🟢</span>
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

function OrderCard({ order, onWA, onMove }: { order: Order; onWA: () => void; onMove: (dir: "back" | "forward") => void }) {
  const pipelineIndex = PIPELINE.findIndex((p) => p.status === order.status);
  const badge = PIPELINE[pipelineIndex];
  const canForward = pipelineIndex < PIPELINE.length - 1;
  const canBack = pipelineIndex > 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-3.5 space-y-2 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-800 truncate">{order.client}</p>
          <p className="text-xs text-slate-400 truncate">{order.service}</p>
        </div>
        <StatusBadge label={badge.label} variant={badge.badgeVariant as "slate" | "emerald" | "amber" | "indigo" | "rose" | "blue" | "purple"} />
      </div>

      {order.notes && (
        <p className="text-xs text-slate-500 bg-slate-50 rounded-lg px-2 py-1.5 truncate">{order.notes}</p>
      )}

      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>{formatRp(order.dp)} / {formatRp(order.total)}</span>
        {order.deadline && (
          <span className="text-amber-600 font-medium">📅 {new Date(order.deadline).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}</span>
        )}
      </div>

      <div className="flex items-center gap-1.5 pt-1">
        <button
          id={`wa-followup-${order.id}`}
          onClick={onWA}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 transition-colors border border-emerald-200/60"
        >
          🟢 Follow-up WA
        </button>
        <button
          onClick={() => onMove("back")}
          disabled={!canBack}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 disabled:opacity-30 transition-colors"
          aria-label="Mundur satu tahap"
        >
          <span className="material-symbols-outlined text-[16px]">chevron_left</span>
        </button>
        <button
          onClick={() => onMove("forward")}
          disabled={!canForward}
          className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 disabled:opacity-30 transition-colors"
          aria-label="Maju satu tahap"
        >
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        </button>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function PesananPage() {
  // TODO: replace with API call to fetch real orders
  const [orderList, setOrderList] = useState<Order[]>(orders);
  const [waOrder, setWaOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | "all">("all");

  function moveOrder(id: string, dir: "back" | "forward") {
    setOrderList((prev) =>
      prev.map((o) => {
        if (o.id !== id) return o;
        const idx = PIPELINE.findIndex((p) => p.status === o.status);
        const next = dir === "forward" ? idx + 1 : idx - 1;
        if (next < 0 || next >= PIPELINE.length) return o;
        return { ...o, status: PIPELINE[next].status };
      })
    );
  }

  const filtered = filterStatus === "all" ? orderList : orderList.filter((o) => o.status === filterStatus);

  return (
    <div>
      <PageHeader
        title="Pesanan"
        description="Pipeline manajemen seluruh pesanan & proyek klien"
        icon="work"
        action={
          <button
            id="add-pesanan"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            Tambah Pesanan
          </button>
        }
      />

      {/* Filter tabs */}
      <div className="flex items-center gap-1.5 mb-5 flex-wrap">
        <button
          id="filter-all"
          onClick={() => setFilterStatus("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filterStatus === "all" ? "bg-blue-600 text-white" : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"}`}
        >
          Semua ({orderList.length})
        </button>
        {PIPELINE.map((p) => {
          const count = orderList.filter((o) => o.status === p.status).length;
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

      {/* Kanban columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {PIPELINE.filter((p) => filterStatus === "all" || p.status === filterStatus).map((stage) => {
          const stageOrders = filtered.filter((o) => o.status === stage.status);
          return (
            <div key={stage.status} className="bg-slate-100/70 rounded-2xl p-3 min-h-[200px]">
              <div className="flex items-center justify-between mb-3">
                <StatusBadge label={stage.label} variant={stage.badgeVariant as "slate" | "emerald" | "amber" | "indigo" | "rose" | "blue" | "purple"} />
                <span className="text-xs font-bold text-slate-400">{stageOrders.length}</span>
              </div>
              <div className="flex flex-col gap-2">
                {stageOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onWA={() => setWaOrder(order)}
                    onMove={(dir) => moveOrder(order.id, dir)}
                  />
                ))}
                {stageOrders.length === 0 && (
                  <p className="text-center text-xs text-slate-400 py-6">Kosong</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {waOrder && <WAModal order={waOrder} onClose={() => setWaOrder(null)} />}
    </div>
  );
}
