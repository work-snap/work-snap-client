import React from "react";
import { AttendanceStatus, ACTION_CONFIG } from "../lib/constants/status";

interface ActionButtonProps {
  status: AttendanceStatus;
  onClockIn: () => void;
  onClockOut: () => void;
  isLoading?: boolean;
  className?: string;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  status,
  onClockIn,
  onClockOut,
  isLoading = false,
  className = "",
}) => {
  const getButtonConfig = () => {
    switch (status) {
      case "BEFORE_WORK":
        return {
          ...ACTION_CONFIG.BEFORE_WORK,
          onClick: onClockIn,
        };
      case "WORKING":
        return {
          ...ACTION_CONFIG.WORKING,
          onClick: onClockOut,
        };
      default:
        return {
          ...ACTION_CONFIG.AFTER_WORK,
          onClick: () => {},
        };
    }
  };

  const config = getButtonConfig();
  const isDisabled =
    isLoading || status === "AFTER_WORK" || status === "ABSENT";

  return (
    <button
      onClick={config.onClick}
      disabled={isDisabled}
      aria-label={config.ariaLabel}
      aria-disabled={isDisabled}
      className={`
        px-4 py-2 rounded-lg text-white font-medium
        transition-colors duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${config.color}
        ${className}
      `}
    >
      <span className="sr-only">{config.ariaLabel}</span>
      <span aria-hidden="true">{isLoading ? "처리중..." : config.text}</span>
    </button>
  );
};

export default ActionButton;
