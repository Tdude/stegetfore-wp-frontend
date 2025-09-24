// src/components/modules/StatsModule.tsx
'use client';

import React from 'react';
import { StatsModule as StatsModuleType } from '@/lib/types/moduleTypes';
import { Card, CardContent } from "@/components/ui/card";
import { cn } from '@/lib/utils';

interface StatsModuleProps {
  module: StatsModuleType;
  className?: string;
}

export default function StatsModule({ module, className }: StatsModuleProps) {
  // Default icons if not provided
  const defaultIcons = [
    `<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>`, // Activity
    `<circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>`, // Award
    `<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>`, // Box
    `<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>`, // Clock
  ];

  // Get appropriate column count based on number of stats
  const getColumnCount = () => {
    const count = module.stats.length;
    if (count === 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-1 md:grid-cols-2';
    if (count === 3) return 'grid-cols-1 md:grid-cols-3';
    return 'grid-cols-2 md:grid-cols-4';
  };

  // For row layout, use flex instead of grid
  const getLayoutClass = () => {
    if (module.layout === 'row') {
      return 'flex flex-wrap justify-center gap-6';
    }
    return `grid gap-6 ${getColumnCount()}`;
  };

  return (
    <section className={cn(
      "py-16",
      module.backgroundColor || "bg-muted/30",
      className
    )}>
      <div className="container px-4 md:px-6 mx-auto">
        {(module.title || module.subtitle) && (
          <div className="text-center mb-12 max-w-3xl mx-auto">
            {module.title && (
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {module.title}
              </h2>
            )}
            {module.subtitle && (
              <p className="text-lg text-secondary">
                {module.subtitle}
              </p>
            )}
          </div>
        )}

        <div
          className={getLayoutClass()}
          style={{
            // Golden ratio - each column is approximately 1.618 times wider than it is tall
            gridTemplateRows: 'minmax(0, 1fr)',
            gridAutoRows: 'minmax(0, 1fr)'
          }}
        >
          {module.stats.map((stat, index) => (
            <Card
              key={stat.id || index}
              className={cn(
                "border-0 shadow-md bg-gradient-to-br from-background to-muted/50 hover:shadow-lg transition-all",
                module.layout === 'row' ? 'flex-1 min-w-[200px] max-w-[300px]' : ''
              )}
            >
              <CardContent className="flex flex-col items-center justify-center h-full p-6 text-center">
                {/* Icon */}
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    dangerouslySetInnerHTML={{ __html: stat.icon || defaultIcons[index % defaultIcons.length] }}
                  />
                </div>

                {/* Count with golden ratio division */}
                <div className="mb-2 relative">
                  <span className="text-4xl font-bold">{stat.value}</span>
                  {/* Decorative underline using golden ratio */}
                  <div
                    className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-primary h-1 rounded-full"
                    style={{ width: 'calc(100% / 1.618)' }} // Golden ratio
                  ></div>
                </div>

                {/* Label */}
                <p className="text-lg text-secondary mt-3">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}