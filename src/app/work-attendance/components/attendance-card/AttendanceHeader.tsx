"use client";

import React from "react";
import {
  AttendanceRes,
  SmartButtonState,
  AttendanceStatus,
  ClockInType,
  ClockOutType,
} from "../../lib/types";
import { RealTimeClock, WorkScheduleTime } from "../time-display";
import { StatusBadge } from "../feedback";
import { formatTime } from "../../lib/utils";

interface AttendanceHeaderProps {
  attendance: AttendanceRes;
  buttonState: SmartButtonState;
  onCycleOption?: () => void;
}

/**
 * 출근기록 카드 헤더 컴포넌트
 * Single Responsibility: 출근 상태 및 시간 정보 표시
 */
export const AttendanceHeader: React.FC<AttendanceHeaderProps> = ({
  attendance,
  buttonState,
  onCycleOption,
}) => {
  const getCurrentStatusText = (): AttendanceStatus => {
    return attendance.status;
  };

  const getWorkDuration = () => {
    if (!attendance.actualStartTime) return null;

    const startTime = new Date(attendance.actualStartTime);
    const endTime = attendance.actualEndTime
      ? new Date(attendance.actualEndTime)
      : new Date();

    const diffMs = endTime.getTime() - startTime.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}시간 ${minutes}분`;
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray1 mb-4">
      {/* 상태 및 모드 표시 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <StatusBadge
            status={getCurrentStatusText()}
            statusKorean={attendance.statusKorean}
          />
        </div>

        {/* 타입 변경 버튼 (우측 상단) */}
        {onCycleOption && (
          <button
            onClick={onCycleOption}
            disabled={attendance.status === "COMPLETED"}
            className="px-3 py-2 text-sm rounded-lg font-medium text-white bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
          >
            {(() => {
              if (buttonState.action === "CLOCK_IN") {
                return buttonState.type === ClockInType.NORMAL ? "조기출근" : "정상출근";
              } else {
                if (buttonState.type === ClockOutType.NORMAL) return "조퇴";
                if (buttonState.type === ClockOutType.EARLY_DEPARTURE) return "연장근무";
                return "정상퇴근";
              }
            })()}
          </button>
        )}
      </div>

      {/* 현재 시간 */}
      <div className="mb-4">
        <RealTimeClock className="text-2xl font-bold text-main2" />
      </div>

      {/* 근무 일정 정보 */}
      <div className="mb-4">
        <WorkScheduleTime
          attendance={attendance}
          className="text-sm font-medium text-main2"
        />
      </div>

      {/* 근무 시간 */}
      {getWorkDuration() && (
        <div className="bg-gray1 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray4">총 근무 시간</span>
            <span className="text-lg font-bold text-main">
              {getWorkDuration()}
            </span>
          </div>
        </div>
      )}

    </div>
  );
};
