// src/components/templates/DefaultTemplate.tsx
'use client';

import React, { useEffect } from 'react';
import { Page, PageTemplate } from '@/lib/types';
import TemplateTransitionWrapper from './TemplateTransitionWrapper';

export default function DefaultTemplate({ page }: { page: Page }) {
  const featuredMedia = page._embedded?.['wp:featuredmedia']?.[0];
  const featuredImage = featuredMedia?.source_url;
  const imageAlt = featuredMedia?.alt_text || page.title.rendered;

  return (
    <TemplateTransitionWrapper>
      <p>Default templ</p>
      <article className="max-w-2xl mx-auto">
        {featuredImage && (
          <img
            src={featuredImage}
            alt={imageAlt}
            className="w-full h-64 md:h-96 object-cover rounded-lg mb-8"
            loading="lazy"
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