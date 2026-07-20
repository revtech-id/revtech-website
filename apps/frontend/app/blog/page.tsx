import { getSortedPostsData } from '@/lib/blog';
import BlogList from '@/components/blog/BlogList';

export default function BlogIndex() {
  const allPostsData = getSortedPostsData();

  return (
    <div className="pt-12 pb-24 bg-gray-50/50 min-h-screen">
      <BlogList posts={allPostsData} />
    </div>
  );
}
