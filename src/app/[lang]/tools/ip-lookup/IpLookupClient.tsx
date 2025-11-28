"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/contexts/ToastContext";

interface IpInfo {
  ip: string;
  country: string;
  countryCode: string;
  region: string;
  regionCode: string;
  city: string;
  postalCode: string;
  latitude: number | null;
  longitude: number | null;
  timezone: string;
  isp: string;
  organization: string;
  asn: string;
}

export default function IpLookupClient() {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [ip, setIp] = useState("");
  const [loading, setLoading] = useState(false);
  const [ipInfo, setIpInfo] = useState<IpInfo | null>(null);
  const [error, setError] = useState("");

  // Base button styles
  const buttonBaseClass = "px-4 py-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed";

  // Validate IP address
  const isValidIpAddress = (ip: string): boolean => {
    if (!ip.trim()) return true; // Empty is valid (will query own IP)
    
    // IPv4 regex
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    // IPv6 regex (simplified)
    const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/;
    
    if (ipv4Regex.test(ip)) {
      const parts = ip.split(".");
      return parts.every(part => {
        const num = parseInt(part, 10);
        return num >= 0 && num <= 255;
      });
    }
    
    return ipv6Regex.test(ip);
  };

  // Lookup IP
  const handleLookup = async () => {
    const ipToQuery = ip.trim();
    
    if (ipToQuery && !isValidIpAddress(ipToQuery)) {
      setError(t.ipLookup.invalidIp);
      setIpInfo(null);
      return;
    }

    setLoading(true);
    setError("");
    setIpInfo(null);

    try {
      const url = ipToQuery
        ? `/api/ip-lookup?ip=${encodeURIComponent(ipToQuery)}`
        : `/api/ip-lookup`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t.ipLookup.lookupFailed);
      }

      setIpInfo(data);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : t.ipLookup.lookupFailed);
      setIpInfo(null);
    } finally {
      setLoading(false);
    }
  };

  // Query my IP
  const handleQueryMyIp = async () => {
    setIp("");
    await handleLookup();
  };

  // Clear all
  const clearAll = () => {
    setIp("");
    setIpInfo(null);
    setError("");
  };

  // Load example
  const loadExample = () => {
    setIp("8.8.8.8");
    setIpInfo(null);
    setError("");
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      showToast(t.ipLookup.copied, "success");
    }).catch(() => {
      showToast(t.ipLookup.copyFailed, "error");
    });
  };

  return (
    <div className="space-y-6 mb-4">
      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleLookup}
          disabled={loading}
          className={buttonBaseClass}
        >
          {loading ? t.ipLookup.lookingUp : t.ipLookup.lookup}
        </button>
        <button
          onClick={handleQueryMyIp}
          disabled={loading}
          className={buttonBaseClass}
        >
          {t.ipLookup.myIp}
        </button>
        <button
          onClick={loadExample}
          className={buttonBaseClass}
        >
          {t.ipLookup.loadExample}
        </button>
        <button
          onClick={clearAll}
          className={buttonBaseClass}
        >
          {t.ipLookup.clear}
        </button>
      </div>

      {/* Input area */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-cyan-300">{t.ipLookup.input}</label>
        <input
          type="text"
          value={ip}
          onChange={(e) => {
            setIp(e.target.value);
            setError("");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleLookup();
            }
          }}
          placeholder={t.ipLookup.inputPlaceholder}
          className="w-full px-4 py-3 rounded-xl border border-cyan-500/30 bg-[#0f0f1f]/80 backdrop-blur-sm text-cyan-50 placeholder-cyan-500/50 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all"
        />
      </div>

      {/* Error message */}
      {error && (
        <div className="rounded-xl border border-red-500/50 bg-red-500/10 p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-red-300 mb-1">{t.ipLookup.lookupFailed}</h3>
              <p className="text-sm text-red-400/80">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* IP Information */}
      {ipInfo && (
        <div className="rounded-xl border border-cyan-500/30 bg-[#0f0f1f]/80 backdrop-blur-sm p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-cyan-300">{t.ipLookup.ipAddress}</h3>
            <button
              onClick={() => copyToClipboard(JSON.stringify(ipInfo, null, 2))}
              className="text-xs text-cyan-400/70 hover:text-cyan-300 transition-colors"
            >
              {t.ipLookup.copy}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* IP Address */}
            <div className="space-y-1">
              <label className="text-xs text-cyan-500/70">{t.ipLookup.ipAddress}</label>
              <div className="text-sm text-cyan-50 font-mono">{ipInfo.ip}</div>
            </div>

            {/* Country */}
            {ipInfo.country && (
              <div className="space-y-1">
                <label className="text-xs text-cyan-500/70">{t.ipLookup.country}</label>
                <div className="text-sm text-cyan-50">{ipInfo.country} {ipInfo.countryCode && `(${ipInfo.countryCode})`}</div>
              </div>
            )}

            {/* Region */}
            {ipInfo.region && (
              <div className="space-y-1">
                <label className="text-xs text-cyan-500/70">{t.ipLookup.region}</label>
                <div className="text-sm text-cyan-50">{ipInfo.region} {ipInfo.regionCode && `(${ipInfo.regionCode})`}</div>
              </div>
            )}

            {/* City */}
            {ipInfo.city && (
              <div className="space-y-1">
                <label className="text-xs text-cyan-500/70">{t.ipLookup.city}</label>
                <div className="text-sm text-cyan-50">{ipInfo.city}</div>
              </div>
            )}

            {/* Postal Code */}
            {ipInfo.postalCode && (
              <div className="space-y-1">
                <label className="text-xs text-cyan-500/70">{t.ipLookup.postalCode}</label>
                <div className="text-sm text-cyan-50">{ipInfo.postalCode}</div>
              </div>
            )}

            {/* Timezone */}
            {ipInfo.timezone && (
              <div className="space-y-1">
                <label className="text-xs text-cyan-500/70">{t.ipLookup.timezone}</label>
                <div className="text-sm text-cyan-50">{ipInfo.timezone}</div>
              </div>
            )}

            {/* ISP */}
            {ipInfo.isp && (
              <div className="space-y-1">
                <label className="text-xs text-cyan-500/70">{t.ipLookup.isp}</label>
                <div className="text-sm text-cyan-50">{ipInfo.isp}</div>
              </div>
            )}

            {/* Organization */}
            {ipInfo.organization && (
              <div className="space-y-1">
                <label className="text-xs text-cyan-500/70">{t.ipLookup.organization}</label>
                <div className="text-sm text-cyan-50">{ipInfo.organization}</div>
              </div>
            )}

            {/* ASN */}
            {ipInfo.asn && (
              <div className="space-y-1">
                <label className="text-xs text-cyan-500/70">{t.ipLookup.asn}</label>
                <div className="text-sm text-cyan-50">{ipInfo.asn}</div>
              </div>
            )}

            {/* Latitude */}
            {ipInfo.latitude !== null && (
              <div className="space-y-1">
                <label className="text-xs text-cyan-500/70">{t.ipLookup.latitude}</label>
                <div className="text-sm text-cyan-50">{ipInfo.latitude}</div>
              </div>
            )}

            {/* Longitude */}
            {ipInfo.longitude !== null && (
              <div className="space-y-1">
                <label className="text-xs text-cyan-500/70">{t.ipLookup.longitude}</label>
                <div className="text-sm text-cyan-50">{ipInfo.longitude}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

