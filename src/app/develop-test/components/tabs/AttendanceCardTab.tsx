"use client";

import React, { useState, useEffect } from "react";
import { testApis } from "../../lib/api";
import { createTestResult } from "../../lib/utils";
import { LoadingState } from "../../lib/types";

interface AttendanceCardTabProps {
  loading: LoadingState;
  onLoadingChange: (state: LoadingState) => void;
  onTestResult: (result: any) => void;
}

interface WorkScheduleCard {
  id: number;
  workplaceName: string;
  scheduledStartTime: string;
  scheduledEndTime: string;
  actualStartTime?: string;
  actualEndTime?: string;
  workDate: string;
  status:
    | "scheduled"
    | "in_progress"
    | "completed"
    | "early_arrival"
    | "overtime";
  currentTime: string;
}

export const AttendanceCardTab: React.FC<AttendanceCardTabProps> = ({
  loading,
  onLoadingChange,
  onTestResult,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [workSchedules, setWorkSchedules] = useState<WorkScheduleCard[]>([
    {
      id: 1,
      workplaceName: "스타벅스 해운대점",
      scheduledStartTime: "09:00",
      scheduledEndTime: "15:00",
      workDate: new Date().toISOString().split("T")[0],
      status: "scheduled",
      currentTime: "8:58",
    },
    {
      id: 2,
      workplaceName: "메가커피 해운대점",
      scheduledStartTime: "22:00",
      scheduledEndTime: "02:00",
      workDate: new Date().toISOString().split("T")[0],
      status: "scheduled",
      currentTime: "8:58",
    },
  ]);

  // 현재 시간 업데이트
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      const timeString = now.toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

      setWorkSchedules((prev) =>
        prev.map((schedule) => ({
          ...schedule,
          currentTime: timeString,
        }))
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handlePrevDay = () => {
    const prevDay = new Date(currentDate);
    prevDay.setDate(prevDay.getDate() - 1);
    setCurrentDate(prevDay);
  };

  const handleNextDay = () => {
    const nextDay = new Date(currentDate);
    nextDay.setDate(nextDay.getDate() + 1);
    setCurrentDate(nextDay);
  };

  const handleClockIn = async (scheduleId: number) => {
    onLoadingChange("clock-in");
    try {
      const actualTime = currentTime.toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

      // 실제 API 호출
      const response = await testApis.attendance.clockIn(scheduleId, {
        actualTime,
        notes: "모바일 출근",
      });

      // UI 상태 업데이트
      setWorkSchedules((prev) =>
        prev.map((schedule) =>
          schedule.id === scheduleId
            ? {
                ...schedule,
                actualStartTime: actualTime,
                status: "in_progress" as const,
              }
            : schedule
        )
      );

      onTestResult(
        createTestResult(
          `/api/attendance/${scheduleId}/clock-in`,
          "POST",
          response
        )
      );
    } catch (error) {
      onTestResult(
        createTestResult(
          `/api/attendance/${scheduleId}/clock-in`,
          "POST",
          null,
          error
        )
      );
    } finally {
      onLoadingChange(null);
    }
  };

  const handleClockOut = async (scheduleId: number) => {
    onLoadingChange("clock-out");
    try {
      const actualTime = currentTime.toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

      // 실제 API 호출
      const response = await testApis.attendance.clockOut(scheduleId, {
        actualTime,
        notes: "모바일 퇴근",
      });

      // UI 상태 업데이트
      setWorkSchedules((prev) =>
        prev.map((schedule) =>
          schedule.id === scheduleId
            ? {
                ...schedule,
                actualEndTime: actualTime,
                status: "completed" as const,
              }
            : schedule
        )
      );

      onTestResult(
        createTestResult(
          `/api/attendance/${scheduleId}/clock-out`,
          "POST",
          response
        )
      );
    } catch (error) {
      onTestResult(
        createTestResult(
          `/api/attendance/${scheduleId}/clock-out`,
          "POST",
          null,
          error
        )
      );
    } finally {
      onLoadingChange(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "early_arrival":
        return "bg-blue-50 text-blue-600 border-blue-200";
      case "in_progress":
        return "bg-green-50 text-green-600 border-green-200";
      case "completed":
        return "bg-gray-50 text-gray-600 border-gray-200";
      case "overtime":
        return "bg-orange-50 text-orange-600 border-orange-200";
      default:
        return "bg-orange-50 text-orange-600 border-orange-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "early_arrival":
        return "조기출근";
      case "in_progress":
        return "연장근무";
      case "completed":
        return "업무종료";
      case "overtime":
        return "연장근무";
      default:
        return "조기출근";
    }
  };

  const WorkScheduleCard: React.FC<{ schedule: WorkScheduleCard }> = ({
    schedule,
  }) => {
    const isInProgress = schedule.status === "in_progress";
    const isCompleted = schedule.status === "completed";

    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {schedule.workplaceName}
          </h3>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
              schedule.status
            )}`}
          >
            {getStatusText(schedule.status)}
          </span>
        </div>

        <div className="flex items-center justify-center mb-4">
          <div className="flex items-center space-x-2 text-gray-600">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm">
              {isInProgress ? "업무 진행 중입니다." : "아직 출근 전입니다."}
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1">
              {formatDate(currentDate).split(" ")[1]}{" "}
              {formatDate(currentDate).split(" ")[2]}
            </div>
            <div className="text-4xl font-bold text-gray-900">
              {schedule.actualStartTime || schedule.scheduledStartTime}
            </div>
            <div className="text-sm text-gray-500">
              현재시각 {schedule.currentTime}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-2xl">⋯</span>
          </div>

          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1">
              {schedule.scheduledEndTime.startsWith("0")
                ? `${formatDate(currentDate).split(" ")[1]} ${
                    parseInt(formatDate(currentDate).split(" ")[2]) + 1
                  }일`
                : `${formatDate(currentDate).split(" ")[1]} ${
                    formatDate(currentDate).split(" ")[2]
                  }`}
            </div>
            <div className="text-4xl font-bold text-gray-900">
              {schedule.actualEndTime || schedule.scheduledEndTime}
            </div>
            {isInProgress && (
              <div className="text-sm text-green-600">연장근무 15:25</div>
            )}
          </div>
        </div>

        {!isCompleted ? (
          <button
            onClick={() =>
              isInProgress
                ? handleClockOut(schedule.id)
                : handleClockIn(schedule.id)
            }
            disabled={loading === "clock-in" || loading === "clock-out"}
            className={`w-full py-3 rounded-xl font-medium transition-colors ${
              isInProgress
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-orange-500 hover:bg-orange-600 text-white"
            } disabled:opacity-50`}
          >
            {loading === "clock-in" || loading === "clock-out"
              ? "처리 중..."
              : isInProgress
              ? "퇴근하기"
              : "출근하기"}
          </button>
        ) : (
          <div className="w-full py-3 bg-gray-100 text-gray-600 rounded-xl text-center font-medium">
            업무종료
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen">
      {/* 헤더 */}
      <div className="bg-white p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-orange-500">Work Snap</h1>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">SOO</span>
            <span className="bg-gray-900 text-white text-xs px-2 py-1 rounded">
              알바생
            </span>
          </div>
        </div>

        {/* 날짜 네비게이션 */}
        <div className="bg-orange-500 text-white rounded-2xl p-4 flex items-center justify-between">
          <button
            onClick={handlePrevDay}
            className="p-2 hover:bg-orange-600 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          <h2 className="text-lg font-semibold">{formatDate(currentDate)}</h2>

          <button
            onClick={handleNextDay}
            className="p-2 hover:bg-orange-600 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* 근무 스케줄 카드들 */}
      <div className="p-4 space-y-4">
        {workSchedules.map((schedule) => (
          <WorkScheduleCard key={schedule.id} schedule={schedule} />
        ))}
      </div>

      {/* 추가 근무 버튼 */}
      <div className="p-4">
        <button
          onClick={() => {
            // 추가 근무 등록 기능
            onTestResult(
              createTestResult("/api/attendance/additional-work", "POST", {
                message: "추가 근무 등록 기능 (구현 예정)",
              })
            );
          }}
          className="w-full bg-gray-200 text-gray-600 py-4 rounded-2xl font-medium flex items-center justify-center space-x-2 hover:bg-gray-300 transition-colors"
        >
          <span>추가근무</span>
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};
