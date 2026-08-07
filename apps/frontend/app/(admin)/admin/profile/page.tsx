"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PageHeader, AdminCard, StatusBadge } from "@/components/admin/ui";
import { CountrySelector } from "@/components/ui/CountrySelector";
import { countries as COUNTRIES } from "@/lib/countries";

const inputCls =
  "w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-500 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const fadeUp = (i: number) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { delay: i * 0.06, type: "spring" as const, stiffness: 300, damping: 24 } },
});

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    name: "Superadmin",
    role: "Founder & CEO",
    email: "hi@revtech.id",
    phone: "6281234567890",
    bio: "Solo founder & lead engineer di RevTech Business OS. Mengembangkan solusi website & digital agency untuk UMKM dan bisnis modern.",
    location: "Indonesia",
    website: "https://hi-revtech.my.id",
  });

  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);

  const [passwords, setPasswords] = useState({
    current: "",
    newPass: "",
    confirm: "",
  });

  const [saved, setSaved] = useState(false);
  const [passSaved, setPassSaved] = useState(false);

  function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function handlePassSave(e: React.FormEvent) {
    e.preventDefault();
    setPassSaved(true);
    setPasswords({ current: "", newPass: "", confirm: "" });
    setTimeout(() => setPassSaved(false), 2500);
  }

  return (
    <div>
      <div className="pt-2"></div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile Card Overview */}
        <motion.div {...fadeUp(0)} className="space-y-4">
          <AdminCard>
            <div className="p-6 text-center">
              {/* Large Avatar */}
              <div className="relative inline-block mb-4">
                <div
                  className="w-24 h-24 rounded-3xl flex items-center justify-center text-3xl font-black text-white shadow-xl mx-auto"
                  style={{ background: "linear-gradient(135deg, var(--adm-accent), var(--adm-purple))" }}
                >
                  R
                </div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center text-[14px] shadow-md border-2 border-white cursor-pointer hover:bg-blue-700 transition-colors">
                  <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                </div>
              </div>

              <h2 className="text-lg font-bold text-slate-800">{profile.name}</h2>
              <p className="text-xs font-semibold text-blue-600 mt-0.5">{profile.role}</p>

              <div className="mt-3 flex justify-center gap-2">
                <StatusBadge label="Superadmin" variant="indigo" />
                <StatusBadge label="Active" variant="emerald" />
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 text-left space-y-3">
                <div className="flex items-center gap-3 text-xs text-slate-600">
                  <span className="material-symbols-outlined text-[18px] text-slate-400">mail</span>
                  <span className="truncate">{profile.email}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-600">
                  <span className="material-symbols-outlined text-[18px] text-slate-400">phone</span>
                  <span>+{profile.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-600">
                  <span className="material-symbols-outlined text-[18px] text-slate-400">location_on</span>
                  <span>{profile.location}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-600">
                  <span className="material-symbols-outlined text-[18px] text-slate-400">language</span>
                  <a href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline truncate">
                    {profile.website}
                  </a>
                </div>
              </div>
            </div>
          </AdminCard>

          {/* Quick Access to Security */}
          <AdminCard>
            <div className="p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <span className="material-symbols-outlined text-[16px] text-indigo-500">verified_user</span>
                Akses & Keamanan Akun
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Akun ini memiliki hak akses penuh (Superadmin) untuk mengelola seluruh module RevTech Business OS.
              </p>
            </div>
          </AdminCard>
        </motion.div>

        {/* Right Column: Edit Profile & Password */}
        <div className="lg:col-span-2 space-y-6">
          {/* Edit Profile Info Form */}
          <motion.div {...fadeUp(1)}>
            <AdminCard title="Informasi Profil & Founder">
              <form onSubmit={handleProfileSave} className="p-5 space-y-4">
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
                  <Field label="Email Bisnis *">
                    <input
                      id="profile-email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      className={inputCls}
                      required
                    />
                  </Field>
                  <Field label="Nomor WhatsApp *">
                    <div className="flex rounded-xl bg-transparent focus-within:ring-2 focus-within:ring-blue-500/30 focus-within:border-blue-400 transition-colors border border-slate-200 overflow-hidden">
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
                        className="w-full px-3 py-2.5 text-sm bg-transparent border-0 text-slate-700 focus:outline-none focus:ring-0 placeholder:text-slate-400"
                        placeholder={selectedCountry.code === 'ID' ? "8123456..." : "123456789..."}
                        required
                      />
                    </div>
                  </Field>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Lokasi">
                    <input
                      id="profile-location"
                      value={profile.location}
                      onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Website">
                    <input
                      id="profile-website"
                      value={profile.website}
                      onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                      className={inputCls}
                    />
                  </Field>
                </div>

                <Field label="Bio / Ringkasan Profile">
                  <textarea
                    id="profile-bio"
                    rows={3}
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    className={inputCls}
                  />
                </Field>

                <div className="pt-2 flex justify-end">
                  <button
                    id="save-profile"
                    type="submit"
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-colors ${
                      saved ? "bg-emerald-600" : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {saved ? "check_circle" : "save"}
                    </span>
                    {saved ? "Tersimpan!" : "Simpan Perubahan"}
                  </button>
                </div>
              </form>
            </AdminCard>
          </motion.div>

          {/* Change Password Form */}
          <motion.div {...fadeUp(2)}>
            <AdminCard title="Ubah Kata Sandi">
              <form onSubmit={handlePassSave} className="p-5 space-y-4">
                <Field label="Kata Sandi Saat Ini">
                  <input
                    id="pass-current"
                    type="password"
                    value={passwords.current}
                    onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                    className={inputCls}
                    placeholder="••••••••"
                  />
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Kata Sandi Baru">
                    <input
                      id="pass-new"
                      type="password"
                      value={passwords.newPass}
                      onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })}
                      className={inputCls}
                      placeholder="••••••••"
                    />
                  </Field>
                  <Field label="Konfirmasi Kata Sandi Baru">
                    <input
                      id="pass-confirm"
                      type="password"
                      value={passwords.confirm}
                      onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                      className={inputCls}
                      placeholder="••••••••"
                    />
                  </Field>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    id="save-password"
                    type="submit"
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-colors ${
                      passSaved ? "bg-emerald-600" : "bg-slate-800 hover:bg-slate-900"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {passSaved ? "check_circle" : "lock_reset"}
                    </span>
                    {passSaved ? "Sandi Diperbarui!" : "Perbarui Sandi"}
                  </button>
                </div>
              </form>
            </AdminCard>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
