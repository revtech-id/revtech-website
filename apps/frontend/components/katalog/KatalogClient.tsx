"use client";

import { useState, useEffect } from "react";
import { PackageOpen, ExternalLink, Code2, Pin, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// Tipe data yang sama dengan di Admin
interface ProdukDigital {
  id: string;
  title: string;
  vendor: string;
  category: string;
  thumbnail: string;
  content: string;
  url: string | null;
  description: string;
  techStack: string[];
  pinned: boolean;
  price: string;
  status: "published" | "draft" | "archived";
}

const PRODUK_CATEGORIES = ["Semua", "Template Website", "Plugin / Extension", "UI Kit", "Script / Tools", "Template Dokumen", "Lainnya"];

export default function KatalogClient({ initialData = [] }: { initialData?: ProdukDigital[] }) {
  const [items, setItems] = useState<ProdukDigital[]>(initialData);
  const [activeCategory, setActiveCategory] = useState("Semua");

  const filteredItems = items.filter(item => {
    return activeCategory === "Semua" || item.category === activeCategory;
  }).sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return 0;
  });

  return (
    <div className="pt-20 pb-16 lg:pb-24 bg-gray-50/50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center mb-16 lg:mb-20">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-6 tracking-tight leading-tight">
            Produk <span className="block md:inline text-blue-600">Digital Kami</span>
          </h1>
          <p className="text-sm sm:text-base md:text-xl text-gray-600 max-w-2xl mx-auto font-medium leading-relaxed">
            Jelajahi berbagai solusi digital terbaik yang telah kami siapkan untuk membantu dan mempercepat pengembangan bisnis Anda.
          </p>
        </div>


        {/* Grid Katalog */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredItems.map(item => (
                <div
                  key={item.id}
                  className="group relative rounded-2xl overflow-hidden bg-white border border-gray-200 shadow-sm hover-card flex flex-col h-full"
                >
                  {/* Thumbnail */}
                  <div className="relative h-56 bg-white overflow-hidden border-b border-gray-100">
                    {item.thumbnail ? (
                      <Image src={item.thumbnail} alt={item.title} fill className="object-cover transition-transform duration-700 ease-[0.16,1,0.3,1] group-hover:scale-105 relative z-10" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 relative z-10">
                        <Code2 size={48} className="text-gray-300" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-blue-900/0 group-hover:bg-blue-900/5 transition-colors duration-500 z-20 pointer-events-none"></div>
                  </div>

                  {/* Content */}
                  <div className="p-5 flex flex-col flex-1">
                    <h4 className="text-gray-900 font-bold text-base md:text-lg mb-2 line-clamp-2 leading-snug">
                      {item.title}
                    </h4>
                    {item.price && (
                      <p className="text-blue-600 font-bold text-sm mb-4">{item.price}</p>
                    )}

                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">
                      <Link href={`/katalog/${item.id}`} className="flex items-center justify-between w-full before:absolute before:inset-0 before:z-30">
                        <span className="text-xs font-semibold text-gray-500 group-hover:text-blue-600 transition-colors">Lihat Detail</span>
                        <ArrowRight size={16} className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="py-24 text-center bg-white rounded-[2rem] border border-slate-200 mt-8">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
              <PackageOpen size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Belum ada produk</h3>
            <p className="text-slate-500 max-w-md mx-auto">
              Saat ini belum ada produk digital yang dipublikasikan. Nantikan rilis produk inovatif kami selanjutnya!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
