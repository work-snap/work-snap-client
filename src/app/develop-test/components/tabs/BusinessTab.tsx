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
    <div className="space-y-6">
      {/* 사업자 등록 섹션 (JSON 방식) */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <h4 className="text-lg font-semibold text-orange-800 mb-4">
          🏢 사업자 등록 (JSON 방식)
        </h4>
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

      {/* 사업자 정보 API */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-lg font-semibold text-blue-800 mb-4">
          📊 사업자 정보 API
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={handleGetProfile}
            disabled={loading === "business-profile"}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded"
          >
            {loading === "business-profile" ? "조회 중..." : "프로필 조회"}
          </button>

          <button
            onClick={handleGetVerificationStatus}
            disabled={loading === "verification-status"}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded"
          >
            {loading === "verification-status" ? "조회 중..." : "검증 상태"}
          </button>

          <button
            onClick={handleGetDashboard}
            disabled={loading === "dashboard"}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 py-2 rounded"
          >
            {loading === "dashboard" ? "조회 중..." : "대시보드"}
          </button>
        </div>
      </div>

      {/* TODO: 향후 구현 예정 API */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">
          🚧 향후 구현 예정 API
        </h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p>• 통계 조회 (/api/business-owner/statistics)</p>
          <p>• 알림 목록 조회 (/api/business-owner/notifications)</p>
          <p>• 설정 조회 (/api/business-owner/settings)</p>
          <p>
            • 검증 타임라인 조회 (/api/business-owner/verification-timeline)
          </p>
          <p>• 서류 목록 조회 (/api/business-owner/documents)</p>
          <p>• 서류 업로드 (/api/business-owner/documents)</p>
          <p>• 서류 다운로드 (/api/business-owner/documents/:id/download)</p>
          <p>• 재검토 요청 (/api/business-owner/verification/refresh)</p>
        </div>
      </div>
    </div>
  );
};
