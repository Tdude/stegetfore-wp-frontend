// src/app/page.tsx
import { Suspense } from 'react';
import { HomepageData } from '@/lib/types';
import { fetchPageById } from '@/lib/api';
import { notFound } from 'next/navigation';
import PageTemplateSelector from '@/components/PageTemplateSelector';
import { LocalPage, Module, HeroModule } from '@/lib/types';

export default async function HomePage() {
  try {
    // Fetch the homepage by ID 2 (WordPress default homepage ID)
    // Cast the result to LocalPage which has the modules property
    const page = await fetchPageById(2, true) as unknown as LocalPage;
    
    if (!page) {
      console.error("Homepage not found");
      return notFound();
    }

    // Create the homepage data structure from the page data
    const homepageData: HomepageData = {
      id: page.id,
      slug: page.slug,
      title: page.title,
      content: page.content,
      // Add modules array for modular content
      modules: page.modules || []
    };

    // Find the hero module from the page modules if it exists
    const heroModule = page.modules?.find(
      (module: Module): module is HeroModule => module.type === 'hero'
    );

    // If we found a hero module, add it to the homepageData
    if (heroModule) {
      homepageData.hero = {
        title: heroModule.title || '',
        intro: heroModule.intro || heroModule.content || '',
        image: heroModule.image || '',
        // Only include buttons if they're available and map them to the expected format
        buttons: heroModule.buttons?.map(button => ({
          text: button.text,
          url: button.url,
          style: button.style === 'destructive' ? 'primary' : button.style
        }))
      };
    }

    console.log("HOMEPAGE DATA:", {
      hasModules: Array.isArray(homepageData.modules),
      moduleCount: Array.isArray(homepageData.modules) ? homepageData.modules.length : 0,
      moduleTypes: Array.isArray(homepageData.modules) ? homepageData.modules.map((m: Module) => m.type) : []
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