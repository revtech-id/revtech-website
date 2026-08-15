"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader, AdminCard, StatusBadge, SaveButton, AdminToast, AdminButton } from "@/components/admin/ui";

import { CountrySelector } from "@/components/ui/CountrySelector";
import { countries as COUNTRIES } from "@/lib/countries";
import { updateProfile } from "./actions";
import ImageCropper from "@/components/ui/ImageCropper";
import { CheckCircle2, Mail, Phone, MapPin, Globe, ShieldCheck, Camera } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { logActivity } from "@/lib/activityLog";

const inputCls =
  "w-full px-3 py-2.5 rounded-xl border border-[var(--adm-border)] text-sm text-[var(--adm-text)] bg-transparent placeholder:text-[var(--adm-text-3)] focus:outline-none focus:ring-2 focus:ring-[var(--adm-accent)]/30 focus:border-[var(--adm-accent)] transition-colors";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[var(--adm-text-2)] mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const fadeUp = (i: number) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { delay: i * 0.06, type: "spring" as const, stiffness: 300, damping: 24 } },
});

export default function ProfilePage() {
  const { user, setUser } = useUser();
  const [profile, setProfile] = useState({
    name: user.name,
    role: user.role,
    email: user.email,
    phone: user.phone,
    bio: user.bio,
    location: user.location,
    website: user.website,
  });

  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);

  // Password states removed for Google Login integration

  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatar);
  const [tempImageSrc, setTempImageSrc] = useState<string | null>(null);
  const [isCropOpen, setIsCropOpen] = useState(false);
  const [isPhotoMenuOpen, setIsPhotoMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  function showToast(text: string, type: 'success' | 'error' = 'success') {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  }

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
    setAvatarPreview(croppedImage);
  };

  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);


  const handleReset = () => {
    setProfile({
      name: user.name,
      role: user.role,
      email: user.email,
      phone: user.phone,
      bio: user.bio,
      location: user.location,
      website: user.website,
    });

    setAvatarPreview(user.avatar);
  };
  
  async function handleSaveAll(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const res = await updateProfile({ profile });
      if (res.success) {
        showToast("Perubahan profil berhasil disimpan.");
        setUser({ ...user, ...profile, avatar: avatarPreview });
        
        logActivity({
          type: "profile_updated",
          title: "Profil Diperbarui",
          description: `Data profil berhasil diperbarui oleh ${user.name}`,
          user: user.name,
        });

      } else {
        showToast(res.message, "error");
      }
    } catch (err) {
      showToast("Terjadi kesalahan saat menyimpan profil.", "error");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div>
      <div className="pt-2"></div>
      <div className="space-y-6 w-full">
        
        {/* 2-Column Grid Layout */}
        <motion.div {...fadeUp(1)} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
           
           {/* LEFT SIDEBAR */}
           <div className="lg:col-span-4 flex flex-col gap-6">
              {/* Profile Overview Card */}
              <AdminCard>
                 <div className="p-6 sm:p-8 flex flex-col items-center text-center">
                    <div className="relative mb-5 group">
                       <input type="file" ref={fileInputRef} hidden accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} />
                       <div 
                         onClick={() => setIsPhotoMenuOpen(true)}
                         className="w-32 h-32 rounded-full flex shrink-0 items-center justify-center text-6xl font-bold text-white overflow-hidden shadow-sm transition-shadow duration-200 cursor-pointer ring-4 ring-transparent hover:ring-[var(--adm-accent)]/30"
                         style={{ background: avatarPreview ? undefined : "var(--adm-accent)" }}
                         title="Ubah Foto Profil"
                       >
                         {avatarPreview ? (
                           <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
                         ) : (
                           profile.name.charAt(0).toUpperCase()
                         )}
                       </div>
                       
                       {/* Dropdown Menu */}
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
                                 Ubah Foto
                               </button>
                               <button 
                                 type="button" 
                                 onClick={() => { setAvatarPreview(null); setIsPhotoMenuOpen(false); }}
                                 className="text-left px-3 py-2.5 text-sm text-red-500 hover:bg-red-500/10 rounded-lg font-semibold flex items-center gap-2"
                               >
                                 <span className="material-symbols-outlined text-[18px]">delete</span>
                                 Hapus Foto
                               </button>
                             </motion.div>
                           </>
                         )}
                       </AnimatePresence>
                    </div>
                    <h2 className="text-xl font-bold text-[var(--adm-text)]">{profile.name || "Nama Pengguna"}</h2>
                    <p className="text-sm font-medium text-[var(--adm-accent)] mt-1">{profile.role || "Jabatan / Peran"}</p>
                 </div>
                 
                 <div className="p-6 border-t border-[var(--adm-border)] flex flex-col gap-4 text-sm text-[var(--adm-text-2)] font-medium">
                    <div className="flex items-center gap-3">
                       <Mail size={18} className="opacity-60" /> <span className="truncate">{profile.email || "Belum diatur"}</span>
                    </div>
                    <div className="flex items-center gap-3">
                       <Phone size={18} className="opacity-60" /> <span className="truncate">+{profile.phone || "Belum diatur"}</span>
                    </div>
                    <div className="flex items-center gap-3">
                       <MapPin size={18} className="opacity-60" /> <span className="truncate">{profile.location || "Belum diatur"}</span>
                    </div>
                 </div>
              </AdminCard>

              {/* Akses & Keamanan Card */}
              <AdminCard>
                 <div className="p-6 flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-[var(--adm-text)] font-bold text-sm tracking-wide uppercase">
                       <ShieldCheck size={18} className="text-[var(--adm-accent)]" /> Akses & Keamanan Akun
                    </div>
                    <p className="text-xs text-[var(--adm-text-2)] leading-relaxed">
                       Akun ini memiliki hak akses penuh (Superadmin) untuk mengelola seluruh module RevTech Business OS.
                    </p>
                 </div>
              </AdminCard>
           </div>

           {/* RIGHT CONTENT */}
           <div className="lg:col-span-8 flex flex-col gap-6">
              <AdminCard>
                 <form onSubmit={handleSaveAll}>
                    <div className="p-6 sm:p-8 space-y-6">
                       <h3 className="text-lg font-bold text-[var(--adm-text)] mb-6">Informasi Profil</h3>
                       
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <Field label="Nama Pengguna *">
                            <input
                              id="profile-name"
                              value={profile.name}
                              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                              className={inputCls}
                              required
                            />
                          </Field>
                          <Field label="Jabatan / Peran *">
                            <input
                              id="profile-role"
                              value={profile.role}
                              onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                              className={inputCls}
                              required
                            />
                          </Field>
                       </div>

                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <Field label="Email Pengguna (Google)">
                            <input
                              id="profile-email"
                              type="email"
                              value={profile.email}
                              readOnly
                              className={`${inputCls} opacity-60 cursor-not-allowed`}
                              title="Email disinkronkan otomatis dari Google"
                            />
                          </Field>
                          <Field label="Nomor WhatsApp *">
                            <div className="flex rounded-xl bg-transparent focus-within:ring-2 focus-within:ring-[var(--adm-accent)]/30 focus-within:border-[var(--adm-accent)] transition-colors border border-[var(--adm-border)] relative">
                              <CountrySelector selected={selectedCountry} onSelect={setSelectedCountry} theme="admin" />
                              <input
                                id="profile-phone"
                                value={profile.phone ? profile.phone.replace(new RegExp(`^${selectedCountry.dial_code.replace('+', '')}`), '') : ''}
                                onChange={(e) => {
                                  const val = e.target.value.replace(/\D/g, '');
                                  const cleanVal = val.startsWith('0') ? val.substring(1) : val;
                                  const code = selectedCountry.dial_code.replace('+', '');
                                  setProfile({ ...profile, phone: cleanVal ? `${code}${cleanVal}` : '' });
                                }}
                                className="w-full px-3 py-2.5 text-sm bg-transparent border-0 text-[var(--adm-text)] focus:outline-none focus:ring-0 placeholder:text-[var(--adm-text-3)]"
                                placeholder={selectedCountry.code === 'ID' ? "8123456..." : "123456789..."}
                                required
                              />
                            </div>
                          </Field>
                       </div>

                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <Field label="Lokasi">
                            <input
                              id="profile-location"
                              value={profile.location}
                              onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                              className={inputCls}
                            />
                          </Field>
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

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-[100] bg-[var(--adm-card)] border border-[var(--adm-border)] shadow-xl rounded-2xl px-5 py-3 flex items-center gap-3"
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              toastMessage.type === 'success' 
                ? 'bg-[var(--adm-success)]/20 text-[var(--adm-success)]' 
                : 'bg-[var(--adm-danger)]/20 text-[var(--adm-danger)]'
            }`}>
              {toastMessage.type === 'success' ? <CheckCircle2 size={18} strokeWidth={2.5} /> : <AlertTriangle size={18} strokeWidth={2.5} />}
            </div>
            <p className="text-[13px] font-bold text-[var(--adm-text)]">{toastMessage.text}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
