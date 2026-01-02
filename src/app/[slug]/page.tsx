// src/app/[slug]/page.tsx
import { Suspense } from 'react';
import { fetchPage } from '@/lib/api/pageApi'; 
import { notFound } from 'next/navigation';
import PageTemplateSelector from '@/components/PageTemplateSelector';
import EvaluationTemplate from '@/components/templates/EvaluationTemplate';
import type { LocalPage } from '@/lib/types/contentTypes';
import type { Page } from '@/lib/types/contentTypes';
import type { Metadata } from 'next/types';
import DebugPanel from '@/components/debug/DebugPanel';
import { buildPageDebugData } from '@/lib/debug/buildPageDebugData';
import RequireAuth from '@/lib/utils/RequireAuth';
import ContentFade from '@/components/ContentFade';

// Tell Next.js to dynamically render this page
export const dynamic = 'force-dynamic';

/**
 * Fetch data for a page by slug
 * @param slug Page slug
 * @returns Page data with modules
 */
async function getPageData(slug: string): Promise<LocalPage | null> {
  // Fetch the page from the API  
  const page = await fetchPage(slug);
  
  // Basic logging - safely access properties to avoid TypeScript errors
  console.log(`[getPageData] Page retrieved for ${slug}:`, {
    id: page?.id,
    template: page?.template,
    hasModules: page && 'modules' in page && Array.isArray(page.modules) && page.modules.length > 0
  });
  
  // No need to normalize again, fetchPage already returns LocalPage
  return page;
}

async function fetchAssessmentById(id: number) {
  const apiBase = process.env.NEXT_PUBLIC_API_URL;
  if (!apiBase) return null;

  const response = await fetch(`${apiBase}/wp/v2/ham_assessment/${id}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  if (!response.ok) return null;
  return response.json();
}

// Individual page component
async function PageContent({
  slug,
  evaluationId,
}: {
  slug: string;
  evaluationId?: number;
}) {
  // Fetch page data
  const page = await getPageData(slug);
  
  // Handle 404
  if (!page) {
    notFound();
  }

  // Build debug data
  const debugData = buildPageDebugData(page);

  // Only require auth if status is draft or private
  const requiresAuth = page.status === 'draft' || page.status === 'private';

  // If this is an evaluation page and evaluationId is provided, use the
  // ham_assessment content as the content source.
  const isEvaluationTemplate = page.template === 'templates/evaluation.php';
  if (isEvaluationTemplate && typeof evaluationId === 'number' && Number.isFinite(evaluationId)) {
    const assessment = await fetchAssessmentById(evaluationId);
    const assessmentContent = assessment?.content;

    const mergedPage = {
      ...page,
      content: assessmentContent?.rendered ? assessmentContent : page.content,
      content_display_settings: assessment?.content_display_settings || page.content_display_settings,
      meta: {
        ...(page as unknown as { meta?: Record<string, unknown> }).meta,
        ...(assessment?.meta || {}),
      },
    };

    const evaluationNode = <EvaluationTemplate page={mergedPage} evaluationId={evaluationId} />;
    return requiresAuth ? <RequireAuth>{evaluationNode}</RequireAuth> : evaluationNode;
  }

  // Return the appropriate template with page data and DebugPanel
  return (
    requiresAuth ? (
      <RequireAuth>
        <PageTemplateSelector page={page} />
        <DebugPanel debugData={debugData} page={page} />
      </RequireAuth>
    ) : (
      <>
        <PageTemplateSelector page={page} />
        <DebugPanel debugData={debugData} page={page} />
      </>
    )
  );
}

// Main page component
export default async function Page({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams?: { evaluationId?: string };
}) {
  // Await params before using
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const evaluationId = searchParams?.evaluationId ? Number(searchParams.evaluationId) : undefined;

  return (
    <section className="mx-auto flex-grow">
      <Suspense fallback={<ContentFade />}>
        <PageContent slug={slug} evaluationId={evaluationId} />
      </Suspense>
    </section>
  );
}

// Metadata generator
export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  // Await params before using
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const page = await getPageData(slug);

  if (!page) {
    return { title: 'Page Not Found' };
  }

  // Clean HTML from title and content for metadata
  const cleanTitle = page.title.rendered.replace(/<\/?[^>]+(>|$)/g, '');
  const cleanDescription = page.content.rendered.replace(/<\/?[^>]+(>|$)/g, '').slice(0, 155) + '...';

  return {
    title: cleanTitle,
    description: cleanDescription,
  };
}