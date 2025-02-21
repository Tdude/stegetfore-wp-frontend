// src/lib/layoutUtils.tsx
import { fetchSiteInfo, fetchMainMenu } from './api';
import type { SiteInfo, MenuItem } from './types';

export async function getLayoutData(): Promise<{
  siteInfo: SiteInfo;
  menuItems: MenuItem[];
}> {
  try {
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
        name: 'Sajtens namn',
        description: 'Sajtbeskrivning'
      },
      menuItems: []
    };
  }
}