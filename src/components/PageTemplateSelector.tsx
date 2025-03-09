// src/components/PageTemplateSelector.tsx
'use client';

import React from 'react';
import { AnimatePresence } from 'framer-motion';
import {
  PageTemplate,
  PageTemplateSelectorProps,
  Module,
  LocalPage
} from '@/lib/types';
import { FEATURES } from '@/lib/featureFlags';

// Import all templates
import HomepageTemplate from './templates/HomepageTemplate';
import DefaultTemplate from './templates/DefaultTemplate';
import FullWidthTemplate from './templates/FullWidthTemplate';
import SidebarTemplate from './templates/SidebarTemplate';
import LandingTemplate from './templates/LandingTemplate';
import EvaluationTemplate from './templates/EvaluationTemplate';
import CircleChartTemplate from './templates/CircleChartTemplate';
import ContactFormTemplate from './templates/ContactFormTemplate';

// Conditionally import ModularTemplate to avoid errors if not yet created
let ModularTemplate: React.ComponentType<{ page: LocalPage }> | undefined;
if (FEATURES.USE_MODULAR_TEMPLATES) {
  try {
    // Dynamic import (but synchronous during initialization)
    ModularTemplate = require('./templates/ModularTemplate').default;
  } catch (err: unknown) {
    console.warn('ModularTemplate not available yet:', (err as Error).message);
  }
}

export default function PageTemplateSelector({
  page,
  isHomePage = false,
  homepageData = {}
}: PageTemplateSelectorProps) {
  const template = page?.template;

  // Debug information
  React.useEffect(() => {
    console.log('🚀 PageTemplateSelector mounted');
    console.log('📄 Page data:', page);
    console.log('🎨 Template value:', template);
    console.log('🏠 Is Homepage:', isHomePage);

        // Log whether the page has modules - with proper type checking
    if (page.modules && Array.isArray(page.modules) && page.modules.length) {
      console.log('📦 Page has modules:', page.modules.length);
    }

    // Log if modular template is available
    console.log('🧩 ModularTemplate available:', !!ModularTemplate);
  }, [page, template, isHomePage]);

  return (
    <AnimatePresence mode="wait">
      {(() => {
        // Force homepage template if isHomePage is true
        if (isHomePage) {
          return <HomepageTemplate key="homepage" page={page} homepage={homepageData} />;
        }

        // Make sure modules is always an array, even if page.modules is undefined
        // Explicitly cast modules to ensure type compatibility
        const pageModules: Module[] = Array.isArray(page.modules) ? page.modules : [];
        const hasModules = pageModules.length > 0;
        const isModularTemplate = template === PageTemplate.MODULAR;

        // Use modular template if:
        // 1. Feature flag is enabled
        // 2. ModularTemplate component is available
        // 3. Either the page has modules or the template is explicitly set to MODULAR
        if (FEATURES.USE_MODULAR_TEMPLATES && ModularTemplate && (hasModules || isModularTemplate)) {
          return <ModularTemplate key="modular" page={page} />;
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
            return <CircleChartTemplate
              key="circle-chart"
              chartData={page.chartData ?? undefined}
              title={page.title?.rendered}
            />;
          case PageTemplate.CONTACT:
            return <ContactFormTemplate key="contact-form" page={page} />;
          case PageTemplate.MODULAR:
            // If we get here, it means MODULAR template was specified but the feature flag is off
            console.warn('ModularTemplate requested but feature flag is disabled or component not available');
            return <DefaultTemplate key="default" page={page} />;
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