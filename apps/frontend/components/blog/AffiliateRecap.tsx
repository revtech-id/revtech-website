"use client";
import { ArrowRight } from "lucide-react";

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { affiliateProducts } from '@/data/affiliate';

interface AffiliateRecapProps {
    productId: string;
}

export default function AffiliateRecap({ productId }: AffiliateRecapProps) {
    const product = affiliateProducts[productId];

    if (!product) return null;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ type: 'spring', stiffness: 80, damping: 20, mass: 0.8 }}
            className="my-16 bg-gradient-to-br from-gray-900 via-gray-800 to-primary p-8 sm:p-10 md:p-12 rounded-[2rem] text-center shadow-2xl relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none"></div>
            
            <div className="relative z-10">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-4 leading-tight !mt-0">Tunggu Apa Lagi?</h3>
                <p className="text-gray-300 text-sm sm:text-base mb-8 max-w-2xl mx-auto leading-relaxed">
                    Jangan biarkan ide hebat Anda tertunda karena masalah teknis. Segera gunakan <strong className="text-white">{product.name}</strong> dan wujudkan website impian Anda hari ini juga.
                </p>
                
                <Button asChild size="lg" variant="secondary" className="font-bold text-gray-900 bg-white hover:bg-gray-100 w-full sm:w-auto px-8 py-6 text-base group">
                    <a href={product.link} target="_blank" rel="sponsored nofollow">
                        {product.ctaText} <ArrowRight className="ml-2 transform group-hover:translate-x-1 transition-transform" size={16} />
                    </a>
                </Button>
            </div>
        </motion.div>
    );
}
