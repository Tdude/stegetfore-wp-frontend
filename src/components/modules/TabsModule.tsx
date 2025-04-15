// src/components/modules/TabsModule.tsx
'use client';

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { TabsModule } from "@/lib/types/";
import { cn } from '@/lib/utils';


interface TabsModuleProps {
  module: TabsModule;
  className?: string;
}

export default function TabsModule({ module, className }: TabsModuleProps) {
  // Determine default tab
  const defaultTab = module.default_tab_index !== undefined && module.tabs[module.default_tab_index]
    ? `tab-${module.default_tab_index}`
    : `tab-0`;

  // Clean content from WordPress comments and markup
  const cleanContent = (content: string): string => {
    // Check if content is undefined or null
    if (!content) return '';

    // Remove WordPress comments
    return content.replace(/<!--[\s\S]*?-->/g, '')
      // Remove unnecessary paragraph tags that WP adds
      .replace(/<p>([\s\S]*?)<\/p>/g, '$1')
      // Preserve line breaks
      .trim();
  };

  return (
    <section
        className={cn("py-12", "bg-primary", className)}
        style={{ backgroundColor: module.backgroundColor }}
      >
      <div className="container px-4 md:px-6 mx-auto">
        <div className="max-w-4xl mx-auto">
          {module.title && (
            <h2 className="text-3xl font-bold text-center mb-8">{module.title}</h2>
          )}

          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className={cn(
              "w-full mb-8",
              module.orientation === 'vertical' ? 'flex-col space-y-1' : 'flex-row'
            )}>
              {module.tabs.map((tab, index) => (
                <TabsTrigger
                  key={tab.id || index}
                  value={`tab-${index}`}
                  className={module.orientation === 'vertical' ? 'justify-start' : ''}
                >
                  {tab.icon && (
                    <span
                      className="mr-2"
                      dangerouslySetInnerHTML={{ __html: tab.icon }}
                    />
                  )}
                  {tab.title}
                </TabsTrigger>
              ))}
            </TabsList>

            {module.tabs.map((tab, index) => (
              <TabsContent
                key={tab.id || index}
                value={`tab-${index}`}
                className="prose max-w-none"
              >
                <div
                  className="p-4 rounded-md mt-2"
                  dangerouslySetInnerHTML={{ __html: cleanContent(tab.content) }}
                />
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </section>
  );
}