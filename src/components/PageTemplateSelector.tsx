// src/components/PageTemplateSelector.tsx
'use client';

import React, { memo, useCallback, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { PageTemplate } from '@/lib/types/baseTypes';
import { PageTemplateSelectorProps } from '@/lib/types/componentTypes';
import { Page, LocalPage } from '@/lib/types/contentTypes';
import { FEATURES } from '@/lib/featureFlags';

// Import all templates
import HomepageTemplate from './templates/HomepageTemplate';
import DefaultTemplate from './templates/DefaultTemplate';
import FullWidthTemplate from './templates/FullWidthTemplate';
import SidebarTemplate from './templates/SidebarTemplate';
import BlogIndexTemplate from './templates/BlogIndexTemplate';
import EvaluationTemplate from './templates/EvaluationTemplate';
import CircleChartTemplate from './templates/CircleChartTemplate';
import ContactFormTemplate from './templates/ContactFormTemplate';

// Type for template map
// Fix TemplateMap to use correct prop types for each template
// Instead of React.ComponentType<unknown>, use the actual prop types for each template
// For demonstration, here's a safer approach for TemplateMap type:
type TemplateMap = {
  [key in PageTemplate]: React.ComponentType<unknown>; // Replaced 'any' with 'unknown'
};

// Create a map of templates
const templates: Partial<TemplateMap> = {
  [PageTemplate.DEFAULT]: DefaultTemplate,
  [PageTemplate.HOMEPAGE]: HomepageTemplate,
  [PageTemplate.FULL_WIDTH]: FullWidthTemplate,
  [PageTemplate.SIDEBAR]: SidebarTemplate,
  [PageTemplate.BLOG_INDEX]: BlogIndexTemplate,
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
    // Guard clause - ensure page exists
    if (!page) {
      return false;
    }
    
    // Simply use the modules directly without extra transformation
    const pageModules = page.modules || [];
    return pageModules.length > 0;
  }, [page]);

  // Use callback to determine which template to render
  const renderedTemplate = useCallback(() => {
    // Double check for required properties
    if (!page) {
      return null;
    }

    // Force homepage template if isHomePage is true
    if (isHomePage) {
      return <HomepageTemplate key="homepage" page={page as LocalPage} homepage={homepageData} />;
    }

    // Handle modular template
    if (FEATURES.USE_MODULAR_TEMPLATES && ModularTemplate && (hasModules || template === PageTemplate.MODULAR)) {
      return (
        <React.Suspense fallback={<DefaultTemplate key="default" page={page as Page} />}>
          <ModularTemplate key="modular" page={page as LocalPage} />
        </React.Suspense>
      );
    }

    // Get template component from map
    const TemplateComponent = templates[template as PageTemplate] || templates[PageTemplate.DEFAULT];

    // Ensure TemplateComponent is not undefined
    if (!TemplateComponent) {
      return <DefaultTemplate key="default" page={page as Page} />;
    }

    // Pass homepage data to homepage template specifically
    if (template === PageTemplate.HOMEPAGE) {
      return <HomepageTemplate key="homepage" page={page as LocalPage} homepage={homepageData} />;
    }

    // Render appropriate template with correct props
    return React.createElement(TemplateComponent, {
      key: template || 'default',
      page: page as (Page | LocalPage) // Cast to either Page or LocalPage as needed
    });
  }, [template, page, isHomePage, hasModules, homepageData]);

  return (
    <AnimatePresence mode="wait">
      {renderedTemplate()}
    </AnimatePresence>
  );
}

export default memo(PageTemplateSelector);