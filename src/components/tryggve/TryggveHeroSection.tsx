// src/components/tryggve/TryggveHeroSection.tsx
'use client';

import React from 'react';
import { TryggveHeroSection } from '@/lib/types/tryggveLandingTypes';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TryggveHeroSectionProps {
  data: TryggveHeroSection;
  className?: string;
}

export default function TryggveHeroSectionComponent({ data, className }: TryggveHeroSectionProps) {
  return (
    <section
      className={cn(
        "relative w-full min-h-[70vh] flex items-center justify-center overflow-hidden bg-background",
        className
      )}
      style={data.backgroundColor ? { backgroundColor: data.backgroundColor } : undefined}
    >
      {data.backgroundImage && (
        <div className="absolute inset-0 w-full h-full">
          <img
            src={data.backgroundImage}
            alt="Hero background"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="relative z-10 container mx-auto px-4 md:px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading tracking-tight mb-6 text-black">
            {data.title}
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-gray-800">
            {data.subtitle}
          </p>
          {data.buttons && data.buttons.length > 0 && (
            <div className="flex flex-wrap gap-4 justify-center">
              {data.buttons.map((button, index) => (
                <Button
                  key={index}
                  size="lg"
                  variant={button.style || 'primary'}
                  asChild
                >
                  <a
                    href={button.url}
                    target={button.newTab ? '_blank' : '_self'}
                    rel="noopener noreferrer"
                  >
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
