"use client";

import { useLanguage } from "@/contexts/LanguageContext";

export default function LanguageSwitcher() {
  const { language, setLanguage, isPending } = useLanguage();

  const languages = [
    { code: "zh" as const, label: "中文", flag: "🇨🇳" },
    { code: "en" as const, label: "English", flag: "🇺🇸" },
    { code: "ja" as const, label: "日本語", flag: "🇯🇵" },
  ];

  return (
    <div className="relative inline-block">
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as "zh" | "en" | "ja")}
        disabled={isPending}
        className="appearance-none rounded-lg border border-cyan-500/30 bg-[#0f0f1f]/80 backdrop-blur-sm px-2 sm:px-4 py-2 pr-6 sm:pr-8 text-xs sm:text-sm font-medium text-cyan-300 transition-all focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 cursor-pointer hover:bg-[#0f0f1f] disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-1 sm:pr-2">
        <svg
          className="h-3 w-3 sm:h-4 sm:w-4 text-cyan-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  );
}

