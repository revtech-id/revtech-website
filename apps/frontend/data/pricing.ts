export interface PricingFeature {
  name: string;
  included: boolean;
}

export interface Addon {
  id: string;
  icon: string;
  name: string;
  price: string;
  originalPrice?: string;
  description: string;
  type?: 'minor' | 'mayor';
}

export interface PricingPlan {
  id: string;
  name: string;
  basicPrice: string;
  originalPrice?: string;
  promoBadge?: string;
  fullPrice?: string;
  fullOriginalPrice?: string;
  fullPromoBadge?: string;
  description: string;
  longDescription?: string;
  estimatedDays?: string;
  popular?: boolean;
  idealFor?: string[];
  notIdealFor?: string[];
  examples?: string[];
  detailedExplanations?: { title: string; description: string }[];
  basicFeatures: PricingFeature[];
  fullFeatures?: PricingFeature[];
  addons?: Addon[];
  buttonText: string;
  buttonLinkBasic?: string;
  buttonLinkFull?: string;
  isUMKM?: boolean;
}

export const pricingPlans: PricingPlan[] = [
  {
    id: "usaha",
    name: "Paket Usaha",
    basicPrice: "Rp 499.000",
    description: "Ringkas & Efektif | 1 Halaman (Landing Page)",
    longDescription: "Solusi cerdas bagi yang ingin memiliki identitas digital profesional dengan cepat dan terjangkau. Paket Usaha dirancang sebagai Landing Page *high-conversion* untuk menampilkan profil singkat, layanan utama, atau produk unggulan Anda.",
    estimatedDays: "3-5 Hari Kerja",
    idealFor: [
      "Fokus mempromosikan satu layanan, produk unggulan, atau profil personal.",
      "Mengarahkan audiens untuk melakukan satu tindakan spesifik secara efisien.",
      "Media promosi digital yang ringkas dan *to-the-point* untuk berbagai keperluan instan."
    ],
    notIdealFor: [
      "Website skala besar yang membutuhkan banyak menu navigasi (sebaiknya pilih Paket Profesional).",
      "Platform dinamis yang memerlukan sistem akun login (sebaiknya pilih Paket Eksklusif)."
    ],
    examples: ["Halaman Jualan Skincare / Herbal", "Undangan Pernikahan Digital", "Halaman Pendaftaran Event / Webinar", "Link Bio Profesional (Pengganti Linktree)"],
    detailedExplanations: [
      {
        title: "Konsep Landing Page",
        description: "Sebuah halaman panjang yang dirancang khusus untuk mempertahankan fokus pengunjung pada satu tujuan utama tanpa terdistraksi banyak menu."
      },
      {
        title: "Keunggulan Format 1 Halaman",
        description: "Dengan format satu halaman, informasi tersusun secara berurutan layaknya sebuah cerita. Hal ini memudahkan pengunjung untuk mencerna pesan yang disampaikan dan mempercepat mereka mengambil tindakan (misalnya: menghubungi via WhatsApp)."
      },
      {
        title: "Domain Profesional & Keamanan SSL",
        description: "Website Anda tidak lagi menggunakan embel-embel gratisan. Kami mendaftarkan nama resmi pilihan Anda (seperti situsanda.my.id) dengan standar keamanan SSL terenkripsi agar terhindar dari peringatan 'Situs Tidak Aman' di browser."
      }
    ],
    basicFeatures: [
      { name: "1 Halaman Landing Page", included: true },
      { name: "Estimasi 3-5 Hari Kerja", included: true },
      { name: "Gratis Domain .my.id (Tahun Pertama)", included: true },
      { name: "Tombol Kontak Langsung", included: true },
      { name: "SEO Friendly (Ramah Google)", included: true },
      { name: "Maksimal 2x Revisi Minor", included: true }
    ],
    fullFeatures: [
      { name: "Desain Landing Page Responsif", included: true },
      { name: "Estimasi 3-5 Hari Kerja", included: true },
      { name: "Gratis Domain (.my.id / .biz.id) untuk 1 Tahun", included: true },
      { name: "Hosting Cepat & Keamanan Tinggi", included: true },
      { name: "Setup SEO Friendly (Ramah Google)", included: true },
      { name: "Tautan Sosial Media (Instagram, TikTok, dll)", included: true },
      { name: "Maksimal 2x Revisi Desain Minor", included: true },
      { name: "Integrasi Tombol Kontak Langsung", included: true },
      { name: "Integrasi Fitur Interaksi Lanjutan", included: false },
      { name: "Integrasi Akses Manajemen Sistem", included: false },
      { name: "Sistem Pembayaran Otomatis", included: false }
    ],
    buttonText: "Lihat Demo",
    buttonLinkBasic: "/kontak?paket=usaha"
  },
  {
    id: "profesional",
    name: "Paket Profesional",
    basicPrice: "Rp 1.499.000",
    popular: true,
    promoBadge: "Best Seller",
    description: "Performa Maksimal | Hingga 5 Halaman Premium",
    longDescription: "Pilihan favorit perusahaan menengah, agensi, dan bisnis berkembang. Menawarkan arsitektur *multi-page* yang luas untuk menjabarkan layanan, portofolio, dan visi misi perusahaan.",
    estimatedDays: "7-14 Hari Kerja",
    idealFor: [
      "Membangun kredibilitas profesional melalui struktur informasi yang menyeluruh.",
      "Menyajikan portofolio, ragam layanan, atau profil institusi secara terorganisir.",
      "Kebutuhan presentasi multi-halaman untuk perusahaan, agensi, atau organisasi."
    ],
    notIdealFor: [
      "Promosi instan yang hanya berfokus pada satu produk spesifik (sebaiknya pilih Paket Usaha).",
      "Platform dinamis yang memerlukan sistem akun login atau integrasi pembayaran otomatis (sebaiknya pilih Paket Eksklusif)."
    ],
    examples: ["Website Profil Perusahaan (PT/CV)", "Profil Klinik Kesehatan / RS", "Website Yayasan / Sekolah (Tanpa Login)", "Portofolio Agensi / Fotografer"],
    detailedExplanations: [
      {
        title: "Struktur Multi-Halaman",
        description: "Website dirancang dengan beberapa halaman terpisah (seperti Beranda, Layanan, Portofolio, dan Kontak) untuk menyajikan informasi yang komprehensif tanpa membuat pengunjung merasa kewalahan."
      },
      {
        title: "Kredibilitas Profesional",
        description: "Struktur informasi yang rapi dan mendetail sangat krusial untuk membangun tingkat kepercayaan tinggi di mata klien, mitra bisnis, maupun audiens publik terhadap institusi Anda."
      },
      {
        title: "Pengalaman Navigasi Terstruktur",
        description: "Dengan tersedianya menu navigasi yang jelas, pengunjung dapat dengan mudah menelusuri berbagai informasi spesifik (seperti detail layanan, galeri karya, hingga profil tim) tanpa perlu melakukan *scroll* yang terlalu panjang."
      }
    ],
    basicFeatures: [
      { name: "Hingga 5 Halaman Premium", included: true },
      { name: "Estimasi 7-14 Hari Kerja", included: true },
      { name: "Gratis Domain .com / .id (Tahun Pertama)", included: true },
      { name: "Fitur Interaksi Lanjutan", included: true },
      { name: "SEO Friendly (Ramah Google)", included: true },
      { name: "Maksimal 3x Revisi Minor", included: true }
    ],
    fullFeatures: [
      { name: "Desain Multi-Page (Hingga 5 Halaman)", included: true },
      { name: "Estimasi 7-14 Hari Kerja", included: true },
      { name: "Gratis Domain Premium (.com / .id) untuk 1 Tahun", included: true },
      { name: "Hosting Cepat & Keamanan Tinggi", included: true },
      { name: "Setup SEO Friendly (Ramah Google)", included: true },
      { name: "Tautan Sosial Media (Instagram, TikTok, dll)", included: true },
      { name: "Maksimal 3x Revisi Desain Minor", included: true },
      { name: "Integrasi Tombol Kontak Langsung", included: true },
      { name: "Integrasi Fitur Interaksi Lanjutan", included: true },
      { name: "Integrasi Akses Manajemen Sistem", included: false },
      { name: "Sistem Pembayaran Otomatis", included: false }
    ],
    buttonText: "Lihat Demo",
    buttonLinkBasic: "/kontak?paket=profesional"
  },
  {
    id: "eksklusif",
    name: "Paket Eksklusif",
    basicPrice: "Mulai Rp 5.000.000",
    description: "Skala Tanpa Batas | Custom & Unlimited",
    longDescription: "Bagi Anda yang membutuhkan arsitektur digital kompleks tanpa kompromi. Mulai dari web app berskala enterprise, sistem manajemen internal (SaaS), hingga E-Commerce terintegrasi. Dirancang secara presisi menyesuaikan alur logika bisnis spesifik Anda.",
    estimatedDays: "Disesuaikan Kontrak",
    idealFor: [
      "Platform e-commerce kompleks dengan perhitungan ongkos kirim dan pembayaran otomatis.",
      "Sistem operasional internal (Kasir POS, Absensi HRIS, Manajemen Gudang/Inventaris).",
      "Aplikasi web skala besar seperti Portal Berita, Forum Komunitas, atau Kursus Online (LMS)."
    ],
    notIdealFor: [
      "Kebutuhan publikasi profil perusahaan standar tanpa logika pemrograman rumit (sebaiknya pilih Paket Profesional).",
      "Promosi instan yang memerlukan peluncuran dalam hitungan hari (sebaiknya pilih Paket Usaha)."
    ],
    examples: ["Toko Online Spesifik (Cart & Payment Gateway)", "Aplikasi HRIS / Absensi Karyawan", "Platform Kursus Online (Login Member)", "Sistem Manajemen Gudang / Kasir POS"],
    detailedExplanations: [
      {
        title: "Pengembangan Sistem Kustom",
        description: "Bukan sekadar sarana informasi, kami merancang mesin bisnis khusus berskala *enterprise*. Mulai dari sistem kasir hingga platform e-commerce kompleks yang dibangun murni menyesuaikan alur bisnis Anda."
      },
      {
        title: "Akses Manajemen Sistem",
        description: "Tim Anda akan memiliki kendali penuh melalui dasbor admin (CMS) yang dirancang secara spesifik. Sangat intuitif untuk mengelola data pesanan, inventaris, atau konten tanpa memerlukan bantuan teknis."
      },
      {
        title: "Integrasi Layanan Otomatis",
        description: "Website dapat dihubungkan dengan berbagai layanan pihak ketiga secara mulus (API). Mulai dari pemrosesan pembayaran otomatis (*Payment Gateway*) hingga kalkulasi ongkos kirim kurir lokal seketika."
      }
    ],
    basicFeatures: [
      { name: "Halaman & Fitur Kustom", included: true },
      { name: "Estimasi Sesuai Kontrak", included: true },
      { name: "Gratis Domain .com / .id (Tahun Pertama)", included: true },
      { name: "Akses Manajemen Sistem", included: true },
      { name: "SEO Friendly (Ramah Google)", included: true },
      { name: "Revisi Fleksibel", included: true }
    ],
    fullFeatures: [
      { name: "Arsitektur Halaman Tanpa Batas (Sesuai Kontrak)", included: true },
      { name: "Estimasi Sesuai Kontrak", included: true },
      { name: "Gratis Domain Premium (Bebas Pilih Ekstensi)", included: true },
      { name: "Hosting Cepat & Keamanan Tinggi", included: true },
      { name: "Setup SEO Friendly (Ramah Google)", included: true },
      { name: "Tautan Sosial Media (Instagram, TikTok, dll)", included: true },
      { name: "Revisi Desain & Sistem (Sesuai Kontrak)", included: true },
      { name: "Integrasi Tombol Kontak Langsung", included: true },
      { name: "Integrasi Fitur Interaksi Lanjutan", included: true },
      { name: "Integrasi Akses Manajemen Sistem", included: true },
      { name: "Sistem Pembayaran Otomatis", included: true }
    ],
    buttonText: "Lihat Demo",
    buttonLinkBasic: "/kontak?paket=eksklusif"
  }
];

export const modificationMenu = [
  {
    category: "Revisi Minor",
    description: "Perubahan ringan yang tidak merombak struktur utama website.",
    items: [
      { name: "Revisi Teks & Copywriting", price: "Rp 50.000 / halaman" },
      { name: "Penggantian Gambar / Video", price: "Rp 50.000 / batch" },
      { name: "Perubahan Skema Warna / Font", price: "Rp 100.000" },
    ]
  },
  {
    category: "Revisi Mayor",
    description: "Perubahan struktural atau penambahan elemen standar baru.",
    items: [
      { name: "Tambah Halaman Statis Baru", price: "Rp 150.000 / halaman" },
      { name: "Rombak Total Layout Halaman", price: "Rp 250.000 / halaman" },
      { name: "Pembuatan Artikel Blog SEO", price: "Rp 75.000 / artikel" }
    ]
  },
  {
    category: "Request Fitur Tambahan",
    description: "Penambahan fungsionalitas khusus di luar spesifikasi dasar.",
    items: [
      { name: "Sistem Booking / Kalender", price: "Rp 300.000" },
      { name: "Integrasi Payment Gateway / QRIS", price: "Rp 500.000" },
      { name: "Integrasi Chatbot AI / Live Chat", price: "Rp 350.000" },
      { name: "Web Multi-Bahasa (Bilingual)", price: "Rp 350.000" },
      { name: "Advanced Form (Upload File, Logic)", price: "Rp 250.000" },
      { name: "Fitur / Logic Kustom Lainnya", price: "Konsultasi" }
    ]
  }
];
