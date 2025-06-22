import React, { useState } from "react";

import { testApis } from "../../lib/api";
import { createTestResult } from "../../lib/utils";
import { LoadingState, WorkplaceRegistrationForm } from "../../lib/types";

interface WorkplaceTabProps {
  loading: LoadingState;
  onLoadingChange: (state: LoadingState) => void;
  onTestResult: (result: any) => void;
}

export const WorkplaceTab: React.FC<WorkplaceTabProps> = ({
  loading,
  onLoadingChange,
  onTestResult,
}) => {
  // 사업장 등록 폼 상태
  const [registrationForm, setRegistrationForm] =
    useState<WorkplaceRegistrationForm>({
      name: "",
      address: "",
      detailAddress: "",
      phoneNumber: "",
      description: "",
      isMain: false,
    });

  // 사업장 ID 입력 (상세 조회, 수정, 삭제용)
  const [workplaceId, setWorkplaceId] = useState<string>("");

  // 사업장 등록 처리
  const handleWorkplaceRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registrationForm.name || !registrationForm.address) {
      alert("사업장명과 주소는 필수입니다.");
      return;
    }

    onLoadingChange("workplace-register");
    try {
      const response = await testApis.workplace.register(registrationForm);
      onTestResult(
        createTestResult("/api/business-owner/workplaces", "POST", response)
      );
    } catch (error) {
      onTestResult(
        createTestResult("/api/business-owner/workplaces", "POST", null, error)
      );
    } finally {
      onLoadingChange(null);
    }
  };

  // 사업장 목록 조회
  const handleGetWorkplaces = async () => {
    onLoadingChange("workplace-list");
    try {
      const response = await testApis.workplace.getWorkplaces();
      onTestResult(
        createTestResult("/api/business-owner/workplaces", "GET", response)
      );
    } catch (error) {
      onTestResult(
        createTestResult("/api/business-owner/workplaces", "GET", null, error)
      );
    } finally {
      onLoadingChange(null);
    }
  };

  // 메인 사업장 조회
  const handleGetMainWorkplace = async () => {
    onLoadingChange("workplace-main");
    try {
      const response = await testApis.workplace.getMainWorkplace();
      onTestResult(
        createTestResult("/api/business-owner/workplaces/main", "GET", response)
      );
    } catch (error) {
      onTestResult(
        createTestResult(
          "/api/business-owner/workplaces/main",
          "GET",
          null,
          error
        )
      );
    } finally {
      onLoadingChange(null);
    }
  };

  // 사업장 통계 조회
  const handleGetStatistics = async () => {
    onLoadingChange("workplace-statistics");
    try {
      const response = await testApis.workplace.getStatistics();
      onTestResult(
        createTestResult(
          "/api/business-owner/workplaces/statistics",
          "GET",
          response
        )
      );
    } catch (error) {
      onTestResult(
        createTestResult(
          "/api/business-owner/workplaces/statistics",
          "GET",
          null,
          error
        )
      );
    } finally {
      onLoadingChange(null);
    }
  };

  // 사업장 상세 조회
  const handleGetWorkplace = async () => {
    if (!workplaceId) {
      alert("사업장 ID를 입력해주세요.");
      return;
    }

    onLoadingChange("workplace-detail");
    try {
      const response = await testApis.workplace.getWorkplace(
        Number(workplaceId)
      );
      onTestResult(
        createTestResult(
          `/api/business-owner/workplaces/${workplaceId}`,
          "GET",
          response
        )
      );
    } catch (error) {
      onTestResult(
        createTestResult(
          `/api/business-owner/workplaces/${workplaceId}`,
          "GET",
          null,
          error
        )
      );
    } finally {
      onLoadingChange(null);
    }
  };

  // 사업장 정보 수정
  const handleUpdateWorkplace = async () => {
    if (!workplaceId) {
      alert("사업장 ID를 입력해주세요.");
      return;
    }
    if (!registrationForm.name || !registrationForm.address) {
      alert("사업장명과 주소는 필수입니다.");
      return;
    }

    onLoadingChange("workplace-update");
    try {
      const response = await testApis.workplace.updateWorkplace(
        Number(workplaceId),
        registrationForm
      );
      onTestResult(
        createTestResult(
          `/api/business-owner/workplaces/${workplaceId}`,
          "PUT",
          response
        )
      );
    } catch (error) {
      onTestResult(
        createTestResult(
          `/api/business-owner/workplaces/${workplaceId}`,
          "PUT",
          null,
          error
        )
      );
    } finally {
      onLoadingChange(null);
    }
  };

  // 사업장 삭제
  const handleDeleteWorkplace = async () => {
    if (!workplaceId) {
      alert("사업장 ID를 입력해주세요.");
      return;
    }
    if (!confirm("정말로 이 사업장을 삭제하시겠습니까?")) {
      return;
    }

    onLoadingChange("workplace-delete");
    try {
      const response = await testApis.workplace.deleteWorkplace(
        Number(workplaceId)
      );
      onTestResult(
        createTestResult(
          `/api/business-owner/workplaces/${workplaceId}`,
          "DELETE",
          response
        )
      );
    } catch (error) {
      onTestResult(
        createTestResult(
          `/api/business-owner/workplaces/${workplaceId}`,
          "DELETE",
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
      {/* 사업장 등록 섹션 */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="text-lg font-semibold text-green-800 mb-4">
          🏪 사업장 등록
        </h4>
        <form onSubmit={handleWorkplaceRegistration} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                사업장명 *
              </label>
              <input
                type="text"
                value={registrationForm.name}
                onChange={(e) =>
                  setRegistrationForm({
                    ...registrationForm,
                    name: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="예: 본점"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                전화번호
              </label>
              <input
                type="tel"
                value={registrationForm.phoneNumber || ""}
                onChange={(e) =>
                  setRegistrationForm({
                    ...registrationForm,
                    phoneNumber: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="예: 02-1234-5678"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              주소 *
            </label>
            <input
              type="text"
              value={registrationForm.address}
              onChange={(e) =>
                setRegistrationForm({
                  ...registrationForm,
                  address: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="예: 서울시 강남구 테헤란로 123"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              상세주소
            </label>
            <input
              type="text"
              value={registrationForm.detailAddress || ""}
              onChange={(e) =>
                setRegistrationForm({
                  ...registrationForm,
                  detailAddress: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="예: 456호"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              사업장 소개
            </label>
            <textarea
              value={registrationForm.description || ""}
              onChange={(e) =>
                setRegistrationForm({
                  ...registrationForm,
                  description: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="사업장에 대한 간단한 소개를 입력해주세요."
              rows={3}
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isMain"
              checked={registrationForm.isMain || false}
              onChange={(e) =>
                setRegistrationForm({
                  ...registrationForm,
                  isMain: e.target.checked,
                })
              }
              className="mr-2"
            />
            <label htmlFor="isMain" className="text-sm text-gray-700">
              메인 사업장으로 설정
            </label>
          </div>

          <button
            type="submit"
            disabled={loading === "workplace-register"}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md"
          >
            {loading === "workplace-register" ? "등록 중..." : "사업장 등록"}
          </button>
        </form>
      </div>

      {/* 사업장 조회 API */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-lg font-semibold text-blue-800 mb-4">
          📋 사업장 조회 API
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={handleGetWorkplaces}
            disabled={loading === "workplace-list"}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded"
          >
            {loading === "workplace-list" ? "조회 중..." : "사업장 목록"}
          </button>

          <button
            onClick={handleGetMainWorkplace}
            disabled={loading === "workplace-main"}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white px-4 py-2 rounded"
          >
            {loading === "workplace-main" ? "조회 중..." : "메인 사업장"}
          </button>

          <button
            onClick={handleGetStatistics}
            disabled={loading === "workplace-statistics"}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 py-2 rounded"
          >
            {loading === "workplace-statistics" ? "조회 중..." : "통계 조회"}
          </button>
        </div>
      </div>

      {/* 사업장 관리 API */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <h4 className="text-lg font-semibold text-orange-800 mb-4">
          ⚙️ 사업장 관리 API
        </h4>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            사업장 ID (상세 조회/수정/삭제용)
          </label>
          <input
            type="number"
            value={workplaceId}
            onChange={(e) => setWorkplaceId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="예: 1"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={handleGetWorkplace}
            disabled={loading === "workplace-detail"}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded"
          >
            {loading === "workplace-detail" ? "조회 중..." : "상세 조회"}
          </button>

          <button
            onClick={handleUpdateWorkplace}
            disabled={loading === "workplace-update"}
            className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white px-4 py-2 rounded"
          >
            {loading === "workplace-update" ? "수정 중..." : "정보 수정"}
          </button>

          <button
            onClick={handleDeleteWorkplace}
            disabled={loading === "workplace-delete"}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded"
          >
            {loading === "workplace-delete" ? "삭제 중..." : "사업장 삭제"}
          </button>
        </div>

        <div className="mt-4 text-sm text-orange-700 bg-orange-100 p-3 rounded">
          <strong>💡 사용법:</strong>
          <br />
          • 상세 조회: 사업장 ID만 입력하고 "상세 조회" 클릭
          <br />
          • 정보 수정: 사업장 ID와 수정할 정보를 모두 입력하고 "정보 수정" 클릭
          <br />• 사업장 삭제: 사업장 ID만 입력하고 "사업장 삭제" 클릭
        </div>
      </div>

      {/* API 안내 */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">
          📖 API 사용 안내
        </h4>
        <div className="text-sm text-gray-600 space-y-2">
          <p>
            • <strong>사업자 인증 필수:</strong> 모든 사업장 API는 사업자 인증이
            필요합니다.
          </p>
          <p>
            • <strong>메인 사업장:</strong> 첫 번째 등록 사업장은 자동으로 메인
            사업장이 됩니다.
          </p>
          <p>
            • <strong>최대 등록 수:</strong> 사업장은 최대 10개까지 등록
            가능합니다.
          </p>
          <p>
            • <strong>메인 사업장 삭제 제한:</strong> 다른 활성 사업장이 있으면
            메인 사업장을 삭제할 수 없습니다.
          </p>
          <p>
            • <strong>논리 삭제:</strong> 사업장 삭제는 실제 삭제가 아닌
            비활성화 처리입니다.
          </p>
        </div>
      </div>
    </div>
  );
};
