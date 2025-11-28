import type { Metadata } from "next";
import Base64Client from "./Base64Client";
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
    titleKey: "base64.metaTitle",
    descriptionKey: "base64.metaDescription",
    keywordsKey: "base64.metaKeywords",
  });
}

export default async function Base64Page({ params }: PageProps) {
  const { lang } = await params;
  
  return (
    <PageLayout
      title="base64.title"
      description="base64.description"
      showBackButton={true}
      backHref={`/${lang}`}
      titleAlign="left"
      usage="base64"
    >
      <Base64Client />
    </PageLayout>
  );
}

