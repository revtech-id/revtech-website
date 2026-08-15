"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { AdminToast } from "@/components/admin/ui";
import { Lock, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { updatePassword } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { useUser } from "@/contexts/UserContext";

export default function ChangePasswordPage() {
  const { user } = useUser();
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword.length < 6) {
      showToast("Kata sandi minimal 6 karakter", "error");
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast("Konfirmasi sandi tidak cocok", "error");
      return;
    }

    if (!auth.currentUser || !user || !user._collection) {
      showToast("Sesi tidak valid, harap login ulang", "error");
      return;
    }

    setLoading(true);
    try {
      // 1. Update password di Firebase Auth
      await updatePassword(auth.currentUser, newPassword);

      // 2. Cabut flag requirePasswordChange di Firestore
      // Kita perlu tahu user ini ada di koleksi admins atau staff
      const userRef = doc(db, user._collection, auth.currentUser.uid);
      await updateDoc(userRef, {
        requirePasswordChange: false
      });

      showToast("Sandi berhasil diperbarui!");
      
      // Tunggu sebentar lalu redirect ke dashboard
      setTimeout(() => {
        window.location.href = "/admin/dashboard"; // Pakai location href agar context merefresh
      }, 1500);

    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/requires-recent-login') {
        showToast("Sesi kedaluwarsa. Harap logout dan login kembali sebelum mengganti sandi.", "error");
      } else {
        showToast("Gagal memperbarui sandi", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="h-[100svh] relative flex items-center justify-start px-6 md:px-12 lg:px-24 overflow-hidden bg-[#F8FAFC]">
      {toastMessage && (
        <AdminToast 
          isVisible={true}
          message={toastMessage.text}
          type={toastMessage.type}
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* Background Effects */}
      <div className="absolute inset-0 z-0 flex justify-end">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/assets/revtech-bg.webp')" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#F8FAFC] via-[#F8FAFC]/90 to-transparent w-full md:w-2/3 lg:w-1/2"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 200, damping: 20 }}
        className="relative z-10 w-full max-w-sm ml-0 lg:ml-12 flex flex-col items-center text-center"
      >
        <div className="mb-4 mt-2">
          <Image 
            src="/assets/logo.webp" 
            alt="RevTech Logo" 
            width={220} 
            height={70} 
            className="object-contain" 
            priority
          />
        </div>
        

        <div className="bg-amber-50 border border-amber-200 text-amber-700 p-3.5 rounded-xl mb-8 text-[12px] font-medium leading-relaxed text-left shadow-sm">
          <p className="font-bold mb-1 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">warning</span>
            Peringatan Penting
          </p>
          <p>
            Demi keamanan, karyawan tidak memiliki akses untuk mengelola akun secara mandiri. <strong>Harap ingat kata sandi baru Anda dengan baik.</strong> Jika Anda melupakannya, Anda tidak bisa melakukan reset manual dan harus melaporkannya ke Superadmin.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full mb-6 text-left">
          <div className="space-y-4 mb-6">
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors pointer-events-none z-10" size={20} strokeWidth={2} />
              <input 
                type={showPassword ? "text" : "password"}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pl-11 pr-11 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-[15px] shadow-sm"
                placeholder="Kata sandi baru (min. 6 karakter)"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="relative group">
              <CheckCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors pointer-events-none z-10" size={20} strokeWidth={2} />
              <input 
                type={showConfirmPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-11 pr-11 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-[15px] shadow-sm"
                placeholder="Konfirmasi kata sandi baru"
              />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none">
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-[15px] transition-all flex items-center justify-center shadow-lg shadow-blue-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Memperbarui..." : "Simpan Kata Sandi"}
          </button>
        </form>
      </motion.div>
    </main>
  );
}
