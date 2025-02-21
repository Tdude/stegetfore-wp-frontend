// src/app/posts/[slug]/page.tsx
import { Suspense } from 'react';
import { fetchPost } from '@/lib/api';
import Link from 'next/link';
import { SinglePostSkeleton } from '@/components/PostSkeleton';
import { notFound } from 'next/navigation';

async function getSlugFromParams(params: { slug: string }) {
  const result = await Promise.resolve(params);
  return result.slug;
}

async function Post({ slug }: { slug: string }) {
  const post = await fetchPost(slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="max-w-3xl mx-auto">
      {post.featured_image_url && (
        <img
          src={post.featured_image_url}
          alt={post.title.rendered}
          className="w-full h-64 md:h-96 object-cover rounded-lg mb-8"
        />
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
          href="/"
          className="text-blue-600 hover:text-blue-800"
        >
          ← Tillbaka till alla inlägg
        </Link>
      </div>
    </article>
  );
}

export default async function PostPage({
  params
}: {
  params: { slug: string }
}) {
  const slug = await getSlugFromParams(params);

  return (
    <main className="container mx-auto px-4 py-8 flex-grow">
      <Suspense fallback={<SinglePostSkeleton />}>
        <Post slug={slug} />
      </Suspense>
    </main>
  );
}