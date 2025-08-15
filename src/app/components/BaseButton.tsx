"use client";

import React from "react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "danger";

export interface BaseButtonState {
  label: string;
  icon?: React.ReactNode | string;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  loadingText?: string;
}

export interface BaseButtonProps {
  buttonState: BaseButtonState;
  onClick?: () => void;
  className?: string;
  title?: string;
  type?: "button" | "submit" | "reset";
  disableHover?: boolean;
}

export const BaseButton: React.FC<BaseButtonProps> = ({
  buttonState,
  onClick,
  className = "",
  title,
  type = "button",
  disableHover = false,
}) => {
  const {
    label,
    icon,
    variant = "primary",
    loading = false,
    disabled = false,
    loadingText = "로딩 중...",
  } = buttonState;

  const getVariantStyles = (variant: ButtonVariant): string => {
    const baseStyles =
      "px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";

    const variantStyles = {
      primary:
        "bg-main text-white hover:bg-main2 focus:ring-main disabled:bg-gray-300",
      secondary:
        "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500 disabled:bg-gray-100",
      success:
        "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 disabled:bg-green-300",
      warning:
        "bg-orange-600 text-white hover:bg-orange-700 focus:ring-orange-500 disabled:bg-orange-300",
      danger:
        "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-red-300",
    };

    const style = variantStyles[variant];
    const stripped = disableHover
      ? style
          .split(" ")
          .filter((cls) => !cls.startsWith("hover:"))
          .join(" ")
      : style;

    return `${baseStyles} ${stripped}`;
  };

  const isDisabled = disabled || loading;
  const displayText = loading ? loadingText : label;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`${getVariantStyles(variant)} ${
        isDisabled ? "cursor-not-allowed opacity-60" : ""
      } ${className}`}
      title={title}
    >
      <div className="flex items-center justify-center space-x-2">
        {loading ? (
          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
        ) : (
          icon && <span>{icon}</span>
        )}
        <span>{displayText}</span>
      </div>
    </button>
  );
};

export type ButtonVariants = ButtonVariant;
