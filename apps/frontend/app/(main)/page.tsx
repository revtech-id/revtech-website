import { Metadata } from 'next';
import HomeClient from '@/components/HomeClient';
import { getSortedPostsData } from '@/lib/blog';
import { getSortedPortfoliosData } from '@/lib/portfolio';
import { getTestimonialsData } from '@/lib/testimonials';

export const revalidate = 0;

export const metadata: Metadata = {
    title: "RevTech - Wadah Solusi Digital",
    description: "RevTech adalah Wadah Solusi Digital Anda. Kami melayani arsitektur website premium, katalog produk digital instan, hingga sistem kustom (ERP/POS) untuk menunjang skala bisnis.",
};

export default async function Home() {
    const latestPosts = (await getSortedPostsData()).slice(0, 3);
    const latestPortfolios = (await getSortedPortfoliosData()).slice(0, 4);
    const testimonials = await getTestimonialsData();
    
    return (
        <HomeClient recentPosts={latestPosts} portfolios={latestPortfolios} testimonials={testimonials} />
    );
}
