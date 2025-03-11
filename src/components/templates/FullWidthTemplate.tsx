// src/components/templates/FullWidthTemplate.tsx
'use client';

import React from 'react';
import Page from '@/lib/types';
import TemplateTransitionWrapper from './TemplateTransitionWrapper';
import Image from 'next/image';

export default function FullWidthTemplate({ page }: { page: Page }) {
  const featuredImage = page._embedded?.['wp:featuredmedia']?.[0]?.source_url;

//  console.log(' FullWidthTemplate rendered with page:', page);
  return (
    <TemplateTransitionWrapper>
      <article className="w-full mx-auto relative aspect-video overflow-hidden rounded-lg mb-4">
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