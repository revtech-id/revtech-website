"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, Image as ImageIcon, Trash2, X, RefreshCw, Save, Sparkles } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { PageHeader, AdminToast } from "@/components/admin/ui";
import { Button } from "@/components/ui/Button";

interface HeroSettings {
  bgImage: string;
}

const DEFAULT_SETTINGS: HeroSettings = {
  bgImage: "", // Will fall back to /assets/revtech-bg.webp in public component
};

export default function HeroBannerPage() {
  const [isClient, setIsClient] = useState(false);
  const [settings, setSettings] = useState<HeroSettings>(DEFAULT_SETTINGS);
  const [toast, setToast] = useState<{ isVisible: boolean; message: string; type: "success" | "error" }>({
    isVisible: false,
    message: "",
    type: "success",
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem("revtech_hero_settings");
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse hero settings");
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("revtech_hero_settings", JSON.stringify(settings));
    window.dispatchEvent(new Event("hero-settings-updated"));
    setToast({
      isVisible: true,
      message: "Pengaturan Background Hero berhasil disimpan",
      type: "success",
    });
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.setItem("revtech_hero_settings", JSON.stringify(DEFAULT_SETTINGS));
    window.dispatchEvent(new Event("hero-settings-updated"));
    setToast({
      isVisible: true,
      message: "Dikembalikan ke pengaturan default",
      type: "success",
    });
  };

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setSettings((prev) => ({ ...prev, bgImage: result }));
      setToast({ isVisible: true, message: "Gambar berhasil diunggah", type: "success" });
    };
    reader.readAsDataURL(file);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 1,
  });

  if (!isClient) return null;

  return (
    <div className="space-y-6 pb-20">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Kolom Pengaturan */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 rounded-2xl border border-[var(--adm-border)] bg-[var(--adm-card)]">
            <h3 className="text-sm font-bold text-[var(--adm-text)] mb-4 flex items-center gap-2">
              <ImageIcon size={16} /> Gambar Background
            </h3>

            {settings.bgImage ? (
              <div className="w-full rounded-xl border border-[var(--adm-border)] overflow-hidden relative group">
                <button 
                  type="button" 
                  onClick={() => setPreviewImage(settings.bgImage)} 
                  title="Lihat ukuran penuh" 
                  className="block w-full text-left"
                >
                  <img
                    src={settings.bgImage}
                    alt="Hero Background"
                    className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                  />
                </button>
                <div className="absolute top-3 right-3 flex items-center gap-2">
                  <label
                    className="p-2 rounded-lg bg-black/50 hover:bg-black/80 text-white cursor-pointer transition-colors backdrop-blur-md border border-white/10"
                    title="Ganti Gambar"
                  >
                    <UploadCloud size={14} />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setSettings((prev) => ({ ...prev, bgImage: reader.result as string }));
                          setToast({
                            isVisible: true,
                            message: "Gambar berhasil diunggah",
                            type: "success",
                          });
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => setSettings((prev) => ({ ...prev, bgImage: "" }))}
                    className="p-2 rounded-lg bg-black/50 hover:bg-red-500/90 text-white transition-colors backdrop-blur-md border border-white/10"
                    title="Hapus Gambar"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <div
                {...getRootProps()}
                className={`w-full h-48 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors ${
                  isDragActive
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-[var(--adm-border)] hover:border-blue-500/50 bg-[var(--adm-bg)] hover:bg-[var(--adm-card-hover)]"
                }`}
              >
                <input {...getInputProps()} />
                <div className="w-12 h-12 rounded-full bg-[var(--adm-bg)] border border-[var(--adm-border)] flex items-center justify-center mb-3">
                  <UploadCloud size={20} className="text-[var(--adm-text-3)]" />
                </div>
                <p className="text-sm font-semibold text-[var(--adm-text)]">Pilih atau letakkan gambar</p>
                <p className="text-xs text-[var(--adm-text-3)] mt-1 text-center px-4">
                  Disarankan format WebP, 1920x1080px (Landscape)
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button onClick={handleSave} className="flex-1 gap-2 rounded-xl">
              <Save size={16} /> Simpan Perubahan
            </Button>
            <Button onClick={handleReset} variant="outline" className="gap-2 rounded-xl" title="Reset Default">
              <RefreshCw size={16} />
            </Button>
          </div>
        </div>

        {/* Kolom Simulasi Preview */}
        <div className="lg:col-span-2">
          <div className="p-6 rounded-2xl border border-[var(--adm-border)] bg-[var(--adm-card)] overflow-hidden">
            <h3 className="text-sm font-bold text-[var(--adm-text)] mb-4 flex items-center gap-2">
              <Sparkles size={16} className="text-blue-500" /> Live Preview
            </h3>

            {/* Kotak Preview Hero */}
            <div className="w-full relative h-[400px] border border-[var(--adm-border)] rounded-xl overflow-hidden bg-white">
              {/* Image Preview Area */}
              <div
                className="absolute inset-0 bg-cover xl:bg-contain bg-right-bottom bg-no-repeat opacity-100 transition-all duration-300 pointer-events-none"
                style={{
                  backgroundImage: `url('${settings.bgImage || "/assets/revtech-bg.webp"}')`,
                }}
              />
              <div className="absolute inset-y-0 left-0 w-3/4 bg-gradient-to-r from-white via-white/95 to-transparent pointer-events-none" />

              {/* Fake Content for context */}
              <div className="absolute inset-0 z-10 p-8 flex flex-col justify-center text-left">
                <div className="max-w-md space-y-4">
                  <h1 className="text-4xl font-black tracking-tight leading-tight text-[#111827]">
                    Wadah Solusi <span className="text-blue-600 block">Digital.</span>
                  </h1>
                  <p className="text-sm text-gray-500">
                    Kami siap mempercepat pertumbuhan Anda melalui layanan pembuatan website premium dan katalog digital.
                  </p>
                  <div className="flex gap-3 pt-2">
                    <div className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold">
                      Lihat Layanan
                    </div>
                    <div className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold">
                      Karya Kami
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <p className="text-xs text-[var(--adm-text-3)] mt-4">
              *Tampilan ini adalah simulasi mini untuk mensimulasikan bagaimana gambar background terlihat saat dipasang di halaman utama.
            </p>
          </div>
        </div>
      </div>

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
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="absolute -top-12 right-0 p-2 text-white/70 hover:text-white transition-colors bg-white/10 rounded-full hover:bg-white/20"
              >
                <X size={24} />
              </button>
              <img
                src={previewImage}
                alt="Preview"
                className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AdminToast
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))}
      />
    </div>
  );
}
