import React from "react";
import { formatTime } from "../lib/utils/dateUtils";

interface TimeDisplayProps {
  startTime?: Date;
  endTime?: Date;
  isOvernight?: boolean;
  className?: string;
}

export const TimeDisplay: React.FC<TimeDisplayProps> = ({
  startTime,
  endTime,
  isOvernight = false,
  className = "",
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex flex-col">
        <span className="text-sm text-gray3">출근 시간</span>
        <span className="text-lg font-medium">{formatTime(startTime)}</span>
      </div>
      <span className="text-gray3">~</span>
      <div className="flex flex-col">
        <span className="text-sm text-gray3">퇴근 시간</span>
        <span className="text-lg font-medium">
          {formatTime(endTime)}
          {isOvernight && (
            <span className="text-xs text-sub2 ml-1">(익일)</span>
          )}
        </span>
      </div>
    </div>
  );
};

export default TimeDisplay;
