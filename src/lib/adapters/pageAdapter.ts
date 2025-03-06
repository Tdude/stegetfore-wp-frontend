// src/lib/adapters/pageAdapter.ts
import { Page, LocalPage } from "@/lib/types";
import { getOptimalImageSize } from "@/lib/imageUtils";

/**
 * Adapts a WordPress page to the application Page format
 * @param wpPage WordPress page data
 * @returns Page object formatted for the application
 */
export function adaptWordPressPage(wpPage: any): Page {
  if (!wpPage) {
    return {
      id: 0,
      slug: "",
      title: { rendered: "" },
      excerpt: { rendered: "" },
      content: { rendered: "" },
      featured_image_url: null,
      template: "",
      chartData: null,
      parent: 0,
      menu_order: 0,
      date: "",
      modified: "",
      _embedded: {},
    };
  }

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
    featured_image_url:
      wpPage._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
      wpPage.featured_image_url ||
      null,
    template: wpPage.template || "",
    chartData: wpPage.chartData || null,
    parent: wpPage.parent,
    menu_order: wpPage.menu_order,
    date: wpPage.date,
    modified: wpPage.modified,
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
