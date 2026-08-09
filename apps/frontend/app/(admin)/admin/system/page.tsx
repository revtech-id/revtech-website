"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AdminCard, SaveButton } from "@/components/admin/ui";
import { CheckCircle2 } from "lucide-react";
import ImageCropper from "@/components/ui/ImageCropper";
import { useUser } from "@/contexts/UserContext";
import { logActivity } from "@/lib/activityLog";

const inputCls = "w-full px-3 py-2.5 rounded-xl border border-[var(--adm-border)] text-sm text-[var(--adm-text)] bg-transparent placeholder:text-[var(--adm-text-3)] focus:outline-none focus:ring-2 focus:ring-[var(--adm-accent)]/30 focus:border-[var(--adm-accent)] transition-colors";

const SECTIONS = [
  {
    id: "system_settings",
    label: "Pengaturan Sistem Utama",
    icon: "tune",
    fields: [
      { key: "businessName", label: "Nama Bisnis", placeholder: "RevTech", type: "text" },
      { key: "founderName", label: "Nama Founder", placeholder: "Superadmin", type: "text" },
      { key: "primaryDomain", label: "Domain Utama", placeholder: "hi-revtech.my.id", type: "text" },
      
      { key: "marketingEmail", label: "Email Bisnis & Jualan", placeholder: "revtech.id.contact@gmail.com", type: "email" },
      { key: "marketingPass", label: "Password (Email Bisnis)", placeholder: "********", type: "password" },
      
      { key: "coreEmail", label: "Email Sistem (Vibe Coding)", placeholder: "revtech.id.core@gmail.com", type: "email" },
      { key: "corePass", label: "Password (Email Sistem)", placeholder: "********", type: "password" },
      
      { key: "waBisnis", label: "WhatsApp Bisnis (Form Pesanan)", placeholder: "62812...", type: "tel" },
      { key: "waPribadi", label: "WhatsApp Pribadi (Konsultasi)", placeholder: "62812...", type: "tel" },
    ],
  }
];

type FormState = Record<string, string>;

const DEFAULTS: FormState = {
  businessName: "RevTech",
  primaryDomain: "hi-revtech.my.id",
  waBisnis: "6281290018819", waPribadi: "6281290018819",
  marketingEmail: "revtech.id.contact@gmail.com", marketingPass: "",
  coreEmail: "revtech.id.core@gmail.com", corePass: "",
};

const fadeUp = (i: number) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { delay: i * 0.07, type: "spring" as const, stiffness: 300, damping: 24 } },
});

export default function SystemPage() {
  const { user, setUser } = useUser();
  const [form, setForm] = useState<FormState>({
    ...DEFAULTS,
    founderName: user.name,
  });
  
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [tempImageSrc, setTempImageSrc] = useState<string | null>(null);
  const [isCropOpen, setIsCropOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempImageSrc(reader.result as string);
        setIsCropOpen(true);
        if (fileInputRef.current) fileInputRef.current.value = "";
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedImage: string) => {
    setLogoPreview(croppedImage);
  };

  function update(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function save() {
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      // Sync founderName to UserContext
      if (form.founderName !== user.name) {
        setUser({ ...user, name: form.founderName });
      }
      
      logActivity({
        type: "system",
        title: "Pengaturan Sistem",
        description: `Pengaturan sistem & integrasi diperbarui oleh ${form.founderName}`,
        user: form.founderName,
      });

      setIsSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }, 800);
  }

  return (
    <div>
      <div className="space-y-5">
        <motion.div {...fadeUp(1)}>
          <AdminCard>
            {/* Logo Bisnis Section */}
            <div className="p-6 sm:p-8 border-b border-[var(--adm-border)] flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-6">
                <input type="file" ref={fileInputRef} hidden accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} />
                <div 
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full flex shrink-0 items-center justify-center text-5xl font-bold text-white relative z-10 overflow-hidden shadow-sm"
                  style={{ background: logoPreview ? undefined : "var(--adm-accent)" }}
                >
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-cover" />
                  ) : (
                    form.businessName?.charAt(0).toUpperCase() || "R"
                  )}
                </div>
                
                <div className="flex-1 text-center sm:text-left mt-2 sm:mt-0">
                   <h3 className="text-lg font-bold text-[var(--adm-text)]">Logo Bisnis</h3>
                   <p className="text-xs text-[var(--adm-text-2)] mt-1 mb-4 leading-relaxed max-w-xl">
                      Unggah logo bisnis Anda di sini. Disarankan menggunakan gambar dengan rasio 1:1, beresolusi minimal 500x500 px, dan ukuran maksimal 2MB (format JPG, PNG, atau WebP).
                   </p>
                   <div className="flex flex-wrap items-center justify-center sm:justify-start gap-5">
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="text-[var(--adm-text)] text-xs font-semibold flex items-center gap-1.5 outline-none focus:outline-none hover:opacity-70 transition-opacity">
                         <span className="material-symbols-outlined text-[16px]">cloud_upload</span>
                         Ubah Logo
                      </button>
                      <button type="button" onClick={() => setLogoPreview(null)} className="text-red-500 text-xs font-semibold flex items-center gap-1.5 outline-none focus:outline-none hover:opacity-70 transition-opacity">
                         <span className="material-symbols-outlined text-[16px]">delete</span>
                         Hapus
                      </button>
                   </div>
                </div>
            </div>

            {SECTIONS.map((section, si) => (
              <div key={section.id}>
                <div className={`px-6 py-5 ${si !== 0 ? "border-t" : ""} border-b border-[var(--adm-border)] flex items-center gap-3`}>
                  <div className="w-10 h-10 rounded-xl bg-[var(--adm-accent)]/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[var(--adm-accent)] text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>{section.icon}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[var(--adm-text)]">{section.label}</h3>
                  </div>
                </div>

                <div className="p-6">
                  <div className={`grid gap-5 ${section.fields.length >= 3 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}>
                    {section.fields.map((field) => (
                      <div key={field.key}>
                        <label className="block text-xs font-semibold text-[var(--adm-text-2)] mb-1.5">{field.label}</label>
                        <input
                          id={`field-${field.key}`}
                          type={field.type}
                          value={form[field.key] ?? ""}
                          onChange={(e) => update(field.key, e.target.value)}
                          placeholder={field.placeholder}
                          className={inputCls}
                          autoComplete={field.type === "password" ? "off" : undefined}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            <div className="px-6 py-5 border-t border-[var(--adm-border)] bg-[var(--adm-bg)]/30 flex justify-end">
              <SaveButton id="save-system-settings" onClick={save} isSaving={isSaving} />
            </div>
          </AdminCard>
        </motion.div>
      </div>

      {tempImageSrc && (
        <ImageCropper
          imageSrc={tempImageSrc}
          isOpen={isCropOpen}
          onClose={() => setIsCropOpen(false)}
          onCropCompleteAction={handleCropComplete}
        />
      )}

      <AnimatePresence>
        {saved && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 px-4 py-3 rounded-xl shadow-[var(--adm-shadow-lg)] text-sm font-semibold z-[999] flex items-center gap-2 bg-[var(--adm-card)] text-[var(--adm-text)]"
          >
            <CheckCircle2 size={18} className="text-[var(--adm-success)]" />
            Pengaturan sistem berhasil disimpan.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
