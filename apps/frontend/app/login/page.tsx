"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";

import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const [loadingType, setLoadingType] = useState<"email" | "google" | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotMessage, setShowForgotMessage] = useState(false);

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingType("email");
    setTimeout(() => {
      router.push("/admin/dashboard");
    }, 1500);
  };

  const handleLogin = () => {
    setLoadingType("google");
    // Dummy simulation of OAuth redirect / loading
    setTimeout(() => {
      router.push("/admin/dashboard");
    }, 1500);
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
                    className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-[15px] shadow-sm"
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
                      className="w-full pl-11 pr-12 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-[15px] shadow-sm"
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
                disabled={loadingType !== null}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-3.5 font-bold transition-all shadow-[0_4px_14px_0_rgba(37,99,235,0.2)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center text-[15px]"
              >
                {loadingType === "email" ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="animate-spin" size={18} />
                    <span>Memverifikasi...</span>
                  </div>
                ) : (
                  "Masuk"
                )}
              </button>
            </form>

            <div className="flex items-center w-full mb-6">
              <div className="flex-1 border-t border-gray-200"></div>
              <span className="px-4 text-[11px] uppercase tracking-wider text-gray-400 font-bold">Atau masuk dengan</span>
              <div className="flex-1 border-t border-gray-200"></div>
            </div>

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
