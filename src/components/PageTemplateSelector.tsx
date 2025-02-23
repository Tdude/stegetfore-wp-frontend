// src/components/PageTemplateSelector.tsx
'use client';

import React, { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Page, PageTemplate } from '@/lib/types';
import DefaultTemplate from './templates/DefaultTemplate';
import FullWidthTemplate from './templates/FullWidthTemplate';
import SidebarTemplate from './templates/SidebarTemplate';
import LandingTemplate from './templates/LandingTemplate';
import EvaluationTemplate from './templates/EvaluationTemplate';
import CircleChartTemplate from './templates/CircleChartTemplate';

export default function PageTemplateSelector({ page }: { page: Page }) {
  const template = page.template;

  // console.log('Template from API:', template);
/*
  React.useEffect(() => {
    console.log('🚀 PageTemplateSelector mounted');
    console.log('📄 Page data:', page);
    console.log('🎨 Template value:', template);
  }, []);
*/

  return (
    <AnimatePresence mode="wait">
      {(() => {
        switch (template) {
          case PageTemplate.FULL_WIDTH:
            return <FullWidthTemplate key="full-width" page={page} />;
          case PageTemplate.SIDEBAR:
            return <SidebarTemplate key="sidebar" page={page} />;
          case PageTemplate.LANDING:
            return <LandingTemplate key="landing" page={page} />;
          case PageTemplate.EVALUATION:
            return <EvaluationTemplate key="evaluation" page={page} />;
          case PageTemplate.CIRCLE_CHART:
            return <CircleChartTemplate key="circle-chart" page={page} />;
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