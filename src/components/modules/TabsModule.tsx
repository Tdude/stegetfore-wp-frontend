// src/components/modules/TabsModule.tsx
'use client';

import React, { useRef, useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { TabsModule } from "@/lib/types/";
import { cn } from '@/lib/utils';
import Image from 'next/image';

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

  const tabContentRefs = useRef<(HTMLDivElement | null)[]>([]);
  const contentWrapperRef = useRef<HTMLDivElement | null>(null);
  const [contentMinHeight, setContentMinHeight] = useState<string | undefined>(undefined);

  useEffect(() => {
    // On mount, measure the tallest tab content
    if (tabContentRefs.current && tabContentRefs.current.length > 0) {
      const heights = tabContentRefs.current.map(ref => ref?.offsetHeight || 0);
      const max = Math.max(...heights);
      if (max > 0) setContentMinHeight(`${max}px`);
    }
  }, [module.tabs]);

  return (
    <section
        className={cn("py-12", "bg-primary", className)}
        style={{ backgroundColor: module.backgroundColor }}
      >
      <div className="container px-4 md:px-6 mx-auto">
        <div className="max-w-4xl mx-auto">
          {module.title && (
            <h2 className="text-4xl font-bold text-center mb-8">{module.title}</h2>
          )}

          {/* Layout logic */}
          {module.layout === 'vertical' ? (
            <Tabs defaultValue={defaultTab} orientation="vertical" className="w-full flex md:flex-row flex-col">
              <TabsList className="w-full md:w-1/3 flex-col space-y-2 bg-transparent p-0 border-none">
                {module.tabs && module.tabs.length > 0 && module.tabs.map((tab, index) => (
                  <TabsTrigger
                    key={tab.id || index}
                    value={`tab-${index}`}
                    className="justify-start w-full text-left bg-transparent whitespace-pre-line break-words px-4 py-2 min-h-[48px]"
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
              <div
                ref={contentWrapperRef}
                style={{ minHeight: contentMinHeight, transition: 'min-height 0.3s' }}
                className={cn(
                  "transition-all duration-300 w-full",
                  module.tabs && module.tabs.some(tab => tab.image) ? "md:w-[68%]" : "md:w-2/3"
                )}
              >
                {module.tabs && module.tabs.length > 0 && module.tabs.map((tab, index) => (
                  <TabsContent
                    key={tab.id || index}
                    value={`tab-${index}`}
                    className="prose max-w-none min-h-[300px]"
                    ref={el => { tabContentRefs.current[index] = el; }}
                  >
                    {tab.image && (
                      <div className={`flex flex-col md:flex-row ${tab.imageAlign === 'right' ? 'md:flex-row-reverse' : ''} items-center gap-6`}>
                        <Image
                          src={tab.image}
                          alt={tab.title}
                          className="mb-4 md:mb-0 rounded max-w-full h-auto md:w-1/2"
                          style={{ maxHeight: '200px', objectFit: 'contain' }}
                          width={400}
                          height={200}
                          unoptimized={true}
                        />
                        <div
                          className="p-4 rounded-md mt-2 md:mt-0 md:w-1/2"
                          dangerouslySetInnerHTML={{ __html: cleanContent(tab.content) }}
                        />
                      </div>
                    )}
                    {!tab.image && (
                      <div
                        className="p-4 rounded-md mt-2"
                        dangerouslySetInnerHTML={{ __html: cleanContent(tab.content) }}
                      />
                    )}
                  </TabsContent>
                ))}
              </div>
            </Tabs>
          ) : (
            // Horizontal (default) layout
            <Tabs defaultValue={defaultTab} className="w-full">
              <TabsList className={cn(
                "w-full mb-8",
                module.layout === 'vertical' ? 'flex-col space-y-1' : 'flex-row'
              )}>
                {module.tabs && module.tabs.length > 0 && module.tabs.map((tab, index) => (
                  <TabsTrigger
                    key={tab.id || index}
                    value={`tab-${index}`}
                    className={module.layout === 'vertical' ? 'justify-start' : ''}
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

              {module.tabs && module.tabs.length > 0 && module.tabs.map((tab, index) => (
                <TabsContent
                  key={tab.id || index}
                  value={`tab-${index}`}
                  className={cn(
                    "prose max-w-none",
                    "transition-opacity duration-500",
                    "opacity-0 data-[state=active]:opacity-100",
                  )}
                  ref={el => { tabContentRefs.current[index] = el; }}
                >
                  {tab.image && (
                    <div className={`flex flex-col md:flex-row ${tab.imageAlign === 'right' ? 'md:flex-row-reverse' : ''} items-center gap-6`}>
                      <Image
                        src={tab.image}
                        alt={tab.title}
                        className="mb-4 md:mb-0 rounded max-w-full h-auto md:w-1/2"
                        style={{ maxHeight: '200px', objectFit: 'contain' }}
                        width={400}
                        height={200}
                        unoptimized={true}
                      />
                      <div
                        className="p-4 rounded-md mt-2 md:mt-0 md:w-1/2"
                        dangerouslySetInnerHTML={{ __html: cleanContent(tab.content) }}
                      />
                    </div>
                  )}
                  {!tab.image && (
                    <div
                      className="p-4 rounded-md mt-2"
                      dangerouslySetInnerHTML={{ __html: cleanContent(tab.content) }}
                    />
                  )}
                </TabsContent>
              ))}
            </Tabs>
          )}
        </div>
      </div>
    </section>
  );
}