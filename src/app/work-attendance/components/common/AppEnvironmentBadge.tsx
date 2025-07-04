"use client";

import React from "react";

interface AppEnvironmentBadgeProps {
  isApp: boolean;
  className?: string;
}

/**
 * 앱 환경 표시 배지 컴포넌트
 * Single Responsibility: 앱/웹 환경 표시만 담당
 */
export const AppEnvironmentBadge: React.FC<AppEnvironmentBadgeProps> = ({
  isApp,
  className = "",
}) => {
  if (!isApp) return null;

  return (
    <div className={`text-center ${className}`}>
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-700">
        <span className="mr-1">📱</span>
        모바일 앱
      </span>
    </div>
  );
};
