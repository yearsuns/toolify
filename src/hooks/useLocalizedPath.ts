"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { addLanguageToPath } from "@/utils/locale";

/**
 * Hook to get localized paths
 * Returns a function to convert paths to include the current language prefix
 */
export function useLocalizedPath() {
  const { language } = useLanguage();
  
  /**
   * Convert a path to include the current language prefix
   * @param path - The path to localize (e.g., "/tools/json-formatter" or "/")
   * @returns The localized path (e.g., "/zh/tools/json-formatter")
   */
  const getLocalizedPath = (path: string): string => {
    return addLanguageToPath(path, language);
  };
  
  return { getLocalizedPath };
}

