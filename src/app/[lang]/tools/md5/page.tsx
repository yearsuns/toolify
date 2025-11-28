import type { Metadata } from "next";
import Md5Client from "./Md5Client";
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
    titleKey: "md5.metaTitle",
    descriptionKey: "md5.metaDescription",
    keywordsKey: "md5.metaKeywords",
  });
}

export default async function Md5Page({ params }: PageProps) {
  const { lang } = await params;
  
  return (
    <PageLayout
      title="md5.title"
      description="md5.description"
      showBackButton={true}
      backHref={`/${lang}`}
      titleAlign="left"
      usage="md5"
    >
      <Md5Client />
    </PageLayout>
  );
}

