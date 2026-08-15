import { Suspense } from 'react';
import { Metadata } from 'next';
import PortfolioHeader from '@/components/portofolio/PortfolioHeader';
import PortfolioGrid from '@/components/portofolio/PortfolioGrid';

import { getSortedPortfoliosData } from '@/lib/portfolio';

export const revalidate = 0;

export const metadata: Metadata = {
    title: "Portofolio & Karya Digital | RevTech",
    description: "Kumpulan mahakarya inovasi digital RevTech, mulai dari arsitektur website, katalog produk, hingga sistem kustom terintegrasi.",
};

export default async function Portofolio() {
    const portfolios = await getSortedPortfoliosData();

    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-50/50"></div>}>
            <div className="pt-20 pb-16 lg:pb-24 bg-gray-50/50 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <PortfolioHeader />
                    
                    <div className="space-y-24">
                        <PortfolioGrid portfolios={portfolios} />
                    </div>
                </div>
            </div>
        </Suspense>
    );
}
