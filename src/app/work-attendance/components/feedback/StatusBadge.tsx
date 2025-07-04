"use client";

import React from "react";
import { AttendanceStatus } from "../../lib/types";

interface StatusBadgeProps {
  status: AttendanceStatus;
  statusKorean: string;
  className?: string;
}

/**
 * 상태 배지 컴포넌트
 * Single Responsibility: 출근 상태 표시만 담당
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  statusKorean,
  className = "",
}) => {
  const getStatusColor = (status: AttendanceStatus): string => {
    switch (status) {
      case AttendanceStatus.SCHEDULED:
        return "bg-gray-100 text-gray-800";
      case AttendanceStatus.IN_PROGRESS:
        return "bg-blue-100 text-blue-800";
      case AttendanceStatus.COMPLETED:
        return "bg-green-100 text-green-800";
      case AttendanceStatus.ABSENT:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: AttendanceStatus): string => {
    switch (status) {
      case AttendanceStatus.SCHEDULED:
        return "⏰";
      case AttendanceStatus.IN_PROGRESS:
        return "🏢";
      case AttendanceStatus.COMPLETED:
        return "✅";
      case AttendanceStatus.ABSENT:
        return "❌";
      default:
        return "⏰";
    }
  };

  if (status === AttendanceStatus.SCHEDULED) {
    return null; // 예정 상태는 배지를 표시하지 않음
  }

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
        status
      )} ${className}`}
    >
      <span className="mr-1">{getStatusIcon(status)}</span>
      {statusKorean}
    </span>
  );
};
