"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import JSZip from "jszip";
import { AdminCard } from "@/components/admin/ui";
import { getEngineContent, buildAgentsContent, saveEngineContent, getAgentsTemplate, saveAgentsTemplate, AGENTS_TEMPLATE_DEFAULT } from "@/lib/sopStore";
import { REVTECH_ENGINE_DEFAULT } from "@/lib/revtechEngineDefault";
import { logActivity } from "@/lib/activityLog";
import { useUser } from "@/contexts/UserContext";
import {
  Lightbulb, Cpu, HelpCircle, Rocket, ArrowRight, ArrowLeft,
  Wand2, Wrench, Loader2, Copy, Check, FileText, FolderTree,
  ListChecks, TriangleAlert, Download, Package, Palette, Layout,
  ServerCog, Bot, FileArchive, Search, Sparkles, BookMarked, RotateCcw, Save, Settings, CheckCircle2, Camera, Send, RefreshCw
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────────

type Step = 1 | 2 | 3 | 4;
type DocKey = "agents" | "engine" | "prd" | "brand" | "design" | "architecture" | "manifest";

interface ProjectData {
  projectName: string;
  description: string;
  audience: string;
  features: string;
  stylePreference: string;
  logo: string | null;
  hasLogo: boolean;
  referenceImage: string | null;
  referenceNotes: string;
}

interface ManualStack {
  language: string;
  styling: string;
  frontend: string;
  backend: string;
  database: string;
  deployment: string;
}

interface Question {
  id: string;
  question: string;
  hint: string;
}

type GeneratedDocs = Record<DocKey, string>;

// ── Constant options ───────────────────────────────────────────────────────────

// Removed manual options

const DOC_META: { key: DocKey; icon: React.ElementType; label: string; filename: string; title: string }[] = [
  { key: "agents",       icon: Bot,        label: "AGENTS",       filename: "AGENTS.md",              title: "🤖 AGENTS.md — Pintu Masuk AI" },
  { key: "engine",       icon: ServerCog,  label: "Engine",       filename: "revtech-engine.md",      title: "⚙️ RevTech Engine — SOP Universal" },
  { key: "prd",          icon: FileText,   label: "PRD",          filename: "docs/prd.md",             title: "📄 Product Requirement Document" },
  { key: "brand",        icon: Palette,    label: "Brand",        filename: "docs/brand.md",           title: "🎨 Brand Guide" },
  { key: "design",       icon: Layout,     label: "Design",       filename: "docs/design.md",          title: "🖥️ Design System" },
  { key: "architecture", icon: ServerCog,  label: "Architecture", filename: "docs/architecture.md",    title: "⚙️ Architecture" },
  { key: "manifest",     icon: ListChecks, label: "Manifest",     filename: "docs/manifest.md",        title: "📋 Manifest — Task Checklist" },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

function buildStackLabel(stack: ManualStack) {
  return `Frontend: ${stack.frontend} | Backend: ${stack.backend} | Database: ${stack.database} | Deployment: ${stack.deployment}`;
}

// ── Mock docs builder ──────────────────────────────────────────────────────────

function buildMockDocs(data: ProjectData, stackLabel: string): GeneratedDocs {
  return {
    agents: buildAgentsContent({
      projectName: data.projectName || "Proyek Baru",
      idea: data.description,
      techStack: stackLabel,
    }),

    engine: getEngineContent(),

    prd: `# Product Requirement Document (PRD)

## 1. Latar Belakang

${data.description}

## 2. Tujuan Produk

Membangun solusi digital yang memudahkan operasional bisnis, meningkatkan efisiensi, dan memberikan pengalaman pengguna yang premium.

## 3. Tech Stack

${stackLabel}

## 4. User Personas

${data.audience.split(',').map(a => `### ${a.trim()}\n- Akses fitur yang relevan dengan peran ${a.trim()}`).join('\n\n')}

## 5. User Stories

- Sebagai pengguna, saya ingin dapat menggunakan sistem dengan mudah sesuai peran.
- (Akan disesuaikan lebih spesifik oleh AI berdasarkan role: ${data.audience})

## 6. Fitur Utama

${data.features ? data.features.split('\n').map(f => `- [ ] ${f.trim()}`).join('\n') : '- [ ] Fitur standar'}

## 7. Non-Functional Requirements

- Waktu loading halaman < 2 detik
- Responsif di semua ukuran layar (mobile-first)
- WCAG AA accessibility compliance
- Data dienkripsi saat transit (HTTPS)`,

    brand: `# Brand Guide

## Identitas Visual

### Nama Produk
${data.projectName}

### Tone of Voice
- **Profesional** namun tetap hangat
- **Tegas** dan **to the point**
- Gunakan bahasa Indonesia yang baik dan formal di konten produk

### Gaya Visual
- **${data.stylePreference}**

${data.referenceImage ? `### Gambar Referensi\n> ⚠️ **PENTING**: Pengguna telah melampirkan sebuah gambar referensi desain. AI harus mempelajari dan mereplikasi struktur layout, rasio elemen, dan suasana (vibe) dari referensi tersebut ke dalam desain UI.\n${data.referenceNotes ? `> 📝 **Catatan Tambahan untuk Referensi**: ${data.referenceNotes}\n` : ''}` : ''}
${data.logo ? `### Referensi Logo\n> ⚠️ **PENTING**: Logo telah diunggah oleh pengguna.\n> Warna utama (Primary) dan radius desain (border-radius) harus diekstrak dan disesuaikan secara dinamis dari file logo bisnis tersebut.\n` : ''}
## Palet Warna

### Warna Utama (Primary)
${data.logo ? '*(Menyesuaikan warna dominan logo yang diunggah)*' : `\`\`\`
Primary:    #6366F1  (Indigo-500)
Primary Dk: #4F46E5  (Indigo-600)
\`\`\``}

### Warna Pendukung
\`\`\`
Success:  #10B981  (Emerald-500)
Warning:  #F59E0B  (Amber-500)
Danger:   #EF4444  (Red-500)
Info:     #3B82F6  (Blue-500)
\`\`\`

### Warna Netral
\`\`\`
Background:   #F8FAFC
Card:         #FFFFFF
Border:       #E2E8F0
Text Primary: #0F172A
Text Muted:   #64748B
\`\`\`

## Tipografi

\`\`\`
Font Utama:   'Inter', sans-serif
Font Kode:    'JetBrains Mono', monospace
\`\`\`

### Skala Font
\`\`\`
Heading 1:  2.25rem / font-bold
Heading 2:  1.5rem  / font-bold
Heading 3:  1.25rem / font-semibold
Body:       0.875rem / font-medium
Caption:    0.75rem  / font-semibold
\`\`\`

## Logo & Ikonografi
- Gunakan Lucide React sebagai library ikon utama
- Ikon berukuran 18-24px untuk UI standar
- Selalu gunakan \`strokeWidth={2}\` sebagai default`,

    design: `# Design System

## Prinsip Desain

1. **Clean & Premium** — hindari elemen dekoratif yang tidak fungsional
2. **Consistent Spacing** — gunakan skala spacing yang konsisten
3. **Mobile-First** — desain dari layar terkecil ke terbesar
4. **Target Gaya Visual** — ${data.stylePreference}
${data.logo ? '5. **Adaptif terhadap Logo** — Sesuaikan kelengkungan komponen (border-radius) dengan bentuk dominan logo.' : ''}

## Spacing Scale

\`\`\`
xs:  4px   (0.25rem)
sm:  8px   (0.5rem)
md:  12px  (0.75rem)
lg:  16px  (1rem)
xl:  24px  (1.5rem)
2xl: 32px  (2rem)
3xl: 48px  (3rem)
\`\`\`

## Border Radius

\`\`\`
sm:   6px   (rounded)
md:   12px  (rounded-xl)
lg:   16px  (rounded-2xl)
full: 9999px (rounded-full)
\`\`\`

## Komponen Standar

### Button
\`\`\`tsx
// Primary
<button className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition-colors">
  Label
</button>

// Secondary  
<button className="px-6 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors">
  Label
</button>
\`\`\`

### Input Field
\`\`\`tsx
<input className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all" />
\`\`\`

### Card
\`\`\`tsx
<div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
  {/* card content */}
</div>
\`\`\`

## Animasi (Framer Motion)

\`\`\`tsx
// Page transition
initial={{ opacity: 0, y: 8 }}
animate={{ opacity: 1, y: 0 }}
exit={{ opacity: 0, y: -8 }}
transition={{ duration: 0.2 }}

// Hover card
whileHover={{ y: -2 }}
transition={{ type: "spring", stiffness: 300 }}
\`\`\`

## Responsive Breakpoints

\`\`\`
sm:  640px   (Tablet kecil)
md:  768px   (Tablet)
lg:  1024px  (Desktop kecil)
xl:  1280px  (Desktop)
2xl: 1536px  (Wide screen)
\`\`\``,

    architecture: `# Architecture Document

## Tech Stack

${stackLabel}

## Struktur Folder

\`\`\`text
📦 project-root/
├── 📁 src/
│   ├── 📁 app/
│   │   ├── 📁 (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── 📁 (dashboard)/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   └── [feature]/page.tsx
│   │   ├── 📁 api/
│   │   │   └── [...routes]/route.ts
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── 📁 components/
│   │   ├── 📁 ui/          ← Komponen atom (Button, Input, Card)
│   │   ├── 📁 shared/      ← Komponen bersama (Header, Sidebar)
│   │   └── 📁 features/    ← Komponen per fitur
│   ├── 📁 lib/
│   │   ├── utils.ts        ← Helper functions
│   │   ├── validations.ts  ← Zod schemas
│   │   └── constants.ts    ← Konstanta global
│   ├── 📁 hooks/           ← Custom React hooks
│   ├── 📁 types/           ← TypeScript type definitions
│   └── 📁 store/           ← State management
├── 📁 public/
├── 📄 AGENTS.md
├── 📄 .env.local
├── 📄 next.config.js
└── 📄 package.json
\`\`\`

## State Management

- **Server State:** Supabase realtime / SWR untuk data fetching
- **Client State:** useState untuk state lokal komponen
- **Global State:** Hanya jika data benar-benar shared (Zustand/Context)

## Data Flow

\`\`\`
User Action → Component → Server Action / API Route → Database → Response → UI Update
\`\`\`

## Autentikasi

- Gunakan session-based auth (Supabase Auth / NextAuth.js)
- Proteksi route di middleware.ts
- Role check di server-side sebelum render`,

    manifest: `# Manifest — Task Checklist

> Kerjakan dari atas ke bawah. Tandai \`[x]\` setelah setiap task selesai.
> Pastikan sudah membaca semua dokumen di AGENTS.md sebelum mulai.

## Fase 1: Setup Project

- [ ] Inisialisasi project dengan tech stack: ${stackLabel}
- [ ] Konfigurasi \`.env.local\` dengan variabel yang diperlukan
- [ ] Setup Tailwind CSS dengan palet warna dari \`docs/brand.md\`
- [ ] Install dependensi utama (Framer Motion, Lucide React, Zod)
- [ ] Setup TypeScript strict mode

## Fase 2: Fondasi & Layout

- [ ] Buat layout utama (RootLayout, DashboardLayout)
- [ ] Implementasi sistem routing sesuai \`docs/architecture.md\`
- [ ] Buat komponen UI dasar (Button, Input, Card, Badge) sesuai \`docs/design.md\`
- [ ] Buat komponen Sidebar dan Header navigasi
- [ ] Setup dark mode / light mode toggle

## Fase 3: Autentikasi

- [ ] Implementasi halaman Login
- [ ] Implementasi halaman Register
- [ ] Setup middleware untuk proteksi route
- [ ] Implementasi role-based access control sesuai \`docs/prd.md\`

## Fase 4: Fitur Utama

- [ ] Buat halaman Dashboard dengan statistik
- [ ] Implementasi manajemen data utama (CRUD)
- [ ] Buat sistem notifikasi real-time
- [ ] Implementasi laporan dan ekspor data

## Fase 5: Finishing

- [ ] Testing semua fitur secara menyeluruh
- [ ] Optimasi performa (lazy loading, image optimization)
- [ ] Pastikan responsif di semua ukuran layar
- [ ] Deployment ke: ${stackLabel.includes("Vercel") ? "Vercel" : "production server"}

## Catatan Penting

- Setiap komponen harus reusable dan tidak hardcode data
- Semua form harus ada validasi dengan Zod
- Kode harus bisa di-review oleh engineer lain tanpa konteks tambahan`,
  };
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function StudioPage() {
  const [step, setStep]           = useState<Step>(1);
  const [projectData, setProjectData] = useState<ProjectData>({
    projectName: "",
    description: "",
    audience: "",
    features: "",
    stylePreference: "Auto-adapt dari Logo",
    logo: null,
    hasLogo: true,
    referenceImage: null,
    referenceNotes: "",
  });
  const [chatHistory, setChatHistory] = useState<{sender: 'user' | 'ai', text: string}[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatting, setIsChatting] = useState(false);
  const [aiStack, setAiStack]         = useState<(ManualStack & { reason: string }) | null>(null);
  const [questions, setQuestions]     = useState<Question[]>([]);
  const [answers, setAnswers]         = useState<Record<string, string>>({});
  const [docs, setDocs]               = useState<GeneratedDocs | null>(null);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");
  const [activeDoc, setActiveDoc]     = useState<DocKey>("agents");
  const [copied, setCopied]           = useState(false);
  const [downloading, setDownloading] = useState(false);

  const { user } = useUser();

  // ── SOP Manager state ────────────────────────────────────────────────────────
  const [isSopModalOpen, setIsSopModalOpen] = useState(false);
  const [sopTab, setSopTab] = useState<"engine" | "agents">("engine");
  const [engineContent, setEngineContent] = useState(() => getEngineContent());
  const [agentsTemplate, setAgentsTemplate] = useState(() => getAgentsTemplate());
  const [sopSaved, setSopSaved] = useState(false);
  const [isSopSaving, setIsSopSaving] = useState(false);

  // ── File Upload state ────────────────────────────────────────────────────────
  const fileInputRef = useRef<HTMLInputElement>(null);
  const refFileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProjectData({...projectData, logo: reader.result as string, stylePreference: "Auto-adapt dari Logo"});
        if (fileInputRef.current) fileInputRef.current.value = "";
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRefFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProjectData({...projectData, referenceImage: reader.result as string});
        if (refFileInputRef.current) refFileInputRef.current.value = "";
      };
      reader.readAsDataURL(file);
    }
  };

  function saveSOP() {
    setIsSopSaving(true);
    setTimeout(() => {
      if (sopTab === "engine") saveEngineContent(engineContent);
      else saveAgentsTemplate(agentsTemplate);
      logActivity({
        type: "system",
        title: "Dokumen SOP",
        description: `${sopTab === "engine" ? "RevTech Engine" : "AGENTS Template"} diperbarui`,
        user: user.name,
      });
      setIsSopSaving(false);
      setSopSaved(true);
      setTimeout(() => setSopSaved(false), 2500);
    }, 600);
  }

  function resetSOP() {
    if (sopTab === "engine") setEngineContent(REVTECH_ENGINE_DEFAULT);
    else setAgentsTemplate(AGENTS_TEMPLATE_DEFAULT);
  }

  const effectiveStack = aiStack ? buildStackLabel(aiStack) : "";

  // ── Step 2 AI recommendation (MOCKED) ──────────────────────────────────────

  async function getAIStack() {
    setLoading(true);
    setError("");
    setTimeout(() => {
      setAiStack({
        language: "TypeScript",
        styling: "Tailwind CSS",
        frontend: "Next.js (React)",
        backend: "Node.js (Express/NestJS)",
        database: "PostgreSQL",
        deployment: "Vercel / Netlify",
        reason: "Kombinasi modern ini sangat optimal untuk MVP cepat dengan performa tinggi dan skalabilitas yang baik.",
      });
      setChatHistory([
        { sender: 'ai', text: "Ini rekomendasi awal tech stack berdasarkan ide proyek Anda. Apakah ada preferensi khusus? (Misalnya: 'Tolong gunakan PHP' atau 'Saya butuh stack yang paling hemat biaya')." }
      ]);
      setLoading(false);
    }, 1500);
  }

  async function sendChatMessage() {
    if (!chatInput.trim()) return;
    
    const newMessage = { sender: 'user' as const, text: chatInput };
    setChatHistory(prev => [...prev, newMessage]);
    setChatInput("");
    setIsChatting(true);

    setTimeout(() => {
      setAiStack(prev => prev ? {
        ...prev,
        backend: chatInput.toLowerCase().includes('php') || chatInput.toLowerCase().includes('laravel') ? "Laravel (PHP)" : prev.backend,
        database: chatInput.toLowerCase().includes('mysql') ? "MySQL" : prev.database,
        reason: "Telah disesuaikan berdasarkan permintaan spesifik Anda."
      } : prev);
      
      setChatHistory(prev => [...prev, {
        sender: 'ai',
        text: "Baik, saya telah menyesuaikan tech stack sesuai permintaan Anda. Silakan tinjau kembali, apakah sudah pas?"
      }]);
      setIsChatting(false);
    }, 2000);
  }

  // ── Step 3 generate questions (MOCKED) ─────────────────────────────────────

  async function getQuestions() {
    setLoading(true);
    setError("");
    setQuestions([]);
    setAnswers({});
    setTimeout(() => {
      setQuestions([
        { id: "q1", question: "Apakah butuh integrasi printer thermal Bluetooth?", hint: "Contoh: Ya, untuk cetak struk dapur dan pelanggan." },
        { id: "q2", question: "Ada berapa role user dalam sistem ini?", hint: "Contoh: Admin, Kasir, Dapur, Pelanggan." },
        { id: "q3", question: "Apakah diperlukan fitur laporan penjualan bulanan dalam bentuk grafik?", hint: "Contoh: Ya, penting untuk pantau omset." },
      ]);
      setStep(3);
      setLoading(false);
    }, 1500);
  }

  // ── Step 4 generate docs (MOCKED) ──────────────────────────────────────────

  async function generateDocs() {
    setLoading(true);
    setError("");
    setTimeout(() => {
      setDocs(buildMockDocs(projectData, effectiveStack));
      setActiveDoc("agents");
      setStep(4);
      setLoading(false);
      
      logActivity({
        type: "studio_export",
        title: "Dokumen Proyek Di-generate",
        description: `AI berhasil merancang arsitektur dan membuat dokumen untuk proyek "${projectData.projectName || 'Baru'}"`,
        user: user.name,
      });
    }, 2000);
  }

  // ── Download single .md ─────────────────────────────────────────────────────

  function handleDownloadSingle() {
    if (!docs) return;
    const meta = DOC_META.find(d => d.key === activeDoc)!;
    const blob = new Blob([docs[activeDoc]], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = meta.filename.replace("docs/", "");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // ── Download all as ZIP ─────────────────────────────────────────────────────

  async function handleDownloadZip() {
    if (!docs) return;
    setDownloading(true);
    try {
      const zip = new JSZip();
      const docsFolder = zip.folder("docs")!;

      // AGENTS.md and revtech-engine.md at root
      zip.file("AGENTS.md", docs.agents);
      zip.file("revtech-engine.md", docs.engine);

      // All other docs inside docs/
      DOC_META.filter(d => d.key !== "agents" && d.key !== "engine").forEach(d => {
        docsFolder.file(`${d.key}.md`, docs[d.key]);
      });

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `revtech-context-${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }

  // ── Copy active doc ─────────────────────────────────────────────────────────

  function handleCopy() {
    if (!docs) return;
    navigator.clipboard.writeText(docs[activeDoc]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function reset() {
    setStep(1); 
    setProjectData({
      projectName: "",
      description: "",
      audience: "",
      features: "",
      stylePreference: "Auto-adapt dari Logo",
      logo: null,
      hasLogo: true,
      referenceImage: null,
      referenceNotes: "",
    });

    setQuestions([]); setAnswers({}); setDocs(null); setError("");
  }

  // ── Step Indicator ──────────────────────────────────────────────────────────

  const STEPS = [
    { n: 1 as Step, icon: Lightbulb, label: "Ide" },
    { n: 2 as Step, icon: Cpu, label: "Teknologi" },
    { n: 3 as Step, icon: HelpCircle, label: "Klarifikasi" },
    { n: 4 as Step, icon: Rocket, label: "Dokumen" },
  ];

  return (
    <div>
      <div className="pt-2" />

      {/* Header Container */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 w-full">
        {/* Step Indicator */}
        <div className="flex items-center gap-0 w-full max-w-2xl pl-2">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const done = step > s.n;
          const active = step === s.n;
          return (
            <div key={s.n} className="flex items-center flex-1">
              <div className="flex flex-col items-center gap-2 flex-1 relative">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 z-10 ${
                  done ? "bg-[var(--adm-accent)] text-white shadow-sm" :
                  active ? "bg-[var(--adm-accent)] text-white shadow-lg shadow-[var(--adm-accent)]/30 ring-4 ring-[var(--adm-accent)]/20 scale-110" :
                  "bg-[var(--adm-card)] border-2 border-[var(--adm-border)] text-[var(--adm-text-3)]"
                }`}>
                  {done ? <Check size={18} strokeWidth={3} /> : <Icon size={18} strokeWidth={active ? 2.5 : 2} />}
                </div>
                <span className={`text-[11px] font-bold tracking-wide transition-colors ${
                  active ? "text-[var(--adm-text)]" : done ? "text-[var(--adm-text-2)]" : "text-[var(--adm-text-3)]"
                }`}>{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-1 flex-1 mb-8 rounded-full transition-all duration-500 ${step > s.n ? "bg-[var(--adm-accent)]" : "bg-[var(--adm-border)]"}`} />
              )}
            </div>
          );
        })}
        </div>

        {/* Settings Button */}
        <button
          onClick={() => setIsSopModalOpen(true)}
          title="Pengaturan Rules"
          className="flex items-center justify-center hover:text-[var(--adm-text)] hover:scale-110 transition-all text-[var(--adm-text-3)] shrink-0 p-2"
        >
          <Settings size={20} />
        </button>
      </div>

      <AnimatePresence mode="wait">

        {/* ── STEP 1: IDEA ────────────────────────────────────────────────── */}
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <AdminCard title="Spesifikasi Produk">
              <div className="px-6 pb-6 space-y-5">
                <p className="text-sm text-[var(--adm-text-2)] font-medium">Lengkapi detail proyek Anda agar AI dapat menghasilkan dokumen yang spesifik dan terstruktur.</p>
                
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-[var(--adm-text-2)] mb-1.5">Nama Proyek *</label>
                      <input
                        value={projectData.projectName}
                        onChange={e => setProjectData({...projectData, projectName: e.target.value})}
                        className="w-full px-4 py-2.5 rounded-xl border border-[var(--adm-border)] bg-transparent text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--adm-accent)]/30 focus:border-[var(--adm-accent)] text-[var(--adm-text)] placeholder:text-[var(--adm-text-3)] transition-all"
                        placeholder="Masukkan nama proyek (Contoh: RevTech)"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[var(--adm-text-2)] mb-1.5">Target Pengguna</label>
                      <input
                        value={projectData.audience}
                        onChange={e => setProjectData({...projectData, audience: e.target.value})}
                        className="w-full px-4 py-2.5 rounded-xl border border-[var(--adm-border)] bg-transparent text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--adm-accent)]/30 focus:border-[var(--adm-accent)] text-[var(--adm-text)] placeholder:text-[var(--adm-text-3)] transition-all"
                        placeholder="Masukkan target pengguna (Contoh: Admin, Kasir, Pelanggan)"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--adm-text-2)] mb-1.5">Deskripsi Singkat *</label>
                    <textarea
                      value={projectData.description}
                      onChange={e => setProjectData({...projectData, description: e.target.value})}
                      rows={2}
                      className="w-full px-4 py-2.5 rounded-xl border border-[var(--adm-border)] bg-transparent text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--adm-accent)]/30 focus:border-[var(--adm-accent)] text-[var(--adm-text)] placeholder:text-[var(--adm-text-3)] transition-all resize-none"
                      placeholder="Masukkan deskripsi visi atau fungsi utama aplikasi yang ingin dibangun..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--adm-text-2)] mb-1.5">Fitur Wajib</label>
                    <textarea
                      value={projectData.features}
                      onChange={e => setProjectData({...projectData, features: e.target.value})}
                      rows={3}
                      className="w-full px-4 py-2.5 rounded-xl border border-[var(--adm-border)] bg-transparent text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--adm-accent)]/30 focus:border-[var(--adm-accent)] text-[var(--adm-text)] placeholder:text-[var(--adm-text-3)] transition-all resize-none"
                      placeholder="Masukkan fitur wajib:&#10;1. Login OTP&#10;2. Laporan Penjualan&#10;3. Export PDF..."
                    />
                  </div>

                  <div className="pt-2 border-t border-[var(--adm-border)] mt-4">
                    {projectData.hasLogo ? (
                      <div>
                        <label className="block text-xs font-bold text-[var(--adm-text-2)] mb-2">Upload Logo Bisnis</label>
                        <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start bg-transparent border border-[var(--adm-border)] rounded-2xl p-5">
                          <div className={`shrink-0 ${projectData.logo ? 'w-auto max-w-[200px] h-28' : 'w-28 h-28'}`}>
                            <input type="file" ref={fileInputRef} hidden accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} />
                            <div 
                              onClick={() => fileInputRef.current?.click()}
                              className="w-full h-full min-w-[7rem] rounded-2xl flex flex-col gap-1 items-center justify-center bg-transparent border-2 border-dashed border-[var(--adm-border)] hover:border-[var(--adm-accent)]/50 hover:bg-[var(--adm-accent)]/5 text-[var(--adm-text-3)] hover:text-[var(--adm-accent)] cursor-pointer transition-all overflow-hidden relative group p-2"
                            >
                              {projectData.logo ? (
                                <img src={projectData.logo} alt="Logo" className="w-full h-full object-contain" />
                              ) : (
                                <>
                                  <Camera size={24} />
                                  <span className="text-[11px] font-bold">Pilih Logo</span>
                                </>
                              )}
                              
                              {projectData.logo && (
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                  <span className="text-white text-[11px] font-bold">Ubah</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col justify-center h-full pt-1">
                            <p className="text-[13px] text-[var(--adm-text-3)] font-medium leading-relaxed mb-4">
                              AI akan secara otomatis mengekstrak warna utama dan radius lekukan dari logo bisnis Anda untuk diterapkan secara dinamis ke seluruh desain sistem (UI/UX).
                            </p>
                            {projectData.logo ? (
                              <button 
                                onClick={() => setProjectData({...projectData, logo: null, stylePreference: ""})} 
                                className="w-fit text-[12px] font-bold text-red-500 hover:underline flex items-center gap-1.5"
                              >
                                Hapus Logo
                              </button>
                            ) : (
                              <button 
                                onClick={() => setProjectData({...projectData, hasLogo: false, logo: null, stylePreference: ""})} 
                                className="w-fit text-[12px] font-bold text-[var(--adm-accent)] hover:underline flex items-center gap-1.5"
                              >
                                Tidak punya logo? Isi gaya visual manual <ArrowRight size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-xs font-bold text-[var(--adm-text-2)] mb-1.5">Preferensi Visual</label>
                          <select
                            value={projectData.stylePreference}
                            onChange={e => setProjectData({...projectData, stylePreference: e.target.value})}
                            className="w-full px-4 py-2.5 rounded-xl border border-[var(--adm-border)] bg-transparent text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--adm-accent)]/30 focus:border-[var(--adm-accent)] text-[var(--adm-text)] transition-all"
                          >
                            <option value="" disabled hidden>Pilih Tema</option>
                            <option className="bg-[var(--adm-bg)] text-[var(--adm-text)]">Bersih & Sederhana (Minimalis)</option>
                            <option className="bg-[var(--adm-bg)] text-[var(--adm-text)]">Resmi & Profesional (Corporate)</option>
                            <option className="bg-[var(--adm-bg)] text-[var(--adm-text)]">Ceria & Warna-warni (Playful)</option>
                            <option className="bg-[var(--adm-bg)] text-[var(--adm-text)]">Modern & Gelap (Dark Mode)</option>
                            <option className="bg-[var(--adm-bg)] text-[var(--adm-text)]">Mewah & Eksklusif (Luxury)</option>
                          </select>
                          <button 
                            onClick={() => setProjectData({...projectData, hasLogo: true, stylePreference: "Auto-adapt dari Logo"})} 
                            className="mt-3 text-[11px] font-bold text-[var(--adm-accent)] hover:underline"
                          >
                            Batal, saya ingin upload logo
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-[var(--adm-border)] mt-4">
                    <label className="block text-xs font-bold text-[var(--adm-text-2)] mb-2">Upload Gambar Referensi</label>
                    <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start bg-transparent border border-[var(--adm-border)] rounded-2xl p-5">
                      <div className={`shrink-0 ${projectData.referenceImage ? 'w-full sm:w-1/3 max-w-[300px]' : 'w-28 h-28'}`}>
                        <input type="file" ref={refFileInputRef} hidden accept="image/jpeg,image/png,image/webp" onChange={handleRefFileChange} />
                        <div 
                          onClick={() => refFileInputRef.current?.click()}
                          className="w-full h-full min-h-[7rem] rounded-2xl flex flex-col gap-1 items-center justify-center bg-transparent border-2 border-dashed border-[var(--adm-border)] hover:border-[var(--adm-accent)]/50 hover:bg-[var(--adm-accent)]/5 text-[var(--adm-text-3)] hover:text-[var(--adm-accent)] cursor-pointer transition-all overflow-hidden relative group p-2"
                        >
                          {projectData.referenceImage ? (
                            <img src={projectData.referenceImage} alt="Referensi" className="w-full h-auto max-h-[160px] object-contain" />
                          ) : (
                            <>
                              <Layout size={24} />
                              <span className="text-[11px] font-bold text-center leading-tight">Pilih<br/>Gambar</span>
                            </>
                          )}
                          
                          {projectData.referenceImage && (
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                              <span className="text-white text-[11px] font-bold">Ubah</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col justify-center h-full pt-1 flex-1 w-full">
                        {!projectData.referenceImage ? (
                          <p className="text-[13px] text-[var(--adm-text-3)] font-medium leading-relaxed mb-4">
                            Punya contoh aplikasi atau website yang Anda sukai? Unggah tangkapan layarnya (screenshot) di sini. AI akan mempelajari struktur tata letak (layout) dan suasana desain (vibe) dari gambar referensi Anda.
                          </p>
                        ) : (
                          <div className="w-full mb-3">
                            <label className="block text-xs font-bold text-[var(--adm-text-2)] mb-1.5">Catatan Modifikasi Referensi</label>
                            <textarea
                              value={projectData.referenceNotes}
                              onChange={e => setProjectData({...projectData, referenceNotes: e.target.value})}
                              rows={2}
                              className="w-full px-4 py-2.5 rounded-xl border border-[var(--adm-border)] bg-transparent text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--adm-accent)]/30 focus:border-[var(--adm-accent)] text-[var(--adm-text)] placeholder:text-[var(--adm-text-3)] transition-all resize-none"
                              placeholder="Masukkan catatan modifikasi (Misal: 'Ikuti layoutnya saja, tapi warnanya ganti jadi hijau gelap...')"
                            />
                          </div>
                        )}
                        {projectData.referenceImage && (
                          <button 
                            onClick={() => setProjectData({...projectData, referenceImage: null, referenceNotes: ""})} 
                            className="w-fit text-[12px] font-bold text-red-500 hover:underline flex items-center gap-1.5"
                          >
                            Hapus Referensi
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-[var(--adm-border)] mt-6">
                  <button
                    onClick={() => { setStep(2); getAIStack(); }}
                    disabled={
                      projectData.projectName.trim().length < 3 || 
                      projectData.description.trim().length < 10 ||
                      (projectData.hasLogo && !projectData.logo && !projectData.referenceImage) ||
                      (!projectData.hasLogo && projectData.stylePreference === "")
                    }
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--adm-accent)] text-white font-bold text-sm hover:opacity-90 transition-all disabled:opacity-40 shadow-lg shadow-[var(--adm-accent)]/20"
                  >
                    Lanjutkan <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            </AdminCard>
          </motion.div>
        )}

        {/* ── STEP 2: TECH STACK ──────────────────────────────────────────── */}
        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <AdminCard title="Pilih Teknologi">
              <div className="px-6 pb-6 space-y-6">

                {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-500 font-semibold flex items-center gap-2"><TriangleAlert size={16}/>{error}</div>}

                {loading && !aiStack && (
                  <div className="py-12 flex flex-col items-center justify-center space-y-4">
                    <Loader2 size={40} className="animate-spin text-[var(--adm-accent)]" />
                    <p className="text-sm font-bold text-[var(--adm-text-2)]">Menganalisis kebutuhan proyek Anda...</p>
                  </div>
                )}

                {!loading && aiStack && (
                  <div className="space-y-6">
                    {/* Stack Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {(["language","styling","frontend","backend","database","deployment"] as const).map(k => (
                        <div key={k} className="bg-[var(--adm-card)] rounded-xl p-3 border border-[var(--adm-border)]">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--adm-text-3)]">{k}</span>
                          <p className="text-sm font-bold text-[var(--adm-text)] mt-0.5">{aiStack[k as keyof typeof aiStack]}</p>
                        </div>
                      ))}
                    </div>
                    
                    {/* Chat Interface */}
                    <div className="bg-[var(--adm-bg)] border border-[var(--adm-border)] rounded-2xl overflow-hidden flex flex-col">

                      
                      <div className="p-4 h-64 overflow-y-auto space-y-4 flex flex-col">
                        {chatHistory.map((chat, idx) => (
                          <div key={idx} className={`flex w-full ${chat.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[13px] font-medium leading-relaxed ${
                              chat.sender === 'user' 
                                ? 'bg-[var(--adm-accent)] text-white rounded-tr-sm' 
                                : 'bg-[var(--adm-card)] border border-[var(--adm-border)] text-[var(--adm-text)] rounded-tl-sm'
                            }`}>
                              {chat.text}
                            </div>
                          </div>
                        ))}
                        {isChatting && (
                          <div className="flex w-full justify-start">
                            <div className="max-w-[85%] rounded-2xl rounded-tl-sm px-4 py-3 bg-[var(--adm-card)] border border-[var(--adm-border)] flex items-center gap-2">
                              <Loader2 size={14} className="animate-spin text-[var(--adm-accent)]" />
                              <span className="text-[12px] font-medium text-[var(--adm-text-3)]">AI sedang merespons...</span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="p-3 border-t border-[var(--adm-border)] bg-transparent">
                        <div className="flex items-center gap-2">
                          <input 
                            type="text" 
                            value={chatInput} 
                            onChange={e => setChatInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && sendChatMessage()}
                            placeholder="Tulis penyesuaian..."
                            className="flex-1 bg-[var(--adm-card)] border border-[var(--adm-border)] rounded-xl px-4 py-2.5 text-[13px] font-medium focus:outline-none focus:border-[var(--adm-accent)] text-[var(--adm-text)] placeholder:text-[var(--adm-text-3)] transition-colors"
                            disabled={isChatting}
                          />
                          <button 
                            onClick={sendChatMessage}
                            disabled={!chatInput.trim() || isChatting}
                            className="shrink-0 w-10 h-10 rounded-xl bg-[var(--adm-accent)] text-white flex items-center justify-center hover:opacity-90 disabled:opacity-50 transition-opacity"
                          >
                            <Send size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-[var(--adm-border)]">
                  <button onClick={() => setStep(1)} className="flex items-center gap-1.5 text-sm font-bold text-[var(--adm-text-3)] hover:text-[var(--adm-text)] transition-colors">
                    <ArrowLeft size={16} /> Kembali
                  </button>
                  <button onClick={getQuestions} disabled={!aiStack || isChatting || loading}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--adm-accent)] text-white font-bold text-sm hover:opacity-90 transition-all disabled:opacity-40 shadow-lg shadow-[var(--adm-accent)]/20">
                    {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                    {loading ? "Memproses..." : <>Sudah Fix, Lanjutkan <ArrowRight size={18} /></>}
                  </button>
                </div>
              </div>
            </AdminCard>
          </motion.div>
        )}

        {/* ── STEP 3: QUESTIONS ───────────────────────────────────────────── */}
        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <AdminCard title="Pertanyaan Klarifikasi">
              <div className="px-6 pb-6 space-y-6">
                <p className="text-sm font-medium text-[var(--adm-text-2)]">AI membutuhkan beberapa informasi tambahan sebelum membuat dokumen teknis. Jawab sesuai kebutuhan proyek Anda.</p>
                {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-500 font-semibold flex items-center gap-2"><TriangleAlert size={16}/>{error}</div>}
                <div className="space-y-5">
                  {questions.map((q, i) => (
                    <div key={q.id} className="space-y-2">
                      <label className="block text-sm font-bold text-[var(--adm-text)]">
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[var(--adm-accent)]/10 text-[var(--adm-accent)] text-[11px] font-bold mr-2">{i + 1}</span>
                        {q.question}
                      </label>
                      <input type="text" value={answers[q.id] || ""} onChange={e => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                        placeholder="Masukan jawaban anda"
                        className="w-full px-4 py-3 rounded-xl border border-[var(--adm-border)] bg-[var(--adm-card)] text-sm font-medium text-[var(--adm-text)] placeholder:font-normal placeholder:text-[var(--adm-text-3)] focus:outline-none focus:ring-2 focus:ring-[var(--adm-accent)]/30 focus:border-[var(--adm-accent)] transition-all" />
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[var(--adm-border)]">
                  <button onClick={() => setStep(2)} className="flex items-center gap-1.5 text-sm font-bold text-[var(--adm-text-3)] hover:text-[var(--adm-text)] transition-colors">
                    <ArrowLeft size={16} /> Kembali
                  </button>
                  <button onClick={generateDocs} disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--adm-accent)] text-white font-bold text-sm hover:opacity-90 transition-all disabled:opacity-40 shadow-lg shadow-[var(--adm-accent)]/20">
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Rocket size={16} />}
                    {loading ? "AI sedang bekerja..." : "Generate Dokumen"}
                  </button>
                </div>
              </div>
            </AdminCard>
          </motion.div>
        )}

        {/* ── STEP 4: RESULT DOCS ─────────────────────────────────────────── */}
        {step === 4 && docs && (
          <motion.div key="step4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="grid grid-cols-1 xl:grid-cols-[220px_1fr] gap-6">

              {/* Sidebar nav */}
              <div className="flex xl:flex-col gap-2 flex-wrap xl:flex-nowrap">
                {/* ZIP Download button */}
                <button
                  onClick={handleDownloadZip}
                  disabled={downloading}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[var(--adm-text-2)] font-bold text-sm hover:text-[var(--adm-text)] transition-all disabled:opacity-60 w-full xl:w-auto order-last xl:order-first"
                >
                  {downloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                  {downloading ? "Menyiapkan..." : "Unduh Semua (.zip)"}
                </button>

                <div className="hidden xl:block h-px bg-[var(--adm-border)] my-1" />

                {DOC_META.map(({ key, icon: Icon, label, filename }) => {
                  const isActive = activeDoc === key;
                  const isRoot = key === "agents";
                  return (
                    <button
                      key={key}
                      onClick={() => setActiveDoc(key)}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-bold transition-all text-left w-auto xl:w-full outline-none focus:outline-none focus:ring-0 ${
                        isActive
                          ? "bg-[var(--adm-accent)]/10 text-[var(--adm-text)]"
                          : "bg-transparent text-[var(--adm-text-2)] hover:text-[var(--adm-text)] hover:bg-[var(--adm-bg)]"
                      }`}
                    >
                      <div className="min-w-0">
                        <div>{label}</div>
                        <div className={`text-[10px] font-medium truncate ${isActive ? "text-[var(--adm-text-2)]" : "text-[var(--adm-text-3)]"}`}>
                          {isRoot ? "AGENTS.md" : filename}
                        </div>
                      </div>
                    </button>
                  );
                })}

                <div className="hidden xl:block h-px bg-[var(--adm-border)] my-1" />

                <button onClick={reset} className="hidden xl:flex items-center gap-2 text-xs font-bold text-[var(--adm-text-3)] hover:text-[var(--adm-text)] transition-colors px-3 py-2">
                  <RefreshCw size={13} /> Proyek Baru
                </button>
              </div>

              {/* Doc viewer */}
              <div className="min-w-0 flex flex-col space-y-4">
                <div className="flex items-center justify-end gap-2">
                  <div className="flex items-center gap-2">
                    <button onClick={handleDownloadSingle}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all text-[var(--adm-text-2)] hover:text-[var(--adm-text)]">
                      <Download size={15} /> Unduh .md
                    </button>
                    <button onClick={handleCopy}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all text-[var(--adm-text-2)] hover:text-[var(--adm-text)]">
                      <Copy size={15} /> Salin
                    </button>
                  </div>
                </div>
                <div className="bg-[var(--adm-card)] rounded-2xl shadow-sm overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.pre
                      key={activeDoc}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-sm text-[var(--adm-text)] p-6 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[70vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] outline-none"
                    >
                    {docs[activeDoc]}
                  </motion.pre>
                </AnimatePresence>
              </div>
            </div>
          </div>

            {/* Mobile reset */}
            <div className="flex justify-center mt-6 xl:hidden">
              <button onClick={reset} className="text-sm font-bold text-[var(--adm-text-3)] hover:text-[var(--adm-text)] transition-colors flex items-center gap-2">
                <RefreshCw size={14} /> Mulai Proyek Baru
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* Copy Toast */}
      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-[var(--adm-card)] text-[var(--adm-text)] border border-[var(--adm-border)] shadow-lg font-semibold text-sm"
          >
            <CheckCircle2 size={16} className="text-[var(--adm-success)]" /> Tersalin!
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── SOP MANAGER MODAL ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isSopModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsSopModalOpen(false)} />
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-[var(--adm-card)] border border-[var(--adm-border)] rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
            >
              <div className="p-6 border-b border-[var(--adm-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--adm-bg)]/50">
                <div>
                  <h3 className="text-lg font-bold text-[var(--adm-text)]">Pengaturan Rules</h3>
                  <p className="text-xs font-medium text-[var(--adm-text-3)] mt-0.5">Aturan dan instruksi default untuk AI Agent</p>
                </div>
                <div className="flex items-center gap-1 bg-[var(--adm-bg)] border border-[var(--adm-border)] p-1 rounded-xl">
                  {(["engine", "agents"] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => setSopTab(t)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        sopTab === t
                          ? "bg-[var(--adm-accent)] text-white shadow"
                          : "text-[var(--adm-text-3)] hover:text-[var(--adm-text)]"
                      }`}
                    >
                      {t === "engine" ? "revtech-engine.md" : "AGENTS.md"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6 flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <AnimatePresence mode="wait">
                  <motion.div key={sopTab} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col h-full">
                    <textarea
                      value={sopTab === "engine" ? engineContent : agentsTemplate}
                      onChange={e => sopTab === "engine" ? setEngineContent(e.target.value) : setAgentsTemplate(e.target.value)}
                      spellCheck={false}
                      className="w-full h-full min-h-[400px] px-4 py-4 font-mono text-xs leading-relaxed rounded-xl border border-[var(--adm-border)] bg-[#0d1117] text-[#e6edf3] focus:outline-none focus:ring-2 focus:ring-[var(--adm-accent)]/30 focus:border-[var(--adm-accent)] transition-all resize-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                    />
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="p-4 border-t border-[var(--adm-border)] bg-[var(--adm-bg)]/50 flex items-center justify-between">
                <button
                  onClick={resetSOP}
                  className="text-xs font-bold text-[var(--adm-text-3)] hover:text-[var(--adm-text)] transition-colors"
                >
                  Reset Default
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsSopModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-sm font-bold text-[var(--adm-text-2)] hover:text-[var(--adm-text)] transition-colors"
                  >
                    Tutup
                  </button>
                  <button
                    onClick={saveSOP}
                    disabled={isSopSaving}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[var(--adm-accent)] text-white text-sm font-bold hover:opacity-90 transition-all disabled:opacity-50 shadow-lg shadow-[var(--adm-accent)]/20"
                  >
                    {isSopSaving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                    {isSopSaving ? "Menyimpan..." : "Simpan Perubahan"}
                  </button>
                </div>
              </div>

              {/* Toast saved inside modal */}
              <AnimatePresence>
                {sopSaved && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl shadow-lg text-sm font-semibold flex items-center gap-2 bg-[var(--adm-success)] text-white"
                  >
                    <CheckCircle2 size={16} />
                    Template berhasil disimpan
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
