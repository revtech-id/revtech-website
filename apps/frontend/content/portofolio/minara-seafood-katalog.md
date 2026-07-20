---
title: "Sistem Manajemen Stok Ikan Segar Minara"
category: "Sistem Custom"
client: "Minara"
service: "Paket Usaha + Request Fitur"
date: "Oktober 2023"
coverImage: "/portfolio/minara.webp"
liveUrl: "https://ikan-segar-minara.vercel.app/"
summary: "Membangun sistem etalase digital dengan manajemen stok real-time yang terintegrasi langsung dengan pemesanan via Instagram, menggunakan infrastruktur tanpa biaya bulanan."
---

## Tantangan Bisnis

Sebagai penyedia ikan segar, Minara menghadapi masalah klasik dalam operasional harian mereka:
- **Ketersediaan Fluktuatif:** Stok ikan berubah sangat cepat. Menggunakan katalog PDF atau gambar statis membuat informasi cepat usang dan memicu miskomunikasi.
- **Keterbatasan Anggaran IT:** Klien membutuhkan sistem yang andal dan dinamis, namun memiliki keterbatasan dana untuk menyewa server (*hosting*) bulanan.
- **Alur Pemesanan:** Klien ingin pesanan langsung diarahkan ke *Direct Message* (DM) Instagram mereka, alih-alih menggunakan WhatsApp atau sistem *checkout* yang rumit.

## Solusi RevTech

Kami merancang arsitektur sistem yang cerdas untuk menjembatani kebutuhan teknis tingkat lanjut dengan efisiensi biaya maksimal.

### 1. Etalase Digital & Manajemen Stok Real-Time
Kami mengembangkan antarmuka website yang terhubung langsung dengan Supabase (PostgreSQL). Admin Minara dapat memperbarui status stok ikan kapan saja melalui *dashboard*, dan perubahannya akan langsung terlihat oleh pelanggan tanpa perlu melakukan *refresh* halaman.

### 2. Auto-Format Pesanan ke Instagram
Sistem keranjang belanja yang kami buat secara otomatis merangkum pesanan pelanggan dan mengarahkannya langsung ke *Direct Message* (DM) Instagram resmi Minara. Ini menyederhanakan alur komunikasi dan mempercepat proses penutupan transaksi (closing).

### 3. Infrastruktur Bebas Biaya (Portofolio Abadi)
Penggunaan ekosistem *free-tier* berkualitas produksi (seperti **GitHub**, **Vercel**, dan **Supabase**) adalah strategi cerdas yang dirancang untuk menguntungkan kedua belah pihak:
- **Untuk Klien (Zero-Cost):** Minara sukses mengudara dengan sistem manajemen stok *real-time* berskala *enterprise* tanpa harus terbebani tagihan sewa *server* bulanan sepeser pun.
- **Untuk RevTech (Portofolio Abadi):** Karena sistem ini di-*hosting* secara independen, *live demo* akan terus tayang selamanya. Sekalipun di masa depan klien memutuskan untuk tidak memperpanjang *domain* berbayar mereka, mahakarya digital ini akan tetap hidup dan dapat diakses publik sebagai bukti nyata (*portofolio*) kualitas kerja kami.

## Hasil & Dampak

Transformasi ini secara signifikan menyempurnakan cara Minara beroperasi:

> "Awalnya saya ragu bisa punya website dinamis karena budget terbatas. Tapi RevTech memberikan solusi luar biasa dengan membuatkan akun Vercel dan Supabase menggunakan email kami sendiri, sehingga bebas biaya bulanan! Ditambah lagi, pesanan langsung terangkum rapi ke DM Instagram. Sangat transparan dan praktis!" — **Owner Minara**

- **Efisiensi Anggaran Optimal:** Operasional sistem digital berjalan mulus dengan biaya infrastruktur *server* Rp 0 per bulan.
- **Akurasi Tinggi:** Tidak ada lagi pelanggan kecewa karena memesan ikan yang ternyata sudah habis, sebab etalase kini bekerja secara *real-time*.
