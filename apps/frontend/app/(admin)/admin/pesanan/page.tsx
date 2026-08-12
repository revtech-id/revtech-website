"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { StatusBadge, AdminToolbar } from "@/components/admin/ui";
import { Pencil, Trash2, MessageSquare, Handshake, X, ChevronDown, Globe, MonitorPlay, Box, SlidersHorizontal, CheckCircle2, Undo2, AlertTriangle, CircleDollarSign, CheckSquare, Calendar, Star, FolderKanban } from "lucide-react";
import rawOrders from "@/data/admin/orders.json";
import { logActivity } from "@/lib/activityLog";

type OrderStatus = "antrean" | "pengerjaan" | "revisi" | "pelunasan" | "handover" | "selesai" | "batal";

interface Order {
  id: string;
  client: string;
  company?: string;               // nama bisnis/instansi
  service: string;
  status: OrderStatus;
  dp: number;
  total: number;
  phone: string;
  createdAt: string;
  deadline: string | null;
  notes: string;
  handoverOption?: string; // Opsi dari klien (Terima Beres, dll)
  handover?: string;       // Link hasil pekerjaan
  recurringFee?: number;   // Tagihan bulanan/tahunan
  nextBillingDate?: string;// Tanggal tagihan berikutnya
  assignedDev?: string;           // siapa developer yang mengerjakan
  progressLog?: { date: string; note: string; by: string }[]; // log progress bertanggal
  maxRevisions?: number;          // berapa kali bisa revisi
  usedRevisions?: number;         // jumlah revisi yang sudah terpakai
  isTestimoniAdded?: boolean;
  isPortofolioAdded?: boolean;
}

const SERVICE_TABS = ["Semua", "Jasa Website", "Produk Digital", "Custom Project", "Jasa Modifikasi"];

const defaultOrders: Order[] = [];

const PIPELINE: { status: OrderStatus; label: string; badgeVariant: "slate" | "purple" | "amber" | "blue" | "indigo" | "rose" | "emerald" }[] = [
  { status: "antrean", label: "Antrean", badgeVariant: "slate" },
  { status: "pengerjaan", label: "Pengerjaan", badgeVariant: "blue" },
  { status: "revisi", label: "Revisi", badgeVariant: "indigo" },
  { status: "pelunasan", label: "Pelunasan", badgeVariant: "amber" },
  { status: "handover", label: "Handover", badgeVariant: "purple" },
  { status: "selesai", label: "Selesai", badgeVariant: "emerald" },
  { status: "batal", label: "Batal", badgeVariant: "rose" },
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
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="bg-[var(--adm-card)] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden p-6"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-[var(--adm-success)]/10 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-[var(--adm-success)]"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
            </div>
            <div className="flex-1 min-w-0">
              <h2 id="wa-modal-title" className="text-lg font-bold text-[var(--adm-text)]">Follow-up WhatsApp</h2>
              <p className="text-xs text-[var(--adm-text-3)] mt-0.5 truncate">{order.client} · {statusLabel}</p>
            </div>
            <button id="wa-modal-close" onClick={onClose} className="p-1.5 rounded-lg text-[var(--adm-text-3)] hover:text-[var(--adm-text)] hover:bg-[var(--adm-bg)] transition-colors">
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <div className="space-y-4">
            {/* Draft Area */}
            {!draft && !loading && !error && (
              <div className="text-center py-6 bg-[var(--adm-bg)] rounded-xl">
                <p className="text-sm text-[var(--adm-text-2)] mb-4 px-4">AI akan membuatkan pesan follow-up yang tepat untuk status <strong>{statusLabel}</strong>.</p>
                <button
                  id="generate-wa-draft"
                  onClick={generateDraft}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--adm-accent)] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                  Generate Draft AI
                </button>
              </div>
            )}

            {loading && (
              <div className="flex flex-col gap-2 py-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className={`h-3 bg-[var(--adm-bg)] rounded-full animate-pulse ${i === 4 ? "w-1/2" : "w-full"}`} />
                ))}
              </div>
            )}

            {error && (
              <div className="p-3 rounded-xl bg-[var(--adm-danger)]/10 text-sm text-[var(--adm-danger)] font-medium">{error}</div>
            )}

            {draft && (
              <div>
                <label className="text-xs font-semibold text-[var(--adm-text-2)] uppercase tracking-wide block mb-2">Draft Pesan</label>
                <textarea
                  id="wa-draft-text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={7}
                  className="w-full px-4 py-3 rounded-xl bg-[var(--adm-bg)] text-sm text-[var(--adm-text)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--adm-accent)]/30"
                />
                <div className="flex justify-end mt-2">
                  <button
                    id="regenerate-wa-draft"
                    onClick={generateDraft}
                    className="text-xs font-semibold text-[var(--adm-text-3)] hover:text-[var(--adm-text)] transition-colors flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">refresh</span> Regenerate
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center gap-2 mt-6 pt-2">
            <button
              id="cancel-wa-modal"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-[var(--adm-text-2)] hover:bg-[var(--adm-bg)] hover:text-[var(--adm-text)] transition-colors"
            >
              Batal
            </button>
            <button
              id="send-wa-button"
              onClick={openWA}
              disabled={!draft}
              className="flex-1 py-2.5 rounded-xl bg-[var(--adm-success)] text-white text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
              Kirim
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Order Card ────────────────────────────────────────────────────────────────

function OrderCard({ order, index, onWA, onEdit, onDelete, onStatusChange, onQuickLunas, onQuickHandover, onIncrementRevision, onCardClick, onTestimoniClick, onPortofolioClick }: { order: Order; index: number; onWA: () => void; onEdit: () => void; onDelete: () => void; onStatusChange: (status: OrderStatus) => void; onQuickLunas: () => void; onQuickHandover: () => void; onIncrementRevision: () => void; onCardClick: () => void; onTestimoniClick: () => void; onPortofolioClick: () => void; }) {
  const pipelineIndex = PIPELINE.findIndex((p) => p.status === order.status);
  const badge = PIPELINE[pipelineIndex] || PIPELINE[0];

  const getStyle = (variant: string) => {
    const colors: Record<string, string> = {
      emerald: "var(--adm-success)",
      amber: "var(--adm-warning)",
      indigo: "var(--adm-accent)",
      rose: "var(--adm-danger)",
      slate: "var(--adm-text-3)",
      blue: "var(--adm-accent)",
      purple: "#7C3AED",
    };
    return { color: colors[variant] || colors.slate };
  };

  const getDeadlineColor = (deadline: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dlDate = new Date(deadline);
    dlDate.setHours(0, 0, 0, 0);
    
    const diffTime = dlDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return "text-[var(--adm-danger)]";
    if (diffDays <= 7) return "text-[var(--adm-warning)]";
    return "text-[var(--adm-text-3)]";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0, transition: { delay: index * 0.04, type: "spring", stiffness: 300, damping: 28 } }}
      className="bg-[var(--adm-card)] rounded-2xl shadow-[var(--adm-shadow)] overflow-hidden hover:shadow-[var(--adm-shadow-md)] transition-shadow cursor-pointer border border-transparent"
      onClick={onCardClick}
    >
      <div className="p-4 flex flex-col gap-2">
        {/* Top Row: Identity & Status */}
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-[var(--adm-text-2)] font-medium mt-1">
            <span className="text-sm font-semibold text-[var(--adm-text)]">{order.client}</span>
            {order.company && order.company !== "-" && (
              <span className="px-2 py-0.5 rounded bg-[var(--adm-bg)] text-[var(--adm-text-2)] text-[10px] font-semibold hidden sm:inline-block">
                {order.company}
              </span>
            )}
            {(() => {
              const [cat] = order.service.split(" - ");
              return <span>{cat}</span>;
            })()}
          </div>

          <div className="flex items-center justify-end gap-1.5 shrink-0">
            {order.status === "pelunasan" && order.dp < order.total && (
              <button onClick={(e) => { e.stopPropagation(); onQuickLunas(); }} className="inline-flex items-center justify-center p-1.5 text-[var(--adm-success)] hover:opacity-70 transition-all active:scale-95 focus:outline-none" title="Tandai Lunas">
                <CircleDollarSign size={18} strokeWidth={2.5} />
              </button>
            )}
            {order.status === "handover" && (
              <button onClick={(e) => { e.stopPropagation(); onQuickHandover(); }} className="inline-flex items-center justify-center p-1.5 text-[var(--adm-accent)] hover:opacity-70 transition-all active:scale-95 focus:outline-none" title="Handover & Selesai">
                <CheckSquare size={18} strokeWidth={2.5} />
              </button>
            )}
            {order.status === "selesai" ? (
              <div className="flex items-center gap-1.5 shrink-0 ml-1">
                <button onClick={(e) => { e.stopPropagation(); onTestimoniClick(); }} className={`inline-flex items-center justify-center p-1 transition-colors focus:outline-none ${order.isTestimoniAdded ? 'text-[var(--adm-warning)]' : 'text-[var(--adm-text-3)] hover:text-white'}`} title="Opsi Testimoni">
                  <Star size={15} strokeWidth={2.5} />
                </button>
                <button onClick={(e) => { e.stopPropagation(); onPortofolioClick(); }} className={`inline-flex items-center justify-center p-1 transition-colors focus:outline-none ${order.isPortofolioAdded ? 'text-[var(--adm-accent)]' : 'text-[var(--adm-text-3)] hover:text-white'}`} title="Opsi Portofolio">
                  <FolderKanban size={15} strokeWidth={2.5} />
                </button>
                <div className="w-px h-4 bg-[var(--adm-border)] mx-0.5"></div>
                <div className="flex items-center gap-1.5 py-1.5 text-[11px] font-bold" style={getStyle(badge.badgeVariant)}>
                  <span className="truncate">{badge.label}</span>
                  <CheckCircle2 size={13} strokeWidth={2.5} />
                </div>
              </div>
            ) : (
              <select
                value={order.status}
                onClick={(e) => e.stopPropagation()}
                onChange={e => { e.stopPropagation(); onStatusChange(e.target.value as OrderStatus); }}
                className="text-[11px] text-[var(--adm-text-3)] font-bold py-1.5 border-0 bg-transparent cursor-pointer focus:outline-none text-right shrink-0 ml-1"
              >
                {PIPELINE.map(p => {
                  return (
                    <option key={p.status} value={p.status} className="bg-[var(--adm-card)] text-[var(--adm-text)]">
                      {p.label}
                    </option>
                  );
                })}
              </select>
            )}
          </div>
        </div>

        {/* Middle Row: Service detail — Dev/Notes */}
        <div className="flex items-baseline gap-2 mt-1.5 mb-2 pr-4 sm:pr-8 overflow-hidden">
          {(() => {
            const [cat, ...rest] = order.service.split(" - ");
            let detail = rest.length > 0 ? rest.join(" - ") : order.service;
            
            // Fallback for older data where package wasn't saved properly
            if (cat === "Jasa Website" && rest.length === 0) {
              detail = "Paket (Tidak Diketahui)";
            } else if (cat === "Produk Digital" && rest.length === 0) {
              detail = "Produk (Tidak Diketahui)";
            }
            
            return <h3 className="text-[14px] font-bold text-[var(--adm-text)] whitespace-nowrap">{detail}</h3>;
          })()}
          <span className="text-[var(--adm-text-3)] hidden sm:inline">—</span>
          <p className="text-[13px] text-[var(--adm-text-2)] truncate cursor-default flex-1 min-w-0">
            {order.assignedDev
              ? <span className="font-medium">Dev: {order.assignedDev}</span>
              : order.notes
                ? (() => {
                    const match = order.notes.match(/^(.*?)(?:\s*\|\s*)?((?:Pembayaran|Handover):.*)$/);
                    if (match) {
                      const isHandover = match[2].startsWith("Handover");
                      return (
                        <span title={order.notes}>
                          {match[1] && <span>"{match[1]}" <span className="text-[var(--adm-border)]">|</span> </span>}
                          <span className={`${isHandover ? "text-[var(--adm-accent)]" : "text-[var(--adm-warning)]"} font-medium`}>{match[2]}</span>
                        </span>
                      );
                    }
                    return <span title={order.notes}>"{order.notes}"</span>;
                  })()
                : <span className="italic text-[var(--adm-text-3)]">Belum ada dev assigned</span>
            }
          </p>
        </div>

        {/* Bottom Row: Payment + Tags / Actions + Deadline */}
        <div className="flex flex-wrap items-end justify-between gap-4 mt-1">
          {/* Left: DP badge + handover + VIP */}
          <div className="flex flex-wrap items-center gap-1.5">
            {order.total > 0 && (() => {
              const isPaid = order.dp >= order.total;
              const hasDP = order.dp > 0;
              return (
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${isPaid ? 'bg-[var(--adm-success)]/10 text-[var(--adm-success)]' : 'bg-[var(--adm-bg)] text-[var(--adm-text-2)]'}`}>
                  {isPaid
                    ? "✓ Lunas"
                    : hasDP
                      ? `DP ${formatRp(order.dp)} / ${formatRp(order.total)}`
                      : `Belum DP — ${formatRp(order.total)}`}
                </span>
              );
            })()}
            {order.handoverOption && (
              <span className="px-2 py-0.5 rounded bg-[var(--adm-bg)] text-[var(--adm-text-2)] text-[10px] font-semibold" title="Opsi Serah Terima">
                {order.handoverOption}
              </span>
            )}
            {order.handover && (
              <a 
                href={order.handover.startsWith('http') ? order.handover : `https://${order.handover}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="px-2 py-0.5 rounded bg-[var(--adm-bg)] hover:bg-[var(--adm-border)] text-[var(--adm-text-2)] hover:text-[var(--adm-accent)] transition-colors text-[10px] font-semibold flex items-center gap-1 cursor-pointer" 
                title="Link/Aset Pekerjaan"
                onClick={(e) => e.stopPropagation()}
              >
                <Globe size={10} />
                <span className="truncate max-w-[150px]">{order.handover}</span>
              </a>
            )}
            {order.recurringFee !== undefined && order.recurringFee > 0 && order.nextBillingDate && (
              <span className="px-2 py-0.5 rounded bg-[var(--adm-bg)] text-[var(--adm-text-2)] text-[10px] font-semibold flex items-center gap-1" title="Jadwal Tagihan Selanjutnya">
                <Calendar size={10} />
                {new Date(order.nextBillingDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} : {formatRp(order.recurringFee)}
              </span>
            )}
            {order.status === "revisi" && order.maxRevisions !== undefined && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wide border flex items-center gap-1" style={{ color: "var(--adm-warning)", backgroundColor: "rgba(245, 158, 11, 0.1)", borderColor: "rgba(245, 158, 11, 0.2)" }} title="Batas Revisi">
                <Undo2 size={10} />
                Revisi: {order.usedRevisions || 0}/{order.maxRevisions}
                {(order.usedRevisions || 0) < order.maxRevisions && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); onIncrementRevision(); }}
                    className="ml-1 hover:text-[var(--adm-text)] transition-colors opacity-70 hover:opacity-100 text-[12px]"
                    title="Gunakan 1 Revisi"
                  >
                    +
                  </button>
                )}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0 ml-auto mt-2 sm:mt-0">
            <div className="flex items-center gap-1.5">
              <button onClick={(e) => { e.stopPropagation(); onWA(); }} className="inline-flex items-center justify-center p-1.5 text-[var(--adm-text-3)] hover:text-[var(--adm-text)] transition-colors focus:outline-none" title="Follow-up WhatsApp">
                <MessageSquare size={13} strokeWidth={2} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="inline-flex items-center justify-center p-1.5 text-[var(--adm-text-3)] hover:text-[var(--adm-text)] transition-colors focus:outline-none" title="Edit">
                <Pencil size={13} strokeWidth={2} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="inline-flex items-center justify-center p-1.5 text-[var(--adm-text-3)] hover:text-[var(--adm-danger)] transition-colors focus:outline-none" title="Hapus">
                <Trash2 size={13} strokeWidth={2} />
              </button>
            </div>

            <div className="w-px h-4 bg-[var(--adm-border)] hidden sm:block"></div>

            <div className="flex items-center gap-2 text-[10px] font-semibold shrink-0 uppercase tracking-wider">
              <span className="text-[var(--adm-text-3)]">{new Date(order.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</span>
              {order.deadline && (
                <>
                  <span className="text-[var(--adm-text-3)] opacity-40">-</span>
                  <span className={getDeadlineColor(order.deadline)}>
                    {new Date(order.deadline).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function PesananPage() {
  const [isClient, setIsClient] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [deletedOrders, setDeletedOrders] = useState<Order[]>([]);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | "all">("all");
  const [serviceFilter, setServiceFilter] = useState("Semua");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("oldest");
  const [view, setView] = useState<"list" | "form">("list");
  
  // States for Modals
  const [actionPopup, setActionPopup] = useState<{ type: "testimoni" | "portofolio", orderId: string } | null>(null);
  
  // States for Toast
  const [toastMessage, setToastMessage] = useState<{ text: string, type: "success" | "error" | "info" } | null>(null);

  function showToast(text: string, type: "success" | "error" | "info" = "success") {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  }

  const [waOrder, setWaOrder] = useState<Order | null>(null);
  const [handoverOrder, setHandoverOrder] = useState<Order | null>(null);
  const [lunasOrder, setLunasOrder] = useState<Order | null>(null);
  const [lunasPayment, setLunasPayment] = useState<number>(0);
  const [lunasNote, setLunasNote] = useState<string>("");
  const [handoverLink, setHandoverLink] = useState("");
  const [handoverNote, setHandoverNote] = useState("");
  const [handoverOptionState, setHandoverOptionState] = useState("");
  const [recurringFeeState, setRecurringFeeState] = useState<number>(0);
  const [nextBillingDateState, setNextBillingDateState] = useState("");
  const [revisionOrder, setRevisionOrder] = useState<Order | null>(null);
  const [revisionNote, setRevisionNote] = useState("");
  
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);
  const [detailTab, setDetailTab] = useState<"info" | "pembayaran" | "riwayat">("info");
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmStatusChangeData, setConfirmStatusChangeData] = useState<Partial<Order> | null>(null);
  
  const [newOrder, setNewOrder] = useState<Partial<Order>>({
    client: "", phone: "", service: "Jasa Website", status: "antrean", dp: 0, total: 0, deadline: "", notes: "", handoverOption: "", handover: ""
  });

  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem("revtech_orders");
    if (saved) setOrders(JSON.parse(saved));
    else setOrders(defaultOrders);

    const savedDeleted = localStorage.getItem("revtech_orders_trash");
    if (savedDeleted) setDeletedOrders(JSON.parse(savedDeleted));
  }, []);

  // Auto-calculate next billing date based on handover option
  useEffect(() => {
    if (handoverOrder && handoverOptionState) {
      const today = new Date();
      if (handoverOptionState.includes("Basic")) {
        // 1 Year from now
        today.setFullYear(today.getFullYear() + 1);
        setNextBillingDateState(today.toISOString().split("T")[0]);
      } else if (handoverOptionState.includes("Plus")) {
        // 3 Months from now
        today.setMonth(today.getMonth() + 3);
        setNextBillingDateState(today.toISOString().split("T")[0]);
      } else {
        // Mandiri or others = no billing
        setNextBillingDateState("");
        setRecurringFeeState(0);
      }
    }
  }, [handoverOptionState, handoverOrder]);

  const saveOrders = (newOrders: Order[]) => {
    setOrders(newOrders);
    localStorage.setItem("revtech_orders", JSON.stringify(newOrders));
  };

  const saveDeletedOrders = (newDeleted: Order[]) => {
    setDeletedOrders(newDeleted);
    localStorage.setItem("revtech_orders_trash", JSON.stringify(newDeleted));
  };

  const triggerRevision = (id: string) => {
    const order = orders.find(o => o.id === id);
    if (order) {
      setRevisionOrder(order);
      setRevisionNote("");
    }
  };

  const confirmRevision = () => {
    if (!revisionOrder) return;
    const updated = orders.map(o => {
      if (o.id === revisionOrder.id && (o.usedRevisions || 0) < (o.maxRevisions || 0)) {
        const newUsed = (o.usedRevisions || 0) + 1;
        const noteText = revisionNote ? `Menggunakan revisi (${newUsed}/${o.maxRevisions}): ${revisionNote}` : `Menggunakan revisi (${newUsed}/${o.maxRevisions})`;
        const newLog = {
          date: new Date().toISOString(),
          note: noteText,
          by: "Admin"
        };
        const currentLogs = o.progressLog || [];
        return { ...o, usedRevisions: newUsed, progressLog: [...currentLogs, newLog] } as Order;
      }
      return o;
    });
    setOrders(updated);
    saveOrders(updated);
    setRevisionOrder(null);
    showToast("Revisi berhasil dicatat", "success");
  };

  // Deadline is now completely manual, no auto-calculation based on service.

  const confirmLunas = () => {
    if (!lunasOrder) return;
    const newTotal = lunasOrder.total;
    const newDp = lunasOrder.dp + (lunasPayment || 0);
    const isPaid = newDp >= newTotal;
    
    const newOrders = orders.map(o => {
      if (o.id !== lunasOrder.id) return o;
      
      let cleanedNotes = o.notes ? o.notes.replace(/\s*\|\s*Pembayaran:.*$/, "").replace(/^Pembayaran:.*$/, "") : "";
      
      let updatedNotes = cleanedNotes;
      
      if (!isPaid && lunasNote.trim()) {
        updatedNotes = cleanedNotes 
          ? `${cleanedNotes} | Pembayaran: ${lunasNote.trim()}`
          : `Pembayaran: ${lunasNote.trim()}`;
      }

      return {
        ...o,
        total: newTotal,
        dp: newDp,
        notes: updatedNotes,
        ...(isPaid && { status: "handover" as OrderStatus })
      };
    });
    
    saveOrders(newOrders);
    
    // Auto-update or create Pelunasan Invoice
    if (isPaid) {
      try {
        const today = new Date().toISOString().split("T")[0];
        const savedInvoices = localStorage.getItem("revtech_invoices");
        let invoiceList = savedInvoices ? JSON.parse(savedInvoices) : [];
        const existingIndex = invoiceList.findIndex((i: any) => i.id === `INV-PL-${lunasOrder.id}`);
        
        if (existingIndex !== -1) {
          // Update existing invoice to paid
          invoiceList[existingIndex].status = "paid";
          invoiceList[existingIndex].paidAt = today;
          localStorage.setItem("revtech_invoices", JSON.stringify(invoiceList));
        } else {
          // Create new if it doesn't exist for some reason
          const invoicePelunasan = {
            id: `INV-PL-${lunasOrder.id}`,
            orderId: lunasOrder.id,
            client: lunasOrder.client,
            company: lunasOrder.company,
            service: lunasOrder.service,
            phone: lunasOrder.phone,
            type: "pelunasan",
            amount: newTotal - lunasOrder.dp,
            status: "paid",
            issuedAt: today,
            paidAt: today,
            dueDate: today,
            description: `Pelunasan — ${lunasOrder.service || lunasOrder.client}`,
          };
          localStorage.setItem("revtech_invoices", JSON.stringify([invoicePelunasan, ...invoiceList]));
        }
      } catch (err) {
        console.error(err);
      }
    }

    setLunasOrder(null);
    setLunasNote("");
    setLunasPayment(0);
    
    // Log activity
    if (isPaid) {
      logActivity({
        type: "order_lunas",
        title: "Pembayaran Lunas",
        description: `Project ${lunasOrder.client} (${lunasOrder.service}) telah lunas sepenuhnya.`,
        user: "Admin",
      });
    } else {
      logActivity({
        type: "invoice_paid",
        title: "Pembayaran Diterima",
        description: `Pembayaran Rp ${(lunasPayment || 0).toLocaleString('id-ID')} diterima untuk project ${lunasOrder.client}.`,
        user: "Admin",
      });
    }
    
    showToast(isPaid ? "Lunas! Status otomatis berubah ke Handover." : "Pembayaran berhasil ditambahkan!");
  };

  const submitHandover = () => {
    if (!handoverOrder) return;
    
    const newOrders = orders.map(o => {
      if (o.id !== handoverOrder.id) return o;
      
      let cleanedNotes = o.notes ? o.notes.replace(/\s*\|\s*Handover:.*$/, "").replace(/^Handover:.*$/, "") : "";
      let updatedNotes = cleanedNotes;
      
      if (handoverNote.trim()) {
        updatedNotes = cleanedNotes 
          ? `${cleanedNotes} | Handover: ${handoverNote.trim()}`
          : `Handover: ${handoverNote.trim()}`;
      }

      return {
        ...o,
        status: "selesai" as OrderStatus,
        handoverOption: handoverOptionState,
        handover: handoverLink.trim(),
        recurringFee: recurringFeeState,
        nextBillingDate: nextBillingDateState,
        notes: updatedNotes
      };
    });
    
    saveOrders(newOrders);

    // Auto-generate Maintenance Invoice
    if (handoverOptionState.includes("Terima Beres") && nextBillingDateState && recurringFeeState > 0) {
      try {
        const today = new Date().toISOString().split("T")[0];
        const invoiceMaint = {
          id: `INV-MT-${handoverOrder.id}`,
          orderId: handoverOrder.id,
          client: handoverOrder.client,
          company: handoverOrder.company,
          service: handoverOrder.service,
          phone: handoverOrder.phone,
          type: "maintenance",
          amount: recurringFeeState,
          status: "pending",
          issuedAt: new Date().toISOString(),
          paidAt: null,
          dueDate: nextBillingDateState,
          description: `Maintenance (${handoverOptionState}) — ${handoverOrder.service || handoverOrder.client}`,
        };
        const savedInvoices = localStorage.getItem("revtech_invoices");
        const invoiceList = savedInvoices ? JSON.parse(savedInvoices) : [];
        const existing = invoiceList.find((i: any) => i.id === invoiceMaint.id);
        if (!existing) {
          localStorage.setItem("revtech_invoices", JSON.stringify([invoiceMaint, ...invoiceList]));
        }
      } catch (err) {
        console.error(err);
      }
    }

    setHandoverOrder(null);
    setHandoverLink("");
    setHandoverNote("");
    setHandoverOptionState("");
    setRecurringFeeState(0);
    setNextBillingDateState("");
    
    // Log activity
    logActivity({
      type: "order_handover",
      title: "Project Selesai & Diserahterimakan",
      description: `Project ${handoverOrder.client} (${handoverOrder.service}) telah selesai dan diserahterimakan.`,
      user: "Admin",
    });
    
    showToast("Project selesai & Handover tersimpan!");
  };

  const changeOrderStatus = (id: string, newStatus: OrderStatus) => {
    const originalOrder = orders.find(o => o.id === id);
    
    // Prevent changing to selesai/handover if not fully paid
    if (originalOrder && (newStatus === "selesai" || newStatus === "handover") && originalOrder.dp < originalOrder.total) {
      showToast("Klien belum lunas! Silakan lunasi pembayaran terlebih dahulu.", "error");
      return;
    }
    
    const restrictedStatuses = ["selesai", "batal", "handover"];
    
    if (originalOrder && restrictedStatuses.includes(originalOrder.status) && newStatus !== originalOrder.status) {
      setEditingId(id);
      setConfirmStatusChangeData({ ...originalOrder, status: newStatus } as Order);
      return;
    }
    const updated = orders.map(o => {
      if (o.id === id) {
        const newLog = {
          date: new Date().toISOString(),
          note: `Status diubah dari ${o.status.toUpperCase()} menjadi ${newStatus.toUpperCase()}`,
          by: "Admin"
        };
        const currentLogs = o.progressLog || [];
        return { ...o, status: newStatus, progressLog: [...currentLogs, newLog] };
      }
      return o;
    });
    setOrders(updated);
    saveOrders(updated);
    showToast("Status berhasil diperbarui");

    // Jika dibatalkan, hanguskan DP (biarkan Lunas) dan batalkan (hapus) tagihan pelunasan
    if (newStatus === "batal") {
      try {
        const savedInvoices = localStorage.getItem("revtech_invoices");
        if (savedInvoices) {
          const invoiceList = JSON.parse(savedInvoices);
          // Hapus tagihan pelunasan yang masih pending untuk order ini
          const updatedInvoices = invoiceList.filter((i: any) => !(i.id === `INV-PL-${id}` && i.status === "pending"));
          localStorage.setItem("revtech_invoices", JSON.stringify(updatedInvoices));
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const confirmDelete = () => {
    if (!deletingId) return;
    const orderToDelete = orders.find(o => o.id === deletingId);
    if (!orderToDelete) {
      setDeletingId(null);
      return;
    }
    
    // Add to deleted
    const deletedOrder = { ...orderToDelete, id: orderToDelete.id, deletedAt: new Date().toISOString(), deletedBy: "Superadmin" };
    saveDeletedOrders([deletedOrder, ...deletedOrders]);
    
    // Remove from active
    saveOrders(orders.filter(o => o.id !== deletingId));

    // Cascade delete: hapus invoice terkait
    try {
      const savedInvoices = localStorage.getItem("revtech_invoices");
      if (savedInvoices) {
        let invoiceList = JSON.parse(savedInvoices);
        invoiceList = invoiceList.filter((i: any) => i.orderId !== deletingId);
        localStorage.setItem("revtech_invoices", JSON.stringify(invoiceList));
      }

      const savedClients = localStorage.getItem("revtech_clients");
      if (savedClients) {
        let clientList = JSON.parse(savedClients);
        clientList = clientList.filter((c: any) => c.id !== deletingId);
        localStorage.setItem("revtech_clients", JSON.stringify(clientList));
      }
    } catch (err) {
      console.error("Failed to cascade delete invoices/clients", err);
    }

    setDeletingId(null);
    showToast("Project beserta tagihan terkait dipindah ke Tempat Sampah", "error");
  };

  const handleAddOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrder.client || !newOrder.phone || !newOrder.service) return;

    if (editingId) {
      const originalOrder = orders.find(o => o.id === editingId);
      
      // Prevent changing to selesai/handover if not fully paid
      if (originalOrder && (newOrder.status === "selesai" || newOrder.status === "handover") && originalOrder.dp < originalOrder.total) {
        showToast("Klien belum lunas! Silakan lunasi pembayaran terlebih dahulu.", "error");
        return;
      }

      const restrictedStatuses = ["selesai", "batal", "handover"];
      if (originalOrder && restrictedStatuses.includes(originalOrder.status) && newOrder.status !== originalOrder.status) {
        setConfirmStatusChangeData(newOrder);
        return;
      }
      
      const isTerimaBeres = newOrder.handoverOption?.includes("Terima Beres");
      const orderToSave = {
        ...newOrder,
        recurringFee: isTerimaBeres ? newOrder.recurringFee : 0,
        nextBillingDate: isTerimaBeres ? newOrder.nextBillingDate : "",
      };
      
      const updated = orders.map(o => o.id === editingId ? { ...o, ...orderToSave } as Order : o);
      saveOrders(updated);
      
      // SYNC to Maintenance (Clients)
      try {
        const savedClients = localStorage.getItem("revtech_clients");
        if (savedClients) {
          let clientList = JSON.parse(savedClients);
          let clientChanged = false;
          
          if (!isTerimaBeres) {
            const prevLength = clientList.length;
            clientList = clientList.filter((c: any) => c.id !== editingId);
            if (clientList.length !== prevLength) clientChanged = true;
          } else {
            let foundClient = false;
            clientList = clientList.map((c: any) => {
              if (c.id === editingId) {
                clientChanged = true;
                foundClient = true;
                return {
                  ...c,
                  handover: orderToSave.handoverOption !== undefined ? orderToSave.handoverOption : c.handover,
                  recurringFee: orderToSave.recurringFee !== undefined ? orderToSave.recurringFee : c.recurringFee,
                  domainExpiry: orderToSave.nextBillingDate !== undefined ? orderToSave.nextBillingDate : c.domainExpiry,
                  hostingExpiry: orderToSave.nextBillingDate !== undefined ? orderToSave.nextBillingDate : c.hostingExpiry,
                  website: orderToSave.handover !== undefined ? orderToSave.handover : c.website,
                };
              }
              return c;
            });
            
            // Re-create client if it was previously removed
            if (!foundClient && orderToSave.status === "selesai") {
              let derivedDomain = null;
              if (orderToSave.handover) {
                try { derivedDomain = new URL(orderToSave.handover.startsWith("http") ? orderToSave.handover : `https://${orderToSave.handover}`).hostname; }
                catch { derivedDomain = orderToSave.handover; }
              }
              clientList.unshift({
                id: editingId,
                name: orderToSave.company || orderToSave.client,
                contact: orderToSave.client,
                phone: orderToSave.phone,
                email: "",
                website: orderToSave.handover?.startsWith("http") ? orderToSave.handover : (derivedDomain ? `https://${derivedDomain}` : null),
                websiteStatus: "active",
                joinDate: (orderToSave.createdAt || "").split("T")[0],
                totalSpend: orderToSave.total || 0,
                activeProjects: 0,
                domain: derivedDomain,
                domainExpiry: orderToSave.nextBillingDate || null,
                hosting: "RevTech Managed",
                hostingExpiry: orderToSave.nextBillingDate || null,
                service: orderToSave.service,
                handover: orderToSave.handoverOption,
                recurringFee: orderToSave.recurringFee,
              });
              clientChanged = true;
            }
          }
          
          if (clientChanged) {
            localStorage.setItem("revtech_clients", JSON.stringify(clientList));
          }
        }
      } catch (err) {}

      // SYNC to Invoices
      try {
        const savedInvoices = localStorage.getItem("revtech_invoices");
        if (savedInvoices) {
          let invoiceList = JSON.parse(savedInvoices);
          let invoiceChanged = false;
          
          if (!isTerimaBeres) {
            const prevLength = invoiceList.length;
            invoiceList = invoiceList.filter((inv: any) => !(inv.orderId === editingId && inv.type === "maintenance" && inv.status === "pending"));
            if (invoiceList.length !== prevLength) invoiceChanged = true;
          } else {
            let foundInvoice = false;
            invoiceList = invoiceList.map((inv: any) => {
              if (inv.orderId === editingId && inv.type === "maintenance" && inv.status === "pending") {
                invoiceChanged = true;
                foundInvoice = true;
                return {
                  ...inv,
                  amount: orderToSave.recurringFee !== undefined ? orderToSave.recurringFee : inv.amount,
                  dueDate: orderToSave.nextBillingDate !== undefined ? orderToSave.nextBillingDate : inv.dueDate,
                };
              }
              return inv;
            });
            
            // Re-create invoice if it was previously removed
            if (!foundInvoice && orderToSave.status === "selesai") {
              invoiceList.unshift({
                id: `INV-${Date.now().toString().slice(-5)}`,
                orderId: editingId,
                client: orderToSave.client,
                company: orderToSave.company || "",
                service: orderToSave.service,
                phone: orderToSave.phone,
                type: "maintenance",
                amount: orderToSave.recurringFee || 0,
                status: "pending",
                issuedAt: new Date().toISOString(),
                paidAt: null,
                dueDate: orderToSave.nextBillingDate || "",
                description: `Pembayaran Maintenance — ${orderToSave.company || orderToSave.client}`
              });
              invoiceChanged = true;
            }
          }
          
          if (invoiceChanged) {
            localStorage.setItem("revtech_invoices", JSON.stringify(invoiceList));
            window.dispatchEvent(new Event("storage"));
          }
        }
      } catch (err) {}

      showToast("Project berhasil diperbarui");
    } else {
      const order: Order = {
        id: `ord-${Date.now()}`,
        client: newOrder.client!,
        phone: newOrder.phone!,
        service: newOrder.service!,
        status: newOrder.status as OrderStatus,
        dp: newOrder.dp || 0,
        total: newOrder.total || 0,
        deadline: newOrder.deadline || null,
        notes: newOrder.notes || "",
        handoverOption: newOrder.handoverOption || "",
        handover: newOrder.handover || "",
        recurringFee: newOrder.recurringFee || 0,
        nextBillingDate: newOrder.nextBillingDate || "",
        createdAt: new Date().toISOString().split("T")[0]
      };
      saveOrders([order, ...orders]);
      showToast("Project baru berhasil ditambahkan");
    }
    
    setView("list");
  };

  const handleEdit = (order: Order) => {
    setEditingId(order.id);
    setNewOrder(order);
    setView("form");
  };

  const filtered = orders.filter((o) => {
    const matchStatus = filterStatus === "all" || o.status === filterStatus;
    const matchService = serviceFilter === "Semua" || o.service.toLowerCase().includes(serviceFilter.toLowerCase());
    const matchSearch = !search || 
      o.client.toLowerCase().includes(search.toLowerCase()) || 
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.service.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchService && matchSearch;
  }).sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (sortBy === "oldest") {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else if (sortBy === "deadline") {
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    }
    return 0;
  });

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
      />

      {view === "list" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          {/* Tabs & Actions Row */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-4 sm:gap-0">
            {/* Tabs Status (Underline Style) */}
            <div className="flex items-center gap-6 overflow-x-auto overflow-y-hidden scrollbar-hide w-full sm:w-auto">
              <button
                onClick={() => setFilterStatus("all")}
                className={`shrink-0 pb-3 text-sm font-semibold transition-all flex items-center gap-2 border-b-2 -mb-px ${
                  filterStatus === "all"
                    ? "border-red-500 text-red-500"
                    : "border-transparent text-[var(--adm-text-2)] hover:text-[var(--adm-text)]"
                }`}
              >
                Semua
                {orders.length > 0 && (
                  <span className={`px-1.5 py-0.5 text-[10px] rounded-full ${filterStatus === "all" ? "bg-red-500 text-white" : "bg-[var(--adm-bg)] text-[var(--adm-text-2)]"}`}>
                    {orders.length}
                  </span>
                )}
              </button>
              {PIPELINE.map((p) => {
                const count = orders.filter((o) => o.status === p.status).length;
                return (
                  <button
                    key={p.status}
                    onClick={() => setFilterStatus(p.status)}
                    className={`shrink-0 pb-3 text-sm font-semibold transition-all flex items-center gap-2 border-b-2 -mb-px ${
                      filterStatus === p.status
                        ? "border-red-500 text-red-500"
                        : "border-transparent text-[var(--adm-text-2)] hover:text-[var(--adm-text)]"
                    }`}
                  >
                    {p.label}
                    {count > 0 && (
                      <span className={`px-1.5 py-0.5 text-[10px] rounded-full ${filterStatus === p.status ? "bg-red-500 text-white" : "bg-[var(--adm-bg)] text-[var(--adm-text-2)]"}`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
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
                  <option value="deadline" className="bg-[var(--adm-card)] text-[var(--adm-text)]" dir="ltr">Deadline</option>
                </select>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            {filtered.length === 0 && (
              <div className="py-24 flex flex-col items-center justify-center text-center px-4">
                <span className="material-symbols-outlined text-[48px] text-[var(--adm-text-3)] mb-4">inbox</span>
                <p className="text-[14px] text-[var(--adm-text-2)]">Tidak ada project ditemukan.</p>
              </div>
            )}

            {filtered.map((order, i) => (
               <OrderCard
                  key={order.id}
                  order={order}
                  index={i}
                  onWA={() => setWaOrder(order)}
                  onStatusChange={(status) => changeOrderStatus(order.id, status)}
                  onEdit={() => handleEdit(order)}
                  onDelete={() => setDeletingId(order.id)}
                  onIncrementRevision={() => triggerRevision(order.id)}
                  onTestimoniClick={() => setActionPopup({ type: "testimoni", orderId: order.id })}
                  onPortofolioClick={() => setActionPopup({ type: "portofolio", orderId: order.id })}
                  onCardClick={() => {
                    setDetailOrder(order);
                    setDetailTab("info");
                  }}
                  onQuickLunas={() => {
                    setLunasOrder(order);
                    setLunasPayment(order.total - order.dp);
                    
                    // Extract existing payment note if any
                    const match = order.notes?.match(/Pembayaran:\s*(.*)$/);
                    setLunasNote(match ? match[1].trim() : "");
                  }}
                  onQuickHandover={() => {
                    setHandoverOrder(order);
                    setHandoverOptionState(order.handoverOption || "");
                    setHandoverLink(order.handover || "");
                    setRecurringFeeState(order.recurringFee || 0);
                    setNextBillingDateState(order.nextBillingDate || "");
                    const match = order.notes?.match(/Handover:\s*(.*)$/);
                    setHandoverNote(match ? match[1].trim() : "");
                  }}
               />
            ))}
          </div>
        </motion.div>
      )}

      {view === "form" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mt-4 mx-auto pb-8">
          <div className="bg-[var(--adm-card)] rounded-2xl shadow-[var(--adm-shadow)] p-6 sm:p-8">
            <h2 className="text-xl font-bold text-[var(--adm-text)] mb-6">{editingId ? "Edit Project" : "Tambah Project Baru"}</h2>
            
            <form onSubmit={handleAddOrder} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[var(--adm-text-2)] uppercase tracking-wide">Status Project</label>
                  <select
                    value={newOrder.status}
                    onChange={(e) => setNewOrder({ ...newOrder, status: e.target.value as OrderStatus })}
                    className="w-full px-4 py-3 rounded-xl bg-transparent border border-[var(--adm-border)] text-[var(--adm-text)] focus:outline-none focus:ring-1 focus:ring-[var(--adm-accent)]/30 transition-all cursor-pointer"
                  >
                    {PIPELINE.map(p => (
                      <option key={p.status} value={p.status} className="bg-[var(--adm-card)]">
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[var(--adm-text-2)] uppercase tracking-wide">Edit Deadline</label>
                  <div className="flex items-center gap-3">
                    <input type="date" value={newOrder.deadline || ""} onChange={(e) => setNewOrder({ ...newOrder, deadline: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-transparent border border-[var(--adm-border)] text-[var(--adm-text)] focus:outline-none focus:ring-1 focus:ring-[var(--adm-accent)]/30 transition-all [color-scheme:dark]" />
                  </div>
                </div>
                {newOrder.status === "revisi" && (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-[var(--adm-text-2)] uppercase tracking-wide">Batas Revisi</label>
                    <input type="number" value={newOrder.maxRevisions ?? ""} onChange={(e) => setNewOrder({ ...newOrder, maxRevisions: e.target.value ? parseInt(e.target.value) : undefined })} className="w-full px-4 py-3 rounded-xl bg-transparent border border-[var(--adm-border)] text-[var(--adm-text)] focus:outline-none focus:ring-1 focus:ring-[var(--adm-accent)]/30 transition-all" placeholder="Contoh: 3" />
                  </div>
                )}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-semibold text-[var(--adm-text-2)] uppercase tracking-wide">Catatan Follow-up Internal</label>
                  <textarea rows={3} value={newOrder.notes} onChange={(e) => setNewOrder({ ...newOrder, notes: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-transparent border border-[var(--adm-border)] text-[var(--adm-text)] placeholder-[var(--adm-text-3)] focus:outline-none focus:ring-1 focus:ring-[var(--adm-accent)]/30 transition-all resize-none" placeholder="Masukkan catatan progress, riwayat follow-up, keluhan klien..." />
                  <p className="text-[10px] text-[var(--adm-text-3)] mt-1 ml-1 leading-tight">Nama klien, layanan, dan harga hanya bisa diedit dari Leads.</p>
                </div>
              </div>

              {/* Handover & Billing Details (if Selesai or Handover) */}
              {(newOrder.status === "selesai" || newOrder.status === "handover") && (
                <div className="pt-4 mt-6 border-t border-[var(--adm-border)] space-y-6">
                  <h3 className="text-sm font-bold text-[var(--adm-text)] flex items-center gap-2">
                    <CheckSquare size={16} className="text-[var(--adm-accent)]" />
                    Detail Serah Terima & Tagihan
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-[var(--adm-text-2)] uppercase tracking-wide">Opsi Serah Terima</label>
                      <select value={newOrder.handoverOption || ""} onChange={(e) => setNewOrder({ ...newOrder, handoverOption: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-transparent border border-[var(--adm-border)] text-[var(--adm-text)] focus:outline-none focus:ring-1 focus:ring-[var(--adm-accent)]/30 transition-all cursor-pointer">
                        <option value="" disabled className="bg-[var(--adm-card)] text-[var(--adm-text-3)]">- Pilih Opsi -</option>
                        <option value="Terima Beres (Basic)" className="bg-[var(--adm-card)]">Terima Beres (Basic)</option>
                        <option value="Terima Beres (Plus)" className="bg-[var(--adm-card)]">Terima Beres (Plus)</option>
                        <option value="Sistem Mandiri" className="bg-[var(--adm-card)]">Sistem Mandiri</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-[var(--adm-text-2)] uppercase tracking-wide">Link / Aset Pekerjaan</label>
                      <input type="text" value={newOrder.handover || ""} onChange={(e) => setNewOrder({ ...newOrder, handover: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-transparent border border-[var(--adm-border)] text-[var(--adm-text)] placeholder-[var(--adm-text-3)] focus:outline-none focus:ring-1 focus:ring-[var(--adm-accent)]/30 transition-all" placeholder="Contoh: Link GDrive / URL Website..." />
                    </div>
                  </div>

                  {(newOrder.handoverOption?.includes("Basic") || newOrder.handoverOption?.includes("Plus")) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[var(--adm-accent)]/5 p-4 sm:p-6 rounded-2xl border border-[var(--adm-accent)]/20">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-[var(--adm-accent)] uppercase tracking-wide">
                          {newOrder.handoverOption.includes("Basic") ? "Tagihan Perpanjangan (Rp/thn)" : "Tagihan Maintenance (Rp/thn)"}
                        </label>
                        <input
                          type="text"
                          value={newOrder.recurringFee ? `Rp ${newOrder.recurringFee.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}` : ""}
                          onChange={(e) => {
                            const v = e.target.value.replace(/\D/g, "");
                            setNewOrder({ ...newOrder, recurringFee: v ? parseInt(v) : 0 });
                          }}
                          className="w-full px-4 py-3 rounded-xl bg-transparent text-[var(--adm-text)] font-bold placeholder-[var(--adm-text-3)] focus:outline-none focus:ring-1 focus:ring-[var(--adm-accent)]/30 transition-all border border-[var(--adm-border)]"
                          placeholder="Rp 0"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-[var(--adm-accent)] uppercase tracking-wide">Tgl. Tagihan Berikutnya</label>
                        <input
                          type="date"
                          value={newOrder.nextBillingDate || ""}
                          onChange={(e) => setNewOrder({ ...newOrder, nextBillingDate: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-transparent text-[var(--adm-text)] focus:outline-none focus:ring-1 focus:ring-[var(--adm-accent)]/30 transition-all border border-[var(--adm-border)] [color-scheme:dark]"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-6 mt-8">
                <button type="button" onClick={() => setView("list")} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-[var(--adm-text-2)] bg-transparent hover:text-[var(--adm-text)] transition-colors">Batal</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl text-sm font-bold bg-[var(--adm-accent)] text-white hover:opacity-90 transition-opacity shadow-[var(--adm-shadow)]">{editingId ? "Simpan Perubahan" : "Simpan Project"}</button>
              </div>
            </form>
          </div>
        </motion.div>
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

      {waOrder && <WAModal order={waOrder} onClose={() => setWaOrder(null)} />}

      {/* Handover Modal */}
      <AnimatePresence>
        {handoverOrder && (
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
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-[var(--adm-accent)]/10 text-[var(--adm-accent)]">
                  <CheckSquare size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-[var(--adm-text)]">Selesaikan & Handover</h3>
                  <p className="text-[12px] text-[var(--adm-text-2)] leading-tight mt-0.5">
                    Masukkan detail serah terima final kepada klien.
                  </p>
                </div>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--adm-text-2)] uppercase tracking-wide">Opsi Serah Terima</label>
                  <select
                    value={handoverOptionState}
                    onChange={(e) => setHandoverOptionState(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-transparent text-sm font-semibold text-[var(--adm-text)] focus:outline-none focus:ring-1 focus:ring-[var(--adm-accent)]/40 transition-all border border-[var(--adm-border)]"
                  >
                    <option value="" disabled className="bg-[var(--adm-card)] text-[var(--adm-text-3)]">- Pilih Opsi -</option>
                    <option value="Terima Beres (Basic)" className="bg-[var(--adm-card)] text-[var(--adm-text)]">Terima Beres (Basic)</option>
                    <option value="Terima Beres (Plus)" className="bg-[var(--adm-card)] text-[var(--adm-text)]">Terima Beres (Plus)</option>
                    <option value="Sistem Mandiri" className="bg-[var(--adm-card)] text-[var(--adm-text)]">Sistem Mandiri</option>
                  </select>
                </div>

                {(handoverOptionState.includes("Basic") || handoverOptionState.includes("Plus")) && (
                  <div className="bg-[var(--adm-accent)]/5 rounded-xl p-3 border border-[var(--adm-accent)]/20 space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[var(--adm-accent)] uppercase tracking-wide">
                        {handoverOptionState.includes("Basic") ? "Tagihan Perpanjangan (Rp/thn)" : "Tagihan Maintenance (Rp/thn)"}
                      </label>
                      <input
                        type="text"
                        value={recurringFeeState ? `Rp ${recurringFeeState.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}` : ""}
                        onChange={(e) => {
                          const v = e.target.value.replace(/\D/g, "");
                          setRecurringFeeState(v ? parseInt(v) : 0);
                        }}
                        placeholder="Rp 0"
                        className="w-full px-3 py-2 rounded-lg bg-transparent text-sm font-bold text-[var(--adm-text)] focus:outline-none border border-[var(--adm-border)]"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[var(--adm-accent)] uppercase tracking-wide">Tgl. Tagihan Berikutnya</label>
                      <input
                        type="date"
                        value={nextBillingDateState}
                        onChange={(e) => setNextBillingDateState(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-transparent text-sm text-[var(--adm-text)] focus:outline-none border border-[var(--adm-border)] [color-scheme:dark]"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--adm-text-2)] uppercase tracking-wide">Link Pekerjaan <span className="text-[10px] text-[var(--adm-text-3)] normal-case font-normal">(opsional)</span></label>
                  <input
                    type="text"
                    value={handoverLink}
                    onChange={(e) => setHandoverLink(e.target.value)}
                    placeholder="Contoh: Link GDrive / URL Website..."
                    className="w-full px-3 py-2.5 rounded-xl bg-transparent text-sm text-[var(--adm-text)] placeholder-[var(--adm-text-3)] focus:outline-none focus:ring-1 focus:ring-[var(--adm-accent)]/40 transition-all border border-[var(--adm-border)]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--adm-text-2)] uppercase tracking-wide">Catatan Handover <span className="text-[10px] text-[var(--adm-text-3)] normal-case font-normal">(opsional)</span></label>
                  <input
                    type="text"
                    value={handoverNote}
                    onChange={(e) => setHandoverNote(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-transparent text-sm text-[var(--adm-text)] placeholder-[var(--adm-text-3)] focus:outline-none focus:ring-1 focus:ring-[var(--adm-accent)]/40 transition-all border border-[var(--adm-border)]"
                    placeholder="Contoh: Expired domain tgl 20..."
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setHandoverOrder(null)}
                  className="flex-1 py-2 text-sm font-semibold text-[var(--adm-text-2)] bg-transparent hover:text-[var(--adm-text)] rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={submitHandover}
                  className="flex-1 py-2 text-sm font-bold text-white rounded-xl transition-colors bg-[var(--adm-accent)] hover:opacity-90"
                >
                  Selesaikan Project
                </button>
              </div>
            </motion.div>
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
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-[var(--adm-danger)]/10 text-[var(--adm-danger)]">
                  <Trash2 size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-[var(--adm-text)]">Pindahkan ke Sampah?</h3>
                  <p className="text-[12px] text-[var(--adm-text-2)] leading-tight mt-0.5">
                    Project akan dipindahkan ke Tempat Sampah dan bisa dipulihkan nanti.
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
                  className="flex-1 py-2 text-sm font-bold text-white rounded-xl transition-colors bg-red-500 hover:bg-red-600"
                >
                  Ya, Hapus
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {detailOrder && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto"
            onClick={() => setDetailOrder(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[var(--adm-card)] rounded-2xl w-full max-w-2xl shadow-[var(--adm-shadow-lg)] overflow-hidden my-8 flex flex-col"
              style={{ maxHeight: '90vh' }}
            >
              <div className="flex items-center justify-between p-6 border-b border-[var(--adm-border)]">
                <div>
                  <h3 className="font-bold text-lg text-[var(--adm-text)]">{detailOrder.client}</h3>
                  <p className="text-[13px] text-[var(--adm-text-2)]">{detailOrder.service}</p>
                </div>
                <button onClick={() => setDetailOrder(null)} className="p-2 text-[var(--adm-text-3)] hover:text-[var(--adm-text)] transition-colors rounded-full hover:bg-[var(--adm-bg)]">
                  <X size={20} />
                </button>
              </div>
              
              {/* Tabs */}
              <div className="flex px-6 pt-4 gap-6 border-b border-[var(--adm-border)]">
                <button onClick={() => setDetailTab("info")} className={`pb-3 text-sm font-bold transition-colors border-b-2 ${detailTab === "info" ? "border-[var(--adm-accent)] text-[var(--adm-accent)]" : "border-transparent text-[var(--adm-text-3)] hover:text-[var(--adm-text-2)]"}`}>Info Utama</button>
                <button onClick={() => setDetailTab("pembayaran")} className={`pb-3 text-sm font-bold transition-colors border-b-2 ${detailTab === "pembayaran" ? "border-[var(--adm-accent)] text-[var(--adm-accent)]" : "border-transparent text-[var(--adm-text-3)] hover:text-[var(--adm-text-2)]"}`}>Pembayaran</button>
                <button onClick={() => setDetailTab("riwayat")} className={`pb-3 text-sm font-bold transition-colors border-b-2 ${detailTab === "riwayat" ? "border-[var(--adm-accent)] text-[var(--adm-accent)]" : "border-transparent text-[var(--adm-text-3)] hover:text-[var(--adm-text-2)]"}`}>Riwayat Aktivitas</button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto flex-1">
                {detailTab === "info" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[11px] font-bold text-[var(--adm-text-3)] uppercase tracking-widest mb-1">Status Saat Ini</p>
                        <p className="text-sm font-semibold text-[var(--adm-text)] uppercase">{detailOrder.status}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-[var(--adm-text-3)] uppercase tracking-widest mb-1">Deadline</p>
                        <p className="text-sm font-semibold text-[var(--adm-text)]">{detailOrder.deadline ? new Date(detailOrder.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : "-"}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-[var(--adm-text-3)] uppercase tracking-widest mb-1">No. WhatsApp</p>
                        <p className="text-sm font-semibold text-[var(--adm-text)]">{detailOrder.phone || "-"}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-[var(--adm-text-3)] uppercase tracking-widest mb-1">Batas Revisi</p>
                        <p className="text-sm font-semibold text-[var(--adm-text)]">{detailOrder.maxRevisions !== undefined ? `${detailOrder.usedRevisions || 0} / ${detailOrder.maxRevisions} terpakai` : "Tidak ada batas"}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-[var(--adm-text-3)] uppercase tracking-widest mb-1">Tgl Pemesanan</p>
                        <p className="text-sm font-semibold text-[var(--adm-text)]">{new Date(detailOrder.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-[var(--adm-text-3)] uppercase tracking-widest mb-1">Catatan Internal / Follow up</p>
                      <div className="p-3 border border-[var(--adm-border)] rounded-xl text-sm font-semibold text-[var(--adm-text)] whitespace-pre-wrap leading-relaxed">{detailOrder.notes || "Tidak ada catatan."}</div>
                    </div>
                  </div>
                )}
                
                {detailTab === "pembayaran" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[11px] font-bold text-[var(--adm-text-3)] uppercase tracking-widest mb-1">Total Tagihan</p>
                        <p className="text-lg font-bold text-[var(--adm-text)]">{formatRp(detailOrder.total)}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-[var(--adm-text-3)] uppercase tracking-widest mb-1">Sudah Dibayar (DP)</p>
                        <p className="text-lg font-bold text-[var(--adm-success)]">{formatRp(detailOrder.dp)}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-[var(--adm-text-3)] uppercase tracking-widest mb-1">Sisa Pembayaran</p>
                        <p className="text-lg font-bold text-[var(--adm-danger)]">{formatRp(Math.max(0, detailOrder.total - detailOrder.dp))}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-[var(--adm-text-3)] uppercase tracking-widest mb-1">Status Lunas</p>
                        <p className="text-sm font-semibold text-[var(--adm-text)]">{detailOrder.dp >= detailOrder.total && detailOrder.total > 0 ? "✅ Lunas" : "⏳ Belum Lunas"}</p>
                      </div>
                    </div>
                    
                    <hr className="border-[var(--adm-border)]" />
                    
                    <div>
                      <p className="text-[11px] font-bold text-[var(--adm-text-3)] uppercase tracking-widest mb-3">Detail Handover & Maintenance</p>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-[var(--adm-text-2)] font-medium">Opsi Handover:</span>
                          <span className="font-bold text-[var(--adm-text)]">{detailOrder.handoverOption || "-"}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-[var(--adm-text-2)] font-medium">Aset / Link:</span>
                          {detailOrder.handover ? (
                            <a href={detailOrder.handover.startsWith('http') ? detailOrder.handover : `https://${detailOrder.handover}`} target="_blank" rel="noopener noreferrer" className="font-bold text-[var(--adm-accent)] hover:underline truncate max-w-[200px]">{detailOrder.handover}</a>
                          ) : <span className="font-bold text-[var(--adm-text)]">-</span>}
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-[var(--adm-text-2)] font-medium">Tagihan Maintenance (Bulanan/Tahunan):</span>
                          <span className="font-bold text-[var(--adm-text)]">{detailOrder.recurringFee ? formatRp(detailOrder.recurringFee) : "-"}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-[var(--adm-text-2)] font-medium">Jatuh Tempo Selanjutnya:</span>
                          <span className="font-bold text-[var(--adm-text)]">{detailOrder.nextBillingDate ? new Date(detailOrder.nextBillingDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : "-"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {detailTab === "riwayat" && (
                  <div className="space-y-4">
                    {detailOrder.progressLog && detailOrder.progressLog.length > 0 ? (
                      <div className="relative border-l border-[var(--adm-border)] ml-3 space-y-6 pb-2">
                        {[...detailOrder.progressLog].reverse().map((log, i) => (
                          <div key={i} className="relative pl-6">
                            <div className="absolute w-3 h-3 bg-[var(--adm-accent)] rounded-full -left-[6.5px] top-1.5 ring-4 ring-[var(--adm-card)]"></div>
                            <p className="text-[10px] font-bold text-[var(--adm-text-3)] mb-0.5 uppercase tracking-wider">{new Date(log.date).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                            <div className="border border-[var(--adm-border)] p-3 rounded-xl rounded-tl-sm text-sm text-[var(--adm-text)] shadow-sm">
                              <p className="font-medium">{log.note}</p>
                              <p className="text-[10px] text-[var(--adm-text-3)] mt-2">Oleh: {log.by}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10">
                        <div className="w-12 h-12 rounded-full bg-[var(--adm-bg)] mx-auto flex items-center justify-center text-[var(--adm-text-3)] mb-3">
                          <SlidersHorizontal size={20} />
                        </div>
                        <p className="text-[13px] text-[var(--adm-text-2)]">Belum ada riwayat aktivitas yang dicatat.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Revision Confirmation Modal */}
      <AnimatePresence>
        {revisionOrder && (
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
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-[var(--adm-warning)]/10 text-[var(--adm-warning)]">
                  <Undo2 size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-[var(--adm-text)]">Gunakan Revisi?</h3>
                  <p className="text-[12px] text-[var(--adm-text-2)] leading-tight mt-0.5">
                    Akan mencatat penggunaan 1 kuota revisi untuk <span className="font-semibold text-[var(--adm-text)]">{revisionOrder.client}</span>.
                  </p>
                </div>
              </div>
              
              <div className="space-y-1.5 mb-6">
                <label className="text-xs font-semibold text-[var(--adm-text-2)] uppercase tracking-wide">Catatan Revisi <span className="text-[10px] text-[var(--adm-text-3)] normal-case font-normal">(opsional)</span></label>
                <textarea
                  rows={3}
                  value={revisionNote}
                  onChange={(e) => setRevisionNote(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-transparent text-sm text-[var(--adm-text)] placeholder-[var(--adm-text-3)] focus:outline-none focus:ring-1 focus:ring-[var(--adm-accent)]/40 transition-all border border-[var(--adm-border)] resize-none"
                  placeholder="Contoh: Perbaikan warna tombol..."
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setRevisionOrder(null)}
                  className="flex-1 py-2 text-sm font-semibold text-[var(--adm-text-2)] bg-transparent hover:text-[var(--adm-text)] rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={confirmRevision}
                  className="flex-1 py-2 text-sm font-bold text-white rounded-xl transition-colors bg-[var(--adm-warning)] hover:bg-[var(--adm-warning)]/90"
                >
                  Simpan Revisi
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lunas Confirmation Modal */}
      <AnimatePresence>
        {lunasOrder && (
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
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-[var(--adm-success)]/10 text-[var(--adm-success)]">
                  <CircleDollarSign size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-[var(--adm-text)]">Konfirmasi Pembayaran</h3>
                  <p className="text-[12px] text-[var(--adm-text-2)] leading-tight mt-0.5">
                    Masukkan nominal dan catatan pembayaran.
                  </p>
                </div>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="bg-[var(--adm-bg)] rounded-xl p-3 border border-[var(--adm-border)]">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[11px] font-semibold text-[var(--adm-text-3)] uppercase tracking-wide">Total Harga Awal</span>
                    <span className="text-sm font-semibold text-[var(--adm-text)]">{formatRp(lunasOrder.total)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2 pb-2 border-b border-[var(--adm-border)] mt-1 pt-1 border-t">
                    <span className="text-[11px] font-semibold text-[var(--adm-text-3)] uppercase tracking-wide">Sudah Dibayar (DP)</span>
                    <span className="text-sm font-semibold text-[var(--adm-success)]">{formatRp(lunasOrder.dp)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold text-[var(--adm-text-2)] uppercase tracking-wide">Sisa Tagihan</span>
                    <span className="text-sm font-bold text-[var(--adm-danger)]">{formatRp(lunasOrder.total - lunasOrder.dp)}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--adm-text-2)] uppercase tracking-wide">Nominal Pembayaran (Rp)</label>
                  <input
                    type="text"
                    value={lunasPayment ? `Rp ${lunasPayment.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}` : ""}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "");
                      setLunasPayment(v ? parseInt(v) : 0);
                    }}
                    className="w-full px-3 py-2.5 rounded-xl bg-transparent text-sm font-bold text-[var(--adm-text)] placeholder-[var(--adm-text-3)] focus:outline-none focus:ring-1 focus:ring-[var(--adm-success)]/40 transition-all border border-[var(--adm-border)]"
                    placeholder="Rp 0"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--adm-text-2)] uppercase tracking-wide">Catatan <span className="text-[10px] text-[var(--adm-text-3)] normal-case font-normal">(opsional)</span></label>
                  <input
                    type="text"
                    value={lunasNote}
                    onChange={(e) => setLunasNote(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-transparent text-sm text-[var(--adm-text)] placeholder-[var(--adm-text-3)] focus:outline-none focus:ring-1 focus:ring-[var(--adm-success)]/40 transition-all border border-[var(--adm-border)]"
                    placeholder="Contoh: Baru bayar 1jt sisa tgl 20..."
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setLunasOrder(null)}
                  className="flex-1 py-2 text-sm font-semibold text-[var(--adm-text-2)] bg-transparent hover:text-[var(--adm-text)] rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={confirmLunas}
                  className="flex-1 py-2 text-sm font-bold text-white rounded-xl transition-colors bg-[var(--adm-success)] hover:opacity-90"
                >
                  Simpan Pembayaran
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmStatusChangeData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[var(--adm-bg)] w-full max-w-sm rounded-2xl shadow-xl overflow-hidden border border-[var(--adm-border)] flex flex-col">
              <div className="p-5">
                <div className="w-12 h-12 rounded-full bg-[var(--adm-warning)]/20 flex items-center justify-center mb-4 text-[var(--adm-warning)]">
                  <AlertTriangle size={24} strokeWidth={2.5} />
                </div>
                <h2 className="text-lg font-bold text-[var(--adm-text)] mb-2">Yakin Mengubah Status?</h2>
                <p className="text-sm text-[var(--adm-text-2)] leading-relaxed">
                  Project ini sebelumnya berstatus <strong>{orders.find(o => o.id === editingId)?.status}</strong>. Mengubah statusnya akan mengembalikannya ke pipeline aktif. Apakah Anda yakin?
                </p>
              </div>
              <div className="p-4 bg-[var(--adm-card)] border-t border-[var(--adm-border)] flex gap-3">
                <button onClick={() => setConfirmStatusChangeData(null)} className="flex-1 px-4 py-2 text-sm font-bold text-[var(--adm-text-2)] bg-transparent border border-[var(--adm-border)] rounded-xl hover:text-[var(--adm-text)] transition-colors">Batal</button>
                <button onClick={() => {
                  const updated = orders.map(o => o.id === editingId ? { ...o, ...confirmStatusChangeData } as Order : o);
                  saveOrders(updated);
                  showToast("Status project berhasil diubah", "success");
                  setView("list");
                  setConfirmStatusChangeData(null);
                }} className="flex-1 px-4 py-2 text-sm font-bold text-white bg-[var(--adm-warning)] rounded-xl shadow-lg hover:opacity-90 active:scale-95 transition-all">
                  Ya, Ubah Status
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {actionPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[var(--adm-bg)] w-full max-w-sm rounded-2xl shadow-xl overflow-hidden border border-[var(--adm-border)] flex flex-col">
              <div className="p-5 flex flex-col gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${actionPopup.type === 'testimoni' ? 'bg-[var(--adm-warning)]/20 text-[var(--adm-warning)]' : 'bg-[var(--adm-accent)]/20 text-[var(--adm-accent)]'}`}>
                  {actionPopup.type === 'testimoni' ? <Star size={24} strokeWidth={2.5} /> : <FolderKanban size={24} strokeWidth={2.5} />}
                </div>
                <h2 className="text-lg font-bold text-[var(--adm-text)] capitalize">{actionPopup.type}</h2>
                <p className="text-sm text-[var(--adm-text-2)] mb-2">Pilih aksi untuk project ini.</p>
                
                <Link 
                  href={`/admin/${actionPopup.type}`}
                  onClick={() => setActionPopup(null)}
                  className={`w-full py-2.5 text-sm font-bold text-center text-white rounded-xl hover:opacity-90 transition-all ${actionPopup.type === 'testimoni' ? 'bg-[var(--adm-warning)]' : 'bg-[var(--adm-accent)]'}`}
                >
                  Buka Halaman {actionPopup.type}
                </Link>

                <button 
                  onClick={() => {
                    const isAdded = actionPopup.type === 'testimoni' ? 'isTestimoniAdded' : 'isPortofolioAdded';
                    const orderToUpdate = orders.find(o => o.id === actionPopup.orderId);
                    if(orderToUpdate) {
                      const updated = orders.map(o => o.id === actionPopup.orderId ? { ...o, [isAdded]: !o[isAdded] } : o);
                      saveOrders(updated);
                      showToast(`Status ${actionPopup.type} diperbarui`, "success");
                    }
                    setActionPopup(null);
                  }}
                  className={`w-full py-2.5 text-sm font-bold rounded-xl transition-all border ${
                    orders.find(o => o.id === actionPopup.orderId)?.[actionPopup.type === 'testimoni' ? 'isTestimoniAdded' : 'isPortofolioAdded']
                      ? "border-[var(--adm-border)] text-[var(--adm-text-3)] hover:text-[var(--adm-text)]"
                      : "border-[var(--adm-success)]/30 text-[var(--adm-success)] bg-[var(--adm-success)]/10 hover:bg-[var(--adm-success)]/20"
                  }`}
                >
                  {orders.find(o => o.id === actionPopup.orderId)?.[actionPopup.type === 'testimoni' ? 'isTestimoniAdded' : 'isPortofolioAdded'] ? "Batalkan Tandai" : "Tandai Sudah Ditambahkan"}
                </button>
              </div>
              <div className="p-4 bg-[var(--adm-card)] border-t border-[var(--adm-border)] flex justify-end">
                <button onClick={() => setActionPopup(null)} className="px-5 py-2 text-sm font-bold text-[var(--adm-text-2)] bg-transparent hover:text-[var(--adm-text)] transition-colors">Tutup</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
