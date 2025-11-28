"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLocalizedPath } from "@/hooks/useLocalizedPath";

interface NotFoundClientProps {
  lang: string;
}

export default function NotFoundClient({ lang }: NotFoundClientProps) {
  const { t } = useLanguage();
  const { getLocalizedPath } = useLocalizedPath();

  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="mb-8">
        <div className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 text-glow">
          404
        </div>
      </div>
      <div className="text-center space-y-6 max-w-md">
        <Link
          href={getLocalizedPath("/")}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400/50 transition-all glow-cyan"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          <span>{t.common.backToHome}</span>
        </Link>
      </div>
    </div>
  );
}

