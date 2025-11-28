"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    const id = Math.random().toString(36).substring(7);
    const newToast: Toast = { id, message, type };
    
    setToasts((prev) => [...prev, newToast]);

    // Auto remove after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast container */}
      <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto animate-in slide-in-from-right fade-in duration-300"
            onClick={() => removeToast(toast.id)}
          >
            <ToastItem toast={toast} onClose={() => removeToast(toast.id)} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  // Common styles
  const baseStyles = "bg-[#0f0f1f]/40 backdrop-blur-xl";
  
  // Get color styles based on type
  const getColorStyles = () => {
    switch (toast.type) {
      case "success":
        return {
          border: "border-cyan-400/30",
          text: "text-cyan-300",
          icon: "text-green-400",
        };
      case "error":
        return {
          border: "border-red-400/30",
          text: "text-red-300",
          icon: "text-red-400",
        };
      case "warning":
        return {
          border: "border-yellow-400/30",
          text: "text-yellow-300",
          icon: "text-yellow-400",
        };
      case "info":
        return {
          border: "border-blue-400/30",
          text: "text-blue-300",
          icon: "text-blue-400",
        };
      default:
        return {
          border: "border-cyan-400/30",
          text: "text-cyan-300",
          icon: "text-cyan-400",
        };
    }
  };
  
  const colorStyles = getColorStyles();

  const getIcon = () => {
    switch (toast.type) {
      case "success":
        return (
          <div className={`${colorStyles.icon} flex-shrink-0`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case "error":
        return (
          <div className={`${colorStyles.icon} flex-shrink-0`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      case "warning":
        return (
          <div className={`${colorStyles.icon} flex-shrink-0`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        );
      case "info":
        return (
          <div className={`${colorStyles.icon} flex-shrink-0`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`
        relative flex items-center gap-3 px-4 py-3 rounded-xl border
        min-w-[300px] max-w-md cursor-pointer transition-all duration-300
        hover:scale-[1.02] hover:border-opacity-80
        shadow-lg
        ${baseStyles} ${colorStyles.border} ${colorStyles.text}
      `}
      onClick={onClose}
    >
      {/* Content */}
      <div className="relative z-10 flex items-center gap-3 w-full">
        {getIcon()}
        <p className="flex-1 text-sm font-medium">{toast.message}</p>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="text-current/60 hover:text-current transition-colors flex-shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

