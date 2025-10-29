// src/components/modules/CTAModule.tsx
'use client';

import React from 'react';
import { CTAModule as CTAModuleType } from '@/lib/types/moduleTypes';
import { Button } from '@/components/ui/button';
import { cn, cleanWordPressContent, getModuleBackgroundStyle } from '@/lib/utils';
import NextImage from '@/components/NextImage';
import { useTheme } from '@/contexts/ThemeContext';

interface CTAModuleProps {
  module: CTAModuleType;
  className?: string;
}

export default function CTAModule({ module, className }: CTAModuleProps) {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  const cleanDescription = module.description ? cleanWordPressContent(module.description) : '';
  const isFullWidth = module.fullWidth === true;
  const hasImage = !!module.featured_image;
  const isCentered = module.layout === 'center';
  const isLeftAligned = module.layout === 'left';
  const isRightAligned = module.layout === 'right';

  // Adjust overlay opacity based on theme
  const baseOverlayOpacity = module.overlayOpacity || 0.3;
  const adjustedOverlayOpacity = isDarkMode 
    ? Math.min(baseOverlayOpacity + 0.2, 0.7) // Increase opacity more in dark mode for better contrast
    : baseOverlayOpacity;

  // Determine text color based on theme
  const textColor = React.useMemo(() => {
    if (isDarkMode) {
      return module.backgroundImage ? 'hsl(var(--hero-text))' : undefined; // Use semantic color for better consistency
    }
    return module.textColor || "inherit";
  }, [isDarkMode, module.textColor, module.backgroundImage]);

  return (
    <section
      className={cn(
        "relative py-16 overflow-hidden module-bg", 
        isDarkMode ? "cta-module-dark" : "",
        className
      )}
      style={module.backgroundColor ? getModuleBackgroundStyle(module.backgroundColor) : {}}
    >
      {module.backgroundImage && (
        <div className="absolute inset-0 w-full h-full">
          <NextImage
            src={module.backgroundImage}
            alt="Background"
            fill
            className={cn(
              "object-cover",
              isDarkMode ? "opacity-90" : "" // Slightly reduce image brightness in dark mode
            )}
          />
          <div 
            className={cn(
              "absolute inset-0",
              isDarkMode 
                ? "bg-gradient-to-t from-black/90 via-black/80 to-black/70" 
                : "bg-black"
            )} 
            style={{ opacity: adjustedOverlayOpacity }} 
          />
        </div>
      )}

      <div className={cn(isFullWidth ? "w-full px-4" : "container mx-auto px-4 md:px-6")}>
        <div
          className={cn(
            "flex flex-col gap-8 px-6",
            hasImage && (isLeftAligned || isRightAligned) ? 'md:flex-row' : '',
            isRightAligned && hasImage ? 'md:flex-row-reverse' : '',
            isCentered ? 'items-center text-center' : '',
          )}
        >
          {/* Ensure text is always on the left for left-aligned layout, even without an image */}
          {((isLeftAligned && !hasImage) || hasImage) && (
            <div className={cn(
              "flex flex-col space-y-6",
              hasImage ? "md:w-1/2" : "w-full max-w-2xl mx-auto",
              isCentered ? 'text-center' : 'text-left',
              isDarkMode && !module.backgroundImage ? "text-foreground" : ""
            )}>
              <h2
                className={cn(
                  "text-3xl font-bold tracking-tighter sm:text-4xl",
                  isDarkMode && module.backgroundImage ? "text-shadow-lg" : ""
                )}
                style={{ color: textColor }}
              >
                {module.title}
              </h2>

              {cleanDescription && (
                <div
                  className={cn(
                    "text-bold md:text-2xl max-w-none",
                    isDarkMode && module.backgroundImage 
                      ? "text-inverted" 
                      : isDarkMode 
                        ? "text-secondary" 
                        : "text-inverted"
                  )}
                  style={{ 
                    color: isDarkMode 
                      ? (module.backgroundImage ? "rgba(255,255,255,0.9)" : undefined) 
                      : (module.textColor ? `${module.textColor}/90` : "inherit") 
                  }}
                  dangerouslySetInnerHTML={{ __html: cleanDescription }}
                />
              )}

              {module.buttons && module.buttons.length > 0 && (
                <div className={cn(
                  "flex flex-wrap gap-4",
                  isCentered ? 'justify-center' : ''
                )}>
                  {module.buttons.map((button, index) => {
                    // Enhanced button styling for dark mode with better contrast
                    const buttonVariant = button.style || 'primary';
                    let buttonClass = "";
                    
                    // Apply specific styling based on dark mode and background image
                    if (isDarkMode && module.backgroundImage) {
                      switch (buttonVariant) {
                        case 'primary':
                          buttonClass = "shadow-lg hover:shadow-xl text-primary-foreground font-medium";
                          break;
                        case 'secondary':
                          buttonClass = "shadow-lg hover:shadow-xl border-panel-border text-text-primary font-medium";
                          break;
                        case 'outline':
                          buttonClass = "shadow-lg hover:shadow-xl border-hero-text text-hero-text hover:bg-interactive-hover hover:text-hero-text/90";
                          break;
                        case 'ghost':
                          buttonClass = "shadow-lg hover:shadow-xl text-hero-text hover:bg-interactive-hover hover:text-hero-text/90";
                          break;
                        case 'link':
                          buttonClass = "text-hero-text hover:text-hero-text/90 underline-offset-4";
                          break;
                        default:
                          buttonClass = "shadow-lg hover:shadow-xl";
                      }
                    } else if (isDarkMode) {
                      // Dark mode without background image
                      buttonClass = "hover-state focus-visible-state";
                    }
                    
                    return (
                      <Button
                        key={index}
                        size={button.size || 'md'}
                        variant={buttonVariant}
                        className={cn(
                          buttonClass,
                          "transition-all duration-200",
                          isDarkMode ? "dark-cta-button" : ""
                        )}
                        asChild
                      >
                        <a
                          href={button.url}
                          target={button.new_tab ? "_blank" : undefined}
                          rel={button.new_tab ? "noopener noreferrer" : undefined}
                        >
                          {button.text}
                        </a>
                      </Button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {hasImage && (
            <div className={cn(
              "w-full",
              isCentered ? "max-w-2xl mx-auto" : "md:w-1/2"
            )}>
              <div className={cn(
                "relative rounded-lg overflow-hidden aspect-video",
                isDarkMode ? "shadow-lg" : "" // Add shadow in dark mode for better visual separation
              )}>
                <NextImage
                  src={module.featured_image}
                  alt={module.title}
                  fill
                  className={cn(
                    "object-cover",
                    isDarkMode ? "opacity-90 brightness-[0.9]" : ""
                  )}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}