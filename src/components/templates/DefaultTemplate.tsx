// src/components/templates/DefaultTemplate.tsx
'use client';

import React from 'react';
import { LocalPage } from '@/lib/types';
import TemplateTransitionWrapper from './TemplateTransitionWrapper';
import Image from 'next/image';

export default function DefaultTemplate({ page }: { page: LocalPage }) {
  // Add null checks for all properties
  const featuredMedia = page?._embedded?.['wp:featuredmedia']?.[0];
  const featuredImage = featuredMedia?.source_url;
  const imageAlt = featuredMedia?.alt_text || (page?.title?.rendered || 'Page image');

  // Handle cases where title or content might be undefined
  const pageTitle = page?.title?.rendered || '';
  const pageContent = page?.content?.rendered || '';

  return (
    <TemplateTransitionWrapper>
      <article className="max-w-2xl mx-auto px-4 py-8 border-primary">
        {featuredImage && (
          <Image
          src={featuredImage}
          alt={imageAlt}
          className="w-full h-64 md:h-96 object-cover rounded-lg mb-8"
          loading="lazy"
          fill
          />
        )}

        {pageTitle && (
          <h1
            className="text-4xl font-bold mb-4"
            dangerouslySetInnerHTML={{ __html: pageTitle }}
          />
        )}

        {pageContent && (
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: pageContent }}
          />
        )}

        {/* Show a message if no content is available */}
        {!pageTitle && !pageContent && (
          <div className="text-center py-16">
            <h2 className="text-2xl font-semibold text-muted-foreground">Page content is loading or unavailable</h2>
            <p className="mt-4">Please check the page configuration in WordPress.</p>
          </div>
        )}
      </article>
    </TemplateTransitionWrapper>
  );
}