// src/components/templates/LandingTemplate.tsx
'use client';

import React from 'react';
import { Page, LocalPage } from '@/lib/types';
import TemplateTransitionWrapper from './TemplateTransitionWrapper';
import Image from 'next/image';

export default function LandingTemplate({ page }: { page: Page }) {
  // If we need to access modules in the future, cast page to LocalPage
  // const localPage = page as LocalPage;
  
  const featuredImage = page._embedded?.['wp:featuredmedia']?.[0]?.source_url;
  return (
    <TemplateTransitionWrapper>
        <div>This should be the Landing/Start </div>
      <article className="max-w-3xl mx-auto">
        {featuredImage && (
        <Image
          src={featuredImage}
          alt={page.title.rendered}
          className="w-full h-64 md:h-96 object-cover rounded-lg mb-8"
          fill
        />
        )}

        <h1
          className="text-4xl font-bold mb-4"
          dangerouslySetInnerHTML={{ __html: page.title.rendered }}
        />

        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: page.content.rendered }}
        />
      </article>
    </TemplateTransitionWrapper>
  );
}