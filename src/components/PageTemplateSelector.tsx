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

export default function PageTemplateSelector({
  page,
  isHomePage = false,
  homepageData = {}
}: PageTemplateSelectorProps) {
  const template = page?.template;

  // Debug logging hook
  useDebugLogging({ page, template: template as PageTemplate | undefined, isHomePage });

  // Helper function to determine if page has modules
  const hasModules = React.useMemo(() => {
    const pageModules: Module[] = Array.isArray(page?.modules) ? page.modules : [];
    return pageModules.length > 0;
  }, [page?.modules]);

  // Render template based on conditions
  const renderTemplate = React.useCallback(() => {
    // Force homepage template if isHomePage is true
    if (isHomePage) {
      return <HomepageTemplate key="homepage" page={page} homepage={homepageData} />;
    }

    // Handle modular template
    if (FEATURES.USE_MODULAR_TEMPLATES && ModularTemplate && (hasModules || template === PageTemplate.MODULAR)) {
      return (
        <React.Suspense fallback={<DefaultTemplate key="default" page={page} />}>
          <ModularTemplate key="modular" page={page} />
        </React.Suspense>
      );
    }

    // Get template component from map
    const TemplateComponent = templates[template as PageTemplate] || templates[PageTemplate.DEFAULT];

    // Ensure TemplateComponent is not undefined
    if (!TemplateComponent) {
      return <DefaultTemplate key="default" page={page} />;
    }

    // Render appropriate template with correct props
    return React.createElement(TemplateComponent, {
      key: template || 'default',
      page,
      ...(template === PageTemplate.EVALUATION && { evaluationId: Number(page.evaluationId) }),
      ...(template === PageTemplate.CIRCLE_CHART && {
        chartData: page.chartData,
        title: page.title?.rendered
      }),
      ...(template === PageTemplate.HOMEPAGE && { homepage: homepageData })
    });
  }, [template, page, isHomePage, hasModules, homepageData]);

  return (
    <AnimatePresence mode="wait">
      {renderTemplate()}
    </AnimatePresence>
  );
}

// Debug logging hook
function useDebugLogging({ page, template, isHomePage }: {
  page: LocalPage;
  template: PageTemplate | undefined;
  isHomePage: boolean;
}) {
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 PageTemplateSelector mounted', {
        page: page ? {
          id: page.id,
          slug: page.slug,
          hasModules: !!page.modules,
          moduleCount: page.modules?.length || 0,
          moduleTypes: page.modules?.map((m: { type: any; }) => m.type)
        } : 'No page',
        template,
        isHomePage,
        modules: page?.modules?.length
          ? `Found ${page.modules.length} modules: ${page.modules.map((m: { type: any; }) => m.type).join(', ')}`
          : 'No modules found'
      });
    }
  }, [page, template, isHomePage]);
}
