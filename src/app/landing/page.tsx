// src/app/tryggve-demo/page.tsx
import React from 'react';
import TryggveLandingTemplate from '@/components/templates/TryggveLandingTemplate';
import { Page } from '@/lib/types/contentTypes';

export const metadata = {
  title: 'Tryggve-kursen - Se potentialen i skolans bubbelbarn',
  description: 'En forskningsförankrad modell som hjälper skolor att förstå, möta och inkludera barn med komplexa behov – innan de faller utanför.',
};

export default function TryggveDemoPage() {
  // Create a mock page object for demo purposes
  const mockPage: Page = {
    id: 999,
    date: new Date().toISOString(),
    date_gmt: new Date().toISOString(),
    guid: { rendered: '' },
    modified: new Date().toISOString(),
    modified_gmt: new Date().toISOString(),
    slug: 'tryggve-demo',
    status: 'publish',
    type: 'page',
    link: '/tryggve-demo',
    title: { rendered: 'Tryggve-kursen Demo' },
    content: { rendered: '', protected: false },
    excerpt: { rendered: '', protected: false },
    author: 1,
    featured_media: 0,
    parent: 0,
    menu_order: 0,
    comment_status: 'closed',
    ping_status: 'closed',
    template: 'tryggve-landing',
    meta: [],
    _links: {
      self: [{ href: '' }],
      collection: [{ href: '' }],
      about: [{ href: '' }],
      author: [{ embeddable: true, href: '' }],
      replies: [{ embeddable: true, href: '' }],
      'version-history': [{ count: 0, href: '' }],
      'wp:attachment': [{ href: '' }],
      curies: [{ name: 'wp', href: '', templated: true }],
    },
  };

  return <TryggveLandingTemplate page={mockPage} />;
}
