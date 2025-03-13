// src/components/modules/CTAModule.tsx
'use client';

import React from 'react';
import { CTAModule as CTAModuleType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import OptimizedImage from '@/components/OptimizedImage';

interface CTAModuleProps {
  module: CTAModuleType;
  className?: string;
}

// Helper function to clean WordPress HTML content
function cleanWordPressContent(content: string): string {
  if (!content) return '';

  // Remove WordPress comments
  const withoutComments = content.replace(/<!--[\s\S]*?-->/g, '');

  // Remove wp paragraph wrappers but keep the content
  const cleanedContent = withoutComments
    .replace(/<p>([\s\S]*?)<\/p>/g, '$1')
    .trim();

  return cleanedContent;
}

export default function CTAModule({ module, className }: CTAModuleProps) {
  const cleanDescription = module.description ? cleanWordPressContent(module.description) : '';

  const alignmentClasses = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end',
  };

  const contentAlignment = alignmentClasses[module.layout as 'left' | 'center' | 'right' || 'center'];
  const hasImage = !!module.featured_image;

  return (
    <section
      className={cn(
        "relative py-16 overflow-hidden",
        className
      )}
      style={{ backgroundColor: module.backgroundColor || "#f5f9de" }}
    >
      {/* Background Image (if needed) */}
      {module.backgroundImage && (
        <div className="absolute inset-0 w-full h-full">
          <OptimizedImage
            src={module.backgroundImage}
            alt="Background"
            fill={true}
            containerType="hero" // featured | hero
            className="object-cover"
            priority={true}
          />
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black"
            style={{ opacity: module.overlayOpacity || 0.3 }}
          />
        </div>
      )}

      {/* Content */}
      <div className="container px-4 md:px-6 mx-auto relative z-10">
        <div className={cn(
          "flex flex-col md:flex-row gap-8",
          hasImage ? "md:items-center" : "items-center"
        )}>
          {/* Text Content */}
          <div className={cn(
            "flex flex-col space-y-6",
            hasImage ? "md:w-1/2" : "w-full max-w-2xl mx-auto",
            contentAlignment
          )}>
            <h2
              className={cn("text-3xl font-bold tracking-tighter sm:text-4xl")}
              style={{ color: module.textColor || "inherit" }}
            >
              {module.title}
            </h2>

            {cleanDescription && (
              <div
                className={cn("md:text-xl prose prose-invert max-w-none")}
                style={{ color: module.textColor ? `${module.textColor}/90` : "inherit" }}
                dangerouslySetInnerHTML={{ __html: cleanDescription }}
              />
            )}

            {/* Buttons */}
            {module.buttons && module.buttons.length > 0 && (
              <div className="flex flex-wrap gap-4">
                {module.buttons.map((button, index) => (
                  <Button
                    key={index}
                    size="lg"
                    variant={button.style === 'secondary' ? 'secondary' : 'primary'}
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

          {/* Featured Image */}
          {hasImage && (
            <div className="md:w-1/2">
              <div className="relative rounded-lg overflow-hidden aspect-video">
                <OptimizedImage
                  src={module.featured_image}
                  alt={module.title}
                  fill={true}
                  className="object-cover"
                  containerType="featured"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}