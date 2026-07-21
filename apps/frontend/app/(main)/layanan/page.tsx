"use client";

import LayananHeader from '@/components/layanan/LayananHeader';
import WebDevPillar from '@/components/layanan/WebDevPillar';
import CatalogPillar from '@/components/layanan/CatalogPillar';
import CustomPillar from '@/components/layanan/CustomPillar';

export default function LayananContent() {
    return (
        <div className="pt-24 pb-16 lg:pt-32 lg:pb-24 bg-[#FAFAFC] min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Header Section */}
                <LayananHeader />

                <div className="space-y-12 lg:space-y-16">
                    {/* Pilar 1: Web Dev */}
                    <WebDevPillar />

                    {/* Pilar 2: Katalog */}
                    <CatalogPillar />

                    {/* Pilar 3: Custom */}
                    <CustomPillar />
                </div>
            </div>
        </div>
    );
}
