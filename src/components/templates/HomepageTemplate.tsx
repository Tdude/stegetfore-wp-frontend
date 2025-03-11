// src/components/templates/HomepageTemplate.tsx
'use client';

import React from 'react';
import { HomepageTemplateProps, HomepageData, Module } from '@/lib/types';
import TemplateTransitionWrapper from './TemplateTransitionWrapper';
import HeroSection from '@/components/homepage/HeroSection';
import FeaturedPosts from '@/components/homepage/FeaturedPosts';
//import CTASection from '@/components/homepage/CTASection';
import SellingPoints from '@/components/homepage/SellingPoints';
import GallerySection from '@/components/homepage/GallerySection';
import StatsSection from '@/components/homepage/StatsSection';
import ModuleRenderer from '@/components/modules/ModuleRenderer';
import { isTestimonialsModule } from '@/lib/typeGuards';

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


  // Adds a separate effect to log the homepageData after it changes
  React.useEffect(() => {
    console.log('📄 Homepage data:', homepageData);
  }, [homepageData]);

  // Get hero image
  const getHeroImage = () => {
    // First check the hero.image from homepage data
    if (homepageData.hero?.image) {
      if (typeof homepageData.hero.image === 'string') {
        return homepageData.hero.image;
      } else if (Array.isArray(homepageData.hero.image) && homepageData.hero.image.length > 0) {
        return homepageData.hero.image[0];
      }
    }

    if (page?._embedded?.['wp:featuredmedia']?.[0]?.source_url) {
      return page._embedded['wp:featuredmedia'][0].source_url;
    }

    // Fallback
    return "https://stegetfore.nu/wp-content/uploads/2024/09/framsida.png";
  };

  const heroImage = getHeroImage();

  // Get testimonial modules from the page
  const testimonialModules = React.useMemo(() => {
    if (!Array.isArray(homepageData.modules)) return [];

    // Filter for testimonials modules and ensure they have testimonials data
    return homepageData.modules
      .filter(module =>
        module.type === 'testimonials' &&
        Array.isArray(module.testimonials) &&
        module.testimonials.length > 0
      );
  }, [homepageData.modules]);

  // Extract CTA modules from all modules
  const ctaModules = React.useMemo(() => {
    if (!Array.isArray(homepageData.modules)) return [];

    // Map the modules to ensure each has a type property
    const processedModules = homepageData.modules.map(module => {
      if (!module.type && module.template) {
        return { ...module, type: module.template };
      }
      return module;
    });

    // Then filter for CTA modules
    return processedModules.filter(module =>
      module.type === 'cta' || module.template === 'cta'
    );
  }, [homepageData.modules]);



  return (
    <TemplateTransitionWrapper>
      <div className="min-h-screen">
        {/* Hero Section - Full width with centered content */}
        <HeroSection
          title={homepageData.hero?.title || "Välkommen till Steget Före"}
          intro={homepageData.hero?.intro || "Sluta gå i sirap. #lärdig istället vad du ska göra åt det. Texten här är från React-mallen"}
          ctaButtons={homepageData.hero?.buttons || []}
          imageUrl={heroImage}
        />

        {/* Render modules if available */}
        {page?.modules?.length > 0 && (
          <>
            {page.modules.map((module: Module) => (
              <ModuleRenderer key={module.id} module={module} />
            ))}
          </>
        )}

        {/* The rest of our sections */}
        <div className="mx-auto">
          {/* Featured Posts Section */}
          <FeaturedPosts
            posts={homepageData.featured_posts || []}
            title={homepageData.featured_posts_title || "I fokus"}
          />

          {/* Selling Points */}
          {homepageData.selling_points && homepageData.selling_points.length > 0 && (
            <SellingPoints
              points={homepageData.selling_points}
              title={homepageData.selling_points_title || "Vad du kan få"}
            />
          )}

          {/* Stats Section */}
          {homepageData.stats && homepageData.stats.length > 0 && (
            <StatsSection
              stats={homepageData.stats}
              title={homepageData.stats_title || "Vårt arbete i siffror"}
              subtitle={homepageData.stats_subtitle || "Att vi är stolta är bara förnamnet. Bakom varje siffra finns ett barn."}
              backgroundColor={homepageData.stats_background_color || "bg-muted/30"}
            />
          )}

          {/* Gallery Section */}
          {homepageData.gallery && homepageData.gallery.length > 0 && (
            <GallerySection
              items={homepageData.gallery.map(item => ({ ...item, title: item.title || '' }))}
              title={homepageData.gallery_title}
            />
          )}

          {/* Testimonials Section - Using Modules */}
          {testimonialModules.length > 0 ? (
            testimonialModules.map(module => (
              <ModuleRenderer key={module.id} module={module} />
            ))
          ) : null}

          {/* CTA Section - Using Modules */}
          {ctaModules.length > 0 ? (
            ctaModules.map(module => (
              <ModuleRenderer key={module.id} module={module} />
            ))
          ) : null}


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