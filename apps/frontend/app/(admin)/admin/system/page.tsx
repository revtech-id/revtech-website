"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PageHeader, AdminCard } from "@/components/admin/ui";

const inputCls = "w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors";

const SECTIONS = [
  {
    id: "engine",
    label: "Engine & Domain",
    icon: "settings",
    fields: [
      { key: "businessName", label: "Nama Bisnis", placeholder: "RevTech", type: "text" },
      { key: "founderName", label: "Nama Founder", placeholder: "Superadmin", type: "text" },
      { key: "businessEmail", label: "Email Bisnis", placeholder: "hi@revtech.id", type: "email" },
      { key: "primaryDomain", label: "Domain Utama", placeholder: "hi-revtech.my.id", type: "text" },
      { key: "currency", label: "Mata Uang", placeholder: "IDR", type: "text" },
    ],
  },
  {
    id: "whatsapp",
    label: "WhatsApp Rotator",
    icon: "chat",
    fields: [
      { key: "wa1", label: "WhatsApp No. 1", placeholder: "6281234567890", type: "tel" },
      { key: "wa2", label: "WhatsApp No. 2 (Opsional)", placeholder: "6282345678901", type: "tel" },
      { key: "wa3", label: "WhatsApp No. 3 (Opsional)", placeholder: "6283456789012", type: "tel" },
    ],
  },
  {
    id: "api",
    label: "API Keys",
    icon: "key",
    fields: [
      { key: "geminiKey", label: "Gemini API Key", placeholder: "AIzaSy...", type: "password" },
      { key: "openaiKey", label: "OpenAI API Key (Opsional)", placeholder: "sk-...", type: "password" },
    ],
  },
  {
    id: "payment",
    label: "Payment Gateway",
    icon: "payments",
    fields: [
      { key: "midtransKey", label: "Midtrans Server Key", placeholder: "SB-Mid-server-...", type: "password" },
      { key: "midtransEnv", label: "Environment", placeholder: "sandbox", type: "text" },
    ],
  },
];

type FormState = Record<string, string>;

const DEFAULTS: FormState = {
  businessName: "RevTech",
  founderName: "Superadmin",
  businessEmail: "",
  primaryDomain: "hi-revtech.my.id",
  currency: "IDR",
  wa1: "", wa2: "", wa3: "",
  geminiKey: "", openaiKey: "",
  midtransKey: "", midtransEnv: "sandbox",
};

const fadeUp = (i: number) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { delay: i * 0.07, type: "spring" as const, stiffness: 300, damping: 24 } },
});

export default function SystemPage() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [saved, setSaved] = useState(false);

  function update(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  }

  function save() {
    // TODO: persist to localStorage or API
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div>
      <PageHeader
        title="System"
        description="Konfigurasi engine, integrasi API, dan pengaturan bisnis"
        icon="settings"
        action={
          <button
            id="save-system-settings"
            onClick={save}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${saved ? "bg-emerald-500 text-white" : "bg-blue-600 text-white hover:bg-blue-700"}`}
          >
            <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              {saved ? "check_circle" : "save"}
            </span>
            {saved ? "Tersimpan!" : "Simpan Pengaturan"}
          </button>
        }
      />

      <div className="space-y-5">
        {SECTIONS.map((section, si) => (
          <motion.div key={section.id} {...fadeUp(si)}>
            <AdminCard>
              <div className="p-5 space-y-4">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <span className="material-symbols-outlined text-blue-600 text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>{section.icon}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-800">{section.label}</h3>
                </div>

                {section.id === "api" && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/60 flex items-start gap-2 mb-3">
                    <span className="material-symbols-outlined text-amber-500 text-[16px] shrink-0 mt-0.5">lock</span>
                    <p className="text-xs text-amber-700">API key disimpan secara lokal di browser dan tidak dikirim ke server pihak ketiga. Untuk keamanan maksimal, gunakan environment variable di production.</p>
                  </div>
                )}

                <div className={`grid gap-4 ${section.fields.length >= 3 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}>
                  {section.fields.map((field) => (
                    <div key={field.key}>
                      <label className="block text-xs font-semibold text-slate-500 mb-1.5">{field.label}</label>
                      <input
                        id={`field-${field.key}`}
                        type={field.type}
                        value={form[field.key] ?? ""}
                        onChange={(e) => update(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        className={inputCls}
                        autoComplete={field.type === "password" ? "off" : undefined}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </AdminCard>
          </motion.div>
        ))}

        {/* About RevTech Engine */}
        <motion.div {...fadeUp(SECTIONS.length)}>
          <AdminCard>
            <div className="p-5">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>rocket_launch</span>
                </div>
                <h3 className="text-sm font-bold text-slate-800">RevTech Engine</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Versi OS", value: "1.0.0" },
                  { label: "Framework", value: "Next.js 16" },
                  { label: "AI Engine", value: "Gemini 2.0" },
                  { label: "Status", value: "🟢 Aktif" },
                ].map((info) => (
                  <div key={info.label} className="bg-slate-50 rounded-xl px-3 py-2.5">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide">{info.label}</p>
                    <p className="text-sm font-semibold text-slate-800 mt-0.5">{info.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </AdminCard>
        </motion.div>
      </div>
    </div>
  );
}
