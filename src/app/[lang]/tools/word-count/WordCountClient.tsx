"use client";

import { useState, useMemo } from "react";
import TextareaWithLineNumbers from "@/components/common/TextareaWithLineNumbers";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/contexts/ToastContext";

export default function WordCountClient() {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [input, setInput] = useState("");

  // Base button styles
  const buttonBaseClass = "px-4 py-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400/50 transition-all";

  // Calculate statistics
  const statistics = useMemo(() => {
    const text = input;
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, "").length;
    const words = text.trim() ? text.trim().split(/\s+/).filter(word => word.length > 0).length : 0;
    const lines = text ? text.split("\n").length : 0;
    const paragraphs = text.trim() ? text.trim().split(/\n\s*\n/).filter(p => p.trim().length > 0).length : 0;
    const sentences = text.trim() ? text.trim().split(/[.!?]+/).filter(s => s.trim().length > 0).length : 0;

    return {
      characters,
      charactersNoSpaces,
      words,
      lines,
      paragraphs,
      sentences,
    };
  }, [input]);

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      showToast(t.wordCount.copied, "success");
    }).catch(() => {
      showToast(t.wordCount.copyFailed, "error");
    });
  };

  // Clear all
  const clearAll = () => {
    setInput("");
  };

  // Load example
  const loadExample = () => {
    const example = `This is a sample text for word counting.

It contains multiple paragraphs and sentences. You can use this tool to count characters, words, lines, paragraphs, and sentences.

The tool provides real-time statistics as you type or paste text. It's useful for writers, editors, and content creators who need to track their text statistics.`;
    setInput(example);
  };

  return (
    <div className="space-y-6 mb-4">
      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="rounded-xl border border-cyan-500/30 bg-[#0f0f1f]/80 backdrop-blur-sm p-4">
          <div className="text-sm text-cyan-400/70 mb-1">{t.wordCount.characters}</div>
          <div className="text-2xl font-bold text-cyan-300">{statistics.characters.toLocaleString()}</div>
        </div>
        <div className="rounded-xl border border-cyan-500/30 bg-[#0f0f1f]/80 backdrop-blur-sm p-4">
          <div className="text-sm text-cyan-400/70 mb-1">{t.wordCount.charactersNoSpaces}</div>
          <div className="text-2xl font-bold text-cyan-300">{statistics.charactersNoSpaces.toLocaleString()}</div>
        </div>
        <div className="rounded-xl border border-cyan-500/30 bg-[#0f0f1f]/80 backdrop-blur-sm p-4">
          <div className="text-sm text-cyan-400/70 mb-1">{t.wordCount.words}</div>
          <div className="text-2xl font-bold text-cyan-300">{statistics.words.toLocaleString()}</div>
        </div>
        <div className="rounded-xl border border-cyan-500/30 bg-[#0f0f1f]/80 backdrop-blur-sm p-4">
          <div className="text-sm text-cyan-400/70 mb-1">{t.wordCount.lines}</div>
          <div className="text-2xl font-bold text-cyan-300">{statistics.lines.toLocaleString()}</div>
        </div>
        <div className="rounded-xl border border-cyan-500/30 bg-[#0f0f1f]/80 backdrop-blur-sm p-4">
          <div className="text-sm text-cyan-400/70 mb-1">{t.wordCount.paragraphs}</div>
          <div className="text-2xl font-bold text-cyan-300">{statistics.paragraphs.toLocaleString()}</div>
        </div>
        <div className="rounded-xl border border-cyan-500/30 bg-[#0f0f1f]/80 backdrop-blur-sm p-4">
          <div className="text-sm text-cyan-400/70 mb-1">{t.wordCount.sentences}</div>
          <div className="text-2xl font-bold text-cyan-300">{statistics.sentences.toLocaleString()}</div>
        </div>
      </div>

      {/* Input area */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-cyan-300">{t.wordCount.input}</label>
          <button
            onClick={() => copyToClipboard(input)}
            className="text-xs text-cyan-400/70 hover:text-cyan-300 transition-colors"
          >
            {t.wordCount.copy}
          </button>
        </div>
        <div className="relative rounded-xl border border-cyan-500/30 bg-[#0f0f1f]/80 backdrop-blur-sm overflow-hidden focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-400/30">
          <TextareaWithLineNumbers
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t.wordCount.inputPlaceholder}
            className="rounded-xl p-4 text-cyan-50 placeholder-cyan-500/50 font-mono text-sm focus:outline-none resize-none custom-scrollbar bg-transparent border-0"
          />
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        <button onClick={loadExample} className={buttonBaseClass}>
          {t.wordCount.loadExample}
        </button>
        <button onClick={clearAll} className={buttonBaseClass}>
          {t.wordCount.clear}
        </button>
      </div>
    </div>
  );
}

