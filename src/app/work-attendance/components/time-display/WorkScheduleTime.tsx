"use client";

import React from "react";
import { AttendanceRes } from "../../lib/types";

interface WorkScheduleTimeProps {
  attendance: AttendanceRes;
  className?: string;
}

/**
 * 근무 시간 표시 컴포넌트
 * Single Responsibility: 예정/실제 근무 시간 표시만 담당
 */
export const WorkScheduleTime: React.FC<WorkScheduleTimeProps> = ({
  attendance,
  className = "",
}) => {
  return (
    <div className={`flex justify-between items-center ${className}`}>
      {/* 시작 시간 */}
      <div className="text-center">
        <div className="text-gray-500 text-sm mb-1">{attendance.workDate}</div>
        <div className="text-4xl font-bold text-main2">
          {attendance.scheduledStartTime}
        </div>
        {attendance.actualStartTime && (
          <div className="text-blue-600 text-sm mt-1">
            출근 {attendance.actualStartTime}
          </div>
        )}
      </div>

      {/* 구분선 */}
      <div className="text-gray-400 text-2xl px-4">···</div>

      {/* 종료 시간 */}
      <div className="text-center">
        <div className="text-gray-500 text-sm mb-1">{attendance.workDate}</div>
        <div className="text-4xl font-bold text-main2">
          {attendance.scheduledEndTime}
        </div>
        {attendance.actualEndTime && (
          <div className="text-green-600 text-sm mt-1">
            퇴근 {attendance.actualEndTime}
          </div>
        )}
      </div>
    </div>
  );
};
