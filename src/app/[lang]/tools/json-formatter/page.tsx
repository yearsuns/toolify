import type { Metadata } from "next";
import JsonFormatterClient from "./JsonFormatterClient";
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
    titleKey: "jsonFormatter.metaTitle",
    descriptionKey: "jsonFormatter.metaDescription",
    keywordsKey: "jsonFormatter.metaKeywords",
  });
}

export default async function JsonFormatterPage({ params }: PageProps) {
  const { lang } = await params;
  
  return (
    <PageLayout
      title="jsonFormatter.title"
      description="jsonFormatter.description"
      showBackButton={true}
      backHref={`/${lang}`}
      titleAlign="left"
      usage="jsonFormatter"
    >
      <JsonFormatterClient />
    </PageLayout>
  );
}

