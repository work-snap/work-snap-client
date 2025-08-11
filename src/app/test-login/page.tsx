"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@heroui/react";
import { ArrowLeft, LogOut } from "lucide-react";
import { 
  setAuthTokensToStorage, 
  getAuthTokensFromStorage, 
  removeAuthTokensFromStorage 
} from "@/src/app/develop-test/lib/utils";
import { DevTokenForm, RedirectButtons } from "./components";
import { testApis } from "@/app/develop-test/lib/api";

// 실제 API 함수들
const generateDevToken = async (userId: string) => {
  const response = await testApis.auth.generateDevToken(userId);
  return response;
};

const generateDevTokenByNickname = async (nickname: string) => {
  const response = await testApis.auth.generateDevTokenByNickname(nickname);
  return response;
};

export default function TestLoginPage() {
  const [devTokenUserId, setDevTokenUserId] = useState("");
  const [devTokenNickname, setDevTokenNickname] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [authStatus, setAuthStatus] = useState<{
    isLoggedIn: boolean;
    userId: string | null;
    accessToken: string | null;
  }>({
    isLoggedIn: false,
    userId: null,
    accessToken: null,
  });

  useEffect(() => {
    const { accessToken, userId } = getAuthTokensFromStorage();
    setAuthStatus({
      isLoggedIn: !!accessToken,
      userId,
      accessToken,
    });
  }, []);

  const handleDevTokenGeneration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!devTokenUserId) return;

    setLoading("dev-token");
    try {
      const response = await generateDevToken(devTokenUserId);
      
      if (response.data?.accessToken) {
        setAuthTokensToStorage(response.data.accessToken, devTokenUserId);
        setAuthStatus({
          isLoggedIn: true,
          userId: devTokenUserId,
          accessToken: response.data.accessToken,
        });
        // 페이지 새로고침으로 UserContext 업데이트 트리거
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }
      
      setDevTokenUserId("");
    } catch (error) {
      console.error("토큰 생성 실패:", error);
    } finally {
      setLoading(null);
    }
  };

  const handleDevTokenByNickname = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!devTokenNickname) return;

    setLoading("dev-token-nickname");
    try {
      const response = await generateDevTokenByNickname(devTokenNickname);
      
      if (response.data?.accessToken) {
        setAuthTokensToStorage(response.data.accessToken, response.data.user?.id || "unknown");
        setAuthStatus({
          isLoggedIn: true,
          userId: response.data.user?.id || "unknown",
          accessToken: response.data.accessToken,
        });
        // 페이지 새로고침으로 UserContext 업데이트 트리거
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }
      
      setDevTokenNickname("");
    } catch (error) {
      console.error("토큰 생성 실패:", error);
    } finally {
      setLoading(null);
    }
  };

  const handleLogout = () => {
    removeAuthTokensFromStorage();
    setAuthStatus({
      isLoggedIn: false,
      userId: null,
      accessToken: null,
    });
    // 페이지 새로고침으로 UserContext 업데이트 트리거
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const redirectToPage = (path: string) => {
    window.location.href = path;
  };

  const goBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 헤더 */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="light"
                size="sm"
                startContent={<ArrowLeft className="w-4 h-4" />}
                onClick={goBack}
              >
                뒤로
              </Button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
                  개발용 테스트 로그인
                </h1>
                <p className="text-sm text-gray-600">빠른 테스트를 위한 개발전용 토큰 생성</p>
              </div>
            </div>
            {authStatus.isLoggedIn && (
              <Button
                color="danger"
                variant="bordered"
                startContent={<LogOut className="w-4 h-4" />}
                onClick={handleLogout}
              >
                로그아웃
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* 현재 로그인 상태 */}
        <div className="backdrop-blur-xl bg-white/70 border border-gray-200/50 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">현재 로그인 상태</h3>
              <p className="text-sm text-gray-600 mt-1">
                {authStatus.isLoggedIn 
                  ? `로그인됨 - 사용자 ID: ${authStatus.userId}` 
                  : "로그인되지 않음"}
              </p>
            </div>
            <div className={`w-3 h-3 rounded-full ${
              authStatus.isLoggedIn ? "bg-green-500" : "bg-gray-400"
            }`} />
          </div>
        </div>

        {/* 개발 토큰 생성 */}
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <DevTokenForm
                title="사용자 ID로 생성"
                placeholder="예: user123"
                value={devTokenUserId}
                onChange={setDevTokenUserId}
                onSubmit={handleDevTokenGeneration}
                loading={loading === "dev-token"}
                buttonText="토큰 생성"
                icon="🔑"
                buttonColor="bg-gradient-to-r from-purple-600 to-indigo-600"
              />

              <DevTokenForm
                title="닉네임으로 생성"
                placeholder="예: 홍길동"
                value={devTokenNickname}
                onChange={setDevTokenNickname}
                onSubmit={handleDevTokenByNickname}
                loading={loading === "dev-token-nickname"}
                buttonText="토큰 생성"
                icon="🎯"
                buttonColor="bg-gradient-to-r from-emerald-600 to-teal-600"
              />
            </div>
          </div>
        </div>

        {/* 페이지 이동 버튼 */}
        {authStatus.isLoggedIn && (
          <RedirectButtons onRedirect={redirectToPage} />
        )}
      </div>
    </div>
  );
}