"use client";

import { motion } from "framer-motion";
import { PageHeader, StatusBadge, AdminCard } from "@/components/admin/ui";
import rawClients from "@/data/admin/clients.json";

interface ClientRecord {
  id: string;
  name: string;
  domain: string | null;
  domainExpiry: string | null;
  hosting: string | null;
  hostingExpiry: string | null;
  websiteStatus: "active" | "pending" | "down";
  website: string | null;
}

const clients = rawClients as ClientRecord[];

function daysUntil(dateStr: string | null) {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function urgency(days: number | null): "critical" | "warning" | "ok" | "none" {
  if (days === null) return "none";
  if (days <= 14) return "critical";
  if (days <= 60) return "warning";
  return "ok";
}

const fadeUp = (i: number) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { delay: i * 0.06, type: "spring" as const, stiffness: 300, damping: 24 } },
});

export default function MaintenancePage() {
  const records = clients.filter((c) => c.domain !== null);
  const critical = records.filter((c) => urgency(daysUntil(c.domainExpiry)) === "critical" || urgency(daysUntil(c.hostingExpiry)) === "critical");
  const warning = records.filter((c) => urgency(daysUntil(c.domainExpiry)) === "warning" || urgency(daysUntil(c.hostingExpiry)) === "warning");

  return (
    <div>
      <PageHeader
        title="Maintenance"
        description="Pemantauan masa aktif domain & hosting seluruh klien"
        icon="dns"
      />

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Domain Kritis (≤14h)", value: critical.length, iconBg: "bg-rose-50", iconColor: "text-rose-600", icon: "crisis_alert" },
          { label: "Segera Diperbarui (≤60h)", value: warning.length, iconBg: "bg-amber-50", iconColor: "text-amber-600", icon: "warning" },
          { label: "Total Domain Dipantau", value: records.length, iconBg: "bg-blue-50", iconColor: "text-blue-600", icon: "dns" },
        ].map((s, i) => (
          <motion.div key={s.label} {...fadeUp(i)} className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.iconBg}`}>
              <span className={`material-symbols-outlined text-[20px] ${s.iconColor}`} style={{ fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
            </div>
            <div>
              <p className="text-xs text-slate-500 leading-tight">{s.label}</p>
              <p className="text-xl font-bold text-slate-900">{s.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {records.map((c, i) => {
          const domainDays = daysUntil(c.domainExpiry);
          const hostingDays = daysUntil(c.hostingExpiry);
          const domainUrgency = urgency(domainDays);
          const hostingUrgency = urgency(hostingDays);
          const maxUrgency = [domainUrgency, hostingUrgency].includes("critical") ? "critical"
            : [domainUrgency, hostingUrgency].includes("warning") ? "warning" : "ok";

          return (
            <motion.div key={c.id} {...fadeUp(i + 3)}>
              <AdminCard className={`border-l-4 ${maxUrgency === "critical" ? "border-l-rose-500" : maxUrgency === "warning" ? "border-l-amber-400" : "border-l-emerald-400"}`}>
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{c.name}</p>
                      <a href={c.website ?? "#"} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">{c.domain}</a>
                    </div>
                    <StatusBadge
                      label={c.websiteStatus === "active" ? "Aktif" : c.websiteStatus === "pending" ? "Pending" : "Down"}
                      variant={c.websiteStatus === "active" ? "emerald" : c.websiteStatus === "pending" ? "amber" : "rose"}
                    />
                  </div>

                  {/* Domain expiry */}
                  <div className={`flex items-center justify-between p-2.5 rounded-xl ${domainUrgency === "critical" ? "bg-rose-50" : domainUrgency === "warning" ? "bg-amber-50" : "bg-slate-50"}`}>
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[14px] text-slate-400">language</span>
                      <span className="text-xs text-slate-600">Domain</span>
                    </div>
                    {c.domainExpiry ? (
                      <div className="text-right">
                        <p className={`text-xs font-semibold ${domainUrgency === "critical" ? "text-rose-700" : domainUrgency === "warning" ? "text-amber-700" : "text-slate-700"}`}>
                          {domainDays} hari lagi
                        </p>
                        <p className="text-[10px] text-slate-400">{new Date(c.domainExpiry).toLocaleDateString("id-ID")}</p>
                      </div>
                    ) : <span className="text-xs text-slate-400">—</span>}
                  </div>

                  {/* Hosting expiry */}
                  <div className={`flex items-center justify-between p-2.5 rounded-xl ${hostingUrgency === "critical" ? "bg-rose-50" : hostingUrgency === "warning" ? "bg-amber-50" : "bg-slate-50"}`}>
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[14px] text-slate-400">storage</span>
                      <span className="text-xs text-slate-600">{c.hosting}</span>
                    </div>
                    {c.hostingExpiry ? (
                      <div className="text-right">
                        <p className={`text-xs font-semibold ${hostingUrgency === "critical" ? "text-rose-700" : hostingUrgency === "warning" ? "text-amber-700" : "text-slate-700"}`}>
                          {hostingDays} hari lagi
                        </p>
                        <p className="text-[10px] text-slate-400">{new Date(c.hostingExpiry).toLocaleDateString("id-ID")}</p>
                      </div>
                    ) : <span className="text-xs text-slate-400">—</span>}
                  </div>
                </div>
              </AdminCard>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
