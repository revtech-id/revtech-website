import { notFound } from 'next/navigation';
import { pricingPlans } from '@/data/pricing';
import PackageDetailClient from '@/components/jasa-web/PackageDetailClient';
import { getJasaWebSettings } from '@/lib/jasa-web';

export function generateStaticParams() {
    return pricingPlans.map((plan) => ({
        id: plan.id,
    }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const settings = await getJasaWebSettings();
    const allPlans = settings?.plans || pricingPlans;
    const plan = allPlans.find((p) => p.id === id);
    if (!plan) return { title: 'Paket Tidak Ditemukan - RevTech' };
    
    return {
        title: `${plan.name} - Pembuatan Website Premium RevTech`,
        description: plan.description,
    };
}

export default async function PackageDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const settings = await getJasaWebSettings();
    const allPlans = settings?.plans || pricingPlans;
    const plan = allPlans.find((p) => p.id === id);
    
    if (!plan) {
        notFound();
    }

    return <PackageDetailClient plan={plan} />;
}
