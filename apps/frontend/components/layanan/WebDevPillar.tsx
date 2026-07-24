"use client";

import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import WebDevAnimation from '@/components/animations/WebDevAnimation';
import { Button } from '@/components/ui/Button';

import { fadeUpVariant } from '@/lib/animations';

export default function WebDevPillar() {
  return (
    <motion.div 
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={fadeUpVariant}
      className="bg-white border border-gray-100 rounded-[2rem] p-6 sm:p-8 md:p-10 lg:p-14 shadow-sm hover:shadow-xl [transition-property:box-shadow] duration-300 flex flex-col md:flex-row gap-8 lg:gap-12 items-center relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50/50 rounded-full blur-3xl -mr-40 -mt-40 opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="flex-1 relative z-10 lg:pr-10">
        <h2 className="flex flex-col sm:flex-row sm:items-center gap-4 text-3xl lg:text-4xl font-black text-gray-900 mb-6 tracking-tight">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shadow-sm shrink-0">
            <span className="material-symbols-outlined text-2xl">language</span>
          </div>
          Pembuatan Website
        </h2>
        <p className="text-gray-600 mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base font-medium">
          Tingkatkan kredibilitas online Anda dengan website profesional. Solusi tepat untuk segala kebutuhan, mulai dari Profil Pribadi, Landing Page, hingga platform berskala besar dengan performa tinggi.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 mb-10">
          <div className="flex items-start gap-3 text-gray-700">
            <span className="material-symbols-outlined text-blue-500 text-xl mt-0.5">devices</span>
            <div>
              <span className="font-bold text-sm block">100% Responsif</span>
              <span className="text-xs text-gray-500">Tampil sempurna di semua perangkat.</span>
            </div>
          </div>
          <div className="flex items-start gap-3 text-gray-700">
            <span className="material-symbols-outlined text-blue-500 text-xl mt-0.5">bolt</span>
            <div>
              <span className="font-bold text-sm block">Akses Cepat</span>
              <span className="text-xs text-gray-500">Performa maksimal, anti lemot.</span>
            </div>
          </div>
          <div className="flex items-start gap-3 text-gray-700">
            <span className="material-symbols-outlined text-blue-500 text-xl mt-0.5">travel_explore</span>
            <div>
              <span className="font-bold text-sm block">Ramah SEO</span>
              <span className="text-xs text-gray-500">Mudah ditemukan di Google.</span>
            </div>
          </div>
          <div className="flex items-start gap-3 text-gray-700">
            <span className="material-symbols-outlined text-blue-500 text-xl mt-0.5">auto_awesome</span>
            <div>
              <span className="font-bold text-sm block">Desain Premium</span>
              <span className="text-xs text-gray-500">Visual modern dan profesional.</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 shadow-md text-[13px] sm:text-sm md:text-base">
            <Link href="/jasa-web">
              Pelajari Selengkapnya <span className="material-symbols-outlined ml-2 text-sm">arrow_forward</span>
            </Link>
          </Button>
        </div>
      </div>
      
      <div className="hidden md:flex w-48 h-48 lg:w-80 lg:h-80 opacity-90 relative z-10 items-center justify-center bg-gray-50 rounded-full">
        <WebDevAnimation />
      </div>
    </motion.div>
  );
}
