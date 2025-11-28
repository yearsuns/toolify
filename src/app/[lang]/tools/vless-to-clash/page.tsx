import type { Metadata } from "next";
import VlessToClashClient from "./VlessToClashClient";
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
    titleKey: "vlessToClash.metaTitle",
    descriptionKey: "vlessToClash.metaDescription",
    keywordsKey: "vlessToClash.metaKeywords",
  });
}

export default async function VlessToClashPage({ params }: PageProps) {
  const { lang } = await params;
  
  return (
    <PageLayout
      title="vlessToClash.title"
      description="vlessToClash.description"
      showBackButton={true}
      backHref={`/${lang}`}
      titleAlign="left"
      usage="vlessToClash"
    >
      <VlessToClashClient />
    </PageLayout>
  );
}

