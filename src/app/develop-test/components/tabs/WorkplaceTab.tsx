import React, { useState } from "react";

import { testApis, workScheduleTestApis } from "../../lib/api";
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

  // 직원 관리용 상태 (새로 추가)
  const [employeeWorkplaceId, setEmployeeWorkplaceId] = useState<string>("");
  const [employeeUserId, setEmployeeUserId] = useState<string>("");

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

  // 사업장 직원 목록 조회 (새로 추가)
  const handleGetWorkplaceEmployees = async () => {
    if (!employeeWorkplaceId) {
      alert("사업장 ID를 입력해주세요.");
      return;
    }

    onLoadingChange("fetch-workplace-employees");
    try {
      const response = await workScheduleTestApis.getWorkplaceEmployees(
        Number(employeeWorkplaceId)
      );
      onTestResult(
        createTestResult(
          `/api/business-owner/workplaces/${employeeWorkplaceId}/employees`,
          "GET",
          response
        )
      );
    } catch (error) {
      onTestResult(
        createTestResult(
          `/api/business-owner/workplaces/${employeeWorkplaceId}/employees`,
          "GET",
          null,
          error
        )
      );
    } finally {
      onLoadingChange(null);
    }
  };

  // 직원 스케줄 상세 조회 (새로 추가)
  const handleGetEmployeeScheduleDetail = async () => {
    if (!employeeWorkplaceId) {
      alert("사업장 ID를 입력해주세요.");
      return;
    }
    if (!employeeUserId) {
      alert("직원 유저 ID를 입력해주세요.");
      return;
    }

    onLoadingChange("fetch-employee-schedule-detail");
    try {
      const response = await workScheduleTestApis.getEmployeeScheduleDetail(
        Number(employeeWorkplaceId),
        Number(employeeUserId)
      );
      onTestResult(
        createTestResult(
          `/api/business-owner/workplaces/${employeeWorkplaceId}/employees/${employeeUserId}`,
          "GET",
          response
        )
      );
    } catch (error) {
      onTestResult(
        createTestResult(
          `/api/business-owner/workplaces/${employeeWorkplaceId}/employees/${employeeUserId}`,
          "GET",
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
      {/* 사업장 등록 섹션 */}
      <div className="backdrop-blur-xl bg-gradient-to-br from-rose-50/80 to-pink-50/80 border border-rose-200/50 rounded-2xl p-6 shadow-xl shadow-rose-500/10 relative overflow-hidden">
        {/* 배경 장식 */}
        <div className="absolute -top-8 -right-8 w-24 h-24 bg-rose-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-pink-400/20 rounded-full blur-2xl"></div>

        <div className="relative">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl">🏪</span>
            </div>
            <div>
              <h4 className="text-2xl font-bold bg-gradient-to-r from-rose-700 to-pink-700 bg-clip-text text-transparent">
                사업장 등록
              </h4>
              <p className="text-rose-600/80 mt-1">
                새로운 사업장 정보를 등록하고 관리하세요
              </p>
            </div>
          </div>

          <form onSubmit={handleWorkplaceRegistration} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-800">
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
                  className="w-full px-4 py-3 text-gray-900 font-medium bg-white/90 border border-rose-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-transparent shadow-sm backdrop-blur-sm transition-all duration-200 placeholder-gray-500"
                  placeholder="사업장 이름을 입력하세요"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-800">
                  전화번호
                </label>
                <input
                  type="text"
                  value={registrationForm.phoneNumber}
                  onChange={(e) =>
                    setRegistrationForm({
                      ...registrationForm,
                      phoneNumber: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 text-gray-900 font-medium bg-white/90 border border-rose-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-transparent shadow-sm backdrop-blur-sm transition-all duration-200 placeholder-gray-500"
                  placeholder="전화번호를 입력하세요"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">
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
                className="w-full px-4 py-3 text-gray-900 font-medium bg-white/90 border border-rose-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-transparent shadow-sm backdrop-blur-sm transition-all duration-200 placeholder-gray-500"
                placeholder="기본 주소를 입력하세요"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">
                상세 주소
              </label>
              <input
                type="text"
                value={registrationForm.detailAddress}
                onChange={(e) =>
                  setRegistrationForm({
                    ...registrationForm,
                    detailAddress: e.target.value,
                  })
                }
                className="w-full px-4 py-3 text-gray-900 font-medium bg-white/90 border border-rose-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-transparent shadow-sm backdrop-blur-sm transition-all duration-200 placeholder-gray-500"
                placeholder="상세 주소를 입력하세요"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">
                설명
              </label>
              <textarea
                value={registrationForm.description}
                onChange={(e) =>
                  setRegistrationForm({
                    ...registrationForm,
                    description: e.target.value,
                  })
                }
                rows={3}
                className="w-full px-4 py-3 text-gray-900 font-medium bg-white/90 border border-rose-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-transparent shadow-sm backdrop-blur-sm transition-all duration-200 placeholder-gray-500 resize-none"
                placeholder="사업장에 대한 설명을 입력하세요"
              />
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="isMain"
                checked={registrationForm.isMain}
                onChange={(e) =>
                  setRegistrationForm({
                    ...registrationForm,
                    isMain: e.target.checked,
                  })
                }
                className="w-4 h-4 text-rose-600 bg-white border-rose-300 rounded focus:ring-rose-500 focus:ring-2"
              />
              <label
                htmlFor="isMain"
                className="text-sm font-semibold text-gray-800"
              >
                메인 사업장으로 설정
              </label>
            </div>

            <button
              type="submit"
              disabled={loading === "workplace-register"}
              className="w-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
            >
              {loading === "workplace-register" ? (
                <span className="flex items-center justify-center space-x-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>등록 중...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center space-x-3">
                  <span>🏪</span>
                  <span>사업장 등록</span>
                </span>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* 사업장 조회 섹션 */}
      <div className="backdrop-blur-xl bg-gradient-to-br from-teal-50/80 to-cyan-50/80 border border-teal-200/50 rounded-2xl p-6 shadow-xl shadow-teal-500/10 relative overflow-hidden">
        {/* 배경 장식 */}
        <div className="absolute -top-8 -right-8 w-24 h-24 bg-teal-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-cyan-400/20 rounded-full blur-2xl"></div>

        <div className="relative">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl">📋</span>
            </div>
            <div>
              <h4 className="text-2xl font-bold bg-gradient-to-r from-teal-700 to-cyan-700 bg-clip-text text-transparent">
                사업장 조회
              </h4>
              <p className="text-teal-600/80 mt-1">
                등록된 사업장 정보를 조회하고 확인하세요
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={handleGetWorkplaces}
              disabled={loading === "workplace-list"}
              className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-4 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed transform hover:scale-105"
            >
              {loading === "workplace-list" ? (
                <span className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>조회 중...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center space-x-2">
                  <span>📋</span>
                  <span>전체 목록</span>
                </span>
              )}
            </button>

            <button
              onClick={handleGetMainWorkplace}
              disabled={loading === "workplace-main"}
              className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-4 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed transform hover:scale-105"
            >
              {loading === "workplace-main" ? (
                <span className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>조회 중...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center space-x-2">
                  <span>⭐</span>
                  <span>메인 사업장</span>
                </span>
              )}
            </button>

            <button
              onClick={handleGetStatistics}
              disabled={loading === "workplace-statistics"}
              className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-4 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed transform hover:scale-105"
            >
              {loading === "workplace-statistics" ? (
                <span className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>조회 중...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center space-x-2">
                  <span>📊</span>
                  <span>통계</span>
                </span>
              )}
            </button>

            <button
              onClick={handleGetWorkplace}
              disabled={loading === "workplace-detail" || !workplaceId}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-4 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed transform hover:scale-105"
            >
              {loading === "workplace-detail" ? (
                <span className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>조회 중...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center space-x-2">
                  <span>🔍</span>
                  <span>상세 조회</span>
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 사업장 관리 섹션 */}
      <div className="backdrop-blur-xl bg-gradient-to-br from-amber-50/80 to-yellow-50/80 border border-amber-200/50 rounded-2xl p-6 shadow-xl shadow-amber-500/10 relative overflow-hidden">
        {/* 배경 장식 */}
        <div className="absolute -top-8 -right-8 w-24 h-24 bg-amber-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-yellow-400/20 rounded-full blur-2xl"></div>

        <div className="relative">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl">⚙️</span>
            </div>
            <div>
              <h4 className="text-2xl font-bold bg-gradient-to-r from-amber-700 to-yellow-700 bg-clip-text text-transparent">
                사업장 관리
              </h4>
              <p className="text-amber-600/80 mt-1">
                기존 사업장 정보를 수정하거나 삭제하세요
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">
                사업장 ID
              </label>
              <input
                type="text"
                value={workplaceId}
                onChange={(e) => setWorkplaceId(e.target.value)}
                className="w-full px-4 py-3 text-gray-900 font-medium bg-white/90 border border-amber-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-transparent shadow-sm backdrop-blur-sm transition-all duration-200 placeholder-gray-500"
                placeholder="관리할 사업장의 ID를 입력하세요"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={handleUpdateWorkplace}
                disabled={loading === "workplace-update" || !workplaceId}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-4 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed transform hover:scale-105"
              >
                {loading === "workplace-update" ? (
                  <span className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>수정 중...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center space-x-2">
                    <span>✏️</span>
                    <span>정보 수정</span>
                  </span>
                )}
              </button>

              <button
                onClick={handleDeleteWorkplace}
                disabled={loading === "workplace-delete" || !workplaceId}
                className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-4 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed transform hover:scale-105"
              >
                {loading === "workplace-delete" ? (
                  <span className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>삭제 중...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center space-x-2">
                    <span>🗑️</span>
                    <span>사업장 삭제</span>
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 사업장 직원 관리 섹션 (새로 추가) */}
      <div className="backdrop-blur-xl bg-gradient-to-br from-indigo-50/80 to-blue-50/80 border border-indigo-200/50 rounded-2xl p-6 shadow-xl shadow-indigo-500/10 relative overflow-hidden">
        {/* 배경 장식 */}
        <div className="absolute -top-8 -right-8 w-24 h-24 bg-indigo-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-blue-400/20 rounded-full blur-2xl"></div>

        <div className="relative">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl">👥</span>
            </div>
            <div>
              <h4 className="text-2xl font-bold bg-gradient-to-r from-indigo-700 to-blue-700 bg-clip-text text-transparent">
                사업장 직원 관리
              </h4>
              <p className="text-indigo-600/80 mt-1">
                사업장별 파트타임 직원 목록과 근무 스케줄을 관리하세요
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* 사업장 ID 입력 */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">
                사업장 ID
              </label>
              <input
                type="text"
                value={employeeWorkplaceId}
                onChange={(e) => setEmployeeWorkplaceId(e.target.value)}
                className="w-full px-4 py-3 text-gray-900 font-medium bg-white/90 border border-indigo-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent shadow-sm backdrop-blur-sm transition-all duration-200 placeholder-gray-500"
                placeholder="직원을 조회할 사업장의 ID를 입력하세요"
              />
            </div>

            {/* 직원 목록 조회 버튼 */}
            <div className="flex justify-center">
              <button
                onClick={handleGetWorkplaceEmployees}
                disabled={
                  loading === "fetch-workplace-employees" ||
                  !employeeWorkplaceId
                }
                className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed transform hover:scale-105"
              >
                {loading === "fetch-workplace-employees" ? (
                  <span className="flex items-center justify-center space-x-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>조회 중...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center space-x-3">
                    <span>👥</span>
                    <span>사업장 직원 목록 조회</span>
                  </span>
                )}
              </button>
            </div>

            {/* 구분선 */}
            <div className="flex items-center space-x-4">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-indigo-300/50 to-transparent"></div>
              <span className="text-sm font-medium text-indigo-600/70 bg-white/70 px-4 py-2 rounded-full border border-indigo-200/50">
                직원 상세 조회
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-indigo-300/50 to-transparent"></div>
            </div>

            {/* 직원 상세 조회 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-800">
                  직원 유저 ID
                </label>
                <input
                  type="text"
                  value={employeeUserId}
                  onChange={(e) => setEmployeeUserId(e.target.value)}
                  className="w-full px-4 py-3 text-gray-900 font-medium bg-white/90 border border-indigo-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent shadow-sm backdrop-blur-sm transition-all duration-200 placeholder-gray-500"
                  placeholder="직원의 유저 ID를 입력하세요"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleGetEmployeeScheduleDetail}
                  disabled={
                    loading === "fetch-employee-schedule-detail" ||
                    !employeeWorkplaceId ||
                    !employeeUserId
                  }
                  className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-4 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed transform hover:scale-105"
                >
                  {loading === "fetch-employee-schedule-detail" ? (
                    <span className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>조회 중...</span>
                    </span>
                  ) : (
                    <span className="flex items-center justify-center space-x-2">
                      <span>📅</span>
                      <span>직원 스케줄 상세</span>
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* 안내 메시지 */}
            <div className="bg-indigo-50/50 border border-indigo-200/30 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs">💡</span>
                </div>
                <div className="text-sm text-indigo-700">
                  <p className="font-semibold mb-2">사용 방법:</p>
                  <ul className="space-y-1 text-indigo-600">
                    <li>• 먼저 사업장 ID를 입력하고 직원 목록을 조회하세요</li>
                    <li>
                      • 직원 목록에서 유저 ID를 확인한 후 상세 조회를 이용하세요
                    </li>
                    <li>
                      • 각 직원의 근무 스케줄과 통계 정보를 확인할 수 있습니다
                    </li>
                    <li>
                      • 사업자 권한이 필요하며, 본인 소유 사업장만 조회
                      가능합니다
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
