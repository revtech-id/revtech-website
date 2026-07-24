"use client";

import Image from 'next/image';

export default function AICtaBanner() {
  return (
    <section className="py-20 lg:py-32 px-4 sm:px-6 lg:px-8 bg-gray-50/50 mt-10">
      <div className="max-w-5xl mx-auto relative flex flex-col md:flex-row items-stretch">

        {/* Background Container */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-[#1e293b] to-blue-950 rounded-[2rem] shadow-xl overflow-hidden border border-slate-800">
          {/* Blur orbs hanya di desktop — di mobile terlalu berat untuk GPU */}
          <div className="hidden md:block absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-[80px] pointer-events-none translate-x-1/3 -translate-y-1/3" />
          <div className="hidden md:block absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-500/20 rounded-full blur-[60px] pointer-events-none -translate-x-1/2 translate-y-1/2" />
        </div>

        {/* Text Content */}
        <div className="w-full md:w-[60%] p-8 pt-12 md:py-12 pl-8 md:pl-10 lg:pl-24 flex flex-col justify-center items-center md:items-start text-center md:text-left relative z-20">
          <h2 className="text-3xl md:text-[2.2rem] lg:text-5xl font-bold text-white mb-4 leading-tight tracking-tight">
            Masih Ragu atau <br className="hidden lg:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">Punya Pertanyaan?</span>
          </h2>
          <p className="text-blue-100/80 text-base md:text-sm lg:text-lg mb-6 lg:mb-8 max-w-[320px] lg:max-w-[400px] leading-relaxed font-medium">
            Mari diskusikan kebutuhan website Anda bersama Asisten Pintar kami, atau hubungi tim ahli kami via WhatsApp.
          </p>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("open-speed-dial"))}
            className="bg-white text-blue-950 hover:bg-blue-50 font-black text-sm lg:text-base px-6 py-4 lg:px-8 lg:py-5 rounded-full hover-btn inline-flex items-center justify-center gap-2 relative z-20"
          >
            Mulai Konsultasi Sekarang
          </button>
        </div>

        {/* Image — Desktop only */}
        <div className="absolute bottom-0 right-0 w-[45%] h-full pointer-events-none z-10 hidden md:flex items-end justify-end">
          <Image
            src="/images/robot-ai.webp"
            alt="AI Assistant Robot"
            width={400}
            height={550}
            loading="lazy"
            className="absolute bottom-0 right-0 lg:-right-8 w-auto max-w-none object-contain object-bottom translate-y-[2px]"
            style={{ height: '135%', maxHeight: '550px' }}
          />
        </div>

        {/* Image — Mobile only, lazy loaded */}
        <div className="relative w-full h-[220px] pointer-events-none flex items-end justify-center z-10 mt-2 md:hidden overflow-hidden rounded-b-[2rem]">
          <Image
            src="/images/robot-ai.webp"
            alt="AI Assistant Robot"
            width={260}
            height={260}
            loading="lazy"
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-auto object-contain object-bottom translate-y-[2px]"
            style={{ height: '100%' }}
          />
        </div>

      </div>
    </section>
  );
}
