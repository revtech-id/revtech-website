import { ArrowRight } from "lucide-react";
import Link from 'next/link';
import Image from 'next/image';

import type { BlogPostData } from '@/lib/blog';

interface BlogCardProps {
    post: BlogPostData;
    className?: string;
}

export default function BlogCard({ post, className = "" }: BlogCardProps) {
    return (
        <div className={className}>
            <Link 
                href={`/blog/${post.slug}`} 
                className="group bg-white rounded-[1.5rem] overflow-hidden border border-gray-200 shadow-sm hover-card flex flex-col h-full"
            >
                <div className="aspect-[16/10] bg-gray-100 relative overflow-hidden">
                    {post.coverImage ? (
                        <Image 
                            src={post.coverImage} 
                            alt={post.title} 
                            fill 
                            priority={true}
                            sizes="(max-width: 768px) 100vw, 33vw" 
                            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <span className="material-symbols-outlined text-4xl">image</span>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-blue-900/0 group-hover:bg-blue-900/5 transition-colors duration-500"></div>
                </div>
                <div className="p-6 md:p-8 flex flex-col flex-1">
                    {/* Date removed per user request */}
                    <h4 className="text-[17px] md:text-lg font-bold text-gray-900 mb-3 line-clamp-2 leading-snug">{post.title}</h4>
                    <p className="text-xs sm:text-[13px] text-gray-500 line-clamp-2 leading-relaxed font-medium mb-6">{post.description}</p>
                    
                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">
                        <span className="text-xs font-semibold text-gray-500 group-hover:text-blue-600 transition-colors">
                            Baca Artikel
                        </span>
                        <ArrowRight className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" size={16} />
                    </div>
                </div>
            </Link>
        </div>
    );
}
