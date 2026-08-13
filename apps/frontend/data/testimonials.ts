export interface TestimonialMessage {
  id?: string;
  sender: 'me' | 'client';
  text: string;
  time: string;
}

export interface Testimonial {
  id: string | number;
  name: string;
  role: string;
  initials: string;
  service: string;
  avatarBg: string;
  lastSeen: string;
  messages: TestimonialMessage[];
  status?: "published" | "draft" | "archived";
  starred?: boolean;
  date?: string;
}

export const testimonialsData: Testimonial[] = [
  {
    id: 1,
    name: "Pak Dani (Minara)",
    role: "Owner, Minara",
    initials: "D",
    service: "Database Realtime",
    avatarBg: "bg-blue-100 text-blue-600",
    lastSeen: "hari ini pukul 10:45",
    messages: [
      { sender: "me", text: "Halo Pak Dani, bagaimana dengan update stok ikan yang kami integrasikan dengan Supabase kemarin? Apakah berjalan lancar?", time: "10:30" },
      { sender: "client", text: "Awalnya saya cuma butuh website biasa, tapi RevTech kasih solusi pakai Supabase. Sekarang update stok ikan segar bisa langsung realtime dari database ke web. Pengunjung web selalu dapat info stok paling akurat, keren banget!", time: "10:42" },
      { sender: "me", text: "Wah mantap! Senang bisa membantu operasional Minara jadi lebih efisien Pak. 🙏", time: "10:45" }
    ]
  },
  {
    id: 2,
    name: "Revan (Validata AI)",
    role: "PM, Validata AI",
    initials: "R",
    service: "Sistem Custom AI",
    avatarBg: "bg-indigo-100 text-indigo-600",
    lastSeen: "hari ini pukul 11:20",
    messages: [
      { sender: "me", text: "Halo Mas Revan, bagaimana performa arsitektur backend FastAPI dan integrasi LLM yang baru di-deploy?", time: "11:00" },
      { sender: "client", text: "Sistem pemrosesan dokumen kami sangat kompleks. Tim RevTech berhasil membangun arsitektur backend dengan FastAPI dan mengintegrasikan EasyOCR serta LLM dengan sangat mulus. Performa sistemnya luar biasa dan analisis data jadi otomatis.", time: "11:15" },
      { sender: "me", text: "Luar biasa! Terima kasih atas kepercayaannya Mas. Siap untuk fase scale-up selanjutnya! 🚀", time: "11:20" }
    ]
  },
  {
    id: 3,
    name: "Bu Fitri (DapurKu)",
    role: "Owner, DapurKu",
    initials: "F",
    service: "Sistem Pemesanan",
    avatarBg: "bg-emerald-100 text-emerald-600",
    lastSeen: "hari ini pukul 14:35",
    messages: [
      { sender: "me", text: "Selamat siang Bu Fitri. Apakah fitur pesanan dan add to cart yang langsung masuk ke WA sudah berjalan normal di lapangan?", time: "14:10" },
      { sender: "client", text: "Sebagai UMKM rumahan, pesanan yang numpuk di WA sering bikin pusing. Setelah dibuatkan sistem pemesanan online plus fitur add to cart dari RevTech, pesanan otomatis direkap dan masuk ke WA dengan sangat rapi. Sangat membantu usaha saya!", time: "14:30" },
      { sender: "me", text: "Alhamdulillah kalau begitu Bu, semoga bisnis DapurKu semakin laris manis ya! 😊", time: "14:35" }
    ]
  }
];
