// src/app/[slug]/page.tsx
import { Suspense } from 'react';
import { fetchPage } from '@/lib/api/pageApi'; 
import { SinglePostSkeleton } from '@/components/PostSkeleton';
import { notFound } from 'next/navigation';
import PageTemplateSelector from '@/components/PageTemplateSelector';
import { LocalPage } from '@/lib/types/contentTypes'; 
import { PageTemplate } from '@/lib/types/baseTypes';
import { Module } from '@/lib/types/moduleTypes';
import * as imageHelper from '@/lib/imageUtils';
import { ResolvingMetadata, Metadata } from 'next';

// Define params interface for the page
interface PageParams {
  params: {
    slug: string;
  };
}

export const dynamic = 'force-dynamic';

/**
 * Fetch data for a page by slug
 * @param slug Page slug
 * @returns Page data with modules
 */
async function getPageData(slug: string): Promise<LocalPage | null> {
  // Fetch the page from the API  
  const page = await fetchPage(slug, false);
  
  // Basic logging - safely access properties to avoid TypeScript errors
  console.log(`[getPageData] Page retrieved for ${slug}:`, {
    id: page?.id,
    template: page?.template,
    hasModules: Array.isArray((page as any)?.modules) && (page as any).modules.length > 0
  });
  
  // Normalize the page data to ensure it has the required structure
  return normalizePageData(page);
}

/**
 * Normalizes page data to ensure it has all required properties for the PageTemplateSelector
 * This acts as a compatibility layer between the API data and UI components
 */
function normalizePageData(page: any): LocalPage | null {
  if (!page) return null;
  
  // Create a normalized version of the page with required fields for LocalPage
  return {
    id: page.id,
    slug: page.slug,
    title: page.title || { rendered: '' },
    content: page.content || { rendered: '' },
    modules: Array.isArray(page.modules) ? page.modules : [],
    template: page.template || PageTemplate.DEFAULT,
    meta: page.meta || {},
    // Include any other fields from the original page
    ...(page as any)
  } as LocalPage;
}

// Individual page component
async function PageContent({ slug }: { slug: string }) {
  const page = await getPageData(slug);

  if (!page) {
    notFound();
  }

  // Debug the page object being passed to PageTemplateSelector
  console.log(`[PageContent] Passing page to PageTemplateSelector for ${slug}:`, {
    id: page.id,
    slug: page.slug,
    hasModules: Array.isArray(page.modules),
    moduleCount: Array.isArray(page.modules) ? page.modules.length : 0,
    template: page.template
  });

  // Template selector component will handle rendering the appropriate template
  return <PageTemplateSelector page={page} />;
}

// Main page wrapper component
export default async function PageWrapper({ params }: PageParams) {
  // Await the entire params object first
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  return (
    <section className="mx-auto flex-grow">
      <Suspense fallback={<SinglePostSkeleton />}>
        <PageContent slug={slug} />
      </Suspense>
    </section>
  );
}

// Generate metadata for the page. DO NOT REMOVE!
export async function generateMetadata(
  { params }: PageParams,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // Await the entire params object first
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
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