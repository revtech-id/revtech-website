import { ArrowLeft } from "lucide-react";
import { getPortfolioData, getAllPortfolioSlugs } from '@/lib/portfolio';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export async function generateStaticParams() {
  const slugs = await getAllPortfolioSlugs();
  return slugs.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const portfolioData = await getPortfolioData(slug);
  if (!portfolioData) return { title: 'Not Found' };
  return {
    title: `${portfolioData.title} - Studi Kasus | RevTech`,
    description: portfolioData.summary,
  };
}

export default async function PortfolioCaseStudy({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const portfolioData = await getPortfolioData(slug);

  if (!portfolioData) {
    notFound();
  }

  return (
    <div className="pt-24 pb-16 lg:pb-24 bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb & Navigation */}
        <div className="flex justify-start mb-10 w-full">
            <Link href="/portofolio" className="inline-flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors">
                <ArrowLeft className="" size={16} />
                Kembali
            </Link>
        </div>

        {/* Header Studi Kasus */}
        <header className="mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-6 tracking-tight leading-[1.1]">
                {portfolioData.title}
            </h1>
            <p className="text-[13px] sm:text-base md:text-xl text-gray-600 leading-relaxed font-medium max-w-3xl">
                {portfolioData.summary}
            </p>
        </header>

        {/* Cover Image */}
        <div className="w-full relative rounded-[2rem] overflow-hidden mb-16 shadow-lg border border-gray-100 bg-gray-50">
            <Image 
                src={portfolioData.coverImage} 
                alt={portfolioData.title} 
                width={1920}
                height={1080}
                className="w-full h-auto"
                priority
            />
        </div>

        {/* Grid Meta Data */}
        <div className="flex flex-col md:flex-row gap-8 py-8 border-y border-gray-100 mb-16 items-start md:items-center justify-between">
            <div className="flex flex-wrap gap-12 md:gap-16">
                <div>
                    <p className="text-gray-400 text-[11px] font-bold uppercase tracking-widest mb-1.5">Klien</p>
                    <p className="text-gray-900 font-bold text-lg">{portfolioData.client}</p>
                </div>
                {portfolioData.service && (
                    <div>
                        <p className="text-gray-400 text-[11px] font-bold uppercase tracking-widest mb-1.5">Layanan (Paket)</p>
                        <p className="text-gray-900 font-bold text-lg">{portfolioData.service}</p>
                    </div>
                )}
            </div>
            <div>
                {portfolioData.liveUrl && (
                    <a href={portfolioData.liveUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-slate-900 text-white text-[13px] sm:text-base font-bold px-6 py-3.5 rounded-xl hover:bg-slate-800 transition-colors shadow-lg active:scale-95">
                        Lihat Live Demo <span className="material-symbols-outlined text-[18px]">launch</span>
                    </a>
                )}
            </div>
        </div>

        {/* Konten Markdown HTML (CMS Ready) */}
        <article className="prose prose-sm sm:prose-base md:prose-lg prose-gray max-w-none text-gray-700 break-words">
            {/* Styling standar Typography untuk render konten dari CMS */}
            <div 
                className="[&>h2]:text-3xl [&>h2]:font-black [&>h2]:text-gray-900 [&>h2]:mt-16 [&>h2]:mb-6 [&>h2]:tracking-tight
                           [&>h3]:text-2xl [&>h3]:font-bold [&>h3]:text-gray-900 [&>h3]:mt-10 [&>h3]:mb-4 [&>h3]:tracking-tight
                           [&>p]:mb-6 [&>p]:leading-relaxed
                           [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-6 [&>li]:mb-2
                           [&>blockquote]:border-l-4 [&>blockquote]:border-gray-900 [&>blockquote]:pl-6 [&>blockquote]:italic [&>blockquote]:text-gray-600 [&>blockquote]:bg-gray-50 [&>blockquote]:py-4 [&>blockquote]:pr-4 [&>blockquote]:rounded-r-xl"
                dangerouslySetInnerHTML={{ __html: portfolioData.contentHtml.replace(/&nbsp;/g, ' ') }} 
            />
        </article>

        {/* CTA Bawah */}
        <div className="mt-24 py-16 px-8 bg-slate-900 rounded-[2.5rem] text-center shadow-2xl">
            <h3 className="text-3xl font-black text-white mb-4 tracking-tight">Tertarik Membuat Proyek Seperti Ini?</h3>
            <p className="text-sm sm:text-base md:text-lg text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
                Percayakan kebutuhan website atau sistem digital Anda kepada tim kami. Pesan sekarang dan mulai langkah pertama menuju solusi digital impian Anda.
            </p>
            <Link href="/kontak" className="bg-white text-blue-950 hover:bg-blue-50 font-bold text-[13px] sm:text-sm px-6 py-3 lg:px-7 lg:py-3.5 rounded-full shadow-md active:scale-95 inline-flex items-center justify-center gap-2 transition-colors">
                Pesan Sekarang
            </Link>
        </div>

      </div>
    </div>
  );
}
// Trigger refresh 6
