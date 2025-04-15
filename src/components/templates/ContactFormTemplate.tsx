// src/components/templates/ContactFormTemplate.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { LocalPage } from '@/lib/types/contentTypes';
import TemplateTransitionWrapper from './TemplateTransitionWrapper';
import ContactForm from './ContactForm';
import { Card, CardContent } from "@/components/ui/card";
import DebugPanel from '@/components/debug/DebugPanel';
import Image from 'next/image';

interface ContactFormTemplateProps {
  page: LocalPage;
}

export default function ContactFormTemplate({ page }: ContactFormTemplateProps) {
  const featuredImage = page._embedded?.['wp:featuredmedia']?.[0]?.source_url;
  const [showDebug, setShowDebug] = useState(false);
  
  // Get content and content display settings more robustly
  const pageContent = page.content?.rendered || '';
  
  // Content positioning logic using the new content_display_settings structure
  // Try multiple source paths for better compatibility with different post types
  const contentDisplaySettings = useMemo(() => 
    page?.content_display_settings || 
    (page.meta && {
      show_content_with_modules: Boolean(page.meta.show_content_with_modules),
      content_position: page.meta.content_position || 'before'
    }) || {
      show_content_with_modules: true, // Default to true for contact form
      content_position: 'before'
    },
    [page]
  );
  
  const showContentWithForm = contentDisplaySettings.show_content_with_modules;
  const contentPosition = contentDisplaySettings.content_position || 'before';
  
  // Deep debug information to console for troubleshooting
  useEffect(() => {
    console.log('ContactFormTemplate: Full Debug', {
      pageId: page.id,
      pageType: page.type,
      pageSlug: page.slug,
      rawPage: page,
      renderedContent: pageContent,
      hasContent: Boolean(pageContent),
      contentLength: pageContent?.length || 0,
      contentPreview: pageContent?.substring(0, 100),
      meta: page.meta,
      contentDisplaySettings,
      showContentWithForm,
      contentPosition
    });
  }, [page, pageContent, contentDisplaySettings, showContentWithForm, contentPosition]);
  
  // Directly access content and determine where it should appear
  const shouldShowContentBefore = showContentWithForm && contentPosition === 'before' && pageContent;
  const shouldShowContentAfter = showContentWithForm && contentPosition === 'after' && pageContent;

  // Allow toggling debug panel with keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        setShowDebug(prev => !prev);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <TemplateTransitionWrapper>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {featuredImage && (
            <Image
              src={featuredImage}
              alt={page.title.rendered}
              width={800}
              height={400}
              className="w-full h-64 object-cover rounded-lg mb-8"
            />
          )}

          <h1 className="text-4xl font-bold mb-6 text-center">
            <div dangerouslySetInnerHTML={{ __html: page.title.rendered }} />
          </h1>

          {/* Content before the form */}
          {shouldShowContentBefore && pageContent && (
            <Card className="mb-12">
              <CardContent className="pt-6">
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: pageContent }}
                />
              </CardContent>
            </Card>
          )}

          {/* Contact form */}
          <ContactForm />
          
          {/* Content after the form */}
          {shouldShowContentAfter && pageContent && (
            <Card className="mt-12">
              <CardContent className="pt-6">
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: pageContent }}
                />
              </CardContent>
            </Card>
          )}
          
          {/* Dev note about content */}
          {!pageContent && (
            <div className="mt-4 p-2 bg-yellow-100 text-yellow-800 rounded text-sm">
              <strong>Dev Note:</strong> No content from WordPress is available. 
              Add content in the WordPress editor and ensure content display settings are enabled.
            </div>
          )}
        </div>
        
        {/* Debug panel toggled with Ctrl+Shift+D */}
        {showDebug && (
          <div className="max-w-4xl mx-auto mt-12">
            <DebugPanel 
              title="Page Debug" 
              page={page as {
                id?: number;
                title?: string | { rendered: string };
                content?: string | { rendered: string };
                slug?: string;
                template?: string;
                featured_image_url?: string;
                _embedded?: Record<string, unknown>;
                modules?: import('@/lib/types/moduleTypes').Module[];
                show_content_with_modules?: boolean;
                meta?: Record<string, unknown>;
              }}
              additionalData={{
                "Type": page.type || "unknown",
                "Form Type": "Contact Form (WPCF7)",
                "Has Content": !!pageContent,
                "Content Length": pageContent?.length || 0,
                "Content Preview": pageContent?.substring(0, 50) + (pageContent?.length > 50 ? '...' : ''),
                "Show Content With Form": showContentWithForm ? 'Yes' : 'No',
                "Content Position": contentPosition,
                "Content Display Settings": JSON.stringify(contentDisplaySettings, null, 2),
                "Meta": JSON.stringify(page.meta, null, 2)
              }}
            />
          </div>
        )}
      </div>
    </TemplateTransitionWrapper>
  );
}