"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/contexts/ToastContext";

// Format date to string
function formatDate(date: Date, format: string): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  const milliseconds = String(date.getMilliseconds()).padStart(3, "0");

  switch (format) {
    case "ISO":
      return date.toISOString();
    case "YYYY-MM-DD HH:mm:ss":
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    case "YYYY-MM-DD HH:mm:ss.SSS":
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
    case "YYYY/MM/DD HH:mm:ss":
      return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
    case "MM/DD/YYYY HH:mm:ss":
      return `${month}/${day}/${year} ${hours}:${minutes}:${seconds}`;
    default:
      return date.toLocaleString();
  }
}

// Parse date string to Date object
function parseDate(dateString: string): Date | null {
  if (!dateString.trim()) return null;

  // Try ISO format first
  const isoDate = new Date(dateString);
  if (!isNaN(isoDate.getTime())) {
    return isoDate;
  }

  // Try common formats
  const formats = [
    /^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})(?:\.(\d{3}))?$/,
    /^(\d{4})\/(\d{2})\/(\d{2})\s+(\d{2}):(\d{2}):(\d{2})$/,
    /^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})$/,
  ];

  for (const format of formats) {
    const match = dateString.match(format);
    if (match) {
      const [, ...parts] = match;
      if (format === formats[0]) {
        // YYYY-MM-DD HH:mm:ss or YYYY-MM-DD HH:mm:ss.SSS
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const hours = parseInt(parts[3], 10);
        const minutes = parseInt(parts[4], 10);
        const seconds = parseInt(parts[5], 10);
        const ms = parts[6] ? parseInt(parts[6], 10) : 0;
        return new Date(year, month, day, hours, minutes, seconds, ms);
      } else if (format === formats[1]) {
        // YYYY/MM/DD HH:mm:ss
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const hours = parseInt(parts[3], 10);
        const minutes = parseInt(parts[4], 10);
        const seconds = parseInt(parts[5], 10);
        return new Date(year, month, day, hours, minutes, seconds);
      } else if (format === formats[2]) {
        // MM/DD/YYYY HH:mm:ss
        const month = parseInt(parts[0], 10) - 1;
        const day = parseInt(parts[1], 10);
        const year = parseInt(parts[2], 10);
        const hours = parseInt(parts[3], 10);
        const minutes = parseInt(parts[4], 10);
        const seconds = parseInt(parts[5], 10);
        return new Date(year, month, day, hours, minutes, seconds);
      }
    }
  }

  return null;
}

export default function TimestampConverterClient() {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [timestamp, setTimestamp] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [format, setFormat] = useState("YYYY-MM-DD HH:mm:ss");
  const [unit, setUnit] = useState<"seconds" | "milliseconds">("seconds");
  const [currentTimestamp, setCurrentTimestamp] = useState(0);
  const [error, setError] = useState("");

  // Update current timestamp every second
  useEffect(() => {
    const updateCurrentTimestamp = () => {
      setCurrentTimestamp(Math.floor(Date.now() / 1000));
    };
    updateCurrentTimestamp();
    const interval = setInterval(updateCurrentTimestamp, 1000);
    return () => clearInterval(interval);
  }, []);

  // Base button styles
  const buttonBaseClass = "px-4 py-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400/50 transition-all";

  // Convert timestamp to date
  const handleTimestampToDate = () => {
    if (!timestamp.trim()) {
      setDateTime("");
      setError("");
      return;
    }

    try {
      const ts = parseFloat(timestamp.trim());
      if (isNaN(ts)) {
        throw new Error(t.timestamp.invalidTimestamp);
      }

      const date = unit === "milliseconds" ? new Date(ts) : new Date(ts * 1000);
      if (isNaN(date.getTime())) {
        throw new Error(t.timestamp.invalidTimestamp);
      }

      setDateTime(formatDate(date, format));
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : t.timestamp.conversionFailed);
      setDateTime("");
    }
  };

  // Convert date to timestamp
  const handleDateToTimestamp = () => {
    if (!dateTime.trim()) {
      setTimestamp("");
      setError("");
      return;
    }

    try {
      const date = parseDate(dateTime.trim());
      if (!date || isNaN(date.getTime())) {
        throw new Error(t.timestamp.invalidDate);
      }

      const ts = unit === "milliseconds" ? date.getTime() : Math.floor(date.getTime() / 1000);
      setTimestamp(ts.toString());
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : t.timestamp.conversionFailed);
      setTimestamp("");
    }
  };

  // Use current timestamp
  const handleUseCurrent = () => {
    const ts = unit === "milliseconds" ? Date.now() : Math.floor(Date.now() / 1000);
    setTimestamp(ts.toString());
    setDateTime("");
    setError("");
    handleTimestampToDate();
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      showToast(t.timestamp.copied, "success");
    }).catch(() => {
      // Silently fail if clipboard access is denied
    });
  };

  // Clear all content
  const clearAll = () => {
    setTimestamp("");
    setDateTime("");
    setError("");
  };

  return (
    <div className="space-y-6 mb-4">
      {/* Current timestamp */}
      <div className="rounded-xl border border-cyan-500/30 bg-[#0f0f1f]/80 backdrop-blur-sm p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-cyan-400/70">{t.timestamp.currentTimestamp}:</span>
          <div className="flex items-center gap-3">
            <span className="font-mono text-cyan-300">{currentTimestamp}</span>
            <button
              onClick={() => copyToClipboard(currentTimestamp.toString())}
              className="text-xs text-cyan-400/70 hover:text-cyan-300 transition-colors"
            >
              {t.timestamp.copy}
            </button>
          </div>
        </div>
      </div>

      {/* Options */}
      <div className="rounded-xl border border-cyan-500/30 bg-[#0f0f1f]/80 backdrop-blur-sm p-6 space-y-4">
        <h3 className="text-sm font-medium text-cyan-300 mb-4">{t.timestamp.options}</h3>
        
        {/* Unit selection */}
        <div className="flex items-center justify-between">
          <label className="text-sm text-cyan-400/70">{t.timestamp.unit}:</label>
          <div className="flex gap-2">
            <button
              onClick={() => setUnit("seconds")}
              className={`px-4 py-2 rounded-lg border transition-all text-sm ${
                unit === "seconds"
                  ? "border-cyan-400 bg-cyan-500/20 text-cyan-300"
                  : "border-cyan-500/30 bg-cyan-500/10 text-cyan-400/70 hover:bg-cyan-500/20"
              }`}
            >
              {t.timestamp.seconds}
            </button>
            <button
              onClick={() => setUnit("milliseconds")}
              className={`px-4 py-2 rounded-lg border transition-all text-sm ${
                unit === "milliseconds"
                  ? "border-cyan-400 bg-cyan-500/20 text-cyan-300"
                  : "border-cyan-500/30 bg-cyan-500/10 text-cyan-400/70 hover:bg-cyan-500/20"
              }`}
            >
              {t.timestamp.milliseconds}
            </button>
          </div>
        </div>

        {/* Format selection */}
        <div className="flex items-center justify-between">
          <label className="text-sm text-cyan-400/70">{t.timestamp.format}:</label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className="px-3 py-2 rounded-lg border border-cyan-500/30 bg-[#0f0f1f]/60 text-cyan-300 text-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
          >
            <option value="YYYY-MM-DD HH:mm:ss">YYYY-MM-DD HH:mm:ss</option>
            <option value="YYYY-MM-DD HH:mm:ss.SSS">YYYY-MM-DD HH:mm:ss.SSS</option>
            <option value="YYYY/MM/DD HH:mm:ss">YYYY/MM/DD HH:mm:ss</option>
            <option value="MM/DD/YYYY HH:mm:ss">MM/DD/YYYY HH:mm:ss</option>
            <option value="ISO">ISO 8601</option>
          </select>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleTimestampToDate}
          className={buttonBaseClass}
        >
          {t.timestamp.timestampToDate}
        </button>
        <button
          onClick={handleDateToTimestamp}
          className={buttonBaseClass}
        >
          {t.timestamp.dateToTimestamp}
        </button>
        <button
          onClick={handleUseCurrent}
          className={buttonBaseClass}
        >
          {t.timestamp.useCurrent}
        </button>
        <button
          onClick={clearAll}
          className={buttonBaseClass}
        >
          {t.timestamp.clear}
        </button>
      </div>

      {/* Input/Output area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timestamp input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-cyan-300">{t.timestamp.timestamp}</label>
            <button
              onClick={() => copyToClipboard(timestamp)}
              className="text-xs text-cyan-400/70 hover:text-cyan-300 transition-colors"
            >
              {t.timestamp.copy}
            </button>
          </div>
          <div className="relative rounded-xl border border-cyan-500/30 bg-[#0f0f1f]/80 backdrop-blur-sm overflow-hidden focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-400/30">
            <input
              type="text"
              value={timestamp}
              onChange={(e) => {
                setTimestamp(e.target.value);
                setError("");
              }}
              placeholder={t.timestamp.timestampPlaceholder}
              className="w-full px-4 py-3 text-cyan-50 placeholder-cyan-500/50 font-mono text-sm focus:outline-none bg-transparent border-0"
            />
          </div>
        </div>

        {/* Date/Time output */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-cyan-300">{t.timestamp.dateTime}</label>
            <button
              onClick={() => copyToClipboard(dateTime)}
              className="text-xs text-cyan-400/70 hover:text-cyan-300 transition-colors"
            >
              {t.timestamp.copy}
            </button>
          </div>
          <div className={`relative rounded-xl border ${
            error ? "border-red-500/50" : "border-cyan-500/30"
          } bg-[#0f0f1f]/80 backdrop-blur-sm overflow-hidden`}>
            <input
              type="text"
              value={dateTime}
              onChange={(e) => {
                setDateTime(e.target.value);
                setError("");
              }}
              placeholder={t.timestamp.dateTimePlaceholder}
              className="w-full px-4 py-3 text-cyan-50 placeholder-cyan-500/50 font-mono text-sm focus:outline-none bg-transparent border-0"
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
              <h3 className="text-sm font-medium text-red-300 mb-1">{t.timestamp.errorTitle}</h3>
              <p className="text-sm text-red-400/80">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

