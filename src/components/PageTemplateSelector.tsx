// components/PageTemplateSelector.tsx
'use client';

import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { Page, PageTemplate } from '@/lib/types';
import HomepageTemplate from './templates/HomepageTemplate';
import DefaultTemplate from './templates/DefaultTemplate';
import FullWidthTemplate from './templates/FullWidthTemplate';
import SidebarTemplate from './templates/SidebarTemplate';
import LandingTemplate from './templates/LandingTemplate';
import EvaluationTemplate from './templates/EvaluationTemplate';
import CircleChartTemplate from './templates/CircleChartTemplate';
import ContactFormTemplate from './templates/ContactFormTemplate';


interface PageTemplateSelectorProps<T = any> {
  page: Page & {
    type?: string;
    template?: string;
    id?: number;
    slug?: string;
    title?: { rendered: string };
  };
  isHomePage?: boolean; // New prop to force homepage template
  homepageData?: T; // Generic type
}

export default function PageTemplateSelector({
  page,
  isHomePage = false,
  homepageData = {}
}: PageTemplateSelectorProps) {
  const template = page.template;


  // Debug information
  React.useEffect(() => {
    console.log('🚀 PageTemplateSelector mounted');
    console.log('📄 Page data:', page);
    console.log('🎨 Template value:', template);
    console.log('🏠 Is Homepage:', isHomePage);
  }, [page, template, isHomePage]);

  return (
    <AnimatePresence mode="wait">
      {(() => {
        // Force homepage template if isHomePage is true
        if (isHomePage) {
          return <HomepageTemplate key="homepage" page={page} homepage={homepageData} />;
        }

        // Otherwise use the template from the page
        switch (template) {
          case PageTemplate.HOMEPAGE:
            return <HomepageTemplate key="homepage" page={page} homepage={homepageData} />;
          case PageTemplate.FULL_WIDTH:
            return <FullWidthTemplate key="full-width" page={page} />;
          case PageTemplate.SIDEBAR:
            return <SidebarTemplate key="sidebar" page={page} />;
          case PageTemplate.LANDING:
            return <LandingTemplate key="landing" page={page} />;
          case PageTemplate.EVALUATION:
            return <EvaluationTemplate key="evaluation" evaluationId={page.evaluationId ? Number(page.evaluationId) : undefined} />;
          case PageTemplate.CIRCLE_CHART:
            return <CircleChartTemplate key="circle-chart" chartData={page.chartData}
            title={page.title.rendered} />;
          case PageTemplate.CONTACT:
            return <ContactFormTemplate key="contact-form" page={page} />;
          case undefined:
          case '':
          case PageTemplate.DEFAULT:
          default:
            return <DefaultTemplate key="default" page={page} />;
        }
      })()}
    </AnimatePresence>
  );
}