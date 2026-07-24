"use client";

import Link from 'next/link';
import PortfolioCard from '@/components/portofolio/PortfolioCard';
import type { PortfolioCaseStudyData } from '@/lib/portfolio';

export default function PortfolioSection({ portfolios }: { portfolios: PortfolioCaseStudyData[] }) {
    return (
      <section className="py-16 lg:py-24 bg-white overflow-hidden border-t border-gray-100/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 md:mb-16 gap-8">
                  <div className="max-w-2xl text-left">
                      <h2 className="text-blue-600 font-bold tracking-wider uppercase text-xs mb-3">Portofolio</h2>
                      <h3 className="text-3xl md:text-[2.5rem] lg:text-5xl font-black text-gray-900 mb-5 tracking-tight">Hasil <span className="text-blue-600">Pekerjaan.</span></h3>
                      <p className="text-sm sm:text-base md:text-base lg:text-xl text-gray-500 font-medium leading-relaxed">Beberapa proyek digital yang telah kami selesaikan dengan hasil terbaik.</p>
                  </div>
                  <div className="flex-shrink-0 mb-2">
                      <Link href="/portofolio" className="inline-flex items-center gap-2 text-sm sm:text-base text-gray-900 font-bold hover:text-blue-600 transition-colors group">
                          Lihat Selengkapnya <span className="material-symbols-outlined text-[13px] sm:text-sm transform group-hover:translate-x-1 transition-transform">arrow_forward</span>
                      </Link>
                  </div>
              </div>
              
              <div 
                  className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-8 -mx-4 px-4 sm:mx-0 sm:px-0 md:pb-0 md:grid md:grid-cols-3 md:gap-6 lg:gap-8" 
                  style={{ scrollbarWidth: 'none' }}
              >
                  {portfolios.slice(0, 3).map((item) => (
                      <PortfolioCard 
                          key={item.slug} 
                          item={item} 
                          className="w-[85vw] sm:w-[350px] flex-shrink-0 snap-center md:w-auto md:flex-shrink-1" 
                      />
                  ))}
              </div>
          </div>
      </section>
    );
}
