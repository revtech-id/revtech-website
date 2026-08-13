"use client";

import PortfolioCard from './PortfolioCard';

import { PortfolioCaseStudyData } from '@/lib/portfolio';

export default function PortfolioGrid({ portfolios }: { portfolios: PortfolioCaseStudyData[] }) {
    return (
        <section>
            {portfolios.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                    <span className="material-symbols-outlined text-6xl text-gray-300 mb-4 block">construction</span>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Proyek Masih Dalam Pengembangan</h3>
                    <p className="text-gray-600">Kami sedang menyiapkan mahakarya selanjutnya untuk kategori ini.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                    {portfolios.map((portfolio) => (
                        <PortfolioCard key={portfolio.slug} item={portfolio} />
                    ))}
                </div>
            )}
        </section>
    );
}
