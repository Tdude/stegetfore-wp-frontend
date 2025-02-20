// src/components/Postcard.tsx
import Link from 'next/link';
import { Post } from '@/lib/types';

export default function PostCard({ post }: { post: Post }) {
  return (
    <article className="border rounded-lg overflow-hidden shadow-sm transition-shadow hover:shadow-md">
      <Link href={`/posts/${post.slug}`} className="block">
        {post.featured_image_url && (
          <div className="relative h-48 overflow-hidden">
            <img
              src={post.featured_image_url}
              alt={post.title.rendered}
              className="w-full h-full object-cover transition-transform hover:scale-105"
            />
          </div>
        )}
        <div className="p-4">
          <h2
            className="text-xl font-semibold mb-2 hover:text-blue-600"
            dangerouslySetInnerHTML={{ __html: post.title.rendered }}
          />
          <div
            className="text-gray-600 line-clamp-3"
            dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
          />
          <div className="mt-4 text-blue-600 font-medium">
            Read more →
          </div>
        </div>
      </Link>
    </article>
  );
}