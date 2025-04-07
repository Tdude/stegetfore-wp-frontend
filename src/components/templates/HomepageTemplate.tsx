// src/components/templates/HomepageTemplate.tsx
'use client';

import React, { useState, useEffect } from 'react';
import TemplateTransitionWrapper from './TemplateTransitionWrapper';
import { HomepageTemplateProps, LocalPage } from '@/lib/types';
import ModuleRenderer from '@/components/modules/ModuleRenderer';
import { useModules } from '@/hooks/useModules';
import { HomepageData } from '@/lib/types/contentTypes';

export default function HomepageTemplate({ homepage }: HomepageTemplateProps) {
  const [mounted, setMounted] = useState(false);

  // Convert homepage to the right type if it's a string or undefined
  const homepageData: HomepageData | undefined = 
    typeof homepage === 'string' ? JSON.parse(homepage) as HomepageData : 
    (homepage as HomepageData);

  // Use the custom hook to handle all module processing and organization
  const { allModules, modulesBySection } = useModules({
    pageModules: homepageData?.modules || [],
    homepageData: homepageData,
    featuredPostsPosition: 2 // Position the featured posts at index 2
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <TemplateTransitionWrapper>
      <div className="min-h-screen">
        {modulesBySection.header.map(module => (
          <ModuleRenderer key={`header-${module.id}`} module={module} />
        ))}

        <div className="mx-auto">
          {modulesBySection.main.map(module => (
            <ModuleRenderer key={`main-${module.id}`} module={module} />
          ))}

          {modulesBySection.other.map(module => (
            <ModuleRenderer key={`other-${module.id}`} module={module} />
          ))}

          {modulesBySection.footer.map(module => (
            <ModuleRenderer key={`footer-${module.id}`} module={module} />
          ))}

          {homepageData?.content?.rendered && mounted && (
            <section className="max-w-7xl px-4 py-12 mx-auto">
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: homepageData.content.rendered }}
              />
            </section>
          )}

          {homepageData?.content?.rendered && !mounted && (
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