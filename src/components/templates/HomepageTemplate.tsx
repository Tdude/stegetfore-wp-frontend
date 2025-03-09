// src/components/templates/HomepageTemplate.tsx
'use client';

import React from 'react';
import { HomepageTemplateProps, HomepageData, Module } from '@/lib/types';
import TemplateTransitionWrapper from './TemplateTransitionWrapper';
import HeroSection from '@/components/homepage/HeroSection';
import FeaturedPosts from '@/components/homepage/FeaturedPosts';
import CTASection from '@/components/homepage/CTASection';
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
    return homepageData.modules.filter(module => module.type === 'testimonials');
  }, [homepageData.modules]);

  return (
    <TemplateTransitionWrapper>
      <div className="min-h-screen">
        {/* Hero Section - Full width with centered content */}
        <HeroSection
          title={homepageData.hero?.title || "Välkommen till Steget Före"}
          intro={homepageData.hero?.intro || "Sluta gå i sirap. #lärdig istället vad du ska göra åt det."}
          ctaButtons={homepageData.hero?.buttons || []}
          imageUrl={heroImage}
        />

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
          ) : homepageData.testimonials && homepageData.testimonials.length > 0 ? (
            // Fallback to old testimonials data format if no modules found
            <section className="py-16 bg-background">
              <div className="container px-4 md:px-6 mx-auto">
                <h2 className="text-3xl font-bold tracking-tighter text-center mb-12">
                  {homepageData.testimonials_title || "Vad våra klienter säger"}
                </h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {homepageData.testimonials.map((testimonial, index) => (
                    <div key={testimonial.id || index} className="p-6 bg-muted/10 rounded-lg">
                      <div className="text-lg mb-4" dangerouslySetInnerHTML={{ __html: testimonial.content }} />
                      <div className="flex items-center gap-4">
                        {testimonial.author_image && (
                          <div className="relative w-10 h-10 rounded-full overflow-hidden">
                            <img
                              src={testimonial.author_image}
                              alt={testimonial.author_name}
                              className="object-cover w-full h-full"
                            />
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{testimonial.author_name}</p>
                          <p className="text-sm text-muted-foreground">{testimonial.author_position}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ) : null}

          {/* CTA Section */}
          {homepageData.cta && (
            <CTASection
              title={homepageData.cta.title || "Redo att börja?"}
              description={homepageData.cta.description || "Häng med redan idag. Den här texten kommer från hemsidemallen."}
              buttonText={homepageData.cta.button_text || "Kontakta oss"}
              buttonUrl={homepageData.cta.button_url || "/kontakt"}
              backgroundColor={homepageData.cta.background_color || "bg-primary"}
            />
          )}

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