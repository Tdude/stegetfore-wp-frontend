// src/hooks/useModules.ts
import { useState, useEffect, useMemo } from "react";
import { Module, HomepageData } from "@/lib/types";

interface UseModulesProps {
  pageModules?: any[];
  homepageData?: HomepageData;
  moduleCategory?: string;
  featuredPostsPosition?: number;
  directModules?: Module[]; // Allow direct injection of modules for testing
}

interface UseModulesResult {
  allModules: Module[];
  modulesBySection: Record<string, Module[]>;
  homepageData?: HomepageData;
}

export function useModules({
  pageModules = [],
  homepageData,
  moduleCategory,
  featuredPostsPosition = 2,
  directModules = [],
}: UseModulesProps): UseModulesResult {
  const [parsedHomepageData, setParsedHomepageData] = useState<HomepageData>({
    id: 0,
    slug: '',
    title: { rendered: '' },
    content: { rendered: '' },
    modules: [],
    featured_posts: [],
    categories: {},
  });
  const [categoryModules, setCategoryModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Parse homepage data if it's a string
  useEffect(() => {
    if (!homepageData) return;

    if (typeof homepageData === "string") {
      try {
        const parsed = JSON.parse(homepageData);
        setParsedHomepageData(parsed || {});
      } catch (e) {
        console.error("Failed to parse homepage data:", e);
        setParsedHomepageData({
          id: 0,
          slug: '',
          title: { rendered: '' },
          content: { rendered: '' },
          modules: [],
          featured_posts: [],
          categories: {},
        });
      }
    } else {
      setParsedHomepageData(homepageData);
    }
  }, [homepageData]);

  // Fetch modules by category if needed
  useEffect(() => {
    if (!moduleCategory) return;

    const fetchModulesByCategory = async () => {
      setIsLoading(true);
      try {
        // Log the request for debugging
        console.log(
          `Fetching modules from: /api/steget/v1/modules?category=${moduleCategory}`
        );

        const response = await fetch(
          `/api/steget/v1/modules?category=${moduleCategory}`
        );

        // Log the response status
        console.log(`API response status: ${response.status}`);

        if (!response.ok) {
          throw new Error(
            `Failed to fetch modules: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();

        // Log what was received
        console.log("API returned data:", data);

        // Handle different data formats - could be an array or an object with items property
        if (Array.isArray(data)) {
          console.log(`Setting ${data.length} modules from array response`);
          setCategoryModules(data);
        } else if (data && typeof data === "object") {
          // Try to find modules in common response formats
          const possibleModules = data.items || data.modules || data.data || [];
          console.log(
            `Setting ${possibleModules.length} modules from object response`
          );
          setCategoryModules(
            Array.isArray(possibleModules) ? possibleModules : []
          );
        } else {
          console.error("Unexpected API response format:", data);
          setCategoryModules([]);
        }
      } catch (error) {
        console.error("Error fetching modules by category:", error);
        setCategoryModules([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchModulesByCategory();
  }, [moduleCategory]);

  // Process modules to ensure they have ids
  const processModules = (modules: any[]): Module[] => {
    if (!modules || !Array.isArray(modules)) return [];
    return modules.map((module, index) => ({
      ...module,
      id: module.id || `module-${index}`,
    }));
  };

  // Process homepage modules
  const homepageModules = useMemo(() => {
    return processModules(
      Array.isArray(parsedHomepageData?.modules)
        ? parsedHomepageData.modules
        : []
    );
  }, [parsedHomepageData?.modules]);

  // Process page modules
  const processedPageModules = useMemo(() => {
    return processModules(pageModules || []);
  }, [pageModules]);

  // Create modules for featured posts if needed
  const featuredPostsModules = useMemo(() => {
    const modules: Module[] = [];

    if (
      parsedHomepageData?.featured_posts?.length &&
      !homepageModules.some((m) => m.type === "featured-posts") &&
      !processedPageModules.some((m) => m.type === "featured-posts")
    ) {
      modules.push({
        id: Date.now(),
        type: "featured-posts",
        title:
          parsedHomepageData.featured_posts_title || "I fokus från bloggen",
        posts:
          parsedHomepageData.featured_posts?.map((post: any) => {
            // Create a robust version of the post that handles all possible formats
            const postTitle = typeof post.title === 'object' && post.title && 'rendered' in post.title 
              ? post.title.rendered 
              : (typeof post.title === 'string' ? post.title : '');
              
            const postExcerpt = typeof post.excerpt === 'object' && post.excerpt && 'rendered' in post.excerpt 
              ? post.excerpt.rendered 
              : (typeof post.excerpt === 'string' ? post.excerpt : '');
              
            const postContent = typeof post.content === 'object' && post.content && 'rendered' in post.content 
              ? post.content.rendered 
              : (typeof post.content === 'string' ? post.content : '');

            // Safe array check for categories
            const postCategories = Array.isArray(post.categories) 
              ? post.categories.map(String) 
              : [];
              
            return {
              ...post,
              title: postTitle,
              excerpt: postExcerpt,
              content: postContent,
              featured_image_url: post.featured_image_url || undefined,
              categories: postCategories,
            };
          }) || [],
        display_style: "grid",
        columns: 3,
        show_excerpt: true,
        show_categories: true,
        show_read_more: true,
        settings: {
          section: "main",
          priority: 5,
        },
      });
    }

    return modules;
  }, [parsedHomepageData, homepageModules, processedPageModules]);

  // Development fallback modules for testing
  const devFallbackModules = useMemo(() => {
    // Only provide fallback modules in development mode and when we have no modules
    if (process.env.NODE_ENV !== "development") return [];
    if (
      processedPageModules.length > 0 ||
      homepageModules.length > 0 ||
      categoryModules.length > 0
    )
      return [];

    console.log("Using development fallback modules");

    // Provide some test modules
    return [
      {
        id: 1,
        type: "text",
        title: "Development Fallback Module",
        content:
          "This is a fallback module for development. It appears when no other modules are available.",
        settings: {
          section: "main",
          priority: 10,
        },
      },
      {
        id: 2,
        type: "text",
        title: "Another Test Module",
        content:
          "This is another test module to demonstrate multiple modules rendering.",
        settings: {
          section: "main",
          priority: 5,
        },
      },
    ];
  }, [
    processedPageModules.length,
    homepageModules.length,
    categoryModules.length,
  ]);

  // Process directly provided modules
  const processedDirectModules = useMemo(() => {
    return processModules(directModules || []);
  }, [directModules]);

  // Combine and sort all modules
  const allModules = useMemo(() => {
    const combinedModules = [
      ...processedPageModules,
      ...homepageModules,
      ...categoryModules,
      ...featuredPostsModules,
      ...processedDirectModules, // Add directly provided modules
      ...devFallbackModules, // Add development fallback modules
    ];

    const processedIds = new Set<string | number>();
    const uniqueModules: Module[] = [];

    combinedModules.forEach((module) => {
      if (!processedIds.has(module.id)) {
        uniqueModules.push(module);
        processedIds.add(module.id);
      }
    });

    const sortedModules = uniqueModules.sort((a, b) => {
      const orderA = typeof a.order === "number" ? a.order : 0;
      const orderB = typeof b.order === "number" ? b.order : 0;
      return orderA - orderB; // Changed to ascending order
    });

    // Find the featured-posts module and move it to the specified position
    const featuredPostsIndex = sortedModules.findIndex(
      (m) => m.type === "featured-posts"
    );
    if (featuredPostsIndex !== -1 && featuredPostsPosition >= 0) {
      const featuredPostsModule = sortedModules.splice(
        featuredPostsIndex,
        1
      )[0];
      const insertPosition = Math.min(
        featuredPostsPosition,
        sortedModules.length
      );
      sortedModules.splice(insertPosition, 0, featuredPostsModule);
    }

    return sortedModules;
  }, [
    processedPageModules,
    homepageModules,
    categoryModules,
    featuredPostsModules,
    featuredPostsPosition,
  ]);

  // Group modules by section
  const modulesBySection = useMemo(() => {
    const sections: Record<string, Module[]> = {
      header: [],
      main: [],
      footer: [],
      other: [],
    };

    allModules.forEach((module) => {
      const section = module.settings?.section || "main";
      if (sections[section]) {
        sections[section].push(module);
      } else {
        sections.other.push(module);
      }
    });

    // Sort modules within each section by priority if present
    Object.keys(sections).forEach((sectionKey) => {
      sections[sectionKey].sort((a, b) => {
        const priorityA = a.settings?.priority ?? 0;
        const priorityB = b.settings?.priority ?? 0;
        return priorityA - priorityB; // Changed to ascending order
      });
    });

    return sections;
  }, [allModules]);

  return {
    allModules,
    modulesBySection,
    homepageData: parsedHomepageData,
  };
}
