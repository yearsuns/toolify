import { headers } from "next/headers";
import PageLayout from "@/components/common/PageLayout";
import { generateMetadata as genMetadata } from "@/utils/metadata";
import type { Metadata } from "next";
import { getLanguageFromPath } from "@/utils/locale";
import NotFoundClient from "./NotFoundClient";

export async function generateMetadata(): Promise<Metadata> {
  // Extract language from request path (x-pathname header set by proxy)
  const headersList = await headers();
  const pathname = headersList.get("x-pathname");
  const language = getLanguageFromPath(pathname);
  
  return genMetadata(language, {
    titleKey: "notFound.title",
    descriptionKey: "notFound.description",
  });
}

export default async function NotFound() {
  // Extract language from request path (x-pathname header set by proxy)
  const headersList = await headers();
  const pathname = headersList.get("x-pathname");
  const language = getLanguageFromPath(pathname);

  return (
    <PageLayout
      title="notFound.title"
      description="notFound.description"
      titleAlign="center"
    >
      <NotFoundClient lang={language} />
    </PageLayout>
  );
}

