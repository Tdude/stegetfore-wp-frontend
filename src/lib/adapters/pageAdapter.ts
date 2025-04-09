// src/lib/adapters/pageAdapter.ts
import { Page, LocalPage } from "@/lib/types";
// Explicitly import from moduleTypes.ts to avoid type conflicts
import { Module } from "@/lib/types/moduleTypes";
import { getOptimalImageSize } from "@/lib/imageUtils";
import { adaptWordPressModules } from "./moduleAdapter";

/**
 * Adapts a WordPress page to the application Page format
 * @param wpPage WordPress page data
 * @returns Page object formatted for the application
 */
export function adaptWordPressPage(wpPage: any): Page {
  // Extract and ensure modules is an array if present
  const modules = Array.isArray(wpPage.modules) ? wpPage.modules : 
                  (wpPage.acf?.modules && Array.isArray(wpPage.acf.modules)) ? wpPage.acf.modules : 
                  [];
                  
  return {
    id: wpPage.id,
    slug: wpPage.slug,
    title: {
      rendered: wpPage.title?.rendered || "",
    },
    content: {
      rendered: wpPage.content?.rendered || "",
    },
    excerpt: wpPage.excerpt ? {
      rendered: wpPage.excerpt.rendered || "",
    } : undefined,
    template: wpPage.template || "default",
    modules: modules,
    _embedded: wpPage._embedded,
    featured_media: wpPage.featured_media || 0,
    featured_image_url: extractFeaturedImageUrl(wpPage),
  };
}

/**
 * Adapts a WordPress page to the application LocalPage format
 * This version is more strictly typed and includes additional properties
 * @param wpPage WordPress page data
 * @returns LocalPage object formatted for the application
 */
export function adaptWordPressPageToLocalPage(wpPage: any): LocalPage {
  // Extract modules directly from the page data
  const rawModules = Array.isArray(wpPage.modules) ? wpPage.modules : 
                     (wpPage.acf?.modules && Array.isArray(wpPage.acf.modules)) ? wpPage.acf.modules : 
                     [];
  
  // Adapt modules if we have them
  const adaptedModules = adaptWordPressModules(rawModules);
                     
  // Create the base page
  const page: LocalPage = {
    id: wpPage.id,
    slug: wpPage.slug,
    title: {
      rendered: wpPage.title?.rendered || "",
    },
    content: {
      rendered: wpPage.content?.rendered || "",
    },
    excerpt: wpPage.excerpt ? {
      rendered: wpPage.excerpt.rendered || "",
    } : undefined,
    template: wpPage.template || "default",
    modules: adaptedModules, // Use the adapted modules
    featured_media: wpPage.featured_media || 0,
    featured_image_url: extractFeaturedImageUrl(wpPage),
  };

  // Handle specific template data
  if (wpPage.template === "templates/circle-chart.php") {
    page.chartData = extractChartData(wpPage);
  } else if (wpPage.template === "templates/evaluation.php") {
    page.evaluationId = wpPage.acf?.evaluation_form_id || "";
  }

  return page;
}

/**
 * Adapts multiple WordPress pages to the application Page format
 * @param wpPages Array of WordPress page data
 * @returns Array of Page objects formatted for the application
 */
export function adaptWordPressPages(wpPages: any[]): Page[] {
  if (!Array.isArray(wpPages)) {
    console.warn("adaptWordPressPages: expected array but got", typeof wpPages);
    return [];
  }
  
  return wpPages.map(adaptWordPressPage);
}

/**
 * Extracts the featured image URL from a WordPress page
 * @param wpPage WordPress page data
 * @returns Featured image URL or undefined
 */
function extractFeaturedImageUrl(wpPage: any): string | undefined {
  if (!wpPage._embedded || !wpPage._embedded["wp:featuredmedia"]) {
    return undefined;
  }

  const featuredMedia = wpPage._embedded["wp:featuredmedia"][0];
  
  if (!featuredMedia) {
    return undefined;
  }

  return featuredMedia.source_url || undefined;
}

/**
 * Extracts chart data from a WordPress page
 * @param wpPage WordPress page data
 * @returns Chart data or null
 */
function extractChartData(wpPage: any): { segments: number[] } | null {
  if (!wpPage.acf || !wpPage.acf.chart_data || !Array.isArray(wpPage.acf.chart_data)) {
    return null;
  }

  // Convert string values to numbers and filter out NaN values
  const segments = wpPage.acf.chart_data
    .map((value: any) => parseFloat(value))
    .filter((value: number) => !isNaN(value));

  return { segments };
}
