"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { countries } from "@/lib/countries";

export interface Country {
  name: string;
  code: string;
  emoji: string;
  dial_code: string;
}

interface CountrySelectorProps {
  selected: Country;
  onSelect: (country: Country) => void;
  theme?: "public" | "admin";
}

export function CountrySelector({ selected, onSelect, theme = "public" }: CountrySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isPublic = theme === "public";

  return (
    <div className="relative flex shrink-0" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`bg-transparent border-r h-full flex items-center justify-center gap-2 outline-none transition-colors ${
          isPublic 
            ? "border-gray-200 rounded-l-xl text-gray-900 font-bold pl-4 pr-9 group-hover:bg-gray-100" 
            : "border-[var(--adm-border)] rounded-l-lg text-[var(--adm-text)] font-semibold pl-3 pr-7"
        }`}
      >
        <img src={`https://flagcdn.com/w20/${selected.code.toLowerCase()}.png`} alt={selected.code} className={`h-auto object-contain rounded-sm shadow-sm ${isPublic ? "w-5" : "w-4"}`} />
        <span className={isPublic ? "text-[14px]" : "text-[13px]"}>{selected.dial_code}</span>
      </button>
      
      {isPublic ? (
         <span className={`absolute right-2.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px] text-gray-500 pointer-events-none z-10 transition-transform ${isOpen ? 'rotate-180' : ''}`}>expand_more</span>
      ) : (
         <ChevronDown className={`absolute right-1.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--adm-text-3)] pointer-events-none z-10 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className={`absolute left-0 overflow-y-auto z-50 flex flex-col p-1 ${
              isPublic
                ? "top-[calc(100%+8px)] w-64 max-h-60 bg-white border border-gray-100 rounded-xl shadow-xl shadow-gray-200/50 custom-scrollbar"
                : "top-[calc(100%+4px)] w-[200px] max-h-48 bg-[var(--adm-card)] border border-[var(--adm-border)] rounded-lg shadow-xl"
            }`}
          >
            {countries.map(country => (
              <button
                key={country.code}
                type="button"
                onClick={() => {
                  onSelect(country);
                  setIsOpen(false);
                }}
                className={`flex items-center gap-3 px-3 rounded-md text-left transition-colors ${
                  isPublic
                    ? `py-2.5 text-sm ${selected.code === country.code ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 font-medium'}`
                    : `py-2 text-sm ${selected.code === country.code ? 'bg-[var(--adm-accent)]/10 text-[var(--adm-accent)] font-bold' : 'text-[var(--adm-text-2)] hover:text-[var(--adm-text)] font-medium'}`
                }`}
              >
                <img src={`https://flagcdn.com/w20/${country.code.toLowerCase()}.png`} alt={country.code} loading="lazy" className={`h-auto object-contain rounded-sm shadow-sm ${isPublic ? "w-5" : "w-4"}`} />
                <span>{country.name}</span>
                <span className={`ml-auto ${
                  isPublic 
                    ? (selected.code === country.code ? 'text-blue-500' : 'text-gray-500')
                    : (selected.code === country.code ? 'text-[var(--adm-accent)]' : 'text-[var(--adm-text-3)]')
                }`}>{country.dial_code}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
