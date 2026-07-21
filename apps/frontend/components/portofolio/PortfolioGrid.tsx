"use client";

import { motion } from 'framer-motion';
import PortfolioCard from './PortfolioCard';

import { fadeUpVariant, staggerContainerVariant, defaultViewport } from '@/lib/animations';

import { PortfolioCaseStudyData } from '@/lib/portfolio';

export default function PortfolioGrid({ portfolios }: { portfolios: PortfolioCaseStudyData[] }) {
    return (
        <section>
            {portfolios.length === 0 ? (
                <motion.div 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    variants={fadeUpVariant}
                    className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm"
                >
                    <span className="material-symbols-outlined text-6xl text-gray-300 mb-4 block">construction</span>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Proyek Masih Dalam Pengembangan</h3>
                    <p className="text-gray-600">Kami sedang menyiapkan mahakarya selanjutnya untuk kategori ini.</p>
                </motion.div>
            ) : (
                <motion.div 
                    initial="hidden"
                    whileInView="visible"
                    viewport={defaultViewport}
                    variants={staggerContainerVariant}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
                >
                    {portfolios.map((portfolio) => (
                        <PortfolioCard key={portfolio.slug} item={portfolio} />
                    ))}
                </motion.div>
            )}
        </section>
    );
}
