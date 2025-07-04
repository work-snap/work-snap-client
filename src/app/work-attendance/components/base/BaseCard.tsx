"use client";

import React from "react";

// Base card variant types
export type CardVariant = "default" | "primary" | "secondary" | "success" | "warning" | "danger" | "info";
export type CardSize = "sm" | "md" | "lg" | "xl";
export type CardBorderPosition = "none" | "left" | "right" | "top" | "bottom" | "all";

// Base card state interface
export interface BaseCardState {
  variant?: CardVariant;
  size?: CardSize;
  borderPosition?: CardBorderPosition;
  borderColor?: string;
  hasHeader?: boolean;
  hasFooter?: boolean;
  loading?: boolean;
  disabled?: boolean;
}

// Card header props
export interface CardHeaderProps {
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  statusBadge?: React.ReactNode;
  className?: string;
}

// Card footer props  
export interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

// Base card props interface
export interface BaseCardProps {
  cardState?: BaseCardState;
  header?: CardHeaderProps;
  footer?: CardFooterProps;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  "data-testid"?: string;
}

/**
 * BaseCard - 공통 카드 패턴을 추상화한 기본 컴포넌트
 * 
 * Features:
 * - 다양한 variant 및 size 지원
 * - 헤더, 풋터 컴포지션 패턴
 * - 경계선 위치 및 색상 커스터마이징
 * - 로딩 및 비활성화 상태 관리
 * - 클릭 가능한 카드 지원
 * - 접근성 고려
 */
export const BaseCard: React.FC<BaseCardProps> = ({
  cardState = {},
  header,
  footer,
  children,
  className = "",
  onClick,
  "data-testid": dataTestId,
}) => {
  const {
    variant = "default",
    size = "md",
    borderPosition = "all",
    borderColor,
    hasHeader = !!header,
    hasFooter = !!footer,
    loading = false,
    disabled = false,
  } = cardState;

  // Base card styles
  const getBaseStyles = () => {
    return [
      "relative",
      "bg-white",
      "rounded-2xl",
      "shadow-sm",
      "transition-all",
      "duration-200",
      onClick && !disabled ? "cursor-pointer hover:shadow-md" : "",
      disabled ? "opacity-50 cursor-not-allowed" : "",
      loading ? "pointer-events-none" : "",
    ].filter(Boolean).join(" ");
  };

  // Size-based styles
  const getSizeStyles = () => {
    const sizeMap = {
      sm: "p-3",
      md: "p-4",
      lg: "p-6",
      xl: "p-8",
    };
    return sizeMap[size];
  };

  // Variant-based styles
  const getVariantStyles = () => {
    const variantMap = {
      default: "border border-gray-200",
      primary: "border border-blue-200 bg-blue-50",
      secondary: "border border-gray-300 bg-gray-50",
      success: "border border-green-200 bg-green-50",
      warning: "border border-orange-200 bg-orange-50",
      danger: "border border-red-200 bg-red-50",
      info: "border border-blue-200 bg-blue-50",
    };
    return variantMap[variant];
  };

  // Border position styles
  const getBorderStyles = () => {
    if (borderPosition === "none") return "";
    
    const borderColorClass = borderColor || getBorderColorFromVariant();
    
    const borderMap = {
      left: `border-l-4 ${borderColorClass}`,
      right: `border-r-4 ${borderColorClass}`,
      top: `border-t-4 ${borderColorClass}`,
      bottom: `border-b-4 ${borderColorClass}`,
      all: `border ${borderColorClass}`,
    };
    
    return borderMap[borderPosition] || "";
  };

  const getBorderColorFromVariant = () => {
    const colorMap = {
      default: "border-gray-200",
      primary: "border-blue-500",
      secondary: "border-gray-400",
      success: "border-green-500",
      warning: "border-orange-500",
      danger: "border-red-500",
      info: "border-blue-500",
    };
    return colorMap[variant];
  };

  // Combined className
  const combinedClassName = [
    getBaseStyles(),
    getSizeStyles(),
    getVariantStyles(),
    getBorderStyles(),
    className,
  ].join(" ");

  const handleClick = () => {
    if (!disabled && !loading && onClick) {
      onClick();
    }
  };

  return (
    <div
      className={combinedClassName}
      onClick={handleClick}
      data-testid={dataTestId}
      role={onClick ? "button" : undefined}
      tabIndex={onClick && !disabled ? 0 : undefined}
    >
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-2xl z-10">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-main"></div>
            <span className="text-gray-600">로딩 중...</span>
          </div>
        </div>
      )}

      {/* Header */}
      {hasHeader && header && (
        <CardHeader {...header} />
      )}

      {/* Content */}
      <div className={`${hasHeader ? "mt-4" : ""} ${hasFooter ? "mb-4" : ""}`}>
        {children}
      </div>

      {/* Footer */}
      {hasFooter && footer && (
        <CardFooter {...footer} />
      )}
    </div>
  );
};

/**
 * CardHeader - 카드 헤더 컴포넌트
 */
export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  subtitle,
  icon,
  actions,
  statusBadge,
  className = "",
}) => {
  return (
    <div className={`flex items-start justify-between ${className}`}>
      <div className="flex-1">
        {/* Title with icon */}
        {title && (
          <div className="flex items-center mb-2">
            {icon && <span className="text-xl mr-2">{icon}</span>}
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
        )}
        
        {/* Subtitle */}
        {subtitle && (
          <p className="text-sm text-gray-600 mb-2">{subtitle}</p>
        )}
        
        {/* Status badge */}
        {statusBadge && (
          <div className="flex items-center space-x-3">
            {statusBadge}
          </div>
        )}
      </div>

      {/* Actions */}
      {actions && (
        <div className="ml-4 flex-shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
};

/**
 * CardFooter - 카드 풋터 컴포넌트
 */
export const CardFooter: React.FC<CardFooterProps> = ({
  children,
  className = "",
}) => {
  return (
    <div className={`mt-4 pt-4 border-t border-gray-200 ${className}`}>
      {children}
    </div>
  );
};

// Helper function to create card state
export const createCardState = (
  options: Partial<BaseCardState> = {}
): BaseCardState => ({
  variant: "default",
  size: "md",
  borderPosition: "all",
  hasHeader: false,
  hasFooter: false,
  loading: false,
  disabled: false,
  ...options,
});

// Common card variants factory
export const CardVariants = {
  default: (options?: Partial<BaseCardState>) =>
    createCardState({ variant: "default", ...options }),
  
  primary: (options?: Partial<BaseCardState>) =>
    createCardState({ variant: "primary", ...options }),
  
  secondary: (options?: Partial<BaseCardState>) =>
    createCardState({ variant: "secondary", ...options }),
  
  success: (options?: Partial<BaseCardState>) =>
    createCardState({ variant: "success", ...options }),
  
  warning: (options?: Partial<BaseCardState>) =>
    createCardState({ variant: "warning", ...options }),
  
  danger: (options?: Partial<BaseCardState>) =>
    createCardState({ variant: "danger", ...options }),
  
  info: (options?: Partial<BaseCardState>) =>
    createCardState({ variant: "info", ...options }),

  // Status-based variants for attendance cards
  scheduled: (options?: Partial<BaseCardState>) =>
    createCardState({ 
      variant: "warning", 
      borderPosition: "left", 
      borderColor: "border-orange-500",
      ...options 
    }),
  
  inProgress: (options?: Partial<BaseCardState>) =>
    createCardState({ 
      variant: "primary", 
      borderPosition: "left", 
      borderColor: "border-blue-500",
      ...options 
    }),
  
  completed: (options?: Partial<BaseCardState>) =>
    createCardState({ 
      variant: "success", 
      borderPosition: "left", 
      borderColor: "border-green-500",
      ...options 
    }),
};