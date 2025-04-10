// src/components/templates/DefaultTemplate.tsx
'use client';

import React, { memo, useState, useEffect } from 'react';
import OptimizedImage from '@/components/OptimizedImage';
import { useModules } from '@/hooks/useModules';
import { getFeaturedImageUrl } from '@/lib/imageUtils';
import TemplateTransitionWrapper from './TemplateTransitionWrapper';
import ModuleRenderer from '@/components/modules/ModuleRenderer';
import { Page } from '@/lib/types/contentTypes';
import DebugPanel from '@/components/debug/DebugPanel';

// Handle modules directly in the component
function DefaultTemplate({ page }: { page: Page }) {
  const [mounted, setMounted] = useState(false);

  // Defensive programming - ensure page is valid
  if (!page) {
    console.error('DefaultTemplate: Page is undefined');
    return <div className="py-8 text-center">Error: Page content could not be loaded</div>;
  }

  // Use the modules hook directly with null checks
  const { modulesBySection } = useModules({
    pageModules: Array.isArray(page.modules) ? page.modules : [],
  });

  // Set mounted after initial render
  useEffect(() => {
    setMounted(true);
  }, []);

  // Add null checks for all properties
  const featuredImageUrl = getFeaturedImageUrl(page);

  // Handle cases where title or content might be undefined
  const pageTitle = page?.title?.rendered || '';
  const pageContent = page?.content?.rendered || '';
  
  // Content positioning logic based on page settings with defaults
  // Use the new content_display_settings field structure first, fall back to legacy fields if needed
  const contentDisplaySettings = page?.content_display_settings || {
    show_content_with_modules: false,
    content_position: 'before'
  };
  const showContentWithModules = contentDisplaySettings.show_content_with_modules;
  const contentPosition = contentDisplaySettings.content_position || page?.meta?.content_position || 'before';
  
  // Logging for debugging
  console.log('DefaultTemplate: Content display settings', {
    showContentWithModules,
    contentPosition,
    hasContent: Boolean(pageContent),
    contentLength: pageContent?.length || 0,
    hasModules: Boolean(modulesBySection?.main?.length),
    modulesCount: modulesBySection?.main?.length || 0,
    contentDisplaySettings
  });
  
  // Simplified content display logic
  const shouldShowContentBefore = showContentWithModules && contentPosition === 'before' && pageContent;
  const shouldShowContentAfter = showContentWithModules && contentPosition === 'after' && pageContent;
  const shouldShowContentAlone = (!showContentWithModules || !modulesBySection?.main?.length) && pageContent;

  return (
    <TemplateTransitionWrapper>
      {/* Render header modules */}
      {modulesBySection?.header?.length > 0 && modulesBySection.header.map(module => (
        <div key={`header-${module.id}`}>
          <ModuleRenderer module={module} />
        </div>
      ))}

      {/* Main article section with featured image, title, and content */}
      <article className="max-w-3xl mx-auto px-4 py-8">
        {/* Featured image */}
        {featuredImageUrl && (
          <div className="relative w-full h-64 md:h-96 mb-8 overflow-hidden rounded-lg">
            <OptimizedImage
              src={featuredImageUrl}
              htmlTitle={pageTitle}
              fill={true}
              containerType="default"
              priority={true}
              className="object-cover rounded-lg"
            />
          </div>
        )}

        {/* Page title */}
        {pageTitle && (
          <h1
            className="text-4xl font-bold mb-8"
            dangerouslySetInnerHTML={{ __html: pageTitle }}
          />
        )}

        {/* Show content before modules if configured that way */}
        {shouldShowContentBefore && (
          <div
            className="prose prose-lg prose-headings:mt-8 prose-headings:mb-4 prose-p:my-4 prose-img:rounded-lg max-w-prose mx-auto"
            dangerouslySetInnerHTML={{ __html: pageContent }}
          />
        )}

        {/* Show content after modules if configured that way */}
        {shouldShowContentAfter && (
          <div
            className="prose prose-lg prose-headings:mt-8 prose-headings:mb-4 prose-p:my-4 prose-img:rounded-lg max-w-prose mx-auto"
            dangerouslySetInnerHTML={{ __html: pageContent }}
          />
        )}

        {/* Show content if modules aren't available or show_content_with_modules is false */}
        {shouldShowContentAlone && (
          <div
            className="prose prose-lg prose-headings:mt-8 prose-headings:mb-4 prose-p:my-4 prose-img:rounded-lg max-w-prose mx-auto"
            dangerouslySetInnerHTML={{ __html: pageContent }}
          />
        )}
      </article>

      {/* Render main modules outside of article for full width */}
      {modulesBySection?.main?.length > 0 && modulesBySection.main.map(module => (
        <div key={`main-${module.id}`} className="my-8">
          <ModuleRenderer module={module} />
        </div>
      ))}

      {/* Render other and footer modules - outside article for full width */}
      {modulesBySection?.other?.length > 0 && modulesBySection.other.map(module => (
        <div key={`other-${module.id}`}>
          <ModuleRenderer module={module} />
        </div>
      ))}

      {modulesBySection?.footer?.length > 0 && modulesBySection.footer.map(module => (
        <div key={`footer-${module.id}`}>
          <ModuleRenderer module={module} />
        </div>
      ))}

      {/* Show a message if no content is available */}
      {!pageTitle && !pageContent && (!page.modules || page.modules.length === 0) && (
        <div className="text-center py-16">
          <h2 className="text-2xl font-semibold text-muted-foreground">Page content is loading or unavailable</h2>
          <p className="mt-4">Please check the page configuration in WordPress.</p>
        </div>
      )}

      {/* Add debug panel at the very bottom - only render if we have a valid page */}
      {page && (
        <DebugPanel 
          title="Page Debug Information"
          page={page}
          additionalData={{
            'Page ID': page.id,
            'Template': page.template || 'Default',
            'Title': pageTitle ? 'Set' : 'Missing',
            'Has Content': Boolean(pageContent),
            'Content Length': pageContent?.length || 0,
            'Featured Image': featuredImageUrl ? 'Set' : 'None',
            'Modules Count': page.modules?.length || 0,
            'Show Content With Modules': showContentWithModules ? 'Yes' : 'No',
            'Content Position': contentPosition,
            'Module Sections': JSON.stringify({
              header: modulesBySection?.header?.length || 0,
              main: modulesBySection?.main?.length || 0,
              other: modulesBySection?.other?.length || 0,
              footer: modulesBySection?.footer?.length || 0
            }),
            'Module Types': page.modules?.reduce((acc, m) => {
              if (m.type) {
                acc[m.type] = (acc[m.type] || 0) + 1;
              }
              return acc;
            }, {} as Record<string, number>) || {},
            'Content Display': pageContent 
              ? (showContentWithModules 
                  ? `Showing content ${contentPosition} modules` 
                  : 'Showing content without modules') 
              : 'No content to display',
            'Slug': page.slug || 'Unknown',
          }}
        />
      )}
    </TemplateTransitionWrapper>
  );
}

export default memo(DefaultTemplate);