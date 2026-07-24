import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://hi-revtech.my.id'),
  title: {
    default: "RevTech - Wadah Solusi Digital",
    template: "%s | RevTech"
  },
  description: "RevTech adalah Wadah Solusi Digital Anda. Kami melayani arsitektur website premium, katalog produk digital instan, hingga sistem kustom (ERP/POS) untuk menunjang skala bisnis.",
  keywords: ["wadah solusi digital", "jasa pembuatan website", "katalog produk digital", "arsitektur website", "custom digital solution", "web agency", "revtech", "website bisnis", "sistem informasi", "software house"],
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://hi-revtech.my.id",
    title: "RevTech - Wadah Solusi Digital",
    description: "Partner teknologi terbaik Anda untuk arsitektur website, produk digital, dan sistem kustom.",
    siteName: "RevTech",
    images: [
      {
        url: "/assets/revtech-bg.webp",
        width: 1200,
        height: 630,
        alt: "RevTech Hero Section",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "RevTech - Wadah Solusi Digital",
    description: "Partner teknologi terbaik Anda untuk arsitektur website, produk digital, dan sistem kustom.",
    images: ["/assets/revtech-bg.webp"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=block" rel="stylesheet" />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased selection:bg-primary/20 selection:text-primary min-h-[100svh] bg-[#F8FAFC]`}
      >
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
