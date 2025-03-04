// src/components/homepage/HeroSection.tsx
'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import OptimizedImage from "@/components/OptimizedImage";
import { HeroSectionProps } from "@/lib/types";

export default function HeroSection({
  title,
  intro,
  imageUrl,
  ctaButtons = []
}: HeroSectionProps) {
  // Handle different possible formats of imageUrl
  const finalImageUrl = React.useMemo(() => {
    if (typeof imageUrl === 'string') {
      return imageUrl;
    } else if (Array.isArray(imageUrl) && imageUrl.length > 0) {
      return imageUrl[0];
    } else {
      // Fallback image
      return '/images/hero-fallback.jpg';
    }
  }, [imageUrl]);

  return (
    <section className="relative w-full h-[80vh] min-h-[500px] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full">
        <div className="relative w-full h-full">
          <OptimizedImage
            src={finalImageUrl}
            alt={title || "Hero background"}
            fill={true}
            containerType="hero"
            priority={true}
            className="object-cover"
            fallbackSrc="/images/hero-fallback.jpg"
          />
        </div>
        {/* Overlay to improve text visibility */}
        <div className="absolute inset-0 bg-black/30"></div>
      </div>

      {/* Centered Content */}
      <div className="relative z-10 container mx-auto h-full px-4 md:px-6 flex flex-col items-center justify-center text-center">
        <div className="max-w-3xl">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tighter text-white mb-6 text-shadow-lg">
            {title}
          </h1>
          {intro && (
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto text-shadow-md">
              {intro}
            </p>
          )}
          {ctaButtons && ctaButtons.length > 0 && (
            <div className="flex flex-wrap gap-4 justify-center">
              {ctaButtons.map((button, index) => (
                <Button
                  key={index}
                  size="lg"
                  variant={button.style === 'outline' ? 'outline' : button.style === 'secondary' ? 'secondary' : 'primary'}
                  className={button.style === 'outline' ? 'bg-transparent border-white text-white hover:bg-white/20' : ''}
                  asChild
                >
                  <a href={button.url}>{button.text}</a>
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}