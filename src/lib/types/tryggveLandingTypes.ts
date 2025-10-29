// src/lib/types/tryggveLandingTypes.ts

export interface TryggveButton {
  text: string;
  url: string;
  style?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
  newTab?: boolean;
}

export interface TryggveHeroSection {
  title: string;
  subtitle: string;
  buttons: TryggveButton[];
  backgroundImage?: string;
  backgroundColor?: string;
}

export interface TryggveTargetAudienceSection {
  title: string;
  description: string;
  points: string[];
  testimonial?: {
    quote: string;
    author: string;
    role?: string;
  };
}

export interface TryggveProblemSection {
  title: string;
  description: string;
  statistics: Array<{
    value: string;
    label: string;
  }>;
  closingText: string;
}

export interface TryggveSolutionSection {
  title: string;
  description: string;
  features: Array<{
    icon: string;
    title: string;
    description: string;
  }>;
}

export interface TryggveCourseSection {
  title: string;
  description: string;
  benefits: string[];
  ctaButton: TryggveButton;
}

export interface TryggveContactFormSection {
  title: string;
  subtitle: string;
  successMessage: string;
  fields: Array<{
    name: string;
    label: string;
    type: 'text' | 'email' | 'textarea' | 'select';
    required: boolean;
    placeholder?: string;
    options?: string[];
  }>;
  submitButtonText: string;
}

export interface TryggveClosingSection {
  quote: string;
  author: string;
}

export interface TryggveLandingData {
  hero: TryggveHeroSection;
  targetAudience: TryggveTargetAudienceSection;
  problem: TryggveProblemSection;
  solution: TryggveSolutionSection;
  course: TryggveCourseSection;
  contactForm: TryggveContactFormSection;
  closing: TryggveClosingSection;
}
