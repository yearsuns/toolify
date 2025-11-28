import type { Metadata } from "next";
import ImageCompressClient from "./ImageCompressClient";
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
    titleKey: "imageCompress.metaTitle",
    descriptionKey: "imageCompress.metaDescription",
    keywordsKey: "imageCompress.metaKeywords",
  });
}

export default async function ImageCompressPage({ params }: PageProps) {
  const { lang } = await params;
  
  return (
    <PageLayout
      title="imageCompress.title"
      description="imageCompress.description"
      showBackButton={true}
      backHref={`/${lang}`}
      titleAlign="left"
      usage="imageCompress"
    >
      <ImageCompressClient />
    </PageLayout>
  );
}

