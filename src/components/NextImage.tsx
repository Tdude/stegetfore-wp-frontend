'use client';

import React from 'react';
import Image, { ImageProps } from 'next/image';
import { ImageContainer } from '@/lib/types/componentTypes';
import { stripHtml, getImageSizes } from '@/lib/imageUtils';

interface NextImageProps extends Omit<ImageProps, 'src' | 'alt'> {
  src: string | null | undefined;
  alt?: string;
  htmlTitle?: string;
  containerType?: ImageContainer;
  fallbackSrc?: string;
}

export default function NextImage({
  src,
  alt,
  htmlTitle,
  containerType = 'default',
  fallbackSrc = '/images/placeholder.jpg',
  ...props
}: NextImageProps) {
  // Use the provided source or fallback if null/undefined
  const imageSrc = src || fallbackSrc;
  
  // Clean HTML from title if provided
  const safeAlt = htmlTitle ? stripHtml(htmlTitle) : (alt || 'Image');
  
  // Get correct sizes value based on container type
  const sizes = getImageSizes(containerType);

  return (
    <Image
      src={imageSrc}
      alt={safeAlt}
      sizes={sizes}
      onError={() => {
        // This is handled differently in Next.js 14+
        // The error boundary or placeholder prop is preferred
        console.warn('Image load error:', imageSrc);
      }}
      {...props}
    />
  );
}
