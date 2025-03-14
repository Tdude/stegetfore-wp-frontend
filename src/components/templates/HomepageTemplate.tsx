// src/components/templates/HomepageTemplate.tsx
'use client';

import React, { memo, useState, useEffect } from 'react';
import { useModules } from '@/hooks/useModules';
import TemplateTransitionWrapper from './TemplateTransitionWrapper';
import ModuleRenderer from '@/components/modules/ModuleRenderer';
import type { Page, HomepageData } from "@/lib/types";

// Remove the HOC and handle modules directly in the component
function HomepageTemplate({ page, homepageData }: { page: Page, homepageData: HomepageData }) {
  const [mounted, setMounted] = useState(false);

  // Use the modules hook directly
  const { modulesBySection } = useModules({
    pageModules: page?.modules || [],
    homepageData
  });

  // Set mounted after initial render
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <TemplateTransitionWrapper>
      <div className="min-h-screen">
        {/* Header Modules */}
        {modulesBySection.header.map(module => (
          <ModuleRenderer key={`header-${module.id}`} module={module} />
        ))}

        <div className="mx-auto">
          {/* Main Modules */}
          {modulesBySection.main.map(module => (
            <ModuleRenderer key={`main-${module.id}`} module={module} />
          ))}

          {/* Other Modules */}
          {modulesBySection.other.map(module => (
            <ModuleRenderer key={`other-${module.id}`} module={module} />
          ))}

          {/* Footer Modules */}
          {modulesBySection.footer.map(module => (
            <ModuleRenderer key={`footer-${module.id}`} module={module} />
          ))}

          {/* Page Content */}
          {page?.content?.rendered && mounted && (
            <section className="max-w-7xl px-4 py-12 mx-auto">
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: page.content.rendered }}
              />
            </section>
          )}

          {/* Loading Placeholder */}
          {page?.content?.rendered && !mounted && (
            <section className="max-w-7xl px-4 py-12 mx-auto">
              <div className="prose max-w-none">
                <div className="h-6 bg-muted/30 rounded w-3/4 mb-4 animate-pulse" />
                <div className="h-4 bg-muted/30 rounded w-full mb-2 animate-pulse" />
                <div className="h-4 bg-muted/30 rounded w-full mb-2 animate-pulse" />
                <div className="h-4 bg-muted/30 rounded w-2/3 animate-pulse" />
              </div>
            </section>
          )}
        </div>
      </div>
    </TemplateTransitionWrapper>
  );
}

export default memo(HomepageTemplate);