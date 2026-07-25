"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PageHeader, StatusBadge, EmptyState } from "@/components/admin/ui";

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

// TODO: replace with API call
const MOCK_PORTFOLIO: Portfolio[] = [
  {
    id: "1",
    title: "Website Toko Online Maju Jaya",
    client: "Toko Maju Jaya",
    category: "E-Commerce",
    thumbnail: "",
    url: "https://majujaya.com",
    techStack: ["Next.js", "Tailwind CSS", "Stripe"],
    featured: true,
    publishedAt: "2026-04-15",
  },
  {
    id: "2",
    title: "Company Profile Bintang Nusantara",
    client: "CV Bintang Nusantara",
    category: "Company Profile",
    thumbnail: "",
    url: "https://bintangnusantara.co.id",
    techStack: ["Next.js", "Framer Motion"],
    featured: false,
    publishedAt: "2026-06-01",
  },
  {
    id: "3",
    title: "Menu Digital QR Rumah Makan Sederhana",
    client: "Rumah Makan Sederhana",
    category: "Menu Digital",
    thumbnail: "",
    url: "https://rmsederhana.id",
    techStack: ["HTML", "CSS", "JS"],
    featured: true,
    publishedAt: "2026-06-30",
  },
];

const CATEGORIES = ["Semua", "Company Profile", "E-Commerce", "Landing Page", "Menu Digital", "Sistem Custom"];

export default function PortofolioPage() {
  const [filter, setFilter] = useState("Semua");
  const [items] = useState<Portfolio[]>(MOCK_PORTFOLIO);

  const filtered = filter === "Semua" ? items : items.filter((p) => p.category === filter);
  const featured = items.filter((p) => p.featured).length;

  return (
    <div>
      <PageHeader
        title="Portofolio"
        description="Showcase studi kasus & proyek terbaik RevTech"
        icon="collections"
        action={
          <button id="add-portfolio" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors">
            <span className="material-symbols-outlined text-[16px]">add</span>
            Tambah Proyek
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Proyek", value: items.length, icon: "collections", iconBg: "bg-blue-50", iconColor: "text-blue-600" },
          { label: "Featured", value: featured, icon: "star", iconBg: "bg-amber-50", iconColor: "text-amber-600" },
          { label: "Kategori", value: new Set(items.map((i) => i.category)).size, icon: "category", iconBg: "bg-indigo-50", iconColor: "text-indigo-600" },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0, transition: { delay: i * 0.07 } }}
            className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex items-center gap-3"
          >
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
        {CATEGORIES.map((cat) => (
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
              className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden hover-card"
            >
              {/* Thumbnail placeholder */}
              <div className="h-36 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center relative">
                <span className="material-symbols-outlined text-blue-200 text-[56px]">web</span>
                {item.featured && (
                  <div className="absolute top-3 right-3">
                    <StatusBadge label="Featured" variant="amber" />
                  </div>
                )}
              </div>
              <div className="p-4 space-y-2">
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{item.title}</p>
                  <p className="text-xs text-slate-400">{item.client}</p>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <StatusBadge label={item.category} variant="indigo" />
                  {item.techStack.slice(0, 2).map((t) => (
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
                    <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors">
                      <span className="material-symbols-outlined text-[16px]">edit</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
