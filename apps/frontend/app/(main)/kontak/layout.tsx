import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hubungi Kami",
  description: "Ada pertanyaan atau ingin memulai proyek digital Anda bersama RevTech? Hubungi kami sekarang melalui formulir atau WhatsApp resmi kami.",
  openGraph: {
    title: "Hubungi Kami | RevTech",
    description: "Mari berkolaborasi dan wujudkan ide digital Anda.",
  }
};

export default function KontakLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
