"use client";

import { useState, useEffect } from 'react';
import { modificationMenu as defaultMods } from '@/data/pricing';
import { motion, AnimatePresence } from 'framer-motion';

export default function AfterSalesSupport() {
  const [isOpen, setIsOpen] = useState(false);
  const [modMenu, setModMenu] = useState(defaultMods);

  useEffect(() => {
    const load = () => {
      const saved = localStorage.getItem('revtech_modifications');
      if (saved) {
        try { setModMenu(JSON.parse(saved)); } catch (e) {}
      }
    };
    load();
    window.addEventListener('jasa-web-updated', load);
    return () => window.removeEventListener('jasa-web-updated', load);
  }, []);

  // Kunci scroll halaman saat modal terbuka
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  return (
    <>
      <section className="py-12 bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-50/50 border border-gray-200 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="text-left">
              <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-2">Butuh Fitur Ekstra atau Revisi Tambahan?</h2>
              <p className="text-gray-500 font-medium text-sm md:text-base">
                Lihat katalog transparan untuk estimasi biaya revisi dan fitur kustom pasca-rilis.
              </p>
            </div>
            <button 
              onClick={() => setIsOpen(true)}
              className="shrink-0 inline-flex items-center justify-center px-6 py-3.5 bg-slate-900 text-white text-[13px] sm:text-sm md:text-base font-bold rounded-xl hover-btn"
            >
              Lihat Katalog Harga
            </button>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            {/* Overlay Background */}
            <motion.div 
               
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            />
            
            {/* Modal Box */}
            <motion.div 
              
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl max-h-[85vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Header Modal */}
              <div className="p-5 sm:p-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">Katalog Revisi & Tambahan</h3>
                  <p className="text-[11px] sm:text-xs text-gray-500 mt-1">Estimasi biaya modifikasi pasca-rilis.</p>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 text-gray-500 transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {/* Isi Modal */}
              <div className="overflow-y-auto popup-scrollbar p-5 sm:p-6 bg-gray-50/50">
                {modMenu.map((menu, idx) => (
                  <div key={idx} className="mb-8 last:mb-0">
                    <div className="mb-4 pb-2 border-b border-gray-200/60">
                      <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-1">{menu.category}</h4>
                      <p className="text-[12px] sm:text-[13px] text-gray-500">{menu.description}</p>
                    </div>
                    
                    <div className="space-y-2">
                      {menu.items.map((item, itemIdx) => (
                        <div key={itemIdx} className="flex justify-between items-center gap-4 bg-white p-3 sm:p-4 rounded-xl border border-gray-100 shadow-sm">
                          <span className="text-[12px] sm:text-[13px] text-gray-700 font-medium leading-snug">{item.name}</span>
                          <span className="text-[12px] sm:text-[13px] font-bold text-gray-900 whitespace-nowrap text-right">{item.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="mt-8 p-4 bg-gray-100/80 rounded-xl border border-gray-200 flex items-start gap-3">
                  <span className="material-symbols-outlined text-gray-400 text-lg shrink-0 mt-0.5">info</span>
                  <p className="text-[11px] sm:text-[12px] text-gray-600 leading-relaxed font-medium">
                    <strong className="text-gray-900">Catatan:</strong> Harga di atas adalah estimasi dasar. Biaya final dapat disesuaikan kembali saat diskusi, tergantung pada tingkat kerumitan teknis dari request Anda.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
