"use client";

import { motion } from "framer-motion";
import { PageHeader } from "@/components/admin/ui";

// ── Org Chart Nodes ────────────────────────────────────────────────────────────

function FounderNode() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="relative"
    >
      <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-5 shadow-lg shadow-blue-200 text-white w-64 mx-auto">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <span className="text-2xl font-bold">R</span>
          </div>
          <div>
            <p className="font-bold text-base">Founder & CEO</p>
            <p className="text-blue-200 text-xs">RevTech</p>
          </div>
        </div>
        <div className="bg-white/10 rounded-xl px-3 py-2">
          <p className="text-xs text-blue-100 font-medium">Superadmin</p>
          <p className="text-[10px] text-blue-200">hi-revtech.my.id</p>
        </div>
        <div className="mt-3 flex justify-center">
          <span className="text-[10px] font-bold tracking-widest text-blue-200 uppercase">One-Person Enterprise</span>
        </div>
      </div>
    </motion.div>
  );
}

function AICopilotNode() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 24, delay: 0.2 }}
    >
      <div className="bg-white rounded-2xl border border-indigo-200 p-4 shadow-sm w-52 hover:shadow-md hover:border-indigo-400 transition-all">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-indigo-600 text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">AI Co-Pilot</p>
            <p className="text-[10px] text-slate-400">RevTech Business AI</p>
          </div>
        </div>
        <div className="space-y-1">
          {["Business Insight", "Content Writer", "WA Drafter", "SEO Expert", "Doc Reviewer"].map((skill) => (
            <div key={skill} className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              <span className="text-[10px] text-slate-500">{skill}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] text-emerald-600 font-semibold">Online</span>
        </div>
      </div>
    </motion.div>
  );
}

function AddMemberNode() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 24, delay: 0.3 }}
    >
      <div className="w-52 rounded-2xl border-2 border-dashed border-slate-200 p-4 hover:border-blue-300 hover:bg-blue-50/40 transition-all cursor-pointer group">
        <div className="flex flex-col items-center justify-center py-2 gap-2">
          <div className="w-10 h-10 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center group-hover:border-blue-400 transition-colors">
            <span className="material-symbols-outlined text-slate-300 text-[20px] group-hover:text-[var(--adm-text)] transition-colors">add</span>
          </div>
          <p className="text-xs font-semibold text-slate-400 group-hover:text-[var(--adm-text)] text-center transition-colors">Tambah Anggota Tim / Role Baru</p>
          <p className="text-[10px] text-slate-300 text-center">Siap untuk ekspansi</p>
        </div>
      </div>
    </motion.div>
  );
}

// ── Org Chart ─────────────────────────────────────────────────────────────────

function OrgChart() {
  return (
    <div className="flex flex-col items-center gap-0">
      {/* Root */}
      <FounderNode />

      {/* Connector line */}
      <div className="w-px h-8 bg-slate-200" />

      {/* Branch lines */}
      <div className="relative flex items-start gap-16">
        {/* Left connector */}
        <div className="absolute top-0 left-0 right-0 h-px bg-slate-200" style={{ left: "25%", right: "25%" }} />

        {/* Left child */}
        <div className="flex flex-col items-center gap-0">
          <div className="w-px h-8 bg-slate-200" />
          <AICopilotNode />
        </div>

        {/* Right child */}
        <div className="flex flex-col items-center gap-0">
          <div className="w-px h-8 bg-slate-200" />
          <AddMemberNode />
        </div>
      </div>
    </div>
  );
}

export default function TeamPage() {
  return (
    <div>
      <div className="pt-2"></div>

      {/* Badge */}
      <div className="mb-8 flex justify-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/60">
          <span className="material-symbols-outlined text-blue-500 text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
          <span className="text-sm font-semibold text-blue-700">One-Person Enterprise Powered by AI</span>
        </div>
      </div>

      {/* Org chart */}
      <div className="flex justify-center py-4 overflow-x-auto">
        <OrgChart />
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10">
        {[
          {
            icon: "person",
            title: "Solo Founder",
            description: "Kamu adalah satu-satunya motor penggerak RevTech. Setiap keputusan strategis, kreatif, dan teknis ada di tanganmu.",
            color: "from-blue-500 to-indigo-600",
          },
          {
            icon: "psychology",
            title: "AI Co-Pilot",
            description: "RevTech AI Business Co-Pilot siap 24/7: insight bisnis, draft WhatsApp, review dokumen, dan generate konten SEO.",
            color: "from-indigo-500 to-purple-600",
          },
          {
            icon: "groups",
            title: "Ekspansi Tim",
            description: "Slot terbuka untuk freelancer, mitra, atau karyawan pertama saat bisnis tumbuh. Siapkan role sekarang.",
            color: "from-slate-400 to-slate-500",
          },
        ].map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.4 + i * 0.1, type: "spring", stiffness: 300, damping: 24 } }}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm"
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-3`}>
              <span className="material-symbols-outlined text-white text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>{card.icon}</span>
            </div>
            <h3 className="text-sm font-bold text-slate-800 mb-1">{card.title}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">{card.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
