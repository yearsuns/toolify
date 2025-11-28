import type { Metadata } from "next";
import UnitConverterClient from "./UnitConverterClient";
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
    titleKey: "unitConverter.metaTitle",
    descriptionKey: "unitConverter.metaDescription",
    keywordsKey: "unitConverter.metaKeywords",
  });
}

export default async function UnitConverterPage({ params }: PageProps) {
  const { lang } = await params;
  
  return (
    <PageLayout
      title="unitConverter.title"
      description="unitConverter.description"
      showBackButton={true}
      backHref={`/${lang}`}
      titleAlign="left"
      usage="unitConverter"
    >
      <UnitConverterClient />
    </PageLayout>
  );
}

