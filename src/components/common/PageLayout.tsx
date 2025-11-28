"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLocalizedPath } from "@/hooks/useLocalizedPath";
import LanguageSwitcher from "./LanguageSwitcher";
import UsageInstructions from "@/components/tools/UsageInstructions";
import { getNestedValue } from "@/utils/translations";

interface PageLayoutProps {
  children: ReactNode;
  showBackButton?: boolean;
  backHref?: string;
  title?: string; // Can be a plain string or translation key (e.g., "jsonFormatter.title")
  description?: string; // Can be a plain string or translation key (e.g., "jsonFormatter.description")
  titleAlign?: "left" | "center";
  usage?: string; // Usage instructions key, e.g., "jsonFormatter" or "vlessToClash"
}

export default function PageLayout({
  children,
  showBackButton = false,
  backHref = "/",
  title,
  description,
  titleAlign = "center",
  usage,
}: PageLayoutProps) {
  const { t } = useLanguage();
  const { getLocalizedPath } = useLocalizedPath();
  
  // Check if it's a translation key (string containing dots)
  const isTranslationKey = (str?: string): boolean => {
    return str !== undefined && str.includes(".");
  };
  
  // Get title and description, fetch from translation object if it's a translation key
  const displayTitle = title && isTranslationKey(title)
    ? getNestedValue(title, t) || title
    : title;
  const displayDescription = description && isTranslationKey(description)
    ? getNestedValue(description, t) || description
    : description;

  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a0f] text-cyan-50">
      {/* Tech-style background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#0a0a0f] via-[#0f0f1f] to-[#050510] pointer-events-none z-0" />
      
      {/* Top navigation bar */}
      <Header />

      <main className="relative z-10 flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Title area */}
        {(displayTitle || displayDescription) && (
          <div className={`mb-8 ${titleAlign === "center" ? "text-center" : ""}`}>
            {showBackButton && (
              <div className={`flex items-center gap-4 mb-4 ${titleAlign === "center" ? "justify-center" : ""}`}>
                <Link 
                  href={backHref} 
                  className="text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </Link>
                {displayTitle && (
                  <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 sm:text-5xl text-glow">
                    {displayTitle}
                  </h2>
                )}
              </div>
            )}
            {!showBackButton && displayTitle && (
              <h2 className="mb-3 text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 sm:text-5xl text-glow">
                {displayTitle}
              </h2>
            )}
            {displayDescription && (
              <p className={`text-lg text-cyan-300/80 ${showBackButton && titleAlign === "left" ? "ml-10" : ""}`}>
                {displayDescription}
              </p>
            )}
          </div>
        )}

        {children}

        {/* Usage instructions */}
        {usage && <UsageInstructions usageKey={usage} />}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

function Header() {
  const { t } = useLanguage();
  const { getLocalizedPath } = useLocalizedPath();

  return (
    <header className="sticky top-0 z-[100] border-b border-cyan-500/20 bg-[#0a0a0f]/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href={getLocalizedPath("/")} className="flex items-center gap-2 sm:gap-3 relative z-10 flex-shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 text-white glow-cyan">
              <span className="text-xl font-bold text-glow">T</span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-cyan-400 text-glow whitespace-nowrap">Toolify</h1>
          </Link>
          <nav className="flex items-center gap-3 sm:gap-6 relative z-10 flex-shrink-0">
            <a
              href="https://github.com/yearsuns/toolify"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-cyan-300 hover:text-cyan-400 transition-colors flex items-center gap-1 sm:gap-2"
              title="GitHub"
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              <span className="hidden sm:inline">GitHub</span>
            </a>
            <LanguageSwitcher />
          </nav>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="relative z-10 mt-auto border-t border-cyan-500/20 bg-[#0a0a0f]/50 py-8 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 text-center text-sm text-cyan-400/60 sm:px-6 lg:px-8">
        <p>{t.common.copyright}</p>
      </div>
    </footer>
  );
}

