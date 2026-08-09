"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AdminCard, SaveButton } from "@/components/admin/ui";
import { CheckCircle2, Globe, Mail, Phone, ShieldCheck, Camera, Server, User } from "lucide-react";
import ImageCropper from "@/components/ui/ImageCropper";
import { CountrySelector } from "@/components/ui/CountrySelector";
import { countries as COUNTRIES } from "@/lib/countries";
import { useUser } from "@/contexts/UserContext";
import { logActivity } from "@/lib/activityLog";

const inputCls = "w-full px-3 py-2.5 rounded-xl border border-[var(--adm-border)] text-sm text-[var(--adm-text)] bg-transparent placeholder:text-[var(--adm-text-3)] focus:outline-none focus:ring-2 focus:ring-[var(--adm-accent)]/30 focus:border-[var(--adm-accent)] transition-colors";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[var(--adm-text-2)] mb-1.5">{label}</label>
      {children}
    </div>
  );
}

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
  const [isPhotoMenuOpen, setIsPhotoMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [countryBisnis, setCountryBisnis] = useState(COUNTRIES[0]);
  const [countryPribadi, setCountryPribadi] = useState(COUNTRIES[0]);

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

  const handleReset = () => {
    setForm({
      ...DEFAULTS,
      founderName: user.name,
    });
    setLogoPreview(null);
  };

  function update(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function save(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setIsSaving(true);
    
    setTimeout(() => {
      if (form.founderName !== user.name) {
        setUser({ ...user, name: form.founderName });
      }
      
      logActivity({
        type: "system",
        title: "Informasi Bisnis",
        description: `Informasi dan kontak bisnis diperbarui oleh ${form.founderName}`,
        user: form.founderName,
      });

      setIsSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }, 800);
  }

  return (
    <div>
      <div className="pt-2"></div>
      <div className="space-y-6 w-full">
        
        <motion.div {...fadeUp(1)} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
           
           {/* LEFT SIDEBAR */}
           <div className="lg:col-span-4 flex flex-col gap-6">
              <AdminCard>
                 <div className="p-6 sm:p-8 flex flex-col items-center text-center">
                    <div className="relative mb-5 group">
                       <input type="file" ref={fileInputRef} hidden accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} />
                       <div 
                         onClick={() => setIsPhotoMenuOpen(true)}
                         className="w-32 h-32 rounded-full flex shrink-0 items-center justify-center text-6xl font-bold text-white overflow-hidden shadow-sm transition-shadow duration-200 cursor-pointer ring-4 ring-transparent hover:ring-[var(--adm-accent)]/30"
                         style={{ background: logoPreview ? undefined : "var(--adm-accent)" }}
                         title="Ubah Logo Bisnis"
                       >
                         {logoPreview ? (
                           <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-cover" />
                         ) : (
                           form.businessName?.charAt(0).toUpperCase() || "R"
                         )}
                       </div>
                       
                       <AnimatePresence>
                         {isPhotoMenuOpen && (
                           <>
                             <div className="fixed inset-0 z-40" onClick={() => setIsPhotoMenuOpen(false)}></div>
                             <motion.div 
                               initial={{ opacity: 0, y: 10, scale: 0.95 }}
                               animate={{ opacity: 1, y: 0, scale: 1 }}
                               exit={{ opacity: 0, y: 10, scale: 0.95 }}
                               transition={{ duration: 0.15 }}
                               className="absolute top-full mt-3 left-1/2 -translate-x-1/2 bg-[var(--adm-card)] border border-[var(--adm-border)] rounded-xl shadow-[var(--adm-shadow-lg)] p-1.5 z-50 flex flex-col min-w-[150px]"
                             >
                               <button 
                                 type="button" 
                                 onClick={() => { fileInputRef.current?.click(); setIsPhotoMenuOpen(false); }}
                                 className="text-left px-3 py-2.5 text-sm text-[var(--adm-text)] hover:bg-[var(--adm-bg)] rounded-lg font-semibold flex items-center gap-2"
                               >
                                 <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
                                 Ubah Logo
                               </button>
                               <button 
                                 type="button" 
                                 onClick={() => { setLogoPreview(null); setIsPhotoMenuOpen(false); }}
                                 className="text-left px-3 py-2.5 text-sm text-red-500 hover:bg-red-500/10 rounded-lg font-semibold flex items-center gap-2"
                               >
                                 <span className="material-symbols-outlined text-[18px]">delete</span>
                                 Hapus Logo
                               </button>
                             </motion.div>
                           </>
                         )}
                       </AnimatePresence>
                    </div>
                    <h2 className="text-xl font-bold text-[var(--adm-text)]">{form.businessName || "Nama Bisnis"}</h2>
                    <p 
                      className="text-sm font-medium text-[var(--adm-accent)] mt-1 cursor-pointer hover:underline"
                      onClick={() => form.primaryDomain && window.open(form.primaryDomain.startsWith('http') ? form.primaryDomain : `https://${form.primaryDomain}`, '_blank')}
                    >
                      {form.primaryDomain || "Website"}
                    </p>
                 </div>
                 
                 <div className="p-6 border-t border-[var(--adm-border)] flex flex-col gap-4 text-sm text-[var(--adm-text-2)] font-medium">
                    <div className="flex items-center gap-3" title="Nama Founder">
                       <User size={16} className="opacity-60 shrink-0" /> 
                       <span className="truncate flex-1">{form.founderName || "Belum diatur"}</span>
                       <span className="text-[10px] font-bold tracking-wide uppercase text-[var(--adm-text-3)]">Founder</span>
                    </div>
                    <div className="flex items-center gap-3" title="Email Bisnis">
                       <Mail size={16} className="opacity-60 shrink-0" /> 
                       <span className="truncate flex-1">{form.marketingEmail || "Belum diatur"}</span>
                       <span className="text-[10px] font-bold tracking-wide uppercase text-[var(--adm-text-3)]">Bisnis</span>
                    </div>
                    <div className="flex items-center gap-3" title="Email Sistem">
                       <Mail size={16} className="opacity-60 shrink-0" /> 
                       <span className="truncate flex-1">{form.coreEmail || "Belum diatur"}</span>
                       <span className="text-[10px] font-bold tracking-wide uppercase text-[var(--adm-text-3)]">Sistem</span>
                    </div>
                    <div className="flex items-center gap-3" title="WhatsApp Bisnis">
                       <Phone size={16} className="opacity-60 shrink-0" /> 
                       <span className="truncate flex-1">+{form.waBisnis || "Belum diatur"}</span>
                       <span className="text-[10px] font-bold tracking-wide uppercase text-[var(--adm-text-3)]">Bisnis</span>
                    </div>
                    <div className="flex items-center gap-3" title="WhatsApp Pribadi">
                       <Phone size={16} className="opacity-60 shrink-0" /> 
                       <span className="truncate flex-1">+{form.waPribadi || "Belum diatur"}</span>
                       <span className="text-[10px] font-bold tracking-wide uppercase text-[var(--adm-text-3)]">Pribadi</span>
                    </div>
                 </div>
              </AdminCard>

              <AdminCard>
                 <div className="p-6 bg-[var(--adm-card)] rounded-xl border border-[var(--adm-border)] flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-[var(--adm-accent)]/10 flex items-center justify-center shrink-0">
                       <ShieldCheck className="text-[var(--adm-accent)]" size={20} />
                    </div>
                    <div>
                       <h4 className="text-sm font-bold text-[var(--adm-text)] mb-1">Status Layanan & Kontak</h4>
                       <p className="text-xs text-[var(--adm-text-3)] leading-relaxed">
                         Integrasi kontak email dan nomor WhatsApp Anda saat ini dalam status aktif dan siap beroperasi.
                       </p>
                    </div>
                 </div>
              </AdminCard>
           </div>

           {/* RIGHT CONTENT */}
           <div className="lg:col-span-8 flex flex-col gap-6">
              <AdminCard>
                 <form onSubmit={save}>
                    <div className="p-6 sm:p-8 space-y-6">
                       <h3 className="text-lg font-bold text-[var(--adm-text)] mb-6">Informasi Bisnis</h3>
                       
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <Field label="Nama Bisnis">
                            <input
                              value={form.businessName}
                              onChange={(e) => update("businessName", e.target.value)}
                              className={inputCls}
                            />
                          </Field>
                          <Field label="Website">
                            <input
                              value={form.primaryDomain}
                              onChange={(e) => update("primaryDomain", e.target.value)}
                              className={inputCls}
                            />
                          </Field>
                       </div>

                       <Field label="Nama Founder">
                          <input
                            value={form.founderName}
                            onChange={(e) => update("founderName", e.target.value)}
                            className={inputCls}
                          />
                       </Field>

                       <div className="pt-6 border-t border-[var(--adm-border)] mt-8">
                         <h3 className="text-lg font-bold text-[var(--adm-text)] mb-6">Email & Integrasi</h3>
                         
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                            <Field label="Email Bisnis">
                              <input
                                type="email"
                                value={form.marketingEmail}
                                onChange={(e) => update("marketingEmail", e.target.value)}
                                className={inputCls}
                              />
                            </Field>
                            <Field label="Email Sistem">
                              <input
                                type="email"
                                value={form.coreEmail}
                                onChange={(e) => update("coreEmail", e.target.value)}
                                className={inputCls}
                              />
                            </Field>
                         </div>

                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <Field label="WhatsApp Bisnis (Form Pesanan)">
                              <div className="flex rounded-xl bg-transparent focus-within:ring-2 focus-within:ring-[var(--adm-accent)]/30 focus-within:border-[var(--adm-accent)] transition-colors border border-[var(--adm-border)] relative">
                                <CountrySelector selected={countryBisnis} onSelect={setCountryBisnis} theme="admin" />
                                <input
                                  type="tel"
                                  value={form.waBisnis ? form.waBisnis.replace(new RegExp(`^${countryBisnis.dial_code.replace('+', '')}`), '') : ''}
                                  onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '');
                                    const cleanVal = val.startsWith('0') ? val.substring(1) : val;
                                    const code = countryBisnis.dial_code.replace('+', '');
                                    update("waBisnis", cleanVal ? `${code}${cleanVal}` : '');
                                  }}
                                  className="w-full px-3 py-2.5 text-sm bg-transparent border-0 text-[var(--adm-text)] focus:outline-none focus:ring-0 placeholder:text-[var(--adm-text-3)]"
                                  placeholder={countryBisnis.code === 'ID' ? "8123456..." : "123456789..."}
                                />
                              </div>
                            </Field>
                            <Field label="WhatsApp Pribadi (Konsultasi)">
                              <div className="flex rounded-xl bg-transparent focus-within:ring-2 focus-within:ring-[var(--adm-accent)]/30 focus-within:border-[var(--adm-accent)] transition-colors border border-[var(--adm-border)] relative">
                                <CountrySelector selected={countryPribadi} onSelect={setCountryPribadi} theme="admin" />
                                <input
                                  type="tel"
                                  value={form.waPribadi ? form.waPribadi.replace(new RegExp(`^${countryPribadi.dial_code.replace('+', '')}`), '') : ''}
                                  onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '');
                                    const cleanVal = val.startsWith('0') ? val.substring(1) : val;
                                    const code = countryPribadi.dial_code.replace('+', '');
                                    update("waPribadi", cleanVal ? `${code}${cleanVal}` : '');
                                  }}
                                  className="w-full px-3 py-2.5 text-sm bg-transparent border-0 text-[var(--adm-text)] focus:outline-none focus:ring-0 placeholder:text-[var(--adm-text-3)]"
                                  placeholder={countryPribadi.code === 'ID' ? "8123456..." : "123456789..."}
                                />
                              </div>
                            </Field>
                         </div>
                       </div>
                    </div>

                    <div className="px-6 py-5 border-t border-[var(--adm-border)] flex items-center justify-end gap-3 bg-[var(--adm-bg)]/30">
                       <button
                         type="button"
                         onClick={handleReset}
                         disabled={isSaving}
                         className="px-4 py-2.5 text-sm font-semibold text-[var(--adm-text-2)] hover:text-[var(--adm-text)] bg-transparent rounded-xl transition-colors outline-none focus:outline-none"
                       >
                         Batal
                       </button>
                       <SaveButton type="submit" isSaving={isSaving} />
                    </div>
                 </form>
              </AdminCard>
           </div>
           
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
            Informasi bisnis berhasil disimpan.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
