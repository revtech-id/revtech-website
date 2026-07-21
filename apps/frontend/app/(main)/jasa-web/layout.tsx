import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Daftar Harga Pembuatan Website",
  description: "Cek daftar harga transparan paket pembuatan website dan sistem kustom di RevTech. Tersedia Paket Usaha, Profesional, hingga Eksklusif yang sesuai dengan kebutuhan Anda.",
  openGraph: {
    title: "Daftar Harga Jasa Website | RevTech",
    description: "Paket pembuatan website dan sistem kustom dengan harga terjangkau mulai dari Rp 499rb.",
  }
};

export default function HargaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
