// src/app/page.tsx
import { Suspense } from 'react';
import { fetchPageById } from '@/lib/api';
import { notFound } from 'next/navigation';
import PageTemplateSelector from '@/components/PageTemplateSelector';
import DebugPanel from '@/components/debug/DebugPanel';
import RequireAuth from '@/lib/utils/RequireAuth';

export default async function HomePage() {
  try {
    // Fetch the homepage by ID 2
    const page = await fetchPageById(2);
    
    if (!page) {
      console.error("Homepage not found");
      return notFound();
    }

    // Create the homepage data structure from the page data
    const homepageData: Record<string, unknown> = {
      hero: page.meta && typeof page.meta === 'object' && page.meta.hero ? page.meta.hero : {},
      modules: Array.isArray(page.modules) ? page.modules : []
    };

    // Only require auth if status is draft or private
    const requiresAuth = page.status === 'draft' || page.status === 'private';

    return (
      <>
        <Suspense fallback={<div className="h-screen bg-muted/30 animate-pulse"></div>}>
          {requiresAuth ? (
            <RequireAuth>
              {/* 
                This component expects a LocalPage type, but we're passing a Page from fetchPageById.
                This is intentional as they have compatible structures for our purposes.
              */}
              <PageTemplateSelector
                page={page}
                isHomePage={true}
                homepageData={homepageData}
              />
            </RequireAuth>
          ) : (
            <PageTemplateSelector
              page={page}
              isHomePage={true}
              homepageData={homepageData}
            />
          )}
        </Suspense>
        <DebugPanel page={page} additionalData={homepageData} title="Debug: Startpage" />
      </>
    );
  } catch (error) {
    console.error("Error rendering homepage:", error);
    return notFound();
  }
}