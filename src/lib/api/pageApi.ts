// src/lib/api/pageApi.ts
import { fetchApi } from "./baseApi";
import { Page, LocalPage } from "@/lib/types";
import {
  adaptWordPressPage,
  adaptWordPressPageToLocalPage,
} from "@/lib/adapters/pageAdapter";
import { fetchPageModules } from "./moduleApi";

// Shared constants
const PAGE_CACHE_TIME = 1200; // 20 minutes in seconds
const DEFAULT_FIELDS = 'id,title,content,excerpt,template,featured_media,modules';

// Shared utilities
const createQueryParams = (params: Record<string, any>) => {
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      queryParams.append(key, value.toString());
    }
  });

  return queryParams;
};

const handlePageWithModules = async (page: any, includeModules: boolean): Promise<LocalPage> => {
  const adaptedPage = adaptWordPressPage(page);

  if (!includeModules) {
    return adaptedPage as LocalPage;
  }

  const modules = await fetchPageModules(page.id);
  if (!adaptedPage.id) {
    throw new Error("Page ID is missing");
  }

  return {
    ...adaptedPage,
    id: adaptedPage.id, // Ensure id is defined
    modules: modules || [],
  } as LocalPage;
};

// Main API functions
export async function fetchPages(
  params: {
    page?: number;
    perPage?: number;
    search?: string;
    parent?: number;
    orderBy?: string;
    order?: "asc" | "desc";
    includeModules?: boolean;
  } = {}
): Promise<Page[]> {
  try {
    const {
      page = 1,
      perPage = 20,
      search,
      parent,
      orderBy = "date",
      order = "desc",
      includeModules = false,
    } = params;

    const queryParams = createQueryParams({
      page,
      per_page: perPage,
      orderby: orderBy,
      order,
      _embed: "true",
      search,
      parent,
    });

    const pages = await fetchApi(`/wp/v2/pages?${queryParams.toString()}`, {
      revalidate: PAGE_CACHE_TIME,
    });

    if (!Array.isArray(pages)) {
      return [];
    }

    return Promise.all(
      pages.map(page => handlePageWithModules(page, includeModules))
    );

  } catch (error) {
    console.error("Error fetching pages:", error);
    return [];
  }
}

export async function fetchPage(
  slug: string,
  includeModules = true
): Promise<LocalPage | null> {
  try {
    const queryParams = createQueryParams({
      slug,
      _embed: "true",
      _fields: DEFAULT_FIELDS,
    });

    const pages = await fetchApi(`/wp/v2/pages?${queryParams.toString()}`, {
      revalidate: PAGE_CACHE_TIME,
    });

    if (!Array.isArray(pages) || pages.length === 0) {
      return null;
    }

    const adaptedPage = adaptWordPressPageToLocalPage(pages[0]);
    if (!adaptedPage) {
      throw new Error("Failed to adapt WordPress page to local page");
    }

    if (!includeModules) {
      return adaptedPage;
    }

    const modules = await fetchPageModules(pages[0].id);
    if (!adaptedPage.id) {
      throw new Error("Page ID is missing");
    }

    return {
      ...adaptedPage,
      id: adaptedPage.id, // Ensure id is defined
      modules: modules || [],
    };

  } catch (error) {
    console.error(`Error fetching page with slug ${slug}:`, error);
    return null;
  }
}

export async function fetchPageById(
  id: number,
  includeModules = true
): Promise<Page | null> {
  try {
    const queryParams = createQueryParams({
      _embed: "true",
      _fields: DEFAULT_FIELDS,
    });

    const page = await fetchApi(`/wp/v2/pages/${id}?${queryParams.toString()}`, {
      revalidate: PAGE_CACHE_TIME,
    });

    if (!page) {
      return null;
    }

    return handlePageWithModules(page, includeModules);

  } catch (error) {
    console.error(`Error fetching page with ID ${id}:`, error);
    return null;
  }
}
