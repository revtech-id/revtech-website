"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { fadeUpVariant } from '@/lib/animations';

export default function HeroSection() {
  return (
    <section className="relative min-h-[85vh] md:min-h-[90vh] flex items-center pt-24 pb-32 md:pt-32 md:pb-40 lg:pt-32 lg:pb-48 overflow-hidden bg-white">
      {/* Background Image */}
      <div 
        className="hidden md:block absolute inset-0 z-0 pointer-events-none bg-[url('/assets/revtech-bg.webp')] bg-contain bg-bottom xl:bg-right-bottom bg-no-repeat opacity-40 xl:opacity-100"
      />
      
      {/* Seamless White Fade Overlay */}
      <div className="hidden md:block absolute inset-y-0 left-0 w-full xl:w-3/4 bg-gradient-to-t xl:bg-gradient-to-r from-white via-white/90 xl:via-white/80 to-transparent xl:to-transparent z-0 pointer-events-none" />

      <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
        <motion.div 
           
           
          animate="visible" 
          className="flex flex-col items-start max-w-2xl space-y-5 md:space-y-6"
        >
          
          <h1 className="text-4xl sm:text-5xl md:text-[5rem] font-black tracking-tight leading-[1.15] md:leading-[1.05] text-[#111827]">
            Wadah Solusi <br/>
            <span className="text-primary">Digital.</span>
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl text-gray-500 max-w-lg leading-relaxed font-medium">
            Kami siap mempercepat pertumbuhan Anda melalui layanan pembuatan website premium, pilihan katalog produk digital, hingga pengembangan solusi ide custom yang dibangun dari nol.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-2 md:pt-4 w-full sm:w-auto">
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
      </div>
    </section>
  );
}
