// src/app/posts/[slug]/page.tsx
import { fetchPost } from '@/lib/api';
import Link from 'next/link';

export default async function PostPage({
  params: { slug }
}: {
  params: { slug: string }
}) {
  try {
    const post = await fetchPost(slug);

    return (
      <main className="container mx-auto px-4 py-8 flex-grow">
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
              ← Back to all posts
            </Link>
          </div>
        </article>
      </main>
    );
  } catch (error) {
    return (
      <main className="container mx-auto px-4 py-8 flex-grow">
        <h1 className="text-2xl text-red-600">Post not found</h1>
        <Link
          href="/"
          className="text-blue-600 hover:text-blue-800"
        >
          ← Back to all posts
        </Link>
      </main>
    );
  }
}