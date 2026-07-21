"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();
  if (pathname === '/playground') return null;

  return (
    <footer className="bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">

        {/* Main Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-16 mb-12">

          {/* Col 1 — Brand */}
          <div className="lg:col-span-4">
            <Link href="/">
              <Image
                src="/assets/logo.webp"
                alt="RevTech Logo"
                width={150}
                height={60}
                priority={true}
                className="h-16 w-auto mix-blend-multiply object-left object-contain mb-4 -ml-3"
              />
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed mb-6 max-w-xs">
              Agensi digital modern untuk kebutuhan website, Produk Digital, dan Solusi Ide Custom.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-4">
              <a
                href="https://instagram.com/revtech.id"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram RevTech"
                className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-300 hover-btn"
              >
                {/* Instagram SVG */}
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
              </a>
              <a
                href="https://tiktok.com/@revtech.id"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok RevTech"
                className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-300 hover-btn"
              >
                {/* TikTok SVG */}
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.14 8.14 0 0 0 4.78 1.54V6.78a4.85 4.85 0 0 1-1.01-.09z"/>
                </svg>
              </a>
              <a
                href="https://wa.me/6281290018819?text=Halo%20RevTech,%20saya%20tertarik%20untuk%20konsultasi%20layanan%20digital."
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp RevTech"
                className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-300 hover-btn"
              >
                {/* WhatsApp SVG */}
                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Col 2 — Layanan */}
          <div className="lg:col-span-2">
            <h4 className="font-semibold text-slate-800 mb-5 text-sm">Layanan</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/jasa-web" className="text-slate-500 hover:text-blue-600 text-sm transition-colors">
                  Jasa Web
                </Link>
              </li>
              <li>
                <Link href="/katalog" className="text-slate-500 hover:text-blue-600 text-sm transition-colors">
                  Katalog Produk Digital
                </Link>
              </li>
              <li>
                <Link href="/kontak" className="text-slate-500 hover:text-blue-600 text-sm transition-colors">
                  Solusi Ide Custom
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3 — Jelajahi */}
          <div className="lg:col-span-2">
            <h4 className="font-semibold text-slate-800 mb-5 text-sm">Jelajahi</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/layanan" className="text-slate-500 hover:text-blue-600 text-sm transition-colors">
                  Layanan
                </Link>
              </li>
              <li>
                <Link href="/portofolio" className="text-slate-500 hover:text-blue-600 text-sm transition-colors">
                  Portofolio
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-slate-500 hover:text-blue-600 text-sm transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/kontak" className="text-slate-500 hover:text-blue-600 text-sm transition-colors">
                  Kontak
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4 — Kontak Kami */}
          <div className="lg:col-span-4">
            <h4 className="font-semibold text-slate-800 mb-5 text-sm">Kontak Kami</h4>
            <ul className="space-y-4">
              <li>
                <a
                  href="mailto:revtech.id.contact@gmail.com"
                  className="flex items-center gap-3 text-slate-500 hover:text-blue-600 text-sm transition-colors group"
                >
                  <span className="material-symbols-outlined text-[18px] shrink-0">mail</span>
                  <span className="break-all md:break-normal">revtech.id.contact@gmail.com</span>
                </a>
              </li>
              <li>
                <div className="flex items-center gap-3 text-slate-500 text-sm">
                  <span className="material-symbols-outlined text-[18px] shrink-0">location_on</span>
                  <span>Sukabumi, Jawa Barat</span>
                </div>
              </li>
            </ul>
          </div>

        </div>

        {/* Divider */}
        <hr className="border-0 h-px bg-slate-200 mb-6" />

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-xs">
            © {new Date().getFullYear()} RevTech. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-slate-400 hover:text-blue-600 text-xs transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-slate-400 hover:text-blue-600 text-xs transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
