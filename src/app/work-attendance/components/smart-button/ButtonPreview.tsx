"use client";

import React from "react";
import { SmartButtonState } from "../../lib/types";

interface ButtonPreviewProps {
  buttonState: SmartButtonState;
  isManualSelection: boolean;
  className?: string;
}

/**
 * 버튼 미리보기 컴포넌트
 * Single Responsibility: 선택된 버튼 기능 미리보기만 담당
 */
export const ButtonPreview: React.FC<ButtonPreviewProps> = ({
  buttonState,
  isManualSelection,
  className = "",
}) => {
  return (
    <div className={`p-3 bg-gray-50 rounded-lg text-center ${className}`}>
      <div className="text-sm text-gray-600 mb-1">
        {isManualSelection ? "선택한 기능" : "AI 추천 기능"}
      </div>
      <div className="font-medium text-gray-800">
        <span className="mr-2">{buttonState.icon}</span>
        {buttonState.label}
      </div>
    </div>
  );
};
