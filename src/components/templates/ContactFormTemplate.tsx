// components/templates/ContactFormTemplate.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { Page } from '@/lib/types';
import TemplateTransitionWrapper from './TemplateTransitionWrapper';
import ContactForm from './ContactForm';

interface ContactFormTemplateProps {
  page: Page;
}

export default function ContactFormTemplate({
  page,
}: ContactFormTemplateProps) {
  const [mounted, setMounted] = useState(false);
  const [cleanContent, setCleanContent] = useState('');

  // Get form ID directly from the page object if available
  const getFormId = (): string => {
    // First check if it's directly available in the page object
    // @ts-ignore - cf7_form_id is added by the WordPress API? Really?
    if (page?.cf7_form_id) {
      // @ts-ignore
      return page.cf7_form_id;
    }

    // Default form ID
    return "146";
  };

  useEffect(() => {
    setMounted(true);
    console.log('📝 ContactFormTemplate mounted');

    // Clean the content by removing CF7 elements completely
    if (page?.content?.rendered) {
      let cleaned = page.content.rendered;

      // Remove CF7 elements and placeholders
      cleaned = cleaned.replace(/<div[^>]*(?:class="[^"]*wpcf7[^"]*"|id="[^"]*cf7[^"]*")[^>]*>[\s\S]*?<\/div>/g, '');
      cleaned = cleaned.replace(/\[contact-form-7[^\]]*\]/g, '');
      cleaned = cleaned.replace(/\[headless-cf7[^\]]*\]/g, '');

      setCleanContent(cleaned);
    }
  }, [page]);

  // Get form ID - simple and direct approach
  const formId = mounted ? getFormId() : "146";

  return (
    <TemplateTransitionWrapper>
      <div className="min-h-screen">
        {/* Page Title */}
        <div className="bg-gray-100 py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold" suppressHydrationWarning>
              {page?.title?.rendered || "Kontakta oss"}
            </h1>
          </div>
        </div>

        {/* Contact Form - use the new ContactForm component */}
        <div className="mt-12">
          <ContactForm formId={formId} />
        </div>

        {/* Additional Page Content (if any) */}
        {cleanContent && mounted && (
          <section className="container mx-auto px-4 py-12">
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: cleanContent }}
            />
          </section>
        )}
      </div>
    </TemplateTransitionWrapper>
  );
}