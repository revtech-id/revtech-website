"use client";

import { motion } from 'framer-motion';
import { affiliateProducts } from '@/data/affiliate';
import { Button } from '@/components/ui/Button';

interface AffiliateBoxProps {
    productId: string;
}

export default function AffiliateBox({ productId }: AffiliateBoxProps) {
    const product = affiliateProducts[productId];

    if (!product) return null;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
            className="my-10 relative bg-white border-2 border-primary/20 rounded-[2rem] p-6 sm:p-8 md:p-10 shadow-xl shadow-primary/5 group hover:border-primary/40 transition-colors"
        >
            {product.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-4 py-1 rounded-full shadow-md tracking-wider uppercase whitespace-nowrap z-10">
                    {product.badge}
                </div>
            )}
            
            <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-center md:items-start">
                <div className="w-24 h-24 sm:w-32 sm:h-32 shrink-0 rounded-2xl overflow-hidden border border-gray-100 shadow-sm bg-gray-50 flex items-center justify-center p-2">
                    <img 
                        src={product.logo} 
                        alt={product.name} 
                        className="w-full h-full object-contain rounded-xl"
                    />
                </div>
                
                <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 !mt-0">{product.name}</h3>
                    <p className="text-gray-600 text-sm sm:text-base mb-6 leading-relaxed">
                        {product.description}
                    </p>
                    
                    <ul className="flex flex-col gap-2 mb-8 w-full">
                        {product.benefits.map((benefit, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 text-left">
                                <span className="material-symbols-outlined text-green-500 text-[18px] shrink-0 mt-0.5">check_circle</span>
                                {benefit}
                            </li>
                        ))}
                    </ul>
                    
                    <Button asChild size="lg" className="w-full sm:w-auto font-bold shadow-lg shadow-primary/20 group-hover:scale-[1.02] transition-transform duration-300">
                        <a href={product.link} target="_blank" rel="sponsored nofollow">
                            {product.ctaText} <span className="material-symbols-outlined text-sm ml-2">open_in_new</span>
                        </a>
                    </Button>
                </div>
            </div>
        </motion.div>
    );
}
