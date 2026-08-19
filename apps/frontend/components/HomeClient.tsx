"use client";

import dynamic from 'next/dynamic';

// Above-the-fold: only HeroSection is eager (it's the LCP element)
import HeroSection from '@/components/home/HeroSection';

// Below-the-fold: all other sections lazy-loaded to reduce initial JS bundle
const ServicesSection = dynamic(() => import('@/components/home/ServicesSection'), { ssr: false });
const TrustSection = dynamic(() => import('@/components/home/TrustSection'), { ssr: false });
const TestimonialsSection = dynamic(() => import('@/components/home/TestimonialsSection'), { ssr: false });
const PortfolioSection = dynamic(() => import('@/components/home/PortfolioSection'), { ssr: false });
const BlogSection = dynamic(() => import('@/components/home/BlogSection'), { ssr: false });
const CtaSection = dynamic(() => import('@/components/home/CtaSection'), { ssr: false });

import type { BlogPostData } from '@/lib/blog';
import type { PortfolioCaseStudyData } from '@/lib/portfolio';
import type { Testimonial } from '@/data/testimonials';

export default function HomeClient({ 
  recentPosts, 
  portfolios, 
  testimonials 
}: { 
  recentPosts: BlogPostData[]; 
  portfolios: PortfolioCaseStudyData[]; 
  testimonials: Testimonial[]; 
}) {
  return (
    <>
      <HeroSection />
      <ServicesSection />
      <TrustSection />
      <TestimonialsSection testimonials={testimonials} />
      <PortfolioSection portfolios={portfolios} />
      <BlogSection recentPosts={recentPosts} />
      <CtaSection />
    </>
  );
}
