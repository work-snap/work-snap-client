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

  const getStatusMessage = (): string => {
    switch (attendance.status) {
      case AttendanceStatus.SCHEDULED:
        return "출근 대기 중입니다";
      case AttendanceStatus.IN_PROGRESS:
        return "근무 중입니다";
      case AttendanceStatus.COMPLETED:
        return "오늘 근무가 완료되었습니다";
      default:
        return "상태를 확인할 수 없습니다";
    }
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
    <div className={`rounded-2xl p-6 shadow-sm border mb-4 ${
      attendance.status === AttendanceStatus.SCHEDULED 
        ? "bg-orange-50 border-orange-200" 
        : attendance.status === AttendanceStatus.IN_PROGRESS 
        ? "bg-blue-50 border-blue-200" 
        : "bg-green-50 border-green-200"
    }`}>
      {/* 상태 메시지 */}
      <div className="mb-4">
        <div className="flex items-center mb-2">
          <span className="text-lg mr-2">
            {attendance.status === AttendanceStatus.SCHEDULED 
              ? "⏰" 
              : attendance.status === AttendanceStatus.IN_PROGRESS 
              ? "🔄" 
              : "✅"}
          </span>
          <span className={`text-sm font-medium ${
            attendance.status === AttendanceStatus.SCHEDULED 
              ? "text-orange-700" 
              : attendance.status === AttendanceStatus.IN_PROGRESS 
              ? "text-blue-700" 
              : "text-green-700"
          }`}>
            {getStatusMessage()}
          </span>
        </div>
      </div>

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
            className="px-3 py-2 text-sm rounded-lg font-medium text-white bg-main hover:bg-main2 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
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
        <div className="flex items-center mb-2">
          <span className="text-sm text-gray-600 mr-2">현재 시간</span>
        </div>
        <RealTimeClock className="text-2xl font-bold text-main2" />
      </div>

      {/* 근무 일정 정보 */}
      <div className="mb-4">
        <div className="flex items-center mb-2">
          <span className="text-sm text-gray-600 mr-2">근무 일정</span>
        </div>
        <WorkScheduleTime
          attendance={attendance}
          className="text-sm font-medium text-main2"
        />
      </div>

      {/* 근무 시간 */}
      {getWorkDuration() && (
        <div className={`rounded-lg p-3 ${
          attendance.status === AttendanceStatus.IN_PROGRESS 
            ? "bg-blue-100 border border-blue-200" 
            : "bg-green-100 border border-green-200"
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">총 근무 시간</span>
            <span className={`text-lg font-bold ${
              attendance.status === AttendanceStatus.IN_PROGRESS 
                ? "text-blue-700" 
                : "text-green-700"
            }`}>
              {getWorkDuration()}
            </span>
          </div>
        </div>
      )}

    </div>
  );
};
