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
} from "./moduleAdapter";

export { adaptWordPressForm, formatFormDataForSubmission } from "./formAdapter";

export { adaptWordPressSiteInfo, adaptWordPressMenuItems } from "./siteAdapter";

export { adaptHomepageData as adaptWordPressHomepageData } from './moduleAdapter';
