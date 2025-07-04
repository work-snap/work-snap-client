"use client";

import React from "react";
import { SmartButtonState } from "../../lib/types";
import { getButtonClassName } from "../../lib/utils";
import { LoadingSpinner } from "../common";

interface SmartActionButtonProps {
  buttonState: SmartButtonState;
  onAction: () => void;
  isLoading: boolean;
  disabled?: boolean;
  className?: string;
}

/**
 * 스마트 액션 버튼 컴포넌트
 * Single Responsibility: 출근/퇴근 액션 실행만 담당
 */
export const SmartActionButton: React.FC<SmartActionButtonProps> = ({
  buttonState,
  onAction,
  isLoading,
  disabled = false,
  className = "",
}) => {
  const isDisabled = isLoading || disabled;

  return (
    <button
      onClick={onAction}
      disabled={isDisabled}
      className={`${getButtonClassName(buttonState, isDisabled)} ${className}`}
      aria-label={buttonState.label}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <LoadingSpinner size="md" color="white" className="mr-2" />
          처리 중...
        </div>
      ) : (
        <div className="flex items-center justify-center">
          <span className="mr-2">{buttonState.icon}</span>
          {buttonState.label}
        </div>
      )}
    </button>
  );
};
