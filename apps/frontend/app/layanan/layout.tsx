import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Layanan Website & sistem kustom",
  description: "Eksplorasi layanan pembuatan website bisnis profesional dan sistem kustom premium dari RevTech. Kustomisasi tanpa batas, proses cepat, dan fitur lengkap.",
  openGraph: {
    title: "Layanan Website & sistem kustom | RevTech",
    description: "Layanan pembuatan website responsif dan sistem kustom premium dari RevTech. Lihat daftar fitur lengkap kami.",
  }
};

export default function LayananLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
