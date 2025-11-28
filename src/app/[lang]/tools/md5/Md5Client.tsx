"use client";

import { useState, useRef } from "react";
import TextareaWithLineNumbers from "@/components/common/TextareaWithLineNumbers";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/contexts/ToastContext";

export default function Md5Client() {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  
  const cryptoJSPromiseRef = useRef<Promise<any> | null>(null);
  
  const getCryptoJS = async () => {
    if (!cryptoJSPromiseRef.current) {
      cryptoJSPromiseRef.current = import("crypto-js").then((mod) => mod.default);
    }
    return cryptoJSPromiseRef.current;
  };

  // Base button styles
  const buttonBaseClass = "px-4 py-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400/50 transition-all";

  // Calculate MD5 hash
  const handleHash = async () => {
    if (!input.trim()) {
      setOutput("");
      setError("");
      return;
    }

    try {
      const CryptoJS = await getCryptoJS();
      const hash = CryptoJS.MD5(input).toString();
      setOutput(hash);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : t.md5.hashFailed);
      setOutput("");
    }
  };

  // Clear all content
  const clearAll = () => {
    setInput("");
    setOutput("");
    setError("");
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      showToast(t.md5.copied, "success");
    }).catch(() => {
      // Silently fail if clipboard access is denied
    });
  };

  // Load example and auto-calculate hash
  const loadExample = async () => {
    const example = "Hello, World!";
    setInput(example);
    setOutput("");
    setError("");
    // Auto calculate hash for example
    try {
      const CryptoJS = await getCryptoJS();
      const hash = CryptoJS.MD5(example).toString();
      setOutput(hash);
    } catch (e) {
      // Ignore errors for auto-calculation
    }
  };

  return (
    <div className="space-y-6 mb-4">
      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleHash}
          className={buttonBaseClass}
        >
          {t.md5.hash}
        </button>
        <button
          onClick={loadExample}
          className={buttonBaseClass}
        >
          {t.md5.loadExample}
        </button>
        <button
          onClick={clearAll}
          className={buttonBaseClass}
        >
          {t.md5.clear}
        </button>
      </div>

      {/* Input/output area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input box */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-cyan-300">{t.md5.input}</label>
            <button
              onClick={() => copyToClipboard(input)}
              className="text-xs text-cyan-400/70 hover:text-cyan-300 transition-colors"
            >
              {t.md5.copy}
            </button>
          </div>
          <div className="relative rounded-xl border border-cyan-500/30 bg-[#0f0f1f]/80 backdrop-blur-sm overflow-hidden focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-400/30">
            <TextareaWithLineNumbers
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setError("");
              }}
              placeholder={t.md5.inputPlaceholder}
              className="rounded-xl p-4 text-cyan-50 placeholder-cyan-500/50 font-mono text-sm focus:outline-none resize-none custom-scrollbar bg-transparent border-0"
            />
          </div>
        </div>

        {/* Output box */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-cyan-300">{t.md5.output}</label>
            <button
              onClick={() => output && copyToClipboard(output)}
              className="text-xs text-cyan-400/70 hover:text-cyan-300 transition-colors"
            >
              {t.md5.copy}
            </button>
          </div>
          <div className={`relative rounded-xl border ${
            error ? "border-red-500/50" : "border-cyan-500/30"
          } bg-[#0f0f1f]/80 backdrop-blur-sm overflow-hidden`}>
            <TextareaWithLineNumbers
              value={output}
              readOnly
              placeholder={t.md5.outputPlaceholder}
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
              <h3 className="text-sm font-medium text-red-300 mb-1">{t.md5.errorTitle}</h3>
              <p className="text-sm text-red-400/80">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
