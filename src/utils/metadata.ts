import { Metadata } from "next";
import zh from "@/locales/zh";
import en from "@/locales/en";
import ja from "@/locales/ja";
import { getNestedValue } from "@/utils/translations";

type Language = "zh" | "en" | "ja";

const translations: Record<Language, typeof zh> = {
  zh,
  en,
  ja,
};

// Generate multilingual metadata
export function generateMetadata(
  language: Language,
  options: {
    titleKey?: string;
    descriptionKey?: string;
    keywordsKey?: string;
    defaultTitle?: string;
    defaultDescription?: string;
    defaultKeywords?: string;
  }
): Metadata {
  const {
    titleKey,
    descriptionKey,
    keywordsKey,
    defaultTitle,
    defaultDescription,
    defaultKeywords,
  } = options;

  const title = titleKey
    ? getNestedValue(titleKey, translations[language]) || defaultTitle
    : defaultTitle;
  const description = descriptionKey
    ? getNestedValue(descriptionKey, translations[language]) || defaultDescription
    : defaultDescription;
  const keywords = keywordsKey
    ? getNestedValue(keywordsKey, translations[language]) || defaultKeywords
    : defaultKeywords;

  const metadata: Metadata = {
    title: title || "Toolify",
    description: description || "",
  };

  if (keywords) {
    metadata.keywords = keywords;
  }

  if (title && description) {
    metadata.openGraph = {
      title: title,
      description: description,
      type: "website",
    };
  }

  return metadata;
}

