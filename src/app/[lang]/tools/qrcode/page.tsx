import type { Metadata } from "next";
import QrcodeClient from "./QrcodeClient";
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
    titleKey: "qrcode.metaTitle",
    descriptionKey: "qrcode.metaDescription",
    keywordsKey: "qrcode.metaKeywords",
  });
}

export default async function QrcodePage({ params }: PageProps) {
  const { lang } = await params;
  
  return (
    <PageLayout
      title="qrcode.title"
      description="qrcode.description"
      showBackButton={true}
      backHref={`/${lang}`}
      titleAlign="left"
      usage="qrcode"
    >
      <QrcodeClient />
    </PageLayout>
  );
}

