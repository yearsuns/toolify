import type { Metadata } from "next";
import IpLookupClient from "./IpLookupClient";
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
    titleKey: "ipLookup.metaTitle",
    descriptionKey: "ipLookup.metaDescription",
    keywordsKey: "ipLookup.metaKeywords",
  });
}

export default async function IpLookupPage({ params }: PageProps) {
  const { lang } = await params;
  
  return (
    <PageLayout
      title="ipLookup.title"
      description="ipLookup.description"
      showBackButton={true}
      backHref={`/${lang}`}
      titleAlign="left"
      usage="ipLookup"
    >
      <IpLookupClient />
    </PageLayout>
  );
}

