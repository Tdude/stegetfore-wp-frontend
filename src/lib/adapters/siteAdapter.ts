// src/lib/adapters/siteAdapter.ts
import { SiteInfo, MenuItem } from "@/lib/types";

/**
 * Adapts WordPress site info to the application SiteInfo format
 * @param wpSiteInfo WordPress site info data
 * @returns SiteInfo object formatted for the application
 */
export function adaptWordPressSiteInfo(wpSiteInfo: any): SiteInfo {
  if (!wpSiteInfo) {
    return {
      name: "",
      description: ""
    };
  }

  return {
    name: wpSiteInfo.name || "",
    description: wpSiteInfo.description || "",
    ...(wpSiteInfo.url && { url: wpSiteInfo.url }),
    ...(wpSiteInfo.admin_email && { admin_email: wpSiteInfo.admin_email }),
    ...(wpSiteInfo.language && { language: wpSiteInfo.language }),
    ...(wpSiteInfo.logo_url !== undefined && { logo_url: wpSiteInfo.logo_url || null }),
    ...(wpSiteInfo.favicon_url !== undefined && { favicon_url: wpSiteInfo.favicon_url || null }),
    ...(wpSiteInfo.social_links && { social_links: wpSiteInfo.social_links })
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
    title: item.title || "",
    url: item.url || "",
    slug: item.slug || "",
    target: item.target || "",
    ...(item.id && { id: item.id }),
    ...(item.classes && { classes: item.classes }),
    ...(item.description && { description: item.description }),
    ...(item.attr_title && { attr_title: item.attr_title }),
    ...(item.xfn && { xfn: item.xfn }),
    ...(Array.isArray(item.children) && {
      children: item.children.map(processMenuItem)
    })
  });

  return wpMenuItems.map(processMenuItem);
}
