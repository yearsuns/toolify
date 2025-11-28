import type { Metadata } from "next";
import UrlEncoderClient from "./UrlEncoderClient";
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
    titleKey: "urlEncoder.metaTitle",
    descriptionKey: "urlEncoder.metaDescription",
    keywordsKey: "urlEncoder.metaKeywords",
  });
}

export default async function UrlEncoderPage({ params }: PageProps) {
  const { lang } = await params;
  
  return (
    <PageLayout
      title="urlEncoder.title"
      description="urlEncoder.description"
      showBackButton={true}
      backHref={`/${lang}`}
      titleAlign="left"
      usage="urlEncoder"
    >
      <UrlEncoderClient />
    </PageLayout>
  );
}

