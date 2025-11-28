import type { Metadata } from "next";
import RegexClient from "./RegexClient";
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
    titleKey: "regex.metaTitle",
    descriptionKey: "regex.metaDescription",
    keywordsKey: "regex.metaKeywords",
  });
}

export default async function RegexPage({ params }: PageProps) {
  const { lang } = await params;
  
  return (
    <PageLayout
      title="regex.title"
      description="regex.description"
      showBackButton={true}
      backHref={`/${lang}`}
      titleAlign="left"
      usage="regex"
    >
      <RegexClient />
    </PageLayout>
  );
}

