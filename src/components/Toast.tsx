"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertCircle, Info, XCircle } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  duration?: number;
}

interface ToastProps {
  toast: ToastMessage;
  onClose: (id: string) => void;
}

const toastConfig = {
  success: {
    icon: CheckCircle,
    bgColor: "bg-green-50",
    textColor: "text-green-800",
    borderColor: "border-green-200",
    iconColor: "text-green-500",
  },
  error: {
    icon: XCircle,
    bgColor: "bg-red-50",
    textColor: "text-red-800", 
    borderColor: "border-red-200",
    iconColor: "text-red-500",
  },
  warning: {
    icon: AlertCircle,
    bgColor: "bg-yellow-50",
    textColor: "text-yellow-800",
    borderColor: "border-yellow-200", 
    iconColor: "text-yellow-500",
  },
  info: {
    icon: Info,
    bgColor: "bg-blue-50",
    textColor: "text-blue-800",
    borderColor: "border-blue-200",
    iconColor: "text-blue-500",
  },
};

const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  const config = toastConfig[toast.type];
  const Icon = config.icon;

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, toast.duration || 4000);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`
        ${config.bgColor} ${config.borderColor} ${config.textColor}
        border rounded-lg shadow-lg p-4 max-w-sm w-full pointer-events-auto
      `}
    >
      <div className="flex items-start">
        <Icon className={`${config.iconColor} w-5 h-5 mt-0.5 mr-3 flex-shrink-0`} />
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{toast.title}</p>
          <p className="text-sm opacity-90 mt-1">{toast.message}</p>
        </div>

        <button
          onClick={() => onClose(toast.id)}
          className={`
            ${config.iconColor} ml-3 flex-shrink-0 rounded-md p-1.5
            hover:bg-black hover:bg-opacity-10 focus:outline-none 
            focus:ring-2 focus:ring-offset-2 transition-colors
          `}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

// Toast Container
interface ToastContainerProps {
  toasts: ToastMessage[];
  onClose: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onClose={onClose} />
        ))}
      </AnimatePresence>
    </div>
  );
};

// Toast Hook
export const useToast = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (
    type: ToastType,
    title: string,
    message: string,
    duration?: number
  ) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: ToastMessage = {
      id,
      type,
      title,
      message,
      duration,
    };

    setToasts((prev) => [...prev, newToast]);
    return id;
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const clearAll = () => {
    setToasts([]);
  };

  // 편의 메서드들
  const toast = {
    success: (title: string, message: string, duration?: number) =>
      addToast("success", title, message, duration),
    error: (title: string, message: string, duration?: number) =>
      addToast("error", title, message, duration),
    warning: (title: string, message: string, duration?: number) =>
      addToast("warning", title, message, duration),
    info: (title: string, message: string, duration?: number) =>
      addToast("info", title, message, duration),
  };

  return {
    toasts,
    addToast,
    removeToast,
    clearAll,
    toast,
  };
};

export default Toast;