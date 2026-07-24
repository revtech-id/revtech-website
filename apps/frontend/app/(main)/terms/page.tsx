import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Syarat & Ketentuan | RevTech",
  description:
    "Baca syarat dan ketentuan penggunaan layanan RevTech sebelum memulai kerja sama.",
};

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-16 sm:py-24">
        
        {/* Navigation & Header */}
        <div className="mb-12 border-b border-slate-200 pb-8">
          <div className="flex items-center gap-2 text-slate-500 text-sm mb-8">
            <Link href="/" className="hover:text-blue-600 transition-colors">Beranda</Link>
            <span>/</span>
            <span className="text-slate-900 font-medium">Syarat & Ketentuan</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Syarat &amp; Ketentuan</h1>
          <p className="text-slate-500 text-sm">Pembaruan Terakhir: 28 Juni 2026</p>
        </div>

        <article className="prose prose-sm sm:prose-base md:prose-lg prose-slate max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-blue-600 hover:prose-a:text-blue-500 prose-p:leading-relaxed prose-p:text-slate-600 prose-li:text-slate-600">
          <p>
            Dengan menggunakan layanan RevTech — baik Jasa Pembuatan Website, Katalog Produk Digital, maupun Solusi Ide Custom — Anda (&quot;Klien&quot;) menyetujui seluruh ketentuan yang tercantum di bawah ini. Harap membaca dokumen ini dengan saksama sebelum menyetujui kontrak kerja atau melakukan pembayaran.
          </p>

          <hr className="my-8 border-slate-100" />

          <h2>1. Penerimaan Syarat &amp; Ketentuan</h2>
          <p>
            Syarat dan Ketentuan ini mengikat secara hukum sejak Klien menyetujui penawaran kami (secara tertulis melalui email atau pesan HANYA dari saluran resmi) atau sejak dilakukannya pembayaran Uang Muka (<em>Down Payment</em>). Jika Anda mewakili sebuah entitas bisnis atau perusahaan, Anda menyatakan memiliki kewenangan penuh untuk mengikat entitas tersebut pada syarat ini.
          </p>

          <h2>2. Sistem Pembayaran &amp; Tagihan</h2>
          <p>Kami mengedepankan transparansi. Berikut adalah skema pembayaran resmi RevTech:</p>
          <ul>
            <li><strong>Skema 50-50 (Dua Tahap):</strong> Semua proyek (kecuali katalog instan) menggunakan sistem pembayaran bertahap. Uang Muka (DP) sebesar 50% diwajibkan sebelum proyek dimulai. Sisa 50% pelunasan wajib dibayarkan setelah proyek selesai dan disetujui, <strong>sebelum</strong> proses serah terima (<em>handover</em>) kode atau akses publik dilakukan.</li>
            <li><strong>Penundaan Sepihak:</strong> Kami berhak menunda sementara pengerjaan atau menahan akses server apabila tagihan berjalan (Invoice) belum diselesaikan oleh pihak Klien sesuai tenggat waktu.</li>
            <li><strong>Mata Uang &amp; Biaya Ekstra:</strong> Semua tagihan diterbitkan dalam mata uang Rupiah (IDR). Biaya administrasi transfer antar-bank atau potongan <em>payment gateway</em> ditanggung sepenuhnya oleh Klien, kecuali disepakati lain.</li>
          </ul>

          <h2>3. Ketentuan Revisi &amp; Perubahan Ruang Lingkup</h2>
          <p>Tiap paket layanan memiliki jatah hak revisi yang berbeda sesuai dengan kesepakatan awal (Invoice / Surat Penawaran).</p>
          <ul>
            <li><strong>Revisi Minor:</strong> Meliputi penyesuaian teks (<em>copywriting</em>), perbaikan warna (<em>styling</em>), atau pertukaran gambar statis. Tidak merubah tata letak (<em>layout</em>) atau struktur <em>database</em>.</li>
            <li><strong>Revisi Mayor:</strong> Meliputi perombakan alur logika aplikasi, penambahan halaman/fitur baru, modifikasi skema <em>database</em>, atau perombakan desain UI/UX secara substansial.</li>
            <li><strong>Scope Creep:</strong> Permintaan Revisi Mayor yang diajukan di luar ruang lingkup yang disepakati (<em>scope creep</em>) atau setelah persetujuan desain (sign-off) akan dikenakan biaya pengembangan tambahan.</li>
          </ul>

          <h2>4. Opsi Serah Terima (Handover) &amp; Lisensi</h2>
          <p>Penyerahan akses akhir hanya akan dilakukan setelah kami menerima pelunasan 100%. Anda berhak memilih salah satu model <em>deployment</em>:</p>
          <ul>
            <li><strong>Sistem Mandiri (Source Code):</strong> Kami menyerahkan file <em>source code</em> secara penuh. Klien mengurus penyediaan server, domain, keamanan, instalasi, dan pemeliharaan lanjutan secara mandiri dengan tim internal Anda.</li>
            <li><strong>Terima Beres (Managed Service):</strong> Tim kami mengurus pendaftaran domain, penyewaan <em>cloud server</em>, optimasi keamanan, dan pemeliharaan rutin. Layanan ini tunduk pada biaya perpanjangan tahunan (<em>annual renewal</em>) sesuai kesepakatan.</li>
          </ul>

          <h2>5. Hak Kekayaan Intelektual (HAKI)</h2>
          <p>Segala bentuk rancangan antarmuka (UI/UX), struktur <em>database</em>, dan kode pemrograman (<em>source code</em>) yang dibangun oleh tim kami secara khusus tetap menjadi Hak Kekayaan Intelektual (HAKI) RevTech <strong>hingga seluruh tagihan dilunasi 100%</strong>.</p>
          <p>Setelah pelunasan selesai, seluruh lisensi penggunaan, hak kepemilikan komersial, dan aset digital secara permanen berpindah ke tangan Klien, kecuali modul-modul generik pihak ketiga (seperti <em>library open-source</em> atau <em>framework</em> React/Next.js) yang tetap tunduk pada lisensi aslinya.</p>

          <h2>6. Tanggung Jawab Konten &amp; Penafian (Disclaimer)</h2>
          <ul>
            <li>Klien bertanggung jawab penuh atas legalitas, orisinalitas, dan hak cipta dari segala materi (teks, gambar, video, lisensi font, logo) yang diserahkan kepada RevTech untuk dimasukkan ke dalam produk akhir.</li>
            <li>RevTech secara tegas dibebaskan dari segala tuntutan hukum pihak ketiga atas pelanggaran hak cipta yang bersumber dari materi bawaan Klien.</li>
            <li>Kami tidak dapat dimintai pertanggungjawaban atas kerugian bisnis, hilangnya data, atau <em>downtime</em> yang murni disebabkan oleh gangguan dari pihak penyedia layanan infrastruktur pihak ketiga (misalnya kegagalan <em>server cloud</em>, penyedia domain, atau gangguan <em>payment gateway</em>).</li>
          </ul>

          <h2>7. Keterlambatan Materi &amp; Pembatalan Sepihak (Penting!)</h2>
          <p>Kecepatan penyelesaian proyek sangat bergantung pada responsivitas Klien dalam menyerahkan materi wajib (konten, logo, persetujuan).</p>
          <p>Apabila Klien gagal memberikan tanggapan atau tidak menyerahkan materi yang disyaratkan selama lebih dari <strong>30 hari kalender</strong> sejak pembayaran DP, maka proyek secara otomatis dianggap <strong>dibatalkan sepihak oleh Klien</strong>. Dalam kondisi ini, Uang Muka (DP) yang telah masuk <strong>hangus dan tidak dapat dikembalikan</strong> (non-refundable).</p>

          <hr className="my-8 border-slate-100" />

          <h2>8. Layanan Pelanggan &amp; Pertanyaan</h2>
          <p>Jika Anda memiliki pertanyaan spesifik terkait penafsiran pasal di atas sebelum menandatangani persetujuan, silakan hubungi tim kami di:</p>
          <p><strong>Email:</strong> <a href="mailto:revtech.id.contact@gmail.com">revtech.id.contact@gmail.com</a></p>
        </article>
      </div>
    </div>
  );
}
