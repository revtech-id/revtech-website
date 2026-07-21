import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog & Artikel",
  description: "Kumpulan artikel, tips, dan insight seputar dunia digital, pengembangan website, dan tren teknologi untuk membantu UMKM berkembang.",
  openGraph: {
    title: "Blog & Artikel | RevTech",
    description: "Kumpulan artikel dan insight seputar dunia digital dari RevTech.",
  }
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
