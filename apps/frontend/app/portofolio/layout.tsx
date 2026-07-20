import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portofolio & Karya Kami",
  description: "Kumpulan hasil karya, proyek website, dan sistem kustom terbaik yang pernah kami kerjakan. Bukti nyata dedikasi RevTech dalam menciptakan produk digital berkualitas.",
  openGraph: {
    title: "Portofolio Proyek RevTech",
    description: "Kumpulan proyek sukses yang telah diselesaikan oleh tim ahli RevTech.",
  }
};

export default function PortofolioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
