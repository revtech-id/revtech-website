"use client";

import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import CatalogAnimation from '@/components/animations/CatalogAnimation';
import { Button } from '@/components/ui/Button';

import { fadeUpVariant } from '@/lib/animations';

export default function CatalogPillar() {
  return (
    <motion.div 
      variants={fadeUpVariant} 
      initial="hidden" 
      whileInView="visible" 
      viewport={{ once: true, margin: '-64px' }} 
      className="bg-white border border-gray-100 rounded-[2rem] p-6 sm:p-8 md:p-10 lg:p-14 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col md:flex-row-reverse gap-8 lg:gap-12 items-center relative overflow-hidden group"
    >
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-900/5 rounded-full blur-3xl -ml-40 -mt-40 opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="flex-1 relative z-10 lg:pl-10">
        <h2 className="flex flex-col sm:flex-row sm:items-center gap-4 text-3xl lg:text-4xl font-black text-gray-900 mb-6 tracking-tight">
          <div className="w-12 h-12 bg-blue-900/10 rounded-xl flex items-center justify-center text-blue-900 shadow-sm shrink-0">
            <span className="material-symbols-outlined text-2xl">storefront</span>
          </div>
          Katalog Produk Digital
        </h2>
        <p className="text-gray-600 mb-6 sm:mb-8 leading-relaxed text-base sm:text-lg font-medium">
          Eksplorasi beragam produk digital siap pakai di etalase kami. Temukan solusi instan yang praktis dan langsung bisa diterapkan untuk mendukung segala aktivitas dan proyek Anda hari ini juga.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 mb-10">
          <div className="flex items-start gap-3 text-gray-700">
            <span className="material-symbols-outlined text-blue-900 text-xl mt-0.5 opacity-90">timer</span>
            <div>
              <span className="font-bold text-sm block">Siap Pakai</span>
              <span className="text-xs text-gray-500">Solusi instan langsung beroperasi.</span>
            </div>
          </div>
          <div className="flex items-start gap-3 text-gray-700">
            <span className="material-symbols-outlined text-blue-900 text-xl mt-0.5 opacity-90">schedule</span>
            <div>
              <span className="font-bold text-sm block">Hemat Waktu</span>
              <span className="text-xs text-gray-500">Tanpa proses setup yang panjang.</span>
            </div>
          </div>
          <div className="flex items-start gap-3 text-gray-700">
            <span className="material-symbols-outlined text-blue-900 text-xl mt-0.5 opacity-90">auto_awesome</span>
            <div>
              <span className="font-bold text-sm block">Desain Premium</span>
              <span className="text-xs text-gray-500">Visual modern dan profesional.</span>
            </div>
          </div>
          <div className="flex items-start gap-3 text-gray-700">
            <span className="material-symbols-outlined text-blue-900 text-xl mt-0.5 opacity-90">payments</span>
            <div>
              <span className="font-bold text-sm block">Sekali Bayar</span>
              <span className="text-xs text-gray-500">Akses penuh tanpa langganan.</span>
            </div>
          </div>
        </div>
        
        <Button asChild size="lg" className="w-full sm:w-auto bg-blue-900 hover:bg-blue-950 shadow-md">
          <Link href="/katalog">
            Lihat Semua Katalog <span className="material-symbols-outlined ml-2 text-sm">arrow_forward</span>
          </Link>
        </Button>
      </div>
      
      <div className="hidden md:flex w-48 h-48 lg:w-80 lg:h-80 opacity-90 relative z-10 items-center justify-center bg-gray-50 rounded-full overflow-hidden">
        <CatalogAnimation />
      </div>
    </motion.div>
  );
}
