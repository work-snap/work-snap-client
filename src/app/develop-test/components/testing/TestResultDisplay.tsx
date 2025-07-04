"use client";

import React, { useState } from "react";
import { StatusDisplay, AttendanceStatusPresets } from "../../../work-attendance/components/base";

// Test result types
export type TestResultType = "success" | "error" | "warning" | "info";

// Test result interface
export interface TestResult {
  id: string;
  timestamp: Date;
  type: TestResultType;
  title: string;
  message?: string;
  data?: any;
  duration?: number;
  statusCode?: number;
  endpoint?: string;
  method?: string;
}

// Test result display props
export interface TestResultDisplayProps {
  result: TestResult;
  onClear?: (id: string) => void;
  className?: string;
}

/**
 * TestResultDisplay - 테스트 결과를 표시하는 재사용 가능한 컴포넌트
 * 
 * Features:
 * - 다양한 결과 타입 지원
 * - JSON 데이터 포맷팅
 * - 확장/축소 가능한 인터페이스
 * - 복사 기능
 * - 시간 및 성능 정보
 */
export const TestResultDisplay: React.FC<TestResultDisplayProps> = ({
  result,
  onClear,
  className = "",
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const { id, timestamp, type, title, message, data, duration, statusCode, endpoint, method } = result;

  // 결과 타입별 스타일 결정
  const getResultStyle = () => {
    const styleMap = {
      success: "border-green-200 bg-green-50",
      error: "border-red-200 bg-red-50",
      warning: "border-yellow-200 bg-yellow-50",
      info: "border-blue-200 bg-blue-50",
    };
    return styleMap[type];
  };

  // 상태 표시 생성
  const getStatusDisplay = () => {
    const statusMap = {
      success: AttendanceStatusPresets.success(statusCode ? `${statusCode}` : "성공"),
      error: AttendanceStatusPresets.error(statusCode ? `${statusCode}` : "실패"),
      warning: AttendanceStatusPresets.warning(statusCode ? `${statusCode}` : "경고"),
      info: AttendanceStatusPresets.info(statusCode ? `${statusCode}` : "정보"),
    };
    return statusMap[type];
  };

  // 데이터 복사
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  // JSON 데이터 포맷팅
  const formatData = (data: any) => {
    if (!data) return null;
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  };

  // 시간 포맷팅
  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString("ko-KR", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit", 
      second: "2-digit",
    });
  };

  return (
    <div className={`border rounded-lg p-4 ${getResultStyle()} ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <StatusDisplay statusState={getStatusDisplay()} />
            <span className="text-sm text-gray-600">
              {formatTimestamp(timestamp)}
            </span>
            {duration && (
              <span className="text-xs text-gray-500">
                ({duration}ms)
              </span>
            )}
          </div>
          
          <h4 className="font-semibold text-gray-900">{title}</h4>
          
          {message && (
            <p className="text-sm text-gray-700 mt-1">{message}</p>
          )}
          
          {/* Request Info */}
          {(method || endpoint) && (
            <div className="mt-2 text-xs text-gray-600">
              {method && (
                <span className={`font-mono font-bold ${getMethodColor(method)}`}>
                  {method.toUpperCase()}
                </span>
              )}
              {endpoint && (
                <span className="font-mono ml-2">{endpoint}</span>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          {data && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              title="데이터 보기"
            >
              {isExpanded ? "접기" : "펼치기"}
            </button>
          )}
          
          {onClear && (
            <button
              onClick={() => onClear(id)}
              className="text-xs px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors text-red-600"
              title="결과 삭제"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Expanded Data */}
      {isExpanded && data && (
        <div className="mt-4 border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between mb-2">
            <h5 className="text-sm font-medium text-gray-700">응답 데이터</h5>
            <button
              onClick={() => copyToClipboard(formatData(data) || "")}
              className={`text-xs px-2 py-1 rounded transition-colors ${
                isCopied 
                  ? "bg-green-100 text-green-700" 
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {isCopied ? "복사됨!" : "복사"}
            </button>
          </div>
          
          <pre className="bg-gray-900 text-green-400 text-xs p-3 rounded overflow-x-auto max-h-64 overflow-y-auto">
            {formatData(data)}
          </pre>
        </div>
      )}
    </div>
  );

  function getMethodColor(method: string) {
    const colorMap: Record<string, string> = {
      GET: "text-blue-600",
      POST: "text-green-600",
      PUT: "text-orange-600",
      DELETE: "text-red-600",
      PATCH: "text-purple-600",
    };
    return colorMap[method.toUpperCase()] || "text-gray-600";
  }
};

/**
 * TestResultList - 테스트 결과 목록을 표시하는 컴포넌트
 */
export interface TestResultListProps {
  results: TestResult[];
  onClearResult?: (id: string) => void;
  onClearAll?: () => void;
  maxResults?: number;
  className?: string;
}

export const TestResultList: React.FC<TestResultListProps> = ({
  results,
  onClearResult,
  onClearAll,
  maxResults = 50,
  className = "",
}) => {
  // 최신 결과부터 표시
  const displayResults = results
    .slice()
    .reverse()
    .slice(0, maxResults);

  // 결과 통계
  const getResultStats = () => {
    const stats = results.reduce((acc, result) => {
      acc[result.type] = (acc[result.type] || 0) + 1;
      return acc;
    }, {} as Record<TestResultType, number>);

    return stats;
  };

  const stats = getResultStats();

  if (results.length === 0) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`}>
        <div className="text-4xl mb-2">📝</div>
        <p>아직 테스트 결과가 없습니다</p>
        <p className="text-sm mt-1">테스트를 실행하면 여기에 결과가 표시됩니다</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with Stats */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-4">
          <h3 className="font-semibold text-gray-900">
            테스트 결과 ({results.length})
          </h3>
          
          <div className="flex items-center space-x-2 text-xs">
            {stats.success && (
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded">
                성공 {stats.success}
              </span>
            )}
            {stats.error && (
              <span className="px-2 py-1 bg-red-100 text-red-700 rounded">
                실패 {stats.error}
              </span>
            )}
            {stats.warning && (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
                경고 {stats.warning}
              </span>
            )}
            {stats.info && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                정보 {stats.info}
              </span>
            )}
          </div>
        </div>

        {onClearAll && (
          <button
            onClick={onClearAll}
            className="text-sm px-3 py-1 text-red-600 hover:bg-red-50 rounded transition-colors"
          >
            전체 삭제
          </button>
        )}
      </div>

      {/* Results */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {displayResults.map((result) => (
          <TestResultDisplay
            key={result.id}
            result={result}
            onClear={onClearResult}
          />
        ))}
      </div>

      {/* Show more indicator */}
      {results.length > maxResults && (
        <div className="text-center text-sm text-gray-500 py-2">
          {results.length - maxResults}개의 이전 결과가 더 있습니다
        </div>
      )}
    </div>
  );
};

// Helper function to create test results
export const createTestResult = (
  type: TestResultType,
  title: string,
  options: Partial<Omit<TestResult, "id" | "timestamp" | "type" | "title">> = {}
): TestResult => ({
  id: `result_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  timestamp: new Date(),
  type,
  title,
  ...options,
});

// Common test result presets
export const TestResultPresets = {
  success: (title: string, data?: any, duration?: number) =>
    createTestResult("success", title, { data, duration, statusCode: 200 }),
  
  error: (title: string, message?: string, statusCode?: number) =>
    createTestResult("error", title, { message, statusCode }),
  
  warning: (title: string, message?: string) =>
    createTestResult("warning", title, { message }),
  
  info: (title: string, message?: string) =>
    createTestResult("info", title, { message }),
};