"use client";

import React from "react";

interface TypeInfoCardProps {
  clockInTypesKorean?: string;
  clockOutTypesKorean?: string;
  className?: string;
}

/**
 * 타입 정보 카드 컴포넌트
 * Single Responsibility: 출근/퇴근 타입 정보 표시만 담당
 */
export const TypeInfoCard: React.FC<TypeInfoCardProps> = ({
  clockInTypesKorean,
  clockOutTypesKorean,
  className = "",
}) => {
  const displayText = clockInTypesKorean || clockOutTypesKorean;

  if (!displayText) {
    return null;
  }

  return (
    <div className={`p-3 bg-blue-50 rounded-lg text-center ${className}`}>
      <span className="text-blue-700 font-medium">{displayText}</span>
    </div>
  );
};
