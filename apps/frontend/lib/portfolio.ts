import { getAdminDb } from '@/lib/firebaseAdmin';

export interface PortfolioCaseStudyData {
  slug: string;
  title: string;
  category: string;
  client: string;
  service: string;
  date: string;
  publishedAt?: string;
  coverImage: string;
  liveUrl: string;
  summary: string;
}

export interface PortfolioCaseStudy extends PortfolioCaseStudyData {
  contentHtml: string;
}

export async function getSortedPortfoliosData(): Promise<PortfolioCaseStudyData[]> {
  try {
    const db = getAdminDb();
    const snapshot = await db
      .collection('portfolio')
      .where('status', '==', 'published')
      .get();

    return snapshot.docs
      .map((doc) => {
        const data = doc.data();
        return {
          slug: data.slug,
          title: data.title,
          category: data.category || '',
          client: data.client || '',
          service: data.category || '',
          date: data.projectDate || '',
          publishedAt: data.publishedAt || '',
          coverImage: data.thumbnail || '',
          liveUrl: data.url || '',
          summary: data.description || '',
        };
      })
      .sort((a, b) => {
        const dateA = a.publishedAt || a.date;
        const dateB = b.publishedAt || b.date;
        if (!dateA) return 1;
        if (!dateB) return -1;
        return dateB.localeCompare(dateA);
      });
  } catch (err) {
    console.error('[portfolio] getSortedPortfoliosData failed:', err);
    return [];
  }
}

export async function getAllPortfolioSlugs(): Promise<{ slug: string }[]> {
  try {
    const db = getAdminDb();
    const snapshot = await db
      .collection('portfolio')
      .where('status', '==', 'published')
      .get();

    return snapshot.docs.map((doc) => ({ slug: doc.data().slug }));
  } catch (err) {
    console.error('[portfolio] getAllPortfolioSlugs failed:', err);
    return [];
  }
}

export async function getPortfolioData(slug: string): Promise<PortfolioCaseStudy | null> {
  try {
    const db = getAdminDb();
    const snapshot = await db
      .collection('portfolio')
      .where('slug', '==', slug)
      .where('status', '==', 'published')
      .limit(1)
      .get();

    if (snapshot.empty) return null;

    const data = snapshot.docs[0].data();

    return {
      slug: data.slug,
      title: data.title,
      category: data.category || '',
      client: data.client || '',
      service: data.category || '',
      date: data.projectDate || '',
      publishedAt: data.publishedAt || '',
      coverImage: data.thumbnail || '',
      liveUrl: data.url || '',
      summary: data.description || '',
      // Content is stored as HTML (from ReactQuill)
      contentHtml: data.content || '',
    };
  } catch (err) {
    console.error('[portfolio] getPortfolioData failed:', err);
    return null;
  }
}
