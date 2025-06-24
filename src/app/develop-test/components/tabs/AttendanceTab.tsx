"use client";

import React, { useState } from "react";
import { testApis } from "../../lib/api";
import { createTestResult } from "../../lib/utils";
import {
  LoadingState,
  ClockInReq,
  ClockOutReq,
  AdditionalWorkCreateReq,
} from "../../lib/types";

interface AttendanceTabProps {
  loading: LoadingState;
  onLoadingChange: (state: LoadingState) => void;
  onTestResult: (result: any) => void;
}

export const AttendanceTab: React.FC<AttendanceTabProps> = ({
  loading,
  onLoadingChange,
  onTestResult,
}) => {
  // 디버깅: 컴포넌트 렌더링 확인
  console.log("🎯 AttendanceTab 렌더링됨");

  const [attendanceId, setAttendanceId] = useState("1");
  const [queryDate, setQueryDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [workplaceId, setWorkplaceId] = useState("1");
  const [yearMonth, setYearMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  const [clockInData, setClockInData] = useState<ClockInReq>({
    actualTime: "09:00", // 기본값 설정
    notes: "",
  });

  // 디버깅용 로그 추가
  console.log("🔍 AttendanceTab State Debug:", {
    clockInData,
    attendanceId,
  });

  const [clockOutData, setClockOutData] = useState<ClockOutReq>({
    actualTime: "18:00", // 기본값 설정
    notes: "",
  });

  const [additionalWorkData, setAdditionalWorkData] =
    useState<AdditionalWorkCreateReq>({
      workDate: new Date().toISOString().split("T")[0],
      workplaceId: 1,
      startTime: "19:00",
      endTime: "22:00",
      notes: "",
    });

  // 오늘 출근 기록 생성
  const handleCreateTodayAttendance = async () => {
    onLoadingChange("create-today-attendance");
    try {
      const response = await testApis.attendance.createTodayAttendance();
      onTestResult(createTestResult("/api/attendance/today", "POST", response));
    } catch (error) {
      onTestResult(
        createTestResult("/api/attendance/today", "POST", null, error)
      );
    } finally {
      onLoadingChange(null);
    }
  };

  // 특정 날짜 출근 기록 생성
  const handleCreateDailyAttendance = async () => {
    onLoadingChange("create-daily-attendance");
    try {
      const response = await testApis.attendance.createDailyAttendance(
        queryDate
      );
      onTestResult(
        createTestResult(`/api/attendance/date/${queryDate}`, "POST", response)
      );
    } catch (error) {
      onTestResult(
        createTestResult(
          `/api/attendance/date/${queryDate}`,
          "POST",
          null,
          error
        )
      );
    } finally {
      onLoadingChange(null);
    }
  };

  // 출근 처리
  const handleClockIn = async () => {
    onLoadingChange("clock-in");
    try {
      const data = {
        actualTime: clockInData.actualTime || undefined,
        notes: clockInData.notes || undefined,
      };
      const response = await testApis.attendance.clockIn(
        parseInt(attendanceId),
        data
      );
      onTestResult(
        createTestResult(
          `/api/attendance/${attendanceId}/clock-in`,
          "POST",
          response
        )
      );
    } catch (error) {
      onTestResult(
        createTestResult(
          `/api/attendance/${attendanceId}/clock-in`,
          "POST",
          null,
          error
        )
      );
    } finally {
      onLoadingChange(null);
    }
  };

  // 퇴근 처리
  const handleClockOut = async () => {
    onLoadingChange("clock-out");
    try {
      const data = {
        actualTime: clockOutData.actualTime || undefined,
        notes: clockOutData.notes || undefined,
      };
      const response = await testApis.attendance.clockOut(
        parseInt(attendanceId),
        data
      );
      onTestResult(
        createTestResult(
          `/api/attendance/${attendanceId}/clock-out`,
          "POST",
          response
        )
      );
    } catch (error) {
      onTestResult(
        createTestResult(
          `/api/attendance/${attendanceId}/clock-out`,
          "POST",
          null,
          error
        )
      );
    } finally {
      onLoadingChange(null);
    }
  };

  // 추가 근무 등록
  const handleCreateAdditionalWork = async () => {
    onLoadingChange("create-additional-work");
    try {
      const response = await testApis.attendance.createAdditionalWork(
        additionalWorkData
      );
      onTestResult(
        createTestResult("/api/attendance/additional-work", "POST", response)
      );
    } catch (error) {
      onTestResult(
        createTestResult("/api/attendance/additional-work", "POST", null, error)
      );
    } finally {
      onLoadingChange(null);
    }
  };

  // 일별 출근 현황 조회
  const handleGetDailyAttendance = async () => {
    onLoadingChange("fetch-daily-attendance");
    try {
      const response = await testApis.attendance.getDailyAttendance(queryDate);
      onTestResult(
        createTestResult(`/api/attendance/daily/${queryDate}`, "GET", response)
      );
    } catch (error) {
      onTestResult(
        createTestResult(
          `/api/attendance/daily/${queryDate}`,
          "GET",
          null,
          error
        )
      );
    } finally {
      onLoadingChange(null);
    }
  };

  // 진행중인 근무 조회
  const handleGetActiveAttendance = async () => {
    onLoadingChange("fetch-active-attendance");
    try {
      const response = await testApis.attendance.getActiveAttendance();
      onTestResult(createTestResult("/api/attendance/active", "GET", response));
    } catch (error) {
      onTestResult(
        createTestResult("/api/attendance/active", "GET", null, error)
      );
    } finally {
      onLoadingChange(null);
    }
  };

  // 월별 통계 조회
  const handleGetMonthlyStatistics = async () => {
    onLoadingChange("fetch-monthly-statistics");
    try {
      const response = await testApis.attendance.getMonthlyStatistics(
        yearMonth
      );
      onTestResult(
        createTestResult(
          `/api/attendance/statistics/${yearMonth}`,
          "GET",
          response
        )
      );
    } catch (error) {
      onTestResult(
        createTestResult(
          `/api/attendance/statistics/${yearMonth}`,
          "GET",
          null,
          error
        )
      );
    } finally {
      onLoadingChange(null);
    }
  };

  // 사업장 일별 출근 현황 조회
  const handleGetWorkplaceDailyAttendance = async () => {
    onLoadingChange("fetch-workplace-daily-attendance");
    try {
      const response = await testApis.attendance.getWorkplaceDailyAttendance(
        parseInt(workplaceId),
        queryDate
      );
      onTestResult(
        createTestResult(
          `/api/attendance/workplace/${workplaceId}/daily/${queryDate}`,
          "GET",
          response
        )
      );
    } catch (error) {
      onTestResult(
        createTestResult(
          `/api/attendance/workplace/${workplaceId}/daily/${queryDate}`,
          "GET",
          null,
          error
        )
      );
    } finally {
      onLoadingChange(null);
    }
  };

  // 추가 근무 삭제
  const handleDeleteAdditionalWork = async () => {
    onLoadingChange("delete-additional-work");
    try {
      const response = await testApis.attendance.deleteAdditionalWork(
        parseInt(attendanceId)
      );
      onTestResult(
        createTestResult(
          `/api/attendance/${attendanceId}/additional-work`,
          "DELETE",
          response
        )
      );
    } catch (error) {
      onTestResult(
        createTestResult(
          `/api/attendance/${attendanceId}/additional-work`,
          "DELETE",
          null,
          error
        )
      );
    } finally {
      onLoadingChange(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          🕐 출근 관리 API 테스트
        </h2>
        <p className="text-gray-600">
          아르바이트생 출근/퇴근 관리 시스템을 테스트하세요
        </p>
      </div>

      {/* 출근 기록 생성 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <span className="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center text-sm mr-3">
            📝
          </span>
          출근 기록 생성
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <button
              onClick={handleCreateTodayAttendance}
              disabled={loading === "create-today-attendance"}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {loading === "create-today-attendance"
                ? "생성 중..."
                : "오늘 출근 기록 생성"}
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="date"
                value={queryDate}
                onChange={(e) => setQueryDate(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
              <button
                onClick={handleCreateDailyAttendance}
                disabled={loading === "create-daily-attendance"}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {loading === "create-daily-attendance"
                  ? "생성 중..."
                  : "특정일 생성"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 출근/퇴근 처리 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-sm mr-3">
            ⏰
          </span>
          출근/퇴근 처리
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              출근 기록 ID
            </label>
            <input
              type="number"
              value={attendanceId}
              onChange={(e) => setAttendanceId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="출근 기록 ID"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">출근 처리</h4>
              <input
                type="time"
                value={clockInData.actualTime}
                onChange={(e) => {
                  console.log("🔍 ClockIn Time Change:", e.target.value);
                  setClockInData({
                    ...clockInData,
                    actualTime: e.target.value,
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="실제 출근 시간"
              />
              <input
                type="text"
                value={clockInData.notes || ""}
                onChange={(e) => {
                  console.log("🔍 ClockIn Notes Change:", e.target.value);
                  setClockInData({ ...clockInData, notes: e.target.value });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="메모"
              />
              <button
                onClick={handleClockIn}
                disabled={loading === "clock-in"}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading === "clock-in" ? "처리 중..." : "출근 처리"}
              </button>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">퇴근 처리</h4>
              <input
                type="time"
                value={clockOutData.actualTime}
                onChange={(e) => {
                  console.log("🔍 ClockOut Time Change:", e.target.value);
                  setClockOutData({
                    ...clockOutData,
                    actualTime: e.target.value,
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="실제 퇴근 시간"
              />
              <input
                type="text"
                value={clockOutData.notes || ""}
                onChange={(e) => {
                  console.log("🔍 ClockOut Notes Change:", e.target.value);
                  setClockOutData({ ...clockOutData, notes: e.target.value });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="메모"
              />
              <button
                onClick={handleClockOut}
                disabled={loading === "clock-out"}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {loading === "clock-out" ? "처리 중..." : "퇴근 처리"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 추가 근무 등록 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <span className="w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center text-sm mr-3">
            ➕
          </span>
          추가 근무 등록
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="date"
            value={additionalWorkData.workDate}
            onChange={(e) =>
              setAdditionalWorkData({
                ...additionalWorkData,
                workDate: e.target.value,
              })
            }
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            placeholder="근무 날짜"
          />
          <input
            type="number"
            value={additionalWorkData.workplaceId}
            onChange={(e) =>
              setAdditionalWorkData({
                ...additionalWorkData,
                workplaceId: parseInt(e.target.value),
              })
            }
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            placeholder="사업장 ID"
          />
          <input
            type="time"
            value={additionalWorkData.startTime}
            onChange={(e) =>
              setAdditionalWorkData({
                ...additionalWorkData,
                startTime: e.target.value,
              })
            }
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            placeholder="시작 시간"
          />
          <input
            type="time"
            value={additionalWorkData.endTime}
            onChange={(e) =>
              setAdditionalWorkData({
                ...additionalWorkData,
                endTime: e.target.value,
              })
            }
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            placeholder="종료 시간"
          />
          <div className="md:col-span-2">
            <button
              onClick={handleCreateAdditionalWork}
              disabled={loading === "create-additional-work"}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
              {loading === "create-additional-work"
                ? "등록 중..."
                : "추가 근무 등록"}
            </button>
          </div>
        </div>
      </div>

      {/* 조회 기능들 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <span className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-sm mr-3">
            📊
          </span>
          출근 현황 조회
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex gap-2">
            <input
              type="date"
              value={queryDate}
              onChange={(e) => setQueryDate(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleGetDailyAttendance}
              disabled={loading === "fetch-daily-attendance"}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              일별 조회
            </button>
          </div>

          <button
            onClick={handleGetActiveAttendance}
            disabled={loading === "fetch-active-attendance"}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            진행중인 근무
          </button>

          <div className="flex gap-2">
            <input
              type="month"
              value={yearMonth}
              onChange={(e) => setYearMonth(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleGetMonthlyStatistics}
              disabled={loading === "fetch-monthly-statistics"}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              월별 통계
            </button>
          </div>

          <div className="flex gap-2">
            <input
              type="number"
              value={workplaceId}
              onChange={(e) => setWorkplaceId(e.target.value)}
              className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="사업장ID"
            />
            <button
              onClick={handleGetWorkplaceDailyAttendance}
              disabled={loading === "fetch-workplace-daily-attendance"}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              사업장 현황
            </button>
          </div>

          <button
            onClick={handleDeleteAdditionalWork}
            disabled={loading === "delete-additional-work"}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            추가 근무 삭제
          </button>
        </div>
      </div>
    </div>
  );
};
