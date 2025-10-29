// src/components/tryggve/TryggveTargetAudienceSection.tsx
'use client';

import React from 'react';
import { TryggveTargetAudienceSection } from '@/lib/types/tryggveLandingTypes';
import { cn } from '@/lib/utils';

interface TryggveTargetAudienceSectionProps {
  data: TryggveTargetAudienceSection;
  className?: string;
}

export default function TryggveTargetAudienceSectionComponent({ 
  data, 
  className 
}: TryggveTargetAudienceSectionProps) {
  return (
    <section className={cn("py-16 md:py-24 bg-surface-primary", className)}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold font-heading text-center mb-6 text-black">
            {data.title}
          </h2>
          <p className="text-lg md:text-xl text-center mb-12 text-gray-800">
            {data.description}
          </p>

          <div className="bg-white rounded-lg p-8 md:p-12 shadow-custom border border-gray-200">
            <ul className="space-y-4 mb-8">
              {data.points.map((point, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="flex-shrink-0 text-black font-bold text-xl mt-0.5">
                    ✓
                  </span>
                  <span className="text-gray-800 text-lg">{point}</span>
                </li>
              ))}
            </ul>

            {data.testimonial && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <blockquote className="italic text-gray-700 text-lg mb-4 pl-4 border-l-4 border-gray-300">
                  &ldquo;{data.testimonial.quote}&rdquo;
                </blockquote>
                <p className="text-gray-800 font-medium">
                  — {data.testimonial.author}
                  {data.testimonial.role && (
                    <span className="text-gray-600">, {data.testimonial.role}</span>
                  )}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
