// src/app/blog/page.tsx
import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { fetchPosts, fetchCategories } from '@/lib/api';
import { Button } from '@/components/ui/button';

// Skeleton loader for the blog listing
function BlogListSkeleton() {
  return (
    <div className="space-y-8">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded-lg mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      ))}
    </div>
  );
}

async function BlogPostsList() {
  const [posts, categories] = await Promise.all([
    fetchPosts(),
    fetchCategories()
  ]);

  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-4">Inga inlägg hittades</h2>
        <p className="text-gray-600">Det finns för närvarande inga blogginlägg att visa.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => {
          // Get up to two category names for this post
          const postCategories = post.categories
            ?.slice(0, 2)
            .map(id => categories[id]?.name)
            .filter(Boolean);

          return (
            <article key={post.id} className="flex flex-col h-full">
              <Link href={`/posts/${post.slug}`} className="block group">
                <div className="relative aspect-video overflow-hidden rounded-lg mb-4">
                  {post.featured_image_url ? (
                    <Image
                      src={post.featured_image_url}
                      alt={post.title.rendered}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      fill
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">Ingen bild</span>
                    </div>
                  )}
                </div>

                {postCategories && postCategories.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-2">
                    {postCategories.map((category, idx) => (
                      <span key={idx} className="text-xs font-medium px-2 py-1 bg-gray-100 rounded-full text-gray-700">
                        {category}
                      </span>
                    ))}
                  </div>
                )}

                <h2
                  className="text-xl font-semibold mb-2 group-hover:text-orange-600 transition-colors"
                  dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                />

                <div
                  className="text-gray-600 line-clamp-3 mb-4"
                  dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
                />
              </Link>

              <div className="mt-auto">
                <Link href={`/posts/${post.slug}`}>
                  <Button variant="secondary" size="sm">
                    Läs mer
                  </Button>
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

export default function BlogPage() {
  return (
    <main className="container mx-auto px-4 py-12 flex-grow">
      <div className="max-w-5xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4">Blogg</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Ta del av våra senaste nyheter, insikter och uppdateringar
          </p>
        </header>

        <Suspense fallback={<BlogListSkeleton />}>
          <BlogPostsList />
        </Suspense>
      </div>
    </main>
  );
}