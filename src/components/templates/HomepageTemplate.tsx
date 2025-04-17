// src/components/templates/HomepageTemplate.tsx
'use client';

import React from 'react';
import TemplateTransitionWrapper from './TemplateTransitionWrapper';
import { PageTemplateProps } from '@/lib/types/componentTypes';
import ModuleRenderer from '@/components/modules/ModuleRenderer';

export default function HomepageTemplate({ page }: PageTemplateProps) {
  return (
    <TemplateTransitionWrapper>
      <div className="min-h-screen">
        {/* Render all modules in a standard way */}
        {page?.modules?.map(module => (
          <ModuleRenderer key={`module-${module.id}`} module={module} />
        ))}
        
        {/* Render any page content */}
        {page?.content && (
          <section className="max-w-7xl px-4 py-12 mx-auto">
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: typeof page.content === 'string' ? page.content : page.content?.rendered || '' }}
            />
          </section>
        )}
      </div>
    </TemplateTransitionWrapper>
  );
}