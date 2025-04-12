'use client';

import React, { useState } from 'react';
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
  // Use state to manage the image source with fallback handling
  const [imgSrc, setImgSrc] = useState<string>(src || fallbackSrc);
  
  // Clean HTML from title if provided
  const safeAlt = htmlTitle ? stripHtml(htmlTitle) : (alt || 'Image');
  
  // Get correct sizes value based on container type
  const sizes = getImageSizes(containerType);

  // Handle loading errors by switching to fallback
  const handleError = () => {
    console.warn('Image load error, switching to fallback:', imgSrc);
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
