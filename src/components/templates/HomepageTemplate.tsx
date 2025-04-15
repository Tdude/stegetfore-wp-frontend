// src/components/templates/HomepageTemplate.tsx
'use client';

import React, { useState, useEffect } from 'react';
import TemplateTransitionWrapper from './TemplateTransitionWrapper';
import { HomepageTemplateProps } from '@/lib/types/componentTypes';
import ModuleRenderer from '@/components/modules/ModuleRenderer';
import { useModules } from '@/hooks/useModules';
import DebugPanel from '@/components/debug/DebugPanel';

export default function HomepageTemplate({ page, homepage }: HomepageTemplateProps) {
  const [mounted, setMounted] = useState(false);

  // Use the custom hook to handle all module processing and organization
  const { modulesBySection } = useModules({
    pageModules: page?.modules || [],
    homepageData: typeof homepage === 'object' ? homepage : undefined,
    featuredPostsPosition: 2 // Position the featured posts at index 2
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <TemplateTransitionWrapper>
      <div className="min-h-screen">
        {modulesBySection?.header?.map?.(module => (
          <ModuleRenderer key={`header-${module.id}`} module={module} />
        ))}

        {modulesBySection?.hero?.map?.(module => (
          <ModuleRenderer key={`hero-${module.id}`} module={module} />
        ))}

        {/* Main and content modules should be full-width */}
        {modulesBySection?.main?.map?.(module => (
          <ModuleRenderer key={`main-${module.id}`} module={module} />
        ))}

        {modulesBySection?.content?.map?.(module => (
          <ModuleRenderer key={`content-${module.id}`} module={module} />
        ))}

        {modulesBySection?.full?.map?.(module => (
          <ModuleRenderer key={`full-${module.id}`} module={module} />
        ))}

        {modulesBySection?.footer?.map?.(module => (
          <ModuleRenderer key={`footer-${module.id}`} module={module} />
        ))}
        
        {page?.content?.rendered && mounted && (
          <section className="max-w-7xl px-4 py-12 mx-auto">
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: page.content.rendered }}
            />
          </section>
        )}

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
        
        {/* Debug panel moved to the bottom */}
        <DebugPanel 
          title="Page Debug" 
          page={page}
          additionalData={{
            "Homepage Data": typeof homepage === 'object' && homepage ? {
              id: homepage.id,
              title: homepage.title?.rendered,
              featuredPosts: Array.isArray(homepage.featured_posts) ? 
                homepage.featured_posts.length : 0
            } : 'Not available'
          }}
        />
      </div>
    </TemplateTransitionWrapper>
  );
}