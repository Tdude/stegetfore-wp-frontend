// src/components/templates/HomepageTemplate.tsx
'use client';

import React from 'react';
import { Page } from '@/lib/types';
import TemplateTransitionWrapper from './TemplateTransitionWrapper';
import HeroSection from '@/components/homepage/HeroSection';
import FeaturedPosts from '@/components/homepage/FeaturedPosts';
import CTASection from '@/components/homepage/CTASection';
import TestimonialsSection from '@/components/homepage/TestimonialsSection';
import SellingPoints from '@/components/homepage/SellingPoints';
import GallerySection from '@/components/homepage/GallerySection';
import StatsSection from '@/components/homepage/StatsSection';

interface HomepageTemplateProps {
  page: Page;
  homepage?: any; // Homepage data from the custom endpoint
}

export default function HomepageTemplate({ page, homepage }: HomepageTemplateProps) {
  // Homepage data from custom endpoint or fallback
  const homepageData = homepage || {};

  // Client-side only rendering for HTML content
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    console.log('🏠 HomepageTemplate mounted');
    console.log('📄 Homepage data:', homepageData);
  }, [homepageData]);

  // Get hero image from various possible sources
  const getHeroImage = () => {
    // First check the hero.image from homepage data
    if (homepageData.hero?.image) {
      if (typeof homepageData.hero.image === 'string') {
        return homepageData.hero.image;
      } else if (Array.isArray(homepageData.hero.image) && homepageData.hero.image.length > 0) {
        return homepageData.hero.image[0];
      }
    }

    // Then check if page has a featured image
    if (page?._embedded?.['wp:featuredmedia']?.[0]?.source_url) {
      return page._embedded['wp:featuredmedia'][0].source_url;
    }

    // Fallback to a default image
    return "/images/hero-fallback.jpg";
  };

  const heroImage = getHeroImage();

  return (
    <TemplateTransitionWrapper>
      <div className="min-h-screen">
        {/* Hero Section - Full width with centered content */}
        <HeroSection
          title={homepageData.hero?.title || "Välkommen till Steget Före"}
          intro={homepageData.hero?.intro || "Sluta gå i sirap. Lär dig istället vad du ska göra åt det."}
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
            <SellingPoints points={homepageData.selling_points} />
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

          {/* Gallery Section - Maybe? */}
          {homepageData.gallery && homepageData.gallery.length > 0 && (
            <GallerySection items={homepageData.gallery} />
          )}

          {/* Testimonials Section */}
          {homepageData.testimonials && homepageData.testimonials.length > 0 && (
            <TestimonialsSection
              testimonials={homepageData.testimonials}
              title={homepageData.testimonials_title || "Vad våra klienter säger"}
            />
          )}

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