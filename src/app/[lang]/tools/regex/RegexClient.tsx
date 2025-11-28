"use client";

import { useState, useEffect } from "react";
import TextareaWithLineNumbers from "@/components/common/TextareaWithLineNumbers";
import Dropdown from "@/components/common/Dropdown";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/contexts/ToastContext";

interface MatchResult {
  match: string;
  index: number;
  groups: string[];
}

export default function RegexClient() {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [regexPattern, setRegexPattern] = useState("");
  const [testText, setTestText] = useState("");
  const [replacement, setReplacement] = useState("");
  const [flags, setFlags] = useState({
    g: true,
    i: false,
    m: false,
    s: false,
    u: false,
    y: false,
  });
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [replaceResult, setReplaceResult] = useState("");
  const [error, setError] = useState("");
  const [highlightedText, setHighlightedText] = useState<React.ReactNode[]>([]);
  const [selectedExample, setSelectedExample] = useState<string>("");

  // Base button styles
  const buttonBaseClass = "px-4 py-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400/50 transition-all";
  
  // Build flags string
  const getFlagsString = (): string => {
    return Object.entries(flags)
      .filter(([_, value]) => value)
      .map(([key]) => key)
      .join("");
  };

  // Check if input is valid
  const isValidInput = (): boolean => {
    return regexPattern.trim() !== "" && testText.trim() !== "";
  };

  // Execute matching
  const executeMatch = () => {
    if (!regexPattern.trim()) {
      setError("");
      setMatches([]);
      setHighlightedText([]);
      return;
    }

    if (!testText.trim()) {
      setMatches([]);
      setHighlightedText([]);
      setError("");
      return;
    }

    try {
      const flagsStr = getFlagsString();
      const regex = new RegExp(regexPattern, flagsStr);
      const allMatches: MatchResult[] = [];
      const parts: React.ReactNode[] = [];
      let lastIndex = 0;

      // Execute global matching
      if (flags.g || flags.y) {
        let match;
        while ((match = regex.exec(testText)) !== null) {
          allMatches.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1),
          });

          // If using sticky flag and match position is not at string start, manually update lastIndex
          if (flags.y && match.index !== regex.lastIndex) {
            regex.lastIndex = match.index + 1;
          }

          // Prevent infinite loop
          if (match.index === regex.lastIndex) {
            regex.lastIndex++;
          }
        }
      } else {
        // Non-global matching, only match the first occurrence
        const match = regex.exec(testText);
        if (match) {
          allMatches.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1),
          });
        }
      }

      // Generate highlighted text
      if (allMatches.length > 0) {
        allMatches.forEach((matchResult, idx) => {
          // Add text before match
          if (matchResult.index > lastIndex) {
            parts.push(
              <span key={`text-${idx}`}>
                {testText.substring(lastIndex, matchResult.index)}
              </span>
            );
          }

          // Add highlighted match text
          parts.push(
            <mark
              key={`match-${idx}`}
              className="bg-yellow-400/30 text-yellow-200 px-0.5 rounded"
            >
              {matchResult.match}
            </mark>
          );

          lastIndex = matchResult.index + matchResult.match.length;
        });

        // Add remaining text
        if (lastIndex < testText.length) {
          parts.push(
            <span key="text-end">{testText.substring(lastIndex)}</span>
          );
        }
      } else {
        parts.push(<span key="no-match">{testText}</span>);
      }

      setMatches(allMatches);
      setHighlightedText(parts);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : t.regex.invalidRegex);
      setMatches([]);
      setHighlightedText([]);
    }
  };

  // Execute replacement
  const executeReplace = () => {
    if (!isValidInput()) {
      setReplaceResult("");
      setError("");
      return;
    }

    try {
      const flagsStr = getFlagsString();
      const regex = new RegExp(regexPattern, flagsStr);
      const result = testText.replace(regex, replacement);
      setReplaceResult(result);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : t.regex.invalidRegex);
      setReplaceResult("");
    }
  };

  // Auto-match when regex pattern or text changes
  useEffect(() => {
    executeMatch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [regexPattern, testText, flags.g, flags.i, flags.m, flags.s, flags.u, flags.y]);

  // Example data configuration
  const examples: Record<string, { pattern: string; text: string; replacement?: string; name: string }> = {
    email: {
      pattern: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}",
      text: "联系邮箱：contact@example.com 或 support@toolify.com",
      name: t.regex.exampleEmail,
    },
    phone: {
      pattern: "1[3-9]\\d{9}",
      text: "手机号码：13812345678, 15987654321",
      name: t.regex.examplePhone,
    },
    url: {
      pattern: "https?://[\\w\\-._~:/?#\\[\\]@!$&'()*+,;=]+",
      text: "访问 https://www.example.com 或 http://toolify.com",
      name: t.regex.exampleUrl,
    },
    ip: {
      pattern: "\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b",
      text: "IP地址：192.168.1.1 和 10.0.0.1",
      name: t.regex.exampleIp,
    },
    date: {
      pattern: "\\d{4}-\\d{2}-\\d{2}",
      text: "日期：2024-01-01, 2024-12-31",
      name: t.regex.exampleDate,
    },
    chinese: {
      pattern: "[\\u4e00-\\u9fa5]+",
      text: "中文字符：你好世界 正则表达式",
      name: t.regex.exampleChinese,
    },
  };

  // Get example display name
  const getExampleName = (type: string): string => {
    return examples[type]?.name || "";
  };

  // Load common example
  const loadExample = (type: string) => {
    const example = examples[type];
    if (example) {
      setRegexPattern(example.pattern);
      setTestText(example.text);
      if (example.replacement) {
        setReplacement(example.replacement);
      }
      setSelectedExample(type);
      setError("");
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      showToast(t.regex.copied, "success");
    });
  };

  // Clear all content
  const clearAll = (includeSelected = true) => {
    setRegexPattern("");
    setTestText("");
    setReplacement("");
    setMatches([]);
    setReplaceResult("");
    setError("");
    setHighlightedText([]);
    if (includeSelected) {
      setSelectedExample("");
    }
  };

  // Clear example (don't clear selectedExample)
  const clearExample = () => {
    setRegexPattern("");
    setTestText("");
    setReplacement("");
    setMatches([]);
    setReplaceResult("");
    setError("");
    setHighlightedText([]);
  };

  return (
    <div className="space-y-6 mb-4">
      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={executeMatch}
          className={buttonBaseClass}
        >
          {t.regex.match}
        </button>
        <button
          onClick={executeReplace}
          className={buttonBaseClass}
        >
          {t.regex.replace}
        </button>
        <button
          onClick={() => clearAll()}
          className={buttonBaseClass}
        >
          {t.regex.clear}
        </button>
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-sm text-cyan-400/70">{t.regex.commonExamples}:</span>
          <Dropdown
            trigger={
              <span className="px-3 py-1 rounded-lg border border-cyan-500/30 bg-[#0f0f1f]/60 text-cyan-300 hover:bg-[#0f0f1f]/80 hover:border-cyan-400/40 transition-all flex items-center gap-2 cursor-pointer">
                {selectedExample ? getExampleName(selectedExample) : t.regex.commonExamples}
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            }
            width="w-48"
            align="right"
          >
            <div className="p-2">
              <button
                onClick={() => clearExample()}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  !selectedExample
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/30"
                    : "text-cyan-400/70 hover:bg-cyan-500/10 hover:text-cyan-300"
                }`}
              >
                {t.regex.commonExamples}
              </button>
              {Object.entries(examples).map(([key, example], index) => (
                <button
                  key={key}
                  onClick={() => loadExample(key)}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    index > 0 ? "mt-1" : ""
                  } ${
                    selectedExample === key
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/30"
                      : "text-cyan-400/70 hover:bg-cyan-500/10 hover:text-cyan-300"
                  }`}
                >
                  {example.name}
                </button>
              ))}
            </div>
          </Dropdown>
        </div>
      </div>

      {/* Flag selection */}
      <div className="flex flex-wrap gap-4">
        <label className="text-sm text-cyan-400/70">{t.regex.flags}:</label>
        {Object.entries(flags).map(([key, value]) => {
          const flagLabels: Record<string, string> = {
            g: t.regex.flagG,
            i: t.regex.flagI,
            m: t.regex.flagM,
            s: t.regex.flagS,
            u: t.regex.flagU,
            y: t.regex.flagY,
          };
          return (
            <label key={key} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => {
                  setFlags((prev) => ({ ...prev, [key]: e.target.checked }));
                }}
                className="w-4 h-4 rounded border-cyan-500/30 bg-[#0f0f1f]/60 text-cyan-400 focus:ring-cyan-400/30"
              />
              <span className="text-sm text-cyan-300">{flagLabels[key]}</span>
            </label>
          );
        })}
      </div>

      {/* Input area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Regex pattern input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-cyan-300">{t.regex.regexPattern}</label>
          <input
            type="text"
            value={regexPattern}
            onChange={(e) => {
              setRegexPattern(e.target.value);
              setError("");
            }}
            placeholder={t.regex.regexPlaceholder}
            className="w-full rounded-xl border border-cyan-500/30 bg-[#0f0f1f]/80 backdrop-blur-sm px-4 py-3 text-cyan-50 placeholder-cyan-500/50 font-mono text-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
          />
        </div>

        {/* Replacement text input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-cyan-300">{t.regex.replacement}</label>
          <input
            type="text"
            value={replacement}
            onChange={(e) => setReplacement(e.target.value)}
            placeholder={t.regex.replacementPlaceholder}
            className="w-full rounded-xl border border-cyan-500/30 bg-[#0f0f1f]/80 backdrop-blur-sm px-4 py-3 text-cyan-50 placeholder-cyan-500/50 text-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
          />
        </div>
      </div>

      {/* Test text input */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-cyan-300">{t.regex.testText}</label>
          <button
            onClick={() => copyToClipboard(testText)}
            className="text-xs text-cyan-400/70 hover:text-cyan-300 transition-colors"
          >
            {t.regex.copy}
          </button>
        </div>
        <div className="relative rounded-xl border border-cyan-500/30 bg-[#0f0f1f]/80 backdrop-blur-sm overflow-hidden focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-400/30">
          <TextareaWithLineNumbers
            value={testText}
            onChange={(e) => {
              setTestText(e.target.value);
              setError("");
            }}
            placeholder={t.regex.textPlaceholder}
            className="rounded-xl p-4 text-cyan-50 placeholder-cyan-500/50 font-mono text-sm focus:outline-none resize-none custom-scrollbar bg-transparent border-0"
          />
        </div>
      </div>

      {/* Match results */}
      {matches.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-cyan-300">
              {t.regex.matches} ({t.regex.matchCount.replace("{count}", String(matches.length))})
            </label>
          </div>
          <div className="rounded-xl border border-cyan-500/30 bg-[#0f0f1f]/80 backdrop-blur-sm p-4">
            <div className="font-mono text-sm text-cyan-50 whitespace-pre-wrap break-words">
              {highlightedText.length > 0 ? highlightedText : testText}
            </div>
          </div>
        </div>
      )}

      {/* Replacement result */}
      {replaceResult && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-cyan-300">{t.regex.replaceResult}</label>
            <button
              onClick={() => copyToClipboard(replaceResult)}
              className="text-xs text-cyan-400/70 hover:text-cyan-300 transition-colors"
            >
              {t.regex.copy}
            </button>
          </div>
          <div className="relative rounded-xl border border-cyan-500/30 bg-[#0f0f1f]/80 backdrop-blur-sm overflow-hidden">
            <TextareaWithLineNumbers
              value={replaceResult}
              readOnly
              placeholder={t.regex.replaceResult}
              className="rounded-xl p-4 text-cyan-50 placeholder-cyan-500/50 font-mono text-sm resize-none custom-scrollbar bg-transparent border-0"
            />
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="rounded-xl border border-red-500/50 bg-red-500/10 p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-red-300 mb-1">{t.regex.errorTitle}</h3>
              <p className="text-sm text-red-400/80">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

