// src/components/modules/HeroModule.tsx
'use client';

import React from 'react';
import type { HeroModule } from '@/lib/types';
import { Button } from '@/components/ui/button';
import OptimizedImage from '@/components/OptimizedImage';
import { cn } from '@/lib/utils';

interface HeroModuleProps {
  module: HeroModule;
  className?: string;
}

export default function HeroModule({ module, className }: HeroModuleProps) {
  const finalImageUrl = React.useMemo(() => {
    if (typeof module.image === 'string') {
      return module.image;
    } else if (Array.isArray(module.image) && module.image.length > 0) {
      return module.image[0];
    } else {
      return '/images/hero-fallback.jpg';
    }
  }, [module.image]);

  const alignmentClasses = {
    left: 'items-start text-left',
    center: 'items-center text-center',
    right: 'items-end text-right',
  };

  const contentAlignment = alignmentClasses[module.alignment || 'center'];

  const heightClasses = {
    small: 'h-[50vh] min-h-[300px]',
    medium: 'h-[70vh] min-h-[400px]',
    large: 'h-[80vh] min-h-[500px]',
  };

  const heightClass = heightClasses[module.height as 'small' | 'medium' | 'large' || 'large'];

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
            <OptimizedImage
              src={finalImageUrl}
              alt={module.title || "Hero background"}
              fill={true}
              containerType="hero"
              priority={true}
              className="object-cover"
              fallbackSrc="/images/hero-fallback.jpg"
            />
          </div>
        )}
        <div
          className="absolute inset-0 bg-black"
          style={{ opacity: module.overlayOpacity || module.overlay_opacity || 0.1 }}
        ></div>
      </div>

      <div className={cn(
        "relative z-10 container mx-auto h-full px-4 md:px-6 flex flex-col justify-center",
        contentAlignment
      )}>
        <div className="max-w-3xl">
          <h1
            className={cn("text-3xl md:text-5xl lg:text-6xl font-bold tracking-tighter mb-6 text-shadow-lg")}
            style={{ color: module.textColor || module.text_color || "#1e73be" }}
          >
            {module.title}
          </h1>
          {module.intro && (
            <p
              className={cn("text-xl md:text-2xl mb-8 max-w-2xl mx-auto text-shadow-md")}
              style={{ color: module.textColor ? `${module.textColor}/90` : module.text_color ? `${module.text_color}/90` : "#1e73be/90" }}
            >
              {module.intro}
            </p>
          )}
          {module.buttons && module.buttons.length > 0 && (
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              {module.buttons.map((button, index) => (
                <Button
                  key={index}
                  size="lg"
                  variant={button.style === 'outline' ? 'outline' : button.style === 'secondary' ? 'secondary' : 'primary'}
                  className={button.style === 'outline' ? 'bg-transparent border-white text-white hover:bg-white/20' : ''}
                  asChild
                >
                  <a href={button.url} target={button.new_tab ? "_blank" : "_self"} rel="noopener noreferrer">
                    {button.text}
                  </a>
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}