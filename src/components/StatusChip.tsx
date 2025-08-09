"use client";

import React from "react";

// 출석 상태 타입 정의
export type AttendanceStatus = 
  | "NORMAL"           // 정상 출근
  | "LATE"             // 지각
  | "EARLY_ARRIVAL"    // 조기 출근
  | "OVERTIME"         // 연장 근무
  | "ABSENT"           // 결근
  | "LEAVE"            // 휴가
  | "SICK_LEAVE"       // 병가
  | "HALF_DAY"         // 반차
  | "REMOTE_WORK"      // 재택근무
  | "BUSINESS_TRIP";   // 출장

// 칩 크기 타입
export type ChipSize = "sm" | "md" | "lg";

// 칩 변형 타입
export type ChipVariant = "solid" | "outline" | "subtle";

interface StatusChipProps {
  status: AttendanceStatus;
  size?: ChipSize;
  variant?: ChipVariant;
  className?: string;
  showIcon?: boolean;
  onClick?: () => void;
}

// 상태별 설정
const statusConfig: Record<AttendanceStatus, {
  label: string;
  colors: {
    solid: string;
    outline: string;
    subtle: string;
  };
  icon: string;
}> = {
  NORMAL: {
    label: "정상",
    colors: {
      solid: "bg-success-500 text-white border-success-500",
      outline: "bg-transparent text-success-600 border-success-300 hover:bg-success-50",
      subtle: "bg-success-50 text-success-700 border-success-100",
    },
    icon: "✓",
  },
  LATE: {
    label: "지각",
    colors: {
      solid: "bg-warning-500 text-white border-warning-500",
      outline: "bg-transparent text-warning-600 border-warning-300 hover:bg-warning-50",
      subtle: "bg-warning-50 text-warning-700 border-warning-100",
    },
    icon: "⏰",
  },
  EARLY_ARRIVAL: {
    label: "조기출근",
    colors: {
      solid: "bg-toss-blue text-white border-toss-blue",
      outline: "bg-transparent text-toss-blue border-blue-300 hover:bg-blue-50",
      subtle: "bg-blue-50 text-blue-700 border-blue-100",
    },
    icon: "🌅",
  },
  OVERTIME: {
    label: "연장근무",
    colors: {
      solid: "bg-purple-500 text-white border-purple-500",
      outline: "bg-transparent text-purple-600 border-purple-300 hover:bg-purple-50",
      subtle: "bg-purple-50 text-purple-700 border-purple-100",
    },
    icon: "🌙",
  },
  ABSENT: {
    label: "결근",
    colors: {
      solid: "bg-error-500 text-white border-error-500",
      outline: "bg-transparent text-error-600 border-error-300 hover:bg-error-50",
      subtle: "bg-error-50 text-error-700 border-error-100",
    },
    icon: "❌",
  },
  LEAVE: {
    label: "휴가",
    colors: {
      solid: "bg-toss-gray-400 text-white border-toss-gray-400",
      outline: "bg-transparent text-toss-gray-600 border-toss-gray-300 hover:bg-toss-gray-50",
      subtle: "bg-toss-gray-50 text-toss-gray-700 border-toss-gray-100",
    },
    icon: "🏖️",
  },
  SICK_LEAVE: {
    label: "병가",
    colors: {
      solid: "bg-red-400 text-white border-red-400",
      outline: "bg-transparent text-red-500 border-red-300 hover:bg-red-50",
      subtle: "bg-red-50 text-red-600 border-red-100",
    },
    icon: "🏥",
  },
  HALF_DAY: {
    label: "반차",
    colors: {
      solid: "bg-orange-400 text-white border-orange-400",
      outline: "bg-transparent text-orange-500 border-orange-300 hover:bg-orange-50",
      subtle: "bg-orange-50 text-orange-600 border-orange-100",
    },
    icon: "🕐",
  },
  REMOTE_WORK: {
    label: "재택근무",
    colors: {
      solid: "bg-green-400 text-white border-green-400",
      outline: "bg-transparent text-green-500 border-green-300 hover:bg-green-50",
      subtle: "bg-green-50 text-green-600 border-green-100",
    },
    icon: "🏠",
  },
  BUSINESS_TRIP: {
    label: "출장",
    colors: {
      solid: "bg-indigo-500 text-white border-indigo-500",
      outline: "bg-transparent text-indigo-600 border-indigo-300 hover:bg-indigo-50",
      subtle: "bg-indigo-50 text-indigo-700 border-indigo-100",
    },
    icon: "✈️",
  },
};

// 크기별 스타일
const sizeStyles: Record<ChipSize, {
  container: string;
  text: string;
  icon: string;
}> = {
  sm: {
    container: "px-2 py-1 text-xs",
    text: "text-xs",
    icon: "text-xs mr-1",
  },
  md: {
    container: "px-3 py-1.5 text-sm",
    text: "text-sm",
    icon: "text-sm mr-1.5",
  },
  lg: {
    container: "px-4 py-2 text-base",
    text: "text-base",
    icon: "text-base mr-2",
  },
};

/**
 * 상태별 칩 컴포넌트
 * 출석 상태를 시각적으로 표시하는 컴포넌트
 */
export const StatusChip: React.FC<StatusChipProps> = ({
  status,
  size = "md",
  variant = "solid",
  className = "",
  showIcon = true,
  onClick,
}) => {
  const config = statusConfig[status];
  const sizeStyle = sizeStyles[size];
  
  if (!config) {
    console.warn(`Unknown status: ${status}`);
    return null;
  }

  const colorClass = config.colors[variant];
  const isClickable = !!onClick;

  return (
    <span
      className={`
        inline-flex items-center justify-center
        border rounded-full font-medium
        transition-all duration-200 ease-in-out
        ${sizeStyle.container}
        ${colorClass}
        ${isClickable ? "cursor-pointer hover:shadow-sm active:scale-95" : ""}
        ${className}
      `}
      onClick={onClick}
      role={isClickable ? "button" : "status"}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      aria-label={`상태: ${config.label}`}
    >
      {showIcon && (
        <span className={sizeStyle.icon} role="img" aria-hidden="true">
          {config.icon}
        </span>
      )}
      <span className={sizeStyle.text}>{config.label}</span>
    </span>
  );
};

/**
 * 다중 상태 칩 컴포넌트
 * 여러 상태를 한 번에 표시할 때 사용
 */
export const MultiStatusChip: React.FC<{
  statuses: AttendanceStatus[];
  size?: ChipSize;
  variant?: ChipVariant;
  className?: string;
  maxDisplay?: number;
  onStatusClick?: (status: AttendanceStatus) => void;
}> = ({
  statuses,
  size = "md",
  variant = "solid",
  className = "",
  maxDisplay = 3,
  onStatusClick,
}) => {
  const displayStatuses = statuses.slice(0, maxDisplay);
  const remainingCount = statuses.length - maxDisplay;

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {displayStatuses.map((status, index) => (
        <StatusChip
          key={`${status}-${index}`}
          status={status}
          size={size}
          variant={variant}
          onClick={() => onStatusClick?.(status)}
        />
      ))}
      {remainingCount > 0 && (
        <span
          className={`
            inline-flex items-center justify-center
            border rounded-full font-medium
            bg-toss-gray-100 text-toss-gray-600 border-toss-gray-200
            ${sizeStyles[size].container}
          `}
        >
          <span className={sizeStyles[size].text}>
            +{remainingCount}
          </span>
        </span>
      )}
    </div>
  );
};

/**
 * 상태 통계 칩 컴포넌트
 * 상태별 개수를 표시할 때 사용
 */
export const StatusStatsChip: React.FC<{
  status: AttendanceStatus;
  count: number;
  size?: ChipSize;
  variant?: ChipVariant;
  className?: string;
  onClick?: () => void;
}> = ({
  status,
  count,
  size = "md",
  variant = "subtle",
  className = "",
  onClick,
}) => {
  const config = statusConfig[status];
  const sizeStyle = sizeStyles[size];
  
  if (!config) {
    return null;
  }

  const colorClass = config.colors[variant];
  const isClickable = !!onClick;

  return (
    <span
      className={`
        inline-flex items-center justify-center
        border rounded-full font-medium
        transition-all duration-200 ease-in-out
        ${sizeStyle.container}
        ${colorClass}
        ${isClickable ? "cursor-pointer hover:shadow-sm active:scale-95" : ""}
        ${className}
      `}
      onClick={onClick}
      role={isClickable ? "button" : "status"}
      tabIndex={isClickable ? 0 : undefined}
      aria-label={`${config.label}: ${count}건`}
    >
      <span className={`${sizeStyle.icon} mr-1`} role="img" aria-hidden="true">
        {config.icon}
      </span>
      <span className={sizeStyle.text}>{config.label}</span>
      <span className={`${sizeStyle.text} ml-1 font-bold`}>
        {count}
      </span>
    </span>
  );
};

/**
 * 상태 선택 칩 컴포넌트
 * 상태를 선택할 수 있는 토글 형태의 칩
 */
export const SelectableStatusChip: React.FC<{
  status: AttendanceStatus;
  selected?: boolean;
  size?: ChipSize;
  className?: string;
  onToggle?: (status: AttendanceStatus, selected: boolean) => void;
}> = ({
  status,
  selected = false,
  size = "md",
  className = "",
  onToggle,
}) => {
  const variant = selected ? "solid" : "outline";

  return (
    <StatusChip
      status={status}
      size={size}
      variant={variant}
      className={`
        ${selected ? "ring-2 ring-offset-1" : ""}
        ${className}
      `}
      onClick={() => onToggle?.(status, !selected)}
    />
  );
};

// 상태별 색상 헬퍼 함수들
export const getStatusColor = (status: AttendanceStatus, variant: ChipVariant = "solid"): string => {
  return statusConfig[status]?.colors[variant] || "";
};

export const getStatusLabel = (status: AttendanceStatus): string => {
  return statusConfig[status]?.label || status;
};

export const getStatusIcon = (status: AttendanceStatus): string => {
  return statusConfig[status]?.icon || "";
};

// 상태 우선순위 (정렬 시 사용)
export const statusPriority: Record<AttendanceStatus, number> = {
  ABSENT: 1,
  LATE: 2,
  OVERTIME: 3,
  EARLY_ARRIVAL: 4,
  NORMAL: 5,
  HALF_DAY: 6,
  SICK_LEAVE: 7,
  LEAVE: 8,
  REMOTE_WORK: 9,
  BUSINESS_TRIP: 10,
};

// 상태 정렬 헬퍼 함수
export const sortStatusesByPriority = (statuses: AttendanceStatus[]): AttendanceStatus[] => {
  return [...statuses].sort((a, b) => statusPriority[a] - statusPriority[b]);
};