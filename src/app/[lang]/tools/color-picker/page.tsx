import type { Metadata } from "next";
import ColorPickerClient from "./ColorPickerClient";
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
    titleKey: "colorPicker.metaTitle",
    descriptionKey: "colorPicker.metaDescription",
    keywordsKey: "colorPicker.metaKeywords",
  });
}

export default async function ColorPickerPage({ params }: PageProps) {
  const { lang } = await params;
  
  return (
    <PageLayout
      title="colorPicker.title"
      description="colorPicker.description"
      showBackButton={true}
      backHref={`/${lang}`}
      titleAlign="left"
      usage="colorPicker"
    >
      <ColorPickerClient />
    </PageLayout>
  );
}

