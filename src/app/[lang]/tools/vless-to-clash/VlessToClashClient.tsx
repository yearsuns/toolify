"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/contexts/ToastContext";

interface VlessConfig {
  uuid: string;
  host: string;
  port: number;
  name: string;
  encryption?: string;
  flow?: string;
  security?: string;
  sni?: string;
  fp?: string;
  pbk?: string;
  sid?: string;
  type?: string;
  headerType?: string;
  [key: string]: string | number | undefined;
}

export default function VlessToClashClient() {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  // Parse VLESS link
  const parseVless = (url: string): VlessConfig | null => {
    try {
      const vlessRegex = /^vless:\/\/([^@]+)@([^:]+):(\d+)(\?[^#]*)?(#.*)?$/;
      const match = url.match(vlessRegex);
      
      if (!match) {
        throw new Error(t.vlessToClash.invalidLink);
      }

      const [, uuid, host, portStr, queryStr, fragment] = match;
      const port = parseInt(portStr, 10);
      const name = fragment ? decodeURIComponent(fragment.substring(1)) : "VLESS";

      // Parse query parameters
      const params: Record<string, string> = {};
      if (queryStr) {
        const query = queryStr.substring(1); // Remove ?
        query.split("&").forEach((param) => {
          const [key, value] = param.split("=");
          if (key && value) {
            params[key] = decodeURIComponent(value);
          }
        });
      }

      return {
        uuid,
        host,
        port,
        name,
        ...params,
      };
    } catch (e) {
      throw new Error(e instanceof Error ? e.message : t.vlessToClash.parseFailed);
    }
  };

  // Convert to Clash object format (in specified order)
  const convertToClashObject = (config: VlessConfig): any => {
    const clashConfig: any = {};
    
    // 1. type
    clashConfig.type = "vless";
    
    // 2. name
    clashConfig.name = config.name;
    
    // 3. server
    clashConfig.server = config.host;
    
    // 4. port
    clashConfig.port = config.port;
    
    // 5. uuid
    clashConfig.uuid = config.uuid;
    
    // 6. network
    clashConfig.network = config.type || "tcp";
    
    // 7. servername (if exists)
    if (config.sni && (config.security === "reality" || config.security === "tls")) {
      clashConfig.servername = config.sni;
    }
    
    // 8. tls (if exists)
    if (config.security === "reality" || config.security === "tls") {
      clashConfig.tls = true;
    }
    
    // 9. encryption (cipher)
    clashConfig.encryption = config.encryption || "none";
    
    // 10. reality-opts (if exists)
    if (config.security === "reality") {
      const realityOpts: any = {};
      if (config.pbk) {
        realityOpts["public-key"] = config.pbk;
      }
      if (config.sid) {
        realityOpts["short-id"] = config.sid;
      }
      if (Object.keys(realityOpts).length > 0) {
        clashConfig["reality-opts"] = realityOpts;
      }
    }
    
    // 11. client-fingerprint (if exists)
    if (config.fp && (config.security === "reality" || config.security === "tls")) {
      clashConfig["client-fingerprint"] = config.fp;
    }
    
    // 12. flow (if exists)
    if (config.flow) {
      clashConfig.flow = config.flow;
    }
    
    // 13. ws-opts or grpc-opts (if exists)
    if (config.type === "ws") {
      clashConfig.network = "ws";
      const wsOpts: any = {};
      if (config.path) {
        wsOpts.path = String(config.path);
      }
      if (config.headers && typeof config.headers === "string") {
        try {
          wsOpts.headers = JSON.parse(config.headers);
        } catch {
          // Ignore parsing errors
        }
      }
      if (Object.keys(wsOpts).length > 0) {
        clashConfig["ws-opts"] = wsOpts;
      }
    } else if (config.type === "grpc") {
      clashConfig.network = "grpc";
      const grpcOpts: any = {};
      if (config.serviceName) {
        grpcOpts["grpc-service-name"] = String(config.serviceName);
      }
      if (Object.keys(grpcOpts).length > 0) {
        clashConfig["grpc-opts"] = grpcOpts;
      }
    }

    return clashConfig;
  };

  // Convert to YAML format
  const convertToYaml = (obj: any, indent = 0): string => {
    const indentStr = "  ".repeat(indent);
    let yaml = "";

    for (const [key, value] of Object.entries(obj)) {
      if (value === null || value === undefined || value === "") {
        continue;
      }

      if (typeof value === "object" && !Array.isArray(value)) {
        // Check if object is empty
        const objEntries = Object.entries(value).filter(([_, v]) => v !== null && v !== undefined && v !== "");
        if (objEntries.length === 0) {
          continue;
        }
        yaml += `${indentStr}${key}:\n`;
        yaml += convertToYaml(value, indent + 1);
      } else if (Array.isArray(value)) {
        if (value.length === 0) {
          continue;
        }
        yaml += `${indentStr}${key}:\n`;
        value.forEach((item) => {
          if (typeof item === "object") {
            // Get first key-value pair of object
            const entries = Object.entries(item).filter(([_, v]) => v !== null && v !== undefined && v !== "");
            if (entries.length > 0) {
              const [firstKey, firstValue] = entries[0];
              const remainingEntries = entries.slice(1);
              
              // First property follows - without newline
              if (typeof firstValue === "object" && firstValue !== null && !Array.isArray(firstValue)) {
                // Object value, need to check if empty
                const objEntries = Object.entries(firstValue).filter(([_, v]) => v !== null && v !== undefined && v !== "");
                if (objEntries.length > 0) {
                  yaml += `${indentStr}  - ${firstKey}:\n`;
                  yaml += convertToYaml(firstValue, indent + 2);
                } else {
                  yaml += `${indentStr}  - ${firstKey}: {}\n`;
                }
              } else if (Array.isArray(firstValue)) {
                yaml += `${indentStr}  - ${firstKey}:\n`;
                yaml += convertToYaml({ [firstKey]: firstValue }, indent + 2);
              } else {
                const strValue = String(firstValue);
                const quoted = strValue.includes(":") || strValue.includes("#") || strValue.includes("|") || strValue.includes("&") || strValue.includes(" ");
                yaml += `${indentStr}  - ${firstKey}: ${quoted ? `"${strValue}"` : strValue}\n`;
              }
              
              // Remaining properties with normal indentation
              if (remainingEntries.length > 0) {
                const remainingObj = Object.fromEntries(remainingEntries);
                yaml += convertToYaml(remainingObj, indent + 2);
              }
            }
          } else {
            yaml += `${indentStr}  - ${item}\n`;
          }
        });
      } else if (typeof value === "boolean") {
        yaml += `${indentStr}${key}: ${value}\n`;
      } else if (typeof value === "number") {
        yaml += `${indentStr}${key}: ${value}\n`;
      } else {
        // String value, add quotes if contains special characters
        const strValue = String(value);
        if (strValue.includes(":") || strValue.includes("#") || strValue.includes("|") || strValue.includes("&") || strValue.includes(" ")) {
          yaml += `${indentStr}${key}: "${strValue}"\n`;
        } else {
          yaml += `${indentStr}${key}: ${strValue}\n`;
        }
      }
    }

    return yaml;
  };

  // Handle conversion
  const handleConvert = () => {
    if (!input.trim()) {
      setOutput("");
      setError("");
      return;
    }

    try {
      const config = parseVless(input.trim());
      if (!config) {
        throw new Error(t.vlessToClash.cannotParse);
      }

      const clashConfig = convertToClashObject(config);
      const yaml = convertToYaml({ proxies: [clashConfig] });
      
      setOutput(yaml);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : t.vlessToClash.convertFailed);
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
      showToast(t.vlessToClash.copied, "success");
    });
  };

  // Load example
  const loadExample = () => {
    const example = "vless://a8b3c2d1-e4f5-6789-0123-456789abcdef@203.0.113.45:8443?encryption=none&flow=xtls-rprx-vision&security=reality&sni=cloudflare.com&fp=chrome&pbk=K8mN9pQ2rS5tU7vW0xY3zA6bC8dE1fG4hI6jK9lM2nO5pQ7rS0tU3vW6xY9z&sid=a1b2c3d4&type=tcp&headerType=none#VLESS-Reality-Example";
    setInput(example);
    setOutput("");
    setError("");
  };

  return (
    <div className="space-y-6 mb-4">
      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleConvert}
          className="px-4 py-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400/50 transition-all"
        >
          {t.vlessToClash.convert}
        </button>
        <button
          onClick={loadExample}
          className="px-4 py-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400/50 transition-all"
        >
          {t.vlessToClash.loadExample}
        </button>
        <button
          onClick={clearAll}
          className="px-4 py-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400/50 transition-all"
        >
          {t.vlessToClash.clear}
        </button>
      </div>

      {/* Input/output area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input box */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-cyan-300">{t.vlessToClash.vlessLink}</label>
            <button
              onClick={() => copyToClipboard(input)}
              className="text-xs text-cyan-400/70 hover:text-cyan-300 transition-colors"
            >
              {t.vlessToClash.copy}
            </button>
          </div>
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setError("");
              }}
              placeholder={t.vlessToClash.inputPlaceholder}
              className="w-full h-96 rounded-xl border border-cyan-500/30 bg-[#0f0f1f]/80 backdrop-blur-sm p-4 text-cyan-50 placeholder-cyan-500/50 font-mono text-sm focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 resize-none custom-scrollbar"
            />
          </div>
        </div>

        {/* Output box */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-cyan-300">{t.vlessToClash.clashYaml}</label>
            <button
              onClick={() => output && copyToClipboard(output)}
              className="text-xs text-cyan-400/70 hover:text-cyan-300 transition-colors"
            >
              {t.vlessToClash.copy}
            </button>
          </div>
          <div className="relative">
            <textarea
              value={output}
              readOnly
              placeholder={t.vlessToClash.outputPlaceholder}
              className={`w-full h-96 rounded-xl border ${
                error ? "border-red-500/50" : "border-cyan-500/30"
              } bg-[#0f0f1f]/80 backdrop-blur-sm p-4 text-cyan-50 placeholder-cyan-500/50 font-mono text-sm resize-none custom-scrollbar`}
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
              <h3 className="text-sm font-medium text-red-300 mb-1">{t.vlessToClash.errorTitle}</h3>
              <p className="text-sm text-red-400/80">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

