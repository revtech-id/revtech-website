"use client";
import { ArrowRight } from "lucide-react";

import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import CustomSystemAnimation from '@/components/animations/CustomSystemAnimation';
import { Button } from '@/components/ui/Button';

import { fadeUpVariant } from '@/lib/animations';

export default function CustomPillar() {
  return (
    <motion.div 
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={fadeUpVariant}
      className="bg-white border border-gray-100 rounded-[2rem] p-6 sm:p-8 md:p-10 lg:p-14 shadow-sm hover:shadow-xl [transition-property:box-shadow] duration-300 flex flex-col md:flex-row gap-8 lg:gap-12 items-center relative overflow-hidden group"
    >
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-slate-100/50 rounded-full blur-3xl -mr-40 -mb-40 opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="flex-1 relative z-10 lg:pr-10">
        <h2 className="flex flex-col sm:flex-row sm:items-center gap-4 text-3xl lg:text-4xl font-black text-gray-900 mb-6 tracking-tight">
          <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-800 shadow-sm shrink-0">
            <span className="material-symbols-outlined text-2xl">lightbulb</span>
          </div>
          Solusi Ide Custom
        </h2>
        <p className="text-gray-600 mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base font-medium">
          Wujudkan ide inovatif Anda menjadi nyata. Ceritakan kebutuhan unik Anda, dan kami akan merancang sistem digital khusus yang 100% disesuaikan dengan alur kerja yang Anda inginkan.
        </p>
        
        <div className="bg-slate-50 rounded-2xl p-4 sm:p-6 border border-slate-200 flex flex-row items-center sm:items-start gap-3 sm:gap-4 mb-8 sm:mb-10">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-md shrink-0">
            <span className="material-symbols-outlined text-lg sm:text-base">forum</span>
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-gray-900 mb-1 sm:mb-2 uppercase tracking-wide text-xs sm:text-sm">Mari Diskusi Santai!</h4>
            <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
              Ceritakan ide nya kami akan kasih solusinya dan bangun sistemnya sampai siap di gunakan
            </p>
          </div>
        </div>
        
        <Button asChild size="lg" className="w-full sm:w-auto bg-slate-900 hover:bg-black text-[13px] sm:text-sm md:text-base">
          <Link href="/kontak?paket=custom#form-pesanan">
            Ceritakan Ide Anda <ArrowRight className="ml-2 text-sm" size={16} />
          </Link>
        </Button>
      </div>
      
      <div className="hidden md:flex w-48 h-48 lg:w-80 lg:h-80 opacity-90 relative z-10 items-center justify-center bg-gray-50 rounded-full overflow-hidden">
        <CustomSystemAnimation />
      </div>
    </motion.div>
  );
}
