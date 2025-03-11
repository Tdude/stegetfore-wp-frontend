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
  HomepageData,
  Post,
} from "@/lib/types";
import { adaptWordPressPosts } from "./postAdapter";

/**
 * Adapts a WordPress module to the application Module format
 * @param wpModule WordPress module data
 * @returns Module object formatted for the application
 */
export function adaptWordPressModule(wpModule: any): Module | null {
  if (!wpModule) return null;

  // Determine module type from WordPress template field
  const moduleType = wpModule.type || wpModule.template;

  // Process module based on type
  switch (moduleType) {
    case "hero":
      return adaptHeroModule(wpModule);
    case "cta":
      return adaptCTAModule(wpModule);
    case "selling-points":
      return adaptSellingPointsModule(wpModule);
    case "testimonials":
      return adaptTestimonialsModule(wpModule);
    case "featured-posts":
      return adaptFeaturedPostsModule(wpModule);
    case "stats":
      return adaptStatsModule(wpModule);
    case "gallery":
      return adaptGalleryModule(wpModule);
    case "text":
      return adaptTextModule(wpModule);
    case "form":
      return adaptFormModule(wpModule);
    case "accordion":
      return adaptAccordionModule(wpModule);
    case "tabs":
      return adaptTabsModule(wpModule);
    case "video":
      return adaptVideoModule(wpModule);
    case "chart":
      return adaptChartModule(wpModule);
    default:
      console.warn(`Unknown module type: ${moduleType}`);
      return null;
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
  console.log("in moduleAdapter - Adapting CTA module:", wpModule);
  return {
    id: wpModule.id || 0,
    type: "cta", // Normalize to expected type regardless of WordPress template field
    title: wpModule.title || "",
    description: wpModule.content || wpModule.description || "",
    buttonText: wpModule.buttons?.[0]?.text || "",
    buttonUrl: wpModule.buttons?.[0]?.url || "",
    backgroundColor: wpModule.background_color || "",
    textColor: wpModule.text_color || "",
    alignment: wpModule.layout || "center",
    image: wpModule.featured_image || "",
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
  return {
    id: wpModule.id || 0,
    type: "selling-points",
    title: wpModule.title || "",
    points: Array.isArray(wpModule.points)
      ? wpModule.points.map((point: any) => ({
          id: point.id || 0,
          title: point.title || "",
          content: point.content || "",
          description: point.description || "",
          icon: point.icon || "",
        }))
      : [],
    layout: wpModule.layout,
    columns: wpModule.columns,
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
  return {
    id: wpModule.id || 0,
    type: "testimonials",
    title: wpModule.title || "",
    testimonials: Array.isArray(wpModule.testimonials)
      ? wpModule.testimonials.map((testimonial: any) => ({
          id: testimonial.id || 0,
          content: testimonial.content || "",
          author_name: testimonial.author_name || "",
          author_position: testimonial.author_position || "",
          author_image: testimonial.author_image || "",
        }))
      : [],
    display_style: wpModule.display_style || "carousel",
    display_count: wpModule.display_count || 3,
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
  return {
    id: wpModule.id || 0,
    type: "featured-posts",
    title: wpModule.title || "",
    posts: Array.isArray(wpModule.posts)
      ? adaptWordPressPosts(wpModule.posts).filter(
          (post): post is Post => post !== null
        )
      : [],
    display_style: wpModule.display_style || "grid",
    columns: wpModule.columns || 3,
    show_excerpt: wpModule.show_excerpt !== false,
    show_categories: wpModule.show_categories !== false,
    show_read_more: wpModule.show_read_more !== false,
    categories: wpModule.categories || {},
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
          icon: stat.icon || "",
        }))
      : [],
    backgroundColor: wpModule.background_color,
    layout: wpModule.layout || "grid",
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
  return {
    id: wpModule.id || 0,
    type: "gallery",
    title: wpModule.title || "",
    items: Array.isArray(wpModule.items)
      ? wpModule.items.map((item: any) => ({
          id: item.id || 0,
          image: item.image || "",
          title: item.title || "",
          description: item.description || "",
        }))
      : [],
    layout: wpModule.layout || "grid",
    columns: wpModule.columns || 3,
    enable_lightbox: wpModule.enable_lightbox !== false,
    order: wpModule.order || 0,
    settings: wpModule.settings || {},
  };
}

/**
 * Adapts a WordPress text module
 * @param wpModule WordPress text module data
 * @returns Text module object
 */
function adaptTextModule(wpModule: any): any {
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
function adaptFormModule(wpModule: any): any {
  return {
    id: wpModule.id || 0,
    type: "form",
    title: wpModule.title || "",
    form_id: wpModule.form_id || 0,
    description: wpModule.description || "",
    success_message: wpModule.success_message || "",
    error_message: wpModule.error_message || "",
    redirect_url: wpModule.redirect_url || "",
    order: wpModule.order || 0,
    settings: wpModule.settings || {},
  };
}

/**
 * Adapts a WordPress accordion module
 * @param wpModule WordPress accordion module data
 * @returns Accordion module object
 */
function adaptAccordionModule(wpModule: any): any {
  return {
    id: wpModule.id || 0,
    type: "accordion",
    title: wpModule.title || "",
    items: Array.isArray(wpModule.items)
      ? wpModule.items.map((item: any) => ({
          id: item.id || 0,
          title: item.title || "",
          content: item.content || "",
        }))
      : [],
    allow_multiple_open: wpModule.allow_multiple_open || false,
    default_open_index: wpModule.default_open_index,
    order: wpModule.order || 0,
    settings: wpModule.settings || {},
  };
}

/**
 * Adapts a WordPress tabs module
 * @param wpModule WordPress tabs module data
 * @returns Tabs module object
 */
function adaptTabsModule(wpModule: any): any {
  return {
    id: wpModule.id || 0,
    type: "tabs",
    title: wpModule.title || "",
    tabs: Array.isArray(wpModule.tabs)
      ? wpModule.tabs.map((tab: any) => ({
          id: tab.id || 0,
          title: tab.title || "",
          content: tab.content || "",
          icon: tab.icon || "",
        }))
      : [],
    orientation: wpModule.orientation || "horizontal",
    default_tab_index: wpModule.default_tab_index || 0,
    order: wpModule.order || 0,
    settings: wpModule.settings || {},
  };
}

/**
 * Adapts a WordPress video module
 * @param wpModule WordPress video module data
 * @returns Video module object
 */
function adaptVideoModule(wpModule: any): any {
  return {
    id: wpModule.id || 0,
    type: "video",
    title: wpModule.title || "",
    video_url: wpModule.video_url || "",
    video_type: wpModule.video_type || "youtube",
    poster_image: wpModule.poster_image || "",
    autoplay: wpModule.autoplay || false,
    loop: wpModule.loop || false,
    muted: wpModule.muted || false,
    controls: wpModule.controls !== false,
    allow_fullscreen: wpModule.allow_fullscreen !== false,
    order: wpModule.order || 0,
    settings: wpModule.settings || {},
  };
}

/**
 * Adapts a WordPress chart module
 * @param wpModule WordPress chart module data
 * @returns Chart module object
 */
function adaptChartModule(wpModule: any): any {
  return {
    id: wpModule.id || 0,
    type: "chart",
    title: wpModule.title || "",
    chart_type: wpModule.chart_type || "bar",
    data: wpModule.data || {
      labels: [],
      datasets: [],
    },
    options: wpModule.options || {},
    order: wpModule.order || 0,
    settings: wpModule.settings || {},
  };
}

/**
 * Adapts WordPress homepage data to the application HomepageData format
 * @param wpHomepageData WordPress homepage data
 * @returns HomepageData object formatted for the application
 */
export function adaptWordPressHomepageData(wpHomepageData: any): HomepageData {
  if (!wpHomepageData) return {};

  return {
    hero: wpHomepageData.hero
      ? {
          title: wpHomepageData.hero.title || "",
          intro: wpHomepageData.hero.intro || "",
          image: wpHomepageData.hero.image || "",
          buttons: wpHomepageData.hero.buttons || [],
        }
      : undefined,

    featured_posts_title: wpHomepageData.featured_posts_title || "",

    selling_points: Array.isArray(wpHomepageData.selling_points)
      ? wpHomepageData.selling_points.map((point: any) => ({
          id: point.id || 0,
          title: point.title || "",
          content: point.content || "",
          description: point.description || "",
          icon: point.icon || "",
        }))
      : [],

    selling_points_title: wpHomepageData.selling_points_title || "",

    stats: Array.isArray(wpHomepageData.stats)
      ? wpHomepageData.stats.map((stat: any) => ({
          id: stat.id || 0,
          value: stat.value || "",
          label: stat.label || "",
        }))
      : [],

    stats_title: wpHomepageData.stats_title || "",
    stats_subtitle: wpHomepageData.stats_subtitle || "",
    stats_background_color: wpHomepageData.stats_background_color || "",

    gallery: Array.isArray(wpHomepageData.gallery)
      ? wpHomepageData.gallery.map((item: any) => ({
          id: item.id || 0,
          image: item.image || "",
          title: item.title || "",
          description: item.description || "",
        }))
      : [],

    gallery_title: wpHomepageData.gallery_title || "",

    testimonials: Array.isArray(wpHomepageData.testimonials)
      ? wpHomepageData.testimonials.map((testimonial: any) => ({
          id: testimonial.id || 0,
          content: testimonial.content || "",
          author_name: testimonial.author_name || "",
          author_position: testimonial.author_position || "",
          author_image: testimonial.author_image || "",
        }))
      : [],

    testimonials_title: wpHomepageData.testimonials_title || "",

    cta: wpHomepageData.cta
      ? {
          title: wpHomepageData.cta.title || "",
          description: wpHomepageData.cta.description || "",
          button_text: wpHomepageData.cta.button_text || "",
          button_url: wpHomepageData.cta.button_url || "",
          background_color: wpHomepageData.cta.background_color || "",
        }
      : undefined,

    // Adapt modules array if available
    modules: Array.isArray(wpHomepageData.modules)
      ? wpHomepageData.modules.map((module: any) =>
          adaptWordPressModule(module)
        )
      : [],
  };
}

/**
 * Adapts multiple WordPress modules
 * @param wpModules Array of WordPress module data
 * @returns Array of Module objects formatted for the application
 */
export function adaptWordPressModules(wpModules: any[]): Module[] {
  if (!Array.isArray(wpModules)) return [];

  // Filter out null results from adaptWordPressModule
  return wpModules
    .map((module) => adaptWordPressModule(module))
    .filter((module): module is Module => module !== null);
}
