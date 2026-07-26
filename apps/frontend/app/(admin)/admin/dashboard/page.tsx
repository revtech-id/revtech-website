"use client";

import { useState, useEffect } from "react";
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
  const [insight, setInsight] = useState<React.ReactNode>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const activeOrders = orders.filter((o) => o.status !== "selesai").length;
  const paidRevenue = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.amount, 0);
  const pendingRevenue = invoices.filter((i) => i.status === "pending").reduce((s, i) => s + i.amount, 0);

  // Computed data untuk digabungkan ke Insight
  const pendingInvoices = invoices.filter((i) => i.status === "pending");
  const overdueInvoices = pendingInvoices.filter((i) => {
    const d = daysUntil(i.dueDate);
    return d !== null && d < 0;
  });
  const expiringDomains = clients.filter((c) => {
    const d = daysUntil(c.domainExpiry);
    return d !== null && d <= 60;
  });
  const urgentDeadlines = orders.filter((o) => o.status !== "selesai").filter((o) => {
    const d = daysUntil(o.deadline);
    return d !== null && d >= 0 && d <= 3;
  });

  function fetchInsight() {
    setLoading(true);
    setError("");
    setInsight(null);
    
    setTimeout(() => {
      let content;
      const issuesCount = urgentDeadlines.length + overdueInvoices.length + expiringDomains.length;
      
      if (issuesCount > 0) {
        content = (
          <div>
            <p className="text-[14px] font-bold mb-3" style={{ color: "var(--adm-text)" }}>
              Butuh Perhatian Anda Hari Ini:
            </p>
            <div className="flex flex-col gap-2.5">
              {urgentDeadlines.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg" style={{ background: "rgba(220, 38, 38, 0.05)", border: "1px solid rgba(220, 38, 38, 0.1)" }}>
                  <span className="material-symbols-outlined text-[18px] text-red-500">warning</span>
                  <span className="text-[13px] font-medium text-red-600 dark:text-red-400">{urgentDeadlines.length} proyek kritis mendekati deadline</span>
                </div>
              )}
              {overdueInvoices.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg" style={{ background: "rgba(245, 158, 11, 0.05)", border: "1px solid rgba(245, 158, 11, 0.1)" }}>
                  <span className="material-symbols-outlined text-[18px] text-amber-500">pending_actions</span>
                  <span className="text-[13px] font-medium text-amber-600 dark:text-amber-400">{overdueInvoices.length} tagihan klien tertunggak</span>
                </div>
              )}
              {expiringDomains.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg" style={{ background: "rgba(139, 92, 246, 0.05)", border: "1px solid rgba(139, 92, 246, 0.1)" }}>
                  <span className="material-symbols-outlined text-[18px] text-purple-500">domain_disabled</span>
                  <span className="text-[13px] font-medium text-purple-600 dark:text-purple-400">{expiringDomains.length} domain segera expired</span>
                </div>
              )}
            </div>
          </div>
        );
      } else {
        content = (
          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-3 px-4 py-3.5 rounded-lg" style={{ background: "rgba(16, 185, 129, 0.05)", border: "1px solid rgba(16, 185, 129, 0.1)" }}>
              <span className="material-symbols-outlined text-[20px] text-emerald-500 mt-0.5">verified</span>
              <div>
                <p className="text-[14px] font-bold text-emerald-600 dark:text-emerald-400 mb-0.5">Semua Sistem Aman</p>
                <p className="text-[12px] leading-relaxed" style={{ color: "var(--adm-text-2)" }}>
                  Operasional berjalan dengan sangat lancar. Tidak ada tugas mendesak atau tagihan tertunggak hari ini.
                </p>
              </div>
            </div>
          </div>
        );
      }

      setInsight(content);
      setLoading(false);
    }, 1500);
  }

  useEffect(() => {
    fetchInsight();
  }, []);

  return (
    <div
      className="rounded-2xl p-5 flex flex-col relative overflow-hidden h-full"
      style={{
        background: "linear-gradient(145deg, var(--adm-card) 0%, rgba(99,102,241,0.02) 100%)",
        border: "1px solid var(--adm-border)",
        boxShadow: "var(--adm-shadow-sm)"
      }}
    >
      {/* Decorative Blur Orbs */}
      <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full opacity-20 blur-3xl pointer-events-none" style={{ background: "var(--adm-accent)" }} />
      <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 rounded-full opacity-10 blur-2xl pointer-events-none" style={{ background: "#8B5CF6" }} />



      {/* Content */}
      <div className="flex-1 relative z-10 flex flex-col md:flex-row items-center gap-6">
        <div className="flex-1 w-full">
          {loading ? (
            <div className="flex flex-col gap-2 mt-2">
              <div className="h-2.5 rounded animate-pulse w-3/4" style={{ background: "var(--adm-border)" }} />
              <div className="h-2.5 rounded animate-pulse w-1/2" style={{ background: "var(--adm-border)" }} />
            </div>
          ) : error ? (
            <p className="text-[11px] mt-1" style={{ color: "var(--adm-danger)" }}>{error}</p>
          ) : insight ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[12px] mt-1.5 leading-relaxed"
              style={{ color: "var(--adm-text-2)" }}
            >
              {insight}
            </motion.div>
          ) : null}
        </div>
        
        {/* Placeholder Area Gambar Robot */}
        <div className="hidden md:flex w-48 shrink-0 items-center justify-center min-h-[120px] rounded-xl border border-dashed opacity-50" style={{ borderColor: "var(--adm-border)" }}>
           <span className="text-[11px] font-medium text-center px-4" style={{ color: "var(--adm-text-3)" }}>[Area Gambar Robot]</span>
        </div>
      </div>
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

  // Overdue invoices (diperlukan untuk StatCard warning)
  const overdueInvoices = pendingInvoices.filter((i) => {
    const d = daysUntil(i.dueDate);
    return d !== null && d < 0;
  });

  // Pipeline funnel data
  const pipelineData = getPipelineData();

  return (
    <div className="space-y-5">


      {/* ── Baris 1: Sistem Insight (Full Width) ────────────────────── */}
      <div className="mb-5">
        <motion.div {...fadeUp(1)}>
          <AIInsightWidget />
        </motion.div>
      </div>

      {/* ── Baris 2: KPI Cards (Kiri) & Progress Rings (Kanan) ────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        
        {/* KIRI: 4 KPI Cards */}
        <div className="grid grid-cols-2 gap-4 h-full">
            <motion.div {...fadeUp(1)}>
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
            <motion.div {...fadeUp(2)}>
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
            <motion.div {...fadeUp(3)}>
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
            <motion.div {...fadeUp(4)}>
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
        </div>

        {/* KANAN: Progress Rings */}
        <motion.div {...fadeUp(5)} className="grid grid-cols-2 gap-4 h-full">
          <ProgressRingCard
            label="Invoice Lunas"
            value={formatRp(paidTotal)}
            sub={`${paidInvoices.length} dari ${invoices.length} invoice`}
            percent={paidPercent}
            color="#10B981"
            legendMain="Lunas"
            legendSub="Belum Lunas"
            badge={`${paidPercent}%`}
            badgeColor="#10B981"
          />
          <ProgressRingCard
            label="Potensi Pendapatan"
            value={formatRp(paidTotal + pendingTotal)}
            sub="Confirmed + pending"
            percent={Math.min(Math.round((activeOrders.length / Math.max(orders.length, 1)) * 100), 100)}
            color="#3B82F6"
            legendMain="Terkonfirmasi"
            legendSub="Tertunda"
            badge={`${activeOrders.length} aktif`}
            badgeColor="#3B82F6"
          />
        </motion.div>
      </div>

      {/* ── Row 2: Pipeline funnel ────────────────────────────────────────── */}
      <motion.div {...fadeUp(6)}>
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
    </div>
  );
}
