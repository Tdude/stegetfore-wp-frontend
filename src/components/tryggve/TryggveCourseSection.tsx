// src/components/tryggve/TryggveCourseSection.tsx
'use client';

import React from 'react';
import { TryggveCourseSection } from '@/lib/types/tryggveLandingTypes';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TryggveCourseSectionProps {
  data: TryggveCourseSection;
  className?: string;
  id?: string;
}

export default function TryggveCourseSectionComponent({ 
  data, 
  className,
  id
}: TryggveCourseSectionProps) {
  return (
    <section id={id} className={cn("py-16 md:py-24 bg-gray-50", className)}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold font-heading text-center mb-6 text-black">
            {data.title}
          </h2>
          <p className="text-lg md:text-xl text-center mb-12 text-gray-800">
            {data.description}
          </p>

          <div className="bg-white rounded-lg p-8 md:p-12 shadow-custom border border-gray-200">
            <h3 className="text-2xl font-bold font-heading mb-6 text-black">
              Under kursen får du:
            </h3>
            <ul className="space-y-4 mb-8">
              {data.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="flex-shrink-0 text-black font-bold text-xl mt-0.5">
                    ✓
                  </span>
                  <span className="text-gray-800 text-lg">{benefit}</span>
                </li>
              ))}
            </ul>

            <div className="text-center pt-6">
              <Button
                size="lg"
                variant={data.ctaButton.style || 'primary'}
                className="w-full md:w-auto text-base md:text-lg px-6 md:px-10"
                asChild
              >
                <a
                  href={data.ctaButton.url}
                  target={data.ctaButton.newTab ? '_blank' : '_self'}
                  rel="noopener noreferrer"
                >
                  {data.ctaButton.text}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
