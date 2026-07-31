"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StatusBadge, EmptyState } from "@/components/admin/ui";

interface Portfolio {
  id: string;
  title: string;
  client: string;
  category: string;
  thumbnail: string;
  url: string | null;
  techStack: string[];
  featured: boolean;
  publishedAt: string;
}

const MOCK_INITIAL: Portfolio[] = [
  { id: "1", title: "Website Toko Online Maju Jaya", client: "Toko Maju Jaya", category: "E-Commerce", thumbnail: "", url: "https://majujaya.com", techStack: ["Next.js", "Tailwind CSS", "Stripe"], featured: true, publishedAt: "2026-04-15" },
  { id: "2", title: "Company Profile Bintang Nusantara", client: "CV Bintang Nusantara", category: "Company Profile", thumbnail: "", url: "https://bintangnusantara.co.id", techStack: ["Next.js", "Framer Motion"], featured: false, publishedAt: "2026-06-01" },
  { id: "3", title: "Menu Digital QR Rumah Makan Sederhana", client: "Rumah Makan Sederhana", category: "Menu Digital", thumbnail: "", url: "https://rmsederhana.id", techStack: ["HTML", "CSS", "JS"], featured: true, publishedAt: "2026-06-30" },
];

const CATEGORIES = ["Semua", "Company Profile", "E-Commerce", "Landing Page", "Menu Digital", "Sistem Custom"];

const EMPTY_FORM = {
  title: "", client: "", category: "Company Profile",
  url: "", techStack: "", featured: false
};

export default function PortofolioPage() {
  const [isClient, setIsClient] = useState(false);
  const [items, setItems] = useState<Portfolio[]>([]);
  const [filter, setFilter] = useState("Semua");
  const [view, setView] = useState<"list" | "form">("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem("revtech_portfolio");
    setItems(saved ? JSON.parse(saved) : MOCK_INITIAL);
    if (!saved) localStorage.setItem("revtech_portfolio", JSON.stringify(MOCK_INITIAL));
  }, []);

  function save(updated: Portfolio[]) {
    setItems(updated);
    localStorage.setItem("revtech_portfolio", JSON.stringify(updated));
  }

  function handleEdit(item: Portfolio) {
    setForm({
      title: item.title, client: item.client, category: item.category,
      url: item.url || "", techStack: item.techStack.join(", "),
      featured: item.featured
    });
    setEditingId(item.id);
    setView("form");
  }

  function handleDelete(id: string) {
    save(items.filter(i => i.id !== id));
    setDeletingId(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const techArr = form.techStack.split(",").map(s => s.trim()).filter(Boolean);
    let updated = [...items];
    if (editingId) {
      updated = items.map(i => i.id === editingId ? {
        ...i, title: form.title, client: form.client, category: form.category,
        url: form.url || null, techStack: techArr, featured: form.featured
      } : i);
    } else {
      updated = [{
        id: `PF-${Date.now().toString().slice(-5)}`,
        title: form.title, client: form.client, category: form.category,
        url: form.url || null, techStack: techArr, featured: form.featured,
        thumbnail: "", publishedAt: new Date().toISOString().split("T")[0]
      }, ...items];
    }
    save(updated);
    setView("list");
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  function toggleFeatured(id: string) {
    save(items.map(i => i.id === id ? { ...i, featured: !i.featured } : i));
  }

  const filtered = filter === "Semua" ? items : items.filter(p => p.category === filter);
  const featured = items.filter(p => p.featured).length;

  if (!isClient) return null;

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-5 mt-2">
        {view === "form" ? (
          <button onClick={() => setView("list")} className="inline-flex items-center gap-2 px-1 py-2 text-sm font-medium text-slate-600">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Kembali
          </button>
        ) : <div />}
        {view === "list" && (
          <button
            id="add-portfolio"
            onClick={() => { setEditingId(null); setForm(EMPTY_FORM); setView("form"); }}
            className="inline-flex shrink-0 items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:scale-95 transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            Tambah Proyek
          </button>
        )}
      </div>

      {view === "list" && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: "Total Proyek", value: items.length, icon: "collections", iconBg: "bg-blue-50", iconColor: "text-blue-600" },
              { label: "Featured", value: featured, icon: "star", iconBg: "bg-amber-50", iconColor: "text-amber-600" },
              { label: "Kategori", value: new Set(items.map(i => i.category)).size, icon: "category", iconBg: "bg-indigo-50", iconColor: "text-indigo-600" },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: i * 0.07 } }} className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.iconBg}`}>
                  <span className={`material-symbols-outlined text-[20px] ${s.iconColor}`} style={{ fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
                </div>
                <div>
                  <p className="text-xs text-slate-500">{s.label}</p>
                  <p className="text-xl font-bold text-slate-900">{s.value}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Category filter */}
          <div className="flex items-center gap-1.5 mb-5 flex-wrap">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                id={`filter-portfolio-${cat.toLowerCase().replace(/\s+/g, "-")}`}
                onClick={() => setFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filter === cat ? "bg-blue-600 text-white" : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <EmptyState icon="collections" title="Belum ada proyek" description="Tambahkan proyek pertama Anda ke portofolio." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: i * 0.07, type: "spring", stiffness: 300, damping: 24 } }}
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden group hover:shadow-md hover:border-blue-200 transition-all"
                >
                  {/* Thumbnail */}
                  <div className="h-36 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center relative">
                    <span className="material-symbols-outlined text-blue-200 text-[56px]">web</span>
                    {item.featured && (
                      <div className="absolute top-3 right-3">
                        <StatusBadge label="Featured" variant="amber" />
                      </div>
                    )}
                    {/* Hover overlay actions */}
                    <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button onClick={() => handleEdit(item)} className="px-3 py-1.5 rounded-lg bg-white text-slate-800 text-xs font-bold hover:bg-blue-50">
                        Edit
                      </button>
                      <button onClick={() => toggleFeatured(item.id)} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${item.featured ? "bg-amber-400 text-white" : "bg-white text-slate-700"}`}>
                        {item.featured ? "★ Featured" : "☆ Feature"}
                      </button>
                    </div>
                  </div>
                  <div className="p-4 space-y-2">
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{item.title}</p>
                      <p className="text-xs text-slate-400">{item.client}</p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <StatusBadge label={item.category} variant="indigo" />
                      {item.techStack.slice(0, 2).map(t => (
                        <span key={t} className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{t}</span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-slate-400">{new Date(item.publishedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</span>
                      <div className="flex items-center gap-1">
                        {item.url && (
                          <a href={item.url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors">
                            <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                          </a>
                        )}
                        {deletingId === item.id ? (
                          <>
                            <button onClick={() => handleDelete(item.id)} className="px-2 py-1 text-[10px] font-bold bg-red-600 text-white rounded-lg">Hapus</button>
                            <button onClick={() => setDeletingId(null)} className="px-2 py-1 text-[10px] bg-slate-100 rounded-lg">Batal</button>
                          </>
                        ) : (
                          <button onClick={() => setDeletingId(item.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Form */}
      {view === "form" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-slate-800 mb-6">{editingId ? "Edit Proyek" : "Tambah Proyek Baru"}</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Judul Proyek *</label>
                <input required type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="Website Company Profile PT. Maju Jaya" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Nama Klien *</label>
                  <input required type="text" value={form.client} onChange={e => setForm({ ...form, client: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="PT. Maju Jaya" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Kategori *</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                    {CATEGORIES.filter(c => c !== "Semua").map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1.5 block">URL Live Website</label>
                <input type="url" value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="https://majujaya.com" />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Tech Stack (pisahkan dengan koma)</label>
                <input type="text" value={form.techStack} onChange={e => setForm({ ...form, techStack: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="Next.js, Tailwind CSS, Framer Motion" />
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} className="w-4 h-4 rounded" />
                <span className="text-sm font-medium text-slate-700">Tampilkan sebagai Featured di halaman portofolio publik</span>
              </label>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setView("list")} className="px-5 py-2.5 rounded-xl font-semibold text-slate-500 hover:bg-slate-100 transition-colors text-sm">Batal</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm text-sm">{editingId ? "Simpan Perubahan" : "Tambah Proyek"}</button>
              </div>
            </form>
          </div>
        </motion.div>
      )}
    </div>
  );
}
