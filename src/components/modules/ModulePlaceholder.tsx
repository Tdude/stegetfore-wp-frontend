// src/components/modules/ModulePlaceholder.tsx
'use client';

import React from 'react';
import { cn } from "@/lib/utils";

interface ModulePlaceholderProps {
  type: string;
  className?: string;
}

export default function ModulePlaceholder({ type, className }: ModulePlaceholderProps) {
  // Generate different placeholder layouts based on module type
  const renderPlaceholder = () => {
    switch (type) {
      case 'hero':
        return (
          <div className="w-full aspect-[21/9]">
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="flex space-x-4">
              </div>
            </div>
          </div>
        );

      case 'text':
        return (
          <div className="py-12 px-4 space-y-4">
          </div>
        );

      case 'featured-posts':
        return (
          <div className="py-12 px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-3">
                </div>
              ))}
            </div>
          </div>
        );

      case 'selling-points':
        return (
          <div className="py-12 px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-3 p-6 border rounded-lg">
                  <div className="flex justify-center">
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'cta':
        return (
          <div className="py-16 px-4 bg-primary/10">
            <div className="max-w-2xl mx-auto text-center space-y-4">
              <div className="pt-4">
              </div>
            </div>
          </div>
        );

      // Default placeholder for any other module type
      default:
        return (
          <div className="py-8 px-4">
          </div>
        );
    }
  };

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {renderPlaceholder()}
      <div className="absolute bottom-2 right-2 bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded opacity-75">
        Loading {type} module...
      </div>
    </div>
  );
}