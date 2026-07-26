"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import Link from "next/link";
import { StatCard, ProgressRingCard, AdminCard, DonutChart } from "@/components/admin/ui";
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
      const issuesCount = urgentDeadlines.length + overdueInvoices.length + expiringDomains.length;
      
      let content;
      if (issuesCount > 0) {
        const issueTexts = [];
        if (overdueInvoices.length > 0) issueTexts.push(`${overdueInvoices.length} tagihan tertunggak`);
        if (urgentDeadlines.length > 0) issueTexts.push(`${urgentDeadlines.length} proyek kritis`);
        if (expiringDomains.length > 0) issueTexts.push(`${expiringDomains.length} domain expired`);
        
        let alertSentence = "";
        if (issueTexts.length === 1) alertSentence = issueTexts[0];
        else if (issueTexts.length === 2) alertSentence = `${issueTexts[0]} dan ${issueTexts[1]}`;
        else alertSentence = `${issueTexts[0]}, ${issueTexts[1]}, dan ${issueTexts[2]}`;

        let theme = { 
          bg: "bg-indigo-50 dark:bg-indigo-500/10", 
          border: "border-indigo-200 dark:border-indigo-500/20", 
          text: "text-indigo-600 dark:text-indigo-400", 
          button: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm", 
          divider: "bg-indigo-200 dark:bg-indigo-500/30", 
          icon: "campaign" 
        };
        
        if (urgentDeadlines.length > 0) {
          theme = { 
            bg: "bg-red-50 dark:bg-red-500/10", 
            border: "border-red-200 dark:border-red-500/20", 
            text: "text-red-600 dark:text-red-400", 
            button: "bg-red-600 hover:bg-red-700 text-white shadow-sm", 
            divider: "bg-red-200 dark:bg-red-500/30", 
            icon: "warning" 
          };
        } else if (overdueInvoices.length > 0) {
          theme = { 
            bg: "bg-amber-50 dark:bg-amber-500/10", 
            border: "border-amber-200 dark:border-amber-500/20", 
            text: "text-amber-600 dark:text-amber-400", 
            button: "bg-amber-500 hover:bg-amber-600 text-white shadow-sm", 
            divider: "bg-amber-200 dark:bg-amber-500/30", 
            icon: "lightbulb" 
          };
        } else if (expiringDomains.length > 0) {
          theme = { 
            bg: "bg-purple-50 dark:bg-purple-500/10", 
            border: "border-purple-200 dark:border-purple-500/20", 
            text: "text-purple-600 dark:text-purple-400", 
            button: "bg-purple-600 hover:bg-purple-700 text-white shadow-sm", 
            divider: "bg-purple-200 dark:bg-purple-500/30", 
            icon: "domain_disabled" 
          };
        }

        content = (
          <div className={`flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 px-4 py-3 rounded-xl w-full shadow-sm transition-colors duration-300 ${theme.bg}`}>
            <div className={`flex items-center gap-2 shrink-0 ${theme.text}`}>
              <span className="material-symbols-outlined text-[18px]">{theme.icon}</span>
              <span className="text-[13px] font-bold tracking-tight">Insight Harian</span>
            </div>
            <div className={`w-px h-4 hidden sm:block shrink-0 ${theme.divider}`}></div>
            <p className="text-[13px] flex-1 truncate" style={{ color: "var(--adm-text)" }} title={`Mohon perhatian: Anda memiliki ${alertSentence} hari ini.`}>
              Mohon perhatian: Anda memiliki <strong className="font-bold">{alertSentence}</strong> hari ini.
            </p>
            <Link href={urgentDeadlines.length > 0 ? "/admin/pesanan" : "/admin/invoice"} className={`text-[12px] font-bold px-4 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 text-center shadow-sm ${theme.button}`}>
              Selesaikan Sekarang
            </Link>
          </div>
        );
      } else {
        content = (
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 px-4 py-3 rounded-xl w-full shadow-sm bg-emerald-50 dark:bg-emerald-500/10 transition-colors duration-300">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 shrink-0">
              <span className="material-symbols-outlined text-[18px]">verified</span>
              <span className="text-[13px] font-bold tracking-tight">Sistem Sehat</span>
            </div>
            <div className="w-px h-4 bg-emerald-200 dark:bg-emerald-500/30 hidden sm:block shrink-0"></div>
            <p className="text-[13px] flex-1 truncate" style={{ color: "var(--adm-text)" }}>
              Operasional berjalan dengan sangat lancar. Tidak ada tugas mendesak atau tagihan tertunggak hari ini.
            </p>
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
    <div className="w-full">
      {loading ? (
        <div className="h-[46px] w-full rounded-xl animate-pulse" style={{ background: "var(--adm-border)" }} />
      ) : error ? (
        <p className="text-[11px] mt-1" style={{ color: "var(--adm-danger)" }}>{error}</p>
      ) : (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          {insight}
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
  const [activeTab, setActiveTab] = useState<"proyek" | "server">("proyek");
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

  // Server & Maintenance data
  const activeClients = clients.filter((c) => {
    const d = daysUntil(c.domainExpiry);
    return d === null || d > 60;
  });
  const expiringClients = clients.filter((c) => {
    const d = daysUntil(c.domainExpiry);
    return d !== null && d >= 0 && d <= 60;
  });
  const expiredClients = clients.filter((c) => {
    const d = daysUntil(c.domainExpiry);
    return d !== null && d < 0;
  });

  const serverSegments = [
    { label: "Sehat / Aktif", value: activeClients.length, color: "#10B981" },
    { label: "Mendekati Expired", value: expiringClients.length, color: "#F59E0B" },
    { label: "Kritis / Mati", value: expiredClients.length, color: "#EF4444" }
  ];

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
                trendLabel="12% vs bulan lalu"
                href="/admin/invoice"
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
                trendLabel={overdueInvoices.length > 0 ? `${overdueInvoices.length} overdue (Perhatian!)` : "menunggu pembayaran"}
                href="/admin/invoice"
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
                trendLabel="5 pesanan baru mgg ini"
                href="/admin/pesanan"
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
                trendLabel="Rasio sukses 100%"
                href="/admin/portofolio"
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

      {/* ── Baris 3: Tab Content ───────────────────────────────────────────────────── */}
      {activeTab === "proyek" ? (
        <div className="grid grid-cols-1 xl:grid-cols-[2fr_3fr] gap-5 items-start">
        {/* Kolom Kiri: Pipeline funnel */}
        <motion.div {...fadeUp(6)} className="h-full">
          <AdminCard className="h-full flex flex-col relative">
            <div className="px-5 pt-5 pb-2 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-sm font-bold" style={{ color: "var(--adm-text)" }}>Pipeline Pesanan</h3>
              </div>
              <button
                onClick={() => setActiveTab("server")}
                className="opacity-40 hover:opacity-100 transition-opacity flex items-center justify-center"
                title="Beralih ke Pantauan Server"
              >
                <span className="material-symbols-outlined text-[18px]" style={{ color: "var(--adm-text)" }}>swap_horiz</span>
              </button>
            </div>
            <div className="flex-1 relative min-h-[220px]">
              <div className="absolute inset-0 px-4 pb-0 pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pipelineData} barSize={10} margin={{ top: 30, right: 0, bottom: 0, left: 0 }}>
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 10, fill: "var(--adm-text-3)" }}
                      axisLine={false}
                      tickLine={false}
                      tickMargin={12}
                    />
                    <YAxis hide allowDecimals={false} />
                    <Tooltip content={<PipelineTooltip />} cursor={false} />
                    <Bar 
                      dataKey="count" 
                      fill="#3B82F6" 
                      radius={10} 
                      background={{ fill: "rgba(59, 130, 246, 0.08)", radius: 10 }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </AdminCard>
        </motion.div>

        {/* Kolom Kanan: Active orders table */}
        <motion.div {...fadeUp(7)} className="h-full">
          <AdminCard className="h-full flex flex-col">
            <div className="px-5 pt-5 pb-3 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-sm font-bold" style={{ color: "var(--adm-text)" }}>Pesanan Aktif</h3>
              </div>
              <a
                href="/admin/pesanan"
                className="text-xs font-semibold hover:opacity-70 transition-opacity"
                style={{ color: "var(--adm-text)" }}
              >
                Lihat semua →
              </a>
            </div>
            <div className="overflow-x-auto flex-1 px-4 pb-2">
              <table className="w-full text-xs min-w-[450px] border-separate" style={{ borderSpacing: "0 8px" }}>
              <thead>
                <tr>
                  {["Klien", "Layanan", "Stage", "Total", "Deadline"].map((h, i) => (
                    <th key={h} className={`py-1 text-left font-semibold ${i===0 ? 'px-4' : 'px-2'} ${i===4 ? 'pr-4' : ''}`} style={{ color: "var(--adm-text-3)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {activeOrders.slice(0, 5).map((o) => {
                  const style = STATUS_COLOR[o.status] ?? STATUS_COLOR.inbox;
                  const deadlineDays = daysUntil(o.deadline);
                  const isUrgent = deadlineDays !== null && deadlineDays <= 3;
                  return (
                    <tr
                      key={o.id}
                      style={{ background: style.bg }}
                      className="transition-all cursor-pointer hover:brightness-95 dark:hover:brightness-110"
                    >
                      <td className="px-4 py-2.5 rounded-l-full">
                        <span className="truncate max-w-[150px] block" style={{ color: "var(--adm-text)" }}>{o.client}</span>
                      </td>
                      <td className="px-2 py-2.5" style={{ color: "var(--adm-text)" }}>{o.service}</td>
                      <td className="px-2 py-2.5" style={{ color: "var(--adm-text)" }}>
                        {STATUS_LABEL[o.status]}
                      </td>
                      <td className="px-2 py-2.5" style={{ color: "var(--adm-text)" }}>
                        {formatRp(o.total)}
                      </td>
                      <td className="px-2 py-2.5 rounded-r-full pr-4">
                        {o.deadline ? (
                          <span
                            className="whitespace-nowrap"
                            style={{ color: isUrgent ? "var(--adm-danger)" : "var(--adm-text)" }}
                          >
                            {new Date(o.deadline).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                          </span>
                        ) : (
                          <span className="opacity-30 font-bold">—</span>
                        )}
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
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-[2fr_3fr] gap-5 items-start">
          {/* Kolom Kiri: Server Donut Chart */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="h-full">
            <AdminCard className="h-full flex flex-col justify-between p-6 relative">
              <button
                onClick={() => setActiveTab("proyek")}
                className="absolute top-5 right-5 opacity-40 hover:opacity-100 transition-opacity flex items-center justify-center z-10"
                title="Beralih ke Arus Proyek"
              >
                <span className="material-symbols-outlined text-[18px]" style={{ color: "var(--adm-text)" }}>swap_horiz</span>
              </button>
              
              {/* Bagian Atas: Label & Total */}
              <div>
                <p className="text-[13px] font-bold text-left" style={{ color: "var(--adm-text-2)" }}>
                  Kesehatan Server
                </p>
                <p className="text-[32px] leading-tight font-bold tracking-tight mt-2 text-left" style={{ color: "var(--adm-text)" }}>
                  {activeClients.length + expiringClients.length + expiredClients.length}
                </p>
                <p className="text-[12px] mt-1 text-left font-medium" style={{ color: "var(--adm-text-3)" }}>
                  Total Klien Maintenance
                </p>
              </div>

              {/* Bagian Bawah: Legend & Diagram */}
              <div className="flex items-end justify-between mt-8">
                <div className="flex flex-col gap-2 pb-2">
                  {serverSegments.map(s => {
                    const total = activeClients.length + expiringClients.length + expiredClients.length;
                    const pct = total > 0 ? Math.round((s.value / total) * 100) : 0;
                    return (
                      <div key={s.label} className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
                        <span className="text-[10px] font-bold w-6" style={{ color: "var(--adm-text)" }}>{pct}%</span>
                        <span className="text-[10px]" style={{ color: "var(--adm-text-3)" }}>{s.label}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="relative shrink-0 pr-2">
                  <DonutChart segments={serverSegments} size={130} strokeWidth={22} />
                  <div className="absolute inset-0 pr-2 flex items-center justify-center">
                    <span className="text-[20px] font-bold" style={{ color: "var(--adm-text)" }}>
                      {activeClients.length + expiringClients.length + expiredClients.length > 0 
                        ? Math.round((activeClients.length / (activeClients.length + expiringClients.length + expiredClients.length)) * 100) 
                        : 0}%
                    </span>
                  </div>
                </div>
              </div>
            </AdminCard>
          </motion.div>

          {/* Kolom Kanan: Maintenance Clients Table */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="h-full">
            <AdminCard className="h-full flex flex-col">
              <div className="px-5 pt-5 pb-3 flex items-center justify-between shrink-0">
                <div>
                  <h3 className="text-sm font-bold" style={{ color: "var(--adm-text)" }}>Layanan & Domain Aktif</h3>
                </div>
                <a
                  href="/admin/maintenance"
                  className="text-xs font-semibold hover:opacity-70 transition-opacity"
                  style={{ color: "var(--adm-text)" }}
                >
                  Lihat semua →
                </a>
              </div>
              <div className="overflow-x-auto flex-1 px-4 pb-2">
                <table className="w-full text-xs min-w-[450px] border-separate" style={{ borderSpacing: "0 8px" }}>
                  <thead>
                    <tr>
                      <th className="py-1 px-4 text-left font-semibold" style={{ color: "var(--adm-text-3)" }}>Klien</th>
                      <th className="py-1 px-2 text-left font-semibold" style={{ color: "var(--adm-text-3)" }}>Layanan</th>
                      <th className="py-1 px-2 text-left font-semibold" style={{ color: "var(--adm-text-3)" }}>Status</th>
                      <th className="py-1 px-4 text-left font-semibold pr-4" style={{ color: "var(--adm-text-3)" }}>Expired</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.slice(0, 5).map((c) => {
                      const d = daysUntil(c.domainExpiry);
                      const isCritical = d !== null && d <= 14;
                      const isWarning = d !== null && d <= 60 && d > 14;
                      const rowBg = isCritical ? "bg-red-50 dark:bg-red-500/10" : isWarning ? "bg-amber-50 dark:bg-amber-500/10" : "bg-emerald-50 dark:bg-emerald-500/10";
                      const statusText = isCritical ? "Kritis" : isWarning ? "Warning" : "Sehat";
                      
                      return (
                        <tr
                          key={c.id}
                          className={`transition-all cursor-pointer hover:brightness-95 dark:hover:brightness-110 ${rowBg}`}
                          style={{ color: "var(--adm-text)" }}
                        >
                          <td className="px-4 py-2.5 rounded-l-full">
                            <span className="truncate max-w-[150px] block">{c.name}</span>
                          </td>
                          <td className="px-2 py-2.5">
                            {c.domain ? "Hosting & Domain" : "Maintenance"}
                          </td>
                          <td className="px-2 py-2.5">
                            <span className="text-[10px] uppercase tracking-wider">
                              {statusText}
                            </span>
                          </td>
                          <td className="px-2 py-2.5 rounded-r-full pr-4">
                            {c.domainExpiry ? (
                              <span className="whitespace-nowrap">
                                {new Date(c.domainExpiry).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                              </span>
                            ) : (
                              <span className="opacity-30 font-bold">—</span>
                            )}
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
      )}
    </div>
  );
}
