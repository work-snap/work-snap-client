"use client";

import React, { useState, useEffect } from "react";
import { testApis } from "../../lib/api";
import { createTestResult } from "../../lib/utils";
import {
  LoadingState,
  WorkScheduleUpdateForm,
  WorkSchedule,
  WorkScheduleStatistics,
  Workplace,
  DAY_OF_WEEK_OPTIONS,
  TIME_OPTIONS,
  DayOfWeek,
  InviteCodeResponse,
  PartTimeInfo,
  WorkScheduleBatchCreateForm,
  WorkScheduleItem,
  WorkScheduleBatchCreateResponse,
} from "../../lib/types";

interface WorkScheduleTabProps {
  loading: LoadingState;
  onLoadingChange: (state: LoadingState) => void;
  onTestResult: (result: any) => void;
}

export const WorkScheduleTab: React.FC<WorkScheduleTabProps> = ({
  loading,
  onLoadingChange,
  onTestResult,
}) => {
  const [workplaces, setWorkplaces] = useState<Workplace[]>([]);
  const [selectedWorkplaceId, setSelectedWorkplaceId] = useState<number | null>(
    null
  );
  const [schedules, setSchedules] = useState<WorkSchedule[]>([]);
  const [statistics, setStatistics] = useState<WorkScheduleStatistics | null>(
    null
  );

  // 배치 생성 폼 상태
  const [batchForm, setBatchForm] = useState<WorkScheduleBatchCreateForm>({
    workplaceId: 0,
    inviteCode: "",
    schedules: [
      {
        dayOfWeek: "MONDAY",
        startTime: "09:00",
        endTime: "18:00",
      },
    ],
  });

  const [batchResult, setBatchResult] =
    useState<WorkScheduleBatchCreateResponse | null>(null);

  // 사업장 목록 조회
  const fetchWorkplaces = async () => {
    onLoadingChange("fetch-workplaces");
    try {
      console.log("🏢 사업장 목록 조회 시작");

      // 토큰 확인
      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("인증 토큰이 없습니다. 로그인이 필요합니다.");
      }

      const response = await testApis.workplace.getWorkplaces();
      console.log("✅ 사업장 목록 응답:", response);

      onTestResult(
        createTestResult("/api/business-owner/workplaces", "GET", response)
      );

      if (response.data && response.data.workplaces) {
        console.log("🏢 설정할 사업장:", response.data.workplaces);
        setWorkplaces(response.data.workplaces);
        if (response.data.workplaces.length > 0 && !selectedWorkplaceId) {
          console.log(
            "🎯 첫 번째 사업장 자동 선택:",
            response.data.workplaces[0].id
          );
          setSelectedWorkplaceId(response.data.workplaces[0].id);
        }
      } else {
        console.log("⚠️ 사업장 데이터 없음:", response);
      }
    } catch (error: any) {
      console.error("❌ 사업장 목록 조회 실패:", {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        url: error.config?.url,
        method: error.config?.method,
      });

      // 에러 타입별 상세 처리
      let errorMessage = "사업장 목록 조회 실패";
      let troubleshootingTips: string[] = [];

      if (
        error.code === "ERR_NETWORK" ||
        error.code === "NETWORK_ERROR" ||
        error.message?.includes("Network Error")
      ) {
        errorMessage = "🌐 네트워크 연결 오류";
        troubleshootingTips = [
          `1. 백엔드 서버가 실행 중인지 확인 (${process.env.NEXT_PUBLIC_API_BASE_URL || "localhost:8080"})`,
          "2. 방화벽이나 보안 소프트웨어 설정 확인",
          "3. 브라우저의 네트워크 탭에서 요청 확인",
        ];
      } else if (error.response?.status === 401) {
        errorMessage = "🔐 인증 실패 - 로그인이 필요합니다";
        troubleshootingTips = [
          "1. 개발 토큰을 생성해서 로그인하세요",
          "2. 토큰이 만료되었을 수 있습니다",
        ];
      } else if (error.response?.status === 403) {
        errorMessage = "🚫 권한 없음 - 사업자 권한이 필요합니다";
        troubleshootingTips = [
          "1. 사업자로 등록된 계정인지 확인하세요",
          "2. 사용자 타입을 BUSINESS_OWNER로 설정하세요",
        ];
      } else if (error.message?.includes("토큰")) {
        errorMessage = error.message;
        troubleshootingTips = ["개발 토큰을 다시 생성해보세요"];
      } else if (error.response?.status >= 500) {
        errorMessage = "🔧 서버 내부 오류";
        troubleshootingTips = [
          "1. 서버 로그를 확인하세요",
          "2. 데이터베이스 연결을 확인하세요",
        ];
      }

      // 문제 해결 팁을 콘솔에 출력
      if (troubleshootingTips.length > 0) {
        console.info("💡 문제 해결 방법:", troubleshootingTips);
      }

      onTestResult(
        createTestResult("/api/business-owner/workplaces", "GET", null, {
          ...error,
          message: errorMessage,
        })
      );
    } finally {
      onLoadingChange(null);
    }
  };

  // 근무 스케줄 목록 조회
  const fetchSchedules = async (workplaceId: number) => {
    onLoadingChange("fetch-schedules");
    try {
      const response = await testApis.workSchedule.getByWorkplace(workplaceId);
      onTestResult(
        createTestResult(
          `/api/business-owner/work-schedules/workplace/${workplaceId}`,
          "GET",
          response
        )
      );

      if (response.data) {
        setSchedules(response.data.schedules || []);
        setStatistics(response.data.statistics || null);
      }
    } catch (error) {
      onTestResult(
        createTestResult(
          `/api/business-owner/work-schedules/workplace/${workplaceId}`,
          "GET",
          null,
          error
        )
      );
    } finally {
      onLoadingChange(null);
    }
  };

  // 근무 스케줄 등록
  const handleCreateScheduleBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkplaceId) return;

    onLoadingChange("create-schedule-batch");
    try {
      const batchData = {
        ...batchForm,
        workplaceId: selectedWorkplaceId,
      };

      const response = await testApis.workSchedule.create(batchData);
      onTestResult(
        createTestResult("/api/business-owner/work-schedules", "POST", response)
      );

      setBatchResult(response.data);

      // 성공한 경우 폼 초기화
      if (response.data.allSuccess) {
        setBatchForm({
          workplaceId: selectedWorkplaceId,
          inviteCode: "",
          schedules: [
            {
              dayOfWeek: "MONDAY",
              startTime: "09:00",
              endTime: "18:00",
            },
          ],
        });
      }

      // 목록 새로고침
      await fetchSchedules(selectedWorkplaceId);
    } catch (error) {
      onTestResult(
        createTestResult(
          "/api/business-owner/work-schedules",
          "POST",
          null,
          error
        )
      );
    } finally {
      onLoadingChange(null);
    }
  };

  // 스케줄 추가
  const addSchedule = () => {
    setBatchForm({
      ...batchForm,
      schedules: [
        ...batchForm.schedules,
        {
          dayOfWeek: "MONDAY",
          startTime: "09:00",
          endTime: "18:00",
        },
      ],
    });
  };

  // 스케줄 삭제
  const removeSchedule = (index: number) => {
    setBatchForm({
      ...batchForm,
      schedules: batchForm.schedules.filter((_, i) => i !== index),
    });
  };

  // 스케줄 수정
  const updateSchedule = (
    index: number,
    field: keyof WorkScheduleItem,
    value: string
  ) => {
    const updatedSchedules = [...batchForm.schedules];
    updatedSchedules[index] = {
      ...updatedSchedules[index],
      [field]: value,
    };
    setBatchForm({
      ...batchForm,
      schedules: updatedSchedules,
    });
  };

  // 초대코드 생성 처리
  const handleGenerateInviteCode = async () => {
    onLoadingChange("generate-invite-code");
    try {
      const response = await testApis.partTime.generateInviteCode();
      onTestResult(
        createTestResult("/api/parttime/invite-code", "POST", response)
      );

      if (response.data && response.data.inviteCode) {
        setBatchForm({
          ...batchForm,
          inviteCode: response.data.inviteCode,
        });
      }
    } catch (error) {
      onTestResult(
        createTestResult("/api/parttime/invite-code", "POST", null, error)
      );
    } finally {
      onLoadingChange(null);
    }
  };

  // 초대코드 새로고침 처리 (파트타임 ID가 있을 때)
  const handleRefreshInviteCode = async (partTimeId?: number) => {
    if (!partTimeId) {
      // 파트타임 ID가 없으면 새로 생성
      await handleGenerateInviteCode();
      return;
    }

    onLoadingChange("refresh-invite-code");
    try {
      const response = await testApis.partTime.refreshInviteCode(partTimeId);
      onTestResult(
        createTestResult(
          `/api/parttime/${partTimeId}/invite-code/refresh`,
          "PUT",
          response
        )
      );

      if (response.data && response.data.inviteCode) {
        setBatchForm({
          ...batchForm,
          inviteCode: response.data.inviteCode,
        });
      }
    } catch (error) {
      onTestResult(
        createTestResult(
          `/api/parttime/${partTimeId}/invite-code/refresh`,
          "PUT",
          null,
          error
        )
      );
    } finally {
      onLoadingChange(null);
    }
  };

  // 초기 로드
  useEffect(() => {
    fetchWorkplaces();
  }, []);

  // 사업장 변경 시 스케줄 조회
  useEffect(() => {
    if (selectedWorkplaceId) {
      fetchSchedules(selectedWorkplaceId);
    }
  }, [selectedWorkplaceId]);

  return (
    <div className="space-y-8">
      {/* 사업장 선택 섹션 */}
      <div className="backdrop-blur-xl bg-gradient-to-br from-indigo-50/80 to-purple-50/80 border border-indigo-200/50 rounded-2xl p-6 shadow-xl shadow-indigo-500/10 relative overflow-hidden">
        {/* 배경 장식 */}
        <div className="absolute -top-8 -right-8 w-24 h-24 bg-indigo-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-purple-400/20 rounded-full blur-2xl"></div>

        <div className="relative">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl">📅</span>
            </div>
            <div>
              <h4 className="text-2xl font-bold bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent">
                근무 스케줄 관리
              </h4>
              <p className="text-indigo-600/80 mt-1">
                사업장별 아르바이트 근무 스케줄을 관리하세요
              </p>
            </div>
          </div>

          {/* 사업장 선택 */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-6 h-6 bg-indigo-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-xs">🏪</span>
              </div>
              <label className="text-sm font-semibold text-gray-800">
                사업장 선택
              </label>
            </div>
            <select
              value={selectedWorkplaceId || ""}
              onChange={(e) => setSelectedWorkplaceId(Number(e.target.value))}
              className="w-full px-4 py-3 text-gray-900 font-medium bg-white/90 border border-indigo-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent shadow-sm backdrop-blur-sm transition-all duration-200"
              disabled={loading === "fetch-workplaces"}
            >
              <option value="">사업장을 선택하세요</option>
              {workplaces.map((workplace) => (
                <option
                  key={workplace.id}
                  value={workplace.id}
                  className="font-medium"
                >
                  {workplace.workplaceName} - {workplace.workplaceAddress}
                </option>
              ))}
            </select>

            <button
              onClick={fetchWorkplaces}
              disabled={loading === "fetch-workplaces"}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed transform hover:scale-105"
            >
              {loading === "fetch-workplaces" ? (
                <span className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>조회 중...</span>
                </span>
              ) : (
                <span className="flex items-center space-x-2">
                  <span>🔄</span>
                  <span>사업장 목록 새로고침</span>
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 초대 코드 섹션 */}
      {selectedWorkplaceId && (
        <div className="backdrop-blur-xl bg-gradient-to-br from-blue-50/80 to-cyan-50/80 border border-blue-200/50 rounded-2xl p-6 shadow-xl shadow-blue-500/10 relative overflow-hidden">
          {/* 배경 장식 */}
          <div className="absolute -top-8 -right-8 w-24 h-24 bg-blue-400/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-cyan-400/20 rounded-full blur-2xl"></div>

          <div className="relative">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white text-2xl">🎫</span>
              </div>
              <div>
                <h4 className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-cyan-700 bg-clip-text text-transparent">
                  초대 코드
                </h4>
                <p className="text-blue-600/80 mt-1">
                  아르바이트생 연결을 위한 초대 코드를 입력하세요
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs">🔗</span>
                </div>
                <label className="text-sm font-semibold text-gray-800">
                  초대 코드
                </label>
              </div>

              <div className="flex space-x-3">
                <input
                  type="text"
                  placeholder="초대 코드를 입력하거나 생성하세요"
                  value={batchForm.inviteCode}
                  onChange={(e) =>
                    setBatchForm({ ...batchForm, inviteCode: e.target.value })
                  }
                  className="flex-1 px-4 py-3 text-gray-900 font-medium bg-white/90 border border-blue-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent shadow-sm backdrop-blur-sm transition-all duration-200 placeholder-gray-500"
                />

                <button
                  onClick={handleGenerateInviteCode}
                  disabled={loading === "generate-invite-code"}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed transform hover:scale-105 whitespace-nowrap"
                  title="새로운 초대코드 생성"
                >
                  {loading === "generate-invite-code" ? (
                    <span className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>생성중</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-2">
                      <span>✨</span>
                      <span>생성</span>
                    </span>
                  )}
                </button>

                <button
                  onClick={() => handleRefreshInviteCode()}
                  disabled={
                    loading === "refresh-invite-code" || !batchForm.inviteCode
                  }
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed transform hover:scale-105 whitespace-nowrap"
                  title="기존 초대코드 새로고침"
                >
                  {loading === "refresh-invite-code" ? (
                    <span className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>갱신중</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-2">
                      <span>🔄</span>
                      <span>갱신</span>
                    </span>
                  )}
                </button>
              </div>

              {/* 초대코드 사용 안내 */}
              <div className="bg-blue-50/50 border border-blue-200/50 rounded-lg p-4 mt-4">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">💡</span>
                  </div>
                  <h6 className="text-sm font-semibold text-blue-800">
                    초대코드 사용법
                  </h6>
                </div>
                <ul className="text-xs text-blue-700 space-y-1 ml-7">
                  <li>
                    • <strong>생성</strong>: 새로운 초대코드를 발급받습니다
                  </li>
                  <li>
                    • <strong>갱신</strong>: 기존 초대코드를 새로운 코드로
                    교체합니다
                  </li>
                  <li>
                    • 생성된 초대코드는 아르바이트생과 공유하여 사용하세요
                  </li>
                  <li>• 초대코드 없이는 스케줄 등록이 불가능합니다</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 근무 스케줄 목록 */}
      {selectedWorkplaceId && (
        <div className="backdrop-blur-xl bg-gradient-to-br from-emerald-50/80 to-teal-50/80 border border-emerald-200/50 rounded-2xl p-6 shadow-xl shadow-emerald-500/10 relative overflow-hidden">
          {/* 배경 장식 */}
          <div className="absolute -top-8 -right-8 w-24 h-24 bg-emerald-400/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-teal-400/20 rounded-full blur-2xl"></div>

          <div className="relative">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-2xl">📋</span>
                </div>
                <div>
                  <h4 className="text-2xl font-bold bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">
                    근무 스케줄 목록
                  </h4>
                  <p className="text-emerald-600/80 mt-1">
                    새로운 근무 스케줄을 추가하고 관리하세요
                  </p>
                </div>
              </div>
              <button
                onClick={addSchedule}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <span className="flex items-center space-x-2">
                  <span>+</span>
                  <span>스케줄 추가</span>
                </span>
              </button>
            </div>

            {/* 스케줄 폼들 */}
            <div className="space-y-4">
              {batchForm.schedules.map((schedule, index) => (
                <div
                  key={index}
                  className="backdrop-blur-sm bg-white/70 rounded-xl p-5 border border-emerald-100/50 shadow-lg"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-md">
                        <span className="text-white text-sm font-bold">
                          #{index + 1}
                        </span>
                      </div>
                      <h5 className="text-lg font-bold text-emerald-700">
                        스케줄 #{index + 1}
                      </h5>
                    </div>
                    {batchForm.schedules.length > 1 && (
                      <button
                        onClick={() => removeSchedule(index)}
                        className="w-8 h-8 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg flex items-center justify-center font-bold shadow-md transition-all duration-200 hover:scale-110"
                        title="스케줄 삭제"
                      >
                        ×
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        요일
                      </label>
                      <select
                        value={schedule.dayOfWeek}
                        onChange={(e) =>
                          updateSchedule(
                            index,
                            "dayOfWeek",
                            e.target.value as DayOfWeek
                          )
                        }
                        className="w-full px-4 py-3 text-gray-900 font-medium bg-white/90 border border-emerald-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent shadow-sm backdrop-blur-sm transition-all duration-200"
                      >
                        {DAY_OF_WEEK_OPTIONS.map((option) => (
                          <option
                            key={option.value}
                            value={option.value}
                            className="font-medium"
                          >
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        시작 시간
                      </label>
                      <select
                        value={schedule.startTime}
                        onChange={(e) =>
                          updateSchedule(index, "startTime", e.target.value)
                        }
                        className="w-full px-4 py-3 text-gray-900 font-medium bg-white/90 border border-emerald-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent shadow-sm backdrop-blur-sm transition-all duration-200"
                      >
                        {TIME_OPTIONS.map((time) => (
                          <option
                            key={time}
                            value={time}
                            className="font-medium"
                          >
                            {time}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        종료 시간
                      </label>
                      <select
                        value={schedule.endTime}
                        onChange={(e) =>
                          updateSchedule(index, "endTime", e.target.value)
                        }
                        className="w-full px-4 py-3 text-gray-900 font-medium bg-white/90 border border-emerald-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent shadow-sm backdrop-blur-sm transition-all duration-200"
                      >
                        {TIME_OPTIONS.map((time) => (
                          <option
                            key={time}
                            value={time}
                            className="font-medium"
                          >
                            {time}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 배치 등록 버튼 */}
            <div className="mt-6">
              <button
                onClick={handleCreateScheduleBatch}
                disabled={
                  loading === "create-schedule-batch" || !batchForm.inviteCode
                }
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
              >
                {loading === "create-schedule-batch" ? (
                  <span className="flex items-center justify-center space-x-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>배치 스케줄 등록 중...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center space-x-3">
                    <span>📅</span>
                    <span>배치 스케줄 등록</span>
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 통계 정보 */}
      {statistics && (
        <div className="backdrop-blur-xl bg-gradient-to-br from-violet-50/80 to-pink-50/80 border border-violet-200/50 rounded-2xl p-6 shadow-xl shadow-violet-500/10 relative overflow-hidden">
          {/* 배경 장식 */}
          <div className="absolute -top-8 -right-8 w-24 h-24 bg-violet-400/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-pink-400/20 rounded-full blur-2xl"></div>

          <div className="relative">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white text-2xl">📊</span>
              </div>
              <h4 className="text-2xl font-bold bg-gradient-to-r from-violet-700 to-pink-700 bg-clip-text text-transparent">
                스케줄 통계
              </h4>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="backdrop-blur-sm bg-white/70 rounded-xl p-4 border border-violet-100/50 text-center shadow-lg">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {statistics.totalSchedules}
                </div>
                <div className="text-sm font-semibold text-gray-700">
                  전체 스케줄
                </div>
              </div>
              <div className="backdrop-blur-sm bg-white/70 rounded-xl p-4 border border-violet-100/50 text-center shadow-lg">
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {statistics.activeSchedules}
                </div>
                <div className="text-sm font-semibold text-gray-700">
                  활성 스케줄
                </div>
              </div>
              <div className="backdrop-blur-sm bg-white/70 rounded-xl p-4 border border-violet-100/50 text-center shadow-lg">
                <div className="text-3xl font-bold text-purple-600 mb-1">
                  {statistics.totalPartTimeWorkers}
                </div>
                <div className="text-sm font-semibold text-gray-700">
                  아르바이트생
                </div>
              </div>
              <div className="backdrop-blur-sm bg-white/70 rounded-xl p-4 border border-violet-100/50 text-center shadow-lg">
                <div className="text-3xl font-bold text-orange-600 mb-1">
                  {statistics.totalWeeklyHours}
                  <span className="text-sm">시간</span>
                </div>
                <div className="text-sm font-semibold text-gray-700">
                  주간 총 근무시간
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
