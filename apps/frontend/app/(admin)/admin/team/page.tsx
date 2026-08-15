"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AdminCard, AdminButton, AdminModal, AdminToast, AdminToolbar } from "@/components/admin/ui";
import { AdminTable, AdminTableHeader, AdminTableHead, AdminTableBody, AdminTableRow, AdminTableCell } from "@/components/admin/AdminTable";
import { Plus, Search, Edit2, Trash2, Shield, User, ShieldCheck, Mail, CheckCircle2, XCircle, RefreshCw, Copy, Loader2, Key } from "lucide-react";
import { db, firebaseConfig } from "@/lib/firebase";
import { collection, onSnapshot, doc, setDoc, deleteDoc, query, orderBy, updateDoc } from "firebase/firestore";
import { initializeApp, getApps } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { logActivity } from "@/lib/activityLog";
import { useUser } from "@/contexts/UserContext";

interface Staff {
  id: string;
  name: string;
  email: string;
  role: "Superadmin" | "Project Manager" | "Developer" | "Content Writer";
  status: "Aktif" | "Nonaktif";
  createdAt: string;
}

export default function TeamPage() {
  const { user: currentUser } = useUser();
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [newPasswordResult, setNewPasswordResult] = useState<{name: string, password: string} | null>(null);
  const [toastMessage, setToastMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);
  const [isGeneratingPassword, setIsGeneratingPassword] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState<Partial<Staff> & { password?: string }>({
    name: "",
    email: "",
    password: "",
    role: "Content Writer",
    status: "Aktif",
  });

  useEffect(() => {
    const q = query(collection(db, "staff"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const docs: Staff[] = [];
      snapshot.forEach(doc => {
        docs.push({ id: doc.id, ...doc.data() } as Staff);
      });
      setStaffList(docs);
    });
    return () => unsub();
  }, []);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ name: "", email: "", password: "", role: "Content Writer", status: "Aktif" });
    setIsModalOpen(true);
  };

  const openEditModal = (staff: Staff) => {
    setEditingId(staff.id);
    setFormData({ name: staff.name, email: staff.email, role: staff.role, status: staff.status });
    setIsModalOpen(true);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!editingId) {
      const firstName = val.split(" ")[0].toLowerCase().replace(/[^a-z0-9]/g, "");
      if (firstName) {
        // Only regenerate if the email/password hasn't been manually heavily modified
        // but for simplicity, we just auto-sync it while typing
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        setFormData(prev => ({
          ...prev,
          name: val,
          email: `${firstName}@revtech.com`,
          password: `${firstName}${randomNum}`
        }));
        return;
      }
    }
    setFormData(prev => ({ ...prev, name: val }));
  };

  const handleGenerateNewPassword = async () => {
    if (!editingId || !formData.name) return;
    setIsGeneratingPassword(true);
    const firstName = formData.name.split(" ")[0].toLowerCase().replace(/[^a-z0-9]/g, "");
    const newPassword = `${firstName}${Math.floor(1000 + Math.random() * 9000)}`;
    
    try {
      const idToken = await auth.currentUser?.getIdToken();
      const response = await fetch('/api/admin/staff/password', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ uid: editingId, newPassword })
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Gagal memperbarui kata sandi");
      }
      
      // Paksa karyawan untuk ganti sandi pada login berikutnya
      await updateDoc(doc(db, "staff", editingId), {
        requirePasswordChange: true
      });

      // Tampilkan popup modal agar mudah dicopy
      setNewPasswordResult({ name: formData.name, password: newPassword });
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Gagal memperbarui kata sandi", "error");
    } finally {
      setIsGeneratingPassword(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      showToast("Nama dan Email wajib diisi", "error");
      return;
    }
    if (!editingId && (!formData.password || formData.password.length < 6)) {
      showToast("Kata sandi wajib diisi (minimal 6 karakter) untuk akun baru", "error");
      return;
    }

    try {
      let id = editingId;
      
      // Jika membuat karyawan baru, buat akun Firebase Auth terlebih dahulu
      if (!editingId) {
        // Gunakan secondary app agar admin yang sedang login tidak ter-logout
        const tempAppName = "TempStaffCreationApp";
        const tempApp = getApps().find(a => a.name === tempAppName) || initializeApp(firebaseConfig, tempAppName);
        const tempAuth = getAuth(tempApp);
        
        const userCredential = await createUserWithEmailAndPassword(tempAuth, formData.email!, formData.password!);
        id = userCredential.user.uid;
        
        await tempAuth.signOut();
      }

      // Simpan data di Firestore
      const docId = id || `STF-${Date.now().toString().slice(-5)}`;
      const { password, ...staffData } = formData;
      await setDoc(doc(db, "staff", docId), {
        ...staffData,
        // Set flag wajib ganti sandi untuk akun baru
        ...(!editingId ? { requirePasswordChange: true } : {}),
        createdAt: editingId ? (staffList.find(s => s.id === editingId)?.createdAt || new Date().toISOString()) : new Date().toISOString()
      });
      
      setIsModalOpen(false);
      showToast(`Karyawan berhasil ${editingId ? 'diperbarui' : 'ditambahkan'}`);
      
      logActivity({
        type: "system",
        title: editingId ? "Karyawan Diperbarui" : "Karyawan Baru Ditambahkan",
        description: `${editingId ? 'Data karyawan' : 'Karyawan baru'} ${staffData.name} (${staffData.role}) telah disimpan.`,
        user: currentUser?.name || "Admin",
        notify: false
      });
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        showToast("Email sudah terdaftar", "error");
      } else {
        showToast("Gagal menyimpan data", "error");
      }
    }
  };

  const confirmDelete = async (id: string) => {
    try {
      // Hapus dari Firestore
      await deleteDoc(doc(db, "staff", id));
      
      // Hapus dari Firebase Auth via API
      const idToken = await auth.currentUser?.getIdToken();
      await fetch(`/api/admin/staff?uid=${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${idToken}` }
      });

      setDeletingId(null);
      showToast("Karyawan dihapus secara permanen");
      
      const deletedStaff = staffList.find(s => s.id === id);
      if (deletedStaff) {
        logActivity({
          type: "system",
          title: "Karyawan Dihapus",
          description: `Karyawan ${deletedStaff.name} telah dihapus dari sistem.`,
          user: currentUser?.name || "Admin",
          notify: false
        });
      }
    } catch (err) {
      console.error(err);
      showToast("Gagal menghapus", "error");
    }
  };

  const filteredStaff = staffList.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <AdminToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari nama atau email..."
        onAdd={openAddModal}
        addLabel="Tambah Karyawan"
        addIcon="add"
      />

      <AdminCard className="p-0 overflow-hidden">
        {filteredStaff.length === 0 ? (
          <div className="text-center py-16">
            <User size={48} className="mx-auto text-[var(--adm-text-3)] mb-4 opacity-50" />
            <h3 className="text-lg font-bold text-[var(--adm-text)] mb-2">Belum ada data</h3>
            <p className="text-sm text-[var(--adm-text-2)] max-w-md mx-auto">
              Belum ada karyawan yang ditambahkan atau tidak ada yang cocok dengan pencarian Anda.
            </p>
          </div>
        ) : (
          <AdminTable>
            <AdminTableHeader>
              <AdminTableHead>Karyawan</AdminTableHead>
              <AdminTableHead>Role</AdminTableHead>
              <AdminTableHead>Status</AdminTableHead>
              <AdminTableHead className="text-right">Aksi</AdminTableHead>
            </AdminTableHeader>
            <AdminTableBody>
              {filteredStaff.map((staff) => (
                <AdminTableRow key={staff.id}>
                  <AdminTableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[var(--adm-accent)]/10 text-[var(--adm-accent)] flex items-center justify-center font-bold">
                        {staff.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-[var(--adm-text)]">{staff.name}</div>
                        <div className="text-xs text-[var(--adm-text-3)] mt-0.5 flex items-center gap-1">
                          <Mail size={12} /> {staff.email}
                        </div>
                      </div>
                    </div>
                  </AdminTableCell>
                  <AdminTableCell>
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold ${
                      staff.role === 'Superadmin' 
                        ? 'bg-purple-100 text-purple-700 border border-purple-200'
                        : staff.role === 'Project Manager'
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : staff.role === 'Developer'
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        : 'bg-orange-100 text-orange-700 border border-orange-200'
                    }`}>
                      {staff.role === 'Superadmin' || staff.role === 'Project Manager' ? <ShieldCheck size={12} /> : <Shield size={12} />}
                      {staff.role}
                    </div>
                  </AdminTableCell>
                  <AdminTableCell>
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold ${
                      staff.status === 'Aktif'
                        ? 'bg-[var(--adm-success)]/10 text-[var(--adm-success)] border border-[var(--adm-success)]/20'
                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}>
                      {staff.status === 'Aktif' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                      {staff.status}
                    </div>
                  </AdminTableCell>
                  <AdminTableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); openEditModal(staff); }}
                        className="inline-flex items-center justify-center p-1.5 text-[var(--adm-text-3)] hover:text-[var(--adm-text)] transition-colors focus:outline-none"
                        title="Edit"
                      >
                        <Edit2 size={14} strokeWidth={2.5} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeletingId(staff.id); }}
                        className="inline-flex items-center justify-center p-1.5 text-[var(--adm-text-3)] hover:text-[var(--adm-danger)] transition-colors focus:outline-none"
                        title="Hapus"
                      >
                        <Trash2 size={14} strokeWidth={2.5} />
                      </button>
                    </div>
                  </AdminTableCell>
                </AdminTableRow>
              ))}
            </AdminTableBody>
          </AdminTable>
        )}
      </AdminCard>

      <AdminModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="max-w-md">
        <h3 className="text-xl font-bold text-[var(--adm-text)] mb-6">
          {editingId ? "Edit Karyawan" : "Tambah Karyawan Baru"}
        </h3>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[var(--adm-text-2)] mb-1.5">Nama Lengkap</label>
            <input 
              type="text"
              required
              value={formData.name}
              onChange={handleNameChange}
              className="w-full px-4 py-2.5 rounded-xl border border-[var(--adm-border)] bg-transparent text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--adm-accent)]/30 focus:border-[var(--adm-accent)] transition-all"
              placeholder="Masukan Nama Lengkap..."
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[var(--adm-text-2)] mb-1.5">Email</label>
            <input 
              type="email"
              required
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              disabled={!!editingId}
              className="w-full px-4 py-2.5 rounded-xl border border-[var(--adm-border)] bg-transparent text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--adm-accent)]/30 focus:border-[var(--adm-accent)] transition-all disabled:opacity-50"
              placeholder="Masukan Alamat Email..."
            />
            {!!editingId && <p className="text-[10px] mt-1 text-[var(--adm-text-3)]">Email tidak dapat diubah setelah dibuat.</p>}
          </div>
          <div>
            <label className="block text-xs font-bold text-[var(--adm-text-2)] mb-1.5">
              Kata Sandi
            </label>
            {!editingId ? (
              <div className="flex gap-2">
                <input 
                  type="text"
                  readOnly
                  value={formData.password || ""}
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--adm-border)] bg-[var(--adm-bg)] text-[var(--adm-text)] text-sm font-bold focus:outline-none"
                  title="Dibuat otomatis."
                />
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(`Akses Dashboard RevTech\nEmail: ${formData.email}\nSandi: ${formData.password}`);
                    showToast("Email & Sandi berhasil disalin!");
                  }}
                  className="flex-none px-4 flex items-center justify-center rounded-xl border border-[var(--adm-border)] bg-transparent text-[var(--adm-text-2)] hover:bg-[var(--adm-border)]/50 hover:text-[var(--adm-text)] transition-all"
                  title="Salin Akses (Email & Sandi)"
                >
                  <Copy size={18} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleGenerateNewPassword}
                disabled={isGeneratingPassword}
                className="w-full px-4 py-2.5 rounded-xl border border-[var(--adm-accent)]/30 bg-[var(--adm-accent)]/10 text-[var(--adm-accent)] text-sm font-bold hover:bg-[var(--adm-accent)]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGeneratingPassword ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Key size={16} />
                )}
                {isGeneratingPassword ? "Memproses..." : "Perbarui Sandi Otomatis"}
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[var(--adm-text-2)] mb-1.5">Role</label>
              <select
                value={formData.role}
                onChange={e => setFormData({...formData, role: e.target.value as "Superadmin" | "Project Manager" | "Developer" | "Content Writer"})}
                className="w-full px-4 py-2.5 rounded-xl border border-[var(--adm-border)] bg-[var(--adm-bg)] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--adm-accent)]/30 focus:border-[var(--adm-accent)] transition-all"
              >
                {formData.role === "Superadmin" && <option value="Superadmin">Superadmin</option>}
                <option value="Project Manager">Project Manager</option>
                <option value="Developer">Developer</option>
                <option value="Content Writer">Content Writer</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--adm-text-2)] mb-1.5">Status</label>
              <select
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value as "Aktif" | "Nonaktif"})}
                className="w-full px-4 py-2.5 rounded-xl border border-[var(--adm-border)] bg-[var(--adm-bg)] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--adm-accent)]/30 focus:border-[var(--adm-accent)] transition-all"
              >
                <option value="Aktif">Aktif</option>
                <option value="Nonaktif">Nonaktif</option>
              </select>
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-2 border-t border-[var(--adm-border)] mt-6">
            <AdminButton variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>Batal</AdminButton>
            <AdminButton type="submit">
              Simpan Data
            </AdminButton>
          </div>
        </form>
      </AdminModal>

      {/* Modal Hapus */}
      <AdminModal isOpen={!!deletingId} onClose={() => setDeletingId(null)} maxWidth="max-w-sm">
        <div className="text-center pt-2">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5 text-red-600">
            <Trash2 size={28} />
          </div>
          <h3 className="text-lg font-bold text-[var(--adm-text)] mb-2">Hapus Karyawan?</h3>
          <p className="text-sm text-[var(--adm-text-3)] mb-8">
            Karyawan yang dihapus tidak akan dapat mengakses sistem lagi. Tindakan ini tidak bisa dibatalkan.
          </p>
          <div className="flex gap-3 justify-center">
            <AdminButton variant="ghost" onClick={() => setDeletingId(null)}>
              Batal
            </AdminButton>
            <AdminButton variant="danger" onClick={() => deletingId && confirmDelete(deletingId)}>
              Ya, Hapus
            </AdminButton>
          </div>
        </div>
      </AdminModal>

      {/* Modal Sukses Ganti Password */}
      <AdminModal isOpen={!!newPasswordResult} onClose={() => setNewPasswordResult(null)} maxWidth="max-w-sm">
        <div className="text-center pt-2">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5 text-green-600">
            <CheckCircle2 size={28} />
          </div>
          <h3 className="text-lg font-bold text-[var(--adm-text)] mb-2">Sandi Diperbarui!</h3>
          <p className="text-sm text-[var(--adm-text-3)] mb-4">
            Kata sandi untuk <strong>{newPasswordResult?.name}</strong> telah diperbarui. Silakan salin sandi di bawah ini:
          </p>
          <div className="bg-[var(--adm-bg)] border border-[var(--adm-border)] rounded-xl p-4 mb-6">
            <p className="text-2xl font-mono font-bold tracking-wider text-[var(--adm-text)]">
              {newPasswordResult?.password}
            </p>
          </div>
          <div className="flex gap-3 justify-center">
            <AdminButton variant="primary" onClick={() => {
              if (newPasswordResult) {
                navigator.clipboard.writeText(newPasswordResult.password);
                logActivity({
                  type: "system",
                  title: "Sandi Karyawan Diperbarui",
                  description: `Kata sandi untuk karyawan ${newPasswordResult.name} telah direset otomatis.`,
                  user: currentUser?.name || "Admin",
                  notify: false
                });
              }
              setNewPasswordResult(null);
              showToast("Sandi berhasil disalin!");
            }} className="w-full">
              Salin & Tutup
            </AdminButton>
          </div>
        </div>
      </AdminModal>

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
