import type { MetadataRoute } from 'next';
import { getSortedPostsData } from '@/lib/blog';
import { getSortedPortfoliosData } from '@/lib/portfolio';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://hi-revtech.my.id';
  
  // Rute statis
  const staticRoutes = [
    '',
    '/layanan',
    '/jasa-web',
    '/template',
    '/portofolio',
    '/blog',
    '/kontak',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // Rute dinamis blog
  const posts = getSortedPostsData();
  const blogRoutes = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // Rute dinamis portofolio
  const portfolios = getSortedPortfoliosData();
  const portfolioRoutes = portfolios.map((item) => ({
    url: `${baseUrl}/portofolio/${item.slug}`,
    lastModified: new Date(item.date),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...blogRoutes, ...portfolioRoutes];
}
