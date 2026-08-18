import { getAdminDb } from '@/lib/firebaseAdmin';

export interface ProdukDigitalData {
  id: string;
  title: string;
  vendor: string;
  category: string;
  thumbnail: string;
  content: string;
  url: string | null;
  description: string;
  techStack: string[];
  pinned: boolean;
  price: string;
  status: "published" | "draft" | "archived";
}

export async function getSortedDigitalProductsData(): Promise<ProdukDigitalData[]> {
  try {
    const db = getAdminDb();
    const snapshot = await db
      .collection('digital_products')
      .where('status', '==', 'published')
      .get();

    return snapshot.docs
      .map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || '',
          vendor: data.vendor || '',
          category: data.category || '',
          thumbnail: data.thumbnail || '',
          content: data.content || '',
          url: data.url || null,
          description: data.description || '',
          techStack: data.techStack || [],
          pinned: data.pinned || false,
          price: data.price || '',
          status: data.status || 'published',
        };
      })
      .sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return 0;
      });
  } catch (err) {
    console.error('[katalog] getSortedDigitalProductsData failed:', err);
    return [];
  }
}
