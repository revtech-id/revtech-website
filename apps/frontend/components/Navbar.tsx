"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();

  if (pathname === '/playground') return null;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getLinkClass = (path: string) => {
    const isActive = pathname === path;
    return isActive 
      ? "text-sm font-semibold text-primary px-4 py-2 rounded-full bg-primary/10 transition-all"
      : "text-sm font-medium text-gray-600 hover:text-primary hover:bg-primary/5 px-4 py-2 rounded-full transition-all";
  };

  const getMobileLinkClass = (path: string) => {
    const isActive = pathname === path;
    return isActive 
      ? "block px-4 py-3 rounded-xl bg-primary/10 text-primary font-bold transition-all"
      : "block px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 font-medium transition-all";
  };

    return (
        <nav className="fixed top-0 w-full z-50 glass-nav transition-all duration-300" id="navbar">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                <a href="/" className="flex items-center gap-2 group">
                    <Image src="/assets/logo.webp" alt="RevTech Logo" width={150} height={60} className="h-8 sm:h-10 md:h-12 w-auto mix-blend-multiply object-contain" />
                </a>

                <div className="hidden lg:flex items-center space-x-1 bg-white/50 px-4 py-2 rounded-full border border-white/60 shadow-sm">
                    <Link className={getLinkClass('/')} href="/">Beranda</Link>
                    <Link className={getLinkClass('/layanan')} href="/layanan">Layanan</Link>
                    <Link className={getLinkClass('/jasa-web')} href="/jasa-web">Jasa Web</Link>
                    <Link className={getLinkClass('/katalog')} href="/katalog">Katalog</Link>
                    <Link className={getLinkClass('/portofolio')} href="/portofolio">Portofolio</Link>
                    <Link className={getLinkClass('/blog')} href="/blog">Blog</Link>

                </div>

                <div className="hidden lg:flex">
                    <Link href="/kontak" className="relative group inline-flex items-center justify-center">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-[#8A2BE2] rounded-full blur opacity-40 group-hover:opacity-70 transition duration-300"></div>
                        <button className="relative bg-primary text-white font-bold text-sm px-6 py-2.5 rounded-full hover:bg-blue-700 hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center gap-2">
                            Hubungi Kami
                            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                        </button>
                    </Link>
                </div>

                <button 
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="lg:hidden text-gray-700 p-3 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label="Toggle menu"
                >
                    <span className="material-symbols-outlined text-2xl">{isMobileMenuOpen ? 'close' : 'menu'}</span>
                </button>
            </div>

            {/* Mobile Menu */}
            <div className={`lg:hidden absolute top-20 left-0 w-full bg-white shadow-2xl border-t border-gray-100 transition-all duration-300 origin-top ${isMobileMenuOpen ? 'opacity-100 scale-y-100 visible' : 'opacity-0 scale-y-0 invisible'}`}>
                <div className="flex flex-col p-4 space-y-2">
                    <Link className={getMobileLinkClass('/')} href="/" onClick={() => setIsMobileMenuOpen(false)}>Beranda</Link>
                    <Link className={getMobileLinkClass('/layanan')} href="/layanan" onClick={() => setIsMobileMenuOpen(false)}>Layanan</Link>
                    <Link className={getMobileLinkClass('/jasa-web')} href="/jasa-web" onClick={() => setIsMobileMenuOpen(false)}>Jasa Web</Link>
                    <Link className={getMobileLinkClass('/katalog')} href="/katalog" onClick={() => setIsMobileMenuOpen(false)}>Katalog</Link>
                    <Link className={getMobileLinkClass('/portofolio')} href="/portofolio" onClick={() => setIsMobileMenuOpen(false)}>Portofolio</Link>
                    <Link className={getMobileLinkClass('/blog')} href="/blog" onClick={() => setIsMobileMenuOpen(false)}>Blog</Link>

                </div>
                
                <div className="p-4 pt-0 mt-2 border-t border-gray-100">
                    <Link href="/kontak" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center gap-2 w-full bg-primary text-white font-bold px-4 py-3 rounded-xl hover:bg-blue-700 transition-colors mt-4">
                        Hubungi Kami
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </Link>
                </div>
            </div>
        </nav>
    );
}
