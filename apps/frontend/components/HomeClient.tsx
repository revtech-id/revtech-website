"use client";

import dynamic from 'next/dynamic';

// Modular Sections
import HeroSection from '@/components/home/HeroSection';
import ServicesSection from '@/components/home/ServicesSection';
import TrustSection from '@/components/home/TrustSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import PortfolioSection from '@/components/home/PortfolioSection';
import BlogSection from '@/components/home/BlogSection';
import CtaSection from '@/components/home/CtaSection';

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
