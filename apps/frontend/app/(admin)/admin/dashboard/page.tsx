"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { StatCard, ProgressRingCard, AdminCard } from "@/components/admin/ui";
import ordersRaw from "@/data/admin/orders.json";
import invoicesRaw from "@/data/admin/invoices.json";
import clientsRaw from "@/data/admin/clients.json";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Order {
  id: string;
  client: string;
  service: string;
  status: string;
  dp: number;
  total: number;
  phone: string;
  createdAt: string;
  deadline: string | null;
  notes: string;
}

interface Invoice {
  id: string;
  orderId: string;
  client: string;
  type: "dp" | "pelunasan";
  amount: number;
  status: "paid" | "pending";
  issuedAt: string;
  paidAt: string | null;
  dueDate: string;
  description: string;
}

interface Client {
  id: string;
  name: string;
  domain: string | null;
  domainExpiry: string | null;
  hostingExpiry: string | null;
}

const orders = ordersRaw as Order[];
const invoices = invoicesRaw as Invoice[];
const clients = clientsRaw as Client[];

// ── Recharts (dynamic — SSR safe) ─────────────────────────────────────────────

const BarChart = dynamic(() => import("recharts").then((m) => m.BarChart), { ssr: false });
const Bar = dynamic(() => import("recharts").then((m) => m.Bar), { ssr: false });
const Cell = dynamic(() => import("recharts").then((m) => m.Cell), { ssr: false });
const XAxis = dynamic(() => import("recharts").then((m) => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then((m) => m.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then((m) => m.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then((m) => m.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import("recharts").then((m) => m.ResponsiveContainer), { ssr: false });

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatRp(n: number) {
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}jt`;
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);
}

function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
}

// ── Data computations from real mock data ─────────────────────────────────────

const STAGES = [
  { key: "inbox",      label: "Inbox",      color: "#94A3B8" },
  { key: "chat",       label: "Negosiasi",  color: "#8B5CF6" },
  { key: "dp",         label: "DP Masuk",   color: "#F59E0B" },
  { key: "pengerjaan", label: "Pengerjaan", color: "#3B82F6" },
  { key: "revisi",     label: "Revisi",     color: "#6366F1" },
  { key: "pelunasan",  label: "Pelunasan",  color: "#EF4444" },
  { key: "handover",   label: "Handover",   color: "#14B8A6" },
  { key: "selesai",    label: "Selesai",    color: "#10B981" },
];

function getPipelineData() {
  return STAGES.map((s) => ({
    ...s,
    count: orders.filter((o) => o.status === s.key).length,
  }));
}

const STATUS_LABEL: Record<string, string> = {
  selesai: "Selesai", pengerjaan: "Dikerjakan", revisi: "Revisi",
  dp: "DP Masuk", pelunasan: "Tunggu Lunas", handover: "Handover",
  inbox: "Inbox", chat: "Negosiasi",
};

const STATUS_COLOR: Record<string, { bg: string; text: string }> = {
  selesai:    { bg: "rgba(16,185,129,0.12)",  text: "#059669" },
  pengerjaan: { bg: "rgba(59,130,246,0.12)",  text: "#2563EB" },
  revisi:     { bg: "rgba(99,102,241,0.12)",  text: "#6366F1" },
  dp:         { bg: "rgba(245,158,11,0.12)",  text: "#D97706" },
  pelunasan:  { bg: "rgba(239,68,68,0.12)",   text: "#DC2626" },
  handover:   { bg: "rgba(20,184,166,0.12)",  text: "#0D9488" },
  inbox:      { bg: "rgba(100,116,139,0.1)",  text: "#64748B" },
  chat:       { bg: "rgba(139,92,246,0.12)",  text: "#7C3AED" },
};

// ── Custom Tooltip ────────────────────────────────────────────────────────────

function PipelineTooltip({ active, payload }: { active?: boolean; payload?: Array<{ value: number; payload: { label: string } }> }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="px-3 py-2 rounded-xl text-xs font-semibold shadow-lg"
      style={{ background: "var(--adm-card)", border: "1px solid var(--adm-border)", color: "var(--adm-text)" }}
    >
      {payload[0].payload.label}: <strong>{payload[0].value} pesanan</strong>
    </div>
  );
}

// ── AI Insight Widget ─────────────────────────────────────────────────────────

function AIInsightWidget() {
  const [insight, setInsight] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const activeOrders = orders.filter((o) => o.status !== "selesai").length;
  const paidRevenue = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.amount, 0);
  const pendingRevenue = invoices.filter((i) => i.status === "pending").reduce((s, i) => s + i.amount, 0);

  async function fetchInsight() {
    setLoading(true);
    setError("");
    setInsight("");
    try {
      const res = await fetch("/api/admin/insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stats: { activeOrders, paidRevenue, pendingRevenue, completedOrders: orders.filter((o) => o.status === "selesai").length },
          date: new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json() as { insight: string };
      setInsight(data.insight);
    } catch {
      setError("Gagal memuat insight. Pastikan Gemini API key sudah dikonfigurasi di .env.local");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="rounded-2xl p-5 flex flex-col"
      style={{ background: "var(--adm-card)", border: "1px solid var(--adm-border)", boxShadow: "var(--adm-shadow)" }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, var(--adm-accent), var(--adm-purple))" }}
          >
            <span className="material-symbols-outlined text-white text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: "var(--adm-text)" }}>AI Business Insight</p>
            <p className="text-[10px]" style={{ color: "var(--adm-text-3)" }}>Analisis harian oleh Gemini</p>
          </div>
        </div>
        <button
          id="refresh-insight"
          onClick={fetchInsight}
          disabled={loading}
          style={{ color: "var(--adm-text-3)" }}
          className="p-1.5 rounded-lg hover:opacity-70 transition-opacity disabled:opacity-40"
          aria-label="Refresh insight"
        >
          <span className={`material-symbols-outlined text-[18px] ${loading ? "animate-spin" : ""}`}>refresh</span>
        </button>
      </div>

      {!insight && !loading && !error && (
        <div className="flex flex-col items-center justify-center py-6 text-center gap-3">
          <p className="text-sm" style={{ color: "var(--adm-text-2)" }}>
            Berdasarkan data pesanan & invoice aktif, AI Co-Pilot akan memberikan saran prioritas kerja hari ini.
          </p>
          <button
            id="generate-insight"
            onClick={fetchInsight}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity"
            style={{ background: "var(--adm-accent)" }}
          >
            <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            Generate Insight
          </button>
        </div>
      )}
      {loading && (
        <div className="flex flex-col gap-3 py-4">
          {[95, 75, 85, 60].map((w, i) => (
            <div key={i} className="h-3 rounded animate-pulse" style={{ width: `${w}%`, background: "var(--adm-border)" }} />
          ))}
        </div>
      )}
      {error && (
        <p className="text-sm rounded-xl p-3" style={{ color: "var(--adm-danger)", background: "rgba(239,68,68,0.08)" }}>{error}</p>
      )}
      {insight && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl"
          style={{ background: "var(--adm-accent-soft)", border: "1px solid var(--adm-border)" }}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "var(--adm-text)" }}>{insight}</p>
        </motion.div>
      )}
    </div>
  );
}

// ── Fade animation ────────────────────────────────────────────────────────────

const fadeUp = (i: number) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0, transition: { delay: i * 0.06, type: "spring" as const, stiffness: 300, damping: 24 } },
});

// ── Main Dashboard ────────────────────────────────────────────────────────────

export default function DashboardPage() {
  // ── Computed from real data ──
  const activeOrders = orders.filter((o) => o.status !== "selesai");
  const completedOrders = orders.filter((o) => o.status === "selesai");
  const paidInvoices = invoices.filter((i) => i.status === "paid");
  const pendingInvoices = invoices.filter((i) => i.status === "pending");
  const paidTotal = paidInvoices.reduce((s, i) => s + i.amount, 0);
  const pendingTotal = pendingInvoices.reduce((s, i) => s + i.amount, 0);
  const paidPercent = paidTotal + pendingTotal > 0
    ? Math.round((paidTotal / (paidTotal + pendingTotal)) * 100)
    : 0;

  // Overdue invoices (pending & past due date)
  const overdueInvoices = pendingInvoices.filter((i) => {
    const d = daysUntil(i.dueDate);
    return d !== null && d < 0;
  });

  // Domain expiry alerts (≤60 days)
  const expiringDomains = clients.filter((c) => {
    const d = daysUntil(c.domainExpiry);
    return d !== null && d <= 60;
  });

  // Deadline urgent (≤3 days, not selesai)
  const urgentDeadlines = activeOrders.filter((o) => {
    const d = daysUntil(o.deadline);
    return d !== null && d >= 0 && d <= 3;
  });

  // Pipeline funnel data
  const pipelineData = getPipelineData();

  return (
    <div className="space-y-5">

      {/* ── Alerts row ───────────────────────────────────────────────────── */}
      {(urgentDeadlines.length > 0 || overdueInvoices.length > 0 || expiringDomains.length > 0) && (
        <motion.div {...fadeUp(0)} className="flex flex-col gap-2">
          {urgentDeadlines.length > 0 && (
            <div
              className="flex items-start gap-3 p-3.5 rounded-xl"
              style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)" }}
            >
              <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5" style={{ color: "var(--adm-danger)", fontVariationSettings: "'FILL' 1" }}>alarm</span>
              <div>
                <p className="text-xs font-bold" style={{ color: "var(--adm-danger)" }}>Deadline Kritis</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--adm-text-2)" }}>
                  {urgentDeadlines.map((o) => {
                    const d = daysUntil(o.deadline);
                    return `${o.client} — ${o.service} (${d === 0 ? "hari ini!" : `${d} hari lagi`})`;
                  }).join(" · ")}
                </p>
              </div>
            </div>
          )}
          {overdueInvoices.length > 0 && (
            <div
              className="flex items-start gap-3 p-3.5 rounded-xl"
              style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)" }}
            >
              <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5" style={{ color: "var(--adm-warning)", fontVariationSettings: "'FILL' 1" }}>receipt_long</span>
              <div>
                <p className="text-xs font-bold" style={{ color: "var(--adm-warning)" }}>Tagihan Jatuh Tempo</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--adm-text-2)" }}>
                  {overdueInvoices.map((i) => `${i.client} — ${formatRp(i.amount)}`).join(" · ")}
                </p>
              </div>
            </div>
          )}
          {expiringDomains.length > 0 && (
            <div
              className="flex items-start gap-3 p-3.5 rounded-xl"
              style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.25)" }}
            >
              <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5" style={{ color: "var(--adm-purple)", fontVariationSettings: "'FILL' 1" }}>language</span>
              <div>
                <p className="text-xs font-bold" style={{ color: "var(--adm-purple)" }}>Domain Segera Expired</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--adm-text-2)" }}>
                  {expiringDomains.map((c) => `${c.name} — ${c.domain} (${daysUntil(c.domainExpiry)} hari)`).join(" · ")}
                </p>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* ── Row 1: 4 KPI cards ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div {...fadeUp(1)}>
          <StatCard
            label="Pesanan Aktif"
            value={activeOrders.length}
            sub={`${completedOrders.length} proyek selesai`}
            icon="work"
            iconColor="#2563EB"
            trend="up"
            trendLabel="dalam pipeline"
          />
        </motion.div>
        <motion.div {...fadeUp(2)}>
          <StatCard
            label="Proyek Selesai"
            value={completedOrders.length}
            sub="Total sepanjang waktu"
            icon="task_alt"
            iconColor="#10B981"
            trend="up"
            trendLabel="delivered ke klien"
          />
        </motion.div>
        <motion.div {...fadeUp(3)}>
          <StatCard
            label="Pendapatan Masuk"
            value={formatRp(paidTotal)}
            sub="Total sudah terbayar"
            icon="payments"
            iconColor="#8B5CF6"
            trend="up"
            trendLabel="dari invoice lunas"
          />
        </motion.div>
        <motion.div {...fadeUp(4)}>
          <StatCard
            label="Tagihan Pending"
            value={formatRp(pendingTotal)}
            sub={`${pendingInvoices.length} invoice belum lunas`}
            icon="pending_actions"
            iconColor={overdueInvoices.length > 0 ? "#EF4444" : "#F59E0B"}
            trend={overdueInvoices.length > 0 ? "down" : "neutral"}
            trendLabel={overdueInvoices.length > 0 ? `${overdueInvoices.length} overdue!` : "menunggu pembayaran"}
          />
        </motion.div>
      </div>

      {/* ── Row 2: Pipeline funnel + Invoice progress ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Pipeline bar chart */}
        <motion.div {...fadeUp(5)} className="lg:col-span-2">
          <AdminCard>
            <div className="px-5 pt-5 pb-2 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold" style={{ color: "var(--adm-text)" }}>Pipeline Pesanan</h3>
                <p className="text-xs mt-0.5" style={{ color: "var(--adm-text-3)" }}>Distribusi {orders.length} pesanan per stage</p>
              </div>
            </div>
            <div className="px-2 pb-4" style={{ height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pipelineData} barSize={24} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                  <CartesianGrid vertical={false} stroke="var(--adm-chart-grid)" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10, fill: "var(--adm-text-3)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis hide allowDecimals={false} />
                  <Tooltip content={<PipelineTooltip />} cursor={{ fill: "var(--adm-border)", radius: 6 }} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {pipelineData.map((s, i) => (
                      <Cell key={i} fill={s.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </AdminCard>
        </motion.div>

        {/* Invoice progress rings */}
        <motion.div {...fadeUp(6)} className="flex flex-col gap-4">
          <ProgressRingCard
            label="Invoice Lunas"
            value={formatRp(paidTotal)}
            sub={`${paidInvoices.length} dari ${invoices.length} invoice`}
            percent={paidPercent}
            color="#10B981"
            badge={`${paidPercent}%`}
            badgeColor="#10B981"
          />
          <ProgressRingCard
            label="Potensi Pendapatan"
            value={formatRp(paidTotal + pendingTotal)}
            sub="Confirmed + pending"
            percent={Math.min(Math.round((activeOrders.length / Math.max(orders.length, 1)) * 100), 100)}
            color="#3B82F6"
            badge={`${activeOrders.length} aktif`}
            badgeColor="#3B82F6"
          />
        </motion.div>
      </div>

      {/* ── Row 3: Active orders table ───────────────────────────────────── */}
      <motion.div {...fadeUp(7)}>
        <AdminCard>
          <div className="px-5 pt-5 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold" style={{ color: "var(--adm-text)" }}>Pesanan Aktif</h3>
              <p className="text-xs mt-0.5" style={{ color: "var(--adm-text-3)" }}>Semua proyek yang sedang berjalan</p>
            </div>
            <a
              href="/admin/pesanan"
              className="text-xs font-semibold hover:opacity-70 transition-opacity"
              style={{ color: "var(--adm-accent)" }}
            >
              Lihat semua →
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--adm-border)", background: "var(--adm-bg)" }}>
                  {["Klien", "Layanan", "Stage", "Total", "Deadline", "Catatan"].map((h) => (
                    <th key={h} className="px-5 py-2 text-left font-semibold uppercase tracking-wide" style={{ color: "var(--adm-text-3)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {activeOrders.map((o) => {
                  const style = STATUS_COLOR[o.status] ?? STATUS_COLOR.inbox;
                  const deadlineDays = daysUntil(o.deadline);
                  const isUrgent = deadlineDays !== null && deadlineDays <= 3;
                  return (
                    <tr
                      key={o.id}
                      style={{ borderBottom: "1px solid var(--adm-border)" }}
                      className="transition-colors cursor-pointer"
                      onMouseEnter={(e) => { e.currentTarget.style.background = "var(--adm-card-hover)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                            style={{ background: `hsl(${(o.client.charCodeAt(0) * 47) % 360}, 60%, 55%)` }}
                          >
                            {o.client.charAt(0)}
                          </div>
                          <span className="font-semibold truncate max-w-[100px]" style={{ color: "var(--adm-text)" }}>{o.client}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3" style={{ color: "var(--adm-text-2)" }}>{o.service}</td>
                      <td className="px-5 py-3">
                        <span
                          className="px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap"
                          style={{ background: style.bg, color: style.text }}
                        >
                          {STATUS_LABEL[o.status]}
                        </span>
                      </td>
                      <td className="px-5 py-3 font-semibold" style={{ color: "var(--adm-text)" }}>
                        {formatRp(o.total)}
                      </td>
                      <td className="px-5 py-3">
                        {o.deadline ? (
                          <span
                            className="font-medium"
                            style={{ color: isUrgent ? "var(--adm-danger)" : "var(--adm-text-2)" }}
                          >
                            {isUrgent && "⚠️ "}{new Date(o.deadline).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                          </span>
                        ) : (
                          <span style={{ color: "var(--adm-text-3)" }}>—</span>
                        )}
                      </td>
                      <td className="px-5 py-3 max-w-[160px]">
                        <p className="truncate text-[11px]" style={{ color: "var(--adm-text-3)" }}>{o.notes}</p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </AdminCard>
      </motion.div>

      {/* ── Row 4: AI Insight ────────────────────────────────────────────── */}
      <motion.div {...fadeUp(8)}>
        <AIInsightWidget />
      </motion.div>
    </div>
  );
}
