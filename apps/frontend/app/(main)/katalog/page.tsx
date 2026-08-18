import { Metadata } from "next";
import KatalogClient from "@/components/katalog/KatalogClient";
import { getSortedDigitalProductsData } from "@/lib/katalog";

export const revalidate = 0;

export const metadata: Metadata = {
    title: "Katalog Produk Digital | RevTech",
    description: "Koleksi template, UI kit, dan sistem siap pakai untuk mempercepat proyek Anda.",
};

export default async function Katalog() {
    const products = await getSortedDigitalProductsData();
    return <KatalogClient initialData={products} />;
}
