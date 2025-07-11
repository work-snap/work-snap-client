import React from "react";
import { AttendanceStatus, STATUS_CONFIG } from "../lib/constants/status";

interface StatusMessageProps {
  status: AttendanceStatus;
  className?: string;
}

export const StatusMessage: React.FC<StatusMessageProps> = ({
  status,
  className = "",
}) => {
  const config = STATUS_CONFIG[status];

  return (
    <div
      className={`flex items-center gap-2 ${className}`}
      role="status"
      aria-label={config.description}
    >
      <div
        className={`h-2 w-2 rounded-full ${config.color.replace(
          "text-",
          "bg-"
        )}`}
        aria-hidden="true"
      />
      <span className={`text-sm font-medium ${config.color}`}>
        {config.text}
      </span>
    </div>
  );
};
