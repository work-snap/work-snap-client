import React from "react";
import { TestResult } from "../lib/types";
import { getStatusColor } from "../lib/utils";

interface TestResultDisplayProps {
  testResults: TestResult[];
  onClearResults: () => void;
}

export const TestResultDisplay: React.FC<TestResultDisplayProps> = ({
  testResults,
  onClearResults,
}) => {
  return (
    <div className="h-full flex flex-col">
      {/* 헤더 */}
      <div className="flex items-center justify-between p-6 border-b border-white/20">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm">📊</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900">테스트 결과</h3>
          {testResults.length > 0 && (
            <div className="px-3 py-1 bg-violet-100/60 rounded-full">
              <span className="text-sm font-medium text-violet-700">
                {testResults.length}개
              </span>
            </div>
          )}
        </div>

        <button
          onClick={onClearResults}
          disabled={testResults.length === 0}
          className="group relative px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
        >
          <span className="flex items-center space-x-2">
            <span>🗑️</span>
            <span>초기화</span>
          </span>
        </button>
      </div>

      {/* 결과 목록 */}
      <div className="flex-1 overflow-hidden">
        {testResults.length === 0 ? (
          <div className="h-full flex items-center justify-center p-8">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center">
                <span className="text-3xl text-gray-400">📋</span>
              </div>
              <h4 className="text-xl font-semibold text-gray-600 mb-2">
                테스트 결과가 없습니다
              </h4>
              <p className="text-gray-500 leading-relaxed max-w-sm">
                API를 테스트하면 여기에 실시간으로 결과가 표시됩니다.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-4 overflow-y-auto h-full">
            {testResults.map((result, index) => (
              <div
                key={index}
                className="backdrop-blur-sm bg-white/70 border border-white/50 rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
              >
                {/* 헤더 정보 */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`px-3 py-1 rounded-lg text-xs font-bold ${
                        result.method === "GET"
                          ? "bg-blue-100 text-blue-700"
                          : result.method === "POST"
                          ? "bg-green-100 text-green-700"
                          : result.method === "PUT"
                          ? "bg-yellow-100 text-yellow-700"
                          : result.method === "DELETE"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {result.method}
                    </div>
                    <div className="font-medium text-gray-800 text-sm">
                      {result.endpoint}
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`font-bold text-sm ${getStatusColor(
                        result.status
                      )}`}
                    >
                      {result.status || "N/A"}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {result.timestamp}
                    </div>
                  </div>
                </div>

                {/* 성공 응답 */}
                {result.data && (
                  <div className="mt-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                      <span className="text-sm font-semibold text-emerald-700">
                        응답 데이터
                      </span>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200/50 rounded-xl p-4">
                      <pre className="text-xs text-emerald-800 overflow-x-auto leading-relaxed font-mono">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {/* 에러 응답 */}
                {result.error && (
                  <div className="mt-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">×</span>
                      </div>
                      <span className="text-sm font-semibold text-red-700">
                        에러 정보
                      </span>
                    </div>
                    <div className="bg-gradient-to-br from-red-50 to-pink-50 border border-red-200/50 rounded-xl p-4">
                      <pre className="text-xs text-red-800 overflow-x-auto leading-relaxed font-mono">
                        {typeof result.error === "string"
                          ? result.error
                          : JSON.stringify(result.error, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
