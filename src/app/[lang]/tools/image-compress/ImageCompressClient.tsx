"use client";

import { useState, useRef, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/contexts/ToastContext";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const SUPPORTED_FORMATS = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "image/bmp"];

// Format file size for display
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

// Calculate compression ratio
const calculateCompressionRatio = (originalSize: number, compressedSize: number): string => {
  if (originalSize === 0) return "0%";
  const ratio = ((originalSize - compressedSize) / originalSize) * 100;
  return ratio.toFixed(1) + "%";
};

export default function ImageCompressClient() {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string>("");
  const [compressedImageUrl, setCompressedImageUrl] = useState<string>("");
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedSize, setCompressedSize] = useState<number>(0);
  const [quality, setQuality] = useState<number>(80);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Base button styles
  const buttonBaseClass = "px-4 py-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400/50 transition-all";

  // Handle file selection
  const handleFileSelect = useCallback((file: File) => {
    // Validate file type
    if (!SUPPORTED_FORMATS.includes(file.type)) {
      setError(t.imageCompress.invalidFile);
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError(t.imageCompress.fileTooLarge);
      return;
    }

    setError("");
    setOriginalFile(file);
    setOriginalSize(file.size);
    setCompressedImageUrl("");
    setCompressedSize(0);

    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setOriginalImageUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, [t.imageCompress]);

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Handle drag and drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Compress image
  const handleCompress = useCallback(async () => {
    if (!originalFile || !originalImageUrl) {
      setError(t.imageCompress.noImage);
      return;
    }

    setIsCompressing(true);
    setError("");

    try {
      const img = new Image();
      img.src = originalImageUrl;

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error(t.imageCompress.compressFailed));
      });

      const canvas = canvasRef.current;
      if (!canvas) {
        throw new Error("Canvas not available");
      }

      // Set canvas dimensions
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw image on canvas
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Canvas context not available");
      }
      ctx.drawImage(img, 0, 0);

      // Convert to blob with specified quality
      const mimeType = originalFile.type === "image/png" ? "image/png" : "image/jpeg";
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            setError(t.imageCompress.compressFailed);
            setIsCompressing(false);
            return;
          }

          const compressedUrl = URL.createObjectURL(blob);
          setCompressedImageUrl(compressedUrl);
          setCompressedSize(blob.size);
          setIsCompressing(false);
        },
        mimeType,
        quality / 100
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : t.imageCompress.compressFailed);
      setIsCompressing(false);
    }
  }, [originalFile, originalImageUrl, quality, t.imageCompress]);

  // Download compressed image
  const handleDownload = () => {
    if (!compressedImageUrl) {
      showToast(t.imageCompress.noImage, "error");
      return;
    }

    try {
      const link = document.createElement("a");
      link.download = originalFile
        ? `compressed-${originalFile.name.replace(/\.[^/.]+$/, "")}.jpg`
        : `compressed-image-${Date.now()}.jpg`;
      link.href = compressedImageUrl;
      link.click();
      showToast(t.imageCompress.download, "success");
    } catch (e) {
      showToast(t.imageCompress.downloadFailed, "error");
    }
  };

  // Clear all
  const clearAll = () => {
    setOriginalFile(null);
    setOriginalImageUrl("");
    setCompressedImageUrl("");
    setOriginalSize(0);
    setCompressedSize(0);
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    // Clean up object URLs
    if (compressedImageUrl) {
      URL.revokeObjectURL(compressedImageUrl);
    }
  };

  return (
    <div className="space-y-6 mb-4">
      {/* Options */}
      <div className="rounded-xl border border-cyan-500/30 bg-[#0f0f1f]/80 backdrop-blur-sm p-6 space-y-4">
        <h3 className="text-sm font-medium text-cyan-300 mb-4">{t.imageCompress.quality}</h3>
        
        {/* Quality slider */}
        <div className="flex items-center justify-between">
          <label className="text-sm text-cyan-400/70">{t.imageCompress.quality}:</label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={quality}
              onChange={(e) => setQuality(parseInt(e.target.value, 10))}
              className="w-32 h-2 bg-cyan-500/20 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
            <input
              type="number"
              min="10"
              max="100"
              step="5"
              value={quality}
              onChange={(e) => {
                const value = Math.max(10, Math.min(100, parseInt(e.target.value, 10) || 80));
                setQuality(value);
              }}
              className="w-20 px-3 py-1 rounded-lg border border-cyan-500/30 bg-[#0f0f1f]/60 text-cyan-300 text-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="text-sm text-cyan-400/70">%</span>
          </div>
        </div>
      </div>

      {/* Upload area */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-cyan-300">{t.imageCompress.upload}</label>
        <div
          className="relative rounded-xl border-2 border-dashed border-cyan-500/30 bg-[#0f0f1f]/80 backdrop-blur-sm p-8 text-center hover:border-cyan-400/50 transition-colors cursor-pointer"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-3">
            <svg className="w-12 h-12 text-cyan-400/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-sm text-cyan-400/70">{t.imageCompress.uploadPlaceholder}</p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleCompress}
          disabled={!originalFile || isCompressing}
          className={`${buttonBaseClass} ${!originalFile || isCompressing ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {isCompressing ? t.imageCompress.compressing : t.imageCompress.compress}
        </button>
        <button
          onClick={handleDownload}
          disabled={!compressedImageUrl}
          className={`${buttonBaseClass} ${!compressedImageUrl ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {t.imageCompress.download}
        </button>
        <button onClick={clearAll} className={buttonBaseClass}>
          {t.imageCompress.clear}
        </button>
      </div>

      {/* Image preview and stats */}
      {(originalImageUrl || compressedImageUrl) && (
        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-cyan-500/30 bg-[#0f0f1f]/80 backdrop-blur-sm p-4">
              <div className="text-sm text-cyan-400/70 mb-1">{t.imageCompress.originalSize}</div>
              <div className="text-lg font-medium text-cyan-300">{formatFileSize(originalSize)}</div>
            </div>
            {compressedSize > 0 && (
              <>
                <div className="rounded-xl border border-cyan-500/30 bg-[#0f0f1f]/80 backdrop-blur-sm p-4">
                  <div className="text-sm text-cyan-400/70 mb-1">{t.imageCompress.compressedSize}</div>
                  <div className="text-lg font-medium text-cyan-300">{formatFileSize(compressedSize)}</div>
                </div>
                <div className="rounded-xl border border-cyan-500/30 bg-[#0f0f1f]/80 backdrop-blur-sm p-4">
                  <div className="text-sm text-cyan-400/70 mb-1">{t.imageCompress.compressionRatio}</div>
                  <div className="text-lg font-medium text-green-400">
                    {calculateCompressionRatio(originalSize, compressedSize)}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Images */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Original image */}
            {originalImageUrl && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-cyan-300">{t.imageCompress.originalImage}</label>
                <div className="rounded-xl border border-cyan-500/30 bg-[#0f0f1f]/80 backdrop-blur-sm p-4">
                  <img
                    src={originalImageUrl}
                    alt="Original"
                    className="w-full h-auto rounded-lg max-h-96 object-contain mx-auto"
                  />
                </div>
              </div>
            )}

            {/* Compressed image */}
            {compressedImageUrl && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-cyan-300">{t.imageCompress.compressedImage}</label>
                <div className="rounded-xl border border-cyan-500/30 bg-[#0f0f1f]/80 backdrop-blur-sm p-4">
                  <img
                    src={compressedImageUrl}
                    alt="Compressed"
                    className="w-full h-auto rounded-lg max-h-96 object-contain mx-auto"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hidden canvas for compression */}
      <canvas ref={canvasRef} style={{ display: "none" }} />

      {/* Error message */}
      {error && (
        <div className="rounded-xl border border-red-500/50 bg-red-500/10 p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-red-300 mb-1">{t.imageCompress.compressFailed}</h3>
              <p className="text-sm text-red-400/80">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

