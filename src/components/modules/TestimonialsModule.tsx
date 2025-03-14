// src/components/modules/TestimonialsModule.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { TestimonialsModule as TestimonialsModuleType } from '@/lib/types';
import {
  Card,
  CardContent,
  CardFooter
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "@/components/ui/carousel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from '@/lib/utils';

interface TestimonialsModuleProps {
  module: TestimonialsModuleType;
  className?: string;
}

export default function TestimonialsModule({ module, className }: TestimonialsModuleProps) {
  const [mounted, setMounted] = useState(false);

  // Client-side only rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  // Loading state (SSR or initial client render)
  if (!mounted) {
    return (
      <section className={cn("py-16 bg-background", className)}>
        <div className="container px-4 md:px-6 mx-auto">
          {module.title && (
            <h2 className="text-3xl font-bold tracking-tighter text-center mb-12">
              {module.title}
            </h2>
          )}
          <div className="w-full max-w-4xl mx-auto">
            <div className="bg-muted/30 rounded-lg h-64 animate-pulse flex items-center justify-center">
              <p className="text-muted-foreground">Loading testimonials...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // If no testimonials to display
  if (!Array.isArray(module.testimonials) || module.testimonials.length === 0) {
    return (
      <section className={cn("py-16 bg-background", className)}
      style={{ backgroundColor: module.backgroundColor || "#f5f9de" }}
      >
        <div className="container px-4 md:px-6 mx-auto">
          {module.title && (
            <h2 className="text-3xl font-bold tracking-tighter text-center mb-12">
              {module.title}
            </h2>
          )}
          <div className="w-full max-w-4xl mx-auto">
            <Card className="text-center p-6">
              <p className="text-muted-foreground">No testimonials available</p>
            </Card>
          </div>
        </div>
      </section>
    );
  }

  // Display as carousel (default)
  return (
    <section className={cn("py-16 bg-background", className)}
    style={{ backgroundColor: module.backgroundColor || "#f5f9de" }}
    >
      <div className="container px-4 md:px-6 mx-auto">
        {module.title && (
          <h2 className="text-3xl font-bold tracking-tighter text-center mb-12">
            {module.title}
          </h2>
        )}

        <Carousel className="w-full max-w-4xl mx-auto">
          <CarouselContent>
            {module.testimonials.map((testimonial, index) => (
              <CarouselItem key={testimonial.id || index}>
                <Card className="border-0 shadow-none">
                  <CardContent className="pt-6">
                    <div
                      className="text-lg text-muted-foreground mb-4"
                      dangerouslySetInnerHTML={{ __html: testimonial.content }}
                    />
                  </CardContent>
                  <CardFooter className="flex items-center gap-4 pt-0">
                    <Avatar className="m-2 h-10 w-10">
                      {testimonial.author_image ? (
                        <AvatarImage src={testimonial.author_image} alt={testimonial.author_name} />
                      ) : (
                        <AvatarFallback>{testimonial.author_name?.[0] || 'A'}</AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <p className="font-medium">{testimonial.author_name || 'Anonymous'}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.author_position || ''}</p>
                    </div>
                  </CardFooter>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-0 -translate-x-1/2" />
          <CarouselNext className="right-0 translate-x-1/2" />
        </Carousel>
      </div>
    </section>
  );
}