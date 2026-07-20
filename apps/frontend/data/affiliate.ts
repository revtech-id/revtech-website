export interface AffiliateProduct {
  id: string;
  name: string;
  description: string;
  logo: string;
  link: string;
  benefits: string[];
  ctaText: string;
  badge?: string;
}

export const affiliateProducts: Record<string, AffiliateProduct> = {
  hostinger: {
    id: "hostinger",
    name: "Hostinger Premium Web Hosting",
    description: "Hosting super cepat, murah, dan stabil. Sangat cocok untuk pemula maupun profesional yang butuh kehandalan tanpa bikin kantong jebol.",
    logo: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=200&auto=format&fit=crop", // placeholder logo
    link: "https://www.hostinger.co.id/", // Ganti dengan link affiliate asli Anda
    benefits: [
      "Gratis Domain & SSL seumur hidup",
      "Performa 10x lebih cepat dengan LiteSpeed",
      "Dukungan pelanggan 24/7 bahasa Indonesia",
      "Garansi uang kembali 30 hari"
    ],
    ctaText: "Klaim Diskon Hostinger 75%",
    badge: "🔥 Pilihan Editor"
  },
  elementor: {
    id: "elementor",
    name: "Elementor Pro",
    description: "Pembuat website drag-and-drop nomor 1 untuk WordPress. Buat desain berkelas tanpa sentuh kode pemrograman sama sekali.",
    logo: "https://images.unsplash.com/photo-1618761714954-0b8cd0026356?q=80&w=200&auto=format&fit=crop", // placeholder logo
    link: "https://elementor.com/", // Ganti dengan link affiliate asli Anda
    benefits: [
      "Ribuan template premium siap pakai",
      "Theme Builder & WooCommerce Builder",
      "Efek motion & animasi eksklusif",
      "Form builder dengan integrasi email"
    ],
    ctaText: "Mulai Buat Web dengan Elementor",
    badge: "Paling Populer"
  }
};
