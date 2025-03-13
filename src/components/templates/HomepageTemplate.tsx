// src/components/templates/HomepageTemplate.tsx
'use client';

import React from 'react';
import { HomepageTemplateProps, HomepageData, Module } from '@/lib/types';
import TemplateTransitionWrapper from './TemplateTransitionWrapper';
import ModuleRenderer from '@/components/modules/ModuleRenderer';
import { isHeroModule, isTestimonialsModule, isFeaturedPostsModule, isSellingPointsModule, isStatsModule, isGalleryModule, isCTAModule } from '@/lib/typeGuards';

export default function HomepageTemplate({ page, homepage }: HomepageTemplateProps) {
  // Homepage data from custom endpoint or fallback
  const [homepageData, setHomepageData] = React.useState<HomepageData>({});
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    if (typeof homepage === 'string') {
      try {
        const parsed = JSON.parse(homepage);
        setHomepageData(parsed || {});
      } catch (e) {
        console.error('Failed to parse homepage data:', e);
        setHomepageData({});
      }
    } else {
      // Otherwise already an object
      setHomepageData(homepage || {});
    }

    setMounted(true);
    console.log('🏠 HomepageTemplate mounted');
  }, [homepage]);

  React.useEffect(() => {
    console.log('📄 Homepage data:', homepageData);
  }, [homepageData]);


const processModules = (modules: any[]): Module[] => {
  if (!Array.isArray(modules)) return [];

  return modules.map((module, index) => {
    // Ensure module has an id
    return { ...module, id: module.id || index };
  });
};

  // Process homepage modules
  const homepageModules = React.useMemo(() => {
    return processModules(Array.isArray(homepageData.modules) ? homepageData.modules : []);
  }, [homepageData.modules]);

  // Process page modules
  const pageModules = React.useMemo(() => {
    return processModules(page?.modules || []);
  }, [page?.modules]);

  // Create section modules from homepage data if they don't exist in modules
  const createSectionModules = () => {
    const modules: Module[] = [];


    // Featured Posts Module
    if (homepageData.featured_posts?.length &&
        !homepageModules.some(m => m.type === 'featured-posts') &&
        !pageModules.some(m => m.type === 'featured-posts')) {
      modules.push({
        id: 'featured-posts-1',
        type: 'featured-posts',
        title: homepageData.featured_posts_title || 'Featured Posts',
        posts: homepageData.featured_posts || [],
        categories: homepageData.categories,
        display_style: 'grid',
        columns: 3,
        show_excerpt: true,
        show_categories: true,
        show_read_more: true,
        settings: {
          section: 'main',
          priority: 5,
        }
      });
    }

    return modules;
  };



  // Get all modules from all sources
  const allModules = React.useMemo(() => {
    // Priority order: page modules, homepage modules, generated section modules
    const combinedModules = [
      ...pageModules,
      ...homepageModules,
      ...createSectionModules()
    ];

    // Use a Set to track module IDs we've already seen to avoid duplicates
    const processedIds = new Set<string | number>();
    const uniqueModules: Module[] = [];

    // Only add modules we haven't seen before
    combinedModules.forEach(module => {
      if (!processedIds.has(module.id)) {
        uniqueModules.push(module);
        processedIds.add(module.id);
      }
    });

    //console.log('Before sorting:', uniqueModules.map(m => ({ id: m.id, type: m.type, order: m.order })));

    // Sort modules by the order property if available
    const sortedModules = uniqueModules.sort((a, b) => {
      // In WordPress admin, typically higher numbers appear first (top)
      // Default to 0 if order is not specified
      const orderA = typeof a.order === 'number' ? a.order : 0;
      const orderB = typeof b.order === 'number' ? b.order : 0;

      // For debugging
      if (orderA !== orderB) {
        console.log(`Comparing: ${a.type}(${a.id}) order=${orderA} vs ${b.type}(${b.id}) order=${orderB} => result: ${orderB - orderA}`);
      }

      return orderB - orderA; // Higher values appear first
    });

    //console.log('After sorting:', sortedModules.map(m => ({ id: m.id, type: m.type, order: m.order })));

    return sortedModules;
  }, [pageModules, homepageModules]);

  // Update the groupModulesBySection function
  const groupModulesBySection = (modules: Module[]) => {
    const sections: Record<string, Module[]> = {
      header: [],
      main: [],
      footer: [],
      other: []
    };

    // Use a Set to track module IDs we've already seen
    const processedIds = new Set<string | number>();

    // Process modules in their existing order (already sorted by order property)
    modules.forEach(module => {
      // Skip if we've already processed a module with this ID
      if (processedIds.has(module.id)) return;

      const section = module.settings?.section || 'main';
      if (sections[section]) {
        sections[section].push(module);
      } else {
        sections.other.push(module);
      }

      // Mark this ID as processed
      processedIds.add(module.id);
    });

    // For each section, sort by the priority setting if available
    Object.keys(sections).forEach(key => {
      console.log(`Sorting section ${key} - before:`, sections[key].map(m => ({ id: m.id, priority: m.settings?.priority })));

      sections[key].sort((a, b) => {
        // If both have priority settings, use them (higher priority first)
        if (a.settings?.priority !== undefined && b.settings?.priority !== undefined) {
          // For debugging
          if (a.settings.priority !== b.settings.priority) {
            console.log(`Comparing priorities: ${a.type}(${a.id}) priority=${a.settings.priority} vs ${b.type}(${b.id}) priority=${b.settings.priority} => result: ${b.settings.priority - a.settings.priority}`);
          }
          return b.settings.priority - a.settings.priority;
        }

        // If only one has priority, prioritize it
        if (a.settings?.priority !== undefined) return -1;
        if (b.settings?.priority !== undefined) return 1;

        // Otherwise, maintain the original order (which was sorted by module.order)
        return 0;
      });

      console.log(`Sorting section ${key} - after:`, sections[key].map(m => ({ id: m.id, priority: m.settings?.priority })));
    });

    return sections;
  };

  const modulesBySection = groupModulesBySection(allModules);

  //React.useEffect(() => {
  //  console.log('Modules by section:', {
  //    header: modulesBySection.header.length,
  //    main: modulesBySection.main.length,
  //    footer: modulesBySection.footer.length,
  //    other: modulesBySection.other.length
  //  });
  //}, [modulesBySection]);

  return (
    <TemplateTransitionWrapper>
      <div className="min-h-screen">
        {/* Header section modules (typically hero) */}
        {modulesBySection.header.map(module => (
          <ModuleRenderer key={`header-${module.id}`} module={module} />
        ))}

        {/* Main content section modules */}
        <div className="mx-auto">
          {modulesBySection.main.map(module => (
            <ModuleRenderer key={`main-${module.id}`} module={module} />
          ))}

          {/* Any other modules that don't have a specific section */}
          {modulesBySection.other.map(module => (
            <ModuleRenderer key={`other-${module.id}`} module={module} />
          ))}

          {/* Footer section modules */}
          {modulesBySection.footer.map(module => (
            <ModuleRenderer key={`footer-${module.id}`} module={module} />
          ))}

          {/* Additional Page Content (if any) */}
          {page?.content?.rendered && mounted && (
            <section className="max-w-7xl px-4 py-12 mx-auto">
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: page.content.rendered }}
              />
            </section>
          )}

          {/* Skeleton for page content when not mounted */}
          {page?.content?.rendered && !mounted && (
            <section className="max-w-7xl px-4 py-12 mx-auto">
              <div className="prose max-w-none">
                <div className="h-6 bg-muted/30 rounded w-3/4 mb-4 animate-pulse" />
                <div className="h-4 bg-muted/30 rounded w-full mb-2 animate-pulse" />
                <div className="h-4 bg-muted/30 rounded w-full mb-2 animate-pulse" />
                <div className="h-4 bg-muted/30 rounded w-2/3 animate-pulse" />
              </div>
            </section>
          )}
        </div>
      </div>
    </TemplateTransitionWrapper>
  );
}