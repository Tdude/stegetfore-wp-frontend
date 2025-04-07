// src/components/templates/DefaultTemplate.tsx
'use client';

import React, { memo, useState, useEffect } from 'react';
import OptimizedImage from '@/components/OptimizedImage';
import { useModules } from '@/hooks/useModules';
import { getFeaturedImageUrl } from '@/lib/imageUtils';
import TemplateTransitionWrapper from './TemplateTransitionWrapper';
import ModuleRenderer from '@/components/modules/ModuleRenderer';
import type { Page, LocalPage } from '@/lib/types';

// Handle modules directly in the component
function DefaultTemplate({ page }: { page: Page }) {
  const [mounted, setMounted] = useState(false);

  // Cast page to LocalPage to access modules property
  const localPage = page as LocalPage;

  // Use the modules hook directly
  const { modulesBySection } = useModules({
    pageModules: localPage?.modules || [],
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

  return (
    <TemplateTransitionWrapper>
      <article className="max-w-2xl mx-auto px-4 py-8">
        {/* Render header modules */}
        {modulesBySection.header.map(module => (
          <ModuleRenderer key={`header-${module.id}`} module={module} />
        ))}

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

        {pageTitle && (
          <h1
            className="text-4xl font-bold mb-4"
            dangerouslySetInnerHTML={{ __html: pageTitle }}
          />
        )}

        {/* Render main modules */}
        {modulesBySection.main.map(module => (
          <ModuleRenderer key={`main-${module.id}`} module={module} />
        ))}

        {pageContent && (
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: pageContent }}
          />
        )}

        {/* Render other and footer modules */}
        {modulesBySection.other.map(module => (
          <ModuleRenderer key={`other-${module.id}`} module={module} />
        ))}

        {modulesBySection.footer.map(module => (
          <ModuleRenderer key={`footer-${module.id}`} module={module} />
        ))}

        {/* Show a message if no content is available */}
        {!pageTitle && !pageContent && (
          <div className="text-center py-16">
            <h2 className="text-2xl font-semibold text-muted-foreground">Page content is loading or unavailable</h2>
            <p className="mt-4">Please check the page configuration in WordPress.</p>
          </div>
        )}
      </article>
    </TemplateTransitionWrapper>
  );
}

export default memo(DefaultTemplate);