"use client";

import { useState, useCallback, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/contexts/ToastContext";

// Color conversion utilities
const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

const rgbToHex = (r: number, g: number, b: number): string => {
  return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
};

const rgbToHsl = (r: number, g: number, b: number): { h: number; s: number; l: number } => {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
};

const hslToRgb = (h: number, s: number, l: number): { r: number; g: number; b: number } => {
  h /= 360;
  s /= 100;
  l /= 100;
  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
};

const rgbToHsv = (r: number, g: number, b: number): { h: number; s: number; v: number } => {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;

  if (d !== 0) {
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  const s = max === 0 ? 0 : d / max;
  const v = max;

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    v: Math.round(v * 100),
  };
};

const hsvToRgb = (h: number, s: number, v: number): { r: number; g: number; b: number } => {
  h /= 360;
  s /= 100;
  v /= 100;
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  let r, g, b;

  switch (i % 6) {
    case 0:
      r = v;
      g = t;
      b = p;
      break;
    case 1:
      r = q;
      g = v;
      b = p;
      break;
    case 2:
      r = p;
      g = v;
      b = t;
      break;
    case 3:
      r = p;
      g = q;
      b = v;
      break;
    case 4:
      r = t;
      g = p;
      b = v;
      break;
    case 5:
      r = v;
      g = p;
      b = q;
      break;
    default:
      r = g = b = 0;
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
};

// Default color
const DEFAULT_COLOR = "#06b6d4"; // cyan-500

// Recommended color palettes grouped by color family
const COLOR_PALETTES = [
  {
    group: "reds",
    colors: [
      { name: "Red 50", hex: "#fef2f2" },
      { name: "Red 100", hex: "#fee2e2" },
      { name: "Red 200", hex: "#fecaca" },
      { name: "Red 300", hex: "#fca5a5" },
      { name: "Red 400", hex: "#f87171" },
      { name: "Red 500", hex: "#ef4444" },
      { name: "Red 600", hex: "#dc2626" },
      { name: "Red 700", hex: "#b91c1c" },
      { name: "Red 800", hex: "#991b1b" },
      { name: "Red 900", hex: "#7f1d1d" },
    ],
  },
  {
    group: "oranges",
    colors: [
      { name: "Orange 50", hex: "#fff7ed" },
      { name: "Orange 100", hex: "#ffedd5" },
      { name: "Orange 200", hex: "#fed7aa" },
      { name: "Orange 300", hex: "#fdba74" },
      { name: "Orange 400", hex: "#fb923c" },
      { name: "Orange 500", hex: "#f97316" },
      { name: "Orange 600", hex: "#ea580c" },
      { name: "Orange 700", hex: "#c2410c" },
      { name: "Orange 800", hex: "#9a3412" },
      { name: "Orange 900", hex: "#7c2d12" },
    ],
  },
  {
    group: "yellows",
    colors: [
      { name: "Yellow 50", hex: "#fefce8" },
      { name: "Yellow 100", hex: "#fef9c3" },
      { name: "Yellow 200", hex: "#fef08a" },
      { name: "Yellow 300", hex: "#fde047" },
      { name: "Yellow 400", hex: "#facc15" },
      { name: "Yellow 500", hex: "#eab308" },
      { name: "Yellow 600", hex: "#ca8a04" },
      { name: "Yellow 700", hex: "#a16207" },
      { name: "Yellow 800", hex: "#854d0e" },
      { name: "Yellow 900", hex: "#713f12" },
    ],
  },
  {
    group: "greens",
    colors: [
      { name: "Green 50", hex: "#f0fdf4" },
      { name: "Green 100", hex: "#dcfce7" },
      { name: "Green 200", hex: "#bbf7d0" },
      { name: "Green 300", hex: "#86efac" },
      { name: "Green 400", hex: "#4ade80" },
      { name: "Green 500", hex: "#22c55e" },
      { name: "Green 600", hex: "#16a34a" },
      { name: "Green 700", hex: "#15803d" },
      { name: "Green 800", hex: "#166534" },
      { name: "Green 900", hex: "#14532d" },
    ],
  },
  {
    group: "blues",
    colors: [
      { name: "Blue 50", hex: "#eff6ff" },
      { name: "Blue 100", hex: "#dbeafe" },
      { name: "Blue 200", hex: "#bfdbfe" },
      { name: "Blue 300", hex: "#93c5fd" },
      { name: "Blue 400", hex: "#60a5fa" },
      { name: "Blue 500", hex: "#3b82f6" },
      { name: "Blue 600", hex: "#2563eb" },
      { name: "Blue 700", hex: "#1d4ed8" },
      { name: "Blue 800", hex: "#1e40af" },
      { name: "Blue 900", hex: "#1e3a8a" },
    ],
  },
  {
    group: "purples",
    colors: [
      { name: "Purple 50", hex: "#faf5ff" },
      { name: "Purple 100", hex: "#f3e8ff" },
      { name: "Purple 200", hex: "#e9d5ff" },
      { name: "Purple 300", hex: "#d8b4fe" },
      { name: "Purple 400", hex: "#c084fc" },
      { name: "Purple 500", hex: "#a855f7" },
      { name: "Purple 600", hex: "#9333ea" },
      { name: "Purple 700", hex: "#7e22ce" },
      { name: "Purple 800", hex: "#6b21a8" },
      { name: "Purple 900", hex: "#581c87" },
    ],
  },
  {
    group: "pinks",
    colors: [
      { name: "Pink 50", hex: "#fdf2f8" },
      { name: "Pink 100", hex: "#fce7f3" },
      { name: "Pink 200", hex: "#fbcfe8" },
      { name: "Pink 300", hex: "#f9a8d4" },
      { name: "Pink 400", hex: "#f472b6" },
      { name: "Pink 500", hex: "#ec4899" },
      { name: "Pink 600", hex: "#db2777" },
      { name: "Pink 700", hex: "#be185d" },
      { name: "Pink 800", hex: "#9f1239" },
      { name: "Pink 900", hex: "#831843" },
    ],
  },
  {
    group: "grays",
    colors: [
      { name: "Gray 50", hex: "#f9fafb" },
      { name: "Gray 100", hex: "#f3f4f6" },
      { name: "Gray 200", hex: "#e5e7eb" },
      { name: "Gray 300", hex: "#d1d5db" },
      { name: "Gray 400", hex: "#9ca3af" },
      { name: "Gray 500", hex: "#6b7280" },
      { name: "Gray 600", hex: "#4b5563" },
      { name: "Gray 700", hex: "#374151" },
      { name: "Gray 800", hex: "#1f2937" },
      { name: "Gray 900", hex: "#111827" },
    ],
  },
  {
    group: "others",
    colors: [
      { name: "White", hex: "#ffffff" },
      { name: "Black", hex: "#000000" },
      { name: "Cyan 500", hex: "#06b6d4" },
      { name: "Sky 500", hex: "#0ea5e9" },
      { name: "Teal 500", hex: "#14b8a6" },
      { name: "Violet 500", hex: "#8b5cf6" },
      { name: "Indigo 500", hex: "#6366f1" },
      { name: "Rose 500", hex: "#f43f5e" },
    ],
  },
];

export default function ColorPickerClient() {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [hex, setHex] = useState(DEFAULT_COLOR);
  const [rgb, setRgb] = useState({ r: 6, g: 182, b: 212 });
  const [hsl, setHsl] = useState({ h: 187, s: 94, l: 43 });
  const [hsv, setHsv] = useState({ h: 187, s: 97, v: 83 });

  // Base button styles
  const buttonBaseClass = "px-4 py-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400/50 transition-all";
  const buttonSmallClass = "px-3 py-1 rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400/50 transition-all text-xs";

  // Update all color formats from HEX
  const updateFromHex = useCallback((hexValue: string) => {
    const rgbValue = hexToRgb(hexValue);
    if (!rgbValue) return;

    setHex(hexValue);
    setRgb(rgbValue);
    setHsl(rgbToHsl(rgbValue.r, rgbValue.g, rgbValue.b));
    setHsv(rgbToHsv(rgbValue.r, rgbValue.g, rgbValue.b));
  }, []);

  // Update all color formats from RGB
  const updateFromRgb = useCallback((r: number, g: number, b: number) => {
    const hexValue = rgbToHex(r, g, b);
    setHex(hexValue);
    setRgb({ r, g, b });
    setHsl(rgbToHsl(r, g, b));
    setHsv(rgbToHsv(r, g, b));
  }, []);

  // Update all color formats from HSL
  const updateFromHsl = useCallback((h: number, s: number, l: number) => {
    const rgbValue = hslToRgb(h, s, l);
    setHex(rgbToHex(rgbValue.r, rgbValue.g, rgbValue.b));
    setRgb(rgbValue);
    setHsl({ h, s, l });
    setHsv(rgbToHsv(rgbValue.r, rgbValue.g, rgbValue.b));
  }, []);

  // Update all color formats from HSV
  const updateFromHsv = useCallback((h: number, s: number, v: number) => {
    const rgbValue = hsvToRgb(h, s, v);
    setHex(rgbToHex(rgbValue.r, rgbValue.g, rgbValue.b));
    setRgb(rgbValue);
    setHsl(rgbToHsl(rgbValue.r, rgbValue.g, rgbValue.b));
    setHsv({ h, s, v });
  }, []);

  // Copy to clipboard
  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      showToast(t.colorPicker.copied, "success");
    }).catch(() => {
      showToast(t.colorPicker.copyFailed, "error");
    });
  }, [showToast, t.colorPicker]);

  // Format strings for display
  const hexString = useMemo(() => hex.toUpperCase(), [hex]);
  const rgbString = useMemo(() => `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`, [rgb]);
  const hslString = useMemo(() => `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`, [hsl]);
  const hsvString = useMemo(() => `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`, [hsv]);

  // Clear all
  const clearAll = () => {
    updateFromHex(DEFAULT_COLOR);
  };

  return (
    <div className="space-y-6 mb-4">
      {/* Color Picker */}
      <div className="rounded-xl border border-cyan-500/30 bg-[#0f0f1f]/80 backdrop-blur-sm p-6 space-y-4">
        <h3 className="text-sm font-medium text-cyan-300 mb-4">{t.colorPicker.pickColor}</h3>
        
        <div className="flex items-end gap-3">
          <input
            type="color"
            value={hex}
            onChange={(e) => updateFromHex(e.target.value)}
            className="w-12 h-12 rounded-md border border-cyan-500/30 bg-[#0f0f1f]/60 cursor-pointer flex-shrink-0"
          />
          <div className="flex-1">
            <div
              className="w-full h-12 rounded-md border border-cyan-500/30"
              style={{ backgroundColor: hex }}
            />
          </div>
        </div>
      </div>

      {/* Recommended Colors */}
      <div className="rounded-xl border border-cyan-500/30 bg-[#0f0f1f]/80 backdrop-blur-sm p-6 space-y-6">
        <h3 className="text-sm font-medium text-cyan-300">{t.colorPicker.recommendedColors}</h3>
        {COLOR_PALETTES.map((palette) => (
          <div key={palette.group} className="space-y-3">
            <h4 className="text-xs font-medium text-cyan-400/70 uppercase tracking-wide">
              {t.colorPicker[palette.group as keyof typeof t.colorPicker] || palette.group}
            </h4>
            <div className="grid grid-cols-16 sm:grid-cols-20 md:grid-cols-24 gap-1">
              {palette.colors.map((color) => (
                <button
                  key={color.hex}
                  onClick={() => updateFromHex(color.hex)}
                  className="group relative aspect-square rounded-md border border-cyan-500/20 hover:border-cyan-400/50 transition-all hover:scale-110"
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                >
                  {hex.toLowerCase() === color.hex.toLowerCase() && (
                    <div className="absolute inset-0 rounded-md border-2 border-cyan-400 shadow-[0_0_0_1px_rgba(6,182,212,0.4)]" />
                  )}
                  <div className="absolute inset-0 rounded-md bg-black/0 group-hover:bg-black/10 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Color Formats */}
      <div className="space-y-4">
        {/* HEX */}
        <div className="rounded-xl border border-cyan-500/30 bg-[#0f0f1f]/80 backdrop-blur-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-cyan-300">{t.colorPicker.hex}</label>
              <div
                className="w-4 h-4 rounded border border-cyan-500/30"
                style={{ backgroundColor: hex }}
              />
            </div>
            <button
              onClick={() => copyToClipboard(hexString)}
              className={buttonSmallClass}
            >
              {t.colorPicker.copy}
            </button>
          </div>
          <input
            type="text"
            value={hexString}
            onChange={(e) => {
              const value = e.target.value;
              if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
                updateFromHex(value.toLowerCase());
              }
            }}
            onBlur={(e) => {
              const value = e.target.value;
              if (!/^#[0-9A-Fa-f]{6}$/.test(value)) {
                updateFromHex(DEFAULT_COLOR);
              }
            }}
            className="w-full px-3 py-2 rounded-lg border border-cyan-500/30 bg-[#0f0f1f]/60 text-cyan-300 text-sm font-mono focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
            placeholder="#06b6d4"
          />
        </div>

        {/* RGB */}
        <div className="rounded-xl border border-cyan-500/30 bg-[#0f0f1f]/80 backdrop-blur-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-cyan-300">{t.colorPicker.rgb}</label>
              <div
                className="w-4 h-4 rounded border border-cyan-500/30"
                style={{ backgroundColor: hex }}
              />
            </div>
            <button
              onClick={() => copyToClipboard(rgbString)}
              className={buttonSmallClass}
            >
              {t.colorPicker.copy}
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {(["r", "g", "b"] as const).map((channel) => (
              <div key={channel}>
                <label className="text-xs text-cyan-400/70 mb-1 block">
                  {t.colorPicker[channel === "r" ? "red" : channel === "g" ? "green" : "blue"]}
                </label>
                <input
                  type="number"
                  min="0"
                  max="255"
                  value={rgb[channel]}
                  onChange={(e) => {
                    const value = Math.max(0, Math.min(255, parseInt(e.target.value, 10) || 0));
                    updateFromRgb(
                      channel === "r" ? value : rgb.r,
                      channel === "g" ? value : rgb.g,
                      channel === "b" ? value : rgb.b
                    );
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-cyan-500/30 bg-[#0f0f1f]/60 text-cyan-300 text-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            ))}
          </div>
        </div>

        {/* HSL */}
        <div className="rounded-xl border border-cyan-500/30 bg-[#0f0f1f]/80 backdrop-blur-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-cyan-300">{t.colorPicker.hsl}</label>
              <div
                className="w-4 h-4 rounded border border-cyan-500/30"
                style={{ backgroundColor: hex }}
              />
            </div>
            <button
              onClick={() => copyToClipboard(hslString)}
              className={buttonSmallClass}
            >
              {t.colorPicker.copy}
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {(["h", "s", "l"] as const).map((channel) => (
              <div key={channel}>
                <label className="text-xs text-cyan-400/70 mb-1 block">
                  {channel === "h"
                    ? t.colorPicker.hue
                    : channel === "s"
                    ? t.colorPicker.saturation
                    : t.colorPicker.lightness}
                </label>
                <input
                  type="number"
                  min={channel === "h" ? "0" : "0"}
                  max={channel === "h" ? "360" : "100"}
                  value={hsl[channel]}
                  onChange={(e) => {
                    const max = channel === "h" ? 360 : 100;
                    const value = Math.max(0, Math.min(max, parseInt(e.target.value, 10) || 0));
                    updateFromHsl(
                      channel === "h" ? value : hsl.h,
                      channel === "s" ? value : hsl.s,
                      channel === "l" ? value : hsl.l
                    );
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-cyan-500/30 bg-[#0f0f1f]/60 text-cyan-300 text-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            ))}
          </div>
        </div>

        {/* HSV */}
        <div className="rounded-xl border border-cyan-500/30 bg-[#0f0f1f]/80 backdrop-blur-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-cyan-300">{t.colorPicker.hsv}</label>
              <div
                className="w-4 h-4 rounded border border-cyan-500/30"
                style={{ backgroundColor: hex }}
              />
            </div>
            <button
              onClick={() => copyToClipboard(hsvString)}
              className={buttonSmallClass}
            >
              {t.colorPicker.copy}
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {(["h", "s", "v"] as const).map((channel) => (
              <div key={channel}>
                <label className="text-xs text-cyan-400/70 mb-1 block">
                  {channel === "h"
                    ? t.colorPicker.hue
                    : channel === "s"
                    ? t.colorPicker.saturation
                    : t.colorPicker.value}
                </label>
                <input
                  type="number"
                  min={channel === "h" ? "0" : "0"}
                  max={channel === "h" ? "360" : "100"}
                  value={hsv[channel]}
                  onChange={(e) => {
                    const max = channel === "h" ? 360 : 100;
                    const value = Math.max(0, Math.min(max, parseInt(e.target.value, 10) || 0));
                    updateFromHsv(
                      channel === "h" ? value : hsv.h,
                      channel === "s" ? value : hsv.s,
                      channel === "v" ? value : hsv.v
                    );
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-cyan-500/30 bg-[#0f0f1f]/60 text-cyan-300 text-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        <button onClick={clearAll} className={buttonBaseClass}>
          {t.colorPicker.clear}
        </button>
      </div>
    </div>
  );
}

