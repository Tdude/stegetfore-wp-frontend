// src/components/modules/TextModule.tsx
'use client';

import React from 'react';
import { TextModule as TextModuleType } from '@/lib/types/moduleTypes';
import { cn, getModuleBackgroundStyle } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';

interface TextModuleProps {
  module: TextModuleType;
  className?: string;
}

export default function TextModule({ module, className }: TextModuleProps) {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

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

  // Determine background and text colors based on theme
  const sectionClasses = cn(
    "py-12 module-bg",
    className
  );

  // Prose styling for dark mode
  const proseClasses = cn(
    "prose max-w-none break-words",
    textSize,
    columnClasses,
    module.enable_columns ? 'gap-x-8' : '',
    isDarkMode ? "prose-dark" : ""
  );

  return (
    <section 
      className={sectionClasses}
      style={module.backgroundColor ? getModuleBackgroundStyle(module.backgroundColor) : {}}
    >
      <div className="container px-4 md:px-6 mx-auto">
        <div className={cn(
          "max-w-4xl mx-auto",
          contentAlignment,
          module.enable_columns ? 'gap-8' : '',
          isDarkMode ? "text-foreground" : ""
        )}>
          {module.title && (
            <h2 className={cn(
              "text-3xl font-bold mb-6",
              isDarkMode ? "text-foreground" : ""
            )}>
              {module.title}
            </h2>
          )}

          <div className={proseClasses}>
            <div 
              className={isDarkMode ? "text-module-content-dark" : ""}
              dangerouslySetInnerHTML={{ __html: module.content }} 
            />
          </div>
        </div>
      </div>
    </section>
  );
}