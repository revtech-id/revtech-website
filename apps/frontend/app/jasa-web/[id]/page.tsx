import { notFound } from 'next/navigation';
import { pricingPlans } from '@/data/pricing';
import PackageDetailClient from '@/components/jasa-web/PackageDetailClient';

export function generateStaticParams() {
    return pricingPlans.map((plan) => ({
        id: plan.id,
    }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const plan = pricingPlans.find((p) => p.id === id);
    if (!plan) return { title: 'Paket Tidak Ditemukan - RevTech' };
    
    return {
        title: `${plan.name} - Pembuatan Website Premium RevTech`,
        description: plan.longDescription || plan.description,
    };
}

export default async function PackageDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const plan = pricingPlans.find((p) => p.id === id);
    
    if (!plan) {
        notFound();
    }

    return <PackageDetailClient plan={plan} />;
}
