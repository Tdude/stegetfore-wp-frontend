// src/components/modules/TextModule.tsx
'use client';

import React from 'react';
import { TextModule as TextModuleType } from '@/lib/types';
import { cn } from '@/lib/utils';

interface TextModuleProps {
  module: TextModuleType;
  className?: string;
}

export default function TextModule({ module, className }: TextModuleProps) {
  // Set alignment classes
  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  const contentAlignment = alignmentClasses[module.alignment || 'left'];

  // Set text size classes
  const textSizeClasses = {
    small: 'prose-sm',
    medium: 'prose',
    large: 'prose-lg',
  };

  const textSize = textSizeClasses[module.text_size || 'medium'];

  // Handle column layout
  const columnClasses = module.enable_columns
    ? module.columns_count === 2
      ? 'md:columns-2'
      : 'md:columns-3'
    : '';

  return (
    <section className={cn("py-12", className)}>
      <div className="container px-4 md:px-6 mx-auto">
        <div className={cn(
          "max-w-4xl mx-auto",
          contentAlignment,
          module.enable_columns ? 'gap-8' : ''
        )}>
          {module.title && (
            <h2 className="text-3xl font-bold mb-6">{module.title}</h2>
          )}

          <div className={cn(
            "prose max-w-none break-words",
            textSize,
            columnClasses,
            module.enable_columns ? 'gap-x-8' : ''
          )}>
            <div dangerouslySetInnerHTML={{ __html: module.content }} />
          </div>
        </div>
      </div>
    </section>
  );
}