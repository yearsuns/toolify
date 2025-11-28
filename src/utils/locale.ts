import type { Language } from "@/contexts/LanguageContext";

// Supported languages list
export const supportedLanguages: Language[] = ["zh", "en", "ja"];

// Default language
export const defaultLanguage: Language = "zh";

// Check if the language code is valid
export function isValidLanguage(lang: string | null | undefined): lang is Language {
  return lang !== null && lang !== undefined && supportedLanguages.includes(lang as Language);
}

// Extract language code from path, return default language if path is empty or invalid
export function getLanguageFromPath(pathname: string | null | undefined): Language {
  if (!pathname) return defaultLanguage;
  
  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments[0];
  
  return isValidLanguage(firstSegment) ? firstSegment : defaultLanguage;
}

// Remove language prefix from path, return remaining path
export function removeLanguageFromPath(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments[0];
  
  if (isValidLanguage(firstSegment)) {
    return "/" + segments.slice(1).join("/");
  }
  
  return pathname;
}

// Add language prefix to path
export function addLanguageToPath(pathname: string, language: Language): string {
  // Remove language prefix from path if exists
  const pathWithoutLang = removeLanguageFromPath(pathname);
  // Ensure path starts with /
  const cleanPath = pathWithoutLang === "/" ? "" : pathWithoutLang.startsWith("/") ? pathWithoutLang.slice(1) : pathWithoutLang;
  
  // Add new language prefix
  return `/${language}${cleanPath ? "/" + cleanPath : ""}`;
}

