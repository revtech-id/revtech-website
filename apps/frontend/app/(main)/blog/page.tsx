import { getSortedPostsData } from '@/lib/blog';
import BlogList from '@/components/blog/BlogList';

export const revalidate = 0;

export default async function BlogIndex() {
  const allPostsData = await getSortedPostsData();

  return (
    <div className="pt-12 pb-24 bg-gray-50/50 min-h-screen">
      <BlogList posts={allPostsData} />
    </div>
  );
}
