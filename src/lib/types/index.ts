// src/lib/types/index.ts

// Re-export all types from specialized files
export * from "./apiTypes";
export * from "./contentTypes";
export * from "./moduleTypes";
export * from "./formTypes";
export * from "./formTypesEvaluation";
//export * from "./componentTypes";

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
