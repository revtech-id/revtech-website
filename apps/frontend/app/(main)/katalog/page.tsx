import { Metadata } from "next";
import KatalogClient from "@/components/katalog/KatalogClient";

export const metadata: Metadata = {
    title: "Katalog Produk Digital | RevTech",
    description: "Koleksi template, UI kit, dan sistem siap pakai untuk mempercepat proyek Anda.",
};

export default function Katalog() {
    return <KatalogClient />;
}
