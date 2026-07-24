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
                    <Image 
                        src={post.coverImage} 
                        alt={post.title} 
                        fill 
                        priority={true}
                        sizes="(max-width: 768px) 100vw, 33vw" 
                        className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                    />
                    <div className="absolute inset-0 bg-blue-900/0 group-hover:bg-blue-900/5 transition-colors duration-500"></div>
                </div>
                <div className="p-6 md:p-8 flex flex-col flex-1">
                    <h4 className="text-[17px] md:text-lg font-bold text-gray-900 mb-3 line-clamp-2 leading-snug">{post.title}</h4>
                    <p className="text-[13px] sm:text-[14.5px] text-gray-500 line-clamp-2 leading-relaxed font-medium mb-6">{post.description}</p>
                    
                    <div className="mt-auto flex items-center justify-between pt-5 border-t border-gray-100">
                        <span className="text-[13px] font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                            Baca Artikel
                        </span>
                        <div className="w-8 h-8 rounded-full bg-gray-50 group-hover:bg-blue-50 flex items-center justify-center transition-colors">
                            <span className="material-symbols-outlined text-[16px] text-gray-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all">arrow_forward</span>
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
}
