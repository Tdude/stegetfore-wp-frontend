// src/lib/layoutUtils.ts
import { fetchSiteInfo, fetchMainMenu, testAPI } from './api';
import type { SiteInfo, MenuItem } from './types';

export async function getLayoutData(): Promise<{
  siteInfo: SiteInfo;
  menuItems: MenuItem[];
}> {
  try {
    // Test API connection first
    const apiTest = await testAPI();
    console.log('API Test Result:', apiTest);

    // Fetch data in parallel
    const [siteInfo, menuItems] = await Promise.all([
      fetchSiteInfo(),
      fetchMainMenu()
    ]);

    return {
      siteInfo,
      menuItems
    };
  } catch (error) {
    console.error('Error in getLayoutData:', error);
    // Return default values instead of throwing
    return {
      siteInfo: {
        name: 'Site Name',
        description: 'Site Description'
      },
      menuItems: []
    };
  }
}