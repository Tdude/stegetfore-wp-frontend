// src/components/PageTemplateSelector.tsx
'use client';

import React, { memo, useCallback, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import {
  PageTemplate,
  PageTemplateSelectorProps,
  Module,
  LocalPage,
  HomepageData
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

// Define extended page type that includes properties from LocalPage
interface ExtendedPage extends LocalPage {
  meta?: {
    student_id?: string;
    [key: string]: unknown;
  };
}

// Lazy load ModularTemplate
const ModularTemplate = FEATURES.USE_MODULAR_TEMPLATES
  ? React.lazy(() => import('./templates/ModularTemplate'))
  : undefined;

function PageTemplateSelector({
  page,
  isHomePage = false,
  homepageData = undefined
}: PageTemplateSelectorProps) {
  const template = page?.template;
  // Cast page to ExtendedPage to access additional properties
  const extendedPage = page as ExtendedPage;

  // Helper function to determine if page has modules
  const hasModules = useMemo(() => {
    const pageModules: Module[] = Array.isArray(extendedPage?.modules) ? extendedPage.modules : [];
    return pageModules.length > 0;
  }, [extendedPage?.modules]);

  // Render template based on conditions
  const renderTemplate = useCallback(() => {
    // Force homepage template if isHomePage is true
    if (isHomePage) {
      return <HomepageTemplate key="homepage" homepage={homepageData} />;
    }

    // Handle modular template
    if (FEATURES.USE_MODULAR_TEMPLATES && ModularTemplate && (hasModules || template === PageTemplate.MODULAR)) {
      return (
        <React.Suspense fallback={<DefaultTemplate key="default" page={extendedPage} />}>
          <ModularTemplate key="modular" page={extendedPage} />
        </React.Suspense>
      );
    }

    // Pass homepage data to homepage template specifically
    if (template === PageTemplate.HOMEPAGE) {
      return <HomepageTemplate key="homepage" homepage={homepageData} />;
    }

    // Extract evaluation-specific properties
    const evaluationId = extendedPage?.evaluationId ? Number(extendedPage.evaluationId) : undefined;
    const studentId = extendedPage?.meta?.student_id ? Number(extendedPage.meta.student_id) : undefined;

    // Render appropriate template based on the template type
    switch (template) {
      case PageTemplate.DEFAULT:
        return <DefaultTemplate key="default" page={extendedPage} />;
      case PageTemplate.FULL_WIDTH:
        return <FullWidthTemplate key="full-width" page={extendedPage} />;
      case PageTemplate.SIDEBAR:
        return <SidebarTemplate key="sidebar" page={extendedPage} />;
      case PageTemplate.LANDING:
        return <LandingTemplate key="landing" page={extendedPage} />;
      case PageTemplate.EVALUATION:
        return <EvaluationTemplate 
                 key="evaluation" 
                 page={extendedPage} 
                 evaluationId={evaluationId} 
                 studentId={studentId} 
               />;
      case PageTemplate.CIRCLE_CHART:
        // CircleChartTemplate is actually LifeWheelChart with different props
        return <CircleChartTemplate 
                 key="circle-chart" 
                 chartData={extendedPage.chartData || { segments: [] }} 
                 title={extendedPage.title?.rendered} 
                 className="w-full"
               />;
      case PageTemplate.CONTACT:
        return <ContactFormTemplate key="contact" page={extendedPage} />;
      default:
        console.warn('No template component found, using DefaultTemplate');
        return <DefaultTemplate key="default" page={extendedPage} />;
    }
  }, [template, isHomePage, hasModules, homepageData, extendedPage]);

  return (
    <AnimatePresence mode="wait">
      {renderTemplate()}
    </AnimatePresence>
  );
}

export default memo(PageTemplateSelector);