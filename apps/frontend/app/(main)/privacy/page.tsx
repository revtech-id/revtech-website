import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Kebijakan Privasi | RevTech",
  description:
    "Pelajari bagaimana RevTech melindungi, menggunakan, dan menyimpan data pribadi serta informasi teknis proyek Anda.",
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-16 sm:py-24">
        
        {/* Navigation & Header */}
        <div className="mb-12 border-b border-slate-200 pb-8">
          <div className="flex items-center gap-2 text-slate-500 text-sm mb-8">
            <Link href="/" className="hover:text-blue-600 transition-colors">Beranda</Link>
            <span>/</span>
            <span className="text-slate-900 font-medium">Kebijakan Privasi</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Kebijakan Privasi</h1>
          <p className="text-slate-500 text-sm">Pembaruan Terakhir: 28 Juni 2026</p>
        </div>

        <article className="prose prose-slate prose-lg max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-blue-600 hover:prose-a:text-blue-500 prose-p:leading-relaxed prose-p:text-slate-600 prose-li:text-slate-600">
          <p>
            RevTech (&quot;kami&quot;, &quot;milik kami&quot;, atau &quot;Perusahaan&quot;) menghargai privasi Anda dan berkomitmen penuh untuk melindungi data pribadi serta aset digital Anda. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, menyimpan, dan melindungi informasi Anda saat Anda menggunakan layanan kami, baik Jasa Web, Katalog Produk Digital, maupun Solusi Ide Custom.
          </p>
          <p>
            Dengan menggunakan layanan kami, Anda menyetujui praktik pengumpulan dan penggunaan data yang dijelaskan dalam dokumen ini.
          </p>

          <hr className="my-8 border-slate-100" />

          <h2>1. Informasi yang Kami Kumpulkan</h2>
          <p>Untuk dapat memberikan layanan pengembangan sistem yang optimal, kami mengumpulkan beberapa jenis informasi berikut:</p>
          <ul>
            <li><strong>Informasi Identitas &amp; Kontak:</strong> Nama lengkap, alamat email, nomor telepon/WhatsApp, dan nama perusahaan Anda (jika ada).</li>
            <li><strong>Kredensial Teknis (Opsional &amp; Sementara):</strong> Akses <em>login</em> server, kredensial <em>domain registrar</em>, <em>API keys</em>, atau akses <em>database</em> yang Anda berikan secara sukarela HANYA untuk keperluan <em>deployment</em> dan integrasi sistem.</li>
            <li><strong>Data Pembayaran &amp; Penagihan:</strong> Bukti transfer atau detail rekening untuk keperluan penerbitan <em>Invoice</em> dan tanda terima.</li>
            <li><strong>Data Interaksi:</strong> Rekaman percakapan proyek (melalui email, WhatsApp, atau platform manajemen proyek kami) untuk keperluan dokumentasi spesifikasi (<em>Requirement Gathering</em>).</li>
          </ul>

          <h2>2. Bagaimana Kami Menggunakan Informasi Anda</h2>
          <p>Kami menggunakan informasi yang dikumpulkan secara ketat untuk tujuan berikut:</p>
          <ul>
            <li><strong>Pelaksanaan Proyek:</strong> Membangun, menguji, dan meluncurkan produk digital, website, atau sistem <em>custom</em> yang Anda pesan.</li>
            <li><strong>Komunikasi:</strong> Mengirimkan pembaruan progres kerja, <em>Invoice</em>, pemberitahuan teknis, atau meminta persetujuan revisi.</li>
            <li><strong>Keamanan Ekosistem:</strong> Mendeteksi, mencegah, dan menangani masalah teknis atau indikasi kecurangan/penipuan (<em>fraud</em>).</li>
            <li><strong>Pemeliharaan (Managed Service):</strong> Jika Anda menggunakan opsi &quot;Terima Beres&quot;, kami menggunakan akses yang ada untuk melakukan <em>patch</em> keamanan bulanan dan pemeliharaan server.</li>
          </ul>

          <h2>3. Komitmen Kerahasiaan (Non-Disclosure &amp; Kredensial)</h2>
          <p>Kami memahami bahwa dalam pengembangan <em>software</em>, kerahasiaan adalah prioritas mutlak.</p>
          <ul>
            <li><strong>Zero-Knowledge Policy pada Data Sensitif:</strong> Segala bentuk <em>API keys</em> rahasia, <em>password server</em>, dan data <em>user</em> milik Klien <strong>tidak akan pernah</strong> disimpan di repositori publik atau disematkan langsung di kode aplikasi sisi-klien (<em>hardcoded</em>).</li>
            <li>Kami mengikat seluruh tim <em>engineer</em> RevTech dengan standar kerahasiaan (<em>Non-Disclosure</em>) sehingga ide bisnis, skema <em>database</em>, maupun algoritma <em>custom</em> yang kami bangun untuk Anda tidak akan dibocorkan ke pihak luar atau pesaing Anda.</li>
          </ul>

          <h2>4. Berbagi Data dengan Pihak Ketiga</h2>
          <p>RevTech <strong>TIDAK PERNAH</strong> menjual, menyewakan, atau memperdagangkan data pribadi Anda kepada pihak mana pun untuk keperluan iklan atau pemasaran eksternal. Kami hanya membagikan data kepada pihak ketiga dalam kondisi berikut:</p>
          <ul>
            <li><strong>Vendor Infrastruktur (Partner Resmi):</strong> Seperti penyedia <em>Cloud Hosting</em>, pendaftar domain, atau <em>Payment Gateway</em> — semata-mata untuk mengaktifkan produk digital Anda.</li>
            <li><strong>Kepatuhan Hukum:</strong> Jika diwajibkan oleh hukum, perintah pengadilan, atau otoritas penegak hukum Republik Indonesia.</li>
          </ul>

          <h2>5. Retensi (Masa Simpan) dan Penghapusan Data</h2>
          <ul>
            <li><strong>Kode Sumber (Source Code):</strong> Kami menyimpan salinan cadangan (<em>backup</em>) kode sumber dari proyek Anda di repositori internal (Private Repo) yang terenkripsi selama <strong>maksimal 6 bulan</strong> pasca serah-terima. Hal ini bertujuan agar kami dapat membantu memulihkan sistem Anda jika terjadi kegagalan server.</li>
            <li><strong>Right to be Forgotten:</strong> Anda berhak meminta kami untuk menghapus seluruh jejak kode proyek, aset desain, dan kredensial akses Anda dari <em>database</em> internal kami kapan saja setelah proyek selesai dan dilunasi 100%.</li>
          </ul>

          <h2>6. Perlindungan Hak Anak-anak</h2>
          <p>Layanan pengembangan perangkat lunak dan produk digital RevTech tidak ditujukan untuk individu di bawah usia 18 tahun. Kami tidak secara sadar mengumpulkan data pribadi dari anak-anak. Jika Anda meyakini bahwa kami mungkin memiliki data dari individu di bawah umur, harap segera hubungi kami.</p>

          <h2>7. Perubahan pada Kebijakan Privasi</h2>
          <p>Dunia teknologi berkembang pesat, begitu pula standar keamanannya. Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu agar tetap sejalan dengan regulasi perlindungan data yang berlaku (seperti UU PDP di Indonesia). Setiap perubahan yang material akan kami beri tahukan melalui email atau pemberitahuan mencolok di website kami.</p>

          <hr className="my-8 border-slate-100" />

          <h2>8. Hubungi Kami</h2>
          <p>Jika Anda memiliki kekhawatiran terkait privasi, ingin meminta penghapusan data kredensial Anda dari <em>server</em> kami, atau memiliki pertanyaan spesifik terkait dokumen ini, silakan hubungi tim legal &amp; <em>support</em> kami di:</p>
          <p><strong>Email:</strong> <a href="mailto:revtech.id.contact@gmail.com">revtech.id.contact@gmail.com</a></p>
        </article>
      </div>
    </div>
  );
}
