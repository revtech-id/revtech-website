"use client";

import { Button } from "@/components/ui/Button";

export default function AICtaBanner() {
  return (
    <section className="py-20 lg:py-32 px-4 sm:px-6 lg:px-8 bg-gray-50/50 mt-10">
      <div className="max-w-5xl mx-auto relative flex flex-col md:flex-row items-stretch">
        
        {/* Background Container (Hidden Overflow for gradients/blur) */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-[#1e293b] to-blue-950 rounded-[2rem] shadow-xl overflow-hidden border border-slate-800">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[100px] pointer-events-none translate-x-1/3 -translate-y-1/3"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/20 rounded-full blur-[80px] pointer-events-none -translate-x-1/2 translate-y-1/2"></div>
        </div>

        {/* Text Content */}
        <div className="w-full md:w-[60%] p-8 pt-12 md:py-16 pl-8 md:pl-16 lg:pl-24 flex flex-col justify-center items-start relative z-20">
                  <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight tracking-tight">
                    Masih Ragu atau <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">Punya Pertanyaan?</span>
                  </h2>
          <p className="text-blue-100/80 text-base md:text-lg mb-8 max-w-[400px] leading-relaxed font-medium">
            Mari diskusikan kebutuhan website Anda bersama Asisten Pintar kami, atau hubungi tim ahli kami via WhatsApp.
          </p>
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent("open-speed-dial"))}
            className="w-full sm:w-auto bg-white text-blue-950 hover:bg-blue-50 font-black text-base px-8 py-5 rounded-xl shadow-[0_0_30px_rgba(255,255,255,0.15)] hover-btn inline-flex items-center justify-center gap-2 relative z-20"
          >
            <span className="material-symbols-outlined text-[20px]">forum</span> Mulai Konsultasi Sekarang
          </button>
        </div>

        {/* Image Section - Desktop (Absolute to ensure bottom alignment) */}
        <div className="absolute bottom-0 right-0 w-[45%] h-full pointer-events-none z-10 hidden md:flex items-end justify-end">
          <img 
            src="/images/robot-ai.webp" 
            alt="AI Assistant Robot" 
            className="absolute bottom-0 right-0 lg:-right-8 w-auto max-w-none object-contain object-bottom drop-shadow-2xl translate-y-[2px]"
            style={{ height: '135%', maxHeight: '550px' }}
          />
        </div>

        {/* Image Section - Mobile */}
        <div className="relative w-full h-[280px] pointer-events-none flex items-end justify-end z-10 mt-4 md:hidden">
          <img 
            src="/images/robot-ai.webp" 
            alt="AI Assistant Robot" 
            className="absolute bottom-0 -right-4 w-auto max-w-none object-contain object-bottom drop-shadow-2xl translate-y-[2px]"
            style={{ height: '115%' }}
          />
        </div>

      </div>
    </section>
  );
}
