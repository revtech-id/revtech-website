"use client";

import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { Button } from "@/components/ui/Button";

import { fadeUpVariant } from '@/lib/animations';

const servicePillars = [
  {
    id: "web-dev",
    title: "Pembuatan Website",
    description: "Website profesional yang dirancang khusus untuk meningkatkan kepercayaan audiens Anda.",
    icon: "language",
    color: "blue",
    features: [
      "Solusi Desain Profesional",
      "Performa Tinggi & Handal",
      "Optimal untuk Pertumbuhan"
    ],
    link: "/jasa-web",
    buttonText: "Pelajari Selengkapnya"
  },
  {
    id: "katalog",
    title: "Katalog Produk Digital",
    description: "Temukan berbagai macam produk digital siap pakai di etalase kami dengan harga terjangkau untuk kebutuhan instan Anda.",
    icon: "storefront",
    color: "navy",
    features: [
      "Pilihan Produk Beragam",
      "Siap Pakai & Instan",
      "Fleksibel & Dapat Disesuaikan"
    ],
    link: "/katalog",
    buttonText: "Lihat Katalog"
  },
  {
    id: "custom",
    title: "Solusi Ide Custom",
    description: "Jadikan kami wadah inovasi Anda. Kami siap merumuskan dan mewujudkan solusi digital unik dari nol khusus untuk ide Anda.",
    icon: "lightbulb",
    color: "slate",
    features: [
      "Solusi Teknologi Bebas",
      "Mengikuti Kebutuhan Unik",
      "Dukungan Tim Ahli"
    ],
    link: "/kontak?paket=custom",
    buttonText: "Konsultasi Sekarang"
  }
];

// Helper untuk map warna tailwind secara dinamis tanpa melanggar PurgeCSS
const colorMap: Record<string, { bg: string, text: string, hoverBorder: string, hoverShadow: string }> = {
  blue: { bg: "bg-blue-50", text: "text-blue-600", hoverBorder: "hover:border-blue-100", hoverShadow: "hover:shadow-blue-900/5" },
  navy: { bg: "bg-blue-900/10", text: "text-blue-900", hoverBorder: "hover:border-blue-300", hoverShadow: "hover:shadow-blue-900/10" },
  slate: { bg: "bg-slate-100", text: "text-slate-800", hoverBorder: "hover:border-slate-200", hoverShadow: "hover:shadow-slate-900/5" },
};

export default function ServicesSection() {
  return (
    <section id="pilar-layanan" className="py-16 lg:py-24 relative bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          variants={fadeUpVariant} 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true, amount: 0.1 }} 
          className="max-w-3xl mb-20"
        >
          <h2 className="text-blue-600 font-bold tracking-wider uppercase text-xs mb-4">Layanan Kami</h2>
          <h3 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">Tiga Pilar Solusi <br className="hidden sm:block"/><span className="text-blue-600">Digital Anda.</span></h3>
          <p className="text-xl text-gray-600 leading-relaxed font-medium">Kami menyediakan tiga pilar layanan utama yang dirancang khusus untuk menjawab segala kebutuhan digital Anda.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-12">
          {servicePillars.map((pillar, idx) => (
            <motion.div 
              key={pillar.id}
              variants={fadeUpVariant} 
              initial="hidden" 
              whileInView="visible" 
              viewport={{ once: true, amount: 0.1 }} 
              transition={{ delay: idx * 0.1 }} 
              className={`group relative flex flex-col h-full bg-white rounded-3xl p-8 border border-gray-100 hover-card`}
            >
              <div className="relative z-10 flex-1">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${colorMap[pillar.color].bg} ${colorMap[pillar.color].text}`}>
                  <span className="material-symbols-outlined text-xl">{pillar.icon}</span>
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3 tracking-tight">{pillar.title}</h4>
                <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                  {pillar.description}
                </p>
                <ul className="space-y-2 mb-6 text-sm font-medium text-gray-700">
                  {pillar.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-center gap-2">
                      <span className={`material-symbols-outlined text-sm ${colorMap[pillar.color].text}`}>check_circle</span> 
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative z-10 mt-auto pt-6 border-t border-gray-100">
                <Button 
                  asChild 
                  className={`w-full ${pillar.color === 'blue' ? 'bg-blue-600 hover:bg-blue-700' : pillar.color === 'navy' ? 'bg-blue-900 hover:bg-blue-950' : 'bg-slate-900 hover:bg-black'}`}
                >
                  <Link href={pillar.link}>
                    {pillar.buttonText} <span className="material-symbols-outlined ml-2 text-sm">arrow_forward</span>
                  </Link>
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
