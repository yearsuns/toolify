"use client";

import { useEffect, useRef, useState } from "react";

interface TextareaWithLineNumbersProps {
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
}

interface LineNumberItem {
  number: number | null; // null means this is a wrapped line continuation
  height: number; // Height in rem (e.g., 1.5 for 1.5rem)
}

export default function TextareaWithLineNumbers({
  value,
  onChange,
  placeholder,
  readOnly = false,
  className = "",
}: TextareaWithLineNumbersProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [lineNumbers, setLineNumbers] = useState<LineNumberItem[]>([{ number: 1, height: 1.5 }]);

  // Extract padding-top from className if present (e.g., p-4 = 1rem = 16px)
  const getPaddingTop = () => {
    if (className.includes("p-4")) return "1rem";
    if (className.includes("p-3")) return "0.75rem";
    if (className.includes("p-2")) return "0.5rem";
    if (className.includes("pt-4")) return "1rem";
    if (className.includes("pt-3")) return "0.75rem";
    if (className.includes("pt-2")) return "0.5rem";
    return "0";
  };

  // Calculate line numbers considering word wrap
  const calculateLineNumbers = () => {
    if (!textareaRef.current || !measureRef.current) {
      // Fallback to simple line count
      const lines = value ? value.split("\n").length : 1;
      setLineNumbers(Array.from({ length: lines }, (_, i) => ({ number: i + 1, height: 1.5 })));
      return;
    }

    const textarea = textareaRef.current;
    const measure = measureRef.current;
    const lines = value ? value.split("\n") : [""];
    const lineHeight = 1.5; // 1.5rem = 24px
    const result: LineNumberItem[] = [];

    // Copy textarea styles to measure element for accurate measurement
    const computedStyle = window.getComputedStyle(textarea);
    const paddingLeft = parseFloat(computedStyle.paddingLeft) || 0;
    const paddingRight = parseFloat(computedStyle.paddingRight) || 0;
    const textareaWidth = textarea.clientWidth - paddingLeft - paddingRight;
    const singleLineHeight = parseFloat(computedStyle.lineHeight) || 24; // Get actual line height in pixels
    
    // Apply all relevant styles to measure element
    // This ensures accurate measurement for all languages (Chinese, Japanese, Arabic, etc.)
    measure.style.width = `${textareaWidth}px`;
    measure.style.fontSize = computedStyle.fontSize;
    measure.style.fontFamily = computedStyle.fontFamily;
    measure.style.fontWeight = computedStyle.fontWeight;
    measure.style.fontStyle = computedStyle.fontStyle;
    measure.style.letterSpacing = computedStyle.letterSpacing;
    measure.style.wordSpacing = computedStyle.wordSpacing;
    measure.style.lineHeight = computedStyle.lineHeight;
    measure.style.paddingLeft = computedStyle.paddingLeft;
    measure.style.paddingRight = computedStyle.paddingRight;
    measure.style.whiteSpace = "pre-wrap"; // Preserve whitespace and enable word wrap
    measure.style.wordWrap = "break-word"; // Break long words (for English)
    measure.style.overflowWrap = "break-word"; // Break overflow words
    measure.style.wordBreak = "normal"; // Use normal word breaking (respects CJK characters)
    measure.style.boxSizing = "border-box";
    // Ensure text direction is preserved (important for RTL languages like Arabic, Hebrew)
    measure.style.direction = computedStyle.direction;
    measure.style.textAlign = computedStyle.textAlign;

    // Process each logical line (separated by \n)
    lines.forEach((line, lineIndex) => {
      measure.textContent = line || " "; // Use space for empty lines to measure height
      const actualHeight = measure.scrollHeight; // Get actual rendered height in pixels
      
      // Calculate how many visual lines this logical line occupies
      // If actualHeight > singleLineHeight, it means the line wrapped
      const visualLineCount = Math.max(1, Math.ceil(actualHeight / singleLineHeight));
      
      // First visual line shows the line number
      result.push({ number: lineIndex + 1, height: lineHeight });
      
      // For each additional visual line (due to word wrap), add an empty line number
      // This ensures line numbers align with actual rendered lines
      for (let i = 1; i < visualLineCount; i++) {
        result.push({ number: null, height: lineHeight });
      }
    });

    // If no content, show at least one line number
    if (result.length === 0) {
      result.push({ number: 1, height: lineHeight });
    }

    setLineNumbers(result);
  };

  useEffect(() => {
    calculateLineNumbers();
  }, [value, className]);

  // Recalculate on window resize (when textarea width changes, word wrap may change)
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const handleResize = () => {
      // Debounce resize events to avoid excessive calculations
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        calculateLineNumbers();
      }, 100);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timeoutId);
    };
  }, [value, className]);

  // Synchronize scrolling
  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  return (
    <div className="relative flex h-full">
      {/* Hidden measure element */}
      <div
        ref={measureRef}
        className="absolute invisible whitespace-pre-wrap break-words"
        style={{
          visibility: "hidden",
          position: "absolute",
          top: "-9999px",
          left: "-9999px",
        }}
      />
      
      {/* Line numbers */}
      <div
        ref={lineNumbersRef}
        className="flex-shrink-0 w-12 pr-2 text-right text-cyan-500/40 text-xs font-mono select-none overflow-hidden custom-scrollbar"
        style={{ 
          paddingTop: getPaddingTop(),
          lineHeight: "1.5rem",
          maxHeight: "24rem", // Corresponds to h-96 (384px)
        }}
      >
        {lineNumbers.map((item, index) => (
          <div 
            key={index} 
            style={{ height: `${item.height}rem`, lineHeight: `${item.height}rem` }}
          >
            {item.number !== null ? item.number : ""}
          </div>
        ))}
      </div>
      
      {/* Text area */}
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={onChange}
          onScroll={handleScroll}
          placeholder={placeholder}
          readOnly={readOnly}
          className={`w-full h-96 ${className}`}
          style={{ lineHeight: "1.5rem" }}
        />
      </div>
    </div>
  );
}

