"use client";

import React, { useState } from "react";
import {
  useTodayAttendance,
  useClockIn,
  useClockOut,
  useRefreshAttendance,
} from "../../../work-attendance/lib/hooks/use-attendance";
import { attendanceApi } from "../../../work-attendance/lib/api/attendance.api";
import { ClockInType, ClockOutType } from "../../../work-attendance/lib/types";
import { testApis } from "../../lib/api";
import { createTestResult } from "../../lib/utils";
import { LoadingState } from "../../lib/types";

interface AttendanceTabProps {
  loading?: LoadingState;
  onLoadingChange?: (state: LoadingState) => void;
  onTestResult?: (result: any) => void;
}

export const AttendanceTab: React.FC<AttendanceTabProps> = ({
  loading,
  onLoadingChange,
  onTestResult,
}) => {
  const [testResult, setTestResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [attendanceId, setAttendanceId] = useState<number>(1);

  const {
    data: todayAttendance,
    isLoading: isLoadingToday,
    error,
  } = useTodayAttendance();
  const { refreshToday } = useRefreshAttendance();
  const clockInMutation = useClockIn();
  const clockOutMutation = useClockOut();

  const runTest = async (testName: string, testFn: () => Promise<any>) => {
    setIsLoading(true);
    try {
      const result = await testFn();
      setTestResult({
        success: true,
        testName,
        data: result,
        timestamp: new Date().toISOString(),
      });
      if (onTestResult) {
        onTestResult({
          success: true,
          testName,
          data: result,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      const errorResult = {
        success: false,
        testName,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      };
      setTestResult(errorResult);
      if (onTestResult) {
        onTestResult(errorResult);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const testGetTodayAttendance = () => {
    if (onLoadingChange) onLoadingChange("get-today-attendance");
    return runTest("오늘의 출근 기록 조회", async () => {
      const result = await testApis.attendance.getTodayAttendance();
      if (onLoadingChange) onLoadingChange(null);
      return result;
    });
  };

  const testCreateTodayAttendance = () => {
    if (onLoadingChange) onLoadingChange("create-today-attendance");
    return runTest("오늘의 출근 기록 생성", async () => {
      const result = await testApis.attendance.createTodayAttendance();
      if (onLoadingChange) onLoadingChange(null);
      return result;
    });
  };

  const testCreateDailyAttendance = () => {
    if (onLoadingChange) onLoadingChange("create-daily-attendance");
    return runTest("특정 날짜 출근 기록 생성", async () => {
      const result = await testApis.attendance.createDailyAttendance(
        selectedDate
      );
      if (onLoadingChange) onLoadingChange(null);
      return result;
    });
  };

  const testGetDailyAttendance = () => {
    if (onLoadingChange) onLoadingChange("fetch-daily-attendance");
    return runTest("일별 출근 현황 조회", async () => {
      const result = await testApis.attendance.getDailyAttendance(selectedDate);
      if (onLoadingChange) onLoadingChange(null);
      return result;
    });
  };

  const testGetActiveAttendance = () => {
    if (onLoadingChange) onLoadingChange("fetch-active-attendance");
    return runTest("진행중인 근무 조회", async () => {
      const result = await testApis.attendance.getActiveAttendance();
      if (onLoadingChange) onLoadingChange(null);
      return result;
    });
  };

  const testGetMonthlyStatistics = () => {
    if (onLoadingChange) onLoadingChange("fetch-monthly-statistics");
    const yearMonth = selectedDate.substring(0, 7);
    return runTest("월별 출근 통계 조회", async () => {
      const result = await testApis.attendance.getMonthlyStatistics(yearMonth);
      if (onLoadingChange) onLoadingChange(null);
      return result;
    });
  };

  const testClockIn = () => {
    if (!attendanceId) {
      setTestResult({
        success: false,
        testName: "출근 처리",
        error: "출근 기록 ID를 입력해주세요",
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (onLoadingChange) onLoadingChange("clock-in");
    return runTest("출근 처리", async () => {
      const result = await testApis.attendance.clockIn(attendanceId, {
        notes: "개발 테스트 출근",
        manualClockInType: ClockInType.NORMAL,
      });
      if (onLoadingChange) onLoadingChange(null);
      return result;
    });
  };

  const testClockOut = () => {
    if (!attendanceId) {
      setTestResult({
        success: false,
        testName: "퇴근 처리",
        error: "출근 기록 ID를 입력해주세요",
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (onLoadingChange) onLoadingChange("clock-out");
    return runTest("퇴근 처리", async () => {
      const result = await testApis.attendance.clockOut(attendanceId, {
        notes: "개발 테스트 퇴근",
        manualClockOutType: ClockOutType.NORMAL,
      });
      if (onLoadingChange) onLoadingChange(null);
      return result;
    });
  };

  const testConnectionCheck = () => {
    return runTest("API 연결 확인", () => attendanceApi.checkConnection());
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      await refreshToday();
      setTestResult({
        success: true,
        testName: "데이터 새로고침",
        data: "새로고침 완료",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      setTestResult({
        success: false,
        testName: "데이터 새로고침",
        error: error instanceof Error ? error.message : "새로고침 실패",
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="backdrop-blur-xl bg-gradient-to-br from-blue-50/80 to-cyan-50/80 border border-blue-200/50 rounded-2xl p-6 shadow-xl shadow-blue-500/10">
        <h4 className="text-xl font-bold text-blue-700 mb-4">🔧 테스트 설정</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              테스트 날짜
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-blue-200/50 bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              출근 기록 ID
            </label>
            <input
              type="number"
              value={attendanceId}
              onChange={(e) => setAttendanceId(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-blue-200/50 bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              placeholder="출근 기록 ID 입력"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">📊 출근기록 API 테스트</h3>

        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">현재 상태</h4>
          {isLoadingToday ? (
            <p className="text-blue-600">로딩 중...</p>
          ) : error ? (
            <p className="text-red-600">에러: {error.message}</p>
          ) : todayAttendance ? (
            <div className="space-y-2 text-sm">
              <p>
                <strong>ID:</strong> {todayAttendance.id}
              </p>
              <p>
                <strong>날짜:</strong> {todayAttendance.workDate}
              </p>
              <p>
                <strong>상태:</strong> {todayAttendance.statusKorean}
              </p>
              <p>
                <strong>예정 시간:</strong> {todayAttendance.scheduledStartTime}{" "}
                ~ {todayAttendance.scheduledEndTime}
              </p>
              {todayAttendance.actualStartTime && (
                <p>
                  <strong>실제 출근:</strong> {todayAttendance.actualStartTime}
                </p>
              )}
              {todayAttendance.actualEndTime && (
                <p>
                  <strong>실제 퇴근:</strong> {todayAttendance.actualEndTime}
                </p>
              )}
            </div>
          ) : (
            <p className="text-gray-600">오늘의 출근 기록이 없습니다</p>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          <button
            onClick={testConnectionCheck}
            disabled={isLoading || loading === "fetch-active-attendance"}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            연결 확인
          </button>

          <button
            onClick={testGetTodayAttendance}
            disabled={isLoading || loading === "get-today-attendance"}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50"
          >
            {loading === "get-today-attendance"
              ? "조회 중..."
              : "오늘 기록 조회"}
          </button>

          <button
            onClick={testCreateTodayAttendance}
            disabled={isLoading || loading === "create-today-attendance"}
            className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 disabled:opacity-50"
          >
            {loading === "create-today-attendance"
              ? "생성 중..."
              : "오늘 기록 생성"}
          </button>

          <button
            onClick={testCreateDailyAttendance}
            disabled={isLoading || loading === "create-daily-attendance"}
            className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 disabled:opacity-50"
          >
            {loading === "create-daily-attendance"
              ? "생성 중..."
              : "일별 기록 생성"}
          </button>

          <button
            onClick={testGetDailyAttendance}
            disabled={isLoading || loading === "fetch-daily-attendance"}
            className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 disabled:opacity-50"
          >
            {loading === "fetch-daily-attendance"
              ? "조회 중..."
              : "일별 현황 조회"}
          </button>

          <button
            onClick={testGetActiveAttendance}
            disabled={isLoading || loading === "fetch-active-attendance"}
            className="bg-cyan-500 text-white px-4 py-2 rounded-lg hover:bg-cyan-600 disabled:opacity-50"
          >
            {loading === "fetch-active-attendance"
              ? "조회 중..."
              : "진행중 근무"}
          </button>

          <button
            onClick={testGetMonthlyStatistics}
            disabled={isLoading || loading === "fetch-monthly-statistics"}
            className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 disabled:opacity-50"
          >
            {loading === "fetch-monthly-statistics"
              ? "조회 중..."
              : "월별 통계"}
          </button>

          <button
            onClick={testClockIn}
            disabled={isLoading || loading === "clock-in" || !attendanceId}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 disabled:opacity-50"
          >
            {loading === "clock-in" ? "출근 중..." : "출근 처리"}
          </button>

          <button
            onClick={testClockOut}
            disabled={isLoading || loading === "clock-out" || !attendanceId}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 disabled:opacity-50"
          >
            {loading === "clock-out" ? "퇴근 중..." : "퇴근 처리"}
          </button>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="w-full bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 disabled:opacity-50 mb-4"
        >
          새로고침
        </button>

        {isLoading && (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            <p className="text-sm text-gray-600 mt-2">테스트 실행 중...</p>
          </div>
        )}
      </div>

      {testResult && (
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h4 className="text-lg font-semibold mb-4">
            {testResult.success ? "✅" : "❌"} {testResult.testName}
          </h4>
          <div className="text-sm text-gray-600 mb-2">
            {testResult.timestamp}
          </div>
          {testResult.success ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <pre className="text-sm text-green-800 overflow-x-auto">
                {JSON.stringify(testResult.data, null, 2)}
              </pre>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">{testResult.error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
