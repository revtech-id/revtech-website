"use client";

import { motion } from "framer-motion";
import { PageHeader, AdminCard } from "@/components/admin/ui";
import rawActivity from "@/data/admin/activity-log.json";

interface ActivityEntry {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  user: string;
}

const activity = rawActivity as ActivityEntry[];

const TYPE_CONFIG: Record<string, { icon: string; iconBg: string; iconColor: string }> = {
  login: { icon: "login", iconBg: "bg-slate-100", iconColor: "text-slate-500" },
  order_created: { icon: "add_circle", iconBg: "bg-blue-50", iconColor: "text-blue-600" },
  order_status: { icon: "sync", iconBg: "bg-indigo-50", iconColor: "text-indigo-600" },
  order_completed: { icon: "task_alt", iconBg: "bg-emerald-50", iconColor: "text-emerald-600" },
  invoice_paid: { icon: "payments", iconBg: "bg-emerald-50", iconColor: "text-emerald-600" },
  client_added: { icon: "person_add", iconBg: "bg-purple-50", iconColor: "text-purple-600" },
  studio_export: { icon: "rocket_launch", iconBg: "bg-amber-50", iconColor: "text-amber-600" },
};

export default function ActivityLogPage() {
  const sorted = [...activity].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div>
      <PageHeader
        title="Activity Log"
        description="Jejak rekam pergerakan sistem & login"
        icon="history"
      />

      <AdminCard title={`${sorted.length} Aktivitas Tercatat`}>
        <div className="divide-y divide-slate-50">
          {sorted.map((entry, i) => {
            const config = TYPE_CONFIG[entry.type] ?? { icon: "info", iconBg: "bg-slate-100", iconColor: "text-slate-500" };
            const ts = new Date(entry.timestamp);
            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0, transition: { delay: i * 0.04, type: "spring", stiffness: 300, damping: 24 } }}
                className="flex items-start gap-3 px-5 py-3.5"
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${config.iconBg}`}>
                  <span className={`material-symbols-outlined text-[18px] ${config.iconColor}`} style={{ fontVariationSettings: "'FILL' 1" }}>{config.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700">{entry.description}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{entry.user}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-slate-500">{ts.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</p>
                  <p className="text-[10px] text-slate-400">{ts.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </AdminCard>
    </div>
  );
}
