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
} from "@/lib/types/moduleTypes";
import { HomepageData } from "@/lib/types/contentTypes";
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

  // Use a generic record for property access
  const mod = wpModule as Record<string, unknown>;

  // Determine module type from WordPress snake_case fields
  let moduleType: string | undefined = undefined;
  if (typeof mod.type === 'string') {
    moduleType = mod.type;
  } else if (typeof mod.template === 'string') {
    moduleType = mod.template;
  } else if (typeof mod.acf_fc_layout === 'string') {
    moduleType = mod.acf_fc_layout;
  }

  if (!moduleType) {
    if (typeof mod.id !== 'undefined' && (typeof mod.title === 'string' || (mod.title && typeof (mod.title as { rendered?: unknown }).rendered === 'string'))) {
      console.log(`Using base adapter for module with ID: ${mod.id}`);
      return adaptBaseModule(mod);
    }
    console.warn("Could not determine module type:", mod);
    return null;
  }

  // Log the module type to help with debugging
  console.log(`Processing module of type: ${moduleType} (ID: ${mod.id})`);

  // Map from snake_case module types to our internal module adapter functions
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
    // camelCase variants for backwards compatibility
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
    return adaptBaseModule(mod);
  }

  console.log(`Mapped module type ${moduleType} → ${normalizedType}`);

  try {
    switch (normalizedType) {
      case 'hero':
        return adaptHeroModule(mod);
      case 'cta':
        return adaptCTAModule(mod);
      case 'selling-points':
        return adaptSellingPointsModule(mod);
      case 'testimonials':
        return adaptTestimonialsModule(mod);
      case 'featured-posts':
        return adaptFeaturedPostsModule(mod);
      case 'stats':
        return adaptStatsModule(mod);
      case 'gallery':
        return adaptGalleryModule(mod);
      case 'text':
        return adaptTextModule(mod);
      case 'form':
        return adaptFormModule(mod);
      case 'accordion-faq':
        return adaptAccordionFaqModule(mod);
      case 'tabs':
        return adaptTabsModule(mod);
      case 'video':
        return adaptVideoModule(mod);
      case 'chart':
        return adaptChartModule(mod);
      default:
        console.warn(`No specific adapter for module type: ${normalizedType}, using base adapter`);
        return adaptBaseModule(mod);
    }
  } catch (e) {
    console.error(`Error adapting module of type ${normalizedType}:`, e);
    try {
      return adaptBaseModule(mod);
    } catch (baseErr) {
      console.error('Even base module adapter failed:', baseErr);
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
  const mod = wpModule as Record<string, unknown>;
  return {
    id: typeof mod.id === 'number' ? mod.id : 0,
    type: "hero",
    title: typeof mod.title === 'string' ? mod.title : '',
    intro: typeof mod.intro === 'string' ? mod.intro : '',
    image: typeof mod.image === 'string' ? mod.image : '',
    video_url: typeof mod.video_url === 'string' ? mod.video_url : '',
    buttons: Array.isArray(mod.buttons)
      ? mod.buttons.map((btn) => {
          const b = (typeof btn === 'object' && btn !== null) ? btn as Record<string, unknown> : {};
          return {
            text: typeof b.text === 'string' ? b.text : '',
            url: typeof b.url === 'string' ? b.url : '',
            style: typeof b.style === 'string' && [
              'primary', 'secondary', 'outline', 'link', 'ghost', 'default', 'destructive']
              .includes(b.style)
              ? b.style as HeroModule['buttons'][number]['style']
              : 'primary',
            ...(typeof b.new_tab === 'boolean' ? { new_tab: b.new_tab } : {}),
          };
        })
      : [],
    overlay_opacity: typeof mod.overlay_opacity === 'number' ? mod.overlay_opacity : 0.3,
    text_color: typeof mod.text_color === 'string' ? mod.text_color : '',
    height: typeof mod.height === 'string' ? mod.height : '',
    alignment:
      typeof mod.alignment === 'string' && ['left', 'right', 'center'].includes(mod.alignment)
        ? (mod.alignment as 'left' | 'right' | 'center')
        : 'center',
    order: typeof mod.order === 'number' ? mod.order : 0,
    settings:
      mod.settings && typeof mod.settings === 'object' && !Array.isArray(mod.settings)
        ? (mod.settings as Record<string, unknown>)
        : {} as Record<string, unknown>,
  };
}

/**
 * Adapts a WordPress CTA module
 * @param wpModule WordPress CTA module data
 * @returns CTAModule object
 */
function adaptCTAModule(wpModule: unknown): CTAModule {
  const mod = wpModule as Record<string, unknown>;
  let buttonText = '';
  let buttonUrl = '';
  if (typeof mod.button_text === 'string' && typeof mod.button_url === 'string') {
    buttonText = mod.button_text;
    buttonUrl = mod.button_url;
  } else if (
    Array.isArray(mod.buttons) &&
    mod.buttons.length > 0 &&
    typeof (mod.buttons[0] as Record<string, unknown>).text === 'string' &&
    typeof (mod.buttons[0] as Record<string, unknown>).url === 'string'
  ) {
    buttonText = (mod.buttons[0] as Record<string, string>).text;
    buttonUrl = (mod.buttons[0] as Record<string, string>).url;
  }
  return {
    id: typeof mod.id === 'number' ? mod.id : 0,
    type: 'cta',
    title: typeof mod.title === 'string' ? mod.title : '',
    description:
      typeof mod.content === 'string'
        ? mod.content
        : typeof mod.description === 'string'
        ? mod.description
        : '',
    buttonText,
    buttonUrl,
    backgroundColor:
      typeof mod.background_color === 'string'
        ? mod.background_color
        : typeof mod.backgroundColor === 'string'
        ? mod.backgroundColor
        : '',
    textColor:
      typeof mod.text_color === 'string'
        ? mod.text_color
        : typeof mod.textColor === 'string'
        ? mod.textColor
        : '',
    alignment:
      typeof mod.layout === 'string' && ['left', 'right', 'center'].includes(mod.layout)
        ? (mod.layout as 'left' | 'right' | 'center')
        : 'center',
    image:
      typeof mod.featured_image === 'string'
        ? mod.featured_image
        : typeof mod.image === 'string'
        ? mod.image
        : '',
    order: typeof mod.order === 'number' ? mod.order : 0,
    settings:
      mod.settings && typeof mod.settings === 'object' && !Array.isArray(mod.settings)
        ? (mod.settings as Record<string, unknown>)
        : {} as Record<string, unknown>,
  };
}

/**
 * Adapts a WordPress selling points module
 * @param wpModule WordPress selling points module data
 * @returns SellingPointsModule object
 */
function adaptSellingPointsModule(wpModule: unknown): SellingPointsModule {
  const mod = wpModule as Record<string, unknown>;
  const points = Array.isArray(mod.points)
    ? mod.points.map((point) => {
        const p = (typeof point === 'object' && point !== null) ? point as Record<string, unknown> : {};
        return {
          id: typeof p.id === 'number' ? p.id : 0,
          title: typeof p.title === 'string' ? p.title : '',
          content: typeof p.content === 'string' ? p.content : (typeof p.description === 'string' ? p.description : ''),
          description: typeof p.description === 'string' ? p.description : '',
          icon: typeof p.icon === 'string' ? p.icon : '',
        };
      })
    : [];
  return {
    id: typeof mod.id === 'number' ? mod.id : 0,
    type: 'selling-points',
    title: typeof mod.title === 'string' ? mod.title : '',
    points,
    columns: [1, 2, 3, 4].includes(Number(mod.columns)) ? Number(mod.columns) as 1 | 2 | 3 | 4 : 3,
    layout: typeof mod.layout === 'string' && ['grid', 'list', 'carousel'].includes(mod.layout)
      ? mod.layout as 'grid' | 'list' | 'carousel'
      : 'grid',
    backgroundColor: typeof mod.backgroundColor === 'string' ? mod.backgroundColor : '',
    fullWidth: typeof mod.fullWidth === 'boolean' ? mod.fullWidth : false,
    order: typeof mod.order === 'number' ? mod.order : 0,
    settings:
      mod.settings && typeof mod.settings === 'object' && !Array.isArray(mod.settings)
        ? (mod.settings as Record<string, unknown>)
        : {} as Record<string, unknown>,
  };
}

/**
 * Adapts a WordPress testimonials module
 * @param wpModule WordPress testimonials module data
 * @returns TestimonialsModule object
 */
function adaptTestimonialsModule(wpModule: unknown): TestimonialsModule {
  const mod = wpModule as Record<string, unknown>;
  const testimonials = Array.isArray(mod.testimonials)
    ? mod.testimonials.map((t) => {
        const tt = (typeof t === 'object' && t !== null) ? t as Record<string, unknown> : {};
        return {
          id: typeof tt.id === 'number' ? tt.id : 0,
          content: typeof tt.quote === 'string' ? tt.quote : '',
          author_name: typeof tt.name === 'string' ? tt.name : '',
          author_position: typeof tt.author_position === 'string' ? tt.author_position : '',
          author_image: typeof tt.image === 'string' ? tt.image : '',
        };
      })
    : [];
  return {
    id: typeof mod.id === 'number' ? mod.id : 0,
    type: 'testimonials',
    title: typeof mod.title === 'string' ? mod.title : '',
    testimonials,
    display_style: typeof mod.display_style === 'string' && ['carousel', 'grid', 'list'].includes(mod.display_style)
      ? mod.display_style as 'carousel' | 'grid' | 'list'
      : 'carousel',
    display_count: [1, 2, 3, 4].includes(Number(mod.display_count)) ? Number(mod.display_count) as 1 | 2 | 3 | 4 : 3,
    backgroundColor: typeof mod.background_color === 'string' ? mod.background_color : (typeof mod.backgroundColor === 'string' ? mod.backgroundColor : ''),
    order: typeof mod.order === 'number' ? mod.order : 0,
    settings:
      mod.settings && typeof mod.settings === 'object' && !Array.isArray(mod.settings)
        ? (mod.settings as Record<string, unknown>)
        : {} as Record<string, unknown>,
  };
}

/**
 * Adapts a WordPress featured posts module
 * @param wpModule WordPress featured posts module data
 * @returns FeaturedPostsModule object
 */
function adaptFeaturedPostsModule(wpModule: unknown): FeaturedPostsModule {
  const mod = wpModule as Record<string, unknown>;
  const posts = Array.isArray(mod.posts) ? mod.posts.map(String) : [];
  const categories = Array.isArray(mod.categories) ? mod.categories.map(String) : [];
  return {
    id: typeof mod.id === 'number' ? mod.id : 0,
    type: 'featured-posts',
    title: typeof mod.title === 'string' ? mod.title : '',
    posts,
    display_style: typeof mod.display_style === 'string' && ['carousel', 'grid', 'list'].includes(mod.display_style)
      ? mod.display_style as 'carousel' | 'grid' | 'list'
      : 'grid',
    columns: [1, 2, 3, 4].includes(Number(mod.columns)) ? Number(mod.columns) as 1 | 2 | 3 | 4 : 3,
    show_excerpt: mod.show_excerpt !== false,
    show_categories: mod.show_categories !== false,
    show_read_more: mod.show_read_more !== false,
    categories,
    order: typeof mod.order === 'number' ? mod.order : 0,
    settings:
      mod.settings && typeof mod.settings === 'object' && !Array.isArray(mod.settings)
        ? (mod.settings as Record<string, unknown>)
        : {} as Record<string, unknown>,
  };
}

/**
 * Adapts a WordPress stats module
 * @param wpModule WordPress stats module data
 * @returns StatsModule object
 */
function adaptStatsModule(wpModule: unknown): StatsModule {
  const mod = wpModule as Record<string, unknown>;
  const stats = Array.isArray(mod.stats) ? mod.stats.map((s) => {
    const stat = (typeof s === 'object' && s !== null) ? s as Record<string, unknown> : {};
    return {
      id: typeof stat.id === 'number' ? stat.id : 0,
      value: typeof stat.value === 'string' ? stat.value : '',
      label: typeof stat.label === 'string' ? stat.label : '',
      icon: typeof stat.icon === 'string' ? stat.icon : '',
    };
  }) : [];
  return {
    id: typeof mod.id === 'number' ? mod.id : 0,
    type: 'stats',
    title: typeof mod.title === 'string' ? mod.title : '',
    subtitle: typeof mod.subtitle === 'string' ? mod.subtitle : '',
    stats,
    backgroundColor: typeof mod.backgroundColor === 'string' ? mod.backgroundColor : '',
    layout: typeof mod.layout === 'string' && ['grid', 'row'].includes(mod.layout)
      ? mod.layout as 'grid' | 'row'
      : 'row',
    columns: [2, 3, 4].includes(Number(mod.columns)) ? Number(mod.columns) as 2 | 3 | 4 : 4,
    order: typeof mod.order === 'number' ? mod.order : 0,
    settings:
      mod.settings && typeof mod.settings === 'object' && !Array.isArray(mod.settings)
        ? (mod.settings as Record<string, unknown>)
        : {} as Record<string, unknown>,
  };
}

/**
 * Adapts a WordPress gallery module
 * @param wpModule WordPress gallery module data
 * @returns GalleryModule object
 */
function adaptGalleryModule(wpModule: unknown): GalleryModule {
  const mod = wpModule as Record<string, unknown>;
  const items = Array.isArray(mod.items)
    ? mod.items.map((item) => {
        const i = (typeof item === 'object' && item !== null) ? item as Record<string, unknown> : {};
        return {
          id: typeof i.id === 'number' ? i.id : 0,
          image: typeof i.image === 'string' ? i.image : '',
          caption: typeof i.caption === 'string' ? i.caption : '',
        };
      })
    : [];
  return {
    id: typeof mod.id === 'number' ? mod.id : 0,
    type: 'gallery',
    title: typeof mod.title === 'string' ? mod.title : '',
    items,
    layout: typeof mod.layout === 'string' && ['grid', 'carousel', 'masonry'].includes(mod.layout) ? mod.layout as 'grid' | 'carousel' | 'masonry' : 'grid',
    columns: [2, 3, 4].includes(Number(mod.columns)) ? Number(mod.columns) as 2 | 3 | 4 : 3,
    enable_lightbox: typeof mod.enable_lightbox === 'boolean' ? mod.enable_lightbox : true,
  };
}

/**
 * Adapts a WordPress text module
 * @param wpModule WordPress text module data
 * @returns Text module object
 */
function adaptTextModule(wpModule: unknown): TextModule {
  const mod = wpModule as Record<string, unknown>;
  return {
    id: typeof mod.id === 'number' ? mod.id : 0,
    type: 'text',
    title: typeof mod.title === 'string' ? mod.title : '',
    content: typeof mod.content === 'string' ? mod.content : '',
    alignment: typeof mod.alignment === 'string' && ['left', 'center', 'right'].includes(mod.alignment)
      ? mod.alignment as 'left' | 'center' | 'right'
      : 'left',
    text_size: typeof mod.text_size === 'string' && ['small', 'medium', 'large'].includes(mod.text_size)
      ? mod.text_size as 'small' | 'medium' | 'large'
      : 'medium',
    enable_columns: typeof mod.enable_columns === 'boolean' ? mod.enable_columns : false,
    columns_count: [2, 3].includes(Number(mod.columns_count)) ? Number(mod.columns_count) as 2 | 3 : 2,
    order: typeof mod.order === 'number' ? mod.order : 0,
    settings:
      mod.settings && typeof mod.settings === 'object' && !Array.isArray(mod.settings)
        ? (mod.settings as Record<string, unknown>)
        : {} as Record<string, unknown>,
  };
}

/**
 * Adapts a WordPress form module
 * @param wpModule WordPress form module data
 * @returns Form module object
 */
function adaptFormModule(wpModule: unknown): FormModule {
  const mod = wpModule as Record<string, unknown>;
  return {
    id: typeof mod.id === 'number' ? mod.id : 0,
    type: 'form',
    title: typeof mod.title === 'string' ? mod.title : '',
    form_id: typeof mod.form_id === 'number' ? mod.form_id : (typeof mod.formId === 'number' ? mod.formId : 0),
    description: typeof mod.description === 'string' ? mod.description : '',
    success_message: typeof mod.success_message === 'string' ? mod.success_message : (typeof mod.successMessage === 'string' ? mod.successMessage : ''),
    error_message: typeof mod.error_message === 'string' ? mod.error_message : (typeof mod.ErrorMessage === 'string' ? mod.ErrorMessage : ''),
    redirect_url: typeof mod.redirect_url === 'string' ? mod.redirect_url : '',
    order: typeof mod.order === 'number' ? mod.order : 0,
    settings:
      mod.settings && typeof mod.settings === 'object' && !Array.isArray(mod.settings)
        ? (mod.settings as Record<string, unknown>)
        : {} as Record<string, unknown>,
  };
}

/**
 * Adapts a WordPress accordion module
 * @param wpModule WordPress accordion or FAQ module data
 * @returns AccordionFaqModule object
 */
function adaptAccordionFaqModule(wpModule: unknown): AccordionFaqModule {
  const mod = wpModule as Record<string, unknown>;
  const items = Array.isArray(mod.items)
    ? mod.items.map((item) => {
        const i = (typeof item === 'object' && item !== null) ? item as Record<string, unknown> : {};
        return {
          question: typeof i.question === 'string' ? i.question : '',
          answer: typeof i.answer === 'string' ? i.answer : '',
        };
      })
    : [];
  return {
    id: typeof mod.id === 'number' ? mod.id : 0,
    type: 'accordion',
    title: typeof mod.title === 'string' ? mod.title : '',
    items,
    order: typeof mod.order === 'number' ? mod.order : 0,
    settings:
      mod.settings && typeof mod.settings === 'object' && !Array.isArray(mod.settings)
        ? (mod.settings as Record<string, unknown>)
        : {} as Record<string, unknown>,
  };
}

/**
 * Adapts a WordPress tabs module
 * @param wpModule WordPress tabs module data
 * @returns TabsModule object
 */
function adaptTabsModule(wpModule: unknown): TabsModule {
  const mod = wpModule as Record<string, unknown>;
  const tabs = Array.isArray(mod.tabs)
    ? mod.tabs.map((tab) => {
        const t = (typeof tab === 'object' && tab !== null) ? tab as Record<string, unknown> : {};
        return {
          id: typeof t.id === 'number' ? t.id : 0,
          title: typeof t.label === 'string' ? t.label : '',
          content: typeof t.content === 'string' ? t.content : '',
        };
      })
    : [];
  return {
    id: typeof mod.id === 'number' ? mod.id : 0,
    type: 'tabs',
    title: typeof mod.title === 'string' ? mod.title : '',
    tabs,
    order: typeof mod.order === 'number' ? mod.order : 0,
    index: typeof mod.index === 'number' ? mod.index : 0,
    settings:
      mod.settings && typeof mod.settings === 'object' && !Array.isArray(mod.settings)
        ? (mod.settings as Record<string, unknown>)
        : {} as Record<string, unknown>,
  };
}

/**
 * Adapts a WordPress video module
 * @param wpModule WordPress video module data
 * @returns Video module object
 */
function adaptVideoModule(wpModule: unknown): VideoModule {
  const mod = wpModule as Record<string, unknown>;
  const allowedTypes = ['youtube', 'vimeo', 'local'];
  return {
    id: typeof mod.id === 'number' ? mod.id : 0,
    type: 'video',
    title: typeof mod.title === 'string' ? mod.title : '',
    video_url: typeof mod.video_url === 'string' ? mod.video_url : '',
    video_type: typeof mod.video_type === 'string' && allowedTypes.includes(mod.video_type)
      ? mod.video_type as 'youtube' | 'vimeo' | 'local'
      : 'youtube',
    poster_image: typeof mod.poster_image === 'string' ? mod.poster_image : undefined,
    autoplay: typeof mod.autoplay === 'boolean' ? mod.autoplay : false,
    loop: typeof mod.loop === 'boolean' ? mod.loop : false,
    muted: typeof mod.muted === 'boolean' ? mod.muted : false,
    controls: typeof mod.controls === 'boolean' ? mod.controls : true,
    allow_fullscreen: typeof mod.allow_fullscreen === 'boolean' ? mod.allow_fullscreen : true,
  };
}

/**
 * Adapts a WordPress chart module
 * @param wpModule WordPress chart module data
 * @returns Chart module object
 */
function adaptChartModule(wpModule: unknown): ChartModule {
  const mod = wpModule as Record<string, unknown>;
  const allowedChartTypes = ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea'];
  const chartType = typeof mod.chart_type === 'string' && allowedChartTypes.includes(mod.chart_type)
    ? mod.chart_type as ChartModule['chart_type']
    : typeof mod.chartType === 'string' && allowedChartTypes.includes(mod.chartType)
    ? mod.chartType as ChartModule['chart_type']
    : 'bar';
  const chartData =
    typeof mod.data === 'object' &&
    mod.data !== null &&
    Array.isArray((mod.data as Record<string, unknown>).labels) &&
    Array.isArray((mod.data as Record<string, unknown>).datasets)
      ? (mod.data as { labels: string[]; datasets: { label: string; data: number[]; backgroundColor?: string | string[]; borderColor?: string }[] })
      : { labels: [], datasets: [] };
  const chartOptions = typeof mod.options === 'object' && mod.options !== null ? mod.options : {};
  const chartSettings = mod.settings && typeof mod.settings === 'object' && !Array.isArray(mod.settings)
    ? (mod.settings as Record<string, unknown>)
    : {} as Record<string, unknown>;
  return {
    id: typeof mod.id === 'number' ? mod.id : 0,
    type: 'chart',
    title: typeof mod.title === 'string' ? mod.title : '',
    chart_type: chartType,
    data: chartData,
    options: chartOptions,
    order: typeof mod.order === 'number' ? mod.order : 0,
    settings: chartSettings,
  };
}

/**
 * Adapts a WordPress module to a base module
 * This is used for module types that don't have a specific adapter
 * @param wpModule WordPress module data
 * @returns BaseModule object
 */
function adaptBaseModule(wpModule: unknown): BaseModule {
  const mod = wpModule as Record<string, unknown>;
  let title = '';
  if (typeof mod.title === 'string') {
    title = mod.title;
  } else if (typeof mod.title === 'object' && mod.title !== null && typeof (mod.title as { rendered?: unknown }).rendered === 'string') {
    title = (mod.title as { rendered: string }).rendered;
  }
  let content = '';
  if (typeof mod.content === 'string') {
    content = mod.content;
  } else if (typeof mod.content === 'object' && mod.content !== null && typeof (mod.content as { rendered?: unknown }).rendered === 'string') {
    content = (mod.content as { rendered: string }).rendered;
  }
  return {
    id: typeof mod.id === 'number' ? mod.id : 0,
    type: typeof mod.type === 'string' ? mod.type : 'base',
    title,
    content,
    order: typeof mod.order === 'number' ? mod.order : 0,
    settings:
      mod.settings && typeof mod.settings === 'object' && !Array.isArray(mod.settings)
        ? (mod.settings as Record<string, unknown>)
        : {} as Record<string, unknown>,
  };
}

// --- Type guard for homepage data from WP API ---
interface WPHomepageData {
  id?: unknown;
  slug?: unknown;
  title?: unknown;
  content?: unknown;
  hero?: unknown;
  featured_posts_title?: unknown;
  selling_points?: unknown;
  selling_points_title?: unknown;
  stats?: unknown;
  stats_title?: unknown;
  stats_subtitle?: unknown;
  featured_posts?: unknown;
  modules?: unknown;
}

function isWPHomepageData(obj: unknown): obj is WPHomepageData {
  return typeof obj === 'object' && obj !== null;
}

// --- Adapt homepage data with runtime checks and type safety ---
export function adaptHomepageData(wpHomepageData: unknown): HomepageData {
  if (!isWPHomepageData(wpHomepageData)) {
    return {
      id: 0,
      slug: '',
      title: { rendered: '' },
      content: { rendered: '' },
      hero: undefined,
      featured_posts_title: '',
      selling_points: [],
      selling_points_title: '',
      stats: [],
      stats_title: '',
      stats_subtitle: '',
      featured_posts: [],
      modules: [],
    };
  }
  return {
    id: typeof wpHomepageData.id === 'number' ? wpHomepageData.id : 0,
    slug: typeof wpHomepageData.slug === 'string' ? wpHomepageData.slug : '',
    title: typeof wpHomepageData.title === 'object' && wpHomepageData.title !== null && 'rendered' in wpHomepageData.title ? wpHomepageData.title as { rendered: string } : { rendered: '' },
    content: typeof wpHomepageData.content === 'object' && wpHomepageData.content !== null && 'rendered' in wpHomepageData.content ? wpHomepageData.content as { rendered: string } : { rendered: '' },
    hero: typeof wpHomepageData.hero === 'object' && wpHomepageData.hero !== null ? adaptHeroModule(wpHomepageData.hero) : undefined,
    featured_posts_title: typeof wpHomepageData.featured_posts_title === 'string' ? wpHomepageData.featured_posts_title : '',
    selling_points: Array.isArray(wpHomepageData.selling_points) ? wpHomepageData.selling_points : [],
    selling_points_title: typeof wpHomepageData.selling_points_title === 'string' ? wpHomepageData.selling_points_title : '',
    stats: Array.isArray(wpHomepageData.stats) ? wpHomepageData.stats : [],
    stats_title: typeof wpHomepageData.stats_title === 'string' ? wpHomepageData.stats_title : '',
    stats_subtitle: typeof wpHomepageData.stats_subtitle === 'string' ? wpHomepageData.stats_subtitle : '',
    featured_posts: Array.isArray(wpHomepageData.featured_posts)
      ? wpHomepageData.featured_posts.map((post) => {
          const adapted = adaptWordPressPosts([post]);
          return adapted.length > 0 ? adapted[0] : undefined;
        })
      : [],
    modules: Array.isArray(wpHomepageData.modules)
      ? wpHomepageData.modules
          .map((module) => adaptWordPressModule(module))
          .filter((m): m is Module => m !== null)
      : [],
  };
}

/**
 * Adapts multiple WordPress modules to the application Module format
 * @param wpModules Array of WordPress modules
 * @returns Array of Module objects
 */
export function adaptWordPressModules(wpModules: unknown[]): Module[] {
  return wpModules
    .map((module) => {
      try {
        const adapted = adaptWordPressModule(module);
        if (adapted) {
          return adapted;
        }
        return null;
      } catch {
        return null;
      }
    })
    .filter((module): module is Module => module !== null);
}
