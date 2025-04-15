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
  BaseModule,
  AccordionFaqItem
} from "@/lib/types/moduleTypes";
import { HomepageData, Post } from "@/lib/types/contentTypes";
import { adaptWordPressPosts } from "./postAdapter";

// Type guard for WordPress module objects
function isWPModule(obj: unknown): obj is Record<string, unknown> {
  return typeof obj === 'object' && obj !== null;
}

/**
 * Adapts a WordPress module to the application Module format
 * @param wpModule WordPress module data
 * @returns Module object formatted for the application
 */
export function adaptWordPressModule(wpModule: unknown): Module | null {
  if (!isWPModule(wpModule)) return null;

  // Determine module type from WordPress snake_case fields
  // The API could use: type, template, acf_fc_layout, etc.
  let moduleType: string | undefined = undefined;
  if (typeof wpModule.type === 'string') {
    moduleType = wpModule.type;
  } else if (typeof wpModule.template === 'string') {
    moduleType = wpModule.template;
  } else if (typeof wpModule.acf_fc_layout === 'string') {
    moduleType = wpModule.acf_fc_layout;
  }

  if (!moduleType) {
    // Return a basic module if type can't be determined but we have enough data
    if (typeof wpModule.id !== 'undefined' && (typeof wpModule.title === 'string' || (wpModule.title && typeof wpModule.title.rendered === 'string'))) {
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
function adaptHeroModule(wpModule: unknown): HeroModule {
  if (!isWPModule(wpModule)) {
    return {
      id: 0,
      type: "hero",
      title: "",
      intro: "",
      image: "",
      video_url: "",
      buttons: [],
      overlay_opacity: 0.3,
      text_color: "",
      height: "",
      alignment: "center",
      order: 0,
      settings: {},
    };
  }
  return {
    id: wpModule.id || 0,
    type: "hero",
    title: wpModule.title || "",
    intro: wpModule.intro || "",
    image: wpModule.image || "",
    video_url: typeof wpModule.video_url === "string" ? wpModule.video_url : "",
    buttons: wpModule.buttons || [],
    overlay_opacity: wpModule.overlay_opacity || 0.3,
    text_color: wpModule.text_color,
    height: wpModule.height,
    alignment: typeof wpModule.alignment === "string" && ["left", "right", "center"].includes(wpModule.alignment)
      ? (wpModule.alignment as "left" | "right" | "center")
      : "center",
    order: typeof wpModule.order === "number" ? wpModule.order : 0,
    settings:
      wpModule.settings && typeof wpModule.settings === "object" && !Array.isArray(wpModule.settings)
        ? (wpModule.settings as Record<string, unknown>)
        : {},
  };
}

/**
 * Adapts a WordPress CTA module
 * @param wpModule WordPress CTA module data
 * @returns CTAModule object
 */
function adaptCTAModule(wpModule: unknown): CTAModule {
  if (!isWPModule(wpModule)) {
    return {
      id: 0,
      type: "cta",
      title: "",
      description: "",
      buttonText: "",
      buttonUrl: "",
      backgroundColor: "",
      textColor: "",
      alignment: "center",
      image: "",
      order: 0,
      settings: {},
    };
  }
  let buttonText = "";
  let buttonUrl = "";
  if (wpModule.button_text && wpModule.button_url) {
    buttonText = wpModule.button_text;
    buttonUrl = wpModule.button_url;
  } else if (wpModule.buttons && Array.isArray(wpModule.buttons) && wpModule.buttons.length > 0) {
    buttonText = wpModule.buttons[0].text || "";
    buttonUrl = wpModule.buttons[0].url || "";
  }
  return {
    id: wpModule.id || 0,
    type: "cta",
    title: wpModule.title || "",
    description: wpModule.content || wpModule.description || "",
    buttonText: buttonText,
    buttonUrl: buttonUrl,
    backgroundColor: wpModule.background_color || wpModule.backgroundColor || "",
    textColor: wpModule.text_color || wpModule.textColor || "",
    alignment: typeof wpModule.layout === "string" && ["left", "right", "center"].includes(wpModule.layout)
      ? (wpModule.layout as "left" | "right" | "center")
      : "center",
    image: wpModule.featured_image || wpModule.image || "",
    order: typeof wpModule.order === "number" ? wpModule.order : 0,
    settings:
      wpModule.settings && typeof wpModule.settings === "object" && !Array.isArray(wpModule.settings)
        ? (wpModule.settings as Record<string, unknown>)
        : {},
  };
}

/**
 * Adapts a WordPress selling points module
 * @param wpModule WordPress selling points module data
 * @returns SellingPointsModule object
 */
function adaptSellingPointsModule(wpModule: unknown): SellingPointsModule {
  if (!isWPModule(wpModule)) {
    return {
      id: 0,
      type: "selling-points",
      title: "",
      points: [],
      columns: 3,
      layout: "grid",
      backgroundColor: "",
      fullWidth: false,
      order: 0,
      settings: {},
    };
  }
  // Check if points array exists and has the correct structure
  const points = Array.isArray(wpModule.points)
    ? wpModule.points.map((point: unknown) => {
        const p = point as SellingPointsModule["points"][number];
        return {
          id: p?.id || 0,
          title: p?.title || "",
          content: p?.content || p?.description || "",
          description: p?.description || p?.content || "",
          icon: p?.icon || ""
        };
      })
    : [];

  return {
    id: wpModule.id || 0,
    type: "selling-points",
    title: wpModule.title || "",
    points,
    columns:
      wpModule.columns === 1 || wpModule.columns === 2 || wpModule.columns === 3 || wpModule.columns === 4
        ? wpModule.columns
        : 3,
    layout:
      wpModule.layout === "grid" || wpModule.layout === "list" || wpModule.layout === "carousel"
        ? wpModule.layout
        : "grid",
    backgroundColor: typeof wpModule.backgroundColor === "string" ? wpModule.backgroundColor : "",
    fullWidth: typeof wpModule.fullWidth === "boolean" ? wpModule.fullWidth : false,
    order: typeof wpModule.order === "number" ? wpModule.order : 0,
    settings:
      wpModule.settings && typeof wpModule.settings === "object" && !Array.isArray(wpModule.settings)
        ? (wpModule.settings as Record<string, unknown>)
        : {},
  };
}

/**
 * Adapts a WordPress testimonials module
 * @param wpModule WordPress testimonials module data
 * @returns TestimonialsModule object
 */
function adaptTestimonialsModule(wpModule: unknown): TestimonialsModule {
  if (!isWPModule(wpModule)) {
    // fallback for type safety
    return {
      id: 0,
      type: "testimonials",
      title: "",
      testimonials: [],
      display_style: "carousel",
      display_count: 3,
      backgroundColor: "",
      order: 0,
      settings: {},
    };
  }
  // Extract testimonials array with consistent snake_case fields
  const testimonials = Array.isArray(wpModule.testimonials)
    ? wpModule.testimonials.map((testimonial: unknown) => {
        const t = testimonial as TestimonialsModule["testimonials"][number];
        return {
          id: t?.id || 0,
          content: t?.content || "",
          author_name: t?.author_name || "",
          author_position: t?.author_position || "",
          author_image: t?.author_image || "",
        };
      })
    : [];

  return {
    id: wpModule.id || 0,
    type: "testimonials",
    title: wpModule.title || "",
    testimonials,
    display_style: wpModule.display_style || "carousel",
    display_count:
      wpModule.display_count === 1 || wpModule.display_count === 2 || wpModule.display_count === 3 || wpModule.display_count === 4
        ? wpModule.display_count
        : 3,
    backgroundColor: wpModule.background_color || wpModule.backgroundColor || "",
    order: typeof wpModule.order === "number" ? wpModule.order : 0,
    settings:
      wpModule.settings && typeof wpModule.settings === "object" && !Array.isArray(wpModule.settings)
        ? (wpModule.settings as Record<string, unknown>)
        : {},
  };
}

/**
 * Adapts a WordPress featured posts module
 * @param wpModule WordPress featured posts module data
 * @returns FeaturedPostsModule object
 */
function adaptFeaturedPostsModule(wpModule: unknown): FeaturedPostsModule {
  if (!isWPModule(wpModule)) {
    return {
      id: 0,
      type: "featured-posts",
      title: "",
      posts: [],
      display_style: "grid",
      columns: 3,
      show_excerpt: true,
      show_categories: true,
      show_read_more: true,
      categories: [],
      order: 0,
      settings: {},
    };
  }
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
    display_style: wpModule.display_style || wpModule.displayStyle || "grid",
    columns:
      wpModule.columns === 1 || wpModule.columns === 2 || wpModule.columns === 3 || wpModule.columns === 4
        ? wpModule.columns
        : 3,
    show_excerpt: wpModule.show_excerpt !== false,
    show_categories: wpModule.show_categories !== false,
    show_read_more: wpModule.show_read_more !== false,
    categories: wpModule.categories?.map(String) || [],
    order: typeof wpModule.order === "number" ? wpModule.order : 0,
    settings:
      wpModule.settings && typeof wpModule.settings === "object" && !Array.isArray(wpModule.settings)
        ? (wpModule.settings as Record<string, unknown>)
        : {},
  };
}

/**
 * Adapts a WordPress stats module
 * @param wpModule WordPress stats module data
 * @returns StatsModule object
 */
function adaptStatsModule(wpModule: unknown): StatsModule {
  if (!isWPModule(wpModule)) {
    return {
      id: 0,
      type: "stats",
      title: "",
      subtitle: "",
      stats: [],
      backgroundColor: "",
      layout: "row",
      columns: 4,
      order: 0,
      settings: {},
    };
  }
  return {
    id: wpModule.id || 0,
    type: "stats",
    title: wpModule.title || "",
    subtitle: wpModule.subtitle || "",
    stats: Array.isArray(wpModule.stats)
      ? wpModule.stats.map((stat: unknown) => {
          const s = stat as StatsModule["stats"][number];
          return {
            id: s?.id || 0,
            value: s?.value || "",
            label: s?.label || "",
            icon: s?.icon || ""
          };
        })
      : [],
    backgroundColor: wpModule.background_color || wpModule.backgroundColor || "",
    layout: wpModule.layout || "row",
    columns:
      wpModule.columns === 2 || wpModule.columns === 3 || wpModule.columns === 4
        ? wpModule.columns
        : 4,
    order: typeof wpModule.order === "number" ? wpModule.order : 0,
    settings:
      wpModule.settings && typeof wpModule.settings === "object" && !Array.isArray(wpModule.settings)
        ? (wpModule.settings as Record<string, unknown>)
        : {},
  };
}

/**
 * Adapts a WordPress gallery module
 * @param wpModule WordPress gallery module data
 * @returns GalleryModule object
 */
function adaptGalleryModule(wpModule: unknown): GalleryModule {
  if (!isWPModule(wpModule)) {
    return {
      id: 0,
      type: "gallery",
      title: "",
      items: [],
      layout: "grid",
      columns: 3,
      enable_lightbox: true,
    };
  }
  const items = Array.isArray(wpModule.items)
    ? wpModule.items.map((item: unknown) => {
        const i = item as GalleryModule["items"][number];
        return {
          id: i?.id || 0,
          image: i?.image || "",
          title: i?.title || "",
          description: i?.description || "",
        };
      })
    : [];

  return {
    id: wpModule.id || 0,
    type: "gallery",
    title: typeof wpModule.title === "string" ? wpModule.title : "",
    items,
    layout:
      wpModule.layout === "grid" || wpModule.layout === "carousel" || wpModule.layout === "masonry"
        ? wpModule.layout
        : "grid",
    columns: wpModule.columns === 2 || wpModule.columns === 3 || wpModule.columns === 4 ? wpModule.columns : 3,
    enable_lightbox: typeof wpModule.enable_lightbox === "boolean" ? wpModule.enable_lightbox : true,
  };
}

/**
 * Adapts a WordPress text module
 * @param wpModule WordPress text module data
 * @returns Text module object
 */
function adaptTextModule(wpModule: unknown): TextModule {
  if (!isWPModule(wpModule)) {
    return {
      id: 0,
      type: "text",
      title: "",
      content: "",
      alignment: "left",
      text_size: "medium",
      enable_columns: false,
      columns_count: 2,
      order: 0,
      settings: {},
    };
  }
  return {
    id: wpModule.id || 0,
    type: "text",
    title: wpModule.title || "",
    content: wpModule.content || "",
    alignment: wpModule.alignment === "left" || wpModule.alignment === "center" || wpModule.alignment === "right"
      ? wpModule.alignment
      : "left",
    text_size: wpModule.text_size === "small" || wpModule.text_size === "medium" || wpModule.text_size === "large"
      ? wpModule.text_size
      : "medium",
    enable_columns: typeof wpModule.enable_columns === "boolean" ? wpModule.enable_columns : false,
    columns_count:
      wpModule.columns_count === 2 || wpModule.columns_count === 3
        ? wpModule.columns_count
        : 2,
    order: typeof wpModule.order === "number" ? wpModule.order : 0,
    settings:
      wpModule.settings && typeof wpModule.settings === "object" && !Array.isArray(wpModule.settings)
        ? (wpModule.settings as Record<string, unknown>)
        : {},
  };
}

/**
 * Adapts a WordPress form module
 * @param wpModule WordPress form module data
 * @returns Form module object
 */
function adaptFormModule(wpModule: unknown): FormModule {
  if (!isWPModule(wpModule)) {
    return {
      id: 0,
      type: "form",
      title: "",
      form_id: 0,
      description: "",
      success_message: "",
      error_message: "",
      redirect_url: "",
      order: 0,
      settings: {},
    };
  }
  return {
    id: wpModule.id || 0,
    type: "form",
    title: wpModule.title || "",
    form_id: wpModule.form_id || wpModule.formId || 0,
    description: wpModule.description || "",
    success_message: wpModule.success_message || wpModule.successMessage || "",
    error_message: wpModule.error_message || wpModule.errorMessage || "",
    redirect_url: wpModule.redirect_url || "",
    order: typeof wpModule.order === "number" ? wpModule.order : 0,
    settings:
      wpModule.settings && typeof wpModule.settings === "object" && !Array.isArray(wpModule.settings)
        ? (wpModule.settings as Record<string, unknown>)
        : {},
  };
}

/**
 * Adapts a WordPress accordion module
 * @param wpModule WordPress accordion or FAQ module data
 * @returns AccordionFaqModule object
 */
function adaptAccordionFaqModule(wpModule: unknown): AccordionFaqModule {
  if (!isWPModule(wpModule)) {
    return {
      id: 0,
      type: "accordion",
      items: [],
      allow_multiple_open: false,
      default_open_index: 0,
      backgroundColor: "",
      icon_position: "left",
    };
  }
  return {
    id: wpModule.id || 0,
    type:
      wpModule.type === "accordion" || wpModule.type === "faq"
        ? wpModule.type
        : "accordion",
    items: Array.isArray(wpModule.items)
      ? wpModule.items.map((item: unknown) => {
          const a = item as AccordionFaqItem;
          return {
            id: a?.id ?? 0,
            question: a?.question || "",
            answer: a?.answer || "",
            icon: a?.icon || undefined,
          };
        })
      : [],
    allow_multiple_open:
      typeof wpModule.allow_multiple_open === "boolean"
        ? wpModule.allow_multiple_open
        : false,
    default_open_index:
      typeof wpModule.default_open_index === "number" && !isNaN(wpModule.default_open_index)
        ? wpModule.default_open_index
        : 0,
    backgroundColor: typeof wpModule.backgroundColor === "string" ? wpModule.backgroundColor : "",
    icon_position:
      wpModule.icon_position === "left" || wpModule.icon_position === "right"
        ? wpModule.icon_position
        : "left",
  };
}

/**
 * Adapts a WordPress tabs module
 * @param wpModule WordPress tabs module data
 * @returns TabsModule object
 */
function adaptTabsModule(wpModule: unknown): TabsModule {
  if (!isWPModule(wpModule)) {
    return {
      id: 0,
      type: "tabs",
      title: "",
      tabs: [],
      order: 0,
      index: 0,
      settings: {},
    };
  }
  return {
    id: wpModule.id || 0,
    type: "tabs",
    title: wpModule.title || "",
    tabs: Array.isArray(wpModule.tabs)
      ? wpModule.tabs.map((tab: unknown) => {
          const t = tab as TabsModule["tabs"][number];
          return {
            id: t?.id || 0,
            title: t?.title || "",
            content: t?.content || "",
          };
        })
      : [],
    order: typeof wpModule.order === "number" ? wpModule.order : 0,
    index: typeof wpModule.index === "number" ? wpModule.index : 0,
    settings:
      wpModule.settings && typeof wpModule.settings === "object" && !Array.isArray(wpModule.settings)
        ? (wpModule.settings as Record<string, unknown>)
        : {},
  };
}

/**
 * Adapts a WordPress video module
 * @param wpModule WordPress video module data
 * @returns Video module object
 */
function adaptVideoModule(wpModule: unknown): VideoModule {
  if (!isWPModule(wpModule)) {
    return {
      id: 0,
      type: "video",
      title: "",
      video_url: "",
      video_type: "youtube",
      poster_image: undefined,
      autoplay: false,
      loop: false,
      muted: false,
      controls: true,
      allow_fullscreen: true,
    };
  }
  return {
    id: wpModule.id || 0,
    type: "video",
    title: wpModule.title || "",
    video_url: typeof wpModule.video_url === "string" ? wpModule.video_url : "",
    video_type:
      wpModule.video_type === "youtube" || wpModule.video_type === "vimeo" || wpModule.video_type === "local"
        ? wpModule.video_type
        : typeof wpModule.video_type === "string"
        ? (wpModule.video_type as "youtube" | "vimeo" | "local")
        : "youtube",
    poster_image: typeof wpModule.poster_image === "string" ? wpModule.poster_image : undefined,
    autoplay: typeof wpModule.autoplay === "boolean" ? wpModule.autoplay : false,
    loop: typeof wpModule.loop === "boolean" ? wpModule.loop : false,
    muted: typeof wpModule.muted === "boolean" ? wpModule.muted : false,
    controls: typeof wpModule.controls === "boolean" ? wpModule.controls : true,
    allow_fullscreen: typeof wpModule.allow_fullscreen === "boolean" ? wpModule.allow_fullscreen : true,
  };
}

/**
 * Adapts a WordPress chart module
 * @param wpModule WordPress chart module data
 * @returns Chart module object
 */
function adaptChartModule(wpModule: unknown): ChartModule {
  if (!isWPModule(wpModule)) {
    return {
      id: 0,
      type: "chart",
      title: "",
      chart_type: "bar",
      data: { labels: [], datasets: [] },
      options: {},
      order: 0,
      settings: {},
    };
  }
  // Ensure data has labels and datasets of correct type
  let chartData: { labels: string[]; datasets: { label: string; data: number[]; backgroundColor?: string | string[]; borderColor?: string }[] } = { labels: [], datasets: [] };
  if (
    wpModule.data &&
    typeof wpModule.data === "object" &&
    Array.isArray((wpModule.data as any).labels) &&
    Array.isArray((wpModule.data as any).datasets)
  ) {
    chartData = {
      labels: (wpModule.data as { labels: string[] }).labels,
      datasets: (wpModule.data as { datasets: { label: string; data: number[]; backgroundColor?: string | string[]; borderColor?: string }[] }).datasets,
    };
  }
  const allowedChartTypes = ["bar", "line", "pie", "doughnut", "radar"];
  return {
    id: wpModule.id || 0,
    type: "chart",
    title: wpModule.title || "",
    chart_type:
      typeof wpModule.chart_type === "string" && allowedChartTypes.includes(wpModule.chart_type)
        ? wpModule.chart_type as ChartModule["chart_type"]
        : typeof wpModule.chartType === "string" && allowedChartTypes.includes(wpModule.chartType)
        ? wpModule.chartType as ChartModule["chart_type"]
        : "bar",
    data: chartData,
    options:
      wpModule.options && typeof wpModule.options === "object" && !Array.isArray(wpModule.options)
        ? (wpModule.options as Record<string, unknown>)
        : {},
    order: typeof wpModule.order === "number" ? wpModule.order : 0,
    settings:
      wpModule.settings && typeof wpModule.settings === "object" && !Array.isArray(wpModule.settings)
        ? (wpModule.settings as Record<string, unknown>)
        : {},
  };
}

/**
 * Adapts a WordPress module to a base module
 * This is used for module types that don't have a specific adapter
 * @param wpModule WordPress module data
 * @returns BaseModule object
 */
function adaptBaseModule(wpModule: unknown): BaseModule {
  if (!isWPModule(wpModule)) {
    return {
      id: 0,
      type: "base",
      title: "",
      order: 0,
      settings: {},
    };
  }
  // Handle different possible sources for title and content
  let title = '';
  if (typeof wpModule.title === 'string') {
    title = wpModule.title;
  } else if (wpModule.title && typeof wpModule.title === 'object' && typeof (wpModule.title as any).rendered === 'string') {
    title = (wpModule.title as { rendered: string }).rendered;
  }
  let content = '';
  if (typeof wpModule.content === 'string') {
    content = wpModule.content;
  } else if (wpModule.content && typeof wpModule.content === 'object' && typeof (wpModule.content as any).rendered === 'string') {
    content = (wpModule.content as { rendered: string }).rendered;
  }
  return {
    id: typeof wpModule.id === 'number' ? wpModule.id : 0,
    type: typeof wpModule.type === 'string' ? wpModule.type : 'base',
    title,
    content,
    order: typeof wpModule.order === 'number' ? wpModule.order : 0,
    settings:
      wpModule.settings && typeof wpModule.settings === "object" && !Array.isArray(wpModule.settings)
        ? (wpModule.settings as Record<string, unknown>)
        : {},
  };
}

/**
 * Adapts WordPress homepage data to the application HomepageData format
 * @param wpHomepageData WordPress homepage data
 * @returns HomepageData object formatted for the application
 */
export function adaptWordPressHomepageData(wpHomepageData: unknown): HomepageData {
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
export function adaptWordPressModules(wpModules: unknown[]): Module[] {
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

/**
 * Adapts a WordPress testimonials module
 * @param wpModule WordPress testimonials module data
 * @returns TestimonialsModule object
 */
function adaptTestimonialsModule(wpModule: unknown): TestimonialsModule {
  if (!isWPModule(wpModule)) {
    // fallback for type safety
    return {
      id: 0,
      type: "testimonials",
      title: "",
      testimonials: [],
      display_style: "carousel",
      display_count: 1,
      backgroundColor: "",
      order: 0,
      settings: {},
    };
  }
  // Extract testimonials array with consistent snake_case fields
  const testimonials = Array.isArray(wpModule.testimonials)
    ? wpModule.testimonials.map((testimonial: unknown) => {
        const t = testimonial as TestimonialsModule["testimonials"][number];
        return {
          id: t?.id || 0,
          content: t?.content || "",
          author_name: t?.author_name || "",
          author_position: t?.author_position || "",
          author_image: t?.author_image || "",
        };
      })
    : [];

  return {
    id: wpModule.id || 0,
    type: "testimonials",
    title: typeof wpModule.title === "string" ? wpModule.title : "",
    testimonials,
    display_style:
      wpModule.display_style === "carousel" || wpModule.display_style === "grid" || wpModule.display_style === "list"
        ? wpModule.display_style
        : "carousel",
    display_count: typeof wpModule.display_count === "number" ? wpModule.display_count : 1,
    backgroundColor: wpModule.background_color || wpModule.backgroundColor || "",
    order: typeof wpModule.order === "number" ? wpModule.order : 0,
    settings:
      wpModule.settings && typeof wpModule.settings === "object" && !Array.isArray(wpModule.settings)
        ? (wpModule.settings as Record<string, unknown>)
        : {},
  };
}
