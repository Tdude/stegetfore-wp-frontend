// src/components/modules/AccordionModule.tsx
'use client';

import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { AccordionFaqModule } from '@/lib/types';
import { cn } from '@/lib/utils';


interface AccordionModuleProps {
  module: AccordionFaqModule;
  className?: string;
}


export default function AccordionModule({ module, className }: AccordionModuleProps) {
  // Determine which item should be open by default
  const defaultValue = module.default_open_index !== undefined && module.items[module.default_open_index]
    ? `item-${module.default_open_index}`
    : undefined;

  // Clean WordPress content
  const cleanContent = (content: string): string => {
    if (!content) return '';
    return content.replace(/<!--[\s\S]*?-->/g, '')
      .replace(/<p>([\s\S]*?)<\/p>/g, '$1')
      .trim();
  };

  // Apply special styling for FAQ type if needed
  const isFaq = module.type === 'faq';
  const moduleClass = isFaq ? 'faq-module' : '';

  return (
      <section
        className={cn("py-16",className, moduleClass )}
        style={{ backgroundColor: module.backgroundColor || "#f5f9de" }}
      >
      <div className="container px-4 md:px-6 mx-auto">
        <div className="max-w-3xl mx-auto p-4 m-2">
          {module.title && (
            <h2 className="text-3xl font-bold text-center mb-8">{module.title}</h2>
          )}

          {module.allow_multiple_open ? (
            <Accordion
              type="multiple"
              defaultValue={defaultValue ? [defaultValue] : []}
              className="w-full"
            >
              {Array.isArray(module.items) && module.items.map((item, index) => (
                <AccordionItem key={item?.id || index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">{item?.question || `Item ${index + 1}`}</AccordionTrigger>
                  <AccordionContent>
                    <div
                      className="prose max-w-none"
                      dangerouslySetInnerHTML={{ __html: cleanContent(item?.answer) }}
                    />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <Accordion
              type="single"
              collapsible
              defaultValue={defaultValue}
              className="w-full"
            >
              {Array.isArray(module.items) && module.items.map((item, index) => (
                <AccordionItem key={item?.id || index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">{item?.question || `Item ${index + 1}`}</AccordionTrigger>
                  <AccordionContent>
                    <div
                      className="prose max-w-none"
                      dangerouslySetInnerHTML={{ __html: cleanContent(item?.answer) }}
                    />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>
      </div>
    </section>
  );
}