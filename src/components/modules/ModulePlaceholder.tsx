// src/components/modules/ModulePlaceholder.tsx
'use client';

import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";
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
            <Skeleton className="w-full h-full" />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Skeleton className="h-10 w-1/3 mb-4" />
              <Skeleton className="h-4 w-1/2 mb-6" />
              <div className="flex space-x-4">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
          </div>
        );

      case 'text':
        return (
          <div className="py-12 px-4 space-y-4">
            <Skeleton className="h-8 w-1/3 mx-auto" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        );

      case 'featured-posts':
        return (
          <div className="py-12 px-4">
            <Skeleton className="h-8 w-1/3 mb-8 mx-auto" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="w-full aspect-video rounded-lg" />
                  <Skeleton className="h-6 w-2/3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          </div>
        );

      case 'selling-points':
        return (
          <div className="py-12 px-4">
            <Skeleton className="h-8 w-1/3 mb-8 mx-auto" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-3 p-6 border rounded-lg">
                  <div className="flex justify-center">
                    <Skeleton className="h-16 w-16 rounded-full" />
                  </div>
                  <Skeleton className="h-6 w-2/3 mx-auto" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5 mx-auto" />
                </div>
              ))}
            </div>
          </div>
        );

      case 'cta':
        return (
          <div className="py-16 px-4 bg-primary/10">
            <div className="max-w-2xl mx-auto text-center space-y-4">
              <Skeleton className="h-8 w-2/3 mx-auto" />
              <Skeleton className="h-4 w-4/5 mx-auto" />
              <div className="pt-4">
                <Skeleton className="h-10 w-32 mx-auto" />
              </div>
            </div>
          </div>
        );

      // Default placeholder for any other module type
      default:
        return (
          <div className="py-8 px-4">
            <Skeleton className="h-6 w-1/4 mb-4" />
            <Skeleton className="h-32 w-full rounded-lg" />
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