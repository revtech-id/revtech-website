"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader, AdminCard, StatusBadge, SaveButton } from "@/components/admin/ui";

import { CountrySelector } from "@/components/ui/CountrySelector";
import { countries as COUNTRIES } from "@/lib/countries";
import { updateProfile } from "./actions";
import ImageCropper from "@/components/ui/ImageCropper";
import { CheckCircle2 } from "lucide-react";
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

  const [passwords, setPasswords] = useState({
    current: "RevTech-Contact-4646!!",
    newPass: "",
    confirm: "",
  });

  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatar);
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
    setAvatarPreview(croppedImage);
  };

  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [passSaved, setPassSaved] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  async function handleSaveAll(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const res = await updateProfile({ profile, passwords });
      if (res.success) {
        setSaved(true);
        setUser({ ...user, ...profile, avatar: avatarPreview });
        
        logActivity({
          type: "profile_updated",
          title: "Profil Diperbarui",
          description: `Data profil berhasil diperbarui oleh ${user.name}`,
          user: user.name,
        });

        if (passwords.newPass) {
          setPasswords({ ...passwords, newPass: "", confirm: "" });
        }
        setTimeout(() => setSaved(false), 2500);
      } else {
        alert(res.message);
      }
    } catch (err) {
      alert("Terjadi kesalahan saat menyimpan profil.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div>
      <div className="pt-2"></div>
      <div className="space-y-6 w-full">
        
        {/* Main Profile Card */}
        <motion.div {...fadeUp(1)}>
          <AdminCard>
            <form onSubmit={handleSaveAll}>
              {/* Profile Avatar Section */}
              <div className="p-6 sm:p-8 border-b border-[var(--adm-border)] flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-6">
                  <input type="file" ref={fileInputRef} hidden accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} />
                  <div 
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-full flex shrink-0 items-center justify-center text-5xl font-bold text-white relative z-10 overflow-hidden shadow-sm"
                    style={{ background: avatarPreview ? undefined : "var(--adm-accent)" }}
                  >
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
                    ) : (
                      profile.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  
                  <div className="flex-1 text-center sm:text-left mt-2 sm:mt-0">
                     <h3 className="text-lg font-bold text-[var(--adm-text)]">Foto Profil</h3>
                     <p className="text-xs text-[var(--adm-text-2)] mt-1 mb-4 leading-relaxed max-w-xl">
                        Unggah foto profil baru Anda di sini. Disarankan menggunakan gambar dengan rasio 1:1, beresolusi minimal 500x500 px, dan ukuran maksimal 2MB (format JPG, PNG, atau WebP).
                     </p>
                     <div className="flex flex-wrap items-center justify-center sm:justify-start gap-5">
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="text-[var(--adm-text)] text-xs font-semibold flex items-center gap-1.5 outline-none focus:outline-none hover:opacity-70 transition-opacity">
                           <span className="material-symbols-outlined text-[16px]">cloud_upload</span>
                           Ubah Foto
                        </button>
                        <button type="button" onClick={() => setAvatarPreview(null)} className="text-red-500 text-xs font-semibold flex items-center gap-1.5 outline-none focus:outline-none hover:opacity-70 transition-opacity">
                           <span className="material-symbols-outlined text-[16px]">delete</span>
                           Hapus
                        </button>
                     </div>
                  </div>
              </div>

              {/* Informasi Profil */}
              <div className="px-6 py-5 border-b border-[var(--adm-border)] flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[var(--adm-text)]">Informasi Profil</h3>
                  <p className="text-xs text-[var(--adm-text-2)] mt-1">Perbarui data diri dan kontak Anda di sini.</p>
                </div>
              </div>
              
              <div className="p-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              <div className="px-6 pt-6 pb-2 border-t border-[var(--adm-border)] flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[var(--adm-text)]">Akses & Keamanan Akun</h3>
                  <p className="text-xs text-[var(--adm-text-2)] mt-1">Kelola email login dan kata sandi Anda di sini.</p>
                </div>
              </div>

              <div className="p-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Email Login *">
                    <input
                      id="profile-email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      className={inputCls}
                      required
                      disabled
                    />
                  </Field>
                  <Field label="Kata Sandi Saat Ini">
                    <div className="relative">
                      <input
                        id="pass-current"
                        type={showCurrent ? "text" : "password"}
                        value={passwords.current}
                        onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                        className={`${inputCls} pr-10`}
                        placeholder="••••••••"
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowCurrent(!showCurrent)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--adm-text-3)] opacity-40 flex items-center justify-center transition-opacity outline-none focus:outline-none focus:ring-0"
                      >
                        <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'wght' 300" }}>{showCurrent ? "visibility_off" : "visibility"}</span>
                      </button>
                    </div>
                  </Field>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Kata Sandi Baru">
                    <div className="relative">
                      <input
                        id="pass-new"
                        type={showNew ? "text" : "password"}
                        value={passwords.newPass}
                        onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })}
                        className={`${inputCls} pr-10`}
                        placeholder="••••••••"
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowNew(!showNew)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--adm-text-3)] opacity-40 flex items-center justify-center transition-opacity outline-none focus:outline-none focus:ring-0"
                      >
                        <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'wght' 300" }}>{showNew ? "visibility_off" : "visibility"}</span>
                      </button>
                    </div>
                  </Field>
                  <Field label="Konfirmasi Kata Sandi Baru">
                    <div className="relative">
                      <input
                        id="pass-confirm"
                        type={showConfirm ? "text" : "password"}
                        value={passwords.confirm}
                        onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                        className={`${inputCls} pr-10`}
                        placeholder="••••••••"
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--adm-text-3)] opacity-40 flex items-center justify-center transition-opacity outline-none focus:outline-none focus:ring-0"
                      >
                        <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'wght' 300" }}>{showConfirm ? "visibility_off" : "visibility"}</span>
                      </button>
                    </div>
                  </Field>
                </div>

              </div>

              <div className="px-6 py-5 border-t border-[var(--adm-border)] bg-[var(--adm-bg)]/30 flex justify-end">
                <SaveButton type="submit" isSaving={isSaving} />
              </div>
            </form>
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
            Perubahan profil berhasil disimpan.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
