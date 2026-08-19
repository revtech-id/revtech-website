import { Metadata } from 'next';
import HomeClient from '@/components/HomeClient';
import { getSortedPostsData } from '@/lib/blog';
import { getSortedPortfoliosData } from '@/lib/portfolio';
import { getTestimonialsData } from '@/lib/testimonials';

export const revalidate = 60;

export const metadata: Metadata = {
    title: "RevTech - Wadah Solusi Digital",
    description: "RevTech adalah Wadah Solusi Digital Anda. Kami melayani arsitektur website premium, katalog produk digital instan, hingga sistem kustom (ERP/POS) untuk menunjang skala bisnis.",
};

export default async function Home() {
    let latestPosts: Awaited<ReturnType<typeof getSortedPostsData>> = [];
    let latestPortfolios: Awaited<ReturnType<typeof getSortedPortfoliosData>> = [];
    let testimonials: Awaited<ReturnType<typeof getTestimonialsData>> = [];

    try {
        latestPosts = (await getSortedPostsData()).slice(0, 3);
        latestPortfolios = (await getSortedPortfoliosData()).slice(0, 4);
        testimonials = await getTestimonialsData();
    } catch (err) {
        console.error('[Home] Failed to fetch data from Firebase:', err);
    }
    
    return (
        <HomeClient recentPosts={latestPosts} portfolios={latestPortfolios} testimonials={testimonials} />
    );
}
