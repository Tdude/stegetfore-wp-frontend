// src/components/templates/ContactFormTemplate.tsx
'use client';

import React from 'react';
import Page from '@/lib/types';
import TemplateTransitionWrapper from './TemplateTransitionWrapper';
import ContactForm from './ContactForm';
import { Card, CardContent } from "@/components/ui/card";

interface ContactFormTemplateProps {
  page: Page;
}

export default function ContactFormTemplate({ page }: ContactFormTemplateProps) {
  const featuredImage = page._embedded?.['wp:featuredmedia']?.[0]?.source_url;

  return (
    <TemplateTransitionWrapper>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {featuredImage && (
            <img
              src={featuredImage}
              alt={page.title.rendered}
              className="w-full h-64 object-cover rounded-lg mb-8"
            />
          )}

          <h1 className="text-4xl font-bold mb-6 text-center">
            <div dangerouslySetInnerHTML={{ __html: page.title.rendered }} />
          </h1>

          {page.content.rendered && (
            <Card className="mb-12">
              <CardContent className="pt-6">
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: page.content.rendered }}
                />
              </CardContent>
            </Card>
          )}

          <ContactForm />
        </div>
      </div>
    </TemplateTransitionWrapper>
  );
}