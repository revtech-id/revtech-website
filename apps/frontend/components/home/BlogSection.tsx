"use client";

import Link from 'next/link';
import BlogCard from '../blog/BlogCard';
import { motion } from 'framer-motion';
import { fadeUpVariant, defaultViewport } from '@/lib/animations';
import type { BlogPostData } from '@/lib/blog';

export default function BlogSection({ recentPosts }: { recentPosts: BlogPostData[] }) {
    return (
      <section className="py-16 lg:py-24 bg-[#FAFAFC] border-t border-gray-100/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
                  <motion.div 
                      initial="hidden"
                      whileInView="visible"
                      viewport={defaultViewport}
                      variants={fadeUpVariant}
                      className="max-w-2xl text-left"
                  >
                      <h2 className="text-blue-600 font-bold tracking-wider uppercase text-xs mb-3">Insight & Edukasi</h2>
                      <h3 className="text-3xl md:text-[2.5rem] lg:text-5xl font-black text-gray-900 mb-5 tracking-tight">Wawasan <span className="text-blue-600">Terbaru.</span></h3>
                      <p className="text-lg md:text-base lg:text-xl text-gray-500 font-medium leading-relaxed">Temukan inspirasi, tips, dan wawasan terbaru seputar pengembangan produk digital dan teknologi.</p>
                  </motion.div>
                  <div className="flex-shrink-0 mb-2">
                      <Link href="/blog" className="inline-flex items-center gap-2 text-gray-900 font-bold hover:text-blue-600 transition-colors group">
                          Lihat Semua Artikel <span className="material-symbols-outlined text-sm transform group-hover:translate-x-1 transition-transform">arrow_forward</span>
                      </Link>
                  </div>
              </div>
              
              <div 
                  className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-8 -mx-4 px-4 sm:mx-0 sm:px-0 md:pb-0 md:grid md:grid-cols-3 md:gap-8 mb-12 text-left"
                  style={{ scrollbarWidth: 'none' }}
              >
                  {recentPosts.map((post, index) => (
                      <BlogCard 
                          key={post.slug} 
                          post={post} 
                          className="w-[85vw] sm:w-[350px] flex-shrink-0 snap-center md:w-auto md:flex-shrink-1 flex h-full" 
                      />
                  ))}
              </div>
          </div>
      </section>
    );
}
