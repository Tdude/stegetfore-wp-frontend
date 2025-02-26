
// src/components/templates/ContactFormTemplate.tsx
// Template to display the contact form from WPCF7
import React from 'react';
import { Page } from '@/lib/types';
import TemplateTransitionWrapper from './TemplateTransitionWrapper';
import ContactForm from './ContactForm';

interface ContactFormTemplateProps {
  page: Page;
  formId?: number; // You can pass this from the page data if needed
}

export default function ContactFormTemplate({
  page,
  formId = 2 // Default form ID - update this to your actual CF7 form ID
}: ContactFormTemplateProps) {
  // Client-side only rendering for HTML content
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    console.log('📝 ContactFormTemplate mounted');
  }, []);

  return (
    <TemplateTransitionWrapper>
      <div className="min-h-screen">
        {/* Page Title */}
        <div className="bg-muted py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold">
              {page?.title?.rendered || "Contact Us"}
            </h1>
          </div>
        </div>

        {/* Contact Form */}
        <ContactForm formId={formId} />

        {/* Additional Page Content (if any) */}
        {page?.content?.rendered && mounted && (
          <section className="container mx-auto px-4 py-12">
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: page.content.rendered }}
            />
          </section>
        )}
      </div>
    </TemplateTransitionWrapper>
  );
}
