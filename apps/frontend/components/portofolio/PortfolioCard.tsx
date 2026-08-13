"use client";
import { ArrowRight } from "lucide-react";

import Image from 'next/image';
import Link from 'next/link';

import { PortfolioCaseStudyData } from '@/lib/portfolio';

interface PortfolioCardProps {
    item: PortfolioCaseStudyData;
    className?: string;
}

export default function PortfolioCard({ item, className = "" }: PortfolioCardProps) {
    return (
        <Link 
            href={item.slug ? `/portofolio/${item.slug}` : (item.liveUrl || '#')}
            target={item.slug ? "_self" : "_blank"}
            rel={item.slug ? undefined : "noreferrer"}
            className={`group relative rounded-2xl overflow-hidden bg-white border border-gray-200 shadow-sm hover-card flex flex-col h-full ${className}`}
        >
            <div className="relative overflow-hidden bg-white border-b border-gray-100">
                <Image 
                    src={item.coverImage || ""} 
                    alt={item.title || "Portfolio"}
                    width={800}
                    height={600} 
                    className="w-full h-auto block transform group-hover:scale-105 transition-transform duration-700 ease-[0.16,1,0.3,1] relative z-10" 
                />
                <div className="absolute inset-0 bg-blue-900/0 group-hover:bg-blue-900/5 transition-colors duration-500 z-20 pointer-events-none"></div>
            </div>
            <div className="p-5 flex flex-col flex-1">
                {item.date && (
                    <div className="text-xs font-bold text-blue-600 mb-2">
                        {item.date}
                    </div>
                )}
                <h4 className="text-gray-900 font-bold text-base md:text-lg mb-4 line-clamp-2 leading-snug">{item.title}</h4>
                
                <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-xs font-semibold text-gray-500 group-hover:text-blue-600 transition-colors">
                        {item.slug ? 'Lihat Studi Kasus' : 'Lihat Live Demo'}
                    </span>
                    <ArrowRight className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" size={16} />
                </div>
            </div>
        </Link>
    );
}
