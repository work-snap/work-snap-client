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
} from "./components";

export default function DevelopTestPage() {
  // 탭 관련 상태
  const [activeTab, setActiveTab] = useState<TabType>("auth");

  // 커스텀 훅들 사용
  const { authTokens, updateAuthTokens, clearAuthTokens } = useAuthState();
  const { testResults, addTestResult, clearResults } = useTestResults();
  const { loading, setLoadingState } = useLoadingState();

  // 탭 컨텐츠 렌더링 함수
  const renderTabContent = () => {
    switch (activeTab) {
      case "auth":
        return (
          <AuthTab
            loading={loading}
            onLoadingChange={setLoadingState}
            onTestResult={addTestResult}
            onAuthUpdate={updateAuthTokens}
            onAuthClear={clearAuthTokens}
          />
        );
      case "user":
        return (
          <UserTab
            loading={loading}
            onLoadingChange={setLoadingState}
            onTestResult={addTestResult}
          />
        );
      case "business":
        return (
          <BusinessTab
            loading={loading}
            onLoadingChange={setLoadingState}
            onTestResult={addTestResult}
          />
        );
      case "workplace":
        return (
          <WorkplaceTab
            loading={loading}
            onLoadingChange={setLoadingState}
            onTestResult={addTestResult}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🛠️ 개발자 API 테스트 페이지
          </h1>

          {/* 사용 안내 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold text-blue-800 mb-2">
              📋 사용 안내
            </h2>
            <div className="text-sm text-blue-700 space-y-1">
              <p>
                • <strong>개발 토큰 생성:</strong> 실제 로그인 없이 테스트용
                토큰을 발급받을 수 있습니다.
              </p>
              <p>
                • <strong>카카오 로그인:</strong> 실제 OAuth 코드가 필요하므로
                더미 데이터로는 500 에러가 발생합니다.
              </p>
              <p>
                • <strong>인증 필요 API:</strong> 토큰이 없으면 401 에러가
                발생합니다. 먼저 개발 토큰을 생성하세요.
              </p>
              <p>
                • <strong>사업자 API:</strong> BUSINESS_OWNER 타입의 사용자만
                접근 가능합니다.
              </p>
            </div>
          </div>

          {/* 현재 인증 상태 */}
          <AuthStatusDisplay authTokens={authTokens} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 탭 메뉴와 컨텐츠 */}
            <div>
              <h2 className="text-xl font-semibold mb-4">🔧 API 테스트</h2>

              {/* 탭 메뉴 */}
              <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

              {/* 탭 컨텐츠 */}
              <div className="tab-content">{renderTabContent()}</div>
            </div>

            {/* 테스트 결과 */}
            <TestResultDisplay
              testResults={testResults}
              onClearResults={clearResults}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
