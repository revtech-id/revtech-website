"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, Loader2, ShieldAlert } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { motion } from "framer-motion";

const RATE_LIMIT_KEY = "revtech_login_attempts";
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 menit

function getRateLimit() {
  try {
    const raw = localStorage.getItem(RATE_LIMIT_KEY);
    if (!raw) return { count: 0, lockedUntil: 0 };
    return JSON.parse(raw) as { count: number; lockedUntil: number };
  } catch { return { count: 0, lockedUntil: 0 }; }
}

function setRateLimit(data: { count: number; lockedUntil: number }) {
  localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(data));
}

function formatCountdown(ms: number) {
  const mins = Math.floor(ms / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function LoginPage() {
  const router = useRouter();
  const [loadingType, setLoadingType] = useState<"email" | "google" | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotMessage, setShowForgotMessage] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [lockedMs, setLockedMs] = useState(0);

  // Countdown timer saat akun terkunci
  useEffect(() => {
    const { lockedUntil } = getRateLimit();
    const remaining = lockedUntil - Date.now();
    if (remaining > 0) setLockedMs(remaining);
  }, []);

  useEffect(() => {
    if (lockedMs <= 0) return;
    const interval = setInterval(() => {
      setLockedMs(prev => {
        if (prev <= 1000) { clearInterval(interval); return 0; }
        return prev - 1000;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockedMs > 0]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    // Cek rate limit
    const rl = getRateLimit();
    if (rl.lockedUntil > Date.now()) {
      setLockedMs(rl.lockedUntil - Date.now());
      return;
    }

    setLoadingType("email");
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = result.user;
      
      // Cek Whitelist (Dual-Auth)
      if (!user.email) throw new Error("Gagal mendapatkan email pengguna.");
      
      let querySnapshot = await getDocs(query(collection(db, "admins"), where("email", "==", user.email)));
      
      if (querySnapshot.empty) {
        querySnapshot = await getDocs(query(collection(db, "staff"), where("email", "==", user.email)));
        
        if (querySnapshot.empty) {
          await auth.signOut();
          setErrorMsg("Akun tidak terdaftar dalam sistem. Hubungi Superadmin.");
          setLoadingType(null);
          return;
        }
      }
      
      // Login berhasil — reset rate limit dan set session cookie synchronously
      setRateLimit({ count: 0, lockedUntil: 0 });
      document.cookie = `_auth_token=1; path=/; SameSite=Strict`;
      router.push("/admin/dashboard");
    } catch (error: any) {
      // Catat gagal login
      const rl = getRateLimit();
      const newCount = rl.count + 1;
      if (newCount >= MAX_ATTEMPTS) {
        const lockedUntil = Date.now() + LOCKOUT_MS;
        setRateLimit({ count: newCount, lockedUntil });
        setLockedMs(LOCKOUT_MS);
        setErrorMsg("");
      } else {
        setRateLimit({ count: newCount, lockedUntil: 0 });
        const remaining = MAX_ATTEMPTS - newCount;
        setErrorMsg(`Email atau kata sandi salah. Sisa percobaan: ${remaining}`);
      }
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
              Selamat datang kembali! Silakan masuk ke akun Anda.
            </p>

            {/* Error & Lockout Banner */}
            {lockedMs > 0 ? (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5 text-left"
              >
                <ShieldAlert size={18} className="text-red-600 shrink-0" />
                <div>
                  <p className="text-[12px] font-bold text-red-700">Akses Diblokir Sementara</p>
                  <p className="text-[11px] text-red-600">Terlalu banyak percobaan gagal. Coba lagi dalam <strong>{formatCountdown(lockedMs)}</strong>.</p>
                </div>
              </motion.div>
            ) : errorMsg ? (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5"
              >
                <span className="text-[12px] text-red-700 font-medium">{errorMsg}</span>
              </motion.div>
            ) : null}

            <form onSubmit={handleEmailLogin} className="w-full mb-6 text-left">
              <div className="space-y-4 mb-6">
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors pointer-events-none z-10" size={20} strokeWidth={2} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Alamat Email"
                    required
                    disabled={lockedMs > 0}
                    className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-[15px] shadow-sm disabled:opacity-50"
                  />
                </div>
                <div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors pointer-events-none z-10" size={20} strokeWidth={2} />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Kata Sandi"
                      required
                      disabled={lockedMs > 0}
                      className="w-full pl-11 pr-12 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-[15px] shadow-sm disabled:opacity-50"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors outline-none z-10">
                      {showPassword ? <EyeOff size={20} strokeWidth={2} /> : <Eye size={20} strokeWidth={2} />}
                    </button>
                  </div>
                  
                  <div className="flex justify-end mt-2">
                    <button type="button" onClick={() => setShowForgotMessage(true)} className="text-[12px] text-blue-600 hover:text-blue-700 font-bold transition-colors outline-none">
                      Lupa kata sandi?
                    </button>
                  </div>
                  
                  {showForgotMessage && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }} 
                      animate={{ opacity: 1, height: 'auto' }} 
                      className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-2 text-left mt-2 shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[16px] text-blue-600 mt-0.5 shrink-0">info</span>
                      <p className="text-[12px] text-blue-900/80 leading-relaxed font-medium">
                        Silakan hubungi <strong>Superadmin</strong> secara langsung untuk meminta reset kata sandi atau pemulihan akun.
                      </p>
                    </motion.div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={loadingType !== null || lockedMs > 0}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-3.5 font-bold transition-all shadow-[0_4px_14px_0_rgba(37,99,235,0.2)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center text-[15px]"
              >
                {loadingType === "email" ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="animate-spin" size={18} />
                    <span>Memverifikasi...</span>
                  </div>
                ) : lockedMs > 0 ? (
                  `Tunggu ${formatCountdown(lockedMs)}`
                ) : (
                  "Masuk"
                )}
              </button>
            </form>
      </motion.div>
    </main>
  );
}
