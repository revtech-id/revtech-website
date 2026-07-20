"use client";

import { motion, Variants } from 'framer-motion';

import { fadeUpVariant } from '@/lib/animations';

export default function LayananHeader() {
  return (
    <motion.div   animate="visible" className="text-center mb-16 lg:mb-24 max-w-3xl mx-auto">
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-6 tracking-tight leading-[1.1]">
        Tiga Pilar Solusi <br className="hidden sm:block"/>
        <span className="text-blue-600">Digital Anda.</span>
      </h1>
      <p className="text-lg md:text-xl text-gray-600 leading-relaxed font-medium">
        Kami hadir dengan tiga layanan utama yang dirancang khusus untuk mempermudah langkah Anda di era digital, apa pun kebutuhan dan tujuan Anda.
      </p>
    </motion.div>
  );
}
