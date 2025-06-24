import React, { useState } from "react";

import { testApis } from "../../lib/api";
import { createTestResult } from "../../lib/utils";
import { LoadingState, BusinessOwnerRegistrationForm } from "../../lib/types";
import { BusinessRegistrationForm } from "../forms/BusinessRegistrationForm";

interface BusinessTabProps {
  loading: LoadingState;
  onLoadingChange: (state: LoadingState) => void;
  onTestResult: (result: any) => void;
}

export const BusinessTab: React.FC<BusinessTabProps> = ({
  loading,
  onLoadingChange,
  onTestResult,
}) => {
  // 사업자 등록 폼 상태 (JSON 방식)
  const [registrationForm, setRegistrationForm] =
    useState<BusinessOwnerRegistrationForm>({
      businessRegistrationImage: "",
    });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // 사업자 등록 처리 (JSON 방식)
  const handleBusinessRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registrationForm.businessRegistrationImage) {
      alert("사업자등록증 이미지는 필수입니다.");
      return;
    }

    onLoadingChange("business-registration");
    try {
      const response = await testApis.businessOwner.register(registrationForm);
      onTestResult(
        createTestResult("/api/business-owner/register", "POST", response)
      );
    } catch (error) {
      onTestResult(
        createTestResult("/api/business-owner/register", "POST", null, error)
      );
    } finally {
      onLoadingChange(null);
    }
  };

  // 프로필 조회
  const handleGetProfile = async () => {
    onLoadingChange("business-profile");
    try {
      const response = await testApis.businessOwner.getProfile();
      onTestResult(
        createTestResult("/api/business-owner/profile", "GET", response)
      );
    } catch (error) {
      onTestResult(
        createTestResult("/api/business-owner/profile", "GET", null, error)
      );
    } finally {
      onLoadingChange(null);
    }
  };

  // 검증 상태 조회
  const handleGetVerificationStatus = async () => {
    onLoadingChange("verification-status");
    try {
      const response = await testApis.businessOwner.getVerificationStatus();
      onTestResult(
        createTestResult(
          "/api/business-owner/verification-status",
          "GET",
          response
        )
      );
    } catch (error) {
      onTestResult(
        createTestResult(
          "/api/business-owner/verification-status",
          "GET",
          null,
          error
        )
      );
    } finally {
      onLoadingChange(null);
    }
  };

  // 대시보드 조회
  const handleGetDashboard = async () => {
    onLoadingChange("dashboard");
    try {
      const response = await testApis.businessOwner.getDashboard();
      onTestResult(
        createTestResult("/api/business-owner/dashboard", "GET", response)
      );
    } catch (error) {
      onTestResult(
        createTestResult("/api/business-owner/dashboard", "GET", null, error)
      );
    } finally {
      onLoadingChange(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* 사업자 등록 섹션 */}
      <div className="backdrop-blur-xl bg-gradient-to-br from-orange-50/80 to-amber-50/80 border border-orange-200/50 rounded-2xl p-6 shadow-xl shadow-orange-500/10 relative overflow-hidden">
        {/* 배경 장식 */}
        <div className="absolute -top-8 -right-8 w-24 h-24 bg-orange-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-amber-400/20 rounded-full blur-2xl"></div>

        <div className="relative">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl">🏢</span>
            </div>
            <div>
              <h4 className="text-2xl font-bold bg-gradient-to-r from-orange-700 to-amber-700 bg-clip-text text-transparent">
                사업자 등록
              </h4>
              <p className="text-orange-600/80 mt-1">
                사업자등록증을 업로드하여 사업자 인증을 신청하세요
              </p>
            </div>
          </div>

          <BusinessRegistrationForm
            form={registrationForm}
            imagePreview={imagePreview}
            loading={loading}
            onFormUpdate={(updates) =>
              setRegistrationForm({ ...registrationForm, ...updates })
            }
            onImageSet={(base64, preview) => {
              setRegistrationForm({
                ...registrationForm,
                businessRegistrationImage: base64,
              });
              setImagePreview(preview || base64);
            }}
            onImageRemove={() => {
              setRegistrationForm({
                ...registrationForm,
                businessRegistrationImage: "",
              });
              setImagePreview(null);
            }}
            onSubmit={handleBusinessRegistration}
          />
        </div>
      </div>

      {/* 사업자 정보 API */}
      <div className="backdrop-blur-xl bg-gradient-to-br from-blue-50/80 to-indigo-50/80 border border-blue-200/50 rounded-2xl p-6 shadow-xl shadow-blue-500/10 relative overflow-hidden">
        {/* 배경 장식 */}
        <div className="absolute -top-8 -right-8 w-24 h-24 bg-blue-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-indigo-400/20 rounded-full blur-2xl"></div>

        <div className="relative">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl">📊</span>
            </div>
            <div>
              <h4 className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
                사업자 정보 API
              </h4>
              <p className="text-blue-600/80 mt-1">
                등록된 사업자 정보와 인증 상태를 확인하세요
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={handleGetProfile}
              disabled={loading === "business-profile"}
              className="group relative bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-4 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed transform hover:scale-105"
            >
              {loading === "business-profile" ? (
                <span className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>조회 중...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center space-x-2">
                  <span>👤</span>
                  <span>프로필 조회</span>
                </span>
              )}
            </button>

            <button
              onClick={handleGetVerificationStatus}
              disabled={loading === "verification-status"}
              className="group relative bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-4 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed transform hover:scale-105"
            >
              {loading === "verification-status" ? (
                <span className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>조회 중...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center space-x-2">
                  <span>✅</span>
                  <span>검증 상태</span>
                </span>
              )}
            </button>

            <button
              onClick={handleGetDashboard}
              disabled={loading === "dashboard"}
              className="group relative bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-4 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed transform hover:scale-105"
            >
              {loading === "dashboard" ? (
                <span className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>조회 중...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center space-x-2">
                  <span>📈</span>
                  <span>대시보드</span>
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 향후 구현 예정 API */}
      <div className="backdrop-blur-xl bg-gradient-to-br from-gray-50/80 to-slate-50/80 border border-gray-200/50 rounded-2xl p-6 shadow-xl shadow-gray-500/10 relative overflow-hidden">
        {/* 배경 장식 */}
        <div className="absolute -top-8 -right-8 w-24 h-24 bg-gray-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-slate-400/20 rounded-full blur-2xl"></div>

        <div className="relative">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-gray-500 to-slate-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl">🚧</span>
            </div>
            <div>
              <h4 className="text-2xl font-bold bg-gradient-to-r from-gray-700 to-slate-700 bg-clip-text text-transparent">
                향후 구현 예정 API
              </h4>
              <p className="text-gray-600/80 mt-1">
                개발 중인 추가 기능들입니다
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                icon: "📊",
                title: "통계 조회",
                endpoint: "/api/business-owner/statistics",
              },
              {
                icon: "🔔",
                title: "알림 목록 조회",
                endpoint: "/api/business-owner/notifications",
              },
              {
                icon: "⚙️",
                title: "설정 조회",
                endpoint: "/api/business-owner/settings",
              },
              {
                icon: "⏰",
                title: "검증 타임라인 조회",
                endpoint: "/api/business-owner/verification-timeline",
              },
              {
                icon: "📄",
                title: "서류 목록 조회",
                endpoint: "/api/business-owner/documents",
              },
              {
                icon: "📤",
                title: "서류 업로드",
                endpoint: "/api/business-owner/documents",
              },
              {
                icon: "💾",
                title: "서류 다운로드",
                endpoint: "/api/business-owner/documents/:id/download",
              },
              {
                icon: "🔄",
                title: "재검토 요청",
                endpoint: "/api/business-owner/verification/refresh",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="backdrop-blur-sm bg-white/60 rounded-xl p-4 border border-gray-100/50 shadow-sm"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-gray-500 to-slate-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">{item.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-800 text-sm">
                      {item.title}
                    </div>
                    <div className="text-xs text-gray-500 font-mono truncate">
                      {item.endpoint}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
