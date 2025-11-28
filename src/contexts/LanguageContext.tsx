"use client";

import { createContext, useContext, useState, useEffect, useTransition, ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import zh from "@/locales/zh";
import en from "@/locales/en";
import ja from "@/locales/ja";
import { isValidLanguage, defaultLanguage, getLanguageFromPath, addLanguageToPath, removeLanguageFromPath } from "@/utils/locale";

export type Language = "zh" | "en" | "ja";

type Translations = typeof zh;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  isPending: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Translations> = {
  zh,
  en,
  ja,
};

// Set cookie
function setCookie(name: string, value: string, days: number = 365) {
  if (typeof document === "undefined") return;
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

export function LanguageProvider({ children, initialLanguage }: { children: ReactNode; initialLanguage?: Language }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  // Get current language from path
  const pathLanguage = getLanguageFromPath(pathname);
  const [language, setLanguageState] = useState<Language>(initialLanguage || pathLanguage);

  // Sync language when path changes (only update when path changes, avoid loops)
  useEffect(() => {
    const newPathLanguage = getLanguageFromPath(pathname);
    if (newPathLanguage !== language && isValidLanguage(newPathLanguage)) {
      setLanguageState(newPathLanguage);
      // Only update cookie when language actually changes (avoid unnecessary cookie writes)
      setCookie("language", newPathLanguage);
      if (typeof document !== "undefined") {
        document.documentElement.lang = newPathLanguage;
      }
    }
  }, [pathname]); // Remove language dependency to avoid loop updates

  // Set language and navigate to new path
  const setLanguage = (lang: Language) => {
    if (lang === language) return;
    
    // Immediately update state and cookie for fast UI response
    setLanguageState(lang);
    setCookie("language", lang);
    
    // Update HTML lang attribute
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
    }
    
    // Build new path: remove current language prefix, add new language prefix
    const pathWithoutLang = removeLanguageFromPath(pathname);
    const newPath = addLanguageToPath(pathWithoutLang, lang);
    
    // Use startTransition to mark navigation as transition state, reduce flicker
    startTransition(() => {
      // Use replace instead of push to avoid adding entries to history, reduce flicker
      router.replace(newPath);
    });
  };

  // Update HTML lang attribute (when language changes)
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = language;
    }
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations[language], isPending }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

