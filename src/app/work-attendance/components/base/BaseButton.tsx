"use client";

import React from "react";
import { LoadingSpinner } from "../common";

// Base button variant types
export type ButtonVariant = "primary" | "secondary" | "success" | "warning" | "danger" | "ghost";
export type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl";

// Base button state interface
export interface BaseButtonState {
  label: string;
  icon?: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
}

// Base button props interface
export interface BaseButtonProps {
  buttonState: BaseButtonState;
  onClick: () => void;
  className?: string;
  type?: "button" | "submit" | "reset";
  "aria-label"?: string;
  title?: string;
  children?: React.ReactNode;
}

/**
 * BaseButton - 공통 버튼 기능을 추상화한 기본 컴포넌트
 * 
 * Features:
 * - 다양한 variant 및 size 지원
 * - 로딩 상태 및 비활성화 상태 관리
 * - 아이콘 및 텍스트 조합 지원
 * - 접근성 고려 (aria-label, title)
 * - 커스터마이징 가능한 스타일링
 */
export const BaseButton: React.FC<BaseButtonProps> = ({
  buttonState,
  onClick,
  className = "",
  type = "button",
  "aria-label": ariaLabel,
  title,
  children,
}) => {
  const {
    label,
    icon,
    variant = "primary",
    size = "md",
    disabled = false,
    loading = false,
    loadingText = "처리 중...",
  } = buttonState;

  const isDisabled = disabled || loading;

  // Base button styles
  const getBaseStyles = () => {
    return [
      "relative",
      "inline-flex",
      "items-center",
      "justify-center",
      "font-medium",
      "rounded-lg",
      "transition-all",
      "duration-200",
      "focus:outline-none",
      "focus:ring-2",
      "focus:ring-offset-2",
      "disabled:cursor-not-allowed",
      "disabled:opacity-50",
    ].join(" ");
  };

  // Size-based styles
  const getSizeStyles = () => {
    const sizeMap = {
      xs: "px-2 py-1 text-xs",
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base",
      xl: "px-8 py-4 text-lg",
    };
    return sizeMap[size];
  };

  // Variant-based styles
  const getVariantStyles = () => {
    const variantMap = {
      primary: [
        "bg-main text-white",
        "hover:bg-main2",
        "focus:ring-main",
        "disabled:bg-gray-300 disabled:text-gray-500",
      ].join(" "),
      secondary: [
        "bg-gray-100 text-gray-900 border border-gray-300",
        "hover:bg-gray-200",
        "focus:ring-gray-300",
        "disabled:bg-gray-50 disabled:text-gray-400",
      ].join(" "),
      success: [
        "bg-green-500 text-white",
        "hover:bg-green-600",
        "focus:ring-green-300",
        "disabled:bg-gray-300 disabled:text-gray-500",
      ].join(" "),
      warning: [
        "bg-orange-500 text-white",
        "hover:bg-orange-600",
        "focus:ring-orange-300",
        "disabled:bg-gray-300 disabled:text-gray-500",
      ].join(" "),
      danger: [
        "bg-red-500 text-white",
        "hover:bg-red-600",
        "focus:ring-red-300",
        "disabled:bg-gray-300 disabled:text-gray-500",
      ].join(" "),
      ghost: [
        "bg-transparent text-gray-700 border border-transparent",
        "hover:bg-gray-100",
        "focus:ring-gray-300",
        "disabled:text-gray-400",
      ].join(" "),
    };
    return variantMap[variant];
  };

  // Loading spinner size mapping
  const getSpinnerSize = () => {
    const spinnerSizeMap = {
      xs: "sm" as const,
      sm: "sm" as const,
      md: "md" as const,
      lg: "md" as const,
      xl: "lg" as const,
    };
    return spinnerSizeMap[size];
  };

  // Combined className
  const combinedClassName = [
    getBaseStyles(),
    getSizeStyles(),
    getVariantStyles(),
    className,
  ].join(" ");

  const handleClick = () => {
    if (!isDisabled) {
      onClick();
    }
  };

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={isDisabled}
      className={combinedClassName}
      aria-label={ariaLabel || label}
      title={title || label}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <LoadingSpinner 
            size={getSpinnerSize()} 
            color="white" 
            className="mr-2" 
          />
          <span>{loadingText}</span>
        </div>
      ) : (
        <>
          {children || (
            <div className="flex items-center justify-center">
              {icon && <span className="mr-2">{icon}</span>}
              <span>{label}</span>
            </div>
          )}
        </>
      )}
    </button>
  );
};

// Helper function to create button state
export const createButtonState = (
  label: string,
  options: Partial<Omit<BaseButtonState, "label">> = {}
): BaseButtonState => ({
  label,
  ...options,
});

// Common button variants factory
export const ButtonVariants = {
  primary: (label: string, options?: Partial<BaseButtonState>) =>
    createButtonState(label, { variant: "primary", ...options }),
  
  secondary: (label: string, options?: Partial<BaseButtonState>) =>
    createButtonState(label, { variant: "secondary", ...options }),
  
  success: (label: string, options?: Partial<BaseButtonState>) =>
    createButtonState(label, { variant: "success", ...options }),
  
  warning: (label: string, options?: Partial<BaseButtonState>) =>
    createButtonState(label, { variant: "warning", ...options }),
  
  danger: (label: string, options?: Partial<BaseButtonState>) =>
    createButtonState(label, { variant: "danger", ...options }),
  
  ghost: (label: string, options?: Partial<BaseButtonState>) =>
    createButtonState(label, { variant: "ghost", ...options }),
};