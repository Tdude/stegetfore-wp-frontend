// src/components/Postcard.tsx
import Link from 'next/link';
import { Post } from '@/lib/types';
import Image from 'next/image';

export default function Postcard({ post }: { post: Post }) {
  return (
    <article className="border rounded-lg overflow-hidden shadow-sm transition-shadow hover:shadow-md">
      <Link href={`/posts/${post.slug}`} className="block">
        {post.featured_image_url && (
          <div className="relative h-48 overflow-hidden">
            <Image
              src={post.featured_image_url}
              alt={post.title.rendered}
              className="w-full h-full object-cover transition-transform hover:scale-105"
              fill
              style={{ objectFit: 'cover' }}
            />
          </div>
        )}
        <div className="p-4">
          <h2
            className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white"
            dangerouslySetInnerHTML={{ __html: post.title.rendered }}
          />
          <div
            className="text-gray-700 line-clamp-3"
            dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
          />
          <div className="mt-4 text-orange-600 font-medium">
            Läs mer →
          </div>
        </div>
      </Link>
    </article>
  );
}