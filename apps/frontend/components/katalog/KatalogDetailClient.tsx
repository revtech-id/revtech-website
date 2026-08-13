"use client";
import { ArrowLeft } from "lucide-react";

import { useEffect, useState } from "react";
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
  status: "published" | "draft";
  techStack: string[];
  pinned: boolean;
  price: string;
}

export default function KatalogDetailClient({ id }: { id: string }) {
  const [product, setProduct] = useState<ProdukDigital | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("revtech_produk_digital_v2");
    if (stored) {
      const parsed = JSON.parse(stored);
      const found = parsed.find((p: ProdukDigital) => p.id === id && p.status === "published");
      setProduct(found || null);
    }
    setLoading(false);
  }, [id]);

  if (loading) {
    return <div className="min-h-screen bg-white flex items-center justify-center">Loading...</div>;
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center pt-24 pb-16">
        <h1 className="text-3xl font-black text-gray-900 mb-4">Produk Tidak Ditemukan</h1>
        <p className="text-gray-500 mb-8">Maaf, produk digital yang Anda cari tidak ada atau sudah ditarik.</p>
        <Link href="/katalog" className="bg-slate-900 text-white font-bold px-6 py-3 rounded-full hover:bg-slate-800 transition-colors">
          Kembali ke Katalog
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 lg:pb-24 bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb & Navigation */}
        <div className="flex justify-start mb-10 w-full">
            <Link href="/katalog" className="inline-flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors">
                <ArrowLeft className="" size={16} />
                Kembali
            </Link>
        </div>

        {/* Header Detail Produk */}
        <header className="mb-12">
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-6 tracking-tight leading-[1.1]">
                {product.title}
            </h1>
            <p className="text-[13px] sm:text-base md:text-xl text-gray-600 leading-relaxed font-medium max-w-3xl">
                {product.description}
            </p>
        </header>

        {/* Cover Image */}
        <div className="w-full relative rounded-[2rem] overflow-hidden mb-16 shadow-lg border border-gray-100 bg-gray-50">
            {product.thumbnail ? (
                <Image 
                    src={product.thumbnail} 
                    alt={product.title} 
                    width={1920}
                    height={1080}
                    className="w-full h-auto"
                    priority
                />
            ) : (
                <div className="w-full aspect-[16/9] flex items-center justify-center text-gray-400">
                    Tidak ada gambar thumbnail
                </div>
            )}
        </div>

        {/* Grid Meta Data */}
        <div className="flex flex-col md:flex-row gap-8 py-8 border-y border-gray-100 mb-16 items-start md:items-center justify-between">
            <div className="flex flex-wrap gap-12 md:gap-16">
                <div>
                    <p className="text-gray-400 text-[11px] font-bold uppercase tracking-widest mb-1.5">Oleh</p>
                    <p className="text-gray-900 font-bold text-lg">{product.vendor}</p>
                </div>
                <div>
                    <p className="text-gray-400 text-[11px] font-bold uppercase tracking-widest mb-1.5">Kategori</p>
                    <p className="text-gray-900 font-bold text-lg">{product.category}</p>
                </div>
                {product.price && (
                    <div>
                        <p className="text-gray-400 text-[11px] font-bold uppercase tracking-widest mb-1.5">Harga</p>
                        <p className="text-blue-600 font-bold text-lg">{product.price}</p>
                    </div>
                )}
            </div>
            <div>
                {product.url && (
                    <a href={product.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-slate-900 text-white text-[13px] sm:text-base font-bold px-6 py-3.5 rounded-xl hover:bg-slate-800 transition-colors shadow-lg active:scale-95">
                        Lihat Live Demo <span className="material-symbols-outlined text-[18px]">launch</span>
                    </a>
                )}
            </div>
        </div>

        {/* Konten & Tech Stack (jika menggunakan HTML) */}
        <article 
            className="prose prose-slate prose-sm sm:prose-base md:prose-lg max-w-none mb-16 break-words
                       [&_.ql-align-center]:text-center [&_.ql-align-right]:text-right [&_.ql-align-justify]:text-justify
                       prose-img:rounded-2xl prose-img:shadow-lg"
            dangerouslySetInnerHTML={{ __html: (product.content || '<p>Tidak ada konten detail untuk produk ini.</p>').replace(/&nbsp;/g, ' ') }} 
        />

        {/* Tech Stack */}
        {product.techStack && product.techStack.length > 0 && (
            <div className="mb-16 pt-8 border-t border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Teknologi yang Digunakan</h3>
                <div className="flex flex-wrap gap-2">
                    {product.techStack.map((tech, idx) => (
                        <span key={idx} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-md text-sm font-semibold border border-gray-200 shadow-sm">
                            {tech}
                        </span>
                    ))}
                </div>
            </div>
        )}

        {/* CTA Bawah */}
        <div className="mt-16 py-16 px-8 bg-slate-900 rounded-[2.5rem] text-center shadow-2xl">
            <h3 className="text-3xl font-black text-white mb-4 tracking-tight">Tertarik dengan Produk Ini?</h3>
            <p className="text-sm sm:text-base md:text-lg text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
                Segera dapatkan {product.title} dan tingkatkan efisiensi serta kualitas proyek Anda bersama kami.
            </p>
            <Link href={`/kontak?produk=${product.id}`} className="bg-white text-blue-950 hover:bg-blue-50 font-bold text-[13px] sm:text-sm px-6 py-3 lg:px-7 lg:py-3.5 rounded-full shadow-md active:scale-95 inline-flex items-center justify-center gap-2 transition-colors">
                Pesan Sekarang
            </Link>
        </div>

      </div>
    </div>
  );
}
