import { Suspense } from 'react';
import { fetchPage } from '@/lib/api';
import { SinglePostSkeleton } from '@/components/PostSkeleton';
import { notFound } from 'next/navigation';
import PageTemplateSelector from '@/components/PageTemplateSelector';
import { LocalPage } from '@/lib/types';
import * as imageHelper from '@/lib/imageUtils';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

// Helper function to safely truncate strings
function truncateString(str: string, maxLength: number = 155): string {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + '...';
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
export default async function PageWrapper(props: any) {
  // Extract slug from params
  const slug = typeof props.params === 'object' && props.params 
    ? (props.params.slug || '') 
    : '';

  return (
    <main className="mx-auto flex-grow">
      <Suspense fallback={<SinglePostSkeleton />}>
        <PageContent slug={slug} />
      </Suspense>
    </main>
  );
}

// Generate metadata for the page. DO NOT REMOVE!
export async function generateMetadata(props: any): Promise<Metadata> {
  // Extract slug from params
  const slug = typeof props.params === 'object' && props.params 
    ? (props.params.slug || '') 
    : '';
  
  const page = await getPageData(slug);

  if (!page) {
    return { title: 'Page Not Found' };
  }

  // Clean HTML from title and content for metadata
  let title = 'Steget Före';
  if (typeof page.title === 'string') {
    title = page.title;
  } else if (page.title && typeof page.title === 'object' && 'rendered' in page.title) {
    title = imageHelper.stripHtml(page.title.rendered);
  }
  
  // Handle excerpt and content for description
  let description = 'Steget Före';
  
  // Handle excerpt if available
  if (typeof page.excerpt === 'string') {
    description = truncateString(page.excerpt);
  } else if (page.excerpt && typeof page.excerpt === 'object' && 'rendered' in page.excerpt) {
    description = truncateString(imageHelper.stripHtml(page.excerpt.rendered));
  } else if (page.content) {
    // Fallback to content if no excerpt
    if (typeof page.content === 'string') {
      description = truncateString(page.content);
    } else if (typeof page.content === 'object' && 'rendered' in page.content) {
      description = truncateString(imageHelper.stripHtml(page.content.rendered));
    }
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: page.featured_image_url ? [page.featured_image_url] : [],
    },
  };
}