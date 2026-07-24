"use client";

import { motion, Variants } from "framer-motion";

import { fadeUpVariant, staggerContainerVariant, defaultViewport } from '@/lib/animations';

const metrics = [
  {
    id: "quality",
    icon: "verified",
    title: "Fokus pada Kualitas",
    description: "Desain & kode berstandar industri terbaik untuk produk digital yang cepat, aman, dan stabil."
  },
  {
    id: "no-hidden-fee",
    icon: "payments",
    title: "Transparansi Biaya",
    description: "Harga transparan sejak awal tanpa khawatir biaya tambahan yang tidak terduga."
  },
  {
    id: "modern-tech",
    icon: "rocket_launch",
    title: "Teknologi Terkini",
    description: "Dibangun dengan tech-stack modern yang fleksibel mengikuti skala kebutuhan Anda."
  },
  {
    id: "support-guide",
    icon: "support_agent",
    title: "Dukungan & Panduan",
    description: "Panduan lengkap dan tim suportif yang siap membantu operasional produk digital Anda."
  }
];

export default function TrustSection() {
  return (
    <section className="py-20 lg:py-28 bg-white relative overflow-hidden border-t border-gray-100/80">
      {/* Decorative blurred brand blobs */}
      <div className="absolute top-1/4 left-0 w-80 h-80 rounded-full bg-blue-400/5 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-0 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column - Header (Sticky on desktop) */}
          <div className="lg:col-span-5 lg:sticky lg:top-28 text-left space-y-6">
            <h2 className="text-blue-600 font-bold tracking-wider uppercase text-xs mb-4">Keunggulan</h2>
            <h2 className="text-3xl sm:text-4xl md:text-[2.5rem] lg:text-5xl font-black text-gray-900 tracking-tight leading-tight">
              Kenapa Memilih <br />
              <span className="text-blue-600">RevTech?</span>
            </h2>
            <p className="text-base sm:text-lg md:text-[17px] lg:text-lg text-gray-500 font-medium leading-relaxed max-w-lg">
              Kami tidak hanya membangun platform digital, tetapi mewujudkan ide-ide Anda dengan standar teknologi mutakhir dan transparansi penuh.
            </p>
          </div>

          {/* Right Column - Glowing Premium Card Grid */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            variants={staggerContainerVariant}
            className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 lg:gap-8"
          >
            {metrics.map((metric, idx) => (
              <motion.div 
                key={metric.id}
                variants={fadeUpVariant}
                className="group relative rounded-3xl p-[1px] bg-gradient-to-br from-blue-500/15 via-transparent to-blue-500/15 hover:from-blue-500 hover:to-blue-400 hover-card block"
              >
                <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-950 p-6 lg:p-8 rounded-[23px] text-left h-full flex flex-col justify-between min-h-[200px] lg:min-h-[220px]">
                  <div>
                    {/* Glowing Icon container */}
                    <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-white/10 text-white mb-6 group-hover:scale-110 group-hover:bg-white group-hover:text-primary transition-all duration-300 shadow-md">
                      <span className="material-symbols-outlined text-[22px]">{metric.icon}</span>
                    </div>
                    <h3 className="font-bold text-white text-base mb-3 tracking-tight group-hover:text-blue-200 transition-colors">
                      {metric.title}
                    </h3>
                    <p className="text-sm text-slate-300 leading-relaxed font-medium">
                      {metric.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

        </div>
      </div>
    </section>
  );
}
