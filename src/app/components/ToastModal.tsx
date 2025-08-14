"use client";

import { useEffect, memo } from "react";

interface ToastModalProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
}

const ToastModal = memo(function ToastModal({
  message,
  isVisible,
  onClose,
}: ToastModalProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-28 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-gray5 text-white px-4 py-3 rounded-lg shadow-lg text-sm font-medium">
        {message}
      </div>
    </div>
  );
});

ToastModal.displayName = "ToastModal";

export default ToastModal;
