"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const steps = [
  {
    title: "Pilih Paket Website",
    description: "Pilih paket yang paling sesuai dengan kebutuhan Anda, lalu hubungi kami dengan isi form atau langsung hubungi via WhatsApp."
  },
  {
    title: "Diskusi & DP 50%",
    description: "Kita diskusikan detail konsepnya via WhatsApp. Setelah sepakat, lakukan pembayaran DP 50%."
  },
  {
    title: "Pembuatan & Revisi",
    description: "Tim kami langsung merancang dan mengerjakan website Anda. Anda bebas memantau dan meminta revisi."
  },
  {
    title: "Pelunasan & Serah Terima",
    description: "Setelah Anda puas 100%, lakukan pelunasan sisa biaya. Website langsung di-online-kan atau diserahkan ke Anda!"
  }
];

export default function WorkflowSteps() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section className="py-16 lg:py-24 bg-white relative overflow-hidden">
      {/* Dekorasi Latar */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-50/50 rounded-full blur-3xl -mr-40 -mt-40 opacity-50 pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-blue-600 font-bold tracking-wider uppercase text-xs mb-4">Langkah Mudah Memulai</h2>
          <h3 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">Cara Kerja & Pembayaran</h3>
          <p className="text-lg text-gray-600 font-medium">Proses transparan dan anti-ribet. Dari pemilihan paket hingga website siap mengudara, semuanya jelas sejak awal!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 relative">
          {/* Garis Penghubung (Hanya Desktop) */}
          <div className="hidden lg:block absolute top-10 left-24 right-24 h-0.5 bg-gray-100 z-0"></div>

          {steps.map((step, index) => {
            const isActive = activeStep === index;
            
            return (
              <motion.div 
                key={index}
                onClick={() => setActiveStep(index)}
                
                
                
                transition={{ delay: index * 0.1 }}
                className="relative z-10 flex flex-col items-center text-center group cursor-pointer"
              >
                <div className="relative mb-6">
                  <div className={`absolute inset-0 bg-blue-500 rounded-full blur-[20px] scale-150 transition-opacity duration-700 ${isActive ? 'opacity-40 animate-pulse' : 'opacity-0'}`} />
                  <div className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center shadow-xl bg-blue-600 text-white font-black text-2xl transition-transform duration-500 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`}>
                    {index + 1}
                  </div>
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h4>
                <p className="text-sm text-gray-600 leading-relaxed font-medium">{step.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
