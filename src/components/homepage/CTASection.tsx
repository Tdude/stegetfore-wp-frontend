// src/components/homepage/CTASection.tsx
import React from 'react';
import { Button } from "@/components/ui/button";

interface CTASectionProps {
  title: string;
  description: string;
  buttonText: string;
  buttonUrl: string;
  backgroundColor?: string;
}

export default function CTASection({
  title,
  description,
  buttonText,
  buttonUrl,
  backgroundColor = 'bg-primary',
}: CTASectionProps) {
  return (
    <section className={`py-16 ${backgroundColor}`}>
      <div className="container px-4 md:px-6 text-center mx-auto">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-3xl font-bold tracking-tighter text-primary-foreground sm:text-4xl">
            {title}
          </h2>
          <p className="text-primary-foreground/90 md:text-xl">
            {description}
          </p>
          <Button size="lg" asChild className="mt-4">
            <a href={buttonUrl}>{buttonText}</a>
          </Button>
        </div>
      </div>
    </section>
  );
}