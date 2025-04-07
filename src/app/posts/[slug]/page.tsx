// src/app/posts/[slug]/page.tsx
// single blog page
import { Suspense } from 'react';
import { fetchPost } from '@/lib/api';
import Link from 'next/link';
import Image from 'next/image';
import { SinglePostSkeleton } from '@/components/PostSkeleton';
import { notFound } from 'next/navigation';

async function Post({ slug }: { slug: string }) {
  const post = await fetchPost(slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="max-w-3xl mx-auto">
      {post.featured_image_url && (
        <div className="relative w-full h-64 md:h-96 mb-8 overflow-hidden rounded-lg">
          <Image
            src={post.featured_image_url}
            alt={post.title.rendered.replace(/<[^>]*>/g, '')}
            fill={true}
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 100vw, 1024px"
            priority={true}
            className="object-cover"
          />
        </div>
      )}

      <h1
        className="text-4xl font-bold mb-4"
        dangerouslySetInnerHTML={{ __html: post.title.rendered }}
      />
      <div
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content.rendered }}
      />

      <div className="mt-8">
        <Link
          href="/blog"
          className="text-yellow-500 hover:text-yellow-600"
        >
          ← Alla inlägg
        </Link>
      </div>
    </article>
  );
}

export default async function PostPage(props: any) {
  // Extract slug from params
  const slug = typeof props.params === 'object' && props.params 
    ? (props.params.slug || '') 
    : '';

  return (
    <main className="container mx-auto px-4 py-8 flex-grow">
      <Suspense fallback={<SinglePostSkeleton />}>
        <Post slug={slug} />
      </Suspense>
    </main>
  );
}