import { getPostData, getSortedPostsData } from '@/lib/blog';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import AffiliateDisclaimer from '@/components/blog/AffiliateDisclaimer';
import AffiliateArticleRenderer from '@/components/blog/AffiliateArticleRenderer';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const p = await params;
  const postData = await getPostData(p.slug);
  
  if (!postData) {
    return {
      title: 'Artikel Tidak Ditemukan',
    };
  }

  return {
    title: `${postData.title} | Blog RevTech`,
    description: postData.description,
    openGraph: {
      title: postData.title,
      description: postData.description,
      images: [
        {
          url: postData.coverImage,
        },
      ],
    },
  };
}

export async function generateStaticParams() {
  const posts = getSortedPostsData();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPost({ params }: Props) {
  const p = await params;
  const postData = await getPostData(p.slug);

  if (!postData) {
    notFound();
  }

  return (
    <div className="pt-24 pb-16 lg:pb-24 bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb & Navigation */}
        <div className="mb-10">
            <Link href="/blog" className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors font-medium text-sm">
                <span className="material-symbols-outlined text-sm">arrow_back</span> Kembali ke Blog
            </Link>
        </div>

        {/* Header Artikel */}
        <header className="mb-12 text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-6 tracking-tight leading-[1.1]">
                {postData.title}
            </h1>
        </header>

        {/* Cover Image */}
        <div className="w-full relative rounded-[2rem] overflow-hidden mb-16 shadow-lg border border-gray-100 bg-gray-50">
            <Image 
                src={postData.coverImage} 
                alt={postData.title} 
                width={1920}
                height={1080}
                className="w-full h-auto"
                priority
            />
        </div>

        {/* Konten Artikel */}
        <article className="max-w-none">
            <AffiliateArticleRenderer htmlContent={postData.contentHtml} />
        </article>

        {/* Penutup / Disclaimer */}
        <div className="mt-16 pt-8 border-t border-gray-100">
            <AffiliateDisclaimer />
        </div>
        
      </div>
    </div>
  );
}
