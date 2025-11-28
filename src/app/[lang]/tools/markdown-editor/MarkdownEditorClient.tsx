"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import TextareaWithLineNumbers from "@/components/common/TextareaWithLineNumbers";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/contexts/ToastContext";

export default function MarkdownEditorClient() {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [input, setInput] = useState("");
  const [renderedHtml, setRenderedHtml] = useState("");
  const markedPromiseRef = useRef<Promise<any> | null>(null);

  // Base button styles
  const buttonBaseClass = "px-4 py-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400/50 transition-all";

  // Get marked library
  const getMarked = async () => {
    if (!markedPromiseRef.current) {
      markedPromiseRef.current = import("marked").then((mod) => mod.marked);
    }
    return markedPromiseRef.current;
  };

  // Render Markdown to HTML
  const renderMarkdown = useCallback(async (markdown: string): Promise<string> => {
    if (!markdown.trim()) {
      return "";
    }

    try {
      const marked = await getMarked();
      // Configure marked options
      marked.setOptions({
        breaks: true,
        gfm: true,
      });
      return marked(markdown);
    } catch (e) {
      console.error("Markdown rendering error:", e);
      return "";
    }
  }, []);

  // Update rendered HTML when input changes
  useEffect(() => {
    const timer = setTimeout(() => {
      renderMarkdown(input).then(setRenderedHtml);
    }, 100);
    return () => clearTimeout(timer);
  }, [input, renderMarkdown]);

  // Copy Markdown to clipboard
  const copyMarkdown = useCallback(() => {
    if (!input.trim()) {
      showToast(t.markdownEditor.input, "error");
      return;
    }
    navigator.clipboard.writeText(input).then(() => {
      showToast(t.markdownEditor.copied, "success");
    }).catch(() => {
      showToast(t.markdownEditor.copyFailed, "error");
    });
  }, [input, showToast, t.markdownEditor]);

  // Copy HTML to clipboard
  const copyHtml = useCallback(async () => {
    if (!renderedHtml.trim()) {
      showToast(t.markdownEditor.preview, "error");
      return;
    }
    navigator.clipboard.writeText(renderedHtml).then(() => {
      showToast(t.markdownEditor.copied, "success");
    }).catch(() => {
      showToast(t.markdownEditor.copyFailed, "error");
    });
  }, [renderedHtml, showToast, t.markdownEditor]);

  // Clear all
  const clearAll = () => {
    setInput("");
    setRenderedHtml("");
  };

  // Load example
  const loadExample = () => {
    const example = `# Markdown Editor Example

## Features

This is a **Markdown editor** with *live preview*.

### Lists

- Item 1
- Item 2
- Item 3

### Code Block

\`\`\`javascript
function hello() {
  console.log("Hello, World!");
}
\`\`\`

### Links

Visit [Toolify](https://toolify.example.com) for more tools.

### Images

![Alt text](https://dummyimage.com/400x300&text=Toolify)

> This is a blockquote

---

**Bold text** and *italic text*`;
    setInput(example);
  };

  return (
    <div className="space-y-6 mb-4">
      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        <button onClick={loadExample} className={buttonBaseClass}>
          {t.markdownEditor.loadExample}
        </button>
        <button onClick={clearAll} className={buttonBaseClass}>
          {t.markdownEditor.clear}
        </button>
      </div>

      {/* Editor and Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Markdown Editor */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-cyan-300">{t.markdownEditor.input}</label>
            <button
              onClick={copyMarkdown}
              className="text-xs text-cyan-400/70 hover:text-cyan-300 transition-colors"
            >
              {t.markdownEditor.copy}
            </button>
          </div>
          <div className="relative rounded-xl border border-cyan-500/30 bg-[#0f0f1f]/80 backdrop-blur-sm overflow-hidden focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-400/30 h-96">
            <TextareaWithLineNumbers
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
              }}
              placeholder={t.markdownEditor.inputPlaceholder}
              className="rounded-xl p-4 text-cyan-50 placeholder-cyan-500/50 font-mono text-sm focus:outline-none resize-none custom-scrollbar bg-transparent border-0"
            />
          </div>
        </div>

        {/* HTML Preview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-cyan-300">{t.markdownEditor.preview}</label>
            <button
              onClick={copyHtml}
              className="text-xs text-cyan-400/70 hover:text-cyan-300 transition-colors"
            >
              {t.markdownEditor.copy}
            </button>
          </div>
          <div className="relative rounded-xl border border-cyan-500/30 bg-[#0f0f1f]/80 backdrop-blur-sm overflow-hidden focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-400/30 h-96">
            <div
              className="h-full p-4 overflow-y-auto custom-scrollbar prose prose-invert prose-cyan max-w-none"
              dangerouslySetInnerHTML={{ __html: renderedHtml || `<p class='text-cyan-500/50'>${t.markdownEditor.previewPlaceholder}</p>` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

