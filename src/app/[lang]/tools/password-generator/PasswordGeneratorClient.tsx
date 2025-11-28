"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/contexts/ToastContext";

// Generate random password based on options
function generatePassword(
  length: number,
  includeUppercase: boolean,
  includeLowercase: boolean,
  includeNumbers: boolean,
  includeSymbols: boolean
): string {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";

  let charset = "";
  if (includeUppercase) charset += uppercase;
  if (includeLowercase) charset += lowercase;
  if (includeNumbers) charset += numbers;
  if (includeSymbols) charset += symbols;

  // Ensure at least one character type is selected
  if (charset.length === 0) {
    charset = lowercase + numbers;
  }

  let password = "";
  const charsetArray = charset.split("");

  // Generate password
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charsetArray.length);
    password += charsetArray[randomIndex];
  }

  return password;
}

export default function PasswordGeneratorClient() {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [length, setLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(false);
  const [passwords, setPasswords] = useState<string[]>([]);
  const [count, setCount] = useState(1);

  // Base button styles
  const buttonBaseClass = "px-4 py-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400/50 transition-all";

  // Generate passwords
  const handleGenerate = () => {
    const newPasswords = Array.from({ length: count }, () =>
      generatePassword(length, includeUppercase, includeLowercase, includeNumbers, includeSymbols)
    );
    setPasswords(newPasswords);
  };

  // Copy to clipboard
  const copyToClipboard = (text: string, isAll = false) => {
    navigator.clipboard.writeText(text).then(() => {
      showToast(isAll ? t.passwordGenerator.copiedAll : t.passwordGenerator.copied, "success");
    }).catch(() => {
      // Silently fail if clipboard access is denied
    });
  };

  // Copy all passwords
  const copyAllToClipboard = () => {
    if (passwords.length === 0) return;
    copyToClipboard(passwords.join("\n"), true);
  };

  // Clear all content
  const clearAll = () => {
    setPasswords([]);
  };

  return (
    <div className="space-y-6 mb-4">
      {/* Options */}
      <div className="rounded-xl border border-cyan-500/30 bg-[#0f0f1f]/80 backdrop-blur-sm p-6 space-y-4">
        <h3 className="text-sm font-medium text-cyan-300 mb-4">{t.passwordGenerator.options}</h3>
        
        {/* Length */}
        <div className="flex items-center justify-between">
          <label className="text-sm text-cyan-400/70">{t.passwordGenerator.length}:</label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="4"
              max="128"
              value={length}
              onChange={(e) => setLength(parseInt(e.target.value, 10))}
              className="w-32 h-2 bg-cyan-500/20 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
            <input
              type="number"
              min="4"
              max="128"
              value={length}
              onChange={(e) => {
                const value = Math.max(4, Math.min(128, parseInt(e.target.value, 10) || 4));
                setLength(value);
              }}
              className="w-20 px-3 py-1 rounded-lg border border-cyan-500/30 bg-[#0f0f1f]/60 text-cyan-300 text-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
        </div>

        {/* Character types */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeUppercase}
              onChange={(e) => setIncludeUppercase(e.target.checked)}
              className="w-4 h-4 rounded border-cyan-500/30 bg-[#0f0f1f]/60 text-cyan-500 focus:ring-cyan-400/50 focus:ring-2 cursor-pointer"
            />
            <span className="text-sm text-cyan-300">{t.passwordGenerator.includeUppercase}</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeLowercase}
              onChange={(e) => setIncludeLowercase(e.target.checked)}
              className="w-4 h-4 rounded border-cyan-500/30 bg-[#0f0f1f]/60 text-cyan-500 focus:ring-cyan-400/50 focus:ring-2 cursor-pointer"
            />
            <span className="text-sm text-cyan-300">{t.passwordGenerator.includeLowercase}</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeNumbers}
              onChange={(e) => setIncludeNumbers(e.target.checked)}
              className="w-4 h-4 rounded border-cyan-500/30 bg-[#0f0f1f]/60 text-cyan-500 focus:ring-cyan-400/50 focus:ring-2 cursor-pointer"
            />
            <span className="text-sm text-cyan-300">{t.passwordGenerator.includeNumbers}</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeSymbols}
              onChange={(e) => setIncludeSymbols(e.target.checked)}
              className="w-4 h-4 rounded border-cyan-500/30 bg-[#0f0f1f]/60 text-cyan-500 focus:ring-cyan-400/50 focus:ring-2 cursor-pointer"
            />
            <span className="text-sm text-cyan-300">{t.passwordGenerator.includeSymbols}</span>
          </label>
        </div>

        {/* Count */}
        <div className="flex items-center justify-between pt-2 border-t border-cyan-500/20">
          <label className="text-sm text-cyan-400/70">{t.passwordGenerator.count}:</label>
          <input
            type="number"
            min="1"
            max="50"
            value={count}
            onChange={(e) => {
              const value = Math.max(1, Math.min(50, parseInt(e.target.value, 10) || 1));
              setCount(value);
            }}
            className="w-20 px-3 py-1 rounded-lg border border-cyan-500/30 bg-[#0f0f1f]/60 text-cyan-300 text-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleGenerate}
          className={buttonBaseClass}
        >
          {count > 1 ? t.passwordGenerator.generateMultiple : t.passwordGenerator.generate}
        </button>
        <button
          onClick={clearAll}
          className={buttonBaseClass}
        >
          {t.passwordGenerator.clear}
        </button>
      </div>

      {/* Output area */}
      {passwords.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-cyan-300">
              {t.passwordGenerator.output} ({passwords.length})
            </label>
            <button
              onClick={copyAllToClipboard}
              className="text-xs text-cyan-400/70 hover:text-cyan-300 transition-colors"
            >
              {t.passwordGenerator.copyAll}
            </button>
          </div>
          {/* Password list with copy buttons */}
          <div className="space-y-2">
            {passwords.map((password, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-lg border border-cyan-500/20 bg-[#0f0f1f]/40 hover:bg-[#0f0f1f]/60 transition-colors"
              >
                <span className="flex-1 font-mono text-sm text-cyan-300">{password}</span>
                <button
                  onClick={() => copyToClipboard(password)}
                  className="px-3 py-1 rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400/50 transition-all text-xs flex-shrink-0"
                >
                  {t.passwordGenerator.copy}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

