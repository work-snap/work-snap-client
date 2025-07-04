"use client";

import React, { useState, useEffect } from "react";

interface RealTimeClockProps {
  className?: string;
  showSeconds?: boolean;
}

/**
 * 실시간 시계 컴포넌트
 * Single Responsibility: 현재 시간 표시만 담당
 */
export const RealTimeClock: React.FC<RealTimeClockProps> = ({
  className = "",
  showSeconds = true,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // 1초마다 업데이트

    return () => clearInterval(interval);
  }, []);

  const formatTime = (date: Date): string => {
    if (showSeconds) {
      return date.toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } else {
      return date.toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  return (
    <div className={`text-center ${className}`}>
      <div className="text-gray-600 text-sm mb-1">현재 시간</div>
      <div className="text-lg font-mono text-main2">
        {formatTime(currentTime)}
      </div>
    </div>
  );
};
