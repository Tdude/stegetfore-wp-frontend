// src/components/tryggve/TryggveTextPanel.tsx
'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface TryggveTextPanelProps {
  title?: string;
  content: string;
  image?: string;
  imagePosition?: 'left' | 'right' | 'center-bottom';
  className?: string;
}

export default function TryggveTextPanel({ 
  title, 
  content,
  image,
  imagePosition = 'right',
  className 
}: TryggveTextPanelProps) {
  const hasImage = !!image;
  const maxWidth = hasImage ? 'max-w-6xl' : 'max-w-4xl';

  // Center-bottom layout
  if (hasImage && imagePosition === 'center-bottom') {
    return (
      <section className={cn("py-16 md:py-24 bg-surface-primary", className)}>
        <div className="container mx-auto px-6 md:px-8 lg:px-12">
          <div className={cn(maxWidth, "mx-auto")}>
            <div className="bg-white rounded-lg p-8 md:p-12 shadow-custom border border-gray-200">
              {title && (
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold font-heading mb-6 text-black px-4">
                  {title}
                </h2>
              )}
              <div 
                className="text-gray-800 text-lg leading-relaxed text-left space-y-4 mb-8"
                dangerouslySetInnerHTML={{ __html: content }}
              />
              <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                <Image
                  src={image}
                  alt={title || 'Panel image'}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 90vw, 1200px"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Left or right layout (side-by-side on desktop)
  if (hasImage && (imagePosition === 'left' || imagePosition === 'right')) {
    return (
      <section className={cn("py-16 md:py-24 bg-surface-primary", className)}>
        <div className="container mx-auto px-6 md:px-8 lg:px-12">
          <div className={cn(maxWidth, "mx-auto")}>
            <div className="bg-white rounded-lg p-8 md:p-12 shadow-custom border border-gray-200">
              {title && (
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold font-heading mb-6 text-black px-4">
                  {title}
                </h2>
              )}
              <div className={cn(
                "grid grid-cols-1 lg:grid-cols-2 gap-8 items-center",
                imagePosition === 'left' && "lg:grid-flow-dense"
              )}>
                {/* Text content */}
                <div 
                  className={cn(
                    "text-gray-800 text-lg leading-relaxed text-left space-y-4",
                    imagePosition === 'left' && "lg:col-start-2"
                  )}
                  dangerouslySetInnerHTML={{ __html: content }}
                />
                
                {/* Image */}
                <div className={cn(
                  "relative w-full aspect-square rounded-lg overflow-hidden",
                  imagePosition === 'left' && "lg:col-start-1 lg:row-start-1"
                )}>
                  <Image
                    src={image}
                    alt={title || 'Panel image'}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // No image - original layout
  return (
    <section className={cn("py-16 md:py-24 bg-surface-primary", className)}>
      <div className="container mx-auto px-6 md:px-8 lg:px-12">
        <div className={cn(maxWidth, "mx-auto")}>
          <div className="bg-white rounded-lg p-8 md:p-12 shadow-custom border border-gray-200">
            {title && (
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold font-heading mb-6 text-black px-4">
                {title}
              </h2>
            )}
            <div 
              className="text-gray-800 text-lg leading-relaxed text-left space-y-4"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
