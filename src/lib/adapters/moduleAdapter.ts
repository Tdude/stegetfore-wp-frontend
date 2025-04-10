// src/lib/adapters/moduleAdapter.ts
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
  AccordionFaqModule,
  TabsModule,
  VideoModule,
  ChartModule,
  BaseModule
} from "@/lib/types/moduleTypes";
import { HomepageData, Post } from "@/lib/types/contentTypes";
import { adaptWordPressPosts } from "./postAdapter";

/**
 * Adapts a WordPress module to the application Module format
 * @param wpModule WordPress module data
 * @returns Module object formatted for the application
 */
export function adaptWordPressModule(wpModule: any): Module | null {
  if (!wpModule) return null;

  // Determine module type from WordPress snake_case fields
  // The API could use: type, template, acf_fc_layout, etc.
  const moduleType = wpModule.type || wpModule.template || wpModule.acf_fc_layout;
  
  if (!moduleType) {
    // Return a basic module if type can't be determined but we have enough data
    if (wpModule.id && (wpModule.title || wpModule.title?.rendered)) {
      console.log(`Using base adapter for module with ID: ${wpModule.id}`);
      return adaptBaseModule(wpModule);
    }
    console.warn("Could not determine module type:", wpModule);
    return null;
  }

  // Log the module type to help with debugging
  console.log(`Processing module of type: ${moduleType} (ID: ${wpModule.id})`);

  // Map from snake_case module types to our internal module adapter functions
  // This standardizes the naming conventions coming from WordPress
  const typeMapping: Record<string, string> = {
    // snake_case variants
    'hero': 'hero',
    'hero_module': 'hero',
    'cta': 'cta',
    'cta_module': 'cta',
    'selling_points': 'selling-points',
    'selling_points_module': 'selling-points',
    'testimonials': 'testimonials',
    'testimonials_module': 'testimonials',
    'featured_posts': 'featured-posts',
    'featured_posts_module': 'featured-posts',
    'stats': 'stats',
    'stats_module': 'stats',
    'gallery': 'gallery',
    'gallery_module': 'gallery',
    'text': 'text',
    'text_module': 'text',
    'form': 'form',
    'form_module': 'form',
    'accordion_faq': 'accordion-faq',
    'accordion_faq_module': 'accordion-faq',
    'tabs': 'tabs',
    'tabs_module': 'tabs',
    'video': 'video',
    'video_module': 'video',
    'chart': 'chart',
    'chart_module': 'chart',
    
    // Also support camelCase variants for backwards compatibility
    'heroModule': 'hero',
    'ctaModule': 'cta',
    'sellingPointsModule': 'selling-points',
    'testimonialsModule': 'testimonials',
    'featuredPostsModule': 'featured-posts',
    'statsModule': 'stats',
    'galleryModule': 'gallery',
    'textModule': 'text',
    'formModule': 'form',
    'accordionFaqModule': 'accordion-faq',
    'tabsModule': 'tabs',
    'videoModule': 'video',
    'chartModule': 'chart',
  };

  // Get the normalized type
  const normalizedType = typeMapping[moduleType] || moduleType;
  
  // If we can't map the type, log it and try to adapt as a base module
  if (!typeMapping[moduleType]) {
    console.warn(`Unknown module type: ${moduleType}, will try as base module`);
    return adaptBaseModule(wpModule);
  }

  console.log(`Mapped module type ${moduleType} → ${normalizedType}`);

  // Switch on the normalized type
  try {
    switch (normalizedType) {
      case 'hero':
        return adaptHeroModule(wpModule);
      case 'cta':
        return adaptCTAModule(wpModule);
      case 'selling-points':
        return adaptSellingPointsModule(wpModule);
      case 'testimonials':
        return adaptTestimonialsModule(wpModule);
      case 'featured-posts':
        return adaptFeaturedPostsModule(wpModule);
      case 'stats':
        return adaptStatsModule(wpModule);
      case 'gallery':
        return adaptGalleryModule(wpModule);
      case 'text':
        return adaptTextModule(wpModule);
      case 'form':
        return adaptFormModule(wpModule);
      case 'accordion-faq':
        return adaptAccordionFaqModule(wpModule);
      case 'tabs':
        return adaptTabsModule(wpModule);
      case 'video':
        return adaptVideoModule(wpModule);
      case 'chart':
        return adaptChartModule(wpModule);
      default:
        // Fallback to base module for unknown types
        console.warn(`No specific adapter for module type: ${normalizedType}, using base adapter`);
        return adaptBaseModule(wpModule);
    }
  } catch (error) {
    console.error(`Error adapting module of type ${normalizedType}:`, error);
    // Try to fall back to base module in case of errors
    try {
      return adaptBaseModule(wpModule);
    } catch (e) {
      console.error('Even base module adapter failed:', e);
      return null;
    }
  }
}

/**
 * Adapts a WordPress hero module
 * @param wpModule WordPress hero module data
 * @returns HeroModule object
 */
function adaptHeroModule(wpModule: any): HeroModule {
  return {
    id: wpModule.id || 0,
    type: "hero",
    title: wpModule.title || "",
    intro: wpModule.intro || "",
    image: wpModule.image || "",
    video_url: wpModule.video_url,
    buttons: wpModule.buttons || [],
    overlay_opacity: wpModule.overlay_opacity || 0.3,
    text_color: wpModule.text_color,
    height: wpModule.height,
    alignment: wpModule.alignment || "center",
    order: wpModule.order || 0,
    settings: wpModule.settings || {},
  };
}

/**
 * Adapts a WordPress CTA module
 * @param wpModule WordPress CTA module data
 * @returns CTAModule object
 */
function adaptCTAModule(wpModule: any): CTAModule {
  // Extract button data with snake_case fields prioritized
  let buttonText = "";
  let buttonUrl = "";
  
  // First check snake_case fields
  if (wpModule.button_text && wpModule.button_url) {
    buttonText = wpModule.button_text;
    buttonUrl = wpModule.button_url;
  } 
  // Then check buttons array (secondary priority)
  else if (wpModule.buttons && Array.isArray(wpModule.buttons) && wpModule.buttons.length > 0) {
    buttonText = wpModule.buttons[0].text || "";
    buttonUrl = wpModule.buttons[0].url || "";
  }

  return {
    id: wpModule.id || 0,
    type: "cta", // Normalize to expected type regardless of WordPress template field
    title: wpModule.title || "",
    description: wpModule.content || wpModule.description || "",
    buttonText: buttonText,
    buttonUrl: buttonUrl,
    // Always prioritize snake_case properties from WordPress API
    backgroundColor: wpModule.background_color || wpModule.backgroundColor || "",
    textColor: wpModule.text_color || wpModule.textColor || "",
    alignment: wpModule.layout || "center", // Use layout from API as it's the primary field
    image: wpModule.featured_image || wpModule.image || "",
    order: wpModule.order || 0,
    settings: wpModule.settings || {},
  };
}

/**
 * Adapts a WordPress selling points module
 * @param wpModule WordPress selling points module data
 * @returns SellingPointsModule object
 */
function adaptSellingPointsModule(wpModule: any): SellingPointsModule {
  // Check if points array exists and has the correct structure
  const points = Array.isArray(wpModule.points) 
    ? wpModule.points.map((point: any) => ({
        id: point.id || 0,
        title: point.title || "",
        content: point.content || point.description || "",
        description: point.description || point.content || "",
        icon: point.icon || ""
      }))
    : [];
    
  return {
    id: wpModule.id || 0,
    type: "selling-points",
    title: wpModule.title || "",
    points: points,
    columns: wpModule.columns || 3,
    // Handle layout from API, which can affect display in the frontend
    layout: wpModule.layout || "grid",
    // Handle backgroundColor directly as it's provided by the API
    backgroundColor: wpModule.backgroundColor || "",
    // Handle fullWidth if present in the API
    fullWidth: wpModule.fullWidth || false,
    order: wpModule.order || 0,
    settings: wpModule.settings || {},
  };
}

/**
 * Adapts a WordPress testimonials module
 * @param wpModule WordPress testimonials module data
 * @returns TestimonialsModule object
 */
function adaptTestimonialsModule(wpModule: any): TestimonialsModule {
  // Extract testimonials array with consistent snake_case fields
  const testimonials = Array.isArray(wpModule.testimonials)
    ? wpModule.testimonials.map((testimonial: any) => ({
        id: testimonial.id || 0,
        content: testimonial.content || "",
        author_name: testimonial.author_name || "",
        author_position: testimonial.author_position || "",
        author_image: testimonial.author_image || "",
      }))
    : [];

  return {
    id: wpModule.id || 0,
    type: "testimonials",
    title: wpModule.title || "",
    testimonials,
    // Consistently use snake_case fields from the API
    display_style: wpModule.display_style || "carousel",
    display_count: wpModule.display_count || 3,
    // Add support for background_color consistent with other modules
    backgroundColor: wpModule.background_color || wpModule.backgroundColor || "",
    order: wpModule.order || 0,
    settings: wpModule.settings || {},
  };
}

/**
 * Adapts a WordPress featured posts module
 * @param wpModule WordPress featured posts module data
 * @returns FeaturedPostsModule object
 */
function adaptFeaturedPostsModule(wpModule: any): FeaturedPostsModule {
  // Map posts with consistent field handling
  const adaptedPosts = Array.isArray(wpModule.posts)
    ? adaptWordPressPosts(wpModule.posts)
        .filter((post): post is Post => post !== null)
        .map((post) => ({
          ...post,
          title: post.title.rendered,
          excerpt: post.excerpt?.rendered || "",
          content: post.content.rendered,
          featured_image_url: post.featured_image_url ?? undefined,
          categories: post.categories?.map(String) ?? [],
        }))
    : [];

  return {
    id: wpModule.id || 0,
    type: "featured-posts",
    title: wpModule.title || "",
    posts: adaptedPosts,
    // Consistently prioritize snake_case fields from WordPress
    display_style: wpModule.display_style || wpModule.displayStyle || "grid",
    columns: wpModule.columns || 3,
    show_excerpt: wpModule.show_excerpt !== false,
    show_categories: wpModule.show_categories !== false,
    show_read_more: wpModule.show_read_more !== false,
    categories: wpModule.categories?.map(String) || [],
    order: wpModule.order || 0,
    settings: wpModule.settings || {},
  };
}

/**
 * Adapts a WordPress stats module
 * @param wpModule WordPress stats module data
 * @returns StatsModule object
 */
function adaptStatsModule(wpModule: any): StatsModule {
  return {
    id: wpModule.id || 0,
    type: "stats",
    title: wpModule.title || "",
    subtitle: wpModule.subtitle || "",
    stats: Array.isArray(wpModule.stats)
      ? wpModule.stats.map((stat: any) => ({
          id: stat.id || 0,
          value: stat.value || "",
          label: stat.label || "",
          icon: stat.icon || ""
        }))
      : [],
    // Prioritize snake_case fields over camelCase, but support both
    backgroundColor: wpModule.background_color || wpModule.backgroundColor || "",
    // The API provides layout as one of: "row" or "grid"
    layout: wpModule.layout || "row",
    columns: wpModule.columns || 4,
    order: wpModule.order || 0,
    settings: wpModule.settings || {},
  };
}

/**
 * Adapts a WordPress gallery module
 * @param wpModule WordPress gallery module data
 * @returns GalleryModule object
 */
function adaptGalleryModule(wpModule: any): GalleryModule {
  // Process gallery items with standardized field handling
  const items = Array.isArray(wpModule.items)
    ? wpModule.items.map((item: any) => ({
        id: item.id || 0,
        image: item.image || "",
        title: item.title || "",
        description: item.description || "",
      }))
    : [];

  return {
    id: wpModule.id || 0,
    type: "gallery",
    title: wpModule.title || "",
    items: items,
    // Prioritize API field names but match our interface properties
    layout: wpModule.layout || "grid",
    columns: wpModule.columns || 3,
    enable_lightbox: wpModule.enable_lightbox !== false,
    backgroundColor: wpModule.background_color || wpModule.backgroundColor || "",
    fullWidth: wpModule.fullWidth || false,
    order: wpModule.order || 0,
    settings: wpModule.settings || {},
  };
}

/**
 * Adapts a WordPress text module
 * @param wpModule WordPress text module data
 * @returns Text module object
 */
function adaptTextModule(wpModule: any): TextModule {
  return {
    id: wpModule.id || 0,
    type: "text",
    title: wpModule.title || "",
    content: wpModule.content || "",
    alignment: wpModule.alignment || "left",
    text_size: wpModule.text_size || "medium",
    enable_columns: wpModule.enable_columns || false,
    columns_count: wpModule.columns_count || 2,
    order: wpModule.order || 0,
    settings: wpModule.settings || {},
  };
}

/**
 * Adapts a WordPress form module
 * @param wpModule WordPress form module data
 * @returns Form module object
 */
function adaptFormModule(wpModule: any): FormModule {
  return {
    id: wpModule.id || 0,
    type: "form",
    title: wpModule.title || "",
    // Consistently use snake_case fields from the API
    form_id: wpModule.form_id || 0,
    description: wpModule.description || "",
    success_message: wpModule.success_message || "",
    error_message: wpModule.error_message || "",
    redirect_url: wpModule.redirect_url || "",
    // Add support for background color consistent with other modules
    backgroundColor: wpModule.background_color || wpModule.backgroundColor || "",
    // Add support for full width option consistent with other modules
    fullWidth: wpModule.full_width || wpModule.fullWidth || false,
    // Add support for layout consistent with other modules
    layout: wpModule.layout || "standard",
    order: wpModule.order || 0,
    settings: wpModule.settings || {},
  };
}

/**
 * Adapts a WordPress accordion module
 * @param wpModule WordPress accordion or FAQ module data
 * @returns AccordionFaqModule object
 */
function adaptAccordionFaqModule(wpModule: any): AccordionFaqModule {
  // Determine if it's an accordion or FAQ based on the type
  const moduleType = wpModule.type === "faq" ? "faq" : "accordion";
  
  // Map items correctly based on the API structure
  const items = Array.isArray(wpModule.items)
    ? wpModule.items.map((item: any) => ({
        id: item.id || 0,
        // Map snake_case fields first, then fallback to alternatives
        question: item.question || item.title || "",
        answer: item.answer || item.content || "",
        icon: item.icon || ""
      }))
    : [];
    
  return {
    id: wpModule.id || 0,
    type: moduleType,
    title: wpModule.title || "",
    items: items,
    allow_multiple_open: wpModule.allow_multiple_open || false,
    default_open_index: wpModule.default_open_index,
    // Prioritize snake_case fields from API, and match our interface property names
    backgroundColor: wpModule.background_color || wpModule.backgroundColor || "",
    icon_position: wpModule.icon_position || wpModule.iconPosition || "left",
    order: wpModule.order || 0,
    settings: wpModule.settings || {},
  };
}

/**
 * Adapts a WordPress tabs module
 * @param wpModule WordPress tabs module data
 * @returns TabsModule object
 */
function adaptTabsModule(wpModule: any): TabsModule {
  // Process tab items with standardized field handling
  const tabs = Array.isArray(wpModule.tabs)
    ? wpModule.tabs.map((tab: any) => ({
        id: tab.id || 0,
        title: tab.title || "",
        content: tab.content || "",
        icon: tab.icon || "",
      }))
    : [];

  return {
    id: wpModule.id || 0,
    type: "tabs",
    title: wpModule.title || "",
    tabs,
    // Consistently use snake_case fields from the API
    orientation: wpModule.orientation || "horizontal",
    default_tab_index: wpModule.default_tab_index || 0,
    // Add support for background color
    backgroundColor: wpModule.background_color || wpModule.backgroundColor || "",
    // Add support for full width option
    fullWidth: wpModule.full_width || wpModule.fullWidth || false,
    index: wpModule.index || 0,
    order: wpModule.order || 0,
    settings: wpModule.settings || {},
  };
}

/**
 * Adapts a WordPress video module
 * @param wpModule WordPress video module data
 * @returns Video module object
 */
function adaptVideoModule(wpModule: any): VideoModule {
  return {
    id: wpModule.id || 0,
    type: "video",
    title: wpModule.title || "",
    // Consistently use snake_case fields from the API
    video_url: wpModule.video_url || "",
    video_type: wpModule.video_type || "youtube",
    poster_image: wpModule.poster_image || "",
    autoplay: wpModule.autoplay || false,
    loop: wpModule.loop || false,
    muted: wpModule.muted || false,
    controls: wpModule.controls !== false,
    allow_fullscreen: wpModule.allow_fullscreen !== false,
    // Add support for background color consistent with other modules
    backgroundColor: wpModule.background_color || wpModule.backgroundColor || "",
    // Add support for full width option consistent with other modules
    fullWidth: wpModule.full_width || wpModule.fullWidth || false,
    order: wpModule.order || 0,
    settings: wpModule.settings || {},
  };
}

/**
 * Adapts a WordPress chart module
 * @param wpModule WordPress chart module data
 * @returns Chart module object
 */
function adaptChartModule(wpModule: any): ChartModule {
  // Standardize field handling to prioritize snake_case fields from the API
  // This ensures consistency with other modules and allows for camelCase fallbacks
  return {
    id: wpModule.id || 0,
    type: "chart",
    title: wpModule.title || "",
    // Consistently use snake_case fields from the API
    chart_type: wpModule.chart_type || "bar",
    data: wpModule.data || {
      labels: [],
      datasets: [],
    },
    options: wpModule.options || {},
    // Add support for background color consistent with other modules
    backgroundColor: wpModule.background_color || wpModule.backgroundColor || "",
    // Add support for full width option consistent with other modules
    fullWidth: wpModule.full_width || wpModule.fullWidth || false,
    order: wpModule.order || 0,
    settings: wpModule.settings || {},
  };
}

/**
 * Adapts a WordPress module to a base module
 * This is used for module types that don't have a specific adapter
 * @param wpModule WordPress module data
 * @returns BaseModule object
 */
function adaptBaseModule(wpModule: any): BaseModule {
  console.log(`adaptBaseModule called for module ID: ${wpModule.id}, type: ${wpModule.type || 'unknown'}`);
  
  // Handle different possible sources for title and content
  const title = wpModule.title?.rendered || wpModule.title || '';
  const content = wpModule.content?.rendered || wpModule.content || '';
  
  // Extract module type from the module data for debugging
  const originalType = wpModule.type || wpModule.template || wpModule.acf_fc_layout || 'unknown';
  
  // Create a base module with all the common properties
  const baseModule: BaseModule = {
    id: wpModule.id || 0,
    type: 'base',
    title,
    content,
    // Support both snake_case and camelCase properties
    layout: wpModule.layout || 'center',
    fullWidth: wpModule.full_width || wpModule.fullWidth || false,
    backgroundColor: wpModule.background_color || wpModule.backgroundColor || '',
    // Add order property for correct positioning
    order: wpModule.order || 0,
    // Include original type for debugging
    originalType
  };
  
  console.log(`Successfully adapted base module: ${JSON.stringify(baseModule)}`);
  
  return baseModule;
}

/**
 * Adapts WordPress homepage data to the application HomepageData format
 * @param wpHomepageData WordPress homepage data
 * @returns HomepageData object formatted for the application
 */
export function adaptWordPressHomepageData(wpHomepageData: any): HomepageData {
  if (!wpHomepageData) {
    return {
      id: 0,
      slug: "",
      title: { rendered: "" },
      content: { rendered: "" },
      hero: undefined,
      featured_posts_title: "",
      selling_points: [],
      selling_points_title: "",
      stats: [],
      stats_title: "",
      stats_subtitle: "",
      featured_posts: [],
      modules: [],
    };
  }

  // Extract hero data with priority to snake_case fields
  const hero = wpHomepageData.hero
    ? {
        title: wpHomepageData.hero.title || "",
        intro: wpHomepageData.hero.intro || wpHomepageData.hero.description || "",
        image: wpHomepageData.hero.image || wpHomepageData.hero.featured_image || "",
        buttons: Array.isArray(wpHomepageData.hero.buttons)
          ? wpHomepageData.hero.buttons
          : [],
      }
    : undefined;

  return {
    id: wpHomepageData.id || 0,
    slug: wpHomepageData.slug || "",
    title: { rendered: wpHomepageData.title?.rendered || wpHomepageData.title || "" },
    content: { rendered: wpHomepageData.content?.rendered || wpHomepageData.content || "" },
    hero,
    featured_posts_title: wpHomepageData.featured_posts_title || "",
    selling_points: Array.isArray(wpHomepageData.selling_points)
      ? wpHomepageData.selling_points
      : [],
    selling_points_title: wpHomepageData.selling_points_title || "",
    stats: Array.isArray(wpHomepageData.stats) ? wpHomepageData.stats : [],
    stats_title: wpHomepageData.stats_title || "",
    stats_subtitle: wpHomepageData.stats_subtitle || "",
    featured_posts: Array.isArray(wpHomepageData.featured_posts)
      ? wpHomepageData.featured_posts
      : [],
    modules: Array.isArray(wpHomepageData.modules)
      ? wpHomepageData.modules
      : [],
  };
}

/**
 * Adapts multiple WordPress modules to the application Module format
 * @param wpModules Array of WordPress modules
 * @returns Array of Module objects
 */
export function adaptWordPressModules(wpModules: any[]): Module[] {
  if (!Array.isArray(wpModules)) {
    console.warn('adaptWordPressModules received non-array:', wpModules);
    return [];
  }
  
  // Add logging to see what's being processed
  console.log(`adaptWordPressModules: Processing ${wpModules.length} modules`);
  
  if (wpModules.length > 0) {
    // Log the first module to inspect its structure
    console.log('First module sample:', JSON.stringify(wpModules[0]));
  }
  
  const modules = wpModules
    .map((module, index) => {
      try {
        const adapted = adaptWordPressModule(module);
        
        if (!adapted) {
          console.warn(`Failed to adapt module at index ${index}:`, module);
        } else {
          console.log(`Successfully adapted module: ${adapted.type} (ID: ${adapted.id})`);
        }
        
        return adapted;
      } catch (error) {
        console.error(`Error adapting module at index ${index}:`, error);
        return null;
      }
    })
    .filter((module): module is Module => module !== null);
    
  console.log(`Successfully adapted ${modules.length} of ${wpModules.length} modules`);
  
  return modules;
}
