// src/lib/adapters/siteAdapter.ts
import { SiteInfo, MenuItem } from "@/lib/types";

/**
 * Adapts WordPress site info to the application SiteInfo format
 * @param wpSiteInfo WordPress site info data
 * @returns SiteInfo object formatted for the application
 */
export function adaptWordPressSiteInfo(wpSiteInfo: any): SiteInfo {
  if (!wpSiteInfo) return { name: "", description: "" };

  return {
    name: wpSiteInfo.name || "",
    description: wpSiteInfo.description || "",
    url: wpSiteInfo.url || "",
    admin_email: wpSiteInfo.admin_email || "",
    language: wpSiteInfo.language || "",
    logo_url: wpSiteInfo.logo_url || "",
    favicon_url: wpSiteInfo.favicon_url || "",
    social_links: wpSiteInfo.social_links || {},
  };
}

/**
 * Adapts WordPress menu items to the application MenuItem format
 * @param wpMenuItems WordPress menu items data
 * @returns Array of MenuItem objects formatted for the application
 */
export function adaptWordPressMenuItems(wpMenuItems: any[]): MenuItem[] {
  if (!Array.isArray(wpMenuItems)) return [];

  const processMenuItem = (item: any): MenuItem => ({
    ID: item.ID || 0,
    id: item.id || item.ID || 0, // For compatibility
    title: item.title || "",
    url: item.url || "",
    slug: item.slug || "",
    target: item.target || "",
    classes: item.classes || [],
    description: item.description || "",
    attr_title: item.attr_title || "",
    xfn: item.xfn || "",
    children: Array.isArray(item.children)
      ? item.children.map(processMenuItem)
      : [],
  });

  return wpMenuItems.map(processMenuItem);
}
