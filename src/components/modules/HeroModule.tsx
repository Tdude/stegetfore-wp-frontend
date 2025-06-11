// src/components/modules/HeroModule.tsx
'use client';

import React from 'react';
import type { HeroModule } from '@/lib/types/index';
import { Button } from '@/components/ui/button';
import NextImage from '@/components/NextImage';
import Image from 'next/image';
import { cn, cleanWordPressContent } from '@/lib/utils';

interface HeroModuleProps {
  module: HeroModule;
  className?: string;
}

export default function HeroModule({ module, className }: HeroModuleProps) {
  const cleanContent = module.content ? cleanWordPressContent(module.content) : '';

  const finalImageUrl = React.useMemo(() => {
    const featuredImage: string | string[] | null | undefined = module.featured_image;
    // console.log('Featured image data:', featuredImage);

    if (typeof featuredImage === 'string') {
      return featuredImage;
    } else if (Array.isArray(featuredImage) && (featuredImage as string[]).length > 0) {
      return featuredImage[0];
    } else {
      return '/images/hero-fallback.jpg';
    }
  }, [module.featured_image]);

  const alignmentClasses = {
    left: 'items-start text-left',
    center: 'items-center text-center',
    right: 'items-end text-right',
  };

  const contentAlignment = alignmentClasses[module.layout as 'left' | 'center' | 'right' || 'center'];

  const heightClasses = {
    small: 'h-[50vh] min-h-[300px]',
    medium: 'h-[70vh] min-h-[400px]',
    large: 'h-[80vh] min-h-[500px]',
  };

  const heightClass = heightClasses[module.height as 'small' | 'medium' | 'large' || 'large'];
  const isSvg = finalImageUrl.toLowerCase().endsWith('.svg');

  return (
    <section
      className={cn("relative w-full overflow-hidden", heightClass, className)}
      style={{ backgroundColor: module.backgroundColor || "#a4e87a" }}
    >
      <div className="absolute inset-0 w-full h-full">
        {module.video_url ? (
          <div className="relative w-full h-full">
            <iframe
              src={module.video_url}
              title={module.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full object-cover"
            ></iframe>
          </div>
        ) : (
          <div className="relative w-full h-full">
            {isSvg ? (
              <Image
                src={finalImageUrl}
                alt={module.title || "Hero background"}
                className="absolute inset-0 w-full h-full"
                style={{ objectFit: 'contain' }}
                width={800}
                height={600}
                unoptimized={true}
                priority={true}
              />
            ) : (
              <NextImage
                src={finalImageUrl}
                alt={module.title || "Hero background"}
                fill={true}
                priority={true}
                unoptimized={true}
                className="object-cover"
                fallbackSrc="/images/hero-fallback.jpg"
              />
            )}
          </div>
        )}
        <div
          className="absolute inset-0 bg-black"
          style={{ opacity: module.overlayOpacity || 0.1 }}
        ></div>
      </div>

      <div className={cn(
        "relative z-10 container mx-auto h-full px-4 md:px-6 flex flex-col justify-center",
        contentAlignment
      )}>
        <div className="max-w-3xl">
          <h1
            className={cn("text-3xl md:text-5xl lg:text-6xl font-bold tracking-tighter mb-6 text-hard-shadow-white")}
            style={{ color: module.textColor || "#1e73be" }}
          >
            {module.title}
          </h1>
          {cleanContent && (
            <div
              className={cn("text-xl md:text-2xl mb-8 max-w-2xl mx-auto text-hard-shadow-white")}
              style={{ color: module.textColor ? `${module.textColor}/90` : "#1e73be/90" }}
              dangerouslySetInnerHTML={{ __html: cleanContent }}
            />
          )}
          {module.buttons && module.buttons.length > 0 && (
            <div className="flex flex-wrap gap-4 justify-center">
              {module.buttons.map((button, index) => {
                // Determine the button variant based on style
                let variant: 'primary' | 'secondary' | 'outline' | 'link' | 'ghost' = 'primary';
                let customClass = '';

                switch (button.style) {
                  case 'link':
                    variant = 'link';
                    break;
                  case 'ghost':
                  case 'outline':
                    variant = 'outline';
                    customClass = 'bg-transparent border-white text-white hover:bg-white/20';
                    break;
                  case 'secondary':
                    variant = 'secondary';
                    break;
                  case 'primary':
                    variant = 'primary';
                    break;
                  default:
                    // 'default' style uses the 'default' variant
                    break;
                }

                return (
                  <Button
                    key={index}
                    size="lg"
                    variant={variant}
                    className={customClass}
                    asChild
                  >
                    <a href={button.url} target={button.new_tab ? "_blank" : "_self"} rel="noopener noreferrer">
                      {button.text}
                    </a>
                  </Button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}