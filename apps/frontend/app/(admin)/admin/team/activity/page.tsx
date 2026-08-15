"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PageHeader, AdminCard, AdminToolbar } from "@/components/admin/ui";
import { ChevronDown } from "lucide-react";
import { type ActivityEntry } from "@/lib/activityLog";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";

function getTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diffInSeconds < 60) return "Baru saja";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} menit lalu`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} jam lalu`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays} hari lalu`;
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

const TYPE_CONFIG: Record<string, { icon: string; label: string }> = {
  // Dynamic types (new system)
  lead_created:         { icon: "add_circle",     label: "Projects" },
  lead_added:           { icon: "person_add",     label: "Projects" },
  lead_deal:            { icon: "handshake",      label: "Projects" },
  lead_paid_full:       { icon: "payments",       label: "Pembayaran" },
  order_status_changed: { icon: "sync",           label: "Projects" },
  order_lunas:          { icon: "payments",       label: "Pembayaran" },
  order_handover:       { icon: "task_alt",       label: "Projects" },
  invoice_paid:         { icon: "receipt_long",   label: "Pembayaran" },
  client_added:         { icon: "person_add",     label: "Projects" },
  login:                { icon: "login",          label: "Login" },
  system:               { icon: "info",           label: "Sistem" },
  profile_updated:      { icon: "manage_accounts",label: "Profil" },
  // Legacy static types
  order_created:        { icon: "add_circle",     label: "Projects" },
  order_status:         { icon: "sync",           label: "Projects" },
  order_completed:      { icon: "task_alt",       label: "Projects" },
  studio_export:        { icon: "rocket_launch",  label: "Sistem" },
};

const FALLBACK_CONFIG = { icon: "info", label: "Aktivitas" };

type CombinedEntry = ActivityEntry & { source: "dynamic" };

export default function ActivityLogPage() {
  const [entries, setEntries] = useState<CombinedEntry[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const q = query(collection(db, "activity_logs"), orderBy("timestamp", "desc"), limit(200));

    const unsub = onSnapshot(q, (snapshot) => {
      const dynamicRaw: ActivityEntry[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ActivityEntry[];

      const combined: CombinedEntry[] = dynamicRaw
        .map((e) => ({ ...e, source: "dynamic" as const }))
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setEntries(combined);
    });

    return () => unsub();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const FILTER_TABS = [
    { id: "all",      label: "Semua" },
    { id: "order",    label: "Projects" },
    { id: "payment",  label: "Pembayaran" },
    { id: "login",    label: "Login" },
    { id: "system",   label: "Sistem" },
  ];

  const ORDER_TYPES = new Set(["lead_created", "lead_added", "lead_deal", "lead_paid_full", "order_created", "order_status", "order_status_changed", "order_completed", "order_handover", "client_added"]);
  const PAYMENT_TYPES = new Set(["invoice_paid", "order_lunas", "lead_paid_full"]);
  const LOGIN_TYPES = new Set(["login"]);

  const filtered = entries.filter((e) => {
    let matchTab = true;
    if (filter === "order") matchTab = ORDER_TYPES.has(e.type);
    else if (filter === "payment") matchTab = PAYMENT_TYPES.has(e.type);
    else if (filter === "login") matchTab = LOGIN_TYPES.has(e.type);
    else if (filter === "system") matchTab = e.type === "system" || e.type === "studio_export";
    
    if (!matchTab) return false;

    if (search.trim() !== "") {
      const q = search.toLowerCase();
      const matchSearch = 
        (e.description || "").toLowerCase().includes(q) ||
        (e.title || "").toLowerCase().includes(q) ||
        (e.user || "").toLowerCase().includes(q);
      if (!matchSearch) return false;
    }

    return true;
  });

  return (
    <div>

      <div className="pt-2"></div>
      <AdminToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari aktivitas..."
        dropdown={
          <div className="relative flex items-center shrink-0">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="appearance-none bg-transparent py-2.5 pl-4 pr-8 text-sm font-semibold text-[var(--adm-text)] focus:outline-none cursor-pointer w-full"
            >
              {FILTER_TABS.map((tab) => (
                <option key={tab.id} value={tab.id} className="bg-[var(--adm-card)] text-[var(--adm-text)]">
                  {tab.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3">
              <ChevronDown size={14} strokeWidth={2.5} className="text-[var(--adm-text-3)]" />
            </div>
          </div>
        }
      />

      <div className="divide-y divide-[var(--adm-border)] mt-4">
        {filtered.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center">
            <span className="material-symbols-outlined text-[40px] text-[var(--adm-text-3)] mb-3">history</span>
            <p className="text-sm text-[var(--adm-text-2)]">Belum ada aktivitas tercatat.</p>
          </div>
        ) : filtered.map((entry, i) => {
          const config = TYPE_CONFIG[entry.type] ?? FALLBACK_CONFIG;
          const ts = new Date(entry.timestamp);
          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0, transition: { delay: i * 0.03, type: "spring", stiffness: 300, damping: 24 } }}
              className="flex items-start gap-3 px-2 py-4 hover:bg-[var(--adm-card)] transition-colors rounded-xl -mx-2"
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[18px] text-[var(--adm-text-3)]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {config.icon}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[11px] font-bold text-[var(--adm-text-2)]">
                    {config.label}
                  </span>
                </div>
                <p className="text-sm text-[var(--adm-text)]">{entry.description}</p>
                <p className="text-xs text-[var(--adm-text-3)] mt-0.5">{entry.user} · {getTimeAgo(entry.timestamp)}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-[var(--adm-text-2)]">
                  {ts.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                </p>
                <p className="text-[10px] text-[var(--adm-text-3)]">
                  {ts.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
