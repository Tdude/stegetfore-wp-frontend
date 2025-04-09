/**
 * Main Types Index
 * 
 * This file serves as the central export point for all types used throughout the application.
 * Types are organized into specialized files to avoid circular dependencies and improve maintainability.
 * 
 * The types are selectively exported using 'export type' syntax to ensure compatibility with
 * TypeScript's isolatedModules feature and to avoid naming conflicts.
 */

// Export from apiTypes
export * from "./apiTypes";

// Export from contentTypes 
export type { 
  LocalPage,
  Page,
  Post,
  LocalPost,
  PageParams,
  SiteInfo,
  MenuItem,
  HomepageData,
  BaseContent,
} from "./contentTypes";

// Export from moduleTypes
export * from "./moduleTypes";

// Export from formTypes but not the conflicting types that are also in wpTypes
export type {
  FormValidationState,
  FormFieldProps,
  DynamicFormProps,
  TextareaProps,
} from "./formTypes";

// Export evaluation form types
export * from "./formTypesEvaluation";

// Export component types
export * from "./componentTypes";

// Export WordPress types
export type {
  WordPressBaseContent,
  WordPressPost,
  WordPressPage,
  WordPressCategory,
  WordPressTag,
  WordPressMenuItem,
  WordPressMedia,
  WordPressSiteInfo,
  WPCF7Field,
  WPCF7Form,
  WPCF7SubmissionResponse,
  WordPressSellingPoint,
  WordPressStat,
  WordPressGalleryItem,
  WordPressTestimonial,
  WordPressCTA,
  WordPressHomepageData,
} from "./wpTypes";

// Export base types
export type {
  ImageContainer,
  ImageHelper,
  WithFeaturedImageProps,
  GalleryItem,
} from "./baseTypes";

// Define enum for page templates
export enum PageTemplate {
  DEFAULT = "default",
  HOMEPAGE = "templates/homepage.php",
  FULL_WIDTH = "templates/full-width.php",
  SIDEBAR = "templates/sidebar.php",
  LANDING = "templates/landing.php",
  EVALUATION = "templates/evaluation.php",
  CIRCLE_CHART = "templates/circle-chart.php",
  CONTACT = "templates/contact.php",
  MODULAR = "modular",
}
