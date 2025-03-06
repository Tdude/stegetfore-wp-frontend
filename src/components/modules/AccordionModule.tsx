// src/components/modules/AccordionModule.tsx
'use client';

import React, { useState } from 'react';
import { AccordionModule as AccordionModuleType } from '@/lib/types';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from '@/lib/utils';

interface AccordionModuleProps {
  module: AccordionModuleType;
  className?: string;
}

export default function AccordionModule({ module, className }: AccordionModuleProps) {
  // Determine which item should be open by default
  const defaultValue = module.default_open_index !== undefined && module.items[module.default_open_index]
    ? `item-${module.default_open_index}`
    : undefined;

  // For multiple open items, we need to track state
  const [openItems, setOpenItems] = useState<string[]>(
    defaultValue ? [defaultValue] : []
  );

  // Handle item toggle for multiple open mode
  const toggleItem = (value: string) => {
    if (module.allow_multiple_open) {
      setOpenItems(prevItems =>
        prevItems.includes(value)
          ? prevItems.filter(item => item !== value)
          : [...prevItems, value]
      );
    }
  };

  return (
    <section className={cn("py-12", className)}>
      <div className="container px-4 md:px-6 mx-auto">
        <div className="max-w-3xl mx-auto">
          {module.title && (
            <h2 className="text-3xl font-bold text-center mb-8">{module.title}</h2>
          )}

          {module.allow_multiple_open ? (
            <Accordion
              type="multiple"
              value={openItems}
              onValueChange={setOpenItems}
              className="w-full"
            >
              {module.items.map((item, index) => (
                <AccordionItem key={item.id || index} value={`item-${index}`}>
                  <AccordionTrigger>{item.title}</AccordionTrigger>
                  <AccordionContent>
                    <div dangerouslySetInnerHTML={{ __html: item.content }} />
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
              {module.items.map((item, index) => (
                <AccordionItem key={item.id || index} value={`item-${index}`}>
                  <AccordionTrigger>{item.title}</AccordionTrigger>
                  <AccordionContent>
                    <div dangerouslySetInnerHTML={{ __html: item.content }} />
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