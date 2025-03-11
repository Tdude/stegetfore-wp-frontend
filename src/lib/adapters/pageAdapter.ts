// src/lib/adapters/pageAdapter.ts
import Page, { LocalPage } from "@/lib/types";
import { getOptimalImageSize } from "@/lib/imageUtils";

/**
 * Adapts a WordPress page to the application Page format
 * @param wpPage WordPress page data
 * @returns Page object formatted for the application
 */
export function adaptWordPressPage(wpPage: any): Page {
  return {
    id: wpPage.id,
    slug: wpPage.slug,
    title: {
      rendered: wpPage.title?.rendered || "",
    },
    content: {
      rendered: wpPage.content?.rendered || "",
    },
    template: wpPage.template || "default",
    modules: wpPage.modules || [], // Add this line
    _embedded: wpPage._embedded,
  };
}

/**
 * Adapts a WordPress page to the application LocalPage format
 * This version is more strictly typed and includes additional properties
 * @param wpPage WordPress page data
 * @returns LocalPage object formatted for the application
 */
export function adaptWordPressPageToLocalPage(wpPage: any): LocalPage {
  if (!wpPage) return null;

  const featuredMedia = wpPage._embedded?.["wp:featuredmedia"]?.[0];

  return {
    id: wpPage.id,
    slug: wpPage.slug,
    title: {
      rendered: wpPage.title?.rendered || "",
    },
    excerpt: {
      rendered: wpPage.excerpt?.rendered || "",
    },
    content: {
      rendered: wpPage.content?.rendered || "",
    },
    // Get optimal image size if available
    featured_image_url: featuredMedia
      ? getOptimalImageSize(featuredMedia, "large")
      : wpPage.featured_image_url || null,
    template: wpPage.template || "",
    chartData: wpPage.chartData || null,
    evaluationId: wpPage.evaluationId || undefined,
    type: wpPage.type || "page",
    // Add modules array if available
    modules: wpPage.modules || [],
  };
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
