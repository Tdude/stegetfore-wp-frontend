// src/lib/api/index.ts
// Base API functions
export { fetchApi, testConnection, API_URL, THEME_SLUG } from "./baseApi";

// Post API functions
export {
  fetchPosts,
  fetchPost,
  fetchPostsByIds,
  fetchFeaturedPosts,
} from "./postApi";

// Page API functions
export { fetchPages, fetchPage, fetchPageById } from "./pageApi";

// Module API functions
export {
  fetchModules,
  fetchModule,
  fetchModulesByTemplate,
  fetchModulesByCategory,
  fetchPageModules,
} from "./moduleApi";

// Homepage API functions
export {
  fetchHomepageData,
  fetchHeroSection,
  fetchCTASection,
  fetchSellingPoints,
  fetchTestimonialsModule,
  fetchFeaturedPostsModule,
} from "./homepageApi";

// Form API functions
export {
  fetchForms,
  fetchFormStructure,
  submitForm,
  submitSimpleForm,
} from "./formApi";

// Site API functions
export { fetchSiteInfo, fetchMainMenu, fetchCategories } from "./siteApi";
