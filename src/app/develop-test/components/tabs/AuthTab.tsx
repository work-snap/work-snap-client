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
  const [kakaoCode, setKakaoCode] = useState("");
  const [userType, setUserType] = useState("BUSINESS_OWNER");

  const handleKakaoLogin = async () => {
    onLoadingChange("kakao-login");
    try {
      const mockResponse = {
        data: {
          success: true,
          accessToken: "mock-access-token",
          refreshToken: "mock-refresh-token",
          user: {
            id: 1,
            username: "testuser",
            userType: "BUSINESS_OWNER",
          },
        },
      };
      onTestResult(
        createTestResult("/api/auth/kakao/login", "POST", mockResponse)
      );
    } catch (error) {
      onTestResult(
        createTestResult("/api/auth/kakao/login", "POST", null, error)
      );
    } finally {
      onLoadingChange(null);
    }
  };

  const handleRealKakaoLogin = async () => {
    if (!kakaoCode) {
      alert("카카오 인증 코드를 입력해주세요.");
      return;
    }

    onLoadingChange("kakao-login-real");
    try {
      const response = await testApis.auth.kakaoLogin({
        code: kakaoCode,
        userType: userType,
      });
      onTestResult(createTestResult("/api/auth/kakao/login", "POST", response));

      if (response.data?.accessToken) {
        onAuthUpdate(
          response.data.accessToken,
          response.data.user?.id?.toString() || "unknown"
        );
      }
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
          `/api/auth/dev-token/${devTokenUserId}`,
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
        createTestResult("/api/auth/dev-token/{userId}", "POST", null, error)
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
          `/api/auth/dev-token/nickname/${devTokenNickname}`,
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
          "/api/auth/dev-token/nickname/{nickname}",
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
    <div className="space-y-8">
      <div className="backdrop-blur-xl bg-gradient-to-br from-green-50/80 to-emerald-50/80 border border-green-200/50 rounded-2xl p-6 shadow-xl shadow-green-500/10 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-24 h-24 bg-green-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-emerald-400/20 rounded-full blur-2xl"></div>

        <div className="relative">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl">🔐</span>
            </div>
            <div>
              <h4 className="text-2xl font-bold bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent">
                실제 카카오 로그인
              </h4>
              <p className="text-green-600/80 mt-1">
                실제 백엔드 API를 통한 카카오 로그인 테스트
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                카카오 인증 코드
              </label>
              <input
                type="text"
                placeholder="카카오에서 받은 인증 코드를 입력하세요"
                value={kakaoCode}
                onChange={(e) => setKakaoCode(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-green-200/50 bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400/50 transition-all duration-300"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                사용자 타입
              </label>
              <select
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-green-200/50 bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400/50 transition-all duration-300"
              >
                <option value="BUSINESS_OWNER">사업자</option>
                <option value="PART_TIME_WORKER">파트타임 근무자</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleRealKakaoLogin}
            disabled={loading === "kakao-login-real"}
            className="group relative px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="flex items-center space-x-2">
              <span>🚀</span>
              <span>
                {loading === "kakao-login-real"
                  ? "로그인 중..."
                  : "실제 카카오 로그인"}
              </span>
            </span>
          </button>
        </div>
      </div>

      <div className="backdrop-blur-xl bg-gradient-to-br from-yellow-50/80 to-orange-50/80 border border-yellow-200/50 rounded-2xl p-6 shadow-xl shadow-yellow-500/10 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-24 h-24 bg-yellow-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-orange-400/20 rounded-full blur-2xl"></div>

        <div className="relative">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl">💛</span>
            </div>
            <div>
              <h4 className="text-2xl font-bold bg-gradient-to-r from-yellow-700 to-orange-700 bg-clip-text text-transparent">
                Mock 카카오 로그인
              </h4>
              <p className="text-yellow-600/80 mt-1">
                테스트용 Mock 응답으로 빠른 인증 테스트
              </p>
            </div>
          </div>

          <button
            onClick={handleKakaoLogin}
            disabled={loading === "kakao-login"}
            className="group relative px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-yellow-600 to-orange-600 text-white shadow-lg shadow-yellow-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="flex items-center space-x-2">
              <span>💛</span>
              <span>
                {loading === "kakao-login"
                  ? "로그인 중..."
                  : "Mock 카카오 로그인"}
              </span>
            </span>
          </button>
        </div>
      </div>

      <div className="backdrop-blur-xl bg-gradient-to-br from-purple-50/80 to-indigo-50/80 border border-purple-200/50 rounded-2xl p-6 shadow-xl shadow-purple-500/10 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-24 h-24 bg-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-indigo-400/20 rounded-full blur-2xl"></div>

        <div className="relative">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl">🚀</span>
            </div>
            <div>
              <h4 className="text-2xl font-bold bg-gradient-to-r from-purple-700 to-indigo-700 bg-clip-text text-transparent">
                개발용 토큰 생성
              </h4>
              <p className="text-purple-600/80 mt-1">
                테스트를 위한 임시 인증 토큰을 빠르게 생성하세요
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <button
              onClick={() => setShowDevTokenForm(!showDevTokenForm)}
              className={`group relative px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
                showDevTokenForm
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25"
                  : "backdrop-blur-sm bg-white/70 hover:bg-white/90 text-purple-700 border border-purple-200/50 hover:border-purple-300/50"
              }`}
            >
              <span className="flex items-center space-x-2">
                <span>{showDevTokenForm ? "📝" : "🔧"}</span>
                <span>
                  {showDevTokenForm ? "폼 닫기" : "토큰 생성 폼 열기"}
                </span>
              </span>
            </button>
          </div>

          {showDevTokenForm && (
            <div className="backdrop-blur-sm bg-white/70 rounded-2xl p-6 border border-purple-100/50 shadow-lg">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm">👤</span>
                    </div>
                    <h5 className="text-lg font-bold text-purple-700">
                      사용자 ID로 생성
                    </h5>
                  </div>
                  <form
                    onSubmit={handleDevTokenGeneration}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        사용자 ID
                      </label>
                      <input
                        type="text"
                        placeholder="예: user123"
                        value={devTokenUserId}
                        onChange={(e) => setDevTokenUserId(e.target.value)}
                        className="w-full px-4 py-3 text-gray-900 bg-white/80 border border-purple-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent shadow-sm backdrop-blur-sm transition-all duration-200"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading === "dev-token"}
                      className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-4 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
                    >
                      {loading === "dev-token" ? (
                        <span className="flex items-center justify-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>생성 중...</span>
                        </span>
                      ) : (
                        <span className="flex items-center justify-center space-x-2">
                          <span>🔑</span>
                          <span>토큰 생성</span>
                        </span>
                      )}
                    </button>
                  </form>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm">📝</span>
                    </div>
                    <h5 className="text-lg font-bold text-purple-700">
                      닉네임으로 생성
                    </h5>
                  </div>
                  <form
                    onSubmit={handleDevTokenByNickname}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        닉네임
                      </label>
                      <input
                        type="text"
                        placeholder="예: 홍길동"
                        value={devTokenNickname}
                        onChange={(e) => setDevTokenNickname(e.target.value)}
                        className="w-full px-4 py-3 text-gray-900 bg-white/80 border border-purple-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent shadow-sm backdrop-blur-sm transition-all duration-200"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading === "dev-token-nickname"}
                      className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-4 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
                    >
                      {loading === "dev-token-nickname" ? (
                        <span className="flex items-center justify-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>생성 중...</span>
                        </span>
                      ) : (
                        <span className="flex items-center justify-center space-x-2">
                          <span>🎯</span>
                          <span>토큰 생성</span>
                        </span>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="backdrop-blur-xl bg-gradient-to-br from-yellow-50/80 to-orange-50/80 border border-yellow-200/50 rounded-2xl p-6 shadow-xl shadow-yellow-500/10 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-24 h-24 bg-yellow-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-orange-400/20 rounded-full blur-2xl"></div>

        <div className="relative">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl">🔐</span>
            </div>
            <div>
              <h4 className="text-2xl font-bold bg-gradient-to-r from-yellow-700 to-orange-700 bg-clip-text text-transparent">
                OAuth 인증
              </h4>
              <p className="text-yellow-600/80 mt-1">
                카카오 로그인 및 토큰 관리 기능을 테스트하세요
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={handleRefreshToken}
              disabled={loading === "refresh"}
              className="group relative bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed transform hover:scale-105"
            >
              {loading === "refresh" ? (
                <span className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>갱신 중...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center space-x-2">
                  <span>🔄</span>
                  <span>토큰 갱신</span>
                </span>
              )}
            </button>

            <button
              onClick={handleLogout}
              disabled={loading === "logout"}
              className="group relative bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed transform hover:scale-105"
            >
              {loading === "logout" ? (
                <span className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>로그아웃 중...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center space-x-2">
                  <span>🚪</span>
                  <span>로그아웃</span>
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
