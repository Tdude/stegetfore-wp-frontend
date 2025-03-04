// src/components/templates/DefaultTemplate.tsx
'use client';

import React from 'react';
import OptimizedImage from '@/components/OptimizedImage';
import { PageTemplateProps } from '@/lib/types';
import { getFeaturedImageUrl } from '@/lib/imageUtils';
import TemplateTransitionWrapper from './TemplateTransitionWrapper';

export default function DefaultTemplate({ page }: PageTemplateProps) {
  // Add null checks for all properties
  const featuredImageUrl = getFeaturedImageUrl(page);

  // Handle cases where title or content might be undefined
  const pageTitle = page?.title?.rendered || '';
  const pageContent = page?.content?.rendered || '';

  return (
    <TemplateTransitionWrapper>
      <article className="max-w-2xl mx-auto px-4 py-8">
        {featuredImageUrl && (
          <div className="relative w-full h-64 md:h-96 mb-8 overflow-hidden rounded-lg">
            <OptimizedImage
              src={featuredImageUrl}
              htmlTitle={pageTitle}
              fill={true}
              containerType="default"
              priority={true}
              className="object-cover rounded-lg"
            />
          </div>
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