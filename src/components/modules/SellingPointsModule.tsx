// src/components/modules/SellingPointsModule.tsx
'use client';

import React from 'react';
import { SellingPointsModule as SellingPointsModuleType } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from '@/lib/utils';

interface SellingPointsModuleProps {
  module: SellingPointsModuleType;
  className?: string;
}

export default function SellingPointsModule({ module, className }: SellingPointsModuleProps) {
  // Define default icons when custom ones are not provided
  const defaultIcons = [
    `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>`, // Shield
    `<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>`, // Book
    `<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>`, // Alert
    `<polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon><line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line>`, // Map
    `<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>`, // Clock
    `<polyline points="20 6 9 17 4 12"></polyline>` // Check
  ];

  // Get columns count
  const columns = module.columns || 3;
  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  // Get layout
  const layoutClasses = {
    grid: columnClasses[columns as keyof typeof columnClasses],
    list: 'grid-cols-1 max-w-2xl mx-auto',
    carousel: 'flex flex-nowrap gap-6 overflow-x-auto pb-4 snap-x',
  };

  const layout = module.layout || 'grid';

  return (
<section className={cn("py-12", className)} style={{ backgroundColor: module.backgroundColor || "#eeeeee" }}>
  <div className="container px-4 md:px-6 mx-auto">
    {module.title && (
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold tracking-tight mb-4">
          {module.title}
        </h2>
        <div className="w-24 h-1 bg-primary mx-auto"></div>
      </div>
    )}

    <div
      className={cn(
        layout === 'carousel'
          ? "flex overflow-x-auto gap-6 pb-4 snap-x"
          : `grid gap-6 ${layoutClasses[layout as keyof typeof layoutClasses] || layoutClasses.grid}`
      )}
    >
      {module.points.map((point, index) => (
        <div
          key={point.id || index}
          className={cn(
            "block h-full",
            layout === 'carousel' ? 'min-w-[300px] sm:min-w-[350px] snap-center' : ''
          )}
        >
          <Card className="h-full overflow-hidden">
            <CardHeader className="pb-4 flex items-center">
              <div className="w-16 h-16 flex items-center justify-center rounded-full bg-primary/10 text-primary mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  dangerouslySetInnerHTML={{ __html: point.icon || defaultIcons[index % defaultIcons.length] }}
                />
              </div>
              <CardTitle className="text-2xl font-bold text-center">{point.title}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 flex-grow">
              {point.content ? (
                <div className="text-muted-foreground text-lg"
                  dangerouslySetInnerHTML={{ __html: point.content }} />
              ) : (
                <p className="text-muted-foreground text-lg">{point.description}</p>
              )}
            </CardContent>

            {/* Golden ratio decorative element */}
            <div className="absolute -bottom-1 -right-1 w-12 h-8 border-b-2 border-r-2 border-primary/20 rounded-br-md opacity-50"></div>
          </Card>
        </div>
      ))}
    </div>
  </div>
</section>
  );
}