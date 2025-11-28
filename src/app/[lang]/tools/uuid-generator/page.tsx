import type { Metadata } from "next";
import UuidGeneratorClient from "./UuidGeneratorClient";
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
    titleKey: "uuidGenerator.metaTitle",
    descriptionKey: "uuidGenerator.metaDescription",
    keywordsKey: "uuidGenerator.metaKeywords",
  });
}

export default async function UuidGeneratorPage({ params }: PageProps) {
  const { lang } = await params;
  
  return (
    <PageLayout
      title="uuidGenerator.title"
      description="uuidGenerator.description"
      showBackButton={true}
      backHref={`/${lang}`}
      titleAlign="left"
      usage="uuidGenerator"
    >
      <UuidGeneratorClient />
    </PageLayout>
  );
}

