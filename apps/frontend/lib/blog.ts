import { getAdminDb } from '@/lib/firebaseAdmin';

export interface BlogPostData {
  slug: string;
  title: string;
  date: string;
  description: string;
  coverImage?: string;
  category: string;
  publishedAt?: string | null;
}

export interface BlogPost extends BlogPostData {
  contentHtml: string;
}

export async function getSortedPostsData(): Promise<BlogPostData[]> {
  try {
    const db = getAdminDb();
    const snapshot = await db
      .collection('blog_posts')
      .where('status', '==', 'published')
      .get();

    return snapshot.docs
      .map((doc) => {
        const data = doc.data();
        return {
          slug: data.slug,
          title: data.title,
          date: data.publishedAt ? data.publishedAt.split('T')[0] : '',
          description: data.metaDescription || '',
          coverImage: data.coverImage || '',
          category: data.category || '',
          publishedAt: data.publishedAt || null,
        };
      })
      .sort((a, b) => {
        if (!a.publishedAt) return 1;
        if (!b.publishedAt) return -1;
        return b.publishedAt.localeCompare(a.publishedAt);
      });
  } catch (err) {
    console.error('[blog] getSortedPostsData failed:', err);
    return [];
  }
}

export async function getPostData(slug: string): Promise<BlogPost | null> {
  try {
    const db = getAdminDb();
    const snapshot = await db
      .collection('blog_posts')
      .where('slug', '==', slug)
      .where('status', '==', 'published')
      .limit(1)
      .get();

    if (snapshot.empty) return null;

    const data = snapshot.docs[0].data();

    return {
      slug: data.slug,
      title: data.title,
      date: data.publishedAt ? data.publishedAt.split('T')[0] : '',
      description: data.metaDescription || '',
      coverImage: data.coverImage || '',
      category: data.category || '',
      publishedAt: data.publishedAt || null,
      // Content is stored as HTML (from ReactQuill)
      contentHtml: data.content || '',
    };
  } catch (err) {
    console.error('[blog] getPostData failed:', err);
    return null;
  }
}
