// src/lib/typeGuards.ts
import {
  Module,
  HeroModule,
  CTAModule,
  SellingPointsModule,
  TestimonialsModule,
  FeaturedPostsModule,
  StatsModule,
  GalleryModule,
  TextModule,
  FormModule,
  AccordionModule,
  TabsModule,
  VideoModule,
  ChartModule,
} from "@/lib/types";

/**
 * Type guard to check if a module is a HeroModule
 */
export function isHeroModule(module: Module): module is HeroModule {
  return module.type === "hero";
}

/**
 * Type guard to check if a module is a CTAModule
 */
export function isCTAModule(module: Module): module is CTAModule {
  return module.type === "cta";
}

/**
 * Type guard to check if a module is a SellingPointsModule
 */
export function isSellingPointsModule(
  module: Module
): module is SellingPointsModule {
  return module.type === "selling-points";
}

/**
 * Type guard to check if a module is a TestimonialsModule
 */
export function isTestimonialsModule(
  module: Module
): module is TestimonialsModule {
  return (
    module.type === "testimonials" &&
    Array.isArray((module as TestimonialsModule).testimonials) &&
    (module as TestimonialsModule).testimonials.length > 0
  );
}

/**
 * Type guard to check if a module is a FeaturedPostsModule
 */
export function isFeaturedPostsModule(
  module: Module
): module is FeaturedPostsModule {
  return module.type === "featured-posts";
}

/**
 * Type guard to check if a module is a StatsModule
 */
export function isStatsModule(module: Module): module is StatsModule {
  return module.type === "stats";
}

/**
 * Type guard to check if a module is a GalleryModule
 */
export function isGalleryModule(module: Module): module is GalleryModule {
  return module.type === "gallery";
}

/**
 * Type guard to check if a module is a TextModule
 */
export function isTextModule(module: Module): module is TextModule {
  return module.type === "text";
}

/**
 * Type guard to check if a module is a FormModule
 */
export function isFormModule(module: Module): module is FormModule {
  return module.type === "form";
}

/**
 * Type guard to check if a module is an AccordionModule
 */
export function isAccordionModule(module: Module): module is AccordionModule {
  return module.type === "accordion";
}

/**
 * Type guard to check if a module is a TabsModule
 */
export function isTabsModule(module: Module): module is TabsModule {
  return module.type === "tabs";
}

/**
 * Type guard to check if a module is a VideoModule
 */
export function isVideoModule(module: Module): module is VideoModule {
  return module.type === "video";
}

/**
 * Type guard to check if a module is a ChartModule
 */
export function isChartModule(module: Module): module is ChartModule {
  return module.type === "chart";
}
