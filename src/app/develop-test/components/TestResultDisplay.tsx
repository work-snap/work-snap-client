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
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">📊 테스트 결과</h2>
        <button
          onClick={onClearResults}
          className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
        >
          결과 지우기
        </button>
      </div>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {testResults.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            테스트 결과가 없습니다.
          </p>
        ) : (
          testResults.map((result, index) => (
            <div key={index} className="bg-gray-50 border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="font-mono text-sm bg-gray-200 px-2 py-1 rounded">
                    {result.method}
                  </span>
                  <span className="ml-2 font-medium">{result.endpoint}</span>
                </div>
                <div className="text-right">
                  <div
                    className={`font-semibold ${getStatusColor(result.status)}`}
                  >
                    {result.status || "N/A"}
                  </div>
                  <div className="text-xs text-gray-500">
                    {result.timestamp}
                  </div>
                </div>
              </div>
              {result.data && (
                <div className="mt-2">
                  <div className="text-xs text-gray-600 mb-1">응답 데이터:</div>
                  <pre className="bg-white p-2 rounded border text-xs overflow-x-auto">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </div>
              )}
              {result.error && (
                <div className="mt-2">
                  <div className="text-xs text-red-600 mb-1">에러:</div>
                  <pre className="bg-red-50 p-2 rounded border border-red-200 text-xs text-red-700 overflow-x-auto">
                    {typeof result.error === "string"
                      ? result.error
                      : JSON.stringify(result.error, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
