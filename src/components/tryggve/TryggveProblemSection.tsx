// src/components/tryggve/TryggveProblemSection.tsx
'use client';

import React from 'react';
import { TryggveProblemSection } from '@/lib/types/tryggveLandingTypes';
import { cn } from '@/lib/utils';
import CountdownClock from './CountdownClock';

interface TryggveProblemSectionProps {
  data: TryggveProblemSection;
  className?: string;
}

export default function TryggveProblemSectionComponent({ 
  data, 
  className 
}: TryggveProblemSectionProps) {
  return (
    <section className={cn("py-16 md:py-24 bg-gray-50", className)}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold font-heading text-center mb-6 text-black">
            {data.title}
          </h2>
          <p className="text-lg md:text-xl text-center mb-12 text-gray-800 max-w-3xl mx-auto">
            {data.description}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {data.statistics.map((stat, index) => (
              <div 
                key={index} 
                className="bg-white rounded-lg p-8 text-center shadow-custom border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="text-4xl md:text-5xl font-bold font-heading text-primary mb-3">
                  {stat.value}
                </div>
                <div className="text-gray-800 text-lg">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <div className="flex flex-col items-center gap-6 mb-8">
              <CountdownClock />
            </div>
            <p className="text-xl md:text-2xl font-medium text-black italic">
              {data.closingText}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
