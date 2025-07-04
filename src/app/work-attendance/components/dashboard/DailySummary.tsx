"use client";

import React from "react";
import { DailyAttendanceRes } from "../../lib/types";

interface DailySummaryProps {
  dailyAttendance: DailyAttendanceRes;
  targetDate: string;
  className?: string;
}

/**
 * DailySummary - 일별 출근 요약 정보 컴포넌트
 * 
 * Features:
 * - 일별 출근 통계 표시
 * - 진행 중인 근무 표시
 * - 추가 근무 개수 표시
 * - 날짜별 포맷팅
 */
export const DailySummary: React.FC<DailySummaryProps> = ({
  dailyAttendance,
  targetDate,
  className = "",
}) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (dateStr === today.toISOString().split("T")[0]) {
      return "오늘";
    } else if (dateStr === tomorrow.toISOString().split("T")[0]) {
      return "내일";
    } else {
      return date.toLocaleDateString("ko-KR", {
        month: "long",
        day: "numeric",
        weekday: "short",
      });
    }
  };

  const getProgressPercentage = () => {
    if (dailyAttendance.totalCount === 0) return 0;
    return Math.round((dailyAttendance.completedCount / dailyAttendance.totalCount) * 100);
  };

  return (
    <div className={`bg-blue-50 rounded-2xl p-4 border border-blue-200 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-blue-800">
          📅 {formatDate(targetDate)} 근무 현황
        </h2>
        <div className="text-sm text-blue-600">
          {getProgressPercentage()}% 완료
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="w-full bg-blue-200 rounded-full h-2 mb-4">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${getProgressPercentage()}%` }}
        />
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-2 gap-4 mb-3">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-700">
            {dailyAttendance.totalCount}
          </div>
          <div className="text-sm text-blue-600">전체 일정</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {dailyAttendance.completedCount}
          </div>
          <div className="text-sm text-green-600">완료</div>
        </div>
      </div>

      {/* Status Indicators */}
      <div className="space-y-2">
        {dailyAttendance.inProgressCount > 0 && (
          <div className="p-2 bg-blue-100 rounded-lg">
            <div className="text-sm text-blue-700 text-center flex items-center justify-center">
              <span className="mr-2">🔄</span>
              진행 중인 근무: {dailyAttendance.inProgressCount}개
            </div>
          </div>
        )}

        {dailyAttendance.additionalWorkCount > 0 && (
          <div className="p-2 bg-purple-100 rounded-lg">
            <div className="text-sm text-purple-700 text-center flex items-center justify-center">
              <span className="mr-2">⚡</span>
              추가 근무: {dailyAttendance.additionalWorkCount}개
            </div>
          </div>
        )}

        {dailyAttendance.totalCount > 0 && dailyAttendance.completedCount === dailyAttendance.totalCount && (
          <div className="p-2 bg-green-100 rounded-lg">
            <div className="text-sm text-green-700 text-center flex items-center justify-center">
              <span className="mr-2">✅</span>
              모든 근무가 완료되었습니다
            </div>
          </div>
        )}
      </div>
    </div>
  );
};