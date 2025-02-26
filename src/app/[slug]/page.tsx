// src/app/[slug]/page.tsx
import { Suspense } from 'react';
import { fetchPage } from '@/lib/api';
import { SinglePostSkeleton } from '@/components/PostSkeleton';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import PageTemplateSelector from '@/components/PageTemplateSelector';


// Helper function to safely get params
async function getSlugFromParams(params: { slug: string }) {
  const result = await Promise.resolve(params);
  return result.slug;
}

async function Page({ slug }: { slug: string }) {
  const page = await fetchPage(slug);

  if (!page) {
    notFound();
  }

  // Fallback to default template rendering if something goes wrong
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
          fill
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

export default async function PageWrapper({
  params
}: {
  params: { slug: string }
}) {
  const slug = await getSlugFromParams(params);

  return (
    <main className="container mx-auto px-4 py-8 flex-grow">
      <Suspense fallback={<SinglePostSkeleton />}>
        <Page slug={slug} />
      </Suspense>
    </main>
  );
}

export async function generateMetadata({
  params
}: {
  params: { slug: string }
}) {
  const slug = await getSlugFromParams(params);
  const page = await fetchPage(slug);

  if (!page) {
    return { title: 'Page Not Found' };
  }

  return {
    title: page.title.rendered,
    description: page.content.rendered.replace(/<[^>]*>/g, '').slice(0, 155) + '...',
  };
}