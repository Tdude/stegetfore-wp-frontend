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

  // Based on the logs, we need to handle modules with missing 'type' property
  // and set default types based on their content
  const processModules = (modules: any[]): Module[] => {
    if (!Array.isArray(modules)) return [];

    return modules.map((module, index) => {
      // If module has no type, try to infer it from its properties
      if (!module.type) {
        if (module.title && (module.intro || module.image)) {
          return { ...module, id: module.id || index, type: 'hero' };
        } else if (module.posts && Array.isArray(module.posts)) {
          return { ...module, id: module.id || index, type: 'featured-posts' };
        } else if (module.points && Array.isArray(module.points)) {
          return { ...module, id: module.id || index, type: 'selling-points' };
        } else if (module.stats && Array.isArray(module.stats)) {
          return { ...module, id: module.id || index, type: 'stats' };
        } else if (module.items && Array.isArray(module.items)) {
          return { ...module, id: module.id || index, type: 'gallery' };
        } else if (module.testimonials && Array.isArray(module.testimonials)) {
          return { ...module, id: module.id || index, type: 'testimonials' };
        } else if (module.buttons || module.buttonText) {
          return { ...module, id: module.id || index, type: 'cta' };
        } else if (module.template) {
          return { ...module, id: module.id || index, type: module.template };
        } else {
          // If type can't be inferred, default to text module
          return { ...module, id: module.id || index, type: 'text' };
        }
      }

      // Ensure module has an id
      return { ...module, id: module.id || index };
    });
  };

  // Process homepage modules
  const homepageModules = React.useMemo(() => {
    return processModules(homepageData.modules || []);
  }, [homepageData.modules]);

  // Process page modules
  const pageModules = React.useMemo(() => {
    return processModules(page?.modules || []);
  }, [page?.modules]);

  // Create section modules from homepage data if they don't exist in modules
  const createSectionModules = () => {
    const modules: Module[] = [];

    // Hero Module (from hero section)
    if (homepageData.hero && !homepageModules.some(m => m.type === 'hero') && !pageModules.some(m => m.type === 'hero')) {
      modules.push({
        id: 'hero-1',
        type: 'hero',
        title: homepageData.hero.title || 'Welcome',
        intro: homepageData.hero.intro || '',
        image: typeof homepageData.hero.image === 'string'
          ? homepageData.hero.image
          : Array.isArray(homepageData.hero.image) && homepageData.hero.image.length > 0
            ? homepageData.hero.image[0]
            : page?._embedded?.['wp:featuredmedia']?.[0]?.source_url || '',
        buttons: homepageData.hero.buttons || [],
        overlay_opacity: 0.3,
        alignment: 'center',
        settings: {
          section: 'header',
          priority: 1,
        }
      });
    }

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
          priority: 10,
        }
      });
    }

    // Selling Points Module
    if (homepageData.selling_points?.length &&
        !homepageModules.some(m => m.type === 'selling-points') &&
        !pageModules.some(m => m.type === 'selling-points')) {
      modules.push({
        id: 'selling-points-1',
        type: 'selling-points',
        title: homepageData.selling_points_title || 'What We Offer',
        points: homepageData.selling_points || [],
        layout: 'grid',
        columns: 3,
        settings: {
          section: 'main',
          priority: 20,
        }
      });
    }

    // Stats Module
    if (homepageData.stats?.length &&
        !homepageModules.some(m => m.type === 'stats') &&
        !pageModules.some(m => m.type === 'stats')) {
      modules.push({
        id: 'stats-1',
        type: 'stats',
        title: homepageData.stats_title || 'Our Work in Numbers',
        subtitle: homepageData.stats_subtitle || '',
        stats: homepageData.stats || [],
        backgroundColor: homepageData.stats_background_color || 'bg-muted/30',
        layout: 'grid',
        columns: 4,
        settings: {
          section: 'main',
          priority: 30,
        }
      });
    }

    // Gallery Module
    if (homepageData.gallery?.length &&
        !homepageModules.some(m => m.type === 'gallery') &&
        !pageModules.some(m => m.type === 'gallery')) {
      modules.push({
        id: 'gallery-1',
        type: 'gallery',
        title: homepageData.gallery_title || 'Gallery',
        items: homepageData.gallery || [],
        layout: 'grid',
        columns: 3,
        enable_lightbox: true,
        settings: {
          section: 'main',
          priority: 40,
        }
      });
    }

    return modules;
  };

  // Get all modules from all sources
  const allModules = React.useMemo(() => {
    // Priority order: page modules, homepage modules, generated section modules
    const modules = [
      ...pageModules,
      ...homepageModules,
      ...createSectionModules()
    ];

    console.log('All Modules:', modules.map(m => ({ id: m.id, type: m.type })));

    return modules;
  }, [pageModules, homepageModules]);

  // Group modules by section
  const groupModulesBySection = (modules: Module[]) => {
    const sections: Record<string, Module[]> = {
      header: [],
      main: [],
      footer: [],
      other: []
    };

    // Use a Set to track module IDs we've already seen
    const processedIds = new Set<string | number>();

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

    // Sort each section by priority
    Object.keys(sections).forEach(key => {
      sections[key].sort((a, b) => {
        const priorityA = a.settings?.priority || 0;
        const priorityB = b.settings?.priority || 0;
        return priorityA - priorityB;
      });
    });

    return sections;
  };

  const modulesBySection = groupModulesBySection(allModules);

  React.useEffect(() => {
    console.log('Modules by section:', {
      header: modulesBySection.header.length,
      main: modulesBySection.main.length,
      footer: modulesBySection.footer.length,
      other: modulesBySection.other.length
    });
  }, [modulesBySection]);

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