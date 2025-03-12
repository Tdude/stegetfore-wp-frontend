// src/app/page.tsx
import { Suspense } from 'react';
import { HomepageData, LocalPage, PageTemplate } from '@/lib/types';
import { fetchPosts, fetchCategories, fetchHomepageData, fetchPage } from '@/lib/api';
import { notFound } from 'next/navigation';
import PageTemplateSelector from '@/components/PageTemplateSelector';

export default async function HomePage() {
  try {
    // Fetch homepage data first as our primary content source
    let homepageData: HomepageData = {
      hero: undefined,
      modules: []
    };
    let page: LocalPage | null = null;

    try {
      // Fetch the homepage from WP API
      homepageData = await fetchHomepageData() as HomepageData;
      console.log("HOMEPAGE DATA:", {
        hasModules: Array.isArray(homepageData.modules),
        moduleCount: Array.isArray(homepageData.modules) ? homepageData.modules.length : 0,
        moduleTypes: Array.isArray(homepageData.modules) ? homepageData.modules.map(m => m.type) : []
      });

      // Also fetch the page that might be set as homepage in WordPress
      page = await fetchPage('home', true) as LocalPage;
      console.log("PAGE DATA:", {
        hasModules: !!page?.modules,
        moduleCount: page?.modules?.length || 0,
        moduleTypes: page?.modules?.map((m: any) => m.type)
      });

      // If no page was found, create a minimal page object
      if (!page) {
        console.log("No home page found, creating a minimal page object");
        page = {
          id: 0,
          slug: 'home',
          title: {
            rendered: homepageData.hero?.title || 'Home',
          },
          content: {
            rendered: '',
          },
          template: PageTemplate.HOMEPAGE, // Use the correct template (the value is "templates/homepage.php")
          modules: homepageData.modules || [],
        };
      }

      // If we have modules in homepageData but not in page, add them to page
      if (Array.isArray(homepageData.modules) && homepageData.modules.length) {
        console.log(`Found ${homepageData.modules.length} modules in homepageData`);

        if (!page) {
          console.log("Creating new page with modules");
          page = {
            id: 0,
            slug: 'home',
            title: {
              rendered: homepageData.hero?.title || 'Home',
            },
            content: {
              rendered: '',
            },
            template: PageTemplate.HOMEPAGE,
            modules: [...homepageData.modules], // Create a new array copy
          };
        } else if (!page.modules || page.modules.length === 0) {
          console.log("Adding modules to existing page");
          page.modules = [...homepageData.modules]; // Create a new array copy
        }

        // Log the final page
        console.log("FINAL PAGE:", {
          hasModules: !!page?.modules,
          moduleCount: page?.modules?.length || 0,
          firstModuleType: page?.modules?.[0]?.type || 'none'
        });
      }
    } catch (error) {
      console.error("Error fetching homepage data:", error);
    }

    // Return the page template with both homepage data and modules
    return (
      <Suspense fallback={<div className="h-screen bg-muted/30 animate-pulse"></div>}>
        <PageTemplateSelector
          page={page!}
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