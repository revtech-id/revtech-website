import { Metadata } from 'next';
import KatalogDetailClient from '@/components/katalog/KatalogDetailClient';

export const metadata: Metadata = {
    title: "Detail Produk | RevTech",
};

export default async function KatalogDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <KatalogDetailClient id={id} />;
}
