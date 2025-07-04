"use client";

import React, { useState } from "react";
import {
  DailyScheduleCardProps,
  ClockInType,
  ClockOutType,
  AttendanceStatus,
} from "../../lib/types";
import { useAppFeatures } from "../../lib/hooks";
import { useClockIn, useClockOut } from "../../lib/hooks/use-attendance";
import {
  getCardTypeClassName,
  getCardTypeIcon,
  getCardTypeTitleColor,
} from "../../lib/utils";
import { StatusBadge } from "../feedback";
import { RealTimeClock } from "../time-display";
import { LoadingSpinner } from "../common";

/**
 * 추가 근무 카드 컴포넌트
 * Single Responsibility: 추가 근무 전용 UI 및 액션 처리
 */
export const AdditionalWorkCard: React.FC<DailyScheduleCardProps> = ({
  attendance,
  cardConfig,
  onMainAction,
  onUpdate,
  className = "",
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    showNotification,
    vibrate,
    processLocationBasedAction,
    errorFeedback,
    isApp,
  } = useAppFeatures();

  // API 뮤테이션 훅
  const clockInMutation = useClockIn();
  const clockOutMutation = useClockOut();


  // 추가 근무 시작 처리
  const handleStartAdditionalWork = async () => {
    try {
      setIsProcessing(true);

      const { location, notes } = await processLocationBasedAction("clock-in");

      const requestData = {
        notes,
        manualClockInType: ClockInType.NORMAL, // 추가 근무는 항상 정상 출근으로
      };

      await clockInMutation.mutateAsync({
        attendanceId: attendance.id,
        request: requestData,
      });

      await onMainAction("normal");
      onUpdate?.();
    } catch (error) {
      console.error("Additional work start failed:", error);
      await errorFeedback(
        "추가 근무 시작 실패",
        error instanceof Error ? error.message : "처리 중 오류가 발생했습니다"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // 추가 근무 종료 처리
  const handleEndAdditionalWork = async () => {
    try {
      setIsProcessing(true);

      const { location, notes } = await processLocationBasedAction("clock-out");

      const requestData = {
        notes,
        manualClockOutType: ClockOutType.NORMAL, // 추가 근무는 항상 정상 퇴근으로
      };

      await clockOutMutation.mutateAsync({
        attendanceId: attendance.id,
        request: requestData,
      });

      await onMainAction("normal");
      onUpdate?.();
    } catch (error) {
      console.error("Additional work end failed:", error);
      await errorFeedback(
        "추가 근무 종료 실패",
        error instanceof Error ? error.message : "처리 중 오류가 발생했습니다"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // 액션 핸들러 결정
  const handleAction = async () => {
    if (attendance.status === AttendanceStatus.SCHEDULED) {
      await handleStartAdditionalWork();
    } else if (attendance.status === AttendanceStatus.IN_PROGRESS) {
      await handleEndAdditionalWork();
    }
  };

  // 액션 비활성화 여부 확인
  const isActionDisabled = () => {
    const isLoading =
      isProcessing || clockInMutation.isPending || clockOutMutation.isPending;
    if (isLoading) return true;

    return attendance.status === AttendanceStatus.COMPLETED;
  };

  const isLoading =
    isProcessing || clockInMutation.isPending || clockOutMutation.isPending;

  // 버튼 라벨 결정
  const getActionLabel = () => {
    switch (attendance.status) {
      case AttendanceStatus.SCHEDULED:
        return "추가 근무 시작";
      case AttendanceStatus.IN_PROGRESS:
        return "추가 근무 종료";
      case AttendanceStatus.COMPLETED:
        return "추가 근무 완료";
      default:
        return "이용 불가";
    }
  };

  // 버튼 색상 결정
  const getActionColor = () => {
    switch (attendance.status) {
      case AttendanceStatus.SCHEDULED:
        return "bg-purple-500 hover:bg-purple-600";
      case AttendanceStatus.IN_PROGRESS:
        return "bg-purple-600 hover:bg-purple-700";
      case AttendanceStatus.COMPLETED:
        return "bg-gray-400";
      default:
        return "bg-gray-400";
    }
  };

  return (
    <div className={`${getCardTypeClassName("additional")} ${className}`}>
      {/* 카드 헤더 */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <span className="text-xl mr-2">{getCardTypeIcon("additional")}</span>
            <h3 className={`text-lg font-semibold ${getCardTypeTitleColor("additional")}`}>
              {cardConfig.title}
            </h3>
          </div>
          {cardConfig.subtitle && (
            <p className="text-sm text-purple-600 mb-2">{cardConfig.subtitle}</p>
          )}
          <StatusBadge
            status={attendance.status}
            statusKorean={attendance.statusKorean}
          />
        </div>
      </div>

      {/* 현재 시간 표시 */}
      <div className="mb-4">
        <RealTimeClock className="text-lg font-bold text-purple-700" />
      </div>

      {/* 진행 중인 추가 근무 시간 */}
      {attendance.actualStartTime && attendance.status === AttendanceStatus.IN_PROGRESS && (
        <div className="bg-purple-50 rounded-lg p-3 mb-4 border border-purple-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-purple-700">추가 근무 시간</span>
            <span className="text-lg font-bold text-purple-800">
              {(() => {
                const startTime = new Date(attendance.actualStartTime!);
                const now = new Date();
                const diffMs = now.getTime() - startTime.getTime();
                const hours = Math.floor(diffMs / (1000 * 60 * 60));
                const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                return `${hours}시간 ${minutes}분`;
              })()}
            </span>
          </div>
        </div>
      )}

      {/* 추가 근무 안내 */}
      <div className="bg-purple-50 rounded-lg p-3 mb-4 border border-purple-200">
        <div className="flex items-start">
          <span className="text-purple-500 mr-2 mt-0.5">💡</span>
          <div className="text-sm text-purple-700">
            <p className="font-medium mb-1">추가 근무 안내</p>
            <ul className="space-y-1 text-xs">
              <li>• 정규 근무 외 추가로 수행하는 업무입니다</li>
              <li>• 추가 근무는 별도로 기록되며 정규 근무와 구분됩니다</li>
              <li>• 시작/종료 시간이 자동으로 기록됩니다</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 메인 액션 버튼 */}
      <div className="space-y-3">
        <button
          onClick={handleAction}
          disabled={isActionDisabled()}
          className={`w-full py-4 px-4 rounded-lg font-semibold text-white transition-all duration-200 ${
            isActionDisabled()
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : `${getActionColor()} active:scale-95`
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <LoadingSpinner size="md" color="white" className="mr-2" />
              처리 중...
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <span className="mr-2">
                {attendance.status === AttendanceStatus.SCHEDULED 
                  ? "⚡" 
                  : attendance.status === AttendanceStatus.IN_PROGRESS 
                  ? "🏁" 
                  : "✅"}
              </span>
              {getActionLabel()}
            </div>
          )}
        </button>

        {/* 완료 상태 메시지 */}
        {attendance.status === AttendanceStatus.COMPLETED && (
          <div className="text-center text-sm text-purple-600">
            추가 근무가 완료되었습니다
          </div>
        )}
      </div>

      {/* 로딩 상태 */}
      {isLoading && (
        <div className="flex justify-center py-4 mt-4">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* 메모 표시 */}
      {attendance.notes && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-sm">
            <span className="font-medium text-gray-700">메모: </span>
            <span className="text-gray-600">{attendance.notes}</span>
          </div>
        </div>
      )}
    </div>
  );
};