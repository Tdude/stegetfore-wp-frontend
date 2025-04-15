// src/hooks/useModules.ts
import { useState, useEffect, useMemo } from "react";
import { Module } from "@/lib/types/moduleTypes";
import { HomepageData } from "@/lib/types/contentTypes";
import { groupModulesBySection } from "@/services/moduleService";

interface UseModulesProps {
  pageModules?: Module[];
  homepageData?: HomepageData;
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
  directModules = [],
}: UseModulesProps): UseModulesResult {
  // Create a default HomepageData that satisfies the interface
  const defaultHomepageData = useMemo(() => ({
    id: 0,
    slug: '',
    title: { rendered: '' },
    content: { rendered: '' },
    modules: []
  }), []);

  const [parsedHomepageData, setParsedHomepageData] = useState<HomepageData>(defaultHomepageData);
  
  // Parse homepage data if it's a string
  useEffect(() => {
    if (!homepageData) return;

    if (typeof homepageData === "string") {
      try {
        const parsed = JSON.parse(homepageData);
        setParsedHomepageData(parsed || defaultHomepageData);
      } catch (e) {
        console.error("Failed to parse homepage data:", e);
        setParsedHomepageData(defaultHomepageData);
      }
    } else {
      setParsedHomepageData(homepageData);
    }
  }, [homepageData, defaultHomepageData]);

  // Combine modules from all sources with explicit typing
  const allModules: Module[] = useMemo(() => {
    // Direct modules take priority
    if (directModules && directModules.length > 0) {
      return directModules;
    }

    // Page modules are our primary source
    if (pageModules && pageModules.length > 0) {
      console.log(`Using ${pageModules.length} modules from page`);
      return pageModules;
    }

    // Homepage modules as fallback
    const homepageModules = parsedHomepageData?.modules;
    if (Array.isArray(homepageModules) && homepageModules.length > 0) {
      console.log(`Using ${homepageModules.length} modules from homepage data`);
      return homepageModules;
    }

    return [] as Module[];
  }, [directModules, pageModules, parsedHomepageData]);

  // Use the moduleService's groupModulesBySection function instead of implementing our own
  const modulesBySection = useMemo(() => {
    return groupModulesBySection(allModules);
  }, [allModules]);

  // Return the combined result
  return {
    allModules,
    modulesBySection,
    homepageData: parsedHomepageData
  };
}
