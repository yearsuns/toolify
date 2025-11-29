"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/contexts/ToastContext";
import Dropdown from "@/components/common/Dropdown";

// QR code configuration constants
const QR_CODE_CONFIG = {
  margin: 2,
} as const;

// Default colors
const DEFAULT_FOREGROUND_COLOR = "#06b6d4"; // cyan-500
const DEFAULT_BACKGROUND_COLOR = "#0f0f1f"; // dark background

export default function QrcodeClient() {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [input, setInput] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [error, setError] = useState("");
  const [size, setSize] = useState(256);
  const [errorCorrectionLevel, setErrorCorrectionLevel] = useState<"L" | "M" | "Q" | "H">("M");
  const [foregroundColor, setForegroundColor] = useState(DEFAULT_FOREGROUND_COLOR);
  const [backgroundColor, setBackgroundColor] = useState(DEFAULT_BACKGROUND_COLOR);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Cache qrcode import
  const qrcodePromiseRef = useRef<Promise<any> | null>(null);
  
  const getQRCode = async () => {
    if (!qrcodePromiseRef.current) {
      qrcodePromiseRef.current = import("qrcode");
    }
    return qrcodePromiseRef.current;
  };

  // Button style classes
  const buttonBaseClass = "px-4 py-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400/50 transition-all";
  const buttonSmallClass = "px-3 py-1 rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400/50 transition-all text-xs";

  // Generate QR code from text
  const generateQRCode = useCallback(async (text: string) => {
    if (!text.trim()) {
      setQrCodeUrl("");
      setError("");
      return;
    }

    try {
      const QRCode = await getQRCode();
      const canvas = canvasRef.current;
      if (!canvas) {
        throw new Error("Canvas not available");
      }

      await QRCode.toCanvas(canvas, text.trim(), {
        width: size,
        errorCorrectionLevel: errorCorrectionLevel,
        margin: QR_CODE_CONFIG.margin,
        color: {
          dark: foregroundColor,
          light: backgroundColor,
        },
      });

      const dataUrl = canvas.toDataURL("image/png");
      setQrCodeUrl(dataUrl);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : t.qrcode.generateFailed);
      setQrCodeUrl("");
    }
  }, [size, errorCorrectionLevel, foregroundColor, backgroundColor, t.qrcode.generateFailed]);

  // Generate QR code from input
  const handleGenerate = useCallback(() => {
    generateQRCode(input);
  }, [input, generateQRCode]);

  // Auto regenerate QR code when options change
  useEffect(() => {
    if (input.trim() && qrCodeUrl) {
      generateQRCode(input);
    }
  }, [size, errorCorrectionLevel, foregroundColor, backgroundColor, input, qrCodeUrl, generateQRCode]);

  // Download QR code
  const handleDownload = () => {
    if (!qrCodeUrl) return;

    const link = document.createElement("a");
    link.download = `qrcode-${Date.now()}.png`;
    link.href = qrCodeUrl;
    link.click();
    showToast(t.qrcode.downloaded, "success");
  };

  // Copy QR code image to clipboard
  const handleCopyImage = async () => {
    if (!qrCodeUrl) return;

    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      showToast(t.qrcode.copied, "success");
    } catch (e) {
      showToast(t.qrcode.copyFailed, "error");
    }
  };

  // Load example
  const loadExample = async () => {
    const example = "https://toolify-app.vercel.app";
    setInput(example);
    setError("");
    await generateQRCode(example);
  };

  // Clear all content
  const clearAll = () => {
    setInput("");
    setQrCodeUrl("");
    setError("");
  };

  return (
    <div className="space-y-6 mb-4">
      {/* Options */}
      <div className="rounded-xl border border-cyan-500/30 bg-[#0f0f1f]/80 backdrop-blur-sm p-6 space-y-4 relative z-40">
        <h3 className="text-sm font-medium text-cyan-300 mb-4">{t.qrcode.options}</h3>
        
        {/* Size */}
        <div className="flex items-center justify-between">
          <label className="text-sm text-cyan-400/70">{t.qrcode.size}:</label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="128"
              max="512"
              step="32"
              value={size}
              onChange={(e) => setSize(parseInt(e.target.value, 10))}
              className="w-32 h-2 bg-cyan-500/20 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
            <input
              type="number"
              min="128"
              max="512"
              step="32"
              value={size}
              onChange={(e) => {
                const value = Math.max(128, Math.min(512, parseInt(e.target.value, 10) || 256));
                setSize(value);
              }}
              className="w-20 px-3 py-1 rounded-lg border border-cyan-500/30 bg-[#0f0f1f]/60 text-cyan-300 text-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
        </div>

        {/* Error correction level */}
        <div className="flex items-center justify-between">
          <label className="text-sm text-cyan-400/70">{t.qrcode.errorCorrectionLevel}:</label>
          <Dropdown
            trigger={
              <span className="px-3 py-2 rounded-lg border border-cyan-500/30 bg-[#0f0f1f]/60 text-cyan-300 hover:bg-[#0f0f1f]/80 hover:border-cyan-400/40 transition-all flex items-center gap-2 cursor-pointer text-sm">
                <span>{errorCorrectionLevel} ({t.qrcode.errorCorrectionLevels[errorCorrectionLevel]})</span>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            }
            width="w-48"
            align="right"
          >
            <div className="p-2">
              {(["L", "M", "Q", "H"] as const).map((level, index) => (
                <button
                  key={level}
                  onClick={() => setErrorCorrectionLevel(level)}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    index > 0 ? "mt-1" : ""
                  } ${
                    errorCorrectionLevel === level
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/30"
                      : "text-cyan-400/70 hover:bg-cyan-500/10 hover:text-cyan-300"
                  }`}
                >
                  {level} ({t.qrcode.errorCorrectionLevels[level]})
                </button>
              ))}
            </div>
          </Dropdown>
        </div>

        {/* Colors */}
        <div className="space-y-3">
          {/* Foreground color */}
          <div className="flex items-center justify-between">
            <label className="text-sm text-cyan-400/70">{t.qrcode.foregroundColor}:</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={foregroundColor}
                onChange={(e) => setForegroundColor(e.target.value)}
                className="w-12 h-8 rounded-lg border border-cyan-500/30 bg-[#0f0f1f]/60 cursor-pointer"
              />
              <input
                type="text"
                value={foregroundColor}
                onChange={(e) => {
                  const value = e.target.value;
                  // Allow valid hex color format (# followed by 0-6 hex digits)
                  if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
                    setForegroundColor(value);
                  }
                }}
                onBlur={(e) => {
                  // Validate and fix color on blur - ensure it's a valid 6-digit hex color
                  const value = e.target.value;
                  if (!/^#[0-9A-Fa-f]{6}$/.test(value)) {
                    setForegroundColor(DEFAULT_FOREGROUND_COLOR);
                  }
                }}
                className="w-24 px-3 py-1 rounded-lg border border-cyan-500/30 bg-[#0f0f1f]/60 text-cyan-300 text-sm font-mono focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
                placeholder="#06b6d4"
              />
            </div>
          </div>

          {/* Background color */}
          <div className="flex items-center justify-between">
            <label className="text-sm text-cyan-400/70">{t.qrcode.backgroundColor}:</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="w-12 h-8 rounded-lg border border-cyan-500/30 bg-[#0f0f1f]/60 cursor-pointer"
              />
              <input
                type="text"
                value={backgroundColor}
                onChange={(e) => {
                  const value = e.target.value;
                  // Allow valid hex color format (# followed by 0-6 hex digits)
                  if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
                    setBackgroundColor(value);
                  }
                }}
                onBlur={(e) => {
                  // Validate and fix color on blur - ensure it's a valid 6-digit hex color
                  const value = e.target.value;
                  if (!/^#[0-9A-Fa-f]{6}$/.test(value)) {
                    setBackgroundColor(DEFAULT_BACKGROUND_COLOR);
                  }
                }}
                className="w-24 px-3 py-1 rounded-lg border border-cyan-500/30 bg-[#0f0f1f]/60 text-cyan-300 text-sm font-mono focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
                placeholder="#0f0f1f"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Input area */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-cyan-300">{t.qrcode.input}</label>
        </div>
        <div className="relative rounded-xl border border-cyan-500/30 bg-[#0f0f1f]/80 backdrop-blur-sm overflow-hidden focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-400/30">
          <textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError("");
            }}
            placeholder={t.qrcode.inputPlaceholder}
            className="w-full px-4 py-3 text-cyan-50 placeholder-cyan-500/50 font-mono text-sm focus:outline-none resize-none custom-scrollbar bg-transparent border-0"
            rows={4}
          />
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleGenerate}
          className={buttonBaseClass}
        >
          {t.qrcode.generate}
        </button>
        <button
          onClick={loadExample}
          className={buttonBaseClass}
        >
          {t.qrcode.loadExample}
        </button>
        <button
          onClick={clearAll}
          className={buttonBaseClass}
        >
          {t.qrcode.clear}
        </button>
      </div>

      {/* QR Code output */}
      {qrCodeUrl && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-cyan-300">{t.qrcode.output}</label>
            <div className="flex gap-2">
              <button onClick={handleDownload} className={buttonSmallClass}>
                {t.qrcode.download}
              </button>
              <button onClick={handleCopyImage} className={buttonSmallClass}>
                {t.qrcode.copyImage}
              </button>
            </div>
          </div>
          <div className="flex justify-center p-6 rounded-xl border border-cyan-500/30 bg-[#0f0f1f]/80 backdrop-blur-sm">
            <img src={qrCodeUrl} alt="QR Code" className="max-w-full h-auto" />
          </div>
        </div>
      )}

      {/* Hidden canvas for QR code generation */}
      <canvas ref={canvasRef} style={{ display: "none" }} />

      {/* Error message */}
      {error && (
        <div className="rounded-xl border border-red-500/50 bg-red-500/10 p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-red-300 mb-1">{t.qrcode.errorTitle}</h3>
              <p className="text-sm text-red-400/80">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

