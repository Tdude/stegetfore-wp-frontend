// src/app/page.tsx
import { Suspense } from 'react';
import { HomepageData, LocalPage, PageTemplate } from '@/lib/types';
import { fetchPage, fetchPageById } from '@/lib/api';
import { notFound } from 'next/navigation';
import PageTemplateSelector from '@/components/PageTemplateSelector';

export default async function HomePage() {
  try {
    // Fetch the homepage by ID 2 (WordPress default homepage ID)
    const page = await fetchPageById(2, true);
    
    if (!page) {
      console.error("Homepage not found");
      return notFound();
    }

    // Create the homepage data structure from the page data
    const homepageData: HomepageData = {
      hero: page.hero || undefined,
      modules: page.modules || []
    };

    console.log("HOMEPAGE DATA:", {
      hasModules: Array.isArray(homepageData.modules),
      moduleCount: Array.isArray(homepageData.modules) ? homepageData.modules.length : 0,
      moduleTypes: Array.isArray(homepageData.modules) ? homepageData.modules.map(m => m.type) : []
    });

    // Return the page template with both homepage data and modules
    return (
      <Suspense fallback={<div className="h-screen bg-muted/30 animate-pulse"></div>}>
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