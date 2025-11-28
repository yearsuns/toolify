import type { Metadata } from "next";
import TimestampConverterClient from "./TimestampConverterClient";
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
    titleKey: "timestamp.metaTitle",
    descriptionKey: "timestamp.metaDescription",
    keywordsKey: "timestamp.metaKeywords",
  });
}

export default async function TimestampPage({ params }: PageProps) {
  const { lang } = await params;
  
  return (
    <PageLayout
      title="timestamp.title"
      description="timestamp.description"
      showBackButton={true}
      backHref={`/${lang}`}
      titleAlign="left"
      usage="timestamp"
    >
      <TimestampConverterClient />
    </PageLayout>
  );
}

