import React from "react";
import { AuthTokens } from "../lib/types";

interface AuthStatusDisplayProps {
  authTokens: AuthTokens | null;
}

export const AuthStatusDisplay: React.FC<AuthStatusDisplayProps> = ({
  authTokens,
}) => {
  if (!authTokens) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          🔐 인증 상태
        </h3>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full bg-red-500"></span>
          <span className="text-sm text-gray-600 dark:text-gray-300">
            인증되지 않음
          </span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          개발 토큰을 생성하여 로그인하세요
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        🔐 인증 상태
      </h3>

      {/* 인증 상태 */}
      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-green-500"></span>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              인증됨 ✅
            </span>
          </div>

          {authTokens.accessToken && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              <p>Access Token: {authTokens.accessToken.substring(0, 30)}...</p>
            </div>
          )}

          {authTokens.userId && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              <p>사용자 ID: {authTokens.userId}</p>
            </div>
          )}
        </div>
      </div>

      {/* 네트워크 에러 해결 가이드 */}
      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
        <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
          💡 네트워크 에러 발생 시 확인사항
        </h4>
        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <li>1. 백엔드 서버가 실행 중인지 확인 (localhost:8080)</li>
          <li>2. 브라우저 개발자 도구 → 네트워크 탭에서 요청 상태 확인</li>
          <li>3. 토큰이 유효한지 확인 (만료되었을 수 있음)</li>
          <li>4. CORS 설정이나 방화벽 설정 확인</li>
        </ul>
      </div>
    </div>
  );
};
