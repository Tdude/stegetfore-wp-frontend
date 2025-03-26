// src/components/templates/FullWidthTemplate.tsx
'use client';

import React, { memo, useState, useEffect } from 'react';
import TemplateTransitionWrapper from './TemplateTransitionWrapper';
import type { Page } from '@/lib/types';
import Image from 'next/image';
import ModuleRenderer from '@/components/modules/ModuleRenderer';
import { useModules } from '@/hooks/useModules';

function FullWidthTemplate({ page }: { page: Page }) {
  const [mounted, setMounted] = useState(false);

  // Use the custom hook to handle all module processing and organization
  const { allModules, modulesBySection } = useModules({
    pageModules: page?.modules || [],
    moduleCategory: "modul-oversikt"
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const featuredImage = page._embedded?.['wp:featuredmedia']?.[0]?.source_url;

  return (
    <TemplateTransitionWrapper>
        {/* Render header modules */}
        {modulesBySection.header.map(module => (
          <ModuleRenderer key={`header-${module.id}`} module={module} />
        ))}

        {/* Featured Image */}
        {featuredImage && (
          <div className="relative aspect-video overflow-hidden rounded-lg mb-4">
            <Image
              src={featuredImage}
              alt={page.title.rendered}
              className="w-full h-64 md:h-96 object-cover rounded-lg mb-8"
              fill
            />
          </div>
        )}

        <div className="mx-auto">
          {/* Page Title */}
          <h1
            className="sr-only text-4xl font-bold mb-4"
            dangerouslySetInnerHTML={{ __html: page.title.rendered }}
          />

          {/* Page Content */}
          {page.content?.rendered && (
            <div
              className="prose max-w-none mb-8"
              dangerouslySetInnerHTML={{ __html: page.content.rendered }}
            />
          )}

          {/* Fallback message if no modules are found */}
          {allModules.length === 0 && mounted && (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded mb-8">
              <p className="text-yellow-700">
                No modules found with the category "Modulöversikt".
                Make sure modules have the correct category assigned.
              </p>
            </div>
          )}

          {/* Render all modules in the main section */}
          {modulesBySection.main.map(module => (
            <ModuleRenderer key={`main-${module.id}`} module={module} />
          ))}

          {/* Render other and footer modules */}
          {modulesBySection.other.map(module => (
            <ModuleRenderer key={`other-${module.id}`} module={module} />
          ))}

          {modulesBySection.footer.map(module => (
            <ModuleRenderer key={`footer-${module.id}`} module={module} />
          ))}
        </div>
    </TemplateTransitionWrapper>
  );
}

export default memo(FullWidthTemplate);