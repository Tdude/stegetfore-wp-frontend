// src/components/homepage/TestimonialsSection.tsx
'use client';

import React from 'react';
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
import { TestimonialsSectionProps } from '@/lib/types';

export default function TestimonialsSection({
  testimonials,
  title
}: TestimonialsSectionProps) {
  // Client-side only rendering for HTML content
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render if there are no testimonials
  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  if (!mounted) {
    // Skeleton loader for server-side rendering
    return (
      <section className="py-16 bg-background">
        <div className="container px-4 md:px-6 mx-auto">
          <h2 className="text-3xl font-bold tracking-tighter text-center mb-12">
            {title}
          </h2>
          <div className="w-full max-w-4xl mx-auto">
            <div className="bg-muted/30 rounded-lg h-64 animate-pulse flex items-center justify-center">
              <p className="text-muted-foreground">Loading testimonials...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-background">
      <div className="container px-4 md:px-6 mx-auto">
        <h2 className="text-3xl font-bold tracking-tighter text-center mb-12">
          {title}
        </h2>

        <Carousel className="w-full max-w-4xl mx-auto">
          <CarouselContent>
            {testimonials.map((testimonial) => (
              <CarouselItem key={testimonial.id}>
                <Card className="border-0 shadow-none">
                  <CardContent className="pt-6">
                    <div
                      className="text-l text-muted-foreground mb-4"
                      dangerouslySetInnerHTML={{ __html: testimonial.content }}
                    />
                  </CardContent>
                  <CardFooter className="flex items-center gap-4 pt-0">
                    <Avatar className="m-2 h-10 w-10">
                      {testimonial.author_image ? (
                        <AvatarImage src={testimonial.author_image} alt={testimonial.author_name} />
                      ) : (
                        <AvatarFallback>{testimonial.author_name.charAt(0)}</AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <p className="font-medium">{testimonial.author_name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.author_position}</p>
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