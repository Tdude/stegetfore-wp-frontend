// src/app/[slug]/page.tsx
import { Suspense } from 'react';
import { fetchPage } from '@/lib/api';
import { SinglePostSkeleton } from '@/components/PostSkeleton';
import { notFound } from 'next/navigation';
import PageTemplateSelector from '@/components/PageTemplateSelector';
import { PageParams, LocalPage } from '@/lib/types';
import * as imageHelper from '@/lib/imageUtils';
import { ResolvingMetadata, Metadata } from 'next';

// Nextjs routing analism
async function getSlugFromParams(params: { slug: string }) {
  return params.slug;
}
// Function to get page data by slug
async function getPageData(slug: string): Promise<LocalPage | null> {
  try {
    return await fetchPage(slug);
  } catch (error) {
    console.error(`Error fetching page with slug ${slug}:`, error);
    return null;
  }
}



// Individual page component
async function PageContent({ slug }: { slug: string }) {
  const page = await getPageData(slug);

  if (!page) {
    notFound();
  }

  // Render the page using the template selector
  return <PageTemplateSelector page={page} />;
}

// Main page wrapper component
export default async function PageWrapper({ params }: PageParams) {
  return (
    <main className="container mx-auto px-4 py-8 flex-grow">
      <Suspense fallback={<SinglePostSkeleton />}>
        <PageContent slug={params.slug} />
      </Suspense>
    </main>
  );
}

// Generate metadata for the page
export async function generateMetadata(
  { params }: PageParams,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // Await the params to fix the error
  const slug = await getSlugFromParams(params);
  const page = await getPageData(slug);

  if (!page) {
    return { title: 'Page Not Found' };
  }

  // Clean HTML from title and content for metadata
  const cleanTitle = imageHelper.stripHtml(page.title.rendered);
  const cleanDescription = imageHelper.stripHtml(page.content.rendered).slice(0, 155) + '...';

  return {
    title: cleanTitle,
    description: cleanDescription,
  };
}