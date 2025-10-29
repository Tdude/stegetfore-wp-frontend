// src/components/tryggve/TryggveSolutionSection.tsx
'use client';

import React from 'react';
import { TryggveSolutionSection } from '@/lib/types/tryggveLandingTypes';
import { cn } from '@/lib/utils';

interface TryggveSolutionSectionProps {
  data: TryggveSolutionSection;
  className?: string;
}

export default function TryggveSolutionSectionComponent({ 
  data, 
  className 
}: TryggveSolutionSectionProps) {
  return (
    <section className={cn("py-16 md:py-24 bg-white", className)}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold font-heading text-center mb-6 text-black">
            {data.title}
          </h2>
          <p className="text-lg md:text-xl text-center mb-12 text-gray-800 max-w-3xl mx-auto">
            {data.description}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {data.features.map((feature, index) => (
              <div 
                key={index} 
                className="bg-gray-50 rounded-lg p-8 shadow-custom border border-gray-200 hover:shadow-lg transition-all hover:-translate-y-1"
              >
                <h3 className="text-xl font-bold font-heading mb-3 text-center text-black">
                  {feature.title}
                </h3>
                <p className="text-gray-800 text-center">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
