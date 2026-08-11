"use client";

import { useState, useEffect } from "react";
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
  const [bgImage, setBgImage] = useState<string | null>(null);

  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem("revtech_hero_settings");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.bgImage) setBgImage(parsed.bgImage);
        } catch (e) {}
      }
    };
    handleStorageChange();
    window.addEventListener("storage", handleStorageChange);
    // Custom event for immediate updates within same window
    window.addEventListener("hero-settings-updated", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("hero-settings-updated", handleStorageChange);
    };
  }, []);

  return (
    <section className="relative min-h-[85vh] lg:min-h-[90vh] flex items-center pt-32 lg:pt-40 pb-20 lg:pb-48 overflow-hidden bg-white">

      {/* --- DESKTOP & TABLET: Background Image & Gradient --- */}
      <div
        className="hidden md:block absolute inset-0 z-0 pointer-events-none bg-cover xl:bg-contain bg-right-bottom bg-no-repeat opacity-40 xl:opacity-100 transition-all duration-300"
        style={{ backgroundImage: `url('${bgImage || "/assets/revtech-bg.webp"}')` }}
      />
      <div className="hidden md:block absolute inset-y-0 left-0 w-full md:w-3/4 bg-gradient-to-r from-white via-white/95 to-transparent z-0 pointer-events-none" />
      {/* ----------------------------------------------- */}

      <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
        <div className="flex flex-col md:flex-row items-start justify-between">

          {/* Text Content — staggered entrance per elemen */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={heroContainerVariant}
            className="flex flex-col items-start text-left max-w-2xl space-y-4 md:space-y-5 md:w-[70%] lg:w-1/2 pt-4 pb-8 sm:pb-16 lg:pb-0"
          >
            <motion.h1
              variants={fadeUpVariant}
              className="text-[2.75rem] leading-[1.1] sm:text-5xl md:text-[4rem] lg:text-[5rem] font-black tracking-tight md:leading-[1.05] text-[#111827]"
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
