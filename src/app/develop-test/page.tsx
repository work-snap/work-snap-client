"use client";

import React, { useState } from "react";
import { TabType } from "./lib/types";
import { useAuthState, useTestResults, useLoadingState } from "./lib/hooks";
import {
  TestResultDisplay,
  AuthStatusDisplay,
  TabNavigation,
  AuthTab,
  UserTab,
  BusinessTab,
  WorkplaceTab,
  WorkScheduleTab,
  PartTimeTab,
  AttendanceTab,
  AttendanceCardTab,
} from "./components";

export default function DevelopTestPage() {
  // 탭 관련 상태
  const [activeTab, setActiveTab] = useState<TabType>("auth");

  // 커스텀 훅들 사용
  const { authTokens, updateAuthTokens, clearAuthTokens } = useAuthState();
  const { testResults, addTestResult, clearResults } = useTestResults();
  const { loading, setLoadingState } = useLoadingState();

  // 공통 props 객체
  const commonTabProps = {
    loading,
    onLoadingChange: setLoadingState,
    onTestResult: addTestResult,
  };

  // 인증 관련 props 객체
  const authProps = {
    onAuthUpdate: updateAuthTokens,
    onAuthClear: clearAuthTokens,
  };

  // 탭 설정 맵
  const tabComponents = {
    auth: () => <AuthTab {...commonTabProps} {...authProps} />,
    user: () => <UserTab {...commonTabProps} />,
    business: () => <BusinessTab {...commonTabProps} />,
    workplace: () => <WorkplaceTab {...commonTabProps} />,
    schedule: () => <WorkScheduleTab {...commonTabProps} />,
    parttime: () => <PartTimeTab {...commonTabProps} />,
    attendance: () => <AttendanceTab {...commonTabProps} />,
    "attendance-card": () => <AttendanceCardTab {...commonTabProps} />,
  };

  // 탭 컨텐츠 렌더링 함수
  const renderTabContent = () => {
    console.log("🔍 현재 활성 탭:", activeTab);
    const TabComponent = tabComponents[activeTab];
    console.log("🔍 TabComponent:", TabComponent);
    return TabComponent ? TabComponent() : null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* 배경 장식 요소 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-emerald-400/20 to-blue-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-violet-400/10 to-cyan-400/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* 메인 헤더 카드 */}
          <div className="backdrop-blur-xl bg-white/80 border border-white/20 rounded-2xl shadow-2xl shadow-blue-500/10 p-8 mb-8 transform hover:scale-[1.01] transition-all duration-300">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-lg">
                <span className="text-3xl">🛠️</span>
              </div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-4">
                개발자 API 테스트 센터
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                강력한 API 엔드포인트를 테스트하고 실시간으로 응답을 분석하세요
              </p>
            </div>

            {/* 개선된 사용 안내 */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-2xl p-6 mb-8 shadow-inner">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white text-sm">📋</span>
                </div>
                <h2 className="text-xl font-semibold text-blue-900">
                  빠른 시작 가이드
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-start space-x-3 p-3 bg-white/60 rounded-lg border border-blue-100">
                  <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <div>
                    <strong className="text-blue-900">개발 토큰 생성:</strong>
                    <p className="text-blue-700 mt-1">
                      실제 로그인 없이 테스트용 토큰을 즉시 발급받으세요
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-white/60 rounded-lg border border-blue-100">
                  <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">⚠</span>
                  </div>
                  <div>
                    <strong className="text-blue-900">카카오 로그인:</strong>
                    <p className="text-blue-700 mt-1">
                      실제 OAuth 코드 필요 (더미 데이터는 500 에러 발생)
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-white/60 rounded-lg border border-blue-100">
                  <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">🔒</span>
                  </div>
                  <div>
                    <strong className="text-blue-900">인증 필요 API:</strong>
                    <p className="text-blue-700 mt-1">
                      토큰 없이 접근 시 401 에러 (먼저 개발 토큰 생성)
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-white/60 rounded-lg border border-blue-100">
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">👔</span>
                  </div>
                  <div>
                    <strong className="text-blue-900">사업자 API:</strong>
                    <p className="text-blue-700 mt-1">
                      BUSINESS_OWNER 타입 사용자만 접근 가능
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 현재 인증 상태 */}
            <div className="mb-8">
              <AuthStatusDisplay authTokens={authTokens} />
            </div>
          </div>

          {/* 메인 컨텐츠 그리드 */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            {/* API 테스트 섹션 */}
            <div className="xl:col-span-7 space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-lg">🔧</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-900">
                  API 테스트 워크스페이스
                </h2>
              </div>

              {/* 탭 메뉴 */}
              <div className="backdrop-blur-xl bg-white/70 border border-white/20 rounded-2xl p-6 shadow-xl">
                <TabNavigation
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                />
              </div>

              {/* 탭 컨텐츠 */}
              <div className="backdrop-blur-xl bg-white/70 border border-white/20 rounded-2xl shadow-xl overflow-hidden">
                <div className="p-6 min-h-[600px] bg-gradient-to-br from-gray-50/50 to-white/50">
                  <div className="h-full animate-fadeIn">
                    {renderTabContent()}
                  </div>
                </div>
              </div>
            </div>

            {/* 테스트 결과 섹션 */}
            <div className="xl:col-span-5 space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-lg">📊</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-900">
                  실시간 결과
                </h2>
              </div>

              <div className="backdrop-blur-xl bg-white/70 border border-white/20 rounded-2xl shadow-xl overflow-hidden">
                <TestResultDisplay
                  testResults={testResults}
                  onClearResults={clearResults}
                />
              </div>
            </div>
          </div>

          {/* 푸터 */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center space-x-2 px-6 py-3 bg-white/60 backdrop-blur-sm rounded-full border border-white/20 shadow-lg">
              <span className="text-2xl">⚡</span>
              <span className="text-gray-700 font-medium">
                WorkSnap Developer Tools
              </span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
