"use client";

import React from "react";
import { SmartButtonState } from "../../lib/types";
import { getChipClassName } from "../../lib/utils";

interface ButtonOptionChipProps {
  buttonState: SmartButtonState;
  isManualSelection: boolean;
  onCycleOption: () => void;
  className?: string;
}

/**
 * 버튼 옵션 선택 칩 컴포넌트
 * Single Responsibility: AI/수동 모드 표시 및 전환만 담당
 */
export const ButtonOptionChip: React.FC<ButtonOptionChipProps> = ({
  buttonState,
  isManualSelection,
  onCycleOption,
  className = "",
}) => {
  return (
    <button
      onClick={onCycleOption}
      className={`absolute top-4 right-4 ${getChipClassName(
        buttonState.isRecommended
      )} ${className}`}
      aria-label={isManualSelection ? "수동 선택 모드" : "AI 추천 모드"}
    >
      <span className="mr-1">{buttonState.icon}</span>
      {isManualSelection ? "수동" : "AI"}
    </button>
  );
};
