// src/lib/adapters/pageAdapter.ts
import { WordPressPage } from '@/lib/types/wordpressTypes';
import { Page, LocalPage } from "@/lib/types";
import { getOptimalImageSize } from "@/lib/imageUtils";

/**
 * Adapts a WordPress page to the application Page format
 * @param wpPage WordPress page data
 * @returns Page object formatted for the application
 */
export function adaptWordPressPage(wpPage: any): Page {
  // Cast as any to handle custom fields that might not be in the standard WP REST API schema
  const pageData: any = {
    id: wpPage.id,
    slug: wpPage.slug,
    title: {
      rendered: wpPage.title?.rendered || "",
    },
    content: {
      rendered: wpPage.content?.rendered || "",
    },
    template: wpPage.template || "default",
    _embedded: wpPage._embedded,
  };

  // Add modules array if available in the WordPress response
  // This is a custom field added via WordPress custom code
  if (Array.isArray(wpPage.modules)) {
    pageData.modules = wpPage.modules;
  } else {
    pageData.modules = [];
  }

  return pageData as Page;
}

/**
 * Adapts a WordPress page to the application LocalPage format
 * @param wpPage WordPress page data
 * @returns LocalPage object formatted for the application
 */
export function adaptWordPressPageToLocalPage(wpPage: any): LocalPage | null {
  if (!wpPage || !wpPage.id || !wpPage.slug) {
    console.error('Missing required page fields:', {
      id: wpPage?.id,
      slug: wpPage?.slug
    });
    return null;
  }

  const featuredMedia = wpPage._embedded?.["wp:featuredmedia"]?.[0];

  // Create the base page data with standard WordPress fields
  const localPageData: Partial<LocalPage> = {
    id: wpPage.id,
    slug: wpPage.slug,
    title: {
      rendered: wpPage.title?.rendered || "",
    },
    excerpt: wpPage.excerpt ?? { rendered: "" },
    content: {
      rendered: wpPage.content?.rendered || "",
    },
    featured_image_url: featuredMedia
      ? getOptimalImageSize(featuredMedia, "large")
      : undefined,
    template: wpPage.template ?? "",
    _embedded: wpPage._embedded,
  };

  // Add custom fields that might be added by the WordPress site's custom code
  // These aren't part of the standard WordPress REST API schema
  if (wpPage.chartData !== undefined) {
    localPageData.chartData = wpPage.chartData;
  }

  if (wpPage.type !== undefined) {
    localPageData.type = wpPage.type;
  }

  if (Array.isArray(wpPage.modules)) {
    localPageData.modules = wpPage.modules;
  } else {
    localPageData.modules = [];
  }

  return localPageData as LocalPage;
}

/**
 * Adapts multiple WordPress pages to the application Page format
 * @param wpPages Array of WordPress page data
 * @returns Array of Page objects formatted for the application
 */
export function adaptWordPressPages(wpPages: any[]): Page[] {
  if (!Array.isArray(wpPages)) return [];

  return wpPages.map((page) => adaptWordPressPage(page));
}
