"use client";

import { useLanguage } from "@/contexts/LanguageContext";

interface UsageInstructionsProps {
  usageKey: string; // e.g., "jsonFormatter" or "vlessToClash"
}

export default function UsageInstructions({ usageKey }: UsageInstructionsProps) {
  const { t } = useLanguage();
  
  // Get usage instructions data from translation object
  const usageData = (t as any)[usageKey];
  
  if (!usageData || !usageData.usageTitle || !Array.isArray(usageData.usageItems)) {
    return null;
  }

  const usageItems = usageData.usageItems;

  if (usageItems.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-6">
      <h3 className="text-lg font-semibold text-cyan-300 mb-3">{usageData.usageTitle}</h3>
      <ul className="space-y-2 text-sm text-cyan-400/70">
        {usageItems.map((item: string, index: number) => {
          // Check if contains HTML tags (e.g., code tags)
          const hasHTML = /<[^>]+>/.test(item);
          return (
            <li key={index} className="flex items-start gap-2">
              <span className="text-cyan-400">•</span>
              {hasHTML ? (
                <span dangerouslySetInnerHTML={{ __html: item }} />
              ) : (
                <span>{item}</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

