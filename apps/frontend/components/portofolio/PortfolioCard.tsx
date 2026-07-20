"use client";

import Link from 'next/link';
import Image from 'next/image';
import { motion, Variants } from 'framer-motion';

import { fadeUpVariant } from '@/lib/animations';

interface PortfolioCardProps {
    item: any; // Using any to accept PortfolioCaseStudyData
}

export default function PortfolioCard({ item }: PortfolioCardProps) {
    return (
        <motion.a 
            href={item.slug ? `/portofolio/${item.slug}` : item.liveUrl}
            target={item.slug ? "_self" : "_blank"}
            rel={item.slug ? undefined : "noreferrer"}
            variants={fadeUpVariant} 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true, amount: 0.1 }}
            className="group relative rounded-2xl overflow-hidden bg-white border border-gray-200 shadow-sm hover-card flex flex-col h-full"
        >
            <div className="aspect-[4/3] sm:aspect-[3/2] overflow-hidden relative bg-gray-100 border-b border-gray-100">
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-0 text-gray-300">
                    <span className="material-symbols-outlined animate-spin">refresh</span>
                </div>
                <Image 
                    src={item.coverImage || item.image} 
                    alt={item.title} 
                    fill 
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" 
                    className="object-cover object-top transform group-hover:scale-105 transition-transform duration-700 ease-[0.16,1,0.3,1] relative z-10" 
                />
                <div className="absolute inset-0 bg-blue-900/0 group-hover:bg-blue-900/5 transition-colors duration-500 z-20"></div>
            </div>
            <div className="p-5 flex flex-col flex-1">
                <h4 className="text-gray-900 font-bold text-base md:text-lg mb-4 line-clamp-2 leading-snug">{item.title}</h4>
                
                <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-xs font-semibold text-gray-500 group-hover:text-blue-600 transition-colors">
                        {item.slug ? 'Lihat Studi Kasus' : 'Lihat Live Demo'}
                    </span>
                    <span className="material-symbols-outlined text-[16px] text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all">
                        arrow_forward
                    </span>
                </div>
            </div>
        </motion.a>
    );
}
