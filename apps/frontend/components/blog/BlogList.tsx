"use client";

import { BlogPostData } from '@/lib/blog';
import BlogCard from './BlogCard';

export default function BlogList({ posts }: { posts: BlogPostData[] }) {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 lg:mb-20">
                <h1 className="text-4xl md:text-[2.5rem] lg:text-6xl font-black text-gray-900 tracking-tight mb-6">
                    Blog & <span className="text-blue-600">Insight</span>
                </h1>
                <p className="text-sm sm:text-base md:text-xl text-gray-600 max-w-2xl mx-auto font-medium leading-relaxed">
                    Kumpulan artikel, panduan praktis, dan wawasan mendalam seputar dunia teknologi, pengembangan web, serta tren digital terkini.
                </p>
            </div>

            {/* Blog Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.length === 0 ? (
                    <div className="col-span-full text-center py-24 bg-white rounded-[2rem] border border-gray-100 shadow-sm">
                        <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="material-symbols-outlined text-4xl">edit_document</span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">Blog Sedang Disiapkan</h3>
                        <p className="text-gray-500 font-medium text-sm sm:text-base md:text-lg max-w-md mx-auto">
                            Kami sedang meracik artikel-artikel menarik seputar teknologi dan bisnis digital. Nantikan update dari kami!
                        </p>
                    </div>
                ) : (
                    posts.map((post) => (
                        <BlogCard key={post.slug} post={post} />
                    ))
                )}
            </div>
        </div>
    );
}