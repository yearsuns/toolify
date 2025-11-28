import { tools, tagMetadata } from "@/data/tools";
import ToolsClient from "@/components/home/ToolsClient";
import PageLayout from "@/components/common/PageLayout";
import type { Metadata } from "next";
import { generateMetadata as genMetadata } from "@/utils/metadata";
import { isValidLanguage, defaultLanguage } from "@/utils/locale";

interface PageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params;
  const language = isValidLanguage(lang) ? lang : defaultLanguage;
  
  return genMetadata(language, {
    titleKey: "home.metaTitle",
    descriptionKey: "home.metaDescription",
    keywordsKey: "home.metaKeywords",
  });
}

export default async function Home({ params }: PageProps) {
  const { lang } = await params;
  
  return (
    <PageLayout
      title="home.title"
      description="home.description"
      titleAlign="center"
    >
      <ToolsClient tools={tools} tagMetadata={tagMetadata} />
    </PageLayout>
  );
}
