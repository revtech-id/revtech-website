"use client";

import { motion, Variants } from 'framer-motion';

import { fadeUpVariant } from '@/lib/animations';

export default function PortfolioHeader() {
    return (
        <motion.div     className="text-center mb-16 lg:mb-20">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-6 tracking-tight leading-tight">
                Karya & <span className="text-blue-600">Inovasi Kami</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto font-medium leading-relaxed">
                Jelajahi kumpulan mahakarya kami yang mencakup desain website responsif, instalasi katalog produk digital, hingga pengembangan solusi ide custom terintegrasi.
            </p>
        </motion.div>
    );
}
