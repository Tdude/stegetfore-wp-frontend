// src/components/templates/LandingTemplate.tsx
'use client';

import React from 'react';
import { Page } from '@/lib/types/contentTypes';
import TemplateTransitionWrapper from './TemplateTransitionWrapper';
import Image from 'next/image';
import DebugPanel from '@/components/debug/DebugPanel';

export default function LandingTemplate({ page }: { page: Page }) {
  const featuredImage = page._embedded?.['wp:featuredmedia']?.[0]?.source_url;
  
  return (
    <TemplateTransitionWrapper>
      <div>This should be the Landing/Start </div>
      <article className="max-w-3xl mx-auto">
        {featuredImage && (
        <Image
          src={featuredImage}
          alt={page.title?.rendered || ''}
          width={1200}
          height={600}
          className="object-cover w-full rounded-lg mb-8"
        />
        )}
        <h1 className="text-4xl font-bold mb-4" dangerouslySetInnerHTML={{ __html: page.title?.rendered || '' }}></h1>
        <div className="mt-8 prose max-w-none" dangerouslySetInnerHTML={{ __html: page.content?.rendered || '' }}></div>
        
        {/* Debug panel at the bottom - no menu, just header and footer as per user request */}
        <DebugPanel 
          title="Page Debug" 
          page={page}
          additionalData={{
            "Navigation": "No Menu (Landing)",
            "Layout": "Minimal"
          }}
        />
      </article>
    </TemplateTransitionWrapper>
  );
}