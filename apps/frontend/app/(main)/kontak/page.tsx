import { Suspense } from 'react';
import type { Metadata } from 'next';
import KontakHeader from '@/components/kontak/KontakHeader';
import KontakForm from '@/components/kontak/KontakForm';

export const metadata: Metadata = {
    title: 'Hubungi Kami',
    description: 'Ceritakan ide Anda, dan mari wujudkan dalam bentuk digital. Kami siap mendengar dan memberikan solusi terbaik.',
};

export default function KontakPage() {
  return (
    <div className="pt-32 pb-24 bg-[#FAFAFC] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <KontakHeader />

        <Suspense fallback={<div className="text-center py-20 text-gray-500">Memuat formulir...</div>}>
            <KontakForm />
        </Suspense>

      </div>
    </div>
  );
}
