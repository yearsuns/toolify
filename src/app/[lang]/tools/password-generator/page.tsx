import type { Metadata } from "next";
import PasswordGeneratorClient from "./PasswordGeneratorClient";
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
    titleKey: "passwordGenerator.metaTitle",
    descriptionKey: "passwordGenerator.metaDescription",
    keywordsKey: "passwordGenerator.metaKeywords",
  });
}

export default async function PasswordGeneratorPage({ params }: PageProps) {
  const { lang } = await params;
  
  return (
    <PageLayout
      title="passwordGenerator.title"
      description="passwordGenerator.description"
      showBackButton={true}
      backHref={`/${lang}`}
      titleAlign="left"
      usage="passwordGenerator"
    >
      <PasswordGeneratorClient />
    </PageLayout>
  );
}

