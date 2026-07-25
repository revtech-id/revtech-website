# Cetak Biru Final: RevTech Business Operating System (Business OS)

Dokumen ini memuat standar **Desain & UI/UX Kelas Dunia (World-Class Standard)** untuk **RevTech Business OS** — dirancang khusus dengan filosofi **"Simpel, WOW Effect, Elegan, Estetik, & Performa Kilat"**.

---

## 💎 Standard UI/UX & Aesthetic Rules (Vercel/Linear Level)

### 🎨 Visual & Aesthetic Mandate ("Bikin WOW & Elegan"):
1. **Ultra-Crisp Layout:** Latar belakang *Clean White* (`#FFFFFF` & `#F8FAFC`), batas mikro yang sangat tipis (`border-slate-200/60`), dan bayangan bayangan halus (*subtle elevation* `#00000008`).
2. **Royal Blue Accent:** Penggunaan warna aksen biru khas RevTech (`#2563EB`) secara presisi pada elemen interaktif utama, indikator aktif, dan tombol fokus.
3. **Pastel Status Badges:** Lencana status berbentuk *pill* lembut (Soft Emerald, Soft Amber, Soft Indigo, Soft Rose) yang sangat nyaman di mata.
4. **Command Palette (`Cmd+K` / `Ctrl+K`):** Fitur pencarian cepat serbaguna untuk melompat antar menu, mencari klien, pesanan, atau membuat dokumen secara instan tanpa menyentuh mouse.
5. **Fluid Micro-Animations:** Transisi perpindahan halaman, perpindahan tab, dan *hover state* yang ditenagai oleh Framer Motion *(Spring Physics)* yang sangat mulus & responsif.

---

## 🏛️ 6 Pilar Utama RevTech Business OS

```
┌─────────────────────────────────────────────────────────────┐
│                 REVTECH BUSINESS OS                         │
├──────────────┬──────────────────┬───────────────────────────┤
│ 📊 Dashboard │ 💼 Project Mgmt  │ ✨ RevTech Studio         │
│ 📰 Content   │ 👥 Team          │ ⚙️ System                 │
└──────────────┴──────────────────┴───────────────────────────┘
```

---

### 1. 📊 **Dashboard** *(Pusat Komando & Ringkasan Bisnis)*
- **Ringkasan Bisnis & Omzet:** Overview keuangan, statistik proyek aktif, dan grafik pertumbuhan.
- **AI Business Insight:** Asisten harian pintar yang memberikan petunjuk & saran tindakan strategis.

---

### 2. 💼 **Project Management** *(Operasional Proyek & Layanan Klien)*
- **Pesanan & Inbox Pipeline:**
  - Pipeline status ala Shopee (*Inbox ➔ Chat ➔ DP 50% ➔ Pengerjaan ➔ Revisi ➔ Pelunasan ➔ Handover ➔ Selesai*).
  - 🔗 **Integrasi WA Follow-up:** Button 🟢 *"Follow-up WA"* ➔ **Modal AI Draft Chat Generator** ➔ WhatsApp Web.
- **Klien & Website:** Database klien terdaftar dan pemantauan aktif seluruh situs klien.
- **Invoice & Maintenance:** Pembuat & pelacak tagihan DP, pelunasan, serta status perpanjangan domain/hosting.

---

### 3. ✨ **RevTech Studio** *(Document & Spec Generator untuk AI Agent/Antigravity)*
- **Document Generator:** Pembuat dokumen spesifikasi proyek, kriteria fitur, dan BRD terstruktur.
- **AI Review:** Peninjau kelayakan & kelengkapan spesifikasi dokumen.
- **Export to Antigravity:** Fitur eksport instruksi/prompt terformat yang siap di-copy ke agen Antigravity *(Tanpa AI coding langsung)*.

---

### 4. 📰 **Content** *(Hub Aset Pemasaran & Pertumbuhan)*
- **Blog & Portofolio:** Management artikel edukasi & showcase studi kasus proyek.
- 🔗 **Integrasi SEO Tools di Form Editor:** Button 🔮 *"Generate SEO"* otomatis mengisi Meta Title, Meta Description, SEO Keywords, dan OpenGraph Image Prompt.

---

### 5. 👥 **Team** *(Solo Founder & AI Co-Pilot Org Chart Mode)*
- 🔗 **Tampilan Struktur Organisasi Solo Founder:**
  - Top Node: **Founder & CEO** (Profil Anda).
  - Branch Node 1: 🤖 **RevTech AI Business Co-Pilot**.
  - Branch Node 2: ➕ **[Tambah Anggota Tim / Role Baru]** *(Kartu dashed transparan untuk persiapan ekspansi)*.
  - Badge: *"One-Person Enterprise Powered by AI"*.
- **Activity Log:** Audit Trail jejak rekam pergerakan sistem & login.

---

### 6. ⚙️ **System** *(Infrastruktur & Konfigurasi)*
- **RevTech Engine:** Pengaturan inti sistem operasional.
- **Domain & Hosting:** Pemantauan masa aktif & penyedia server.
- **Integrasi:** Pengaturan WhatsApp Rotator, API Key (Gemini/OpenAI), & Payment Gateways.

---

## 📱 Navigation UI Layout (`AdminSidebar.tsx`)

```
[REVTECH BUSINESS OS]

── UTAMA ──
📊 Dashboard

── OPERASIONAL ──
💼 Project Management
   ├─ Pesanan (Inc. WA AI Follow-up)
   ├─ Klien & Website
   ├─ Invoice
   └─ Maintenance

✨ RevTech Studio
   ├─ Doc Generator
   ├─ AI Review
   └─ Export to Antigravity

── PERTUMBUHAN ──
📰 Content
   ├─ Blog (Inc. Auto-SEO Generator)
   └─ Portofolio

── INTERNAL ──
👥 Team (Solo Founder & AI Co-Pilot Chart)
   ├─ Struktur Tim
   └─ Activity Log

⚙️ System
   ├─ Engine & Domain
   ├─ Integrasi API & WA Rotator
   └─ Pengaturan

─────────────────────────
[👤 Profile Superadmin v] -> Popover (Profil, Sampah, Logout)
```

---

## 🧪 Verification Plan

### Automated Verification
- Run `npm run build` di `apps/frontend` untuk menjamin tidak ada kesalahan TypeScript pada seluruh modul UI `/admin`.

### Manual Verification
- Uji presisi visual (jarak padding, font hierarchy, kerapian copywriting).
- Uji alur tombol 🟢 *Follow-up WA* di Inbox, tombol 🔮 *Generate SEO* di Form Editor, dan fitur `Cmd+K` Command Palette.
