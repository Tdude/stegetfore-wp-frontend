// src/components/templates/ModularTemplate.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { LocalPage } from '@/lib/types/contentTypes';
import { Module } from '@/lib/types/moduleTypes';
import TemplateTransitionWrapper from './TemplateTransitionWrapper';
import ModuleRenderer from '@/components/modules/ModuleRenderer';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import DebugPanel from '@/components/debug/DebugPanel';
import { useModules } from '@/hooks/useModules';

interface ModularTemplateProps {
  page: LocalPage;
}

export default function ModularTemplate({ page }: ModularTemplateProps) {
  // Ensure modules is always an array, even if page.modules is undefined
  const modules = Array.isArray(page.modules) ? page.modules : [];

  // Use the modules hook with the correct interface
  const { modulesBySection, allModules } = useModules({
    pageModules: modules,
  });

  // Compute whether we have any modules
  const hasAnyModules = allModules.length > 0;

  // Access the flag safely with type assertions
  const pageWithFlag = page as unknown as { 
    show_content_with_modules?: boolean;
    content_position?: 'before' | 'after';
  };

  // Content is shown ONLY when the flag is explicitly true
  // This matches the WordPress admin checkbox behavior
  const shouldShowContent = pageWithFlag.show_content_with_modules === true;

  // Default content position is 'after' (after main modules)
  const contentPosition = pageWithFlag.content_position || 'after';

  // Extract page title and content with fallbacks
  const pageTitle = page.title?.rendered || '';
  const pageContent = page.content?.rendered || '';

  // For debugging when enabled or in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[ModularTemplate] Page data:', {
        id: page.id,
        title: pageTitle ? 'Set' : 'Missing',
        hasContent: Boolean(pageContent),
        contentLength: pageContent.length,
        moduleCount: modules.length,
        shouldShowContent,
        contentPosition
      });
    }
  }, [page.id, pageTitle, pageContent, modules.length, shouldShowContent, contentPosition]);

  return (
    <TemplateTransitionWrapper>
      {/* Render header modules - outside article */}
      {modulesBySection?.header?.length > 0 && modulesBySection.header.map(module => (
        <div key={`header-${module.id}`} className={module.type === 'hero' ? 'w-full' : 'container mx-auto px-4'}>
          <ModuleRenderer module={module} />
        </div>
      ))}
      
      {/* Main article section with just title and content */}
      <article className={`max-w-3xl mx-auto px-4 ${modulesBySection?.header?.length > 0 ? 'pb-8' : 'my-8'}`}>
        {/* Show page title if available and no Hero module is present in header */}
        {pageTitle && !modulesBySection?.header?.some(module => module.type === 'hero') && (
          <h1 
            className="text-3xl font-bold mb-8" 
            dangerouslySetInnerHTML={{ __html: pageTitle }}
          />
        )}
        
        {/* Content before modules if configured that way */}
        {contentPosition === 'before' && shouldShowContent && pageContent && (
          <div 
            className="prose prose-lg prose-headings:mt-8 prose-headings:mb-4 prose-p:my-4 prose-img:rounded-lg max-w-prose mx-auto" 
            dangerouslySetInnerHTML={{ __html: pageContent }}
          />
        )}
        
        {/* Content after modules if configured that way */}
        {contentPosition === 'after' && shouldShowContent && pageContent && (
          <div 
            className="prose prose-lg prose-headings:mt-8 prose-headings:mb-4 prose-p:my-4 prose-img:rounded-lg max-w-prose mx-auto" 
            dangerouslySetInnerHTML={{ __html: pageContent }}
          />
        )}
        
        {/* No modules case - show content and alert */}
        {!hasAnyModules && (
          <>
            <Alert variant="warning" className="mb-8">
              <AlertTitle>No modules found</AlertTitle>
              <AlertDescription>
                This page is configured to use the modular template but doesn&apos;t have any modules yet.
              </AlertDescription>
            </Alert>
            
            {pageContent && (
              <div
                className="prose prose-lg prose-headings:mt-8 prose-headings:mb-4 prose-p:my-4 prose-img:rounded-lg max-w-prose mx-auto"
                dangerouslySetInnerHTML={{ __html: pageContent }}
              />
            )}
          </>
        )}
      </article>
      
      {/* Render main modules outside article for full width */}
      {modulesBySection?.main?.length > 0 && modulesBySection.main.map(module => (
        <div key={`main-${module.id}`} className="my-8">
          <ModuleRenderer module={module} />
        </div>
      ))}
      
      {/* Render other and footer modules - outside article */}
      {modulesBySection?.other?.length > 0 && modulesBySection.other.map(module => (
        <div key={`other-${module.id}`} className="container mx-auto px-4 my-8">
          <ModuleRenderer module={module} />
        </div>
      ))}
      
      {modulesBySection?.footer?.length > 0 && modulesBySection.footer.map(module => (
        <div key={`footer-${module.id}`} className="container mx-auto px-4 my-8">
          <ModuleRenderer module={module} />
        </div>
      ))}
      
      {/* Add debug panel */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        <DebugPanel 
          title="Page Debug Information"
          debugData={{
            'Page ID': page.id,
            'Template': page.template || 'Modular',
            'Title': pageTitle ? 'Set' : 'Missing',
            'Has Content': Boolean(pageContent),
            'Content Length': pageContent.length || 0,
            'Modules Count': modules.length,
            'Show Content With Modules': shouldShowContent ? 'Yes' : 'No',
            'Content Position': contentPosition,
            'Module Sections': JSON.stringify({
              header: modulesBySection?.header?.length || 0,
              main: modulesBySection?.main?.length || 0,
              other: modulesBySection?.other?.length || 0,
              footer: modulesBySection?.footer?.length || 0
            }),
            'Slug': page.slug || 'Unknown',
          }}
        />
      </div>
    </TemplateTransitionWrapper>
  );
}