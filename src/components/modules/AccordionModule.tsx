// src/components/modules/AccordionModule.tsx
'use client';

import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from '@/lib/utils';

// Extend interface to handle both accordion and faq module types
interface AccordionFaqModule {
  id: number;
  type: string; // Can be "accordion" or "faq"
  title?: string;
  items: Array<{
    id?: number; // Optional
    question: string;
    answer: string;
  }>;
  allow_multiple_open?: boolean;
  default_open_index?: number;
  order?: number;
  settings?: Record<string, any>;
}

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
    <section className={cn("py-12", className, moduleClass)}>
      <div className="container px-4 md:px-6 mx-auto">
        <div className="max-w-3xl mx-auto">
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