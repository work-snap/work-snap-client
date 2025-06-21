import React, { useState } from "react";

import { testApis } from "../../lib/api";
import { createTestResult } from "../../lib/utils";
import { LoadingState } from "../../lib/types";

interface AuthTabProps {
  loading: LoadingState;
  onLoadingChange: (state: LoadingState) => void;
  onTestResult: (result: any) => void;
  onAuthUpdate: (accessToken: string, userId: string) => void;
  onAuthClear: () => void;
}

export const AuthTab: React.FC<AuthTabProps> = ({
  loading,
  onLoadingChange,
  onTestResult,
  onAuthUpdate,
  onAuthClear,
}) => {
  const [showDevTokenForm, setShowDevTokenForm] = useState(false);
  const [devTokenUserId, setDevTokenUserId] = useState("");
  const [devTokenNickname, setDevTokenNickname] = useState("");

  const handleKakaoLogin = async () => {
    onLoadingChange("kakao-login");
    try {
      const response = await testApis.auth.kakaoLogin();
      onTestResult(createTestResult("/api/auth/kakao/login", "POST", response));
    } catch (error) {
      onTestResult(
        createTestResult("/api/auth/kakao/login", "POST", null, error)
      );
    } finally {
      onLoadingChange(null);
    }
  };

  const handleRefreshToken = async () => {
    onLoadingChange("refresh");
    try {
      const response = await testApis.auth.refreshToken();
      onTestResult(createTestResult("/api/auth/refresh", "POST", response));
    } catch (error) {
      onTestResult(createTestResult("/api/auth/refresh", "POST", null, error));
    } finally {
      onLoadingChange(null);
    }
  };

  const handleLogout = async () => {
    onLoadingChange("logout");
    try {
      const response = await testApis.auth.logout();
      onTestResult(createTestResult("/api/auth/logout", "POST", response));
      onAuthClear();
    } catch (error) {
      onTestResult(createTestResult("/api/auth/logout", "POST", null, error));
    } finally {
      onLoadingChange(null);
    }
  };

  const handleDevTokenGeneration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!devTokenUserId) return;

    onLoadingChange("dev-token");
    try {
      const response = await testApis.auth.generateDevToken(devTokenUserId);
      onTestResult(
        createTestResult(
          `/api/auth/dev/tokens/${devTokenUserId}`,
          "POST",
          response
        )
      );

      if (response.data?.accessToken) {
        onAuthUpdate(response.data.accessToken, devTokenUserId);
      }

      setShowDevTokenForm(false);
      setDevTokenUserId("");
    } catch (error) {
      onTestResult(
        createTestResult("/api/auth/dev/tokens/{userId}", "POST", null, error)
      );
    } finally {
      onLoadingChange(null);
    }
  };

  const handleDevTokenByNickname = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!devTokenNickname) return;

    onLoadingChange("dev-token-nickname");
    try {
      const response = await testApis.auth.generateDevTokenByNickname(
        devTokenNickname
      );
      onTestResult(
        createTestResult(
          `/api/auth/dev/tokens/by-nickname/${devTokenNickname}`,
          "POST",
          response
        )
      );

      if (response.data?.accessToken) {
        onAuthUpdate(
          response.data.accessToken,
          response.data.user?.id || "unknown"
        );
      }

      setShowDevTokenForm(false);
      setDevTokenNickname("");
    } catch (error) {
      onTestResult(
        createTestResult(
          "/api/auth/dev/tokens/by-nickname/{nickname}",
          "POST",
          null,
          error
        )
      );
    } finally {
      onLoadingChange(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* 권장 개발 도구 섹션 */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h4 className="text-lg font-semibold text-purple-800 mb-4">
          🚀 개발용 토큰 생성
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setShowDevTokenForm(!showDevTokenForm)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded font-medium"
          >
            개발 토큰 생성 폼 {showDevTokenForm ? "닫기" : "열기"}
          </button>
        </div>

        {showDevTokenForm && (
          <div className="mt-4 p-4 bg-white rounded border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 사용자 ID로 토큰 생성 */}
              <form onSubmit={handleDevTokenGeneration} className="space-y-3">
                <h5 className="font-medium text-purple-700">
                  사용자 ID로 생성
                </h5>
                <input
                  type="text"
                  placeholder="사용자 ID 입력"
                  value={devTokenUserId}
                  onChange={(e) => setDevTokenUserId(e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
                <button
                  type="submit"
                  disabled={loading === "dev-token"}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 py-2 rounded"
                >
                  {loading === "dev-token" ? "생성 중..." : "토큰 생성"}
                </button>
              </form>

              {/* 닉네임으로 토큰 생성 */}
              <form onSubmit={handleDevTokenByNickname} className="space-y-3">
                <h5 className="font-medium text-purple-700">닉네임으로 생성</h5>
                <input
                  type="text"
                  placeholder="닉네임 입력"
                  value={devTokenNickname}
                  onChange={(e) => setDevTokenNickname(e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
                <button
                  type="submit"
                  disabled={loading === "dev-token-nickname"}
                  className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white px-4 py-2 rounded"
                >
                  {loading === "dev-token-nickname"
                    ? "생성 중..."
                    : "토큰 생성"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* 일반 인증 API */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-lg font-semibold text-blue-800 mb-4">
          🔑 인증 API
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={handleKakaoLogin}
            disabled={loading === "kakao-login"}
            className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 text-white px-4 py-2 rounded opacity-75"
            title="실제 OAuth 코드 필요 - 500 에러 발생 가능"
          >
            {loading === "kakao-login" ? "테스트 중..." : "⚠️ 카카오 로그인"}
          </button>
          <button
            onClick={handleRefreshToken}
            disabled={loading === "refresh"}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded"
          >
            {loading === "refresh" ? "테스트 중..." : "토큰 갱신"}
          </button>
          <button
            onClick={handleLogout}
            disabled={loading === "logout"}
            className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-4 py-2 rounded"
          >
            {loading === "logout" ? "테스트 중..." : "로그아웃"}
          </button>
        </div>
      </div>
    </div>
  );
};
