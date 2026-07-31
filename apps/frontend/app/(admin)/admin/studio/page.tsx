"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader, AdminCard } from "@/components/admin/ui";

interface DocForm {
  projectName: string;
  clientName: string;
  serviceType: string;
  description: string;
  features: string;
  designRef: string;
  techStack: string;
  deadline: string;
  budget: string;
  notes: string;
}

const INITIAL_FORM: DocForm = {
  projectName: "",
  clientName: "",
  serviceType: "Website Company Profile",
  description: "",
  features: "",
  designRef: "",
  techStack: "Next.js + Tailwind CSS",
  deadline: "",
  budget: "",
  notes: "",
};

const SERVICE_TYPES = [
  "Website Company Profile",
  "Landing Page",
  "Website E-Commerce",
  "Katalog Produk Digital",
  "Menu Digital QR",
  "Sistem ERP Custom",
  "Aplikasi Web Custom",
  "Lainnya",
];

const TECH_STACKS = [
  "Next.js + Tailwind CSS",
  "HTML + CSS + JS",
  "React + Vite",
  "WordPress",
  "Shopify",
  "Custom (PHP + MySQL)",
];

type TabId = "generator" | "review" | "export";

export default function StudioPage() {
  const [activeTab, setActiveTab] = useState<TabId>("generator");
  const [form, setForm] = useState<DocForm>(INITIAL_FORM);
  const [reviewResult, setReviewResult] = useState("");
  const [exportDoc, setExportDoc] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function update(field: keyof DocForm, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function buildDocument(): string {
    return `# Spesifikasi Proyek: ${form.projectName}

## Informasi Umum
- **Nama Proyek:** ${form.projectName}
- **Nama Klien:** ${form.clientName}
- **Jenis Layanan:** ${form.serviceType}
- **Tech Stack:** ${form.techStack}
- **Deadline:** ${form.deadline || "TBD"}
- **Budget:** ${form.budget || "TBD"}

## Deskripsi Proyek
${form.description}

## Fitur yang Diminta
${form.features}

## Referensi Desain
${form.designRef || "Tidak ada referensi spesifik"}

## Catatan Tambahan
${form.notes || "Tidak ada"}
`.trim();
  }

  async function runAIReview() {
    setLoading(true);
    setError("");
    setReviewResult("");
    try {
      const doc = buildDocument();
      const res = await fetch("/api/admin/studio-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ document: doc }),
      });
      if (!res.ok) throw new Error("API error");
      const data = await res.json() as { review: string };
      setReviewResult(data.review);
      setActiveTab("review");
    } catch {
      setError("Gagal menjalankan AI Review. Pastikan Gemini API key sudah dikonfigurasi.");
    } finally {
      setLoading(false);
    }
  }

  function generateExport() {
    const doc = buildDocument();
    const prompt = `# Instruksi untuk Antigravity Agent

## Konteks Proyek
${doc}

## Instruksi Eksekusi untuk Agent
Kamu adalah AI coding agent (Antigravity) yang akan membangun proyek ini.

**Tugas:**
1. Baca spesifikasi proyek di atas dengan seksama
2. Bangun sesuai tech stack: ${form.techStack}
3. Implementasikan semua fitur yang disebutkan
4. Gunakan desain yang modern, premium, dan responsif
5. Pastikan kode production-ready (tidak ada placeholder atau TODO)

**Catatan Penting:**
- Prioritaskan mobile-first design
- Gunakan komponen yang reusable
- Ikuti best practice SEO
- Output harus langsung bisa di-deploy

Mulai dengan membuat struktur project dan file utama. Konfirmasi pemahaman Anda sebelum memulai eksekusi.
`.trim();

    setExportDoc(prompt);
    setActiveTab("export");
  }

  const isFormValid = form.projectName.trim() && form.clientName.trim() && form.description.trim();

  return (
    <div>
      <div className="pt-2"></div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 bg-slate-100 p-1 rounded-xl w-fit">
        {([
          { id: "generator" as TabId, label: "Doc Generator", icon: "edit_document" },
          { id: "review" as TabId, label: "AI Review", icon: "rate_review" },
          { id: "export" as TabId, label: "Export to Antigravity", icon: "rocket_launch" },
        ] as const).map((tab) => (
          <button
            key={tab.id}
            id={`studio-tab-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "generator" && (
          <motion.div key="generator" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Form */}
              <AdminCard title="Detail Proyek">
                <div className="px-5 pb-5 space-y-4">
                  <Field label="Nama Proyek *">
                    <input id="field-project-name" value={form.projectName} onChange={(e) => update("projectName", e.target.value)} className={inputCls} placeholder="e.g. Website Company Profile Bintang Nusantara" />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Nama Klien *">
                      <input id="field-client-name" value={form.clientName} onChange={(e) => update("clientName", e.target.value)} className={inputCls} placeholder="Nama klien" />
                    </Field>
                    <Field label="Jenis Layanan">
                      <select id="field-service-type" value={form.serviceType} onChange={(e) => update("serviceType", e.target.value)} className={inputCls}>
                        {SERVICE_TYPES.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </Field>
                  </div>
                  <Field label="Deskripsi Proyek *">
                    <textarea id="field-description" value={form.description} onChange={(e) => update("description", e.target.value)} rows={3} className={inputCls} placeholder="Ceritakan kebutuhan dan tujuan proyek ini..." />
                  </Field>
                  <Field label="Daftar Fitur">
                    <textarea id="field-features" value={form.features} onChange={(e) => update("features", e.target.value)} rows={3} className={inputCls} placeholder="- Halaman beranda&#10;- Halaman tentang kami&#10;- Formulir kontak&#10;- ..." />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Tech Stack">
                      <select id="field-tech-stack" value={form.techStack} onChange={(e) => update("techStack", e.target.value)} className={inputCls}>
                        {TECH_STACKS.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </Field>
                    <Field label="Deadline">
                      <input id="field-deadline" type="date" value={form.deadline} onChange={(e) => update("deadline", e.target.value)} className={inputCls} />
                    </Field>
                  </div>
                  <Field label="Referensi Desain">
                    <input id="field-design-ref" value={form.designRef} onChange={(e) => update("designRef", e.target.value)} className={inputCls} placeholder="Link Figma, website referensi, dll." />
                  </Field>
                  <Field label="Budget">
                    <input id="field-budget" value={form.budget} onChange={(e) => update("budget", e.target.value)} className={inputCls} placeholder="e.g. Rp 3.000.000" />
                  </Field>
                  <Field label="Catatan Tambahan">
                    <textarea id="field-notes" value={form.notes} onChange={(e) => update("notes", e.target.value)} rows={2} className={inputCls} placeholder="Hal-hal khusus yang perlu diperhatikan..." />
                  </Field>

                  {error && <p className="text-xs text-rose-600">{error}</p>}

                  <div className="flex gap-2 pt-2">
                    <button
                      id="run-ai-review"
                      onClick={runAIReview}
                      disabled={!isFormValid || loading}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                      {loading ? <span className="material-symbols-outlined text-[16px] animate-spin">refresh</span> : <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>rate_review</span>}
                      AI Review
                    </button>
                    <button
                      id="export-to-antigravity"
                      onClick={generateExport}
                      disabled={!isFormValid}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>rocket_launch</span>
                      Export
                    </button>
                  </div>
                </div>
              </AdminCard>

              {/* Right: Preview */}
              <AdminCard title="Preview Dokumen">
                <div className="px-5 pb-5">
                  <pre className="text-xs text-slate-600 bg-slate-50 rounded-xl p-4 overflow-x-auto whitespace-pre-wrap leading-relaxed min-h-[300px]">
                    {isFormValid ? buildDocument() : <span className="text-slate-300">Isi form di sebelah kiri untuk melihat preview dokumen...</span>}
                  </pre>
                </div>
              </AdminCard>
            </div>
          </motion.div>
        )}

        {activeTab === "review" && (
          <motion.div key="review" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <AdminCard title="Hasil AI Review">
              <div className="p-5">
                {!reviewResult && !loading && (
                  <div className="text-center py-12">
                    <span className="material-symbols-outlined text-slate-300 text-[48px]">rate_review</span>
                    <p className="text-sm text-slate-400 mt-3">Isi form di tab Doc Generator, lalu klik tombol <span className="inline-flex items-center gap-1 font-medium text-indigo-500"><span className="material-symbols-outlined text-[14px]">auto_awesome</span> AI Review</span>.</p>
                    <button onClick={() => setActiveTab("generator")} className="mt-4 text-sm text-blue-600 hover:underline">← Kembali ke Generator</button>
                  </div>
                )}
                {loading && (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-sm text-indigo-600">
                      <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
                      Menganalisis dokumen spesifikasi...
                    </div>
                    {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-3 bg-slate-100 rounded animate-pulse" style={{ width: `${70 + i * 5}%` }} />)}
                  </div>
                )}
                {reviewResult && (
                  <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="prose prose-sm max-w-none text-slate-700">
                    <div className="whitespace-pre-wrap leading-relaxed">{reviewResult}</div>
                  </motion.div>
                )}
              </div>
            </AdminCard>
          </motion.div>
        )}

        {activeTab === "export" && (
          <motion.div key="export" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <AdminCard title="Export to Antigravity">
              <div className="p-5">
                {!exportDoc && (
                  <div className="text-center py-12">
                    <span className="material-symbols-outlined text-slate-300 text-[48px]">rocket_launch</span>
                    <p className="text-sm text-slate-400 mt-3">Isi form di tab Doc Generator, lalu klik tombol Export.</p>
                    <button onClick={() => setActiveTab("generator")} className="mt-4 text-sm text-blue-600 hover:underline">← Kembali ke Generator</button>
                  </div>
                )}
                {exportDoc && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                          <span className="material-symbols-outlined text-white text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>rocket_launch</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">Prompt siap untuk Antigravity</p>
                          <p className="text-xs text-slate-400">Copy dan paste ke agen Antigravity</p>
                        </div>
                      </div>
                      <button
                        id="copy-export"
                        onClick={() => navigator.clipboard.writeText(exportDoc)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[14px]">content_copy</span>
                        Copy
                      </button>
                    </div>
                    <pre className="text-xs text-slate-600 bg-slate-50 rounded-xl p-4 overflow-x-auto whitespace-pre-wrap leading-relaxed border border-slate-200">
                      {exportDoc}
                    </pre>
                  </div>
                )}
              </div>
            </AdminCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const inputCls = "w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-500 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
