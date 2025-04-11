// src/app/posts/[slug]/page.tsx
// single blog page
import { Suspense } from 'react';
import { fetchPost } from '@/lib/api';
import Link from 'next/link';
import Image from 'next/image';
import { SinglePostSkeleton } from '@/components/PostSkeleton';
import { notFound } from 'next/navigation';
import DebugPanel from '@/components/debug/DebugPanel';
import { badgeVariants } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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
    <>
      <article className="max-w-3xl mx-auto px-4 my-8">
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
          className="text-3xl font-bold mb-8"
          dangerouslySetInnerHTML={{ __html: post.title.rendered }}
        />
        <div
          className="prose prose-lg prose-headings:mt-8 prose-headings:mb-4 prose-p:my-4 prose-img:rounded-lg max-w-prose mx-auto"
          dangerouslySetInnerHTML={{ __html: post.content.rendered }}
        />

        <div className="mt-8 mb-8">
          <Link href="/blog">
            <span className={cn(
              badgeVariants({ variant: "secondary" }),
              "inline-block"
            )}>
              ← Alla inlägg
            </span>
          </Link>
        </div>
      </article>
      
      {/* Add debug panel */}
      <div className="max-w-3xl mx-auto px-4">
        <DebugPanel 
          title="Blog Post Debug Information"
          page={post}
          additionalData={{
            'Post ID': post.id,
            'Slug': post.slug,
            'Has Featured Image': Boolean(post.featured_image_url),
            'Categories': post.categories ? Object.keys(post.categories).length : 0,
            'Content Length': post.content?.rendered?.length || 0,
          }}
        />
      </div>
    </>
  );
}

export default async function PostPage({
  params
}: {
  params: { slug: string }
}) {
  const slug = await getSlugFromParams(params);

  return (
    <article className="container mx-auto px-4 my-8 flex-grow">
      <Suspense fallback={<SinglePostSkeleton />}>
        <Post slug={slug} />
      </Suspense>
    </article>
  );
}