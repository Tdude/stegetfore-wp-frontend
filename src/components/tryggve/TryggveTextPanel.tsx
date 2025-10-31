// src/components/tryggve/TryggveTextPanel.tsx
'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface TryggveTextPanelProps {
  title?: string;
  content: string;
  className?: string;
}

export default function TryggveTextPanel({ 
  title, 
  content, 
  className 
}: TryggveTextPanelProps) {
  return (
    <section className={cn("py-16 md:py-24 bg-surface-primary", className)}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg p-8 md:p-12 shadow-custom border border-gray-200">
            {title && (
              <h2 className="text-2xl md:text-3xl font-bold font-heading mb-6 text-black">
                {title}
              </h2>
            )}
            <div 
              className="text-gray-800 text-lg leading-relaxed text-left space-y-4"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
