// src/lib/types/module.ts

export interface BaseModule {
  id: number;
  title: string;
  type: string;
  content?: string;
  order?: number;
}

export interface HeroModule extends BaseModule {
  type: 'hero';
  title: string;
  content: string;
  image?: string;
  cta?: {
    text: string;
    url: string;
  };
}

export interface TestimonialModule extends BaseModule {
  type: 'testimonial';
  author: string;
  role?: string;
  company?: string;
  quote: string;
  image?: string;
}

export interface SellingPointsModule extends BaseModule {
  type: 'selling-points';
  points: Array<{
    title: string;
    content: string;
    icon?: string;
  }>;
  columns: number;
}

export interface CTAModule extends BaseModule {
  type: 'cta';
  content: string;
  buttonText: string;
  buttonUrl: string;
  background?: string;
}

// Union type of all module types
export type Module = HeroModule | TestimonialModule | SellingPointsModule | CTAModule;
