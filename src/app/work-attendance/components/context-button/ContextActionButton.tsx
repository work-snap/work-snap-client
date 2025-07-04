"use client";

import React from "react";
import { ContextButtonState, ClockInType, ClockOutType } from "../../lib/types";
import { getContextButtonClassName } from "../../lib/utils";
import { LoadingSpinner } from "../common";

interface ContextActionButtonProps {
  contextState: ContextButtonState;
  onTypeChange: () => void;
  isLoading?: boolean;
  className?: string;
  size?: "sm" | "md";
}

/**
 * 상황별 타입 변경 버튼 컴포넌트 (우측 버튼)
 * Single Responsibility: 출근/퇴근 타입 순환 선택만 담당
 */
export const ContextActionButton: React.FC<ContextActionButtonProps> = ({
  contextState,
  onTypeChange,
  isLoading = false,
  className = "",
  size = "sm",
}) => {
  const handleClick = () => {
    if (contextState.disabled || isLoading) {
      return;
    }

    onTypeChange();
  };

  const isDisabled = contextState.disabled || isLoading;

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      className={`${getContextButtonClassName(contextState, size)} ${className}`}
      aria-label={contextState.label}
      title={contextState.label}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <LoadingSpinner 
            size={size === "sm" ? "sm" : "md"} 
            color="white" 
            className="mr-1" 
          />
          처리중
        </div>
      ) : (
        <div className="flex items-center justify-center">
          <span className="mr-1">{contextState.icon}</span>
          <span className="truncate">{contextState.label}</span>
        </div>
      )}
    </button>
  );
};