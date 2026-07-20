import React from 'react';

const affiliateLinks = [
  {
    id: 'hosting',
    title: 'Hosting Cepat & Stabil',
    description: 'Kami selalu menggunakan layanan hosting terbaik ini untuk memastikan website klien tidak pernah down.',
    brand: 'Niagahoster',
    url: '#', // TODO: Ganti dengan link affiliate asli
    icon: 'dns',
    color: 'text-blue-600',
    bg: 'bg-blue-50'
  },
  {
    id: 'domain',
    title: 'Domain Murah Nasional',
    description: 'Dapatkan domain .id atau .com dengan harga terbaik dan perlindungan privasi penuh.',
    brand: 'DomaiNesia',
    url: '#', // TODO: Ganti dengan link affiliate asli
    icon: 'language',
    color: 'text-indigo-600',
    bg: 'bg-indigo-50'
  },
  {
    id: 'email',
    title: 'Email Marketing Sakti',
    description: 'Tingkatkan konversi penjualan Anda hingga 300% dengan automasi email marketing ini.',
    brand: 'Kirim.Email',
    url: '#', // TODO: Ganti dengan link affiliate asli
    icon: 'mark_email_read',
    color: 'text-green-600',
    bg: 'bg-green-50'
  }
];

export default function AffiliateSidebar() {
  return (
    <aside className="space-y-6 sticky top-24">
      <div className="bg-gray-900 rounded-3xl p-6 shadow-xl border border-gray-800 text-white">
        <h3 className="text-xl font-extrabold mb-2 tracking-tight">Rekomendasi Tools 🚀</h3>
        <p className="text-gray-400 text-sm mb-6 leading-relaxed">
          Infrastruktur rahasia di balik website klien-klien agensi kami.
        </p>
        
        <div className="space-y-4">
          {affiliateLinks.map((item) => (
            <a 
              key={item.id} 
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block group bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 hover:border-gray-600 rounded-2xl p-4 transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-16 h-16 bg-white/5 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
              
              <div className="flex items-start gap-4 relative z-10">
                <div className={`w-10 h-10 rounded-xl ${item.bg} ${item.color} flex items-center justify-center shrink-0`}>
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500">{item.brand}</span>
                  </div>
                  <h4 className="text-white font-bold text-sm mb-1.5 group-hover:text-blue-400 transition-colors">{item.title}</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">{item.description}</p>
                </div>
              </div>
            </a>
          ))}
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-800 text-center">
          <p className="text-[10px] text-gray-500 italic">
            *Beberapa link di atas adalah tautan afiliasi. Kami mendapat sedikit komisi tanpa biaya tambahan bagi Anda.
          </p>
        </div>
      </div>
      
      {/* Banner Khusus Pembuatan Website */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl p-6 shadow-xl text-white relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
        <div className="relative z-10">
          <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full inline-block mb-4 backdrop-blur-sm">
            PROMO KHUSUS UMKM
          </span>
          <h3 className="text-2xl font-extrabold mb-3 leading-tight">Butuh Website Profesional?</h3>
          <p className="text-blue-100 text-sm mb-6 leading-relaxed">
            Tidak perlu repot coding atau setting server. Tim RevTech siap membuatkan website impian Anda mulai dari Rp 499rb.
          </p>
          <a 
            href="/jasa-web" 
            className="w-full inline-flex justify-center items-center gap-2 bg-white text-blue-600 px-4 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors shadow-lg shadow-black/10"
          >
            Lihat Harga <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </a>
        </div>
      </div>
    </aside>
  );
}
