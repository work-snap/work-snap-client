"use client";

import React from "react";

export type StatusType =
  | "success"
  | "error"
  | "warning"
  | "info"
  | "pending"
  | "neutral";

export interface StatusState {
  type: StatusType;
  label: string;
  icon?: React.ReactNode | string;
  className?: string;
}

export interface StatusDisplayProps {
  statusState: StatusState;
  className?: string;
}

export const StatusDisplay: React.FC<StatusDisplayProps> = ({
  statusState,
  className = "",
}) => {
  const { type, label, icon, className: statusClassName } = statusState;

  const getStatusStyles = (type: StatusType): string => {
    const baseStyles =
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";

    const statusStyles = {
      success: "bg-green-100 text-green-800",
      error: "bg-red-100 text-red-800",
      warning: "bg-yellow-100 text-yellow-800",
      info: "bg-blue-100 text-blue-800",
      pending: "bg-gray-100 text-gray-800",
      neutral: "bg-gray-100 text-gray-600",
    };

    return `${baseStyles} ${statusStyles[type]}`;
  };

  return (
    <span
      className={`${getStatusStyles(type)} ${statusClassName} ${className}`}
    >
      {icon && <span className="mr-1.5">{icon}</span>}
      {label}
    </span>
  );
};

// 미리 정의된 상태 프리셋들
export const AttendanceStatusPresets = {
  success: (label: string = "성공"): StatusState => ({
    type: "success",
    label,
    icon: "✅",
  }),

  error: (label: string = "실패"): StatusState => ({
    type: "error",
    label,
    icon: "❌",
  }),

  warning: (label: string = "경고"): StatusState => ({
    type: "warning",
    label,
    icon: "⚠️",
  }),

  info: (label: string = "정보"): StatusState => ({
    type: "info",
    label,
    icon: "ℹ️",
  }),

  pending: (label: string = "대기중"): StatusState => ({
    type: "pending",
    label,
    icon: "⏳",
  }),

  neutral: (label: string = "일반"): StatusState => ({
    type: "neutral",
    label,
  }),

  // HTTP 상태 코드별 프리셋
  http: {
    200: (): StatusState => AttendanceStatusPresets.success("200 OK"),
    201: (): StatusState => AttendanceStatusPresets.success("201 Created"),
    400: (): StatusState => AttendanceStatusPresets.error("400 Bad Request"),
    401: (): StatusState => AttendanceStatusPresets.error("401 Unauthorized"),
    403: (): StatusState => AttendanceStatusPresets.error("403 Forbidden"),
    404: (): StatusState => AttendanceStatusPresets.error("404 Not Found"),
    500: (): StatusState => AttendanceStatusPresets.error("500 Server Error"),
  },

  // 테스트 관련 프리셋
  test: {
    passed: (): StatusState => AttendanceStatusPresets.success("통과"),
    failed: (): StatusState => AttendanceStatusPresets.error("실패"),
    skipped: (): StatusState => AttendanceStatusPresets.warning("건너뜀"),
    running: (): StatusState => AttendanceStatusPresets.pending("실행중"),
  },
};
