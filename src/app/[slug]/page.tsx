// src/app/[slug]/page.tsx
import { Suspense } from 'react';
import { fetchPage } from '@/lib/api';
import { SinglePostSkeleton } from '@/components/PostSkeleton';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import PageTemplateSelector from '@/components/PageTemplateSelector';

// Define a type that matches the exact structure expected by Next.js
type SlugParams = {
  slug: string;
};

// Non-async wrapper component that directly handles the params object
export default function Page(props: { params: SlugParams }) {
  // Extract slug in a non-async context first to avoid the error
  const slug = props.params.slug;

  return (
    <main className="container mx-auto px-4 py-8 flex-grow">
      <Suspense fallback={<SinglePostSkeleton />}>
        <PageContent slug={slug} />
      </Suspense>
    </main>
  );
}

// Move all async operations to a separate component
async function PageContent({ slug }: { slug: string }) {
  // Now we can safely use the slug without issue
  const page = await fetchPage(slug);

  if (!page) {
    notFound();
  }

  try {
    return <PageTemplateSelector page={page} />;
  } catch (error) {
    console.error('Error rendering template:', error);

    // Fallback to default layout
    const featuredImage = page._embedded?.['wp:featuredmedia']?.[0]?.source_url;

    return (
      <article className="max-w-3xl mx-auto">
        {featuredImage && (
          <Image
            src={featuredImage}
            alt={page.title.rendered}
            className="w-full h-64 md:h-96 object-cover rounded-lg mb-8"
            width={1200}
            height={630}
            priority
          />
        )}
        <h1
          className="text-4xl font-bold mb-4"
          dangerouslySetInnerHTML={{ __html: page.title.rendered }}
        />
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: page.content.rendered }}
        />
      </article>
    );
  }
}

// Metadata function that follows the exact same pattern
export async function generateMetadata(props: { params: SlugParams }) {
  // Extract slug in a non-async context first
  const slug = props.params.slug;

  // Then use it in the async operation
  const page = await fetchPage(slug);

  if (!page) {
    return { title: 'Page Not Found' };
  }

  // Create stripped text for meta description
  const stripHtml = (html: string) => html.replace(/<[^>]*>?/gm, '');
  const description = page.excerpt?.rendered
    ? stripHtml(page.excerpt.rendered).slice(0, 155) + '...'
    : stripHtml(page.content.rendered).slice(0, 155) + '...';

  return {
    title: page.title.rendered,
    description,
  };
}