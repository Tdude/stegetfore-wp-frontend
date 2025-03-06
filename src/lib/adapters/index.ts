// src/lib/adapters/index.ts

// Re-export all adapter functions from specialized files
export {
  adaptWordPressPost,
  adaptWordPressPosts,
  enhancePosts,
} from "./postAdapter";

export {
  adaptWordPressPage,
  adaptWordPressPageToLocalPage,
  adaptWordPressPages,
} from "./pageAdapter";

export {
  adaptWordPressModule,
  adaptWordPressModules,
  adaptWordPressHomepageData,
} from "./moduleAdapter";

export { adaptWordPressForm, formatFormDataForSubmission } from "./formAdapter";

export { adaptWordPressSiteInfo, adaptWordPressMenuItems } from "./siteAdapter";
