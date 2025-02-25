// src/components/homepage/HeroSection.tsx
import React from 'react';
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  title: string;
  intro: string;
  imageUrl: string | string[] | null | false;
  ctaButtons: Array<{
    text: string;
    url: string;
    style: 'primary' | 'secondary' | 'outline';
  }>;
}

export default function HeroSection({
  title,
  intro,
  imageUrl,
  ctaButtons = []
}: HeroSectionProps) {
  // Handle different possible formats of imageUrl
  let finalImageUrl = '';

  if (typeof imageUrl === 'string') {
    finalImageUrl = imageUrl;
  } else if (Array.isArray(imageUrl) && imageUrl.length > 0) {
    finalImageUrl = imageUrl[0];
  } else {
    // Fallback image
    finalImageUrl = '/images/hero-fallback.jpg';
  }

  return (
    <section className="relative w-full h-[80vh] min-h-[500px] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full">
        <img
          src={finalImageUrl}
          alt="Hero background"
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback if image fails to load
            e.currentTarget.src = '/images/hero-fallback.jpg';
          }}
        />
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
                  variant={button.style === 'outline' ? 'outline' : button.style === 'secondary' ? 'secondary' : 'default'}
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