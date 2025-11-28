"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/contexts/ToastContext";

// Generate UUID v4
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export default function UuidGeneratorClient() {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [count, setCount] = useState(1);
  const [uuids, setUuids] = useState<string[]>([]);

  // Base button styles
  const buttonBaseClass = "px-4 py-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400/50 transition-all";

  // Generate UUIDs
  const handleGenerate = () => {
    const newUuids = Array.from({ length: count }, () => generateUUID());
    setUuids(newUuids);
  };

  // Copy to clipboard
  const copyToClipboard = (text: string, isAll = false) => {
    navigator.clipboard.writeText(text).then(() => {
      showToast(isAll ? t.uuidGenerator.copiedAll : t.uuidGenerator.copied, "success");
    });
  };

  // Copy all UUIDs
  const copyAllToClipboard = () => {
    if (uuids.length === 0) return;
    copyToClipboard(uuids.join("\n"), true);
  };

  // Clear all content
  const clearAll = () => {
    setUuids([]);
  };

  return (
    <div className="space-y-6 mb-4">
      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleGenerate}
          className={buttonBaseClass}
        >
          {count > 1 ? t.uuidGenerator.generateMultiple : t.uuidGenerator.generate}
        </button>
        <button
          onClick={clearAll}
          className={buttonBaseClass}
        >
          {t.uuidGenerator.clear}
        </button>
        <div className="flex items-center gap-2 ml-auto">
          <label className="text-sm text-cyan-400/70">{t.uuidGenerator.count}:</label>
          <input
            type="number"
            min="1"
            max="100"
            value={count}
            onChange={(e) => {
              const value = Math.max(1, Math.min(100, parseInt(e.target.value, 10) || 1));
              setCount(value);
            }}
            className="w-20 px-3 py-1 rounded-lg border border-cyan-500/30 bg-[#0f0f1f]/60 text-cyan-300 text-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
      </div>


      {/* Output area */}
      {uuids.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-cyan-300">
              {t.uuidGenerator.output} ({uuids.length})
            </label>
            <button
              onClick={copyAllToClipboard}
              className="text-xs text-cyan-400/70 hover:text-cyan-300 transition-colors"
            >
              {t.uuidGenerator.copyAll}
            </button>
          </div>
          {/* UUID list with copy buttons */}
          <div className="space-y-2">
            {uuids.map((uuid, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-lg border border-cyan-500/20 bg-[#0f0f1f]/40 hover:bg-[#0f0f1f]/60 transition-colors"
              >
                <span className="flex-1 font-mono text-sm text-cyan-300">{uuid}</span>
                <button
                  onClick={() => copyToClipboard(uuid)}
                  className="px-3 py-1 rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400/50 transition-all text-xs flex-shrink-0"
                >
                  {t.uuidGenerator.copy}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

