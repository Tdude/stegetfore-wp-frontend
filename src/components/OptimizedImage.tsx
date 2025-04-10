// src/components/OptimizedImage.tsx
'use client';

import React, { useState } from 'react';
import Image, { ImageProps } from 'next/image';
import { ImageContainer } from '@/lib/types/componentTypes';
import { stripHtml, getImageSizes } from '@/lib/imageUtils';

interface OptimizedImageProps extends Omit<ImageProps, 'src' | 'alt'> {
  src: string | null | undefined;
  alt?: string;
  htmlTitle?: string;
  containerType?: ImageContainer;
  fallbackSrc?: string;
}

export default function OptimizedImage({
  src,
  alt,
  htmlTitle,
  containerType = 'default',
  fallbackSrc = '/images/placeholder.jpg',
  ...props
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState<string>(src || fallbackSrc);

  // Clean HTML from title if provided
  const safeAlt = htmlTitle ? stripHtml(htmlTitle) : (alt || 'Image');

  // Get correct sizes value based on container type
  const sizes = getImageSizes(containerType);

  // Handle loading errors
  const handleError = () => {
    if (imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc);
    }
  };

  return (
    <Image
      src={imgSrc}
      alt={safeAlt}
      sizes={sizes}
      onError={handleError}
      {...props}
    />
  );
}