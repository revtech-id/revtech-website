"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { fadeUpVariant } from '@/lib/animations';

export default function HeroSection() {
  return (
    <section className="relative min-h-[85vh] lg:min-h-[90vh] flex items-center pt-32 lg:pt-40 pb-20 lg:pb-48 overflow-hidden bg-white">
      
      {/* --- DESKTOP & TABLET: Background Image & Gradient --- */}
      <div 
        className="hidden md:block absolute inset-0 z-0 pointer-events-none bg-[url('/assets/revtech-bg.webp')] bg-cover lg:bg-contain bg-right-bottom bg-no-repeat opacity-40 lg:opacity-100"
      />
      <div className="hidden md:block absolute inset-y-0 left-0 w-full md:w-3/4 bg-gradient-to-r from-white via-white/95 to-transparent z-0 pointer-events-none" />
      {/* ----------------------------------------------- */}

      <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
        <div className="flex flex-col md:flex-row items-start justify-between">
          
          {/* Text Content */}
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={fadeUpVariant}
            className="flex flex-col items-start text-left max-w-2xl space-y-4 md:space-y-5 md:w-[70%] lg:w-1/2 pt-4 pb-8 sm:pb-16 lg:pb-0"
          >
            <h1 className="text-4xl sm:text-5xl md:text-[4rem] lg:text-[5rem] font-black tracking-tight leading-[1.15] md:leading-[1.05] text-[#111827]">
              Wadah Solusi <br/>
              <span className="text-primary">Digital.</span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-lg lg:text-xl text-gray-500 max-w-lg leading-relaxed font-medium">
              Kami siap mempercepat pertumbuhan Anda melalui layanan pembuatan website premium, pilihan katalog produk digital, hingga pengembangan solusi ide custom yang dibangun dari nol.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-2 md:pt-4 w-full sm:w-auto justify-start">
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
            </div>
          </motion.div>

          {/* MOBILE: Gambar disembunyikan sesuai instruksi untuk tampilan yang lebih bersih */}

        </div>
      </div>
    </section>
  );
}
