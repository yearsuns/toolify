import type { Metadata } from "next";
import MarkdownEditorClient from "./MarkdownEditorClient";
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
    titleKey: "markdownEditor.metaTitle",
    descriptionKey: "markdownEditor.metaDescription",
    keywordsKey: "markdownEditor.metaKeywords",
  });
}

export default async function MarkdownEditorPage({ params }: PageProps) {
  const { lang } = await params;
  
  return (
    <PageLayout
      title="markdownEditor.title"
      description="markdownEditor.description"
      showBackButton={true}
      backHref={`/${lang}`}
      titleAlign="left"
      usage="markdownEditor"
    >
      <MarkdownEditorClient />
    </PageLayout>
  );
}

