"use client";

import React from "react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: "white" | "main" | "gray";
  className?: string;
}

/**
 * 로딩 스피너 컴포넌트
 * Single Responsibility: 로딩 상태 표시만 담당
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  color = "white",
  className = "",
}) => {
  const getSizeClass = () => {
    switch (size) {
      case "sm":
        return "h-4 w-4";
      case "md":
        return "h-5 w-5";
      case "lg":
        return "h-8 w-8";
      default:
        return "h-5 w-5";
    }
  };

  const getColorClass = () => {
    switch (color) {
      case "white":
        return "border-white";
      case "main":
        return "border-main";
      case "gray":
        return "border-gray-400";
      default:
        return "border-white";
    }
  };

  return (
    <div
      className={`animate-spin rounded-full border-2 border-t-transparent ${getSizeClass()} ${getColorClass()} ${className}`}
      role="status"
      aria-label="로딩 중"
    >
      <span className="sr-only">로딩 중...</span>
    </div>
  );
};
