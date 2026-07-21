"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

export default function WhatsAppFAB() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHighlighting, setIsHighlighting] = useState(false);
  const fabRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOpenSpeedDial = () => {
      setIsMenuOpen(true);
      setIsHighlighting(true);
      setTimeout(() => setIsHighlighting(false), 1500); // Remove highlight after 1.5s
    };

    window.addEventListener("open-speed-dial", handleOpenSpeedDial);
    return () => window.removeEventListener("open-speed-dial", handleOpenSpeedDial);
  }, []);

  const openChatbot = () => {
    window.dispatchEvent(new CustomEvent("open-chatbot"));
    setIsMenuOpen(false);
  };

  return (
    <div ref={fabRef} className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50">
      
      {/* Menu Items Container */}
      <div className="absolute bottom-full right-0 mb-4 sm:mb-5 flex flex-col gap-3 sm:gap-4">
        
        {/* Tanya AI Button */}
        <div className={`relative flex items-center justify-end group origin-bottom transition-all duration-300 ease-out ${isMenuOpen ? "scale-100 opacity-100 translate-y-0 delay-100" : "scale-50 opacity-0 translate-y-8 pointer-events-none"}`}>
          <span className="absolute right-[55px] sm:right-[60px] bg-gray-900 text-white text-[12px] sm:text-[13px] font-semibold px-3.5 py-1.5 rounded-lg whitespace-nowrap shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            Tanya AI
          </span>
          <button 
            onClick={openChatbot}
            className="flex items-center justify-center w-[48px] h-[48px] sm:w-[50px] sm:h-[50px] bg-blue-600 rounded-full shadow-md hover:shadow-xl hover:scale-110 transition-all duration-300 relative z-10 border border-blue-400/50"
            aria-label="Tanya AI"
          >
            <Image
              src="/images/icon-robot.webp" 
              alt="AI Icon" 
              width={40}
              height={40}
              className="w-[85%] h-[85%] object-contain drop-shadow-md" 
            />
          </button>
        </div>

        {/* WhatsApp Button */}
        <div className={`relative flex items-center justify-end group origin-bottom transition-all duration-300 ease-out ${isMenuOpen ? "scale-100 opacity-100 translate-y-0 delay-75" : "scale-50 opacity-0 translate-y-8 pointer-events-none"}`}>
          <span className="absolute right-[55px] sm:right-[60px] bg-gray-900 text-white text-[12px] sm:text-[13px] font-semibold px-3.5 py-1.5 rounded-lg whitespace-nowrap shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            Konsultasi WA
          </span>
          <a
            href="https://wa.me/6281290018819?text=Halo%20RevTech,%20saya%20tertarik%20untuk%20konsultasi%20layanan%20digital."
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center w-[48px] h-[48px] sm:w-[50px] sm:h-[50px] bg-[#25D366] text-white rounded-full shadow-md hover:shadow-xl hover:scale-110 transition-all duration-300 relative z-10"
            aria-label="Konsultasi WhatsApp"
            onClick={() => setIsMenuOpen(false)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-[24px] h-[24px] sm:w-[28px] sm:h-[28px]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </a>
        </div>
      </div>

      {/* Main Toggle Button */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className={`flex items-center justify-center w-[56px] h-[56px] sm:w-[64px] sm:h-[64px] rounded-full shadow-2xl transition-all duration-300 ${isHighlighting ? "ring-8 ring-blue-400/60 scale-110" : ""} ${isMenuOpen ? "bg-gray-900 text-white rotate-45 scale-90" : "bg-blue-600 text-white hover:bg-blue-700 hover:scale-105"}`}
        aria-label="Menu Tindakan"
      >
        <span className="material-symbols-outlined text-[28px] sm:text-[32px]">
          {isMenuOpen ? "add" : "forum"}
        </span>
      </button>

    </div>
  );
}
