'use client';

import React from 'react';
import { HomepageTemplateProps, HomepageData, Module } from '@/lib/types';
import TemplateTransitionWrapper from './TemplateTransitionWrapper';
import ModuleRenderer from '@/components/modules/ModuleRenderer';

export default function HomepageTemplate({ page, homepage }: HomepageTemplateProps) {
  const [homepageData, setHomepageData] = React.useState<HomepageData>({
    modules: [],
    featured_posts: [],
    categories: [],
  });
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
      setHomepageData(homepage || {});
    }
    setMounted(true);
  }, [homepage]);

  const processModules = (modules: any[]): Module[] => {
    if (!modules || !Array.isArray(modules)) return [];
    return modules.map((module, index) => ({ ...module, id: module.id || index }));
  };

  const homepageModules = React.useMemo(() => {
    return processModules(Array.isArray(homepageData.modules) ? homepageData.modules : []);
  }, [homepageData.modules]);

  const pageModules = React.useMemo(() => {
    return processModules(page?.modules || []);
  }, [page?.modules]);

  const createSectionModules = () => {
    const modules: Module[] = [];

    if (homepageData?.featured_posts?.length &&
      !homepageModules.some(m => m.type === 'featured-posts') &&
      !pageModules.some(m => m.type === 'featured-posts')) {
      modules.push({
        id: Date.now(),
        type: 'featured-posts',
        title: homepageData.featured_posts_title || 'I fokus från bloggen',
        posts: homepageData.featured_posts?.map(post => ({
          ...post,
          title: post.title.rendered,
          excerpt: post.excerpt?.rendered || '',
          content: post.content.rendered,
          featured_image_url: post.featured_image_url || undefined,
          categories: post.categories.map(String),
        })) || [],
        // categories: homepageData.categories,
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

  const allModules = React.useMemo(() => {
    const combinedModules = [
      ...pageModules,
      ...homepageModules,
      ...createSectionModules()
    ];

    const processedIds = new Set<string | number>();
    const uniqueModules: Module[] = [];

    combinedModules.forEach(module => {
      if (!processedIds.has(module.id)) {
        uniqueModules.push(module);
        processedIds.add(module.id);
      }
    });

    const sortedModules = uniqueModules.sort((a, b) => {
      const orderA = typeof a.order === 'number' ? a.order : 0;
      const orderB = typeof b.order === 'number' ? b.order : 0;
      return orderB - orderA;
    });

    // Find the featured-posts module
    const featuredPostsIndex = sortedModules.findIndex(m => m.type === 'featured-posts');
    if (featuredPostsIndex !== -1) {
      const featuredPostsModule = sortedModules.splice(featuredPostsIndex, 1)[0];

      // Move it to a specific position (e.g., index 2)
      const newIndex = 2; // Change this to the desired position
      sortedModules.splice(newIndex, 0, featuredPostsModule);
    }

    return sortedModules;
  }, [pageModules, homepageModules]);

  const groupModulesBySection = (modules: Module[]) => {
    const sections: Record<string, Module[]> = {
      header: [],
      main: [],
      footer: [],
      other: []
    };

    modules.forEach(module => {
      const section = module.settings?.section || 'main';
      if (sections[section]) {
        sections[section].push(module);
      } else {
        sections.other.push(module);
      }
    });

    // Move featured-posts to the end of the main section
    const mainSection = sections.main;
    const featuredPostsIndex = mainSection.findIndex(m => m.type === 'featured-posts');
    if (featuredPostsIndex !== -1) {
      const featuredPostsModule = mainSection.splice(featuredPostsIndex, 1)[0];
      mainSection.push(featuredPostsModule);
    }

    return sections;
  };

  const modulesBySection = groupModulesBySection(allModules);

  return (
    <TemplateTransitionWrapper>
      <div className="min-h-screen">
        {modulesBySection.header.map(module => (
          <ModuleRenderer key={`header-${module.id}`} module={module} />
        ))}

        <div className="mx-auto">
          {modulesBySection.main.map(module => (
            <ModuleRenderer key={`main-${module.id}`} module={module} />
          ))}

          {modulesBySection.other.map(module => (
            <ModuleRenderer key={`other-${module.id}`} module={module} />
          ))}

          {modulesBySection.footer.map(module => (
            <ModuleRenderer key={`footer-${module.id}`} module={module} />
          ))}

          {page?.content?.rendered && mounted && (
            <section className="max-w-7xl px-4 py-12 mx-auto">
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: page.content.rendered }}
              />
            </section>
          )}

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