// src/components/tryggve/TryggveClosingSection.tsx
'use client';

import React from 'react';
import { TryggveClosingSection } from '@/lib/types/tryggveLandingTypes';
import { cn } from '@/lib/utils';

interface TryggveClosingSectionProps {
  data: TryggveClosingSection;
  className?: string;
}

export default function TryggveClosingSectionComponent({ 
  data, 
  className 
}: TryggveClosingSectionProps) {
  return (
    <section className={cn("py-16 md:py-24 bg-gray-50", className)}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <blockquote className="text-2xl md:text-3xl font-medium italic text-black mb-6">
            &ldquo;{data.quote}&rdquo;
          </blockquote>
          <p className="text-lg text-gray-800 font-medium">
            – {data.author}
          </p>
        </div>
      </div>
    </section>
  );
}
