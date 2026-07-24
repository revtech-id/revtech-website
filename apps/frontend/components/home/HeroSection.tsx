"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { fadeUpVariant } from '@/lib/animations';

// Stagger container khusus untuk Hero — children muncul berurutan
const heroContainerVariant = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export default function HeroSection() {
  return (
    <section className="relative min-h-[85vh] lg:min-h-[90vh] flex items-center pt-28 sm:pt-32 lg:pt-40 pb-16 lg:pb-32 overflow-hidden bg-white">
      
      {/* --- TABLET & DESKTOP: Right-side Graphic (Vertically Centered) --- */}
      <div 
        className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 w-1/2 h-[85%] z-0 pointer-events-none bg-[url('/assets/revtech-bg.webp')] bg-contain bg-right bg-no-repeat opacity-80 lg:opacity-100"
      />
      <div className="hidden md:block absolute inset-y-0 left-0 w-3/4 md:w-3/5 lg:w-1/2 bg-gradient-to-r from-white via-white/95 to-transparent z-0 pointer-events-none" />

      <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
        <div className="flex flex-col md:flex-row items-center justify-between">
          
          {/* Text Content */}
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={heroContainerVariant}
            className="flex flex-col items-start text-left max-w-2xl space-y-4 md:space-y-5 w-full md:w-1/2 pt-4 pb-6 lg:pb-0"
          >
            <motion.h1 
              variants={fadeUpVariant}
              className="text-[2rem] sm:text-5xl md:text-[3.5rem] lg:text-[5rem] font-black tracking-tight leading-[1.15] md:leading-[1.05] text-[#111827]"
            >
              <span className="block whitespace-nowrap">Wadah Solusi</span>
              <span className="block text-primary whitespace-nowrap">Digital.</span>
            </motion.h1>
            
            <motion.p 
              variants={fadeUpVariant}
              className="text-base sm:text-lg md:text-lg lg:text-xl text-gray-500 max-w-lg leading-relaxed font-medium"
            >
              Kami siap mempercepat pertumbuhan Anda melalui layanan pembuatan website premium, pilihan katalog produk digital, hingga pengembangan solusi ide custom yang dibangun dari nol.
            </motion.p>
            
            <motion.div 
              variants={fadeUpVariant}
              className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-2 md:pt-4 w-full sm:w-auto justify-start"
            >
              <a href="#pilar-layanan" className="w-full sm:w-auto">
                <Button size="lg" className="w-full text-[15px]">
                  Lihat Layanan <span className="material-symbols-outlined ml-2 text-[20px]">arrow_forward</span>
                </Button>
              </a>
              <Link href="/portofolio" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full text-[15px]">
                  Lihat Karya Kami
                </Button>
              </Link>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
