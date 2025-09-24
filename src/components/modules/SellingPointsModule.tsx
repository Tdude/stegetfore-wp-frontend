// src/components/modules/SellingPointsModule.tsx
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from '@/lib/utils';
import * as LucideIcons from "lucide-react";
import Image from 'next/image';

interface SellingPointsModule {
  title?: string;
  layout?: string;
  backgroundColor?: string;
  points: Array<{
    id?: string | number;
    title: string;
    description: string;
    icon?: string;
  }>;
  columns?: number;
  type: 'selling_points';
}

interface SellingPointsModuleProps {
  module: SellingPointsModule;
  className?: string;
}

const defaultIcons = [
  '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>', // shield
  '<path d="M20 7h-8V3H6v4H2v14h20V7zM8 5h2v2H8V5z"/>', // briefcase
  '<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>', // layers
  '<path d="M3 12h18M3 6h18M3 18h18"/>', // menu
  '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>', // Alert
  '<polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon><line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line>', // Map
  '<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>', // Clock
  '<polyline points="20 6 9 17 4 12"></polyline>' // Check
];

const layoutClasses = {
  grid: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  list: 'grid-cols-1',
  carousel: '',
};

export default function SellingPointsModule({ module, className }: SellingPointsModuleProps) {
  // Get columns count
  const columns = module.columns || 3;
  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  // Get layout
  const layout = module.layout || 'grid';

  // Helper to convert kebab/lowercase to PascalCase (lucide expects e.g. Check, Briefcase)
  function toPascalCase(str: string) {
    return str
      .replace(/(^|[-_\s])(\w)/g, (_, __, c) => c ? c.toUpperCase() : '')
      .replace(/[^a-zA-Z0-9]/g, '');
  }

  // Helper to render Lucide icon by key
  const renderIcon = (iconKey: string | undefined, fallbackIndex: number) => {
    if (iconKey) {
      // If it's a .svg file, render as <img> (for the next step)
      if (iconKey.endsWith('.svg')) {
        return (
          <Image 
            src={`/images/icons/${iconKey}`}
            alt={iconKey.replace(/\.svg$/, '')}
            width={28}
            height={28}
            style={{ display: 'inline-block' }}
          />
        );
      }
      // Try Lucide icon (convert key to PascalCase)
      const pascalKey = toPascalCase(iconKey);
      if (pascalKey in LucideIcons) {
        const LucideIcon = LucideIcons[pascalKey] as React.ComponentType<{ size?: number, color?: string }>;
        return <LucideIcon size={28} color="currentColor" />;
      }
      // fallback to SVG string if present (legacy)
      if (iconKey.startsWith('<')) {
        return (
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
            dangerouslySetInnerHTML={{ __html: iconKey }}
          />
        );
      }
    }
    // fallback to default SVG string
    return (
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
        dangerouslySetInnerHTML={{ __html: defaultIcons[fallbackIndex % defaultIcons.length] }}
      />
    );
  };

  return (
    <section className={cn("py-12", className)} style={{ backgroundColor: module.backgroundColor || "#eeeeee" }}>
      <div className="container px-4 md:px-6 mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold tracking-tight mb-4">
            {module.title}
          </h2>
          <div className="w-24 h-1 bg-primary mx-auto"></div>
        </div>

        {module.points?.length > 0 && (
          <div
            className={cn(
              layout === 'carousel'
                ? "flex overflow-x-auto gap-6 pb-4 snap-x"
                : `grid gap-6 ${layout === 'grid' ? columnClasses[columns as keyof typeof columnClasses] : layoutClasses[layout as keyof typeof layoutClasses] || layoutClasses.grid}`
            )}
          >
            {module.points.map((point, index) => (
              <div
                key={point.id || index}
                className={cn(
                  "block h-full",
                  layout === 'carousel' ? 'min-w-[300px] sm:min-w-[350px] snap-center' : '',
                  layout === 'left' ? 'text-left' : layout === 'center' ? 'text-center' : layout === 'right' ? 'text-right' : ''
                )}
              >
                <Card className="h-full overflow-hidden">
                  <CardHeader className="pb-4 flex items-center">
                    <div className="w-16 h-16 flex items-center justify-center rounded-full bg-primary/10 text-primary mb-6">
                      {renderIcon(point.icon, index)}
                    </div>
                    <CardTitle className="text-2xl font-bold text-center">{point.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 flex-grow">
                    <p className="text-secondary text-lg">{point.description}</p>
                  </CardContent>

                  {/* Golden ratio decorative element */}
                  <div className="absolute -bottom-1 -right-1 w-12 h-8 border-b-2 border-r-2 border-primary/20 rounded-br-md opacity-50"></div>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}