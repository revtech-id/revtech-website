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

const MOCK_DATA: ProdukDigital[] = [
  {
    id: "PD-1", title: "Template Website E-Commerce Pro", vendor: "RevTech Studio", category: "Template Website",
    thumbnail: "https://images.unsplash.com/photo-1661956602116-aa6865609028?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", 
    content: "<p>Template <strong>E-Commerce Pro</strong> adalah solusi terbaik untuk membangun toko online Anda dalam hitungan hari, bukan bulan.</p><h3>Fitur Utama</h3><ul><li>Desain Responsif 100%</li><li>SEO Optimized (Skor Lighthouse 90+)</li><li>Sistem Keranjang & Checkout Siap Pakai</li><li>Integrasi Mode Gelap/Terang</li></ul><p>Dibuat menggunakan teknologi terkini yaitu Next.js 14 App Router, TypeScript, dan Tailwind CSS. Template ini sangat mudah disesuaikan dengan panduan dokumentasi yang komprehensif.</p>", 
    url: "https://demo.revtech.id/ecommerce-pro",
    description: "Template Next.js super cepat untuk toko online dengan integrasi payment gateway dan desain konversi tinggi.", techStack: ["Next.js", "Tailwind CSS", "TypeScript"],
    pinned: true, price: "Rp 250.000", status: "published"
  },
  {
    id: "PD-2", title: "RevAdmin - UI Kit Dashboard", vendor: "RevTech Studio", category: "UI Kit",
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", 
    content: "<p><strong>RevAdmin</strong> mempercepat proses development aplikasi internal atau SaaS Anda hingga 50%. UI Kit komprehensif ini dirancang khusus untuk React dan Figma.</p><h3>Komponen Tersedia</h3><ul><li>Tabel Data Lanjutan dengan Sorting & Filtering</li><li>Chart & Statistik Interaktif (Recharts)</li><li>Form Multi-step dengan Validasi Zod</li><li>Autentikasi UI (Login, Register, Lupa Password)</li></ul><p>Setiap komponen dibuat dengan fokus pada aksesibilitas (a11y) dan pengalaman pengguna yang premium.</p>", 
    url: "https://figma.com/community/revadmin",
    description: "Dashboard UI Kit komprehensif untuk React dan Figma dengan 100+ komponen premium.", techStack: ["Figma", "React", "Framer Motion"],
    pinned: false, price: "Gratis", status: "published"
  },
  {
    id: "PD-3", title: "Sistem Kasir & POS Cloud", vendor: "RevTech Studio", category: "Script / Tools",
    thumbnail: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", 
    content: "<p>Aplikasi Point of Sale (POS) lengkap berbasis web yang siap dideploy untuk bisnis retail atau F&B Anda. Sistem ini mendukung pelacakan stok real-time melintasi berbagai cabang.</p><h3>Fitur Sistem</h3><ul><li>Manajemen Inventori & Peringatan Stok Menipis</li><li>Laporan Penjualan Harian, Mingguan, Bulanan</li><li>Dukungan Scanner Barcode & Printer Thermal</li><li>Manajemen Hak Akses Karyawan</li></ul><p>Tersedia beserta <em>source code</em> lengkap dan panduan instalasi di server VPS atau shared hosting Anda.</p>", 
    url: "#",
    description: "Aplikasi kasir Point of Sale lengkap dengan manajemen inventori dan laporan multi-cabang.", techStack: ["Laravel 11", "Vue 3", "MySQL"],
    pinned: true, price: "Mulai dari Rp 1.500.000", status: "published"
  }
];

export default function KatalogClient() {
  const [items, setItems] = useState<ProdukDigital[]>(MOCK_DATA);
  const [activeCategory, setActiveCategory] = useState("Semua");

  useEffect(() => {
    // Nanti akan dihubungkan dengan localStorage atau API di akhir (koneksi)
    const saved = localStorage.getItem("revtech_produk_digital_v2");
    if (saved) {
      const parsed = JSON.parse(saved);
      // Hanya tampilkan yang published
      setItems(parsed.filter((p: ProdukDigital) => p.status === "published"));
    }
  }, []);

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
