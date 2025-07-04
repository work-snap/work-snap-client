"use client";

import React from "react";

// Status display variant types
export type StatusVariant = "badge" | "dot" | "pill" | "inline" | "card";
export type StatusSize = "xs" | "sm" | "md" | "lg";
export type StatusColor = "gray" | "blue" | "green" | "yellow" | "red" | "purple" | "orange";

// Base status state interface
export interface BaseStatusState {
  status: string;
  label: string;
  color?: StatusColor;
  icon?: React.ReactNode;
  variant?: StatusVariant;
  size?: StatusSize;
  showIcon?: boolean;
  showLabel?: boolean;
  animated?: boolean;
}

// Status display props interface
export interface StatusDisplayProps {
  statusState: BaseStatusState;
  className?: string;
  onClick?: () => void;
  "data-testid"?: string;
}

/**
 * StatusDisplay - 상태 표시를 추상화한 범용 컴포넌트
 * 
 * Features:
 * - 다양한 표시 형태 (badge, dot, pill, inline, card)
 * - 다양한 크기 및 색상 지원
 * - 아이콘 및 라벨 조합 지원
 * - 애니메이션 효과 옵션
 * - 클릭 가능한 상태 표시
 * - 접근성 고려
 */
export const StatusDisplay: React.FC<StatusDisplayProps> = ({
  statusState,
  className = "",
  onClick,
  "data-testid": dataTestId,
}) => {
  const {
    status,
    label,
    color = "gray",
    icon,
    variant = "badge",
    size = "md",
    showIcon = true,
    showLabel = true,
    animated = false,
  } = statusState;

  // Base styles
  const getBaseStyles = () => {
    const baseStyles = [
      "inline-flex",
      "items-center",
      "font-medium",
      "transition-all",
      "duration-200",
    ];

    if (onClick) {
      baseStyles.push("cursor-pointer", "hover:opacity-80");
    }

    if (animated) {
      baseStyles.push("animate-pulse");
    }

    return baseStyles.join(" ");
  };

  // Size-based styles
  const getSizeStyles = () => {
    const sizeMap = {
      xs: {
        badge: "px-2 py-0.5 text-xs",
        dot: "w-2 h-2",
        pill: "px-2 py-0.5 text-xs",
        inline: "text-xs",
        card: "px-2 py-1 text-xs",
      },
      sm: {
        badge: "px-2.5 py-0.5 text-xs",
        dot: "w-2.5 h-2.5",
        pill: "px-2.5 py-0.5 text-xs",
        inline: "text-sm",
        card: "px-3 py-1.5 text-sm",
      },
      md: {
        badge: "px-3 py-1 text-sm",
        dot: "w-3 h-3",
        pill: "px-3 py-1 text-sm",
        inline: "text-sm",
        card: "px-4 py-2 text-sm",
      },
      lg: {
        badge: "px-4 py-1.5 text-base",
        dot: "w-4 h-4",
        pill: "px-4 py-1.5 text-base",
        inline: "text-base",
        card: "px-5 py-2.5 text-base",
      },
    };
    return sizeMap[size][variant];
  };

  // Color-based styles
  const getColorStyles = () => {
    const colorMap = {
      gray: {
        badge: "bg-gray-100 text-gray-800",
        dot: "bg-gray-400",
        pill: "bg-gray-100 text-gray-800",
        inline: "text-gray-700",
        card: "bg-gray-50 text-gray-800 border border-gray-200",
      },
      blue: {
        badge: "bg-blue-100 text-blue-800",
        dot: "bg-blue-500",
        pill: "bg-blue-100 text-blue-800",
        inline: "text-blue-700",
        card: "bg-blue-50 text-blue-800 border border-blue-200",
      },
      green: {
        badge: "bg-green-100 text-green-800",
        dot: "bg-green-500",
        pill: "bg-green-100 text-green-800",
        inline: "text-green-700",
        card: "bg-green-50 text-green-800 border border-green-200",
      },
      yellow: {
        badge: "bg-yellow-100 text-yellow-800",
        dot: "bg-yellow-500",
        pill: "bg-yellow-100 text-yellow-800",
        inline: "text-yellow-700",
        card: "bg-yellow-50 text-yellow-800 border border-yellow-200",
      },
      red: {
        badge: "bg-red-100 text-red-800",
        dot: "bg-red-500",
        pill: "bg-red-100 text-red-800",
        inline: "text-red-700",
        card: "bg-red-50 text-red-800 border border-red-200",
      },
      purple: {
        badge: "bg-purple-100 text-purple-800",
        dot: "bg-purple-500",
        pill: "bg-purple-100 text-purple-800",
        inline: "text-purple-700",
        card: "bg-purple-50 text-purple-800 border border-purple-200",
      },
      orange: {
        badge: "bg-orange-100 text-orange-800",
        dot: "bg-orange-500",
        pill: "bg-orange-100 text-orange-800",
        inline: "text-orange-700",
        card: "bg-orange-50 text-orange-800 border border-orange-200",
      },
    };
    return colorMap[color][variant];
  };

  // Variant-based styles
  const getVariantStyles = () => {
    const variantMap = {
      badge: "rounded-full",
      dot: "rounded-full",
      pill: "rounded-full",
      inline: "",
      card: "rounded-lg",
    };
    return variantMap[variant];
  };

  // Icon size mapping
  const getIconSize = () => {
    const iconSizeMap = {
      xs: "text-xs",
      sm: "text-xs",
      md: "text-sm",
      lg: "text-base",
    };
    return iconSizeMap[size];
  };

  // Combined className
  const combinedClassName = [
    getBaseStyles(),
    getSizeStyles(),
    getColorStyles(),
    getVariantStyles(),
    className,
  ].join(" ");

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  // Render content based on variant
  const renderContent = () => {
    if (variant === "dot") {
      return null; // Dots don't have content
    }

    return (
      <>
        {showIcon && icon && (
          <span className={`${getIconSize()} ${showLabel ? "mr-1" : ""}`}>
            {icon}
          </span>
        )}
        {showLabel && <span>{label}</span>}
      </>
    );
  };

  return (
    <span
      className={combinedClassName}
      onClick={handleClick}
      data-testid={dataTestId}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      title={label}
    >
      {renderContent()}
    </span>
  );
};

// Helper function to create status state
export const createStatusState = (
  status: string,
  label: string,
  options: Partial<Omit<BaseStatusState, "status" | "label">> = {}
): BaseStatusState => ({
  status,
  label,
  color: "gray",
  variant: "badge",
  size: "md",
  showIcon: true,
  showLabel: true,
  animated: false,
  ...options,
});

// Common status presets for attendance system
export const AttendanceStatusPresets = {
  scheduled: (label: string) => createStatusState("SCHEDULED", label, {
    color: "yellow",
    icon: "⏰",
  }),
  
  inProgress: (label: string) => createStatusState("IN_PROGRESS", label, {
    color: "blue",
    icon: "🔄",
    animated: true,
  }),
  
  completed: (label: string) => createStatusState("COMPLETED", label, {
    color: "green",
    icon: "✅",
  }),
  
  absent: (label: string) => createStatusState("ABSENT", label, {
    color: "red",
    icon: "❌",
  }),
  
  // Additional work specific
  additionalWork: (label: string) => createStatusState("ADDITIONAL", label, {
    color: "purple",
    icon: "⚡",
  }),
  
  // General status presets
  success: (label: string) => createStatusState("SUCCESS", label, {
    color: "green",
    icon: "✓",
  }),
  
  warning: (label: string) => createStatusState("WARNING", label, {
    color: "yellow",
    icon: "⚠",
  }),
  
  error: (label: string) => createStatusState("ERROR", label, {
    color: "red",
    icon: "✗",
  }),
  
  info: (label: string) => createStatusState("INFO", label, {
    color: "blue",
    icon: "ℹ",
  }),
  
  loading: (label: string) => createStatusState("LOADING", label, {
    color: "gray",
    icon: "○",
    animated: true,
  }),
};

// Status variants factory
export const StatusVariants = {
  badge: (status: string, label: string, color?: StatusColor) =>
    createStatusState(status, label, { variant: "badge", color }),
  
  dot: (status: string, label: string, color?: StatusColor) =>
    createStatusState(status, label, { variant: "dot", color, showLabel: false }),
  
  pill: (status: string, label: string, color?: StatusColor) =>
    createStatusState(status, label, { variant: "pill", color }),
  
  inline: (status: string, label: string, color?: StatusColor) =>
    createStatusState(status, label, { variant: "inline", color }),
  
  card: (status: string, label: string, color?: StatusColor) =>
    createStatusState(status, label, { variant: "card", color }),
};