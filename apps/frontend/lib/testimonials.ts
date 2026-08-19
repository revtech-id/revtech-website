import { getAdminDb } from '@/lib/firebaseAdmin';

export interface TestimonialMessage {
  id?: string;
  sender: 'me' | 'client';
  text: string;
  time: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  initials: string;
  service: string;
  avatarBg: string;
  lastSeen: string;
  messages: TestimonialMessage[];
  status: "published" | "draft" | "archived";
  pinned?: boolean;
  starred?: boolean; // For backward compatibility with localStorage version
  date?: string;
}

export async function getTestimonialsData(): Promise<Testimonial[]> {
  try {
    const db = getAdminDb();
    const snapshot = await db
      .collection('testimonials')
      .where('status', '==', 'published')
      .get();

    return snapshot.docs
      .map((doc) => {
        const data = doc.data() as Testimonial;
        return {
          id: doc.id,
          name: data.name || '',
          role: data.role || '',
          initials: data.initials || '',
          service: data.service || '',
          avatarBg: data.avatarBg || 'bg-blue-100 text-blue-600',
          lastSeen: data.lastSeen || 'hari ini',
          messages: data.messages || [],
          status: data.status || 'published',
          pinned: data.pinned || data.starred || false, // Handle both pinned and starred for compatibility
          date: data.date || '',
        };
      })
      .sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        // Jika status pinned sama, urutkan berdasarkan tanggal (terbaru di atas)
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        return dateB - dateA;
      });
  } catch (err) {
    console.error('[testimonials] getTestimonialsData failed:', err);
    return [];
  }
}
