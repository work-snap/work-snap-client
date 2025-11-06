"use client";

import { useEffect } from "react";
import { IoClose } from "react-icons/io5";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  showCloseButton?: boolean;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  message,
  confirmText = "확인",
  showCloseButton = true,
}: ModalProps) {
  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  // 모달이 열릴 때 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* 배경 오버레이 */}
      <div className="absolute inset-0 bg-black bg-opacity-50" />

      {/* 모달 컨텐츠 */}
      <div
        className="relative bg-white rounded-lg shadow-xl max-w-sm w-full mx-auto animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            {title && (
              <h3 className="text-lg font-semibold text-main2">{title}</h3>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors ml-auto"
              >
                <IoClose size={24} />
              </button>
            )}
          </div>
        )}

        {/* 본문 */}
        <div className="p-6">
          <p className="text-gray-700 whitespace-pre-line leading-relaxed">
            {message}
          </p>
        </div>

        {/* 확인 버튼 */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full py-3 bg-main text-white rounded-lg hover:bg-opacity-90 transition-all font-medium"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
