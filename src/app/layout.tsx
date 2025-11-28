import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { getLanguageFromPath } from "@/utils/locale";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  // Extract language from path (x-pathname header set by proxy)
  const pathname = headersList.get("x-pathname");
  const language = getLanguageFromPath(pathname);
  
  const t = await import(`@/locales/${language}`).then((m) => m.default);
  
  return {
    title: {
      default: t.home.metaTitle,
      template: "%s | Toolify",
    },
    description: t.home.metaDescription,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  // Extract language from path (x-pathname header set by proxy)
  const pathname = headersList.get("x-pathname");
  const language = getLanguageFromPath(pathname);

  return (
    <html lang={language} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LanguageProvider initialLanguage={language}>
          <ToastProvider>
        {children}
          </ToastProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
