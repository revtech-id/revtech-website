"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PageHeader, StatusBadge, EmptyState } from "@/components/admin/ui";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  status: "published" | "draft";
  category: string;
  publishedAt: string | null;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
}

// TODO: replace with API call — currently using static mock
const MOCK_POSTS: BlogPost[] = [
  {
    id: "1",
    title: "5 Alasan Bisnis Anda Butuh Website di 2026",
    slug: "alasan-bisnis-butuh-website-2026",
    status: "published",
    category: "Edukasi",
    publishedAt: "2026-07-10",
    metaTitle: "5 Alasan Bisnis Butuh Website di 2026 | RevTech",
    metaDescription: "Pelajari mengapa kehadiran online melalui website profesional krusial untuk pertumbuhan bisnis Anda di era digital 2026.",
    keywords: "website bisnis, pentingnya website, digital marketing",
  },
  {
    id: "2",
    title: "Panduan Memilih Tech Stack untuk Website UMKM",
    slug: "panduan-tech-stack-umkm",
    status: "draft",
    category: "Tutorial",
    publishedAt: null,
    metaTitle: "",
    metaDescription: "",
    keywords: "",
  },
];

const CATEGORIES = ["Edukasi", "Tutorial", "Tips & Trik", "Case Study", "Update"];

const inputCls = "w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-500 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function SEOPanel({ form, setForm, loading, onGenerate }: {
  form: { metaTitle: string; metaDescription: string; keywords: string };
  setForm: (f: { metaTitle: string; metaDescription: string; keywords: string }) => void;
  loading: boolean;
  onGenerate: () => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wide">SEO Settings</h4>
        <button
          id="generate-seo"
          onClick={onGenerate}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          {loading ? <span className="material-symbols-outlined text-[14px] animate-spin">refresh</span> : <span className="material-symbols-outlined text-[14px]">auto_awesome</span>}
          Generate SEO
        </button>
      </div>
      <Field label="Meta Title">
        <input id="seo-meta-title" value={form.metaTitle} onChange={(e) => setForm({ ...form, metaTitle: e.target.value })} className={inputCls} placeholder="Meta title untuk mesin pencari (50-60 karakter)" />
        <p className="text-[10px] text-slate-400 mt-1">{form.metaTitle.length}/60 karakter</p>
      </Field>
      <Field label="Meta Description">
        <textarea id="seo-meta-desc" value={form.metaDescription} onChange={(e) => setForm({ ...form, metaDescription: e.target.value })} rows={2} className={inputCls} placeholder="Deskripsi singkat untuk mesin pencari (150-160 karakter)" />
        <p className="text-[10px] text-slate-400 mt-1">{form.metaDescription.length}/160 karakter</p>
      </Field>
      <Field label="Keywords">
        <input id="seo-keywords" value={form.keywords} onChange={(e) => setForm({ ...form, keywords: e.target.value })} className={inputCls} placeholder="kata kunci 1, kata kunci 2, kata kunci 3" />
      </Field>
    </div>
  );
}

export default function BlogPage() {
  const [isClient, setIsClientState] = useState(false);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [view, setView] = useState<"list" | "editor">("list");
  const [editPost, setEditPost] = useState<BlogPost | null>(null);
  const [seoLoading, setSeoLoading] = useState(false);
  const [seoForm, setSeoForm] = useState({ metaTitle: "", metaDescription: "", keywords: "" });
  const [contentForm, setContentForm] = useState({ title: "", category: "Edukasi", content: "" });

  useEffect(() => {
    setIsClientState(true);
    const saved = localStorage.getItem("revtech_blog");
    setPosts(saved ? JSON.parse(saved) : MOCK_POSTS);
    if (!saved) localStorage.setItem("revtech_blog", JSON.stringify(MOCK_POSTS));
  }, []);

  function savePosts(updated: BlogPost[]) {
    setPosts(updated);
    localStorage.setItem("revtech_blog", JSON.stringify(updated));
  }

  function deletePost(id: string) {
    savePosts(posts.filter(p => p.id !== id));
  }

  function openNew() {
    setEditPost(null);
    setContentForm({ title: "", category: "Edukasi", content: "" });
    setSeoForm({ metaTitle: "", metaDescription: "", keywords: "" });
    setView("editor");
  }

  function openEdit(post: BlogPost) {
    setEditPost(post);
    setContentForm({ title: post.title, category: post.category, content: "" });
    setSeoForm({ metaTitle: post.metaTitle, metaDescription: post.metaDescription, keywords: post.keywords });
    setView("editor");
  }

  async function generateSEO() {
    if (!contentForm.title.trim()) return;
    setSeoLoading(true);
    try {
      const res = await fetch("/api/admin/seo-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: contentForm.title, category: contentForm.category, content: contentForm.content }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json() as { metaTitle: string; metaDescription: string; keywords: string };
      setSeoForm(data);
    } catch {
      // TODO: show error toast
    } finally {
      setSeoLoading(false);
    }
  }

  function savePost(asDraft: boolean) {
    const newPost: BlogPost = {
      id: editPost?.id ?? String(Date.now()),
      title: contentForm.title,
      slug: contentForm.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
      status: asDraft ? "draft" : "published",
      category: contentForm.category,
      publishedAt: asDraft ? null : new Date().toISOString().split("T")[0],
      ...seoForm,
    };
    savePosts(editPost ? posts.map(p => p.id === editPost.id ? newPost : p) : [...posts, newPost]);
    setView("list");
  }

  const published = posts.filter((p) => p.status === "published");
  const drafts = posts.filter((p) => p.status === "draft");

  return (
    <div>
      <div className="flex justify-end mb-4 mt-2">
        {view === "list" ? (
          <button id="new-post" onClick={openNew} className="inline-flex shrink-0 items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:scale-95 transition-all shadow-sm">
            <span className="material-symbols-outlined text-[16px]">add</span>
            Artikel Baru
          </button>
        ) : (
          <button id="back-to-list" onClick={() => setView("list")} className="inline-flex shrink-0 items-center justify-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 active:scale-95 transition-all shadow-sm">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Kembali
          </button>
        )}
      </div>
      {view === "list" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {[
              { label: "Published", value: published.length, icon: "check_circle", iconBg: "bg-emerald-50", iconColor: "text-emerald-600" },
              { label: "Draft", value: drafts.length, icon: "edit_note", iconBg: "bg-amber-50", iconColor: "text-amber-600" },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.iconBg}`}>
                  <span className={`material-symbols-outlined text-[20px] ${s.iconColor}`} style={{ fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
                </div>
                <div>
                  <p className="text-xs text-slate-500">{s.label}</p>
                  <p className="text-xl font-bold text-slate-900">{s.value}</p>
                </div>
              </div>
            ))}
          </div>

          {posts.length === 0 ? (
            <EmptyState icon="article" title="Belum ada artikel" description="Buat artikel pertama Anda untuk mulai membangun konten pemasaran." action={<button onClick={openNew} className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold">Buat Artikel</button>} />
          ) : (
            <div className="space-y-3">
              {posts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => openEdit(post)}
                  className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer flex items-center gap-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-slate-400 text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>article</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{post.title}</p>
                    <p className="text-xs text-slate-400">{post.category} · {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("id-ID") : "Draft"}</p>
                  </div>
                  <StatusBadge label={post.status === "published" ? "Published" : "Draft"} variant={post.status === "published" ? "emerald" : "amber"} />
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {view === "editor" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Main editor */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
              <Field label="Judul Artikel *">
                <input id="post-title" value={contentForm.title} onChange={(e) => setContentForm({ ...contentForm, title: e.target.value })} className={inputCls} placeholder="Judul artikel yang menarik..." />
              </Field>
              <Field label="Kategori">
                <select id="post-category" value={contentForm.category} onChange={(e) => setContentForm({ ...contentForm, category: e.target.value })} className={inputCls}>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Konten (Markdown)">
                <textarea
                  id="post-content"
                  value={contentForm.content}
                  onChange={(e) => setContentForm({ ...contentForm, content: e.target.value })}
                  rows={12}
                  className={inputCls + " font-mono"}
                  placeholder="Tulis konten artikel dalam format Markdown..."
                />
              </Field>
            </div>
          </div>

          {/* Sidebar: SEO + Actions */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
              <SEOPanel form={seoForm} setForm={setSeoForm} loading={seoLoading} onGenerate={generateSEO} />
            </div>
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-2">
              <button
                id="publish-post"
                onClick={() => savePost(false)}
                disabled={!contentForm.title.trim()}
                className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                Publish
              </button>
              <button
                id="save-draft"
                onClick={() => savePost(true)}
                disabled={!contentForm.title.trim()}
                className="w-full py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Simpan sebagai Draft
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
