// src/components/modules/CTAModule.tsx
'use client';

import React from 'react';
import { CTAModule as CTAModuleType } from '@/lib/types/moduleTypes';
import { Button } from '@/components/ui/button';
import { cn, cleanWordPressContent } from '@/lib/utils';
import NextImage from '@/components/NextImage';

interface CTAModuleProps {
  module: CTAModuleType;
  className?: string;
}

export default function CTAModule({ module, className }: CTAModuleProps) {
  const cleanDescription = module.description ? cleanWordPressContent(module.description) : '';
  const isFullWidth = module.fullWidth === true;
  const hasImage = !!module.featured_image;
  const isCentered = module.layout === 'center';
  const isLeftAligned = module.layout === 'left';
  const isRightAligned = module.layout === 'right';

  return (
    <section
      className={cn("relative py-16 overflow-hidden", className)}
      style={{ backgroundColor: module.backgroundColor || "#f9fce9" }}
    >
      {module.backgroundImage && (
        <div className="absolute inset-0 w-full h-full">
          <NextImage
            src={module.backgroundImage}
            alt="Background"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black" style={{ opacity: module.overlayOpacity || 0.3 }} />
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
              isCentered ? 'text-center' : 'text-left'
            )}>
              <h2
                className="text-3xl font-bold tracking-tighter sm:text-4xl"
                style={{ color: module.textColor || "inherit" }}
              >
                {module.title}
              </h2>

              {cleanDescription && (
                <div
                  className="text-bold md:text-2xl prose prose-invert max-w-none"
                  style={{ color: module.textColor ? `${module.textColor}/90` : "inherit" }}
                  dangerouslySetInnerHTML={{ __html: cleanDescription }}
                />
              )}

              {module.buttons && module.buttons.length > 0 && (
                <div className={cn(
                  "flex flex-wrap gap-4",
                  isCentered ? 'justify-center' : ''
                )}>
                  {module.buttons.map((button, index) => (
                    <Button
                      key={index}
                      size={button.size || 'md'}
                      variant={button.style || 'primary'}
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
                  ))}
                </div>
              )}
            </div>
          )}

          {hasImage && (
            <div className={cn(
              "w-full",
              isCentered ? "max-w-2xl mx-auto" : "md:w-1/2"
            )}>
              <div className="relative rounded-lg overflow-hidden aspect-video">
                <NextImage
                  src={module.featured_image}
                  alt={module.title}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}