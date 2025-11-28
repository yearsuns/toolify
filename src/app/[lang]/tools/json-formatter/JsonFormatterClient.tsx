"use client";

import { useState, useEffect } from "react";
import Dropdown from "@/components/common/Dropdown";
import TextareaWithLineNumbers from "@/components/common/TextareaWithLineNumbers";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/contexts/ToastContext";

export default function JsonFormatterClient() {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [indent, setIndent] = useState(2);
  const [isCompressed, setIsCompressed] = useState(false);
  const [hasFormatted, setHasFormatted] = useState(false); // Flag to track if JSON has been formatted

  // Generic JSON processing function
  const processJson = (compress: boolean = false) => {
    if (!input.trim()) {
      setOutput("");
      setError("");
      setIsCompressed(false);
      setHasFormatted(false);
      return;
    }

    try {
      const parsed = JSON.parse(input);
      const result = compress ? JSON.stringify(parsed) : JSON.stringify(parsed, null, indent);
      setOutput(result);
      setError("");
      setIsCompressed(compress);
      setHasFormatted(!compress);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : (compress ? t.jsonFormatter.invalidJson : "Invalid JSON format");
      setError(errorMessage);
      setOutput("");
      setHasFormatted(false);
    }
  };

  // Auto-reformat when indent changes if there's already formatted output
  useEffect(() => {
    if (hasFormatted && input.trim() && !isCompressed) {
    try {
      const parsed = JSON.parse(input);
        const formatted = JSON.stringify(parsed, null, indent);
        setOutput(formatted);
      setError("");
    } catch (e) {
        // Don't update output if parsing fails
      }
    }
  }, [indent, hasFormatted, input, isCompressed]);

  // Format JSON
  const formatJson = () => processJson(false);

  // Compress JSON
  const compressJson = () => processJson(true);

  // Validate JSON
  const validateJson = () => {
    if (!input.trim()) {
      setError("");
      return;
    }

    try {
      JSON.parse(input);
      setError("");
      showToast(t.jsonFormatter.jsonValid, "success");
    } catch (e) {
      setError(e instanceof Error ? e.message : t.jsonFormatter.invalidJson);
    }
  };

  // Clear all content
  const clearAll = () => {
    setInput("");
    setOutput("");
    setError("");
    setIsCompressed(false);
    setHasFormatted(false);
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      showToast(t.jsonFormatter.copied, "success");
    });
  };

  // Example JSON
  const loadExample = () => {
    const example = {
      name: "Toolify",
      version: "1.0.0",
      description: "常用工具集合网站",
      features: ["JSON格式化", "Base64编码", "时间戳转换"],
      author: {
        name: "Toolify Team",
        email: "contact@toolify.com"
      },
      tags: ["工具", "在线", "实用"]
    };
    setInput(JSON.stringify(example, null, 2));
    setOutput("");
    setError("");
  };

  return (
    <div className="space-y-6 mb-4">
      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={formatJson}
          className="px-4 py-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400/50 transition-all"
        >
          {t.jsonFormatter.format}
        </button>
        <button
          onClick={compressJson}
          className="px-4 py-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400/50 transition-all"
        >
          {t.jsonFormatter.compress}
        </button>
        <button
          onClick={validateJson}
          className="px-4 py-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400/50 transition-all"
        >
          {t.jsonFormatter.validate}
        </button>
        <button
          onClick={loadExample}
          className="px-4 py-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400/50 transition-all"
        >
          {t.jsonFormatter.loadExample}
        </button>
        <button
          onClick={clearAll}
          className="px-4 py-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400/50 transition-all"
        >
          {t.jsonFormatter.clear}
        </button>
        <div className="flex items-center gap-2 ml-auto">
          <label className="text-sm text-cyan-400/70">{t.jsonFormatter.indent}:</label>
          <Dropdown
            trigger={
              <span className="px-3 py-1 rounded-lg border border-cyan-500/30 bg-[#0f0f1f]/60 text-cyan-300 hover:bg-[#0f0f1f]/80 hover:border-cyan-400/40 transition-all flex items-center gap-2">
                {indent === 2 ? t.jsonFormatter.indent2 : t.jsonFormatter.indent4}
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            }
            width="w-40"
            align="right"
          >
            <div className="p-2">
              <button
                onClick={() => {
                  setIndent(2);
                }}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  indent === 2
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/30"
                    : "text-cyan-400/70 hover:bg-cyan-500/10 hover:text-cyan-300"
                }`}
              >
                {t.jsonFormatter.indent2}
              </button>
              <button
                onClick={() => {
                  setIndent(4);
                }}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors mt-1 ${
                  indent === 4
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/30"
                    : "text-cyan-400/70 hover:bg-cyan-500/10 hover:text-cyan-300"
                }`}
              >
                {t.jsonFormatter.indent4}
              </button>
            </div>
          </Dropdown>
        </div>
      </div>

      {/* Input area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input box */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-cyan-300">{t.jsonFormatter.inputJson}</label>
            <button
              onClick={() => copyToClipboard(input)}
              className="text-xs text-cyan-400/70 hover:text-cyan-300 transition-colors"
            >
              {t.jsonFormatter.copy}
            </button>
          </div>
          <div className="relative rounded-xl border border-cyan-500/30 bg-[#0f0f1f]/80 backdrop-blur-sm overflow-hidden focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-400/30">
            <TextareaWithLineNumbers
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setError("");
              }}
              placeholder={t.jsonFormatter.inputPlaceholder}
              className="rounded-xl p-4 text-cyan-50 placeholder-cyan-500/50 font-mono text-sm focus:outline-none resize-none custom-scrollbar bg-transparent border-0"
            />
          </div>
        </div>

        {/* Output box */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-cyan-300">{t.jsonFormatter.outputResult}</label>
            <button
              onClick={() => output && copyToClipboard(output)}
              className="text-xs text-cyan-400/70 hover:text-cyan-300 transition-colors"
            >
              {t.jsonFormatter.copy}
            </button>
          </div>
          <div className={`relative rounded-xl border ${
            error ? "border-red-500/50" : "border-cyan-500/30"
          } bg-[#0f0f1f]/80 backdrop-blur-sm overflow-hidden`}>
            <TextareaWithLineNumbers
              value={output}
              readOnly
              placeholder={t.jsonFormatter.outputPlaceholder}
              className="rounded-xl p-4 text-cyan-50 placeholder-cyan-500/50 font-mono text-sm resize-none custom-scrollbar bg-transparent border-0"
            />
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="rounded-xl border border-red-500/50 bg-red-500/10 p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-red-300 mb-1">{t.jsonFormatter.errorTitle}</h3>
              <p className="text-sm text-red-400/80">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

