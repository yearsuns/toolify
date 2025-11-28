import type { Metadata } from "next";
import WordCountClient from "./WordCountClient";
import PageLayout from "@/components/common/PageLayout";
import { generateMetadata as genMetadata } from "@/utils/metadata";
import { isValidLanguage, defaultLanguage } from "@/utils/locale";

interface PageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params;
  const language = isValidLanguage(lang) ? lang : defaultLanguage;
  
  return genMetadata(language, {
    titleKey: "wordCount.metaTitle",
    descriptionKey: "wordCount.metaDescription",
    keywordsKey: "wordCount.metaKeywords",
  });
}

export default async function WordCountPage({ params }: PageProps) {
  const { lang } = await params;
  
  return (
    <PageLayout
      title="wordCount.title"
      description="wordCount.description"
      showBackButton={true}
      backHref={`/${lang}`}
      titleAlign="left"
      usage="wordCount"
    >
      <WordCountClient />
    </PageLayout>
  );
}

