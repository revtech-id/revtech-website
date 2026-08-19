"use client";

import dynamic from 'next/dynamic';

// Above-the-fold: eager imports (rendered immediately)
import HeroSection from '@/components/home/HeroSection';
import ServicesSection from '@/components/home/ServicesSection';
import TrustSection from '@/components/home/TrustSection';

// Below-the-fold: lazy-loaded to reduce initial bundle
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
