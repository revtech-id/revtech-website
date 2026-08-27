# RevTech Website & Admin Dashboard 🚀

Selamat datang di repositori resmi **RevTech** – Wadah Solusi Digital. Proyek ini mencakup *Landing Page* publik untuk klien dan *Admin Dashboard* (CMS kustom) terintegrasi untuk mengelola seluruh aspek bisnis (klien, portofolio, tagihan, hingga wawasan bisnis AI).

## 🛠 Tech Stack

Proyek ini menggunakan arsitektur modern berbasis monorepo (meskipun saat ini berfokus pada aplikasi `frontend` tunggal) dengan dukungan teknologi berikut:

- **Framework**: [Next.js 14/15 (App Router)](https://nextjs.org/)
- **Monorepo Tooling**: [Turborepo](https://turbo.build/)
- **Styling & UI**: [Tailwind CSS](https://tailwindcss.com/) & [Framer Motion](https://www.framer.com/motion/) (untuk animasi spring physics kelas atas)
- **Database & Auth**: [Firebase](https://firebase.google.com/) (Firestore, Storage, Authentication)
- **Deployment**: [Vercel](https://vercel.com/) (menggunakan fitur *Incremental Static Regeneration* / ISR)

## 📂 Struktur Folder Utama

Proyek ini berada dalam struktur Turborepo:

```text
revtech-website/
├── apps/
│   └── frontend/              # Aplikasi utama (Next.js)
│       ├── app/
│       │   ├── (main)/        # Landing Page Publik (SSR/ISR)
│       │   └── (admin)/       # Admin Dashboard CMS (Client-side & Server Actions)
│       ├── components/        # UI Components (Reusable & Sections)
│       ├── lib/               # Utility functions & Firebase Config
│       └── public/            # Static assets (images, icons)
├── package.json               # Root dependencies & workspace config
└── turbo.json                 # Turborepo configuration
```

## ✨ Fitur Utama

### 🌐 Public Landing Page (`/`)
- Desain *premium* dengan micro-animations dan glassmorphism.
- Sangat dioptimasi untuk **Performa & SEO** (mendapatkan skor 90+ di PageSpeed Insights Desktop) menggunakan ISR (`revalidate = 60`) dan *lazy-loading*.
- Showcase Portofolio, Katalog Produk, dan Testimonial.

### 🔐 Admin Dashboard (`/admin`)
- **Dashboard Bisnis**: Ringkasan omzet, statistik klien, dan wawasan berbasis AI.
- **Project & Client Management**: Melacak status pengerjaan proyek (In Progress, Revisi, Selesai) hingga urusan penagihan (Invoice DP & Pelunasan).
- **RevTech Studio**: Alat pembuat dokumen spesifikasi, BRD, dan instruksi prompt untuk eksekusi oleh AI Agent.
- **Manajemen Konten (CMS)**: Menambah, mengubah, atau menghapus artikel Blog, Portofolio, Katalog Jasa, dan Testimonial tanpa harus menyentuh kode.

## 🚀 Panduan Setup & Menjalankan di Lokal

### Prasyarat
- Node.js (v18 atau lebih baru disarankan)
- npm / yarn / pnpm

### Langkah-langkah

1. **Clone repositori**
   ```bash
   git clone https://github.com/revtech-id/revtech-website.git
   cd revtech-website
   ```

2. **Install Dependensi**
   Jalankan perintah ini di *root* direktori untuk menginstal semua package yang dibutuhkan (menggunakan npm workspaces):
   ```bash
   npm install
   ```

3. **Atur Environment Variables**
   Buat file `.env.local` di dalam folder `apps/frontend/` dan isi dengan konfigurasi Firebase Anda:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. **Jalankan Development Server**
   Gunakan Turborepo untuk menjalankan server Next.js:
   ```bash
   npm run dev
   ```
   Aplikasi publik akan tersedia di `http://localhost:3000` dan Admin di `http://localhost:3000/admin`.

## 🏗 Build & Deployment

Proyek ini dikonfigurasi untuk di-deploy secara otomatis melalui Vercel. Setiap *push* ke *branch* `main` akan memicu *production build*.

Untuk mengecek *build* di lokal:
```bash
npm run build
```

---
*Dibuat khusus untuk standar kualitas premium RevTech.*
