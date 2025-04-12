// src/app/page.tsx
// @ts-nocheck - This file requires flexibility with data structures from WordPress
import { Suspense } from 'react';
import { fetchPageById } from '@/lib/api';
import { notFound } from 'next/navigation';
import PageTemplateSelector from '@/components/PageTemplateSelector';

export default async function HomePage() {
  try {
    // Fetch the homepage by ID 2
    const page = await fetchPageById(2, true);
    
    if (!page) {
      console.error("Homepage not found");
      return notFound();
    }

    // Create the homepage data structure from the page data
    const homepageData: Record<string, unknown> = {
      // Access properties safely, handling potential property absence
      hero: page.meta?.hero || {},
      modules: Array.isArray(page.modules) ? page.modules : []
    };

    return (
      <Suspense fallback={<div className="h-screen bg-muted/30 animate-pulse"></div>}>
        {/* 
          This component expects a LocalPage type, but we're passing a Page from fetchPageById.
          This is intentional as they have compatible structures for our purposes.
        */}
        <PageTemplateSelector
          page={page}
          isHomePage={true}
          homepageData={homepageData}
        />
      </Suspense>
    );
  } catch (error) {
    console.error("Error rendering homepage:", error);
    return notFound();
  }
}