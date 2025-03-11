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

function stripHtml(html: string): string {
  if (!html) return '';
  // Remove WordPress comments
  const withoutComments = html.replace(/<!--[\s\S]*?-->/g, '');
  // Remove HTML tags
  return withoutComments.replace(/<[^>]*>/g, '');
}

export default function CTAModule({ module, className }: CTAModuleProps) {
  // Handle WordPress HTML content - extract plain text if needed
  const description = module.description?.includes('<!-- wp:')
    ? stripHtml(module.description)
    : module.description;

  // Set alignment classes
  const alignmentClasses = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end',
  };

  const contentAlignment = alignmentClasses[module.alignment || 'center'];

  // Determine if there's an image to adjust layout
  const hasImage = !!module.image;

  return (
    <section
      className={cn(
        "py-16",
        module.backgroundColor || "bg-primary",
        className
      )}
    >
      <div className="container px-4 md:px-6 mx-auto">
        <div className={cn(
          "flex flex-col md:flex-row gap-8",
          hasImage ? "md:items-center" : "items-center"
        )}>
          {/* Content Section */}
          <div className={cn(
            "flex flex-col space-y-6",
            hasImage ? "md:w-1/2" : "w-full max-w-2xl mx-auto",
            contentAlignment
          )}>
            <h2 className={cn(
              "text-3xl font-bold tracking-tighter sm:text-4xl",
              module.textColor || "text-primary-foreground"
            )}>
              {module.title}
            </h2>

            {module.description && (
              <p className={cn(
                "md:text-xl",
                module.textColor ? `text-[${module.textColor}]/90` : "text-primary-foreground/90"
              )}>
                {module.description}
              </p>
            )}

            {module.buttonText && module.buttonUrl && (
              <Button
                size="lg"
                asChild
                className={hasImage ? "" : "mt-4"}
                variant={module.backgroundColor === "bg-primary" ? "secondary" : "primary"}
              >
                <a href={module.buttonUrl}>{module.buttonText}</a>
              </Button>
            )}
          </div>

          {/* Optional Image */}
          {hasImage && (
            <div className="md:w-1/2">
              <div className="relative rounded-lg overflow-hidden aspect-video shadow-lg">
                <OptimizedImage
                  src={module.image}
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