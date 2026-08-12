"use client";

import AffiliateBox from './AffiliateBox';
import AffiliateRecap from './AffiliateRecap';

interface AffiliateArticleRendererProps {
    htmlContent: string;
}

export default function AffiliateArticleRenderer({ htmlContent }: AffiliateArticleRendererProps) {
    // Regex untuk memecah string: mencari [AFFILIATE:id] ATAU [AFFILIATE_RECAP:id]
    // regex.split akan menghasilkan array: [html1, type1, id1, html2, type2, id2, html3...]
    // Catatan: regex harus menangkap kedua group (type dan id) agar muncul di hasil split.
    const cleanHtml = htmlContent.replace(/&nbsp;/g, ' ');
    const parts = cleanHtml.split(/\[(AFFILIATE|AFFILIATE_RECAP):([a-zA-Z0-9-]+)\]/);

    return (
        <div 
          className="prose prose-sm sm:prose-base md:prose-lg prose-gray max-w-none text-gray-700 break-words 
            [&_h2]:text-3xl [&_h2]:font-black [&_h2]:text-gray-900 [&_h2]:mt-16 [&_h2]:mb-6 [&_h2]:tracking-tight
            [&_h3]:text-2xl [&_h3]:font-bold [&_h3]:text-gray-900 [&_h3]:mt-10 [&_h3]:mb-4 [&_h3]:tracking-tight
            [&_p]:mb-6 [&_p]:leading-relaxed
            [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-6 [&_li]:mb-2
            [&_blockquote]:border-l-4 [&_blockquote]:border-gray-900 [&_blockquote]:pl-6 [&_blockquote]:italic [&_blockquote]:text-gray-600 [&_blockquote]:bg-gray-50 [&_blockquote]:py-4 [&_blockquote]:pr-4 [&_blockquote]:rounded-r-xl
            prose-a:text-primary hover:prose-a:text-blue-700 
            prose-img:rounded-[2rem] prose-img:shadow-lg prose-img:w-full prose-img:border prose-img:border-gray-100"
        >
            {parts.map((part, index) => {
                // Pola split:
                // index % 3 === 0 -> string HTML murni
                // index % 3 === 1 -> Tipe (AFFILIATE atau AFFILIATE_RECAP)
                // index % 3 === 2 -> ID produk (hostinger, elementor)
                
                if (index % 3 === 0) {
                    return part ? <div key={index} dangerouslySetInnerHTML={{ __html: part }} /> : null;
                }

                if (index % 3 === 1) {
                    const type = part;
                    const id = parts[index + 1];
                    
                    if (type === 'AFFILIATE') {
                        return <AffiliateBox key={`box-${index}`} productId={id} />;
                    } else if (type === 'AFFILIATE_RECAP') {
                        return <AffiliateRecap key={`recap-${index}`} productId={id} />;
                    }
                }
                
                return null; // Group ID diabaikan karena sudah diproses di group Tipe
            })}
        </div>
    );
}
