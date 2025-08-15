"use client";

import React, { useState } from "react";
import { testApis } from "../../lib/api";
import { createTestResult } from "../../lib/utils";
import {
  LoadingState,
  InviteCodeResponse,
  PartTimeInfo,
  WorkSchedule,
} from "../../lib/types";
import { DatePicker } from "@heroui/react";
import { parseDate, CalendarDate } from "@internationalized/date";

interface PartTimeTabProps {
  loading: LoadingState;
  onLoadingChange: (state: LoadingState) => void;
  onTestResult: (result: any) => void;
}

export const PartTimeTab: React.FC<PartTimeTabProps> = ({
  loading,
  onLoadingChange,
  onTestResult,
}) => {
  const [generatedInviteCode, setGeneratedInviteCode] = useState<string>("");
  const [searchInviteCode, setSearchInviteCode] = useState<string>("");
  const [partTimeInfo, setPartTimeInfo] = useState<PartTimeInfo | null>(null);
  const [workSchedules, setWorkSchedules] = useState<WorkSchedule[]>([]);
  const [workplaceId, setWorkplaceId] = useState<number>(1);
  const [expiresInHours, setExpiresInHours] = useState<number>(24);
  const [maxUsageCount, setMaxUsageCount] = useState<number>(10);
  const [memo, setMemo] = useState<string>("");
  const [registerInviteCode, setRegisterInviteCode] = useState<string>("");
  const [preferredStartDate, setPreferredStartDate] = useState<string>("");

  const handleGenerateInviteCode = async () => {
    onLoadingChange("generate-invite-code");
    try {
      const response = await testApis.partTime.generateInviteCode(
        workplaceId,
        expiresInHours,
        maxUsageCount,
        memo || undefined
      );
      onTestResult(
        createTestResult("/api/v1/part-time/invite-code", "POST", response)
      );

      if (response.data && response.data.inviteCode) {
        setGeneratedInviteCode(response.data.inviteCode);
      }
    } catch (error) {
      onTestResult(
        createTestResult("/api/v1/part-time/invite-code", "POST", null, error)
      );
    } finally {
      onLoadingChange(null);
    }
  };

  const handleGetMyPartTimeInfo = async () => {
    onLoadingChange("fetch-my-parttime");
    try {
      const response = await testApis.partTime.getMyPartTimeInfo();
      onTestResult(
        createTestResult("/api/v1/part-time/schedule", "GET", response)
      );

      if (response.data) {
        setPartTimeInfo(response.data);
        if (response.data.inviteCode) {
          setGeneratedInviteCode(response.data.inviteCode);
        }
      }
    } catch (error) {
      onTestResult(
        createTestResult("/api/v1/part-time/schedule", "GET", null, error)
      );
    } finally {
      onLoadingChange(null);
    }
  };

  const handleSearchByInviteCode = async () => {
    if (!searchInviteCode.trim()) {
      alert("초대코드를 입력해주세요.");
      return;
    }

    onLoadingChange("fetch-parttime-by-code");
    try {
      const response = await testApis.partTime.getByInviteCode(
        searchInviteCode.trim()
      );
      onTestResult(
        createTestResult(`/api/v1/part-time/invite-codes`, "GET", response)
      );

      if (response.data) {
        setPartTimeInfo(response.data);
      }
    } catch (error) {
      onTestResult(
        createTestResult(`/api/v1/part-time/invite-codes`, "GET", null, error)
      );
    } finally {
      onLoadingChange(null);
    }
  };

  const handleGetMyWorkSchedules = async () => {
    onLoadingChange("fetch-my-schedules");
    try {
      const response = await testApis.partTime.getMyWorkSchedules();
      onTestResult(
        createTestResult("/api/v1/part-time/schedule", "GET", response)
      );

      if (response.data) {
        setWorkSchedules(response.data);
      }
    } catch (error) {
      onTestResult(
        createTestResult("/api/v1/part-time/schedule", "GET", null, error)
      );
    } finally {
      onLoadingChange(null);
    }
  };

  const handleRegisterPartTime = async () => {
    if (!registerInviteCode.trim()) {
      alert("초대코드를 입력해주세요.");
      return;
    }

    onLoadingChange("parttime-register");
    try {
      const response = await testApis.partTime.registerWithInviteCode(
        registerInviteCode.trim(),
        preferredStartDate || undefined
      );
      onTestResult(
        createTestResult("/api/v1/part-time/register", "POST", response)
      );

      if (response.data) {
        setPartTimeInfo(response.data);
      }
    } catch (error) {
      onTestResult(
        createTestResult("/api/v1/part-time/register", "POST", null, error)
      );
    } finally {
      onLoadingChange(null);
    }
  };

  const handleGetPartTimeWorkers = async () => {
    onLoadingChange("parttime-workers");
    try {
      const response = await testApis.partTime.getPartTimeWorkers(
        workplaceId || undefined
      );
      onTestResult(
        createTestResult("/api/v1/part-time/workers", "GET", response)
      );
    } catch (error) {
      onTestResult(
        createTestResult("/api/v1/part-time/workers", "GET", null, error)
      );
    } finally {
      onLoadingChange(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="backdrop-blur-xl bg-gradient-to-br from-blue-50/80 to-indigo-50/80 border border-blue-200/50 rounded-2xl p-6 shadow-xl shadow-blue-500/10 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-24 h-24 bg-blue-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-indigo-400/20 rounded-full blur-2xl"></div>

        <div className="relative">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl">⚙️</span>
            </div>
            <div>
              <h4 className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
                초대코드 생성 설정
              </h4>
              <p className="text-blue-600/80 mt-1">
                초대코드 생성에 필요한 파라미터들을 설정하세요
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                사업장 ID
              </label>
              <input
                type="number"
                value={workplaceId}
                onChange={(e) => setWorkplaceId(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-blue-200/50 bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                placeholder="사업장 ID"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                유효 시간 (시간)
              </label>
              <input
                type="number"
                value={expiresInHours}
                onChange={(e) => setExpiresInHours(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-blue-200/50 bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                placeholder="24"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                최대 사용 횟수
              </label>
              <input
                type="number"
                value={maxUsageCount}
                onChange={(e) => setMaxUsageCount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-blue-200/50 bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                placeholder="10"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                메모 (선택사항)
              </label>
              <input
                type="text"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-blue-200/50 bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                placeholder="초대코드 메모"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="backdrop-blur-xl bg-gradient-to-br from-green-50/80 to-emerald-50/80 border border-green-200/50 rounded-2xl p-6 shadow-xl shadow-green-500/10 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-24 h-24 bg-green-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-emerald-400/20 rounded-full blur-2xl"></div>

        <div className="relative">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl">🎫</span>
            </div>
            <div>
              <h4 className="text-2xl font-bold bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent">
                내 초대코드 관리
              </h4>
              <p className="text-green-600/80 mt-1">
                아르바이트 신청을 위한 초대코드를 생성하고 관리하세요
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {generatedInviteCode && (
              <div className="bg-green-50/50 border border-green-200/50 rounded-xl p-5">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-6 h-6 bg-green-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs">✨</span>
                  </div>
                  <h6 className="text-lg font-bold text-green-800">
                    내 초대코드
                  </h6>
                </div>
                <div className="bg-white/70 rounded-lg p-4 border border-green-100">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-mono font-bold text-green-700 tracking-wider">
                      {generatedInviteCode}
                    </span>
                    <button
                      onClick={() =>
                        navigator.clipboard.writeText(generatedInviteCode)
                      }
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
                      title="클립보드에 복사"
                    >
                      📋 복사
                    </button>
                  </div>
                </div>
                <p className="text-sm text-green-600 mt-3">
                  💡 이 초대코드를 사업주에게 제공하여 아르바이트 신청을
                  완료하세요
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <button
                onClick={handleGenerateInviteCode}
                disabled={loading === "generate-invite-code"}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed transform hover:scale-105"
              >
                {loading === "generate-invite-code" ? (
                  <span className="flex items-center justify-center space-x-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>생성 중...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center space-x-3">
                    <span>🎫</span>
                    <span>초대코드 생성</span>
                  </span>
                )}
              </button>

              <button
                onClick={handleGetMyPartTimeInfo}
                disabled={loading === "fetch-my-parttime"}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed transform hover:scale-105"
              >
                {loading === "fetch-my-parttime" ? (
                  <span className="flex items-center justify-center space-x-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>조회 중...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center space-x-3">
                    <span>📋</span>
                    <span>내 정보 조회</span>
                  </span>
                )}
              </button>

              <button
                onClick={handleGetPartTimeWorkers}
                disabled={loading === "parttime-workers"}
                className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed transform hover:scale-105"
              >
                {loading === "parttime-workers" ? (
                  <span className="flex items-center justify-center space-x-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>조회 중...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center space-x-3">
                    <span>👥</span>
                    <span>근무자 목록</span>
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="backdrop-blur-xl bg-gradient-to-br from-orange-50/80 to-red-50/80 border border-orange-200/50 rounded-2xl p-6 shadow-xl shadow-orange-500/10 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-24 h-24 bg-orange-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-red-400/20 rounded-full blur-2xl"></div>

        <div className="relative">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl">📝</span>
            </div>
            <div>
              <h4 className="text-2xl font-bold bg-gradient-to-r from-orange-700 to-red-700 bg-clip-text text-transparent">
                파트타임 등록
              </h4>
              <p className="text-orange-600/80 mt-1">
                초대코드를 사용하여 파트타임 근무에 등록하세요
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  등록용 초대코드
                </label>
                <input
                  type="text"
                  value={registerInviteCode}
                  onChange={(e) => setRegisterInviteCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-orange-200/50 bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                  placeholder="등록할 초대코드 입력"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  희망 시작일 (선택사항)
                </label>
                <DatePicker
                  value={preferredStartDate ? parseDate(preferredStartDate) : null}
                  onChange={(newDate: CalendarDate | null) => {
                    if (newDate) {
                      const formattedDate = `${newDate.year}-${String(newDate.month).padStart(2, '0')}-${String(newDate.day).padStart(2, '0')}`;
                      setPreferredStartDate(formattedDate);
                    } else {
                      setPreferredStartDate("");
                    }
                  }}
                  aria-label="희망 시작일"
                  placeholder="희망 시작일 선택"
                  // HeroUI 안정성 최적화 적용
                  disableAnimation={true}
                  classNames={{
                    base: "w-full",
                    inputWrapper: "border border-orange-200/50 bg-white/70 backdrop-blur-sm rounded-lg",
                    input: "px-3 py-2",
                    popoverContent: "rounded-xl shadow-lg"
                  }}
                  showMonthAndYearPickers
                  granularity="day"
                />
              </div>
            </div>

            <button
              onClick={handleRegisterPartTime}
              disabled={loading === "parttime-register"}
              className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
            >
              {loading === "parttime-register" ? (
                <span className="flex items-center justify-center space-x-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>등록 중...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center space-x-3">
                  <span>📝</span>
                  <span>파트타임 등록</span>
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="backdrop-blur-xl bg-gradient-to-br from-purple-50/80 to-pink-50/80 border border-purple-200/50 rounded-2xl p-6 shadow-xl shadow-purple-500/10 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-24 h-24 bg-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-pink-400/20 rounded-full blur-2xl"></div>

        <div className="relative">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl">📋</span>
            </div>
            <div>
              <h4 className="text-2xl font-bold bg-gradient-to-r from-purple-700 to-pink-700 bg-clip-text text-transparent">
                파트타임 정보 조회
              </h4>
              <p className="text-purple-600/80 mt-1">
                내 정보나 초대코드로 파트타임 정보를 확인하세요
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-6 h-6 bg-green-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs">✨</span>
                </div>
                <h6 className="text-lg font-bold text-purple-800">
                  내 정보 조회 (추천)
                </h6>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleGetMyPartTimeInfo}
                  disabled={loading === "fetch-my-parttime"}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
                >
                  {loading === "fetch-my-parttime" ? (
                    <span className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>조회중...</span>
                    </span>
                  ) : (
                    <span className="flex items-center justify-center space-x-2">
                      <span>👤</span>
                      <span>내 파트타임 정보 조회</span>
                    </span>
                  )}
                </button>
              </div>
              <div className="bg-green-50/50 border border-green-200/50 rounded-lg p-3">
                <p className="text-xs text-green-700 text-center">
                  ✨ 새로운 API 사용 (추천)
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h6 className="text-lg font-bold text-purple-800">
                초대코드로 조회
              </h6>
              <div className="flex space-x-3">
                <input
                  type="text"
                  placeholder="초대코드 입력"
                  value={searchInviteCode}
                  onChange={(e) => setSearchInviteCode(e.target.value)}
                  className="flex-1 px-4 py-3 text-gray-900 font-medium bg-white/90 border border-purple-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent shadow-sm backdrop-blur-sm transition-all duration-200 placeholder-gray-500"
                />
                <button
                  onClick={handleSearchByInviteCode}
                  disabled={
                    loading === "fetch-parttime-by-code" ||
                    !searchInviteCode.trim()
                  }
                  className="px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
                >
                  {loading === "fetch-parttime-by-code" ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    "🔎"
                  )}
                </button>
              </div>
            </div>
          </div>

          {partTimeInfo && (
            <div className="mt-6 bg-white/70 rounded-xl p-5 border border-purple-100 shadow-inner">
              <h6 className="text-lg font-bold text-purple-800 mb-4">
                📄 아르바이트 정보
              </h6>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">ID:</span>
                    <span className="text-purple-700">{partTimeInfo.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">
                      초대코드:
                    </span>
                    <span className="font-mono text-purple-700">
                      {partTimeInfo.inviteCode}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">
                      사업주 ID:
                    </span>
                    <span className="text-purple-700">
                      {partTimeInfo.businessOwnerId}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">
                      사업장명:
                    </span>
                    <span className="text-purple-700">
                      {partTimeInfo.workplaceName || "미지정"}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">제목:</span>
                    <span className="text-purple-700">
                      {partTimeInfo.title || "미설정"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">상태:</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-bold ${
                        partTimeInfo.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {partTimeInfo.isActive ? "활성" : "비활성"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">생성일:</span>
                    <span className="text-purple-700">
                      {new Date(partTimeInfo.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">수정일:</span>
                    <span className="text-purple-700">
                      {new Date(partTimeInfo.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              {partTimeInfo.description && (
                <div className="mt-4 pt-4 border-t border-purple-100">
                  <span className="font-semibold text-gray-700">설명:</span>
                  <p className="text-purple-700 mt-1">
                    {partTimeInfo.description}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="backdrop-blur-xl bg-gradient-to-br from-amber-50/80 to-orange-50/80 border border-amber-200/50 rounded-2xl p-6 shadow-xl shadow-amber-500/10 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-24 h-24 bg-amber-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-orange-400/20 rounded-full blur-2xl"></div>

        <div className="relative">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl">📅</span>
            </div>
            <div>
              <h4 className="text-2xl font-bold bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent">
                내 근무 일정 조회
              </h4>
              <p className="text-amber-600/80 mt-1">
                등록된 모든 사업장의 근무 일정을 확인하세요
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex space-x-4">
              <button
                onClick={handleGetMyWorkSchedules}
                disabled={loading === "fetch-my-schedules"}
                className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed transform hover:scale-105"
              >
                {loading === "fetch-my-schedules" ? (
                  <span className="flex items-center justify-center space-x-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>근무 일정 조회 중...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center space-x-3">
                    <span>📅</span>
                    <span>내 근무 일정 조회</span>
                  </span>
                )}
              </button>
            </div>

            {workSchedules.length > 0 && (
              <div className="bg-white/70 rounded-xl p-5 border border-amber-100 shadow-inner">
                <div className="flex items-center justify-between mb-4">
                  <h6 className="text-lg font-bold text-amber-800">
                    📋 등록된 근무 일정
                  </h6>
                  <span className="text-sm text-amber-600 bg-amber-100 px-3 py-1 rounded-full">
                    총 {workSchedules.length}개
                  </span>
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {workSchedules.map((schedule) => (
                    <div
                      key={schedule.id}
                      className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50 rounded-lg p-4 hover:shadow-lg transition-all duration-200"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl">🏢</span>
                            <span className="font-bold text-amber-800">
                              {schedule.workplaceName || "사업장명 없음"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-gray-600">
                              요일:
                            </span>
                            <span className="text-amber-700 font-bold">
                              {schedule.dayOfWeekKorean}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-gray-600">
                              시간:
                            </span>
                            <span className="text-amber-700 font-mono">
                              {schedule.startTime} ~ {schedule.endTime}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-gray-600">
                              근무시간:
                            </span>
                            <span className="text-amber-700 font-bold">
                              {schedule.workingHours}시간
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-gray-600">
                              상태:
                            </span>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-bold ${
                                schedule.isActive
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {schedule.isActive ? "활성" : "비활성"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-gray-600">
                              등록일:
                            </span>
                            <span className="text-amber-700 text-sm">
                              {new Date(
                                schedule.createdAt
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {workSchedules.length === 0 && loading !== "fetch-my-schedules" && (
              <div className="bg-amber-50/50 border border-amber-200/50 rounded-xl p-5 text-center">
                <div className="text-6xl mb-3">📅</div>
                <h6 className="text-lg font-bold text-amber-800 mb-2">
                  등록된 근무 일정이 없습니다
                </h6>
                <p className="text-amber-600 text-sm">
                  사업주가 귀하의 초대코드로 근무 일정을 등록하면 여기에
                  표시됩니다.
                </p>
              </div>
            )}

            <div className="bg-amber-50/50 border border-amber-200/50 rounded-xl p-4">
              <p className="text-sm text-amber-700 text-center">
                💡 <strong>참고:</strong> 모든 사업장에서 등록된 근무 일정을
                확인할 수 있습니다
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="backdrop-blur-xl bg-gradient-to-br from-gray-50/80 to-slate-50/80 border border-gray-200/50 rounded-2xl p-6 shadow-xl shadow-gray-500/10 relative overflow-hidden">
        <div className="relative">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-gray-500 to-slate-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white text-xl">��</span>
            </div>
            <h4 className="text-xl font-bold text-gray-800">파트타임 가이드</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-white/60 rounded-lg p-4 border border-gray-100">
              <h6 className="font-bold text-gray-800 mb-2">
                ✨ 새로운 방식 (추천)
              </h6>
              <ul className="text-gray-600 space-y-1">
                <li>• 로그인 기반 자동 인증</li>
                <li>• 내 정보 조회로 편리하게</li>
                <li>• 최신 보안 API 사용</li>
              </ul>
            </div>
            <div className="bg-white/60 rounded-lg p-4 border border-gray-100">
              <h6 className="font-bold text-gray-800 mb-2">🎫 초대코드 관리</h6>
              <ul className="text-gray-600 space-y-1">
                <li>• 새로운 초대코드를 발급받으세요</li>
                <li>• 사업주와 공유하여 연결하세요</li>
                <li>• 복사 버튼으로 쉽게 공유 가능</li>
              </ul>
            </div>
            <div className="bg-white/60 rounded-lg p-4 border border-gray-100">
              <h6 className="font-bold text-gray-800 mb-2">📋 정보 조회</h6>
              <ul className="text-gray-600 space-y-1">
                <li>• 내 정보는 한 번 클릭으로</li>
                <li>• 초대코드로 다른 정보 검색</li>
                <li>• 사업장과 연결 상태 점검</li>
              </ul>
            </div>
            <div className="bg-white/60 rounded-lg p-4 border border-gray-100">
              <h6 className="font-bold text-gray-800 mb-2">📅 근무 일정</h6>
              <ul className="text-gray-600 space-y-1">
                <li>• 등록된 모든 근무 일정 확인</li>
                <li>• 사업장별 근무 시간 조회</li>
                <li>• 실시간 일정 상태 확인</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
