"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import JSZip from "jszip";
import { AdminCard, AdminModal, AdminToast, AdminButton } from "@/components/admin/ui";
import { getEngineContent, buildAgentsContent, saveEngineContent, getAgentsTemplate, saveAgentsTemplate, AGENTS_TEMPLATE_DEFAULT } from "@/lib/sopStore";
import { REVTECH_ENGINE_DEFAULT } from "@/lib/revtechEngineDefault";
import { logActivity } from "@/lib/activityLog";
import { useUser } from "@/contexts/UserContext";
import {
  Lightbulb, Cpu, HelpCircle, Rocket, ArrowRight, ArrowLeft,
  Wand2, Wrench, Loader2, Copy, Check, FileText, FolderTree,
  ListChecks, TriangleAlert, Download, Package, Palette, Layout,
  ServerCog, Bot, FileArchive, Search, Sparkles, BookMarked, RotateCcw, Save, Settings, CheckCircle2, Camera, Send, RefreshCw, Archive, X, Trash2, Undo2, Redo2
} from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, doc, setDoc, deleteDoc, query, orderBy, getDocs } from "firebase/firestore";
import { uploadImageToStorage } from "@/lib/upload";

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

async function generateDocWithAI(data: ProjectData, stackLabel: string, docType: string, answers: Record<string, string> = {}): Promise<string> {
  try {
    const res = await fetch('/api/admin/studio-generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data, stackLabel, docType, answers })
    });
    const json = await res.json();
    return json.text || `Gagal membuat dokumen ${docType}`;
  } catch (error) {
    console.error('Failed to generate doc:', error);
    return `Gagal membuat dokumen ${docType} (Error)`;
  }
}

async function buildProjectDocs(data: ProjectData, stackLabel: string, answers: Record<string, string> = {}): Promise<GeneratedDocs> {
  const [prd, brand, design, architecture, manifest] = await Promise.all([
    generateDocWithAI(data, stackLabel, 'prd', answers),
    generateDocWithAI(data, stackLabel, 'brand', answers),
    generateDocWithAI(data, stackLabel, 'design', answers),
    generateDocWithAI(data, stackLabel, 'architecture', answers),
    generateDocWithAI(data, stackLabel, 'manifest', answers)
  ]);

  return {
    agents: await buildAgentsContent({
      projectName: data.projectName || "Proyek Baru",
      idea: data.description,
      techStack: stackLabel,
    }),
    engine: await getEngineContent(),
    prd,
    brand,
    design,
    architecture,
    manifest
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
  const [aiStackHistory, setAiStackHistory] = useState<(ManualStack & { reason: string })[]>([]);
  const [aiStackRedo, setAiStackRedo] = useState<(ManualStack & { reason: string })[]>([]);
  const [questions, setQuestions]     = useState<Question[]>([]);
  const [answers, setAnswers]         = useState<Record<string, string>>({});
  const [docs, setDocs]               = useState<GeneratedDocs | null>(null);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");
  const [activeDoc, setActiveDoc]     = useState<DocKey>("agents");
  const [copied, setCopied]           = useState(false);
  const [downloading, setDownloading] = useState(false);

  function handleUndoStack() {
    if (aiStackHistory.length === 0 || !aiStack) return;
    const previousStack = aiStackHistory[aiStackHistory.length - 1];
    setAiStackHistory(prev => prev.slice(0, -1));
    setAiStackRedo(prev => [...prev, aiStack]);
    setAiStack(previousStack);
    
    setChatHistory(prev => [...prev, {
      sender: 'ai',
      text: "Baik, saya telah memulihkan rekomendasi tech stack ke versi sebelumnya (Undo)."
    }]);
  }

  function handleRedoStack() {
    if (aiStackRedo.length === 0 || !aiStack) return;
    const nextStack = aiStackRedo[aiStackRedo.length - 1];
    setAiStackRedo(prev => prev.slice(0, -1));
    setAiStackHistory(prev => [...prev, aiStack]);
    setAiStack(nextStack);
    
    setChatHistory(prev => [...prev, {
      sender: 'ai',
      text: "Baik, saya telah mengembalikan rekomendasi tech stack ke versi selanjutnya (Redo)."
    }]);
  }

  const { user } = useUser();

  // ── SOP Manager state ────────────────────────────────────────────────────────
  const [isSopModalOpen, setIsSopModalOpen] = useState(false);
  const [sopTab, setSopTab] = useState<"engine" | "agents">("engine");
  const [engineContent, setEngineContent] = useState("");
  const [agentsTemplate, setAgentsTemplate] = useState("");
  const [sopSaved, setSopSaved] = useState(false);
  const [isSopSaving, setIsSopSaving] = useState(false);

  // Load from Firestore on mount
  useEffect(() => {
    getEngineContent().then(setEngineContent);
    getAgentsTemplate().then(setAgentsTemplate);
  }, []);

  // ── File Upload state ────────────────────────────────────────────────────────
  const fileInputRef = useRef<HTMLInputElement>(null);
  const refFileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingRef, setIsUploadingRef] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingLogo(true);
      showToast("Mengompresi & mengunggah logo...", "success");
      try {
        const url = await uploadImageToStorage(file, "studio");
        setProjectData({...projectData, logo: url, stylePreference: "Auto-adapt dari Logo"});
        if (fileInputRef.current) fileInputRef.current.value = "";
        showToast("Logo berhasil diunggah", "success");
      } catch (error) {
        showToast("Gagal mengunggah logo", "error");
      } finally {
        setIsUploadingLogo(false);
      }
    }
  };

  const handleRefFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingRef(true);
      showToast("Mengompresi & mengunggah referensi...", "success");
      try {
        const url = await uploadImageToStorage(file, "studio");
        setProjectData({...projectData, referenceImage: url});
        if (refFileInputRef.current) refFileInputRef.current.value = "";
        showToast("Gambar referensi berhasil diunggah", "success");
      } catch (error) {
        showToast("Gagal mengunggah referensi", "error");
      } finally {
        setIsUploadingRef(false);
      }
    }
  };

  // ── Drafts state ────────────────────────────────────────────────────────
  const [isDraftsModalOpen, setIsDraftsModalOpen] = useState(false);
  const [drafts, setDrafts] = useState<any[]>([]);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [toastMessage, setToastMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    const qDrafts = query(collection(db, "studio_drafts"), orderBy("updatedAt", "desc"));
    const unsubDrafts = onSnapshot(qDrafts, (snapshot) => {
      const docs: any[] = [];
      snapshot.forEach(doc => {
        docs.push({ id: doc.id, ...doc.data() });
      });
      setDrafts(docs);
    });
    return () => unsubDrafts();
  }, []);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveDraft = async () => {
    if (!projectData.projectName) {
      showToast("Nama Proyek wajib diisi sebelum menyimpan draf", "error");
      return;
    }
    
    setIsSavingDraft(true);
    try {
      // Find if we already have a draft for this project name
      const existingDraft = drafts.find(d => d.projectName.toLowerCase() === projectData.projectName.toLowerCase());
      const draftId = existingDraft ? existingDraft.id : `DRF-${Date.now().toString().slice(-5)}`;
      
      await setDoc(doc(db, "studio_drafts", draftId), {
        projectName: projectData.projectName,
        projectData,
        aiStack,
        step,
        updatedAt: new Date().toISOString()
      });
      showToast("Draf berhasil disimpan");
    } catch (err) {
      console.error(err);
      showToast("Gagal menyimpan draf", "error");
    }
    setIsSavingDraft(false);
  };

  const handleLoadDraft = (draft: any) => {
    setProjectData(draft.projectData);
    if (draft.aiStack) setAiStack(draft.aiStack);
    if (draft.step) setStep(draft.step);
    setIsDraftsModalOpen(false);
    showToast(`Draf "${draft.projectName}" dimuat`);
  };

  const handleDeleteDraft = async (id: string) => {
    try {
      await deleteDoc(doc(db, "studio_drafts", id));
      showToast("Draf dihapus");
    } catch (err) {
      console.error(err);
      showToast("Gagal menghapus draf", "error");
    }
  };


  async function saveSOP() {
    setIsSopSaving(true);
    try {
      if (sopTab === "engine") await saveEngineContent(engineContent);
      else await saveAgentsTemplate(agentsTemplate);
      
      logActivity({
        type: "system",
        title: "Dokumen SOP",
        description: `${sopTab === "engine" ? "RevTech Engine" : "AGENTS Template"} diperbarui`,
        user: user?.name || "Admin",
      });
      setSopSaved(true);
      setTimeout(() => setSopSaved(false), 3000);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSopSaving(false);
    }
  }

  function resetSOP() {
    if (sopTab === "engine") setEngineContent(REVTECH_ENGINE_DEFAULT);
    else setAgentsTemplate(AGENTS_TEMPLATE_DEFAULT);
  }

  const effectiveStack = aiStack ? buildStackLabel(aiStack) : "";

  // ── Step 2 AI recommendation (REAL) ──────────────────────────────────────

  async function getAIStack() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch('/api/admin/studio-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          mode: 'ai-stack', 
          idea: projectData.description || projectData.projectName 
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memproses data AI.");
      
      
      if (data.stack) {
        setAiStack({
          language: data.stack.language || "TypeScript",
          styling: data.stack.styling || "Tailwind CSS",
          frontend: data.stack.frontend || "Next.js",
          backend: data.stack.backend || "Node.js",
          database: data.stack.database || "PostgreSQL",
          deployment: data.stack.deployment || "Vercel",
          reason: data.stack.reason || "",
        });
      }
      setChatHistory([
        { sender: 'ai', text: "Ini rekomendasi awal tech stack berdasarkan ide proyek Anda. Apakah ada preferensi khusus? (Misalnya: 'Tolong gunakan PHP' atau 'Saya butuh stack yang paling hemat biaya')." }
      ]);
    } catch (err) {
      console.error(err);
      setError("Gagal menghubungi AI untuk tech stack.");
    } finally {
      setLoading(false);
    }
  }

  async function sendChatMessage() {
    if (!chatInput.trim()) return;
    
    const newMessage = { sender: 'user' as const, text: chatInput };
    const updatedHistory = [...chatHistory, newMessage];
    setChatHistory(updatedHistory);
    setChatInput("");
    setIsChatting(true);

    try {
      const res = await fetch('/api/admin/studio-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          mode: 'ai-stack', 
          idea: projectData.description || projectData.projectName,
          chatHistory: updatedHistory
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memproses pesan AI.");
      
      if (data.stack) {
        if (aiStack) setAiStackHistory(prev => [...prev, aiStack]);
        setAiStackRedo([]); // Clear redo timeline on new stack generation
        setAiStack({
          language: data.stack.language || "TypeScript",
          styling: data.stack.styling || "Tailwind CSS",
          frontend: data.stack.frontend || "Next.js",
          backend: data.stack.backend || "Node.js",
          database: data.stack.database || "PostgreSQL",
          deployment: data.stack.deployment || "Vercel",
          reason: data.stack.reason || "",
        });
      }
      setChatHistory(prev => [...prev, {
        sender: 'ai',
        text: data.stack?.message || "Baik, saya telah menyesuaikan tech stack sesuai permintaan Anda. Silakan tinjau kembali, apakah sudah pas?"
      }]);
    } catch (err) {
      console.error(err);
      setChatHistory(prev => [...prev, {
        sender: 'ai',
        text: "Maaf, terjadi kesalahan saat menghubungi AI."
      }]);
    } finally {
      setIsChatting(false);
    }
  }

  // ── Step 3 generate questions (REAL) ─────────────────────────────────────

  async function getQuestions() {
    setLoading(true);
    setError("");
    setQuestions([]);
    setAnswers({});
    try {
      const res = await fetch('/api/admin/studio-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          mode: 'questions', 
          idea: projectData.description || projectData.projectName, 
          techStack: effectiveStack 
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memproses data AI.");
      
      if (data.questions) {
        setQuestions(data.questions);
        setStep(3);
      } else {
        setError("Gagal generate pertanyaan klarifikasi dari AI.");
      }
    } catch (err) {
      console.error(err);
      setError("Gagal menghubungi AI untuk pertanyaan.");
    } finally {
      setLoading(false);
    }
  }

  // ── Step 4 generate docs (REAL) ──────────────────────────────────────────

  async function generateDocs() {
    setLoading(true);
    setError("");
    try {
      const generated = await buildProjectDocs(projectData, effectiveStack, answers);
      setDocs(generated);
      setActiveDoc("agents");
      setStep(4);
      setLoading(false);
      
      logActivity({
        type: "studio_export",
        title: "Dokumen Proyek Di-generate",
        description: `AI berhasil merancang arsitektur dan membuat dokumen untuk proyek "${projectData.projectName || 'Baru'}"`,
        user: user?.name || "Admin",
      });
    } catch (err) {
      setError("Gagal melakukan generate dokumen.");
      setLoading(false);
    }
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
        <div className="flex items-center gap-2">
          <AdminButton
            variant="ghost"
            onClick={() => setIsDraftsModalOpen(true)}
            title="Draf Tersimpan"
          >
            <span className="font-semibold">Draf</span>
          </AdminButton>
          <AdminButton
            onClick={handleSaveDraft}
            disabled={isSavingDraft || !projectData.projectName}
            title="Simpan Draf"
            className={!projectData.projectName ? "" : "bg-[var(--adm-accent)] text-white border-transparent hover:bg-[var(--adm-accent)]/90"}
          >
            {isSavingDraft ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            <span className="hidden sm:inline">Simpan Draf</span>
          </AdminButton>
          <div className="w-px h-6 bg-[var(--adm-border)] mx-1" />
          <AdminButton
            variant="ghost"
            size="icon"
            onClick={() => setIsSopModalOpen(true)}
            title="Pengaturan Rules"
          >
            <Settings size={20} className="text-inherit" />
          </AdminButton>
        </div>
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
                            <input type="file" ref={fileInputRef} hidden accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} disabled={isUploadingLogo} />
                            <div 
                              onClick={() => !isUploadingLogo && fileInputRef.current?.click()}
                              className={`w-full h-full min-w-[7rem] rounded-2xl flex flex-col gap-1 items-center justify-center bg-transparent border-2 border-dashed border-[var(--adm-border)] hover:border-[var(--adm-accent)]/50 hover:bg-[var(--adm-accent)]/5 text-[var(--adm-text-3)] hover:text-[var(--adm-text)] cursor-pointer transition-all overflow-hidden relative group p-2 ${isUploadingLogo ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              {isUploadingLogo ? (
                                <div className="flex flex-col items-center gap-2">
                                  <Loader2 size={24} className="text-[var(--adm-accent)] animate-spin" />
                                  <span className="text-[11px] font-bold">Mengunggah...</span>
                                </div>
                              ) : projectData.logo ? (
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
                              <AdminButton 
                                variant="danger" size="sm"
                                onClick={() => setProjectData({...projectData, logo: null, stylePreference: ""})}
                              >
                                Hapus Logo
                              </AdminButton>
                            ) : (
                              <AdminButton 
                                variant="outline" size="sm"
                                onClick={() => setProjectData({...projectData, hasLogo: false, logo: null, stylePreference: ""})}
                                icon={<ArrowRight size={14} />}
                              >
                                Isi manual gaya visual
                              </AdminButton>
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
                          <AdminButton 
                            variant="ghost" size="sm" className="mt-3"
                            onClick={() => setProjectData({...projectData, hasLogo: true, stylePreference: "Auto-adapt dari Logo"})}
                          >
                            Batal, saya ingin upload logo
                          </AdminButton>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-[var(--adm-border)] mt-4">
                    <label className="block text-xs font-bold text-[var(--adm-text-2)] mb-2">Upload Gambar Referensi</label>
                    <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start bg-transparent border border-[var(--adm-border)] rounded-2xl p-5">
                      <div className={`shrink-0 ${projectData.referenceImage ? 'w-full sm:w-1/3 max-w-[300px]' : 'w-28 h-28'}`}>
                        <input type="file" ref={refFileInputRef} hidden accept="image/jpeg,image/png,image/webp" onChange={handleRefFileChange} disabled={isUploadingRef} />
                        <div 
                          onClick={() => !isUploadingRef && refFileInputRef.current?.click()}
                          className={`w-full h-full min-h-[7rem] rounded-2xl flex flex-col gap-1 items-center justify-center bg-transparent border-2 border-dashed border-[var(--adm-border)] hover:border-[var(--adm-accent)]/50 hover:bg-[var(--adm-accent)]/5 text-[var(--adm-text-3)] hover:text-[var(--adm-text)] cursor-pointer transition-all overflow-hidden relative group p-2 ${isUploadingRef ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {isUploadingRef ? (
                            <div className="flex flex-col items-center gap-2">
                              <Loader2 size={24} className="text-[var(--adm-accent)] animate-spin" />
                              <span className="text-[11px] font-bold">Mengunggah...</span>
                            </div>
                          ) : projectData.referenceImage ? (
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
                          <AdminButton 
                            variant="danger" size="sm"
                            onClick={() => setProjectData({...projectData, referenceImage: null, referenceNotes: ""})}
                          >
                            Hapus Referensi
                          </AdminButton>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-[var(--adm-border)] mt-6">
                  <AdminButton
                    onClick={() => { setStep(2); getAIStack(); }}
                    disabled={
                      projectData.projectName.trim().length < 3 || 
                      projectData.description.trim().length < 10 ||
                      (projectData.hasLogo && !projectData.logo && !projectData.referenceImage) ||
                      (!projectData.hasLogo && projectData.stylePreference === "")
                    }
                  >
                    Lanjutkan <ArrowRight size={18} />
                  </AdminButton>
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
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <h3 className="text-sm font-bold text-[var(--adm-text)]">Rekomendasi Terkini</h3>
                      <div className="flex items-center gap-2">
                        {aiStackHistory.length > 0 && (
                          <AdminButton variant="outline" size="sm" onClick={handleUndoStack}>
                            <Undo2 size={16} className="mr-1.5" /> <span className="hidden sm:inline">Pulihkan</span> ke Belakang
                          </AdminButton>
                        )}
                        {aiStackRedo.length > 0 && (
                          <AdminButton variant="outline" size="sm" onClick={handleRedoStack}>
                            <span className="hidden sm:inline">Pulihkan</span> ke Depan <Redo2 size={16} className="ml-1.5" />
                          </AdminButton>
                        )}
                      </div>
                    </div>
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
                          <AdminButton 
                            size="icon"
                            onClick={sendChatMessage}
                            disabled={!chatInput.trim() || isChatting}
                          >
                            <Send size={16} />
                          </AdminButton>
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
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-bold transition-all text-left w-auto xl:w-full outline-none focus:outline-none focus:ring-0 text-[var(--adm-text)] ${
                        isActive
                          ? "bg-[var(--adm-card-hover)]"
                          : "hover:bg-[var(--adm-card-hover)]"
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
      <AdminToast
        isVisible={copied}
        message="Tersalin!"
        type="success"
        onClose={() => setCopied(false)}
      />

      {/* ── SOP MANAGER MODAL ─────────────────────────────────────────────────── */}
      <AdminModal isOpen={isSopModalOpen} onClose={() => setIsSopModalOpen(false)} maxWidth="max-w-4xl" noPadding={true}>
        <div className="p-6 border-b border-[var(--adm-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--adm-bg)]/50">
          <div>
            <h3 className="text-lg font-bold text-[var(--adm-text)]">Pengaturan Rules</h3>
            <p className="text-xs font-medium text-[var(--adm-text-3)] mt-0.5">Aturan dan instruksi default untuk AI Agent</p>
          </div>
          <div className="flex items-center gap-1 bg-[var(--adm-bg)] border border-[var(--adm-border)] p-1.5 rounded-xl">
            {(["engine", "agents"] as const).map(t => (
              <button
                key={t}
                onClick={() => setSopTab(t)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  sopTab === t
                    ? "bg-[var(--adm-card)] shadow-sm text-[var(--adm-text)]"
                    : "text-[var(--adm-text-3)] hover:text-[var(--adm-text)] hover:bg-[var(--adm-card)]/40"
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
                className="w-full h-full min-h-[400px] px-4 py-4 font-mono text-xs leading-relaxed rounded-xl border border-[var(--adm-border)] bg-[var(--adm-bg)] text-[var(--adm-text)] focus:outline-none focus:ring-2 focus:ring-[var(--adm-accent)]/30 focus:border-[var(--adm-accent)] transition-all resize-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
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
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="absolute bottom-6 right-6 z-[100] bg-[var(--adm-card)] border border-[var(--adm-border)] shadow-xl rounded-2xl px-5 py-3 flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-[var(--adm-success)]/20 text-[var(--adm-success)]">
                <CheckCircle2 size={18} strokeWidth={2.5} />
              </div>
              <p className="text-[13px] font-bold text-[var(--adm-text)]">Template berhasil disimpan.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </AdminModal>

      {/* ── DRAFTS MODAL ──────────────────────────────────────────────────────── */}
      <AdminModal isOpen={isDraftsModalOpen} onClose={() => setIsDraftsModalOpen(false)} maxWidth="max-w-2xl">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--adm-accent)]/10 text-[var(--adm-accent)] flex items-center justify-center">
              <BookMarked size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[var(--adm-text)]">Draf Tersimpan</h3>
              <p className="text-sm font-medium text-[var(--adm-text-3)] mt-1">Muat ulang konfigurasi proyek yang pernah Anda simpan.</p>
            </div>
          </div>
          <button onClick={() => setIsDraftsModalOpen(false)} className="p-2 text-[var(--adm-text-3)] hover:text-[var(--adm-text)] transition-colors focus:outline-none">
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>
        
        {drafts.length === 0 ? (
          <div className="text-center py-10">
            <Archive size={40} className="mx-auto text-[var(--adm-text-3)] mb-4 opacity-50" />
            <p className="text-[var(--adm-text-2)] font-medium">Belum ada draf yang disimpan.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {drafts.map(draft => (
              <div key={draft.id} className="flex items-center justify-between p-4 rounded-xl border border-[var(--adm-border)] bg-[var(--adm-card)] hover:border-[var(--adm-accent)]/50 transition-colors">
                <div>
                  <h4 className="font-bold text-[var(--adm-text)]">{draft.projectName}</h4>
                  <p className="text-xs text-[var(--adm-text-3)] mt-1">Disimpan: {new Date(draft.updatedAt).toLocaleString("id-ID")}</p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <AdminButton size="sm" onClick={() => handleLoadDraft(draft)}>
                    Load Draf
                  </AdminButton>
                  <AdminButton variant="danger" size="icon" onClick={() => handleDeleteDraft(draft.id)} title="Hapus Draf">
                    <Trash2 size={16} className="text-white" />
                  </AdminButton>
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminModal>

      {/* Global Toast */}
      {toastMessage && (
        <AdminToast
          isVisible={true}
          message={toastMessage.text}
          type={toastMessage.type}
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
}
