"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { auth, googleProvider, db } from "@/lib/firebase";
import { signInWithPopup } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";

import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const [loadingType, setLoadingType] = useState<"google" | null>(null);


  const handleLogin = async () => {
    setLoadingType("google");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Cek Whitelist
      if (!user.email) throw new Error("Gagal mendapatkan email Google.");
      const q = query(collection(db, "admins"), where("email", "==", user.email));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        await auth.signOut();
        alert("🚨 PERINGATAN KEAMANAN: Upaya otorisasi Google ditolak.\n\nAkun Anda tidak memiliki izin. Aktivitas mencurigakan ini telah ditandai oleh sistem Firewall kami.");
        window.location.href = "/";
        return;
      }
      
      const adminData = querySnapshot.docs[0].data();
      if (adminData.role?.toLowerCase() !== "superadmin") {
         await auth.signOut();
         alert("Akses Ditolak: Portal ini khusus untuk Superadmin.");
         return;
      }

      // Set session cookie synchronously before routing to avoid middleware redirect loop
      document.cookie = `_auth_token=1; path=/; SameSite=Strict`;
      router.push("/admin/dashboard");
    } catch (error: any) {
      alert(error.message || "Gagal masuk dengan Google");
      setLoadingType(null);
    }
  };

  return (
    <main className="h-[100svh] relative flex items-center justify-start px-6 md:px-12 lg:px-24 overflow-hidden bg-[#F8FAFC]">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 flex justify-end">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/assets/revtech-bg.webp')" }}
        ></div>
        {/* Gradient putih di sebelah kiri persis seperti beranda */}
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
            <p className="text-gray-500 text-[13px] mb-8 leading-relaxed font-medium">
              Portal Akses Khusus Superadmin RevTech.
            </p>

            <button
              type="button"
              onClick={handleLogin}
              disabled={loadingType !== null}
              className="w-full bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-700 rounded-xl px-4 py-3.5 flex items-center justify-center gap-3 font-bold transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-sm active:scale-[0.98] text-[15px]"
            >
              {loadingType === "google" ? (
                <>
                  <Loader2 className="animate-spin text-blue-600" size={20} />
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <>
                  <svg width="22" height="22" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span>Google</span>
                </>
              )}
            </button>

      </motion.div>
    </main>
  );
}
