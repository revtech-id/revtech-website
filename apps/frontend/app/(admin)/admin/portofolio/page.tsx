"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import { StatusBadge, EmptyState, AdminToolbar, AdminTabs, AdminConfirmModal, AdminToast, AdminTable, AdminButton, SEOPanel } from "@/components/admin/ui";
import { ExternalLink, Pencil, Archive, Trash2, Pin, ChevronDown, Send, SlidersHorizontal, UploadCloud, X, Loader2 } from "lucide-react";
import { logActivity } from "@/lib/activityLog";
import { useUser } from "@/contexts/UserContext";
import { uploadImageToStorage } from "@/lib/upload";

import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { 
  ssr: false, 
  loading: () => <div className="h-[450px] w-full flex items-center justify-center bg-[var(--adm-bg)] text-[var(--adm-text-3)] animate-pulse rounded-xl">Memuat Editor...</div> 
}) as any;

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
import { collection, doc, onSnapshot, setDoc, deleteDoc, updateDoc, writeBatch } from "firebase/firestore";

interface Portfolio {
  id: string;
  slug?: string;
  title: string;
  client: string;
  category: string;
  thumbnail: string;
  content: string;
  url: string | null;
  projectDate: string;
  description: string;
  techStack: string[];
  pinned: boolean;
  status: "published" | "draft" | "archived";
  publishedAt: string | null;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
}



const EMPTY_FORM = {
  title: "", client: "", category: "Jasa Web",
  url: "", projectDate: "", description: "", techStack: "", pinned: false, status: "published" as "published" | "draft" | "archived", content: "", thumbnail: "", publishedAt: "",
  metaTitle: "", metaDescription: "", keywords: ""
};

export default function PortofolioPage() {
  const { user } = useUser();
  const canDelete = user?.role === "Superadmin" || user?.role === "Project Manager";

  const [isClient, setIsClient] = useState(false);
  const [items, setItems] = useState<Portfolio[]>([]);
  const [filter, setFilter] = useState("Semua");
  const [tabFilter, setTabFilter] = useState("all");
  const [view, setView] = useState<"list" | "form">("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const statusRef = useRef<"draft" | "published">("published");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [toast, setToast] = useState<{ isVisible: boolean; message: string; type: "success" | "error" }>({ isVisible: false, message: "", type: "success" });
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; action: () => void; title: string; message: string; confirmText: string; confirmVariant: "danger" | "primary" | "warning" }>({ isOpen: false, action: () => {}, title: "", message: "", confirmText: "", confirmVariant: "danger" });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [seoLoading, setSeoLoading] = useState(false);
  const [seoForm, setSeoForm] = useState({ metaTitle: "", metaDescription: "", keywords: "" });
  const [isUploading, setIsUploading] = useState(false);
  const quillRef = useRef<any>(null);

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['link', 'image'],
        ['clean']
      ],
      handlers: {
        image: () => {
          const input = document.createElement('input');
          input.setAttribute('type', 'file');
          input.setAttribute('accept', 'image/*');
          input.click();

          input.onchange = async () => {
            const file = input.files ? input.files[0] : null;
            if (!file) return;

            setToast({ isVisible: true, message: "Mengunggah gambar konten...", type: "success" });
            
            try {
              const url = await uploadImageToStorage(file, "portfolio");
              const quill = quillRef.current?.getEditor();
              if (quill) {
                const range = quill.getSelection(true);
                quill.insertEmbed(range.index, 'image', url);
                quill.setSelection(range.index + 1);
                setToast({ isVisible: true, message: "Gambar berhasil disisipkan", type: "success" });
              }
            } catch (err) {
              console.error(err);
              setToast({ isVisible: true, message: "Gagal mengunggah gambar konten", type: "error" });
            }
          };
        }
      }
    },
    keyboard: QUILL_MODULES.keyboard
  }), []);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    
    const url = URL.createObjectURL(file);
    setForm(prev => ({ ...prev, thumbnail: url }));
    setSelectedFile(file);
    setToast({ isVisible: true, message: "Pratinjau gambar dimuat secara lokal", type: "success" });
  }, []);

  const onDropRejected = useCallback(() => {
    setToast({ isVisible: true, message: "File ditolak. Pastikan format gambar sesuai.", type: "error" });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    accept: { 'image/*': [] },
    maxFiles: 1,
  });

  useEffect(() => {
    setIsClient(true);
    
    // Subscribe to Firestore
    const unsub = onSnapshot(collection(db, "portfolio"), async (snapshot) => {
        const loaded = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        })) as Portfolio[];
        setItems(loaded);
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

  function handleEdit(item: Portfolio) {
    setForm({
      title: item.title, client: item.client, category: item.category,
      url: item.url || "", projectDate: item.projectDate || "", description: item.description || "", techStack: item.techStack.join(", "),
      pinned: item.pinned, status: item.status, content: item.content || "",
      thumbnail: item.thumbnail || "", publishedAt: item.publishedAt || "",
      metaTitle: item.metaTitle || "", metaDescription: item.metaDescription || "", keywords: item.keywords || ""
    });
    setSeoForm({
      metaTitle: item.metaTitle || "",
      metaDescription: item.metaDescription || "",
      keywords: item.keywords || ""
    });
    setEditingId(item.id);
    setSelectedFile(null);
    setView("form");
  }

  function confirmDelete(item: Portfolio) {
    setConfirmModal({
      isOpen: true,
      title: "Hapus Proyek",
      message: "Proyek ini akan dihapus dari portofolio secara permanen.",
      confirmText: "Hapus",
      confirmVariant: "danger",
      action: async () => {
        try {
          await deleteDoc(doc(db, "portfolio", item.id));

          setToast({ isVisible: true, message: "Proyek berhasil dihapus", type: "success" });
          logActivity({ type: "portofolio_deleted", title: "Proyek Dihapus", description: `Proyek portofolio dengan ID ${item.id} dihapus.`, user: "Admin" });
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        } catch (err) {
          console.error(err);
          setToast({ isVisible: true, message: "Gagal menghapus proyek", type: "error" });
        }
      }
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const techArr = form.techStack.split(",").map(s => s.trim()).filter(Boolean);
    const targetStatus = statusRef.current;
    
    setIsSubmitting(true);
    setToast({ isVisible: true, message: "Menyimpan data...", type: "success" });
    
    try {
      let finalThumbnailUrl = form.thumbnail;
      
      // Upload local file to Cloudinary if it exists
      if (selectedFile) {
        setToast({ isVisible: true, message: "Mengunggah thumbnail...", type: "success" });
        finalThumbnailUrl = await uploadImageToStorage(selectedFile, "portofolio");
      }

      if (editingId) {
        const updated: Partial<Portfolio> = {
          title: form.title, client: form.client, category: form.category,
          url: form.url || null, description: form.description,
          techStack: techArr, pinned: form.pinned, status: targetStatus,
          content: form.content, thumbnail: finalThumbnailUrl,
          metaTitle: seoForm.metaTitle, metaDescription: seoForm.metaDescription, keywords: seoForm.keywords,
          publishedAt: targetStatus === "published" ? (items.find(i => i.id === editingId)?.publishedAt || new Date().toISOString()) : null
        };
        await updateDoc(doc(db, "portfolio", editingId), updated);
      } else {
        const newId = `PRJ-${Date.now().toString().slice(-5)}`;
        const slug = form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        const newItem: Portfolio = {
          id: newId,
          slug,
          title: form.title, client: form.client, category: form.category,
          url: form.url || null, projectDate: form.projectDate, description: form.description,
          techStack: techArr, pinned: form.pinned, thumbnail: finalThumbnailUrl,
          content: form.content, status: targetStatus,
          publishedAt: targetStatus === "published" ? new Date().toISOString() : null,
          metaTitle: seoForm.metaTitle, metaDescription: seoForm.metaDescription, keywords: seoForm.keywords
        };
        await setDoc(doc(db, "portfolio", newId), newItem);
      }

      setView("list");
      setEditingId(null);
      setForm(EMPTY_FORM);
      setSelectedFile(null);
      setToast({ isVisible: true, message: targetStatus === "draft" ? "Draft berhasil disimpan" : "Proyek berhasil dipublish", type: "success" });
      logActivity({ 
        type: "portofolio_updated", 
        title: targetStatus === "draft" ? "Draft Proyek Disimpan" : (editingId ? "Proyek Diperbarui" : "Proyek Baru Diterbitkan"), 
        description: `Proyek "${form.title}" untuk klien ${form.client} ${targetStatus === "draft" ? "disimpan sebagai draft" : "dipublish"}.`, 
        user: "Admin" 
      });
        } catch (err) {
          console.error(err);
          setToast({ isVisible: true, message: "Gagal menyimpan data", type: "error" });
        } finally {
          setIsSubmitting(false);
        }
      }
    
      async function confirmArchive(id: string, currentStatus: string) {
        const isArchived = currentStatus === "archived";
        try {
          await updateDoc(doc(db, "portfolio", id), { status: isArchived ? "draft" : "archived" });
          setToast({ isVisible: true, message: isArchived ? "Proyek dikembalikan ke Draft" : "Proyek berhasil diarsipkan", type: "success" });
          logActivity({ type: "portofolio_updated", title: isArchived ? "Proyek Dipulihkan" : "Proyek Diarsipkan", description: `Proyek portofolio ID ${id} ${isArchived ? "dikembalikan ke draft" : "diarsipkan"}.`, user: "Admin" });
        } catch (err) {
          console.error(err);
          setToast({ isVisible: true, message: "Gagal merubah status", type: "error" });
        }
      }
    
      async function confirmPublish(id: string) {
        try {
          await updateDoc(doc(db, "portfolio", id), { status: "published" });
          setToast({ isVisible: true, message: "Proyek berhasil diterbitkan", type: "success" });
          logActivity({ type: "portofolio_updated", title: "Proyek Diterbitkan", description: `Proyek portofolio ID ${id} dipublish.`, user: "Admin" });
        } catch (err) {
          console.error(err);
          setToast({ isVisible: true, message: "Gagal menerbitkan", type: "error" });
        }
      }
    
      async function togglePinned(id: string) {
        const item = items.find(i => i.id === id);
        if (item) {
          try {
            await updateDoc(doc(db, "portfolio", id), { pinned: !item.pinned });
            logActivity({ type: "portofolio_updated", title: !item.pinned ? "Proyek Disematkan" : "Pin Dilepas", description: `Status pin diperbarui untuk proyek ${item.title}.`, user: "Admin" });
          } catch (err) {
            console.error(err);
            setToast({ isVisible: true, message: "Gagal menyematkan", type: "error" });
          }
        }
      }

  async function generateSEO() {
    if (!form.title.trim()) return;
    setSeoLoading(true);
    try {
      const res = await fetch("/api/admin/seo-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: form.title, category: form.category, content: form.content || form.description }),
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

  const published = items.filter(i => (i.status || "published") === "published");
  const drafts = items.filter(i => i.status === "draft");
  const archived = items.filter(i => i.status === "archived");

  const TABS = [
    { id: "all", label: "Semua", count: items.length },
    { id: "pinned", label: "Disematkan", count: items.filter(i => i.pinned).length },
    { id: "draft", label: "Draft", count: drafts.length },
    { id: "archived", label: "Arsip", count: archived.length },
    { id: "published", label: "Published", count: published.length },
  ];

  const filtered = items.filter((item) => {
    const matchTab =
      tabFilter === "all" ? true :
      tabFilter === "pinned" ? item.pinned :
      tabFilter === "draft" ? item.status === "draft" :
      tabFilter === "published" ? item.status === "published" :
      tabFilter === "archived" ? item.status === "archived" : true;

    const matchCategory = filter === "Semua" || item.category === filter;
    const searchString = `${item.title} ${item.client}`.toLowerCase();
    const matchSearch = !search || searchString.includes(search.toLowerCase());

    return matchTab && matchCategory && matchSearch;
  }).sort((a, b) => {
    const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
  });

  const portofolioColumns = [
    {
      key: "proyek",
      label: "Proyek",
      render: (item: Portfolio) => (
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <button onClick={() => togglePinned(item.id)} className={`shrink-0 p-1.5 transition-colors focus:outline-none ${item.pinned ? "text-[var(--adm-text)]" : "text-[var(--adm-text-3)] hover:text-[var(--adm-text)]"}`} title={item.pinned ? "Lepaskan Pin" : "Sematkan"}>
            <Pin size={14} strokeWidth={2} className={item.pinned ? "fill-current rotate-45" : ""} />
          </button>
          
          <div className="w-16 h-12 rounded-lg bg-[var(--adm-border)] flex items-center justify-center shrink-0 relative overflow-hidden">
            {item.thumbnail ? <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" /> : <span className="material-symbols-outlined text-[var(--adm-text-3)] text-[24px]">web</span>}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <p className={`font-bold text-sm truncate ${item.status === "draft" ? "text-[var(--adm-text-3)]" : "text-[var(--adm-text)]"}`}>{item.title}</p>
              {item.status === "archived" && <StatusBadge label="Archived" variant="slate" />}
            </div>
            <p className="text-xs text-[var(--adm-text-3)] truncate">
              {item.client ? item.client.toLowerCase().replace(/\s+/g, '-') : item.category.toLowerCase()}
            </p>
          </div>
        </div>
      )
    },
    {
      key: "aksi",
      label: "Aksi",
      className: "text-right",
      render: (item: Portfolio) => (
        <div className="flex items-center justify-end gap-3 sm:gap-5">
          {item.status !== "draft" && item.publishedAt && (
            <div className="hidden md:block text-xs font-medium text-[var(--adm-text-3)]">
              {new Date(item.publishedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
            </div>
          )}
          <div className="flex items-center justify-end gap-1.5 shrink-0">
            {item.url ? (
              <a href={item.url.startsWith('http') ? item.url : `https://${item.url}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center p-1.5 text-[var(--adm-text-3)] hover:text-[var(--adm-text)] transition-colors focus:outline-none" title="Buka Tautan">
                <ExternalLink size={14} strokeWidth={2} />
              </a>
            ) : (
              <div className="w-[26px] h-[26px]" />
            )}
            {item.status !== "published" && (
              <button onClick={() => confirmPublish(item.id)} className="inline-flex items-center justify-center p-1.5 text-[var(--adm-text-3)] hover:text-[var(--adm-text)] transition-colors focus:outline-none" title="Publish">
                <Send size={14} strokeWidth={2} />
              </button>
            )}
            <button onClick={() => handleEdit(item)} className="inline-flex items-center justify-center p-1.5 text-[var(--adm-text-3)] hover:text-[var(--adm-text)] transition-colors focus:outline-none" title="Edit">
              <Pencil size={14} strokeWidth={2} />
            </button>
            <button onClick={() => confirmArchive(item.id, item.status)} className="inline-flex items-center justify-center p-1.5 text-[var(--adm-text-3)] hover:text-[var(--adm-text)] transition-colors focus:outline-none" title={item.status === "archived" ? "Kembalikan dari Arsip" : "Arsip"}>
              <Archive size={14} strokeWidth={2} className={item.status === "archived" ? "text-amber-500" : ""} />
            </button>
            {canDelete && (
              <button onClick={() => confirmDelete(item)} className="inline-flex items-center justify-center p-1.5 text-[var(--adm-text-3)] hover:text-red-500 transition-colors focus:outline-none" title="Hapus">
                <Trash2 size={14} strokeWidth={2} />
              </button>
            )}
          </div>
        </div>
      )
    }
  ];

  if (!isClient) return null;

  return (
    <div>
      <AdminToolbar
        view={view === "form" ? "form" : "list"}
        onBack={() => setView("list")}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari proyek atau klien..."
        dropdown={
          <div className="flex items-center h-full">
            <div className="relative flex items-center shrink-0">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="appearance-none bg-transparent py-2.5 pl-4 pr-8 text-sm font-semibold text-[var(--adm-text)] focus:outline-none cursor-pointer"
              >
                <option value="Semua" className="bg-[var(--adm-card)] text-[var(--adm-text)]">Semua Layanan</option>
                {Array.from(new Set(items.map(i => i.category))).filter(Boolean).map(c => (
                  <option key={c} value={c} className="bg-[var(--adm-card)] text-[var(--adm-text)]">{c}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3">
                <ChevronDown size={14} strokeWidth={2.5} className="text-[var(--adm-text-3)]" />
              </div>
            </div>
          </div>
        }
        onAdd={() => { setEditingId(null); setForm(EMPTY_FORM); setView("form"); }}
        addLabel="Tambah Proyek"
      />

      {view === "list" && (
        <>
          {/* Tabs & Actions Row */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-4 sm:gap-0">
            {/* Tabs Status */}
            <AdminTabs tabs={TABS} activeTab={tabFilter} onTabChange={setTabFilter} />

            {/* Actions (Sort) */}
            <div className="flex items-center pb-2.5 shrink-0 self-start sm:self-auto px-1 sm:px-0">
              <div className="relative flex items-center justify-center shrink-0 group">
                <button className="text-[var(--adm-text-3)] group-hover:text-[var(--adm-text)] transition-colors focus:outline-none">
                  <SlidersHorizontal size={18} strokeWidth={2.5} />
                </button>
                <select
                  dir="rtl"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as "desc" | "asc")}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  title="Urutkan"
                >
                  <option value="desc" className="bg-[var(--adm-card)] text-[var(--adm-text)]" dir="ltr">Terbaru</option>
                  <option value="asc" className="bg-[var(--adm-card)] text-[var(--adm-text)]" dir="ltr">Terlama</option>
                </select>
              </div>
            </div>
          </div>

          {/* Portofolio List Unified Table */}
          <div className="mt-4">
            <AdminTable
              columns={portofolioColumns}
              data={filtered}
              keyField="id"
              emptyMessage="Belum ada proyek ditambahkan."
            />
          </div>
        </>
      )}

      {/* Form */}
      {view === "form" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Toolbar Atas */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="submit"
              form="porto-form"
              onClick={() => { statusRef.current = "draft"; }}
              className="px-4 py-2.5 text-sm font-bold text-[var(--adm-text-2)] hover:text-[var(--adm-text)] transition-colors"
            >
              Simpan Draft
            </button>
            <button
              type="submit"
              form="porto-form"
              onClick={() => { statusRef.current = "published"; }}
              className="px-5 py-2.5 rounded-xl bg-[var(--adm-accent)] text-white text-sm font-bold hover:brightness-110 transition-all flex items-center gap-2 shadow-sm"
            >
              <Send size={16} strokeWidth={2.5} /> Publish
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Kolom Kiri: Judul + Editor */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              <div className="bg-[var(--adm-card)] rounded-2xl border border-[var(--adm-border)] shadow-sm flex flex-col overflow-hidden">
                <div className="px-5 pt-5 pb-4 border-b border-[var(--adm-border)]">
                  <h2 className="text-lg font-bold text-[var(--adm-text)] mb-4">{editingId ? "Edit Proyek" : "Tambah Proyek Baru"}</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-[var(--adm-text-2)] mb-1.5 block">Judul Proyek *</label>
                      <input
                        required
                        type="text"
                        value={form.title}
                        onChange={e => setForm({ ...form, title: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl border border-[var(--adm-border)] bg-transparent text-[var(--adm-text)] placeholder:text-[var(--adm-text-3)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--adm-accent)]/20 focus:border-[var(--adm-accent)]"
                        placeholder="Masukkan judul proyek..."
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-[var(--adm-text-2)] mb-1.5 block">Deskripsi Singkat</label>
                      <textarea
                        value={form.description}
                        onChange={e => setForm({ ...form, description: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl border border-[var(--adm-border)] bg-transparent text-[var(--adm-text)] placeholder:text-[var(--adm-text-3)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--adm-accent)]/20 focus:border-[var(--adm-accent)] resize-none"
                        rows={2}
                        placeholder="Masukkan deskripsi singkat proyek..."
                      />
                    </div>
                  </div>
                </div>

                {/* Editor */}
                <div className="p-4">
                  <div className="rounded-xl border border-[var(--adm-border)] overflow-hidden [&_.quill]:flex [&_.quill]:flex-col [&_.quill]:h-full [&_.ql-toolbar]:border-x-0 [&_.ql-toolbar]:border-t-0 [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-[var(--adm-border)] [&_.ql-toolbar]:bg-[var(--adm-bg)] [&_.ql-container]:border-none [&_.ql-editor]:min-h-[450px] [&_.ql-editor]:max-h-[600px] [&_.ql-editor]:overflow-y-auto [&_.ql-editor]:text-base [&_.ql-editor]:text-[var(--adm-text)] [&_.ql-editor]:leading-relaxed [&_.ql-editor]:p-5 prose prose-slate prose-sm max-w-none prose-headings:font-bold prose-a:text-blue-600 prose-img:rounded-xl dark:prose-invert">
                    <style>{`
                      .ql-container.ql-snow { border: none !important; }
                      .ql-toolbar.ql-snow { border: none !important; border-bottom: 1px solid var(--adm-border) !important; }
                      .ql-editor, .ql-editor * { color: var(--adm-text) !important; background-color: transparent !important; }
                      .ql-editor a, .ql-editor a * { color: var(--adm-accent) !important; }
                      .ql-editor.ql-blank::before { color: var(--adm-text-3) !important; font-style: italic; }
                      .ql-editor p, .ql-editor ul, .ql-editor ol, .ql-editor blockquote, .ql-editor pre { margin-bottom: 1rem !important; }
                      .ql-editor h1, .ql-editor h2, .ql-editor h3 { margin-top: 1.5rem !important; margin-bottom: 0.5rem !important; }
                      .ql-editor h1:first-child, .ql-editor h2:first-child, .ql-editor h3:first-child, .ql-editor p:first-child { margin-top: 0 !important; }
                      .ql-editor li { margin-bottom: 0.25rem !important; }
                      .ql-editor hr { border: none !important; border-top: 1px solid var(--adm-border) !important; margin: 2rem 0 !important; }
                      .ql-snow .ql-stroke { stroke: var(--adm-text-2); }
                      .ql-snow .ql-fill { fill: var(--adm-text-2); }
                      .ql-snow .ql-picker { color: var(--adm-text-2); }
                      .ql-snow.ql-toolbar button:hover .ql-stroke, .ql-snow .ql-toolbar button:hover .ql-stroke,
                      .ql-snow.ql-toolbar button.ql-active .ql-stroke, .ql-snow .ql-toolbar button.ql-active .ql-stroke,
                      .ql-snow.ql-toolbar .ql-picker-label:hover .ql-stroke, .ql-snow .ql-picker-label.ql-active .ql-stroke { stroke: var(--adm-text) !important; }
                      .ql-snow.ql-toolbar button:hover .ql-fill, .ql-snow .ql-toolbar button:hover .ql-fill,
                      .ql-snow.ql-toolbar button.ql-active .ql-fill, .ql-snow .ql-toolbar button.ql-active .ql-fill,
                      .ql-snow.ql-toolbar .ql-picker-label:hover .ql-fill, .ql-snow .ql-toolbar .ql-picker-label.ql-active .ql-fill { fill: var(--adm-text) !important; }
                      .ql-snow.ql-toolbar button:hover, .ql-snow .ql-toolbar button:hover,
                      .ql-snow.ql-toolbar button.ql-active, .ql-snow .ql-toolbar button.ql-active,
                      .ql-snow.ql-toolbar .ql-picker-label:hover, .ql-snow .ql-toolbar .ql-picker-label.ql-active { color: var(--adm-text) !important; }
                      .ql-snow.ql-toolbar .ql-picker-item.ql-selected, .ql-snow .ql-toolbar .ql-picker-item.ql-selected,
                      .ql-snow.ql-toolbar .ql-picker-item:hover, .ql-snow .ql-toolbar .ql-picker-item:hover { color: var(--adm-text) !important; }
                      .ql-snow .ql-picker-options { background-color: var(--adm-card) !important; border: none !important; color: var(--adm-text-2) !important; box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1); border-radius: 0.75rem; padding: 0.5rem; }
                      .ql-snow .ql-tooltip { background-color: var(--adm-card) !important; border: none !important; color: var(--adm-text) !important; border-radius: 0.75rem; box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1); }
                      .ql-snow .ql-tooltip input[type=text] { background-color: var(--adm-bg) !important; color: var(--adm-text) !important; border: 1px solid var(--adm-border) !important; border-radius: 0.5rem; padding: 0.25rem 0.5rem; }
                      .ql-snow .ql-tooltip a.ql-action::before { color: var(--adm-accent) !important; }
                      .ql-snow .ql-tooltip a.ql-remove::before { color: #ef4444 !important; }
                    `}</style>
                    <ReactQuill 
                      ref={quillRef}
                      theme="snow" 
                      value={form.content} 
                      onChange={(value: string) => setForm({ ...form, content: value })}
                      modules={modules}
                      placeholder="Mulai menulis detail project portofolio Anda di sini..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Kolom Kanan: Thumbnail + Detail */}
            <div className="lg:col-span-1 h-full">
              <form id="porto-form" onSubmit={handleSubmit} className="bg-[var(--adm-card)] rounded-2xl border border-[var(--adm-border)] shadow-sm flex flex-col overflow-hidden h-full">
                {isSubmitting && (
                  <div className="absolute inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-center justify-center rounded-2xl">
                    <div className="flex flex-col items-center gap-3 bg-[var(--adm-card)] p-6 rounded-xl shadow-xl">
                      <Loader2 size={32} className="animate-spin text-[var(--adm-accent)]" />
                      <p className="text-sm font-bold text-[var(--adm-text)]">Menyimpan & Mengunggah...</p>
                    </div>
                  </div>
                )}

                {/* Thumbnail */}
                <div className="p-5 border-b border-[var(--adm-border)] space-y-3">
                  <h3 className="text-sm font-bold text-[var(--adm-text)] border-b border-[var(--adm-border)] pb-3 mb-3">Gambar Thumbnail</h3>
                  {form.thumbnail ? (
                    <div className="w-full rounded-xl border border-[var(--adm-border)] overflow-hidden relative group">
                      <button type="button" onClick={() => setPreviewImage(form.thumbnail)} title="Lihat ukuran penuh" className="block w-full text-left">
                        <img src={form.thumbnail} alt="Thumbnail" className="w-full h-40 object-cover cursor-pointer hover:opacity-90 transition-opacity" />
                      </button>
                      <div className="absolute top-3 right-3 flex items-center gap-2">
                        <label className="p-2 rounded-lg bg-black/50 hover:bg-black/80 text-white cursor-pointer transition-colors backdrop-blur-md border border-white/10" title="Ganti">
                          <Pencil size={14} />
                          <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const url = URL.createObjectURL(file);
                            setForm(prev => ({ ...prev, thumbnail: url }));
                            setSelectedFile(file);
                            setToast({ isVisible: true, message: "Pratinjau lokal siap", type: "success" });
                          }} />
                        </label>
                        <button type="button" onClick={() => { setForm({ ...form, thumbnail: "" }); setSelectedFile(null); }} className="p-2 rounded-lg bg-black/50 hover:bg-red-500/90 text-white transition-colors backdrop-blur-md border border-white/10" title="Hapus">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ) : isUploading ? (
                    <div className="w-full py-8 px-4 border-2 border-dashed border-[var(--adm-accent)]/50 rounded-xl flex flex-col items-center justify-center gap-3">
                      <Loader2 size={28} className="text-[var(--adm-accent)] animate-spin" />
                      <p className="text-xs text-[var(--adm-text-3)]">Mengunggah gambar...</p>
                    </div>
                  ) : (
                    <div {...getRootProps()} className={`w-full py-6 px-4 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors ${isDragActive ? "border-[var(--adm-accent)] bg-[var(--adm-accent)]/10" : "border-[var(--adm-border)] hover:border-[var(--adm-accent)] hover:bg-[var(--adm-bg)]"}`}>
                      <input {...getInputProps()} />
                      <div className="p-3 bg-[var(--adm-bg)] rounded-full">
                        <UploadCloud size={24} className={isDragActive ? "text-[var(--adm-accent)]" : "text-[var(--adm-text-3)]"} />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-[var(--adm-text)]">{isDragActive ? "Lepaskan..." : "Klik atau seret file"}</p>
                        <p className="text-xs text-[var(--adm-text-3)] mt-1">PNG, JPG, WEBP maks 5MB</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Detail Proyek */}
                <div className="p-5 flex-1 flex flex-col gap-4">
                  <h3 className="text-xs font-bold text-[var(--adm-text-2)] uppercase tracking-wide border-b border-[var(--adm-border)] pb-3">Detail Proyek</h3>

                  <div>
                    <label className="text-xs font-bold text-[var(--adm-text-2)] mb-1.5 block">Nama Klien *</label>
                    <input required type="text" value={form.client} onChange={e => setForm({ ...form, client: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-[var(--adm-border)] bg-transparent text-[var(--adm-text)] placeholder:text-[var(--adm-text-3)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--adm-accent)]/20 focus:border-[var(--adm-accent)]" placeholder="Masukkan nama klien..." />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[var(--adm-text-2)] mb-1.5 block">Layanan *</label>
                    <input required type="text" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-[var(--adm-border)] bg-transparent text-[var(--adm-text)] placeholder:text-[var(--adm-text-3)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--adm-accent)]/20 focus:border-[var(--adm-accent)]" placeholder="Masukkan jenis layanan..." />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[var(--adm-text-2)] mb-1.5 block">URL Website / Proyek</label>
                    <input type="text" value={form.url || ""} onChange={e => setForm({ ...form, url: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-[var(--adm-border)] bg-transparent text-[var(--adm-text)] placeholder:text-[var(--adm-text-3)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--adm-accent)]/20 focus:border-[var(--adm-accent)]" placeholder="Contoh: google.com" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-[var(--adm-text-2)] mb-1.5 block">Bulan & Tahun Proyek</label>
                      <input type="month" value={form.projectDate} onChange={e => setForm({ ...form, projectDate: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-[var(--adm-border)] bg-[var(--adm-card)] text-[var(--adm-text)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--adm-accent)]/20 focus:border-[var(--adm-accent)]" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-[var(--adm-text-2)] mb-1.5 block">Tanggal Publish</label>
                      <input type="date" value={form.publishedAt} onChange={e => setForm({ ...form, publishedAt: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-[var(--adm-border)] bg-[var(--adm-card)] text-[var(--adm-text)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--adm-accent)]/20 focus:border-[var(--adm-accent)]" />
                    </div>
                  </div>
                  <div className="flex flex-col justify-end">
                    <label className="flex items-center gap-2 cursor-pointer py-2">
                      <input type="checkbox" checked={form.pinned} onChange={e => setForm({ ...form, pinned: e.target.checked })} className="w-4 h-4 rounded accent-[var(--adm-accent)]" />
                      <span className="text-xs font-bold text-[var(--adm-text-2)]">Sematkan Proyek (Tampil Lebih Awal)</span>
                    </label>
                  </div>
                </div>
                
                {/* SEO Panel */}
                <div className="p-5 flex-1 border-t border-[var(--adm-border)]">
                  <SEOPanel form={seoForm} setForm={setSeoForm} loading={seoLoading} onGenerate={generateSEO} />
                </div>
              </form>
            </div>
          </div>
        </motion.div>
      )}


      {/* Popups & Toasts */}
      <AdminConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        confirmVariant={confirmModal.confirmVariant}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={() => { confirmModal.action(); setConfirmModal(prev => ({ ...prev, isOpen: false })); }}
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
