/* eslint-disable */
// @ts-nocheck
// Legacy develop-test file - excluded from strict type checks
"use client";

import React, { useState } from "react";
import {
  useAttendanceData,
  useCurrentTime,
} from "../../../attendance/lib/hooks";
import {
  getAttendanceRecords,
  clockIn,
  clockOut,
  createTodayAttendance,
} from "../../../attendance/lib/api";
import { WorkType } from "../../../attendance/lib/types";
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

  const today = new Date().toISOString().split("T")[0];
  const {
    attendanceRecords: todayAttendance,
    loading: isLoadingToday,
    error,
    refetch: refreshToday,
    handleClockIn,
    handleClockOut,
  } = useAttendanceData(today);

  const { currentTime, formattedTime } = useCurrentTime();

  const runTest = async (testName: string, testFn: () => Promise<any>) => {
    setIsLoading(true);
    try {
      const result = await testFn();
      const successResult = {
        success: true,
        testName,
        data: result,
        timestamp: new Date().toISOString(),
      };
      setTestResult(successResult);
      if (onTestResult) {
        onTestResult(successResult);
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
      const result = await getAttendanceRecords(today);
      if (onLoadingChange) onLoadingChange(null);
      return result;
    });
  };

  const testCreateTodayAttendance = () => {
    if (onLoadingChange) onLoadingChange("create-today-attendance");
    return runTest("오늘의 출근 기록 생성", async () => {
      const result = await createTodayAttendance();
      if (onLoadingChange) onLoadingChange(null);
      return result;
    });
  };

  const testGetDailyAttendance = () => {
    if (onLoadingChange) onLoadingChange("fetch-daily-attendance");
    return runTest("일별 출근 현황 조회", async () => {
      const result = await getAttendanceRecords(selectedDate);
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
      const result = await clockIn({
        attendanceId,
        actualTime: formattedTime,
        notes: "개발 테스트 출근",
        manualClockInType: WorkType.NORMAL,
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
      const result = await clockOut({
        attendanceId,
        actualTime: formattedTime,
        notes: "개발 테스트 퇴근",
        manualClockOutType: WorkType.NORMAL,
      });
      if (onLoadingChange) onLoadingChange(null);
      return result;
    });
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
      {/* 현재 시간 표시 */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">현재 상태</h3>
        <p className="text-sm text-gray-600">현재 시간: {formattedTime}</p>
        <p className="text-sm text-gray-600">선택된 날짜: {selectedDate}</p>
      </div>

      {/* 날짜 선택 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          테스트할 날짜
        </label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {/* 출근 기록 ID 입력 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          출근 기록 ID
        </label>
        <input
          type="number"
          value={attendanceId}
          onChange={(e) => setAttendanceId(Number(e.target.value))}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="출근 기록 ID를 입력하세요"
        />
      </div>

      {/* 테스트 버튼들 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={testGetTodayAttendance}
          disabled={isLoading || loading === "get-today-attendance"}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading === "get-today-attendance"
            ? "로딩중..."
            : "오늘 출근 기록 조회"}
        </button>

        <button
          onClick={testCreateTodayAttendance}
          disabled={isLoading || loading === "create-today-attendance"}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          {loading === "create-today-attendance"
            ? "로딩중..."
            : "오늘 출근 기록 생성"}
        </button>

        <button
          onClick={testGetDailyAttendance}
          disabled={isLoading || loading === "fetch-daily-attendance"}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
        >
          {loading === "fetch-daily-attendance"
            ? "로딩중..."
            : "일별 출근 현황 조회"}
        </button>

        <button
          onClick={testClockIn}
          disabled={isLoading || loading === "clock-in"}
          className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
        >
          {loading === "clock-in" ? "로딩중..." : "출근 처리"}
        </button>

        <button
          onClick={testClockOut}
          disabled={isLoading || loading === "clock-out"}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
        >
          {loading === "clock-out" ? "로딩중..." : "퇴근 처리"}
        </button>

        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
        >
          {isLoading ? "로딩중..." : "데이터 새로고침"}
        </button>
      </div>

      {/* 현재 로딩 상태 표시 */}
      {loading && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <p className="text-blue-800 text-sm">현재 실행 중: {loading}</p>
        </div>
      )}

      {/* 오늘의 출근 기록 표시 */}
      {todayAttendance && todayAttendance.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">오늘의 출근 기록</h3>
          <div className="space-y-2">
            {todayAttendance.map((record, index) => (
              <div key={record.id} className="p-3 bg-gray-50 rounded">
                <p className="text-sm">
                  <strong>#{record.id}</strong> -{" "}
                  {record.workplaceName || "직장"}
                </p>
                <p className="text-sm text-gray-600">
                  예정: {record.scheduledStartTime} ~ {record.scheduledEndTime}
                </p>
                {record.actualStartTime && (
                  <p className="text-sm text-gray-600">
                    실제: {record.actualStartTime} ~{" "}
                    {record.actualEndTime || "진행중"}
                  </p>
                )}
                <p className="text-sm">
                  상태:{" "}
                  <span className="font-medium">
                    {record.statusKorean || record.status}
                  </span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 테스트 결과 표시 */}
      {testResult && (
        <div
          className={`border rounded-lg p-4 ${
            testResult.success
              ? "bg-green-50 border-green-200"
              : "bg-red-50 border-red-200"
          }`}
        >
          <h3 className="text-lg font-semibold mb-2">
            {testResult.success ? "✅" : "❌"} {testResult.testName}
          </h3>
          {testResult.success ? (
            <div>
              <p className="text-sm text-green-700 mb-2">테스트 성공!</p>
              {testResult.data && (
                <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-40">
                  {JSON.stringify(testResult.data, null, 2)}
                </pre>
              )}
            </div>
          ) : (
            <div>
              <p className="text-sm text-red-700">오류: {testResult.error}</p>
            </div>
          )}
          <p className="text-xs text-gray-500 mt-2">
            실행 시간: {new Date(testResult.timestamp).toLocaleTimeString()}
          </p>
        </div>
      )}

      {/* 에러 표시 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800 text-sm">에러: {error}</p>
        </div>
      )}
    </div>
  );
};
