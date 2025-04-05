// src/components/PageTemplateSelector.tsx
'use client';

import React, { memo, useCallback, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import {
  PageTemplate,
  PageTemplateSelectorProps,
  Module,
  Page
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

// Type for template map
type TemplateMap = {
  [key in PageTemplate]: React.ComponentType<any>;
};

// Create a map of templates
const templates: Partial<TemplateMap> = {
  [PageTemplate.DEFAULT]: DefaultTemplate,
  [PageTemplate.HOMEPAGE]: HomepageTemplate,
  [PageTemplate.FULL_WIDTH]: FullWidthTemplate,
  [PageTemplate.SIDEBAR]: SidebarTemplate,
  [PageTemplate.LANDING]: LandingTemplate,
  [PageTemplate.EVALUATION]: EvaluationTemplate,
  [PageTemplate.CIRCLE_CHART]: CircleChartTemplate,
  [PageTemplate.CONTACT]: ContactFormTemplate,
};

// Lazy load ModularTemplate
const ModularTemplate = FEATURES.USE_MODULAR_TEMPLATES
  ? React.lazy(() => import('./templates/ModularTemplate'))
  : undefined;

function PageTemplateSelector({
  page,
  isHomePage = false,
  homepageData = {}
}: PageTemplateSelectorProps) {
  const template = page?.template;

  // Helper function to determine if page has modules
  const hasModules = useMemo(() => {
    const pageModules: Module[] = Array.isArray(page?.modules) ? page.modules : [];
    return pageModules.length > 0;
  }, [page?.modules]);

  // Render template based on conditions
  const renderTemplate = useCallback(() => {
    // Force homepage template if isHomePage is true
    if (isHomePage) {
      return <HomepageTemplate key="homepage" page={page} homepage={homepageData} />;
    }

    // Handle modular template
    if (FEATURES.USE_MODULAR_TEMPLATES && ModularTemplate && (hasModules || template === PageTemplate.MODULAR)) {
      return (
        <React.Suspense fallback={<DefaultTemplate key="default" page={page as Page} />}>
          <ModularTemplate key="modular" page={page} />
        </React.Suspense>
      );
    }

    // Get template component from map
    const TemplateComponent = templates[template as PageTemplate] || templates[PageTemplate.DEFAULT];

    // Ensure TemplateComponent is not undefined
    if (!TemplateComponent) {
      console.warn('No template component found, using DefaultTemplate');
      return <DefaultTemplate key="default" page={page as Page} />;
    }

    // Pass homepage data to homepage template specifically
    if (template === PageTemplate.HOMEPAGE) {
      return <HomepageTemplate key="homepage" page={page} homepage={homepageData} />;
    }

    // Type assertion for page to include potential evaluation properties
    const typedPage = page as Page & {
      evaluationId?: string | number;
      studentId?: string | number;
      meta?: {
        student_id?: string | number;
        [key: string]: any;
      };
    };

    // Render appropriate template with correct props
    return React.createElement(TemplateComponent, {
      key: template || 'default',
      page,
      ...(template === PageTemplate.EVALUATION && { 
        evaluationId: typedPage.evaluationId ? Number(typedPage.evaluationId) : undefined,
        studentId: typedPage.studentId ? Number(typedPage.studentId) : 
                  (typedPage.meta && typedPage.meta.student_id) ? Number(typedPage.meta.student_id) : undefined
      }),
      ...(template === PageTemplate.CIRCLE_CHART && {
        chartData: page.chartData,
        title: page.title?.rendered
      })
    });
  }, [template, page, isHomePage, hasModules, homepageData]);

  return (
    <AnimatePresence mode="wait">
      {renderTemplate()}
    </AnimatePresence>
  );
}

export default memo(PageTemplateSelector);