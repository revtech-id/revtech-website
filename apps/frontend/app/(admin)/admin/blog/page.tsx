"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import { PageHeader, StatusBadge, EmptyState, AdminToolbar, AdminTabs, AdminConfirmModal, AdminToast, AdminTable, AdminButton, SEOPanel, Field } from "@/components/admin/ui";
import { ExternalLink, Pencil, Archive, Trash2, Send, SlidersHorizontal, Image as ImageIcon, UploadCloud, X, Eye, ArrowLeft, Pin } from "lucide-react";
import { logActivity } from "@/lib/activityLog";
import { useUser } from "@/contexts/UserContext";

import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { 
  ssr: false, 
  loading: () => <div className="h-[450px] w-full flex items-center justify-center bg-[var(--adm-bg)] text-[var(--adm-text-3)] animate-pulse rounded-xl">Memuat Editor...</div> 
});

const QUILL_MODULES = {
  toolbar: [
    [{ 'header': [2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['link', 'image'],
    ['clean']
  ],
  keyboard: {
    bindings: {
      'list autofill': {
        key: ' ',
        handler: () => true
      },
      divider: {
        key: 'Enter',
        collapsed: true,
        prefix: /^---$/,
        handler: function(range: any, context: any) {
          // @ts-ignore
          this.quill.deleteText(range.index - 3, 3);
          // @ts-ignore
          this.quill.insertEmbed(range.index - 3, 'divider', true, 'user');
          // @ts-ignore
          this.quill.setSelection(range.index - 2, 'user');
          return false;
        }
      },
      h2: {
        key: ' ',
        collapsed: true,
        prefix: /^##$/,
        handler: function(range: any, context: any) {
          // @ts-ignore
          this.quill.deleteText(range.index - 2, 2);
          // @ts-ignore
          this.quill.formatLine(range.index - 2, 1, 'header', 2);
          return false;
        }
      },
      h3: {
        key: ' ',
        collapsed: true,
        prefix: /^###$/,
        handler: function(range: any, context: any) {
          // @ts-ignore
          this.quill.deleteText(range.index - 3, 3);
          // @ts-ignore
          this.quill.formatLine(range.index - 3, 1, 'header', 3);
          return false;
        }
      },
      blockquote: {
        key: ' ',
        collapsed: true,
        prefix: /^>$/,
        handler: function(range: any, context: any) {
          // @ts-ignore
          this.quill.deleteText(range.index - 1, 1);
          // @ts-ignore
          this.quill.formatLine(range.index - 1, 1, 'blockquote', true);
          return false;
        }
      },
      bulletListDash: {
        key: ' ',
        collapsed: true,
        prefix: /^-$/,
        handler: function(range: any, context: any) {
          // @ts-ignore
          this.quill.deleteText(range.index - 1, 1);
          // @ts-ignore
          this.quill.formatLine(range.index - 1, 1, 'list', 'bullet');
          return false;
        }
      }
    }
  }
};

import { db } from "@/lib/firebase";
import { collection, doc, onSnapshot, setDoc, deleteDoc, getDocs, updateDoc, writeBatch } from "firebase/firestore";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  status: "published" | "draft" | "archived";
  coverImage: string;
  publishedAt: string | null;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  pinned?: boolean;
  content?: string;
}

// TODO: replace with API call — currently using static mock for initial seed
const MOCK_POSTS: BlogPost[] = [
  {
    id: "1",
    title: "5 Alasan Bisnis Anda Butuh Website di 2026",
    slug: "alasan-bisnis-butuh-website-2026",
    status: "published",
    coverImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop",
    publishedAt: "2026-01-15T09:00:00Z",
    metaTitle: "5 Alasan Utama Bisnis Anda Membutuhkan Website di Tahun 2026 | RevTech",
    metaDescription: "Pelajari mengapa kehadiran online melalui website profesional krusial untuk pertumbuhan bisnis Anda di era digital 2026.",
    keywords: "website bisnis, pentingnya website, digital marketing",
    pinned: true,
    content: "<h2>Pentingnya Website di 2026</h2><p>Di era ini, website bukan lagi opsional, melainkan fondasi bisnis.</p>",
  },
  {
    id: "2",
    title: "Panduan Memilih Tech Stack untuk Website UMKM",
    slug: "katalog-digital-whatsapp",
    status: "draft",
    coverImage: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1974&auto=format&fit=crop",
    publishedAt: null,
    metaTitle: "Cara Membuat Katalog Digital WhatsApp untuk Pemula",
    metaDescription: "",
    keywords: "",
    pinned: false,
    content: "<p>Memilih tech stack yang tepat dapat menghemat biaya server dan mempermudah scaling UMKM Anda.</p>",
  },
];



export default function BlogPage() {
  const { user } = useUser();
  const canDelete = user?.role === "Superadmin" || user?.role === "Project Manager";

  const [isClient, setIsClientState] = useState(false);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"list" | "editor">("list");
  const [editPost, setEditPost] = useState<BlogPost | null>(null);
  const [toast, setToast] = useState<{ isVisible: boolean; message: string; type: "success" | "error" }>({ isVisible: false, message: "", type: "success" });
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; action: () => void; title: string; message: string; confirmText: string; confirmVariant: "danger" | "primary" | "warning" }>({ isOpen: false, action: () => {}, title: "", message: "", confirmText: "", confirmVariant: "danger" });
  const [seoLoading, setSeoLoading] = useState(false);
  const [seoForm, setSeoForm] = useState({ metaTitle: "", metaDescription: "", keywords: "" });
  const [contentForm, setContentForm] = useState({ title: "", coverImage: "", content: "", pinned: false, publishedAt: "" });
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setContentForm(prev => ({ ...prev, coverImage: reader.result as string }));
      setToast({ isVisible: true, message: "Gambar berhasil diunggah", type: "success" });
    };
    reader.readAsDataURL(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 1,
  });

  useEffect(() => {
    setIsClientState(true);
    
    // Subscribe to Firestore
    const unsub = onSnapshot(collection(db, "blog_posts"), async (snapshot) => {
        const loadedPosts = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        })) as BlogPost[];
        setPosts(loadedPosts);
    });

    // Register Divider Blot dynamically for ReactQuill
    import("react-quill-new").then((mod) => {
      const Quill = mod.default.Quill;
      if (Quill && !Quill.imports['formats/divider']) {
        const BlockEmbed: any = Quill.import('blots/block/embed');
        class DividerBlot extends BlockEmbed {
          static blotName = 'divider';
          static tagName = 'hr';
        }
        Quill.register(DividerBlot as any);
      }
    });
    
    return () => unsub();
  }, []);

  async function togglePin(id: string) {
    const post = posts.find(p => p.id === id);
    if (!post) return;
    
    try {
      await updateDoc(doc(db, "blog_posts", id), { pinned: !post.pinned });
      logActivity({ type: "blog_updated", title: !post.pinned ? "Artikel Disematkan" : "Pin Artikel Dilepas", description: `Status pin diperbarui untuk artikel ${post.title}.`, user: "Admin" });
    } catch (err) {
      console.error(err);
      setToast({ isVisible: true, message: "Gagal menyematkan artikel", type: "error" });
    }
  }

  function confirmDelete(post: BlogPost) {
    setConfirmModal({
      isOpen: true,
      title: "Hapus Artikel",
      message: "Artikel ini akan dihapus secara permanen dan tidak dapat dikembalikan.",
      confirmText: "Hapus",
      confirmVariant: "danger",
      action: async () => {
        try {
          await deleteDoc(doc(db, "blog_posts", post.id));
          setToast({ isVisible: true, message: "Artikel berhasil dihapus", type: "success" });
          logActivity({ type: "blog_deleted", title: "Artikel Dihapus", description: `Artikel blog dengan ID ${post.id} dihapus.`, user: "Admin" });
          setView("list");
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        } catch (err) {
          console.error(err);
          setToast({ isVisible: true, message: "Gagal menghapus artikel", type: "error" });
        }
      }
    });
  }

  async function confirmArchive(id: string, currentStatus: string) {
    const isArchived = currentStatus === "archived";
    try {
      await updateDoc(doc(db, "blog_posts", id), { status: isArchived ? "draft" : "archived" });
      setToast({ isVisible: true, message: isArchived ? "Artikel dikembalikan ke Draft" : "Artikel berhasil diarsipkan", type: "success" });
      logActivity({ type: "blog_updated", title: isArchived ? "Artikel Dipulihkan" : "Artikel Diarsipkan", description: `Artikel blog ID ${id} ${isArchived ? "dikembalikan ke draft" : "diarsipkan"}.`, user: "Admin" });
    } catch (err) {
      console.error(err);
      setToast({ isVisible: true, message: "Gagal mengubah status artikel", type: "error" });
    }
  }

  async function confirmPublish(id: string) {
    try {
      await updateDoc(doc(db, "blog_posts", id), { status: "published", publishedAt: new Date().toISOString() });
      setToast({ isVisible: true, message: "Artikel berhasil diterbitkan", type: "success" });
      logActivity({ type: "blog_updated", title: "Artikel Diterbitkan", description: `Artikel blog ID ${id} dipublish.`, user: "Admin" });
    } catch (err) {
      console.error(err);
      setToast({ isVisible: true, message: "Gagal menerbitkan artikel", type: "error" });
    }
  }

  function openNew() {
    setEditPost(null);
    setContentForm({ title: "", coverImage: "", content: "", pinned: false, publishedAt: "" });
    setSeoForm({ metaTitle: "", metaDescription: "", keywords: "" });
    setView("editor");
  }

  function handleEdit(post: BlogPost) {
    setSeoForm({ metaTitle: post.metaTitle || "", metaDescription: post.metaDescription || "", keywords: post.keywords || "" });
    setContentForm({ 
      title: post.title || "", 
      coverImage: post.coverImage || "", 
      content: post.content || "", 
      pinned: post.pinned || false,
      publishedAt: post.publishedAt ? new Date(post.publishedAt).toISOString().split('T')[0] : ""
    });
    setEditPost(post);
    setView("editor");
  }

  async function generateSEO() {
    if (!contentForm.title.trim()) return;
    setSeoLoading(true);
    try {
      const res = await fetch("/api/admin/seo-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: contentForm.title, coverImage: contentForm.coverImage, content: contentForm.content, metaTitle: seoForm.metaTitle }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json() as { metaTitle: string; metaDescription: string; keywords: string };
      setSeoForm(data);
      setToast({ isVisible: true, message: "SEO berhasil di-generate", type: "success" });
    } catch {
      setToast({ isVisible: true, message: "Gagal men-generate SEO", type: "error" });
    } finally {
      setSeoLoading(false);
    }
  }

  async function savePost(asDraft: boolean) {
    let slug = editPost?.slug || '';
    
    try {
      if (editPost) {
        const updated: BlogPost = {
          ...editPost,
          title: contentForm.title,
          coverImage: contentForm.coverImage,
          content: contentForm.content,
          status: asDraft ? "draft" : "published",
          metaTitle: seoForm.metaTitle,
          metaDescription: seoForm.metaDescription,
          keywords: seoForm.keywords,
          pinned: contentForm.pinned,
          publishedAt: asDraft ? (editPost.publishedAt || null) : (editPost.publishedAt || new Date().toISOString()),
        };
        await setDoc(doc(db, "blog_posts", editPost.id), updated, { merge: true });
      } else {
        const newId = `post_${Date.now()}`;
        slug = contentForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        const newPost: BlogPost = {
          id: newId,
          title: contentForm.title,
          slug,
          status: asDraft ? "draft" : "published",
          coverImage: contentForm.coverImage,
          content: contentForm.content,
          publishedAt: asDraft ? null : new Date().toISOString(),
          metaTitle: seoForm.metaTitle,
          metaDescription: seoForm.metaDescription,
          keywords: seoForm.keywords,
          pinned: contentForm.pinned,
        };
        await setDoc(doc(db, "blog_posts", newId), newPost);
      }

      setView("list");
      setToast({ isVisible: true, message: asDraft ? "Draft berhasil disimpan" : "Artikel berhasil dipublish", type: "success" });
      logActivity({ 
        type: "blog_updated", 
        title: asDraft ? "Draft Artikel Disimpan" : (editPost ? "Artikel Diperbarui" : "Artikel Baru Diterbitkan"), 
        description: `Artikel "${contentForm.title}" ${asDraft ? "disimpan sebagai draft" : "dipublish"}.`, 
        user: "Admin" 
      });
    } catch (err) {
      console.error(err);
      setToast({ isVisible: true, message: "Gagal menyimpan artikel", type: "error" });
    }
  }

  const published = posts.filter((p) => p.status === "published");
  const drafts = posts.filter((p) => p.status === "draft");
  const archived = posts.filter((p) => p.status === "archived");
  const pinnedCount = posts.filter((p) => p.pinned).length;

  const TABS = [
    { id: "all", label: "Semua", count: posts.length },
    { id: "pinned", label: "Disematkan", count: pinnedCount },
    { id: "draft", label: "Draft", count: drafts.length },
    { id: "archived", label: "Arsip", count: archived.length },
    { id: "published", label: "Published", count: published.length },
  ];

  const filteredPosts = posts.filter(p => {
    const matchStatus = filter === "all" ? true : filter === "pinned" ? p.pinned : p.status === filter;
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return sortBy === "newest" ? dateB - dateA : dateA - dateB;
  });

  const blogColumns = [
    {
      key: "artikel",
      label: "Artikel",
      render: (post: BlogPost) => (
        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0 pr-4">
          <button onClick={() => togglePin(post.id)} className={`shrink-0 p-1.5 transition-colors focus:outline-none ${post.pinned ? "text-[var(--adm-text)]" : "text-[var(--adm-text-3)] hover:text-[var(--adm-text)]"}`} title={post.pinned ? "Lepaskan Pin" : "Sematkan Artikel"}>
            <Pin size={14} strokeWidth={2} className={post.pinned ? "fill-current rotate-45" : ""} />
          </button>
          <div className="w-16 h-12 rounded-lg bg-[var(--adm-border)] flex items-center justify-center shrink-0 relative overflow-hidden">
            {post.coverImage ? (
              <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
            ) : (
              <span className="material-symbols-outlined text-[var(--adm-text-3)] text-[24px]">article</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <p className={`font-bold text-sm truncate ${post.status === "draft" ? "text-[var(--adm-text-3)]" : "text-[var(--adm-text)]"}`}>{post.title}</p>
              {post.status === "archived" && <StatusBadge label="Archived" variant="slate" />}
            </div>
            <p className="text-xs text-[var(--adm-text-3)] truncate">
              {post.slug}
            </p>
          </div>
        </div>
      )
    },
    {
      key: "aksi",
      label: "Aksi",
      className: "text-right",
      render: (post: BlogPost) => (
        <div className="flex items-center justify-end gap-3 sm:gap-5 shrink-0">
          {post.status !== "draft" && post.publishedAt && (
            <div className="hidden md:block text-xs font-medium text-[var(--adm-text-3)]">
              {new Date(post.publishedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
            </div>
          )}
          <div className="flex items-center justify-end gap-1.5 w-auto sm:w-auto shrink-0">
            <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center p-1.5 text-[var(--adm-text-3)] hover:text-[var(--adm-text)] transition-colors focus:outline-none" title="Buka Artikel">
              <ExternalLink size={14} strokeWidth={2} />
            </a>
            {post.status !== "published" && (
              <button onClick={() => confirmPublish(post.id)} className="inline-flex items-center justify-center p-1.5 text-[var(--adm-text-3)] hover:text-[var(--adm-text)] transition-colors focus:outline-none" title="Publish">
                <Send size={14} strokeWidth={2} />
              </button>
            )}
            <button onClick={() => handleEdit(post)} className="inline-flex items-center justify-center p-1.5 text-[var(--adm-text-3)] hover:text-[var(--adm-text)] transition-colors focus:outline-none" title="Edit">
              <Pencil size={14} strokeWidth={2} />
            </button>
            <button onClick={() => confirmArchive(post.id, post.status)} className="inline-flex items-center justify-center p-1.5 text-[var(--adm-text-3)] hover:text-[var(--adm-text)] transition-colors focus:outline-none" title={post.status === "archived" ? "Kembalikan dari Arsip" : "Arsip"}>
              <Archive size={14} strokeWidth={2} className={post.status === "archived" ? "text-amber-500" : ""} />
            </button>
            {canDelete && (
              <button onClick={() => confirmDelete(post)} className="inline-flex items-center justify-center p-1.5 text-[var(--adm-text-3)] hover:text-red-500 transition-colors focus:outline-none" title="Hapus">
                <Trash2 size={14} strokeWidth={2} />
              </button>
            )}
          </div>
        </div>
      )
    }
  ];

  return (
    <div>
      <AdminToolbar
        view={view === "editor" ? "form" : "list"}
        onBack={() => setView("list")}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari judul artikel..."
        onAdd={openNew}
        addLabel="Artikel Baru"
      />
      {view === "list" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          {/* Tabs & Actions Row */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-4 sm:gap-0">
            {/* Tabs Status */}
            <AdminTabs tabs={TABS} activeTab={filter} onTabChange={setFilter} />

            {/* Actions (Sort) */}
            <div className="flex items-center pb-2.5 shrink-0 self-start sm:self-auto px-1 sm:px-0">
              <div className="relative flex items-center justify-center shrink-0 group">
                <button className="text-[var(--adm-text-3)] group-hover:text-[var(--adm-text)] transition-colors focus:outline-none">
                  <SlidersHorizontal size={18} strokeWidth={2.5} />
                </button>
                <select
                  dir="rtl"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  title="Urutkan"
                >
                  <option value="newest" className="bg-[var(--adm-card)] text-[var(--adm-text)]" dir="ltr">Terbaru</option>
                  <option value="oldest" className="bg-[var(--adm-card)] text-[var(--adm-text)]" dir="ltr">Terlama</option>
                </select>
              </div>
            </div>
          </div>

          {sortedPosts.length === 0 ? (
            <EmptyState icon="article" title="Belum ada artikel" description="Buat artikel pertama Anda atau coba kata kunci lain." />
          ) : (
            <div className="mt-4">
              <AdminTable
                columns={blogColumns}
                data={sortedPosts}
                keyField="id"
                emptyMessage="Belum ada artikel ditambahkan."
              />
            </div>
          )}
        </motion.div>
      )}

      {view === "editor" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Editor Header Toolbar */}
          <div className="flex items-center justify-end gap-3">
            <button
              id="save-draft"
              onClick={() => savePost(true)}
              disabled={!contentForm.title.trim()}
              className="px-4 py-2.5 text-sm font-bold text-[var(--adm-text-2)] hover:text-[var(--adm-text)] transition-colors disabled:opacity-50"
            >
              Simpan Draft
            </button>
            <button
              id="publish-post"
              onClick={() => savePost(false)}
              disabled={!contentForm.title.trim()}
              className="px-5 py-2.5 rounded-xl bg-[var(--adm-accent)] text-white text-sm font-bold hover:brightness-110 transition-all disabled:opacity-50 flex items-center gap-2 shadow-sm"
            >
              <Send size={16} strokeWidth={2.5} /> Publish
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Editor Canvas */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              <div className="bg-[var(--adm-card)] rounded-2xl border border-[var(--adm-border)] shadow-sm flex flex-col overflow-hidden">
                {/* Title Section */}
                <div className="px-5 pt-5 pb-4 border-b border-[var(--adm-border)]">
                  <h2 className="text-lg font-bold text-[var(--adm-text)] mb-4">{editPost ? "Edit Artikel" : "Tulis Artikel Baru"}</h2>
                  <label className="text-xs font-bold text-[var(--adm-text-2)] mb-1.5 block">Judul Artikel *</label>
                  <input 
                    id="post-title" 
                    required
                    type="text"
                    value={contentForm.title} 
                    onChange={(e) => setContentForm({ ...contentForm, title: e.target.value })} 
                    className="w-full px-3 py-2.5 rounded-xl border border-[var(--adm-border)] bg-transparent text-[var(--adm-text)] placeholder:text-[var(--adm-text-3)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--adm-accent)]/20 focus:border-[var(--adm-accent)]" 
                    placeholder="Masukkan judul artikel..." 
                  />
                  <label className="flex items-center gap-2 cursor-pointer mt-4">
                    <input type="checkbox" checked={contentForm.pinned} onChange={e => setContentForm({ ...contentForm, pinned: e.target.checked })} className="w-4 h-4 rounded accent-[var(--adm-accent)]" />
                    <span className="text-xs font-bold text-[var(--adm-text-2)]">Sematkan Artikel (Tampil Lebih Awal)</span>
                  </label>
                </div>

              {/* WYSIWYG Editor */}
              <div className="p-4">
                <div className="rounded-xl border border-[var(--adm-border)] overflow-hidden [&_.quill]:flex [&_.quill]:flex-col [&_.quill]:h-full [&_.ql-toolbar]:border-x-0 [&_.ql-toolbar]:border-t-0 [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-[var(--adm-border)] [&_.ql-toolbar]:bg-[var(--adm-bg)] [&_.ql-container]:border-none [&_.ql-editor]:min-h-[450px] [&_.ql-editor]:max-h-[600px] [&_.ql-editor]:overflow-y-auto [&_.ql-editor]:text-base [&_.ql-editor]:text-[var(--adm-text)] [&_.ql-editor]:leading-relaxed [&_.ql-editor]:p-5 prose prose-slate prose-sm max-w-none prose-headings:font-bold prose-a:text-blue-600 prose-img:rounded-xl dark:prose-invert">
                <style>{`
                  .ql-container.ql-snow {
                    border: none !important;
                  }
                  .ql-toolbar.ql-snow {
                    border: none !important;
                    border-bottom: 1px solid var(--adm-border) !important;
                  }
                  
                  /* Editor Text Colors & Paste Overrides */
                  .ql-editor,
                  .ql-editor * {
                    color: var(--adm-text) !important;
                    background-color: transparent !important;
                  }
                  .ql-editor a,
                  .ql-editor a * {
                    color: var(--adm-accent) !important;
                  }
                  .ql-editor.ql-blank::before {
                    color: var(--adm-text-3) !important;
                    font-style: italic;
                  }
                  
                  /* Editor Element Spacing */
                  .ql-editor p,
                  .ql-editor ul,
                  .ql-editor ol,
                  .ql-editor blockquote,
                  .ql-editor pre {
                    margin-bottom: 1rem !important;
                  }
                  .ql-editor h1,
                  .ql-editor h2,
                  .ql-editor h3 {
                    margin-top: 1.5rem !important;
                    margin-bottom: 0.5rem !important;
                  }
                  .ql-editor h1:first-child,
                  .ql-editor h2:first-child,
                  .ql-editor h3:first-child,
                  .ql-editor p:first-child {
                    margin-top: 0 !important;
                  }
                  .ql-editor li {
                    margin-bottom: 0.25rem !important;
                  }
                  .ql-editor hr {
                    border: none !important;
                    border-top: 1px solid var(--adm-border) !important;
                    margin: 2rem 0 !important;
                  }
                  
                  .ql-snow .ql-stroke { stroke: var(--adm-text-2); }
                  .ql-snow .ql-fill { fill: var(--adm-text-2); }
                  .ql-snow .ql-picker { color: var(--adm-text-2); }
                  
                  .ql-snow.ql-toolbar button:hover .ql-stroke,
                  .ql-snow .ql-toolbar button:hover .ql-stroke,
                  .ql-snow.ql-toolbar button.ql-active .ql-stroke,
                  .ql-snow .ql-toolbar button.ql-active .ql-stroke,
                  .ql-snow.ql-toolbar .ql-picker-label:hover .ql-stroke,
                  .ql-snow .ql-toolbar .ql-picker-label:hover .ql-stroke,
                  .ql-snow.ql-toolbar .ql-picker-label.ql-active .ql-stroke,
                  .ql-snow .ql-toolbar .ql-picker-label.ql-active .ql-stroke {
                    stroke: var(--adm-text) !important;
                  }
                  
                  .ql-snow.ql-toolbar button:hover .ql-fill,
                  .ql-snow .ql-toolbar button:hover .ql-fill,
                  .ql-snow.ql-toolbar button.ql-active .ql-fill,
                  .ql-snow .ql-toolbar button.ql-active .ql-fill,
                  .ql-snow.ql-toolbar .ql-picker-label:hover .ql-fill,
                  .ql-snow .ql-toolbar .ql-picker-label:hover .ql-fill,
                  .ql-snow.ql-toolbar .ql-picker-label.ql-active .ql-fill,
                  .ql-snow .ql-toolbar .ql-picker-label.ql-active .ql-fill {
                    fill: var(--adm-text) !important;
                  }
                  
                  .ql-snow.ql-toolbar button:hover,
                  .ql-snow .ql-toolbar button:hover,
                  .ql-snow.ql-toolbar button.ql-active,
                  .ql-snow .ql-toolbar button.ql-active,
                  .ql-snow.ql-toolbar .ql-picker-label:hover,
                  .ql-snow .ql-toolbar .ql-picker-label:hover,
                  .ql-snow.ql-toolbar .ql-picker-label.ql-active,
                  .ql-snow .ql-toolbar .ql-picker-label.ql-active {
                    color: var(--adm-text) !important;
                  }

                  .ql-snow.ql-toolbar .ql-picker-item.ql-selected,
                  .ql-snow .ql-toolbar .ql-picker-item.ql-selected,
                  .ql-snow.ql-toolbar .ql-picker-item:hover,
                  .ql-snow .ql-toolbar .ql-picker-item:hover {
                    color: var(--adm-text) !important;
                  }
                  
                  .ql-snow .ql-picker-options {
                    background-color: var(--adm-card) !important;
                    border: none !important;
                    color: var(--adm-text-2) !important;
                    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
                    border-radius: 0.75rem;
                    padding: 0.5rem;
                  }
                  
                  .ql-snow .ql-tooltip {
                    background-color: var(--adm-card) !important;
                    border: none !important;
                    color: var(--adm-text) !important;
                    border-radius: 0.75rem;
                    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
                  }
                  
                  .ql-snow .ql-tooltip input[type=text] {
                    background-color: var(--adm-bg) !important;
                    color: var(--adm-text) !important;
                    border: 1px solid var(--adm-border) !important;
                    border-radius: 0.5rem;
                    padding: 0.25rem 0.5rem;
                  }
                  
                  .ql-snow .ql-tooltip a.ql-action::before {
                    color: var(--adm-accent) !important;
                  }
                  
                  .ql-snow .ql-tooltip a.ql-remove::before {
                    color: #ef4444 !important;
                  }
                `}</style>
                <ReactQuill 
                  theme="snow" 
                  value={contentForm.content} 
                  onChange={(value) => setContentForm({ ...contentForm, content: value })}
                  modules={QUILL_MODULES}
                  placeholder="Mulai menulis konten artikel Anda di sini..."
                />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 h-full">
            <div className="bg-[var(--adm-card)] rounded-2xl border border-[var(--adm-border)] shadow-sm flex flex-col overflow-hidden h-full">
              
              {/* Cover Image Uploader */}
              <div className="p-5 border-b border-[var(--adm-border)] space-y-4">
                <h3 className="text-sm font-bold text-[var(--adm-text)] border-b border-[var(--adm-border)] pb-3 mb-2">Gambar Sampul</h3>
              
              {contentForm.coverImage ? (
                <div className="w-full rounded-xl border border-[var(--adm-border)] overflow-hidden relative group">
                  <button type="button" onClick={() => setPreviewImage(contentForm.coverImage)} title="Lihat ukuran penuh" className="block w-full text-left">
                    <img src={contentForm.coverImage} alt="Cover" className="w-full h-40 object-cover cursor-pointer hover:opacity-90 transition-opacity" />
                  </button>
                  <div className="absolute top-3 right-3 flex items-center gap-2">
                    <label className="p-2 rounded-lg bg-black/50 hover:bg-black/80 text-white cursor-pointer transition-colors backdrop-blur-md border border-white/10" title="Ganti Gambar">
                      <Pencil size={14} />
                      <input 
                        type="file" 
                        accept="image/*"
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setContentForm({ ...contentForm, coverImage: reader.result as string });
                            setToast({ isVisible: true, message: "Gambar berhasil diunggah", type: "success" });
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                    </label>
                    <button onClick={() => setContentForm({ ...contentForm, coverImage: "" })} className="p-2 rounded-lg bg-black/50 hover:bg-red-500/90 text-white transition-colors backdrop-blur-md border border-white/10" title="Hapus Gambar">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ) : (
                <div 
                  {...getRootProps()} 
                  className={`w-full py-6 px-4 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors ${isDragActive ? "border-[var(--adm-accent)] bg-[var(--adm-accent)]/10" : "border-[var(--adm-border)] hover:border-[var(--adm-accent)] hover:bg-[var(--adm-bg)]"}`}
                >
                  <input {...getInputProps()} />
                  <div className="p-3 bg-[var(--adm-bg)] rounded-full">
                    <UploadCloud size={24} className={isDragActive ? "text-[var(--adm-accent)]" : "text-[var(--adm-text-3)]"} />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-[var(--adm-text)]">
                      {isDragActive ? "Lepaskan..." : "Klik atau seret file"}
                    </p>
                    <p className="text-xs text-[var(--adm-text-3)] mt-1">PNG, JPG, WEBP maks 5MB</p>
                  </div>
                </div>
              )}
              </div>

              {/* SEO Panel */}
              <div className="p-5 flex-1">
                <SEOPanel form={seoForm} setForm={setSeoForm} loading={seoLoading} onGenerate={generateSEO} />
              </div>
            </div>
          </div>
          </div>
        </motion.div>
    )}
      <AdminConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.action}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        confirmVariant={confirmModal.confirmVariant}
      />
      <AdminToast
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />

      {/* Image Preview Modal */}
      <AnimatePresence>
        {previewImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" 
            onClick={() => setPreviewImage(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center justify-center" 
              onClick={e => e.stopPropagation()}
            >
              <button 
                type="button"
                onClick={() => setPreviewImage(null)} 
                className="absolute -top-12 right-0 p-2 text-white/70 hover:text-white transition-colors bg-white/10 rounded-full hover:bg-white/20"
              >
                <X size={24} />
              </button>
              <img src={previewImage} alt="Preview" className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
