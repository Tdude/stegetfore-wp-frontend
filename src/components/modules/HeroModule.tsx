// src/components/modules/HeroModule.tsx
'use client';

import React from 'react';
import type { HeroModule } from '@/lib/types/index';
import { Button } from '@/components/ui/button';
import NextImage from '@/components/NextImage';
import Image from 'next/image';
import { cn, cleanWordPressContent } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';

interface HeroModuleProps {
  module: HeroModule;
  className?: string;
}

export default function HeroModule({ module, className }: HeroModuleProps) {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const cleanContent = module.content ? cleanWordPressContent(module.content) : '';

  const finalImageUrl = React.useMemo(() => {
    const featuredImage: string | string[] | null | undefined = module.featured_image;

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

  // Enhanced overlay opacity handling for dark mode using semantic variables
  const baseOverlayOpacity = module.overlayOpacity || 0.1;
  
  // Use CSS variables for hero overlay opacity based on theme
  // This ensures consistent dark mode behavior across all hero modules
  const adjustedOverlayOpacity = isDarkMode 
    ? 0.5 // Use a stronger overlay in dark mode for better text contrast
    : baseOverlayOpacity;

  // Enhanced text shadow based on theme for better readability
  const textShadowClass = isDarkMode 
    ? "text-shadow-xl" // Stronger shadow in dark mode for better readability
    : "text-hard-shadow-white";

  // Determine image brightness adjustment for dark mode
  const imageOpacityClass = isDarkMode 
    ? "opacity-75 brightness-[0.8]" // Reduce brightness more in dark mode for better contrast with text
    : "";

  return (
    <section
      className={cn(
        "relative w-full overflow-hidden", 
        heightClass, 
        className,
        isDarkMode ? "dark-hero-module" : ""
      )}
      style={{ 
        backgroundColor: isDarkMode 
          ? "hsl(var(--surface-primary))" // Use semantic color in dark mode
          : (module.backgroundColor || "#a4e87a") 
      }}
    >
      <div className="absolute inset-0 w-full h-full">
        {module.video_url ? (
          <div className="relative w-full h-full">
            <iframe
              src={module.video_url}
              title={module.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className={cn(
                "absolute inset-0 w-full h-full object-cover",
                isDarkMode ? "opacity-90" : ""
              )}
            ></iframe>
          </div>
        ) : (
          <div className="relative w-full h-full">
            {isSvg ? (
              <Image
                src={finalImageUrl}
                alt={module.title || "Hero background"}
                className={cn(
                  "absolute inset-0 w-full h-full transition-all duration-300",
                  imageOpacityClass
                )}
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
                className={cn(
                  "object-cover transition-all duration-300",
                  imageOpacityClass
                )}
                fallbackSrc="/images/hero-fallback.jpg"
              />
            )}
          </div>
        )}
        {/* Enhanced overlay with semantic colors for better text readability in dark mode */}
        <div
          className={cn(
            "absolute inset-0",
            isDarkMode 
              ? "hero-overlay bg-gradient-to-t from-black/90 via-black/80 to-black/70" 
              : "bg-black"
          )}
          style={{ opacity: adjustedOverlayOpacity }}
        ></div>
      </div>

      <div className={cn(
        "relative z-10 container mx-auto h-full px-4 md:px-6 flex flex-col justify-center",
        contentAlignment
      )}>
        <div className={cn(
          "max-w-3xl",
          isDarkMode ? "dark-hero-content relative z-20" : ""
        )}>
          <h1
            className={cn(
              "text-3xl md:text-5xl lg:text-6xl font-bold tracking-tighter mb-6",
              textShadowClass,
              isDarkMode ? "hero-text" : ""
            )}
            style={{ 
              color: isDarkMode ? undefined : (module.textColor || "#1e73be") 
            }}
          >
            {module.title}
          </h1>
          {cleanContent && (
            <div
              className={cn(
                "text-xl md:text-2xl mb-8 max-w-2xl mx-auto",
                textShadowClass,
                isDarkMode ? "hero-text opacity-90" : ""
              )}
              style={{ 
                color: isDarkMode ? undefined : (module.textColor ? `${module.textColor}/90` : "#1e73be/90")
              }}
              dangerouslySetInnerHTML={{ __html: cleanContent }}
            />
          )}
          {module.buttons && module.buttons.length > 0 && (
            <div className="flex flex-wrap gap-4 justify-center">
              {module.buttons.map((button, index) => {
                // Enhanced button variant selection for dark mode
                let variant: 'primary'  | 'default' | 'secondary' | 'outline' | 'link' | 'ghost' = 'primary' ;
                let customClass = '';

                switch (button.style) {
                  case 'link':
                    variant = 'link';
                    customClass = isDarkMode 
                      ? 'text-hero-text hover:text-hero-text/90 underline-offset-4 hover-state' 
                      : '';
                    break;
                  case 'ghost':
                    variant = 'ghost';
                    customClass = isDarkMode 
                      ? 'text-hero-text hover:bg-interactive-hover hover:text-hero-text/90 hover-state'
                      : 'bg-transparent text-white hover:bg-white/20';
                    break;
                  case 'outline':
                    variant = 'outline';
                    customClass = isDarkMode 
                      ? 'bg-transparent border-hero-text text-hero-text hover:bg-interactive-hover hover:border-hero-text/90 hover-state focus-visible-state'
                      : 'bg-transparent border-white text-white hover:bg-white/20';
                    break;
                  case 'secondary':
                    variant = 'secondary';
                    customClass = isDarkMode 
                      ? 'shadow-dark-sm border-panel-border hover-state focus-visible-state' 
                      : '';
                    break;
                  case 'primary':
                    variant = 'primary';
                    customClass = isDarkMode 
                      ? 'shadow-dark-sm hover-state focus-visible-state' 
                      : '';
                    break;
                  default:
                    variant = 'default';
                    customClass = isDarkMode 
                      ? 'shadow-dark-sm border-panel-border bg-surface-secondary/80 hover-state focus-visible-state' 
                      : '';
                    break;
                }

                return (
                  <Button
                    key={index}
                    size="lg"
                    variant={variant}
                    className={cn(
                      customClass,
                      "transition-all duration-200 font-medium",
                      isDarkMode ? "dark-hero-button focus-visible-state" : ""
                    )}
                    asChild
                  >
                    <a 
                      href={button.url} 
                      target={button.new_tab ? "_blank" : "_self"} 
                      rel="noopener noreferrer"
                      className="focus:outline-none"
                    >
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