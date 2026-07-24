"use client";

import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { Button } from "@/components/ui/Button";

import { fadeUpVariant, staggerContainerVariant, defaultViewport } from '@/lib/animations';


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
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          variants={fadeUpVariant}
          className="max-w-3xl mb-12 md:mb-20 text-left"
        >
          <h2 className="text-blue-600 font-bold tracking-wider uppercase text-xs mb-4">Layanan Kami</h2>
          <h3 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight"><span className="block">Tiga Pilar Solusi</span><span className="block text-blue-600">Digital Anda.</span></h3>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 leading-relaxed font-medium">Kami menyediakan tiga pilar layanan utama yang dirancang khusus untuk menjawab segala kebutuhan digital Anda.</p>
        </motion.div>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          variants={staggerContainerVariant}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-4 lg:gap-12"
        >
          {servicePillars.map((pillar, idx) => (
            <motion.div 
              key={pillar.id}
              variants={fadeUpVariant}
              className={`group relative flex flex-col h-full bg-white rounded-3xl p-6 md:p-5 lg:p-8 border border-gray-100 hover-card`}
            >
              <div className="relative z-10 flex-1">
                <div className={`w-10 h-10 md:w-9 md:h-9 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center mb-5 md:mb-4 lg:mb-6 ${colorMap[pillar.color].bg} ${colorMap[pillar.color].text}`}>
                  <span className="material-symbols-outlined text-lg md:text-base lg:text-xl">{pillar.icon}</span>
                </div>
                <h4 className="text-xl md:text-lg lg:text-xl font-bold text-gray-900 mb-2 lg:mb-3 tracking-tight">{pillar.title}</h4>
                <p className="text-gray-600 mb-4 md:mb-3 lg:mb-6 text-sm md:text-[13px] lg:text-sm leading-relaxed">
                  {pillar.description}
                </p>
                <ul className="space-y-2 md:space-y-1.5 lg:space-y-2 mb-6 md:mb-4 lg:mb-6 text-sm md:text-[13px] lg:text-sm font-medium text-gray-700">
                  {pillar.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-center gap-2">
                      <span className={`material-symbols-outlined text-sm md:text-[13px] lg:text-sm ${colorMap[pillar.color].text}`}>check_circle</span> 
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
        </motion.div>
      </div>
    </section>
  );
}
