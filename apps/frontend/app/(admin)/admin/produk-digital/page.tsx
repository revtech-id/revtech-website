"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import { StatusBadge, EmptyState, AdminToolbar, AdminTabs, AdminConfirmModal, AdminToast, AdminTable, AdminButton } from "@/components/admin/ui";
import { ExternalLink, Pencil, Archive, Trash2, Pin, ChevronDown, Send, SlidersHorizontal, UploadCloud, X } from "lucide-react";

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
      'list autofill': { key: ' ', handler: () => true },
      divider: {
        key: 'Enter', collapsed: true, prefix: /^---$/,
        handler: function(range: any) {
          // @ts-ignore
          this.quill.deleteText(range.index - 3, 3);
          // @ts-ignore
          this.quill.insertEmbed(range.index - 3, 'divider', true, 'user');
          // @ts-ignore
          this.quill.setSelection(range.index - 2, 'user');
          return false;
        }
      },
    }
  }
};



// ─── Types ────────────────────────────────────────────────────────────────────
interface ProdukDigital {
  id: string;
  title: string;
  vendor: string;      // renamed from client
  category: string;
  thumbnail: string;
  content: string;
  url: string | null;
  description: string;
  techStack: string[];
  pinned: boolean;
  price: string;
  status: "published" | "draft" | "archived";
}

const MOCK_INITIAL: ProdukDigital[] = [
  {
    id: "PD-1", title: "Template Website E-Commerce Pro", vendor: "RevTech Studio", category: "Template Website",
    thumbnail: "https://images.unsplash.com/photo-1661956602116-aa6865609028?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", 
    content: "<p>Template <strong>E-Commerce Pro</strong> adalah solusi terbaik untuk membangun toko online Anda dalam hitungan hari, bukan bulan.</p><h3>Fitur Utama</h3><ul><li>Desain Responsif 100%</li><li>SEO Optimized (Skor Lighthouse 90+)</li><li>Sistem Keranjang & Checkout Siap Pakai</li><li>Integrasi Mode Gelap/Terang</li></ul><p>Dibuat menggunakan teknologi terkini yaitu Next.js 14 App Router, TypeScript, dan Tailwind CSS. Template ini sangat mudah disesuaikan dengan panduan dokumentasi yang komprehensif.</p>", 
    url: "https://demo.revtech.id/ecommerce-pro",
    description: "Template Next.js super cepat untuk toko online dengan integrasi payment gateway dan desain konversi tinggi.", techStack: ["Next.js", "Tailwind CSS", "TypeScript"],
    pinned: true, price: "Rp 250.000", status: "published"
  },
  {
    id: "PD-2", title: "RevAdmin - UI Kit Dashboard", vendor: "RevTech Studio", category: "UI Kit",
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", 
    content: "<p><strong>RevAdmin</strong> mempercepat proses development aplikasi internal atau SaaS Anda hingga 50%. UI Kit komprehensif ini dirancang khusus untuk React dan Figma.</p><h3>Komponen Tersedia</h3><ul><li>Tabel Data Lanjutan dengan Sorting & Filtering</li><li>Chart & Statistik Interaktif (Recharts)</li><li>Form Multi-step dengan Validasi Zod</li><li>Autentikasi UI (Login, Register, Lupa Password)</li></ul><p>Setiap komponen dibuat dengan fokus pada aksesibilitas (a11y) dan pengalaman pengguna yang premium.</p>", 
    url: "https://figma.com/community/revadmin",
    description: "Dashboard UI Kit komprehensif untuk React dan Figma dengan 100+ komponen premium.", techStack: ["Figma", "React", "Framer Motion"],
    pinned: false, price: "Gratis", status: "published"
  },
  {
    id: "PD-3", title: "Sistem Kasir & POS Cloud", vendor: "RevTech Studio", category: "Script / Tools",
    thumbnail: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", 
    content: "<p>Aplikasi Point of Sale (POS) lengkap berbasis web yang siap dideploy untuk bisnis retail atau F&B Anda. Sistem ini mendukung pelacakan stok real-time melintasi berbagai cabang.</p><h3>Fitur Sistem</h3><ul><li>Manajemen Inventori & Peringatan Stok Menipis</li><li>Laporan Penjualan Harian, Mingguan, Bulanan</li><li>Dukungan Scanner Barcode & Printer Thermal</li><li>Manajemen Hak Akses Karyawan</li></ul><p>Tersedia beserta <em>source code</em> lengkap dan panduan instalasi di server VPS atau shared hosting Anda.</p>", 
    url: "#",
    description: "Aplikasi kasir Point of Sale lengkap dengan manajemen inventori dan laporan multi-cabang.", techStack: ["Laravel 11", "Vue 3", "MySQL"],
    pinned: true, price: "Mulai dari Rp 1.500.000", status: "published"
  }
];

const EMPTY_FORM: {
  title: string; vendor: string; category: string; url: string; description: string; techStack: string; pinned: boolean; price: string; status: ProdukDigital["status"]; content: string; thumbnail: string;
} = {
  title: "", vendor: "", category: "",
  url: "", description: "", techStack: "", pinned: false, price: "", status: "published", content: "", thumbnail: ""
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function ProdukDigitalPage() {
  const [isClient, setIsClient] = useState(false);
  const [items, setItems] = useState<ProdukDigital[]>([]);
  const [filter, setFilter] = useState("Semua");
  const [tabFilter, setTabFilter] = useState("all");
  const [view, setView] = useState<"list" | "form">("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [toast, setToast] = useState<{ isVisible: boolean; message: string; type: "success" | "error" }>({ isVisible: false, message: "", type: "success" });
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; action: () => void; title: string; message: string; confirmText: string; confirmVariant: "danger" | "primary" | "warning" }>({ isOpen: false, action: () => {}, title: "", message: "", confirmText: "", confirmVariant: "danger" });
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm(prev => ({ ...prev, thumbnail: reader.result as string }));
      setToast({ isVisible: true, message: "Gambar berhasil diunggah", type: "success" });
    };
    reader.readAsDataURL(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/*': [] }, maxFiles: 1,
  });

  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem("revtech_produk_digital_v2");
    setItems(saved ? JSON.parse(saved) : MOCK_INITIAL);
    if (!saved) localStorage.setItem("revtech_produk_digital_v2", JSON.stringify(MOCK_INITIAL));

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
  }, []);

  function save(newItems: ProdukDigital[]) {
    setItems(newItems);
    localStorage.setItem("revtech_produk_digital_v2", JSON.stringify(newItems));
  }

  function handleEdit(item: ProdukDigital) {
    setForm({
      title: item.title, vendor: item.vendor, category: item.category,
      url: item.url || "", description: item.description || "", techStack: item.techStack.join(", "),
      pinned: item.pinned, price: item.price || "", status: item.status, content: item.content || "", thumbnail: item.thumbnail || ""
    });
    setEditingId(item.id);
    setView("form");
  }

  function confirmDelete(id: string) {
    setConfirmModal({
      isOpen: true, title: "Hapus Produk",
      message: "Produk digital ini akan dihapus secara permanen.",
      confirmText: "Hapus", confirmVariant: "danger",
      action: () => {
        save(items.filter(i => i.id !== id));
        setToast({ isVisible: true, message: "Produk berhasil dihapus", type: "success" });
      }
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const techArr = form.techStack.split(",").map(s => s.trim()).filter(Boolean);
    let updated = [...items];

    if (editingId) {
      updated = items.map(i => i.id === editingId ? {
        ...i, title: form.title, vendor: form.vendor, category: form.category,
        url: form.url || null, description: form.description,
        techStack: techArr, pinned: form.pinned, price: form.price, status: form.status,
        content: form.content, thumbnail: form.thumbnail
      } : i);
    } else {
      const newId = `PD-${Date.now().toString().slice(-5)}`;
      updated = [{
        id: newId,
        title: form.title, vendor: form.vendor, category: form.category,
        url: form.url || null, description: form.description,
        techStack: techArr, pinned: form.pinned, price: form.price, thumbnail: form.thumbnail,
        content: form.content, status: form.status
      }, ...items];
    }

    save(updated);
    setView("list");
    setEditingId(null);
    setForm(EMPTY_FORM);
    setToast({ isVisible: true, message: form.status === "draft" ? "Draft berhasil disimpan" : "Produk berhasil dipublish", type: "success" });
  }

  function confirmArchive(id: string, currentStatus: string) {
    const isArchived = currentStatus === "archived";
    save(items.map(i => i.id === id ? { ...i, status: isArchived ? "draft" : "archived" } : i));
    setToast({ isVisible: true, message: isArchived ? "Produk dikembalikan ke Draft" : "Produk berhasil diarsipkan", type: "success" });
  }

  function confirmPublish(id: string) {
    save(items.map(i => i.id === id ? { ...i, status: "published" } : i));
    setToast({ isVisible: true, message: "Produk berhasil diterbitkan", type: "success" });
  }

  function togglePinned(id: string) {
    save(items.map(i => i.id === id ? { ...i, pinned: !i.pinned } : i));
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
    const searchString = `${item.title} ${item.vendor}`.toLowerCase();
    const matchSearch = !search || searchString.includes(search.toLowerCase());

    return matchTab && matchCategory && matchSearch;
  });

  const produkColumns = [
    {
      key: "produk",
      label: "Produk Digital",
      render: (item: ProdukDigital) => (
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <button onClick={() => togglePinned(item.id)} className={`shrink-0 p-1.5 transition-colors focus:outline-none ${item.pinned ? "text-[var(--adm-text)]" : "text-[var(--adm-text-3)] hover:text-[var(--adm-text)]"}`} title={item.pinned ? "Lepaskan Pin" : "Sematkan"}>
            <Pin size={14} strokeWidth={2} className={item.pinned ? "fill-current rotate-45" : ""} />
          </button>
          <div className="w-16 h-12 rounded-lg bg-[var(--adm-border)] flex items-center justify-center shrink-0 overflow-hidden">
            {item.thumbnail ? (
              <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
            ) : (
              <span className="material-symbols-outlined text-[var(--adm-text-3)] text-[24px]">inventory_2</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <p className={`font-bold text-sm truncate ${item.status === "draft" ? "text-[var(--adm-text-3)]" : "text-[var(--adm-text)]"}`}>{item.title}</p>
              {item.status === "archived" && <StatusBadge label="Archived" variant="slate" />}
            </div>
            <p className="text-xs text-[var(--adm-text-3)] truncate">{item.category} · {item.vendor}{item.price ? ` · ${item.price}` : ''}</p>
          </div>
        </div>
      )
    },
    {
      key: "aksi",
      label: "Aksi",
      className: "text-right",
      render: (item: ProdukDigital) => (
        <div className="flex items-center justify-end gap-3 sm:gap-5">
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
            <button onClick={() => confirmDelete(item.id)} className="inline-flex items-center justify-center p-1.5 text-[var(--adm-text-3)] hover:text-red-500 transition-colors focus:outline-none" title="Hapus">
              <Trash2 size={14} strokeWidth={2} />
            </button>
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
        searchPlaceholder="Cari produk atau vendor..."
        dropdown={
          <div className="flex items-center h-full">
            <div className="relative flex items-center shrink-0">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="appearance-none bg-transparent py-2.5 pl-4 pr-8 text-sm font-semibold text-[var(--adm-text)] focus:outline-none cursor-pointer"
              >
                <option value="Semua" className="bg-[var(--adm-card)] text-[var(--adm-text)]">Semua Kategori</option>
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
        addLabel="Tambah Produk"
      />

      {view === "list" && (
        <>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-4 sm:gap-0">
            <AdminTabs tabs={TABS} activeTab={tabFilter} onTabChange={setTabFilter} />
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

          {filtered.length === 0 ? (
            <EmptyState icon="inventory_2" title="Belum ada produk digital" description="Tambahkan produk digital pertama Anda ke katalog." />
          ) : (
            <div className="mt-4">
              <AdminTable
                columns={produkColumns}
                data={filtered}
                keyField="id"
                emptyMessage="Belum ada produk digital ditambahkan."
              />
            </div>
          )}
        </>
      )}

      {/* Form */}
      {view === "form" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => { setForm(prev => ({ ...prev, status: "draft" })); document.getElementById("produk-form")?.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true })); }}
              className="px-4 py-2.5 text-sm font-bold text-[var(--adm-text-2)] hover:text-[var(--adm-text)] transition-colors"
            >
              Simpan Draft
            </button>
            <button
              type="button"
              onClick={() => { setForm(prev => ({ ...prev, status: "published" })); document.getElementById("produk-form")?.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true })); }}
              className="px-5 py-2.5 rounded-xl bg-[var(--adm-accent)] text-white text-sm font-bold hover:brightness-110 transition-all flex items-center gap-2 shadow-sm"
            >
              <Send size={16} strokeWidth={2.5} /> Publish
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Title + Editor */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              <div className="bg-[var(--adm-card)] rounded-2xl border border-[var(--adm-border)] shadow-sm flex flex-col overflow-hidden">
                <div className="px-5 pt-5 pb-4 border-b border-[var(--adm-border)]">
                  <h2 className="text-lg font-bold text-[var(--adm-text)] mb-4">{editingId ? "Edit Produk Digital" : "Tambah Produk Baru"}</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-[var(--adm-text-2)] mb-1.5 block">Nama Produk *</label>
                      <input required type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl border border-[var(--adm-border)] bg-transparent text-[var(--adm-text)] placeholder:text-[var(--adm-text-3)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--adm-accent)]/20 focus:border-[var(--adm-accent)]"
                        placeholder="Masukkan nama produk digital..." />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-[var(--adm-text-2)] mb-1.5 block">Deskripsi Singkat</label>
                      <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl border border-[var(--adm-border)] bg-transparent text-[var(--adm-text)] placeholder:text-[var(--adm-text-3)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--adm-accent)]/20 focus:border-[var(--adm-accent)] resize-none"
                        rows={2} placeholder="Masukkan deskripsi singkat produk..." />
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <div className="rounded-xl border border-[var(--adm-border)] overflow-hidden [&_.quill]:flex [&_.quill]:flex-col [&_.quill]:h-full [&_.ql-toolbar]:border-x-0 [&_.ql-toolbar]:border-t-0 [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-[var(--adm-border)] [&_.ql-toolbar]:bg-[var(--adm-bg)] [&_.ql-container]:border-none [&_.ql-editor]:min-h-[450px] [&_.ql-editor]:max-h-[600px] [&_.ql-editor]:overflow-y-auto [&_.ql-editor]:text-base [&_.ql-editor]:text-[var(--adm-text)] [&_.ql-editor]:leading-relaxed [&_.ql-editor]:p-5">
                    <style>{`
                      .ql-container.ql-snow { border: none !important; }
                      .ql-toolbar.ql-snow { border: none !important; border-bottom: 1px solid var(--adm-border) !important; }
                      .ql-editor, .ql-editor * { color: var(--adm-text) !important; background-color: transparent !important; }
                      .ql-editor.ql-blank::before { color: var(--adm-text-3) !important; font-style: italic; }
                      .ql-snow .ql-stroke { stroke: var(--adm-text-2); }
                      .ql-snow .ql-fill { fill: var(--adm-text-2); }
                      .ql-snow .ql-picker { color: var(--adm-text-2); }
                      .ql-snow.ql-toolbar button:hover .ql-stroke, .ql-snow.ql-toolbar button.ql-active .ql-stroke { stroke: var(--adm-text) !important; }
                      .ql-snow .ql-picker-options { background-color: var(--adm-card) !important; border: none !important; border-radius: 0.75rem; padding: 0.5rem; box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1); }
                    `}</style>
                    <ReactQuill
                      theme="snow"
                      value={form.content}
                      onChange={(value) => setForm({ ...form, content: value })}
                      modules={QUILL_MODULES}
                      placeholder="Tulis deskripsi lengkap, fitur, atau detail produk digital..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Thumbnail + Details */}
            <div className="lg:col-span-1 h-full">
              <form id="produk-form" onSubmit={handleSubmit} className="bg-[var(--adm-card)] rounded-2xl border border-[var(--adm-border)] shadow-sm flex flex-col overflow-hidden h-full">
                {/* Thumbnail */}
                <div className="p-5 border-b border-[var(--adm-border)] space-y-3">
                  <h3 className="text-sm font-bold text-[var(--adm-text)] border-b border-[var(--adm-border)] pb-3 mb-3">Gambar Produk</h3>
                  {form.thumbnail ? (
                    <div className="w-full rounded-xl border border-[var(--adm-border)] overflow-hidden relative group">
                      <button type="button" onClick={() => setPreviewImage(form.thumbnail)} className="block w-full text-left">
                        <img src={form.thumbnail} alt="Thumbnail" className="w-full h-40 object-cover cursor-pointer hover:opacity-90 transition-opacity" />
                      </button>
                      <div className="absolute top-3 right-3 flex items-center gap-2">
                        <label className="p-2 rounded-lg bg-black/50 hover:bg-black/80 text-white cursor-pointer transition-colors backdrop-blur-md border border-white/10" title="Ganti">
                          <Pencil size={14} />
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onloadend = () => { setForm({ ...form, thumbnail: reader.result as string }); };
                            reader.readAsDataURL(file);
                          }} />
                        </label>
                        <button type="button" onClick={() => setForm({ ...form, thumbnail: "" })} className="p-2 rounded-lg bg-black/50 hover:bg-red-500/90 text-white transition-colors backdrop-blur-md border border-white/10" title="Hapus">
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
                        <p className="text-sm font-bold text-[var(--adm-text)]">{isDragActive ? "Lepaskan..." : "Klik atau seret file"}</p>
                        <p className="text-xs text-[var(--adm-text-3)] mt-1">PNG, JPG, WEBP maks 5MB</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Detail */}
                <div className="p-5 flex-1 flex flex-col gap-4">
                  <h3 className="text-xs font-bold text-[var(--adm-text-2)] uppercase tracking-wide border-b border-[var(--adm-border)] pb-3">Detail Produk</h3>

                  <div>
                    <label className="text-xs font-bold text-[var(--adm-text-2)] mb-1.5 block">Vendor / Pembuat *</label>
                    <input required type="text" value={form.vendor} onChange={e => setForm({ ...form, vendor: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[var(--adm-border)] bg-transparent text-[var(--adm-text)] placeholder:text-[var(--adm-text-3)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--adm-accent)]/20 focus:border-[var(--adm-accent)]"
                      placeholder="Contoh: RevTech Studio" />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[var(--adm-text-2)] mb-1.5 block">Kategori *</label>
                    <input required type="text" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[var(--adm-border)] bg-transparent text-[var(--adm-text)] placeholder:text-[var(--adm-text-3)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--adm-accent)]/20 focus:border-[var(--adm-accent)]"
                      placeholder="Contoh: Template Web, Plugin, dll" />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[var(--adm-text-2)] mb-1.5 block">Harga</label>
                    <input type="text" value={form.price || ""} onChange={e => setForm({ ...form, price: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[var(--adm-border)] bg-transparent text-[var(--adm-text)] placeholder:text-[var(--adm-text-3)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--adm-accent)]/20 focus:border-[var(--adm-accent)]"
                      placeholder="Contoh: Rp 50.000 atau Gratis" />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[var(--adm-text-2)] mb-1.5 block">URL Produk / Demo</label>
                    <input type="text" value={form.url || ""} onChange={e => setForm({ ...form, url: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[var(--adm-border)] bg-transparent text-[var(--adm-text)] placeholder:text-[var(--adm-text-3)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--adm-accent)]/20 focus:border-[var(--adm-accent)]"
                      placeholder="Contoh: demo.revtech.id" />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[var(--adm-text-2)] mb-1.5 block">Tech Stack (pisah koma)</label>
                    <input type="text" value={form.techStack} onChange={e => setForm({ ...form, techStack: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[var(--adm-border)] bg-transparent text-[var(--adm-text)] placeholder:text-[var(--adm-text-3)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--adm-accent)]/20 focus:border-[var(--adm-accent)]"
                      placeholder="Contoh: Next.js, Tailwind CSS" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="flex items-center gap-2 cursor-pointer py-2">
                        <input type="checkbox" checked={form.pinned} onChange={e => setForm({ ...form, pinned: e.target.checked })} className="w-4 h-4 rounded accent-[var(--adm-accent)]" />
                        <span className="text-xs font-bold text-[var(--adm-text-2)]">Sematkan Produk (Tampil Lebih Awal)</span>
                      </label>
                    </div>
                  </div>

                </div>
              </form>
            </div>
          </div>
        </motion.div>
      )}

      {/* Confirm Modal + Toast */}
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setPreviewImage(null)}
          >
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center justify-center"
              onClick={e => e.stopPropagation()}
            >
              <button type="button" onClick={() => setPreviewImage(null)}
                className="absolute -top-12 right-0 p-2 text-white/70 hover:text-white transition-colors bg-white/10 rounded-full hover:bg-white/20">
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
